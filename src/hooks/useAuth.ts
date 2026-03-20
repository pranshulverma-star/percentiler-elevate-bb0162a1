import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import type { User } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  signIn: (redirectPath?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

/** Detect if we're inside a standalone/installed app (PWA) on iOS or Android */
function isStandaloneApp() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as any).standalone === true ||
    document.referrer.includes("android-app://")
  );
}

/** Check if the current URL looks like an OAuth callback */
function detectOAuthCallback() {
  const hash = window.location.hash;
  const search = window.location.search;
  const path = window.location.pathname;
  return (
    path.startsWith("/~oauth") ||
    hash.includes("access_token") ||
    hash.includes("refresh_token") ||
    new URLSearchParams(search).has("code")
  );
}

/** Grace period (ms) after starting a sign-in flow — prevents re-trigger loops */
const AUTH_FLOW_GRACE_MS = 45_000;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const signInInProgressRef = useRef(false);

  useEffect(() => {
    // Catch OAuth error fragments and redirect to friendly error page
    const hash = window.location.hash;
    if (hash.includes("error=") || hash.includes("error_description=")) {
      const errorPage = `/auth/error${hash}`;
      window.location.replace(errorPage);
      return;
    }

    const isOAuthCallback = detectOAuthCallback();

    let isMounted = true;
    let resolved = false;

    const resolveAuth = (nextUser: User | null) => {
      if (!isMounted) return;
      setUser(nextUser);
      resolved = true;
      setLoading(false);
      // Clear sign-in markers on successful auth
      if (nextUser) {
        signInInProgressRef.current = false;
        sessionStorage.removeItem("auth_flow_started_at");
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null;
        resolveAuth(currentUser);

        // On sign-in, upsert lead with user_id, email + name
        if (event === "SIGNED_IN" && currentUser?.email) {
          const email = currentUser.email;
          const name = currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || null;

          localStorage.setItem("percentilers_email", email);
          if (name) localStorage.setItem("percentilers_name", name);

          // Fire-and-forget: don't block auth state with DB call
          (supabase.from("leads") as any).upsert(
            { user_id: currentUser.id, email, name, source: "google_signin" },
            { onConflict: "user_id" }
          ).then(() => {}).catch((err: any) => console.warn("Lead upsert failed:", err));
        }
      }
    );

    // Initial session bootstrap
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        // If this is an OAuth callback and session is null, don't resolve yet —
        // onAuthStateChange will process the tokens in the hash
        if (isOAuthCallback && !session?.user) {
          console.log("[Auth] OAuth callback detected, waiting for onAuthStateChange");
          return;
        }
        resolveAuth(session?.user ?? null);
      })
      .catch((err) => {
        console.error("Session bootstrap error:", err);
        if (isMounted) {
          setLoading(false);
        }
      });

    // Safety timeout: unblock UI after 6s (longer for mobile OAuth callbacks)
    const timeoutMs = isOAuthCallback ? 8000 : 4000;
    const fallbackTimer = window.setTimeout(() => {
      if (resolved || !isMounted) return;
      console.warn("[Auth] Timed out, unblocking UI");
      signInInProgressRef.current = false;
      setLoading(false);
    }, timeoutMs);

    return () => {
      isMounted = false;
      window.clearTimeout(fallbackTimer);
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (redirectPath?: string) => {
    // Single-flight guard: prevent stacked sign-in calls
    if (signInInProgressRef.current) {
      console.log("[Auth] Sign-in already in progress, ignoring duplicate call");
      return;
    }

    const ua = navigator.userAgent || "";
    const isInAppBrowser = /FBAN|FBAV|Instagram|Line\/|Snapchat|Twitter|BytedanceWebview/i.test(ua);

    if (isInAppBrowser) {
      window.open(window.location.href, "_system");
      alert("Please open this link in Safari or Chrome to sign in with Google. In-app browsers don't support Google Sign-In.");
      return;
    }

    signInInProgressRef.current = true;
    sessionStorage.setItem("auth_flow_started_at", String(Date.now()));

    const redirectUri = redirectPath
      ? (redirectPath.startsWith("http") ? redirectPath : `${window.location.origin}${redirectPath}`)
      : `${window.location.origin}${window.location.pathname}${window.location.search}`;

    const standalone = isStandaloneApp();

    const startDirectRedirect = async () => {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUri,
          skipBrowserRedirect: true,
          queryParams: { prompt: "select_account" },
        },
      });

      if (error) {
        console.error("[Auth] Direct redirect sign-in error:", error);
        signInInProgressRef.current = false;
        throw error;
      }

      if (data?.url) {
        window.location.assign(data.url);
        return;
      }

      signInInProgressRef.current = false;
      throw new Error("[Auth] Missing OAuth redirect URL");
    };

    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: redirectUri,
        extraParams: { prompt: "select_account" },
      });

      if (result?.error) {
        throw result.error;
      }

      // Standalone PWA on iOS can fail popup/token handoff silently.
      if (standalone && !result?.redirected) {
        console.warn("[Auth] Standalone fallback to direct redirect flow");
        await startDirectRedirect();
      }
    } catch (err) {
      if (standalone) {
        console.warn("[Auth] Standalone managed flow failed, retrying direct redirect", err);
        await startDirectRedirect();
        return;
      }
      console.error("[Auth] Sign-in error:", err);
      signInInProgressRef.current = false;
      throw err;
    }
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("percentilers_email");
    signInInProgressRef.current = false;
    sessionStorage.removeItem("auth_flow_started_at");
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      loading,
      signIn,
      signOut,
    }),
    [user, loading, signIn, signOut]
  );

  return createElement(AuthContext.Provider, { value }, children);
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

/** Helper for other components to check if an auth flow is in progress */
export function isAuthFlowActive(): boolean {
  const startedAt = sessionStorage.getItem("auth_flow_started_at");
  if (!startedAt) return false;
  return (Date.now() - Number(startedAt)) < AUTH_FLOW_GRACE_MS;
}

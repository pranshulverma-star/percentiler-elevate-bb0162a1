import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState } from "react";
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Catch OAuth error fragments and redirect to friendly error page
    const hash = window.location.hash;
    if (hash.includes("error=") || hash.includes("error_description=")) {
      const errorPage = `/auth/error${hash}`;
      window.location.replace(errorPage);
      return;
    }

    let isMounted = true;
    let resolved = false;

    const resolveAuth = (nextUser: User | null) => {
      if (!isMounted) return;
      setUser(nextUser);
      resolved = true;
      setLoading(false);
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
        resolveAuth(session?.user ?? null);
      })
      .catch((err) => {
        console.error("Session bootstrap error:", err);
        // On AbortError or any failure, unblock UI immediately
        if (isMounted) {
          setLoading(false);
        }
      });

    // Safety timeout: unblock UI after 3s no matter what
    // Reduced from 3s to 1.5s for faster UI unblock
    const fallbackTimer = window.setTimeout(() => {
      if (resolved || !isMounted) return;
      console.warn("Auth timed out, unblocking UI");
      setLoading(false);
    }, 1500);

    return () => {
      isMounted = false;
      window.clearTimeout(fallbackTimer);
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (redirectPath?: string) => {
    const ua = navigator.userAgent || "";
    const isInAppBrowser = /FBAN|FBAV|Instagram|Line\/|Snapchat|Twitter|BytedanceWebview/i.test(ua);

    if (isInAppBrowser) {
      window.open(window.location.href, "_system");
      alert("Please open this link in Safari or Chrome to sign in with Google. In-app browsers don't support Google Sign-In.");
      return;
    }

    const redirectUri = redirectPath
      ? (redirectPath.startsWith("http") ? redirectPath : `${window.location.origin}${redirectPath}`)
      : `${window.location.origin}${window.location.pathname}${window.location.search}`;

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone === true;

    // In standalone PWA mode, the managed auth popup flow is blocked by iOS.
    // Fall back to Supabase's native full-page redirect OAuth flow.
    if (isStandalone) {
      console.log("[Auth] Standalone PWA detected, using direct redirect flow");
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUri,
          skipBrowserRedirect: false,
        },
      });
      if (error) {
        console.error("[Auth] Standalone sign-in error:", error);
        throw error;
      }
      return;
    }

    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: redirectUri,
        extraParams: { prompt: "select_account" },
      });
      if (result?.error) {
        console.error("[Auth] Sign-in result error:", result.error);
      }
    } catch (err) {
      console.error("[Auth] Sign-in error:", err);
      throw err;
    }
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("percentilers_email");
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

import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { trackLead } from "@/lib/tracking";
import { lovable } from "@/integrations/lovable/index";
import type { User } from "@supabase/supabase-js";
import { requestPushPermission } from "@/lib/firebase";
import { isStandaloneApp } from "@/lib/platform";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  signIn: (redirectPath?: string, provider?: "google" | "apple") => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

// Module-level Set — tracks which user IDs have already had the welcome flow
// attempted in this browser tab session.
//
// WHY THIS IS NEEDED:
//   supabase.auth.onAuthStateChange fires SIGNED_IN on EVERY page load because
//   Supabase restores the session from localStorage and emits SIGNED_IN even
//   when there is no actual sign-in (just a refresh or navigation). It can also
//   fire twice in rapid succession during an OAuth callback (once when the hash
//   tokens are consumed, once when getSession resolves).
//
//   A DB query guard alone has a TOCTOU race: both rapid fires read count=0
//   before either has written the notification row → duplicate emails.
//
//   The Set eliminates the race: we add userId BEFORE any async work, so the
//   second fire sees it immediately and returns without touching the DB.
//   AuthProvider is mounted once for the app lifetime, so the Set persists for
//   the full browser tab session and is cleared only on hard reload (at which
//   point the DB guard in profiles.welcome_sent takes over).
const welcomeSentForUsers = new Set<string>();

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

          // Fire Meta Pixel Lead + Google Ads conversion (once per session)
          const firedKey = "lead_pixel_fired";
          if (!sessionStorage.getItem(firedKey)) {
            sessionStorage.setItem(firedKey, "1");
            const page = window.location.pathname.replace("/", "") || "home";
            trackLead(`signin_${page}`);
          }

          // Fire-and-forget: don't block auth state with DB call
          supabase.from("leads").upsert(
            { user_id: currentUser.id, email, name, source: "google_signin" },
            { onConflict: "user_id" }
          ).then(() => {}, (err: any) => console.warn("Lead upsert failed:", err));

          // Request push permission after a short delay to let auth settle.
          // Wrapped in try/catch — must never break the auth flow.
          const userId = currentUser.id;
          setTimeout(() => {
            requestPushPermission(userId).catch((err) =>
              console.warn("[Auth] Push permission request failed:", err)
            );
          }, 2000);

          // ── Welcome email + notification (fires exactly once per user, ever) ──
          //
          // Layer 1: module-level Set (same-tab, same-session rapid-fire guard).
          //   Add userId BEFORE any await so a second SIGNED_IN in the same
          //   millisecond window sees it immediately and skips.
          //
          // Layer 2: profiles.welcome_sent atomic UPDATE.
          //   UPDATE ... WHERE welcome_sent = false RETURNING id is atomic in
          //   PostgreSQL. Only ONE caller gets a row back — that caller sends.
          //   Handles cross-device / cross-tab / cross-session safety.
          //
          // Layer 3: partial unique index on notifications(user_id) WHERE
          //   type = 'welcome' prevents a duplicate row even if layers 1+2 fail.
          //
          // Fire-and-forget — must NOT block the auth flow.
          if (!welcomeSentForUsers.has(userId)) {
            welcomeSentForUsers.add(userId); // claim before any async work

            (async () => {
              try {
                // Atomic claim: returns the row only if WE flipped false → true.
                // Any concurrent caller (another tab, device, or rapid fire) gets
                // null back and exits without sending.
                const { data: claimed } = await supabase
                  .from("profiles")
                  .update({ welcome_sent: true })
                  .eq("id", userId)
                  .eq("welcome_sent", false)
                  .select("id")
                  .maybeSingle();

                if (!claimed) return; // already sent on a previous session/device

                const displayName = name || "there";
                const dashboardUrl = `${window.location.origin}/dashboard`;

                // Send transactional welcome email
                await supabase.functions.invoke("send-email", {
                  body: {
                    to: email,
                    template: "welcome",
                    data: { name: displayName, dashboard_url: dashboardUrl },
                    user_id: userId,
                  },
                });

                // Insert in-app welcome notification
                // (partial unique index on notifications enforces one per user)
                await supabase.from("notifications").insert({
                  user_id: userId,
                  title: "Welcome to Percentilers! 🎯",
                  body: "Your CAT prep journey starts here. Set your first sprint goal today.",
                  type: "welcome",
                  action_url: "/dashboard",
                });
              } catch (err) {
                if (import.meta.env.DEV) console.warn("[Auth] Welcome notification failed:", err);
              }
            })();
          }
        }
      }
    );

    // Initial session bootstrap
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        // If this is an OAuth callback and session is null, don't resolve yet —
        // onAuthStateChange will process the tokens in the hash
        if (isOAuthCallback && !session?.user) {
          if (import.meta.env.DEV) console.log("[Auth] OAuth callback detected, waiting for onAuthStateChange");
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
      if (import.meta.env.DEV) console.warn("[Auth] Timed out, unblocking UI");
      signInInProgressRef.current = false;
      setLoading(false);
    }, timeoutMs);

    return () => {
      isMounted = false;
      window.clearTimeout(fallbackTimer);
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (redirectPath?: string, provider: "google" | "apple" = "google") => {
    // Staleness check: if the ref has been true for >30s, auto-clear it
    const startedAt = sessionStorage.getItem("auth_flow_started_at");
    if (signInInProgressRef.current && startedAt && (Date.now() - Number(startedAt)) > 30_000) {
      if (import.meta.env.DEV) console.warn("[Auth] Clearing stale signInInProgress guard");
      signInInProgressRef.current = false;
    }

    if (signInInProgressRef.current) {
      if (import.meta.env.DEV) console.log("[Auth] Sign-in already in progress, ignoring duplicate call");
      return;
    }

    const ua = navigator.userAgent || "";
    const isInAppBrowser = /FBAN|FBAV|Instagram|Line\/|Snapchat|Twitter|BytedanceWebview/i.test(ua);

    if (isInAppBrowser) {
      window.open(window.location.href, "_system");
      alert("Please open this link in Safari or Chrome to sign in. In-app browsers don't support this sign-in method.");
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
        provider,
        options: {
          redirectTo: redirectUri,
          skipBrowserRedirect: true,
          queryParams: provider === "google" ? { prompt: "select_account" } : {},
        },
      });

      if (error) {
        console.error("[Auth] Direct redirect sign-in error:", error);
        throw error;
      }

      if (data?.url) {
        window.location.assign(data.url);
        return;
      }

      throw new Error("[Auth] Missing OAuth redirect URL");
    };

    try {
      const result = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: redirectUri,
        extraParams: provider === "google" ? { prompt: "select_account" } : {},
      });

      if (result?.error) {
        throw result.error;
      }

      if (standalone && !result?.redirected) {
        if (import.meta.env.DEV) console.warn("[Auth] Standalone fallback to direct redirect flow");
        await startDirectRedirect();
      }
    } catch (err) {
      if (standalone) {
        if (import.meta.env.DEV) console.warn("[Auth] Standalone managed flow failed, retrying direct redirect", err);
        try {
          await startDirectRedirect();
        } catch (innerErr) {
          signInInProgressRef.current = false;
          sessionStorage.removeItem("auth_flow_started_at");
          throw innerErr;
        }
        return;
      }
      signInInProgressRef.current = false;
      sessionStorage.removeItem("auth_flow_started_at");
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

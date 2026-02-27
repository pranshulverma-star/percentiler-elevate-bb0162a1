import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import type { User } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let resolved = false;

    const resolveAuth = (nextUser: User | null) => {
      if (!isMounted) return;
      setUser(nextUser);
      resolved = true;
      setLoading(false);
    };

    const fallbackTimer = window.setTimeout(() => {
      if (!resolved && isMounted) {
        console.warn("Auth initialization timed out; continuing without blocking UI");
        setLoading(false);
      }
    }, 6000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null;
        resolveAuth(currentUser);

        // On sign-in, upsert lead with user_id, email + name
        if (event === "SIGNED_IN" && currentUser?.email) {
          const email = currentUser.email;
          const name = currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || null;

          // Store in localStorage for backward compat
          localStorage.setItem("percentilers_email", email);
          if (name) localStorage.setItem("percentilers_name", name);

          // Upsert lead by user_id
          await (supabase.from("leads") as any).upsert(
            { user_id: currentUser.id, email, name, source: "google_signin" },
            { onConflict: "user_id" }
          );
        }
      }
    );

    // Check existing session
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        resolveAuth(session?.user ?? null);
      })
      .catch((err) => {
        console.error("Session bootstrap error:", err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
      window.clearTimeout(fallbackTimer);
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async () => {
    // Detect in-app browsers (Instagram, Facebook, etc.) that break OAuth state
    const ua = navigator.userAgent || "";
    const isInAppBrowser = /FBAN|FBAV|Instagram|Line\/|Snapchat|Twitter|BytedanceWebview/i.test(ua);

    if (isInAppBrowser) {
      window.open(window.location.href, "_system");
      alert("Please open this link in Safari or Chrome to sign in with Google. In-app browsers don't support Google Sign-In.");
      return;
    }

    try {
      await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin + window.location.pathname,
      });
    } catch (err) {
      console.error("Sign-in error:", err);
      throw err;
    }
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("percentilers_email");
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    loading,
    signIn,
    signOut,
  };
}

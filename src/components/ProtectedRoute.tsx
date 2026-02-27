import { useState, useEffect, useCallback, useRef, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import PhoneCaptureModal from "@/components/PhoneCaptureModal";

interface ProtectedRouteProps {
  children: ReactNode;
  /** Whether a phone number is required to access this route */
  requirePhone?: boolean;
  /** Source label for lead tracking */
  source?: string;
}

/**
 * Unified access guard for protected routes.
 *
 * State A — Not logged in → trigger sign-in, preserve return URL
 * State B — Logged in, phone missing → show phone capture modal (blocks content)
 * State C — Logged in + phone present → render children
 */
export default function ProtectedRoute({ children, requirePhone = false, source = "protected" }: ProtectedRouteProps) {
  const location = useLocation();
  const { isAuthenticated, user, loading: authLoading, signIn } = useAuth();

  const [phoneChecked, setPhoneChecked] = useState(false);
  const [hasPhone, setHasPhone] = useState(false);
  const signInTriggered = useRef(false);

  // Trigger auth only after auth state resolves
  useEffect(() => {
    if (authLoading) return;
    if (isAuthenticated) return;
    if (signInTriggered.current) return;

    signInTriggered.current = true;

    const returnUrl = location.pathname + location.search;
    sessionStorage.setItem("pending_gate_redirect", returnUrl);
    sessionStorage.setItem("pending_gate_source", source);

    void signIn(returnUrl);
  }, [authLoading, isAuthenticated, signIn, location.pathname, location.search, source]);

  // Clear stale return URL markers once user is already at destination
  useEffect(() => {
    if (!isAuthenticated) return;
    const pending = sessionStorage.getItem("pending_gate_redirect");
    if (!pending) return;

    const current = location.pathname + location.search;
    if (pending === current || pending === location.pathname) {
      sessionStorage.removeItem("pending_gate_redirect");
      sessionStorage.removeItem("pending_gate_source");
    }
  }, [isAuthenticated, location.pathname, location.search]);

  // Phone check (only for guarded routes requiring phone)
  useEffect(() => {
    if (authLoading || !isAuthenticated || !user?.id) return;

    if (!requirePhone) {
      setPhoneChecked(true);
      setHasPhone(true);
      return;
    }

    let cancelled = false;

    const timeout = setTimeout(() => {
      if (!cancelled) {
        setPhoneChecked(true);
        setHasPhone(false);
      }
    }, 4000);

    (async () => {
      try {
        const { data } = await (supabase.from("leads") as any)
          .select("phone_number")
          .eq("user_id", user.id)
          .maybeSingle();

        if (cancelled) return;
        clearTimeout(timeout);

        const phone = data?.phone_number;
        setHasPhone(!!(phone && /^\d{10}$/.test(phone)));
      } catch {
        if (!cancelled) {
          clearTimeout(timeout);
          setHasPhone(false);
        }
      } finally {
        if (!cancelled) setPhoneChecked(true);
      }
    })();

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [authLoading, isAuthenticated, user?.id, requirePhone]);

  const handlePhoneSuccess = useCallback(() => {
    setHasPhone(true);
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  if (requirePhone && !phoneChecked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  if (requirePhone && !hasPhone) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <PhoneCaptureModal
          open
          onOpenChange={() => {}}
          source={source}
          onSuccess={handlePhoneSuccess}
        />
      </div>
    );
  }

  return <>{children}</>;
}

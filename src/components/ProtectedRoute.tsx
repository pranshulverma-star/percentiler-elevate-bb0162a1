import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import PhoneCaptureModal from "@/components/PhoneCaptureModal";

interface ProtectedRouteProps {
  children: React.ReactNode;
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
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, loading: authLoading, signIn } = useAuth();

  const [phoneChecked, setPhoneChecked] = useState(false);
  const [hasPhone, setHasPhone] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const signInTriggered = useRef(false);

  // ── Step 1: Wait for auth to resolve ──
  // While authLoading is true, show spinner. No routing decisions yet.

  // ── Step 2: If not authenticated, trigger sign-in ──
  useEffect(() => {
    if (authLoading) return;
    if (isAuthenticated) return;
    if (signInTriggered.current) return;

    signInTriggered.current = true;
    // Store the current path so we return here after OAuth redirect
    sessionStorage.setItem("pending_gate_redirect", location.pathname + location.search);
    sessionStorage.setItem("pending_gate_source", source);
    signIn();
  }, [authLoading, isAuthenticated, signIn, location.pathname, location.search, source]);

  // ── Step 3: If authenticated, check phone in DB ──
  useEffect(() => {
    if (authLoading || !isAuthenticated || !user?.id) return;

    if (!requirePhone) {
      setPhoneChecked(true);
      setHasPhone(true);
      return;
    }

    let cancelled = false;

    const timeout = setTimeout(() => {
      // Fallback: if DB takes too long, assume phone missing and show modal
      if (!cancelled) {
        setPhoneChecked(true);
        setHasPhone(false);
        setShowPhoneModal(true);
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
        if (phone && /^\d{10}$/.test(phone)) {
          setHasPhone(true);
        } else {
          setHasPhone(false);
          setShowPhoneModal(true);
        }
      } catch {
        if (!cancelled) {
          clearTimeout(timeout);
          setHasPhone(false);
          setShowPhoneModal(true);
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

  // ── Phone capture success handler ──
  const handlePhoneSuccess = useCallback(() => {
    setShowPhoneModal(false);
    setHasPhone(true);
  }, []);

  // ── Render states ──

  // Still loading auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  // Not authenticated — sign-in was triggered, show spinner while redirect happens
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  // Phone check in progress
  if (requirePhone && !phoneChecked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  // Phone required but missing — modal is blocking
  if (requirePhone && !hasPhone) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <PhoneCaptureModal
          open={showPhoneModal}
          onOpenChange={(open) => {
            // Don't allow closing — phone is required
            if (!open) setShowPhoneModal(true);
          }}
          source={source}
          onSuccess={handlePhoneSuccess}
        />
      </div>
    );
  }

  // ── State C: All clear ──
  return <>{children}</>;
}

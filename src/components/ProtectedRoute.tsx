import { useEffect, useRef, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { Loader2, LogIn } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLeadPhone } from "@/hooks/useLeadPhone";
import { Button } from "@/components/ui/button";
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
 *
 * This is the ONLY component that should trigger sign-in redirects or phone modals
 * for gated content. No other component should duplicate this logic.
 */
export default function ProtectedRoute({ children, requirePhone = false, source = "protected" }: ProtectedRouteProps) {
  const location = useLocation();
  const { isAuthenticated, user, loading: authLoading, signIn } = useAuth();
  const { hasPhone, loading: phoneLoading, refetch: refetchPhone } = useLeadPhone();
  const signInTriggered = useRef(false);

  // State A: trigger sign-in once auth resolves as unauthenticated
  useEffect(() => {
    if (authLoading || isAuthenticated || signInTriggered.current) return;

    signInTriggered.current = true;
    const returnUrl = location.pathname + location.search;
    sessionStorage.setItem("pending_gate_source", source);
    void signIn(returnUrl);
  }, [authLoading, isAuthenticated, signIn, location.pathname, location.search, source]);

  // Clear stale session markers once user arrives at destination
  useEffect(() => {
    if (!isAuthenticated) return;
    sessionStorage.removeItem("pending_gate_redirect");
    sessionStorage.removeItem("pending_gate_source");
  }, [isAuthenticated]);

  // --- Render decision tree ---

  // Still loading auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  // Not authenticated — show spinner while redirect happens
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  // State B: phone required but still checking
  if (requirePhone && phoneLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  // State B: phone required but missing → blocking modal with context
  if (requirePhone && !hasPhone) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center">
        <div className="mb-4 max-w-sm">
          <h2 className="text-lg font-semibold text-foreground mb-1">Almost there!</h2>
          <p className="text-sm text-muted-foreground">
            Enter your phone number to access the {source === "masterclass" ? "free masterclass" : "content"}.
          </p>
        </div>
        <PhoneCaptureModal
          open
          onOpenChange={() => {}}
          source={source}
          onSuccess={() => refetchPhone()}
        />
      </div>
    );
  }

  // State C: all checks passed
  return <>{children}</>;
}

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { Loader2, LogIn } from "lucide-react";
import { useAuth, isAuthFlowActive } from "@/hooks/useAuth";
import { useLeadPhone } from "@/hooks/useLeadPhone";
import { Button } from "@/components/ui/button";
import PhoneCaptureModal from "@/components/PhoneCaptureModal";

interface ProtectedRouteProps {
  children: ReactNode;
  requirePhone?: boolean;
  source?: string;
}

/** Detect if we're inside a standalone/installed app (PWA) on iOS or Android */
function isStandaloneApp() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as any).standalone === true ||
    document.referrer.includes("android-app://")
  );
}

/** Check if the current URL looks like an OAuth callback settling */
function isOAuthCallbackInProgress() {
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

export default function ProtectedRoute({ children, requirePhone = false, source = "protected" }: ProtectedRouteProps) {
  const location = useLocation();
  const { isAuthenticated, user, loading: authLoading, signIn } = useAuth();
  const { hasPhone, loading: phoneLoading, refetch: refetchPhone } = useLeadPhone();
  const signInTriggered = useRef(false);
  const [authBootstrapTimedOut, setAuthBootstrapTimedOut] = useState(false);
  const [signingIn, setSigningIn] = useState(false);

  const standalone = isStandaloneApp();
  const oauthCallbackActive = isOAuthCallbackInProgress();
  const authFlowActive = isAuthFlowActive();

  // State A: trigger sign-in once auth resolves as unauthenticated (browser only, not standalone PWA)
  useEffect(() => {
    if (authLoading || isAuthenticated || signInTriggered.current || standalone) return;
    // Don't trigger if OAuth callback is settling or a recent auth flow is in progress
    if (oauthCallbackActive || authFlowActive) return;

    signInTriggered.current = true;
    const returnUrl = location.pathname + location.search;
    sessionStorage.setItem("pending_gate_source", source);
    void signIn(returnUrl);
  }, [authLoading, isAuthenticated, signIn, location.pathname, location.search, source, standalone, oauthCallbackActive, authFlowActive]);

  // Clear stale session markers once user arrives at destination
  useEffect(() => {
    if (!isAuthenticated) return;
    sessionStorage.removeItem("pending_gate_redirect");
    sessionStorage.removeItem("pending_gate_source");
  }, [isAuthenticated]);

  useEffect(() => {
    if (!authLoading) {
      setAuthBootstrapTimedOut(false);
      return;
    }
    const timer = window.setTimeout(() => setAuthBootstrapTimedOut(true), 2500);
    return () => window.clearTimeout(timer);
  }, [authLoading]);

  console.log("[ProtectedRoute]", { authLoading, isAuthenticated, standalone, authBootstrapTimedOut, oauthCallbackActive, authFlowActive, userId: user?.id, path: location.pathname });

  // --- Render decision tree ---

  // If an OAuth callback is actively settling, always show a loading state
  if (oauthCallbackActive || (authLoading && !authBootstrapTimedOut)) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-2">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        {oauthCallbackActive && (
          <p className="text-sm text-muted-foreground">Completing sign-in…</p>
        )}
      </div>
    );
  }

  // Auth bootstrap timed out -> show recovery actions
  if (authLoading && authBootstrapTimedOut) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center gap-4">
        <h2 className="text-xl font-bold text-foreground">Still loading your session</h2>
        <p className="text-sm text-muted-foreground max-w-xs">
          We couldn't restore your session yet. Try sign in again or reload this app.
        </p>
        <div className="flex w-full max-w-xs gap-2">
          <Button
            size="lg"
            className="flex-1"
            onClick={async () => {
              const returnUrl = location.pathname + location.search;
              await signIn(returnUrl);
            }}
          >
            <LogIn className="h-4 w-4 mr-2" /> Sign in
          </Button>
          <Button size="lg" variant="outline" className="flex-1" onClick={() => window.location.reload()}>
            Reload
          </Button>
        </div>
      </div>
    );
  }

  // Not authenticated in standalone PWA → show sign-in button
  if (!isAuthenticated && standalone) {
    return (
      <SignInScreen
        source={source}
        signingIn={signingIn}
        onSignIn={async () => {
          setSigningIn(true);
          try {
            await signIn(location.pathname + location.search);
          } finally {
            setSigningIn(false);
          }
        }}
      />
    );
  }

  // Not authenticated in browser
  if (!isAuthenticated) {
    // If auth flow is still within grace period, show "completing" state
    if (authFlowActive) {
      return (
        <SignInScreen
          source={source}
          signingIn={signingIn}
          message="It looks like your session wasn't restored. Please sign in again."
          onSignIn={async () => {
            setSigningIn(true);
            try {
              await signIn(location.pathname + location.search);
            } finally {
              setSigningIn(false);
            }
          }}
        />
      );
    }

    // First attempt — show spinner while redirect happens
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

  // State B: phone required but missing
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

/** Reusable sign-in screen to reduce duplication */
function SignInScreen({
  source,
  signingIn,
  message,
  onSignIn,
}: {
  source: string;
  signingIn: boolean;
  message?: string;
  onSignIn: () => void;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center gap-4">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
        <LogIn className="h-8 w-8 text-primary" />
      </div>
      <h2 className="text-xl font-bold text-foreground">Sign in to continue</h2>
      <p className="text-sm text-muted-foreground max-w-xs">
        {message || `Sign in with Google to access your ${source === "dashboard" ? "dashboard" : source === "masterclass" ? "masterclass" : "content"}.`}
      </p>
      <Button
        size="lg"
        disabled={signingIn}
        onClick={onSignIn}
        className="bg-gradient-to-r from-primary to-[hsl(35,100%,50%)]"
      >
        {signingIn ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <LogIn className="h-4 w-4 mr-2" />}
        Sign in with Google
      </Button>
    </div>
  );
}

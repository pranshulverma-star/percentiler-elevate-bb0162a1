import { useEffect, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { Loader2, LogIn, Lock } from "lucide-react";
import { useAuth, isAuthFlowActive } from "@/hooks/useAuth";
import { isStandaloneApp } from "@/lib/platform";
import { useLeadPhone } from "@/hooks/useLeadPhone";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import AuthButtons from "@/components/AuthButtons";
import PhoneCaptureModal from "@/components/PhoneCaptureModal";

interface ProtectedRouteProps {
  children: ReactNode;
  requirePhone?: boolean;
  source?: string;
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
  const [authBootstrapTimedOut, setAuthBootstrapTimedOut] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [signingInProvider, setSigningInProvider] = useState<"google" | "apple" | null>(null);

  const standalone = isStandaloneApp();
  const oauthCallbackActive = isOAuthCallbackInProgress();
  const authFlowActive = isAuthFlowActive();

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

  if (import.meta.env.DEV) {
    console.log("[ProtectedRoute]", { authLoading, isAuthenticated, standalone, authBootstrapTimedOut, oauthCallbackActive, authFlowActive, userId: user?.id, path: location.pathname });
  }

  const handleSignIn = async (provider: "google" | "apple") => {
    setSigningIn(true);
    setSigningInProvider(provider);
    try {
      const returnUrl = location.pathname + location.search;
      sessionStorage.setItem("pending_gate_source", source);
      await signIn(returnUrl, provider);
      // If signIn initiated a redirect, keep loading state — page will navigate away
    } catch (err) {
      console.error("[ProtectedRoute] Sign-in failed:", err);
      toast.error("Sign-in failed", { description: "Something went wrong. Please try again." });
      setSigningIn(false);
      setSigningInProvider(null);
    }
  };

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
            onClick={() => handleSignIn("google")}
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

  // Not authenticated → show sign-in screen with both provider options
  if (!isAuthenticated) {
    return (
      <SignInScreen
        source={source}
        loading={signingIn}
        loadingProvider={signingInProvider}
        message={authFlowActive ? "It looks like your session wasn't restored. Please sign in again." : undefined}
        onSignIn={handleSignIn}
      />
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

/** Context-aware heading map */
function getSignInCopy(source: string) {
  switch (source) {
    case "dashboard":
      return { heading: "Welcome to your Dashboard", sub: "Sign in to track progress, streaks & study plans." };
    case "masterclass":
      return { heading: "Watch the Masterclass", sub: "Sign in to access the free masterclass by Pranshul Verma." };
    default:
      return { heading: "Sign in to continue", sub: "Sign in to access your personalised content." };
  }
}

/** Premium branded sign-in screen */
function SignInScreen({
  source,
  loading,
  loadingProvider,
  message,
  onSignIn,
}: {
  source: string;
  loading: boolean;
  loadingProvider: "google" | "apple" | null;
  message?: string;
  onSignIn: (provider: "google" | "apple") => void;
}) {
  const { heading, sub } = getSignInCopy(source);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Gradient mesh background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent/10 blur-3xl" />
      </div>

      {/* Glassmorphic card */}
      <div className="relative z-10 w-full max-w-sm bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-5">
        {/* Brand */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-2xl font-bold tracking-tight text-foreground">Percentilers</span>
          <span className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium">by Pranshul Verma</span>
        </div>

        {/* Divider */}
        <div className="w-12 h-px bg-border" />

        {/* Copy */}
        <div className="text-center space-y-1.5">
          <h2 className="text-xl font-bold text-foreground">{heading}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {message || sub}
          </p>
        </div>

        {/* Auth buttons */}
        <div className="w-full mt-1">
          <AuthButtons
            onGoogle={() => onSignIn("google")}
            onApple={() => onSignIn("apple")}
            loading={loading}
            loadingProvider={loadingProvider}
          />
        </div>

        {/* Trust line */}
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/70 mt-1">
          <Lock className="w-3 h-3" />
          <span>Secure encrypted sign-in</span>
        </div>
      </div>
    </div>
  );
}
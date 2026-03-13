import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export default function AuthError() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [detail, setDetail] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    // Extract error info from URL hash or query params
    const hash = window.location.hash;
    const params = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(hash.replace("#", "?"));

    const errorDesc =
      hashParams.get("error_description") ||
      params.get("error_description") ||
      hashParams.get("error") ||
      params.get("error");

    if (errorDesc) setDetail(decodeURIComponent(errorDesc));
  }, []);

  const handleRetry = async () => {
    setRetrying(true);
    try {
      await signIn("/");
    } catch {
      setRetrying(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold text-foreground">Sign-in didn't go through</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {detail
              ? detail
              : "Something went wrong during Google Sign-In. This can happen due to browser privacy settings or a network hiccup."}
          </p>
        </div>

        <div className="space-y-3">
          <Button onClick={handleRetry} disabled={retrying} className="w-full gap-2">
            <RefreshCw className={`h-4 w-4 ${retrying ? "animate-spin" : ""}`} />
            {retrying ? "Redirecting…" : "Try again"}
          </Button>
          <Button variant="outline" onClick={() => navigate("/")} className="w-full gap-2">
            <Home className="h-4 w-4" />
            Go to homepage
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Tip: Use Chrome or Safari. Ad-blockers and in-app browsers can block sign-in.
        </p>
      </div>
    </div>
  );
}

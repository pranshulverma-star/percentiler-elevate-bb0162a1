import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

/**
 * Pushes a sentinel history entry on mount.
 * When the user swipes back (popstate), intercepts and navigates to /dashboard.
 * Only active for authenticated users.
 */
export function useBackToDashboard() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) return;

    // Push a sentinel so back gesture pops this instead of leaving the page
    window.history.pushState({ __sentinel: true }, "");

    const handlePopState = (e: PopStateEvent) => {
      // User swiped back — redirect to dashboard
      navigate("/dashboard", { replace: true });
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isAuthenticated, navigate]);
}

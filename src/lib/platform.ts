/**
 * Platform detection utilities.
 * Centralised here to avoid duplicating these functions across
 * useAuth.ts and ProtectedRoute.tsx.
 */

/** Returns true when running inside a standalone/installed PWA on iOS or Android. */
export function isStandaloneApp(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as any).standalone === true ||
    document.referrer.includes("android-app://")
  );
}

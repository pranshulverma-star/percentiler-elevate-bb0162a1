import { useState, useEffect } from "react";
import { X, Download, Share } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const isIOS = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window as any).MSStream;

const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  (navigator as any).standalone === true;

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    if (sessionStorage.getItem("pwa-dismissed")) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // iOS doesn't fire beforeinstallprompt — show manual guide
    if (isIOS()) {
      const timer = setTimeout(() => setShowIOSGuide(true), 3000);
      return () => { clearTimeout(timer); window.removeEventListener("beforeinstallprompt", handler); };
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setDeferredPrompt(null);
    dismiss();
  };

  const dismiss = () => {
    setDismissed(true);
    setShowIOSGuide(false);
    setDeferredPrompt(null);
    sessionStorage.setItem("pwa-dismissed", "1");
  };

  if (dismissed || isStandalone()) return null;
  if (!deferredPrompt && !showIOSGuide) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-sm animate-in slide-in-from-bottom-4 duration-300 md:hidden">
      <div className="rounded-2xl border border-border bg-card p-4 shadow-lg">
        <button
          onClick={dismiss}
          className="absolute right-3 top-3 text-muted-foreground"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>

        {deferredPrompt ? (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Download className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">
                Install Percentilers
              </p>
              <p className="text-xs text-muted-foreground">
                Add to home screen for quick access
              </p>
            </div>
            <Button size="sm" onClick={handleInstall}>
              Install
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Share className="h-5 w-5 text-primary" />
              <p className="text-sm font-semibold text-foreground">
                Install Percentilers
              </p>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Tap the <strong>Share</strong> button{" "}
              <span className="inline-block translate-y-px">
                <Share className="inline h-3.5 w-3.5" />
              </span>{" "}
              in Safari, then tap <strong>"Add to Home Screen"</strong>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

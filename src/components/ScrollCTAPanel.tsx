import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { X, ArrowRight } from "lucide-react";

const ScrollCTAPanel = () => {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [hasClickedCTA, setHasClickedCTA] = useState(false);

  // Track CTA clicks on the page
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a[href='/masterclass'], a[href='#tools']");
      if (anchor) setHasClickedCTA(true);
    };
    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, []);

  const onScroll = useCallback(() => {
    if (dismissed || hasClickedCTA) return;
    const scrollPct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
    if (scrollPct >= 0.6) setVisible(true);
  }, [dismissed, hasClickedCTA]);

  useEffect(() => {
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  const dismiss = () => {
    setVisible(false);
    setDismissed(true);
  };

  if (!visible || dismissed) return null;

  return (
    <div className="fixed bottom-20 right-4 z-40 w-72 rounded-2xl border border-border bg-card p-5 shadow-lg animate-slide-in-right">
      <button
        onClick={dismiss}
        className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
      <p className="font-semibold text-foreground mb-4 pr-4">Need a structured CAT plan?</p>
      <div className="flex flex-col gap-2">
        <Button size="sm" asChild onClick={dismiss}>
          <a href="#tools">Generate Free Study Plan</a>
        </Button>
        <Button size="sm" variant="outline" asChild onClick={dismiss}>
          <a href="/masterclass">
            Watch Free Masterclass <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </a>
        </Button>
      </div>
    </div>
  );
};

export default ScrollCTAPanel;

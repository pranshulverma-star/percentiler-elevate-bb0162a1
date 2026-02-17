import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { X, ArrowRight, Sparkles } from "lucide-react";
import { useLeadModal } from "@/components/LeadModalProvider";
import { motion, AnimatePresence } from "framer-motion";

const ScrollCTAPanel = () => {
  const { openModal } = useLeadModal();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [hasClickedCTA, setHasClickedCTA] = useState(false);

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

  return (
    <AnimatePresence>
      {visible && !dismissed && (
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-16 right-3 md:bottom-20 md:right-4 z-40 w-[calc(100vw-1.5rem)] max-w-72 rounded-2xl border border-border bg-card p-4 md:p-5 shadow-xl"
        >
          <button
            onClick={dismiss}
            className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-primary" />
            <p className="font-semibold text-foreground pr-4">Need a structured CAT plan?</p>
          </div>
          <div className="flex flex-col gap-2">
            <Button size="sm" onClick={() => {
              openModal("scroll_cta_study_plan", () => {
                dismiss();
                const el = document.getElementById("tools");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              });
            }}>
              Generate Free Study Plan
            </Button>
            <Button size="sm" variant="outline" onClick={() => {
              openModal("scroll_cta_masterclass", () => {
                dismiss();
                window.location.href = "/masterclass";
              });
            }}>
              Watch Free Masterclass <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScrollCTAPanel;

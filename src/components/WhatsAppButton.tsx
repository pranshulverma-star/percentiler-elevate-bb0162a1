import { useState, useEffect, useCallback } from "react";
import { MessageCircle } from "lucide-react";

const WhatsAppButton = () => {
  const [visible, setVisible] = useState(false);

  const checkScroll = useCallback(() => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight > 0 && window.scrollY / docHeight >= 0.4) {
      setVisible(true);
      window.removeEventListener("scroll", checkScroll);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 30000);
    window.addEventListener("scroll", checkScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", checkScroll);
    };
  }, [checkScroll]);

  if (!visible) return null;

  return (
    <a
      href="https://wa.me/919999999999"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-3 py-2 shadow-lg transition-all flex items-center gap-1.5 text-xs font-medium animate-slide-in-right"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="h-4 w-4" />
      <span className="hidden sm:inline">Wanna Discuss?</span>
    </a>
  );
};

export default WhatsAppButton;

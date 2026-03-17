import { useState, useEffect, useCallback } from "react";
import { MessageCircle } from "lucide-react";
import { trackWhatsAppClick } from "@/lib/tracking";

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
      href="https://wa.me/918929280711"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 left-5 md:bottom-7 md:left-7 z-50 bg-[#25D366] hover:bg-[#1ebe5b] text-white rounded-full px-4 py-2.5 shadow-xl transition-all flex items-center gap-2 text-sm font-semibold animate-slide-in-right"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="h-5 w-5" />
      <span>Need Help?</span>
    </a>
  );
};

export default WhatsAppButton;

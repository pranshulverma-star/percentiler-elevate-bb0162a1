import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Phone, LayoutDashboard } from "lucide-react";
import { useLeadModal } from "@/components/LeadModalProvider";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import ThemeToggle from "@/components/ThemeToggle";
import { Link } from "react-router-dom";
import logoImg from "@/assets/logo-percentilers.png";

const navLinks = [
  { label: "Home", href: "/", external: false },
  { label: "Courses", href: "/#courses", external: false },
  { label: "Results", href: "/#results", external: false },
  { label: "Free Tools", href: "/#tools", external: false },
  { label: "Practice Lab", href: "/practice-lab", external: false },
  { label: "Blogs", href: "https://old.percentilers.in/blog/", external: true },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [showCallDialog, setShowCallDialog] = useState(false);
  const { openPhoneModal } = useLeadModal();
  const { isAuthenticated } = useAuth();
  const [scrollProgress, setScrollProgress] = useState(0);
  const onScroll = useCallback(() => {
    requestAnimationFrame(() => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docHeight > 0 ? window.scrollY / docHeight : 0);
    });
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  const markLeadHot = (phone: string) => {
    supabase.functions.invoke("mark-lead-hot", {
      body: { phone_number: phone, source: "navbar_strategy_call", name: localStorage.getItem("percentilers_name") || null },
    }).catch(() => {});
  };

  // CTA Type: Phone-only
  // Handles: Scenario 1 (no phone → modal), 2 (N/A), 3 (phone exists → proceed), 4 (cleared → modal)
  const handleStrategyCall = () => {
    const phone = localStorage.getItem("percentilers_phone") || "";
    if (phone) {
      markLeadHot(phone);
      setShowCallDialog(true);
    } else {
      openPhoneModal("navbar_strategy_call", () => {
        const newPhone = localStorage.getItem("percentilers_phone") || "";
        if (newPhone) markLeadHot(newPhone);
        setShowCallDialog(true);
      });
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl shadow-[0_1px_3px_0_rgb(0,0,0,0.04)]">
        <div className="container mx-auto flex items-center justify-between h-16 px-4 md:px-6">
          <a href="#" className="flex items-center">
            <img src={logoImg} alt="Percentilers - Prepare, Persevere, Perform" width={120} height={40} className="h-10 md:h-12 w-auto dark:brightness-0 dark:invert" />
          </a>
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((l) =>
              l.external ? (
                <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className="relative text-sm font-medium text-muted-foreground hover:text-foreground transition-colors after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full">
                  {l.label}
                </a>
              ) : (
              <a key={l.label} href={l.href} className="relative text-sm font-medium text-muted-foreground hover:text-foreground transition-colors after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full">
                  {l.label}
                </a>
              )
            )}
            {isAuthenticated && (
              <Link to="/dashboard" className="relative text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </Link>
            )}
            <Button onClick={handleStrategyCall} className="bg-gradient-to-r from-primary to-[hsl(35,100%,50%)] animate-shimmer bg-[length:200%_100%] shadow-lg shadow-primary/20">Book Free Strategy Call</Button>
            <ThemeToggle />
          </nav>
          <div className="flex md:hidden items-center gap-2">
            <Button size="sm" onClick={handleStrategyCall} className="bg-gradient-to-r from-primary to-[hsl(35,100%,50%)] animate-shimmer bg-[length:200%_100%] shadow-lg shadow-primary/20 text-xs px-3 h-8">
              Book Strategy Call
            </Button>
            <button onClick={() => setOpen(!open)} aria-label="Toggle menu">
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        <div
          className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary origin-left transition-transform duration-150 ease-out"
          style={{ transform: `scaleX(${scrollProgress})` }}
        />
        {open && (
          <nav className="md:hidden border-t border-border bg-background px-4 pb-4 space-y-3">
            {navLinks.map((l) =>
              l.external ? (
                <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className="block text-sm font-medium text-muted-foreground py-2" onClick={() => setOpen(false)}>
                  {l.label}
                </a>
              ) : (
                <a key={l.label} href={l.href} className="block text-sm font-medium text-muted-foreground py-2" onClick={() => setOpen(false)}>
                  {l.label}
                </a>
              )
            )}
            {isAuthenticated && (
              <Link to="/dashboard" className="block text-sm font-medium text-primary py-2 flex items-center gap-1" onClick={() => setOpen(false)}>
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </Link>
            )}
            <div className="flex justify-center pt-1"><ThemeToggle /></div>
          </nav>
        )}
      </header>
      <div className="h-16" />

      <Dialog open={showCallDialog} onOpenChange={setShowCallDialog}>
        <DialogContent className="max-w-sm text-center">
          <DialogTitle className="sr-only">Book a Call</DialogTitle>
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10">
              <Phone className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground">You're In! 🎉</h3>
            <p className="text-muted-foreground text-sm">
              Our counselor will connect with you shortly to discuss the 95%ile Guarantee Batch.
            </p>
            <div className="w-full space-y-3 pt-2">
              <Button size="lg" className="w-full" asChild>
                <a href="tel:+919911928071">
                  <Phone className="mr-2 h-4 w-4" /> Call Now — +91 99119 28071
                </a>
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setShowCallDialog(false)}>
                I'll wait for the call
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Navbar;

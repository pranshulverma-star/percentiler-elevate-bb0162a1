import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useLeadModal } from "@/components/LeadModalProvider";
import ThemeToggle from "@/components/ThemeToggle";
import { motion, useSpring } from "framer-motion";

const navLinks = [
  { label: "Home", href: "#" },
  { label: "Courses", href: "#courses" },
  { label: "Results", href: "#results" },
  { label: "Free Tools", href: "#tools" },
  { label: "Contact", href: "#contact" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { openModal } = useLeadModal();
  const scaleX = useSpring(0, { stiffness: 100, damping: 30 });

  useEffect(() => {
    const onScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      scaleX.set(docHeight > 0 ? window.scrollY / docHeight : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [scaleX]);

  const handleStrategyCall = () => {
    openModal("navbar_strategy_call");
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto flex items-center justify-between h-16 px-4 md:px-6">
          <a href="#" className="text-xl font-bold tracking-tight text-foreground">
            Percentilers
          </a>
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((l) => (
              <a key={l.label} href={l.href} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                {l.label}
              </a>
            ))}
            <Button onClick={handleStrategyCall}>Book Free Strategy Call</Button>
            <ThemeToggle />
          </nav>
          <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        {/* Progress bar attached to bottom of header */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary origin-left"
          style={{ scaleX }}
        />
        {open && (
          <nav className="md:hidden border-t border-border bg-background px-4 pb-4 space-y-3">
            {navLinks.map((l) => (
              <a key={l.label} href={l.href} className="block text-sm font-medium text-muted-foreground py-2" onClick={() => setOpen(false)}>
                {l.label}
              </a>
            ))}
            <Button className="w-full" onClick={() => { setOpen(false); handleStrategyCall(); }}>Book Free Strategy Call</Button>
            <div className="flex justify-center pt-1"><ThemeToggle /></div>
          </nav>
        )}
      </header>
      {/* Spacer to offset fixed header */}
      <div className="h-16" />
    </>
  );
};

export default Navbar;

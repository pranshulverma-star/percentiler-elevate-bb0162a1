import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Home", href: "#" },
  { label: "Courses", href: "#courses" },
  { label: "Results", href: "#results" },
  { label: "Free Tools", href: "#tools" },
  { label: "Contact", href: "#contact" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4 md:px-6">
        <a href="#" className="text-xl font-bold tracking-tight text-foreground">
          Percentilers
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {l.label}
            </a>
          ))}
          <Button asChild>
            <a href="/masterclass">Watch Free Masterclass</a>
          </Button>
        </nav>

        {/* Mobile toggle */}
        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="md:hidden border-t border-border bg-background px-4 pb-4 space-y-3">
          {navLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="block text-sm font-medium text-muted-foreground py-2"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <Button className="w-full" asChild>
            <a href="/masterclass" onClick={() => setOpen(false)}>Watch Free Masterclass</a>
          </Button>
        </nav>
      )}
    </header>
  );
};

export default Navbar;

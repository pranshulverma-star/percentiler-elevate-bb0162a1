import { Link } from "react-router-dom";
import logoImg from "@/assets/logo-percentilers.png";

const Footer = () => (
  <footer className="py-14 md:py-16 bg-background relative">
    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    <div className="container mx-auto px-4 md:px-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-8">
        <div className="col-span-2 md:col-span-1">
          <img src={logoImg} alt="Percentilers" width={120} height={40} className="h-10 w-auto mb-3 dark:brightness-0 dark:invert" loading="lazy" />
          <p className="text-sm text-muted-foreground leading-relaxed">
            Premium CAT coaching for serious aspirants. Structured preparation, expert mentorship, and proven results.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-foreground text-sm mb-3">Quick Links</h4>
          <ul className="space-y-2">
            {[
              { label: "Courses", href: "#courses" },
              { label: "Results", href: "#results" },
              { label: "Free Tools", href: "#tools" },
              { label: "Free Masterclass", href: "/masterclass", isRoute: true },
            ].map((l) => (
              <li key={l.label}>
                {l.isRoute ? (
                  <Link to={l.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {l.label}
                  </Link>
                ) : (
                  <a href={l.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {l.label}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-foreground text-sm mb-3">Legal</h4>
          <ul className="space-y-2">
            <li><Link to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms &amp; Conditions</Link></li>
            <li><Link to="/privacy-policy" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link></li>
            <li><Link to="/refund-policy" className="text-sm text-muted-foreground hover:text-primary transition-colors">Refund &amp; Cancellation</Link></li>
            <li><Link to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contact Us</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-foreground text-sm mb-3">Contact</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Email: <a href="mailto:pranshul@percentilers.in" className="hover:text-primary transition-colors">pranshul@percentilers.in</a></li>
            <li>Phone: <a href="tel:+919911928071" className="hover:text-primary transition-colors">+91-9911928071</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border pt-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Percentilers. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;

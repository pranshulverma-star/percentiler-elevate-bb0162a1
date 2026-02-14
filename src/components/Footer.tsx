const Footer = () => (
  <footer className="py-12 border-t border-border bg-background">
    <div className="container mx-auto px-4 md:px-6">
      <div className="grid md:grid-cols-3 gap-8 mb-8">
        <div>
          <h3 className="font-bold text-foreground text-lg mb-3">Percentilers</h3>
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
              { label: "Free Masterclass", href: "/masterclass" },
            ].map((l) => (
              <li key={l.label}>
                <a href={l.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-foreground text-sm mb-3">Contact</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Email: hello@percentilers.in</li>
            <li>Phone: +91-XXXXX-XXXXX</li>
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

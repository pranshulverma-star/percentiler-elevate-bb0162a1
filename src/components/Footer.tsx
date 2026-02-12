const Footer = () => (
  <footer className="py-8 border-t border-border bg-background">
    <div className="container mx-auto px-4 md:px-6 text-center text-sm text-muted-foreground">
      © {new Date().getFullYear()} Percentilers. All rights reserved.
    </div>
  </footer>
);

export default Footer;

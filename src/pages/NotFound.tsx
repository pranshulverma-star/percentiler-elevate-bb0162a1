import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ALLOWED_ROUTES = [
  "/",
  "/terms",
  "/privacy-policy",
  "/refund-policy",
  "/contact",
  "/masterclass",
  "/masterclass/watch",
  "/mentorship",
  "/free-cat-readiness-assessment",
  "/cat-daily-study-planner",
  "/courses/cat-omet",
  "/free-courses",
  "/test-series",
];

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    const pathname = location.pathname.replace(/\/+$/, "") || "/";
    
    if (!ALLOWED_ROUTES.includes(pathname)) {
      const target = `https://old.percentilers.in${location.pathname}${location.search}`;
      window.location.replace(target);
    }
  }, [location]);

  // Show brief loading while redirecting
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <p className="text-muted-foreground">Redirecting…</p>
    </div>
  );
};

export default NotFound;

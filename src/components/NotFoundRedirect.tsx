import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, Home, LayoutDashboard } from "lucide-react";

/**
 * 404 Not Found page.
 * Shown for any URL that doesn't match a known route.
 * Marked noindex so Google doesn't index broken URLs.
 */
export default function NotFoundRedirect() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <>
      <Helmet>
        <title>Page Not Found | Percentilers</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div
        className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
        style={{ background: "#FFFFFF", fontFamily: "'DM Sans', sans-serif" }}
      >
        {/* Big 404 */}
        <p
          className="font-extrabold leading-none mb-4 select-none"
          style={{ fontSize: "clamp(80px, 20vw, 160px)", color: "#F0EBE6" }}
        >
          404
        </p>

        {/* Icon + headline */}
        <div className="mb-3">
          <span className="text-4xl">🎯</span>
        </div>
        <h1
          className="text-2xl font-extrabold mb-2"
          style={{ color: "#141414" }}
        >
          This page doesn't exist
        </h1>
        <p
          className="text-base mb-8 max-w-xs"
          style={{ color: "#6B7280" }}
        >
          Looks like this URL took a wrong turn. The page you're looking for has
          moved, been deleted, or never existed.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 flex-1 py-3 px-5 rounded-xl font-semibold text-sm transition-opacity hover:opacity-80"
            style={{ background: "#FF6600", color: "#FFFFFF" }}
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>

          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="flex items-center justify-center gap-2 flex-1 py-3 px-5 rounded-xl font-semibold text-sm border transition-colors hover:bg-[#FFF5EE]"
              style={{ borderColor: "#F0EBE6", color: "#141414" }}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
          ) : (
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center gap-2 flex-1 py-3 px-5 rounded-xl font-semibold text-sm border transition-colors hover:bg-[#FFF5EE]"
              style={{ borderColor: "#F0EBE6", color: "#141414" }}
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>
          )}
        </div>
      </div>
    </>
  );
}

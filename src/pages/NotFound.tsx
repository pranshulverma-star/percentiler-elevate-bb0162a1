import { Helmet } from "react-helmet-async";

const NotFound = () => {
  // Server-side 301 redirects handle unknown routes via public/_redirects.
  // This component is a fallback; noindex prevents soft-404 indexing.
  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
        <title>Page Not Found – Percentilers</title>
      </Helmet>
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Page not found.</p>
      </div>
    </>
  );
};

export default NotFound;

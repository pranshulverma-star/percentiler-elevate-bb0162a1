const NotFound = () => {
  // Server-side 301 redirects handle unknown routes via public/_redirects.
  // This component only renders if somehow reached client-side.
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <p className="text-muted-foreground">Page not found.</p>
    </div>
  );
};

export default NotFound;

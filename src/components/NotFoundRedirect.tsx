import { useEffect } from "react";

export default function NotFoundRedirect() {
  useEffect(() => {
    const path = window.location.pathname;

    // Never redirect OAuth callback paths — they must be handled by the SPA
    if (path.startsWith("/~oauth")) return;

    window.location.replace("https://old.percentilers.in" + path + window.location.search);
  }, []);

  return null;
}

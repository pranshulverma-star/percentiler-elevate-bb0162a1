import { useEffect } from "react";

export default function NotFoundRedirect() {
  useEffect(() => {
    const path = window.location.pathname + window.location.search;
    window.location.replace("https://old.percentilers.in" + path);
  }, []);

  return null;
}

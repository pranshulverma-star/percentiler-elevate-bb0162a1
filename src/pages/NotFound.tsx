const NotFound = () => {
  // Server-side 301 redirect in _redirects handles unknown routes before this renders.
  // This is only a fallback shell — it should never be visible.
  return null;
};

export default NotFound;

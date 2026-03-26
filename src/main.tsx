import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { onForegroundMessage } from "@/lib/firebase";

createRoot(document.getElementById("root")!).render(<App />);

// Register Firebase Cloud Messaging service worker for background push notifications.
// This is separate from the VitePWA service worker — they coexist at different scopes.
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/firebase-messaging-sw.js", { scope: "/firebase-messaging-sw/" })
    .catch((err) => console.warn("[FCM SW] Registration failed:", err));
}

// Listen for foreground FCM messages and show Sonner toasts
try {
  onForegroundMessage();
} catch {
  // Firebase may not be configured yet (missing env vars in dev)
}

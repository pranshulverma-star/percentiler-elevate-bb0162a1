import { initializeApp, getApps } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const firebaseConfig = {
  apiKey: "AIzaSyBwmfso3fkfO_LRr-pnxjsm1FkgSDW5E_M",
  authDomain: "percentilers-loveable.firebaseapp.com",
  projectId: "percentilers-loveable",
  storageBucket: "percentilers-loveable.firebasestorage.app",
  messagingSenderId: "846285637903",
  appId: "1:846285637903:web:8e1fbb77fc1fc2c06b167a",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const messaging = getMessaging(app);

/**
 * Request push notification permission, get FCM token, and save it to Supabase.
 * Returns the token string, or null if permission was denied or browser is unsupported.
 */
export async function requestPushPermission(userId: string): Promise<string | null> {
  if (!("Notification" in window) || !("serviceWorker" in navigator)) return null;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return null;

  // Get (or re-use) the firebase SW registration so we can pass it explicitly to
  // getToken() — this prevents conflicts with the existing VitePWA service worker.
  let swReg: ServiceWorkerRegistration | undefined;
  try {
    swReg = await navigator.serviceWorker.register("/firebase-messaging-sw.js", {
      scope: "/firebase-messaging-sw/",
    });
  } catch {
    // Fall back to any existing registration at that script URL
    swReg = await navigator.serviceWorker.getRegistration("/firebase-messaging-sw/");
  }

  const token = await getToken(messaging, {
    vapidKey: "BINsP_zVSvohFkIgZxBgVehAd9A42gx8Cued7b7Vhz37KB4IQAju4h0xFwJedJ7mTeMF_ztpLT5eiJmaQfte40U",
    serviceWorkerRegistration: swReg,
  });

  if (token) {
    await (supabase.from("push_tokens") as any).upsert(
      { user_id: userId, token },
      { onConflict: "user_id,token" }
    );
  }

  return token || null;
}

/**
 * Set up a listener for FCM messages received while the app is in the foreground.
 * Shows a Sonner toast for each message.
 * Call once after app mounts.
 */
export function onForegroundMessage(): void {
  onMessage(messaging, (payload) => {
    const title = payload.notification?.title ?? "New notification";
    const body = payload.notification?.body ?? "";
    toast(title, { description: body || undefined, duration: 5000 });
  });
}

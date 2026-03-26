// Firebase Cloud Messaging Service Worker
// Uses compat libraries — Vite env vars are NOT available here.
// After getting your Firebase config, replace EACH placeholder below manually.

importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "REPLACE_WITH_VITE_FIREBASE_API_KEY",
  authDomain: "REPLACE_WITH_VITE_FIREBASE_AUTH_DOMAIN",
  projectId: "REPLACE_WITH_VITE_FIREBASE_PROJECT_ID",
  storageBucket: "REPLACE_WITH_VITE_FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "REPLACE_WITH_VITE_FIREBASE_MESSAGING_SENDER_ID",
  appId: "REPLACE_WITH_VITE_FIREBASE_APP_ID",
});

const messaging = firebase.messaging();

// Handle background push messages (app closed or not in focus)
messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || "Percentilers";
  const body = payload.notification?.body || "";

  self.registration.showNotification(title, {
    body,
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    data: payload.data || {},
  });
});

// Handle notification click — open/focus the app
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const actionUrl = event.notification.data?.action_url || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        // Focus an existing window if one is already open
        for (const client of windowClients) {
          if (client.url === actionUrl && "focus" in client) {
            return client.focus();
          }
        }
        // Otherwise open a new window
        if (clients.openWindow) {
          return clients.openWindow(actionUrl);
        }
      })
  );
});

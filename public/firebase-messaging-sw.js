// Firebase Cloud Messaging Service Worker
//
// ⚠️  INTENTIONAL LITERAL VALUES — DO NOT REPLACE WITH import.meta.env
// Service workers execute outside Vite's build pipeline and have no access to
// import.meta.env. The config here MUST stay as literal strings.
// When rotating Firebase credentials, update BOTH .env AND this file manually.
//
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBwmfso3fkfO_LRr-pnxjsm1FkgSDW5E_M",
  authDomain: "percentilers-loveable.firebaseapp.com",
  projectId: "percentilers-loveable",
  storageBucket: "percentilers-loveable.firebasestorage.app",
  messagingSenderId: "846285637903",
  appId: "1:846285637903:web:8e1fbb77fc1fc2c06b167a",
});

const messaging = firebase.messaging();

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

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const actionUrl = event.notification.data?.action_url || "/";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url === actionUrl && "focus" in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(actionUrl);
    })
  );
});

// Service Worker for English Learning Assistant PWA

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

// Push notification handler
self.addEventListener("push", (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || "Time to review your English vocabulary!",
    icon: "/icon-192x192.png",
    badge: "/icon-192x192.png",
    vibrate: [100, 50, 100],
    data: {
      url: data.url || "/learn",
    },
    actions: [
      { action: "open", title: "开始学习" },
      { action: "dismiss", title: "稍后" },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(
      data.title || "English Learning Assistant",
      options
    )
  );
});

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") return;

  const url = event.notification.data?.url || "/learn";

  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      // Focus existing window if available
      for (const client of clientList) {
        if (client.url.includes(url) && "focus" in client) {
          return client.focus();
        }
      }
      // Open new window
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

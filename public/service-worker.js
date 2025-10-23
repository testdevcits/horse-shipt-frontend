// Listen for push events
self.addEventListener("push", (event) => {
  let data = { title: "Notification", body: "You have a new notification!" };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (err) {
      console.error("Push event data parsing error:", err);
    }
  }

  const options = {
    body: data.body,
    icon: "/HorseShipt192.png", // Replace with your app icon
    badge: "/HorseShipt192.png", // Optional: small badge icon
    data: { url: data.url || "/" }, // Pass URL to notificationclick
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === urlToOpen && "focus" in client)
            return client.focus();
        }
        if (clients.openWindow) return clients.openWindow(urlToOpen);
      })
  );
});

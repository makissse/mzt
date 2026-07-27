self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data?.json() ?? {}; } catch { data = { title: "МЗТ", body: event.data?.text() ?? "" }; }

  const title = data.title ?? "МЗТ";
  const options = {
    body: data.body ?? "",
    icon: "/favicon.svg",
    badge: "/favicon.svg",
    tag: data.tag ?? "mzt-notification",
    data: { url: data.url ?? "/" },
    requireInteraction: false,
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    }),
  );
});

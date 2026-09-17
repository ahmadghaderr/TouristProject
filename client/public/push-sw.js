self.addEventListener("push", (event) => {
  const { title, body } = event.data.json();
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: "/logo192.png",
    })
  );
});

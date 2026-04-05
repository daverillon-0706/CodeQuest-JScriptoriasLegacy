// src/ui/HUD/NotificationUI.js

export function showNotification(message, type = "item") {
  const container = document.getElementById("notifications-container");
  if (!container) return;

  const notif = document.createElement("div");
  notif.classList.add("notification", type);

  notif.textContent = message;

  container.prepend(notif);

  setTimeout(() => {
    notif.style.animation = "notif-fade-out 0.3s forwards";

    setTimeout(() => {
      notif.remove();
    }, 300);
  }, 3000);

  while (container.children.length > 4) {
    container.removeChild(container.lastChild);
  }
}
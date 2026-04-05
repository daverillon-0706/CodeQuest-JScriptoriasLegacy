// src/systems/NotificationSystem.js
export default class NotificationSystem {
  constructor(scene) {
    this.scene = scene;
    this.container = null;
    this.notifications = [];
    this.duration = 3000; // default display time (ms)
  }

  init() {
    this.container = document.createElement("div");

    Object.assign(this.container.style, {
      position: "fixed",
      top: "330px", // below minimap
      right: "16px",
      width: "260px",
      maxHeight: "220px",
      overflowY: "auto",
      padding: "8px",
      background: "rgba(0, 0, 0, 0.55)",
      border: "2px solid rgba(255,255,255,0.15)",
      borderRadius: "8px",
      zIndex: 99999,
      fontFamily: "monospace",
      fontSize: "12px",
      color: "#fff",
      pointerEvents: "none",
      display: "flex",
      flexDirection: "column-reverse",
      gap: "4px",
    });

    document.body.appendChild(this.container);
  }

  add(message, type = "info") {
    if (!this.container) return;

    const notif = document.createElement("div");

    // Add emoji based on type
    const emoji = this.getEmoji(type);
    notif.textContent = `${emoji} ${message}`;

    Object.assign(notif.style, {
      padding: "4px 6px",
      borderBottom: "1px solid rgba(255,255,255,0.08)",
      background: this.getBackgroundColor(type),
      color: this.getTextColor(type),
      wordBreak: "break-word",
      opacity: "0",
      transform: "scale(0.8)",
      transition: "opacity 0.3s ease, transform 0.3s ease",
      borderRadius: "4px",
    });

    this.container.prepend(notif);

    // Animate in
    requestAnimationFrame(() => {
      notif.style.opacity = "1";
      notif.style.transform = "scale(1)";
    });

    // Remove after duration
    setTimeout(() => {
      notif.style.opacity = "0";
      notif.style.transform = "scale(0.8)";
      setTimeout(() => {
        notif.remove();
      }, 300);
    }, this.duration);

    // Optional: limit visible notifications
    while (this.container.children.length > 12) {
      this.container.removeChild(this.container.lastChild);
    }
  }

  getEmoji(type) {
    switch (type) {
      case "quest": return "📘";
      case "error": return "❌";
      case "warning": return "⚠️";
      case "success": return "✅";
      case "system": return "💻";
      default: return "ℹ️";
    }
  }

  getBackgroundColor(type) {
    switch (type) {
      case "quest": return "#2e7d32"; // dark green
      case "error": return "#b71c1c"; // dark red
      case "warning": return "#ff6f00"; // orange
      case "success": return "#00796b"; // teal
      case "system": return "#512da8"; // purple
      default: return "#1976d2"; // blue
    }
  }

  getTextColor(type) {
    switch (type) {
      case "quest": return "#a5d6a7";
      case "error": return "#ff8a80";
      case "warning": return "#ffd54f";
      case "success": return "#80cbc4";
      case "system": return "#b39ddb";
      default: return "#ffffff";
    }
  }

  destroy() {
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
  }
}
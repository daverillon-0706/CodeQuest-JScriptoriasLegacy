// src/systems/HoverManager.js
export default class HoverManager {
  constructor(scene) {
    this.scene = scene;
    this.items = [];
    this.textEl = null;
  }

  init() {
    // DOM element to show hover text
    this.textEl = document.getElementById("hover-text");
    if (!this.textEl) {
      this.textEl = document.createElement("div");
      this.textEl.id = "hover-text";
      Object.assign(this.textEl.style, {
        position: "absolute",
        background: "rgba(0,0,0,0.7)",
        color: "white",
        padding: "2px 5px",
        borderRadius: "4px",
        pointerEvents: "none",
        fontFamily: "Arial, sans-serif",
        fontSize: "12px",
        display: "none"
      });
      document.body.appendChild(this.textEl);
    }

    this.scene.input.on("pointermove", pointer => {
      this.textEl.style.left = pointer.x + 10 + "px";
      this.textEl.style.top = pointer.y + 10 + "px";
    });
  }

  register(sprite, hoverName = "", hoverDescription = "") {
    sprite.setInteractive();
    sprite.on("pointerover", () => {
      this.textEl.textContent = hoverDescription ? `${hoverName}: ${hoverDescription}` : hoverName;
      this.textEl.style.display = "block";
    });
    sprite.on("pointerout", () => {
      this.textEl.style.display = "none";
    });
    this.items.push({ sprite, hoverName, hoverDescription });
  }

  // New helper to register everything from an object layer
  registerFromObjectLayer(map, layerName) {
    const layer = map.getObjectLayer(layerName);
    if (!layer) return;

    layer.objects.forEach(obj => {
      const zone = this.scene.add.zone(obj.x, obj.y, obj.width, obj.height).setOrigin(0, 0);
      const hoverName = obj.properties?.find(p => p.name === "hoverName")?.value || "Unknown";
      const hoverDescription = obj.properties?.find(p => p.name === "hoverDescription")?.value || "";
      this.register(zone, hoverName, hoverDescription);
    });
  }
}

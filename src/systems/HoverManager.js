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
            // Create one if not in HTML
            this.textEl = document.createElement("div");
            this.textEl.id = "hover-text";
            this.textEl.style.position = "absolute";
            this.textEl.style.background = "rgba(0,0,0,0.7)";
            this.textEl.style.color = "white";
            this.textEl.style.padding = "2px 5px";
            this.textEl.style.borderRadius = "4px";
            this.textEl.style.pointerEvents = "none";
            this.textEl.style.fontFamily = "Arial, sans-serif";
            this.textEl.style.fontSize = "12px";
            this.textEl.style.display = "none";
            document.body.appendChild(this.textEl);
        }

        // Move tooltip with cursor
        this.scene.input.on("pointermove", (pointer) => {
            this.textEl.style.left = pointer.x + 10 + "px";
            this.textEl.style.top = pointer.y + 10 + "px";
        });
    }

    register(sprite, text) {
        sprite.setInteractive();
        sprite.on("pointerover", () => {
            if (this.textEl) {
                this.textEl.textContent = text;
                this.textEl.style.display = "block";
            }
        });
        sprite.on("pointerout", () => {
            if (this.textEl) {
                this.textEl.textContent = "";
                this.textEl.style.display = "none";
            }
        });
        this.items.push({ sprite, text });
    }
}

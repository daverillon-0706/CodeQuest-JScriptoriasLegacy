import { GUIDEBOOK } from "../data/guidebook";

export default class GuidebookUI {
  constructor(compilerUI) {
    this.compilerUI = compilerUI;

    this.panel = document.getElementById("guidebook-panel");
    this.list = document.getElementById("guidebook-list");
    this.openBtn = document.getElementById("open-guidebook");
    this.closeBtn = document.getElementById("close-guidebook");

    // Close button
    this.closeBtn?.addEventListener("click", () => {
      this.panel.classList.add("hidden");
    });

    // Click outside to close
    this.panel?.addEventListener("click", (e) => {
      if (e.target === this.panel) {
        this.panel.classList.add("hidden");
      }
    });

    this.bindEvents();
  }
/*
  bindEvents() {
    if (this.openBtn && !this.openBtn.dataset.bound) {
      this.openBtn.addEventListener("click", () => this.toggle());
      this.openBtn.dataset.bound = "true";
    }
  }
*/
bindEvents() {
  if (!this.openBtn) return;

  this.openBtn.addEventListener("click", () => this.toggle());
}
  toggle() {
    console.log("Guidebook toggle fired");
    this.panel.classList.toggle("hidden");

    if (!this.panel.classList.contains("hidden")) {
      this.renderList();
    }
  }

  renderList() {
    if (!GUIDEBOOK) return;
    this.list.innerHTML = "";

    Object.entries(GUIDEBOOK).forEach(([category, examples]) => {
      const section = document.createElement("div");

      const title = document.createElement("h4");
      title.textContent = category.replace(/_/g, " ").toUpperCase();

      section.appendChild(title);

      GUIDEBOOK[category].forEach(example => {
        const btn = document.createElement("button");
        btn.textContent = example.title;

        btn.addEventListener("click", () => {
          // 🔥 Highlight selected
          this.list.querySelectorAll("button")
            .forEach(b => b.classList.remove("active"));

          btn.classList.add("active");

          this.loadExample(example);
        });

        section.appendChild(btn);
      });

      this.list.appendChild(section);
    });
  }

  loadExample(example) {
    this.compilerUI.loadExample(example);
    this.compilerUI.open();
    this.panel.classList.add("hidden");
  }
}
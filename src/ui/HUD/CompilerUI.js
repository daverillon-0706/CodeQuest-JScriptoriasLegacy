export default class CompilerUI {
  constructor() {
    // Panels
    this.panel = document.getElementById("app-compiler");

    // Buttons
    this.runBtn = document.getElementById("compiler-run");
    this.clearBtn = document.getElementById("compiler-clear");
    this.saveBtn = document.getElementById("compiler-save");
    this.copyBtn = document.getElementById("compiler-copy");

    // Editors
    this.htmlBox = document.getElementById("compiler-html");
    this.cssBox = document.getElementById("compiler-css");
    this.jsBox = document.getElementById("compiler-js");

    // Preview iframe
    this.preview = document.getElementById("compiler-preview");

    this.bindEvents();
    this.loadSavedCode();
  }

  bindEvents() {
    // Run
    this.runBtn?.addEventListener("click", () => this.runCode());

    // Clear
    this.clearBtn?.addEventListener("click", () => this.clearAll());

    // Save
    this.saveBtn?.addEventListener("click", () => this.saveCode());

    // Copy output (HTML)
    this.copyBtn?.addEventListener("click", () => this.copyOutput());

    // Phaser lock
    [this.htmlBox, this.cssBox, this.jsBox].forEach(box => {
      box?.addEventListener("focus", () => {
        if (window.game?.input?.keyboard) {
          window.game.input.keyboard.enabled = false;
        }
      });

      box?.addEventListener("blur", () => {
        if (window.game?.input?.keyboard) {
          window.game.input.keyboard.enabled = true;
        }
      });
    });

    [this.htmlBox, this.cssBox, this.jsBox].forEach(box => {
      box?.addEventListener("input", () => this.saveCode());
    });

    // Simple tab system
    document.querySelectorAll("[data-tab]").forEach(btn => {
      btn.addEventListener("click", () => this.switchTab(btn.dataset.tab));
    });
  }

  // =========================
  // TAB SYSTEM
  // =========================

  switchTab(tab) {
  // Hide all editors
  this.htmlBox.classList.add("hidden");
  this.cssBox.classList.add("hidden");
  this.jsBox.classList.add("hidden");

  // Hide all labels
  document.getElementById("label-html")?.classList.add("hidden");
  document.getElementById("label-css")?.classList.add("hidden");
  document.getElementById("label-js")?.classList.add("hidden");

  // Show selected
  const map = {
    html: this.htmlBox,
    css: this.cssBox,
    js: this.jsBox
  };

  const labelMap = {
    html: "label-html",
    css: "label-css",
    js: "label-js"
  };

  map[tab]?.classList.remove("hidden");
  document.getElementById(labelMap[tab])?.classList.remove("hidden");

  // Active tab UI
  document.querySelectorAll("#app-compiler [data-tab]").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.tab === tab);
  });
}

  // =========================
  // CORE EXECUTION
  // =========================

  runCode() {
    const html = this.htmlBox.value || "";
    const css = this.cssBox.value || "";
    const js = this.jsBox.value || "";

    const fullDocument = `
<!DOCTYPE html>
<html>
<head>
<style>
${css}
</style>
</head>
<body>

${html}

<script>
try {
  ${js}
} catch (e) {
  const err = document.createElement("pre");
  err.style.color = "red";
  err.textContent = e.message;
  document.body.appendChild(err);
}
<\/script>

</body>
</html>
`;

    this.preview.srcdoc = fullDocument;

    document.dispatchEvent(new CustomEvent("compiler-output", {
      detail: { text: "Web preview updated" }
    }));
  }

  // =========================
  // STORAGE
  // =========================

  saveCode() {
    localStorage.setItem("web_html", this.htmlBox.value);
    localStorage.setItem("web_css", this.cssBox.value);
    localStorage.setItem("web_js", this.jsBox.value);
  }

  loadSavedCode() {
    this.htmlBox.value = localStorage.getItem("web_html") || "";
    this.cssBox.value = localStorage.getItem("web_css") || "";
    this.jsBox.value = localStorage.getItem("web_js") || "";
  }

  // =========================
  // UTILITIES
  // =========================

  clearAll() {
    this.htmlBox.value = "";
    this.cssBox.value = "";
    this.jsBox.value = "";
    this.preview.srcdoc = "";

    localStorage.removeItem("web_html");
    localStorage.removeItem("web_css");
    localStorage.removeItem("web_js");
  }

  copyOutput() {
    navigator.clipboard.writeText(this.preview.srcdoc || "");
  }

  // =========================
  // UI CONTROL
  // =========================

  open() {
    this.panel.classList.remove("hidden");
  }

  close() {
    this.panel.classList.add("hidden");
  }

  loadExample(example) {
    this.htmlBox.value = example.html;
    this.cssBox.value = example.css;
    this.jsBox.value = example.js;

    // Switch to HTML tab (good default)
    this.switchTab("html");

    // Open compiler if not open
    this.open();

    // 🔥 Auto-run preview
    this.runCode();
  }
}
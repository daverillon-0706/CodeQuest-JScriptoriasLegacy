export default class CompilerUI {
  constructor() {
    // HTML elements
    this.panel = document.getElementById("app-compiler");
    this.runBtn = document.getElementById("compiler-run");
    this.codeBox = document.getElementById("compiler-code");

    // Disable Phaser keys while typing
this.codeBox.addEventListener("focus", () => {
  if (window.game && window.game.input && window.game.input.keyboard) {
    window.game.input.keyboard.enabled = false;
  }
});

this.codeBox.addEventListener("blur", () => {
  if (window.game && window.game.input && window.game.input.keyboard) {
    window.game.input.keyboard.enabled = true;
  }
});

    // Safety: Only attach listeners once
    if (this.runBtn && !this.runBtn.dataset.bound) {
      this.runBtn.addEventListener("click", () => this.runCode());
      this.runBtn.dataset.bound = "true";
    }
  }

  // Called by HUD.js when the app opens
  open() {
    this.panel.classList.remove("hidden");
  }

  // Called by HUD.js when the app closes
  close() {
    this.panel.classList.add("hidden");
  }

  // Clear code after each use
  reset() {
    this.codeBox.value = "";
  }

  // --- MAIN LOGIC ---
  runCode() {
    const code = this.codeBox.value.trim();
    if (!code) return;

    // Collect console.log outputs inside an array
    let output = [];

    // Temporary override console.log
    const originalLog = console.log;
    console.log = (msg) => {
      output.push(String(msg));
      originalLog(msg);
    };

    try {
      // Evaluate player code
      eval(code);
    } catch (err) {
      output.push("Error: " + err.message);
    }

    // Restore console.log
    console.log = originalLog;

    // Trigger HUD to close + show output textbox
    document.dispatchEvent(new CustomEvent("compiler-output", {
      detail: { text: output.join("\n") }
    }));

    // Reset box for next input
    this.reset();
  }
}

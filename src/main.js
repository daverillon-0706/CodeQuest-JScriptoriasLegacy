import Phaser from "phaser";
import HQInteriorScene from "./scenes/HQInteriorScene.js";
import JScriptoriaScene from "./scenes/JScriptoriaScene.js";
import BattleScene from "./scenes/BattleScene.js";

console.log("Using Phaser:", Phaser.VERSION);
console.log("MAIN.JS LOADED (Vite)");

const config = {
  type: Phaser.AUTO,
  parent: "game-container",
  width: 800,
  height: 600,
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  pixelArt: true,
  physics: {
    default: "arcade",
    arcade: { debug: false }
  },
  scene: [JScriptoriaScene, HQInteriorScene, BattleScene]
};

const game = new Phaser.Game(config);
window.game = game; // optional, for debugging

// Start initial scene with initial stats
game.scene.start("JScriptoriaScene", {
  playerHP: 100,
  playerEnergy: 50,
  playerCoins: 0
});

// Auto-resize
window.addEventListener("resize", () => game.scale.refresh());

// Ensure BattleScene is properly stopped at boot
game.events.on("ready", () => {
  const battle = game.scene.getScene("BattleScene");

  if (battle) {
    battle.scene.stop();  // don't make it visible yet
    console.log("BattleScene stopped on boot.");
  }
});

// Optional helper to launch BattleScene with player data
window.launchBattle = (data) => {
  const battle = game.scene.get("BattleScene");
  if (battle) {
    game.scene.launch("BattleScene", data);
    battle.scene.bringToTop();
  }
};

// Optional helper to stop BattleScene
window.endBattle = () => {
  const battle = game.scene.get("BattleScene");
  if (battle) {
    battle.scene.stop();
  }
};

const hudToggle = document.getElementById("hud-toggle");
const hud = document.getElementById("hud");

hudToggle.addEventListener("click", () => {
  hud.classList.toggle("active");
});


// ==========================
//  FIX COMPILER TYPING ISSUE
// ==========================

const codeInput = document.getElementById("player-code");

// Prevent Phaser from capturing keys when the code editor is focused
codeInput.addEventListener("focus", () => {
  console.log("[Compiler] Focused -> Disabling game input");
  game.input.keyboard.enabled = false;
});

// Re-enable Phaser input when clicking out of textarea
codeInput.addEventListener("blur", () => {
  console.log("[Compiler] Blurred -> Enabling game input");
  game.input.keyboard.enabled = true;
});

// Prevent movement keys from leaking while typing
codeInput.addEventListener("keydown", (e) => {
  e.stopPropagation();
});

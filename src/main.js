import Phaser from "phaser";
import HQInteriorScene from "./scenes/HQInteriorScene.js";
import JScriptoriaScene from "./scenes/JScriptoriaScene.js";
import BattleScene from "./scenes/BattleScene.js";
import OrinsAcademyScene from "./scenes/OrinsAcademyScene.js";
import GameState from "./GameState.js"; // keeps track of logged-in player

if (!GameState.player) {
  alert("Please log in first!");
  window.location.href = "index.html";
}


console.log("Using Phaser:", Phaser.VERSION);
console.log("MAIN.JS LOADED (Vite)");

// --------------------------
// Ensure player is logged in
// --------------------------
if (!GameState.player) {
  console.warn("No logged-in player detected. Redirecting to login page.");
  window.location.href = "index.html";
}

// --------------------------
// Phaser config
// --------------------------
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: "game-container", // the div in game.html
  dom: { createContainer: true },
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  pixelArt: true,
  physics: {
    default: "arcade",
    arcade: { debug: false }
  },
  scene: [JScriptoriaScene, HQInteriorScene, OrinsAcademyScene, BattleScene]
};

const game = new Phaser.Game(config);
window.game = game;

// --------------------------
// Start with first game scene
// --------------------------
game.scene.start("JScriptoriaScene", {
  playerHP: 100,
  playerEnergy: 50,
  playerCoins: 0,
  username: GameState.player.username
});

// --------------------------
// BattleScene helpers
// --------------------------
game.events.on("ready", () => {
  const battle = game.scene.getScene("BattleScene");
  if (battle) {
    battle.scene.stop(); // keep hidden until launched
    console.log("BattleScene stopped on boot.");
  }
});

window.launchBattle = (data) => {
  const battle = game.scene.get("BattleScene");
  if (battle) {
    game.scene.launch("BattleScene", data);
    battle.scene.bringToTop();
  }
};

window.endBattle = () => {
  const battle = game.scene.get("BattleScene");
  if (battle) {
    battle.scene.stop();
  }
};

// --------------------------
// Prevent Phaser input while typing
// --------------------------
const codeInput = document.getElementById("player-code");
if (codeInput) {
  codeInput.addEventListener("focus", () => {
    console.log("[Compiler] Focused -> Disabling game input");
    game.input.keyboard.enabled = false;
  });

  codeInput.addEventListener("blur", () => {
    console.log("[Compiler] Blurred -> Enabling game input");
    game.input.keyboard.enabled = true;
  });

  codeInput.addEventListener("keydown", (e) => e.stopPropagation());
}

// --------------------------
// Auto-resize
// --------------------------
window.addEventListener("resize", () => game.scale.refresh());

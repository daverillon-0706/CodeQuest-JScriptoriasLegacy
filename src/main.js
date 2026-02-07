import Phaser from "phaser";
//import HQInteriorScene from "./scenes/HQInteriorScene.js";
import JScriptoriaCityScene from "./scenes/JScriptoriaCityScene.js";
//import BattleScene from "./scenes/BattleScene.js";
//import OrinsAcademyScene from "./scenes/OrinsAcademyScene.js";
import PerksManager from "./systems/PerksManager.js";
import GameState from "./GameState.js";

// --------------------------
// Ensure player is logged in (SINGLE CHECK)
// --------------------------
if (!GameState.player) {
  alert("Please log in first!");
  window.location.href = "index.html";
  throw new Error("No logged-in player."); // stops Phaser boot
}

console.log("Using Phaser:", Phaser.VERSION);
console.log("MAIN.JS LOADED (Vite)");

// --------------------------
// Initialize PerksManager (ONCE)
// --------------------------
if (!GameState.perks) {
  GameState.perks = new PerksManager(GameState.player);
  console.log("PerksManager initialized for player");
}

// --------------------------
// Phaser config
// --------------------------
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: "game-container",
  dom: { createContainer: true },
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  pixelArt: true,
  physics: {
    default: "arcade",
    arcade: { debug: false } // turn off for final build
  },
  scene: [
    JScriptoriaCityScene
  ]
};

const game = new Phaser.Game(config);
window.game = game;

// --------------------------
// Start first scene safely
// --------------------------
game.scene.start("JScriptoriaCityScene", {
  username: GameState.player.username
});

/*
// --------------------------
// BattleScene helpers
// --------------------------
game.events.on("ready", () => {
  const battle = game.scene.getScene("BattleScene");
  if (battle) {
    battle.scene.stop();
    console.log("BattleScene stopped on boot.");
  }
});*/

/*
window.launchBattle = (data) => {
  const battle = game.scene.getScene("BattleScene");
  if (battle) {
    game.scene.launch("BattleScene", data);
    battle.scene.bringToTop();
  }
};*/
/*
window.endBattle = () => {
  const battle = game.scene.getScene("BattleScene");
  if (battle) {
    battle.scene.stop();
  }
};*/

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
window.addEventListener("resize", () => {
  game.scale.refresh();
});

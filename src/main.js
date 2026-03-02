import Phaser from "phaser";
import JScriptoriaCityScene from "./scenes/JScriptoriaCityScene.js";
import GameState from "./GameState.js";
import LessonHouseScene from "./scenes/LessonHouseScene.js";

// --------------------------
// Debug loaded player
// --------------------------
console.log("Loaded Player Before Boot:", GameState.player);

// --------------------------
// Ensure player exists
// --------------------------
if (!GameState.player) {
  alert("Please log in first!");
  window.location.href = "index.html";
  throw new Error("No logged-in player.");
}

console.log("Using Phaser:", Phaser.VERSION);
console.log("MAIN.JS LOADED (Vite)");

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
    arcade: { debug: false }
  },
  scene: [
    JScriptoriaCityScene,
    LessonHouseScene
  ]
};

const game = new Phaser.Game(config);
window.game = game;

// --------------------------
// Start scene
// --------------------------
game.scene.start("JScriptoriaCityScene", {
  username: GameState.player.username
});

// --------------------------
// Compiler input focus fix
// --------------------------
const codeInput = document.getElementById("player-code");

if (codeInput) {
  codeInput.addEventListener("focus", () => {
    game.input.keyboard.enabled = false;
  });

  codeInput.addEventListener("blur", () => {
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

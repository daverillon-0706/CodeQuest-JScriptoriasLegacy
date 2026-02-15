import GameState from "../GameState.js";
import { verifySaveToken } from "./saveToken.js";

export function importSaveFile(playerSprite = null) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";

  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const data = JSON.parse(event.target.result);

        // Verify token
        if (!verifySaveToken(data)) {
          alert("Invalid or tampered save file.");
          return;
        }

        // Apply payload to GameState
        GameState.player = data.payload;

        const gs = GameState.player;

        // Clamp HP & Energy
        gs.hp = Math.min(gs.hp, gs.max_hp);
        gs.energy = Math.min(gs.energy, gs.max_energy);

        // Update HUD if functions exist
        if (window.updateHearts) window.updateHearts(gs.hp, gs.max_hp ?? 12);
        if (window.updateEnergy) window.updateEnergy(gs.energy, gs.max_energy ?? 3);

        // Update player sprite position if provided
        if (playerSprite) {
          const pos = gs.worldState.position || { x: 100, y: 100 };
          playerSprite.setPosition(pos.x, pos.y);
        }

        console.log("[LoadFile] Player data loaded:", JSON.stringify(gs, null, 2));
        alert("Save Loaded Successfully!");

      } catch (err) {
        console.error("Failed to load save file", err);
        alert("Save file is corrupted.");
      }
    };

    reader.readAsText(file);
  };

  input.click();
}

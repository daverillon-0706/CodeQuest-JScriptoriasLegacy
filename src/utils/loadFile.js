import GameState from "../GameState.js";
import { verifySaveToken } from "./saveToken.js";
import { DEFAULT_PLAYER_TEMPLATE } from "../GameState.js";

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
        const raw = JSON.parse(event.target.result);

        // 🔐 Validate token
        if (!verifySaveToken(raw)) {
          alert("Invalid or tampered save file.");
          return;
        }

        const payload = raw.payload;

        // ✅ Merge with default to auto-migrate safely
        const safeSave = {
          ...DEFAULT_PLAYER_TEMPLATE,
          ...payload,

          items: {
            ...DEFAULT_PLAYER_TEMPLATE.items,
            ...(payload.items || {})
          },

          perks: {
            ...DEFAULT_PLAYER_TEMPLATE.perks,
            ...(payload.perks || {})
          },

          worldState: {
            ...DEFAULT_PLAYER_TEMPLATE.worldState,
            ...(payload.worldState || {}),

            questProgress: {
              ...DEFAULT_PLAYER_TEMPLATE.worldState.questProgress,
              ...(payload.worldState?.questProgress || {})
            }
          },

          lessonProgress: {
            ...DEFAULT_PLAYER_TEMPLATE.lessonProgress,
            ...(payload.lessonProgress || {})
          }
        };

        GameState.player = safeSave;

        // Save active slot
        localStorage.setItem("activeSaveFile", file.name);
        localStorage.setItem(file.name, event.target.result);

        const gs = GameState.player;

        gs.hp = Math.min(gs.hp, gs.max_hp);
        gs.energy = Math.min(gs.energy, gs.max_energy);

        // persist corrected stats
        GameState.player = gs;

        if (window.updateHearts) window.updateHearts(gs.hp, gs.max_hp);
        if (window.updateEnergy) window.updateEnergy(gs.energy, gs.max_energy);

        if (playerSprite) {
          const pos = {
            x: gs.worldState?.position?.x ?? 100,
            y: gs.worldState?.position?.y ?? 100
          };
          playerSprite.setPosition(pos.x, pos.y);
        };


        console.log("[LoadFile] Loaded safely:", gs);
        alert("Save Loaded Successfully!");

      } catch (err) {
        console.error("Save load failed", err);
        alert("Save file is corrupted.");
      }
    };

    reader.readAsText(file);
  };

  input.click();
}

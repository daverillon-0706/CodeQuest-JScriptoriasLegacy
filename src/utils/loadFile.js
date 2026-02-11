import GameState from "../GameState.js";
import { verifySaveToken } from "./saveToken.js";

export function importSaveFile() {

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
        console.log("[LoadFile] Imported JSON file:", JSON.stringify(data, null, 2));

        console.log("Imported File:", data);

        // Verify legitimacy
        if (!verifySaveToken(data)) {
          alert("Invalid or tampered save file.");
          return;
        }

        // Apply payload to GameState
        GameState.player = data.payload;
        console.log("[LoadFile] Player data after loading:", JSON.stringify(GameState.player, null, 2));

        console.log("Save Imported Successfully");

        alert("Save Loaded!");
        location.reload();

      } catch (err) {

        console.error("Invalid Save File", err);
        alert("Save file is corrupted.");

      }

    };

    reader.readAsText(file);
  };

  input.click();
}

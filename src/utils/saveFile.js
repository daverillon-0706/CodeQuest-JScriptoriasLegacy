import GameState from "../GameState.js";
import { addSaveToken } from "./saveToken.js";

export function exportSaveFile(filename = null) {
  const player = GameState.player;
  if (!player) return alert("No save data found.");

  const wrappedData = addSaveToken(player);
  const dataStr = JSON.stringify(wrappedData, null, 2);

  // ✅ Generate filename from player name
  if (!filename) {
    const rawName = player?.name || "player";

    // Sanitize name (no weird characters)
    const safeName = rawName
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase();

    filename = `${safeName}_codequest_save.json`;
  }

  // ✅ Save to localStorage active slot
  localStorage.setItem(filename, dataStr);
  localStorage.setItem("activeSaveFile", filename);

  console.log(`[SaveFile] Saved to active slot: ${filename}`);

  // ✅ Confirm save success
  alert(`✅ Game saved as "${filename}"`);

  // ✅ Optional download
  const download = confirm("Download a copy of this save file?");
  if (download) {
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);

    console.log("[SaveFile] Downloaded save copy.");
  }
}
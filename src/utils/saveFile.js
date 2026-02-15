import GameState from "../GameState.js";
import { addSaveToken } from "./saveToken.js";

export function exportSaveFile(filename = null) {
  const player = GameState.player;
  if (!player) return alert("No save data found.");

  const wrappedData = addSaveToken(player);
  const dataStr = JSON.stringify(wrappedData, null, 2);

  // Determine filename
  filename = filename || localStorage.getItem("activeSaveFile") || "codequest_save.json";

  // Save to localStorage active slot
  localStorage.setItem(filename, dataStr);
  localStorage.setItem("activeSaveFile", filename);

  console.log(`[SaveFile] Saved to active slot: ${filename}`);

  // Optional: trigger download if explicitly needed
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

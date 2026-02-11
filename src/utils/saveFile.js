import GameState from "../GameState.js";
import { addSaveToken } from "./saveToken.js";

export function exportSaveFile() {

  const player = GameState.player;

  console.log("Exporting Save:", player);

  if (!player) {
    alert("No save data found.");
    return;
  }

  // Wrap with legitimacy token
  const wrappedData = addSaveToken(player);
  console.log("[SaveFile] Exporting Save File JSON:", JSON.stringify(wrappedData, null, 2));

  const dataStr = JSON.stringify(wrappedData, null, 2);

  const blob = new Blob([dataStr], {
    type: "application/json"
  });

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "codequest_save.json";
  a.click();

  URL.revokeObjectURL(url);
}

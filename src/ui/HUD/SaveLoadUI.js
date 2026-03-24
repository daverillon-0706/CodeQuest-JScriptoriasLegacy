import { exportSaveFile } from "../../utils/saveFile";
import { importSaveFile } from "../../utils/loadFile";

export default class SaveLoadUI {
  attachEvents() {
    const saveBtn = document.getElementById("save-btn");
    const loadBtn = document.getElementById("load-btn");

    if (saveBtn && !saveBtn.dataset.listenerAdded) {
      saveBtn.dataset.listenerAdded = true;

      saveBtn.addEventListener("click", () => {
        console.log("[SaveLoadUI] Save clicked");
        exportSaveFile();
      });
    }

    if (loadBtn && !loadBtn.dataset.listenerAdded) {
      loadBtn.dataset.listenerAdded = true;

      loadBtn.addEventListener("click", () => {
        console.log("[SaveLoadUI] Load clicked");
        importSaveFile();
      });
    }
  }
}
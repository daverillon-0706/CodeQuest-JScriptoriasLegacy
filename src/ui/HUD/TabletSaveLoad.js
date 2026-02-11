// src/ui/TabletSaveLoad.js

import { importSaveFile } from "../../utils/loadFile";
import { exportSaveFile } from "../../utils/saveFile";

window.addEventListener("DOMContentLoaded", () => {

  const saveBtn = document.getElementById("save-btn");
  const loadBtn = document.getElementById("load-btn");

  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      exportSaveFile();
    });
  }

  if (loadBtn) {
    loadBtn.addEventListener("click", () => {
      importSaveFile();
    });
  }

});

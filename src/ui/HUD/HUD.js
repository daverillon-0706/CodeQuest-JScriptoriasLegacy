// src/ui/HUD/HUD.js
import { PassivePerks, OffensePerks, DefensePerks } from "../data/perkData.js";
import { syncInventory } from "../../utils/syncInventory.js";
import CodexUI from "./CodexUI.js";
import InventoryUI from "./InventoryUI.js";
import QuestsUI from "./QuestsUI.js";
import CompilerUI from "./CompilerUI.js";
import LessonsUI from "./LessonsUI.js";
import GameState from "../../GameState.js";
import PerksManager from "../../systems/PerksManager.js";

export default class HUD {
  constructor() {
  this.cacheElements();

  // Initialize App UIs
  this.codex = new CodexUI();
  this.inventory = new InventoryUI(); // ✅ initialize once
  this.quests = new QuestsUI();
  this.compiler = new CompilerUI();
  this.lessons = new LessonsUI();

  // Optional: sync inventory once at startup
  syncInventory();

  this.bubbleInterval = null;
  this.selectedPerk = null;

  this.attachEvents();
  this.attachCompilerEvents();

  window.hud = this;

  this.updateHUD();
  
  window.addEventListener("gamestate-updated", () => {
  syncInventory();
  if (document.getElementById("app-inventory")?.classList.contains("active")) {
    this.inventory.loadInventory(); // refresh UI instead of new InventoryUI()
  }
});
}

  // -------------------------
  // DOM CACHE
  // -------------------------
  cacheElements() {
    this.playerBtn = document.getElementById("tablet-open-btn");
    this.overlay = document.getElementById("tablet-overlay");
    this.tablet = document.getElementById("tablet-hud");
    this.closeBtn = document.getElementById("tablet-close");
    this.backBtn = document.getElementById("tablet-back");
    this.tabletTitle = document.getElementById("tablet-title");
    
    this.perkDetailIcon = document.getElementById("perk-detail-icon");
this.perkDetailName = document.getElementById("perk-detail-name");
this.perkDetailDesc = document.getElementById("perk-detail-desc");
this.perkEquipBtn = document.getElementById("perk-equip-btn");
this.perkUnequipBtn = document.getElementById("perk-unequip-btn");



    this.quickInv = document.getElementById("quick-inv");
    this.quickQuests = document.getElementById("quick-quests");
    this.quickCodex = document.getElementById("quick-codex");
    this.quickCompiler = document.getElementById("quick-compiler");

    this.compilerBubble = document.getElementById("compiler-output-box");
  }

  // =========================================================
  // ❤️ HEART RENDERER
  // =========================================================
  renderHearts(hp, maxHp) {
    const container = document.getElementById("hearts-container");
    if (!container) return;

    container.innerHTML = "";

    for (let i = 0; i < maxHp; i++) {
      const heart = document.createElement("img");

      heart.src =
        i < hp
          ? "/public/assets/ui/heart_full.png"
          : "/public/assets/ui/heart_empty.png";

      heart.className = "heart-icon";
      heart.style.imageRendering = "pixelated";

      container.appendChild(heart);
    }
  }

  // =========================================================
  // ⚡ ENERGY RENDERER
  // =========================================================
  renderEnergy(energy, maxEnergy) {
    const container = document.getElementById("energy-container");
    if (!container) return;

    container.innerHTML = "";

    for (let i = 0; i < maxEnergy; i++) {
      const orb = document.createElement("img");

      orb.src =
        i < energy
          ? "/public/assets/ui/energy_full.png"
          : "/public/assets/ui/energy_empty.png";

      orb.className = "energy-icon";
      orb.style.imageRendering = "pixelated";

      container.appendChild(orb);
    }
  }
  // -------------------------
  // HUD UPDATE (SAFE)
  // -------------------------
  updateHUD() {
  const player = GameState.player;
    if (!player) return;

    const { hp, max_hp, energy, max_energy, cryptos } = player;

    // -------------------------
    // TEXT VALUES
    // -------------------------
    document.getElementById("playerHP-text") &&
      (document.getElementById("playerHP-text").textContent = hp);

    document.getElementById("playerEnergy-text") &&
      (document.getElementById("playerEnergy-text").textContent = energy);

    document.getElementById("cryptos-count") &&
      (document.getElementById("cryptos-count").textContent = cryptos);

    // -------------------------
    // SPRITE RENDERING
    // -------------------------
    this.renderHearts(hp, max_hp);
    this.renderEnergy(energy, max_energy);


  // --------------------------
    // QUICK SLOT ICONS
    // --------------------------
    const slots = ["passive", "offense", "defense"];

    slots.forEach((slot) => {
      const iconImg = document.querySelector(
        `.quick-slot.${slot} .perk-icon img`
      );
      if (!iconImg) return;

      const perkId = GameState.player.perks[slot];

      iconImg.src = perkId
        ? `/public/assets/icons/buffs/${perkId}.png`
        : "/public/assets/icons/empty-slot.png";
    });

  document.querySelectorAll(".quick-slot").forEach((slotEl) => {
  slotEl.addEventListener("click", () => {
    const type = slotEl.classList.contains("passive")
      ? "passive"
      : slotEl.classList.contains("offense")
      ? "offense"
      : "defense";

    const perkId = GameState.player.perks[type];
    if (!perkId) return;

    if (type === "passive") {
      // maybe just show details or info
      const perkData = PassivePerks[perkId];
      this.showPerkDetails({ id: perkId, type, ...perkData });
    } else if (type === "offense") {
      PerksManager.activateOffense(perkId);
    } else if (type === "defense") {
      PerksManager.activateDefense(perkId);
    }

    this.updateHUD(); // refresh cooldowns / energy
  });
});
}
  // -------------------------
  // EVENTS
  // -------------------------
  attachEvents() {
    // Tablet toggle
    this.playerBtn?.addEventListener("click", () =>
      this.overlay?.classList.contains("hidden")
        ? this.openTablet()
        : this.closeTablet()
    );

    this.closeBtn?.addEventListener("click", () => this.closeTablet());
    this.backBtn?.addEventListener("click", () => this.closeAllApps());

    this.overlay?.addEventListener("click", e => {
      if (e.target === this.overlay) this.closeTablet();
    });

    document.addEventListener("keydown", e => {
      if (e.key === "Escape") this.closeTablet();
    });

    // Quick apps
    this.quickInv?.addEventListener("click", () =>
      this.quickOpen("app-inventory")
    );
    this.quickQuests?.addEventListener("click", () =>
      this.quickOpen("app-quests")
    );
    this.quickCodex?.addEventListener("click", () => {
      this.quickOpen("app-codex");
      this.codex?.loadCodexList();
    });
    this.quickCompiler?.addEventListener("click", () =>
      this.quickOpen("app-compiler")
    );


    //For initializing the Equip and Unequip function
    this.perkEquipBtn?.addEventListener("click", () => {
  if (!this.selectedPerk) return;

  PerksManager.equip(this.selectedPerk);
  this.updateHUD();
  this.renderTabletPerks();
  this.showPerkDetails(this.selectedPerk);
});

this.perkUnequipBtn?.addEventListener("click", () => {
  if (!this.selectedPerk) return;

  PerksManager.unequip(this.selectedPerk.type);
  this.updateHUD();
  this.renderTabletPerks();
  this.showPerkDetails(this.selectedPerk);
});


    // App icons
    document.querySelectorAll(".app-icon").forEach(icon => {
      icon.addEventListener("click", () => {
        const appId = icon.dataset.app;
        this.openApp(appId);

        if (appId === "app-codex") this.codex.loadCodexList("stories");
        if (appId === "app-lessons") this.lessons.loadCategories();
      });
    });
  }

  attachCompilerEvents() {
    document.addEventListener("compiler-output", e => {
      const text = e.detail?.text ?? "";
      this.showCompilerBubble(text);
      this.closeTablet();
      setTimeout(() => this.openTablet(), 6000);
    });
  }

  // -------------------------
  // COMPILER BUBBLE
  // -------------------------
  showCompilerBubble(text) {
    if (!this.compilerBubble) return;

    this.compilerBubble.textContent = text;
    this.compilerBubble.classList.remove("hidden");

    if (this.bubbleInterval) clearInterval(this.bubbleInterval);

    const updatePosition = () => {
      const player = GameState.player;
      const canvas = document.querySelector("canvas");
      if (!player || !canvas) return;

      const rect = canvas.getBoundingClientRect();
      this.compilerBubble.style.left = rect.left + (player.x ?? 0) + "px";
      this.compilerBubble.style.top = rect.top + (player.y ?? 0) - 50 + "px";
    };

    updatePosition();
    this.bubbleInterval = setInterval(updatePosition, 16);

    setTimeout(() => {
      this.compilerBubble.classList.add("hidden");
      clearInterval(this.bubbleInterval);
    }, 6000);
  }

  // -------------------------
  // TABLET
  // -------------------------
  openTablet() {
    this.overlay?.classList.remove("hidden");
    this.renderTabletPerks();
  }

  closeTablet() {
    this.overlay?.classList.add("hidden");
    this.closeAllApps();
  }

  closeAllApps() {
    document.querySelectorAll(".app-window, .tablet-panel").forEach(w => {
      w.classList.add("hidden");
      w.classList.remove("active");
    });

    this.tabletTitle && (this.tabletTitle.textContent = "Tablet Home");
    this.backBtn?.classList.add("hidden");
    document.getElementById("tablet-home")?.classList.remove("hidden");
  }

  openApp(appId) {
  this.closeAllApps();

  const win = document.getElementById(appId);
  if (!win) return;

  // =========================
  // INVENTORY LOAD PIPELINE
  // =========================
  if (appId === "app-inventory") {

    syncInventory(); // update UI state from GameState
    this.inventory.loadInventory(); // refresh the grid instead of creating new instance;

    console.log(
      "[HUD] Inventory synced & loaded"
    );
  }

  // =========================

  win.classList.remove("hidden");
  win.classList.add("active");

  this.tabletTitle.textContent =
    win.querySelector("h3")?.textContent || "App";

  this.backBtn?.classList.remove("hidden");
  document
    .getElementById("tablet-home")
    ?.classList.add("hidden");
}


  quickOpen(appId) {
    this.openTablet();
    setTimeout(() => this.openApp(appId), 10);
  }

 // -------------------------
// PERKS TABLET
// -------------------------
renderTabletPerks() {
  console.log("[HUD] Rendering tablet perks");

  const passiveList = document.getElementById("perk-passive-list");
  const offenseList = document.getElementById("perk-offense-list");
  const defenseList = document.getElementById("perk-defense-list");

  if (!passiveList || !offenseList || !defenseList) return;

  // Clear existing list
  passiveList.innerHTML = "";
  offenseList.innerHTML = "";
  defenseList.innerHTML = "";

  // Helper to create a perk item
  const createPerkItem = (perk, id, type) => {
    const item = document.createElement("div");
    item.className = "perk-item";

    const icon = document.createElement("img");
    icon.src = `/public/assets/icons/buffs/${id}.png`;
    icon.alt = perk.name;
    icon.className = "perk-icon";
    icon.style.imageRendering = "pixelated";

    const info = document.createElement("div");
    info.className = "perk-info";

    const name = document.createElement("div");
    name.className = "perk-name";
    name.textContent = perk.name;

    const desc = document.createElement("div");
    desc.className = "perk-desc";
    desc.textContent = perk.desc ?? perk.description ?? "";

    info.append(name, desc);
    item.append(icon, info);

    // Clicking the perk shows details on the right
    item.addEventListener("click", () => {
      this.showPerkDetails({ id, type, ...perk });
    });

    return item;
  };

  // Populate Passive perks
  Object.entries(PassivePerks).forEach(([id, perk]) => {
    passiveList.appendChild(createPerkItem(perk, id, "passive"));
  });

  // Populate Offense perks
  Object.entries(OffensePerks).forEach(([id, perk]) => {
    offenseList.appendChild(createPerkItem(perk, id, "offense"));
  });

  // Populate Defense perks
  Object.entries(DefensePerks).forEach(([id, perk]) => {
    defenseList.appendChild(createPerkItem(perk, id, "defense"));
  });
}



showPerkDetails(perk) {
  console.log("[HUD] showPerkDetails:", perk);
  this.selectedPerk = perk;

  const icon = document.getElementById("perk-detail-icon");
  const name = document.getElementById("perk-detail-name");
  const desc = document.getElementById("perk-detail-desc");
  const equipBtn = document.getElementById("perk-equip-btn");
  const unequipBtn = document.getElementById("perk-unequip-btn");

  icon.src = `/public/assets/icons/buffs/${perk.id}.png`;
  icon.style.imageRendering = "pixelated";

  name.textContent = perk.name;
  desc.textContent = perk.desc ?? perk.description ?? "";

  const equipped = PerksManager.isEquipped(perk.id);

  equipBtn.disabled = equipped;
  unequipBtn.disabled = !equipped;

  // Equip button
  equipBtn.onclick = () => {
    console.log("[HUD] Equip clicked:", perk.id);
    PerksManager.equip(perk);
    this.updateHUD();          // refresh Quick Access slots
    this.renderTabletPerks();  // refresh the perk list
    this.showPerkDetails(perk); // refresh details panel
  };

  // Unequip button
  unequipBtn.onclick = () => {
    console.log("[HUD] Unequip clicked:", perk.type);
    PerksManager.unequip(perk.type);
    this.updateHUD();
    this.renderTabletPerks();
    this.showPerkDetails(perk);
  };
}




}




// -------------------------
// INIT
// -------------------------
document.addEventListener("DOMContentLoaded", () => {
  try {
    new HUD();
  } catch (e) {
    console.error("[HUD] Init failed", e);
  }
});

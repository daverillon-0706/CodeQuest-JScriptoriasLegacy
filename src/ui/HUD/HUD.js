// src/ui/HUD/HUD.js
import { PassivePerks, OffensePerks, DefensePerks } from "../data/perkData.js"
import { syncInventory } from "../../utils/syncInventory.js";
import CodexUI from "./CodexUI.js";
import InventoryUI from "./InventoryUI.js";
import QuestsUI from "./QuestsUI.js";
import CompilerUI from "./CompilerUI.js";
import LessonsUI from "./LessonsUI.js";
import GameState from "../../GameState.js";
import PerksManager from "../../systems/PerksManager.js";
import ConsumablesManager from "../../systems/ConsumablesManager.js";
import TutorialUI from "./TutorialUI.js";

export default class HUD {
  constructor() {
    this.cacheElements();

    // Initialize App UIs
    this.codex = new CodexUI();
    this.inventory = new InventoryUI(); // ✅ initialize once
    this.quests = new QuestsUI();
    this.compiler = new CompilerUI();
    this.lessons = new LessonsUI();
    this.guideSections = [
      { title: "About the Game", text: "CodeQuest is a game where you explore, learn, and fight bugs." },
      { title: "Player", text: "Basic movement: arrow keys or WASD to move." },
      { title: "Weapon", text: "Shoot with the SPACE bar." },
      { title: "Characters", text: "NPCs: interact using Z." },
      { title: "Enemies", text: "The bugs attack when you enter their range." },
      { title: "Compiler", text: "Appears during rift challenges and quizzes to run code." },
      { title: "HP, Energy & Cryptos", text: "HP = Health, Energy = Ability resource, Cryptos = Currency." },
      { title: "Tablet", text: "Use the tablet to manage inventory, quests, perks, and more." },
      { title: "Lessons", text: "Lessons are found in houses. You cannot skip them." },
      { title: "Quizzes", text: "Quizzes unlock after completing lessons inside houses." },
      { title: "Monolith & Kiosks", text: "Monoliths summon rifts. Kiosks activate them." },
      { title: "Rifts", text: "Invincible bugs that contain coding challenges required for progression." }
    ];

    this.currentGuideIndex = 0;

    // Optional: sync inventory once at startup
    syncInventory();

    this.bubbleInterval = null;
    this.selectedPerk = null;

    this.attachEvents();
    this.attachCompilerEvents();

    window.hud = this;

    this.updateHUD();
    document.querySelectorAll(".quick-slot").forEach((slotEl) => {
      if (slotEl.dataset.listenerAdded) return; // prevent duplicates
      slotEl.dataset.listenerAdded = true;

      slotEl.addEventListener("click", () => {
        const type = slotEl.classList.contains("passive")
          ? "passive"
          : slotEl.classList.contains("offense")
            ? "offense"
            : slotEl.classList.contains("item")
              ? "consumable"
              : "defense";

        const player = GameState.player;
        const playerPerks = player?.perks ?? {};
        const activePerks = player?.activePerks ?? {};

        switch (type) {
          case "passive": {
            const perkId = playerPerks.passive;
            if (!perkId) return;

            const perkData = PassivePerks[perkId];
            if (!perkData) return;

            this.showPerkDetails({ id: perkId, type, ...perkData });
            break;
          }

          case "offense": {
            const perkId = playerPerks.offense;
            if (!perkId) return;

            // Activate if not already active
            if (!activePerks[perkId]) {
              PerksManager.activateOffense(perkId);
            }
            break;
          }

          case "defense": {
            const perkId = playerPerks.defense;
            if (!perkId) return;

            if (!activePerks[perkId]) {
              PerksManager.activateDefense(perkId);
            }
            break;
          }

          case "consumable": {

            const consumableId = slotEl.dataset.id;
            if (!consumableId) return;

            const scene = window.currentScene;
            const itemName = inventoryData?.cons?.[consumableId]?.name ?? "Item";

            const result = ConsumablesManager.use(consumableId, scene);

            if (result.success) {

              syncInventory();
              alert(`✅ Used ${itemName}`);
              this.updateHUD();

            } else {

              if (result.reason === "blocked") {
                alert(`⚠ ${itemName} cannot be used because HP/Energy is full.`);
              }

              else if (result.reason === "no_item") {
                alert(`❌ No ${itemName} left!`);
              }

            }

            break;
          }

          default:
            console.warn("Unknown quick-slot type:", type);
        }
      });
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

    console.log("Rendering hearts:", hp, "/", maxHp);

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
    console.log("HUD UPDATE CALLED");
    console.log("GameState.player =", GameState.player);
    const player = GameState.player;
    if (!player) return;
    console.log("HUD synced from:", player);
    console.log("Sprite customData:", this.player?.customData);

    const hp = player.hp ?? 0;
    const max_hp = player.max_hp ?? 0;
    const energy = player.energy ?? 0;
    const max_energy = player.max_energy ?? 0;
    const cryptos = player.cryptos ?? 0;

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
    // QUICK SLOT ICONS: PERKS
    // --------------------------
    const perkSlots = ["passive", "offense", "defense"];
    perkSlots.forEach((slot) => {
      const perkId = player.perks[slot];
      const iconImg = document.querySelector(`.quick-slot.${slot} .perk-icon img`);
      if (!iconImg) return;

      iconImg.src = perkId
        ? `/public/assets/icons/buffs/${perkId}.png`
        : "/public/assets/icons/empty-slot.png";

      // Highlight if currently active
      if (perkId && player.activePerks[perkId]) {
        iconImg.classList.add("active-perk");
      } else {
        iconImg.classList.remove("active-perk");
      }
    });


    // --------------------------
    // QUICK SLOT ICONS: CONSUMABLES
    // --------------------------
    const quickConsumables = player.perks.consumables;
    quickConsumables.forEach((id, index) => {
      const slot = document.querySelector(`.quick-slot.item[data-slot="item-${index + 1}"]`);
      if (!slot) return;

      slot.dataset.id = id ?? "";
      const img = slot.querySelector('.perk-icon img');
      img.src = id ? `/public/assets/icons/item/consumables/${id}.png` : "";
    });

    // --------------------------
    // QUICK SLOT CLICK HANDLERS
    // --------------------------




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

    const prevBtn = document.getElementById("tutorial-prev");
    const nextBtn = document.getElementById("tutorial-next");

    prevBtn?.addEventListener("click", () => {
      if (this.currentGuideIndex > 0) {
        this.loadGuide(this.currentGuideIndex - 1);
      }
    });

    nextBtn?.addEventListener("click", () => {
      if (this.currentGuideIndex < this.guideSections.length - 1) {
        this.loadGuide(this.currentGuideIndex + 1);
      }
    });

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
        if (appId === "app-tutorial") {
          this.loadGuide(0);
        }
        if (appId === "app-logout") {
          this.handleLogout();
          return;
        }
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

  loadGuide(index = 0) {
    const container = document.getElementById("tutorial-content");
    if (!container) return;

    this.currentGuideIndex = index;

    const section = this.guideSections[index];
    if (!section) return;

    container.innerHTML = `
    <h4>${section.title}</h4>
    <p>${section.text}</p>
  `;

    const prevBtn = document.getElementById("tutorial-prev");
    const nextBtn = document.getElementById("tutorial-next");

    if (prevBtn) prevBtn.disabled = index === 0;
    if (nextBtn) nextBtn.disabled = index === this.guideSections.length - 1;
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

  // -------------------------
  // ENABLE / DISABLE PERK BUTTONS
  // -------------------------
  disablePerkButton(perkId) {
    const btns = [this.perkEquipBtn, this.perkUnequipBtn];
    btns.forEach(btn => {
      if (!btn) return;
      if (this.selectedPerk?.id === perkId) btn.disabled = true;
    });
  }

  enablePerkButton(perkId) {
    const btns = [this.perkEquipBtn, this.perkUnequipBtn];
    btns.forEach(btn => {
      if (!btn) return;
      if (this.selectedPerk?.id === perkId) btn.disabled = false;
    });
  }

  handleLogout() {
    if (!confirm("Are you sure you want to logout?")) return;

    // Clear saved session using GameState
    if (window.GameState?.logout) {
      window.GameState.logout();
    }

    // Redirect to login page
    window.location.href = "index.html";
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
window.addEventListener("gamestate-updated", () => {
  syncInventory();

  const hud = window.hud;
  if (!hud) return;

  if (document.getElementById("app-inventory")?.classList.contains("active")) {
    hud.inventory.loadInventory();
  }

  hud.updateHUD();
});

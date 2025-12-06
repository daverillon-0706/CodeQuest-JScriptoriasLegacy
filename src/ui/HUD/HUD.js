// src/ui/HUD/HUD.js
import CodexUI from "./CodexUI.js";
import InventoryUI from "./InventoryUI.js";
import QuestsUI from "./QuestsUI.js";
import CompilerUI from "./CompilerUI.js";
import GameState from "../../GameState.js";
import LessonsUI from "./LessonsUI.js";

export default class HUD {
  constructor() {
    // Cached DOM elements
    this.cacheElements();

    // App UIs
    this.codex = new CodexUI();
    this.inventory = new InventoryUI();
    this.quests = new QuestsUI();
    this.compiler = new CompilerUI();
    this.lessons = new LessonsUI();

    // Compiler bubble tracking
    this.bubbleInterval = null;

    // Attach events
    this.attachEvents();
    this.attachCompilerEvents();

    // Global reference
    window.hud = this;
  }

  // -------------------------
  // DOM ELEMENTS
  // -------------------------
  cacheElements() {
    this.playerBtn = document.getElementById('player-icon-btn');
    this.overlay = document.getElementById('tablet-overlay');
    this.tablet = document.getElementById('tablet-hud');
    this.closeBtn = document.getElementById('tablet-close');
    this.backBtn = document.getElementById('tablet-back');
    this.tabletTitle = document.getElementById('tablet-title');

    this.quickInv = document.getElementById('quick-inv');
    this.quickQuests = document.getElementById('quick-quests');
    this.quickCodex = document.getElementById('quick-codex');
    this.quickCompiler = document.getElementById('quick-compiler');

    this.compilerBubble = document.getElementById('compiler-output-box');
  }

  // -------------------------
  // EVENT LISTENERS
  // -------------------------
  attachEvents() {
    this.playerBtn?.addEventListener('click', () =>
      this.overlay.classList.contains('hidden')
        ? this.openTablet()
        : this.closeTablet()
    );

    this.backBtn?.addEventListener('click', () => this.closeAllApps());
    this.closeBtn?.addEventListener('click', () => this.closeTablet());

    this.overlay?.addEventListener('click', e => {
      if (e.target === this.overlay) this.closeTablet();
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') this.closeTablet();
    });

    this.quickInv?.addEventListener('click', () => this.quickOpen('app-inventory'));
    this.quickQuests?.addEventListener('click', () => this.quickOpen('app-quests'));
    this.quickCodex?.addEventListener('click', () => {
      this.quickOpen('app-codex');
      this.codex?.loadCodexList();
    });
    this.quickCompiler?.addEventListener('click', () => this.quickOpen('app-compiler'));

    document.querySelectorAll('.app-icon').forEach(icon => {
      icon.addEventListener('click', () => {
        const appId = icon.dataset.app;
        this.openApp(appId);
        if (appId === "app-codex") this.codex.loadCodexList('stories');

        if (appId === "app-lessons") {
      this.lessons.loadCategories();
    }
      });
    });
  }

  attachCompilerEvents() {
    document.addEventListener("compiler-output", e => {
      const text = e.detail.text;
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

    // Clear previous interval
    if (this.bubbleInterval) clearInterval(this.bubbleInterval);

    const updatePosition = () => {
      const player = GameState.player;
      const canvas = document.querySelector('canvas');
      if (!player || !canvas) return;

      const rect = canvas.getBoundingClientRect();
      this.compilerBubble.style.left = rect.left + player.x + 'px';
      this.compilerBubble.style.top = rect.top + player.y - 50 + 'px';
    };

    updatePosition();
    this.bubbleInterval = setInterval(updatePosition, 16);

    setTimeout(() => {
      this.compilerBubble.classList.add("hidden");
      if (this.bubbleInterval) clearInterval(this.bubbleInterval);
    }, 6000);
  }

  // -------------------------
  // TABLET LOGIC
  // -------------------------
  openTablet() {
    this.overlay.classList.remove('hidden');
  }

  closeTablet() {
    this.overlay.classList.add('hidden');
    this.closeAllApps();
  }

  closeAllApps() {
    document.querySelectorAll('.app-window, .tablet-panel').forEach(w => {
      w.classList.add('hidden');
      w.classList.remove('active');
    });
    this.tabletTitle.textContent = 'Tablet Home';
    this.backBtn.classList.add('hidden');
    document.getElementById('tablet-home')?.classList.remove('hidden');
  }

  openApp(appId, title = null) {
    this.closeAllApps();

    const win = document.getElementById(appId);
    if (!win) return;

    win.classList.remove('hidden');
    win.classList.add('active');
    this.tabletTitle.textContent = title || win.querySelector('h3')?.textContent || 'App';
    this.backBtn.classList.remove('hidden');
    document.getElementById('tablet-home')?.classList.add('hidden');
  }

  quickOpen(appId) {
    this.openTablet();
    setTimeout(() => this.openApp(appId), 10);
  }

}

// -------------------------
// GLOBAL HUD
// -------------------------
document.addEventListener('DOMContentLoaded', () => {
  new HUD();
});

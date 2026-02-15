const STORAGE_KEY = "codequest-player";

// =========================
// DEFAULT DATA ONLY
// =========================
const DEFAULT_PLAYER = {
  saveVersion: 2,

  // Identity (add these too)
  name: "",
  token: "",

  // Starting stats (match new player)
  hp: 3,
  max_hp: 3,
  energy: 10,
  max_energy: 10,
  cryptos: 0,

  perks: {
    passive: null,
    offense: null,
    defense: null,
    consumables: [null, null]
  },

  perkInventory: [],

  items: {
    keyItems: [],
    consumables: []
  },

  lessonsUnlocked: [],

  codexProgress: {
    enemiesScanned: [],
    loreUnlocked: []
  },

  worldState: {
    chestsOpened: [],
    questsCompleted: [],
    position: { x: 100, y: 100 }
  }
};


const GameState = {

  // =========================
  // LOAD
  // =========================
  get player() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored);

    return {
      ...DEFAULT_PLAYER,
      ...parsed,
      items: {
        ...DEFAULT_PLAYER.items,
        ...(parsed.items || {})
      },
      worldState: {
        ...DEFAULT_PLAYER.worldState,
        ...(parsed.worldState || {})
      }
    };
  },

  // =========================
  // SAVE
  // =========================
  set player(value) {
    if (!value) {
      localStorage.removeItem(STORAGE_KEY);
      console.log("[GameState] Player cleared");
      return;
    }

    const toStore = {
      saveVersion: value.saveVersion ?? 2,
      hp: value.hp ?? 5,
      max_hp: value.max_hp ?? 5,
      energy: value.energy ?? 3,
      max_energy: value.max_energy ?? 3,
      cryptos: value.cryptos ?? 0,
      perks: value.perks ?? DEFAULT_PLAYER.perks,
      perkInventory: value.perkInventory ?? [],
      items: value.items ?? DEFAULT_PLAYER.items,
      lessonsUnlocked: value.lessonsUnlocked ?? [],
      codexProgress: value.codexProgress ?? DEFAULT_PLAYER.codexProgress,
      worldState: value.worldState ?? DEFAULT_PLAYER.worldState
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    
    window.dispatchEvent(
    new CustomEvent("gamestate-updated", { detail: toStore})
    );

    console.log("[GameState] Saved player data:", JSON.stringify(toStore, null, 2));
  },

  // =========================
  // LOGOUT
  // =========================
  logout() {
    localStorage.removeItem(STORAGE_KEY);
  }
};

export default GameState;

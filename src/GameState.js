const STORAGE_KEY = "codequest-player";

// =========================
// DEFAULT DATA ONLY
// =========================
const DEFAULT_PLAYER = {
  saveVersion: 2,

  hp: 5,
  max_hp: 5,
  energy: 3,
  max_energy: 3,
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
    questsCompleted: []
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
    }
  };
},

// =========================
// SAVE (FILTERED)
// =========================
set player(value) {
  if (!value) {
    localStorage.removeItem(STORAGE_KEY);
    console.log("[GameState] Player cleared");
    return;
  }

  // 🔥 Only store serializable fields
  const toStore = {

    saveVersion: value.saveVersion ?? 2,

    hp: value.hp ?? 5,
    max_hp: value.max_hp ?? 5,
    energy: value.energy ?? 3,
    max_energy: value.max_energy ?? 3,
    cryptos: value.cryptos ?? 0,

    perks: value.perks ?? {
      passive: null,
      offense: null,
      defense: null,
      consumables: [null, null]
    },

    perkInventory: value.perkInventory ?? [],

    items: value.items ?? {
      keyItems: [],
      consumables: []
    },

    lessonsUnlocked: value.lessonsUnlocked ?? [],

    codexProgress: value.codexProgress ?? {
      enemiesScanned: [],
      loreUnlocked: []
    },

    worldState: value.worldState ?? {
      chestsOpened: [],
      questsCompleted: []
    }
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
  console.log("[GameState] Saved player data:", JSON.stringify(toStore, null, 2));
},

// =========================
// SAFE UPDATE
// =========================
updatePlayer(mutator) {
  const player = this.player || { ...DEFAULT_PLAYER };

  mutator(player);

  this.player = player;
},

logout() {
  localStorage.removeItem(STORAGE_KEY);
}

};

export default GameState;

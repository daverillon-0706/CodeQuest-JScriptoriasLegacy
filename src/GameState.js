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

  activePerks:{},
  effects:{},
  perkInventory: [],

  items: {
    keyItems: [],
    consumables: []
  },

  lessonsUnlocked: [],

  codexProgress: {
    enemiesScanned: [],
    loreUnlocked: [],
    unlockedLessons: []
  },

  worldState: {
    chestsOpened: [],
    questsCompleted: [],
    position: { x: 100, y: 100 }
  },

  riftProgress: {

  },
  lessonProgress:{

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

    perks: {
      ...DEFAULT_PLAYER.perks,
      ...(parsed.perks || {})
    },

    items: {
      ...DEFAULT_PLAYER.items,
      ...(parsed.items || {})
    },

    worldState: {
      ...DEFAULT_PLAYER.worldState,
      ...(parsed.worldState || {})
    },
    lessonProgress: {
      ...DEFAULT_PLAYER.lessonProgress,
      ...(parsed.lessonProgress || {})
    },

    codexProgress: {
  ...DEFAULT_PLAYER.codexProgress,
  ...(parsed.codexProgress || {})
    },
    // 🔥 ADD THESE
    activePerks: {
      ...DEFAULT_PLAYER.activePerks,
      ...(parsed.activePerks || {})
    },

    effects: {
      ...DEFAULT_PLAYER.effects,
      ...(parsed.effects || {})
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
  activePerks: value.activePerks ?? {},   // 🔥 ADD
  effects: value.effects ?? {},           // 🔥 ADD

  perkInventory: value.perkInventory ?? [],
  items: value.items ?? DEFAULT_PLAYER.items,
  lessonsUnlocked: value.lessonsUnlocked ?? [],
  codexProgress: {
  enemiesScanned: value.codexProgress?.enemiesScanned ?? [],
  loreUnlocked: value.codexProgress?.loreUnlocked ?? [],
  unlockedLessons: value.codexProgress?.unlockedLessons ?? []
},
  worldState: value.worldState ?? DEFAULT_PLAYER.worldState,
  riftProgress: value.riftProgress ?? {},
  lessonProgress: value.lessonProgress ?? {}
};

    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    
    window.dispatchEvent(
    new CustomEvent("gamestate-updated", { detail: toStore})
    );

    window.addEventListener("gamestate-updated", (e) => {
  const player = e.detail;

  updateHearts(player.hp, player.max_hp);
  updateEnergy(player.energy, player.max_energy);
  updateCryptos(player.cryptos);
});


    console.log("[GameState] Saved player data:", JSON.stringify(toStore, null, 2));
  },

  // =========================
  // LOGOUT
  // =========================
  logout() {
    localStorage.removeItem(STORAGE_KEY);
  },

  // =========================
// KEY ITEMS
// =========================

// Get all collected key items
getKeyItems(type = null) {
  const items = this.player?.items?.keyItems ?? [];

  if (!type) return items;

  return items.filter(id => id.startsWith(type));
},

// Check if player has a key item
hasKeyItem(id) {
  return this.getKeyItems().includes(id);
},

// Get next required key item
getNextKeyItem(KEY_ITEM_ORDER) {
  const owned = this.getKeyItems();
  return KEY_ITEM_ORDER[owned.length] ?? null;
},

// Add key item (ordered)
addKeyItem(id, ORDER) {
  const player = this.player;
  if (!player) return;

  player.items.keyItems = player.items.keyItems || [];

  const owned = player.items.keyItems;

  if (owned.includes(id)) {
    console.log("[KeyItem] Already owned:", id);
    return;
  }

  // Determine correct order based on filtered items of same type
  const type = id.startsWith("keycard") ? "keycard" : "keystone";
  const sameTypeOwned = owned.filter(i => i.startsWith(type));

  const expected = ORDER[sameTypeOwned.length];

  if (id !== expected) {
    console.warn(
      `[KeyItem] Cannot collect ${id}. Expected: ${expected}`
    );
    return;
  }

  owned.push(id);

  this.player = player;
  console.log("[KeyItem] Collected:", id);
},

addConsumable(id, amount = 1) {
    const player = this.player;
    if (!player) return;

    player.items = player.items || {};
    player.items.consumables = player.items.consumables || [];

    const existing = player.items.consumables.find(c => c.id === id);
    if (existing) {
      existing.amount += amount;
    } else {
      player.items.consumables.push({ id, amount });
    }

    this.player = player; // trigger save & events
  },

  useConsumable(id, amount = 1) {
    const player = this.player;
    if (!player?.items?.consumables) return false;

    const consumable = player.items.consumables.find(c => c.id === id);
    if (!consumable || consumable.amount < amount) return false;

    consumable.amount -= amount;
    if (consumable.amount <= 0) {
      // remove from inventory
      player.items.consumables = player.items.consumables.filter(c => c.id !== id);
    }

    this.player = player; // trigger save & events
    return true;
  },

  // =========================
// LESSON PROGRESSION
// =========================

getLessonProgress(category) {
  const player = this.player;
  if (!player) return null;

  player.lessonProgress = player.lessonProgress || {};

  if (!player.lessonProgress[category]) {
    player.lessonProgress[category] = {
      booksRead: {},         // use object for mapping like your save
      quizCompleted: false,  // match the key used everywhere
      keycardRewarded: false
    };

    this.player = player;
}

  return player.lessonProgress[category];
},

markLessonRead(category, lessonId) {
  const player = this.player;
  if (!player) return;

  const progress = this.getLessonProgress(category);

  if (!progress.booksRead[lessonId]) {
    progress.booksRead[lessonId] = true;
    this.player = player;
  }
},

hasReadLesson(category, lessonId) {
  const progress = this.getLessonProgress(category);
  return progress?.booksRead.includes(lessonId);
},

markQuizPassed(category) {
  const player = this.player;
  if (!player) return;

  const progress = this.getLessonProgress(category);
  progress.quizCompleted = true;

  this.player = player;
},

hasPassedQuiz(category) {
  const progress = this.getLessonProgress(category);
  return progress?.quizCompleted === true;
}
};
window.GameState = GameState;
export default GameState;

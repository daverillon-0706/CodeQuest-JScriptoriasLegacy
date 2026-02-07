const STORAGE_KEY = "codequest-player";

const GameState = {
  get player() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const p = JSON.parse(stored);

    // Default values
    p.saveVersion ??= 1;
    p.hp ??= 5;
    p.max_hp ??= 5;
    p.energy ??= 3;
    p.max_energy ??= 3;
    p.cryptos ??= 0;
    p.perks ??= { passive: null, offense: null, defense: null, consumables: [null, null] };

    // Runtime-only (not persisted)
    p.effects ??= {};
    p.x ??= 0;
    p.y ??= 0;

    return p;
  },

  set player(value) {
    if (!value) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }

    // Only save JSON-serializable fields
    const toStore = {
      saveVersion: value.saveVersion,
      hp: value.hp,
      max_hp: value.max_hp,
      energy: value.energy,
      max_energy: value.max_energy,
      cryptos: value.cryptos,
      perks: value.perks,
      // do NOT include player.x, player.y, player.effects, or any Phaser objects
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
  },

  logout() {
    localStorage.removeItem(STORAGE_KEY);
  }
};

export default GameState;

// src/GameState.js

const STORAGE_KEY = "codequest-player";

const GameState = {
  get player() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  },
  set player(value) {
    if (value) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  },

  // Optional: clear player (logout)
  logout() {
    localStorage.removeItem(STORAGE_KEY);
  }
};

export default GameState;

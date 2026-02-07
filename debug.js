// src/debug.js
import GameState from "./src/GameState";

document.addEventListener("DOMContentLoaded", () => {

  // --- Ensure player state exists ---
  const ensurePlayer = () => {
    if (!GameState.player) {
      GameState.player = {
        hp: 3,
        maxHP: 12,
        energy: 2,
        maxEnergy: 10,
        cryptos: 1200
      };
    }

    const p = GameState.player;

    p.hp ??= 3;
    p.maxHP ??= 12;
    p.energy ??= 2;
    p.maxEnergy ??= 10;
    p.cryptos ??= 0;

    GameState.player = p;
    return p;
  };

  // --- Update HUD (icons only) ---
  const updateHUD = () => {
    const player = ensurePlayer();

    // Icon HUD (top-left)
    if (window.updateHearts) {
      updateHearts(player.hp, player.maxHP);
    }

    if (window.updateEnergy) {
      updateEnergy(player.energy, player.maxEnergy);
    }

    if (window.updateCryptos) {
      updateCryptos(player.cryptos);
    }

    // Battle HUD (still numeric for now – OK)
    const battleHP = document.getElementById("battle-playerHP");
    const battleEnergy = document.getElementById("battle-playerEnergy");
    const battleCryptos = document.getElementById("battle-playerCryptos");

    if (battleHP) battleHP.textContent = player.hp;
    if (battleEnergy) battleEnergy.textContent = player.energy;
    if (battleCryptos) battleCryptos.textContent = player.cryptos;
  };

  // --- Change stat safely ---
  const changeStat = (stat, amount, maxKey = null) => {
    const player = ensurePlayer();

    player[stat] = (player[stat] || 0) + amount;

    if (maxKey) {
      player[stat] = Math.max(0, Math.min(player[stat], player[maxKey]));
    } else {
      player[stat] = Math.max(0, player[stat]);
    }

    GameState.player = player;
    updateHUD();
  };

  // --- Reset stats ---
  const resetStats = () => {
    GameState.player = {
      hp: 3,
      maxHP: 12,
      energy: 2,
      maxEnergy: 10,
      cryptos: 0
    };
    updateHUD();
  };

  // --- Button wiring ---
  const bind = (id, fn) => {
    const btn = document.getElementById(id);
    if (btn) btn.onclick = fn;
  };

  bind("hp-plus", () => changeStat("hp", 1, "maxHP"));
  bind("hp-minus", () => changeStat("hp", -1, "maxHP"));

  bind("energy-plus", () => changeStat("energy", 1, "maxEnergy"));
  bind("energy-minus", () => changeStat("energy", -1, "maxEnergy"));

  bind("crypto-plus", () => changeStat("cryptos", 100));
  bind("crypto-minus", () => changeStat("cryptos", -100));

  bind("reset-stats", resetStats);

  // --- Observe battle UI visibility ---
  const battleUI = document.getElementById("battle-ui");
  if (battleUI) {
    const observer = new MutationObserver(updateHUD);
    observer.observe(battleUI, {
      attributes: true,
      attributeFilter: ["class", "style"]
    });
  }

  // Initial sync
  updateHUD();
});

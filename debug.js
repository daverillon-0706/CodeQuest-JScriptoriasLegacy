// src/debug.js
import GameState from "./src/GameState";

document.addEventListener('DOMContentLoaded', () => {

  // Ensure player exists in GameState with defaults
  const ensurePlayer = () => {
    if (!GameState.player) {
      GameState.player = { hp: 100, energy: 50, cryptos: 0 };
    }
    const player = GameState.player;
    player.hp ??= 100;
    player.energy ??= 50;
    player.cryptos ??= 0;
    GameState.player = player; // write back any defaults
    return player;
  };

  // Update all HUD numbers (tablet + battle)
  const updateHUD = () => {
    const player = ensurePlayer();

    // Tablet HUD
    const hpEl = document.getElementById('playerHP-text');
    const energyEl = document.getElementById('playerEnergy-text');
    const cryptoEl = document.getElementById('cryptos-count');

    if (hpEl) hpEl.textContent = player.hp ?? 0;
    if (energyEl) energyEl.textContent = player.energy ?? 0;
    if (cryptoEl) cryptoEl.textContent = player.cryptos ?? 0;

    // Battle HUD
    const battleHP = document.getElementById('battle-playerHP');
    const battleEnergy = document.getElementById('battle-playerEnergy');
    const battleCryptos = document.getElementById('battle-playerCryptos');

    if (battleHP) battleHP.textContent = player.hp ?? 0;
    if (battleEnergy) battleEnergy.textContent = player.energy ?? 0;
    if (battleCryptos) battleCryptos.textContent = player.cryptos ?? 0;

    // Call your HUD module if it exists
    if (window.hud?.updateHUD) window.hud.updateHUD();
  };

  // Change a stat and update HUD + GameState
  const changeStat = (stat, amount) => {
    const player = ensurePlayer();
    player[stat] = Math.max(0, (player[stat] || 0) + amount);
    GameState.player = player;
    updateHUD();
  };

  // Reset stats to default
  const resetStats = () => {
    const player = { hp: 100, energy: 50, cryptos: 0 };
    GameState.player = player;
    updateHUD();
  };

  // Attach debug buttons
  const attachButton = (id, handler) => {
    const btn = document.getElementById(id);
    if (btn) btn.onclick = handler;
  };

  attachButton('hp-plus', () => changeStat('hp', 10));
  attachButton('hp-minus', () => changeStat('hp', -10));
  attachButton('energy-plus', () => changeStat('energy', 10));
  attachButton('energy-minus', () => changeStat('energy', -10));
  attachButton('crypto-plus', () => changeStat('cryptos', 50));
  attachButton('crypto-minus', () => changeStat('cryptos', -50));
  attachButton('reset-stats', resetStats);

  // Ensure battle HUD updates whenever it becomes visible
  const battleUI = document.getElementById('battle-ui');
  if (battleUI) {
    const observer = new MutationObserver(() => updateHUD());
    observer.observe(battleUI, { attributes: true, attributeFilter: ['style', 'class'] });
  }

  // Initial HUD update on page load
  updateHUD();
});

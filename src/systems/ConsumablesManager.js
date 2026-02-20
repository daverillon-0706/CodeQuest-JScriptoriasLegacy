// src/systems/ConsumablesManager.js

import GameState from "../GameState.js";

export default class ConsumablesManager {

  static get player() {
    return GameState.player;
  }

  static has(id) {
    return this.player?.items?.consumables
      ?.find(c => c.id === id)?.amount > 0;
  }

  static use(id, scene) {
    const player = this.player;
    if (!this.has(id)) {
        console.log("[Consumables] None left:", id);
        return false;
    }

    // Remove item first
    const consumed = GameState.useConsumable(id, 1);
    if (!consumed) {
        console.warn("[Consumables] Failed to consume:", id);
        return false;
    }

    // Apply effect
    const effect = this.effects[id];
    if (!effect) {
        console.warn("[Consumables] No effect defined:", id);
        return false;
    }

    const success = effect(scene, player);
    if (!success) {
        console.log("[Consumables] Effect failed, restoring item:", id);
        // Restore the consumable since effect failed
        GameState.addConsumable(id, 1);
        return false;
    }

    console.log("[Consumables] Used:", id);
    return true;
}
  // ======================
  // EFFECT DEFINITIONS
  // ======================

  static effects = {

    pills_tier1: (scene, player) => {
      return this.heal(player, 1);
    },

    pills_tier2: (scene, player) => {
      return this.heal(player, 2);
    },

    pills_tier3: (scene, player) => {
      return this.heal(player, 3);
    },

    vital_drink1: (scene, player) => {
      return this.heal(player, 1);
    },

    vital_drink2: (scene, player) => {
      return this.heal(player, 2);
    },

    vital_drink3: (scene, player) => {
      return this.heal(player, 3);
    },

    revital_vial: (scene, player) => {
      player.hp = player.max_hp;
      player.energy = player.max_energy;
      GameState.player = player;
      return true;
    },

    heart_container: (scene, player) => {
      if (player.max_hp >= 13) return false;

      player.max_hp += 1;
      player.hp += 1;
      GameState.player = player;
      return true;
    },

    energy_container: (scene, player) => {
      if (player.max_energy >= 10) return false;

      player.max_energy += 1;
      player.energy += 1;
      GameState.player = player;
      return true;
    },

    adrenaline: (scene, player) => {
      scene.player?.applyAdrenaline?.();
      return true;
    },

    escape_diamond: (scene, player) => {
      scene.forceEscapeBattle?.();
      return true;
    }
  };

  static heal(player, amount) {
    if (player.hp >= player.max_hp) return false;

    player.hp = Math.min(player.hp + amount, player.max_hp);
    GameState.player = player;
    return true;
  }
}
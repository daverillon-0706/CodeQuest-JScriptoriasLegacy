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

    scene?.refreshHUD?.(); // 🔥 UPDATE HUD
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
  return this.energize(player, 1);
},

vital_drink2: (scene, player) => {
  return this.energize(player, 2);
},

vital_drink3: (scene, player) => {
  return this.energize(player, 3);
},

    revital_vial: (scene, player) => {
      player.hp = player.max_hp;
      player.energy = player.max_energy;
      GameState.player = player;
      return true;
    },

    
    adrenaline: (scene, player) => {
  if (!scene.player) return false;

  const originalSpeed = scene.player.moveSpeed || 200;

  scene.player.moveSpeed = originalSpeed * 1.5;

  scene.time.delayedCall(10000, () => {
    scene.player.moveSpeed = originalSpeed;
  });

  return true;
},

    escape_diamond: (scene, player) => {
  if (!scene.player || !scene.bugs) return false;

  const radius = 10 * 32; // 10 tiles (assuming 32px tiles)
  const px = scene.player.x;
  const py = scene.player.y;

  scene.bugs.getChildren().forEach(bug => {
    const dist = Phaser.Math.Distance.Between(px, py, bug.x, bug.y);

    if (dist <= radius) {
      bug.stunned = true;
      bug.setTint(0x00ffff);

      scene.time.delayedCall(3000, () => {
        bug.stunned = false;
        bug.clearTint();
      });
    }
  });

  return true;
},
  };

  static heal(player, amount) {
    if (player.hp >= player.max_hp) return false;

    player.hp = Math.min(player.hp + amount, player.max_hp);
    GameState.player = player;
    return true;
  }
  static energize(player, amount) {
  if (player.energy >= player.max_energy) return false;

  player.energy = Math.min(player.energy + amount, player.max_energy);
  GameState.player = player;
  return true;
}
}
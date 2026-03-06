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
/*
  static use(id, scene) {

  const player = this.player;

  if (!this.has(id)) {
    console.log("[Consumables] None left:", id);
    return false;
  }

  const effect = this.effects[id];

  if (!effect) {
    console.warn("[Consumables] No effect defined:", id);
    return false;
  }

  // Try applying effect FIRST
  const success = effect(scene, player);

  if (!success) {
    console.log("[Consumables] Effect failed:", id);
    return false;
  }

  // Consume item AFTER success
  const consumed = GameState.useConsumable(id, 1);

  if (!consumed) {
    console.warn("[Consumables] Failed to consume:", id);
    return false;
  }

  scene?.refreshHUD?.();

  console.log("[Consumables] Used:", id);

  return true;
}
  */
 static use(id, scene) {

  const player = this.player;

  if (!this.has(id)) {
    return { success:false, reason:"no_item" };
  }

  const effect = this.effects[id];
  if (!effect) {
    return { success:false, reason:"no_effect" };
  }

  const success = effect(scene, player);

  if (!success) {
    return { success:false, reason:"blocked" };
  }

  const consumed = GameState.useConsumable(id, 1);
  if (!consumed) {
    return { success:false, reason:"consume_failed" };
  }

  scene?.refreshHUD?.();

  return { success:true };
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

  const controller = scene.playerController;
  if (!controller) return false;

  const originalSpeed = controller.MOVE_SPEED;

  controller.MOVE_SPEED = originalSpeed * 2;
  scene.time.delayedCall(10000, () => {
    controller.MOVE_SPEED = originalSpeed;
  });

  return true;
},

    escape_diamond: (scene, player) => {

  if (!scene.player || !scene.bugGroup) return false;

  const radius = 10 * 32;
  const px = scene.player.x;
  const py = scene.player.y;

  // Shockwave visual
  const shockwave = scene.add.circle(px, py, 10, 0x00ffff, 0.35);
  shockwave.setDepth(9999);

  scene.tweens.add({
    targets: shockwave,
    scale: 30,
    alpha: 0,
    duration: 400,
    ease: "Quad.easeOut",
    onComplete: () => shockwave.destroy()
  });

  scene.bugGroup.getChildren().forEach(bug => {

    const dist = Phaser.Math.Distance.Between(px, py, bug.x, bug.y);

    if (dist <= radius && !bug.stunned) {

  bug.stunned = true;

  // Light blue freeze tint
  bug.setTint(0xa6d8ff);
  bug.setAlpha(0.9);

  // Optional: pause animation
  bug.anims?.pause();

  scene.time.delayedCall(3000, () => {

    bug.stunned = false;

    // Smooth return to normal
    scene.tweens.add({
      targets: bug,
      alpha: 1,
      duration: 200,
    });

    bug.clearTint();
    bug.anims?.resume();
  });
}

  });

  console.log("Escape Diamond used", scene.bugGroup.getChildren().length);
  return true;
}
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
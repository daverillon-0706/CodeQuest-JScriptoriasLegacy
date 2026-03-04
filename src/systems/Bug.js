// src/systems/Bug.js
import Phaser from "phaser";
import GameState from "../GameState.js";

export default class Bug extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, key = "golem", data = {}) {
    super(scene, x, y, key);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setOrigin(0, 1);
    this.setCollideWorldBounds(true);

    this.typeData = data;

    // ✅ DEFAULT HEALTH
    this.hp = data.hp ?? 1;
    this.isDead = false;
  }

  // ====================================================
  // ✅ DAMAGE SYSTEM (CALLED BY BULLETS)
  // ====================================================
  takeDamage(amount = 1) {
    if (this.isDead) return;

    this.hp -= amount;

    console.log("Bug hit! HP left:", this.hp);

    if (this.hp <= 0) {
      this.die();
    }
  }

  // ====================================================
  // ✅ DEATH + REWARD LOGIC
  // ====================================================
  die() {
  if (this.isDead) return;

  this.isDead = true;

  console.log("Bug.js → Bug died → Rewarding cryptos");

  const reward = Phaser.Math.Between(300, 500);
  const gs = GameState.player;

  if (gs) {
    gs.cryptos = (gs.cryptos ?? 0) + reward;
    GameState.player = { ...gs };

    if (window.updateCryptos)
      window.updateCryptos(gs.cryptos);

    if (window.HUD)
      window.HUD.updateHUD();
  }

  // 💀 Destroy bug visually
  this.scene.tweens.add({
    targets: this,
    alpha: 0,
    duration: 200,
    onComplete: () => {
      this.destroy();
    }
  });
}

  update() {
    // default: do nothing
  }
}
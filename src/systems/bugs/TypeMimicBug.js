// src/systems/bugs/TypeMimicBug.js
import Bug from "../Bug.js";
import GameState from "../../GameState.js"; // adjust path if needed

export default class TypeMimicBug extends Bug {
  constructor(scene, x, y) {
    const data = {
      dmg: 2,
      detectRange: 2,
      attackCooldown: 2000,
      revealDelay: 400,
      chargeSpeed: 120
    };

    super(scene, x, y, "mimic", data);

    this.isRevealed = false;
    this.isAttacking = false;
    this.cooldown = false;

    this.setFrame(0);
    this.body.setImmovable(true);
  }

  update() {
    const player = this.scene.player;
    if (!player) return;
    if (this.cooldown || this.isAttacking) return;

    const dist = Phaser.Math.Distance.Between(
      this.x, this.y,
      player.x, player.y
    );

    if (dist <= this.typeData.detectRange * 16) {
      this.revealAndAttack(player);
    }
  }

  revealAndAttack(player) {
    if (this.isRevealed) return;

    this.isRevealed = true;
    this.isAttacking = true;

    console.log("Mimic revealed!");

    this.setFrame(1);

    this.flashTween = this.scene.tweens.add({
      targets: this,
      alpha: 0.4,
      duration: 120,
      yoyo: true,
      repeat: -1
    });

    this.scene.time.delayedCall(
      this.typeData.revealDelay,
      () => this.charge(player),
      [],
      this
    );
  }

  charge(player) {
    console.log("Mimic charging...");

    if (this.flashTween) {
      this.flashTween.stop();
      this.setAlpha(1);
    }

    this.scene.physics.moveToObject(
      this,
      player,
      this.typeData.chargeSpeed
    );

    this.scene.time.delayedCall(500, () => {
      this.bite(player);
    });
  }

  bite(player) {
    console.log("Mimic bite!");

    const dist = Phaser.Math.Distance.Between(
      this.x,
      this.y,
      player.x,
      player.y
    );

    if (dist <= 28 && !player.invincible) {
      const dmg = this.typeData.dmg || 1;

      // =============================
      // REAL HP SOURCE (GameState)
      // =============================
      const gs = GameState.player;
      if (!gs) return;

      gs.hp = Math.max(gs.hp - dmg, 0);
      console.log("[Damage] Player HP after Mimic bite:", gs.hp);

      // Sync runtime sprite
      if (!player.customData) player.customData = {};
      player.customData.HP = gs.hp;

      // Persist save
      GameState.player = gs;

      // HUD
      if (window.updateHearts) {
        window.updateHearts(gs.hp, gs.max_hp ?? 12);
      }

      // Feedback
      this.scene.cameras.main.shake(120, 0.004);

      player.invincible = true;
      player.setTint(0xff0000);

      this.scene.time.delayedCall(800, () => {
        player.invincible = false;
        player.clearTint();
      });
    }

    this.body.setVelocity(0);

    this.scene.time.delayedCall(500, () => {
      this.resetMimic();
    });
  }

  resetMimic() {
    console.log("Mimic reset.");

    this.setFrame(0);
    this.isRevealed = false;
    this.isAttacking = false;
    this.cooldown = true;

    this.scene.time.delayedCall(
      this.typeData.attackCooldown,
      () => {
        this.cooldown = false;
      }
    );
  }

  dealDamage(player) {
    if (this.cooldown || this.isAttacking) return;
    this.revealAndAttack(player);
  }
}

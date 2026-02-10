// src/systems/bugs/TypeMimicBug.js
import Bug from "../Bug.js";

export default class TypeMimicBug extends Bug {
  constructor(scene, x, y) {
    const data = {
      dmg: 2,
      detectRange: 2,   // tiles
      attackCooldown: 2000
    };

    super(scene, x, y, "mimic", data);

    // --- States ---
    this.isRevealed = false;
    this.isAttacking = false;
    this.cooldown = false;

    // Idle frame (disguised)
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

  // ================= REVEAL =================
  revealAndAttack(player) {
  if (this.isRevealed) return;

  this.isRevealed = true;
  this.isAttacking = true;

  console.log("Mimic revealed!");

  // Reveal frame
  this.setFrame(1);

  // Warning flash
  this.flashTween = this.scene.tweens.add({
    targets: this,
    alpha: 0.4,
    duration: 120,
    yoyo: true,
    repeat: -1
  });

  // Delay before charge (telegraph)
  this.scene.time.delayedCall(
    this.typeData.revealDelay,
    () => this.charge(player),
    [],
    this
  );
}

charge(player) {
  console.log("Mimic charging...");

  // Stop flashing
  if (this.flashTween) {
    this.flashTween.stop();
    this.setAlpha(1);
  }

  // Slow lunge
  this.scene.physics.moveToObject(
    this,
    player,
    this.typeData.chargeSpeed
  );

  // Bite timing window
  this.scene.time.delayedCall(500, () => {
    this.bite(player);
  });
}


  // ================= BITE =================
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

      player.customData.HP = Math.max(
        player.customData.HP - dmg,
        0
      );

      // Small camera shake
    this.scene.cameras.main.shake(120, 0.004);
      console.log("Player HP:", player.customData.HP);

      if (window.updateHearts) {
        window.updateHearts(player.customData.HP, 12);
      }

      // Hit reaction
      player.invincible = true;
      player.setTint(0xff0000);

      this.scene.time.delayedCall(800, () => {
        player.invincible = false;
        player.clearTint();
      });
    }

    // Stop movement after bite
    this.body.setVelocity(0);

    // Reset state after attack
    this.scene.time.delayedCall(500, () => {
      this.resetMimic();
    });
  }

  // ================= RESET =================
  resetMimic() {
    console.log("Mimic reset.");

    this.setFrame(0);

    this.isRevealed = false;
    this.isAttacking = false;
    this.cooldown = true;

    // Cooldown before next ambush
    this.scene.time.delayedCall(
      this.typeData.attackCooldown,
      () => {
        this.cooldown = false;
      }
    );
  }

  // ================= OVERLAP HOOK =================
  dealDamage(player) {
    if (this.cooldown || this.isAttacking) return;

    this.revealAndAttack(player);
  }
}

import Bug from "../Bug.js";
import GameState from "../../GameState.js";

export default class TypeMimicBug extends Bug {
  constructor(scene, x, y) {
    const data = {
      dmg: 2,
      detectRange: 2,        // tiles for initial trigger
      attackCooldown: 2000,  // ms between neutral attacks
      revealDelay: 400,      // ms delay before charging
      chargeSpeed: 120,      // initial charge speed
      chaseSpeed: 40,        // after charge
      maxChaseDist: 150      // pixels
    };
    super(scene, x, y, "mimic", data);

    this.typeData = data;
    this.isRevealed = false;
    this.isAttacking = false;
    this.cooldown = false;
    this.setFrame(0);
    this.body.setImmovable(true);
    this.isDead = false;         // Already good if you have it
    this.moveTimer = null;       // Any delayed movement
    this.resetTween = null;      // Any movement tween or animation callback

  }

  update() {
    if (this.isDead) return;

    const player = this.scene.player;
    if (!player || this.cooldown || this.isAttacking) return;

    const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
    if (dist <= this.typeData.detectRange * 16) {
      this.revealAndAttack(player);
    }
  }

  revealAndAttack(player) {
    if (this.isRevealed) return;

    this.isRevealed = true;
    this.isAttacking = true;
    this.setFrame(1);

    // Flashing effect
    this.flashTween = this.scene.tweens.add({
      targets: this,
      alpha: 0.4,
      duration: 120,
      yoyo: true,
      repeat: -1
    });

    // Charge after reveal delay
    this.scene.time.delayedCall(this.typeData.revealDelay, () => this.charge(player), [], this);
  }

  charge(player) {
  if (this.isDead || !this.scene) return; // 🔒 prevent crash if mimic is already dead

  // Stop flash tween safely
  if (this.flashTween) {
    this.flashTween.stop();
    this.setAlpha(1);
  }

  // Stop any previous chargeEvent if it exists
  if (this.chargeEvent) {
    this.chargeEvent.remove(false);
    this.chargeEvent = null;
  }

  // Move toward player's current position safely
  if (this.scene.physics && this.body) {
    const targetX = player.x;
    const targetY = player.y;
    this.scene.physics.moveTo(this, targetX, targetY, this.typeData.chargeSpeed);
  }

  // Monitor charge safely
  this.chargeEvent = this.scene.time.addEvent({
    delay: 50,
    loop: true,
    callback: () => {
      // 🔒 guard: exit if mimic is dead, destroyed, or scene gone
      if (this.isDead || !this.body || !this.scene || !player.active) return;

      const targetX = player.x; // recalc in case player moved
      const targetY = player.y;
      const distToTarget = Phaser.Math.Distance.Between(this.x, this.y, targetX, targetY);

      // Overshot or reached target
      if (distToTarget <= 4 || distToTarget > 200) {
        if (this.body) this.body.setVelocity(0);
        if (this.chargeEvent) {
          this.chargeEvent.remove(false);
          this.chargeEvent = null;
        }

        const distToPlayer = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
        if (distToPlayer <= 28 && !player.invincible) {
          this.dealInitialDamage(player);
          this.startChase(player);
        } else {
          this.resetMimic();
        }
      }
    }
  });
}

dealInitialDamage(player) {
  if (this.isDead) return;

  const dmg = this.typeData.dmg || 3; // mimic first hit damage
  const gs = GameState.player;
  if (!gs) return;

  // =========================
  // APPLY DAMAGE
  // =========================
  gs.hp = Math.max(gs.hp - dmg, 0);
  player.customData.HP = gs.hp;
  GameState.player = gs;

  // =========================
  // UPDATE UI
  // =========================
  if (this.scene.updateHUD) this.scene.updateHUD();
  if (window.updateHearts) window.updateHearts(gs.hp, gs.max_hp);

  // =========================
  // INVINCIBILITY + FEEDBACK
  // =========================
  player.invincible = true;
  player.setTint(0xff0000);
  this.scene.time.delayedCall(800, () => {
    player.invincible = false;
    player.clearTint();
  });

  this.scene.cameras.main.shake(150, 0.01);
  this.scene.soundManager.play("player_hit");

  // =========================
  // GAME OVER CHECK
  // =========================
  if (gs.hp <= 0) {
    this.scene.onPlayerGameOver();
  }
}

  startChase(player) {
  if (this.isDead) return;

  this.chaseEvent = this.scene.time.addEvent({
    delay: 50,
    loop: true,
    callback: () => {
      if (this.isDead || !this.body || !player.active) return; // 🔒 SAFE GUARD

      const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);

      // Stop chase if too far
      if (dist > this.typeData.maxChaseDist) {
        this.body.setVelocity(0);
        this.chaseEvent.remove(false);
        this.resetMimic();
        return;
      }

      // Move toward player smoothly
      const dx = player.x - this.x;
      const dy = player.y - this.y;
      const mag = Math.hypot(dx, dy);
      if (mag > 0) {
        this.body.setVelocity((dx / mag) * this.typeData.chaseSpeed, (dy / mag) * this.typeData.chaseSpeed);
      }

      // Animate frame toggle
      this.setFrame(Math.random() > 0.5 ? 1 : 2);

      // Deal 1 damage on overlap
      if (!player.invincible && Phaser.Geom.Intersects.RectangleToRectangle(this.getBounds(), player.getBounds())) {
        this.dealChaseDamage(player);
      }
    }
  });
}

dealChaseDamage(player) {
  if (this.isDead) return;

  const dmg = this.typeData.dmg || 1; // chase damage
  const gs = GameState.player;
  if (!gs) return;

  // =========================
  // APPLY DAMAGE
  // =========================
  gs.hp = Math.max(gs.hp - dmg, 0);
  player.customData.HP = gs.hp;
  GameState.player = gs;

  // =========================
  // UPDATE UI
  // =========================
  if (this.scene.updateHUD) this.scene.updateHUD();
  if (window.updateHearts) window.updateHearts(gs.hp, gs.max_hp);

  // =========================
  // INVINCIBILITY + FEEDBACK
  // =========================
  player.invincible = true;
  player.setTint(0xff0000);
  this.scene.time.delayedCall(800, () => {
    player.invincible = false;
    player.clearTint();
  });

  this.scene.cameras.main.shake(120, 0.008);
  this.scene.soundManager.play("player_hit");

  // =========================
  // GAME OVER CHECK
  // =========================
  if (gs.hp <= 0) {
    this.scene.onPlayerGameOver();
  }
}

  resetMimic() {
    this.setFrame(0);
    this.isRevealed = false;
    this.isAttacking = false;
    this.cooldown = true;

    this.scene.time.delayedCall(this.typeData.attackCooldown, () => {
      this.cooldown = false;
    });
  }

  dealDamage(player) {
    if (this.cooldown || this.isAttacking) return;
    this.revealAndAttack(player);
  }

  takeDamage(amount) {
  if (this.isDead) return;

  this.isDead = true;

  // Stop timers/tweens
  if (this.moveTimer) {
    this.moveTimer.remove(false);
    this.moveTimer = null;
  }

  if (this.resetTween) {
    this.resetTween.stop();
    this.resetTween = null;
  }

  if (this.flashTween) {
    this.flashTween.stop();
    this.flashTween = null;
    this.setAlpha(1);
  }

  if (this.chargeEvent) {
    this.chargeEvent.remove(false);
    this.chargeEvent = null;
  }

  if (this.chaseEvent) {
    this.chaseEvent.remove(false);
    this.chaseEvent = null;
  }

  // Stop physics movement
  if (this.body) {
    this.body.setVelocity(0, 0);
    this.body.enable = false;
  }

  // Finally destroy safely
  this.destroy();
}


}

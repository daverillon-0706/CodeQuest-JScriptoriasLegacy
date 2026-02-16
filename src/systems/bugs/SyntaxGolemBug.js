import Bug from "../Bug.js";
import GameState from "../../GameState.js";

export default class SyntaxGolemBug extends Bug {
  constructor(scene, x, y) {
    const data = {
      dmg: 3,
      detectRadius: 3,   // tiles
      slamRadius: 3,     // AoE tiles
      chargeTime: 2000,  // ms
      cooldownTime: 3000
    };
    super(scene, x, y, "golem", data);

    this.typeData = data;
    this.isCharging = false;
    this.cooldown = false;
    this.hasSlammed = false;
    this.chargeTimer = null;
    this.resetTimer = null;


    this.body.setImmovable(true);
    this.setFrame(0);
  }

  update() {
    if (this.isDead) return;

    const player = this.scene.player;
    if (!player || this.isCharging || this.cooldown) return;

    const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);

    // Normal charge detection
    if (dist <= this.typeData.detectRadius * 16) {
      this.startCharge();
    }
  }

  startCharge() {
    if (this.isCharging) return;

    this.isCharging = true;
    this.hasSlammed = false;

    // Flashing warning
    this.flashTween = this.scene.tweens.add({
      targets: this,
      alpha: 0.3,
      duration: 150,
      yoyo: true,
      repeat: -1
    });

    // Charge timer
    this.chargeTimer = this.scene.time.delayedCall(
  this.typeData.chargeTime,
  () => this.slam(),
  [],
  this
);

  }

    slam() {
      if (this.isDead) return;
      if (!this.scene) return;
      if (!this.body) return;
      if (this.hasSlammed) return;

      this.hasSlammed = true;

    if (this.flashTween) {
      this.flashTween.stop();
      this.setAlpha(1);
    }

    this.setFrame(1); // Slam frame
    this.scene.cameras.main.shake(300, 0.01);

    const radius = this.typeData.slamRadius * 16;

    // AoE visual
    const circle = this.scene.add.circle(this.x, this.y, radius, 0xff0000, 0.35);
    this.scene.tweens.add({
      targets: circle,
      alpha: 0,
      duration: 400,
      onComplete: () => circle.destroy()
    });

    // Damage player if in radius
    const player = this.scene.player;
    if (player && Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y) <= radius && !player.invincible) {
      const dmg = this.typeData.dmg;
      const gs = GameState.player;
      if (!gs) return;
      gs.hp = Math.max(gs.hp - dmg, 0);
      player.customData.HP = gs.hp;
      GameState.player = gs;

      if (this.scene.updateHUD) this.scene.updateHUD();
      if (window.updateHearts) window.updateHearts(gs.hp, gs.max_hp);

      player.invincible = true;
      player.setTint(0xff0000);
      this.scene.time.delayedCall(800, () => {
        player.invincible = false;
        player.clearTint();
      });

      this.scene.soundManager.play("player_hit");
    }

    // Reset
    this.resetTimer = this.scene.time.delayedCall(800, () => {
  if (this.isDead || !this.scene) return;

  this.setFrame(0);
  this.isCharging = false;
  this.cooldown = true;

  this.scene.time.delayedCall(
    this.typeData.cooldownTime,
    () => {
      if (!this.isDead) this.cooldown = false;
    }
  );
});

  }

  // Immediate slam if player touches
  dealDamage(player) {
    if (this.hasSlammed || this.cooldown) return;

    const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);

    if (dist <= this.typeData.detectRadius * 16) {
      // Cancel charge timer if exists
      if (this.flashTween) {
        this.flashTween.stop();
        this.setAlpha(1);
      }

      this.slam(); // Slam immediately
    }
  }
  takeDamage(amount) {
  if (this.isDead) return;

  this.isDead = true;

  // Stop flash warning
  if (this.flashTween) {
    this.flashTween.stop();
    this.setAlpha(1);
  }

  // Cancel charge timer
  if (this.chargeTimer) {
    this.chargeTimer.remove(false);
    this.chargeTimer = null;
  }

  // Cancel reset timer
  if (this.resetTimer) {
    this.resetTimer.remove(false);
    this.resetTimer = null;
  }

  // Stop movement
  if (this.body) {
    this.body.setVelocity(0, 0);
    this.body.enable = false;
  }

  // Destroy safely
  this.destroy();
}

}

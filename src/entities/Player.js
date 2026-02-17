import GameState from "../GameState";

export default class Player extends Phaser.Physics.Arcade.Sprite {

 takeDamage(amount = 1) {
  if (this.invincible) return;

  const gs = GameState.player;
  if (!gs) return;

  // =========================
  // APPLY DAMAGE
  // =========================
  gs.hp = Math.max(gs.hp - amount, 0);
  this.customData.HP = gs.hp;
  GameState.player = gs;

  // =========================
  // UPDATE UI
  // =========================
  if (this.scene.updateHUD) this.scene.updateHUD();
  if (window.updateHearts) {
    window.updateHearts(gs.hp, gs.max_hp);
  }

  // =========================
  // INVINCIBILITY FRAMES
  // =========================
  this.invincible = true;
  this.setTint(0xff0000);

  this.scene.time.delayedCall(800, () => {
    this.invincible = false;
    this.clearTint();
  });

  // =========================
  // CAMERA FEEDBACK
  // =========================
  this.scene.cameras.main.shake(120, 0.008);

  // =========================
  // GAME OVER CHECK
  // =========================
  if (gs.hp <= 0) {
    this.scene.onPlayerGameOver();
  }
}





die() {
  if (this.isDead) return;

  this.isDead = true;

  console.log("💀 Player died");

  this.setVelocity(0, 0);

  if (this.anims) {
    this.anims.play("player-death", true);
  }

  this.scene.onPlayerGameOver();
}

}
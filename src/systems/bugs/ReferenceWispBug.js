import Bug from "../Bug.js";
import GameState from "../../GameState.js";

export default class ReferenceWispBug extends Bug {
  constructor(scene, x, y) {
    const data = {
      dmg: 1,
      detectRange: 7,
      speed: 70,
      idleSpeed: 25,
      errorCode: "ReferenceError: variable is not defined"
    };
    super(scene, x, y, "wisp", data);

    this.typeData = data;
    this.body.setBounce(1, 1);
    this.body.setCollideWorldBounds(true);

    this.setRandomIdleVelocity();

    this.lastHit = 0;
    this.hitCooldown = 800;

    // Colliders with world layers
    const layers = [scene.buildingLayer, scene.wallLayer, scene.itemLayer];
    layers.forEach(layer => scene.physics.add.collider(this, layer, this.handleWallCollision, null, this));
  }

  setRandomIdleVelocity() {
    const angle = Math.random() * Math.PI * 2;
    const speed = this.typeData.idleSpeed;
    this.body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
  }

  handleWallCollision(wisp, wall) {
    // Bounce / pick new idle direction if not chasing
    if (!this.isChasing) this.setRandomIdleVelocity();
  }

  update(time) {
    if (this.isDead) return;
    
    if (!this.active || !this.scene || !this.scene.player) return;
    const player = this.scene.player;
    if (!player) return;

    const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);

    if (dist <= this.typeData.detectRange * 16) {
      this.isChasing = true;
      this.scene.physics.moveToObject(this, player, this.typeData.speed);
    } else {
      this.isChasing = false;
      // Idle wandering if far from player
      if (this.body.velocity.length() < 1) this.setRandomIdleVelocity();
    }

    // Directional animation
    if (this.body.velocity.x > 0) this.anims.play("wisp-move-right", true);
    else if (this.body.velocity.x < 0) this.anims.play("wisp-move-left", true);
    else this.anims.stop();
  }

  dealDamage(player) {
    const now = this.scene.time.now;
    if (!player.invincible && (now - this.lastHit > this.hitCooldown)) {
      const dmg = this.typeData.dmg || 1;

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

    // =========================
    // CHARGE / HIT RESET
    // =========================
    this.isCharging = false;
    this.hasHit = true;
    if (this.body) this.body.setVelocity(0);

    this.scene.time.delayedCall(1000, () => {
      this.hasHit = false;
    });

    // =========================
    // GAME OVER CHECK
    // =========================
    if (gs.hp <= 0) {
      this.scene.onPlayerGameOver();
    }
  }
  }
}

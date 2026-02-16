import Bug from "../Bug.js";
import GameState from "../../GameState.js";

export default class RangeSlimeBug extends Bug {
  constructor(scene, x, y) {
    const data = {
      dmg: 2,
      detectRange: 7,
      moveCooldown: 2000,
      speed: 60,
      idleSpeed: 20,
      errorCode: "RangeError: index out of range"
    };
    super(scene, x, y, "slime", data);

    this.typeData = data;
    this.body.setCollideWorldBounds(true);
    this.body.setBounce(1, 1); // bounce off walls
    this.setRandomIdleVelocity();

    this.lastMove = 0;
    this.isCharging = false;
    this.hasHit = false;

    // Colliders with world layers
    const layers = [scene.buildingLayer, scene.wallLayer, scene.itemLayer];
    layers.forEach(layer => scene.physics.add.collider(this, layer, this.handleWallCollision, null, this));
  }

  setRandomIdleVelocity() {
    const angle = Math.random() * Math.PI * 2;
    const speed = this.typeData.idleSpeed;
    this.body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
  }

  handleWallCollision(slime, wall) {
    if (this.isCharging) {
      // Stop charging if it hits a wall
      this.isCharging = false;
      this.body.setVelocity(0);
      this.hasHit = true;
      this.scene.time.delayedCall(1000, () => { this.hasHit = false; });
    } else {
      // Bounce / change idle direction slightly
      this.setRandomIdleVelocity();
    }
  }

  update(time) {
    if (this.isDead) return;
    
    const player = this.scene.player;
    if (!player) return;

    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.hypot(dx, dy);

    // Start charging if player is near
    if (!this.isCharging && dist <= this.typeData.detectRange * 16 && (time - this.lastMove > this.typeData.moveCooldown)) {
      this.lastMove = time;
      this.isCharging = true;
      this.hasHit = false;
      this.scene.physics.moveToObject(this, player, this.typeData.speed);
    }

    // Animation
    if (Math.abs(this.body.velocity.x) > Math.abs(this.body.velocity.y)) {
      if (this.body.velocity.x > 0) this.anims.play("slime-move-right", true);
      else this.anims.play("slime-move-left", true);
    } else {
      this.anims.stop();
    }

    // Idle wandering
    if (!this.isCharging && this.body.velocity.length() < 1) {
      this.setRandomIdleVelocity();
    }
  }

  dealDamage(player) {
    if (!player.invincible && this.isCharging && !this.hasHit) {
      const dmg = this.typeData.dmg || 2;

      const gs = GameState.player;
      if (!gs) return;
      gs.hp = Math.max(gs.hp - dmg, 0);
      player.customData.HP = gs.hp;

      if (this.scene.updateHUD) this.scene.updateHUD();
      if (window.updateHearts) window.updateHearts(gs.hp, gs.max_hp);

      player.invincible = true;
      player.setTint(0xff0000);
      this.scene.time.delayedCall(800, () => {
        player.invincible = false;
        player.clearTint();
      });

      this.scene.cameras.main.shake(150, 0.01);

      this.isCharging = false;
      this.hasHit = true;
      this.body.setVelocity(0);

      this.scene.time.delayedCall(1000, () => { this.hasHit = false; });
    }
  }
}

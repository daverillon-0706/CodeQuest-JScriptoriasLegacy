// src/systems/PlayerController.js
export default class PlayerController {
  constructor(scene, player, moveSpeed = 80) {
    this.scene = scene;
    this.player = player;
    this.MOVE_SPEED = moveSpeed;

    // Arrow keys
    this.cursors = scene.input.keyboard.createCursorKeys();

    // Nearby NPC (or interactable) detection
    this.canTalkTo = null;
  }

  update(npcs = []) {
    if (!this.player) return;

    // ---- Reset velocity ----
    this.player.body.setVelocity(0);
    let anim = null;

    // ---- Horizontal movement ----
    if (this.cursors.left.isDown) {
      this.player.body.setVelocityX(-this.MOVE_SPEED);
      anim = "walk-left";
    } else if (this.cursors.right.isDown) {
      this.player.body.setVelocityX(this.MOVE_SPEED);
      anim = "walk-right";
    }

    // ---- Vertical movement ----
    if (this.cursors.up.isDown) {
      this.player.body.setVelocityY(-this.MOVE_SPEED);
      anim = "walk-up";
    } else if (this.cursors.down.isDown) {
      this.player.body.setVelocityY(this.MOVE_SPEED);
      anim = "walk-down";
    }

    // ---- Normalize diagonal movement ----
    this.player.body.velocity.normalize().scale(this.MOVE_SPEED);

    // ---- Play animation ----
    if (anim) this.player.anims.play(anim, true);
    else this.player.anims.stop();

    // ---- Detect nearby NPCs using hitbox collision ----
    let closestDist = Infinity;
    // Detect nearby NPCs
this.canTalkTo = null;
npcs.forEach(npc => {
  const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, npc.x, npc.y);
  if (dist < 24) {
    this.canTalkTo = npc;
    console.log("Detected NPC:", npc.name, "Distance:", dist);
  }
});


    // ---- Return NPC the player can talk to ----
    return this.canTalkTo;
  }
}

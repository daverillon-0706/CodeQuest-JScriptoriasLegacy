// src/systems/PlayerController.js
export default class PlayerController {
  constructor(scene, player, moveSpeed = 80) {
    this.scene = scene;
    this.player = player;
    this.MOVE_SPEED = moveSpeed;

    // Arrow keys
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.shiftKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

    // Nearby NPC (or interactable) detection
    this.canTalkTo = null;
  }

  update(npcs = []) {
    if (!this.player) return;

    // ---- Reset velocity ----
    this.player.body.setVelocity(0);
    let anim = null;

    // ---- Determine speed ----
    let speed = this.MOVE_SPEED;
    if (this.shiftKey.isDown) speed *= 1.8; // Running multiplier

    // ---- Horizontal movement ----
    if (this.cursors.left.isDown) {
      this.player.body.setVelocityX(-speed);
      anim = "walk-left";
    } else if (this.cursors.right.isDown) {
      this.player.body.setVelocityX(speed);
      anim = "walk-right";
    }

    // ---- Vertical movement ----
    if (this.cursors.up.isDown) {
      this.player.body.setVelocityY(-speed);
      anim = "walk-up";
    } else if (this.cursors.down.isDown) {
      this.player.body.setVelocityY(speed);
      anim = "walk-down";
    }

    // ---- Normalize diagonal movement ----
    this.player.body.velocity.normalize().scale(speed);

    // ---- Play animation ----
    if (anim) this.player.anims.play(anim, true);
    else this.player.anims.stop();

    // ---- Detect nearby NPCs using hitbox collision ----
    let closestDist = Infinity;
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

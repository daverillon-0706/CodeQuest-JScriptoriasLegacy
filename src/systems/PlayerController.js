// src/systems/PlayerController.js
export default class PlayerController {
  constructor(scene, player, moveSpeed = 80) {
    this.scene = scene;
    this.player = player;
    this.MOVE_SPEED = moveSpeed;

    // Arrow keys
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.shiftKey = scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SHIFT
    );

    // Nearby NPC (or interactable) detection
    this.canTalkTo = null;

    // ---- DEBUG: POSITION LOGGER ----
    this.debugPosition = false; // toggle per scene
    this._debugTimer = 0;
  }

  update(npcs = []) {
    if (!this.player) return;

    // ---- Reset velocity ----
    this.player.body.setVelocity(0);
    let anim = null;

    // ---- Determine speed ----
    let speed = this.MOVE_SPEED;
    if (this.shiftKey.isDown) speed *= 1.8;

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

    // ---- Detect nearby NPCs ----
    let closestDist = Infinity;
    this.canTalkTo = null;

    npcs.forEach(npc => {
      const dist = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        npc.x,
        npc.y
      );

      if (dist < 24 && dist < closestDist) {
        closestDist = dist;
        this.canTalkTo = npc;
      }
    });

    // ---- DEBUG: PLAYER POSITION LOG ----
    this.logPlayerPosition(this.scene.game.loop.delta);

    return this.canTalkTo;
  }

  // ---- DEBUG HELPER ----
  logPlayerPosition(delta) {
    if (!this.debugPosition) return;

    this._debugTimer += delta;
    if (this._debugTimer < 500) return; // log every 0.5s

    this._debugTimer = 0;

    const px = Math.round(this.player.x);
    const py = Math.round(this.player.y);

    const tileSize = this.scene.TILE_SIZE || 16;
    const tileX = Math.floor(px / tileSize);
    const tileY = Math.floor(py / tileSize);

    console.log(
      `[${this.scene.scene.key}] Player @ px(${px}, ${py}) | tile(${tileX}, ${tileY})`
    );
  }
}

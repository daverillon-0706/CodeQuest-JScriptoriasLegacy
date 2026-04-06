// src/systems/PlayerController.js
import Bullet from "./weapons/bullet.js";
import SoundManager from "./SoundManager.js";


export default class PlayerController {
  constructor(scene, player, moveSpeed = 80, options = {}) {
    this.scene = scene;
    this.player = player;
    this.MOVE_SPEED = moveSpeed;
    this.allowShooting = options.allowShooting ?? true;
    this.frozen = false; // ← New flag: frozen when coding

    this.coordDisplay = document.getElementById('player-coords');
    // In your scene create() or PlayerController constructor
    this.coordDisplay = document.createElement('div');
    this.coordDisplay.style.position = 'absolute';
    this.coordDisplay.style.top = '5px';
    this.coordDisplay.style.left = '5px';
    this.coordDisplay.style.backgroundColor = 'rgba(0,0,0,0.5)';
    this.coordDisplay.style.color = '#fff';
    this.coordDisplay.style.padding = '4px';
    this.coordDisplay.style.fontFamily = 'monospace';
    this.coordDisplay.style.zIndex = 999;
    document.body.appendChild(this.coordDisplay);


    // Arrow keys
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.shiftKey = scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SHIFT
    );

    // 🔫 Attack key (SPACE = blaster trigger later)
    this.attackKey = scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );

    // 🧭 Facing direction tracker
    this.dir = "down";

    // ⚔️ Attack state
    this.isAttacking = false;

    // 🧱 Attack frame mapping
    this.attackFrames = {
      down: { idle: 1, attack: 12 },
      right: { idle: 4, attack: 13 },
      left: { idle: 7, attack: 14 },
      up: { idle: 10, attack: 15 }
    };

    // Nearby NPC detection
    this.canTalkTo = null;

    // ---- DEBUG ----
    this.debugPosition = false;
    this._debugTimer = 0;

    // 🔫 Fire rate system
    this.baseFireRate = 300; // ms between shots (normal speed)
    this.fireRate = this.baseFireRate;
    this.lastShotTime = 0;
  }

  update(npcs = []) {
  if (!this.player) return;

  // =========================
  // 🚫 GLOBAL INPUT BLOCK
  // =========================
  if (this.scene.isUIBlockingInput) {
    this.player.body.setVelocity(0, 0);
    this.player.anims.stop();
    return;
  }

  // =========================
  // 🚫 FROZEN STATE (DIALOGUE / CODING)
  // =========================
  if (this.frozen) {
    this.player.body.setVelocity(0, 0);
    return this.canTalkTo;
  }

  // =========================
  // 🎯 DEPTH SORTING
  // =========================
  this.player.setDepth(this.player.y);

  // =========================
  // 📍 COORDINATE DISPLAY
  // =========================
  const px = Math.round(this.player.x);
  const py = Math.round(this.player.y);
  const tileX = Math.floor(this.player.x / this.scene.TILE_SIZE);
  const tileY = Math.floor(this.player.y / this.scene.TILE_SIZE);

  this.coordDisplay.textContent = `px: ${px}, ${py} | tile: ${tileX}, ${tileY}`;

  // =========================
  // ⚔️ POSITION SAVE (THROTTLED)
  // =========================
  if (!this._lastSaveTime) this._lastSaveTime = 0;

  const nowTime = this.scene.time.now;

  if (nowTime - this._lastSaveTime > 500) { // save every 0.5s
    this._lastSaveTime = nowTime;

    const gs = GameState.player;

    if (gs && this.player) {
      gs.worldState = gs.worldState || {};
      gs.worldState.position = {
        x: this.player.x,
        y: this.player.y
      };

      GameState.player = gs;
    }
  }

  // =========================
  // ⚔️ ATTACK INPUT
  // =========================
  const now = this.scene.time.now;

  if (
    this.allowShooting &&
    this.attackKey.isDown &&
    now > this.lastShotTime + this.fireRate
  ) {
    this.lastShotTime = now;
    this.attack();
  }

  // =========================
  // 🚫 STOP MOVEMENT WHILE ATTACKING
  // =========================
  if (this.isAttacking) {
    this.player.body.setVelocity(0, 0);
  }

  // =========================
  // 🎮 MOVEMENT RESET
  // =========================
  this.player.body.setVelocity(0, 0);
  let anim = null;

  let speed = this.MOVE_SPEED;
  if (this.shiftKey.isDown) speed *= 1.8;

  // =========================
  // ⬅️➡️ HORIZONTAL MOVEMENT
  // =========================
  if (this.cursors.left.isDown) {
    this.player.body.setVelocityX(-speed);
    anim = "walk-left";
    this.dir = "left";
  } 
  else if (this.cursors.right.isDown) {
    this.player.body.setVelocityX(speed);
    anim = "walk-right";
    this.dir = "right";
  }

  // =========================
  // ⬆️⬇️ VERTICAL MOVEMENT
  // =========================
  if (this.cursors.up.isDown) {
    this.player.body.setVelocityY(-speed);
    anim = "walk-up";
    this.dir = "up";
  } 
  else if (this.cursors.down.isDown) {
    this.player.body.setVelocityY(speed);
    anim = "walk-down";
    this.dir = "down";
  }

  // =========================
  // 🔄 NORMALIZE DIAGONAL MOVEMENT
  // =========================
  this.player.body.velocity.normalize().scale(speed);

  // =========================
  // 🎞️ ANIMATION HANDLING
  // =========================
  if (anim) {
    this.player.anims.play(anim, true);
  } else {
    const idleFrame = this.attackFrames[this.dir].idle;
    this.player.anims.stop();
    this.player.setFrame(idleFrame);
  }

  // =========================
  // 🗣️ NPC DETECTION
  // =========================
  let closestDist = Infinity;
  this.canTalkTo = null;

  npcs.forEach(npc => {
    if (!npc.active) return;

    const dist = Phaser.Math.Distance.BetweenPoints(
      this.player.getCenter(),
      npc.getCenter()
    );

    if (dist < 30 && dist < closestDist) {
      closestDist = dist;
      this.canTalkTo = npc;
    }
  });

  // =========================
  // 🐞 DEBUG LOGGING
  // =========================
  this.logPlayerPosition(this.scene.game.loop.delta);

  return this.canTalkTo;
}

  // =========================
  // ⚔️ ATTACK FUNCTION
  // =========================
  attack() {
    if (!this.allowShooting) return;
    if (!this.scene.bulletGroup) return;
    if (this.isAttacking) return;

    this.isAttacking = true;

    const frames = this.attackFrames[this.dir];

    // Stop movement
    this.player.body.setVelocity(0);
    this.player.anims.stop();

    // Show attack frame
    this.player.setFrame(frames.attack);

    // Return to idle after 300ms
    this.scene.time.delayedCall(this.fireRate, () => {
      this.player.setFrame(frames.idle);
      this.isAttacking = false;
    });

    // --- Determine bullet spawn position ---
    const offset = 1;
    let bx = this.player.x;
    let by = this.player.y;

    switch (this.dir) {
      case "left": bx -= offset; break;
      case "right": bx += offset; break;
      case "up": by -= offset; break;
      case "down": by += offset; break;
    }

    // --- Spawn bullet like a bug ---
    const b = this.scene.bulletGroup.get(bx, by, this.player.frame.name);
    if (!b) return;
    b.setActive(true);
    b.setVisible(true);
    b.body.enable = true;
    b.fire(this.player.frame.name);
    this.scene.soundManager.play('blaster');



    // Optional: debug log
    console.log(`[Bullet] Spawned at (${bx}, ${by}) facing ${this.dir} | Player frame: ${this.player.frame.name} | Bullet frame: ${b.frame.name} | Velocity: ${b.body.velocity.x}, ${b.body.velocity.y}`);
  }

  // =========================
  // ❄️ Freeze / Unfreeze
  // =========================
  freeze() {
    this.frozen = true;
    if (this.player && this.player.body) {
      this.player.body.setVelocity(0, 0);
    }
  }

  unfreeze() {
    this.frozen = false;
  }
  // ---- DEBUG HELPER ----
  logPlayerPosition(delta) {
    if (!this.debugPosition || !this.player) return;

    this._debugTimer += delta;
    if (this._debugTimer < 100) return; // update every 100ms
    this._debugTimer = 0;

    const px = Math.round(this.player.x);
    const py = Math.round(this.player.y);

    const tileSize = this.scene.TILE_SIZE || 16;
    const tileX = Math.floor(px / tileSize);
    const tileY = Math.floor(py / tileSize);

    // Console log
    console.log(`[${this.scene.scene.key}] Player @ px(${px}, ${py}) | tile(${tileX}, ${tileY})`);

    // In-game display
    if (this.coordDisplay) {
      this.coordDisplay.textContent = `Pixel: (${px}, ${py}) | Tile: (${tileX}, ${tileY})`;
    }
  }



}

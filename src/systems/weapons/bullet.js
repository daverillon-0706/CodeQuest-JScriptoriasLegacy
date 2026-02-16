import Phaser from "phaser";

// Map player frame index → bullet direction, velocity, and bullet sprite frame
const FRAME_TO_DIR = {
  12: { dir: "down",  vx: 0,  vy: 1,  frame: 0 },
  13: { dir: "right", vx: 1,  vy: 0,  frame: 1 },
  14: { dir: "left",  vx: -1, vy: 0,  frame: 2 },
  15: { dir: "up",    vx: 0,  vy: -1, frame: 3 }
}

export default class Bullet extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, frameIndex) {
    super(scene, x, y, "bullet");
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.speed = 400;
    this.distanceLimit = 16*6;
    this.travelled = 0;
  }

  fire(playerFrameIndex) {
    const cfg = FRAME_TO_DIR[playerFrameIndex] || FRAME_TO_DIR[1];
    this.setFrame(cfg.frame);
    this.body.setVelocity(cfg.vx * this.speed, cfg.vy * this.speed);
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    this.travelled += this.speed * delta / 1000;

    if (this.travelled >= this.distanceLimit) {
      this.destroy();
    }
  }
}



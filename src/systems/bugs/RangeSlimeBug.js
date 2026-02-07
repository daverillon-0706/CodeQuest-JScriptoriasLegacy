import Bug from "../Bug.js";

export default class RangeSlimeBug extends Bug {
  constructor(scene, x, y) {
    super(scene, x, y, "slime", { dmg: 2, detectRange: 7, speed: 30 });

    // Animations
    if(!scene.anims.exists("slime-left")) {
      scene.anims.create({ key:"slime-left", frames: scene.anims.generateFrameNumbers("slime",{ frames:[2,3] }), frameRate:4, repeat:-1 });
    }
    if(!scene.anims.exists("slime-right")) {
      scene.anims.create({ key:"slime-right", frames: scene.anims.generateFrameNumbers("slime",{ frames:[0,1] }), frameRate:4, repeat:-1 });
    }

    // Start moving right
    this.direction = 1;
    this.play("slime-right");
  }

  update(time, delta) {
    // Simple horizontal patrol
    this.x += this.speed * this.direction * delta/1000;

    // Flip animation when hitting world bounds
    if(this.body.blocked.left || this.body.blocked.right) {
      this.direction *= -1;
      this.play(this.direction === 1 ? "slime-right" : "slime-left");
    }
  }
}

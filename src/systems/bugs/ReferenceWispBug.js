import Bug from "../Bug.js";

export default class ReferenceWispBug extends Bug {
  constructor(scene, x, y) {
    super(scene, x, y, "wisp", { dmg: 1, detectRange: 5, speed: 20 });

    if(!scene.anims.exists("wisp-idle")) {
      scene.anims.create({ key:"wisp-idle", frames: scene.anims.generateFrameNumbers("wisp",{ frames:[0,1,2,3] }), frameRate:2, repeat:-1 });
    }

    this.play("wisp-idle");

    // Random movement direction
    this.vx = (Math.random() > 0.5 ? 1 : -1) * this.speed;
    this.vy = (Math.random() > 0.5 ? 1 : -1) * this.speed;
  }

  update(time, delta) {
    // Move diagonally randomly
    this.x += this.vx * delta / 1000;
    this.y += this.vy * delta / 1000;

    // Bounce off world bounds
    if(this.body.blocked.left || this.body.blocked.right) this.vx *= -1;
    if(this.body.blocked.up || this.body.blocked.down) this.vy *= -1;
  }
}

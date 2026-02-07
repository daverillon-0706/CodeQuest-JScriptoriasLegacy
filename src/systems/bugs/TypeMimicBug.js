import Bug from "../Bug.js";

export default class TypeMimicBug extends Bug {
  constructor(scene, x, y) {
    super(scene, x, y, "mimic", { dmg: 1, detectRange: 2, speed: 40 });

    // Animations
    if(!scene.anims.exists("mimic-hidden")) {
      scene.anims.create({ key:"mimic-hidden", frames: scene.anims.generateFrameNumbers("mimic",{ frames:[0] }), frameRate:1, repeat:-1 });
    }
    if(!scene.anims.exists("mimic-revealed")) {
      scene.anims.create({ key:"mimic-revealed", frames: scene.anims.generateFrameNumbers("mimic",{ frames:[1,2] }), frameRate:2, repeat:-1 });
    }

    // Initial state: hidden
    this.state = "hidden";
    this.play("mimic-hidden");

    // Random patrol velocity
    this.vx = 0;
    this.vy = 0;
  }

  reveal() {
    if(this.state === "hidden") {
      this.state = "revealed";
      this.play("mimic-revealed");
      // Start moving in random direction
      this.vx = (Math.random() > 0.5 ? 1 : -1) * this.speed;
      this.vy = (Math.random() > 0.5 ? 1 : -1) * this.speed;
    }
  }

  update(time, delta) {
    if(this.state === "revealed") {
      this.x += this.vx * delta / 1000;
      this.y += this.vy * delta / 1000;

      if(this.body.blocked.left || this.body.blocked.right) this.vx *= -1;
      if(this.body.blocked.up || this.body.blocked.down) this.vy *= -1;
    }
  }
}

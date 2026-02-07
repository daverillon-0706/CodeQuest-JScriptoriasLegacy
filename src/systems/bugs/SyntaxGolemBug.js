import Bug from "../Bug.js";

export default class SyntaxGolemBug extends Bug {
  constructor(scene, x, y) {
    super(scene, x, y, "golem", { dmg: 2, detectRange: 2, speed: 0 });

    // Idle animation (2 frames)
    if(!scene.anims.exists("golem-idle")) {
      scene.anims.create({
        key: "golem-idle",
        frames: scene.anims.generateFrameNumbers("golem", { frames: [0,1] }),
        frameRate: 2,
        repeat: -1
      });
    }

    this.play("golem-idle");
  }

  update(time, delta) {
    // Static bug, no movement
  }
}

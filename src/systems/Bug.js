export default class Bug extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, key, typeData) {
    super(scene, x, y, key);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.scene = scene;
    this.typeData = typeData; // e.g., { dmg, detectRange, speed, errorCode }
    this.customData = typeData;

    this.setOrigin(0, 1);
    this.setCollideWorldBounds(true);

    this.speed = typeData.speed || 0; // default 0 for idle bugs
  }

  revealCode() {
    console.log(`Debug this bug: ${this.typeData.errorCode}`);
  }

  defeat() {
    this.scene.bugManager.removeBug(this);
  }

  update(time, delta) {
    // Override in subclasses
  }
}

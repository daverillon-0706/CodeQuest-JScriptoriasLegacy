// src/systems/Bug.js
import Phaser from "phaser";

export default class Bug extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, key="golem", data={}) {
    super(scene, x, y, key);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setOrigin(0, 1);
    this.setCollideWorldBounds(true);

    this.typeData = data;
  }

  update() {
    // default: do nothing
  }
}

import Bug from "../Bug.js";
import SyntaxGolemBug from "./SyntaxGolemBug.js";

export default class InternalRiftBug extends Bug {
  constructor(scene, x, y, bugType = SyntaxGolemBug) {
    const data = { summonInterval: 5000, errorCode: "InternalRift: summon bug" };
    super(scene, x, y, "internalRiftSprite", data);
    this.bugType = bugType;

    scene.time.addEvent({
      delay: this.typeData.summonInterval,
      loop: true,
      callback: () => this.summonBug()
    });
  }

  summonBug() {
    const spawnX = this.x + Phaser.Math.Between(-32, 32);
    const spawnY = this.y + Phaser.Math.Between(-32, 32);
    const bug = new this.bugType(this.scene, spawnX, spawnY);
    this.scene.bugManager.addBug(bug);
    console.log("Internal Rift summoned a bug!");
  }
}

// src/systems/bugs/InternalRiftBug.js
import Bug from "../Bug.js";

export default class InternalRiftBug extends Bug {
  constructor(scene, x, y, riftName) {
    const data = {
      summonCount: 4,
      cooldown: 120000 // 2 minutes
    };

    super(scene, x, y, "rift", data);

    this.body.setImmovable(true);
    this.body.setAllowGravity(false);

    this.riftName = riftName;
    this.isActive = false;
    this.onCooldown = false;

    // Set origin so bigger sprite aligns nicely
    this.setOrigin(0.5, 1);

    // Play idle animation (loop)
    this.anims.play("rift-idle", true);
  }

  activate() {
    if (this.isActive || this.onCooldown) return;

    console.log("🕳️ Rift opened:", this.riftName);
    this.isActive = true;

    // Visual spawn effect
    this.scene.cameras.main.shake(250, 0.005);

    this.summonBugs();
  }

  summonBugs() {
    console.log("🐛 Rift summoning bugs...");

    const bugManager = this.scene.bugManager;
    if (!bugManager) {
      console.warn("BugManager not found!");
      return;
    }

    for (let i = 0; i < this.typeData.summonCount; i++) {
      // Random offset around rift
      const offsetX = Phaser.Math.Between(-48, 48);
      const offsetY = Phaser.Math.Between(-32, 32);

      const spawnX = this.x + offsetX;
      const spawnY = this.y + offsetY;

      // Random bug type
      const bugTypes = ["slime", "wisp", "mimic", "golem"];
      const type = Phaser.Utils.Array.GetRandom(bugTypes);

      bugManager.spawnBug(type, spawnX, spawnY);
    }

    this.startCooldown();
  }

  startCooldown() {
    console.log("⏳ Rift cooldown started:", this.riftName);
    this.isActive = false;
    this.onCooldown = true;

    this.scene.time.delayedCall(this.typeData.cooldown, () => {
      console.log("✅ Rift ready again:", this.riftName);
      this.onCooldown = false;
    });
  }
}

// src/systems/BugManager.js
import Bug from "./Bug.js";
import SyntaxGolemBug from "./bugs/SyntaxGolemBug.js";
import RangeSlimeBug from "./bugs/RangeSlimeBug.js";
import TypeMimicBug from "./bugs/TypeMimicBug.js";
import ReferenceWispBug from "./bugs/ReferenceWispBug.js";

export default class BugManager {
  constructor(scene) {
    this.scene = scene;
    this.bugs = [];
    this.lockedBug = null;

    // 🔒 Max distance a bug can roam from spawn
    this.LEASH_DISTANCE = 120; // pixels (~7 tiles)
  }

  addBug(bug) {
    this.bugs.push(bug);

    // Ensure physics body exists
    if (!bug.body) {
      this.scene.physics.add.existing(bug);
    }

    // 🧭 Store spawn origin (for leash system)
    bug.spawnX = bug.x;
    bug.spawnY = bug.y;
  }

  update(time, delta) {
    this.bugs.forEach(bug => {
      if (bug.update) bug.update(time, delta);

      // =============================
      // 🧭 LEASH SYSTEM
      // =============================
      if (bug.spawnX !== undefined) {
        const dist = Phaser.Math.Distance.Between(
          bug.x,
          bug.y,
          bug.spawnX,
          bug.spawnY
        );

        if (dist > this.LEASH_DISTANCE) {
          // Move bug back to spawn
          this.scene.physics.moveTo(
            bug,
            bug.spawnX,
            bug.spawnY,
            40 // return speed
          );

          bug.isReturning = true;
        } else {
          bug.isReturning = false;
        }
      }
    });
  }

  updateHover(pointer) {
    const hoverBug = this.bugs.find(bug =>
      bug.getBounds().contains(pointer.worldX, pointer.worldY)
    );

    if (hoverBug) hoverBug.setTint(0x00ff00);
  }

  tryLockOn(pointer) {
    const bug = this.bugs.find(b =>
      b.getBounds().contains(pointer.worldX, pointer.worldY)
    );

    if (bug) this.lockedBug = bug;
  }

  spawnBug(type, x, y) {
    let bug;

    switch (type) {
      case "slime":
        bug = new RangeSlimeBug(this.scene, x, y, "slime");
        break;

      case "wisp":
        bug = new ReferenceWispBug(this.scene, x, y, "wisp");
        break;

      case "mimic":
        bug = new TypeMimicBug(this.scene, x, y, "mimic");
        break;

      case "golem":
        bug = new SyntaxGolemBug(this.scene, x, y, "golem");
        break;

      default:
        console.warn("Unknown bug type:", type);
        return;
    }

    // Add to systems
    this.addBug(bug);
    this.scene.bugGroup.add(bug);

    return bug;
  }
}

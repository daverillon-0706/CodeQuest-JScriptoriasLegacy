// src/systems/bugs/InternalRiftBug.js
import Bug from "../Bug.js";
import { RiftChallenges } from "../../ui/data/riftChallenges.js";
import GameState from "../../GameState.js";


export default class InternalRiftBug extends Bug {
  constructor(scene, x, y, riftName) {
  const data = {
    summonCount: 4,
    cooldown: 10000,
    spawnRadiusX: 48,
    spawnRadiusY: 32
  };

  // 1️⃣ Call parent constructor first
  super(scene, x, y, "rift", data);

  // 2️⃣ Assign properties after super
  this.riftName = riftName;

  this.challengePool = RiftChallenges[this.riftName] || [];

  this.body.setImmovable(true);
  this.body.setAllowGravity(false);
  this.setOrigin(0.5, 1);

  this.isActive = false;
  this.onCooldown = false;
  this.isRift = true;
  this.isInvincible = true;
  this.challengeIndex = 0;
  this.completed = false;
  this.maxChallenges = 5;

  this.hoverBlocks = [];

  // ==== INIT FROM GameState ====
  const gsRift = GameState.player.riftProgress[this.riftName];
  if (gsRift) {
    this.challengeIndex = gsRift.challengeIndex;
    this.completed = gsRift.completed;
    this.hasKey = gsRift.hasKey || false;
  } else {
    GameState.player.riftProgress[this.riftName] = {
      completed: false,
      challengeIndex: 0,
      hasKey: false
    };
  }

  this.anims.play("rift-idle", true);
}


advanceChallenge() {
  if (this.completed) return;

  this.challengeIndex++;

  const gsRift = GameState.player.riftProgress[this.riftName];
  gsRift.challengeIndex = this.challengeIndex;

  if (this.challengeIndex >= this.maxChallenges) {
    this.completed = true;
    gsRift.completed = true;
    gsRift.hasKey = true; // grant keystone
    console.log(`🗝️ Rift ${this.riftName} fully completed!`);
  }

  GameState.player.riftProgress[this.riftName] = gsRift;

  console.log(
    `🧩 Rift ${this.riftName} progress:`,
    this.challengeIndex,
    "/",
    this.maxChallenges
  );
}

  activate() {
  if (this.isActive) return;

  console.log(
  "Rift Progress:",
  this.challengeIndex,
  "/",
  this.maxChallenges
);

  console.log("🕳️ Rift opened:", this.riftName);

  this.isActive = true;

  // Camera feedback
  this.scene.cameras.main.shake(250, 0.005);

  if (this.scene.riftParticles) {
    this.scene.riftParticles.emitParticleAt(this.x, this.y, 20);
  }

  // 🔥 Initial summon
  this.summonBugs();

  // 🔁 Start looping summon every cooldown
  this.startSummonLoop();
}

summonBugs() {
    const bugManager = this.scene.bugManager;
    if (!bugManager) {
      console.warn("BugManager not found!");
      return;
    }

    const bugTypes = ["slime", "wisp", "mimic", "golem"];

    for (let i = 0; i < this.typeData.summonCount; i++) {
      const offsetX = Phaser.Math.Between(-this.typeData.spawnRadiusX, this.typeData.spawnRadiusX);
      const offsetY = Phaser.Math.Between(-this.typeData.spawnRadiusY, this.typeData.spawnRadiusY);
      const spawnX = this.x + offsetX;
      const spawnY = this.y + offsetY;

      const type = Phaser.Utils.Array.GetRandom(bugTypes);
      const bug = bugManager.spawnBug(type, this.x, this.y);

      this.scene.tweens.add({
        targets: bug,
        x: spawnX,
        y: spawnY,
        duration: 400,
        ease: "Power2"
      });
    }

    //this.startCooldown();
  }

startSummonLoop() {
  if (this.summonEvent) {
    console.log("Summon loop already exists");
    return;
  }

  console.log("Starting summon loop for:", this.riftName);

  this.summonEvent = this.scene.time.addEvent({
    delay: this.typeData.cooldown,
    loop: true,
    callback: () => {
      console.log("⏱️ Summon loop tick:", this.riftName);

      if (!this.isActive) {
        console.log("Rift inactive — skipping spawn");
        return;
      }

      this.summonBugs();
    }
  });
}

  defeat() {
  console.log("💥 Rift defeated:", this.riftName);

  this.isActive = false;

  if (this.summonEvent) {
    this.summonEvent.remove();
    this.summonEvent = null;
  }

  this.setVisible(false);
  this.body.enable = false;
}


  startCooldown() {
    this.isActive = false;
    this.onCooldown = true;

    this.scene.time.delayedCall(this.typeData.cooldown, () => {
      this.onCooldown = false;
      console.log("✅ Rift ready again:", this.riftName);
    });
  }

  showCodeBlocks(monolithType) {
    if (this.hoverBlocks.length > 0) return;

    const blocks = this.getCodeSamples(monolithType);

    blocks.forEach((text, index) => {
      const block = this.scene.add.text(
        this.x + 60,
        this.y + index * 20,
        text,
        { font: "14px monospace", fill: "#00ff00" }
      );
      this.hoverBlocks.push(block);
    });
  }

  hideCodeBlocks() {
    this.hoverBlocks.forEach(b => b.destroy());
    this.hoverBlocks = [];
  }

  update() {
    // Hover detection
    const pointer = this.scene.input.activePointer;
    if (Phaser.Geom.Rectangle.Contains(this.getBounds(), pointer.x, pointer.y)) {
      this.showCodeBlocks(this.riftName);

      // Open scene compiler when clicked
      if (
  pointer.isDown &&
  !this.scene.isCompilerOpen &&
  !this.isDormant
) {
  this.openCompiler();
}



    } else {
      this.hideCodeBlocks();
    }
  }

  // Only provide data; no HTML or old debug containers
  getCodeSamples() {
    const codeSamples = {
      Syntax: ["let x = 0;", "if (x === 0) {}", "function greet() {}"],
      Variables: ["var a;", "let b = 5;", "const c = 'hi';"],
      Functions: ["function sum(a,b){return a+b;}", "const fn = () => {}"],
      Array: ["[1,2,3]", "arr.push(4)", "arr[0]"],
      Conditions: ["if(x>0){ } else { }", "switch(val){}"],
      Operators: ["a + b", "x % 2", "y === z"],
      DataTypes: ["typeof x", "Boolean(true)", "Number('5')"]
    };

    return codeSamples[this.riftName] || ["// unknown rift type"];
  }

  openCompiler() {
  if (this.completed) return;

  const challenge =
    this.challengePool[this.challengeIndex];

  this.scene.openRiftCompiler({
    rift: this,
    challenge
  });
}

advanceChallenge() {
  if (this.completed) return;

  this.challengeIndex++;

  console.log(
    `🧩 Rift ${this.riftName} progress:`,
    this.challengeIndex,
    "/",
    this.maxChallenges
  );
}


}

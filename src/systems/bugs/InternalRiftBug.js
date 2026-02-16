// src/systems/bugs/InternalRiftBug.js
import Bug from "../Bug.js";

export default class InternalRiftBug extends Bug {
  constructor(scene, x, y, riftName) {
    const data = {
      summonCount: 4,
      cooldown: 10000, // 2 minutes
      spawnRadiusX: 48,
      spawnRadiusY: 32
    };

    super(scene, x, y, "rift", data);

    this.body.setImmovable(true);
    this.body.setAllowGravity(false);
    this.setOrigin(0.5, 1);

    this.riftName = riftName;
    this.isActive = false;
    this.onCooldown = false;
    this.isRift = true;
    this.isInvincible = true;

    this.hoverBlocks = [];

    this.anims.play("rift-idle", true);
  }

  activate() {
  if (this.isActive) return;

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
      this.scene.openRiftCompiler(this);
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
}

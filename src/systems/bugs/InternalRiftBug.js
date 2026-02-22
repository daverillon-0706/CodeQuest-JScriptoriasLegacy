import Bug from "../Bug.js";
import { RiftChallenges } from "../../ui/data/riftChallenges.js";
import GameState from "../../GameState.js";
import { normalizeRiftName } from "../../ui/data/riftIdMap.js";

export default class InternalRiftBug extends Bug {
  constructor(scene, x, y, riftName) {
    const data = {
      summonCount: 4,
      cooldown: 50000,
      spawnRadiusX: 48,
      spawnRadiusY: 32
    };
    super(scene, x, y, "rift", data);

    this.riftName = riftName;
    const key = normalizeRiftName(this.riftName);

    // Assign challenge pool dynamically
    this.challengePool = RiftChallenges[key] ?? [];
    this.maxChallenges = this.challengePool.length;

    this.body.setImmovable(true);
    this.body.setAllowGravity(false);
    this.setOrigin(0.5, 1);

    this.isActive = false;
    this.onCooldown = false;
    this.isRift = true;
    this.isInvincible = true;
    this.challengeIndex = 0;
    this.completed = false;
    this.hoverBlocks = [];

    // Load from GameState if exists
    const gsRift = GameState.player.riftProgress[this.riftName];
    if (gsRift) {
      this.challengeIndex = gsRift.challengeIndex ?? 0;
      this.completed = gsRift.completed ?? false;
    } else {
      GameState.player.riftProgress[this.riftName] = {
        completed: false,
        challengeIndex: 0
      };
    }

    this.anims.play("rift-idle", true);

    console.log("=== RIFT INIT DEBUG ===");
    console.log("Display Name:", this.riftName);
    console.log("Normalized Key:", key);
    console.log("Pool length:", this.challengePool.length);
    console.log("========================");
  }

  activate() {
    if (this.isActive || this.completed) return;

    console.log("---- ACTIVATE RIFT START ----");
    this.isActive = true;

    // Camera feedback
    this.scene.cameras.main.shake(250, 0.005);
    if (this.scene.riftParticles) {
      this.scene.riftParticles.emitParticleAt(this.x, this.y, 20);
    }

    // Initial summon
    this.summonBugs();

    // Start looping summon
    this.startSummonLoop();

    console.log("---- ACTIVATE RIFT END ----");
  }

  advanceChallenge() {
    if (this.completed) return;

    this.challengeIndex = Math.min(
        (this.challengeIndex ?? 0) + 1,
        this.maxChallenges
    );

    // 🔥 Get player ONCE
    const player = GameState.player;
    if (!player) return;

    player.riftProgress = player.riftProgress || {};

    if (!player.riftProgress[this.riftName]) {
        player.riftProgress[this.riftName] = {
            completed: false,
            challengeIndex: 0
        };
    }

    const gsRift = player.riftProgress[this.riftName];

    // Update save data
    gsRift.challengeIndex = this.challengeIndex;

    if (this.challengeIndex >= this.maxChallenges) {
        this.completed = true;
        gsRift.completed = true;

        console.log(`🏁 Rift ${this.riftName} completed!`);

        this.isActive = false;

        if (this.summonEvent) {
            this.summonEvent.remove();
            this.summonEvent = null;
        }

        this.scene.tweens.add({
            targets: this,
            scale: 0,
            duration: 300,
            ease: "Back.In",
            onComplete: () => this.destroy()
        });
    }

    // 🔥 IMPORTANT: write back through setter
    GameState.player = player;
}

  onChallengeSolved() {
    console.log(`✅ Challenge ${this.challengeIndex + 1} solved!`);
    this.advanceChallenge();

    if (!this.completed) this.openCompiler();
  }

  openCompiler() {
    if (this.completed) return;
    const challenge = this.challengePool[this.challengeIndex];
    this.scene.openRiftCompiler({ rift: this, challenge });
  }

  summonBugs() {
    if (!this.scene.bugManager) return;

    const bugTypes = ["slime", "wisp", "mimic", "golem"];
    for (let i = 0; i < this.typeData.summonCount; i++) {
      const offsetX = Phaser.Math.Between(-this.typeData.spawnRadiusX, this.typeData.spawnRadiusX);
      const offsetY = Phaser.Math.Between(-this.typeData.spawnRadiusY, this.typeData.spawnRadiusY);
      const spawnX = this.x + offsetX;
      const spawnY = this.y + offsetY;

      const type = Phaser.Utils.Array.GetRandom(bugTypes);
      const bug = this.scene.bugManager.spawnBug(type, this.x, this.y);

      this.scene.tweens.add({
        targets: bug,
        x: spawnX,
        y: spawnY,
        duration: 400,
        ease: "Power2"
      });
    }
  }

  startSummonLoop() {
    if (this.summonEvent || this.completed) return;

    this.summonEvent = this.scene.time.addEvent({
      delay: this.typeData.cooldown,
      loop: true,
      callback: () => {
        if (this.isActive) this.summonBugs();
      }
    });
  }

  defeat() {
    this.isActive = false;
    if (this.summonEvent) {
      this.summonEvent.remove();
      this.summonEvent = null;
    }

    this.scene.tweens.add({
      targets: this,
      scale: 0,
      duration: 300,
      ease: "Back.In",
      onComplete: () => this.destroy()
    });

    console.log("💥 Rift defeated:", this.riftName);
  }

  update() {
    const pointer = this.scene.input.activePointer;
    if (Phaser.Geom.Rectangle.Contains(this.getBounds(), pointer.x, pointer.y)) {
      this.showCodeBlocks(this.riftName);
      if (pointer.isDown && !this.scene.isCompilerOpen && !this.isDormant) {
        this.openCompiler();
      }
    } else {
      this.hideCodeBlocks();
    }
  }

  showCodeBlocks(monolithType) {
    if (this.hoverBlocks.length > 0) return;
    const blocks = this.getCodeSamples(monolithType);
    blocks.forEach((text, index) => {
      const block = this.scene.add.text(this.x + 60, this.y + index * 20, text, { font: "14px monospace", fill: "#00ff00" });
      this.hoverBlocks.push(block);
    });
  }

  hideCodeBlocks() {
    this.hoverBlocks.forEach(b => b.destroy());
    this.hoverBlocks = [];
  }

  getCodeSamples() {
    const samples = {
      Syntax: ["let x = 0;", "if (x === 0) {}", "function greet() {}"],
      Variables: ["var a;", "let b = 5;", "const c = 'hi';"],
      Functions: ["function sum(a,b){return a+b;}", "const fn = () => {}"],
      Array: ["[1,2,3]", "arr.push(4)", "arr[0]"],
      Conditions: ["if(x>0){ } else { }", "switch(val){}"],
      Operators: ["a + b", "x % 2", "y === z"],
      DataTypes: ["typeof x", "Boolean(true)", "Number('5')"]
    };
    return samples[this.riftName] || ["// unknown rift type"];
  }
}
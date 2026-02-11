import Bug from "../Bug.js";
import GameState from "../../GameState.js";

export default class SyntaxGolemBug extends Bug {
  constructor(scene, x, y) {
    const data = {
      dmg: 5,
      detectRadius: 3,
      slamRadius: 3,
      chargeTime: 2000
    };

    super(scene, x, y, "golem", data);

    this.isCharging = false;
    this.cooldown = false;
    this.hasSlammed = false; // <-- NEW safeguard

    this.setFrame(0);
    this.body.setImmovable(true);
  }

  update() {
    const player = this.scene.player;
    if (!player) return;
    if (this.isCharging || this.cooldown) return;

    const dist = Phaser.Math.Distance.Between(
      this.x, this.y,
      player.x, player.y
    );

    if (dist <= this.typeData.detectRadius * 16) {
      this.startCharge();
    }
  }

  // ================= CHARGE =================
  startCharge() {
    this.isCharging = true;
    this.hasSlammed = false; // reset per attack

    console.log("Golem charging...");

    this.flashTween = this.scene.tweens.add({
      targets: this,
      alpha: 0.3,
      duration: 150,
      yoyo: true,
      repeat: -1
    });

    this.scene.time.delayedCall(
      this.typeData.chargeTime,
      () => this.slam(),
      [],
      this
    );
  }

  // ================= SLAM =================
  slam() {
    if (this.hasSlammed) return; // <-- BLOCK multi-slam
    this.hasSlammed = true;

    console.log("GOLEM SLAM!");

    if (this.flashTween) {
      this.flashTween.stop();
      this.setAlpha(1);
    }

    this.setFrame(1);

    // Screen shake
    this.scene.cameras.main.shake(300, 0.01);

    // AoE visual
    const radius = this.typeData.slamRadius * 16;

    const circle = this.scene.add.circle(
      this.x,
      this.y,
      radius,
      0xff0000,
      0.35
    );

    this.scene.tweens.add({
      targets: circle,
      alpha: 0,
      duration: 400,
      onComplete: () => circle.destroy()
    });

    // ================= DAMAGE =================
    const player = this.scene.player;

    const dist = Phaser.Math.Distance.Between(
      this.x,
      this.y,
      player.x,
      player.y
    );

    if (dist <= radius && !player.invincible) {
  console.log("Player hit by Golem!");

  const dmg = this.typeData.dmg || 5;

  // ----------------------------
  // REAL HP SOURCE (GameState)
  // ----------------------------
  const gs = GameState.player;
  if (!gs) {
    console.warn("GameState.player missing!");
    return;
  }

  gs.hp = Math.max(gs.hp - dmg, 0);

  console.log(`[Damage] Player HP after slam: ${gs.hp}`);

  // Sync back to runtime sprite
  if (!player.customData) player.customData = {};
  player.customData.HP = gs.hp;

  GameState.player = gs;

  // ----------------------------
  // HUD UPDATE
  // ----------------------------
  if (window.updateHearts) {
    window.updateHearts(gs.hp, gs.max_hp ?? 12);
  }

  // ----------------------------
  // HIT REACTION
  // ----------------------------
  player.invincible = true;
  player.setTint(0xff0000);

  this.scene.time.delayedCall(800, () => {
    player.invincible = false;
    player.clearTint();
  });
}


    // ================= RESET =================
    this.scene.time.delayedCall(800, () => {
      this.setFrame(0);
      this.isCharging = false;
      this.cooldown = true;

      // Cooldown timer
      this.scene.time.delayedCall(3000, () => {
        this.cooldown = false;
      });
    });
  }

  // ================= OVERLAP HOOK =================
  dealDamage(player) {
    // Prevent overlap from forcing slams
    if (this.isCharging || this.cooldown) return;

    const dist = Phaser.Math.Distance.Between(
      this.x,
      this.y,
      player.x,
      player.y
    );

    if (dist <= this.typeData.detectRadius * 16) {
      this.startCharge();
    }
  }
}

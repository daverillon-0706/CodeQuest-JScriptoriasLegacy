import Bug from "../Bug.js";
import GameState from "../../GameState.js";

export default class ReferenceWispBug extends Bug {
  constructor(scene, x, y) {
    const data = {
      dmg: 1,
      detectRange: 7,
      errorCode: "ReferenceError: variable is not defined"
    };

    super(scene, x, y, "wisp", data);

    // --- Diagonal float movement ---
    const speed = Phaser.Math.Between(20, 40);
    const dirs = [
      { x: 1,  y: 1  },
      { x: -1, y: 1  },
      { x: 1,  y: -1 },
      { x: -1, y: -1 }
    ];
    const dir = Phaser.Utils.Array.GetRandom(dirs);

    this.body.setVelocity(dir.x * speed, dir.y * speed);
    this.body.setBounce(1, 1);
    this.body.setCollideWorldBounds(true);

    this.lastHit = 0; // timestamp of last hit
    this.hitCooldown = 800; // ms between hits
  }

  update(time) {
    const player = this.scene.player;
    if (!player) return;

    const dist = Phaser.Math.Distance.Between(
      this.x, this.y,
      player.x, player.y
    );

    if (dist <= this.typeData.detectRange * 16) {
      this.scene.physics.moveToObject(this, player, 70);
    }

    // Directional animation
    if (this.body.velocity.x > 0) this.anims.play("wisp-move-right", true);
    else if (this.body.velocity.x < 0) this.anims.play("wisp-move-left", true);
  }

  dealDamage(player) {
    const now = this.scene.time.now;

    if (!player.invincible && (now - this.lastHit > this.hitCooldown)) {
        console.log("Wisp hits player!");

        const dmg = this.typeData.dmg || 1;

        // 🔧 APPLY DAMAGE TO GAMESTATE FIRST (SOURCE OF TRUTH)
        //GameState.player.HP = Math.max(GameState.player.HP - dmg, 0);

        // ----------------------------
        // REAL HP SOURCE (GameState)
        // ----------------------------
        const gs = GameState.player;
        if (!gs) return;

        gs.hp = Math.max(gs.hp - dmg, 0);

        console.log(`[Damage] Player HP after hit: ${gs.hp}`);

        // 🔧 SYNC BACK TO PLAYER RUNTIME DATA
        player.customData.HP = gs.hp;

        GameState.player = gs;
        
        console.log(`Player HP: ${GameState.player.HP}`);

        // 🧾 Debug snapshot of save data
        console.log(
            "Save Snapshot:",
            JSON.stringify(GameState.player, null, 2)
        );

        // Update HUD
        if (window.updateHearts) {
            window.updateHearts(GameState.player.HP, 12);
        }

        // Flash + invincibility
        player.invincible = true;
        player.setTint(0xff0000);

        this.scene.time.addEvent({
            delay: 800,
            callback: () => {
                player.invincible = false;
                player.clearTint();
            }
        });

        // Camera shake
        console.log("Camera shake!");
        this.scene.cameras.main.shake(120, 0.008);

        this.lastHit = now;
    }
}
}

import Bug from "../Bug.js";
import GameState from "../../GameState.js";
import SoundManager from "../SoundManager.js";


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

    // Play sound
    this.scene.soundManager.play("player_hit");

    const dmg = this.typeData.dmg || 1;

    // Update GameState
    const gs = GameState.player;
    if (!gs) return;
    gs.hp = Math.max(gs.hp - dmg, 0);
    player.customData.HP = gs.hp;
    GameState.player = gs;

    // HUD
    if (window.updateHearts) window.updateHearts(gs.hp, 12);

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
    this.scene.cameras.main.shake(120, 0.008);

    this.lastHit = now;
}

}
}

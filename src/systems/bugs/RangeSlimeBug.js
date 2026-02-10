import Bug from "../Bug.js";

export default class RangeSlimeBug extends Bug {
  constructor(scene, x, y) {
    const data = {
      dmg: 2,
      detectRange: 7,
      moveTime: 5000,
      errorCode: "RangeError: index out of range"
    };
    super(scene, x, y, "slime", data);
    this.typeData = data;

    // Physics setup
    this.body.setCollideWorldBounds(true);
    this.body.setBounce(1, 1);

    // Random initial velocity
    const speed = 20 + Math.random() * 30;
    const angle = Math.random() * Math.PI * 2;
    this.body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);

    // Animation
    //this.anims.play('slime-idle-right');
    this.lastMove = 0;

    // Flags
    this.isCharging = false;  // whether slime is currently charging
    this.hasHit = false;      // prevents multiple hits per charge
  }

  update(time) {
    const player = this.scene.player;
    if (!player) return;

    // Charge logic
    if (time - this.lastMove > this.typeData.moveTime) {
      this.lastMove = time;

      const dx = player.x - this.x;
      const dy = player.y - this.y;
      const dist = Math.hypot(dx, dy);

      if (dist <= this.typeData.detectRange * 16) {
        console.log("Range Slime starts charging!");
        const speed = 60;
        this.scene.physics.moveToObject(this, player, speed);
        this.isCharging = true;
        this.hasHit = false;
      }
    }

    // Animate based on velocity
if (this.body.velocity.x > 5) {
  if (this.anims.currentAnim?.key !== "slime-move-right") {
    this.anims.play("slime-move-right", true);
  }
}
else if (this.body.velocity.x < -5) {
  if (this.anims.currentAnim?.key !== "slime-move-left") {
    this.anims.play("slime-move-left", true);
  }
}

  }

  dealDamage(player) {
    if (!player.invincible && this.isCharging && !this.hasHit) {
        console.log("Slime hits player!");
        const dmg = this.typeData.dmg || 2;

        // Apply damage
        player.customData.HP = Math.max(player.customData.HP - dmg, 0);
        console.log(`Player HP: ${player.customData.HP}`);

        // Update HUD
        if (window.updateHearts) window.updateHearts(player.customData.HP, 12);

        // Flash player
        player.invincible = true;
        player.setTint(0xff0000);
        this.scene.time.addEvent({
            delay: 800,
            callback: () => {
                player.invincible = false;
                player.clearTint();
            }
        });

        // Shake camera
        console.log("Camera shake!");
        this.scene.cameras.main.shake(150, 0.01); // 150ms, small intensity

        // Stop charging
        this.isCharging = false;
        this.hasHit = true;
        this.body.setVelocity(0);  // stops movement after hit
        console.log("Slime charge ended.");
    }
}


}

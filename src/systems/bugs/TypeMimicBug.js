import Bug from "../Bug.js";
import GameState from "../../GameState.js";

export default class TypeMimicBug extends Bug {
  constructor(scene, x, y) {
    const data = {
      dmg: 2,
      detectRange: 2,
      attackCooldown: 2000,
      revealDelay: 400,
      chargeSpeed: 120
    };
    super(scene, x, y, "mimic", data);

    this.isRevealed = false;
    this.isAttacking = false;
    this.cooldown = false;
    this.setFrame(0);
    this.body.setImmovable(true);
  }

  update() {
    const player = this.scene.player;
    if (!player) return;
    if (this.cooldown || this.isAttacking) return;

    const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
    if (dist <= this.typeData.detectRange * 16) {
      this.revealAndAttack(player);
    }
  }

  revealAndAttack(player) {
    if (this.isRevealed) return;

    this.isRevealed = true;
    this.isAttacking = true;
    this.setFrame(1);

    this.flashTween = this.scene.tweens.add({
      targets: this,
      alpha: 0.4,
      duration: 120,
      yoyo: true,
      repeat: -1
    });

    this.scene.time.delayedCall(
      this.typeData.revealDelay,
      () => this.charge(player),
      [],
      this
    );
  }

  charge(player) {
    if (this.flashTween) {
      this.flashTween.stop();
      this.setAlpha(1);
    }

    const targetX = player.x;
    const targetY = player.y;

    this.scene.physics.moveTo(this, targetX, targetY, this.typeData.chargeSpeed);

    this.chargeEvent = this.scene.time.addEvent({
      delay: 50,
      loop: true,
      callback: () => {
        const distToTarget = Phaser.Math.Distance.Between(this.x, this.y, targetX, targetY);
        if (distToTarget <= 4) {
          this.body.setVelocity(0);
          this.chargeEvent.remove(false);

          const distToPlayer = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
          if (distToPlayer <= 28 && !player.invincible) {
            const dmg = 3;
            this.scene.soundManager.play("player_hit");

            const gs = GameState.player;
            if (!gs) return;
            gs.hp = Math.max(gs.hp - dmg, 0);
            player.customData.HP = gs.hp;
            GameState.player = gs;

            if (window.updateHearts) window.updateHearts(gs.hp, gs.max_hp ?? 12);

            this.scene.cameras.main.shake(120, 0.004);
            player.invincible = true;
            player.setTint(0xff0000);
            this.scene.time.delayedCall(800, () => {
              player.invincible = false;
              player.clearTint();
            });

            this.startChase(player);
          } else {
            this.resetMimic();
          }
        }
      }
    });
  }

  startChase(player) {
    const MAX_CHASE_DIST = 150;
    const CHASE_SPEED = 40;
    let frameToggle = false;

    this.chaseEvent = this.scene.time.addEvent({
        delay: 50,
        loop: true,
        callback: () => {
            if (!player.active) return;

            const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
            if (dist > MAX_CHASE_DIST) {
                this.body.setVelocity(0);
                this.chaseEvent.remove(false);
                this.resetMimic();
                return;
            }

            // Calculate normalized direction vector toward player
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const magnitude = Math.hypot(dx, dy);
            if (magnitude > 0) {
                const vx = (dx / magnitude) * CHASE_SPEED;
                const vy = (dy / magnitude) * CHASE_SPEED;
                this.body.setVelocity(vx, vy);
            }

            // Animate
            frameToggle = !frameToggle;
            this.setFrame(frameToggle ? 1 : 2);

            // Only deal damage on actual overlap
            if (!player.invincible && Phaser.Geom.Intersects.RectangleToRectangle(this.getBounds(), player.getBounds())) {
                const dmg = 1;
                this.scene.soundManager.play("player_hit");

                const gs = GameState.player;
                if (!gs) return;
                gs.hp = Math.max(gs.hp - dmg, 0);
                player.customData.HP = gs.hp;
                GameState.player = gs;

                if (window.updateHearts) window.updateHearts(gs.hp, gs.max_hp ?? 12);

                this.scene.cameras.main.shake(120, 0.004);
                player.invincible = true;
                player.setTint(0xff0000);
                this.scene.time.delayedCall(800, () => {
                    player.invincible = false;
                    player.clearTint();
                });
            }
        }
    });
}


  resetMimic() {
    this.setFrame(0);
    this.isRevealed = false;
    this.isAttacking = false;
    this.cooldown = true;

    this.scene.time.delayedCall(this.typeData.attackCooldown, () => {
      this.cooldown = false;
    });
  }

  dealDamage(player) {
    if (this.cooldown || this.isAttacking) return;
    this.revealAndAttack(player);
  }
}

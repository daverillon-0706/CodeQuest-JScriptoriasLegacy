export default class BugManager {
  constructor() {
    this.scene = null;
    this.player = null;
    this.bugs = [];         // always initialize
    this.canInteractWithBug = null;
  }

  init(scene, player) {
    this.scene = scene;
    this.player = player;
  }

  registerBug(bug) {
    bug.triggered = false;
    bug.hoverIndicator = this.scene.add.text(bug.x + 8, bug.y - 12, "!", {
      font: "12px Arial",
      fill: "#ff0",
      fontStyle: "bold"
    }).setOrigin(0.5, 0.5).setDepth(20).setVisible(false);

    this.bugs.push(bug);
  }

  update() {
    this.canInteractWithBug = null;
    if (!this.bugs) return;

    this.bugs.forEach(bug => {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, bug.x, bug.y);

      if (dist < 20 && !bug.triggered) {
        bug.canInteract = true;
        bug.hoverIndicator.setVisible(true);
        this.canInteractWithBug = bug;
      } else {
        bug.canInteract = false;
        bug.hoverIndicator.setVisible(false);
      }
    });
  }

  interactWithBug() {
  const bug = this.canInteractWithBug;
  if (!bug || bug.triggered) return;

  bug.triggered = true;
  this.scene.scene.pause();
  this.scene.scene.launch("BattleScene", {
    playerHP: this.scene.playerHP,
    playerEnergy: this.scene.playerEnergy,
    playerCoins: this.scene.playerCoins
  });
}

}

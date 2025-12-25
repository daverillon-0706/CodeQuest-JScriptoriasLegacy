// src/scenes/DeepWebScene.js
import Phaser from "phaser";
import DialogueManager from "../systems/DialogueManager.js";
import PlayerController from "../systems/PlayerController.js";
import HoverManager from "../systems/HoverManager.js";
import GameState from "../GameState.js";

export default class DeepWebScene extends Phaser.Scene {
  constructor() {
    super("DeepWebScene");

    this.TILE_SIZE = 16;
    this.MOVE_SPEED = 80;

    this.player = null;
    this.map = null;

    this.playerHP = 100;
    this.playerEnergy = 50;
    this.playerCoins = 0;

    this.playerController = null;
    this.dialogueManager = null;
  }

  preload() {
    // ---- TILEMAP ----
    this.load.tilemapTiledJSON("deepweb", "/maps/DeepWeb.tmj");

    // ---- TILESETS ----
    this.load.image("abyss", "/assets/tilesets/deepweb/abyss.png");
    this.load.image("corrupted_road", "/assets/tilesets/deepweb/corrupted_road.png");
    this.load.image("corruption_guild", "/assets/tilesets/deepweb/corruption_guild.png");
    this.load.image("corruption_static", "/assets/tilesets/deepweb/corruption_static.png");
    this.load.image("git_terminal", "/assets/tilesets/deepweb/git_terminal.png");

    // ---- SPRITES ----
    this.load.spritesheet("player_male", "/assets/sprites/player/player_male.png", {
      frameWidth: 16,
      frameHeight: 16
    });

    this.load.spritesheet("bug", "/assets/sprites/bug/bug.png", {
      frameWidth: 16,
      frameHeight: 16
    });
  }

  create(data = {}) {
    // ---- PLAYER DATA ----
    this.playerHP = data.playerHP ?? this.playerHP;
    this.playerEnergy = data.playerEnergy ?? this.playerEnergy;
    this.playerCoins = data.playerCoins ?? this.playerCoins;

    // ---- TILEMAP ----
    this.map = this.make.tilemap({ key: "deepweb" });

    const tilesets = this.map.tilesets.map(ts =>
      this.map.addTilesetImage(ts.name, ts.name)
    );

    // ---- LAYERS (BOTTOM → TOP) ----
    const abyssLayer = this.map.createLayer("abyss layer", tilesets, 0, 0);
    const lowerRoadLayer = this.map.createLayer("lower road layer", tilesets, 0, 0);
    const upperRoadLayer = this.map.createLayer("upper road layer", tilesets, 0, 0);
    const objectLayer = this.map.createLayer("object layer", tilesets, 0, 0);
    const buildingLayer = this.map.createLayer("building layer", tilesets, 0, 0);
    const overlayLayer = this.map.createLayer("overlay layer", tilesets, 0, 0);

    // ---- COLLISIONS ----
    [objectLayer, buildingLayer].forEach(layer =>
      layer.setCollisionByExclusion([-1])
    );

    // ---- SPAWN ----
    const spawnLayer = this.map.getObjectLayer("Objects");
    const spawnObj = spawnLayer?.objects.find(o => o.name === "PlayerSpawn");
    const spawnX = spawnObj ? spawnObj.x : 100;
    const spawnY = spawnObj ? spawnObj.y : 100;

    this.player = this.physics.add
      .sprite(spawnX, spawnY, "player_male", 0)
      .setOrigin(0, 1)
      .setSize(12, 8)
      .setOffset(2, 8);

    if (GameState) GameState.player = this.player;

    // ---- CAMERA ----
    this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    this.cameras.main
      .setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels)
      .startFollow(this.player, true, 0.08, 0.08)
      .setZoom(3);

    // ---- COLLIDERS ----
    this.physics.add.collider(this.player, objectLayer);
    this.physics.add.collider(this.player, buildingLayer);

    // ---- PLAYER CONTROLLER ----
    this.playerController = new PlayerController(this, this.player, this.MOVE_SPEED);

    // ---- DIALOGUE MANAGER ----
    this.dialogueManager = DialogueManager;
    this.dialogueManager.init(this);

    // ---- ABYSS CHECK ----
    this.abyssLayer = abyssLayer;
    this.gitTerminalSpawn = { x: spawnX, y: spawnY };
  }

  update() {
    if (!this.playerController) return;

    this.playerController.update();

    this.checkAbyssFall();
  }
  
  checkAbyssFall() {
  const tileX = this.abyssLayer.worldToTileX(this.player.x);
  const tileY = this.abyssLayer.worldToTileY(this.player.y);

  const tile = this.abyssLayer.getTileAt(tileX, tileY);

  // No tile = abyss
  if (!tile) {
    this.handleAbyssFall();
  }
}
        handleAbyssFall() {
  if (this.falling) return;
  this.falling = true;

  // Temporary disappearance
  this.player.setVisible(false);
  this.player.body.enable = false;

  // Damage
  this.playerHP = Math.max(0, this.playerHP - 30);
  document.getElementById("playerHP").textContent = this.playerHP;

  this.time.delayedCall(600, () => {
    // Teleport back to Git Terminal
    this.player.setPosition(
      this.gitTerminalSpawn.x,
      this.gitTerminalSpawn.y
    );

    this.player.setVisible(true);
    this.player.body.enable = true;
    this.falling = false;
  });
}

}



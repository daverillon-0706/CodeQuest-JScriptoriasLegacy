// src/scenes/OrinsAcademyScene.js
import Phaser from "phaser";
import PlayerController from "../systems/PlayerController.js";
// import DialogueManager from "../systems/DialogueManager.js";

export default class OrinsAcademyScene extends Phaser.Scene {
  constructor() {
    super("OrinsAcademyScene");

    this.TILE_SIZE = 16;
    this.MOVE_SPEED = 80;

    this.player = null;
    this.map = null;
    this.playerController = null;
  }

  preload() {
    // Tilemap
    this.load.tilemapTiledJSON("orins_academy_map", "/maps/Orins Academy.tmj");

    // Tilesets (embedded expected) 
    this.load.image("floor", "/assets/tilesets/orinsacademy/floor.png");
    this.load.image("lowerwall", "/assets/tilesets/orinsacademy/lowerwall.png");
    this.load.image("upperwall", "/assets/tilesets/orinsacademy/upperwall.png");
    this.load.image("stairs", "/assets/tilesets/orinsacademy/stairs.png" );
    this.load.image("door", "/assets/tilesets/orinsacademy/door.png")

    // Player sprite character animation// 
    this.load.spritesheet("player_male", "/assets/sprites/player/player_male.png", {
      frameWidth: 16,
      frameHeight: 16,
    });
  }

  create(data = {}) {

    // ---- MAP ----
    this.map = this.make.tilemap({ key: "orins_academy_map" });

    const tilesets = [
        this.map.addTilesetImage("floor", "floor"),
        this.map.addTilesetImage("lowerwall", "lowerwall"),
        this.map.addTilesetImage("upperwall", "upperwall"),
        this.map.addTilesetImage("stairs", "stairs"),
        this.map.addTilesetImage("door", "door")
    ];

    // ---- LAYERS ----
    const groundLayer = this.map.createLayer("ground floor 1", tilesets, 0, 0);
    const stairLayer = this.map.createLayer("stairs 1", tilesets, 0, 0);
    const collisionStairLayer = this.map.createLayer("collision stairs", tilesets, 0, 0);
    const lowerWallLayer = this.map.createLayer("lower wall 1", tilesets, 0, 0);
    const upperWallLayer = this.map.createLayer("upper wall 1", tilesets, 0, 0);
    const upperBorderLayer = this.map.createLayer("upper border 1", tilesets, 0, 0);


    console.log(this.map.layers.map(l => l.name));

    // ---- COLLISION LAYERS (invisible) ----
    const stairCollision = this.map.getLayer("collision stairs")?.tilemapLayer;
    const interiorWallLayer = this.map.getLayer("interior walls")?.tilemapLayer;

    if (stairCollision) stairCollision.setCollisionByExclusion([-1]);
    lowerWallLayer.setCollisionByExclusion([-1]);
    if (interiorWallLayer) interiorWallLayer.setCollisionByExclusion([-1]);

    // ---- SPAWN ----
    const spawnLayer = this.map.getObjectLayer("Objects");
    let spawnX = 400, spawnY = 400;

    if (data.spawn && spawnLayer) {
        const spawnObj = spawnLayer.objects.find(o => o.name === data.spawn);
        if (spawnObj) {
            spawnX = spawnObj.x;
            spawnY = spawnObj.y;
        }
    }

    // ---- PLAYER Spritesheet--// 
    this.player = this.physics.add.sprite(spawnX, spawnY, "player_male", 0)
        .setOrigin(0, 1)
        .setSize(12, 8)
        .setOffset(2, 8); 

    // ---- CAMERA ----
    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08).setZoom(3);

    // ---- PLAYER CONTROLLER ----
    this.playerController = new PlayerController(this, this.player, this.MOVE_SPEED);

    // ---- DEPTH ----
    groundLayer.setDepth(0);
    stairLayer.setDepth(1);
    lowerWallLayer.setDepth(2);
    this.player.setDepth(5);
    upperWallLayer.setDepth(10);
    upperBorderLayer.setDepth(12);

    // ---- COLLIDERS ----
    this.physics.add.collider(this.player, lowerWallLayer);
    if (interiorWallLayer) this.physics.add.collider(this.player, interiorWallLayer);
    if (stairCollision) this.physics.add.collider(this.player, stairCollision);

    // ---- DOORS ----
    this.setupDoors();

    // Z-KEY → DOOR INTERACT- Interact to entire NPC// 
    this.input.keyboard.on("keydown-Z", () => {
        const doorLayer = this.map.getObjectLayer("door objects");
        const result = this.handleDoorInteraction(doorLayer);

        if (result && result.targetScene) {
            this.scene.start(result.targetScene, {
                spawn: result.name,
                playerHP: data.playerHP,
                playerEnergy: data.playerEnergy,
                playerCoins: data.playerCoins
            });
        }
    });

    // ---- ANIMATIONS ----
    this.createAnimations();
}



  update() {
    if (this.playerController) {
      this.playerController.update();
    }
  }

  // ---- ANIMATIONS ----
  createAnimations() {
    const anims = this.anims;

    if (!anims.exists("walk-down"))
      anims.create({
        key: "walk-down",
        frames: anims.generateFrameNumbers("player_male", { start: 0, end: 2 }),
        frameRate: 12,
        repeat: -1,
      });

    if (!anims.exists("walk-right"))
      anims.create({
        key: "walk-right",
        frames: anims.generateFrameNumbers("player_male", { start: 3, end: 5 }),
        frameRate: 12,
        repeat: -1,
      });

    if (!anims.exists("walk-left"))
      anims.create({
        key: "walk-left",
        frames: anims.generateFrameNumbers("player_male", { start: 6, end: 8 }),
        frameRate: 12,
        repeat: -1,
      });

    if (!anims.exists("walk-up"))
      anims.create({
        key: "walk-up",
        frames: anims.generateFrameNumbers("player_male", { start: 9, end: 11 }),
        frameRate: 12,
        repeat: -1,
      });
  }

  // ---- DOOR VISUAL DEBUG ----
    setupDoors() {
    const doorLayer = this.map.getObjectLayer('door objects');
    if (!doorLayer) {
        console.warn("No 'door objects' layer found in this map!");
        this.doors = [];
        return;
    }

    doorLayer.objects.forEach(door => { door.y += this.TILE_SIZE; });

    doorLayer.objects.forEach(door => {
        const g = this.add.graphics();
        g.lineStyle(1, 0xff0000, 0.7);
        g.strokeRect(door.x, door.y, door.width, door.height);
    });

    this.doors = doorLayer.objects;
}


  // ---- UNIVERSAL DOOR HANDLER (same as JScriptoriaScene) ----
  handleDoorInteraction(doorLayer) {
    const player = this.player;
    const objects = doorLayer?.objects || [];

    for (const door of objects) {
      const rect = new Phaser.Geom.Rectangle(door.x, door.y, door.width, door.height);

      if (Phaser.Geom.Rectangle.Contains(rect, player.x, player.y)) {
        const targetProp = door.properties?.find(p => p.name === "targetScene");
        const targetScene = targetProp?.value ?? null;

        return {
          name: door.name,
          targetScene,
        };
      }
    }

    return null;
  }
}

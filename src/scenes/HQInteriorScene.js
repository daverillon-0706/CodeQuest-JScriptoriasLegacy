// src/scenes/HQInteriorScene.js
import Phaser from "phaser";
import DialogueManager from "../systems/DialogueManager.js";
import PlayerController from "../systems/PlayerController.js";
import BugManager from "../systems/BugManager.js";
import HoverManager from "../systems/HoverManager.js";
import GameState from "../GameState.js";
import { setupSceneTriggers } from "/src/utils/SceneTransitions.js";

export default class HQInteriorScene extends Phaser.Scene {
  constructor() {
    super("HQInteriorScene");

    this.TILE_SIZE = 16;
    this.MOVE_SPEED = 80;

    this.player = null;
    this.map = null;
    this.npcs = [];
    this.buildings = [];
    this.canTalkTo = null;

    this.dialogueManager = null;
    this.playerController = null;
    this.bugManager = null;
  }

  preload() {
    // Tilemap
    this.load.tilemapTiledJSON("hq_interiors", "/maps/hq_interiors_v2.tmj");

    // Tilesets
    this.load.image("hq_floor-sheet", "/assets/tilesets/hqinterior/hq_floor-sheet.png");
    this.load.image("hqinteriorwall_floor", "/assets/tilesets/hqinterior/hqinteriorwall_floor.png");

    // Sprites
    this.load.spritesheet("player_male", "/assets/sprites/player/player_male.png", { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet("bug", "/assets/sprites/bug/bug.png", { frameWidth: 16, frameHeight: 16 });

    ["elysia", "kaelen", "selena", "orin", "mira"].forEach(name =>
      this.load.spritesheet(name, `/assets/sprites/npc/${name}.png`, { frameWidth: 16, frameHeight: 16 })
    );
  }

  create(data = {}) {
    this.transitioning = false;

    // ---- Map & Layers ----
    this.map = this.make.tilemap({ key: "hq_interiors" });
    const floorTiles = this.map.addTilesetImage("hq_floor-sheet", "hq_floor-sheet");
    const wallTiles = this.map.addTilesetImage("hqinteriorwall_floor", "hqinteriorwall_floor");

    this.floorLayer = this.map.createLayer("hq floor", floorTiles, 0, 0);
    this.wallLayer = this.map.createLayer("hq walls", wallTiles, 0, 0);
    this.wallLayer.setCollisionByExclusion([-1]);

    // ---- Player Spawn ----
    const spawnLayer = this.map.getObjectLayer("Objects");
    const spawnObj =
      spawnLayer?.objects.find(o => o.name === data.spawn) ||
      spawnLayer?.objects.find(o => o.name === "MalePlayer") ||
      { x: 80, y: 80 };

    const spawnX = Math.round(spawnObj.x / this.TILE_SIZE) * this.TILE_SIZE;
    const spawnY = Math.round(spawnObj.y / this.TILE_SIZE) * this.TILE_SIZE;

    this.player = this.physics.add.sprite(spawnX, spawnY, "player_male", 0)
      .setOrigin(0, 1)
      .setDepth(10)
      .setCollideWorldBounds(true)
      .setSize(12, 8)
      .setOffset(2, 8);

    this.physics.add.collider(this.player, this.wallLayer);

    this.player.customData = {
      HP: data.playerHP ?? 100,
      Energy: data.playerEnergy ?? 50,
      Coins: data.playerCoins ?? 0
    };

    GameState.player = this.player;

    // ---- Camera ----
    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08).setZoom(3);
    this.cameras.main.roundPixels = true;

    // ---- Animations ----
    this.createAnimations();

    // ---- Player Controller ----
    this.playerController = new PlayerController(this, this.player, this.MOVE_SPEED);

    // ---- Dialogue Manager ----
    const dialogueBoxEl = document.getElementById("dialogue-box");
    const dialogueTextEl = document.getElementById("dialogue-text");
    const dialogueNextEl = document.getElementById("dialogue-next");

    this.dialogueManager = DialogueManager;
    this.dialogueManager.init(this);
    this.dialogueManager.setDomElements({ dialogueBox: dialogueBoxEl, dialogueText: dialogueTextEl, nextBtn: dialogueNextEl });

    if (dialogueNextEl) {
      dialogueNextEl.removeEventListener?.("click", this._nextBtnHandler);
      this._nextBtnHandler = () => { if (!this.dialogueManager.isTyping) this.dialogueManager.next(); };
      dialogueNextEl.addEventListener("click", this._nextBtnHandler);
    }

    // ---- Scene Triggers (doors) ----
    this.sceneTriggers = setupSceneTriggers(this, this.map, this.player);

    // ---- Bug Manager ----
    this.bugManager = new BugManager();
    this.bugManager.init(this, this.player);

    const bugLayer = this.map.getObjectLayer("bug objects");
    if (bugLayer) {
      bugLayer.objects.forEach(obj => {
        const bug = this.physics.add.sprite(
          Math.round(obj.x / this.TILE_SIZE) * this.TILE_SIZE,
          Math.round(obj.y / this.TILE_SIZE) * this.TILE_SIZE,
          "bug"
        )
          .setOrigin(0, 1)
          .setImmovable(true)
          .play("bug_idle");

        this.bugManager.registerBug(bug);
      });
    }

    // ---- NPCs ----
    this.createNPCs();

    // ---- Z key interactions ----
    this.input.keyboard.on("keydown-Z", () => {
  if (this.dialogueManager.activeDialogue) {
    if (this.dialogueManager.isTyping) this.dialogueManager._finishTypingInstant();
    else this.dialogueManager.next();
    return;
  }

  const npc = this.playerController.canTalkTo;  // Make sure PlayerController properly sets this
  if (npc && npc.customData?.dialogue?.length) {
    this.dialogueManager.start(npc.customData.dialogue);
    return;
  }

  if (this.bugManager?.interactWithBug()) return;

  const trigger = this.sceneTriggers?.getNearbyTrigger();
  if (trigger) {
    this.sceneTriggers.activateTrigger(trigger, {
      playerHP: this.player.customData.HP,
      playerEnergy: this.player.customData.Energy,
      playerCoins: this.player.customData.Coins
    });
  }
});

    // ---- Hover Manager ----
    this.hoverManager = new HoverManager(this);
    this.hoverManager.init();
    this.npcs.forEach(npc => this.hoverManager.register(npc, "NPC: " + (npc.name || "Unknown")));
    (this.bugManager?.bugs || []).forEach(bug => this.hoverManager.register(bug, "Bug"));
    this.buildings.forEach(building => this.hoverManager.register(building, "Building: " + (building.name || "Unknown")));

    // ---- Worldstep proximity ----
    this.physics.world.on("worldstep", () => {
  this.playerController.canTalkTo = null;

  this.npcs.forEach(npc => {
    if (!npc?.body) return;
    if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.body, npc.body)) {
      this.playerController.canTalkTo = npc;
      // Debug log
      // console.log("Near NPC:", npc.name);
    }
  });

  this.dialogueManager.updateProximity(this.player, this.npcs);
});

  }

  update() {
    if (!this.playerController) return;

    this.canTalkTo = this.playerController.update(this.npcs);
    if (this.bugManager) this.bugManager.update();
  }

  createAnimations() {
    const anims = this.anims;

    if (!anims.exists("walk-down"))
      anims.create({ key: "walk-down", frames: anims.generateFrameNumbers("player_male", { start: 0, end: 2 }), frameRate: 12, repeat: -1 });
    if (!anims.exists("walk-right"))
      anims.create({ key: "walk-right", frames: anims.generateFrameNumbers("player_male", { start: 3, end: 5 }), frameRate: 12, repeat: -1 });
    if (!anims.exists("walk-left"))
      anims.create({ key: "walk-left", frames: anims.generateFrameNumbers("player_male", { start: 6, end: 8 }), frameRate: 12, repeat: -1 });
    if (!anims.exists("walk-up"))
      anims.create({ key: "walk-up", frames: anims.generateFrameNumbers("player_male", { start: 9, end: 11 }), frameRate: 12, repeat: -1 });

    if (!anims.exists("bug_idle"))
      anims.create({ key: "bug_idle", frames: anims.generateFrameNumbers("bug", { start: 0, end: 3 }), frameRate: 6, repeat: -1 });
  }

  createNPCs() {
  const npcLayer = this.map.getObjectLayer("npc object");
  if (!npcLayer) return;

  this.npcs = [];

  npcLayer.objects.forEach(obj => {
    const x = Math.round(obj.x / this.TILE_SIZE) * this.TILE_SIZE;
    const y = Math.round(obj.y / this.TILE_SIZE) * this.TILE_SIZE;

    const spriteKey = obj.name || "elysia";
    const npc = this.physics.add.sprite(x, y, spriteKey, 0)
      .setOrigin(0, 1)
      .setImmovable(true)
      .setSize(12, 8)      // Match player size
      .setOffset(2, 8);    // Match player offset

    npc.name = spriteKey;

    // Dialogue
    npc.customData = {};
    const dialogueProp = obj.properties?.find(p => p.name.toLowerCase().includes("dialogue"));
    if (dialogueProp?.value) {
      try { npc.customData.dialogue = JSON.parse(dialogueProp.value); }
      catch { npc.customData.dialogue = [dialogueProp.value]; }
    } else npc.customData.dialogue = [];

    this.physics.add.collider(this.player, npc);

    this.npcs.push(npc);
  });
}

}

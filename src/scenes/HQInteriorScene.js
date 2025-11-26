// src/scenes/HQInteriorScene.js
import Phaser from "phaser";
import DialogueManager from "../systems/DialogueManager.js";
import PlayerController from "../systems/PlayerController.js";
import BugManager from "../systems/BugManager.js";
import HoverManager from "../systems/HoverManager.js";
import { GameState } from "../GameState.js";

export default class HQInteriorScene extends Phaser.Scene {
  constructor() {
    super("HQInteriorScene");

    this.TILE_SIZE = 16;
    this.MOVE_SPEED = 80;

    // Core
    this.player = null;
    this.map = null;
    this.npcs = [];
    this.canTalkTo = null;

    // Dialogue system (global)
    this.dialogueManager = null;

    // Player controller
    this.playerController = null;

    // Player stats
    this.playerHP = 100;
    this.playerEnergy = 50;
    this.playerCoins = 0;

    this.buildings = [];
  }

  preload() {
    // ---- Tilemap ----
    this.load.tilemapTiledJSON("hq_interiors", "/maps/hq_interiors_v2.tmj");

    // ---- Tilesets ----
    this.load.image("hq_floor-sheet", "/assets/tilesets/hqinterior/hq_floor-sheet.png");
    this.load.image("hqinteriorwall_floor", "/assets/tilesets/hqinterior/hqinteriorwall_floor.png");

    // ---- Sprites ----
    this.load.spritesheet("bug", "/assets/sprites/bug/bug.png", { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet("player_male", "/assets/sprites/player/player_male.png", { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet("elysia", "/assets/sprites/npc/elysia.png", { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet("kaelen", "/assets/sprites/npc/kaelen.png", { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet("selena", "/assets/sprites/npc/selena.png", { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet("orin", "/assets/sprites/npc/orin.png", { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet("mira", "/assets/sprites/npc/mira.png", { frameWidth: 16, frameHeight: 16 });
  }

  create(data = {}) {
    // ---- DOM (UI) ----
    const dialogueBoxEl = document.getElementById("dialogue-box");
    const dialogueTextEl = document.getElementById("dialogue-text");
    const dialogueNextEl = document.getElementById("dialogue-next");

    this.playerHPEl = document.getElementById("playerHP");
    this.playerEnergyEl = document.getElementById("playerEnergy");
    this.playerExpEl = document.getElementById("playerExp");

    this.playerHP = data.playerHP ?? this.playerHP;
    this.playerEnergy = data.playerEnergy ?? this.playerEnergy;
    this.playerCoins = data.playerCoins ?? this.playerCoins;

    if (this.playerHPEl) this.playerHPEl.textContent = this.playerHP;
    if (this.playerEnergyEl) this.playerEnergyEl.textContent = this.playerEnergy;
    if (this.playerExpEl) this.playerExpEl.textContent = data.playerExp ?? 120;

    // ---- Map ----
    this.map = this.make.tilemap({ key: "hq_interiors" });
    const floorTiles = this.map.addTilesetImage("hq_floor-sheet", "hq_floor-sheet");
    const wallTiles = this.map.addTilesetImage("hqinteriorwall_floor", "hqinteriorwall_floor");

    const floorLayer = this.map.createLayer("hq floor", floorTiles, 0, 0);
    const wallLayer = this.map.createLayer("hq walls", wallTiles, 0, 0);
    wallLayer.setCollisionByExclusion([-1]);

    const bugLayer = this.map.getObjectLayer("bug objects");
    const doorLayer = this.map.getObjectLayer("door objects");

    // ---- Player Spawn ----
    const spawnObj = doorLayer?.objects.find(o => o.name === (data.spawn || "hqdoor1")) || { x: 80, y: 80 };
    const spawnX = spawnObj.x;
    const spawnY = spawnObj.y - this.TILE_SIZE;

    this.player = this.physics.add.sprite(spawnX, spawnY, "player_male", 0)
      .setOrigin(0, 1)
      .setDepth(10)
      .setCollideWorldBounds(true)
      .setSize(12, 8)
      .setOffset(2, 8);

    this.physics.add.collider(this.player, wallLayer);

    // ---- Assign to global GameState for HUD ----
    GameState.player = this.player;

    // ---- Player Controller ----
    this.playerController = new PlayerController(this, this.player, this.MOVE_SPEED);

    // ---- Animations ----
    this.createAnimations();

    // ---- Camera ----
    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1).setZoom(3);
    this.cameras.main.roundPixels = true;

    // ---- Bugs ----
    this.bugManager = new BugManager();
    this.bugManager.init(this, this.player);

    if (bugLayer) {
      bugLayer.objects.forEach(obj => {
        const bug = this.physics.add.sprite(obj.x, obj.y - this.TILE_SIZE, "bug")
          .setOrigin(0, 1)
          .setImmovable(true)
          .play("bug_idle");

        this.bugManager.registerBug(bug);
      });
    }

    // ---- NPCs ----
    this.createNPCs();

    // ---- Dialogue Manager ----
    this.dialogueManager = DialogueManager;
    this.dialogueManager.init(this);
    this.dialogueManager.setDomElements({
      dialogueBox: dialogueBoxEl,
      dialogueText: dialogueTextEl,
      nextBtn: dialogueNextEl
    });

    if (dialogueNextEl) {
      dialogueNextEl.removeEventListener?.("click", this._nextBtnHandler);
      this._nextBtnHandler = () => {
        if (this.dialogueManager.isTyping) return;
        this.dialogueManager.next();
      };
      dialogueNextEl.addEventListener("click", this._nextBtnHandler);
    }

    // ---- Worldstep for proximity detection ----
    this.physics.world.on("worldstep", () => {
      this.canTalkTo = null;
      this.npcs.forEach(npc => {
        if (!npc?.body) return;
        if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.body, npc.body)) {
          this.canTalkTo = npc;
        }
      });
      this.dialogueManager.updateProximity(this.player, this.npcs);
    });

    // ---- Z-handler for interactions ----
    this.input.keyboard.on("keydown-Z", () => {
      if (this.dialogueManager.activeDialogue) {
        if (this.dialogueManager.isTyping) this.dialogueManager._finishTypingInstant();
        else this.dialogueManager.next();
        return;
      }

      const npc = this.playerController.canTalkTo;
      if (npc && npc.dialogue?.length > 0) {
        this.dialogueManager.start(npc.dialogue);
        return;
      }

      const result = this.dialogueManager.handleZKey(doorLayer);
      if (result && result.name) {
        this.scene.launch("JScriptoriaScene", {
          spawn: result.name,
          playerHP: this.playerHP,
          playerEnergy: this.playerEnergy,
          playerCoins: this.playerCoins,
          playerX: this.player.x,
          playerY: this.player.y
        });
        this.scene.sleep();
        return;
      }

      if (this.bugManager) this.bugManager.interactWithBug();
    });

    // ---- Hover Manager ----
    this.hoverManager = new HoverManager(this);
    this.hoverManager.init();
    this.npcs.forEach(npc => this.hoverManager.register(npc, "NPC: " + (npc.name || "Unknown")));
    (this.bugManager?.bugs || []).forEach(bug => this.hoverManager.register(bug, "Bug: Tiny pest"));
    this.buildings.forEach(building => this.hoverManager.register(building, "Building: " + building.name));

    // ---- Scene lifecycle ----
    this.events.on("shutdown", this.onShutdown, this);
    this.events.on("sleep", this.onSleep, this);
    this.events.on("wake", this.onWake, this);
  }

  update() {
    if (!this.playerController) return;

    this.canTalkTo = this.playerController.update(this.npcs);

    if (this.bugManager) this.bugManager.update();
  }

  // ---- Animations ----
  createAnimations() {
    const anims = this.anims;
    if (!anims.exists("walk-down")) anims.create({
      key: "walk-down",
      frames: anims.generateFrameNumbers("player_male", { start: 0, end: 2 }),
      frameRate: 12,
      repeat: -1
    });
    if (!anims.exists("walk-right")) anims.create({
      key: "walk-right",
      frames: anims.generateFrameNumbers("player_male", { start: 3, end: 5 }),
      frameRate: 12,
      repeat: -1
    });
    if (!anims.exists("walk-left")) anims.create({
      key: "walk-left",
      frames: anims.generateFrameNumbers("player_male", { start: 6, end: 8 }),
      frameRate: 12,
      repeat: -1
    });
    if (!anims.exists("walk-up")) anims.create({
      key: "walk-up",
      frames: anims.generateFrameNumbers("player_male", { start: 9, end: 11 }),
      frameRate: 12,
      repeat: -1
    });
    if (!anims.exists("bug_idle")) anims.create({
      key: "bug_idle",
      frames: anims.generateFrameNumbers("bug", { start: 0, end: 3 }),
      frameRate: 6,
      repeat: -1
    });
  }

  createNPCs() {
    this.npcs = [];
    const npcLayer = this.map.getObjectLayer("npc object");
    if (!npcLayer) return;

    npcLayer.objects.forEach(obj => {
      const spriteKey = obj.name || "elysia"; // fallback
      const x = Math.round(obj.x / this.TILE_SIZE) * this.TILE_SIZE;
      const y = Math.round(obj.y / this.TILE_SIZE) * this.TILE_SIZE;

      const npc = this.physics.add.sprite(x, y, spriteKey, 0)
        .setOrigin(0, 1)
        .setImmovable(true)
        .setSize(12, 8)
        .setOffset(2, 8);

      npc.name = spriteKey;
      npc.dialogue = [];

      if (obj.properties?.length) {
        let prop = obj.properties.find(p => p.name === "dialogue") 
                || obj.properties.find(p => p.name.toLowerCase().endsWith(" dialogue"));
        if (prop?.value) {
          try { npc.dialogue = JSON.parse(prop.value); }
          catch { npc.dialogue = [prop.value]; }
        }
      }

      this.physics.add.collider(this.player, npc);
      this.npcs.push(npc);
    });
  }

  onShutdown() {
    if (this._nextBtnHandler) {
      const nextBtn = document.getElementById("dialogue-next");
      if (nextBtn) nextBtn.removeEventListener("click", this._nextBtnHandler);
      this._nextBtnHandler = null;
    }
    if (this.dialogueManager) this.dialogueManager.dispose();
  }

  onSleep() {
    if (this.dialogueManager) this.dialogueManager.detachInputListeners();
    if (this._nextBtnHandler) {
      const nextBtn = document.getElementById("dialogue-next");
      if (nextBtn) nextBtn.removeEventListener("click", this._nextBtnHandler);
    }
  }

  onWake() {
    const nextBtn = document.getElementById("dialogue-next");
    if (nextBtn && !this._nextBtnHandler) {
      this._nextBtnHandler = () => {
        if (this.dialogueManager.isTyping) return;
        this.dialogueManager.next();
      };
      nextBtn.addEventListener("click", this._nextBtnHandler);
    }
  }
}

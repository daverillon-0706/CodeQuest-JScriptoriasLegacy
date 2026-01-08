// src/scenes/JScriptoriaScene.js
import Phaser from "phaser";
import DialogueManager from "../systems/DialogueManager.js";
import PlayerController from "../systems/PlayerController.js";
import HoverManager from "../systems/HoverManager.js";
import ChestSystem from "../systems/ChestSystem.js";
import GameState from "../GameState.js";
import { setupSceneTriggers } from '/src/utils/SceneTransitions.js';

export default class JScriptoriaScene extends Phaser.Scene {
  constructor() {
    super('JScriptoriaScene');
    this.TILE_SIZE = 16;
    this.MOVE_SPEED = 80;

    this.player = null;
    this.map = null;
    this.npcs = [];
    this.buildings = [];
    this.items = [];
    this.canTalkTo = null;

    this.playerController = null;
    this.dialogueManager = null;
    this.hoverManager = null;
  }

  preload() {
    // Tilemap
    this.load.tilemapTiledJSON('city', '/maps/JScriptoria City.tmj');

    const tilesets = [
      'road_full','road_side','sidewalk_pavement','sidewalk','headquarters_door','headquarters_roof',
      'headquarters_roof2','headquarters_roof3','headquarters_roof4','headquarters_wall3','headquarters_wall2',
      'headquarters_wall1','Sprite-0001','base_house','pavement1','pavement2','base_house2','base_house3',
      'corner-stone-grass-sheet','corner-stone-grass2-sheet','sample_fence','sample_fence-sheet','house1',
      'guild','inn','school-sheet','roads','roadblock','lamppost','library','coretower', 'walled'
    ];
    tilesets.forEach(name => this.load.image(name, `/assets/tilesets/jscriptoriacity/${name}.png`));
    this.load.image("git_terminal_full", "/assets/tilesets/deepweb/git_terminal_full.png");

    this.load.spritesheet("chest", "/assets/icons/item/chest.png", { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('player_male', '/assets/sprites/player/player_male.png', { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('kaelen', '/assets/sprites/npc/kaelen.png', { frameWidth: 16, frameHeight: 16 });
  }

  create(data = {}) {
    // ---- Tilemap & Layers ----
    this.map = this.make.tilemap({ key: 'city' });
    const tilesets = this.map.tilesets.map(ts => this.map.addTilesetImage(ts.name, ts.name));

    this.groundLayer = this.map.createLayer('Ground Layer', tilesets, 0, 0);
    this.wallLayer = this.map.createLayer('Wall Layer', tilesets, 0, 0);
    this.buildingLayer = this.map.createLayer('Building Layer', tilesets, 0, 0);
    this.itemLayer = this.map.createLayer('Item Layer', tilesets, 0, 0);
    this.overlayLayer = this.map.createLayer('Overlay layer', tilesets, 0, 0);

    [this.wallLayer, this.buildingLayer, this.itemLayer].forEach(layer => layer.setCollisionByExclusion([-1]));

    // ---- Player Spawn ----
const spawnLayer = this.map.getObjectLayer("Objects");

let spawnObj =
  spawnLayer?.objects.find(o => o.name === data.spawn) ||
  spawnLayer?.objects.find(o => o.name === "MalePlayer") ||
  { x: 1500, y: 1500 };

const spawnX = Math.round(spawnObj.x / this.TILE_SIZE) * this.TILE_SIZE;
const spawnY = Math.round(spawnObj.y / this.TILE_SIZE) * this.TILE_SIZE;

this.player = this.physics.add.sprite(spawnX, spawnY, "player_male", 0)
  .setOrigin(0, 1)
  .setCollideWorldBounds(true)
  .setSize(12, 8)
  .setOffset(2, 8)
  .setDepth(5);



    this.player.customData = {
      HP: data.playerHP ?? 100,
      Energy: data.playerEnergy ?? 50,
      Coins: data.playerCoins ?? 0
    };

    GameState.player = this.player;

    // ---- Camera ----
    this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08).setZoom(3);

    // ---- Animations ----
    this.createAnimations();

    // ---- NPCs ----
    this.createNPCs();

    // ---- Player Controller ----
    this.playerController = new PlayerController(this, this.player, this.MOVE_SPEED);

    this.transitioning = false;

    // ---- DOM HUD ----
    this.playerHPEl = document.getElementById('playerHP-text');
    this.playerEnergyEl = document.getElementById('playerEnergy-text');
    this.playerCoinsEl = document.getElementById('cryptos-count');

    this.updateHUD();

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

    // ---- Scene Triggers ----
    this.sceneTriggers = setupSceneTriggers(this, this.map, this.player);

    // ---- Chests ----
    ChestSystem.init(this, this.player);
    ChestSystem.createAnimations(this);
    ChestSystem.loadFromMap(this.map);

    // ---- Colliders ----
    [this.wallLayer, this.buildingLayer, this.itemLayer].forEach(layer => this.physics.add.collider(this.player, layer));
    this.npcs.forEach(npc => npc.setDepth(4));
    this.overlayLayer.setDepth(10);

    // ---- Worldstep for NPC proximity ----
    this.physics.world.on("worldstep", () => {
      this.canTalkTo = null;
      this.npcs.forEach(npc => {
        if (!npc?.body) return;
        if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.body, npc.body)) this.canTalkTo = npc;
      });
      this.dialogueManager.updateProximity(this.player, this.npcs);
    });

    // ---- Z key interactions ----
    this.input.keyboard.on("keydown-Z", () => {
  if (ChestSystem.interact()) return;

  if (this.dialogueManager.activeDialogue) {
    if (this.dialogueManager.isTyping)
      this.dialogueManager._finishTypingInstant();
    else
      this.dialogueManager.next();
    return;
  }

  const npc = this.playerController.canTalkTo;
  if (npc && npc.customData.dialogue?.length) {
    this.dialogueManager.start(npc.customData.dialogue);
    return;
  }


  const trigger = this.sceneTriggers.getNearbyTrigger();
  if (trigger) {
    this.sceneTriggers.activateTrigger(trigger, {
      playerHP: this.playerHP,
      playerEnergy: this.playerEnergy,
      playerCoins: this.playerCoins
    });
  }
});


// ---- Hover Manager ----
this.hoverManager = new HoverManager(this);
this.hoverManager.init();

// Read all hover rectangles from the Tiled layer
this.hoverManager.registerFromObjectLayer(this.map, "hover objects");


  }

  update() {
    if (!this.playerController) return;
    this.canTalkTo = this.playerController.update(this.npcs);
  }

  updateHUD() {
    if (this.playerHPEl) this.playerHPEl.textContent = this.player.customData.HP;
    if (this.playerEnergyEl) this.playerEnergyEl.textContent = this.player.customData.Energy;
    if (this.playerCoinsEl) this.playerCoinsEl.textContent = this.player.customData.Coins;
  }

  createAnimations() {
    const anims = this.anims;
    if (!anims.exists('walk-down')) anims.create({ key: 'walk-down', frames: anims.generateFrameNumbers('player_male', { start: 0, end: 2 }), frameRate: 12, repeat: -1 });
    if (!anims.exists('walk-right')) anims.create({ key: 'walk-right', frames: anims.generateFrameNumbers('player_male', { start: 3, end: 5 }), frameRate: 12, repeat: -1 });
    if (!anims.exists('walk-left')) anims.create({ key: 'walk-left', frames: anims.generateFrameNumbers('player_male', { start: 6, end: 8 }), frameRate: 12, repeat: -1 });
    if (!anims.exists('walk-up')) anims.create({ key: 'walk-up', frames: anims.generateFrameNumbers('player_male', { start: 9, end: 11 }), frameRate: 12, repeat: -1 });
    if (!anims.exists('npc-idle-down')) anims.create({ key: 'npc-idle-down', frames: [{ key: 'kaelen', frame: 1 }], frameRate: 1, repeat: -1 });
  }

  createNPCs() {
    const npcLayer = this.map.getObjectLayer('NPC Objects');
    if (!npcLayer) return;

    this.npcs = [];
    npcLayer.objects.forEach(obj => {
      const snappedX = Math.round(obj.x / this.TILE_SIZE) * this.TILE_SIZE;
      const snappedY = Math.round(obj.y / this.TILE_SIZE) * this.TILE_SIZE;

      const npc = this.physics.add.sprite(snappedX, snappedY, 'kaelen', 0)
        .setOrigin(0, 1)
        .setImmovable(true)
        .play('npc-idle-down');

      npc.customData = {};
      const prop = obj.properties?.find(p => p.name === 'dialogue');
      if (prop?.value) {
        try { npc.customData.dialogue = JSON.parse(prop.value); }
        catch { npc.customData.dialogue = [prop.value]; }
      } else npc.customData.dialogue = [];

      this.physics.add.collider(this.player, npc);
      this.npcs.push(npc);
    });
  }
}

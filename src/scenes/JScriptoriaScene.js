// src/scenes/JScriptoriaScene.js
import Phaser from "phaser";
import DialogueManager from "../systems/DialogueManager.js";
import PlayerController from "../systems/PlayerController.js";
import HoverManager from "../systems/HoverManager.js";

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

    this.playerHP = 100;
    this.playerEnergy = 50;
    this.playerCoins = 0;

    this.playerController = null;
    this.dialogueManager = null;
    this.hoverManager = null;
  }

  preload() {
    // Tilemap
    this.load.tilemapTiledJSON('city', '/maps/JScriptoria City.tmj');

    // Tilesets
    const tilesets = [
      'road_full','road_side','sidewalk_pavement','sidewalk','headquarters_door','headquarters_roof',
      'headquarters_roof2','headquarters_roof3','headquarters_roof4','headquarters_wall3','headquarters_wall2',
      'headquarters_wall1','Sprite-0001','base_house','pavement1','pavement2','base_house2','base_house3',
      'corner-stone-grass-sheet','corner-stone-grass2-sheet','sample_fence','sample_fence-sheet','house1',
      'guild','inn','school-sheet','roads','roadblock','lamppost','library','coretower','walled'
    ];
    tilesets.forEach(name => this.load.image(name, `/assets/tilesets/jscriptoriacity/${name}.png`));

    // Player sprite
    this.load.spritesheet('player_male', '/assets/sprites/player/player_male.png', { frameWidth: 16, frameHeight: 16 });

    // NPC Sprites
    this.load.spritesheet('kaelen', '/assets/sprites/npc/kaelen.png', { frameWidth: 16, frameHeight: 16 });
  }

  create(data = {}) {
    const TILE_SIZE = this.TILE_SIZE;

    // ---- TILEMAP ----
    this.map = this.make.tilemap({ key: 'city' });
    const tilesets = this.map.tilesets.map(ts => this.map.addTilesetImage(ts.name, ts.name));

    const groundLayer = this.map.createLayer('Ground Layer', tilesets, 0, 0);
    const wallLayer = this.map.createLayer('Wall Layer', tilesets, 0, 0);
    const buildingLayer = this.map.createLayer('Building Layer', tilesets, 0, 0);
    const itemLayer = this.map.createLayer('Item Layer', tilesets, 0, 0);
    const overlayLayer = this.map.createLayer('Overlay layer', tilesets, 0, 0);

    [wallLayer, buildingLayer, itemLayer].forEach(layer => layer.setCollisionByExclusion([-1]));

    // ---- PLAYER SPAWN ----
    const spawnLayer = this.map.getObjectLayer('Objects');
    const spawnObj = spawnLayer?.objects.find(o => o.name === 'MalePlayer') || { x: 800, y: 850 };
    const spawnX = Math.round(spawnObj.x / TILE_SIZE) * TILE_SIZE;
    const spawnY = Math.round(spawnObj.y / TILE_SIZE) * TILE_SIZE;

    this.player = this.physics.add.sprite(spawnX, spawnY, 'player_male', 0)
        .setOrigin(0, 1)
        .setCollideWorldBounds(true)
        .setSize(12, 8)
        .setOffset(2, 8);

    // ---- ASSIGN PLAYER TO GLOBAL STATE (HUD, Compiler) ----
    if (window.GameState) GameState.player = this.player;

    // ---- CAMERA ----
    this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08).setZoom(3);

    // ---- ANIMATIONS ----
    this.createAnimations();

    // ---- NPCs ----
    this.createNPCs();

    // ---- COLLIDERS ----
    [wallLayer, buildingLayer, itemLayer].forEach(layer => this.physics.add.collider(this.player, layer));
    this.npcs.forEach(npc => npc.setDepth(4));
    this.player.setDepth(5);
    overlayLayer.setDepth(10);

    // ---- PLAYER CONTROLLER ----
    this.playerController = new PlayerController(this, this.player, this.MOVE_SPEED);

    // ---- DOM HUD ----
    this.playerHPEl = document.getElementById('playerHP');
    this.playerEnergyEl = document.getElementById('playerEnergy');
    this.playerExpEl = document.getElementById('playerExp');

    this.playerHP = data.playerHP ?? this.playerHP;
    this.playerEnergy = data.playerEnergy ?? this.playerEnergy;
    this.playerCoins = data.playerCoins ?? this.playerCoins;

    if (this.playerHPEl) this.playerHPEl.textContent = this.playerHP;
    if (this.playerEnergyEl) this.playerEnergyEl.textContent = this.playerEnergy;
    if (this.playerExpEl) this.playerExpEl.textContent = data.playerExp ?? 120;

    // ---- DIALOGUE MANAGER ----
    const dialogueBoxEl = document.getElementById("dialogue-box");
    const dialogueTextEl = document.getElementById("dialogue-text");
    const dialogueNextEl = document.getElementById("dialogue-next");

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

    // ---- DOORS ----
    this.setupDoors();

    // ---- WORLD STEP PROXIMITY ----
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

    // ---- INTERACTIONS ----
    this.input.keyboard.on("keydown-Z", () => {
        const result = this.dialogueManager.handleZKey(this.map.getObjectLayer('door objects'));
        if (result && result.name) {
            this.scene.start('HQInteriorScene', {
                spawn: result.name,
                playerHP: this.playerHP,
                playerEnergy: this.playerEnergy,
                playerCoins: this.playerCoins,
                playerX: this.player.x,
                playerY: this.player.y
            });
        }
    });

    // ---- HOVER MANAGER ----
    this.hoverManager = new HoverManager(this);
    this.hoverManager.init();
    this.npcs.forEach(npc => this.hoverManager.register(npc, "NPC: " + (npc.name || "Unknown")));
    this.buildings.forEach(building => this.hoverManager.register(building, "Building: " + (building.name || "Unknown")));
    this.items.forEach(item => this.hoverManager.register(item, "Item: " + (item.name || "Unknown")));

    // ---- RESPONSIVE ----
    this.scale.on('resize', size => {
        if (this.cameras?.main)
            this.cameras.main.setViewport(0, 0, size.width, size.height);
    });
}


  update() {
    if (!this.playerController) return;

    // Player movement
    this.canTalkTo = this.playerController.update(this.npcs);

    // Hover manager updates (cursor-based hover)
    //this.hoverManager.update([
    //  ...this.npcs,
    //  ...this.buildings,
    //  ...this.items
    //]);
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

      npc.dialogue = [];
      const prop = obj.properties?.find(p => p.name === 'dialogue');
      if (prop?.value) {
        try { npc.dialogue = JSON.parse(prop.value); }
        catch { npc.dialogue = [prop.value]; }
      }

      this.physics.add.collider(this.player, npc);
      this.npcs.push(npc);
    });
  }

  setupDoors() {
    const doorLayer = this.map.getObjectLayer('door objects');
    if (!doorLayer) return;
    doorLayer.objects.forEach(door => { door.y += this.TILE_SIZE; });
    // DEBUG only
    doorLayer.objects.forEach(door => {
      const g = this.add.graphics();
      g.lineStyle(1, 0xff0000, 0.7);
      g.strokeRect(door.x, door.y, door.width, door.height);
    });
  }
}

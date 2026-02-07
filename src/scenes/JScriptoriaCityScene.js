// src/scenes/JScriptoriaCityScene.js

import Phaser from "phaser";
import DialogueManager from "../systems/DialogueManager.js";
import PlayerController from "../systems/PlayerController.js";
import HoverManager from "../systems/HoverManager.js";
import ChestSystem from "../systems/ChestSystem.js";
import Bug from "../systems/Bug.js";
import BugManager from "../systems/BugManager.js";
import RangeSlimeBug from "../systems/bugs/RangeSlimeBug.js";
import TypeMimicBug from "../systems/bugs/TypeMimicBug.js";
import ReferenceWispBug from "../systems/bugs/ReferenceWispBug.js";
import GameState from "../GameState.js";
import { setupSceneTriggers } from "../utils/SceneTransitions.js";

export default class JScriptoriaCityScene extends Phaser.Scene {
  constructor() {
    super("JScriptoriaCityScene");

    this.TILE_SIZE = 16;
    this.MOVE_SPEED = 80;

    this.player = null;
    this.map = null;
    this.npcs = [];
    this.canTalkTo = null;

    this.playerController = null;
    this.dialogueManager = null;
    this.hoverManager = null;

    this.bugManager = null;
  }

  // ================= PRELOAD =================
  preload() {
    this.load.tilemapTiledJSON("JScriptoriaCity", "/maps/JScriptoriaCity.tmj");

    const cityTilesets = ["house","headquarters","guild","inn","library","road_full","roads", "school-sheet"];
    const outskirtsTilesets = ["cliff","grasswalk","hole","kiosk","monolith-sheet", "road_dirt_path", "stone_path","tree"];
    const indoorTilesets = ["lowerwall","upperwall"];

    cityTilesets.forEach(name => this.load.image(name, `/assets/tilesets/jscriptoriacity/${name}.png`));
    outskirtsTilesets.forEach(name => this.load.image(name, `/assets/tilesets/northoutskirts/${name}.png`));
    indoorTilesets.forEach(name => this.load.image(name, `/assets/tilesets/orinsacademy/${name}.png`));

    // Sprites
    this.load.spritesheet("player_male", "/assets/sprites/player/player_male.png", { frameWidth:16, frameHeight:16 });
    this.load.spritesheet("kaelen", "/assets/sprites/npc/kaelen.png", { frameWidth:16, frameHeight:16 });
    this.load.spritesheet("chest", "/assets/icons/item/chest.png", { frameWidth:16, frameHeight:16 });

    // ---- Bug Sprites ----
  this.load.spritesheet('golem', '/assets/sprites/bug/golem.png', { frameWidth: 16, frameHeight: 16, endFrame: 1 });
  this.load.spritesheet('mimic', '/assets/sprites/bug/mimic.png', { frameWidth: 16, frameHeight: 16, endFrame: 2 });
  this.load.spritesheet('slime', '/assets/sprites/bug/slime.png', { frameWidth: 16, frameHeight: 16, endFrame: 3 });
  this.load.spritesheet('wisp', '/assets/sprites/bug/wisp.png', { frameWidth: 16, frameHeight: 16, endFrame: 3 });
  this.load.spritesheet('rift', '/assets/sprites/bug/rift.png', { frameWidth: 16, frameHeight: 16, endFrame: 7 });
  }

  // ================= CREATE =================
  create(data = {}) {
    // ---- MAP ----
    this.map = this.make.tilemap({ key: "JScriptoriaCity" });
    const tilesets = this.map.tilesets.map(ts => this.map.addTilesetImage(ts.name, ts.name));

    this.groundLayer   = this.map.createLayer("ground layer", tilesets);
    this.buildingLayer = this.map.createLayer("building layer", tilesets);
    this.wallLayer     = this.map.createLayer("wall layer", tilesets);
    this.itemLayer     = this.map.createLayer("item layer", tilesets);
    this.overlayLayer  = this.map.createLayer("overlay layer", tilesets);

    [this.buildingLayer, this.wallLayer, this.itemLayer].forEach(layer => layer.setCollisionByExclusion([-1]));

    // ---- PLAYER SPAWN ----
    const spawnLayer = this.map.getObjectLayer("Objects") || { objects: [] };
    let spawnObj = spawnLayer.objects.find(o => o.name === data.spawn)
      || spawnLayer.objects.find(o => o.name === "MalePlayer")
      || { x:100, y:100 };

    const spawnX = Math.round(spawnObj.x / this.TILE_SIZE) * this.TILE_SIZE;
    const spawnY = Math.round(spawnObj.y / this.TILE_SIZE) * this.TILE_SIZE;

    this.player = this.physics.add.sprite(spawnX, spawnY, "player_male", 0)
      .setOrigin(0,1)
      .setCollideWorldBounds(true)
      .setSize(12,8)
      .setOffset(2,8)
      .setDepth(5);

    this.player.customData = {
      HP: data.playerHP ?? 100,
      Energy: data.playerEnergy ?? 50,
      Coins: data.playerCoins ?? 0
    };
    GameState.player = this.player;

    // ---- BUG SYSTEM ----
    // ---- BugManager & Bugs ----
  this.bugManager = new BugManager(this);
  this.spawnBugsOnGrasswalk();
/*
  const bugsData = [
    { key: 'golem', type: 'Syntax Golem', x: 200, y: 200, frames: { idle: [0,1] }, errorCode: "SyntaxError: Unexpected token" },
    { key: 'slime', type: 'Range Slime', x: 300, y: 250, frames: { left: [2,3], right: [0,1] }, errorCode: "RangeError: Out of bounds" },
    { key: 'wisp', type: 'Reference Wisp', x: 400, y: 300, frames: { idle: [0,1,2,3] }, errorCode: "ReferenceError: x is not defined" },
    { key: 'mimic', type: 'Type Mimic', x: 500, y: 350, frames: { hidden: [0], revealed: [1,2] }, errorCode: "TypeError: Cannot read property" },
    { key: 'rift', type: 'Internal Rift', x: 600, y: 400, frames: { idle: [0,1,2,3,4,5,6,7] }, errorCode: "Summon Bugs" }
  ];*/
/*
    // Create animations
    const anims = this.anims;
    if(bData.frames.idle) {
      anims.create({ key: `${bData.key}-idle`, frames: anims.generateFrameNumbers(bData.key, { frames: bData.frames.idle }), frameRate: 2, repeat: -1 });
      bug.play(`${bData.key}-idle`);
    }
    if(bData.frames.left) {
      anims.create({ key: `${bData.key}-left`, frames: anims.generateFrameNumbers(bData.key, { frames: bData.frames.left }), frameRate: 4, repeat: -1 });
    }
    if(bData.frames.right) {
      anims.create({ key: `${bData.key}-right`, frames: anims.generateFrameNumbers(bData.key, { frames: bData.frames.right }), frameRate: 4, repeat: -1 });
    }
    if(bData.frames.revealed) {
      anims.create({ key: `${bData.key}-revealed`, frames: anims.generateFrameNumbers(bData.key, { frames: bData.frames.revealed }), frameRate: 2, repeat: -1 });
    }
    if(bData.frames.hidden) {
      anims.create({ key: `${bData.key}-hidden`, frames: anims.generateFrameNumbers(bData.key, { frames: bData.frames.hidden }), frameRate: 1, repeat: -1 });
      bug.play(`${bData.key}-hidden`);
    }
*/
  // ---- Input hover/lock-on ----
  this.input.on('pointermove', pointer => this.bugManager.updateHover(pointer));
  this.input.on('pointerdown', pointer => this.bugManager.tryLockOn(pointer));

    

    // ---- CAMERA ----
    this.physics.world.setBounds(0,0,this.map.widthInPixels,this.map.heightInPixels);
    this.cameras.main.setBounds(0,0,this.map.widthInPixels,this.map.heightInPixels)
      .startFollow(this.player,true,0.08,0.08)
      .setZoom(3);

    // ---- COLLIDERS ----
    [this.buildingLayer, this.wallLayer, this.itemLayer].forEach(layer => this.physics.add.collider(this.player, layer));
    this.overlayLayer.setDepth(1000);

    // ---- SYSTEMS ----
    this.createAnimations();
    this.createNPCs();
    this.playerController = new PlayerController(this,this.player,this.MOVE_SPEED);

    // ---- HUD ----
    this.playerHPEl = document.getElementById("playerHP-text");
    this.playerEnergyEl = document.getElementById("playerEnergy-text");
    this.playerCoinsEl = document.getElementById("cryptos-count");
    this.updateHUD();

    // ---- DIALOGUE ----
    const dialogueBoxEl  = document.getElementById("dialogue-box");
    const dialogueTextEl = document.getElementById("dialogue-text");
    const dialogueNextEl = document.getElementById("dialogue-next");

    this.dialogueManager = DialogueManager;
    this.dialogueManager.init(this);
    this.dialogueManager.setDomElements({ dialogueBox: dialogueBoxEl, dialogueText: dialogueTextEl, nextBtn: dialogueNextEl });

    // ---- SCENE TRIGGERS ----
    this.sceneTriggers = setupSceneTriggers(this,this.map,this.player);

    // ---- CHESTS ----
    ChestSystem.init(this,this.player);
    ChestSystem.createAnimations(this);
    ChestSystem.loadFromMap(this.map);

    // ---- HOVER ----
    this.hoverManager = new HoverManager(this);
    this.hoverManager.init();
    this.hoverManager.registerFromObjectLayer(this.map,"hover objects");

    // ---- INTERACTIONS ----
    this.input.keyboard.on("keydown-Z",()=> {
      if(ChestSystem.interact()) return;
      if(this.dialogueManager.activeDialogue){
        if(this.dialogueManager.isTyping) this.dialogueManager._finishTypingInstant();
        else this.dialogueManager.next();
        return;
      }
      const npc = this.playerController.canTalkTo;
      if(npc?.customData.dialogue?.length) this.dialogueManager.start(npc.customData.dialogue);
      const trigger = this.sceneTriggers?.getNearbyTrigger?.();
      if(trigger){
        this.sceneTriggers.activateTrigger(trigger,{
          playerHP: this.player.customData.HP,
          playerEnergy: this.player.customData.Energy,
          playerCoins: this.player.customData.Coins
        });
      }
    });
  }

  // ================= UPDATE =================
  update(time, delta) {
  if(!this.playerController) return;
  this.playerController.update(this.npcs);

  if(this.bugManager) {
    this.bugManager.update(time, delta);

    // Lock-on highlight
    if(this.bugManager.lockedBug) {
      this.bugManager.lockedBug.setTint(0xff0000); // red
    } else {
      this.bugManager.bugs.forEach(bug => bug.clearTint());
    }
  }
}

  // ================= HUD =================
  updateHUD(){
    if(this.playerHPEl) this.playerHPEl.textContent = this.player.customData.HP;
    if(this.playerEnergyEl) this.playerEnergyEl.textContent = this.player.customData.Energy;
    if(this.playerCoinsEl) this.playerCoinsEl.textContent = this.player.customData.Coins;
  }

  // ================= ANIMATIONS =================
  createAnimations(){
    const anims = this.anims;

    if(!anims.exists("walk-down")) anims.create({ key:"walk-down", frames:anims.generateFrameNumbers("player_male",{start:0,end:2}), frameRate:12, repeat:-1 });
    if(!anims.exists("walk-right")) anims.create({ key:"walk-right", frames:anims.generateFrameNumbers("player_male",{start:3,end:5}), frameRate:12, repeat:-1 });
    if(!anims.exists("walk-left")) anims.create({ key:"walk-left", frames:anims.generateFrameNumbers("player_male",{start:6,end:8}), frameRate:12, repeat:-1 });
    if(!anims.exists("walk-up")) anims.create({ key:"walk-up", frames:anims.generateFrameNumbers("player_male",{start:9,end:11}), frameRate:12, repeat:-1 });
    if(!anims.exists("npc-idle-down")) anims.create({ key:"npc-idle-down", frames:[{key:"kaelen",frame:1}], frameRate:1, repeat:-1 });
  }

  // ================= NPCs =================
  createNPCs(){
    const npcLayer = this.map.getObjectLayer("NPC Objects");
    if(!npcLayer) return;
    this.npcs=[];
    npcLayer.objects.forEach(obj=>{
      const x = Math.round(obj.x/this.TILE_SIZE)*this.TILE_SIZE;
      const y = Math.round(obj.y/this.TILE_SIZE)*this.TILE_SIZE;

      const npc = this.physics.add.sprite(x,y,"kaelen",0)
        .setOrigin(0,1)
        .setImmovable(true)
        .play("npc-idle-down");

      npc.customData = {};
      const prop = obj.properties?.find(p=>p.name==="dialogue");
      npc.customData.dialogue = prop ? JSON.parse(prop.value) : [];
      this.physics.add.collider(this.player,npc);
      this.npcs.push(npc);
    });
  }


   // ================= BUG SPAWNING =================
    spawnBugsOnGrasswalk() {
  if (!this.groundLayer) return;

  const width  = this.map.width;
  const height = this.map.height;

  // Get grasswalk tileset range
  const grasswalkTileset = this.map.tilesets.find(ts => ts.name === "grasswalk");
  if (!grasswalkTileset) {
    console.warn("Grasswalk tileset not found!");
    return;
  }

  const firstGid = grasswalkTileset.firstgid;
  const lastGid  = firstGid + grasswalkTileset.total - 1;

  let spawnCount = 0;
  const maxBugs = 15; // Cap total bugs on map

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (spawnCount >= maxBugs) break;

      const tile = this.groundLayer.getTileAt(x, y);
      if (!tile) continue;

      // Only grasswalk tiles
      if (tile.index < firstGid || tile.index > lastGid) continue;

      // Spawn chance
      if (Math.random() > 0.05) continue; // 5%

      const worldX = x * this.TILE_SIZE;
      const worldY = (y + 1) * this.TILE_SIZE;

      // Pick random bug type
      const rand = Math.random();
      let bug;

      if (rand < 0.25) bug = new Bug(this, worldX, worldY, "golem", { dmg: 2, detectRange: 2 });
      else if (rand < 0.5) bug = new ReferenceWispBug(this, worldX, worldY);
      else if (rand < 0.75) bug = new RangeSlimeBug(this, worldX, worldY);
      else bug = new TypeMimicBug(this, worldX, worldY);

      this.bugManager.addBug(bug);
      spawnCount++;
    }
  }

  console.log("Total bugs spawned:", spawnCount);
}




  // ================= SPAWN RIFT =================
  spawnRift(monolithId, x, y){
    const bugData = { dmg:0, detectRange:0, errorCode:'Summon Bugs', monolithId };
    const rift = new Bug(this, x, y, 'rift', bugData);

    // Rift is 3 tiles wide and 2 tiles tall
    rift.setOrigin(0,1);
    rift.body.setSize(this.TILE_SIZE*3, this.TILE_SIZE*2);

    rift.customData = { type:'rift', id:monolithId };
    this.bugManager.addBug(rift);
    return rift;
  }

}

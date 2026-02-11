// src/scenes/JScriptoriaCityScene.js

import Phaser from "phaser";
import DialogueManager from "../systems/DialogueManager.js";
import PlayerController from "../systems/PlayerController.js";
import HoverManager from "../systems/HoverManager.js";
import ChestSystem from "../systems/ChestSystem.js";
import Bug from "../systems/Bug.js";
import BugManager from "../systems/BugManager.js";
import SyntaxGolemBug from "../systems/bugs/SyntaxGolemBug.js";
import RangeSlimeBug from "../systems/bugs/RangeSlimeBug.js";
import TypeMimicBug from "../systems/bugs/TypeMimicBug.js";
import ReferenceWispBug from "../systems/bugs/ReferenceWispBug.js";
import InternalRiftBug from "../systems/bugs/InternalRiftBug.js";
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
    this.bugGroup = null; // <-- Physics group for bugs
    this.rifts = [];
    this.riftKiosks = [];

    
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
    this.load.spritesheet('slime', '/assets/sprites/bug/slime.png', { frameWidth: 16, frameHeight: 16, endFrame: 6 });
    this.load.spritesheet('wisp', '/assets/sprites/bug/wisp.png', { frameWidth: 16, frameHeight: 16, endFrame: 7 });
    this.load.spritesheet('rift', '/assets/sprites/bug/rift.png', { frameWidth: 48, frameHeight: 32, endFrame: 7 });
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
      HP: data.playerHP ?? GameState.player?.hp,
      Energy: data.playerEnergy ?? GameState.player?.energy,
      Coins: data.playerCoins ?? GameState.player?.cryptos
    };
    //GameState.player = this.player;
    this.syncSpriteToGameState();

    // ---- BUG SYSTEM ----
    this.bugGroup = this.physics.add.group(); // ← Group for physics
    this.bugManager = new BugManager(this);
    window.bugManager = this.bugManager;

    this.physics.world.createDebugGraphic();
    this.spawnBugsOnGrasswalk();

    // ---- Input hover/lock-on ----
    this.input.on('pointermove', pointer => this.bugManager.updateHover(pointer));
    this.input.on('pointerdown', pointer => this.bugManager.tryLockOn(pointer));

    // ---- CAMERA ----
    this.physics.world.setBounds(0,0,this.map.widthInPixels,this.map.heightInPixels);
    this.cameras.main.setBounds(0,0,this.map.widthInPixels,this.map.heightInPixels)
      .startFollow(this.player,true,0.08,0.08)
      .setZoom(3);

    // ---- COLLIDERS ----
    [this.buildingLayer, this.wallLayer, this.itemLayer]
      .forEach(layer => this.physics.add.collider(this.player, layer));

    this.overlayLayer.setDepth(1000);

    // Enable wall collision
    this.wallLayer.setCollisionByProperty({ collides: true });

    // Bugs ↔ walls
    this.physics.add.collider(
  this.bugGroup,
  this.wallLayer,
  (bug, wall) => {
    if (bug instanceof RangeSlimeBug && bug.isCharging) {
      bug.stopCharge?.();
    }
  }
);


    // ---- SYSTEMS ----
    this.createAnimations();
    this.createNPCs();
    this.playerController = new PlayerController(this,this.player,this.MOVE_SPEED);

    //Summon Rift
    this.createRiftSystemsFromMap();



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
    
    // Rift interaction
      const kiosk = this.getNearbyRiftKiosk();
      if (kiosk) {
        this.activateRiftFromKiosk(kiosk);
        return;
      }

    });

    // ================= PLAYER ↔ BUG DAMAGE =================
            this.physics.add.overlap(this.player, this.bugGroup, (player, bug) => {
    if (bug.dealDamage) bug.dealDamage(player); // Each bug defines this
    });

    
}

  // ================= UPDATE =================
  update(time, delta) {
  if(!this.playerController) return;
  this.playerController.update(this.npcs);

  if(this.bugManager) {
    this.bugManager.update(time, delta);

    // Call each bug's own update (movement, AI)
    this.bugManager.bugs.forEach(bug => {
      if (bug.update) bug.update(time, delta);
    });

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

    //Bugs

    //Slime
    if(!anims.exists("slime-move-right")) anims.create({
  key: "slime-move-right",
  frames: anims.generateFrameNumbers("slime",{ start: 0, end: 1 }),
  frameRate: 6,
  repeat: -1
});

if(!anims.exists("slime-move-left")) anims.create({
  key: "slime-move-left",
  frames: anims.generateFrameNumbers("slime",{ start: 5, end: 6 }),
  frameRate: 6,
  repeat: -1
});

        // --- Wisp Right ---
if(!anims.exists("wisp-move-right")) {
  anims.create({
    key: "wisp-move-right",
    frames: anims.generateFrameNumbers("wisp", {
      start: 0,
      end: 3
    }),
    frameRate: 8,
    repeat: -1
  });
}

// --- Wisp Left ---
if(!anims.exists("wisp-move-left")) {
  anims.create({
    key: "wisp-move-left",
    frames: anims.generateFrameNumbers("wisp", {
      start: 4,
      end: 7
    }),
    frameRate: 8,
    repeat: -1
  });
}

// Mimic
this.anims.create({
  key: "mimicReveal",
  frames: this.anims.generateFrameNumbers("mimic", {
    frames: [1, 2]
  }),
  frameRate: 4,
  repeat: -1
});

// Rift idle animation
if (!anims.exists("rift-idle")) {
  anims.create({
    key: "rift-idle",
    frames: anims.generateFrameNumbers("rift", { start: 0, end: 7 }),
    frameRate: 6,
    repeat: -1
  });
}



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

    // --- Grasswalk tileset range ---
    const grasswalkTileset = this.map.tilesets.find(ts => ts.name === "grasswalk");
    if (!grasswalkTileset) {
      console.warn("Grasswalk tileset not found!");
      return;
    }

    const firstGid = grasswalkTileset.firstgid;
    const lastGid  = firstGid + grasswalkTileset.total - 1;

    // --- Collect all grass tiles ---
    const grassTiles = [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const tile = this.groundLayer.getTileAt(x, y);
        if (!tile) continue;
        if (tile.index >= firstGid && tile.index <= lastGid) grassTiles.push({ x, y });
      }
    }

    Phaser.Utils.Array.Shuffle(grassTiles);

    const maxBugs = 30;
    const spawnTotal = Math.min(maxBugs, grassTiles.length);
    let spawnCount = 0;

    for (let i = 0; i < spawnTotal; i++) {
      const { x, y } = grassTiles[i];
      const worldXY = this.groundLayer.tileToWorldXY(x, y);
      const worldX = worldXY.x;
      const worldY = worldXY.y + this.TILE_SIZE;

      // --- Pick bug type ---
      const rand = Math.random();
let bug;
if (rand < 0.25) bug = new SyntaxGolemBug(this, worldX, worldY, "golem", { dmg: 2, detectRange: 2 });
else if (rand < 0.5) bug = new ReferenceWispBug(this, worldX, worldY, "wisp");
else if (rand < 0.75) bug = new RangeSlimeBug(this, worldX, worldY, "slime");
else bug = new TypeMimicBug(this, worldX, worldY, "mimic");

this.bugManager.addBug(bug);
this.bugGroup.add(bug);

      spawnCount++;
    }

    console.log("Total bugs spawned:", spawnCount);
  }

  // ================= SPAWN RIFT =================
// ================= RIFT SYSTEM =================
  createRiftSystemsFromMap() {
    const layer = this.map.getObjectLayer("rifts layer");
    if (!layer) return;

    //this.rifts = [];
    //     this.riftKiosks = [];
    

    layer.objects.forEach(obj => {
      // Rift spawns
      if (obj.name === "rift_spawn") {
  const riftName = obj.properties?.find(p => p.name === "riftName")?.value;
  const rift = new InternalRiftBug(this, obj.x, obj.y, riftName);

// Add to physics + tracking
this.bugGroup.add(rift);
this.rifts.push(rift);

// 🔒 Hide & disable initially
rift.setVisible(false);
rift.body.enable = false;
rift.isDormant = true; // custom flag (optional but useful)

console.log("Registered Rift (hidden):", riftName);

}


      // Rift kiosks
      if (obj.name === "rift_kiosk") {
        const kioskName = obj.properties?.find(p => p.name === "kioskName")?.value;
        this.riftKiosks.push({ x: obj.x, y: obj.y, kioskName, cooldown: false });
        console.log("Loaded Kiosk:", kioskName);
      }
    });
  }

  getNearbyRiftKiosk() {
  if (!this.riftKiosks) return null;

  // Increase distance check for easier interaction
  const INTERACT_RADIUS = 48; // 3 tiles
  const playerX = this.player.x;
  const playerY = this.player.y;

  return this.riftKiosks.find(kiosk => {
    const dist = Phaser.Math.Distance.Between(playerX, playerY, kiosk.x, kiosk.y);
    console.log("Checking kiosk:", kiosk.kioskName, "Distance:", dist.toFixed(2));
    return dist <= INTERACT_RADIUS;
  });
}



  activateRiftFromKiosk(kiosk) {
    if (!kiosk.kioskName) return;
    if (kiosk.cooldown) {
      console.log("Kiosk on cooldown:", kiosk.kioskName);
      return;
    }

    const targetRiftName = kiosk.kioskName.replace("Kiosk", "Monolith");
    console.log("Looking for rift:", targetRiftName);
this.rifts.forEach(r => console.log("Rift available:", `"${r.riftName}"`));

    const rift = this.rifts.find(r => r.riftName === targetRiftName);

    if (rift) {
      console.log("Activating Rift:", targetRiftName);

  // 👁️ Reveal rift if dormant
  if (rift.isDormant) {
    rift.setVisible(true);
    rift.body.enable = true;
    rift.isDormant = false;

    // Optional spawn effect
    rift.setScale(0);
    this.tweens.add({
      targets: rift,
      scale: 1,
      duration: 300,
      ease: "Back.Out"
    });
  }

  rift.activate();

      // Start cooldown
      kiosk.cooldown = true;
      this.time.delayedCall(2 * 60 * 1000, () => {
        kiosk.cooldown = false;
        console.log("Kiosk cooldown finished:", kiosk.kioskName);
      });
    } else {
      console.warn("No Rift found for:", targetRiftName);
    }
  }

  syncSpriteToGameState() {
    const gs = GameState.player;

    if (!gs) return;

    // Update GameState with sprite's runtime data
    gs.hp = this.player.customData.HP;
    gs.energy = this.player.customData.Energy;
    gs.cryptos = this.player.customData.Coins;

    GameState.player = gs;
}


}

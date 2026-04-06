// src/scenes/JScriptoriaCityScene.js
import Phaser from "phaser";
import DialogueManager from "../systems/DialogueManager.js";
import PlayerController from "../systems/PlayerController.js";
import HoverManager from "../systems/HoverManager.js";
import ChestSystem from "../systems/ChestSystem.js";
import SoundManager from "../systems/SoundManager.js";
import BugManager from "../systems/BugManager.js";
import SyntaxGolemBug from "../systems/bugs/SyntaxGolemBug.js";
import RangeSlimeBug from "../systems/bugs/RangeSlimeBug.js";
import TypeMimicBug from "../systems/bugs/TypeMimicBug.js";
import ReferenceWispBug from "../systems/bugs/ReferenceWispBug.js";
import InternalRiftBug from "../systems/bugs/InternalRiftBug.js";
import GameState from "../GameState.js";
import { RIFT_ID_MAP } from "../ui/data/riftIdMap.js";
import { normalizeRiftName } from "../ui/data/riftIdMap.js";
import { KEYSTONE_MAP } from "../ui/data/keystoneMap.js";
import { KEY_ITEM_ORDER } from "../ui/data/keyItems.js";
import { RiftChallenges } from "../ui/data/riftChallenges.js";
import Bullet from "../systems/weapons/bullet.js";
import ShopSystem from "../systems/ShopSystem.js";
import PerksManager from "../systems/PerksManager.js";
import { OffensePerks, DefensePerks } from "../ui/data/perkData.js";
import SceneTransition from "../systems/SceneTransition.js";
import TutorialUI from "../ui/HUD/TutorialUI.js";
import { QUESTS } from "../systems/quests/QuestList.js";
import QuestSystem from "../systems/quests/QuestSystem.js";
import { elysiaDialogues } from "../systems/ElysiaDialogues.js";
import NotificationSystem from "../systems/NotificationSystem.js";
import { getItemName } from "../utils/getItemName.js";
import MusicManager from "../systems/MusicManager.js";

export default class JScriptoriaCityScene extends Phaser.Scene {
  constructor() {
    super("JScriptoriaCityScene");
    this.TILE_SIZE = 16;
    this.MOVE_SPEED = 80;
    this.player = null;
    this.map = null;
    this.npcs = [];
    this.canTalkTo = null;
    // ---- SYSTEMS ----
    this.playerController = null;
    this.dialogueManager = null;
    this.hoverManager = null;
    this.canEnterDoor = true;
    // ---- BUGS ----
    this.maxBugs = 30;
    //this.spawnInterval = 5000;
    this.spawnMin = 3000;
    this.spawnMax = 7000;
    this.bugManager = null;
    this.bugGroup = null; // <-- Physics group for bugs
    this.rifts = [];
    this.riftKiosks = [];
    // ---- MINIMAP ----
    this.monoliths = [];
    this.minimapCanvas = null;
    this.minimapCtx = null;
    this.minimapWidth = 280;
    this.minimapHeight = 280;
    this.mapScaleX = 1;
    this.mapScaleY = 1;
    this.minimapX = 0;
    this.minimapY = 0;

    this.isUIBlockingInput = false;
    this.stunned = false;
  }
  // ================= PRELOAD =================
  preload() {
    this.load.tilemapTiledJSON("JScriptoriaCity", "/maps/JScriptoriaCity.tmj");

    const cityTilesets = ["house", "headquarters", "guild", "monolith_syntax", "monolith_datatypes", "monolith_variables", "monolith_operators", "monolith_conditions", "monolith_array", "monolith_functions", "inn", "library", "road_full", "roads", "school-sheet", "walls", "banner"];
    const outskirtsTilesets = ["cliff", "grasswalk", "hole", "kiosk", "road_dirt_path", "stone_path", "tree"];
    const indoorTilesets = ["lowerwall", "upperwall"];

    cityTilesets.forEach(name => this.load.image(name, `/assets/tilesets/jscriptoriacity/${name}.png`));
    outskirtsTilesets.forEach(name => this.load.image(name, `/assets/tilesets/northoutskirts/${name}.png`));
    indoorTilesets.forEach(name => this.load.image(name, `/assets/tilesets/orinsacademy/${name}.png`));

    // Sprites
    this.load.spritesheet("player_male", "/assets/sprites/player/player_male.png", { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet("kaelen", "/assets/sprites/npc/kaelen.png", { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet("orin", "/assets/sprites/npc/orin.png", { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet("mira", "/assets/sprites/npc/mira.png", { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet("selena", "/assets/sprites/npc/selena.png", { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet("elysia", "/assets/sprites/npc/elysia.png", { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet("chest", "/assets/icons/item/chest.png", { frameWidth: 16, frameHeight: 16 });

    // ---- Bug Sprites ----
    this.load.spritesheet('golem', '/assets/sprites/bug/golem.png', { frameWidth: 16, frameHeight: 16, endFrame: 1 });
    this.load.spritesheet('mimic', '/assets/sprites/bug/mimic.png', { frameWidth: 16, frameHeight: 16, endFrame: 2 });
    this.load.spritesheet('slime', '/assets/sprites/bug/slime.png', { frameWidth: 16, frameHeight: 16, endFrame: 6 });
    this.load.spritesheet('wisp', '/assets/sprites/bug/wisp.png', { frameWidth: 16, frameHeight: 16, endFrame: 7 });
    this.load.spritesheet('rift', '/assets/sprites/bug/rift.png', { frameWidth: 48, frameHeight: 32, endFrame: 7 });

    // Houses
    this.load.image('syntaxIcon', 'assets/icons/maps/syntax_map.png');
    this.load.image('datatypesIcon', 'assets/icons/maps/datatypes_map.png');
    this.load.image('variablesIcon', 'assets/icons/maps/variables_map.png');
    this.load.image('operatorsIcon', 'assets/icons/maps/operators_map.png');
    this.load.image('conditionsIcon', 'assets/icons/maps/conditions_map.png');
    this.load.image('arraysIcon', 'assets/icons/maps/arrays_map.png');
    this.load.image('functionsIcon', 'assets/icons/maps/functions_map.png');

    // Monoliths (can be same icons)
    this.load.image('syntaxMonolithIcon', 'assets/icons/maps/syntax_map.png');
    this.load.image('datatypesMonolithIcon', 'assets/icons/maps/datatypes_map.png');
    this.load.image('variablesMonolithIcon', 'assets/icons/maps/variables_map.png');
    this.load.image('operatorsMonolithIcon', 'assets/icons/maps/operators_map.png');
    this.load.image('conditionsMonolithIcon', 'assets/icons/maps/conditions_map.png');
    this.load.image('arraysMonolithIcon', 'assets/icons/maps/arrays_map.png');
    this.load.image('functionsMonolithIcon', 'assets/icons/maps/functions_map.png');

    // Weapons
    this.load.spritesheet("bullet", "/assets/sprites/player/bullet.png", { frameWidth: 8, frameHeight: 8 });

    // Audio and Sound Effects
    this.load.audio("player_hit", "assets/sfx/player/player_hit.wav");
    this.load.audio("player_heal", "assets/sfx/player/player_heal.wav");
    this.load.audio("energy_gain", "assets/sfx/player/energy_gain.wav");
    this.load.audio("energy_use", "assets/sfx/player/energy_use.wav");
    this.load.audio("cryptos", "assets/sfx/player/cryptos.wav");
    this.load.audio("blaster", "assets/sfx/player/blaster.wav");
    this.load.audio('kaching', 'assets/sfx/player/kaching.wav');
    this.load.audio('error', 'assets/sfx/player/error.wav');
    this.load.audio('rift_summon', 'assets/sfx/player/rift_summon.wav');
    this.load.audio('door', 'assets/sfx/player/door.wav');
    this.load.audio('kiosk', 'assets/sfx/player/kiosk.wav');
    this.load.audio("codequest-overworld", "/assets/bgm/codequest-overworld.wav");
    this.load.audio("codequest-riftboss", "/assets/bgm/codequest-riftboss.wav");
    this.load.audio("codequest-victory", "/assets/bgm/codequest-victory.wav");
  }
  // ================= CREATE =================
  create(data = {}) {
    this.NotificationSystem = new NotificationSystem(this);
    this.NotificationSystem.init();
    this.musicManager = new MusicManager(this);
    // ---- SOUND MANAGER ----
    this.soundManager = new SoundManager(this);
    this.musicManager.play("overworld");

    if (GameState.player?.settings) {
    const s = GameState.player.settings;

    if (s.musicVolume !== undefined) this.musicManager.setVolume(s.musicVolume);
    if (s.musicEnabled !== undefined) {
        s.musicEnabled ? this.musicManager.resume() : this.musicManager.pause();
    }

    if (s.sfxVolume !== undefined) this.soundManager.setVolume(s.sfxVolume);
    if (s.sfxEnabled !== undefined) this.soundManager.setMute(!s.sfxEnabled);
}
    this.doorSpawnMap = {
      "syntax_door": { x: 612, y: 451 },
      "datatypes_door": { x: 466, y: 684 },
      "variables_door": { x: 718, y: 956 },
      "operators_door": { x: 913, y: 656 },
      "conditions_door": { x: 1056, y: 652 },
      "arrays_door": { x: 948, y: 1003 },
      "functions_door": { x: 1058, y: 829 }
    };

    console.log("=== CITY SPAWN DEBUG ===");
    console.log("Incoming data:", data);
    console.log("Incoming spawn:", data.spawn);
    console.log("Exists in map:", data?.spawn && this.doorSpawnMap[data.spawn]);
    SceneTransition.start(this, () => {
      console.log("City scene finished transition");
    });
    // ---- MAP ----
    this.map = this.make.tilemap({ key: "JScriptoriaCity" });
    const tilesets = this.map.tilesets.map(ts => this.map.addTilesetImage(ts.name, ts.name));

    this.groundLayer = this.map.createLayer("ground layer", tilesets);
    this.buildingLayer = this.map.createLayer("building layer", tilesets);
    this.wallLayer = this.map.createLayer("wall layer", tilesets);
    this.monolithLayer = this.map.createLayer("monolith layer", tilesets);
    this.itemLayer = this.map.createLayer("item layer", tilesets);
    this.overlayLayer = this.map.createLayer("overlay layer", tilesets);

    [this.buildingLayer, this.wallLayer, this.itemLayer, this.monolithLayer].forEach(layer => layer.setCollisionByExclusion([-1]));

    this.scanMonolithTiles();

    // House positions
    this.houses = [
      { name: "syntax", x: 609, y: 416, iconKey: "syntaxIcon" },
      { name: "datatypes", x: 464, y: 660, iconKey: "datatypesIcon" },
      { name: "variables", x: 720, y: 934, iconKey: "variablesIcon" },
      { name: "operators", x: 911, y: 627, iconKey: "operatorsIcon" },
      { name: "conditions", x: 1055, y: 628, iconKey: "conditionsIcon" },
      { name: "arrays", x: 943, y: 982, iconKey: "arraysIcon" },
      { name: "functions", x: 1055, y: 805, iconKey: "functionsIcon" }
    ];

    // Monolith positions
    this.monoliths = [
      { name: "syntax", x: 1200, y: 63, iconKey: "syntaxMonolithIcon" },
      { name: "datatypes", x: 79, y: 6, iconKey: "datatypesMonolithIcon" },
      { name: "variables", x: 16, y: 831, iconKey: "variablesMonolithIcon" },
      { name: "operators", x: 31, y: 1295, iconKey: "operatorsMonolithIcon" },
      { name: "conditions", x: 623, y: 1359, iconKey: "conditionsMonolithIcon" },
      { name: "arrays", x: 1360, y: 1359, iconKey: "arraysMonolithIcon" },
      { name: "functions", x: 1375, y: 96, iconKey: "functionsMonolithIcon" }
    ];

    // ---- PLAYER SPAWN ----
    let spawnX, spawnY;

    // PRIORITY 1: door spawn map
    if (data.spawn && this.doorSpawnMap[data.spawn]) {
      spawnX = this.doorSpawnMap[data.spawn].x;
      spawnY = this.doorSpawnMap[data.spawn].y;
      console.log("City spawn from door:", data.spawn);
    } else {
      // PRIORITY 2: default spawn (new game)
      const spawnLayer = this.map.getObjectLayer("Objects") || { objects: [] };

      const spawnObj =
        spawnLayer.objects.find(o => o.name === "MalePlayer") ||
        { x: 704, y: 759 };

      spawnX = Math.round(spawnObj.x / this.TILE_SIZE) * this.TILE_SIZE;
      spawnY = Math.round(spawnObj.y / this.TILE_SIZE) * this.TILE_SIZE;

      console.log("City default spawn");
    }

    this.player = this.physics.add.sprite(spawnX, spawnY, "player_male", 0)
      .setOrigin(0, 1)
      .setCollideWorldBounds(true)
      .setSize(12, 8)
      .setOffset(2, 8)
      .setDepth(5);

    console.log("City received spawn:", data.spawn);
    if (!this.player.activePerks) {
      this.player.activePerks = {};
    }
    //GameState.player = this.player;
    this.player.isCoding = false;
    this.compilerWindow = null;
    this.codingKeyHandler = null;
    this.codingDamageHandler = null;
    this.nearbyDoor = null;
    this.createLessonDoorsFromMap();

    this.player.takeDamage = (amount = 1) => {

      // Update GameState directly (NOT customData)
      if (!GameState.player) return;

      GameState.player.hp -= amount;

      if (GameState.player.hp < 0) {
        GameState.player.hp = 0;
      }

      // Game Over check
      if (GameState.player.hp <= 0) {
        this.onPlayerGameOver();
      }

      // Sync HUD after change
      if (window.HUD) {
        window.HUD.updateHUD();
      }
    };
    this.syncSpriteFromGameState();
    const gs = GameState.player;

    if (this.updateHUD) this.updateHUD();
    if (window.updateHearts) window.updateHearts(gs.hp, gs.max_hp);
    if (window.updateEnergy) window.updateEnergy(gs.energy, gs.max_energy);
    if (window.updateCryptos) window.updateCryptos(gs.cryptos);
    // ---- DEFAULT  ----

    if (GameState.player) {
      if (!GameState.player.perks?.offense) {
        PerksManager.equip(OffensePerks.pixel_gun);
        this.NotificationSystem.add("Equipped default offense perk: Pixel Gun", "system");
      }

      if (!GameState.player.perks?.defense) {
        PerksManager.equip(DefensePerks.magic_mushroom);
        this.NotificationSystem.add("Equipped default defense perk: Magic Mushroom", "system");
      }
    }
    this.tutorialUI = new TutorialUI(this);
    console.log("QUESTS:", QUESTS);
    console.log("Current Quest:", QuestSystem.getCurrentQuest());

    console.log("New Current Quest:", QuestSystem.getCurrentQuest());
    const player = GameState.player;

    if (player?.isNewGame) {

      player.isNewGame = false;
      GameState.player = player;

      this.time.delayedCall(500, () => {
        this.tutorialUI.show();
      });
    }
    // Shop System Logic
    this.shopSystem = new ShopSystem(this);

    // ---- BUG SYSTEM ----
    this.bugGroup = this.physics.add.group(); // ← Group for physics
    this.bugManager = new BugManager(this);
    window.bugManager = this.bugManager;

    //this.physics.world.createDebugGraphic();
    const scheduleRespawn = () => {
      const delay = Phaser.Math.Between(this.spawnMin, this.spawnMax);

      this.time.delayedCall(delay, () => {
        this.spawnBugsOnGrasswalk();
        scheduleRespawn(); // schedule next
      });
    };

    scheduleRespawn();

    // ---- Input hover/lock-on ----
    this.input.on('pointermove', pointer => this.bugManager.updateHover(pointer));
    // Rift click check

    this.input.on('pointerdown', pointer => {
      this.rifts.forEach(rift => {
        const bounds = rift.getBounds();
        if (Phaser.Geom.Rectangle.Contains(bounds, pointer.x, pointer.y)) {
          // Only open compiler if rift is visible, active, and not already debugging
          if (!rift.isDormant && !rift.isDebugging) {
            this.openRiftCompiler(rift);
          }
        }
      });
    });
    // ---- CAMERA ----
    this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels)
      .startFollow(this.player, true, 0.08, 0.08)
      .setZoom(3);

    // ---- MINIMAP ----
    this.createMinimap();
    this.drawMinimapMap(); // Draw static map once

    // ---- COLLIDERS ----
    [this.buildingLayer, this.wallLayer, this.itemLayer, this.monolithLayer]
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

    // Rift logic
    this.riftKiosks = [];
    this.rifts = [];
    this.createRiftSystemsFromMap();

    // ================= SFX =================
    this.load.audio("player_hit", "/assets/sfx/player/player_hit.wav");
    this.load.audio("player_heal", "/assets/sfx/player/player_heal.wav");
    this.load.audio("energy_gain", "/assets/sfx/player/energy_gain.wav");
    this.load.audio("energy_use", "/assets/sfx/player/energy_use.wav");
    this.load.audio("cryptos", "/assets/sfx/cryptos.wav");
    this.soundManager.add('blaster');
    //this.blasterSFX = this.sound.add("blaster", { volume: 0.5 });


    // ---- SYSTEMS ----
    this.createAnimations();
    this.createCityNPCs();
    this.playerController = new PlayerController(this, this.player, this.MOVE_SPEED);
    PerksManager.setScene(this);
    window.currentScene = this;

    
    
    // Group to manage all bullets
    this.bulletGroup = this.physics.add.group({
      classType: Bullet,
      runChildUpdate: true
    });

    // Bullet ↔ Bugs collision
    this.physics.add.overlap(
      this.bulletGroup,
      this.bugGroup,
      this.onBulletHitBug,
      undefined,
      this
    );
    

    // ---- HUD ----
    this.playerHPEl = document.getElementById("playerHP-text");
    this.playerEnergyEl = document.getElementById("playerEnergy-text");
    this.playerCoinsEl = document.getElementById("cryptos-count");

    // ---- HTML MINIMAP INIT ----
    this.initHTMLMinimap();

    // ---- DIALOGUE ----
    const dialogueBoxEl = document.getElementById("dialogue-box");
    const dialogueTextEl = document.getElementById("dialogue-text");
    const dialogueNextEl = document.getElementById("dialogue-next");

    this.dialogueManager = DialogueManager;
    this.dialogueManager.init(this);
    this.dialogueManager.setDomElements({ dialogueBox: dialogueBoxEl, dialogueText: dialogueTextEl, nextBtn: dialogueNextEl });

    // ---- SCENE TRIGGERS ----
    //this.sceneTriggers = setupSceneTriggers(this,this.map,this.player);

    // ---- CHESTS ----
    ChestSystem.init(this, this.player);
    ChestSystem.createAnimations(this);
    ChestSystem.loadFromMap(this.map);

    // ---- HOVER ----
    this.hoverManager = new HoverManager(this);
    this.hoverManager.init();
    this.hoverManager.registerFromObjectLayer(this.map, "hover objects");

    // ---- INTERACTIONS ----
    this.minimapVisible = true;
    this.input.keyboard.on('keydown-M', () => {
      this.minimapVisible = !this.minimapVisible;
      if (this.minimapCanvas) this.minimapCanvas.style.display = this.minimapVisible ? 'block' : 'none';
    });
    this.input.keyboard.on('keydown-T', () => {
      this.soundManager.play('kaching');
    });
    this.input.keyboard.on("keydown-Z", () => {
      console.log("CanTalkTo:", this.playerController?.canTalkTo);
      if (ChestSystem.interact()) return;
      if (this.dialogueManager.activeDialogue) {
        if (this.dialogueManager.isTyping) this.dialogueManager._finishTypingInstant();
        else this.dialogueManager.next();
        return;
      }
      if (this.shopSystem.tryInteract(this.player)) return;

      const npc = this.playerController.canTalkTo;

      if (npc) {
        // ONLY override Elysia
        if (npc.customData?.npcId === "elysia") {
          const dialogueLines = getElysiaDialogue(npc);
          this.dialogueManager.start(dialogueLines);

          const step = QuestSystem.getCurrentStep();
          if (step?.id === "talk_elysia") {
            QuestSystem.completeStep("talk_elysia");
            this.NotificationSystem.add("Quest step completed: Talk to Elysia", "quest");
          }

          return;
        }

        //All other NPCs use Tiled dialogue
        if (npc.customData?.dialogue?.length) {
          this.dialogueManager.start(npc.customData.dialogue);
          return;
        }

        if (npc?.interact) {
          npc.interact();
          return;
        }
      }

      const trigger = this.sceneTriggers?.getNearbyTrigger?.();
      if (trigger) {
        this.sceneTriggers.activateTrigger(trigger, {
          playerHP: this.player.customData.HP,
          playerEnergy: this.player.customData.Energy,
          playerCoins: this.player.customData.Coins
        });
      }

      // Rift interaction
      const kiosk = this.getNearbyRiftKiosk();
      if (kiosk) {

        const step = QuestSystem.getCurrentStep();
        if (step?.id === "summon_rift") {
          QuestSystem.completeStep("summon_rift");
          this.NotificationSystem.add("Rift summoned!", "success");
        }

        this.activateRiftFromKiosk(kiosk);
        return;
      }

      if (this.nearbyDoor && this.canEnterDoor) {

        const targetScene = this.nearbyDoor.getData("scene");
        const lesson = this.nearbyDoor.getData("lesson");
        const lessonOrder = this.nearbyDoor.getData("order");
        let spawnKey = this.nearbyDoor.getData("spawnKey");

        // 🔥 convert "_exit" → "_door"
        if (spawnKey) {
          spawnKey = spawnKey.replace("_exit", "_door");
        }

        const doorName = this.nearbyDoor.name;
        const player = GameState.player;

        const ownedKeystones = player.items?.keyItems?.filter(id =>
          id.startsWith("keystone")
        ) || [];

        // lessonOrder is 0-based index from Tiled
        if (lessonOrder > ownedKeystones.length) {
          this.dialogueManager.start([
            "The door is locked.",
            "Collect the previous keystone to unlock this lesson."
          ]);
          return;
        }

        // ✅ QUEST HOOK
        const step = QuestSystem.getCurrentStep();
        if (step?.id === "go_house") {
          QuestSystem.completeStep("go_house");
          this.NotificationSystem.add("Quest step completed: Go to house", "quest");
        }

        // ---- SAVE PLAYER POSITION BEFORE TRANSITION ----
        //this.savePlayerPosition();
        this.canEnterDoor = false
        this.time.delayedCall(1500, () => {
          this.canEnterDoor = true;
        });
        console.log("DOOR DEBUG:");
        console.log("Door object:", this.nearbyDoor);
        console.log("Door name:", this.nearbyDoor.name);
        console.log("Door data spawnKey:", this.nearbyDoor.getData("spawnKey"));

        // ---- SWITCH SCENE ----
        SceneTransition.start(this, () => {
          this.soundManager.play('door');
          this.scene.start(targetScene, {
            lesson,
            spawn: spawnKey,
            returnSpawn: spawnKey
          });
        });
        //this.NotificationSystem.add(`Entered door: ${doorName}`);
        return;
      }
    });

    // Shoot the bullet with space bar
    this.player.anims.play("attack-down");

    // ================= PLAYER ↔ BUG DAMAGE =================
    this.physics.add.overlap(this.player, this.bugGroup, (player, bug) => {
      if (bug.dealDamage && !player.isHit) {
        bug.dealDamage(player);

        this.soundManager.play("player_hit", { volume: 0.4 });

        player.isHit = true;

        this.time.delayedCall(300, () => {
          player.isHit = false;
        });
        this.NotificationSystem.add(`Hit by ${bug.name || "enemy"}! Lost HP`, "error");
      }
    });
    if (window.HUD) window.HUD.updateHUD();
    // ---- SAFETY REFRESH AFTER FULL SCENE INIT ----
    this.time.delayedCall(0, () => {
      if (window.HUD) window.HUD.updateHUD();
    });
    this.events.on("shutdown", () => {
      if (this.npcs) {
        this.npcs.forEach(npc => {
          const el = npc.customData?.nameEl;
          if (el) el.remove();
        });
      }
      this.NotificationSystem?.destroy();
      this.musicManager.stop();
    });
  }
  // ================= UPDATE =================
  update(time, delta) {
    if (!this.playerController) return;
    this.playerController.update(this.npcs);
    //console.log("NPC COUNT:", this.npcs.length);

    // Update NPC name positions

    // 🔥 Update NPC HTML name positions
    if (this.npcs) {
      const cam = this.cameras.main;

      this.npcs.forEach(npc => {
        const el = npc.customData?.nameEl;
        if (!el || !npc.active) return;

        // Convert world → screen
        const screenX = (npc.x - cam.worldView.x) * cam.zoom;
        const screenY = (npc.y - cam.worldView.y) * cam.zoom;

        el.style.left = `${screenX}px`;
        el.style.top = `${screenY - 16}px`; // adjust height
      });
    }


    if (this.bugManager) {
      this.bugManager.update(time, delta);

      // Call each bug's own update (movement, AI)
      this.bugManager.bugs.forEach(bug => {
        if (bug.update) bug.update(time, delta);
      });

      // Lock-on highlight
      if (this.bugManager.lockedBug) {
        this.bugManager.lockedBug.setTint(0xff0000); // red
      } else {
        this.bugManager.bugs.forEach(bug => bug.clearTint());
      }
    }
    //this.handlePerkEffects();


    // ---- MINIMAP UPDATE ----
    if (this.minimap) {
      this.minimap.clear();
      this.drawMinimapMap();
      this.drawHTMLMinimapHouses();
      this.drawHTMLMinimapMonoliths();
      this.drawMinimapPlayer();
      this.drawMinimapBugs();
    }

    // ---- HTML MINIMAP UPDATE ----
    if (this.minimapCtx) {
      // Clear dynamic layer only
      this.minimapCtx.clearRect(
        0,
        0,
        this.minimapWidth,
        this.minimapHeight
      );

      // Redraw
      this.drawHTMLMinimapMap();
      this.drawHTMLMinimapHouses();
      this.drawHTMLMinimapMonoliths();
      this.drawHTMLMinimapPlayer();
      this.drawHTMLMinimapBugs();
    }

    if (this.nearbyDoor) {
      if (!this.physics.overlap(this.player, this.nearbyDoor)) {
        this.nearbyDoor = null;
      }
    }
  }
  // ================= ANIMATIONS =================
  createAnimations() {
    const anims = this.anims;

    if (!anims.exists("walk-down")) anims.create({ key: "walk-down", frames: anims.generateFrameNumbers("player_male", { start: 0, end: 2 }), frameRate: 12, repeat: -1 });
    if (!anims.exists("walk-right")) anims.create({ key: "walk-right", frames: anims.generateFrameNumbers("player_male", { start: 3, end: 5 }), frameRate: 12, repeat: -1 });
    if (!anims.exists("walk-left")) anims.create({ key: "walk-left", frames: anims.generateFrameNumbers("player_male", { start: 6, end: 8 }), frameRate: 12, repeat: -1 });
    if (!anims.exists("walk-up")) anims.create({ key: "walk-up", frames: anims.generateFrameNumbers("player_male", { start: 9, end: 11 }), frameRate: 12, repeat: -1 });
    // ---- ATTACK ANIMS ----
    this.anims.create({
      key: "attack-down",
      frames: [{ key: "player_male", frame: 12 }],
      frameRate: 1,
      repeat: 0
    });

    this.anims.create({
      key: "attack-right",
      frames: [{ key: "player_male", frame: 13 }],
      frameRate: 1,
      repeat: 0
    });

    this.anims.create({
      key: "attack-left",
      frames: [{ key: "player_male", frame: 14 }],
      frameRate: 1,
      repeat: 0
    });

    this.anims.create({
      key: "attack-up",
      frames: [{ key: "player_male", frame: 15 }],
      frameRate: 1,
      repeat: 0
    });

    if (!anims.exists("npc-idle-down")) anims.create({ key: "npc-idle-down", frames: [{ key: "kaelen", frame: 1 }], frameRate: 1, repeat: -1 });

    //Bugs
    if (!anims.exists("slime-move-right")) anims.create({
      key: "slime-move-right",
      frames: anims.generateFrameNumbers("slime", { start: 0, end: 1 }),
      frameRate: 6,
      repeat: -1
    });

    if (!anims.exists("slime-move-left")) anims.create({
      key: "slime-move-left",
      frames: anims.generateFrameNumbers("slime", { start: 5, end: 6 }),
      frameRate: 6,
      repeat: -1
    });
    // --- Wisp Right ---
    if (!anims.exists("wisp-move-right")) {
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
    if (!anims.exists("wisp-move-left")) {
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
  createCityNPCs() {

    const layer = this.map.getObjectLayer("CityNPCs");
    //console.log("CityNPCs layer:", layer);
    if (!layer) {
      console.warn("CityNPCs layer not found.");
      return;
    }

    this.npcs = [];


    layer.objects.forEach(obj => {
      // console.log("Processing NPC object:", obj);
      // ✅ SAFELY HANDLE PROPERTIES
      const props = Array.isArray(obj.properties)
        ? obj.properties
        : [];

      const npcIdProp = props.find(p => p.name === "npcId");
      const dialogueProp = props.find(p => p.name === "dialogue");
      const nameProp = props.find(p => p.name === "name");

      const npcId = npcIdProp?.value || "kaelen";

      let dialogue = ["Hello."];
      if (dialogueProp?.value) {
        try {
          dialogue = JSON.parse(dialogueProp.value);
        } catch {
          dialogue = [dialogueProp.value];
        }
      }

      const npc = this.physics.add.sprite(obj.x, obj.y, npcId, 0)
        .setOrigin(0.5, 0.5) // <-- use the fixed origin
        .setImmovable(true)
        .setSize(12, 8)
        .setOffset(2, 8)
        .setDepth(obj.y);

      // ================= NAME ABOVE HEAD =================
      // 🔥 CREATE HTML ELEMENT
      const npcName = nameProp?.value || npcId;

      // 🔥 CREATE HTML LABEL
      const nameEl = document.createElement("div");
      nameEl.textContent = npcName;

      Object.assign(nameEl.style, {
        position: "absolute",
        color: "#fff",
        fontSize: "10px",
        fontFamily: "monospace",
        pointerEvents: "none",
        transform: "translate(-50%, -100%)", // center + above
        zIndex: 9999
      });

      document.body.appendChild(nameEl);

      // store reference
      npc.customData = {
        dialogue,
        npcId,
        name: npcName,
        nameEl // 👈 IMPORTANT
      };

      npc.interact = () => {
        DialogueManager.start(dialogue);
      };

      this.physics.add.collider(this.player, npc);
      this.npcs.push(npc);
    });
  }
  // ================= BUG SPAWNING =================
  spawnBugsOnGrasswalk() {
    if (!this.groundLayer) return;

    const currentActive = this.bugGroup.countActive(true);
    const availableSlots = this.maxBugs - currentActive;

    if (availableSlots <= 0) return;

    const width = this.map.width;
    const height = this.map.height;

    const grasswalkTileset = this.map.tilesets.find(
      (ts) => ts.name === "grasswalk"
    );

    if (!grasswalkTileset) {
      console.warn("Grasswalk tileset not found!");
      return;
    }

    const firstGid = grasswalkTileset.firstgid;
    const lastGid = firstGid + grasswalkTileset.total - 1;

    const grassTiles = [];

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const tile = this.groundLayer.getTileAt(x, y);
        if (!tile) continue;
        if (tile.index >= firstGid && tile.index <= lastGid) {
          grassTiles.push({ x, y });
        }
      }
    }

    Phaser.Utils.Array.Shuffle(grassTiles);

    const spawnTotal = Math.min(availableSlots, grassTiles.length);

    for (let i = 0; i < spawnTotal; i++) {
      const { x, y } = grassTiles[i];
      const worldXY = this.groundLayer.tileToWorldXY(x, y);
      const worldX = worldXY.x;
      const worldY = worldXY.y + this.TILE_SIZE;

      const rand = Math.random();
      let bug;

      if (rand < 0.25)
        bug = new SyntaxGolemBug(this, worldX, worldY, "golem", {
          dmg: 2,
          detectRange: 2,
        });
      else if (rand < 0.5)
        bug = new ReferenceWispBug(this, worldX, worldY, "wisp");
      else if (rand < 0.75)
        bug = new RangeSlimeBug(this, worldX, worldY, "slime");
      else bug = new TypeMimicBug(this, worldX, worldY, "mimic");

      this.bugManager.addBug(bug);
      this.bugGroup.add(bug);
    }

    console.log("Spawned:", spawnTotal, " | Active:", this.bugGroup.countActive(true));
  }
  // ================= RIFT SYSTEM =================
  createRiftSystemsFromMap() {
    const layer = this.map.getObjectLayer("rifts layer");
    if (!layer) return;

    const currentQuestIndex =
      GameState.player.worldState?.questProgress?.currentQuestIndex ?? 0;

    const currentQuest = QUESTS[currentQuestIndex];

    layer.objects.forEach(obj => {

      // Rift spawns
      if (obj.name === "rift_spawn") {
        let riftName = obj.properties?.find(
          p => p.name === "riftName"
        )?.value;

        riftName = RIFT_ID_MAP[riftName] ?? riftName;

        console.log("Tiled Rift Property:", obj.properties);
        console.log("Resolved Rift Name:", riftName);

        const rift = new InternalRiftBug(this, obj.x, obj.y, riftName);

        // Add to physics + tracking
        this.bugGroup.add(rift);
        this.rifts.push(rift);

        // 🔒 Default: hidden
        rift.setVisible(false);
        rift.body.enable = false;
        rift.isDormant = true;

        // ✅ QUEST GATING (correct place)
        if (rift.riftName !== currentQuest.id) {
          // Not the active quest rift → keep disabled
          rift.isDormant = true;
        } else {
          // Active quest rift → allow activation
          rift.setVisible(true);
          rift.body.enable = true;
          rift.isDormant = false;
        }

        rift.setInteractive({ useHandCursor: true });

        rift.on("pointerdown", () => {
          if (!rift.isDormant && !rift.isDebugging) {
            this.openRiftCompiler(rift);
          }
        });

        console.log("Registered Rift:", riftName);
      }

      // Rift kiosks
      if (obj.name === "rift_kiosk") {
        const kioskName = obj.properties?.find(
          p => p.name === "kioskName"
        )?.value;

        this.riftKiosks.push({
          x: obj.x,
          y: obj.y,
          kioskName,
          cooldown: false
        });

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
    if (!kiosk?.kioskName) return;
    this.soundManager.play('kiosk');

    const owned = GameState.player.items.keyItems || [];


    // 🔒 KEYCARD VALIDATION
    const category = kiosk.kioskName
      .replace(" Kiosk", "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "");

    console.log("Category: ", category);

    const requiredKeycard = `keycard_${category}`;

    console.log("Required:", requiredKeycard);
    console.log("Owned:", owned);
    console.log(
      "Match result:",
      owned.includes(requiredKeycard)
    );
    if (!GameState.hasKeyItem(requiredKeycard)) {
      console.log("❌ Missing keycard:", requiredKeycard);
      const keycardName = getItemName(requiredKeycard);

      this.NotificationSystem.add(
        `Missing required keycard: ${keycardName}`,
        "error"
      );
      return;
    }


    console.log("✅ Keycard verified:", requiredKeycard);

    // Convert "Syntax Kiosk" → "Syntax Monolith"
    const targetRiftName = kiosk.kioskName.replace("Kiosk", "Monolith");

    // Normalize to internal ID
    const riftId = normalizeRiftName(targetRiftName); // e.g., "Syntax", "DataTypes"
    this.NotificationSystem.add(
      `${riftId} Rift activated!`,
      "quest"
    );
    console.log("Looking for rift:", targetRiftName, "→", riftId);

    // Ensure riftProgress exists
    GameState.player.riftProgress = GameState.player.riftProgress || {};
    const riftProgress = GameState.player.riftProgress[riftId];

    if (riftProgress?.completed) {
      console.log(`[Rift] ${riftId} already completed, skipping activation`);
      this.NotificationSystem.add(
        `${riftId} Rift already completed.`,
        "warning"
      );
      return;
    }

    const rift = this.rifts.find(r => r.riftName === riftId);
    if (!rift) {
      console.warn(`[Rift] No Rift found for: ${targetRiftName}`);
      return;
    }

    // Prevent duplicate activation
    if (rift.isActive || rift.isDebugging) {
      console.log(`[Rift] Rift already active or debugging: ${riftId}`);
      this.NotificationSystem.add(
        `${riftId} Rift is already active.`,
        "warning"
      );
      return;
    }

    console.log(`[Rift] Summoning Rift: ${riftId}`);

    // Reveal if dormant
    if (rift.isDormant) {
      rift.setVisible(true);
      if (!rift.body) this.physics.world.enable(rift);
      rift.body.enable = true;
      rift.isDormant = false;

      rift.setScale(0);
      this.tweens.add({
        targets: rift,
        scale: 1,
        duration: 300,
        ease: "Back.Out"
      });
    }

    // Assign challenges
    const challenges = RiftChallenges[riftId];
    if (!challenges?.length) {
      console.warn(`[Rift] No challenges found for category: ${kiosk.kioskName}`);
      return;
    }

    rift.challenges = challenges;
    rift.currentChallenge = 0;
    rift.completed = false;
    rift.isActive = true;

    // Play music
    this.musicManager.fadeTo("riftboss", 1000);

    // Activate rift
    rift.activate(riftId, () => {
      // Completion callback
      rift.completed = true;
      rift.isActive = false;

      // Save progress
      GameState.player.riftProgress[riftId] = {
        completed: true,
        completedChallenges: challenges.map((_, i) => i)
      };
      GameState.player = GameState.player; // trigger save

      // Animate and remove
      this.tweens.add({
        targets: rift,
        scale: 0,
        duration: 300,
        ease: "Back.In",
        onComplete: () => rift.destroy()
      });

      console.log(`[Rift] ${riftId} completed and destroyed`);
    });
  }
  openRiftCompiler(rift) {

    console.log("=== OPEN COMPILER DEBUG ===");
    console.log("Rift object:", rift);
    console.log("Rift name:", rift.riftName);
    console.log(
      "ChallengeIndex:",
      rift.challengeIndex
    );
    console.log(
      "Pool length:",
      rift.challengePool?.length
    );
    console.log(
      "Pool data:",
      rift.challengePool
    );
    console.log("===========================");

    if (this.isCompilerOpen) return;

    this.activeRift = rift;
    this.isCompilerOpen = true;
    this.player.isCoding = true;
    this.playerController.freeze();
    this.isUIBlockingInput = true;
    rift.isDebugging = true;

    // Challenge tracking
    rift.challengeIndex = rift.challengeIndex ?? 0;
    rift.totalChallenges = rift.totalChallenges ?? rift.challengePool.length;

    const challenge = rift.challengePool[rift.challengeIndex];

    // Create container
    const container = document.createElement("div");
    container.id = `rift-debug-${rift.riftName}`;

    Object.assign(container.style, {
      position: "absolute",
      left: "50px",
      top: "50px",
      width: "420px",
      height: "340px",
      background: "rgba(0,0,0,0.95)",
      border: "2px solid #0f0",
      padding: "10px",
      color: "#0f0",
      fontFamily: "monospace",
      overflow: "hidden",
      zIndex: 10000
    });

    // Instruction panel
    const instruction = document.createElement("div");
    instruction.textContent = challenge?.instruction ?? "No instruction.";
    instruction.style.marginBottom = "8px";
    instruction.style.color = "#8f8";
    container.appendChild(instruction);

    // Code textarea
    const textarea = document.createElement("textarea");

    Object.assign(textarea.style, {
      width: "100%",
      height: "180px",
      background: "#111",
      color: "#0f0",
      border: "1px solid #0f0",
      padding: "5px",
      resize: "none"
    });

    textarea.value = challenge?.starterCode ?? "";
    container.appendChild(textarea);

    textarea.addEventListener("keydown", (e) => {
      e.stopPropagation();
    });

    // Console output box
    const consoleBox = document.createElement("div");

    Object.assign(consoleBox.style, {
      height: "50px",
      marginTop: "8px",
      background: "#050505",
      border: "1px solid #0f0",
      padding: "5px",
      overflowY: "auto",
      fontSize: "12px"
    });

    container.appendChild(consoleBox);

    // Helper to print in console UI
    const printConsole = (msg, isError = false) => {
      const line = document.createElement("div");
      line.textContent = msg;
      line.style.color = isError ? "#f55" : "#0f0";
      consoleBox.appendChild(line);
      consoleBox.scrollTop = consoleBox.scrollHeight;
    };

    // ==============================
    // Compile button
    // ==============================
    const compileBtn = document.createElement("button");
    compileBtn.textContent = "Compile";
    compileBtn.style.marginTop = "8px";

    compileBtn.onclick = () => {
      consoleBox.innerHTML = "";
      const code = textarea.value;
      const challenge = rift.challengePool[rift.challengeIndex];

      if (!challenge) {
        printConsole("⚠️ No challenge data found.", true);
        return;
      }

      try {
        //  Syntax check
        new Function(code);

        //  Sandbox execution
        const sandboxConsole = { log: (...args) => printConsole(args.join(" ")) };
        const sandboxFunc = new Function("console", `"use strict"; ${code}`);
        sandboxFunc(sandboxConsole);

        // Challenge validation
        let success = false;
        if (challenge.validate) {
          success = challenge.validate(code);
        } else if (challenge.solution) {
          success = code.trim() === challenge.solution.trim();
        }

        if (!success) {
          printConsole("❌ Code ran but failed validation.", true);
          this.NotificationSystem.add(
            "Incorrect solution submitted.",
            "error"
          );
          return;
        }

        // Success flow
        printConsole("✅ Challenge cleared!");
        console.log("=== SUCCESS FLOW DEBUG START ===");
        console.log("Rift object:", rift);
        console.log("ChallengeIndex BEFORE advance:", rift.challengeIndex);
        console.log("Challenge pool length:", rift.challengePool?.length);
        console.log("Completed flag BEFORE:", rift.completed);

        try {
          rift.advanceChallenge();
          this.NotificationSystem.add(
            `Challenge ${rift.challengeIndex + 1} cleared!`,
            "success"
          );

          console.log("AdvanceChallenge executed successfully");
          console.log("ChallengeIndex AFTER advance:", rift.challengeIndex);
          console.log("Completed flag AFTER:", rift.completed);

        } catch (advanceError) {
          console.error("❌ advanceChallenge crashed:", advanceError);
          throw advanceError;
        }

        this.soundManager.play("energy_gain");

        if (rift.completed) {
          console.log("Rift marked as completed — defeating rift");

          this.defeatRift(rift);
          printConsole("🗝️ Keystone obtained!");

          setTimeout(() => {
            console.log("Closing compiler after completion");
            this.closeRiftCompiler(rift);
          }, 1200);

        } else {
          console.log("Loading next challenge UI");

          const nextChallenge = rift.challengePool[rift.challengeIndex];

          console.log("Next challenge object:", nextChallenge);

          if (nextChallenge) {
            textarea.value = nextChallenge.starterCode ?? "";
            instruction.textContent = nextChallenge.instruction ?? "";

            printConsole(
              `➡️ Next Challenge: ${rift.challengeIndex + 1}/${rift.totalChallenges}`
            );
            this.NotificationSystem.add(
              `Next Rift Challenge unlocked.`,
              "quest"
            );
          } else {
            console.warn("⚠️ Next challenge is undefined!");
          }
        }

        console.log("=== SUCCESS FLOW DEBUG END ===");

      } catch (e) {
        printConsole(`❌ Compilation error: ${e.message}`, true);
        this.NotificationSystem.add(
          `Compilation Error: ${e.message}`,
          "error"
        );

        /* Damage penalty
        this.player.takeDamage(1);
        if (window.HUD) window.HUD.updateHUD();

        if (this.player.hp <= 0) {
          this.closeRiftCompiler(rift);
        }
        */
      }
    };

    container.appendChild(compileBtn);

    // Close button
    const closeBtn = document.createElement("button");
    closeBtn.textContent = "Close";
    closeBtn.style.marginLeft = "10px";

    closeBtn.onclick = () => {
      this.closeRiftCompiler(rift);
    };

    container.appendChild(closeBtn);

    // Attach to DOM
    document.body.appendChild(container);
    this.compilerWindow = container;

    // Emergency close if damaged
    this.codingDamageHandler =
      this.physics.add.overlap(
        this.player,
        this.bugGroup,
        (player, bug) => {
          if (!player.isCoding) return;

          if (bug.dealDamage) {
            bug.dealDamage(player);
            this.soundManager.play("player_hit", { volume: 0.4 });
            this.closeRiftCompiler(rift);
          }
        }
      );
  }
  closeRiftCompiler(rift) {
    // Prevent double execution
    if (!this.isCompilerOpen) return;

    this.player.isCoding = false;
    this.playerController.unfreeze();
    this.isUIBlockingInput = false;

    // Remove compiler DOM element
    if (this.compilerWindow) {
      document.body.removeChild(this.compilerWindow);
      this.compilerWindow.remove();
      this.compilerWindow = null;
    }

    this.isCompilerOpen = false;

    // Remove the temporary damage handler
    if (this.codingDamageHandler) {
      this.physics.world.removeCollider(this.codingDamageHandler);
      this.codingDamageHandler = null;
    }

    // Reset rift debugging flag
    if (rift) rift.isDebugging = false;

    // Optional callback
    if (rift && rift.onCodingClosed) rift.onCodingClosed();
  }
  defeatRift(rift) {
    if (!rift || !rift.completed) return;
    this.soundManager.play('rift_summon');
    // Stop boss music first
      this.musicManager.stop();

      // Small delay so Phaser fully clears the old sound
      this.time.delayedCall(100, () => {
        this.musicManager.play("victory", {
          volume: 1,
          loop: false
        });

        // Return to overworld after victory theme
        this.time.delayedCall(4000, () => {
          this.musicManager.fadeTo("overworld", 1000);
        });
      });

    console.log("RiftName:", rift.riftName);
    console.log("Mapped Keystone:", KEYSTONE_MAP[rift.riftName]);

    const player = GameState.player;
    if (!player) return;

    // =========================
    // Rift Progress Save
    // =========================
    player.riftProgress = player.riftProgress || {};
    player.riftProgress[rift.riftName] =
      player.riftProgress[rift.riftName] || {};

    player.riftProgress[rift.riftName].completed = true;

    // =========================
    // Keystone Reward
    // =========================
    const keystoneId = KEYSTONE_MAP[rift.riftName];

    if (keystoneId) {
      player.items = player.items || {};
      player.items.keyItems = player.items.keyItems || [];

      const owned = player.items.keyItems;

      if (!owned.includes(keystoneId)) {
        const ownedKeystones = owned.filter(id =>
          id.startsWith("keystone")
        );

        const expected = KEY_ITEM_ORDER[ownedKeystones.length];

        if (keystoneId !== expected) {
          console.warn(
            `Keystone out of order. Expected: ${expected}, Got: ${keystoneId}`
          );
          return;
        }

        owned.push(keystoneId);
        console.log("🗝️ Keystone added:", keystoneId);
      }

      console.log("Owned key items:", player.items.keyItems);
    }

    GameState.player = player;

    // =========================
    // QUEST HOOK (FIXED)
    // =========================
    const step = QuestSystem.getCurrentStep();

    console.log("Current Step Object:", step);
    console.log("Expected Step ID:", step?.id);

    if (step?.id === "defeat_rift") {
      console.log("✅ Completing quest step: defeat_rift");
      QuestSystem.completeStep("defeat_rift");
      this.NotificationSystem.add(
        `${rift.riftName} Rift defeated!`,
        "success"
      );
    } else {
      console.warn("⚠️ Quest step not completed (not defeat_rift).");
    }

    //alert(`🗝️ You obtained the ${rift.riftName} Keystone!`);
    const keystoneName = getItemName(keystoneId);

    this.NotificationSystem.add(
      `Obtained ${keystoneName}!`,
      "quest"
    );
  }
  syncSpriteFromGameState() {
    const gs = GameState.player;
    if (!gs) return;

    this.player.customData = {
      HP: gs.hp ?? 3,
      maxHP: gs.max_hp ?? 3,
      Energy: gs.energy ?? 10,
      maxEnergy: gs.max_energy ?? 10,
      Coins: gs.cryptos ?? 0
    };
  }
  // ================= MINIMAP =================
  createMinimap() {
    this.minimap = this.add.graphics();
    this.minimap.setScrollFactor(0);
    this.minimap.setDepth(9999);

    this.mapScaleX = this.minimapWidth / this.map.widthInPixels;
    this.mapScaleY = this.minimapHeight / this.map.heightInPixels;
  }
  drawMinimapMap() {
    if (!this.minimap) return;

    // Background
    this.minimap.fillStyle(0x000000, 0.6);
    this.minimap.fillRect(
      this.minimapX,
      this.minimapY,
      this.minimapWidth,
      this.minimapHeight
    );

    // Walls
    if (!this.wallLayer) return;

    this.wallLayer.forEachTile(tile => {
      if (tile.index === -1) return;

      const x = this.minimapX + tile.pixelX * this.mapScaleX;
      const y = this.minimapY + tile.pixelY * this.mapScaleY;

      this.minimap.fillStyle(0x666666, 1);
      this.minimap.fillRect(
        x,
        y,
        tile.width * this.mapScaleX,
        tile.height * this.mapScaleY
      );
    });

    // Border
    this.minimap.lineStyle(2, 0xffffff, 1);
    this.minimap.strokeRect(
      this.minimapX,
      this.minimapY,
      this.minimapWidth,
      this.minimapHeight
    );
  }
  drawMinimapPlayer() {
    if (!this.player) return;

    const x = this.minimapX + this.player.x * this.mapScaleX;
    const y = this.minimapY + this.player.y * this.mapScaleY;

    this.minimap.fillStyle(0x00ff00, 1);
    this.minimap.fillCircle(x, y, 3);
  }
  drawMinimapBugs() {
    if (!this.bugGroup) return;

    this.bugGroup.children.iterate(bug => {
      if (!bug || !bug.active) return;

      const x = this.minimapX + bug.x * this.mapScaleX;
      const y = this.minimapY + bug.y * this.mapScaleY;

      this.minimap.fillStyle(0xff0000, 1);
      this.minimap.fillCircle(x, y, 2);
    });
  }
  // ================= HTML MINIMAP INIT =================
  scanMonolithTiles() {
    if (!this.monolithLayer) return;

    this.monoliths = [];

    this.monolithLayer.forEachTile(tile => {
      if (tile.index === -1) return;

      const tileset = this.map.tilesets.find(ts =>
        tile.index >= ts.firstgid &&
        tile.index < ts.firstgid + ts.total
      );

      if (!tileset) return;

      if (tileset.name.startsWith("monolith")) {
        this.monoliths.push({
          x: tile.pixelX,
          y: tile.pixelY
        });
      }
    });

    console.log("Detected Monoliths:", this.monoliths.length);
  }
  initHTMLMinimap() {
    this.minimapCanvas = document.getElementById("minimapCanvas");
    if (!this.minimapCanvas) {
      console.warn("Minimap canvas not found!");
      return;
    }

    this.minimapCtx = this.minimapCanvas.getContext("2d");

    // Map → minimap scale
    this.mapScaleX = this.minimapWidth / this.map.widthInPixels;
    this.mapScaleY = this.minimapHeight / this.map.heightInPixels;

    // Draw static map once
    this.drawHTMLMinimapMap();
  }
  drawHTMLMinimapMap() {
    if (!this.minimapCtx) return;

    const ctx = this.minimapCtx;

    // Background
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, 0, this.minimapWidth, this.minimapHeight);

    if (!this.wallLayer) return;

    this.wallLayer.forEachTile(tile => {
      if (tile.index === -1) return;

      const x = tile.pixelX * this.mapScaleX;
      const y = tile.pixelY * this.mapScaleY;

      ctx.fillStyle = "#666";
      ctx.fillRect(
        x,
        y,
        tile.width * this.mapScaleX,
        tile.height * this.mapScaleY
      );
    });

    // Border
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, this.minimapWidth, this.minimapHeight);
  }
  drawHTMLMinimapPlayer() {
    if (!this.minimapCtx || !this.player) return;

    const ctx = this.minimapCtx;

    const x = this.player.x * this.mapScaleX;
    const y = this.player.y * this.mapScaleY;

    ctx.fillStyle = "#00ff00";
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  drawHTMLMinimapBugs() {
    if (!this.minimapCtx || !this.bugGroup) return;

    const ctx = this.minimapCtx;

    this.bugGroup.children.iterate(bug => {
      if (!bug || !bug.active) return;

      const x = bug.x * this.mapScaleX;
      const y = bug.y * this.mapScaleY;

      ctx.fillStyle = "#ff0000";
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    });
  }
  drawHTMLMinimapHouses() {
    if (!this.minimapCtx || !this.houses) return;
    const ctx = this.minimapCtx;

    this.houses.forEach(house => {
      const x = house.x * this.mapScaleX;
      const y = house.y * this.mapScaleY;

      const icon = this.textures.get(house.iconKey).getSourceImage();
      const size = 8; // adjust for minimap scale
      ctx.drawImage(icon, x - size / 2, y - size / 2, size, size);
    });
  }
  drawHTMLMinimapMonoliths() {
    if (!this.minimapCtx || !this.monoliths) return;
    const ctx = this.minimapCtx;

    this.monoliths.forEach(m => {
      const x = m.x * this.mapScaleX;
      const y = m.y * this.mapScaleY;

      const icon = this.textures.get(m.iconKey).getSourceImage();
      const size = 8;
      ctx.drawImage(icon, x - size / 2, y - size / 2, size, size);
    });
  }
  onBulletHitBug(bullet, bug) {
    if (!bullet.active || !bug.active) return;
    if (bug instanceof InternalRiftBug) return;
    bullet.destroy();


    if (bug.takeDamage) {
      bug.takeDamage(1);
    } else {
      bug.destroy();
      this.rewardPlayerForBugKill();
    }
  }
  rewardPlayerForBugKill() {
    const reward = Phaser.Math.Between(300, 500);

    if (!GameState.player) return;

    GameState.player.cryptos += reward;

    console.log("Earned cryptos:", reward);
    this.NotificationSystem.add(
      `Defeated enemy! +${reward} Cryptos`,
      "success"
    );

    if (window.updateCryptos) {
      window.updateCryptos(GameState.player.cryptos);
    }

    if (window.HUD) {
      window.HUD.updateHUD();
    }
  }
  onPlayerGameOver() {
    console.log("Triggering Game Over");
    this.NotificationSystem.add(
      "You were defeated...",
      "error"
    );

    // Freeze gameplay
    this.playerController.freeze();

    // Close compiler if open
    if (this.isCompilerOpen && this.activeRift) {
      this.closeRiftCompiler(this.activeRift);
    }

    // Stop bug movement
    this.bugGroup.children.iterate(bug => {
      if (bug) bug.setVelocity(0, 0);
    });

    // Reset ALL rifts safely
    this.rifts.forEach(rift => {

      // 🛑 Stop summon loop
      if (rift.summonEvent) {
        rift.summonEvent.remove();
        rift.summonEvent = null;
      }

      // 🔄 Reset active state
      rift.isActive = false;

      // 🔁 Reset progress ONLY if not completed
      if (!rift.completed) {
        rift.challengeIndex = 0;

        const gsRift =
          GameState.player.riftProgress[rift.riftName];

        if (gsRift) {
          gsRift.challengeIndex = 0;
        }
      }

      // 👁️ Hide + disable physics
      rift.setVisible(false);

      if (rift.body) {
        rift.body.enable = false;
      }

      rift.isDormant = true;
    });
    this.rifts.forEach(rift => {
      if (rift && rift.destroy) {
        rift.destroy();
      }
    });

    this.rifts = [];
    // Delay → show game over UI
    this.time.delayedCall(1000, () => {
      this.showGameOverScreen();
    });
  }
  showGameOverScreen() {
    // Prevent duplicates
    if (this.gameOverUI) return;

    const container = document.createElement("div");
    this.gameOverUI = container;   // 🔥 store reference
    Object.assign(container.style, {
      position: "absolute",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      background: "rgba(0,0,0,0.9)",
      color: "#f00",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      fontFamily: "monospace",
      zIndex: 20000,
      gap: "12px"
    });

    // Title
    const title = document.createElement("h1");
    title.textContent = "💀 GAME OVER 💀";
    container.appendChild(title);

    // ===== Retry Button =====
    const retryBtn = document.createElement("button");
    retryBtn.textContent = "Retry";
    retryBtn.onclick = () => {

      this.removeGameOverUI();   // 🔥 clear overlay first

      this.playerController.unfreeze();

      this.scene.restart({
        spawn: "MalePlayer"
      });
    };
    container.appendChild(retryBtn);

    // ===== Return to Main Menu =====
    const mainMenuBtn = document.createElement("button");
    mainMenuBtn.textContent = "Return to Main Menu";
    mainMenuBtn.onclick = () => {
      this.removeGameOverUI();               // remove overlay
      this.playerController.unfreeze();

      // Go back to index.html (Login menu) for now
      window.location.href = "index.html";
    };
    container.appendChild(mainMenuBtn);

    // Add container to DOM
    document.body.appendChild(container);
  }
  removeGameOverUI() {
    if (this.gameOverUI) {
      this.gameOverUI.remove();
      this.gameOverUI = null;
    }
  }
  createLessonDoorsFromMap() {
    const doorLayer = this.map.getObjectLayer("LessonDoors");
    if (!doorLayer) return;

    this.lessonDoors = [];

    doorLayer.objects.forEach(obj => {
      const doorX = obj.x + (obj.width / 2);
      const doorY = obj.y + (obj.height / 2);

      const doorZone = this.add.zone(doorX, doorY, obj.width, obj.height);
      this.physics.world.enable(doorZone);

      doorZone.body.setAllowGravity(false);
      doorZone.body.setImmovable(true);

      // --- LESSON DATA ---
      const lesson = obj.properties?.find(p => p.name === "lesson")?.value;
      const order = obj.properties?.find(p => p.name === "order")?.value;

      // --- SPAWN KEY ---
      const spawnKey = obj.properties?.find(p => p.name === "spawnKey")?.value;

      // Store for transition
      doorZone.setData("scene", "LessonHouseScene");
      doorZone.setData("lesson", lesson);
      doorZone.setData("order", order);
      doorZone.setData("spawnKey", spawnKey); // 👈 NEW

      // Player overlap detection
      this.physics.add.overlap(this.player, doorZone, () => {
        this.nearbyDoor = doorZone;
      });

      this.lessonDoors.push(doorZone);
    });
  }
  refreshHUD() {
    const gs = GameState.player;
    if (!gs) return;

    if (this.updateHUD) this.updateHUD();
    if (window.updateHearts) window.updateHearts(gs.hp, gs.max_hp);
    if (window.updateEnergy) window.updateEnergy(gs.energy, gs.max_energy);
    if (window.updateCryptos) window.updateCryptos(gs.cryptos);
  }
  // I don't know if this one should be used...
  savePlayerPosition() {
    const player = GameState.player;
    if (!player) return;

    GameState.player = {
      ...player,
      worldState: {
        ...player.worldState,
        position: { x: this.player.x, y: this.player.y }
      }
    };
    /*
      GameState.setScenePosition(this.scene.key, player.x, player.y);
      console.log("[GameState] Saved player position:", this.player.x, this.player.y);
      */
  }
}
function getElysiaDialogue(npc) {
  if (npc?.customData?.npcId !== "elysia") {
    return npc?.customData?.dialogue || ["..."];
  }

  const player = GameState.player;
  if (!player) return ["Hello!"];

  const keystones = player.items?.keyItems?.filter(id =>
    id.startsWith("keystone")
  ) || [];

  const count = keystones.length;

  // Determine which lesson the player is currently on
  const lessonKeys = Object.keys(elysiaDialogues);
  const currentLessonKey = lessonKeys[Math.min(count, lessonKeys.length - 1)];

  const lines = elysiaDialogues[currentLessonKey];

  // Pick a random line for variety
  const randomLine = lines[Math.floor(Math.random() * lines.length)];

  return [randomLine];
}
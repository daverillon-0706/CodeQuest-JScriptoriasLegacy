import Phaser from "phaser";
import PlayerController from "../systems/PlayerController.js";
import PerksManager from "../systems/PerksManager.js";
import SoundManager from "../systems/SoundManager.js";
import DialogueManager from "../systems/DialogueManager.js";
import SceneTransition from "../systems/SceneTransition.js";
import LessonManager from "../systems/learning/LessonManager.js";
import GameState from "../GameState.js";
import QuizUI from "../ui/HUD/QuizUI.js";
import QuestSystem from "../systems/quests/QuestSystem.js";

export default class LessonHouseScene extends Phaser.Scene {

  constructor() {
    super("LessonHouseScene");
  }

  init(data) {
    this.lesson = data?.lesson || "syntax";
    this.sceneData = data || {};
  }

  preload() {

    this.load.tilemapTiledJSON("ClassroomScene", "/maps/ClassroomScene.tmj");

    const tilesets = ["board","cabinet","chair","desk","floor","wall"];
    tilesets.forEach(name => {
      this.load.image(name, `/assets/tilesets/classroom/${name}.png`);
    });

    this.load.spritesheet(
      "player_male",
      "/assets/sprites/player/player_male.png",
      { frameWidth:16, frameHeight:16 }
    );

    this.load.spritesheet(
      "orin",
      "/assets/sprites/npcs/orin.png",
      { frameWidth:16, frameHeight:16 }
    );

    this.load.spritesheet(
      "book",
      "/assets/icons/item/book.png",
      { frameWidth:16, frameHeight:16 }
    );
  }

  create() {

    // --------------------------
    // Background
    // --------------------------
    this.cameras.main.setBackgroundColor("#000000");

    this.add.rectangle(
      0,
      0,
      this.scale.width * 5,
      this.scale.height * 5,
      0x000000
    )
    .setOrigin(0)
    .setDepth(-10);

    // --------------------------
    // Map
    // --------------------------
    this.map = this.make.tilemap({ key: "ClassroomScene" });

    const tilesets = this.map.tilesets.map(ts =>
      this.map.addTilesetImage(ts.name, ts.name)
    );

    this.groundLayer = this.map.createLayer("ground layer", tilesets);
    this.wallLayer = this.map.createLayer("wall layer", tilesets);
    this.furnitureLayer = this.map.createLayer("furniture layer", tilesets);
    this.itemLayer = this.map.createLayer("item layer", tilesets);

    if (this.wallLayer) this.wallLayer.setCollisionByExclusion([-1]);
    if (this.furnitureLayer) this.furnitureLayer.setCollisionByExclusion([-1]);

    // --------------------------
    // Spawn
    // --------------------------
    const spawnLayer = this.map.getObjectLayer("Objects") || { objects: [] };

    let spawnObj =
      spawnLayer.objects.find(o => o.name === this.sceneData.spawn) ||
      spawnLayer.objects.find(o => o.name === "MalePlayer") ||
      { x: 152, y: 288 };

      // ✅ Load saved position for this scene
//const savedPos = GameState.getScenePosition("LessonHouseScene");

let spawnX = Math.round(spawnObj.x / 16) * 16;
let spawnY = Math.round(spawnObj.y / 16) * 16;

//if (savedPos) {
 // spawnX = savedPos.x;
  //spawnY = savedPos.y;
//}

    this.player = this.physics.add.sprite(spawnX, spawnY, "player_male", 0)
      .setOrigin(0,1)
      .setCollideWorldBounds(true)
      .setSize(12,8)
      .setOffset(2,8)
      .setDepth(3);

    this.physics.add.collider(this.player, this.wallLayer);
    this.physics.add.collider(this.player, this.furnitureLayer);

    // --------------------------
    // NPCs
    // --------------------------
    this.npcs = [];
    this.createNPCs();

    this.playerController = new PlayerController(
      this,
      this.player,
      120,
      { allowShooting: false }
    );

    PerksManager.setScene(this);
    this.soundManager = new SoundManager(this);

    // --------------------------
    // Camera
    // --------------------------
    this.physics.world.setBounds(0,0,this.map.widthInPixels,this.map.heightInPixels);

    this.cameras.main
      .setBounds(0,0,this.map.widthInPixels,this.map.heightInPixels)
      .startFollow(this.player,true,0.08,0.08)
      .setZoom(3);

    // --------------------------
    // Dialogue
    // --------------------------
    DialogueManager.init(this);
    DialogueManager.attachInputListeners();

    // --------------------------
    // Input + Animation (IMPORTANT ORDER)
    // --------------------------
    this.interactKey = this.input.keyboard.addKey("Z");

    if (!this.anims.exists("book_idle")) {
      this.anims.create({
        key: "book_idle",
        frames: this.anims.generateFrameNumbers("book", {
          start: 0,
          end: 4
        }),
        frameRate: 6,
        repeat: -1
      });
    }

    // --------------------------
    // Books + Exit
    // --------------------------
    this.createBooks();
    this.createExitZone();

    SceneTransition.start(this, () => {
      console.log("Lesson scene loaded");
    });

    console.log("Lesson ID received:", this.lesson);
console.log("Lesson data:", LessonManager.getLesson(this.lesson));
  }

  update() {

    if (this.playerController) {
      this.playerController.update(this.npcs);
    }

    this.player.setDepth(this.player.y);
    this.npcs.forEach(npc => npc.setDepth(npc.y));

    DialogueManager.updateProximity(this.player, this.npcs);
  }

  // =====================================================
  // NPCs
  // =====================================================
  createNPCs() {

    const npcLayer = this.map.getObjectLayer("NPC Objects");
    if (!npcLayer) return;

    npcLayer.objects.forEach(obj => {

      const npc = this.physics.add.sprite(obj.x, obj.y, "orin", 0)
        .setOrigin(0,1)
        .setImmovable(true)
        .setSize(12,8)
        .setOffset(2,8);

      const dialogueProp = obj.properties?.find(p => p.name === "dialogue");

      let dialogueValue = ["Hello."];

      if (dialogueProp) {
        try {
          dialogueValue = JSON.parse(dialogueProp.value);
        } catch {
          dialogueValue = [dialogueProp.value];
        }
      }

      npc.dialogue = dialogueValue;
      npc.lessonId = this.lesson;

      npc.interact = () => {

        const lessonId = npc.lessonId;

        if (!LessonManager.isAllBooksRead(lessonId)) {
          DialogueManager.start(npc.dialogue);
          return;
        }

        if (GameState.hasPassedQuiz(lessonId)) {
          DialogueManager.start([
            "You have already passed this lesson.",
            "Proceed to activate the Rift."
          ]);
          return;
        }

        DialogueManager.start([
          "You have studied well.",
          "Are you ready for the quiz?",
          {
            options: [
              {
                text: "Yes",
                action: () => new QuizUI(lessonId)
              },
              {
                text: "Not yet",
                action: () =>
                  DialogueManager.start(["Come back when you are ready."])
              }
            ]
          }
        ]);
      };

      this.physics.add.collider(this.player, npc);
      this.npcs.push(npc);
    });
  }

  // =====================================================
// BOOKS (Inventory Style)
// =====================================================
createBooks() {

  const lessonData = LessonManager.getLesson(this.lesson);
  if (!lessonData) return;

  LessonManager.initLessonProgress(this.lesson);

  const bookLayer = this.map.getObjectLayer("lesson object");
  if (!bookLayer) return;

  bookLayer.objects.forEach(obj => {

    const lessonProp =
      obj.properties?.find(p => p.name === "lesson")?.value;

    const bookKey =
      obj.properties?.find(p => p.name === "bookKey")?.value;

    if (lessonProp !== this.lesson) return;

    const bookData = lessonData.books.find(b => b.key === bookKey);
    if (!bookData) return;

    if (LessonManager.isBookRead(this.lesson, bookKey)) return;

    const book = this.physics.add.staticSprite(obj.x, obj.y, "book")
      .setOrigin(0,1)
      .setDepth(obj.y);

    book.play("book_idle");

    // Match hitbox to sprite
    if (book.body) {
      book.body.setSize(16, 32);
      book.body.setOffset(8,8);
    }

    this.physics.add.overlap(this.player, book, () => {

      if (!Phaser.Input.Keyboard.JustDown(this.interactKey)) return;

      // ✅ Mark as collected
      LessonManager.markBookRead(this.lesson, bookKey);

      // ✅ Play pickup feedback
      if (this.soundManager) {
        this.soundManager.play?.("energy_gain");
      }

      // ✅ Visual feedback
      book.setTint(0x00ff00);

      this.tweens.add({
        targets: book,
        alpha: 0,
        scale: 1.3,
        duration: 400,
        ease: "Power2",
        onComplete: () => book.destroy()
      });

      // ✅ Show clean system message
      DialogueManager.start([
        `Book Collected: ${bookData.title}`,
        "Inspect it in your inventory."
      ]);

      // ✅ Completion Check
      this.time.delayedCall(200, () => {

        if (LessonManager.isAllBooksRead(this.lesson)) {

          const step = QuestSystem.getCurrentStep();
/*
  if (step?.id === "collect_books") {
    QuestSystem.completeStep("collect_books");
  }
    */
          const progress =
            GameState.player.lessonProgress?.[this.lesson];

          if (!progress?._completionShown) {

            progress._completionShown = true;
            GameState.player = GameState.player;

            DialogueManager.start([
              "All lesson materials completed!",
              "Talk to the instructor to begin the quiz."
            ]);
          }
        }

      });

    });
  });
}

  // =====================================================
  // EXIT
  // =====================================================
  createExitZone() {

    const zone = this.add.zone(
      this.map.widthInPixels / 2,
      this.map.heightInPixels - 20,
      60,
      40
    );

    this.physics.world.enable(zone);

    this.physics.add.overlap(this.player, zone, () => {
      this.nearExit = true;
    });

    this.physics.world.on("worldstep", () => {
      if (!this.physics.overlap(this.player, zone))
        this.nearExit = false;
    });

    this.input.keyboard.on("keydown-Z", () => {
  if (this.nearExit) {

    // Save player position in house
    const player = GameState.player;
    if (player) {
      // Save player position for this scene
GameState.setScenePosition("LessonHouseScene", this.player.x, this.player.y);
    }

    SceneTransition.start(this, () => {
      this.scene.start("JScriptoriaCityScene", {
        spawn: "LessonDoorReturn"
      });
    });
  }
});
  }
}
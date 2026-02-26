import Phaser from "phaser";
import PlayerController from "../systems/PlayerController.js";
import PerksManager from "../systems/PerksManager.js";
import SoundManager from "../systems/SoundManager.js";
import DialogueManager from "../systems/DialogueManager.js";
import SceneTransition from "../systems/SceneTransition.js";
import LessonManager from "../systems/learning/LessonManager.js"
import GameState from "../GameState.js";
import QuizUI from "../ui/HUD/QuizUI.js";

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

    this.load.spritesheet("player_male",
      "/assets/sprites/player/player_male.png",
      { frameWidth:16, frameHeight:16 }
    );

    this.load.spritesheet("kaelen",
      "/assets/sprites/npcs/kaelen.png",
      { frameWidth:16, frameHeight:16 }
    );
  }

  create() {

    // --------------------------
  // BLACK BACKGROUND (FIX)
  // --------------------------
  this.cameras.main.setBackgroundColor("#000000");

  // Optional extra protection against scene bleed
  this.add.rectangle(
    0,
    0,
    this.scale.width * 5,
    this.scale.height * 5,
    0x000000
  )
  .setOrigin(0)
  .setDepth(-10);
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

    const spawnLayer = this.map.getObjectLayer("Objects") || { objects: [] };

    let spawnObj =
      spawnLayer.objects.find(o => o.name === this.sceneData.spawn) ||
      spawnLayer.objects.find(o => o.name === "MalePlayer") ||
      { x: 100, y: 100 };

    this.player = this.physics.add.sprite(spawnObj.x, spawnObj.y, "player_male", 0)
      .setOrigin(0,1)
      .setCollideWorldBounds(true)
      .setSize(12,8)
      .setOffset(2,8)
      .setDepth(3);

    this.physics.add.collider(this.player, this.wallLayer);
    this.physics.add.collider(this.player, this.furnitureLayer);

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

    // Camera
    this.physics.world.setBounds(0,0,this.map.widthInPixels,this.map.heightInPixels);
    this.cameras.main
      .setBounds(0,0,this.map.widthInPixels,this.map.heightInPixels)
      .startFollow(this.player,true,0.08,0.08)
      .setZoom(3);

    // --------------------------
    // DIALOGUE MANAGER SETUP
    // --------------------------
    DialogueManager.init(this);
    DialogueManager.attachInputListeners();

    // Books + Exit
    this.createBooks();
    this.createExitZone();

    SceneTransition.start(this, () => {
  console.log("Lesson scene loaded");
});
  }

  update() {

    if (this.playerController) {
      this.playerController.update(this.npcs);
    }

    // Depth sorting
    this.player.setDepth(this.player.y);
    this.npcs.forEach(npc => npc.setDepth(npc.y));

    // IMPORTANT: update DialogueManager proximity
    DialogueManager.updateProximity(this.player, this.npcs);
  }

  // --------------------------
  // NPC CREATION
  // --------------------------
  createNPCs() {
    const npcLayer = this.map.getObjectLayer("NPC Objects");
    if (!npcLayer) return;

    npcLayer.objects.forEach(obj => {

      const npc = this.physics.add.sprite(obj.x, obj.y, "kaelen", 0)
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

      // CRITICAL: DialogueManager expects npc.dialogue
      npc.dialogue = dialogueValue;
      npc.lessonId = this.lesson;

      npc.interact = () => {

  const lessonId = npc.lessonId;

  console.log("Instructor interact triggered");
  // Must read all books first
  if (!LessonManager.isAllBooksRead(lessonId)) {
    DialogueManager.start(npc.dialogue);
    return;
  }

  // If quiz already passed
  if (GameState.hasPassedQuiz(lessonId)) {
    DialogueManager.start([
      "You have already passed this lesson.",
      "Proceed to activate the Rift."
    ]);
    return;
  }

  // Ask confirmation before starting quiz
  DialogueManager.start([
    "You have studied well.",
    "Are you ready for the quiz?",
    {
      options: [
        {
          text: "Yes",
          action: () => {
            new QuizUI(lessonId);
          }
        },
        {
          text: "Not yet",
          action: () => {
            DialogueManager.start(["Come back when you are ready."]);
          }
        }
      ]
    }
  ]);
};

      this.physics.add.collider(this.player, npc);

      this.npcs.push(npc);
    });
  }

  // --------------------------
  // BOOKS (NOW USE DialogueManager)
  // --------------------------
  createBooks() {

  const lessonData = LessonManager.getLesson(this.lesson);

  if (!lessonData) {
    console.error("Lesson not found:", this.lesson);
    return;
  }

  LessonManager.initLessonProgress(this.lesson);

  const positions = [
    { x:140, y:180 },
    { x:260, y:180 },
    { x:140, y:230 },
    { x:260, y:230 }
  ];

  lessonData.books.forEach((bookData, i) => {

    const book = this.add.rectangle(
      positions[i].x,
      positions[i].y,
      16,
      16,
      0xff0000
    );

    this.physics.add.existing(book, true);

    book.setData("bookKey", bookData.key);
    book.setData("text", bookData.text);

    this.physics.add.overlap(this.player, book, () => {

  if (Phaser.Input.Keyboard.JustDown(
      this.input.keyboard.addKey("Z")
  )) {

    const bookKey = book.getData("bookKey");
    const text = book.getData("text");

    // Show book text FIRST
    DialogueManager.start([text]);

    // Mark book immediately (no callback timing issues)
    LessonManager.markBookRead(this.lesson, bookKey);

    // Delay completion check slightly (prevents race condition)
    this.time.delayedCall(200, () => {

      if (LessonManager.isAllBooksRead(this.lesson)) {

        const progress =
          GameState.player.lessonProgress?.[this.lesson];

        if (!progress?._completionShown) {

          progress._completionShown = true;
          GameState.player = GameState.player;

          DialogueManager.start([
            "You have completed all lesson materials.",
            "Talk to the instructor to begin the quiz."
          ]);
        }
      }

    });

  }

});

  });

}

  // --------------------------
  // EXIT
  // --------------------------
  createExitZone() {

    const zone = this.add.zone(
      this.map.widthInPixels/2,
      this.map.heightInPixels - 20,
      60,40
    );

    this.physics.world.enable(zone);

    this.physics.add.overlap(this.player,zone,()=>{
      this.nearExit = true;
    });

    this.physics.world.on("worldstep",()=>{
      if (!this.physics.overlap(this.player,zone))
        this.nearExit = false;
    });

    this.input.keyboard.on("keydown-Z", () => {

  if (this.nearExit) {

    SceneTransition.start(this, () => {

      this.scene.start("JScriptoriaCityScene", {
        spawn: "LessonDoorReturn"
      });

    });
  }
});
  }
}
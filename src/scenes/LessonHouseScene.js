import Phaser from "phaser";
import GameState from "../GameState.js";

const LESSON_CONTENT = {
  syntax: {
    displayName: "JavaScript Syntax",
    books: [
      { key: "intro", text: "JavaScript is a programming language used for web development." },
      { key: "basicSyntax", text: "Statements end with semicolons. Blocks use {}." },
      { key: "compiler", text: "JavaScript runs in the browser using an engine like V8." },
      { key: "consoleLog", text: "console.log() prints output to the console." }
    ]
  }
};

export default class LessonHouseScene extends Phaser.Scene {
  constructor() {
    super("LessonHouseScene");
  }

  init(data) {
    this.lesson = data.lesson;
  }

  create() {
    // --------------------------
    // Load Tilemap
    // --------------------------
    this.map = this.make.tilemap({ key: "ClassroomScene" });

    const tilesets = this.map.tilesets.map(ts =>
      this.map.addTilesetImage(ts.name, ts.name)
    );

    this.groundLayer = this.map.createLayer("ground layer", tilesets);
    this.wallLayer = this.map.createLayer("wall layer", tilesets);
    this.furnitureLayer = this.map.createLayer("furniture layer", tilesets);
    this.itemLayer = this.map.createLayer("item layer", tilesets);

    // Collision
    this.wallLayer.setCollisionByExclusion([-1]);
    this.furnitureLayer.setCollisionByExclusion([-1]);

    // --------------------------
    // Player
    // --------------------------
    this.player = this.physics.add.sprite(200, 250, "player");
    this.player.setCollideWorldBounds(true);

    this.physics.add.collider(this.player, this.wallLayer);
    this.physics.add.collider(this.player, this.furnitureLayer);
    this.physics.world.createDebugGraphic();
    this.physics.world.drawDebug = true;

    // --------------------------
    // Camera
    // --------------------------
    this.cameras.main.setBounds(
      0,
      0,
      this.map.widthInPixels,
      this.map.heightInPixels
    );

    this.physics.world.setBounds(
      0,
      0,
      this.map.widthInPixels,
      this.map.heightInPixels
    );

    this.cameras.main.startFollow(this.player);

    // --------------------------
    // Input
    // --------------------------
    this.cursors = this.input.keyboard.createCursorKeys();
    this.interactKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.Z
    );

    // --------------------------
    // Depth Handling
    // --------------------------
    this.groundLayer.setDepth(0);
    this.wallLayer.setDepth(1);
    this.furnitureLayer.setDepth(2);
    this.player.setDepth(3);
    this.itemLayer.setDepth(4);

    // --------------------------
    // Dialogue Text (Simple)
    // --------------------------
    this.dialogueText = this.add.text(20, 20, "", {
      fontSize: "14px",
      fill: "#ffffff",
      wordWrap: { width: 300 }
    }).setScrollFactor(0).setDepth(10);

    // --------------------------
    // NPC
    // --------------------------
    this.createNPC();

    // --------------------------
    // Books
    // --------------------------
    this.createBooks();

    // --------------------------
    // Exit Zone
    // --------------------------
    this.createExitZone();
  }

  update() {
    this.handleMovement();
  }

  handleMovement() {
    const speed = 120;

    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    }
  }

  // --------------------------
  // NPC
  // --------------------------
  createNPC() {
    this.npc = this.physics.add.staticSprite(200, 120, "player"); // placeholder sprite
    this.npc.setTint(0x00ff00);
    this.npc.setDepth(3);

    this.physics.add.overlap(this.player, this.npc, () => {
      if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
        this.dialogueText.setText(
          `Welcome to ${LESSON_CONTENT[this.lesson].displayName}.\nRead all books before taking the quiz.`
        );
      }
    });
  }

  // --------------------------
  // Books
  // --------------------------
  createBooks() {
  const lessonData = LESSON_CONTENT[this.lesson];

  const positions = [
    { x: 140, y: 180 },
    { x: 260, y: 180 },
    { x: 140, y: 230 },
    { x: 260, y: 230 }
  ];

  lessonData.books.forEach((bookData, i) => {

    const book = this.add.rectangle(
      positions[i].x,
      positions[i].y,
      24,
      24,
      0xff0000
    );

    this.physics.add.existing(book, true);

    book.body.setSize(24, 24);

    book.setDepth(4);
    book.setData("bookKey", bookData.key);
    book.setData("text", bookData.text);

    this.physics.add.overlap(this.player, book, () => {
      if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
        this.readBook(book);
      }
    });
  });
}

  readBook(book) {
    const key = book.getData("bookKey");
    const text = book.getData("text");

    // Ensure lessonProgress exists
    if (!GameState.player.lessonProgress) {
      GameState.player.lessonProgress = {};
    }

    if (!GameState.player.lessonProgress[this.lesson]) {
      GameState.player.lessonProgress[this.lesson] = {
        booksRead: {},
        quizUnlocked: false,
        quizPassed: false,
        keycardGiven: false
      };
    }

    GameState.player.lessonProgress[this.lesson].booksRead[key] = true;

    this.dialogueText.setText(text);

    this.checkAllBooksRead();
  }

  checkAllBooksRead() {
    const lessonData = LESSON_CONTENT[this.lesson];
    const progress = GameState.player.lessonProgress[this.lesson];

    const allRead = lessonData.books.every(
      book => progress.booksRead[book.key]
    );

    if (allRead && !progress.quizUnlocked) {
      progress.quizUnlocked = true;
      this.dialogueText.setText("All books read! Talk to the NPC to start the quiz.");
    }
  }

  // --------------------------
  // Exit
  // --------------------------
  createExitZone() {
  const x = this.map.widthInPixels / 2;
  const y = this.map.heightInPixels - 20;

  // Visible rectangle
  const exitVisual = this.add.rectangle(
    x,
    y,
    60,
    40,
    0x0000ff,
    0.4
  );

  exitVisual.setDepth(5);

  this.exitZone = this.add.zone(x, y, 60, 40);
  this.physics.world.enable(this.exitZone);

  this.physics.add.overlap(this.player, this.exitZone, () => {
    if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
      this.scene.stop();
      this.scene.resume("JScriptoriaCityScene");
    }
  });
}
}
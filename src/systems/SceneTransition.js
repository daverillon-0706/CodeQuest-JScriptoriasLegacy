const triviaList = [
  "JavaScript was created in 10 days!",
  "JS runs on engines like V8.",
  "Semicolons are optional but recommended.",
  "JS is single-threaded but async.",
  "Functions are first-class citizens in JS."
];

const hintList = [
  "Press Z to interact.",
  "Read all books before the quiz.",
  "Talk to NPC after unlocking quiz.",
  "Explore the map carefully."
];

const SceneTransition = {

  start(scene, onComplete = () => {}) {

    const overlay = scene.add.rectangle(
      0,0,
      scene.scale.width * 5,
      scene.scale.height * 5,
      0x000000,
      0.9
    )
    .setOrigin(0)
    .setDepth(10000);

    const barBg = scene.add.rectangle(
      scene.scale.width / 2,
      scene.scale.height / 2 + 40,
      300,
      20,
      0x222222
    )
    .setDepth(10001);

    const barFill = scene.add.rectangle(
      scene.scale.width / 2 - 150,
      scene.scale.height / 2 + 40,
      0,
      20,
      0x00ff88
    )
    .setOrigin(0,0.5)
    .setDepth(10002);

    const triviaText = scene.add.text(
  scene.scale.width / 2,
  scene.scale.height / 2 - 60,
  "",
  {
    fontSize: "12px",        // 🔥 smaller
    fill: "#00ff88",
    align: "center",
    wordWrap: { width: 400 }, // 🔥 force wrapping
    lineSpacing: 6
  }
)
.setOrigin(0.5)
.setDepth(10001);

    const randomTrivia = triviaList[Math.floor(Math.random() * triviaList.length)];
const randomHint = hintList[Math.floor(Math.random() * hintList.length)];

triviaText.setText(
  "💡 Trivia:\n" +
  randomTrivia +
  "\n\n🧠 Hint:\n" +
  randomHint
);

    let progress = 0;

    const timer = scene.time.addEvent({
      delay: 30,
      repeat: 100,
      callback: () => {

        progress += 0.02;
        barFill.width = 300 * progress;

        if (progress >= 1) {

          timer.remove();

          scene.tweens.add({
            targets: [overlay, barBg, barFill, triviaText],
            alpha: 0,
            duration: 400,
            onComplete: () => {
              overlay.destroy();
              barBg.destroy();
              barFill.destroy();
              triviaText.destroy();
              onComplete();
            }
          });
        }
      }
    });
  }
};

export default SceneTransition;
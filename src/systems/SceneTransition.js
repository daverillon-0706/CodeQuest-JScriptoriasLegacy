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

    // 🎲 Random text
    const trivia = triviaList[Math.floor(Math.random() * triviaList.length)];
    const hint = hintList[Math.floor(Math.random() * hintList.length)];

    // 🧱 Create overlay
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.background = "black";
    overlay.style.color = "#00ff88";
    overlay.style.display = "flex";
    overlay.style.flexDirection = "column";
    overlay.style.justifyContent = "center";
    overlay.style.alignItems = "center";
    overlay.style.zIndex = "9999";
    overlay.style.fontFamily = "monospace";

    // 🧠 Text
    const text = document.createElement("div");
    text.style.textAlign = "center";
    text.style.marginBottom = "20px";
    text.innerText =
      `💡 Trivia:\n${trivia}\n\n🧠 Hint:\n${hint}`;

    // 📊 Progress bar
    const barBg = document.createElement("div");
    barBg.style.width = "300px";
    barBg.style.height = "20px";
    barBg.style.background = "#222";

    const barFill = document.createElement("div");
    barFill.style.width = "0%";
    barFill.style.height = "100%";
    barFill.style.background = "#00ff88";

    barBg.appendChild(barFill);

    overlay.appendChild(text);
    overlay.appendChild(barBg);
    document.body.appendChild(overlay);

    // ⏳ Animate progress
    let progress = 0;

    const interval = setInterval(() => {
      progress += 2;
      barFill.style.width = progress + "%";

      if (progress >= 100) {
        clearInterval(interval);

        // Fade out
        overlay.style.transition = "opacity 0.4s";
        overlay.style.opacity = "0";

        setTimeout(() => {
          overlay.remove();
          onComplete();
        }, 500);
      }
    }, 30);
  }
};

export default SceneTransition;
// Guide.js (or inside your main JS module)
const tutorialContent = document.getElementById("tutorial-content");
const prevBtn = document.getElementById("tutorial-prev");
const nextBtn = document.getElementById("tutorial-next");

const tutorialSections = [
  "CodeQuest is a programming adventure game where you defeat bugs by solving coding challenges...",
  "Player: Move using Arrow keys. Interact with Z.",
  "Weapon: Press Spacebar to shoot and defeat bugs.",
  "Characters: NPCs can be interacted with using Z for quests and hints.",
  "Enemies: Bugs attack when you get close. Avoid or defeat them to survive.",
  "Compiler: JavaScript compiler explained; appears in rift challenges and quizzes.",
  "HP, Energy, Cryptos: HP is health, Energy is perk usage, Cryptos are currency.",
  "Tablet: Shows your inventory, lessons, and quests.",
  "Lessons: Found in houses. Cannot skip lessons to proceed.",
  "Quizzes: After picking up lessons, quizzes test your knowledge.",
  "Monolith & Kiosks: Monoliths summon rifts; kiosks interact with monoliths.",
  "Rifts: Invincible bugs with challenges required to progress."
];

let currentIndex = 0;

function updateTutorial() {
  tutorialContent.innerHTML = `<p>${tutorialSections[currentIndex]}</p>`;
  prevBtn.disabled = currentIndex === 0;
  nextBtn.disabled = currentIndex === tutorialSections.length - 1;
}

prevBtn.addEventListener("click", () => {
  if (currentIndex > 0) {
    currentIndex--;
    updateTutorial();
  }
});

nextBtn.addEventListener("click", () => {
  if (currentIndex < tutorialSections.length - 1) {
    currentIndex++;
    updateTutorial();
  }
});

// Initialize
updateTutorial();
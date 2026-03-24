// src/ui/HUD/GuideUI.js
export default class GuideUI {
  constructor() {
    this.sections = [
      { title: "About the Game", text: "CodeQuest is a game where you explore, learn, and fight bugs." },
      { title: "Player", text: "Basic movement: arrow keys or WASD to move." },
      { title: "Weapon", text: "Shoot with the SPACE bar." },
      { title: "Characters", text: "NPCs: interact using Z." },
      { title: "Enemies", text: "The bugs attack when you enter their range." },
      { title: "Compiler", text: "Appears during rift challenges and quizzes to run code." },
      { title: "HP, Energy & Cryptos", text: "HP = Health, Energy = Ability resource, Cryptos = Currency." },
      { title: "Tablet", text: "Use the tablet to manage inventory, quests, perks, and more." },
      { title: "Lessons", text: "Lessons are found in houses. You cannot skip them." },
      { title: "Quizzes", text: "Quizzes unlock after completing lessons inside houses." },
      { title: "Monolith & Kiosks", text: "Monoliths summon rifts. Kiosks activate them." },
      { title: "Rifts", text: "Invincible bugs that contain coding challenges required for progression." }
    ];

    this.currentIndex = 0;

    this.container = document.getElementById("tutorial-content");
    this.prevBtn = document.getElementById("tutorial-prev");
    this.nextBtn = document.getElementById("tutorial-next");

    this.attachEvents();
  }

  attachEvents() {
    this.prevBtn?.addEventListener("click", () => {
      if (this.currentIndex > 0) {
        this.currentIndex--;
        this.render();
      }
    });

    this.nextBtn?.addEventListener("click", () => {
      if (this.currentIndex < this.sections.length - 1) {
        this.currentIndex++;
        this.render();
      }
    });
  }

  render() {
    const section = this.sections[this.currentIndex];
    if (!section || !this.container) return;

    this.container.innerHTML = `
      <h4>${section.title}</h4>
      <p>${section.text}</p>
    `;

    if (this.prevBtn) this.prevBtn.disabled = this.currentIndex === 0;
    if (this.nextBtn) this.nextBtn.disabled = this.currentIndex === this.sections.length - 1;
  }

  open() {
    this.currentIndex = 0;
    this.render();
  }
}
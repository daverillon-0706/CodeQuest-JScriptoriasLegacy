import GameState from '../../GameState.js';
import html2canvas from 'html2canvas';

const avatarMap = {
  avatar_1: "assets/icons/avatar/avatar_1.png",
  avatar_2: "assets/icons/avatar/avatar_2.png",
  avatar_3: "assets/icons/avatar/avatar_3.png",
  avatar_4: "assets/icons/avatar/avatar_4.png",
  avatar_5: "assets/icons/avatar/avatar_5.png",
  avatar_6: "assets/icons/avatar/avatar_6.png",
  avatar_7: "assets/icons/avatar/avatar_7.png",
};

export default class CodexUI {
  constructor() {
    // Avatar
    this.avatarEl = document.getElementById("player-avatar");
    this.popupEl = document.getElementById("avatar-popup");
    this.closeBtn = document.getElementById("avatar-close");

    this.initAvatarPopup();
    //this.avatarUploadEl = document.getElementById("avatar-upload");
    //this.initAvatarSelector();

    //this.initAvatarUpload();
    // Quiz stats
    this.quizCompletedEl = document.getElementById('quiz-completed');
    this.quizPassedEl = document.getElementById('quiz-passed');
    this.quizBestScoreEl = document.getElementById('quiz-best-score');
    this.quizFirstAttemptEl = document.getElementById('quiz-first-attempt');
    this.quizTotalAttemptsEl = document.getElementById('quiz-total-attempts');
    this.quizLessonBreakdownEl = document.getElementById('quiz-lesson-breakdown');
    this.riftAccuracyEl = document.getElementById('rift-accuracy');
    this.riftErrorsTotalEl = document.getElementById('rift-errors-total');
    this.riftErrorsSyntaxEl = document.getElementById('rift-errors-syntax');
    this.riftErrorsValidationEl = document.getElementById('rift-errors-validation');
    this.riftWeakAreaEl = document.getElementById('rift-weak-area');
    this.riftLessonBreakdownEl = document.getElementById('rift-lesson-breakdown');

    // Rift stats
    this.riftWinsEl = document.getElementById('rift-wins');
    this.riftLossesEl = document.getElementById('rift-losses');
    this.riftTotalEl = document.getElementById('rift-total');
    this.riftBestEl = document.getElementById('rift-best');

    // Inventory
    this.keyItemsEl = document.getElementById('profile-key-items');
    this.consumablesEl = document.getElementById('profile-consumables');

    this.downloadBtn = document.getElementById("download-profile-card");

    if (this.downloadBtn) {
      this.downloadBtn.addEventListener("click", () => this.downloadProfileCard());
    }

    this.updateAll();
    window.addEventListener("gamestate-updated", () => {
      this.updateAll();
    });


  }
  /*
    initAvatarSelector() {
      if (!this.avatarEl) return;
  
      this.avatarEl.style.cursor = "pointer";
  
      this.avatarEl.addEventListener("click", () => {
        this.openAvatarSelector();
      });
    }
  
    openAvatarSelector() {
      const player = GameState.player;
  
      const choice = prompt(
        "Choose avatar:\navatar_1 - avatar_7"
      );
  
      if (!choice || !avatarMap[choice]) return;
  
      player.avatarId = choice;
      GameState.player = player;
  
      this.updateProfile();
    }
  
    */
  initAvatarPopup() {
    if (!this.avatarEl || !this.popupEl) return;

    const avatars = this.popupEl.querySelectorAll(".avatar-grid img");

    // Make avatar clickable
    this.avatarEl.style.cursor = "pointer";

    this.avatarEl.addEventListener("click", () => {
      this.popupEl.classList.remove("hidden");
    });

    // Close button (safe check)
    if (this.closeBtn) {
      this.closeBtn.addEventListener("click", () => {
        this.popupEl.classList.add("hidden");
      });
    }

    // Avatar selection
    avatars.forEach(img => {
      img.style.cursor = "pointer";
      const current = GameState.player.avatarId || "avatar_1";

      if (img.dataset.id === current) {
        img.classList.add("selected");
      }

      img.addEventListener("click", () => {
        avatars.forEach(i => i.classList.remove("selected"));
        img.classList.add("selected");
        const id = img.dataset.id;

        console.log("CLICKED:", id); // 👈 ADD THIS

        if (!id || !avatarMap[id]) return;

        GameState.player = {
          ...GameState.player,
          avatarId: id
        };

        console.log("SAVED:", GameState.player.avatarId); // 👈 ADD THIS

        this.updateProfile();

        this.popupEl.classList.add("hidden");
      });
    });

    // Click outside closes popup
    this.popupEl.addEventListener("click", (e) => {
      if (e.target === this.popupEl) {
        this.popupEl.classList.add("hidden");
      }
    });
  }

  async downloadProfileCard() {
    const panel = document.getElementById("app-codex");
    const card = document.getElementById("export-card");
    //const card = document.querySelector(".profile-container");

    if (!card) return;

    const wasHidden = panel.classList.contains("hidden");

    if (wasHidden) panel.classList.remove("hidden");

    await new Promise(r => setTimeout(r, 50)); // allow render

    const canvas = await html2canvas(card, {
      backgroundColor: null,
      scale: 2,
      height: card.scrollHeight,
      windowHeight: card.scrollHeight
    });

    if (wasHidden) panel.classList.add("hidden");

    const link = document.createElement("a");
    link.download = "codequest-profile.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }
  loadCodexList() {
    this.updateAll();
  }
  updateAll() {
    this.updateQuizStats();
    this.updateRiftStats();
    this.updateInventory();
    this.updateProfile();
  }
  /*
    initAvatarUpload() {
      if (!this.avatarEl || !this.avatarUploadEl) return;
  
      // Click image → open file picker
      this.avatarEl.addEventListener("click", () => {
        this.avatarUploadEl.click();
      });
  
      // Handle file selection
      this.avatarUploadEl.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;
  
        const reader = new FileReader();
        reader.onload = () => {
          const player = GameState.player;
          player.avatar = reader.result;
          GameState.player = player;
        };
        reader.readAsDataURL(file);
      });
    }
  */
  updateProfile() {
    const player = GameState.player;
    if (!player) return;

    // Name
    const nameEl = document.getElementById("profile-player-name");
    if (nameEl) nameEl.textContent = player.name || "---";

    // Resources
    document.getElementById("profile-hearts").textContent =
      `${player.hp} / ${player.max_hp}`;

    document.getElementById("profile-energy").textContent =
      `${player.energy} / ${player.max_energy}`;

    document.getElementById("profile-cryptos").textContent =
      player.cryptos;

    // Avatar
    if (this.avatarEl) {
      const id = avatarMap[player.avatarId]
        ? player.avatarId
        : "avatar_1";

      this.avatarEl.src = avatarMap[id];

      this.avatarEl.onerror = () => {
        this.avatarEl.src = avatarMap["avatar_1"];
      };
    }
  }
  updateQuizStats() {
    const lessonProgress = GameState.player.lessonProgress || {};
    const categories = Object.keys(lessonProgress);

    let completed = 0;
    let passed = 0;
    let bestScore = 0;
    let firstAttemptScore = 0;
    let totalAttempts = 0;

    categories.forEach(cat => {
      const progress = lessonProgress[cat];
      if (!progress?.attempts?.length) return;

      completed++;
      const first = progress.attempts[0];
      if (first) firstAttemptScore = Math.max(firstAttemptScore, first.score);

      progress.attempts.forEach(a => {
        totalAttempts++;
        if (a.score >= 3) passed++;
        if (a.score > bestScore) bestScore = a.score;
      });
    });

    this.quizLessonBreakdownEl.innerHTML = '';

    const lessonOrder = [
      'syntax',
      'datatypes',
      'variables',
      'operators',
      'conditions',
      'arrays',
      'functions'
    ];

    lessonOrder.forEach(cat => {
      const progress = lessonProgress[cat];
      let scoreText = '0 / 5';

      if (progress?.attempts?.length) {
        const latestAttempt = progress.attempts[progress.attempts.length - 1];
        scoreText = `${latestAttempt.score} / ${latestAttempt.total || 5}`;
      }

      const row = document.createElement('div');
      row.className = 'quiz-lesson-row';

      row.innerHTML = `
    <span class="lesson-label">${cat.toUpperCase()}</span>
    <span class="lesson-score">${scoreText}</span>
  `;

      this.quizLessonBreakdownEl.appendChild(row);
    });
    this.quizCompletedEl.textContent = completed;
    this.quizPassedEl.textContent = passed;
    this.quizBestScoreEl.textContent = `${bestScore} / 5`;
    this.quizFirstAttemptEl.textContent = `${firstAttemptScore} / 5`;
    this.quizTotalAttemptsEl.textContent = totalAttempts;
  }

  updateRiftStats() {
    const lessonErrors = {
      syntax: 0,
      datatypes: 0,
      variables: 0,
      operators: 0,
      conditions: 0,
      arrays: 0,
      functions: 0
    };
    const riftProgress = GameState.player.riftProgress || {};
    const riftIds = Object.keys(riftProgress);

    let totalAttempts = 0;
    let wins = 0;
    let losses = 0;
    let bestRun = 0;

    let totalErrors = 0;
    let syntaxErrors = 0;
    let validationErrors = 0;

    // ✅ Track challenge progress per lesson
    const lessonStats = {
      syntax: { cleared: 0, total: 5 },
      datatypes: { cleared: 0, total: 5 },
      variables: { cleared: 0, total: 5 },
      operators: { cleared: 0, total: 5 },
      conditions: { cleared: 0, total: 5 },
      arrays: { cleared: 0, total: 5 },
      functions: { cleared: 0, total: 5 }
    };

    riftIds.forEach(id => {
      const rift = riftProgress[id];
      const attempts = rift?.attempts || [];

      attempts.forEach(a => {
        totalAttempts++;

        if (a.result === "win") wins++;
        if (a.result === "loss") losses++;

        bestRun = Math.max(bestRun, a.completedChallenges || 0);

        // =========================
        // ERROR ANALYSIS
        // =========================
        (a.errors || []).forEach(err => {
          totalErrors++;

          if (err.type === "SyntaxError") {
            syntaxErrors++;
            lessonErrors.syntax++;
          }

          if (err.type === "ValidationError") {
            validationErrors++;
          }
        });

        // =========================
        // LESSON PROGRESS (NEW LOGIC)
        // =========================
        const type = a.lessonType;
        if (!lessonStats[type]) return;

        // Take BEST cleared value per lesson (not sum!)
        lessonStats[type].cleared = Math.max(
          lessonStats[type].cleared,
          a.completedChallenges || 0
        );
      });
    });

    // =========================
    // BASIC STATS
    // =========================
    this.riftWinsEl.textContent = wins;
    this.riftLossesEl.textContent = losses;
    this.riftTotalEl.textContent = totalAttempts;
    this.riftBestEl.textContent = bestRun > 0 ? `${bestRun} challenges` : "---";

    // =========================
    // ERROR STATS
    // =========================
    this.riftErrorsTotalEl.textContent = totalErrors;
    this.riftErrorsSyntaxEl.textContent = syntaxErrors;
    this.riftErrorsValidationEl.textContent = validationErrors;

    // =========================
    // ACCURACY
    // =========================
    const accuracy = (wins + losses) > 0
      ? Math.round((wins / (wins + losses)) * 100)
      : 0;

    this.riftAccuracyEl.textContent = `${accuracy}%`;

    // =========================
    // WEAK AREA
    // =========================
    const labelMap = {
      syntax: "Syntax",
      datatypes: "Data Types",
      variables: "Variables",
      operators: "Operators",
      conditions: "Conditions",
      arrays: "Arrays",
      functions: "Functions"
    };

    let weakArea = "---";

    const sorted = Object.entries(lessonErrors)
      .sort((a, b) => b[1] - a[1]);

    if (totalAttempts === 0) {
      weakArea = "No Data";
    } else if (sorted[0][1] === 0) {
      weakArea = "Balanced";
    } else {
      weakArea = labelMap[sorted[0][0]] || sorted[0][0];
    }

    this.riftWeakAreaEl.dataset.type = weakArea;
    this.riftWeakAreaEl.textContent = weakArea;

    // =========================
    // LESSON BREAKDOWN (FINAL)
    // =========================
    if (!this.riftLessonBreakdownEl) return;

    this.riftLessonBreakdownEl.innerHTML = "";

    const order = [
      "syntax",
      "datatypes",
      "variables",
      "operators",
      "conditions",
      "arrays",
      "functions"
    ];

    order.forEach(type => {
      const data = lessonStats[type] || { cleared: 0, total: 5 };

      const row = document.createElement("div");
      row.className = "quiz-lesson-row";

      row.innerHTML = `
      <span class="lesson-label">${type.toUpperCase()}</span>
      <span class="lesson-score">${data.cleared} / ${data.total}</span>
    `;

      this.riftLessonBreakdownEl.appendChild(row);
    });
  }

  updateInventory() {
    const items = GameState.player.items || {};

    // Key Items
    this.keyItemsEl.innerHTML = '';
    (items.keyItems || []).forEach(id => {
      const li = document.createElement('li');
      li.textContent = id;
      this.keyItemsEl.appendChild(li);
    });

    // Consumables
    this.consumablesEl.innerHTML = '';
    (items.consumables || []).forEach(c => {
      const li = document.createElement('li');
      li.textContent = `${c.id} x${c.amount}`;
      this.consumablesEl.appendChild(li);
    });
  }
}
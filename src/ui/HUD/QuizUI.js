import QuizManager from "../../systems/learning/QuizManager";
import GameState from "../../GameState";
import QuestSystem from "../../systems/quests/QuestSystem";

export default class QuizUI {
  constructor(category) {
    this.quiz = new QuizManager(category);
    this.createUI();
    this.renderQuestion();
  }

  createUI() {
    this.container = document.createElement("div");
    this.container.className = "quiz-overlay";

    this.container.innerHTML = `
      <div class="quiz-box">
        <h2 id="quiz-title">Quiz</h2>
        <h3 id="quiz-counter"></h3>

        <div id="quiz-question"></div>
        <div id="quiz-options"></div>

        <textarea id="quiz-code" style="display:none;"></textarea>

        <button id="quiz-submit" disabled>Submit</button>
      </div>
    `;

    document.body.appendChild(this.container);

    this.questionEl = this.container.querySelector("#quiz-question");
    this.optionsEl = this.container.querySelector("#quiz-options");
    this.codeEl = this.container.querySelector("#quiz-code");
    this.submitBtn = this.container.querySelector("#quiz-submit");
    this.counterEl = this.container.querySelector("#quiz-counter");

    this.submitBtn.onclick = () => this.handleSubmit();
  }

  renderQuestion() {
    const q = this.quiz.getCurrentQuestion();

    if (!q) return;

    this.selectedAnswer = null;
    this.submitBtn.disabled = true;

    this.questionEl.textContent = q.question;
    this.optionsEl.innerHTML = "";
    this.codeEl.style.display = "none";

    // Update counter
    if (this.counterEl) {
      this.counterEl.textContent =
        `Question ${this.quiz.currentIndex + 1} / ${this.quiz.questions.length}`;
    }

    // MULTIPLE CHOICE
    if (q.type === "multiple") {
      q.options.forEach((opt, i) => {
        const btn = document.createElement("button");
        btn.textContent = opt;

        btn.onclick = () => {
          this.selectedAnswer = i;

          // Remove highlight from others
          this.optionsEl.querySelectorAll("button")
            .forEach(b => b.classList.remove("active"));

          btn.classList.add("active");

          this.submitBtn.disabled = false;
        };

        this.optionsEl.appendChild(btn);
      });
    }

    // COMPILER QUESTION
    if (q.type === "compiler") {
      this.codeEl.style.display = "block";
      this.codeEl.value = q.starterCode || "";
      this.submitBtn.disabled = false;
    }
  }

  handleSubmit() {
    const q = this.quiz.getCurrentQuestion();
    if (!q) return;

    // MULTIPLE
    if (q.type === "multiple") {
      this.quiz.submitMultipleAnswer(this.selectedAnswer);
    }

    // COMPILER
    if (q.type === "compiler") {
      const output = this.runCode(this.codeEl.value);
      this.quiz.submitCompilerAnswer(output);
    }

    // Finished?
    if (this.quiz.isFinished()) {
      const passed = this.quiz.finish();
      this.showResult(passed);
    } else {
      this.renderQuestion();
    }
  }

  runCode(code) {
    let output = "";
    const originalLog = console.log;

    console.log = (msg) => {
      output += msg;
    };

    try {
      eval(code);
    } catch (e) {
      output = "Error";
    }

    console.log = originalLog;
    return output;
  }

  showResult(passed) {

  if (passed) {

    // Mark quiz as passed (if you have this system)
    GameState.markQuizPassed?.(this.quiz.category);

    const step = QuestSystem.getCurrentStep();
  if (step?.id === "collect_books") {
    QuestSystem.completeStep("collect_books");
  }

    // ---- PROGRESSION UNLOCK ----
    if (GameState.player.currentLessonIndex === undefined) {
      GameState.player.currentLessonIndex = 0;
    }

    // Find lesson order dynamically if you use LESSON_ORDER
    const LESSON_ORDER = [
      "syntax",
      "datatypes",
      "variables",
      "operators",
      "conditions",
      "array",
      "functions"
    ];

    const lessonOrder = LESSON_ORDER.indexOf(this.quiz.category);

    if (lessonOrder >= 0 &&
        GameState.player.currentLessonIndex <= lessonOrder) {

      GameState.player.currentLessonIndex = lessonOrder + 1;
    }

    // Trigger save
    GameState.player = GameState.player;
  }

  this.container.innerHTML = `
    <div class="quiz-box">
      <h2>
        ${passed
          ? "You have passed the quiz! Congratulations!"
          : "You failed the quiz, try again next time!"}
      </h2>
      <button id="quiz-close">Close</button>
    </div>
  `;

  this.container.querySelector("#quiz-close")
    .onclick = () => this.container.remove();
}
}
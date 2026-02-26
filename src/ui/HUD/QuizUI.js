import QuizManager from "../../systems/learning/QuizManager";

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
        <div id="quiz-question"></div>
        <div id="quiz-options"></div>
        <textarea id="quiz-code" style="display:none;"></textarea>
        <button id="quiz-submit">Submit</button>
      </div>
    `;

    document.body.appendChild(this.container);

    this.questionEl = this.container.querySelector("#quiz-question");
    this.optionsEl = this.container.querySelector("#quiz-options");
    this.codeEl = this.container.querySelector("#quiz-code");
    this.submitBtn = this.container.querySelector("#quiz-submit");

    this.submitBtn.onclick = () => this.handleSubmit();
  }

  renderQuestion() {
    const q = this.quiz.getCurrentQuestion();

    this.questionEl.textContent = q.question;
    this.optionsEl.innerHTML = "";
    this.codeEl.style.display = "none";

    if (q.type === "multiple") {
      q.options.forEach((opt, i) => {
        const btn = document.createElement("button");
        btn.textContent = opt;
        btn.onclick = () => {
          this.selectedAnswer = i;
        };
        this.optionsEl.appendChild(btn);
      });
    }

    if (q.type === "compiler") {
      this.codeEl.style.display = "block";
      this.codeEl.value = q.starterCode;
    }
  }

  handleSubmit() {
    const q = this.quiz.getCurrentQuestion();

    if (q.type === "multiple") {
      this.quiz.submitMultipleAnswer(this.selectedAnswer);
    }

    if (q.type === "compiler") {
      const output = this.runCode(this.codeEl.value);
      this.quiz.submitCompilerAnswer(output);
    }

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
    this.container.innerHTML = `
      <div class="quiz-box">
        <h2>${passed ? "PASSED 🎉" : "FAILED ❌"}</h2>
        <button id="quiz-close">Close</button>
      </div>
    `;

    this.container.querySelector("#quiz-close").onclick = () => {
      this.container.remove();
    };
  }
}

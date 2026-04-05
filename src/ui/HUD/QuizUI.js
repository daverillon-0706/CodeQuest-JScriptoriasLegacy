import QuizManager from "../../systems/learning/QuizManager";
import GameState from "../../GameState";
import QuestSystem from "../../systems/quests/QuestSystem";
import NotificationSystem from "../../systems/NotificationSystem";
import { getItemName } from "../../utils/getItemName"; 

export default class QuizUI {
  constructor(category) {
    this.quiz = new QuizManager(category);
    this.NotificationSystem = new NotificationSystem(document.body);
    this.NotificationSystem.init();

    // Block if already passed
    if (GameState.hasPassedQuiz?.(category)) {
      this.NotificationSystem.add(
        `You have already passed this quiz and received your keycard!`,
        "info"
      );
      return;
    }

    this.createUI();
    this.renderAllQuestions();
  }

  createUI() {
    this.container = document.createElement("div");
    this.container.className = "quiz-overlay";

    document.body.appendChild(this.container);

    this.container.innerHTML = `
      <div class="quiz-box">
        <h2 id="quiz-title">${this.quiz.category.toUpperCase()} Quiz</h2>
        <div id="quiz-questions"></div>
        <button id="quiz-submit">Submit</button>
      </div>
    `;

    this.questionsEl = this.container.querySelector("#quiz-questions");
    this.submitBtn = this.container.querySelector("#quiz-submit");

    this.submitBtn.onclick = () => this.handleSubmit();
  }

  renderAllQuestions() {
    this.questionsEl.innerHTML = "";

    this.quiz.questions.forEach((q, index) => {
      const block = document.createElement("div");
      block.className = "quiz-question-block";
      block.dataset.index = index;

      const title = document.createElement("h3");
      title.textContent = `${index + 1}. ${q.question}`;
      block.appendChild(title);

      // MULTIPLE CHOICE
      if (q.type === "multiple") {
        q.options.forEach((opt, i) => {
          const label = document.createElement("label");
          label.className = "quiz-option";

          label.innerHTML = `
            <input type="radio" name="question-${index}" value="${i}">
            <span>${opt}</span>
          `;
          block.appendChild(label);
        });
      }

      // COMPILER / TEXTBOX
      if (q.type === "compiler") {
        const textarea = document.createElement("textarea");
        textarea.className = "quiz-code-input";
        textarea.value = q.starterCode || "";

        // Allow all keys
        textarea.addEventListener("keydown", e => e.stopPropagation());

        block.appendChild(textarea);
      }

      this.questionsEl.appendChild(block);
    });
  }

  handleSubmit() {
    let score = 0;

    this.quiz.questions.forEach((q, index) => {
      const block = this.questionsEl.querySelector(`[data-index="${index}"]`);
      let isCorrect = false;

      // MULTIPLE CHOICE
      if (q.type === "multiple") {
        const selected = block.querySelector(
          `input[name="question-${index}"]:checked`
        );
        const selectedValue = selected ? parseInt(selected.value) : null;
        isCorrect = selectedValue === q.answer;

        // Highlight correct/wrong
        block.querySelectorAll("label").forEach((label, i) => {
          if (i === q.answer) label.classList.add("correct-answer");
          if (selectedValue === i && selectedValue !== q.answer)
            label.classList.add("wrong-answer");
        });
      }

      // COMPILER
      if (q.type === "compiler") {
        const textarea = block.querySelector("textarea");
        const output = this.runCode(textarea.value);
        isCorrect = output.trim() === q.expectedOutput.trim();

        // Disable textarea after submission
        textarea.disabled = true;

        const result = document.createElement("div");
        result.className = "compiler-result";
        result.innerHTML = `
          <p><strong>Your Output:</strong> ${output}</p>
          <p><strong>Expected Output:</strong> ${q.expectedOutput}</p>
          ${q.sampleAnswer ? `<pre>${q.sampleAnswer}</pre>` : ""}
        `;
        block.appendChild(result);
      }

      if (isCorrect) {
        score++;
        block.classList.add("correct");
      } else {
        block.classList.add("incorrect");
      }
    });
    
    this.quiz.correctAnswers = score;
    this.quiz.currentIndex = this.quiz.questions.length;

    const passed = this.quiz.finish(); // handles GameState, keycard, etc.

    // Show keycard notification
    if (passed) {
      const keycardId = `keycard_${this.quiz.category}`;
      const keyName = getItemName(keycardId);

      if (GameState.player.lessonProgress?.[this.quiz.category]?.keycardRewarded) {
        QuestSystem.completeStep("collect_books");
        this.NotificationSystem.add(`You received: ${keyName}!`, "success");
      }
    }

    // Show final result
    this.NotificationSystem.add(
      passed
        ? `🎉 Passed! Score: ${score}/${this.quiz.questions.length}`
        : `❌ Failed! Score: ${score}/${this.quiz.questions.length}`,
      passed ? "success" : "error"
    );

    // Close UI after submission
    this.container.remove();
  }

  runCode(code) {
    let output = "";
    const originalLog = console.log;
    console.log = msg => { output += msg; };

    try {
      eval(code);
    } catch {
      output = "Error";
    }

    console.log = originalLog;
    return output;
  }


  showResult(passed) {
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

    this.container.querySelector("#quiz-close").onclick = () => this.container.remove();

    if (!passed) return;

    // Quest and progression
    const step = QuestSystem.getCurrentStep();
    if (step?.id === "collect_books") {
      QuestSystem.completeStep("collect_books");
    }

    if (GameState.player.currentLessonIndex === undefined) {
      GameState.player.currentLessonIndex = 0;
    }

    const LESSON_ORDER = [
      "syntax",
      "datatypes",
      "variables",
      "operators",
      "conditions",
      "arrays",
      "functions"
    ];

    const lessonOrder = LESSON_ORDER.indexOf(this.quiz.category);
    if (lessonOrder >= 0 && GameState.player.currentLessonIndex <= lessonOrder) {
      GameState.player.currentLessonIndex = lessonOrder + 1;
    }

    // Trigger save
    GameState.player = GameState.player;
  }
}
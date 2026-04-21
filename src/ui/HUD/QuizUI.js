import QuizManager from "../../systems/learning/QuizManager";
import GameState from "../../GameState";
import QuestSystem from "../../systems/quests/QuestSystem";
import NotificationSystem from "../../systems/NotificationSystem";
import { getItemName } from "../../utils/getItemName";

export default class QuizUI {
  constructor(category) {
    this.quiz = new QuizManager(category);
    this.notificationSystem = new NotificationSystem(document.body);
    this.notificationSystem.init();
    this.submitted = false;

    if (GameState.hasPassedQuiz?.(category)) {
      this.notificationSystem.add(
        "You have already passed this quiz and received your keycard!",
        "info"
      );
      return;
    }

    this.createUI();
    this.renderQuestions();
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

    this.submitBtn.addEventListener("click", () => this.handleSubmit());
  }

  renderQuestions() {
    this.questionsEl.innerHTML = "";

    this.quiz.questions.forEach((q, idx) => {
      const block = document.createElement("div");
      block.className = "quiz-question-block";
      block.dataset.index = idx;

      const title = document.createElement("h3");
      title.textContent = `${idx + 1}. ${q.question}`;
      block.appendChild(title);

      if (q.type === "multiple") {
        block.append(...q.options.map((opt, i) => this.createOption(idx, i, opt)));
      } else if (q.type === "compiler") {
        const textarea = document.createElement("textarea");
        textarea.addEventListener("focus", () => {
          if (window.game?.input?.keyboard) {
            window.game.input.keyboard.enabled = false;
          }
        });

        textarea.addEventListener("blur", () => {
          if (window.game?.input?.keyboard) {
            window.game.input.keyboard.enabled = true;
          }
        });
        textarea.className = "quiz-code-input";
        textarea.value = q.starterCode || "";
        block.appendChild(textarea);
      }

      this.questionsEl.appendChild(block);
    });
  }

  createOption(questionIndex, optionIndex, text) {
    const label = document.createElement("label");
    label.className = "quiz-option";
    label.innerHTML = `
      <input type="radio" name="question-${questionIndex}" value="${optionIndex}">
      <span>${text}</span>
    `;
    return label;
  }

  handleSubmit() {
    console.log("Submit clicked");

    if (this.submitted) {
      console.log("Already submitted, exiting");
      return;
    }

    this.submitted = true;
    console.log("Marked as submitted");

    this.submitBtn.disabled = true;
    console.log("Submit button disabled");

    let score = 0;

    console.log("Starting question loop");

    this.quiz.questions.forEach((q, idx) => {
      console.log(`Processing question ${idx}`, q);

      const block = this.questionsEl.querySelector(`[data-index="${idx}"]`);
      console.log("Question block:", block);

      let isCorrect = false;

      if (q.type === "multiple") {
        console.log("Handling multiple choice question");

        const selected = block.querySelector(`input[name="question-${idx}"]:checked`);
        console.log("Selected answer:", selected);

        const labels = block.querySelectorAll(".quiz-option");
        console.log("Labels found:", labels);

        labels.forEach((label, optionIndex) => {
          const input = label.querySelector("input");

          if (input) {
            input.disabled = true;
          }

          if (optionIndex === q.answer) {
            label.classList.add("correct");
          }

          if (
            selected &&
            parseInt(selected.value) === optionIndex &&
            optionIndex !== q.answer
          ) {
            label.classList.add("incorrect");
          }
        });

        isCorrect = selected && parseInt(selected.value) === q.answer;
        console.log("Multiple question correct:", isCorrect);
      }

      if (q.type === "compiler") {
        console.log("Handling compiler question");

        const textarea = block.querySelector("textarea");
        console.log("Textarea found:", textarea);

        const output = this.runCode(textarea.value);
        console.log("Compiler output:", output);
        console.log("Expected output:", q.expectedOutput);

        isCorrect = output.trim() === q.expectedOutput.trim();
        console.log("Compiler question correct:", isCorrect);

        textarea.disabled = true;

        const result = document.createElement("p");
        result.className = isCorrect ? "quiz-correct" : "quiz-incorrect";
        result.textContent = isCorrect
          ? "✔ Correct Output"
          : `✖ Incorrect Output (Expected: ${q.expectedOutput})`;

        block.appendChild(result);
      }

      if (isCorrect) {
        score++;
        console.log("Score incremented:", score);
      }
    });

    console.log("Finished question loop");
    console.log("Final score:", score);

    this.quiz.correctAnswers = score;
    this.quiz.currentIndex = this.quiz.questions.length;

    console.log("Calling finish()");
    const passed = this.quiz.finish();
    console.log("Passed:", passed);

    try {
      console.log("Calling notifyResult()");
      this.notifyResult(score, passed);
      console.log("notifyResult completed");
    } catch (err) {
      console.error("notifyResult failed:", err);
    }

    console.log("Hiding submit button");
    this.submitBtn.style.display = "none";

    console.log("Creating close button");
    const closeBtn = document.createElement("button");
    closeBtn.id = "quiz-close";
    closeBtn.textContent = "Close";

    closeBtn.addEventListener("click", () => {
      console.log("Close button clicked");

      // 🔥 Restore keyboard no matter what
      if (window.game?.input?.keyboard) {
        window.game.input.keyboard.enabled = true;
      }
      this.container?.remove();

      if (this.notificationSystem?.container) {
        this.notificationSystem.container.remove();
      }
    });

    console.log("Looking for quiz box");
    const quizBox = this.container.querySelector(".quiz-box");
    console.log("quizBox:", quizBox);

    if (quizBox) {
      console.log("Appending close button");
      quizBox.appendChild(closeBtn);
    } else {
      console.error("quizBox not found");
    }

    console.log("handleSubmit finished");
  }

  runCode(code) {
    let output = "";
    const originalLog = console.log;

    try {
      console.log = (msg) => { output += msg + "\n"; };

      eval(`(function(){ ${code} })()`);

    } catch {
      output = "Error";
    } finally {
      console.log = originalLog;
    }

    return output.trim();
  }

  notifyResult(score, passed) {
    if (passed) {
      const keycardId = `keycard_${this.quiz.category}`;
      const keyName = getItemName(keycardId);

      if (GameState.player.lessonProgress?.[this.quiz.category]?.keycardRewarded) {
        QuestSystem.completeStep("collect_books");
        this.notificationSystem.add(`You received: ${keyName}!`, "success");
      }
    }

    this.notificationSystem.add(
      passed
        ? `🎉 Passed! Score: ${score}/${this.quiz.questions.length}`
        : `❌ Failed! Score: ${score}/${this.quiz.questions.length}`,
      passed ? "success" : "error"
    );
  }

  showResult(passed) {
    this.container.innerHTML = `
      <div class="quiz-box">
        <h2>${passed
        ? "You have passed the quiz! Congratulations!"
        : "You failed the quiz, try again next time!"}</h2>
        <button id="quiz-close">Close</button>
      </div>
    `;

    this.container.querySelector("#quiz-close")
      .addEventListener("click", () => this.container.remove());

    if (!passed) return;

    const step = QuestSystem.getCurrentStep();
    if (step?.id === "collect_books") QuestSystem.completeStep("collect_books");

    GameState.player.currentLessonIndex ??= 0;

    const LESSON_ORDER = ["syntax", "datatypes", "variables", "operators", "conditions", "arrays", "functions"];
    const lessonOrder = LESSON_ORDER.indexOf(this.quiz.category);
    if (lessonOrder >= 0 && GameState.player.currentLessonIndex <= lessonOrder) {
      GameState.player.currentLessonIndex = lessonOrder + 1;
    }

    GameState.player = GameState.player; // trigger save
  }
}
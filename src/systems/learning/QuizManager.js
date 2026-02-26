import quizData from "../../ui/data/quizData.js";
import GameState from "../../GameState.js";
import { KEYCARD_ORDER } from "../../ui/data/keyItems.js";

export default class QuizManager {
  constructor(category) {
    this.category = category;
    this.questions = quizData[category] || [];
    this.currentIndex = 0;
    this.correctAnswers = 0;
  }

  getCurrentQuestion() {
    return this.questions[this.currentIndex];
  }

  submitMultipleAnswer(index) {
    const q = this.getCurrentQuestion();
    if (index === q.answer) {
      this.correctAnswers++;
    }
    this.currentIndex++;
  }

  submitCompilerAnswer(output) {
    const q = this.getCurrentQuestion();
    if (output.trim() === q.expectedOutput.trim()) {
      this.correctAnswers++;
    }
    this.currentIndex++;
  }

  isFinished() {
    return this.currentIndex >= this.questions.length;
  }

  hasPassed() {
    return this.correctAnswers >= 3;
  }

  finish() {

  if (!this.hasPassed()) return false;

  const lessonToItemMap = {
    syntax: "syntax",
    dataTypes: "datatypes",
    variables: "variable",
    operators: "operator",
    conditions: "condition",
    arrays: "array",
    functions: "function"
  };

  const suffix = lessonToItemMap[this.category];
  if (!suffix) return false;

  const keycardId = `keycard_${suffix}`;

  GameState.markQuizPassed(this.category);
  GameState.addKeyItem(keycardId, KEYCARD_ORDER);

  return true;
}
}
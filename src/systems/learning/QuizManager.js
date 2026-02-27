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

  GameState.markQuizPassed(this.category);

  const keycardId = `keycard_${this.category}`;
  GameState.addKeyItem(keycardId, KEYCARD_ORDER);

  const progress = GameState.getLessonProgress(this.category);

  progress.quizCompleted = true;
  progress.keycardRewarded = true;

  // 🔥 Force proper save
  GameState.player = {
    ...GameState.player,
    lessonProgress: {
      ...GameState.player.lessonProgress,
      [this.category]: progress
    }
  };

  return true;
}
}
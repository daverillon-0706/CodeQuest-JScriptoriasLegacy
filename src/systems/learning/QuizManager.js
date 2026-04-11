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
    if (index === q.answer) this.correctAnswers++;
    this.currentIndex++;
  }

  submitCompilerAnswer(output) {
    const q = this.getCurrentQuestion();
    if (output.trim() === q.expectedOutput.trim()) this.correctAnswers++;
    this.currentIndex++;
  }

  isFinished() {
    return this.currentIndex >= this.questions.length;
  }

  hasPassed() {
    return this.correctAnswers >= 3;
  }

  finish() {
  console.log("finish() started");

  const total = this.questions.length;
  const score = this.correctAnswers;

  console.log("Saving quiz result");
  this.saveQuizResult(score, total);

  console.log("Checking pass condition");
  if (!this.hasPassed()) {
    console.log("Quiz not passed");
    return false;
  }

  const keycardId = `keycard_${this.category}`;
  console.log("Keycard ID:", keycardId);

  console.log("Adding key item");
  GameState.addKeyItem(keycardId, KEYCARD_ORDER);

  console.log("Getting lesson progress");
  const progress = GameState.getLessonProgress(this.category);

  console.log("Progress:", progress);

  progress.keycardRewarded = true;

  console.log("Saving player lesson progress");
  GameState.player = {
    ...GameState.player,
    lessonProgress: {
      ...GameState.player.lessonProgress,
      [this.category]: progress
    }
  };

  console.log("finish() completed");
  return true;
}

  saveQuizResult(score, total) {
  const player = GameState.player;
  if (!player) return;

  player.lessonProgress = player.lessonProgress || {};

  if (!player.lessonProgress[this.category]) {
    player.lessonProgress[this.category] = {};
  }

  const progress = player.lessonProgress[this.category];

  progress.booksRead = progress.booksRead || {};
  progress.quizCompleted = progress.quizCompleted || false;
  progress.keycardRewarded = progress.keycardRewarded || false;
  progress.attempts = Array.isArray(progress.attempts)
    ? progress.attempts
    : [];

  progress.attempts.push({
    score,
    total,
    first: progress.attempts.length === 0,
    timestamp: Date.now()
  });

  if (score >= 3) {
    progress.quizCompleted = true;
  }

  player.lessonProgress[this.category] = progress;
  GameState.player = player;
}

  getQuizResults() {
    const progress = GameState.getLessonProgress(this.category);
    return progress?.attempts || [];
  }

  // Add this inside QuizManager
getLatestScore() {
  const progress = GameState.getLessonProgress(this.category);

  if (!progress?.attempts?.length) {
    return {
      score: 0,
      total: this.questions.length
    };
  }

  const latestAttempt = progress.attempts[progress.attempts.length - 1];

  return {
    score: latestAttempt.score,
    total: latestAttempt.total
  };
}
}
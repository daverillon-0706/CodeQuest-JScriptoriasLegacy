import { LESSON_DATA } from "../../ui/data/lessonData.js";
import GameState from "../../GameState.js";

class LessonManager {

  static getLesson(lessonId) {
    return LESSON_DATA[lessonId];
  }

  static initLessonProgress(lessonId) {

    const player = GameState.player;
if (!player) return;

player.lessonProgress = player.lessonProgress || {};

if (!player.lessonProgress[lessonId]) {
  player.lessonProgress[lessonId] = {
    booksRead: {},
    quizCompleted: false,
    keycardRewarded: false
  };

  GameState.player = player; // save initialization
}
  // 🔥 Ensure lessonProgress exists
  if (!GameState.player.lessonProgress) {
    GameState.player.lessonProgress = {};
  }

  // 🔥 Ensure specific lesson exists
  if (!GameState.player.lessonProgress[lessonId]) {

    GameState.player.lessonProgress[lessonId] = {
      booksRead: {},
      quizCompleted: false,
      keycardRewarded: false
    };

  }
}

  static markBookRead(lessonId, bookKey) {

  const player = GameState.player;
  if (!player) return;

  player.lessonProgress = player.lessonProgress || {};
  player.codexProgress = player.codexProgress || {};
  player.codexProgress.unlockedLessons =
    player.codexProgress.unlockedLessons || [];

  const progress = player.lessonProgress[lessonId];
  if (!progress) return;

  // ✅ Use booksRead object properly
  progress.booksRead = progress.booksRead || {};

  if (!progress.booksRead[bookKey]) {
    progress.booksRead[bookKey] = true;
  }

  // ✅ Unlock lesson in codex
  if (!player.codexProgress.unlockedLessons.includes(lessonId)) {
    player.codexProgress.unlockedLessons.push(lessonId);
  }

  GameState.player = player; // save
}

  static isAllBooksRead(lessonId) {

    const lesson = this.getLesson(lessonId);
    const progress = GameState.player.lessonProgress?.[lessonId];

    if (!lesson || !progress) return false;

    return lesson.books.every(book =>
      progress.booksRead?.[book.key]
    );
  }

}

export default LessonManager;
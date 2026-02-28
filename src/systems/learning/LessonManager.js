import { LESSON_DATA } from "../../ui/data/lessonData.js";
import GameState from "../../GameState.js";

class LessonManager {

  // --------------------------
  // GET LESSON DATA
  // --------------------------
  static getLesson(lessonId) {
    return LESSON_DATA[lessonId];
  }

  // --------------------------
  // INITIALIZE LESSON PROGRESS
  // --------------------------
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

      GameState.player = player; // Save initialization
    }
  }

  // --------------------------
  // MARK BOOK AS READ
  // --------------------------
  static markBookRead(lessonId, bookKey) {

    const player = GameState.player;
    if (!player) return;

    player.lessonProgress = player.lessonProgress || {};
    player.codexProgress = player.codexProgress || {};
    player.codexProgress.unlockedLessons =
      player.codexProgress.unlockedLessons || [];

    const progress = player.lessonProgress[lessonId];
    if (!progress) return;

    progress.booksRead = progress.booksRead || {};

    if (!progress.booksRead[bookKey]) {
      progress.booksRead[bookKey] = true;
    }

    // Unlock lesson in codex
    if (!player.codexProgress.unlockedLessons.includes(lessonId)) {
      player.codexProgress.unlockedLessons.push(lessonId);
    }

    GameState.player = player; // Save changes
  }

  // --------------------------
  // CHECK IF SINGLE BOOK READ
  // --------------------------
  static isBookRead(lessonId, bookKey) {

    const progress = GameState.player.lessonProgress?.[lessonId];
    if (!progress) return false;

    return !!progress.booksRead?.[bookKey];
  }

  // --------------------------
  // CHECK IF ALL BOOKS READ
  // --------------------------
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
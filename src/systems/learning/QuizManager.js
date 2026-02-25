import GameState from "../../GameState.js";

class QuizManager {

  static startQuiz(scene, lessonId) {

    console.log("Starting quiz for:", lessonId);

    // You can open a UI modal here later
    scene.quizActive = true;

    // Load questions from lesson data
    const lesson = scene.lessonData;

    if (!lesson?.quiz) {
      console.warn("No quiz found for lesson:", lessonId);
      return;
    }

    scene.activeQuiz = lesson.quiz;
    scene.currentQuizIndex = 0;
  }

  static submitAnswer(scene, lessonId, correct) {

    if (!correct) return false;

    const progress = GameState.player.lessonProgress[lessonId];

    progress.quizCompleted = true;

    // Reward keycard
    progress.keycardRewarded = true;

    if (!GameState.player.items) {
      GameState.player.items = {};
    }

    GameState.player.items.keyItems =
      GameState.player.items.keyItems || [];

    const keycard = `${lessonId.toUpperCase()}_KEYCARD`;

    if (!GameState.player.items.keyItems.includes(keycard)) {
      GameState.player.items.keyItems.push(keycard);
    }

    console.log("Keycard awarded:", keycard);

    return true;
  }

}

export default QuizManager;
import GameState from "../../GameState.js";

class HouseGateManager {

  static canEnterHouse(lessonId) {

    const progress = GameState.player.lessonProgress?.[lessonId];

    if (!progress?.keycardRewarded) {
      return false;
    }

    return true;
  }

  static canEnterNextLesson(currentLessonId, nextLessonId) {

    const currentProgress =
      GameState.player.lessonProgress?.[currentLessonId];

    return currentProgress?.keycardRewarded === true;
  }

}

export default HouseGateManager;
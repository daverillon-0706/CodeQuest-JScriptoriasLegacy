import GameState from "../GameState";

/**
 * Quiz Helpers
 */
export function getQuizResults(category) {
  const player = GameState.player;
  if (!player) return null;

  player.quizResults = player.quizResults || {};

  if (!player.quizResults[category]) {
    player.quizResults[category] = {
      attempts: [],
      firstAttemptScore: 0,
      bestScore: 0,
      highestPassed: false,
      unlocked: false
    };
    GameState.player = player;
  }

  return player.quizResults[category];
}

export function saveQuizAttempt(category, score, total) {
  const results = getQuizResults(category);
  const passed = score >= 3;

  results.attempts.push({ score, total, passed, date: Date.now() });

  if (results.attempts.length === 1) results.firstAttemptScore = score;
  if (score > results.bestScore) results.bestScore = score;
  if (passed) results.highestPassed = true;
  results.unlocked = true;

  const player = GameState.player;
  player.quizResults[category] = results;
  GameState.player = player;
}

/**
 * Rift Helpers
 */
export function getRiftResults(category) {
  const player = GameState.player;
  if (!player) return null;

  player.riftResults = player.riftResults || {};

  if (!player.riftResults[category]) {
    player.riftResults[category] = {
      wins: 0,
      losses: 0,
      total: 0,
      bestRift: null
    };
    GameState.player = player;
  }

  return player.riftResults[category];
}

export function saveRiftAttempt(category, won, riftName) {
  const results = getRiftResults(category);

  if (won) results.wins++;
  else results.losses++;

  results.total = results.wins + results.losses;
  if (won) results.bestRift = riftName;

  const player = GameState.player;
  player.riftResults[category] = results;
  GameState.player = player;
}
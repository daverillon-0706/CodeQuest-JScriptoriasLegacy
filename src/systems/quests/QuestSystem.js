// QuestSystem.js

import GameState from "../../GameState";
import { QUESTS } from "./QuestList";

const QuestSystem = {

  // =========================
  // DEBUG HELPERS
  // =========================
  logState(label = "") {
    const player = GameState.player;
    if (!player) return;

    const ws = player.worldState;
    const qp = ws?.questProgress;

    const quest = this.getCurrentQuest();
    const step = this.getCurrentStep();

    console.log(`\n🧭 [QUEST STATE] ${label}`);
    console.log("QuestIndex:", qp?.currentQuestIndex);
    console.log("StepIndex:", qp?.currentStepIndex);
    console.log("QuestId:", quest?.id);
    console.log("StepId:", step?.id);
  },

  // =========================
  // CORE
  // =========================

  getCurrentQuest() {
  const player = GameState.player;
  if (!player) return null;

  const progress = this.ensureProgress(player);

  const quest = QUESTS[progress.currentQuestIndex] || null;

  console.log("🔍 getCurrentQuest ->", quest?.id);

  return quest;
},

  getCurrentStep() {
  const player = GameState.player;
  if (!player) return null;

  const progress = this.ensureProgress(player);

  const quest = QUESTS[progress.currentQuestIndex];
  if (!quest) return null;

  const step = quest.steps[progress.currentStepIndex] || null;

  if (progress.currentStepIndex >= quest.steps.length) {
    console.log("🏁 Quest already completed, no active step.");
    return null;
  }

  console.log("🔍 getCurrentStep ->", step?.id, `(index ${progress.currentStepIndex})`);

  return step;
},

  completeCurrentQuest() {
    const player = GameState.player;
    if (!player) return;

    const ws = player.worldState;

    ws.questProgress ||= { currentQuestIndex: 0, currentStepIndex: 0 };
    ws.questsCompleted ||= [];

    const index = ws.questProgress.currentQuestIndex;
    const quest = QUESTS[index];

    if (!quest) return;

    console.log("🏁 Completing quest:", quest.id);

    // Prevent duplicate completion
    if (!ws.questsCompleted.includes(quest.id)) {
      ws.questsCompleted.push(quest.id);
      console.log("✅ Quest added to completed list");
    }

    // Move to next quest
    ws.questProgress.currentQuestIndex++;
    ws.questProgress.currentStepIndex = 0;

    console.log("➡️ Moved to next questIndex:", ws.questProgress.currentQuestIndex);

    GameState.player = player;

    this.logState("After Quest Completion");
  },

  canCompleteQuest(questId) {
    const current = this.getCurrentQuest();
    return current?.id === questId;
  },

  getCurrentQuestId() {
    return this.getCurrentQuest()?.id || null;
  },

  completeStep(stepId) {
  const player = GameState.player;
  if (!player) {
    console.warn("[QuestSystem] No player found");
    return;
  }

  // =========================
  // Ensure state exists
  // =========================
  player.worldState = player.worldState || {};
  player.worldState.questProgress =
    player.worldState.questProgress || {
      currentQuestIndex: 0,
      currentStepIndex: 0
    };

  player.worldState.questsCompleted =
    player.worldState.questsCompleted || [];

  const progress = player.worldState.questProgress;

  const currentQuestIndex = progress.currentQuestIndex;
  const currentStepIndex = progress.currentStepIndex;

  const quest = QUESTS[currentQuestIndex];

  console.log("=== COMPLETE STEP DEBUG ===");
  console.log("Quest:", quest?.id);
  console.log("Step ID to complete:", stepId);
  console.log("Current Step Index:", currentStepIndex);

  if (!quest) {
    console.warn("No quest found");
    return;
  }

  const step = quest.steps[currentStepIndex];

  console.log("Expected Step:", step?.id);

  if (!step) {
    console.warn("No step found");
    return;
  }

  if (step.id !== stepId) {
    console.warn("Step mismatch. Aborting.");
    return;
  }

  // =========================
  // Advance Step
  // =========================
  progress.currentStepIndex++;

  console.log("Step completed. New index:", progress.currentStepIndex);

  // =========================
  // Quest Completion
  // =========================
  if (progress.currentStepIndex >= quest.steps.length) {
    console.log("🎉 Quest completed:", quest.id);

    if (!player.worldState.questsCompleted.includes(quest.id)) {
      player.worldState.questsCompleted.push(quest.id);
    }

    // Move to next quest
    progress.currentQuestIndex++;
    progress.currentStepIndex = 0;

    console.log("➡️ Next quest index:", progress.currentQuestIndex);
  }

  GameState.player = player;

  window.dispatchEvent(new Event("gamestate-updated"));

  console.log("=== END COMPLETE STEP DEBUG ===");
},
ensureProgress(player) {
  if (!player.worldState) player.worldState = {};

  if (!player.worldState.questProgress) {
    player.worldState.questProgress = {
      currentQuestIndex: 0,
      currentStepIndex: 0
    };
  }

  if (!player.worldState.questsCompleted) {
    player.worldState.questsCompleted = [];
  }

  return player.worldState.questProgress;
}
};

export default QuestSystem;
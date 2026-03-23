import GameState from "/src/GameState";
import { QUESTS } from "/src/systems/quests/QuestList";

export default class QuestsUI {
  constructor() {
    this.listEl = document.getElementById("quests-list");

    if (!this.listEl) {
      console.warn("[QuestsUI] quests-list not found");
      return;
    }

    this.render();

    window.addEventListener("gamestate-updated", () => {
      this.render();
    });
  }

  render() {
    const player = GameState.player;
    if (!player) return;

    const completed = player.worldState.questsCompleted || [];
    const progress = player.worldState.questProgress || {};

    const currentIndex = progress.currentQuestIndex ?? 0;
    const currentStepIndex = progress.currentStepIndex ?? 0;

    this.listEl.innerHTML = "";

    QUESTS.forEach((q, index) => {
      const li = document.createElement("li");
      li.classList.add("quest-item");

      // -------------------------
      // QUEST STATUS निर्धारण
      // -------------------------
      const isCompleted = completed.includes(q.id);
      const isCurrent = index === currentIndex && !isCompleted;

      let prefix = "○";
      let className = "quest-locked";

      if (isCompleted) {
        prefix = "✔";
        className = "quest-completed";
      } else if (isCurrent) {
        prefix = "→";
        className = "quest-current";
      }

      li.classList.add(className);

      // -------------------------
      // TITLE
      // -------------------------
      const titleEl = document.createElement("div");
      titleEl.textContent = `${prefix} ${q.title}`;
      li.appendChild(titleEl);

      // -------------------------
      // STEPS
      // -------------------------
      const steps = Array.isArray(q.steps) ? q.steps : [];

      // Show steps if quest is current or already completed
      if (isCurrent && steps.length > 0) {
        const stepsContainer = document.createElement("ul");
        stepsContainer.classList.add("quest-steps");

        steps.forEach((step, stepIndex) => {
          const stepLi = document.createElement("li");

          let stepPrefix = "○";

          if (isCompleted) {
            // All steps completed
            stepPrefix = "✔";
          } else if (isCurrent) {
            if (stepIndex < currentStepIndex) {
              stepPrefix = "✔";
            } else if (stepIndex === currentStepIndex) {
              stepPrefix = "→";
            }
          }

          stepLi.textContent = `${stepPrefix} ${step.label}`;
          stepsContainer.appendChild(stepLi);
        });

        li.appendChild(stepsContainer);
      }

      this.listEl.appendChild(li);
    });
  }
}
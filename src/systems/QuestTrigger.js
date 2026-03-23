import GameState from "../GameState.js";

export function triggerQuest(target) {

    
  console.log("🧪 TARGET VALUE:", target);

  const current = GameState.getCurrentQuest();
  if (!current) return;
console.log("🚪 DOOR TARGET:", target);

  console.log("🎯 Trigger:", target);
  console.log("📌 Current Quest:", current);
  

  const chapter = GameState.getCurrentChapter();

  console.log("📦 Chapter:", chapter);
  // =========================
  // NPC: ELYSIA
  // =========================
  if (target === "syntax_talk_elysia" && current === "syntax_talk_elysia") {
    completeCurrentQuest();
    return;
  }

  if (target === "elysia" && current === `${chapter}_talk_elysia`) {
    completeCurrentQuest();
    return;
  }

  // =========================
  // DOOR / HOUSE
  // =========================
  if (target === "syntax_go_house" && current === "syntax_go_house") { 
    completeCurrentQuest();
    return;
  }

  if (target === chapter && current === `${chapter}_go_house`) {
    completeCurrentQuest();
    return;
  }
if (target === "instructor") {
  const chapter = GameState.getCurrentChapter();
  const current = GameState.getCurrentQuest();

  if (current === `${chapter}_talk_instructor`) {
    completeCurrentQuest();
    return;
  }
}

if (current === `${chapter}_take_test`) {
    completeCurrentQuest(); // or open quiz UI
    return;
  }
  // =========================
  // MONOLITH ACCESS
  // =========================
  if (target === chapter && current === `${chapter}_go_monolith`) {
    completeCurrentQuest();
    return;
  }

  // =========================
  // RIFT (FIGHT)
  // =========================
  if (target === chapter && current === `${chapter}_fight_monolith`) {
    completeCurrentQuest();
    return;
  }

  console.log("❌ No quest match");

  function completeCurrentQuest() {
    console.log("🚀 RUNNING COMPLETE FUNCTION");
    console.log("✅ Quest Completed:", current);

    GameState.completeQuest(current);

    const next = GameState.getCurrentQuest();
    if (next && !GameState.isQuestActive(next)) {
      GameState.startQuest(next);
    }

    if (window.HUD?.questsUI) {
      window.HUD.questsUI.loadQuests();
    }
  }
}
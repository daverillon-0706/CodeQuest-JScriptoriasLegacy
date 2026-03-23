import questsData from "../ui/data/questsData";

class QuestManager {
  constructor() {
    this.quests = questsData.main; // all quests
    this.active = [];
    this.completed = [];

    // Start quests with no dependencies
    this.quests.forEach(q => {
      if (!q.dependent) this.active.push({...q});
    });
  }

  getActiveQuests() {
    return this.active;
  }

  getCompletedQuests() {
    return this.completed;
  }

  // Complete a quest by type & target
  tryComplete({ type, target, extra }) {
  // extra can be lesson order, riftName, etc.
  const index = this.active.findIndex(q => {
    if (String(q.type).toLowerCase() !== String(type).toLowerCase()) return false;

    const qTarget = String(q.target || "").trim().toLowerCase();
    const tTarget = String(target || "").trim().toLowerCase();

    if (qTarget === tTarget) return true;

    // Extra matching for rifts or doors
    if (type === "rift" && extra?.riftName) {
      return String(q.target).toLowerCase() === tTarget || String(q.riftName || "").toLowerCase() === String(extra.riftName).toLowerCase();
    }

    if (type === "enter" && extra?.order !== undefined) {
      return String(q.target).toLowerCase() === tTarget && Number(q.order) === Number(extra.order);
    }

    return false;
  });

  if (index === -1) return false;

  const quest = this.active.splice(index, 1)[0];
  this.completed.push(quest);

  console.log(`✅ Quest completed: ${quest.title}`);
  document.dispatchEvent(new Event("questUpdated"));

  return true;
}
}

export default new QuestManager();
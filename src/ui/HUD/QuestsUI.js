import questsData from '/src/ui/data/questsData.js';

export default class QuestsUI {
  constructor() {
    // Tabs
    this.tabButtons = document.querySelectorAll('.quest-tab');
    this.activeList = document.getElementById('active-quests-list');
    this.completedList = document.getElementById('completed-quests-list');

    // Filters
    this.filterButtons = document.querySelectorAll('.filter-btn');
    this.currentTab = 'active';
    this.currentFilter = 'main';

    // Details
    this.detailsPanel = document.getElementById('quest-details');
    this.detailsTitle = document.getElementById('quest-title');
    this.detailsDesc = document.getElementById('quest-desc');
    this.detailsReward = document.getElementById('quest-rewards');
    document.getElementById('quest-details-close').addEventListener('click', () => this.detailsPanel.classList.add('hidden'));

    this.attachEvents();
    this.loadQuests();
  }

  attachEvents() {
    this.tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelector('.quest-tab.active').classList.remove('active');
        btn.classList.add('active');
        this.currentTab = btn.dataset.tab;
        this.loadQuests();
      });
    });

    this.filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelector('.filter-btn.active').classList.remove('active');
        btn.classList.add('active');
        this.currentFilter = btn.dataset.filter;
        this.loadQuests();
      });
    });
  }

  loadQuests() {
    const listEl = this.currentTab === 'active' ? this.activeList : this.completedList;
    const otherEl = this.currentTab === 'active' ? this.completedList : this.activeList;
    listEl.innerHTML = '';
    otherEl.classList.add('hidden');
    listEl.classList.remove('hidden');

    const quests = questsData[this.currentTab][this.currentFilter];
    if (!quests) return;

    Object.values(quests).forEach(q => {
      const li = document.createElement('li');
      li.classList.add('quest-item');
      li.innerHTML = `<strong>${q.title}</strong><br>${q.desc}<br><em>Reward: ${q.reward}</em>`;
      li.addEventListener('click', () => this.showDetails(q));
      listEl.appendChild(li);
    });
  }

  showDetails(q) {
    this.detailsTitle.textContent = q.title;
    this.detailsDesc.textContent = q.desc;
    this.detailsReward.textContent = `Reward: ${q.reward}`;
    this.detailsPanel.classList.remove('hidden');
  }
}

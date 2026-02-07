import questsData from '/src/ui/data/questsData.js';

export default class QuestsUI {
  constructor() {
    // Core elements
    this.tabButtons = document.querySelectorAll('.quest-tab');
    this.filterButtons = document.querySelectorAll('.filter-btn');

    this.activeList = document.getElementById('active-quests-list');
    this.completedList = document.getElementById('completed-quests-list');

    this.detailsPanel = document.getElementById('quest-details');
    this.detailsTitle = document.getElementById('quest-title');
    this.detailsDesc = document.getElementById('quest-desc');
    this.detailsReward = document.getElementById('quest-rewards');
    this.detailsCloseBtn = document.getElementById('quest-details-close');

    // Abort safely if quests UI is not present
    if (!this.activeList || !this.completedList) {
      console.warn('[QuestsUI] Quest lists not found. Skipping init.');
      return;
    }

    this.currentTab = 'active';
    this.currentFilter = 'main';

    // Attach close button safely
    if (this.detailsCloseBtn && this.detailsPanel) {
      this.detailsCloseBtn.addEventListener('click', () => {
        this.detailsPanel.classList.add('hidden');
      });
    }

    this.attachEvents();
    this.loadQuests();
  }

  attachEvents() {
    this.tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        document
          .querySelectorAll('.quest-tab.active')
          .forEach(el => el.classList.remove('active'));

        btn.classList.add('active');
        this.currentTab = btn.dataset.tab;
        this.loadQuests();
      });
    });

    this.filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        document
          .querySelectorAll('.filter-btn.active')
          .forEach(el => el.classList.remove('active'));

        btn.classList.add('active');
        this.currentFilter = btn.dataset.filter;
        this.loadQuests();
      });
    });
  }

  loadQuests() {
    const listEl =
      this.currentTab === 'active' ? this.activeList : this.completedList;
    const otherEl =
      this.currentTab === 'active' ? this.completedList : this.activeList;

    listEl.innerHTML = '';
    otherEl.classList.add('hidden');
    listEl.classList.remove('hidden');

    const quests = questsData?.[this.currentTab]?.[this.currentFilter];
    if (!quests) return;

    Object.values(quests).forEach(q => {
      const li = document.createElement('li');
      li.classList.add('quest-item');
      li.innerHTML = `
        <strong>${q.title}</strong><br>
        ${q.desc}<br>
        <em>Reward: ${q.reward}</em>
      `;
      li.addEventListener('click', () => this.showDetails(q));
      listEl.appendChild(li);
    });
  }

  showDetails(q) {
    if (!this.detailsPanel) return;

    this.detailsTitle.textContent = q.title;
    this.detailsDesc.textContent = q.desc;
    this.detailsReward.textContent = `Reward: ${q.reward}`;
    this.detailsPanel.classList.remove('hidden');
  }
}

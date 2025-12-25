import inventoryData from '/src/ui/data/inventoryData.js';
import inventoryState from '/src/ui/data/inventoryState.js';

export default class InventoryUI {
  constructor() {
    this.invTabs = document.querySelectorAll('.inv-tab');
    this.invGrid = document.getElementById('inventory-grid');
    this.invDetails = document.getElementById('inventory-details');
    this.invName = document.getElementById('inv-item-name');
    this.invDesc = document.getElementById('inv-item-desc');
    this.invIcon = document.querySelector('#inv-item-icon img');
    this.invClose = document.getElementById('inv-details-close');

    this.currentTab = 'key';

    this.invClose?.addEventListener('click', () =>
      this.invDetails.classList.add('hidden')
    );

    this.invTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        this.invTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.loadInventory(tab.dataset.tab);
      });
    });

    this.loadInventory(this.currentTab);
  }

  loadInventory(tab = 'key') {
    this.currentTab = tab;
    this.invGrid.innerHTML = '';

    const data = inventoryData[tab];
    const state = inventoryState[tab];
    if (!data || !state) return;

    Object.keys(data).forEach(key => {
      const owned =
        tab === 'key' ? state[key] === true : state[key] > 0;

      if (!owned) return;

      const item = data[key];
      const slot = document.createElement('div');
      slot.classList.add('inv-slot');

      const img = document.createElement('img');
      img.src = `/codequest-game/public/assets/icons/item/key_item/${item.icon}`;
      img.classList.add('inv-icon');
      slot.appendChild(img);

      if (tab === 'cons') {
        const count = document.createElement('span');
        count.classList.add('inv-count');
        count.textContent = state[key];
        slot.appendChild(count);
      }

      slot.addEventListener('click', () =>
        this.openItemDetails(item, state[key])
      );

      this.invGrid.appendChild(slot);
    });
  }

  openItemDetails(item, amount = null) {
    this.invName.textContent = item.name;
    this.invDesc.textContent =
      item.desc + (amount !== null ? `\nQuantity: ${amount}` : '');

    this.invIcon.src = `/codequest-game/public/assets/icons/item/key_item/${item.icon}`;
    this.invIcon.style.display = 'block';

    this.invDetails.classList.remove('hidden');
  }
}

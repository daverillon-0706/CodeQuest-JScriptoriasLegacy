import inventoryData from '/src/ui/data/inventoryData.js';

export default class InventoryUI {
  constructor() {
    // DOM elements
    this.invTabs = document.querySelectorAll('.inv-tab');
    this.invGrid = document.getElementById('inventory-grid');
    this.invDetails = document.getElementById('inventory-details');
    this.invName = document.getElementById('inv-item-name');
    this.invDesc = document.getElementById('inv-item-desc');
    this.invClose = document.getElementById('inv-details-close');
    this.currentTab = 'key';
    this.invIcon = document.querySelector('#inv-item-icon img');


    // Inventory database (static for now)
    this.InventoryDB = inventoryData;

    // Event listeners
    this.invClose?.addEventListener('click', () => this.invDetails.classList.add('hidden'));

    this.invTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        this.invTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.loadInventory(tab.dataset.tab);
      });
    });

    // Initialize grid
    this.loadInventory(this.currentTab);
  }

  loadInventory(tab = 'key') {
    this.currentTab = tab;
    this.invGrid.innerHTML = '';

    const listObj = this.InventoryDB[tab];
    if (!listObj) return;

    // Convert object to array for iteration
    const list = Object.values(listObj);

    list.forEach(item => {
      const slot = document.createElement('div');
      slot.classList.add('inv-slot');

      const img = document.createElement('img');
      img.src = `/src/assets/items/${item.icon}`;
      img.classList.add('inv-icon');
      img.onerror = () => img.style.display = 'none';

      slot.appendChild(img);

      // Click shows details
      slot.addEventListener('click', () => this.openItemDetails(item));

      this.invGrid.appendChild(slot);
    });
  }

  openItemDetails(item) {
    this.invName.textContent = item.name;
    this.invDesc.textContent = item.desc || item.effect || '';

    if(item.icon) {
        this.invIcon.src = '/src/assets/items/${item.icon}';
        this.invIcon.style.display = 'block';
    } else {
        this.invIcon.style.display = 'none';
    }
    
    this.invDetails.classList.remove('hidden');
  }
}

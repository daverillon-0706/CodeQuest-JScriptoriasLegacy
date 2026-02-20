// src/ui/components/InventoryUI.js

import GameState from '../../GameState.js';
import { inventoryData } from '/src/ui/data/inventoryData.js';
import { inventoryState } from '/src/ui/data/inventoryState.js';
import { syncInventory } from '../../utils/syncInventory.js';
import { ITEM_ICONS } from '/src/ui/data/itemIcons.js';

export default class InventoryUI {
  constructor() {
    // DOM elements
    this.invTabs = document.querySelectorAll('.inv-tab');
    this.invGrid = document.getElementById('inventory-grid');
    this.invDetails = document.getElementById('inventory-details');
    this.invName = document.getElementById('inv-item-name');
    this.invDesc = document.getElementById('inv-item-desc');
    this.invIcon = document.querySelector('.inv-item-icon img');
    this.invClose = document.getElementById('inv-details-close');

    this.currentTab = 'key';

    // Close button
    this.invClose?.addEventListener('click', () =>
      this.invDetails.classList.add('hidden')
    );

    // Tab switching
    this.invTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        this.invTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.loadInventory(tab.dataset.tab);
      });
    });

    // Quick-access consumable clicks
    this.setupQuickAccess();

    // Initial load
    this.loadInventory(this.currentTab);
  }

  // Reload current tab
  reload() {
    this.loadInventory(this.currentTab);
  }

  // Setup quick-access consumable button behavior
  setupQuickAccess() {
    const self = this;
    document.querySelectorAll('#quick-access .quick-slot.item').forEach(slot => {
  slot.addEventListener('click', () => {
    const consumableId = slot.dataset.id;
    if (!consumableId) return; // nothing equipped

    const used = GameState.useConsumable(consumableId, 1);
    if (used) {
      alert(`✅ Used ${inventoryData.cons[consumableId].name} from Quick Access`);
      syncInventory();
      inventoryUI.reload();
    } else {
      alert(`❌ No ${inventoryData.cons[consumableId].name} left!`);
    }
  });
});

  }

  // Load inventory items for a given tab
  loadInventory(tab = 'key') {
    this.currentTab = tab;
    this.invGrid.innerHTML = '';

    // Ensure inventory state matches GameState
    syncInventory();

    const data = inventoryData[tab];
    const state = inventoryState[tab];
    if (!data || !state) return;

    Object.keys(data).forEach(id => {
      const owned = tab === 'key' ? state[id] === true : state[id] > 0;
      if (!owned) return;

      const item = data[id];
      const slot = document.createElement('div');
      slot.classList.add('inv-slot');

      const img = document.createElement('img');
      img.src = ITEM_ICONS[id] ?? '';
      img.classList.add('inv-icon');
      slot.appendChild(img);

      // Show count for consumables
      if (tab === 'cons') {
        const count = document.createElement('span');
        count.classList.add('inv-count');
        count.textContent = state[id];
        slot.appendChild(count);
      }

      // Click to open details
      slot.addEventListener('click', () =>
        this.openItemDetails(item, id, tab === 'cons' ? state[id] : null)
      );

      this.invGrid.appendChild(slot);
    });
  }

  // Open item details (inventory right panel)
  openItemDetails(item, id = null, amount = null) {
    this.invName.textContent = item.name;
    this.invDesc.textContent =
      item.desc + (amount !== null ? `\nQuantity: ${amount}` : '');

    this.invIcon.src = ITEM_ICONS[id] ?? '';
    this.invIcon.style.display = 'block';
    this.invDetails.classList.remove('hidden');

    // Only for consumables
    if (this.currentTab === 'cons') {
      // --- Use Button ---
      let btn = document.getElementById('inv-use-btn');
      if (!btn) {
        btn = document.createElement('button');
        btn.id = 'inv-use-btn';
        btn.textContent = 'Use';
        btn.style.marginTop = '8px';
        this.invDetails.appendChild(btn);
      }
      btn.onclick = () => {
        const success = GameState.useConsumable(id, 1);
        if (success) {
          alert(`✅ Used ${item.name}`);
          syncInventory();
          this.reload();
          this.invDetails.classList.add('hidden');
        } else {
          alert(`❌ No ${item.name} left!`);
        }
      };

      // --- Equip to Quick Access Button ---
      let equipBtn = document.getElementById('inv-equip-btn');
      if (!equipBtn) {
        equipBtn = document.createElement('button');
        equipBtn.id = 'inv-equip-btn';
        equipBtn.textContent = 'Equip to Quick Access';
        equipBtn.style.marginTop = '4px';
        this.invDetails.appendChild(equipBtn);
      }
      equipBtn.onclick = () => {
  // Find first available quick-access slot
  const slot = document.querySelector(
    `#quick-access .quick-slot.item[data-slot="item-1"], 
     #quick-access .quick-slot.item[data-slot="item-2"]`
  );

  if (!slot) return;

  slot.dataset.id = item.id; // Set the equipped consumable
  slot.querySelector('.perk-icon img').src = `/codequest-game/public/assets/icons/item/consumables/${item.icon}`;
  alert(`✅ Equipped ${item.name} to Quick Access`);
};

    }
  }
}

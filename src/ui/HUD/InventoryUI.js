// src/ui/components/InventoryUI.js

import GameState from '../../GameState.js';
import { inventoryData } from '/src/ui/data/inventoryData.js';
import { inventoryState } from '/src/ui/data/inventoryState.js';
import { syncInventory } from '../../utils/syncInventory.js';
import { ITEM_ICONS } from '/src/ui/data/itemIcons.js';
import ConsumablesManager from '../../systems/ConsumablesManager.js';

export default class InventoryUI {
  constructor() {
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
  // Get the current player perks
  const player = GameState.player;
  if (!player) return;

  // Loop over both quick-access consumable slots
  player.perks.consumables = player.perks.consumables || [null, null];

  player.perks.consumables.forEach((consumableId, index) => {
    const slotEl = document.querySelector(`.quick-slot.item[data-slot="item-${index + 1}"]`);
    if (!slotEl) return;

    // Set data-id and icon
    slotEl.dataset.id = consumableId ?? '';
    const imgEl = slotEl.querySelector('.perk-icon img');
    if (imgEl) imgEl.src = consumableId ? ITEM_ICONS[consumableId] ?? '' : '';

    // Click listener to use the consumable
    slotEl.onclick = () => {
      if (!consumableId) return;
      const scene = window.currentScene;
      const success = ConsumablesManager.use(consumableId, scene);

      const consumableData = inventoryData.cons[consumableId];
      if (!consumableData) return alert("❌ Consumable not found!");

      if (success) {
        alert(`✅ Used ${consumableData.name} from Quick Access`);

        // Remove from slot if depleted
        const updatedPlayer = GameState.player;
        const slotIdx = updatedPlayer.perks.consumables.findIndex(c => c === consumableId);
        if (slotIdx !== -1) {
          updatedPlayer.perks.consumables[slotIdx] = null;
        }
        GameState.player = updatedPlayer;

        syncInventory();
        this.reload();
      } else {
        alert(`❌ No ${consumableData.name} left!`);
      }
    };
  });
}

  // Load inventory items for a given tab
  loadInventory(tab = 'key') {
    this.currentTab = tab;
    this.invGrid.innerHTML = '';

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

      if (tab === 'cons') {
        const count = document.createElement('span');
        count.classList.add('inv-count');
        count.textContent = state[id];
        slot.appendChild(count);
      }

      slot.addEventListener('click', () =>
        this.openItemDetails(item, id, tab === 'cons' ? state[id] : null)
      );

      this.invGrid.appendChild(slot);
    });
  }

  // Open item details (right panel)
  openItemDetails(item, id = null, amount = null) {
    this.invName.textContent = item.name;
    this.invDesc.textContent = item.desc + (amount !== null ? `\nQuantity: ${amount}` : '');

    this.invIcon.src = ITEM_ICONS[id] ?? '';
    this.invIcon.style.display = 'block';
    this.invDetails.classList.remove('hidden');

    if (this.currentTab === 'cons') {
      // Use Button
      let btn = document.getElementById('inv-use-btn');
      if (!btn) {
        btn = document.createElement('button');
        btn.id = 'inv-use-btn';
        btn.textContent = 'Use';
        btn.style.marginTop = '8px';
        this.invDetails.appendChild(btn);
      }
      btn.onclick = () => {
        const scene = window.currentScene;
        const success = ConsumablesManager.use(id, scene);

        if (success) {
          alert(`✅ Used ${item.name}`);
          syncInventory();
          this.reload();
          this.invDetails.classList.add('hidden');
        } else {
          alert(`❌ No ${item.name} left!`);
        }
      };

      // Equip to Quick Access Button
      let equipBtn = document.getElementById('inv-equip-btn');
      if (!equipBtn) {
        equipBtn = document.createElement('button');
        equipBtn.id = 'inv-equip-btn';
        equipBtn.textContent = 'Equip to Quick Access';
        equipBtn.style.marginTop = '4px';
        this.invDetails.appendChild(equipBtn);
      }
      equipBtn.onclick = () => {
  const player = GameState.player;
  if (!player || !player.perks) return;

  player.perks.consumables = player.perks.consumables || [null, null];

  const slotIndex = player.perks.consumables.findIndex(c => !c);
  if (slotIndex === -1) return alert("❌ No empty Quick Access slots!");

  player.perks.consumables[slotIndex] = id;
  GameState.player = player; // persist changes

  // Refresh quick-access icons & click listeners
  this.setupQuickAccess();

  alert(`✅ Equipped ${item.name} to Quick Access`);
};
    }
  }
}
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
      tab.addEventListener('click', (e) => {
        e.preventDefault(); // ✅ prevent page refresh
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
    const player = GameState.player;
    if (!player) return;

    player.perks.consumables = player.perks.consumables || [null, null];

    player.perks.consumables.forEach((_, index) => {
      const slotEl = document.querySelector(`.quick-slot.item[data-slot="item-${index + 1}"]`);
      if (!slotEl) return;

      const consumableId = player.perks.consumables[index];
      slotEl.dataset.id = consumableId ?? '';
      const imgEl = slotEl.querySelector('.perk-icon img');
      if (imgEl) imgEl.src = consumableId ? ITEM_ICONS[consumableId] ?? '' : '';

      // Use the dataset at click time to avoid stale closures
      slotEl.onclick = () => {
        const currentId = slotEl.dataset.id;
        if (!currentId) return;

        const scene = window.currentScene;
        const success = ConsumablesManager.use(currentId, scene);
        const consumableData = inventoryData.cons[currentId];
        if (!consumableData) return alert("❌ Consumable not found!");

        if (success) {
          alert(`✅ Used ${consumableData.name} from Quick Access`);

          // Remove from slot if depleted
          const updatedPlayer = GameState.player;
          const slotIdx = updatedPlayer.perks.consumables.findIndex(c => c === currentId);
          if (slotIdx !== -1) updatedPlayer.perks.consumables[slotIdx] = null;
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

    const player = GameState.player;
    if (!player) return;

    // ===============================
    // KEY ITEMS (Keycards / Keystones)
    // ===============================
    if (tab === 'key') {
      const keyItems = player.items?.keyItems || [];
      keyItems.forEach(id => {
        const itemData = inventoryData.key?.[id] || { name: id, desc: "Key Item" };
        const slot = document.createElement('div');
        slot.classList.add('inv-slot');

        const img = document.createElement('img');
        img.src = ITEM_ICONS[id] ?? '';
        img.classList.add('inv-icon');
        slot.appendChild(img);

        slot.addEventListener('click', () =>
          this.openItemDetails(itemData, id)
        );

        this.invGrid.appendChild(slot);
      });
      return;
    }

    // ===============================
    // OTHER TABS (Consumables etc)
    // ===============================
    const data = inventoryData[tab];
    const state = inventoryState[tab];
    if (!data || !state) return;

    Object.keys(data).forEach(id => {
      const owned = state[id] > 0;
      if (!owned) return;

      const item = data[id];
      const slot = document.createElement('div');
      slot.classList.add('inv-slot');

      const img = document.createElement('img');
      img.src = ITEM_ICONS[id] ?? '';
      img.classList.add('inv-icon');
      slot.appendChild(img);

      slot.addEventListener('click', () =>
        this.openItemDetails(item, id, state[id])
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

    if (this.currentTab !== 'cons') return;

    // Remove existing buttons to avoid multiple listeners
    ['inv-use-btn', 'inv-equip-btn'].forEach(btnId => {
      const oldBtn = document.getElementById(btnId);
      if (oldBtn) oldBtn.remove();
    });

    // Use Button
    const useBtn = document.createElement('button');
    useBtn.id = 'inv-use-btn';
    useBtn.textContent = 'Use';
    useBtn.style.marginTop = '8px';
    useBtn.onclick = () => {
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
    this.invDetails.appendChild(useBtn);

    // Equip to Quick Access Button
    const equipBtn = document.createElement('button');
    equipBtn.id = 'inv-equip-btn';
    equipBtn.textContent = 'Equip to Quick Access';
    equipBtn.style.marginTop = '4px';
    equipBtn.onclick = () => {
      const player = GameState.player;
      if (!player || !player.perks) return;

      player.perks.consumables = player.perks.consumables || [null, null];
      const slotIndex = player.perks.consumables.findIndex(c => !c);
      if (slotIndex === -1) return alert("❌ No empty Quick Access slots!");

      player.perks.consumables[slotIndex] = id;
      GameState.player = player;

      // Refresh quick-access icons & click listeners
      this.setupQuickAccess();

      alert(`✅ Equipped ${item.name} to Quick Access`);
    };
    this.invDetails.appendChild(equipBtn);
  }
}
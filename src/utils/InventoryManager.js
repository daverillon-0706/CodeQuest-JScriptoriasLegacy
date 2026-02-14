// InventoryManager.js
import GameState from "../GameState";

export default class InventoryManager {

  // ----------------------------
  // ACCESS CURRENT PLAYER ITEMS
  // ----------------------------
  static get items() {
    const player = GameState.player;
    if (!player) return {
      keyItems: {},
      consumables: {}
    };
    return player.items;
  }

  // ----------------------------
  // KEY ITEMS
  // ----------------------------
  static hasKeyItem(keyId) {
    return this.items.keyItems.includes(keyId);
  }

  static addKeyItem(keyId) {
    const player = GameState.player;
    if (!player) return;

    player.items.keyItems ??= [];
    if (!player.items.keyItems.includes(keyId)) {
      player.items.keyItems.push(keyId);
    }

    GameState.player = player; // save
  }

  static removeKeyItem(keyId) {
    const player = GameState.player;
    if (!player) return;

    player.items.keyItems ??= [];
    player.items.keyItems = player.items.keyItems.filter(k => k !== keyId);

    GameState.player = player; // save
  }

  // ----------------------------
  // CONSUMABLES
  // ----------------------------
  static getConsumableCount(consId) {
    return this.items.consumables?.[consId] || 0;
  }

  static addConsumable(consId, amount = 1) {
    const player = GameState.player;
    if (!player) return;

    player.items.consumables ??= {};
    player.items.consumables[consId] ??= 0;
    player.items.consumables[consId] += amount;

    GameState.player = player; // save
  }

  static useConsumable(consId, amount = 1) {
    const player = GameState.player;
    if (!player) return 0;

    player.items.consumables ??= {};
    const current = player.items.consumables[consId] ?? 0;
    const used = Math.min(amount, current);

    player.items.consumables[consId] = current - used;

    GameState.player = player; // save

    return used;
  }
}

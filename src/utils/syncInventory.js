import GameState from "../GameState.js";
import { inventoryState } from "../ui/data/inventoryState.js";

export function syncInventory() {
  const player = GameState.player;
  if (!player) return;

  // KEY ITEMS
  inventoryState.key = {};
  player.items.keyItems.forEach(id => {
    inventoryState.key[id] = true;
  });

  // CONSUMABLES
  inventoryState.cons = {};
  player.items.consumables.forEach(c => {
    inventoryState.cons[c.id] = c.amount;
  });
}

// src/ui/utils/syncInventory.js

import GameState from "../GameState.js";

import inventoryState  from "../ui/data/inventoryState.js";

export function syncInventory() {

  const player =
    GameState.player;

  if (!player) return;

  // KEY ITEMS
  Object.keys(
    inventoryState.key
  ).forEach(id => {

    inventoryState.key[id] =
      player.items.keyItems
        .includes(id);

  });

  // CONSUMABLES
  Object.keys(
    inventoryState.cons
  ).forEach(id => {

    inventoryState.cons[id] =
      player.items.consumables
        ?.find(c => c.id === id)
        ?.amount || 0;

  });

}

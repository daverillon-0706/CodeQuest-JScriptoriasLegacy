import { inventoryData } from "../ui/data/inventoryData";

export function getItemName(itemKey) {

  // Search key items
  if (inventoryData.key[itemKey]) {
    return inventoryData.key[itemKey].name;
  }

  // Search consumables
  if (inventoryData.cons[itemKey]) {
    return inventoryData.cons[itemKey].name;
  }

  // fallback if not found
  return itemKey
    .replace(/_/g, " ")
    .replace(/\b\w/g, c => c.toUpperCase());
}
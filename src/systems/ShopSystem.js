import ShopUI from "./ShopUI.js";
import {inventoryData} from "../ui/data/inventoryData.js"
import GameState from "../GameState.js";

export default class ShopSystem {
  constructor(scene) {
    this.scene = scene;

    this.isOpen = false;

    this.ui = new ShopUI(
      () => this.closeShop(),
      (item) => this.buyItem(item)
    );


    this.items = Object.entries(inventoryData.cons).map(
  ([id, data]) => ({
    id,
    name: data.name,
    price: data.cost ?? 0,
    icon: data.icon,
    desc: data.desc,
    limit: data.limit ?? null
  })
);


    scene.input.keyboard.on("keydown-Z", () => {
      if (this.isOpen) return;
      this.tryInteract();
    });
  }

  tryInteract() {
    if (!this.playerNearShop()) return;
    this.openShop();
  }

  openShop() {
    this.isOpen = true;

    this.ui.show(this.items);

    this.scene.scene.pause();
  }

  closeShop() {
    if (!this.isOpen) return; // guard

    this.isOpen = false;

    // Hide WITHOUT callback loop
    this.ui.hide(false);

    this.scene.scene.resume();
  }

  playerNearShop() {
    const p = this.scene.player;

    return Phaser.Math.Distance.Between(
      p.x,
      p.y,
      974,
      440
    ) < 40;
  }

  buyItem(item) {
  const player = GameState.player;
  if (!player) return;

  // =========================
  // Currency check
  // =========================
  if (player.cryptos < item.price) {
    console.log("[Shop] Not enough Cryptos");
    return;
  }

  // =========================
  // Limit check
  // =========================
  const owned =
    player.items.consumables.find(c => c.id === item.id)?.amount ?? 0;

  if (item.limit && owned >= item.limit) {
    console.log(`[Shop] ${item.name} limit reached`);
    return;
  }

  // =========================
  // Deduct currency
  // =========================
  player.cryptos -= item.price;

  // =========================
  // APPLY SPECIAL EFFECTS
  // =========================
  switch (item.id) {

  case "heart_container":
    player.max_hp += 1;

    // FULL REFILL
    player.hp = player.max_hp;

    console.log(
      `[Shop] Max HP increased → ${player.max_hp} (Fully healed)`
    );
    break;

  case "energy_container":
    player.max_energy += 1;

    // FULL REFILL
    player.energy = player.max_energy;

    console.log(
      `[Shop] Max Energy increased → ${player.max_energy} (Fully refilled)`
    );
    break;
}

  // =========================
  // Save stat changes
  // =========================
  GameState.player = player;

  // =========================
  // Add to inventory
  // =========================
  GameState.addConsumable(item.id, 1);

  console.log(`[Shop] Bought ${item.name}`);
}



}

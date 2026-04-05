import ShopUI from "./ShopUI.js";
import {inventoryData} from "../ui/data/inventoryData.js"
import GameState from "../GameState.js";
import SoundManager from "./SoundManager.js";
import { getItemName } from "../utils/getItemName.js";

export default class ShopSystem {
  constructor(scene) {
    this.scene = scene;
    this.soundManager = new SoundManager(scene);

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
  const itemName = getItemName(item.id);

  if (!player) return;

  // =========================
  // Currency check
  // =========================
  if (player.cryptos < item.price) {
    this.soundManager.play("error");
    console.log("[Shop] Not enough Cryptos");

    if (this.scene.NotificationSystem) {
      this.scene.NotificationSystem.add(
        `Not enough Cryptos for ${itemName}`,
        "warning"
      );
    }

    return;
  }

  // =========================
  // PERMANENT UPGRADES
  // =========================
  if (item.id === "heart_container") {
    if (player.max_hp >= 13) {
      this.soundManager.play("error");
      console.log("[Shop] Max HP already at cap");

      if (this.scene.NotificationSystem) {
        this.scene.NotificationSystem.add(
          "Heart Container already at maximum",
          "warning"
        );
      }

      return;
    }

    this.soundManager.play("kaching");

    player.cryptos -= item.price;
    player.max_hp += 1;
    player.hp += 1;
    //player.hp = player.max_hp;

    GameState.player = player;

    console.log(`[Shop] Max HP increased → ${player.max_hp}`);

    if (this.scene.NotificationSystem) {
      this.scene.NotificationSystem.add(
        `Bought ${itemName}! Max HP increased`,
        "success"
      );
    }

    if (this.scene.refreshHUD) {
      this.scene.refreshHUD();
    }

    return;
  }

  if (item.id === "energy_container") {
    if (player.max_energy >= 10) {
      this.soundManager.play("error");
      console.log("[Shop] Max Energy already at cap");

      if (this.scene.NotificationSystem) {
        this.scene.NotificationSystem.add(
          "Energy Container already at maximum",
          "warning"
        );
      }

      return;
    }

    this.soundManager.play("kaching");

    player.cryptos -= item.price;
    player.max_energy += 1;
    player.energy = player.max_energy;

    GameState.player = player;

    console.log(`[Shop] Max Energy increased → ${player.max_energy}`);

    if (this.scene.NotificationSystem) {
      this.scene.NotificationSystem.add(
        `Bought ${itemName}! Max Energy increased`,
        "success"
      );
    }

    if (this.scene.refreshHUD) {
      this.scene.refreshHUD();
    }

    return;
  }

  // =========================
  // NORMAL CONSUMABLES
  // =========================
  const owned =
    player.items.consumables.find(c => c.id === item.id)?.amount ?? 0;

  if (item.limit && owned >= item.limit) {
    this.soundManager.play("error");
    console.log(`[Shop] ${item.name} limit reached`);

    if (this.scene.NotificationSystem) {
      this.scene.NotificationSystem.add(
        `${itemName} limit reached`,
        "warning"
      );
    }

    return;
  }

  this.soundManager.play("kaching");

  player.cryptos -= item.price;

  GameState.player = player;
  GameState.addConsumable(item.id, 1);

  console.log(`[Shop] Bought ${item.name}`);

  if (this.scene.NotificationSystem) {
    this.scene.NotificationSystem.add(
      `Bought ${itemName}`,
      "success"
    );
  }
}



}
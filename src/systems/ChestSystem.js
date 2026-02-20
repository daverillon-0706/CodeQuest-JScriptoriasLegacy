import Phaser from "phaser";
//import inventoryState from "../ui/data/inventoryState.js";

const CHEST_FRAMES = {
  item: 0,
  perk: 1,
  key: 2,
  empty: 3,
  mimicOpen: 4,
  mimicClosed: 5
};

class ChestSystemClass {
  constructor() {
    this.scene = null;
    this.player = null;
    this.chests = [];
  }

  init(scene, player) {
    this.scene = scene;
    this.player = player;
    this.chests = [];
  }

  loadFromMap(map) {
    const layer = map.getObjectLayer("chests");
    if (!layer) return;

    layer.objects.forEach(obj => {
      const chestType =
        obj.properties?.find(p => p.name === "chesttype")?.value ?? "item";

      const lootKey =
        obj.properties?.find(p => p.name === "lootkey")?.value ?? null;

      const damage =
        obj.properties?.find(p => p.name === "damage")?.value ?? 25;

      const frame =
        chestType === "mimic"
          ? CHEST_FRAMES.item
          : chestType === "key"
          ? CHEST_FRAMES.key
          : CHEST_FRAMES.item;

      const x = Math.floor(obj.x / this.scene.TILE_SIZE) * this.scene.TILE_SIZE;
      const y = Math.floor(obj.y / this.scene.TILE_SIZE) * this.scene.TILE_SIZE;

      const chest = this.scene.physics.add.sprite(x, y, "chest", frame)
        .setOrigin(0, 1)
        .setImmovable(true);

      chest.body.setAllowGravity(false);

      // ✅ SAFE: Phaser Data Manager
      chest.setData({
        type: chestType,
        lootKey,
        damage,
        opened: false
      });

      this.chests.push(chest);
    });
  }

  getNearbyChest(radius = 20) {
    return this.chests.find(chest =>
      Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        chest.x,
        chest.y
      ) < radius
    );
  }

  interact() {
    const chest = this.getNearbyChest();
    if (!chest || chest.getData("opened")) return false;

    chest.setData("opened", true);

    if (chest.getData("type") === "mimic") {
      this.triggerMimic(chest);
    } else {
      this.openNormalChest(chest);
    }

    return true;
  }

  openNormalChest(chest) {
    const key = chest.getData("lootKey");

    if (!key || inventoryState.key[key] === undefined) {
      console.warn("Invalid loot key:", key);
      return;
    }

    inventoryState.key[key] = true;

    this.scene.dialogueManager?.start([
      `You obtained ${key.replace(/_/g, " ")}!`
    ]);

    // ✅ Just change frame — DO NOT destroy
    chest.setFrame(CHEST_FRAMES.empty);
  }

  triggerMimic(chest) {
    this.createAnimations();

    chest.play("mimic-idle");

    if (typeof this.scene.playerHP === "number") {
      this.scene.playerHP -= chest.getData("damage");
    }

    if (this.scene.playerHPEl) {
      this.scene.playerHPEl.textContent = this.scene.playerHP;
    }

    this.scene.dialogueManager?.start([
      "The chest suddenly moves...",
      "It's a Mimic!"
    ]);
  }

  createAnimations() {
    if (this.scene.anims.exists("mimic-idle")) return;

    this.scene.anims.create({
      key: "mimic-idle",
      frames: [
        { key: "chest", frame: CHEST_FRAMES.mimicOpen },
        { key: "chest", frame: CHEST_FRAMES.mimicClosed }
      ],
      frameRate: 4,
      repeat: -1
    });
  }
}

export default new ChestSystemClass();

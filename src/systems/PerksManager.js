// PerksManager.js
import GameState from "../GameState.js";
import { PassivePerks, OffensePerks, DefensePerks } from "../ui/data/perkData.js";

export default class PerksManager {
  
  // -------------------------
  // HELPERS
  // -------------------------
  static get player() {
    return GameState.player;
  }

  static sync() {
  if (!this.player) return;

  const storedPlayer = GameState.player ?? {};
  GameState.player = {
    ...storedPlayer,               // keep existing data like activePerks
    hp: this.player.hp,
    max_hp: this.player.max_hp,
    energy: this.player.energy,
    max_energy: this.player.max_energy,
    cryptos: this.player.cryptos,
    perks: this.player.perks,
    effects: this.player.effects,
    perkInventory: this.player.perkInventory,
    items: this.player.items,
    lessonsUnlocked: this.player.lessonsUnlocked,
    codexProgress: this.player.codexProgress,
    worldState: this.player.worldState,
    riftProgress: this.player.riftProgress,
  };

  window.hud?.updateHUD?.();
}

  static currentScene = null;

  static setScene(scene) {
  this.currentScene = scene;
  console.log("Scene key:", scene.scene.key);

  const player = GameState.player;

  // Initialize objects if missing
  player.activePerks ??= {};
  player.cooldowns ??= {};
  GameState.player = player;

  console.log("OffensePerks:", OffensePerks);
  console.log("DefensePerks:", DefensePerks);
}
  static isEquipped(perkId) {
    const p = this.player?.perks;
    if (!p) return false;
    return p.passive === perkId || p.offense === perkId || p.defense === perkId;
  }

  static getEffectiveCost(perk) {
    let cost = perk.cost ?? 0;
    if (this.player.effects?.reductionChip) cost = Math.max(cost - 2, 0);
    return cost;
  }

  static hasEnergy(cost) {
    return this.player.energy >= cost;
  }

  static spendEnergy(cost) {
    this.player.energy -= cost;
  }

  static isOnCooldown(perkId) {
    const cd = this.player.cooldowns?.[perkId];
    return cd && Date.now() < cd;
  }

  static startCooldown(perkId, duration) {
  if (!duration) return;

  // ✅ Ensure player and cooldown object exist
  const player = this.player;
  if (!player) return;

  player.cooldowns ??= {};  // <- THIS ensures it exists

  player.cooldowns[perkId] = Date.now() + duration;
}

  // -------------------------
  // EQUIP / UNEQUIP
  // -------------------------

// Equip a perk
static equip(perk) {
  const player = GameState.player;
  if (!player) return;

  console.log("[PerksManager] Equip request:", perk.id, perk.type);

  // Passive perks: automatically remove previous
  if (perk.type === "passive") {
    if (player.perks.passive) {
      console.log("[PerksManager] Removing previous passive:", player.perks.passive);
      PassivePerks[player.perks.passive]?.remove(player);
    }
    player.perks.passive = perk.id;
    perk.apply(player);
    console.log("[PerksManager] Passive equipped:", perk.id);
  }

  // Offense perks
  if (perk.type === "offense") {
    if (player.perks.offense) {
      console.log("[PerksManager] Removing previous offense:", player.perks.offense);
      OffensePerks[player.perks.offense]?.remove?.(player);
    }
    player.perks.offense = perk.id;
  }

  // Defense perks
  if (perk.type === "defense") {
    if (player.perks.defense) {
      console.log("[PerksManager] Removing previous defense:", player.perks.defense);
      DefensePerks[player.perks.defense]?.remove?.(player);
    }
    player.perks.defense = perk.id;
  }

  // Save and refresh HUD
  GameState.player = player;
  window.hud?.updateHUD?.();
}

// Unequip a perk type
static unequip(type) {
  const player = GameState.player;
  if (!player) return;

  console.log("[PerksManager] Unequip request:", type);

  if (type === "passive" && player.perks.passive) {
    PassivePerks[player.perks.passive]?.remove(player);
    player.perks.passive = null;
  }

  if (type === "offense" && player.perks.offense) {
    OffensePerks[player.perks.offense]?.remove?.(player);
    player.perks.offense = null;
  }

  if (type === "defense" && player.perks.defense) {
    DefensePerks[player.perks.defense]?.remove?.(player);
    player.perks.defense = null;
  }

  GameState.player = player;
  window.hud?.updateHUD?.();
}


  // -------------------------
  // ACTIVATE OFFENSE / DEFENSE
  // -------------------------
  static activateOffense(perkId) {
    this.#activate(perkId, OffensePerks);
  }

  static activateDefense(perkId) {
    this.#activate(perkId, DefensePerks);
  }

  static #activate(perkId, source) {
  const perk = source[perkId];
  if (!perk) return;

  if (!this.player) return;

  this.player.activePerks ??= {};

  if (this.player.activePerks[perkId]) return; // already active

  if (!this.isEquipped(perkId)) return;

  if (this.isOnCooldown(perkId)) return;

  const cost = this.getEffectiveCost(perk);
  if (!this.hasEnergy(cost)) return;

  this.spendEnergy(cost);
  this.player.activePerks[perkId] = true;

  console.log(`[PerksManager] Activating perk: ${perkId}`);
  console.log(`[PerksManager] Active perks now:`, this.player.activePerks);

  // Immediately disable HUD button
  window.hud?.disablePerkButton(perkId);

  try {
    if (perk.apply) {
      perk.apply(this.player, this.currentScene);
    }
  } catch (err) {
    console.error(`[PerksManager] Error activating ${perkId}:`, err);
    delete this.player.activePerks[perkId];
    window.hud?.enablePerkButton(perkId);
    return;
  }

  // Duration
  if (perk.duration) {
    this.currentScene?.time?.delayedCall(perk.duration, () => {
      delete this.player.activePerks[perkId];
      console.log(`[PerksManager] Perk expired: ${perkId}`);
      window.hud?.enablePerkButton(perkId);
      window.hud?.updateHUD();
    });
  } else {
    // If no duration, re-enable after cooldown
    const cd = perk.cooldown ?? 0;
    setTimeout(() => {
      window.hud?.enablePerkButton(perkId);
      window.hud?.updateHUD();
    }, cd);
  }

  this.startCooldown(perkId, perk.cooldown);
  this.sync();
}

}

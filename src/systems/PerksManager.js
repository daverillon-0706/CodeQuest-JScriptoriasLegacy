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
    // Only store serializable data
    const { hp, max_hp, energy, max_energy, cryptos, perks } = this.player;
    const clone = { hp, max_hp, energy, max_energy, cryptos, perks };
    GameState.player = { ...clone, effects: this.player.effects };
    window.hud?.updateHUD?.();
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
    this.player.cooldowns ??= {};
    this.player.cooldowns[perkId] = Date.now() + duration;
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

  console.log("[PerksManager] Activating perk:", perkId, perk.type ?? "unknown");

  if (this.isOnCooldown(perkId)) {
    console.log("[PerksManager] On cooldown:", perkId);
    return;
  }

  const cost = this.getEffectiveCost(perk);
  if (!this.hasEnergy(cost)) {
    console.log("[PerksManager] Not enough energy for:", perkId);
    return;
  }

  this.spendEnergy(cost);
  perk.apply?.(this.player);
  this.startCooldown(perkId, perk.cooldown);

  console.log("[PerksManager] Perk activated:", perkId);

  this.sync();
}

}

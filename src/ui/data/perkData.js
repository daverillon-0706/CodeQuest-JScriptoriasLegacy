// src/ui/data/perkData.js
export const PassivePerks = {
  hp_boost: {
    name: "HP Boost",
    desc: "Gives extra 3 health.",
    apply(player) {
      if (player._hpBoostApplied) return;

      player.max_hp += 3;
      player.hp += 3;
      player._hpBoostApplied = true;
    },
    remove(player) {
      if (!player._hpBoostApplied) return;

      player.max_hp = Math.max(player.max_hp - 3, 1);
      player.hp = Math.min(player.hp, player.max_hp);
      player._hpBoostApplied = false;
    }
  },

  def_boost: {
    name: "DEF Boost",
    desc: "Reduces damage taken by one.",
    apply(player) {
      player.effects ??= {};
      player.effects.defBoost = true;
    },
    remove(player) {
      player.effects && delete player.effects.defBoost;
    }
  },

  power_bank: {
    name: "Power Bank",
    desc: "Gives extra 3 energy.",
    apply(player) {
      if (player._powerBankApplied) return;

      player.max_energy += 3;
      player.energy += 3;
      player._powerBankApplied = true;
    },
    remove(player) {
      if (!player._powerBankApplied) return;

      player.max_energy = Math.max(player.max_energy - 3, 1);
      player.energy = Math.min(player.energy, player.max_energy);
      player._powerBankApplied = false;
    }
  },

  reduction_chip: {
    name: "Reduction Chip",
    desc: "Reduce cost of perks by 2.",
    apply(player) {
      player.effects ??= {};
      player.effects.reductionChip = true;
    },
    remove(player) {
      player.effects && delete player.effects.reductionChip;
    }
  },

  "1up": {
    name: "1-UP Chip",
    desc: "Revives the player only once.",
    apply(player) {
      player.effects ??= {};
      player.effects.oneUp = true;
    },
    remove(player) {
      player.effects && delete player.effects.oneUp;
    }
  }
};

// src/ui/data/perkData.js
export const OffensePerks = {
  pixel_gun: {
    id: "pixel_gun",
    type: "offense",
    name: "Pixel Gun",
    desc: "Increase attack speed for 10 seconds.",
    cost: 5,
    cooldown: 20000,
    duration: 10000,

    apply(player, scene) {
      if (!player) return;
      if (!scene?.playerController) {
        console.warn("[Perk] Pixel Gun cannot activate — no playerController");
        return;
      }

      const controller = scene.playerController;
      console.log("[Perk] Pixel Gun ON");

      // Temporarily increase fire rate
      controller.fireRate = controller.baseFireRate * 0.4;

      // Reset after duration
      scene.time.delayedCall(10000, () => {
        controller.fireRate = controller.baseFireRate;
        console.log("[Perk] Pixel Gun OFF");
      });
    },

    remove(player) {
      // nothing to remove for Pixel Gun
    }
  },

  ctrl_alt_del: {
    id: "ctrl_alt_del",
    type: "offense",
    name: "Control Alternate Delete Chip",
    desc: "Destroy enemies around the player in a 6 tile AoE.",
    cost: 8,
    cooldown: 120000,

    apply(player, scene) {
  if (!scene?.bugs) {
    console.warn("[Perk] CTRL+ALT+DEL failed — no bugs group");
    return;
  }

  const radius = 6 * 32; // 6 tiles (adjust if your tile size differs)

  console.log("[Perk] CTRL+ALT+DEL triggered");

  scene.bugs.getChildren().forEach(bug => {
    const distance = Phaser.Math.Distance.Between(
      scene.player.x,
      scene.player.y,
      bug.x,
      bug.y
    );

    if (distance <= radius) {
      bug.destroy();
    }
  });
},

    remove(player) {
      player.effects && delete player.effects.enemyDebuffLock;
    }
  },

  flash_strike: {
    id: "flash_strike",
    type: "offense",
    name: "Flash Strike",
    desc: "Stuns enemies in a 3-tile AoE for 7 seconds.",
    cost: 8,
    cooldown: 7000,

    apply(player) {
      if (!player) return;
      player.effects ??= {};
      player.effects.flashStrike = { aoeTiles: 3, duration: 7000 };
    },

    remove(player) {
      player.effects && delete player.effects.flashStrike;
    }
  },

  maid_stopwatch: {
    id: "maid_stopwatch",
    type: "offense",
    name: "Maid's Stopwatch",
    desc: "Stops everything for 10 seconds.",
    cost: 6,
    cooldown: 10000,

    apply(player) {
      if (!player) return;
      player.effects ??= {};
      player.effects.timeStop = { duration: 10000 };
    },

    remove(player) {
      player.effects && delete player.effects.timeStop;
    }
  },

  vamp_tech: {
    id: "vamp_tech",
    type: "offense",
    name: "Vamp Tech",
    desc: "Steal hearts based on enemy tier (3 uses).",
    cost: 5,
    cooldown: 0,

    apply(player) {
      if (!player) return;
      player.effects ??= {};
      player.effects.vampTech = { charges: 3 };
    },

    remove(player) {
      player.effects && delete player.effects.vampTech;
    }
  }
};

// src/ui/data/perkData.js
export const DefensePerks = {
  magic_mushroom: {
    id: "magic_mushroom",
    type: "defense",
    name: "Magic Mushroom",
    desc: "Negates damage once and grants a heart.",
    cost: 3,
    cooldown: 0,

    apply(player) {
      if (!player) return;
      player.effects ??= {};
      player.effects.magicMushroom = { used: false };
      player.hp = Math.min(player.hp + 1, player.max_hp);
    },

    remove(player) {
      player?.effects && delete player.effects.magicMushroom;
    }
  },

  protective_shield: {
    id: "protective_shield",
    type: "defense",
    name: "Protective Shield",
    desc: "Negates damage for 30 seconds (debuffs still apply).",
    cost: 4,
    cooldown: 30000,

    apply(player) {
      if (!player) return;
      player.effects ??= {};
      player.effects.protectiveShield = { duration: 30000 };
    },

    remove(player) {
      player?.effects && delete player.effects.protectiveShield;
    }
  },

  gnosis_potion: {
    id: "gnosis_potion",
    type: "defense",
    name: "Gnosis Potion",
    desc: "Removes all debuffs.",
    cost: 5,
    cooldown: 0,

    apply(player) {
      if (!player) return;
      player.effects ??= {};
      player.effects.clearDebuffs = true;
    },

    remove(player) {
      player?.effects && delete player.effects.clearDebuffs;
    }
  },

  wind_cape: {
    id: "wind_cape",
    type: "defense",
    name: "Wind Cape",
    desc: "Invisible for 20 seconds. Breaks on attack or hit.",
    cost: 4,
    cooldown: 20000,

    apply(player) {
      if (!player) return;
      player.effects ??= {};
      player.effects.windCape = { duration: 20000 };
    },

    remove(player) {
      player?.effects && delete player.effects.windCape;
    }
  },

  gacha_block: {
    id: "gacha_block",
    type: "defense",
    name: "Gacha Block",
    desc: "Random buff or debuff.",
    cost: 4,
    cooldown: 0,

    apply(player) {
      if (!player) return;
      player.effects ??= {};
      player.effects.gachaBlock = true;
    },

    remove(player) {
      player?.effects && delete player.effects.gachaBlock;
    }
  }
};

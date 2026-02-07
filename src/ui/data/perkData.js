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
    desc: "Reduces damage taken by half.",
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

export const OffensePerks = {
  pixel_gun: {
    name: "Pixel Gun",
    desc: "Immobilize a target enemy for 5 seconds.",
    cost: 5,
    cooldown: 5000,

    apply(player) {
      player.effects ??= {};
      player.effects.pixelGun = {
        duration: 5000
      };
    },

    remove(player) {
      player.effects && delete player.effects.pixelGun;
    }
  },

  ctrl_alt_del: {
    name: "Control Alternate Delete Chip",
    desc: "Locks out enemy debuffs for 10 seconds.",
    cost: 7,
    cooldown: 10000,

    apply(player) {
      player.effects ??= {};
      player.effects.enemyDebuffLock = {
        duration: 10000
      };
    },

    remove(player) {
      player.effects && delete player.effects.enemyDebuffLock;
    }
  },

  flash_strike: {
    name: "Flash Strike",
    desc: "Stuns enemies in a 3-tile AoE for 7 seconds.",
    cost: 8,
    cooldown: 7000,

    apply(player) {
      player.effects ??= {};
      player.effects.flashStrike = {
        aoeTiles: 3,
        duration: 7000
      };
    },

    remove(player) {
      player.effects && delete player.effects.flashStrike;
    }
  },

  maid_stopwatch: {
    name: "Maid's Stopwatch",
    desc: "Stops everything for 10 seconds.",
    cost: 6,
    cooldown: 10000,

    apply(player) {
      player.effects ??= {};
      player.effects.timeStop = {
        duration: 10000
      };
    },

    remove(player) {
      player.effects && delete player.effects.timeStop;
    }
  },

  vamp_tech: {
    name: "Vamp Tech",
    desc: "Steal hearts based on enemy tier (3 uses).",
    cost: 5,
    cooldown: 0,

    apply(player) {
      player.effects ??= {};
      player.effects.vampTech = {
        charges: 3
      };
    },

    remove(player) {
      player.effects && delete player.effects.vampTech;
    }
  }
};

export const DefensePerks = {
  magic_mushroom: {
    name: "Magic Mushroom",
    desc: "Negates damage once and grants a heart.",
    cost: 3,
    cooldown: 0,

    apply(player) {
      player.effects ??= {};
      player.effects.magicMushroom = {
        used: false
      };

      player.hp = Math.min(player.hp + 1, player.max_hp);
    },

    remove(player) {
      player.effects && delete player.effects.magicMushroom;
    }
  },

  protective_shield: {
    name: "Protective Shield",
    desc: "Negates damage for 30 seconds (debuffs still apply).",
    cost: 4,
    cooldown: 30000,

    apply(player) {
      player.effects ??= {};
      player.effects.protectiveShield = {
        duration: 30000
      };
    },

    remove(player) {
      player.effects && delete player.effects.protectiveShield;
    }
  },

  gnosis_potion: {
    name: "Gnosis Potion",
    desc: "Removes all debuffs.",
    cost: 5,
    cooldown: 0,

    apply(player) {
      player.effects ??= {};
      player.effects.clearDebuffs = true;
    },

    remove(player) {
      player.effects && delete player.effects.clearDebuffs;
    }
  },

  wind_cape: {
    name: "Wind Cape",
    desc: "Invisible for 20 seconds. Breaks on attack or hit.",
    cost: 4,
    cooldown: 20000,

    apply(player) {
      player.effects ??= {};
      player.effects.windCape = {
        duration: 20000
      };
    },

    remove(player) {
      player.effects && delete player.effects.windCape;
    }
  },

  gacha_block: {
    name: "Gacha Block",
    desc: "Random buff or debuff.",
    cost: 4,
    cooldown: 0,

    apply(player) {
      player.effects ??= {};
      player.effects.gachaBlock = true;
    },

    remove(player) {
      player.effects && delete player.effects.gachaBlock;
    }
  }
};

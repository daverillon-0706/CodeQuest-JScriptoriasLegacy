const inventoryData = {
  key: {
    "key_logic": {
      item_id: 1,
      name: "Keycard of Logic",
      desc: "A keycard that allows the player to open the Monolith of Logic.",
      icon: "key_logic.png"
    },
    "key_flow": {
      item_id: 2,
      name: "Keycard of Flow",
      desc: "A keycard that allows the player to open the Monolith of Flow.",
      icon: "key_flow.png"
    },
    "key_creations": {
      item_id: 3,
      name: "Keycard of Creations",
      desc: "A keycard that allows the player to open the Monolith of Creations.",
      icon: "key_creations.png"
    },
    "key_abstraction": {
      item_id: 4,
      name: "Keycard of Abstraction",
      desc: "A keycard that allows the player to open the Monolith of Abstraction.",
      icon: "key_abstraction.png"
    },
    "elysia_keycard": {
      item_id: 5,
      name: "Elysia's Keycard",
      desc: "A keycard that allows the player to open Elysia's office anytime.",
      icon: "elysia_keycard.png"
    },
    "orin_badge": {
      item_id: 6,
      name: "Orin's Academy Badge",
      desc: "Orin's badge that shows the academy.",
      icon: "orin_badge.png"
    },
    "kaelen_pass": {
      item_id: 7,
      name: "Kaelen's Guild Pass",
      desc: "A pass granting access to Kaelen's guild areas.",
      icon: "kaelen_pass.png"
    },
    "mira_teddy": {
      item_id: 8,
      name: "Mira's Teddy Bear",
      desc: "A soft stuffed bear belonging to Mira.",
      icon: "teddy_bear.png"
    },
    "selena_book": {
      item_id: 9,
      name: "Selena's Favorite Book",
      desc: "Selena’s well-worn favorite book.",
      icon: "selena_book.png"
    },
    // Trade items
    "chocolate_coin": {
      item_id: 10,
      name: "Chocolate Coin",
      desc: "A small chocolate coin. Used for trading.",
      icon: "choco_coin.png"
    },
    "bag_glass": {
      item_id: 11,
      name: "Bag of Glass Shards",
      desc: "A bag full of broken glass shards. Trade item.",
      icon: "glass_shards.png"
    },
    "vanilla_farfait": {
      item_id: 12,
      name: "Vanilla Farfait",
      desc: "A small dessert. Used for trading.",
      icon: "vanilla_farfait.png"
    },
    "book_knowledge": {
      item_id: 13,
      name: "Book of Knowledge",
      desc: "Contains insights and random facts. Trade item.",
      icon: "book_knowledge.png"
    },
    "love_letter": {
      item_id: 14,
      name: "Love Letter",
      desc: "A sealed letter containing someone's feelings.",
      icon: "love_letter.png"
    },
    "novelty_glasses": {
      item_id: 15,
      name: "Novelty Glasses",
      desc: "Funny glasses used as a trade item.",
      icon: "novelty_glasses.png"
    },
    "dad_jokes": {
      item_id: 16,
      name: "Dad Jokes for Dummies",
      desc: "A book containing terrible jokes.",
      icon: "dad_jokes.png"
    },
    "mocha_plushie": {
      item_id: 17,
      name: "Mocha Plushie",
      desc: "A cute plushie. Trade item.",
      icon: "mocha_plushie.png"
    },
    "clocktower_key": {
      item_id: 18,
      name: "Clock Tower Key",
      desc: "Opens the Clock Tower.",
      icon: "clocktower_key.png"
    },
    "perk_shards": {
      item_id: 19,
      name: "Lost Perk Shards",
      desc: "Collect all 10 to recover a special perk.",
      icon: "perk_shards.png",
      quantity: 0,
      max: 10
    },
    "over_9000": {
      item_id: 20,
      name: "Over 9000!!!",
      desc: "Cool mono glasses that let you see how difficult a bug is.",
      icon: "over9000.png"
    }
  },

  cons: {
    "hp_pill": {
      item_id: 21,
      name: "Health Pills",
      tier: 1,
      effect: "Heals a small amount.",
      icon: "hp_pill.png"
    },
    "hp_pod": {
      item_id: 22,
      name: "Health Pod",
      tier: 2,
      effect: "Heals a moderate amount.",
      icon: "hp_pod.png"
    },
    "medkit": {
      item_id: 23,
      name: "Medkit",
      tier: 3,
      effect: "Heals a large amount.",
      icon: "medkit.png"
    },
    "energy_pill": {
      item_id: 24,
      name: "Energy Pill",
      tier: 1,
      effect: "Restores a small amount of Energy.",
      icon: "energy_pill.png"
    },
    "energy_drink": {
      item_id: 25,
      name: "Energy Drink",
      tier: 2,
      effect: "Restores a moderate amount of Energy.",
      icon: "energy_drink.png"
    },
    "energy_restore": {
      item_id: 26,
      name: "Energy Restoration",
      tier: 3,
      effect: "Restores a large amount of Energy.",
      icon: "energy_restore.png"
    },
    "full_rev": {
      item_id: 27,
      name: "Full Revitalization",
      effect: "Fully restores Health & Energy and removes all debuffs.",
      icon: "full_rev.png"
    },
    "flashbang": {
      item_id: 28,
      name: "Emergency Flashbang",
      effect: "Retreat from battle and reset all actions.",
      icon: "flashbang.png"
    },
    "timer_add": {
      item_id: 29,
      name: "Timer",
      effect: "Adds 5 minutes to the battle timer.",
      icon: "timer.png"
    },
    "slow_motion": {
      item_id: 30,
      name: "Slow Motion",
      effect: "Slows timer and bug debuff cooldown.",
      icon: "slow_motion.png"
    },
    "temp_hp": {
      item_id: 31,
      name: "Temporary Health",
      effect: "Grants +50% temporary HP for 30 minutes.",
      icon: "temp_hp.png"
    }
  }
};

export default inventoryData;

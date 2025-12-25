const inventoryData = {
  key: {
    // -------------------------
    // KEYCARDS
    // -------------------------
    key_logic: {
      item_id: 1,
      name: "Keycard of Logic",
      desc: "A keycard granting access to the Monolith of Logic.",
      icon: "key_logic.png"
    },
    key_flow: {
      item_id: 2,
      name: "Keycard of Flow",
      desc: "A keycard granting access to the Monolith of Flow.",
      icon: "key_flow.png"
    },
    key_structure: {
      item_id: 3,
      name: "Keycard of Structure",
      desc: "A keycard granting access to the Monolith of Structure.",
      icon: "key_structure.png"
    },
    key_computation: {
      item_id: 4,
      name: "Keycard of Computation",
      desc: "A keycard granting access to the Monolith of Computation.",
      icon: "key_computation.png"
    },

    // -------------------------
    // DATA STONES
    // -------------------------
    data_syntax: { item_id: 10, name: "Data Stone: Syntax", desc: "Contains knowledge about syntax rules.", icon: "data_syntax.png" },
    data_variables: { item_id: 11, name: "Data Stone: Variables", desc: "Encodes variable handling.", icon: "data_variables.png" },
    data_operators: { item_id: 12, name: "Data Stone: Operators", desc: "Explains operators and expressions.", icon: "data_operators.png" },
    data_conditions: { item_id: 13, name: "Data Stone: Conditions", desc: "Holds conditional logic.", icon: "data_conditions.png" },
    data_loops: { item_id: 14, name: "Data Stone: Loops", desc: "Loop execution patterns.", icon: "data_loops.png" },
    data_strings: { item_id: 15, name: "Data Stone: Strings", desc: "String manipulation data.", icon: "data_strings.png" },
    data_numbers: { item_id: 16, name: "Data Stone: Numbers", desc: "Numeric processing data.", icon: "data_numbers.png" },
    data_functions: { item_id: 17, name: "Data Stone: Functions", desc: "Function architecture.", icon: "data_functions.png" },
    data_objects: { item_id: 18, name: "Data Stone: Objects", desc: "Object-oriented constructs.", icon: "data_objects.png" },
    data_arrays: { item_id: 19, name: "Data Stone: Arrays", desc: "Array data structures.", icon: "data_arrays.png" },
    data_dates: { item_id: 20, name: "Data Stone: Dates", desc: "Time and date handling.", icon: "data_dates.png" },
    data_sets: { item_id: 21, name: "Data Stone: Sets", desc: "Set-based data models.", icon: "data_sets.png" },
    data_maps: { item_id: 22, name: "Data Stone: Maps", desc: "Key-value mappings.", icon: "data_maps.png" },
    data_math: { item_id: 23, name: "Data Stone: Math", desc: "Advanced math utilities.", icon: "data_math.png" },
    data_types: { item_id: 24, name: "Data Stone: Data Types", desc: "Primitive and complex types.", icon: "data_types.png" },

    // -------------------------
    // STORY ITEMS
    // -------------------------
    broken_locket: {
      item_id: 30,
      name: "Broken Locket",
      desc: "A damaged locket with sentimental value.",
      icon: "broken_locket.png"
    },
    elysia_hq_keycard: {
      item_id: 31,
      name: "Elysia's Headquarter Keycard",
      desc: "Grants access to Elysia’s headquarters. Don't snoop around.",
      icon: "elysia_keycard.png"
    },
    academy_id: {
      item_id: 32,
      name: "Academy ID",
      desc: "Official identification for Orin's Academy.",
      icon: "academy_id.png"
    },
    guild_id: {
      item_id: 33,
      name: "Guild ID",
      desc: "Membership card for Kaelen's Guild.",
      icon: "guild_id.png"
    },
    library_id: {
      item_id: 34,
      name: "Library ID",
      desc: "Access card for restricted archives. Only Selena trusts you to have this.",
      icon: "library_id.png"
    },
    mira_hairpin: {
      item_id: 35,
      name: "Mira's Diamond Hairpin",
      desc: "A beautifully crafted diamond hairpin. Mira teases you a lot if you return it.",
      icon: "mira_hairpin.png"
    },
    mocha_coffee: {
      item_id: 36,
      name: "Mocha Coffee",
      desc: "A warm cup of coffee with a rich aroma. A trade item.",
      icon: "mocha_coffee.png"
    },
    sword_of_bane: {
      item_id: 37,
      name: "Sword of Bane",
      desc: "A weapon infused with OOP code, but it is a fake one. A trade item.",
      icon: "sword_of_bane.png"
    },
    futuristic_eyepiece: {
      item_id: 38,
      name: "Futuristic Eyepiece",
      desc: "Legends say it lets you see the power level of your enemies. A trade item.",
      icon: "futuristic_eyepiece.png"
    },
    novelty_glasses: {
      item_id: 39,
      name: "Novelty Glasses",
      desc: "Stylish but questionable fashion choice. A trade item.",
      icon: "novelty_glasses.png"
    },
    chocolate_coin: {
      item_id: 40,
      name: "Chocolate Coin",
      desc: "A novelty chocolate coin, but it tastes bland. A trade item.",
      icon: "chocolate_coin.png"
    },
    homerun_bat: {
      item_id: 41,
      name: "Homerun Baseball Bat",
      desc: "A perfect bat rumored to score you homeruns with ease. A trade item.",
      icon: "homerun_bat.png"
    },
    coding_for_dummies: {
      item_id: 42,
      name: "Coding for Dummies",
      desc: "Surprisingly useful beginner book. A trade item.",
      icon: "coding_for_dummies.png"
    },
    hookshot_upgrade: {
      item_id: 43,
      name: "Hookshot Upgrade",
      desc: "A very high quality cable made for the hookshot. Bring it to Kaelen to upgrade your hookshot.",
      icon: "hookshot_upgrade.png"
    },
    corruption_token: {
      item_id: 44,
      name: "Corruption Token",
      desc: "An unstable token for accessing the Deep Web with the Git Terminal. Handle with care.",
      icon: "/codequest-game/public/assets/icons/item/corruption_token.png"
    },
    jscriptoria_token: {
      item_id: 45,
      name: "J.Scriptoria Token",
      desc: "A token for accessing J.Scriptoria City easily with the Git Terminal.",
      icon: "jscriptoria_token.png"
    },
    north_token: {
      item_id: 46,
      name: "North Outskirts Token",
      desc: "A token for accessing the North Outskirts easily with the Git Terminal.",
      icon: "north_token.png"
    },
    south_token: {
      item_id: 47,
      name: "South Outskirts Token",
      desc: "A token for accessing the South Outskirts easily with the Git Terminal.",
      icon: "south_token.png"
    },
    east_token: {
      item_id: 48,
      name: "East Outskirts Token",
      desc: "A token for accessing the North Outskirts easily with the Git Terminal.",
      icon: "east_token.png"
    },
    west_token: {
      item_id: 49,
      name: "West Outskirts Token",
      desc: "A token for accessing the West Outskirts easily with the Git Terminal.",
      icon: "west_token.png"
    },
    codexus_token: {
      item_id: 50,
      name: "Codexus Monolith Token",
      desc: "A token for accessing the Codexus Monolith easily with the Git Terminal.",
      icon: "east_token.png"
    },
    git_token: {
      item_id: 51,
      name: "Git Tokens",
      desc: "A couple of gold tokens that allows you to activate Git Terminals.",
      icon: "git_token.png"
    }
  },

  cons: {
    health_pills: { 
      item_id: 100, 
      name: "Health Pills", 
      desc: "Restores a small amount of HP.", 
      icon: "health_pills.png", 
      max: 99 
    },
    health_pod: { 
      item_id: 101, 
      name: "Health Pod", 
      desc: "Restores moderate HP.", 
      icon: "health_pod.png", 
      max: 99 
    },
    medkit: { 
      item_id: 102, 
      name: "Medkit", 
      desc: "Restores a large amount of HP.", 
      icon: "medkit.png", 
      max: 99 
    },
    energy_pills: { 
      item_id: 103, 
      name: "Energy Pills", 
      desc: "Restores small Energy.", 
      icon: "energy_pills.png", 
      max: 99 
    },
    energy_drink: { 
      item_id: 104, 
      name: "Energy Drink", 
      desc: "Restores moderate Energy.", 
      icon: "energy_drink.png", 
      max: 99 
    },
    energy_vial: { 
      item_id: 105, 
      name: "Energy Vial", 
      desc: "Restores large Energy.", 
      icon: "energy_vial.png", 
      max: 99 
    },
    revitalization_vial: { 
      item_id: 106, 
      name: "Revitalization Vial", 
      desc: "Fully restores HP & Energy.", 
      icon: "revitalization_vial.png", 
      max: 99 
    },
    flashbang: { 
      item_id: 107, 
      name: "Flashbang", 
      desc: "Blind the bugs and escape from battle immediately.", 
      icon: "flashbang.png", 
      max: 99 
    },
    adrenaline: { 
      item_id: 108, 
      name: "Adrenaline", 
      desc: "Give 30% HP and slows time during debugging.", 
      icon: "adrenaline.png", 
      max: 99 
    }
  }
};

export default inventoryData;

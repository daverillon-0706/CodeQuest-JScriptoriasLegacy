const questsData = {
  active: {
    main: {
      "find_shard": {
        title: "Find the Lost Shard",
        desc: "Retrieve the shard from the northern outskirts.",
        reward: "50 XP",
        icon: "shard.png"
      }
    },
    side: {
      "deliver_letter": {
        title: "Deliver the Letter",
        desc: "Give the love letter to the intended recipient.",
        reward: "10 Coins",
        icon: "letter.png"
      }
    }
  },
  completed: {
    main: {
      "intro_tutorial": {
        title: "Complete Tutorial",
        desc: "Finish the introductory tutorial.",
        reward: "Starter Pack",
        icon: "tutorial.png"
      }
    },
    side: {}
  }
};

export default questsData;

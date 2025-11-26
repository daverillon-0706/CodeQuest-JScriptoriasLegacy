// src/ui/data/lessonsData.js

const lessonsData = {
  basics: {
    "Introduction to Coding": [
      `Coding is the process of giving instructions to a computer using a programming language.`,
      `In this world, coding is also how energy flows and interacts with the city's systems.`,
      `As you progress, you'll learn how even simple commands can shape the digital environment.`
    ],

    "Understanding Variables": [
      `A variable is a container that stores information.`,
      `Think of it like a labeled box that can hold numbers, text, or other data.`,
      `Variables are essential in nearly all programming tasks.`
    ],

    "Functions & Commands": [
      `Functions are reusable blocks of code that perform a specific task.`,
      `In J.Scriptoria, many city systems are built entirely from layered functions.`,
      `You will create and call functions frequently in debugging missions.`
    ]
  },

  javascript: {
    "What are Data Types?": [
      `JavaScript has several data types such as strings, numbers, booleans, arrays, and objects.`,
      `Understanding them helps you write accurate and bug-free code.`,
      `Mastering data types is essential for effective debugging.`
    ],

    "Conditionals (if/else)": [
      `Conditionals let your code make decisions.`,
      `They help the program react differently depending on the situation.`,
      `Many game mechanics — from enemy AI to item interaction — use conditionals heavily.`
    ],

    "Loops": [
      `Loops allow you to repeat actions multiple times.`,
      `Common loops in JavaScript include "for", "while", and "forEach".`,
      `Use loops efficiently to avoid performance issues such as infinite loops.`
    ]
  },

  phaser: {
    "What is Phaser?": [
      `Phaser is a JavaScript framework for building 2D games.`,
      `It handles graphics, physics, animations, input, and more.`,
      `Your entire adventure runs on Phaser — including scenes, collisions, and movement.`
    ],

    "Scenes": [
      `Scenes are independent sections of your game, such as maps or menus.`,
      `Each scene handles its own logic, assets, and rendering.`,
      `Switching scenes allows CodeQuest to move between locations seamlessly.`
    ],

    "Sprites & Animations": [
      `Sprites are graphical objects displayed in the game world.`,
      `Animations are sequences of frames that bring sprites to life.`,
      `Understanding sprite handling is key to controlling your character and enemies.`
    ]
  }
};

// Export for use in LessonsManager
export default lessonsData;

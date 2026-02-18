export const RiftChallenges = {

  // =========================
  // 🧩 SYNTAX RIFT
  // =========================
  Syntax: [
    {
      instruction: "Fix the syntax error",
      starterCode: "let x = ;",
      validate: (code) => {
        try {
          new Function(code);
          return code.includes("let x");
        } catch {
          return false;
        }
      }
    },
    {
      instruction: "Fix the missing parenthesis",
      starterCode: "console.log('Hello';",
      validate: (code) => {
        try {
          new Function(code);
          return code.includes("console.log");
        } catch {
          return false;
        }
      }
    },
    {
      instruction: "Fix the missing bracket",
      starterCode: "if(true) console.log('Hi');",
      validate: (code) => code.includes("{") && code.includes("}")
    },
    {
      instruction: "Fix the broken function syntax",
      starterCode: "function greet( { console.log('Hi'); }",
      validate: (code) => {
        try {
          new Function(code);
          return code.includes("function");
        } catch {
          return false;
        }
      }
    },
    {
      instruction: "Fix all syntax issues",
      starterCode: "for(let i=0;i<3;i++ console.log(i)",
      validate: (code) => {
        try {
          new Function(code);
          return true;
        } catch {
          return false;
        }
      }
    }
  ],

  // =========================
  // 🔤 DATA TYPES RIFT
  // =========================
  DataTypes: [
    {
      instruction: "Create a string variable named text",
      starterCode: "",
      validate: (code) => code.includes('"') || code.includes("'")
    },
    {
      instruction: "Create a number variable num = 5",
      starterCode: "",
      validate: (code) => code.includes("5")
    },
    {
      instruction: "Create a boolean variable isTrue",
      starterCode: "",
      validate: (code) => code.includes("true") || code.includes("false")
    },
    {
      instruction: "Create an array variable list",
      starterCode: "",
      validate: (code) => code.includes("[") && code.includes("]")
    },
    {
      instruction: "Create an object variable user",
      starterCode: "",
      validate: (code) => code.includes("{") && code.includes("}")
    }
  ],

  // =========================
  // 📦 VARIABLES RIFT
  // =========================
  Variables: [
    {
      instruction: "Declare variable a = 5",
      starterCode: "",
      validate: (code) => {
        try {
          const fn = new Function(`${code}; return a === 5;`);
          return fn();
        } catch {
          return false;
        }
      }
    },
    {
      instruction: "Declare b = 10",
      starterCode: "",
      validate: (code) => code.includes("b")
    },
    {
      instruction: "Create c = a + b",
      starterCode: "",
      validate: (code) => code.includes("a + b")
    },
    {
      instruction: "Change value of a to 20",
      starterCode: "",
      validate: (code) => code.includes("20")
    },
    {
      instruction: "Log variable c",
      starterCode: "",
      validate: (code) => code.includes("console.log")
    }
  ],

  // =========================
  // ➗ OPERATORS RIFT
  // =========================
  Operators: [
    {
      instruction: "Add 2 + 3",
      starterCode: "",
      validate: (code) => code.includes("+")
    },
    {
      instruction: "Subtract 5 - 1",
      starterCode: "",
      validate: (code) => code.includes("-")
    },
    {
      instruction: "Multiply 3 * 3",
      starterCode: "",
      validate: (code) => code.includes("*")
    },
    {
      instruction: "Divide 10 / 2",
      starterCode: "",
      validate: (code) => code.includes("/")
    },
    {
      instruction: "Use modulus 10 % 3",
      starterCode: "",
      validate: (code) => code.includes("%")
    }
  ],

  // =========================
  // 🔀 CONDITIONS RIFT
  // =========================
  Conditions: [
    {
      instruction: "Create an if statement",
      starterCode: "",
      validate: (code) => code.includes("if")
    },
    {
      instruction: "Add else condition",
      starterCode: "",
      validate: (code) => code.includes("else")
    },
    {
      instruction: "Check if x > 5",
      starterCode: "",
      validate: (code) => code.includes("> 5")
    },
    {
      instruction: "Use === operator",
      starterCode: "",
      validate: (code) => code.includes("===")
    },
    {
      instruction: "Create full if/else block",
      starterCode: "",
      validate: (code) =>
        code.includes("if") && code.includes("else")
    }
  ],

  // =========================
  // 🧮 ARRAYS RIFT
  // =========================
  Arrays: [
    {
      instruction: "Create an array numbers",
      starterCode: "",
      validate: (code) => code.includes("[")
    },
    {
      instruction: "Add 3 values inside array",
      starterCode: "",
      validate: (code) =>
        code.split(",").length >= 3
    },
    {
      instruction: "Access first element",
      starterCode: "",
      validate: (code) => code.includes("[0]")
    },
    {
      instruction: "Use push() method",
      starterCode: "",
      validate: (code) => code.includes("push")
    },
    {
      instruction: "Loop through array",
      starterCode: "",
      validate: (code) =>
        code.includes("for") || code.includes("forEach")
    }
  ],

  // =========================
  // 🧠 FUNCTIONS RIFT
  // =========================
  Functions: [
    {
      instruction: "Create function greet()",
      starterCode: "",
      validate: (code) => code.includes("function")
    },
    {
      instruction: "Add parameter name",
      starterCode: "",
      validate: (code) => code.includes("(") && code.includes(")")
    },
    {
      instruction: "Return a value",
      starterCode: "",
      validate: (code) => code.includes("return")
    },
    {
      instruction: "Call the function",
      starterCode: "",
      validate: (code) => code.includes("greet(")
    },
    {
      instruction: "Log function result",
      starterCode: "",
      validate: (code) => code.includes("console.log")
    }
  ]

};

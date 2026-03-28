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
    instruction: "Fix the variable so it becomes a string",
    starterCode: "let text = 123;",
    validate: (code) => {
      try {
        const fn = new Function(`${code}; return typeof text === 'string';`);
        return fn();
      } catch {
        return false;
      }
    }
  },
  {
    instruction: "Fix num so it is a number",
    starterCode: "let num = '5';",
    validate: (code) => {
      try {
        const fn = new Function(`${code}; return typeof num === 'number';`);
        return fn();
      } catch {
        return false;
      }
    }
  },
  {
    instruction: "Fix isTrue so it is a boolean",
    starterCode: "let isTrue = 'true';",
    validate: (code) => {
      try {
        const fn = new Function(`${code}; return typeof isTrue === 'boolean';`);
        return fn();
      } catch {
        return false;
      }
    }
  },
  {
    instruction: "Fix list so it becomes an array",
    starterCode: "let list = '1,2,3';",
    validate: (code) => {
      try {
        const fn = new Function(`${code}; return Array.isArray(list);`);
        return fn();
      } catch {
        return false;
      }
    }
  },
  {
    instruction: "Fix user so it becomes an object",
    starterCode: "let user = 'John';",
    validate: (code) => {
      try {
        const fn = new Function(`${code}; return typeof user === 'object' && !Array.isArray(user);`);
        return fn();
      } catch {
        return false;
      }
    }
  }
],

// =========================
// 📦 VARIABLES RIFT
// =========================
Variables: [
  {
    instruction: "Fix the declaration of variable a",
    starterCode: "a = 5;",
    validate: (code) => {
      try {
        const fn = new Function(`${code}; return typeof a !== 'undefined' && a === 5;`);
        return fn();
      } catch {
        return false;
      }
    }
  },
  {
    instruction: "Fix b so it equals 10",
    starterCode: "let b = '10';",
    validate: (code) => {
      try {
        const fn = new Function(`${code}; return b === 10;`);
        return fn();
      } catch {
        return false;
      }
    }
  },
  {
    instruction: "Fix c so it equals a + b",
    starterCode: "let a = 5; let b = 10; let c = a - b;",
    validate: (code) => {
      try {
        const fn = new Function(`${code}; return c === 15;`);
        return fn();
      } catch {
        return false;
      }
    }
  },
  {
    instruction: "Fix the reassignment of a to 20",
    starterCode: "const a = 5; a = 20;",
    validate: (code) => {
      try {
        const fn = new Function(`${code}; return a === 20;`);
        return fn();
      } catch {
        return false;
      }
    }
  },
  {
    instruction: "Fix the log statement to print c",
    starterCode: "let c = 15; console.log(d);",
    validate: (code) => {
      try {
        new Function(code);
        return code.includes("console.log(c)");
      } catch {
        return false;
      }
    }
  }
],

// =========================
// ➗ OPERATORS RIFT
// =========================
Operators: [
  {
    instruction: "Fix the addition",
    starterCode: "let result = 2 - 3;",
    validate: (code) => {
      try {
        const fn = new Function(`${code}; return result === 5;`);
        return fn();
      } catch {
        return false;
      }
    }
  },
  {
    instruction: "Fix the subtraction",
    starterCode: "let result = 5 + 1;",
    validate: (code) => {
      try {
        const fn = new Function(`${code}; return result === 4;`);
        return fn();
      } catch {
        return false;
      }
    }
  },
  {
    instruction: "Fix the multiplication",
    starterCode: "let result = 3 + 3;",
    validate: (code) => {
      try {
        const fn = new Function(`${code}; return result === 9;`);
        return fn();
      } catch {
        return false;
      }
    }
  },
  {
    instruction: "Fix the division",
    starterCode: "let result = 10 * 2;",
    validate: (code) => {
      try {
        const fn = new Function(`${code}; return result === 5;`);
        return fn();
      } catch {
        return false;
      }
    }
  },
  {
    instruction: "Fix the modulus",
    starterCode: "let result = 10 / 3;",
    validate: (code) => {
      try {
        const fn = new Function(`${code}; return result === 1;`);
        return fn();
      } catch {
        return false;
      }
    }
  }
],

// =========================
// 🔀 CONDITIONS RIFT
// =========================
Conditions: [
  {
    instruction: "Fix the if condition",
    starterCode: "// Make the result as true let x = 10; if (x < 5) { result = true; }",
    validate: (code) => {
      try {
        const fn = new Function(`${code}; return result === true;`);
        return fn();
      } catch {
        return false;
      }
    }
  },
  {
    instruction: "Fix the comparison operator",
    starterCode: "let x = 5; if (x = 5) { result = true; }",
    validate: (code) => {
      try {
        const fn = new Function(`${code}; return result === true;`);
        return fn();
      } catch {
        return false;
      }
    }
  },
  {
    instruction: "Fix the else block",
    starterCode: "let x = 1; if (x > 5) { result = true; } else { result = false; }",
    validate: (code) => {
      try {
        const fn = new Function(`${code}; return result === true;`);
        return fn();
      } catch {
        return false;
      }
    }
  },
  {
    instruction: "Fix strict equality",
    starterCode: "let x = '5'; if (x == 5) { result = true; }",
    validate: (code) => {
      try {
        new Function(code);
        return code.includes("===");
      } catch {
        return false;
      }
    }
  },
  {
    instruction: "Fix the full if/else flow",
    starterCode: "let x = 10; if (x < 5) result = false;",
    validate: (code) => {
      try {
        const fn = new Function(`${code}; return typeof result !== 'undefined';`);
        return fn();
      } catch {
        return false;
      }
    }
  }
],

// =========================
// 🧮 ARRAYS RIFT
// =========================
Arrays: [
  {
    instruction: "Fix the array declaration",
    starterCode: "let numbers = 1,2,3;",
    validate: (code) => {
      try {
        const fn = new Function(`${code}; return Array.isArray(numbers);`);
        return fn();
      } catch {
        return false;
      }
    }
  },
  {
    instruction: "Fix array access",
    starterCode: "let arr = [10,20,30]; let first = arr(0);",
    validate: (code) => {
      try {
        const fn = new Function(`${code}; return first === 10;`);
        return fn();
      } catch {
        return false;
      }
    }
  },
  {
    instruction: "Fix push usage",
    starterCode: "let arr = [1,2]; arr.push = 3;",
    validate: (code) => {
      try {
        const fn = new Function(`${code}; return arr.length === 3;`);
        return fn();
      } catch {
        return false;
      }
    }
  },
  {
    instruction: "Fix loop through array",
    starterCode: "let arr = [1,2,3]; for (let i = 0; i > arr.length; i++) {}",
    validate: (code) => {
      try {
        new Function(code);
        return code.includes("< arr.length");
      } catch {
        return false;
      }
    }
  },
  {
    instruction: "Fix array length usage",
    starterCode: "let arr = [1,2,3]; let size = arr.size;",
    validate: (code) => {
      try {
        const fn = new Function(`${code}; return size === 3;`);
        return fn();
      } catch {
        return false;
      }
    }
  }
],

// =========================
// 🧠 FUNCTIONS RIFT
// =========================
Functions: [
  {
    instruction: "Fix the function declaration",
    starterCode: "greet() { return 'Hi'; }",
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
    instruction: "Fix missing return",
    starterCode: "function sum(a,b){ a+b; }",
    validate: (code) => {
      try {
        const fn = new Function(`${code}; return sum(2,3) === 5;`);
        return fn();
      } catch {
        return false;
      }
    }
  },
  {
    instruction: "Fix arrow function syntax",
    starterCode: "const add = (a,b) a+b;",
    validate: (code) => {
      try {
        const fn = new Function(`${code}; return add(2,3) === 5;`);
        return fn();
      } catch {
        return false;
      }
    }
  },
  {
    instruction: "Fix function call",
    starterCode: "function greet(){ return 'Hi'; } greet;",
    validate: (code) => {
      try {
        new Function(code);
        return code.includes("greet()");
      } catch {
        return false;
      }
    }
  },
  {
    instruction: "Fix parameter usage",
    starterCode: "function say(name){ return 'Hi'; }",
    validate: (code) => {
      try {
        const fn = new Function(`${code}; return say('Dave') === 'Hi Dave';`);
        return fn();
      } catch {
        return false;
      }
    }
  }
]

};

export const LESSON_DATA = {

  syntax: {
    displayName: "JavaScript Syntax",
    books: [
      {
        key: "intro",
        title: "Introduction to JavaScript",
        text: "JavaScript is a versatile programming language primarily used to make web pages interactive. It allows developers to manipulate the content, structure, and style of a website dynamically, and it runs directly in web browsers as well as on servers using environments like Node.js.",
        locked: true,
      },
      {
        key: "basicSyntax",
        title: "Basic Syntax",
        text: "In JavaScript, statements typically end with semicolons to separate them. While semicolons are sometimes optional due to automatic semicolon insertion, using them consistently can help avoid unexpected behavior. JavaScript is case-sensitive, and whitespace is generally ignored, making the code more readable.",
        locked: true
      },
      {
        key: "compiler",
        title: "How JavaScript Runs",
        text: "JavaScript is an interpreted language, which means that engines like Google's V8 or Mozilla's SpiderMonkey execute the code directly without a prior compilation step. These engines read the code, optimize it, and execute it on the fly, allowing for fast and dynamic behavior in both browsers and server environments.",
        locked: true
      },
      {
        key: "consoleLog",
        title: "Using console.log()",
        text: "The `console.log()` function outputs information to the browser's console, which is a powerful tool for debugging. It helps developers inspect variable values, track code execution, and diagnose problems without affecting the webpage's UI.",
        locked: true
      }
    ]
  },

  datatypes: {
    displayName: "JavaScript Data Types",
    books: [
      {
        key: "primitiveTypes",
        title: "Primitive Types",
        text: "Primitive types are the simplest forms of data in JavaScript. They include numbers, strings, booleans, null, undefined, and symbols. These types are immutable, meaning their values cannot be changed once created.",
        locked: true
      },
      {
        key: "referenceTypes",
        title: "Reference Types",
        text: "Reference types store collections of values or more complex objects. Examples include arrays, functions, and objects. Unlike primitives, reference types are mutable, and variables hold a reference to the memory location of the object rather than the object itself.",
        locked: true
      }
    ]
  },

  variables: {
    displayName: "JavaScript Variables",
    books: [
      {
        key: "varLetConst",
        title: "var, let, and const",
        text: "`var`, `let`, and `const` are used to declare variables in JavaScript. `var` is function-scoped and can be redeclared, `let` is block-scoped and cannot be redeclared in the same scope, and `const` creates a constant value that cannot be reassigned. Choosing the right keyword improves code safety and readability.",
        locked: true
      }
    ]
  },

  operators: {
    displayName: "JavaScript Operators",
    books: [
      {
        key: "arithmetic",
        title: "Arithmetic Operators",
        text: "Arithmetic operators perform mathematical operations on numbers. These include addition (+), subtraction (-), multiplication (*), division (/), and modulo (%), which gives the remainder of a division.",
        locked: true
      },
      {
        key: "comparison",
        title: "Comparison Operators",
        text: "Comparison operators are used to compare values and return a boolean result (`true` or `false`). Common operators include equal (==), strict equal (===), not equal (!=), greater than (>), and less than (<).",
        locked: true
      }
    ]
  },

  conditions: {
    displayName: "JavaScript Conditions",
    books: [
      {
        key: "ifElse",
        title: "if / else Statements",
        text: "`if` and `else` statements allow code to execute conditionally. The `if` block runs if a condition evaluates to true, and the optional `else` block runs if the condition is false. This is essential for decision-making in programs.",
        locked: true
      },
      {
        key: "switchcase",
        title: "Switch Statements",
        text: "A `switch` statement executes one block of code among many options based on the value of an expression. Each `case` represents a possible value, and the `default` case runs if no matches are found.",
        locked: true
      }
    ]
  },

  arrays: {
    displayName: "JavaScript Arrays",
    books: [
      {
        key: "arrayBasics",
        title: "Array Basics",
        text: "Arrays are ordered collections of values in JavaScript. They can store multiple items of any type, including other arrays. Arrays are zero-indexed, meaning the first element is at index 0.",
        locked: true
      },
      {
        key: "arrayMethods",
        title: "Common Array Methods",
        text: "JavaScript arrays come with built-in methods like `push()` to add elements, `pop()` to remove the last element, `shift()` and `unshift()` for the start of the array, and `map()`, `filter()`, and `reduce()` for advanced data manipulation.",
        locked: true
      }
    ]
  },

  functions: {
    displayName: "JavaScript Functions",
    books: [
      {
        key: "functionBasics",
        title: "Function Basics",
        text: "Functions are reusable blocks of code designed to perform a specific task. They can accept inputs (parameters) and return outputs. Declaring functions improves modularity and reduces code repetition.",
        locked: true
      },
      {
        key: "arrowFunctions",
        title: "Arrow Functions",
        text: "Arrow functions provide a concise syntax for writing functions. They are especially useful for short functions and callbacks. Unlike traditional functions, arrow functions do not have their own `this` context.",
        locked: true
      }
    ]
  }

};
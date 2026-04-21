const quizData = {
  syntax: [
    { type: "multiple", question: "What does console.log() do?", options: ["Deletes variables", "Prints output to console", "Compiles the code", "Stops execution"], answer: 1 },
    { type: "multiple", question: "Which symbol ends a JavaScript statement?", options: [";", ":", ".", ","], answer: 0 },
    { type: "multiple", question: "JavaScript is executed in the ____. ", options: ["Compiler only", "Browser", "Database", "GPU"], answer: 1 },
    { type: "multiple", question: "Which is valid variable naming?", options: ["1var", "var-name", "myVar", "var name"], answer: 2 },
    { type: "compiler", question: "Fix the code to print 'Hello World'", starterCode: `console.log("Hello World")`, expectedOutput: "Hello World" }
  ],

  datatypes: [
    { type: "multiple", question: "Which of the following is a primitive type?", options: ["Object", "Array", "String", "Function"], answer: 2 },
    { type: "multiple", question: "Arrays belong to which type?", options: ["Primitive", "Reference", "Boolean", "Undefined"], answer: 1 },
    { type: "multiple", question: "What type is null?", options: ["Primitive", "Reference", "Object", "Undefined"], answer: 0 },
    { type: "multiple", question: "Which type represents true or false?", options: ["Boolean", "Number", "String", "Array"], answer: 0 },
    { type: "compiler", question: "Create a variable with a string 'JavaScript' and print it using console.log()", starterCode: `// Your code here`, expectedOutput: "JavaScript" }
  ],

  variables: [
    { type: "multiple", question: "Which keyword creates a block-scoped variable?", options: ["var", "let", "const", "global"], answer: 1 },
    { type: "multiple", question: "Which keyword creates a constant value?", options: ["var", "let", "const", "define"], answer: 2 },
    { type: "multiple", question: "Can a const variable be reassigned?", options: ["Yes", "No"], answer: 1 },
    { type: "multiple", question: "Which variable is function-scoped?", options: ["let", "const", "var", "all"], answer: 2 },
    { type: "compiler", question: "Declare a let variable called 'score', assign 100 and print it using console.log()", starterCode: `// Your code here`, expectedOutput: "100" }
  ],

  operators: [
    { type: "multiple", question: "Which operator adds two numbers?", options: ["-", "+", "*", "/"], answer: 1 },
    { type: "multiple", question: "What does the % operator do?", options: ["Divides numbers", "Finds remainder", "Multiplies numbers", "Compares values"], answer: 1 },
    { type: "multiple", question: "Which operator checks equality without type conversion?", options: ["==", "=", "===", "!="], answer: 2 },
    { type: "multiple", question: "Which operator subtracts two numbers?", options: ["-", "+", "*", "/"], answer: 0 },
    { type: "compiler", question: "Write an expression that adds 5 + 7 and print the result using console.log()", starterCode: `// Your code here`, expectedOutput: "12" }
  ],

  conditions: [
    { type: "multiple", question: "Which keyword is used for conditional logic?", options: ["loop", "switch", "if", "break"], answer: 2 },
    { type: "multiple", question: "What does a switch statement compare?", options: ["Boolean only", "Multiple values", "Function names", "Objects only"], answer: 1 },
    { type: "multiple", question: "Which keyword executes an alternate path when 'if' is false?", options: ["else", "then", "case", "default"], answer: 0 },
    { type: "multiple", question: "What operator checks 'greater than'?", options: ["<", ">", "==", "!="], answer: 1 },
    { type: "compiler", question: "Write an if statement that prints 'Yes' if x is 10", starterCode: `let x = 10;\n// Your code here`, expectedOutput: "Yes" }
  ],

  arrays: [
    { type: "multiple", question: "How do you access the first element in an array?", options: ["array[1]", "array[0]", "array.first()", "array[-1]"], answer: 1 },
    { type: "multiple", question: "Which method adds an element to the end of an array?", options: ["pop()", "shift()", "push()", "add()"], answer: 2 },
    { type: "multiple", question: "Which method removes the first element from an array?", options: ["pop()", "shift()", "push()", "unshift()"], answer: 1 },
    { type: "multiple", question: "Arrays are ____ indexed.", options: ["One", "Zero", "Negative", "Random"], answer: 1 },
    { type: "compiler", question: "Create an array with numbers 1, 2, 3 and print it using console.log()", starterCode: `// Your code here`, expectedOutput: "[1,2,3]" }
  ],

  functions: [
    { type: "multiple", question: "What is a function used for?", options: ["Store data permanently", "Reusable block of code", "Delete variables", "Style webpages"], answer: 1 },
    { type: "multiple", question: "Arrow functions do NOT have their own ____.", options: ["parameters", "return", "this", "arguments"], answer: 2 },
    { type: "multiple", question: "Which keyword declares a function?", options: ["func", "function", "lambda", "def"], answer: 1 },
    { type: "multiple", question: "Functions can accept ____.", options: ["parameters", "loops", "conditions", "objects only"], answer: 0 },
    { type: "compiler", question: "Fix the function to return 10 and print it using console.log()", starterCode: `function add() { return 5 + 5 }`, expectedOutput: "10" }
  ]
};

export default quizData;
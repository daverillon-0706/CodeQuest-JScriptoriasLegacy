const quizData = {
  syntax: [
    {
      type: "multiple",
      question: "What does console.log() do?",
      options: [
        "Deletes variables",
        "Prints output to console",
        "Compiles the code",
        "Stops execution"
      ],
      answer: 1
    },
    {
      type: "multiple",
      question: "Which symbol ends a JavaScript statement?",
      options: [";", ":", ".", ","],
      answer: 0
    },
    {
      type: "multiple",
      question: "JavaScript is executed in the ____.",
      options: ["Compiler only", "Browser", "Database", "GPU"],
      answer: 1
    },
    {
      type: "multiple",
      question: "Which is valid variable naming?",
      options: ["1var", "var-name", "myVar", "var name"],
      answer: 2
    },
    {
      type: "compiler",
      question: "Fix the code to print 'Hello World'",
      starterCode: `console.log("Hello World")`,
      expectedOutput: "Hello World"
    }
  ]
};

export default quizData;
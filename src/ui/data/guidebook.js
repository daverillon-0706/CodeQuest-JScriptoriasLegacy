export const GUIDEBOOK = {
  syntax: [
    {
      title: "Basic Output",
      html: `<p id="output"></p>`,
      css: ``,
      js: `
document.getElementById("output").textContent = "Hello World!";
      `
    }
  ],

  datatypes: [
    {
      title: "String and Number",
      html: `<p id="result"></p>`,
      css: ``,
      js: `
let name = "Dave";
let age = 20;

document.getElementById("result").textContent =
  name + " is " + age + " years old.";
      `
    }
  ],

  variables: [
    {
      title: "Using Variables",
      html: `<p id="var"></p>`,
      css: ``,
      js: `
let x = 5;
let y = 10;

document.getElementById("var").textContent = x + y;
      `
    }
  ],

  operators: [
    {
      title: "Math Operators",
      html: `<p id="math"></p>`,
      css: ``,
      js: `
let result = 10 + 5 * 2;

document.getElementById("math").textContent = result;
      `
    }
  ],

  conditions: [
    {
      title: "If Statement",
      html: `<p id="cond"></p>`,
      css: ``,
      js: `
let score = 80;

if (score >= 75) {
  document.getElementById("cond").textContent = "Passed";
} else {
  document.getElementById("cond").textContent = "Failed";
}
      `
    }
  ],

  arrays: [
    {
      title: "Array Access",
      html: `<p id="arr"></p>`,
      css: ``,
      js: `
let fruits = ["Apple", "Banana", "Mango"];

document.getElementById("arr").textContent = fruits[1];
      `
    }
  ],

  functions: [
    {
      title: "Function Example",
      html: `<button onclick="greet()">Click Me</button>
<p id="msg"></p>`,
      css: ``,
      js: `
function greet() {
  document.getElementById("msg").textContent = "Hello from function!";
}
      `
    }
  ]
};
import GameState, { DEFAULT_PLAYER_TEMPLATE } from "./GameState.js";
import { addSaveToken, verifySaveToken } from "./utils/saveToken.js";

// -------------------
// ELEMENTS
// -------------------
const nameInput  = document.getElementById("playerName");
const newGameBtn = document.getElementById("newGameBtn");
const continueBtn = document.getElementById("continueBtn");
const fileInput   = document.getElementById("saveFileInput");

// -------------------
// TOKEN GENERATOR
// -------------------
function generateToken(){
  return crypto.randomUUID() + "-" + Date.now();
}

const SAVE_KEY = "codequest_player";
// ===============================
// NEW GAME
// ===============================
newGameBtn.addEventListener("click", () => {

  const name = nameInput.value.trim();
  if(!name) return alert("Enter your name first.");

  const token = generateToken();

  const newPlayer = {
    ...structuredClone(DEFAULT_PLAYER_TEMPLATE),
    name,
    token
  };

  GameState.player = newPlayer;

  localStorage.setItem(SAVE_KEY, JSON.stringify(newPlayer));

  const wrapped = addSaveToken(newPlayer);

  const blob = new Blob(
    [JSON.stringify(wrapped, null, 2)],
    { type:"application/json" }
  );

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${name}_codequest_save.json`;
  a.click();

  alert("Save file created! Keep it safe.");
  window.location.href = "/game.html";
});

// ===============================
// CONTINUE GAME
// ===============================
continueBtn.addEventListener("click", () => {

  const file = fileInput.files[0];
  if(!file) return alert("Select a save file.");

  const reader = new FileReader();

  reader.onload = e => {

    try {
      const data = JSON.parse(e.target.result);

      if(!verifySaveToken(data)){
        alert("Invalid or corrupted save file.");
        return;
      }

      const payload = data.payload;

      GameState.player = payload;

      localStorage.setItem(SAVE_KEY, JSON.stringify(payload));

      alert("Save loaded successfully!");
      window.location.href = "/game.html";

    } catch(err) {
      console.error("Save load error:", err);
      alert("Failed to load save file.");
    }
  };

  reader.readAsText(file);
});


// ===============================
// PARTICLE BACKGROUND
// ===============================
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');

let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
});

class Particle {
  constructor() {
    this.reset();
  }
  reset() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = (Math.random() - 0.5) * 0.5;
    this.size = Math.random() * 2 + 1;
    this.alpha = Math.random() * 0.5 + 0.2;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0 || this.x > width || this.y < 0 || this.y > height) this.reset();
  }
  draw() {
    ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

const particles = [];
for (let i = 0; i < 120; i++) particles.push(new Particle());

function animate() {
  ctx.clearRect(0, 0, width, height);
  particles.forEach(p => {
    p.update();
    p.draw();
  });
  requestAnimationFrame(animate);
}
animate();
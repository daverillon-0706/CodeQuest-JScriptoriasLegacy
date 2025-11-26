// src/scenes/BattleScene.js
// BattleScene.js (Safe, Null-Proof Rewrite)
// NOTE: No citations in canvas. This version guards ALL DOM/battle logic.

export default class BattleScene extends Phaser.Scene {
  constructor() {
    super('BattleScene');

    // ---------------- Player Base Stats ----------------
    this.playerHP = 100;
    this.playerEnergy = 50;
    this.playerExp = 0;

    // Default safe bug placeholder
    this.bug = {
      HP: 1,
      Energy: 100,
      baseDamage: 10,
      offenseDebuff: 0,
      debuffs: [],
      jumbledCode: '// Loading bug...',
      expectedOutput: ''
    };

    this.perkCooldowns = { Passive:false, Attack:false, Defend:false };
  }

  // -------------------------------------------------------------
  // Safe DOM getter
  // -------------------------------------------------------------
  safe(id) {
    return document.getElementById(id) || null;
  }

  // -------------------------------------------------------------
  // Scene Create
  // -------------------------------------------------------------
  create() {
    // Fade in
    this.cameras.main.fadeIn(300, 0, 0, 0);

    // Grab DOM safely
    this.dom = {
      ui: this.safe('battle-ui'),
      playerCode: this.safe('player-code'),
      bugCode: this.safe('bug-code'),
      debugBtn: this.safe('debug-btn'),
      escapeBtn: this.safe('escape-btn'),
      perkBtns: document.querySelectorAll('.perk-btn'),

      playerHP: this.safe('battle-playerHP'),
      playerEnergy: this.safe('battle-playerEnergy'),
      playerExp: this.safe('battle-playerExp'),
      bugHP: this.safe('battle-bugHP'),
      bugEnergy: this.safe('battle-bugEnergy')
    };

    // Create new bug
    this.generateBug();

    // Set UI visible
    if (this.dom.ui) {
      this.dom.ui.classList.remove('hidden');
      this.dom.ui.style.display = 'block';
      this.dom.ui.style.visibility = 'visible';
    }

    // Attach button events
    if (this.dom.debugBtn) {
      this.dom.debugBtn.addEventListener('click', () => this.attemptDebug());
    }

    if (this.dom.escapeBtn) {
      this.dom.escapeBtn.addEventListener('click', () => this.endBattle());
    }

    this.dom.perkBtns.forEach(btn => {
      btn.addEventListener('click', () => this.activatePerk(btn.dataset.perk));
    });

    this.updateStats();

    // Enable debug button when player types
    if (this.dom.playerCode && this.dom.debugBtn) {
      this.dom.playerCode.addEventListener('input', () => {
        const hasText = this.dom.playerCode.value.trim().length > 0;
        this.dom.debugBtn.disabled = !hasText;
      });
    }
  }

  // -------------------------------------------------------------
  // Generate Bug
  // -------------------------------------------------------------
  generateBug() {
    this.bug = {
      HP: 1,
      Energy: 100,
      baseDamage: 10,
      offenseDebuff: 10,
      debuffs: [],
      jumbledCode: this.generateJumbledCode(),
      expectedOutput: '42'
    };

    if (this.dom.bugCode) this.dom.bugCode.textContent = this.bug.jumbledCode;
    return this.bug;
  }

  // -------------------------------------------------------------
  // Jumbled Code
  // -------------------------------------------------------------
  generateJumbledCode() {
    return `function calc() {
 let r = 40
 return r + 2
 }`;
  }

  // -------------------------------------------------------------
  // Attempt Debug
  // -------------------------------------------------------------
  attemptDebug() {
  if (!this.bug || !this.dom.playerCode) return;

  const code = this.dom.playerCode.value.trim();
  let isCorrect = false;

  try {
    // Capture console.log output
    let capturedOutput = '';
    const originalConsoleLog = console.log;
    console.log = (...args) => {
      capturedOutput += args.join(' ') + '\n';
    };

    // Run player code safely
    const playerFunc = new Function(code);
    const returnValue = playerFunc();

    // Restore original console.log
    console.log = originalConsoleLog;

    // Combine return value and captured console.log into a string
    const outputString = String(returnValue ?? '') + '\n' + capturedOutput;

    // Clean string (remove whitespace, extra line breaks)
    const cleanedOutput = outputString.replace(/\s+/g, '');

    // Check against expected output
    if (cleanedOutput.includes(String(this.bug.expectedOutput))) {
      isCorrect = true;
    }

  } catch (err) {
    console.log("Error in player's code:", err);
  }

  if (isCorrect) {
    console.log("%cDEBUG SUCCESS!", "color: lime; font-weight: bold;");
    this.bug.HP = 0;
    this.playerExp += 10;
    this.updateStats();
    this.handleBattleWin();
    return;
  }

  // If we reach here, debug failed → take damage
  const dmg = (this.bug.baseDamage || 0) + (this.bug.offenseDebuff || 0);
  this.playerHP -= dmg;
  this.playerHP = Math.max(0, this.playerHP);
  this.updateStats();

  if (this.playerHP <= 0) {
    this.handleBattleLoss();
    return;
  }

  // Re-enable debug button after short penalty
  this.dom.debugBtn.disabled = true;
  setTimeout(() => {
    this.dom.debugBtn.disabled = false;
  }, 1500);
}


  // -------------------------------------------------------------
  // Activate Perk
  // -------------------------------------------------------------
  activatePerk(type) {
  if (!this.bug) return;
  if (this.perkCooldowns[type]) {
    console.log(`Perk "${type}" clicked but still on cooldown.`);
    return;
  }

  console.log(`Activating perk: ${type}`);

  switch (type) {
    case 'Passive':
      console.log("Passive Perk: +5 Energy");
      this.playerEnergy += 5;
      break;

    case 'Attack':
      console.log("Attack Perk: -5 Bug Offense Debuff");
      this.bug.offenseDebuff = Math.max(0, this.bug.offenseDebuff - 5);
      break;

    case 'Defend':
      console.log("Defend Perk: +5 HP");
      this.playerHP += 5;
      break;
  }

  this.updateStats();
  this.startCooldown(type);
}


  startCooldown(type) {
  console.log(`Perk "${type}" activated — entering cooldown.`);
  this.perkCooldowns[type] = true;

  let remaining = 5;
  console.log(`Cooldown for ${type}: ${remaining} seconds remaining`);

  const interval = setInterval(() => {
    remaining--;
    if (remaining > 0) {
      console.log(`Cooldown for ${type}: ${remaining} seconds remaining`);
    }
  }, 1000);

  setTimeout(() => {
    clearInterval(interval);
    this.perkCooldowns[type] = false;
    console.log(`Perk "${type}" cooldown finished — ready again.`);
  }, 5000);
}


  // -------------------------------------------------------------
  // Update Stats
  // -------------------------------------------------------------
  updateStats() {
    if (this.dom.playerHP) this.dom.playerHP.textContent = this.playerHP;
    if (this.dom.playerEnergy) this.dom.playerEnergy.textContent = this.playerEnergy;
    if (this.dom.playerExp) this.dom.playerExp.textContent = this.playerExp;

    if (this.dom.bugHP) this.dom.bugHP.textContent = this.bug?.HP ?? 0;
    if (this.dom.bugEnergy) this.dom.bugEnergy.textContent = this.bug?.Energy ?? 0;
  }

  // -------------------------------------------------------------
  // End Battle
  // -------------------------------------------------------------
  endBattle() {
    // Clear player code input when battle ends
    if (this.dom.playerCode) this.dom.playerCode.value = '';
    this.cameras.main.fadeOut(300, 0, 0, 0);
    setTimeout(() => {
      if (this.dom.ui) this.dom.ui.style.display = 'none';
      this.scene.start('HQInteriorScene');
    }, 350);
  }


// -------------------------------------------------------------
// Battle Win / Lose Handlers
// -------------------------------------------------------------
handleBattleWin() {
  console.log("%cBATTLE WIN!", "color: lime; font-weight: bold;");
  this.showBattleMessage("BATTLE WIN!", "lime", 1500);
  this.playerExp += 10;
  this.endBattle();
}

handleBattleLoss() {
  console.log("%cBATTLE LOST!", "color: red; font-weight: bold;");
  // Reset HP for demo purposes
  this.showBattleMessage("BATTLE LOST!", "red", 1500);
  this.playerHP = 100;
  
  this.updateStats();  // update HUD and battle UI
  this.endBattle();
}

showBattleMessage(message, color = 'white', duration = 1500) {
  // Create overlay div if it doesn't exist
  let overlay = document.getElementById('battle-message');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'battle-message';
    overlay.style.position = 'absolute';
    overlay.style.top = '50%';
    overlay.style.left = '50%';
    overlay.style.transform = 'translate(-50%, -50%)';
    overlay.style.fontSize = '48px';
    overlay.style.fontWeight = 'bold';
    overlay.style.padding = '20px 40px';
    overlay.style.border = '4px solid white';
    overlay.style.borderRadius = '10px';
    overlay.style.backgroundColor = 'rgba(0,0,0,0.7)';
    overlay.style.color = color;
    overlay.style.zIndex = 999;
    document.body.appendChild(overlay);
  }

  overlay.textContent = message;
  overlay.style.color = color;
  overlay.style.display = 'block';
  overlay.style.opacity = 1;

  // Fade out after duration
  setTimeout(() => {
    overlay.style.transition = 'opacity 0.5s';
    overlay.style.opacity = 0;
    setTimeout(() => overlay.style.display = 'none', 500);
  }, duration);
}

}

/*

function calc() {
  let r = 40;
  return r + 2;
}
console.log("Sum: " + calc());

*/


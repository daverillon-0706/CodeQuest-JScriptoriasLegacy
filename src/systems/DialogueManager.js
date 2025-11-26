// src/systems/DialogueManager.js
import { wrapText } from "../utils/wrapText.js";

const DialogueManager = {
  // Scene & DOM state
  scene: null,
  dialogueBox: null,
  dialogueText: null,
  nextBtn: null,

  // Dialogue state
  activeDialogue: null,
  currentLine: 0,
  isTyping: false,
  typeTimer: null,

  // Interaction state
  canTalkTo: null, // set by updateProximity or scenes
  // internal listener refs so we can remove them
  _zHandler: null,
  _nextClickHandler: null,

  init(scene) {
    this.scene = scene;
    // ensure old timers/listeners cleared if re-init
    this.dispose(false);
  },

  // Optional: set DOM elements if you want to pass explicit elements
  // If you don't call this, DialogueManager will try to use document.getElementById
  setDomElements({ dialogueBox, dialogueText, nextBtn } = {}) {
    this.dialogueBox = dialogueBox ?? document.getElementById("dialogue-box");
    this.dialogueText = dialogueText ?? document.getElementById("dialogue-text");
    this.nextBtn = nextBtn ?? document.getElementById("dialogue-next");
  },

  // Call this after init() and setDomElements()
  attachInputListeners() {
    if (!this.scene) throw new Error("DialogueManager: call init(scene) first.");
    this.setDomElements();

    // Avoid attaching multiple listeners
    this.detachInputListeners();

    // Z key handler (keyboard)
    this._zHandler = (ev) => {
      // Z key only
      if (ev.code === "KeyZ" || ev.key === "z" || ev.key === "Z") {
        // If a dialogue is active & typing -> finish current line
        if (this.isTyping) {
          this._finishTypingInstant();
          return;
        }

        // If a dialogue box is visible, advance it
        if (this.dialogueBox && !this.dialogueBox.classList.contains("hidden")) {
          this.next();
          return;
        }

        // Otherwise try to start a nearby NPC dialogue or perform scene interaction
        // Scenes can also call handleZKey(doorLayer) if they want to manage doors/scene transitions
        if (this.canTalkTo?.dialogue?.length) {
          this.start(this.canTalkTo.dialogue);
        }
      }
    };
    window.addEventListener("keydown", this._zHandler);

    // Next button click
    if (this.nextBtn) {
      this._nextClickHandler = () => {
        if (this.isTyping) return;
        this.next();
      };
      this.nextBtn.addEventListener("click", this._nextClickHandler);
    }
  },

  detachInputListeners() {
    if (this._zHandler) {
      window.removeEventListener("keydown", this._zHandler);
      this._zHandler = null;
    }
    if (this.nextBtn && this._nextClickHandler) {
      this.nextBtn.removeEventListener("click", this._nextClickHandler);
      this._nextClickHandler = null;
    }
  },

  // Scenes can call this each frame / on world step to compute who is talkable
  // player: Phaser.GameObjects.Sprite, npcs: array of sprites
  updateProximity(player, npcs = []) {
    this.canTalkTo = null;
    if (!player || !player.body) return;
    const playerRect = player.getBounds();
    for (const npc of npcs) {
      if (!npc || !npc.body) continue;
      if (Phaser.Geom.Intersects.RectangleToRectangle(playerRect, npc.getBounds())) {
        this.canTalkTo = npc;
        return;
      }
    }
  },

  // Scenes may call to attempt door/scene interaction (keeps scene-specific logic outside manager)
  handleZKey(doorLayer) {
    // If dialogue active -> handle Z for dialogue first
    if (this.isTyping) {
      this._finishTypingInstant();
      return true;
    }
    if (this.dialogueBox && !this.dialogueBox.classList.contains("hidden")) {
      this.next();
      return true;
    }

    // If not talking, allow scene to handle doors; return false if nothing handled
    // Scenes can pass doorLayer to let DialogueManager attempt transitions (optional)
    if (doorLayer && this.scene?.player) {
      const playerRect = this.scene.player.getBounds();
      const nearbyDoor = (doorLayer.objects || []).find(door => {
        const rect = new Phaser.Geom.Rectangle(door.x, door.y, door.width || 16, door.height || 16);
        return Phaser.Geom.Intersects.RectangleToRectangle(playerRect, rect);
      });
      if (nearbyDoor) {
        // Let the scene handle launching next scene or use a standard scheme:
        // Scenes should implement their own logic to launch; here we return the door object
        return nearbyDoor;
      }
    }

    // If an NPC is near, start dialogue
    if (this.canTalkTo?.dialogue?.length) {
      this.start(this.canTalkTo.dialogue);
      return true;
    }

    return false;
  },

  // Start an array of dialogue lines
  start(dialogueArray = []) {
    if (!this.dialogueBox || !this.dialogueText) this.setDomElements();
    if (!this.dialogueBox || !this.dialogueText) {
      console.warn("DialogueManager: dialogue DOM elements not found.");
      return;
    }
    this.activeDialogue = Array.isArray(dialogueArray) ? dialogueArray : [String(dialogueArray)];
    this.currentLine = 0;
    this.dialogueBox.classList.remove("hidden");
    this.typeLine(this.activeDialogue[this.currentLine]);
  },

  next() {
    if (this.isTyping) return;
    this.currentLine++;
    if (this.currentLine < (this.activeDialogue?.length || 0)) {
      this.typeLine(this.activeDialogue[this.currentLine]);
    } else {
      this.close();
    }
  },

  close() {
    if (this.dialogueBox) this.dialogueBox.classList.add("hidden");
    this._clearTyping();
    this.activeDialogue = null;
    this.currentLine = 0;
    this.isTyping = false;
  },

  typeLine(text) {
    this._clearTyping();
    this.isTyping = true;
    const wrapped = wrapText(text, 40);
    let lineIndex = 0;
    let charIndex = 0;
    this.dialogueText.innerText = "";

    const typeNext = () => {
      // finished all lines
      if (lineIndex >= wrapped.length) {
        this.isTyping = false;
        return;
      }

      const before = wrapped.slice(0, lineIndex).join("\n");
      const maybeNewline = lineIndex > 0 && before ? `${before}\n` : before;
      this.dialogueText.innerText =
        maybeNewline + wrapped[lineIndex].substring(0, charIndex + 1);

      charIndex++;
      if (charIndex < wrapped[lineIndex].length) {
        this.typeTimer = setTimeout(typeNext, 25);
      } else {
        lineIndex++;
        charIndex = 0;
        this.typeTimer = setTimeout(typeNext, 25);
      }
    };

    typeNext();
  },

  _finishTypingInstant() {
    if (!this.activeDialogue) return;
    this._clearTyping();
    const fullText = wrapText(this.activeDialogue[this.currentLine], 40).join("\n");
    if (this.dialogueText) this.dialogueText.innerText = fullText;
    this.isTyping = false;
  },

  _clearTyping() {
    if (this.typeTimer) {
      clearTimeout(this.typeTimer);
      this.typeTimer = null;
    }
  },

  // Remove timers and listeners. keepScene param if you want to keep scene link
  dispose(removeScene = true) {
    this._clearTyping();
    this.detachInputListeners();
    this.activeDialogue = null;
    this.currentLine = 0;
    this.isTyping = false;
    if (removeScene) this.scene = null;
    // don't touch DOM nodes here (they belong to the page), only detach events
  }
};

export default DialogueManager;

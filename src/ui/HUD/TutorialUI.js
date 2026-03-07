export default class TutorialUI {
  constructor(scene = null) {
    this.scene = scene;

    this.root = document.getElementById("tutorial-ui");
    this.closeBtn = document.getElementById("tutorial-close");

    this.closeBtn.onclick = () => this.hide();
  }

  
  

  show(scene = null) {
    if (scene) this.scene = scene;

    this.root.classList.remove("hidden");

    if (this.scene) {
      this.scene.isUIBlockingInput = true;
    }
  }

  hide() {
    this.root.classList.add("hidden");

    if (this.scene) {
      this.scene.isUIBlockingInput = false;
    }
  }
}
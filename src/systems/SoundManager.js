export default class SoundManager {
  constructor(scene) {
    this.scene = scene;
    this.sounds = {};
    this.currentBGM = null;
  }

  // -------------------------
  // Add / cache sound
  // -------------------------
  add(key, config = {}) {
    if (!this.sounds[key]) {
      this.sounds[key] = this.scene.sound.add(key, config);
    }
  }

  // -------------------------
  // Play one-shot SFX
  // -------------------------
  play(key, config = {}) {
    this.add(key, config);
    this.sounds[key].play(config);
  }

  // -------------------------
  // Loop sound (footsteps, etc.)
  // -------------------------
  loop(key, config = {}) {
    this.add(key, { loop: true, ...config });
    this.sounds[key].play({ loop: true, ...config });
  }

  // -------------------------
  // Stop specific sound
  // -------------------------
  stop(key) {
    if (this.sounds[key]) {
      this.sounds[key].stop();
    }
  }

  // -------------------------
  // Stop all SFX
  // -------------------------
  stopAll() {
    Object.values(this.sounds).forEach(s => s.stop());
  }

  // -------------------------
  // Play background music
  // -------------------------
  playBGM(key, config = {}) {
    if (this.currentBGM) {
      this.currentBGM.stop();
    }

    this.currentBGM = this.scene.sound.add(key, {
      loop: true,
      volume: 0.5,
      ...config
    });

    this.currentBGM.play();
  }

  playOnce(key, config = {}) {
  this.add(key, config);

  const sound = this.sounds[key];

  if (!sound.isPlaying) {
    sound.play(config);
  }
}
}

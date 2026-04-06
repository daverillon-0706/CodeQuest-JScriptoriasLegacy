// src/systems/MusicManager.js

class MusicManager {
  constructor(scene) {
    this.scene = scene;
    this.currentMusic = null;
    this.currentKey = null;

    // All BGM tracks here
    this.tracks = {
      title: "codequest-title",
      overworld: "codequest-overworld",
      indoors: "codequest-indoors",
      riftboss: "codequest-riftboss",
      victory: "codequest-victory",
    };
  }

  // Play music by track name
  play(trackName, config = {}) {
    const key = this.tracks[trackName];

    if (!key) {
      console.warn(`Music track '${trackName}' does not exist.`);
      return;
    }

    // Prevent restarting same music
    if (this.currentKey === key && this.currentMusic?.isPlaying) {
      return;
    }

    // Stop previous music
    this.stop();

    const shouldLoop = trackName !== "victory";

    this.currentMusic = this.scene.sound.add(key, {
      volume: config.volume ?? 0.5,
      loop: config.loop ?? shouldLoop,
    });

    this.currentMusic.play();
    this.currentKey = key;
  }

  // Stop current music
  stop() {
    if (this.currentMusic) {
      this.currentMusic.stop();
      this.currentMusic.destroy();
      this.currentMusic = null;
      this.currentKey = null;
    }
  }

  // Pause current music
  pause() {
    if (this.currentMusic && this.currentMusic.isPlaying) {
      this.currentMusic.pause();
    }
  }

  // Resume paused music
  resume() {
    if (this.currentMusic && this.currentMusic.isPaused) {
      this.currentMusic.resume();
    }
  }

  // Change music volume
  setVolume(volume) {
    if (this.currentMusic) {
      this.currentMusic.setVolume(volume);
    }
  }

  // Fade out current music
  fadeOut(duration = 1000) {
  if (!this.currentMusic) return;

  const music = this.currentMusic;

  this.scene.tweens.add({
    targets: music,
    volume: 0,
    duration: duration,
    onComplete: () => {
      if (music) {
        music.stop();
        music.destroy();
      }

      // Only clear if this is still the active music
      if (this.currentMusic === music) {
        this.currentMusic = null;
        this.currentKey = null;
      }
    }
  });
}
  // Fade in new music
  fadeTo(trackName, duration = 1000, config = {}) {
  const key = this.tracks[trackName];

  if (!key) return;
  if (this.currentKey === key) return;

  const previousMusic = this.currentMusic;

  if (previousMusic) {
    this.scene.tweens.add({
      targets: previousMusic,
      volume: 0,
      duration: duration,
      onComplete: () => {
        previousMusic.stop();
        previousMusic.destroy();

        const shouldLoop = trackName !== "victory";

        this.currentMusic = this.scene.sound.add(key, {
          volume: 0,
          loop: config.loop ?? shouldLoop,
        });

        this.currentMusic.play();

        this.scene.tweens.add({
          targets: this.currentMusic,
          volume: config.volume ?? 0.5,
          duration: duration,
        });

        this.currentKey = key;
      }
    });
  } else {
    const shouldLoop = trackName !== "victory";

    this.currentMusic = this.scene.sound.add(key, {
      volume: 0,
      loop: config.loop ?? shouldLoop,
    });

    this.currentMusic.play();

    this.scene.tweens.add({
      targets: this.currentMusic,
      volume: config.volume ?? 0.5,
      duration: duration,
    });

    this.currentKey = key;
  }
}
}

export default MusicManager;
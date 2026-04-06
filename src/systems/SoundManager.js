// src/systems/SoundManager.js

export default class SoundManager {
    constructor(scene) {
        this.scene = scene;
        this.sounds = {};
        this.currentBGM = null;

        // Default volume and mute
        this.volume = 0.5;
        this.muted = false;
    }

    // -------------------------
    // Add / cache sound
    // -------------------------
    add(key, config = {}) {
        if (!this.sounds[key]) {
            this.sounds[key] = this.scene.sound.add(key, {
                volume: this.volume,
                mute: this.muted,
                ...config
            });
        }
    }

    // -------------------------
    // Play one-shot SFX
    // -------------------------
    play(key, config = {}) {
        this.add(key, config);

        // Apply current volume/mute every time
        this.sounds[key].play({
            ...config,
            volume: this.volume,
            mute: this.muted
        });
    }

    // -------------------------
    // Loop sound (footsteps, ambient)
    // -------------------------
    loop(key, config = {}) {
        this.add(key, { loop: true, ...config });

        this.sounds[key].play({
            loop: true,
            volume: this.volume,
            mute: this.muted,
            ...config
        });
    }

    // -------------------------
    // Stop specific sound
    // -------------------------
    stop(key) {
        if (this.sounds[key]) this.sounds[key].stop();
    }

    // -------------------------
    // Stop all SFX
    // -------------------------
    stopAll() {
        Object.values(this.sounds).forEach(s => s.stop());
    }

    // -------------------------
    // Volume control
    // -------------------------
    setVolume(volume) {
        this.volume = volume;

        Object.values(this.sounds).forEach(s => s.setVolume(volume));
    }

    // -------------------------
    // Mute control
    // -------------------------
    setMute(muted) {
        this.muted = muted;

        Object.values(this.sounds).forEach(s => s.setMute(muted));
    }

    // -------------------------
    // Play once safely (no overlap)
    // -------------------------
    playOnce(key, config = {}) {
        this.add(key, config);

        const sound = this.sounds[key];
        if (!sound.isPlaying) {
            sound.play({
                volume: this.volume,
                mute: this.muted,
                ...config
            });
        }
    }

    // -------------------------
    // Play BGM
    // -------------------------
    playBGM(key, config = {}) {
        if (this.currentBGM) {
            this.currentBGM.stop();
            this.currentBGM.destroy();
        }

        this.currentBGM = this.scene.sound.add(key, {
            loop: true,
            volume: this.volume,
            mute: this.muted,
            ...config
        });

        this.currentBGM.play();
    }

    fadeOutBGM(duration = 1000) {
        if (!this.currentBGM) return;

        const music = this.currentBGM;

        this.scene.tweens.add({
            targets: music,
            volume: 0,
            duration: duration,
            onComplete: () => {
                music.stop();
                music.destroy();
                if (this.currentBGM === music) this.currentBGM = null;
            }
        });
    }

    fadeToBGM(key, duration = 1000, config = {}) {
        const previous = this.currentBGM;

        if (previous) {
            this.scene.tweens.add({
                targets: previous,
                volume: 0,
                duration: duration,
                onComplete: () => {
                    previous.stop();
                    previous.destroy();

                    this.playBGM(key, { volume: 0, ...config });

                    this.scene.tweens.add({
                        targets: this.currentBGM,
                        volume: this.volume,
                        duration: duration
                    });
                }
            });
        } else {
            this.playBGM(key, { volume: 0, ...config });
            this.scene.tweens.add({
                targets: this.currentBGM,
                volume: this.volume,
                duration: duration
            });
        }
    }
}
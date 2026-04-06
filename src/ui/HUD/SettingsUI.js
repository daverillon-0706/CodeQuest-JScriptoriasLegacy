// src/ui/HUD/SettingsUI.js
import GameState from "../../GameState.js";
import NotificationSystem from "../../systems/NotificationSystem.js";

export default class SettingsUI {
    constructor() {
        this.container = document.getElementById("app-settings");
        if (!this.container) return;

        this.musicVolumeSlider = document.getElementById("music-volume");
        this.sfxVolumeSlider = document.getElementById("sfx-volume");
        this.toggleMusic = document.getElementById("toggle-music");
        this.toggleSFX = document.getElementById("toggle-sfx");
        this.feedback = document.getElementById("settings-feedback");
        this.saveBtn = document.getElementById("save-settings-btn");

        this.notificationSystem = new NotificationSystem(window.currentScene);
        this.notificationSystem.init();

        this.pendingSettings = {};
        this.savedSettingsSnapshot = {};

        // Create labels next to sliders
        if (this.musicVolumeSlider?.parentNode) {
            this.musicVolumeLabel = document.createElement("span");
            this.musicVolumeLabel.classList.add("volume-label");
            this.musicVolumeSlider.parentNode.appendChild(this.musicVolumeLabel);
        }
        if (this.sfxVolumeSlider?.parentNode) {
            this.sfxVolumeLabel = document.createElement("span");
            this.sfxVolumeLabel.classList.add("volume-label");
            this.sfxVolumeSlider.parentNode.appendChild(this.sfxVolumeLabel);
        }

        this.attachEvents();
        this.loadPreferences();
    }

    getSettings() {
        if (!GameState.player) return {};

        if (!GameState.player.settings) {
            GameState.player.settings = {
                musicVolume: 0.5,
                sfxVolume: 0.5,
                musicEnabled: true,
                sfxEnabled: true
            };
        }

        return GameState.player.settings;
    }

    savePreferences() {
        const player = GameState.player;
        if (!player) return;

        player.settings = {
            ...(player.settings || {}),
            ...this.pendingSettings
        };

        GameState.player = player;

        localStorage.setItem("codequest_settings", JSON.stringify(player.settings));

        window.dispatchEvent(new CustomEvent("settings-updated", {
            detail: player.settings
        }));

        this.pendingSettings = {};
        this.savedSettingsSnapshot = { ...player.settings };

        //this.showFeedback("✅ Settings Saved");
        this.notificationSystem.add("Settings Saved", "success");
    }

    revertChanges() {
        // Revert pending changes
        this.pendingSettings = {};

        const settings = this.savedSettingsSnapshot || this.getSettings();

        // Reset sliders/toggles to snapshot
        if (this.musicVolumeSlider) this.musicVolumeSlider.value = settings.musicVolume ?? 0.5;
        if (this.sfxVolumeSlider) this.sfxVolumeSlider.value = settings.sfxVolume ?? 0.5;
        if (this.toggleMusic) this.toggleMusic.checked = settings.musicEnabled ?? true;
        if (this.toggleSFX) this.toggleSFX.checked = settings.sfxEnabled ?? true;

        // Update labels
        if (this.musicVolumeLabel) this.musicVolumeLabel.textContent = ` ${Math.round((settings.musicVolume ?? 0.5) ** 2.2 * 100)}%`;
        if (this.sfxVolumeLabel) this.sfxVolumeLabel.textContent = ` ${Math.round((settings.sfxVolume ?? 0.5) ** 2.2 * 100)}%`;

        // Apply reverted settings to managers
        const musicManager = window.currentScene?.musicManager;
        const soundManager = window.currentScene?.soundManager;

        if (musicManager) {
            settings.musicEnabled ? musicManager.resume() : musicManager.pause();
            musicManager.setVolume(settings.musicEnabled ? settings.musicVolume : 0);
        }

        if (soundManager) {
            soundManager.setVolume(settings.sfxVolume);
            soundManager.setMute(!settings.sfxEnabled);
        }

        //this.showFeedback("🔄 Changes Reverted");
        this.notificationSystem.add("🔄 Changes Reverted", "success");
    }

    attachEvents() {
        // MUSIC VOLUME
        this.musicVolumeSlider?.addEventListener("input", e => {
            const sliderVal = parseFloat(e.target.value); // 0 → 1
            const volume = Math.pow(sliderVal, 2.2);     // exponential scaling
            this.pendingSettings.musicVolume = sliderVal; // store **linear value** for saving

            if (this.musicVolumeLabel) this.musicVolumeLabel.textContent = ` ${Math.round(volume * 100)}%`;

            const musicManager = window.currentScene?.musicManager;
            const enabled = this.pendingSettings.musicEnabled ?? this.getSettings().musicEnabled;

            if (musicManager) musicManager.setVolume(enabled ? volume : 0);

            //this.showFeedback(`🎵 Music Volume: ${Math.round(volume * 100)}%`);
            this.notificationSystem.add(`Music Volume: ${Math.round(volume * 100)}%`, "system");
        });

        // SFX VOLUME
        this.sfxVolumeSlider?.addEventListener("input", e => {
            const sliderVal = parseFloat(e.target.value);
            const volume = Math.pow(sliderVal, 2.2);
            this.pendingSettings.sfxVolume = sliderVal;

            if (this.sfxVolumeLabel) this.sfxVolumeLabel.textContent = ` ${Math.round(volume * 100)}%`;

            const soundManager = window.currentScene?.soundManager;
            const enabled = this.pendingSettings.sfxEnabled ?? this.getSettings().sfxEnabled;

            if (soundManager) {
                soundManager.setVolume(volume);
                soundManager.setMute(!enabled);
            }

            //this.showFeedback(`🔊 SFX Volume: ${Math.round(volume * 100)}%`);
            this.notificationSystem.add(`SFX Volume: ${Math.round(volume * 100)}%`, "system");
        });

        // TOGGLE MUSIC
        this.toggleMusic?.addEventListener("change", e => {
            const enabled = e.target.checked;
            this.pendingSettings.musicEnabled = enabled;

            const musicManager = window.currentScene?.musicManager;
            const volume = this.pendingSettings.musicVolume ?? this.getSettings().musicVolume ?? 0.5;

            if (musicManager) {
                if (enabled) {
                    musicManager.resume?.();
                    musicManager.setVolume(Math.pow(volume, 2.2));
                } else {
                    musicManager.pause?.();
                    musicManager.setVolume(0);
                }
            }

            //this.showFeedback(enabled ? "🎵 Music Enabled" : "🎵 Music Muted");
            this.notificationSystem.add(enabled ? "Music Enabled" : "Music Muted", "system");
        });

        // TOGGLE SFX
        this.toggleSFX?.addEventListener("change", e => {
            const enabled = e.target.checked;
            this.pendingSettings.sfxEnabled = enabled;

            const soundManager = window.currentScene?.soundManager;
            if (soundManager) soundManager.setMute(!enabled);

            //this.showFeedback(enabled ? "🔊 SFX Enabled" : "🔇 SFX Muted");
            this.notificationSystem.add(enabled ? "SFX Enabled" : "SFX Muted", "system");
        });

        // SAVE BUTTON
        this.saveBtn?.addEventListener("click", () => this.savePreferences());
    }

    loadPreferences() {
        const savedSettings = localStorage.getItem("codequest_settings");

        if (savedSettings) {
            try {
                GameState.player.settings = {
                    ...this.getSettings(),
                    ...JSON.parse(savedSettings)
                };
            } catch (err) {
                console.warn("[SettingsUI] Failed to parse saved settings", err);
            }
        }

        const settings = this.getSettings();
        this.savedSettingsSnapshot = { ...settings };
        this.pendingSettings = {};

        // Set sliders/toggles
        if (this.musicVolumeSlider) this.musicVolumeSlider.value = settings.musicVolume ?? 0.5;
        if (this.sfxVolumeSlider) this.sfxVolumeSlider.value = settings.sfxVolume ?? 0.5;
        if (this.toggleMusic) this.toggleMusic.checked = settings.musicEnabled ?? true;
        if (this.toggleSFX) this.toggleSFX.checked = settings.sfxEnabled ?? true;

        // Update labels
        if (this.musicVolumeLabel) this.musicVolumeLabel.textContent = ` ${Math.round((settings.musicVolume ?? 0.5) ** 2.2 * 100)}%`;
        if (this.sfxVolumeLabel) this.sfxVolumeLabel.textContent = ` ${Math.round((settings.sfxVolume ?? 0.5) ** 2.2 * 100)}%`;

        // Apply to managers
        const musicManager = window.currentScene?.musicManager;
        const soundManager = window.currentScene?.soundManager;

        if (musicManager) {
            if (settings.musicEnabled) {
                musicManager.resume?.();
                musicManager.setVolume(Math.pow(settings.musicVolume ?? 0.5, 2.2));
            } else {
                musicManager.pause?.();
                musicManager.setVolume(0);
            }
        }

        if (soundManager) {
            if (typeof soundManager.setVolume === "function") soundManager.setVolume(Math.pow(settings.sfxVolume ?? 0.5, 2.2));
            if (typeof soundManager.setMute === "function") soundManager.setMute(!(settings.sfxEnabled ?? true));
        }
    }
/*
    showFeedback(text) {
        if (!this.feedback) return;
        this.feedback.textContent = text;
        this.feedback.classList.add("active");
        clearTimeout(this.feedbackTimeout);
        this.feedbackTimeout = setTimeout(() => this.feedback.classList.remove("active"), 1500);
    }
        */
}
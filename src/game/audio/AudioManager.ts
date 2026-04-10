import { Audio, type AVPlaybackStatusSuccess } from 'expo-av';
import engineSound from '../../../assets/audio/engine.mp3';
import clickSound from '../../../assets/audio/click.mp3';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const ENGINE_MIN_UPDATE_MS = 75;
const RATE_EPSILON = 0.03;
const VOLUME_EPSILON = 0.025;

class AudioManager {
  private engineSound: Audio.Sound | null = null;
  private clickSound: Audio.Sound | null = null;
  private loaded = false;
  private enabled = true;
  private engineIsPlaying = false;
  private lastEngineRate = -1;
  private lastEngineVolume = -1;
  private lastEngineUpdateMs = 0;

  async init() {
    if (this.loaded) {
      return;
    }

    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      staysActiveInBackground: false,
    });

    const { sound: engine } = await Audio.Sound.createAsync(engineSound, {
      shouldPlay: false,
      isLooping: true,
      volume: 0.15,
      rate: 0.8,
    });
    const { sound: click } = await Audio.Sound.createAsync(clickSound, {
      shouldPlay: false,
      volume: 0.55,
    });

    this.engineSound = engine;
    this.clickSound = click;
    this.loaded = true;
  }

  async setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled && this.engineSound) {
      await this.engineSound.pauseAsync();
      this.engineIsPlaying = false;
    }
  }

  async updateEngineFromSpeed(speedKmh: number) {
    if (!this.loaded || !this.engineSound) {
      return;
    }

    if (!this.enabled) {
      if (this.engineIsPlaying) {
        await this.engineSound.pauseAsync();
        this.engineIsPlaying = false;
      }
      return;
    }

    const normalized = clamp(speedKmh / 220, 0, 1);
    const targetRate = 0.75 + normalized * 0.85;
    const targetVolume = 0.12 + normalized * 0.45;
    const now = Date.now();
    const shouldSkipUpdate =
      Math.abs(targetRate - this.lastEngineRate) < RATE_EPSILON &&
      Math.abs(targetVolume - this.lastEngineVolume) < VOLUME_EPSILON &&
      now - this.lastEngineUpdateMs < ENGINE_MIN_UPDATE_MS;
    if (shouldSkipUpdate) {
      return;
    }

    if (!this.engineIsPlaying) {
      const status = (await this.engineSound.getStatusAsync()) as AVPlaybackStatusSuccess;
      if (!status.isLoaded) {
        return;
      }
      await this.engineSound.playAsync();
      this.engineIsPlaying = true;
    }

    await this.engineSound.setStatusAsync({
      shouldPlay: true,
      rate: targetRate,
      volume: targetVolume,
      shouldCorrectPitch: true,
    });
    this.lastEngineRate = targetRate;
    this.lastEngineVolume = targetVolume;
    this.lastEngineUpdateMs = now;
  }

  async playClick() {
    if (!this.loaded || !this.clickSound || !this.enabled) {
      return;
    }

    try {
      await this.clickSound.setPositionAsync(0);
      await this.clickSound.playAsync();
    } catch {
      // Ignore click playback race conditions.
    }
  }

  async shutdown() {
    if (this.engineSound) {
      await this.engineSound.unloadAsync();
      this.engineSound = null;
    }
    if (this.clickSound) {
      await this.clickSound.unloadAsync();
      this.clickSound = null;
    }
    this.loaded = false;
    this.engineIsPlaying = false;
    this.lastEngineRate = -1;
    this.lastEngineVolume = -1;
    this.lastEngineUpdateMs = 0;
  }
}

export const audioManager = new AudioManager();

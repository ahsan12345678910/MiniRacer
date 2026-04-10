import { Audio, type AVPlaybackStatusSuccess } from 'expo-av';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

// Replace these URLs with your own files if needed.
const ENGINE_SOUND_URI = 'https://cdn.freesound.org/previews/250/250547_4486188-lq.mp3';
const CLICK_SOUND_URI = 'https://cdn.freesound.org/previews/270/270404_5123851-lq.mp3';

class AudioManager {
  private engineSound: Audio.Sound | null = null;
  private clickSound: Audio.Sound | null = null;
  private loaded = false;
  private enabled = true;

  async init() {
    if (this.loaded) {
      return;
    }

    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      staysActiveInBackground: false,
    });

    const { sound: engine } = await Audio.Sound.createAsync(
      { uri: ENGINE_SOUND_URI },
      {
        shouldPlay: false,
        isLooping: true,
        volume: 0.15,
        rate: 0.8,
      },
    );
    const { sound: click } = await Audio.Sound.createAsync(
      { uri: CLICK_SOUND_URI },
      { shouldPlay: false, volume: 0.55 },
    );

    this.engineSound = engine;
    this.clickSound = click;
    this.loaded = true;
  }

  async setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled && this.engineSound) {
      await this.engineSound.pauseAsync();
    }
  }

  async updateEngineFromSpeed(speedKmh: number) {
    if (!this.loaded || !this.engineSound) {
      return;
    }

    if (!this.enabled) {
      await this.engineSound.pauseAsync();
      return;
    }

    const normalized = clamp(speedKmh / 220, 0, 1);
    const targetRate = 0.75 + normalized * 0.85;
    const targetVolume = 0.12 + normalized * 0.45;
    const status = (await this.engineSound.getStatusAsync()) as AVPlaybackStatusSuccess;
    if (!status.isLoaded) {
      return;
    }

    if (!status.isPlaying) {
      await this.engineSound.playAsync();
    }

    await this.engineSound.setStatusAsync({
      shouldPlay: true,
      rate: targetRate,
      volume: targetVolume,
      shouldCorrectPitch: true,
    });
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
  }
}

export const audioManager = new AudioManager();

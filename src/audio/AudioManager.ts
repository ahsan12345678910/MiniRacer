import { GameSettings } from '../game/store/GameStore';

export interface AudioState {
  isEnginePlaying: boolean;
  engineVolume: number;
  enginePitch: number;
  soundEnabled: boolean;
  musicEnabled: boolean;
}

export class AudioManager {
  private static instance: AudioManager;
  private state: AudioState = {
    isEnginePlaying: false,
    engineVolume: 0,
    enginePitch: 1,
    soundEnabled: true,
    musicEnabled: true,
  };

  private constructor() {
    // Simplified initialization - no complex audio setup for now
    console.log('AudioManager initialized (simplified mode)');
  }

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  public getState(): AudioState {
    return { ...this.state };
  }

  public updateSettings(settings: GameSettings): void {
    this.state.soundEnabled = settings.soundEnabled;
    this.state.musicEnabled = settings.musicEnabled;
    console.log('Audio settings updated:', {
      soundEnabled: this.state.soundEnabled,
      musicEnabled: this.state.musicEnabled,
    });
  }

  public updateEngineSound(speed: number, maxSpeed: number): void {
    if (!this.state.soundEnabled) return;

    const volume = Math.min(speed / maxSpeed, 1);
    const pitch = 0.8 + (volume * 0.4); // Pitch from 0.8 to 1.2

    this.state.engineVolume = volume;
    this.state.enginePitch = pitch;

    if (speed > 0.1 && !this.state.isEnginePlaying) {
      this.state.isEnginePlaying = true;
      console.log('Engine sound started');
    } else if (speed <= 0.1 && this.state.isEnginePlaying) {
      this.state.isEnginePlaying = false;
      console.log('Engine sound stopped');
    }
  }

  public playClickSound(): void {
    if (!this.state.soundEnabled) return;
    console.log('Click sound played');
  }

  public playEngineStart(): void {
    if (!this.state.soundEnabled) return;
    console.log('Engine start sound played');
  }

  public stopEngineSound(): void {
    this.state.isEnginePlaying = false;
    this.state.engineVolume = 0;
    console.log('Engine sound stopped');
  }

  public pauseAllAudio(): void {
    this.state.isEnginePlaying = false;
    console.log('All audio paused');
  }

  public resumeAllAudio(): void {
    console.log('All audio resumed');
  }

  public destroy(): void {
    this.state.isEnginePlaying = false;
    this.state.engineVolume = 0;
    console.log('AudioManager destroyed');
  }
}

// Export singleton instance
export const audioManager = AudioManager.getInstance();
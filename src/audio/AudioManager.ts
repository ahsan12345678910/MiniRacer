import { Audio } from 'expo-av';
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
  private engineSound: Audio.Sound | null = null;
  private clickSound: Audio.Sound | null = null;
  private state: AudioState = {
    isEnginePlaying: false,
    engineVolume: 0,
    enginePitch: 1,
    soundEnabled: true,
    musicEnabled: true,
  };

  private constructor() {
    this.initializeAudio();
  }

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  private async initializeAudio(): Promise<void> {
    try {
      // Set audio mode for better performance
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Load engine sound
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { sound: engineSound } = await Audio.Sound.createAsync(
        require('../assets/sounds/engine.mp3'),
        {
          shouldPlay: false,
          isLooping: true,
          volume: 0,
        }
      );
      this.engineSound = engineSound;

      // Load click sound
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { sound: clickSound } = await Audio.Sound.createAsync(
        require('../assets/sounds/click.mp3'),
        {
          shouldPlay: false,
          isLooping: false,
          volume: 0.7,
        }
      );
      this.clickSound = clickSound;

      console.log('Audio system initialized successfully');
    } catch (error) {
      console.error('Failed to initialize audio system:', error);
    }
  }

  /**
   * Update audio settings from game store
   */
  public updateSettings(settings: GameSettings): void {
    const settingsChanged =
      this.state.soundEnabled !== settings.soundEnabled ||
      this.state.musicEnabled !== settings.musicEnabled;

    this.state.soundEnabled = settings.soundEnabled;
    this.state.musicEnabled = settings.musicEnabled;

    // Apply settings changes immediately
    if (settingsChanged) {
      this.applyAudioSettings();
    }
  }

  /**
   * Apply current audio settings to all sounds
   */
  private async applyAudioSettings(): Promise<void> {
    try {
      if (this.engineSound) {
        const volume = this.state.soundEnabled ? this.state.engineVolume : 0;
        await this.engineSound.setVolumeAsync(volume);
      }

      if (this.clickSound) {
        const volume = this.state.soundEnabled ? 0.7 : 0;
        await this.clickSound.setVolumeAsync(volume);
      }
    } catch (error) {
      console.error('Failed to apply audio settings:', error);
    }
  }

  /**
   * Update engine sound based on car speed
   */
  public async updateEngineSound(
    speed: number,
    maxSpeed: number
  ): Promise<void> {
    if (!this.engineSound || !this.state.soundEnabled) {
      return;
    }

    try {
      // Calculate speed ratio (0 to 1)
      const speedRatio = Math.min(speed / maxSpeed, 1);

      // Calculate volume based on speed (0.1 to 0.8)
      const targetVolume = 0.1 + speedRatio * 0.7;

      // Calculate pitch based on speed (0.8 to 1.5)
      const targetPitch = 0.8 + speedRatio * 0.7;

      // Smooth volume and pitch changes to avoid audio artifacts
      const volumeDiff = Math.abs(targetVolume - this.state.engineVolume);
      const pitchDiff = Math.abs(targetPitch - this.state.enginePitch);

      if (volumeDiff > 0.01) {
        this.state.engineVolume = targetVolume;
        await this.engineSound.setVolumeAsync(targetVolume);
      }

      if (pitchDiff > 0.01) {
        this.state.enginePitch = targetPitch;
        await this.engineSound.setRateAsync(targetPitch, true);
      }

      // Start engine sound if not playing and car is moving
      if (!this.state.isEnginePlaying && speed > 0.1) {
        await this.engineSound.playAsync();
        this.state.isEnginePlaying = true;
      }

      // Stop engine sound if car is not moving
      if (this.state.isEnginePlaying && speed <= 0.1) {
        await this.engineSound.pauseAsync();
        this.state.isEnginePlaying = false;
      }
    } catch (error) {
      console.error('Failed to update engine sound:', error);
    }
  }

  /**
   * Play UI click sound
   */
  public async playClickSound(): Promise<void> {
    if (!this.clickSound || !this.state.soundEnabled) {
      return;
    }

    try {
      await this.clickSound.replayAsync();
    } catch (error) {
      console.error('Failed to play click sound:', error);
    }
  }

  /**
   * Play engine startup sound
   */
  public async playEngineStart(): Promise<void> {
    if (!this.engineSound || !this.state.soundEnabled) {
      return;
    }

    try {
      // Set initial volume and pitch
      await this.engineSound.setVolumeAsync(0.3);
      await this.engineSound.setRateAsync(0.9, true);
      await this.engineSound.playAsync();
      this.state.isEnginePlaying = true;
    } catch (error) {
      console.error('Failed to play engine start:', error);
    }
  }

  /**
   * Stop engine sound
   */
  public async stopEngineSound(): Promise<void> {
    if (!this.engineSound) {
      return;
    }

    try {
      await this.engineSound.pauseAsync();
      this.state.isEnginePlaying = false;
    } catch (error) {
      console.error('Failed to stop engine sound:', error);
    }
  }

  /**
   * Pause all audio
   */
  public async pauseAllAudio(): Promise<void> {
    try {
      if (this.engineSound && this.state.isEnginePlaying) {
        await this.engineSound.pauseAsync();
      }
    } catch (error) {
      console.error('Failed to pause audio:', error);
    }
  }

  /**
   * Resume all audio
   */
  public async resumeAllAudio(): Promise<void> {
    try {
      if (
        this.engineSound &&
        this.state.isEnginePlaying &&
        this.state.soundEnabled
      ) {
        await this.engineSound.playAsync();
      }
    } catch (error) {
      console.error('Failed to resume audio:', error);
    }
  }

  /**
   * Get current audio state
   */
  public getState(): AudioState {
    return { ...this.state };
  }

  /**
   * Cleanup audio resources
   */
  public async cleanup(): Promise<void> {
    try {
      if (this.engineSound) {
        await this.engineSound.unloadAsync();
        this.engineSound = null;
      }

      if (this.clickSound) {
        await this.clickSound.unloadAsync();
        this.clickSound = null;
      }

      this.state.isEnginePlaying = false;
      console.log('Audio system cleaned up');
    } catch (error) {
      console.error('Failed to cleanup audio system:', error);
    }
  }
}

// Export singleton instance
export const audioManager = AudioManager.getInstance();

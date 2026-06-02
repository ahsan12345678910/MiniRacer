import { useEffect, useRef, useCallback } from 'react';
import { audioManager, AudioState } from './AudioManager';
import { useGameStore } from '../game/store/GameStore';

/**
 * Custom hook for audio management in React components
 * Optimized to avoid unnecessary re-renders
 */
export const useAudio = () => {
  const settings = useGameStore(state => state.settings);
  const car = useGameStore(state => state.car);
  const audioStateRef = useRef<AudioState>(audioManager.getState());
  const lastSpeedRef = useRef<number>(0);
  const lastSettingsRef = useRef(settings);

  // Update audio settings when they change
  useEffect(() => {
    const settingsChanged =
      lastSettingsRef.current.soundEnabled !== settings.soundEnabled ||
      lastSettingsRef.current.musicEnabled !== settings.musicEnabled ||
      lastSettingsRef.current.inputMode !== settings.inputMode;

    if (settingsChanged) {
      audioManager.updateSettings(settings);
      lastSettingsRef.current = settings;
    }
  }, [settings.soundEnabled, settings.musicEnabled, settings.inputMode]);

  // Update engine sound based on car speed
  useEffect(() => {
    const speedChanged = Math.abs(car.speed - lastSpeedRef.current) > 0.1;

    if (speedChanged) {
      audioManager.updateEngineSound(car.speed, car.maxSpeed || 10.0).catch(error => {
        console.warn('Failed to update engine sound:', error);
      });
      lastSpeedRef.current = car.speed;
    }
  }, [car.speed, car.maxSpeed]);

  // Play click sound function
  const playClickSound = useCallback(() => {
    audioManager.playClickSound().catch(error => {
      console.warn('Failed to play click sound:', error);
    });
  }, []);

  // Play engine start sound function
  const playEngineStart = useCallback(() => {
    audioManager.playEngineStart().catch(error => {
      console.warn('Failed to play engine start sound:', error);
    });
  }, []);

  // Stop engine sound function
  const stopEngineSound = useCallback(() => {
    audioManager.stopEngineSound().catch(error => {
      console.warn('Failed to stop engine sound:', error);
    });
  }, []);

  // Pause all audio function
  const pauseAllAudio = useCallback(() => {
    audioManager.pauseAllAudio().catch(error => {
      console.warn('Failed to pause all audio:', error);
    });
  }, []);

  // Resume all audio function
  const resumeAllAudio = useCallback(() => {
    audioManager.resumeAllAudio().catch(error => {
      console.warn('Failed to resume all audio:', error);
    });
  }, []);

  return {
    playClickSound,
    playEngineStart,
    stopEngineSound,
    pauseAllAudio,
    resumeAllAudio,
    audioState: audioStateRef.current,
  };
};

/**
 * Hook for UI components that need click sounds
 * Optimized to prevent unnecessary re-renders
 */
export const useClickSound = () => {
  const playClickSound = useCallback(() => {
    audioManager.playClickSound();
  }, []);

  return { playClickSound };
};

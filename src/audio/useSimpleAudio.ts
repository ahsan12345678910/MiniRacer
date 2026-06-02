// Simple Audio Hook using expo-audio
// No complex state management, just basic audio functions

import { useEffect, useCallback } from 'react';
import { useGameStore } from '../game/store/GameStore';
import { 
  initializeAudio, 
  playEngineSound, 
  playClickSound, 
  stopEngineSound, 
  pauseAllAudio, 
  resumeAllAudio 
} from './SimpleAudio';

// Simple audio hook
export const useSimpleAudio = () => {
  console.log('🔊 useSimpleAudio: Hook function called');
  const car = useGameStore(state => state.car);
  const settings = useGameStore(state => state.settings);
  console.log('🔊 useSimpleAudio: GameStore state accessed');

  // Initialize audio on mount
  useEffect(() => {
    console.log('🔊 useSimpleAudio: useEffect triggered - Initializing audio...');
    initializeAudio().catch(error => {
      console.error('❌ useSimpleAudio: Audio initialization failed:', error);
    });
  }, []);

  // Update engine sound based on car speed
  useEffect(() => {
    if (settings.soundEnabled) {
      playEngineSound(car.speed, car.maxSpeed);
    }
  }, [car.speed, car.maxSpeed, settings.soundEnabled]);

  // Play click sound function
  const handleClickSound = useCallback(() => {
    if (settings.soundEnabled) {
      playClickSound();
    }
  }, [settings.soundEnabled]);

  // Play engine start sound
  const handleEngineStart = useCallback(() => {
    if (settings.soundEnabled) {
      playEngineSound(1, car.maxSpeed); // Start with low speed
    }
  }, [settings.soundEnabled, car.maxSpeed]);

  // Stop engine sound
  const handleStopEngine = useCallback(() => {
    stopEngineSound();
  }, []);

  // Pause all audio
  const handlePauseAll = useCallback(() => {
    pauseAllAudio();
  }, []);

  // Resume all audio
  const handleResumeAll = useCallback(() => {
    if (settings.soundEnabled) {
      resumeAllAudio();
    }
  }, [settings.soundEnabled]);

  return {
    playClickSound: handleClickSound,
    playEngineStart: handleEngineStart,
    stopEngineSound: handleStopEngine,
    pauseAllAudio: handlePauseAll,
    resumeAllAudio: handleResumeAll,
  };
};

// Simple click sound hook for UI
export const useSimpleClickSound = () => {
  const settings = useGameStore(state => state.settings);

  const handleClickSound = useCallback(() => {
    if (settings.soundEnabled) {
      playClickSound();
    }
  }, [settings.soundEnabled]);

  return { playClickSound: handleClickSound };
};

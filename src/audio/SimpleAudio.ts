// Simple Audio System using expo-av
// Very basic audio functions without complex state management

import { Audio } from 'expo-av';

// Simple audio state
let engineSound: Audio.Sound | null = null;
let clickSound: Audio.Sound | null = null;
let isEnginePlaying = false;

// Audio configuration
const AUDIO_CONFIG = {
  ENGINE: {
    LOOP: true,
    MIN_VOLUME: 0.1,
    MAX_VOLUME: 0.8,
    MIN_PITCH: 0.8,
    MAX_PITCH: 1.5,
  },
  CLICK: {
    LOOP: false,
    VOLUME: 0.7,
  },
};

// Initialize audio players
export const initializeAudio = async () => {
  try {
    console.log('🔊 SimpleAudio: Starting initialization...');
    console.log('🔊 SimpleAudio: Audio object available:', !!Audio);
    console.log('🔊 SimpleAudio: Audio.Sound available:', !!Audio.Sound);
    
    // Configure audio mode
    console.log('🔊 SimpleAudio: Setting audio mode...');
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      staysActiveInBackground: true,
    });
    console.log('✅ SimpleAudio: Audio mode set');
    
    // Create engine sound
    console.log('🔊 SimpleAudio: Loading engine sound...');
    const enginePath = require('../../assets/engine.mp3');
    console.log('🔊 SimpleAudio: Engine path:', enginePath);
    
    const { sound: engine } = await Audio.Sound.createAsync(
      enginePath,
      {
        shouldPlay: false,
        isLooping: AUDIO_CONFIG.ENGINE.LOOP,
        volume: 0,
      }
    );
    engineSound = engine;
    console.log('✅ SimpleAudio: Engine sound loaded');
    
    // Create click sound
    console.log('🔊 SimpleAudio: Loading click sound...');
    const clickPath = require('../../assets/click.mp3');
    console.log('🔊 SimpleAudio: Click path:', clickPath);
    
    const { sound: click } = await Audio.Sound.createAsync(
      clickPath,
      {
        shouldPlay: false,
        isLooping: AUDIO_CONFIG.CLICK.LOOP,
        volume: AUDIO_CONFIG.CLICK.VOLUME,
      }
    );
    clickSound = click;
    console.log('✅ SimpleAudio: Click sound loaded');
    
    console.log('🎵 SimpleAudio: Audio system ready!');
  } catch (error) {
    console.error('❌ SimpleAudio: Failed to initialize:', error);
    console.error('❌ SimpleAudio: Error details:', error.message);
    console.error('❌ SimpleAudio: Error stack:', error.stack);
  }
};

// Play engine sound with speed-based volume/pitch
export const playEngineSound = async (speed: number, maxSpeed: number = 10) => {
  if (!engineSound) return;
  
  try {
    // Calculate volume based on speed
    const normalizedSpeed = Math.min(speed / maxSpeed, 1);
    const volume = Math.max(
      AUDIO_CONFIG.ENGINE.MIN_VOLUME,
      Math.min(normalizedSpeed * AUDIO_CONFIG.ENGINE.MAX_VOLUME, AUDIO_CONFIG.ENGINE.MAX_VOLUME)
    );
    
    // Calculate pitch based on speed
    const pitch = AUDIO_CONFIG.ENGINE.MIN_PITCH + (normalizedSpeed * (AUDIO_CONFIG.ENGINE.MAX_PITCH - AUDIO_CONFIG.ENGINE.MIN_PITCH));
    
    // Update audio properties
    await engineSound.setVolumeAsync(volume);
    await engineSound.setRateAsync(pitch, true);
    
    // Start/stop based on speed
    if (speed > 0.1 && !isEnginePlaying) {
      await engineSound.playAsync();
      isEnginePlaying = true;
      console.log(`🔊 Engine started - volume: ${volume.toFixed(2)}, pitch: ${pitch.toFixed(2)}`);
    } else if (speed <= 0.1 && isEnginePlaying) {
      await engineSound.pauseAsync();
      isEnginePlaying = false;
      console.log('🔊 Engine stopped');
    }
  } catch (error) {
    console.error('❌ SimpleAudio: Engine sound error:', error);
  }
};

// Play click sound
export const playClickSound = async () => {
  if (!clickSound) return;
  
  try {
    await clickSound.setVolumeAsync(AUDIO_CONFIG.CLICK.VOLUME);
    await clickSound.replayAsync();
    console.log('🔊 Click sound played');
  } catch (error) {
    console.error('❌ SimpleAudio: Click sound error:', error);
  }
};

// Stop engine sound
export const stopEngineSound = async () => {
  if (!engineSound || !isEnginePlaying) return;
  
  try {
    await engineSound.pauseAsync();
    isEnginePlaying = false;
    console.log('🔊 Engine sound stopped');
  } catch (error) {
    console.error('❌ SimpleAudio: Stop engine error:', error);
  }
};

// Pause all audio
export const pauseAllAudio = async () => {
  if (engineSound && isEnginePlaying) {
    await engineSound.pauseAsync();
    isEnginePlaying = false;
    console.log('🔊 All audio paused');
  }
};

// Resume all audio
export const resumeAllAudio = async () => {
  if (engineSound && !isEnginePlaying) {
    await engineSound.playAsync();
    isEnginePlaying = true;
    console.log('🔊 All audio resumed');
  }
};

// Cleanup
export const cleanupAudio = async () => {
  try {
    if (engineSound) {
      await engineSound.unloadAsync();
      engineSound = null;
    }
    if (clickSound) {
      await clickSound.unloadAsync();
      clickSound = null;
    }
    isEnginePlaying = false;
    console.log('🔊 Audio cleaned up');
  } catch (error) {
    console.error('❌ SimpleAudio: Cleanup error:', error);
  }
};
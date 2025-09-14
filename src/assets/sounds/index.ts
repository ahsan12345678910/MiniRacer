// Audio asset exports
// Note: In a real implementation, you would place actual .mp3 files here
// For now, we'll create placeholder references

// Engine sound - should be a looping engine sound
// eslint-disable-next-line @typescript-eslint/no-require-imports
export const ENGINE_SOUND = require('./engine.mp3');

// UI click sound - short click sound for button presses
// eslint-disable-next-line @typescript-eslint/no-require-imports
export const CLICK_SOUND = require('./click.mp3');

// Audio configuration
export const AUDIO_CONFIG = {
  ENGINE: {
    LOOP: true,
    INITIAL_VOLUME: 0,
    MIN_VOLUME: 0.1,
    MAX_VOLUME: 0.8,
    MIN_PITCH: 0.8,
    MAX_PITCH: 1.5,
  },
  CLICK: {
    LOOP: false,
    VOLUME: 0.7,
  },
} as const;

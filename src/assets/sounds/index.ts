// Simple audio configuration
// No complex imports needed - expo-audio handles this directly

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
/**
 * UI State Store
 * 
 * Zustand store for UI/HUD display values
 * - Throttled updates to prevent render storms
 * - Separate from game physics state
 * - Used only by React components
 */

import { create } from 'zustand';
import { shallow } from 'zustand/shallow';

interface UIState {
  speedDisplay: number; // Speed in km/h
  lapDisplay: string; // Current lap time formatted
  bestDisplay: string; // Best lap time formatted
  paused: boolean;
  settings: {
    mode: 'touchZones' | 'joystick';
    sfx: boolean;
  };
}

interface UIActions {
  setSnapshot: (data: { speedKmh: number; lap: string; bestMs: number }) => void;
  setPaused: (paused: boolean) => void;
  updateSettings: (settings: Partial<UIState['settings']>) => void;
}

type UIStore = UIState & UIActions;

// Throttle utility
let lastUpdateTime = 0;
const THROTTLE_MS = 100; // Update UI at most every 100ms

const throttledUpdate = (callback: () => void) => {
  const now = Date.now();
  if (now - lastUpdateTime >= THROTTLE_MS) {
    lastUpdateTime = now;
    callback();
  }
};

export const useUIStore = create<UIStore>((set, get) => ({
  // Initial state
  speedDisplay: 0,
  lapDisplay: '00:00.00',
  bestDisplay: '',
  paused: false,
  settings: {
    mode: 'touchZones',
    sfx: true,
  },

  // Actions
  setSnapshot: (data) => {
    throttledUpdate(() => {
      const { speedKmh, lap, bestMs } = data;
      const bestDisplay = bestMs > 0 ? formatTime(bestMs) : '';
      
      set({
        speedDisplay: Math.round(speedKmh),
        lapDisplay: lap,
        bestDisplay,
      });
    });
  },

  setPaused: (paused) => set({ paused }),

  updateSettings: (newSettings) =>
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    })),
}));

// Helper function to format time
const formatTime = (timeMs: number): string => {
  const totalSeconds = Math.floor(timeMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = Math.floor((timeMs % 1000) / 10);

  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
};

// Shallow selector hooks to prevent unnecessary re-renders
export const useSpeedDisplay = () => useUIStore((state) => state.speedDisplay, shallow);
export const useLapDisplay = () => useUIStore((state) => state.lapDisplay, shallow);
export const useBestDisplay = () => useUIStore((state) => state.bestDisplay, shallow);
export const usePaused = () => useUIStore((state) => state.paused, shallow);
export const useUISettings = () => useUIStore((state) => state.settings, shallow);

// Action hooks
export const useUIActions = () => useUIStore((state) => ({
  setSnapshot: state.setSnapshot,
  setPaused: state.setPaused,
  updateSettings: state.updateSettings,
}), shallow);

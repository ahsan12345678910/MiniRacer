import AsyncStorage from '@react-native-async-storage/async-storage';
import type { GameSettings } from './GameStore';

export const GAME_SETTINGS_STORAGE_KEY = 'miniracer.settings';
export const BEST_LAP_STORAGE_KEY = 'miniracer.bestLap';

type PersistedSettings = {
  controlMode: GameSettings['controlMode'];
  soundEnabled: boolean;
};

export async function loadGameSettings(): Promise<Partial<GameSettings> | null> {
  const raw = await AsyncStorage.getItem(GAME_SETTINGS_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<PersistedSettings>;
    const next: Partial<GameSettings> = {};

    if (parsed.controlMode === 'touchZones' || parsed.controlMode === 'virtualJoystick') {
      next.controlMode = parsed.controlMode;
    }

    if (typeof parsed.soundEnabled === 'boolean') {
      next.soundEnabled = parsed.soundEnabled;
    }

    return Object.keys(next).length > 0 ? next : null;
  } catch {
    return null;
  }
}

export async function saveGameSettings(settings: GameSettings): Promise<void> {
  const payload: PersistedSettings = {
    controlMode: settings.controlMode,
    soundEnabled: settings.soundEnabled,
  };
  await AsyncStorage.setItem(GAME_SETTINGS_STORAGE_KEY, JSON.stringify(payload));
}

export async function clearBestLap(): Promise<void> {
  await AsyncStorage.removeItem(BEST_LAP_STORAGE_KEY);
}

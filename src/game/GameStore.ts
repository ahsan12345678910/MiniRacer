import { create } from 'zustand';

type Vector2 = {
  x: number;
  y: number;
};

export type LapData = {
  currentLap: number;
  currentLapTime: number;
  bestLapTime: number | null;
  completedLaps: number;
};

export type ControlMode = 'touchZones' | 'virtualJoystick';

export type GameSettings = {
  controlMode: ControlMode;
};

type GameState = {
  carPosition: Vector2;
  carVelocity: Vector2;
  carAngle: number;
  lapData: LapData;
  settings: GameSettings;
  setCarVelocity: (velocity: Vector2) => void;
  setCarAngle: (angle: number) => void;
  setControlMode: (mode: ControlMode) => void;
  completeLap: () => void;
  resetRace: () => void;
  update: (dt: number) => void;
};

const initialPosition: Vector2 = { x: 0, y: 0 };
const initialVelocity: Vector2 = { x: 0, y: 0 };

const initialLapData: LapData = {
  currentLap: 1,
  currentLapTime: 0,
  bestLapTime: null,
  completedLaps: 0,
};

const initialSettings: GameSettings = {
  controlMode: 'touchZones',
};

export const useGameStore = create<GameState>((set, get) => ({
  carPosition: initialPosition,
  carVelocity: initialVelocity,
  carAngle: 0,
  lapData: initialLapData,
  settings: initialSettings,

  setCarVelocity: (velocity) => {
    set({ carVelocity: velocity });
  },

  setCarAngle: (angle) => {
    set({ carAngle: angle });
  },

  setControlMode: (mode) => {
    set((state) => ({
      settings: {
        ...state.settings,
        controlMode: mode,
      },
    }));
  },

  completeLap: () => {
    const { lapData } = get();
    const bestLapTime =
      lapData.bestLapTime === null
        ? lapData.currentLapTime
        : Math.min(lapData.bestLapTime, lapData.currentLapTime);

    set({
      lapData: {
        currentLap: lapData.currentLap + 1,
        currentLapTime: 0,
        bestLapTime,
        completedLaps: lapData.completedLaps + 1,
      },
    });
  },

  resetRace: () => {
    set({
      carPosition: initialPosition,
      carVelocity: initialVelocity,
      carAngle: 0,
      lapData: initialLapData,
    });
  },

  update: (dt) => {
    const { carPosition, carVelocity, lapData } = get();
    set({
      carPosition: {
        x: carPosition.x + carVelocity.x * dt,
        y: carPosition.y + carVelocity.y * dt,
      },
      lapData: {
        ...lapData,
        currentLapTime: lapData.currentLapTime + dt,
      },
    });
  },
}));

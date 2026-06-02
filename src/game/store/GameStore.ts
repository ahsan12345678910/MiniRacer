import { create } from 'zustand';

export interface CarState {
  position: {
    x: number;
    y: number;
  };
  velocity: {
    x: number;
    y: number;
  };
  angle: number; // in radians
  speed: number; // magnitude of velocity
  maxSpeed: number; // maximum speed for audio calculations
}

export interface LapData {
  currentLap: number;
  bestLapTime: number;
  currentLapTime: number;
  totalLaps: number;
  lapTimes: number[];
}

export interface GameSettings {
  inputMode: 'touchZones' | 'virtualJoystick';
  soundEnabled: boolean;
  musicEnabled: boolean;
  touchZones: {
    brakeButtonSize: number;
    brakeButtonMargin: number;
  };
  virtualJoystick: {
    size: number;
    deadZone: number;
    maxDistance: number;
    position: 'left' | 'right';
  };
}

export interface GameStoreState {
  car: CarState;
  lapData: LapData;
  isGameRunning: boolean;
  isPaused: boolean;
  score: number;
  level: number;
  settings: GameSettings;
}

interface GameStore extends GameStoreState {
  // Actions
  update: (deltaTime: number) => void;
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  stopGame: () => void;
  resetGame: () => void;
  
  // Direct mutation methods for fixed-step loop
  mutateCarPosition: (x: number, y: number) => void;
  mutateCarVelocity: (x: number, y: number) => void;
  mutateCarAngle: (angle: number) => void;
  mutateCarSpeed: (speed: number) => void;
  mutateLapTime: (time: number) => void;

  // Car controls
  setCarPosition: (x: number, y: number) => void;
  setCarVelocity: (x: number, y: number) => void;
  setCarAngle: (angle: number) => void;
  setCarMaxSpeed: (maxSpeed: number) => void;
  accelerate: (force: number) => void;
  brake: (force: number) => void;
  turn: (angle: number) => void;

  // Lap management
  startNewLap: () => void;
  finishLap: (lapTime: number) => void;
  updateLapTime: (time: number) => void;

  // Game state
  setScore: (score: number) => void;
  setLevel: (level: number) => void;

  // Settings
  updateSettings: (settings: Partial<GameSettings>) => void;
  setInputMode: (mode: 'touchZones' | 'virtualJoystick') => void;
  setSoundEnabled: (enabled: boolean) => void;
  setMusicEnabled: (enabled: boolean) => void;
}

const initialCarState: CarState = {
  position: { x: 0, y: 0 },
  velocity: { x: 0, y: 0 },
  angle: 0,
  speed: 0,
  maxSpeed: 10.0, // Default maximum speed
};

const initialLapData: LapData = {
  currentLap: 1,
  bestLapTime: 0,
  currentLapTime: 0,
  totalLaps: 3,
  lapTimes: [],
};

const initialSettings: GameSettings = {
  inputMode: 'touchZones',
  soundEnabled: true,
  musicEnabled: true,
  touchZones: {
    brakeButtonSize: 80,
    brakeButtonMargin: 20,
  },
  virtualJoystick: {
    size: 120,
    deadZone: 10,
    maxDistance: 60,
    position: 'left',
  },
};

const initialState: GameStoreState = {
  car: initialCarState,
  lapData: initialLapData,
  isGameRunning: false,
  isPaused: false,
  score: 0,
  level: 1,
  settings: initialSettings,
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  // Main update function called by the game loop
  update: (deltaTime: number) => {
    const state = get();

    if (!state.isGameRunning || state.isPaused) {
      return;
    }

    // Update car physics
    const { car } = state;
    const newPosition = {
      x: car.position.x + car.velocity.x * deltaTime,
      y: car.position.y + car.velocity.y * deltaTime,
    };

    const newSpeed = Math.sqrt(car.velocity.x ** 2 + car.velocity.y ** 2);

    // Update lap time
    const newLapTime = state.lapData.currentLapTime + deltaTime;

    set({
      car: {
        ...car,
        position: newPosition,
        speed: newSpeed,
      },
      lapData: {
        ...state.lapData,
        currentLapTime: newLapTime,
      },
    });
  },

  // Game control actions
  startGame: () => set({ isGameRunning: true, isPaused: false }),

  pauseGame: () => set({ isPaused: true }),

  resumeGame: () => set({ isPaused: false }),

  stopGame: () => set({ isGameRunning: false, isPaused: false }),

  resetGame: () =>
    set({
      ...initialState,
      lapData: {
        ...initialLapData,
        currentLap: 1,
      },
    }),

  // Car control actions
  setCarPosition: (x: number, y: number) =>
    set(state => {
      console.log('GameStore: Setting car position:', x, y);
      return {
        car: { ...state.car, position: { x, y } },
      };
    }),

  setCarVelocity: (x: number, y: number) =>
    set(state => {
      console.log('GameStore: Setting car velocity:', x, y);
      return {
        car: {
          ...state.car,
          velocity: { x, y },
          speed: Math.sqrt(x ** 2 + y ** 2),
        },
      };
    }),

  setCarAngle: (angle: number) =>
    set(state => {
      console.log('GameStore: Setting car angle:', angle);
      return {
        car: { ...state.car, angle },
      };
    }),

  setCarMaxSpeed: (maxSpeed: number) =>
    set(state => {
      console.log('GameStore: Setting car maxSpeed:', maxSpeed);
      return {
        car: { ...state.car, maxSpeed },
      };
    }),

  accelerate: (force: number) =>
    set(state => {
      const { car } = state;
      const acceleration = force * 0.001; // Scale down the force
      const newVelocityX = car.velocity.x + Math.cos(car.angle) * acceleration;
      const newVelocityY = car.velocity.y + Math.sin(car.angle) * acceleration;

      return {
        car: {
          ...car,
          velocity: { x: newVelocityX, y: newVelocityY },
          speed: Math.sqrt(newVelocityX ** 2 + newVelocityY ** 2),
        },
      };
    }),

  brake: (force: number) =>
    set(state => {
      const { car } = state;
      const deceleration = force * 0.001;
      const currentSpeed = Math.sqrt(car.velocity.x ** 2 + car.velocity.y ** 2);

      if (currentSpeed > 0) {
        const brakeFactor = Math.min(deceleration / currentSpeed, 1);
        const newVelocityX = car.velocity.x * (1 - brakeFactor);
        const newVelocityY = car.velocity.y * (1 - brakeFactor);

        return {
          car: {
            ...car,
            velocity: { x: newVelocityX, y: newVelocityY },
            speed: Math.sqrt(newVelocityX ** 2 + newVelocityY ** 2),
          },
        };
      }

      return state;
    }),

  turn: (angle: number) =>
    set(state => ({
      car: { ...state.car, angle: state.car.angle + angle },
    })),

  // Lap management
  startNewLap: () =>
    set(state => ({
      lapData: {
        ...state.lapData,
        currentLap: state.lapData.currentLap + 1,
        currentLapTime: 0,
      },
    })),

  finishLap: (lapTime: number) =>
    set(state => {
      const newLapTimes = [...state.lapData.lapTimes, lapTime];
      const newBestLapTime =
        state.lapData.bestLapTime === 0
          ? lapTime
          : Math.min(state.lapData.bestLapTime, lapTime);

      return {
        lapData: {
          ...state.lapData,
          lapTimes: newLapTimes,
          bestLapTime: newBestLapTime,
          currentLapTime: 0,
        },
      };
    }),

  updateLapTime: (time: number) =>
    set(state => ({
      lapData: { ...state.lapData, currentLapTime: time },
    })),

  // Game state
  setScore: (score: number) => set({ score }),

  setLevel: (level: number) => set({ level }),

  // Settings
  updateSettings: (newSettings: Partial<GameSettings>) =>
    set(state => ({
      settings: { ...state.settings, ...newSettings },
    })),

  setInputMode: (mode: 'touchZones' | 'virtualJoystick') =>
    set(state => ({
      settings: { ...state.settings, inputMode: mode },
    })),

  setSoundEnabled: (enabled: boolean) =>
    set(state => ({
      settings: { ...state.settings, soundEnabled: enabled },
    })),

  setMusicEnabled: (enabled: boolean) =>
    set(state => ({
      settings: { ...state.settings, musicEnabled: enabled },
    })),

  // Direct mutation methods for fixed-step loop (no setState per tick)
  mutateCarPosition: (x: number, y: number) => {
    const state = get();
    state.car.position.x = x;
    state.car.position.y = y;
  },

  mutateCarVelocity: (x: number, y: number) => {
    const state = get();
    state.car.velocity.x = x;
    state.car.velocity.y = y;
    state.car.speed = Math.sqrt(x ** 2 + y ** 2);
  },

  mutateCarAngle: (angle: number) => {
    const state = get();
    state.car.angle = angle;
  },

  mutateCarSpeed: (speed: number) => {
    const state = get();
    state.car.speed = speed;
  },

  mutateLapTime: (time: number) => {
    const state = get();
    state.lapData.currentLapTime = time;
  },
}));

/**
 * Headless Game State
 * 
 * Plain JavaScript objects for game physics state
 * - No React state dependencies
 * - Used only by the game loop
 * - Mutated directly by physics systems
 */

export interface Track {
  width: number;
  height: number;
  start: {
    x: number;
    y: number;
    angle: number;
  };
  surfaces: Array<{
    type: 'asphalt' | 'grass';
    rect: [number, number, number, number]; // [x, y, width, height]
  }>;
  walls: Array<[number, number, number, number]>; // [x1, y1, x2, y2]
  startLine: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    norm: [number, number]; // Normal vector [nx, ny]
  };
}

export interface CarState {
  x: number;
  y: number;
  angle: number;
  vx: number;
  vy: number;
}

export interface LapState {
  current: number;
  bestMs: number;
  lastCrossSide: number; // -1 or 1 for crossing direction
}

export interface GameCore {
  car: CarState;
  lap: LapState;
  track: Track | null;
}

export const makeInitialGame = (): GameCore => ({
  car: {
    x: 0,
    y: 0,
    angle: 0,
    vx: 0,
    vy: 0,
  },
  lap: {
    current: 1,
    bestMs: 0,
    lastCrossSide: 0,
  },
  track: null,
});

export const resetCarAtStart = (game: GameCore): void => {
  if (game.track) {
    game.car.x = game.track.start.x;
    game.car.y = game.track.start.y;
    game.car.angle = game.track.start.angle;
    game.car.vx = 0;
    game.car.vy = 0;
  }
};

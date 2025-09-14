// Game state management
export interface GameState {
  score: number;
  level: number;
  isGameOver: boolean;
  isPaused: boolean;
}

export const initialGameState: GameState = {
  score: 0,
  level: 1,
  isGameOver: false,
  isPaused: false,
};

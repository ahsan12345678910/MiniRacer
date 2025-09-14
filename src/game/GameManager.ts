import { getGameLoopManager } from './loop/GameLoopManager';
import { useGameStore } from './store/GameStore';

export class GameManager {
  private gameLoopManager = getGameLoopManager();

  startGame(): void {
    // Initialize game state
    useGameStore.getState().startGame();

    // Start the game loop
    this.gameLoopManager.start();

    console.log('Game started with 60 FPS fixed timestep');
  }

  stopGame(): void {
    // Stop the game loop
    this.gameLoopManager.stop();

    // Reset game state
    useGameStore.getState().stopGame();

    console.log('Game stopped');
  }

  pauseGame(): void {
    this.gameLoopManager.pause();
    console.log('Game paused');
  }

  resumeGame(): void {
    this.gameLoopManager.resume();
    console.log('Game resumed');
  }

  isGameRunning(): boolean {
    return this.gameLoopManager.isRunning();
  }

  getGameState() {
    return useGameStore.getState();
  }

  // Car control methods
  accelerate(force: number = 1): void {
    useGameStore.getState().accelerate(force);
  }

  brake(force: number = 1): void {
    useGameStore.getState().brake(force);
  }

  turn(angle: number): void {
    useGameStore.getState().turn(angle);
  }
}

// Singleton instance
let gameManager: GameManager | null = null;

export const getGameManager = (): GameManager => {
  if (!gameManager) {
    gameManager = new GameManager();
  }
  return gameManager;
};

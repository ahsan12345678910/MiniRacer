import { FixedStepLoop, GameLoopCallback } from './FixedStepLoop';
import { useGameStore } from '../store/GameStore';

export class GameLoopManager implements GameLoopCallback {
  private gameLoop: FixedStepLoop;

  constructor() {
    this.gameLoop = new FixedStepLoop(this);
  }

  // Implementation of GameLoopCallback
  update(deltaTime: number): void {
    // Call the store's update method with delta time
    useGameStore.getState().update(deltaTime);
  }

  // Game loop control methods
  start(): void {
    console.log('Starting game loop at 60 FPS');
    this.gameLoop.start();
  }

  stop(): void {
    console.log('Stopping game loop');
    this.gameLoop.stop();
  }

  pause(): void {
    useGameStore.getState().pauseGame();
  }

  resume(): void {
    useGameStore.getState().resumeGame();
  }

  isRunning(): boolean {
    return this.gameLoop.isActive();
  }

  getFPS(): number {
    return this.gameLoop.getFPS();
  }

  getFixedTimeStep(): number {
    return this.gameLoop.getFixedTimeStep();
  }
}

// Singleton instance
let gameLoopManager: GameLoopManager | null = null;

export const getGameLoopManager = (): GameLoopManager => {
  if (!gameLoopManager) {
    gameLoopManager = new GameLoopManager();
  }
  return gameLoopManager;
};

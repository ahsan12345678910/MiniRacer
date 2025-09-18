import { FixedStepLoop, GameLoopCallback } from './FixedStepLoop';

export class SimpleGameLoopManager implements GameLoopCallback {
  private gameLoop: FixedStepLoop;
  private gameIntegration: any = null;

  constructor() {
    this.gameLoop = new FixedStepLoop((dt: number) => this.update(dt));
  }

  // Set the game integration instance
  setGameIntegration(gameIntegration: any): void {
    this.gameIntegration = gameIntegration;
    console.log('🔄 SimpleGameLoopManager: Game integration set');
  }

  // Implementation of GameLoopCallback
  update(deltaTime: number): void {
    // ALWAYS log game loop updates for debugging
    console.log('🔄 SimpleGameLoopManager: Update called with deltaTime:', deltaTime.toFixed(3));
    
    // Update the game integration
    if (this.gameIntegration) {
      console.log('🔄 SimpleGameLoopManager: Calling game integration update');
      this.gameIntegration.update(deltaTime);
    } else {
      console.log('🔄 SimpleGameLoopManager: No game integration set!');
    }
  }

  // Game loop control methods
  start(): void {
    console.log('🔄 SimpleGameLoopManager: Starting game loop at 60 FPS');
    this.gameLoop.start();
  }

  stop(): void {
    console.log('🔄 SimpleGameLoopManager: Stopping game loop');
    this.gameLoop.stop();
  }

  pause(): void {
    console.log('🔄 SimpleGameLoopManager: Pausing game loop');
    this.gameLoop.stop();
  }

  resume(): void {
    console.log('🔄 SimpleGameLoopManager: Resuming game loop');
    this.gameLoop.start();
  }

  isRunning(): boolean {
    return this.gameLoop.isActive();
  }

  getFPS(): number {
    return 60; // Fixed step loop runs at 60 FPS
  }

  getFixedTimeStep(): number {
    return 1 / 60; // ~0.0167 seconds
  }
}

// Singleton instance
let simpleGameLoopManager: SimpleGameLoopManager | null = null;

export const getSimpleGameLoopManager = (): SimpleGameLoopManager => {
  if (!simpleGameLoopManager) {
    simpleGameLoopManager = new SimpleGameLoopManager();
  }
  return simpleGameLoopManager;
};

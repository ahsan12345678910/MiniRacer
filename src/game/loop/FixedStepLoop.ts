export interface GameLoopCallback {
  update(deltaTime: number): void;
}

export class FixedStepLoop {
  private isRunning: boolean = false;
  private animationFrameId: number | null = null;
  private lastTime: number = 0;
  private accumulator: number = 0;

  // Fixed timestep for 60 FPS
  private readonly fixedTimeStep: number = 1000 / 60; // ~16.67ms

  // Maximum frame time to prevent spiral of death
  private readonly maxFrameTime: number = 250; // 250ms max

  private callback: GameLoopCallback | null = null;

  constructor(callback: GameLoopCallback) {
    this.callback = callback;
  }

  start(): void {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    this.lastTime = performance.now();
    this.accumulator = 0;
    this.loop();
  }

  stop(): void {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private loop = (): void => {
    if (!this.isRunning) {
      return;
    }

    const currentTime = performance.now();
    let frameTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    // Prevent spiral of death by clamping frame time
    if (frameTime > this.maxFrameTime) {
      frameTime = this.maxFrameTime;
    }

    this.accumulator += frameTime;

    // Fixed timestep updates
    while (this.accumulator >= this.fixedTimeStep) {
      if (this.callback) {
        this.callback.update(this.fixedTimeStep);
      }
      this.accumulator -= this.fixedTimeStep;
    }

    // Continue the loop
    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  isActive(): boolean {
    return this.isRunning;
  }

  getFixedTimeStep(): number {
    return this.fixedTimeStep;
  }

  getFPS(): number {
    return 1000 / this.fixedTimeStep;
  }
}

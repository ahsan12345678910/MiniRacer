/**
 * Fixed Step Game Loop
 * 
 * Ref-driven game loop that runs at 60 FPS with fixed timestep
 * - Idempotent start/stop methods
 * - No React state dependencies
 * - Uses requestAnimationFrame with accumulator pattern
 */

export class FixedStepLoop {
  private running: boolean = false;
  private last: number = 0;
  private acc: number = 0;
  private animationFrameId: number | null = null;
  
  // Fixed timestep for 60 FPS
  private readonly dt: number = 1 / 60; // ~0.0167 seconds
  private readonly maxStepsPerFrame: number = 5;

  constructor(private update: (dt: number) => void) {}

  start(): void {
    if (this.running) {
      return; // NO-OP if already running
    }
    
    this.running = true;
    this.last = performance.now();
    this.acc = 0;
    
    const tick = () => {
      if (!this.running) {
        return;
      }
      
      const now = performance.now();
      let elapsed = (now - this.last) / 1000; // Convert to seconds
      this.last = now;
      
      // Clamp elapsed time to prevent spiral of death
      elapsed = Math.min(elapsed, 0.25);
      this.acc += elapsed;
      
      // Fixed timestep updates
      let steps = 0;
      while (this.acc >= this.dt && steps < this.maxStepsPerFrame) {
        this.update(this.dt);
        this.acc -= this.dt;
        steps++;
      }
      
      this.animationFrameId = requestAnimationFrame(tick);
    };
    
    requestAnimationFrame(tick);
  }

  stop(): void {
    if (!this.running) {
      return; // NO-OP if not running
    }
    
    this.running = false;
    
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  isRunning(): boolean {
    return this.running;
  }
}
import { useGameStore } from '../GameStore';

const FIXED_TIMESTEP_SECONDS = 1 / 60;
const MAX_FRAME_SECONDS = 0.25;

export class FixedStepLoop {
  private running = false;
  private rafId: number | null = null;
  private lastTimestampMs: number | null = null;
  private accumulatorSeconds = 0;

  start() {
    if (this.running) {
      return;
    }

    this.running = true;
    this.lastTimestampMs = null;
    this.accumulatorSeconds = 0;
    this.rafId = requestAnimationFrame(this.tick);
  }

  stop() {
    this.running = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.lastTimestampMs = null;
    this.accumulatorSeconds = 0;
  }

  private tick = (timestampMs: number) => {
    if (!this.running) {
      return;
    }

    if (this.lastTimestampMs === null) {
      this.lastTimestampMs = timestampMs;
      this.rafId = requestAnimationFrame(this.tick);
      return;
    }

    const frameSeconds = Math.min((timestampMs - this.lastTimestampMs) / 1000, MAX_FRAME_SECONDS);
    this.lastTimestampMs = timestampMs;
    this.accumulatorSeconds += frameSeconds;

    const store = useGameStore.getState();
    while (this.accumulatorSeconds >= FIXED_TIMESTEP_SECONDS) {
      store.update(FIXED_TIMESTEP_SECONDS);
      this.accumulatorSeconds -= FIXED_TIMESTEP_SECONDS;
    }

    this.rafId = requestAnimationFrame(this.tick);
  };
}

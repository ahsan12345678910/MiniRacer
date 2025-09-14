// Game engine logic
export class GameEngine {
  private isRunning: boolean = false;
  private score: number = 0;

  start(): void {
    this.isRunning = true;
    this.score = 0;
  }

  stop(): void {
    this.isRunning = false;
  }

  update(): void {
    if (this.isRunning) {
      // Game update logic will be implemented here
    }
  }

  getScore(): number {
    return this.score;
  }

  isGameRunning(): boolean {
    return this.isRunning;
  }
}

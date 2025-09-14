import { CarModel, CarControls } from './physics/CarModel';
import { Track } from './track/Track';
import { loadDefaultTrack } from './track/TrackLoader';
import { CollisionSystem } from './collision/Collision';
import { useGameStore } from './store/GameStore';
import { LapSystem, LapSystemEvents } from './LapSystem';

/**
 * Integrated game system combining track, physics, and collision
 */
export class GameIntegration {
  private car: CarModel;
  private track: Track | null = null;
  private collisionSystem: CollisionSystem;
  private lapSystem: LapSystem | null = null;
  private controls: CarControls = {
    accelerate: false,
    brake: false,
    turnLeft: false,
    turnRight: false,
  };

  constructor() {
    this.car = new CarModel({ x: 0, y: 0 }, 0);
    this.collisionSystem = new CollisionSystem();
  }

  /**
   * Initialize the game with a track
   */
  async initialize(lapEvents?: Partial<LapSystemEvents>): Promise<void> {
    try {
      // Load the track
      this.track = await loadDefaultTrack();
      this.collisionSystem.setTrack(this.track);

      // Initialize lap system
      this.lapSystem = new LapSystem(this.track, this.track.getLaps());
      if (lapEvents) {
        this.lapSystem.setEvents(lapEvents);
      }

      // Set car to start position
      const startPos = this.track.getStartPosition();
      this.car.resetToStart(startPos, startPos.angle);

      // Update game store
      this.updateGameStore();

      console.log(`Game initialized with track: ${this.track.getData().name}`);
    } catch (error) {
      console.error('Failed to initialize game:', error);
      throw error;
    }
  }

  /**
   * Update game state (called by game loop)
   */
  update(deltaTime: number): void {
    if (!this.track) {
      return;
    }

    // Get surface properties at car position
    const carState = this.car.getState();
    const surface = this.track.getSurfaceAt(
      carState.position.x,
      carState.position.y
    );

    // Convert surface properties to physics format
    const surfaceProperties = {
      friction: surface.friction,
      grip: surface.grip,
      roughness: surface.roughness,
    };

    // Update car physics
    this.car.update(deltaTime, this.controls, surfaceProperties);

    // Check for collisions
    const collisionResult = this.collisionSystem.resolveBarrierCollision(
      this.car
    );
    if (collisionResult.hasCollision) {
      console.log('Collision detected:', collisionResult.collisionType);
    }

    // Check for checkpoints
    const checkpointResult = this.collisionSystem.checkCheckpointCollision(
      this.car
    );
    if (checkpointResult.hasCollision) {
      console.log('Checkpoint reached!');
      // Handle checkpoint logic here
    }

    // Check for finish line
    const finishResult = this.collisionSystem.checkFinishLineCollision(
      this.car
    );
    if (finishResult.hasCollision) {
      console.log('Finish line crossed!');
      // Handle finish line logic here
    }

    // Update lap system
    if (this.lapSystem) {
      this.lapSystem.update(this.car, deltaTime);
    }

    // Update game store
    this.updateGameStore();
  }

  /**
   * Update game store with current car state
   */
  private updateGameStore(): void {
    const carState = this.car.getState();
    useGameStore
      .getState()
      .setCarPosition(carState.position.x, carState.position.y);
    useGameStore
      .getState()
      .setCarVelocity(carState.velocity.x, carState.velocity.y);
    useGameStore.getState().setCarAngle(carState.angle);
  }

  /**
   * Set control inputs
   */
  setControls(controls: Partial<CarControls>): void {
    this.controls = { ...this.controls, ...controls };
  }

  /**
   * Get current car state
   */
  getCarState() {
    return this.car.getState();
  }

  /**
   * Get current track
   */
  getTrack(): Track | null {
    return this.track;
  }

  /**
   * Get surface at position
   */
  getSurfaceAt(x: number, y: number) {
    if (!this.track) {
      return {
        type: 'grass',
        friction: 0.85,
        grip: 0.7,
        roughness: 0.8,
        isCollidable: false,
        isCheckpoint: false,
      };
    }
    return this.track.getSurfaceAt(x, y);
  }

  /**
   * Reset car to start position
   */
  resetCar(): void {
    if (!this.track) {
      return;
    }

    const startPos = this.track.getStartPosition();
    this.car.resetToStart(startPos, startPos.angle);
    this.updateGameStore();
  }

  /**
   * Get track information
   */
  getTrackInfo() {
    if (!this.track) {
      return null;
    }

    return {
      name: this.track.getData().name,
      difficulty: this.track.getDifficulty(),
      laps: this.track.getLaps(),
      dimensions: this.track.getDimensions(),
      checkpoints: this.track.getCheckpoints(),
    };
  }

  /**
   * Check if car is on track
   */
  isCarOnTrack(): boolean {
    if (!this.track) {
      return false;
    }

    const carState = this.car.getState();
    const surface = this.track.getSurfaceAt(
      carState.position.x,
      carState.position.y
    );
    return (
      surface.type === 'asphalt' ||
      surface.type === 'startLine' ||
      surface.type === 'finishLine'
    );
  }

  /**
   * Get car's current surface type
   */
  getCurrentSurfaceType(): string {
    if (!this.track) {
      return 'grass';
    }

    const carState = this.car.getState();
    const surface = this.track.getSurfaceAt(
      carState.position.x,
      carState.position.y
    );
    return surface.type;
  }

  /**
   * Get lap system
   */
  getLapSystem(): LapSystem | null {
    return this.lapSystem;
  }

  /**
   * Reset lap system for new race
   */
  resetLapSystem(): void {
    if (this.lapSystem) {
      this.lapSystem.reset();
    }
  }

  /**
   * Set lap system events
   */
  setLapEvents(events: Partial<LapSystemEvents>): void {
    if (this.lapSystem) {
      this.lapSystem.setEvents(events);
    }
  }
}

// Singleton instance
let gameIntegration: GameIntegration | null = null;

export const getGameIntegration = (): GameIntegration => {
  if (!gameIntegration) {
    gameIntegration = new GameIntegration();
  }
  return gameIntegration;
};

// Helper function to create new game integration
export const createGameIntegration = (): GameIntegration => {
  return new GameIntegration();
};

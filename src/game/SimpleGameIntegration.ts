/**
 * Simple Game Integration
 * 
 * Simplified game integration with proper input handling and comprehensive logging
 */

import { SimpleCar, SimpleCarInputs } from './SimpleCarMovement';
import { Track } from './track/Track';
import { loadDefaultTrack } from './track/TrackLoader';
import { controlsRef } from './input/InputManager';
import { Camera, createCamera } from './camera/Camera';

export class SimpleGameIntegration {
  private car: SimpleCar;
  private track: Track | null = null;
  private camera: Camera;
  private lastUpdateTime: number = 0;
  private updateCount: number = 0;

  constructor(screenWidth: number = 400, screenHeight: number = 800) {
    this.car = new SimpleCar({ x: 0, y: 0 }, 0);
    this.camera = createCamera(screenWidth, screenHeight);
    console.log('🎮 SimpleGameIntegration: Created');
  }

  /**
   * Initialize the game with a track
   */
  async initialize(): Promise<void> {
    try {
      console.log('🎮 SimpleGameIntegration: Initializing...');
      
      // Load the track
      this.track = await loadDefaultTrack();
      console.log('🎮 SimpleGameIntegration: Track loaded:', this.track.getData().name);

      // Set car to start position
      const startPos = this.track.getStartPosition();
      this.car.resetToStart(startPos, startPos.angle);
      console.log('🎮 SimpleGameIntegration: Car positioned at start:', startPos);

      // Set camera to follow the car
      this.camera.setPosition(startPos.x, startPos.y);
      console.log('🎮 SimpleGameIntegration: Camera positioned at:', startPos);

      console.log('🎮 SimpleGameIntegration: Initialization complete');
    } catch (error) {
      console.error('🎮 SimpleGameIntegration: Failed to initialize:', error);
      throw error;
    }
  }

  /**
   * Update game state (called by game loop)
   */
  update(deltaTime: number): void {
    this.updateCount++;
    const currentTime = Date.now();
    const shouldLog = currentTime - this.lastUpdateTime > 2000; // Log every 2 seconds

    if (shouldLog) {
      console.log('🎮 SimpleGameIntegration: Update #' + this.updateCount, 'deltaTime:', deltaTime.toFixed(3));
      this.lastUpdateTime = currentTime;
    }

    if (!this.track) {
      if (shouldLog) {
        console.log('🎮 SimpleGameIntegration: No track available for update');
      }
      return;
    }

    // Get current controls from the global ref
    const currentControls = controlsRef.current;
    
    if (shouldLog && (currentControls.throttle > 0 || currentControls.brake > 0 || Math.abs(currentControls.steer) > 0.1)) {
      console.log('🎮 SimpleGameIntegration: Active controls detected:', currentControls);
    }

    // Convert controls to car inputs
    const carInputs: SimpleCarInputs = {
      steer: currentControls.steer,
      throttle: currentControls.throttle,
      brake: currentControls.brake,
    };

    // Update car physics
    this.car.update(deltaTime, carInputs);

    // Update camera to follow the car
    const carState = this.car.getState();
    this.camera.setTarget(carState.x, carState.y);
    this.camera.update(deltaTime);

    if (shouldLog) {
      console.log('🎮 SimpleGameIntegration: Car state after update:', {
        position: { x: carState.x.toFixed(2), y: carState.y.toFixed(2) },
        velocity: { x: carState.vx.toFixed(2), y: carState.vy.toFixed(2) },
        speed: carState.speed.toFixed(2),
        angle: (carState.angle * 180 / Math.PI).toFixed(1) + '°'
      });
    }
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
   * Reset car to start position
   */
  resetCar(): void {
    if (!this.track) {
      console.log('🎮 SimpleGameIntegration: Cannot reset car - no track');
      return;
    }

    const startPos = this.track.getStartPosition();
    this.car.resetToStart(startPos, startPos.angle);
    console.log('🎮 SimpleGameIntegration: Car reset to start position');
  }

  /**
   * Get camera instance
   */
  getCamera(): Camera {
    return this.camera;
  }

  /**
   * Convert world coordinates to screen coordinates
   */
  worldToScreen(worldX: number, worldY: number): { x: number; y: number } {
    return this.camera.worldToScreen(worldX, worldY);
  }

  /**
   * Convert screen coordinates to world coordinates
   */
  screenToWorld(screenX: number, screenY: number): { x: number; y: number } {
    return this.camera.screenToWorld(screenX, screenY);
  }

  /**
   * Update camera screen dimensions
   */
  updateCameraDimensions(width: number, height: number): void {
    this.camera.updateScreenDimensions(width, height);
  }

  /**
   * Get car configuration
   */
  getCarConfig() {
    return this.car.getConfig();
  }

  /**
   * Update car configuration
   */
  updateCarConfig(newConfig: Partial<any>): void {
    this.car.updateConfig(newConfig);
  }

}

// Singleton instance
let simpleGameIntegration: SimpleGameIntegration | null = null;

export const getSimpleGameIntegration = (): SimpleGameIntegration => {
  if (!simpleGameIntegration) {
    simpleGameIntegration = new SimpleGameIntegration();
  }
  return simpleGameIntegration;
};

// Helper function to create new game integration
export const createSimpleGameIntegration = (): SimpleGameIntegration => {
  return new SimpleGameIntegration();
};

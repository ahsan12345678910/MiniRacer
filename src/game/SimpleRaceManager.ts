/**
 * Simple Race Manager
 * 
 * A working race manager that actually moves cars when the race starts
 */

import { SimpleCar, SimpleCarInputs } from './SimpleCarMovement';
import { controlsRef } from './input/InputManager';

export interface SimpleRaceState {
  playerCar: SimpleCar;
  aiCars: SimpleCar[];
  raceStarted: boolean;
  raceTime: number;
  playerPosition: { x: number; y: number };
  aiPositions: Array<{ x: number; y: number }>;
}

export class SimpleRaceManager {
  private state: SimpleRaceState;
  private lastLogTime: number = 0;

  constructor() {
    // Create player car
    const playerCar = new SimpleCar({ x: 200, y: 300 }, 0);
    
    // Create AI cars
    const aiCars = [
      new SimpleCar({ x: 250, y: 300 }, 0),
      new SimpleCar({ x: 200, y: 350 }, 0),
      new SimpleCar({ x: 250, y: 350 }, 0),
    ];

    this.state = {
      playerCar,
      aiCars,
      raceStarted: false,
      raceTime: 0,
      playerPosition: { x: 200, y: 300 },
      aiPositions: [
        { x: 250, y: 300 },
        { x: 200, y: 350 },
        { x: 250, y: 350 },
      ],
    };

    console.log('🏁 SimpleRaceManager: Created with', aiCars.length, 'AI cars');
  }

  /**
   * Start the race
   */
  startRace(): void {
    this.state.raceStarted = true;
    this.state.raceTime = 0;
    console.log('🏁 SimpleRaceManager: Race started!');
  }

  /**
   * Stop the race
   */
  stopRace(): void {
    this.state.raceStarted = false;
    console.log('🏁 SimpleRaceManager: Race stopped!');
  }

  /**
   * Reset the race
   */
  resetRace(): void {
    this.state.raceStarted = false;
    this.state.raceTime = 0;
    
    // Reset player car
    this.state.playerCar.resetToStart({ x: 200, y: 300 }, 0);
    
    // Reset AI cars
    this.state.aiCars.forEach((car, index) => {
      const positions = [
        { x: 250, y: 300 },
        { x: 200, y: 350 },
        { x: 250, y: 350 },
      ];
      car.resetToStart(positions[index], 0);
    });

    console.log('🏁 SimpleRaceManager: Race reset!');
  }

  /**
   * Update the race (required by game loop)
   */
  update(deltaTime: number): void {
    const currentTime = Date.now();
    const shouldLog = currentTime - this.lastLogTime > 2000; // Log every 2 seconds

    if (!this.state.raceStarted) {
      if (shouldLog) {
        console.log('🏁 SimpleRaceManager: Race not started, skipping update');
      }
      return;
    }

    if (shouldLog) {
      console.log('🏁 SimpleRaceManager: Updating race, time:', this.state.raceTime.toFixed(1));
      this.lastLogTime = currentTime;
    }

    // Update race time
    this.state.raceTime += deltaTime;

    // Get player controls
    const playerControls = controlsRef.current;
    const playerInputs: SimpleCarInputs = {
      steer: playerControls.steer,
      throttle: playerControls.throttle,
      brake: playerControls.brake,
    };

    // Update player car
    this.state.playerCar.update(deltaTime, playerInputs);
    const playerState = this.state.playerCar.getState();
    this.state.playerPosition = { x: playerState.x, y: playerState.y };

    // Update AI cars with simple AI behavior
    this.state.aiCars.forEach((aiCar, index) => {
      const aiInputs = this.generateAIInputs(aiCar, index);
      aiCar.update(deltaTime, aiInputs);
      const aiState = aiCar.getState();
      this.state.aiPositions[index] = { x: aiState.x, y: aiState.y };
    });

    if (shouldLog) {
      console.log('🏁 SimpleRaceManager: Player position:', this.state.playerPosition);
      console.log('🏁 SimpleRaceManager: AI positions:', this.state.aiPositions);
    }
  }

  /**
   * Generate AI inputs for a car
   */
  private generateAIInputs(aiCar: SimpleCar, index: number): SimpleCarInputs {
    const carState = aiCar.getState();
    
    // Simple AI: drive in a circle pattern
    const time = this.state.raceTime;
    const radius = 50;
    const centerX = 200 + (index * 50);
    const centerY = 300;
    
    const targetX = centerX + Math.cos(time * 0.5) * radius;
    const targetY = centerY + Math.sin(time * 0.5) * radius;
    
    // Calculate direction to target
    const dx = targetX - carState.x;
    const dy = targetY - carState.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < 5) {
      // Close to target, slow down
      return { steer: 0, throttle: 0.3, brake: 0 };
    }
    
    // Calculate steering
    const targetAngle = Math.atan2(dy, dx);
    const angleDiff = this.normalizeAngle(targetAngle - carState.angle);
    const steer = Math.max(-1, Math.min(1, angleDiff * 2));
    
    // Calculate throttle
    const throttle = Math.min(1, distance / 20);
    
    return { steer, throttle, brake: 0 };
  }

  /**
   * Normalize angle to [-π, π]
   */
  private normalizeAngle(angle: number): number {
    while (angle > Math.PI) angle -= 2 * Math.PI;
    while (angle < -Math.PI) angle += 2 * Math.PI;
    return angle;
  }

  /**
   * Get race state
   */
  getState(): SimpleRaceState {
    return { ...this.state };
  }

  /**
   * Get player car
   */
  getPlayerCar(): SimpleCar {
    return this.state.playerCar;
  }

  /**
   * Get AI cars
   */
  getAICars(): SimpleCar[] {
    return this.state.aiCars;
  }

  /**
   * Get player position
   */
  getPlayerPosition(): { x: number; y: number } {
    return this.state.playerPosition;
  }

  /**
   * Get AI positions
   */
  getAIPositions(): Array<{ x: number; y: number }> {
    return this.state.aiPositions;
  }

  /**
   * Check if race is started
   */
  isRaceStarted(): boolean {
    return this.state.raceStarted;
  }

  /**
   * Get race time
   */
  getRaceTime(): number {
    return this.state.raceTime;
  }
}

// Singleton instance
let simpleRaceManager: SimpleRaceManager | null = null;

export const getSimpleRaceManager = (): SimpleRaceManager => {
  if (!simpleRaceManager) {
    simpleRaceManager = new SimpleRaceManager();
  }
  return simpleRaceManager;
};

/**
 * Simple Race Manager
 * 
 * A working race manager that actually moves cars when the race starts
 */

import { SimpleCar, SimpleCarInputs } from './SimpleCarMovement';
import { controlsRef } from './input/InputManager';
import { createRaceTrack } from './track/TrackDesign';

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
  private track = createRaceTrack();

  constructor() {
    // Create player car at start line
    const playerCar = new SimpleCar({ x: 250, y: 100 }, 0);
    
    // Create AI cars at different positions on the track
    const aiCars = [
      new SimpleCar({ x: 280, y: 100 }, 0),
      new SimpleCar({ x: 320, y: 100 }, 0),
      new SimpleCar({ x: 350, y: 100 }, 0),
    ];

    this.state = {
      playerCar,
      aiCars,
      raceStarted: true, // Start race by default
      raceTime: 0,
      playerPosition: { x: 250, y: 100 },
      aiPositions: [
        { x: 280, y: 100 },
        { x: 320, y: 100 },
        { x: 350, y: 100 },
      ],
    };

    console.log('🏁 SimpleRaceManager: Created with', aiCars.length, 'AI cars');
    console.log('🏁 SimpleRaceManager: Race started by default:', this.state.raceStarted);
  }

  /**
   * Start the race
   */
  startRace(): void {
    console.log('🏁 SimpleRaceManager: startRace() called');
    console.log('🏁 SimpleRaceManager: Previous race state:', this.state.raceStarted);
    
    this.state.raceStarted = true;
    this.state.raceTime = 0;
    
    console.log('🏁 SimpleRaceManager: Race started!');
    console.log('🏁 SimpleRaceManager: New race state:', this.state.raceStarted);
    console.log('🏁 SimpleRaceManager: Player car can now move!');
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
    
    // Reset player car to start line
    this.state.playerCar.resetToStart({ x: 250, y: 100 }, 0);
    
    // Reset AI cars to different positions on track
    this.state.aiCars.forEach((car, index) => {
      const positions = [
        { x: 280, y: 100 },
        { x: 320, y: 100 },
        { x: 350, y: 100 },
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
    const shouldLog = currentTime - this.lastLogTime > 1000; // Log every 1 second for more frequent updates

    // ALWAYS log race state for debugging
    console.log('🏁 SimpleRaceManager: Update called - raceStarted:', this.state.raceStarted, 'deltaTime:', deltaTime.toFixed(3));

    if (!this.state.raceStarted) {
      console.log('🏁 SimpleRaceManager: Race not started, skipping update');
      console.log('🏁 SimpleRaceManager: Race state:', this.state.raceStarted);
      return;
    }

    if (shouldLog) {
      console.log('🏁 SimpleRaceManager: Updating race, time:', this.state.raceTime.toFixed(1));
      this.lastLogTime = currentTime;
    }

    // Update race time
    this.state.raceTime += deltaTime;

    // Get player controls with detailed logging
    const playerControls = controlsRef.current;
    console.log('🏁 SimpleRaceManager: Raw controls from controlsRef:', playerControls);
    
    const playerInputs: SimpleCarInputs = {
      steer: playerControls.steer,
      throttle: playerControls.throttle,
      brake: playerControls.brake,
    };

    // ALWAYS log player inputs for debugging
    console.log('🏁 SimpleRaceManager: Player inputs:', playerInputs);

    // Log player car state before update
    const playerStateBefore = this.state.playerCar.getState();
    console.log('🏁 SimpleRaceManager: Player car state BEFORE update:', playerStateBefore);

    // Update player car
    this.state.playerCar.update(deltaTime, playerInputs);
    const playerState = this.state.playerCar.getState();
    this.state.playerPosition = { x: playerState.x, y: playerState.y };

    // Log player car state after update
    console.log('🏁 SimpleRaceManager: Player car state AFTER update:', playerState);
    console.log('🏁 SimpleRaceManager: Player position updated to:', this.state.playerPosition);

    // Update AI cars with simple AI behavior
    this.state.aiCars.forEach((aiCar, index) => {
      const aiStateBefore = aiCar.getState();
      console.log(`🏁 SimpleRaceManager: AI car ${index} state BEFORE update:`, aiStateBefore);
      
      const aiInputs = this.generateAIInputs(aiCar, index);
      console.log(`🏁 SimpleRaceManager: AI car ${index} inputs:`, aiInputs);
      
      aiCar.update(deltaTime, aiInputs);
      const aiState = aiCar.getState();
      this.state.aiPositions[index] = { x: aiState.x, y: aiState.y };
      
      console.log(`🏁 SimpleRaceManager: AI car ${index} state AFTER update:`, aiState);
    });

    // ALWAYS log final positions
    console.log('🏁 SimpleRaceManager: Final player position:', this.state.playerPosition);
    console.log('🏁 SimpleRaceManager: Final AI positions:', this.state.aiPositions);
  }

  /**
   * Generate AI inputs for a car to follow the track
   */
  private generateAIInputs(aiCar: SimpleCar, index: number): SimpleCarInputs {
    const carState = aiCar.getState();
    
    // Define a proper racing line that follows the actual track layout
    const racingLine = [
      { x: 250, y: 100 }, // Start line
      { x: 350, y: 100 }, // Main straight
      { x: 450, y: 100 }, // Main straight end
      { x: 500, y: 100 }, // Turn 1 approach
      { x: 520, y: 120 }, // Turn 1
      { x: 520, y: 140 }, // Turn 1 exit
      { x: 600, y: 140 }, // Back straight
      { x: 640, y: 160 }, // Turn 2
      { x: 640, y: 180 }, // Turn 2 exit
      { x: 600, y: 200 }, // Turn 3
      { x: 580, y: 200 }, // Turn 3 exit
      { x: 540, y: 200 }, // Turn 4
      { x: 520, y: 180 }, // Turn 4 exit
      { x: 500, y: 160 }, // Turn 5
      { x: 480, y: 140 }, // Turn 5 exit
      { x: 420, y: 140 }, // Turn 6
      { x: 400, y: 120 }, // Turn 6 exit
      { x: 350, y: 100 }, // Turn 7
      { x: 300, y: 100 }, // Back to start
    ];
    
    // Find the closest waypoint to the car
    let closestIndex = 0;
    let closestDistance = Infinity;
    
    for (let i = 0; i < racingLine.length; i++) {
      const waypoint = racingLine[i];
      const dx = waypoint.x - carState.x;
      const dy = waypoint.y - carState.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = i;
      }
    }
    
    // Target the next waypoint in the racing line with some variation
    const targetIndex = (closestIndex + 1) % racingLine.length;
    const baseTarget = racingLine[targetIndex];
    
    // Add some variation to make AI cars take different lines
    const variation = (index - 1) * 10; // Each AI car gets a different offset
    const target = {
      x: baseTarget.x + variation,
      y: baseTarget.y + variation * 0.5
    };
    
    // Calculate direction to target
    const dx = target.x - carState.x;
    const dy = target.y - carState.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < 15) {
      // Close to target, slow down slightly
      return { steer: 0, throttle: 0.6, brake: 0 };
    }
    
    // Calculate steering to face the target
    const targetAngle = Math.atan2(dy, dx);
    const angleDiff = this.normalizeAngle(targetAngle - carState.angle);
    const steer = Math.max(-1, Math.min(1, angleDiff * 1.5)); // Reduced steering sensitivity
    
    // Calculate throttle based on distance and current speed
    const currentSpeed = carState.speed;
    const maxSpeed = 10.0; // Reduced AI speed for better control
    const throttle = currentSpeed < maxSpeed ? 0.6 : 0.3; // Reduced throttle for smoother movement
    
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

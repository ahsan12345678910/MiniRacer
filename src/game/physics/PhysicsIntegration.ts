import {
  CarModel,
  CarControls,
  SURFACE_TYPES,
  createCarPreset,
} from './CarModel';
import { useGameStore } from '../store/GameStore';

/**
 * Integration between CarModel physics and the game store
 */
export class PhysicsIntegration {
  private car: CarModel;
  private controls: CarControls = {
    accelerate: false,
    brake: false,
    turnLeft: false,
    turnRight: false,
  };

  constructor() {
    // Create a sports car at starting position
    this.car = createCarPreset('sports', { x: 0, y: 0 }, 0);
  }

  /**
   * Update physics and sync with game store
   */
  update(deltaTime: number): void {
    // Get current surface (in a real game, this would be determined by car position)
    const surface = SURFACE_TYPES.ASPHALT;

    // Update car physics
    this.car.update(deltaTime, this.controls, surface);

    // Get updated car state
    const carState = this.car.getState();

    // Update the game store with new car state
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
   * Get current car state from physics model
   */
  getCarState() {
    return this.car.getState();
  }

  /**
   * Reset car to starting line
   */
  resetToStart(startPosition: { x: number; y: number } = { x: 0, y: 0 }): void {
    this.car.resetToStart(startPosition, 0);

    // Also reset the game store
    useGameStore.getState().setCarPosition(startPosition.x, startPosition.y);
    useGameStore.getState().setCarVelocity(0, 0);
    useGameStore.getState().setCarAngle(0);
  }

  /**
   * Switch car type and update store
   */
  switchCarType(carType: 'sports' | 'rally' | 'truck' | 'formula'): void {
    const currentState = this.car.getState();
    this.car = createCarPreset(
      carType,
      currentState.position,
      currentState.angle
    );

    // Update store with new car state
    useGameStore
      .getState()
      .setCarPosition(currentState.position.x, currentState.position.y);
    useGameStore
      .getState()
      .setCarVelocity(currentState.velocity.x, currentState.velocity.y);
    useGameStore.getState().setCarAngle(currentState.angle);
  }

  /**
   * Get car parameters for display/debugging
   */
  getCarParameters() {
    return {
      maxSpeed: this.car.maxSpeed,
      acceleration: this.car.acceleration,
      brakePower: this.car.brakePower,
      friction: this.car.friction,
      turnRate: this.car.turnRate,
      mass: this.car.mass,
    };
  }

  /**
   * Update car parameters
   */
  updateCarParameters(
    parameters: Partial<{
      maxSpeed: number;
      acceleration: number;
      brakePower: number;
      friction: number;
      turnRate: number;
      mass: number;
    }>
  ): void {
    this.car.updateParameters(parameters);
  }
}

// Singleton instance for global access
let physicsIntegration: PhysicsIntegration | null = null;

export const getPhysicsIntegration = (): PhysicsIntegration => {
  if (!physicsIntegration) {
    physicsIntegration = new PhysicsIntegration();
  }
  return physicsIntegration;
};

/**
 * Helper functions for common operations
 */
export const createPhysicsIntegration = (): PhysicsIntegration => {
  return new PhysicsIntegration();
};

/**
 * Example of how to use in a React component
 */
export const usePhysicsControls = () => {
  const physics = getPhysicsIntegration();

  const handleAccelerate = (pressed: boolean) => {
    physics.setControls({ accelerate: pressed });
  };

  const handleBrake = (pressed: boolean) => {
    physics.setControls({ brake: pressed });
  };

  const handleTurnLeft = (pressed: boolean) => {
    physics.setControls({ turnLeft: pressed });
  };

  const handleTurnRight = (pressed: boolean) => {
    physics.setControls({ turnRight: pressed });
  };

  const resetCar = () => {
    physics.resetToStart();
  };

  const switchCarType = (carType: 'sports' | 'rally' | 'truck' | 'formula') => {
    physics.switchCarType(carType);
  };

  return {
    handleAccelerate,
    handleBrake,
    handleTurnLeft,
    handleTurnRight,
    resetCar,
    switchCarType,
    getCarState: () => physics.getCarState(),
    getCarParameters: () => physics.getCarParameters(),
  };
};

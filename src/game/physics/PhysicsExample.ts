import { CarModel, CarControls, SURFACE_TYPES, createCarPreset } from './CarModel';

/**
 * Example of how to use the CarModel with the game loop
 */
export class PhysicsExample {
  private car: CarModel;
  private controls: CarControls = {
    accelerate: false,
    brake: false,
    turnLeft: false,
    turnRight: false,
  };

  constructor() {
    // Create a sports car at starting position
    this.car = createCarPreset('sports', { x: 100, y: 100 }, 0);
  }

  /**
   * Update physics (called by game loop)
   */
  update(deltaTime: number): void {
    // Update car physics with current controls and surface
    this.car.update(deltaTime, this.controls, SURFACE_TYPES.ASPHALT);
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
   * Reset car to starting line
   */
  resetToStart(): void {
    this.car.resetToStart({ x: 100, y: 100 }, 0);
  }

  /**
   * Example of different surface types
   */
  switchToSurface(surfaceType: 'asphalt' | 'grass' | 'dirt' | 'ice' | 'sand'): void {
    // In a real game, you'd use this to determine surface properties
    console.log(`Switched to ${surfaceType} surface`);
  }

  /**
   * Example of car presets
   */
  switchCarType(carType: 'sports' | 'rally' | 'truck' | 'formula'): void {
    const currentState = this.car.getState();
    this.car = createCarPreset(carType, currentState.position, currentState.angle);
    console.log(`Switched to ${carType} car`);
  }
}

/**
 * Example usage in a React component
 */
export const createPhysicsExample = () => {
  const physics = new PhysicsExample();

  // Example game loop integration
  const gameLoop = (deltaTime: number) => {
    physics.update(deltaTime);
    
    // Get updated car state
    const carState = physics.getCarState();
    console.log('Car position:', carState.position);
    console.log('Car speed:', carState.speed);
  };

  // Example control handling
  const handleKeyPress = (key: string, pressed: boolean) => {
    switch (key) {
      case 'ArrowUp':
        physics.setControls({ accelerate: pressed });
        break;
      case 'ArrowDown':
        physics.setControls({ brake: pressed });
        break;
      case 'ArrowLeft':
        physics.setControls({ turnLeft: pressed });
        break;
      case 'ArrowRight':
        physics.setControls({ turnRight: pressed });
        break;
    }
  };

  return {
    physics,
    gameLoop,
    handleKeyPress,
  };
};

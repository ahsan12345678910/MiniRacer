// Re-export all types from InputManager for external use
export type {
  Controls,
  TouchZone,
  JoystickState,
  InputSettings,
  InputMode,
} from './InputManager';

// Additional types for integration
export interface CarControls {
  accelerate: boolean;
  brake: boolean;
  turnLeft: boolean;
  turnRight: boolean;
}

// Conversion utilities
export const controlsToCarControls = (controls: import('./InputManager').Controls): CarControls => {
  return {
    accelerate: controls.throttle > 0,
    brake: controls.brake > 0,
    turnLeft: controls.steer < -0.1,
    turnRight: controls.steer > 0.1,
  };
};

export const carControlsToControls = (carControls: CarControls): import('./InputManager').Controls => {
  return {
    steer: carControls.turnLeft ? -1 : carControls.turnRight ? 1 : 0,
    throttle: carControls.accelerate ? 1 : 0,
    brake: carControls.brake ? 1 : 0,
  };
};

/**
 * Simple Car Movement System
 * 
 * Simplified car movement with comprehensive logging for debugging
 */

import { CarState } from './state/GameState';

export interface SimpleCarInputs {
  steer: number; // -1 to 1
  throttle: number; // 0 to 1
  brake: number; // 0 to 1
}

export interface SimpleCarConfig {
  maxSpeed: number;
  acceleration: number;
  brakePower: number;
  friction: number;
  turnRate: number;
}

export class SimpleCar {
  private state: CarState;
  private config: SimpleCarConfig;
  private lastLogTime: number = 0;

  constructor(initialPosition: { x: number; y: number }, initialAngle: number = 0) {
    this.state = {
      x: initialPosition.x,
      y: initialPosition.y,
      vx: 0,
      vy: 0,
      angle: initialAngle,
      speed: 0,
    };

    this.config = {
      maxSpeed: 15, // Reduced for easier control
      acceleration: 8, // Reduced for easier control
      brakePower: 12, // Reduced for easier control
      friction: 0.95, // Higher friction for more control
      turnRate: 3.0, // Higher turn rate for more responsive steering
    };

    console.log('🚗 SimpleCar: Created at position', initialPosition, 'angle:', initialAngle);
  }

  /**
   * Update car physics with detailed logging
   */
  update(deltaTime: number, inputs: SimpleCarInputs): void {
    const currentTime = Date.now();
    const shouldLog = currentTime - this.lastLogTime > 1000; // Log every second

    if (shouldLog) {
      console.log('🚗 SimpleCar: Update called with inputs:', inputs);
      console.log('🚗 SimpleCar: Current state:', this.getState());
      this.lastLogTime = currentTime;
    }

    // Clamp inputs
    const steer = Math.max(-1, Math.min(1, inputs.steer));
    const throttle = Math.max(0, Math.min(1, inputs.throttle));
    const brake = Math.max(0, Math.min(1, inputs.brake));

    if (shouldLog && (throttle > 0 || brake > 0 || Math.abs(steer) > 0.1)) {
      console.log('🚗 SimpleCar: Active inputs - steer:', steer, 'throttle:', throttle, 'brake:', brake);
    }

    // Apply steering
    if (Math.abs(steer) > 0.01) {
      const speed = Math.sqrt(this.state.vx * this.state.vx + this.state.vy * this.state.vy);
      const speedFactor = Math.min(speed / (this.config.maxSpeed * 0.3), 1); // More responsive at low speeds
      const effectiveTurnRate = this.config.turnRate * (0.5 + speedFactor * 0.5); // Turn rate scales with speed
      
      const angleChange = steer * effectiveTurnRate * deltaTime;
      this.state.angle += angleChange;

      if (shouldLog && Math.abs(steer) > 0.1) {
        console.log('🚗 SimpleCar: Steering - speed:', speed.toFixed(2), 'speedFactor:', speedFactor.toFixed(2), 'angleChange:', angleChange.toFixed(3));
      }
    }

    // Apply acceleration and braking
    let accelerationForce = 0;
    
    if (throttle > 0) {
      accelerationForce += this.config.acceleration * throttle;
      if (shouldLog) {
        console.log('🚗 SimpleCar: Accelerating with force:', accelerationForce.toFixed(2));
      }
    }
    
    if (brake > 0) {
      accelerationForce -= this.config.brakePower * brake;
      if (shouldLog) {
        console.log('🚗 SimpleCar: Braking with force:', (this.config.brakePower * brake).toFixed(2));
      }
    }

    // Update velocity based on acceleration
    const currentSpeed = Math.sqrt(this.state.vx * this.state.vx + this.state.vy * this.state.vy);
    const newSpeed = Math.max(0, currentSpeed + accelerationForce * deltaTime);
    
    // Clamp speed to maximum
    const clampedSpeed = Math.min(newSpeed, this.config.maxSpeed);
    
    if (shouldLog && (throttle > 0 || brake > 0)) {
      console.log('🚗 SimpleCar: Speed change - current:', currentSpeed.toFixed(2), 'new:', newSpeed.toFixed(2), 'clamped:', clampedSpeed.toFixed(2));
    }

    // Update velocity components
    if (clampedSpeed < 0.1) {
      this.state.vx = 0;
      this.state.vy = 0;
      this.state.speed = 0;
    } else {
      this.state.vx = Math.cos(this.state.angle) * clampedSpeed;
      this.state.vy = Math.sin(this.state.angle) * clampedSpeed;
      this.state.speed = clampedSpeed;
    }

    // Apply friction
    this.state.vx *= Math.pow(this.config.friction, deltaTime);
    this.state.vy *= Math.pow(this.config.friction, deltaTime);
    this.state.speed = Math.sqrt(this.state.vx * this.state.vx + this.state.vy * this.state.vy);

    // Update position
    const oldX = this.state.x;
    const oldY = this.state.y;
    this.state.x += this.state.vx * deltaTime;
    this.state.y += this.state.vy * deltaTime;

    if (shouldLog && (Math.abs(this.state.vx) > 0.1 || Math.abs(this.state.vy) > 0.1)) {
      console.log('🚗 SimpleCar: Position update - old:', oldX.toFixed(2), oldY.toFixed(2), 'new:', this.state.x.toFixed(2), this.state.y.toFixed(2));
      console.log('🚗 SimpleCar: Velocity:', this.state.vx.toFixed(2), this.state.vy.toFixed(2), 'speed:', this.state.speed.toFixed(2));
    }
  }

  /**
   * Get current car state
   */
  getState(): CarState {
    return { ...this.state };
  }

  /**
   * Set car state
   */
  setState(newState: Partial<CarState>): void {
    this.state = { ...this.state, ...newState };
    console.log('🚗 SimpleCar: State set to:', this.state);
  }

  /**
   * Reset car to start position
   */
  resetToStart(position: { x: number; y: number }, angle: number = 0): void {
    this.state = {
      x: position.x,
      y: position.y,
      vx: 0,
      vy: 0,
      angle: angle,
      speed: 0,
    };
    console.log('🚗 SimpleCar: Reset to start position:', position, 'angle:', angle);
  }

  /**
   * Get car configuration
   */
  getConfig(): SimpleCarConfig {
    return { ...this.config };
  }

  /**
   * Update car configuration
   */
  updateConfig(newConfig: Partial<SimpleCarConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('🚗 SimpleCar: Config updated:', this.config);
  }
}

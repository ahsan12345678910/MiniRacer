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
  // Engine and Power
  maxSpeed: number;           // Maximum speed (m/s)
  enginePower: number;        // Engine power (N)
  maxTorque: number;          // Maximum torque (N⋅m)
  
  // Mass and Inertia
  mass: number;              // Car mass (kg)
  momentOfInertia: number;    // Rotational inertia (kg⋅m²)
  
  // Wheels and Traction
  wheelRadius: number;        // Wheel radius (m)
  wheelBase: number;          // Distance between front and rear axles (m)
  maxSteerAngle: number;      // Maximum steering angle (radians)
  
  // Friction and Drag
  rollingResistance: number;  // Rolling resistance coefficient
  airResistance: number;      // Air resistance coefficient
  lateralFriction: number;    // Lateral friction coefficient
  
  // Braking
  brakeForce: number;         // Maximum brake force (N)
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
      // Engine and Power (realistic values)
      maxSpeed: 50,              // ~180 km/h maximum speed
      enginePower: 150000,       // 150 kW engine power
      maxTorque: 300,            // 300 N⋅m torque
      
      // Mass and Inertia (typical car values)
      mass: 1200,                // 1200 kg car mass
      momentOfInertia: 2000,     // Rotational inertia
      
      // Wheels and Traction
      wheelRadius: 0.3,          // 30 cm wheel radius
      wheelBase: 2.5,            // 2.5m wheelbase
      maxSteerAngle: 0.5,        // ~30 degrees max steering
      
      // Friction and Drag (realistic coefficients)
      rollingResistance: 0.02,   // Rolling resistance
      airResistance: 0.3,        // Air drag coefficient
      lateralFriction: 0.8,      // Tire friction coefficient
      
      // Braking
      brakeForce: 8000,          // 8000 N brake force
    };

    console.log('🚗 SimpleCar: Created at position', initialPosition, 'angle:', initialAngle);
  }

  /**
   * Update car physics with realistic physics simulation
   */
  update(deltaTime: number, inputs: SimpleCarInputs): void {
    const currentTime = Date.now();
    const shouldLog = currentTime - this.lastLogTime > 1000; // Log every second

    // ALWAYS log update call for debugging
    console.log('🚗 SimpleCar: Update called with inputs:', inputs);
    console.log('🚗 SimpleCar: Current state:', this.getState());
    console.log('🚗 SimpleCar: DeltaTime:', deltaTime.toFixed(3));

    if (shouldLog) {
      this.lastLogTime = currentTime;
    }

    // Always log throttle input for debugging
    if (inputs.throttle > 0) {
      console.log('🚗 SimpleCar: THROTTLE INPUT RECEIVED:', inputs.throttle);
    }

    // Clamp inputs
    const steer = Math.max(-1, Math.min(1, inputs.steer));
    const throttle = Math.max(0, Math.min(1, inputs.throttle));
    const brake = Math.max(0, Math.min(1, inputs.brake));

    if (shouldLog && (throttle > 0 || brake > 0 || Math.abs(steer) > 0.1)) {
      console.log('🚗 SimpleCar: Active inputs - steer:', steer, 'throttle:', throttle, 'brake:', brake);
    }

    // Get current velocity and speed
    const currentSpeed = Math.sqrt(this.state.vx * this.state.vx + this.state.vy * this.state.vy);
    const velocityAngle = Math.atan2(this.state.vy, this.state.vx);
    
    console.log('🚗 SimpleCar: Current speed:', currentSpeed.toFixed(2), 'velocity angle:', velocityAngle.toFixed(2));

    // === REALISTIC PHYSICS CALCULATIONS ===

    // 1. ENGINE FORCE (Realistic engine power curve)
    let engineForce = 0;
    if (throttle > 0) {
      // Engine power decreases at high speeds (realistic power curve)
      const speedRatio = currentSpeed / this.config.maxSpeed;
      const powerReduction = Math.max(0.3, 1 - speedRatio * 0.7); // Power reduces at high speeds
      engineForce = (this.config.enginePower * throttle * powerReduction) / this.config.mass;
      
      if (shouldLog) {
        console.log('🚗 SimpleCar: Engine force:', engineForce.toFixed(2), 'power reduction:', powerReduction.toFixed(2));
      }
    }

    // 2. BRAKE FORCE
    let brakeForce = 0;
    if (brake > 0) {
      brakeForce = (this.config.brakeForce * brake) / this.config.mass;
      if (shouldLog) {
        console.log('🚗 SimpleCar: Brake force:', brakeForce.toFixed(2));
      }
    }

    // 3. ROLLING RESISTANCE (Realistic rolling resistance)
    const rollingResistanceForce = this.config.rollingResistance * this.config.mass * 9.81; // F = μ * m * g
    const rollingResistanceAccel = rollingResistanceForce / this.config.mass;

    // 4. AIR RESISTANCE (Realistic air drag - proportional to speed²)
    const airResistanceForce = this.config.airResistance * currentSpeed * currentSpeed;
    const airResistanceAccel = airResistanceForce / this.config.mass;

    if (shouldLog && currentSpeed > 1) {
      console.log('🚗 SimpleCar: Rolling resistance:', rollingResistanceAccel.toFixed(2), 'Air resistance:', airResistanceAccel.toFixed(2));
    }

    // 5. STEERING (Realistic wheel physics)
    let angularVelocity = 0;
    if (Math.abs(steer) > 0.01 && currentSpeed > 0.1) {
      // Steering angle affects turning radius
      const steerAngle = steer * this.config.maxSteerAngle;
      const turnRadius = this.config.wheelBase / Math.tan(Math.abs(steerAngle));
      
      // Angular velocity = v / r (realistic turning)
      angularVelocity = (currentSpeed / turnRadius) * Math.sign(steer);
      
      if (shouldLog && Math.abs(steer) > 0.1) {
        console.log('🚗 SimpleCar: Steering - steer angle:', steerAngle.toFixed(3), 'turn radius:', turnRadius.toFixed(2), 'angular velocity:', angularVelocity.toFixed(3));
      }
    }

    // 6. LATERAL FRICTION (Realistic tire physics)
    const lateralForce = this.config.lateralFriction * this.config.mass * 9.81;
    const maxLateralAccel = lateralForce / this.config.mass;

    // === APPLY FORCES ===

    // Calculate total longitudinal acceleration
    const totalLongitudinalAccel = engineForce - brakeForce - rollingResistanceAccel - airResistanceAccel;
    
    // Apply longitudinal acceleration
    const accelerationX = Math.cos(this.state.angle) * totalLongitudinalAccel;
    const accelerationY = Math.sin(this.state.angle) * totalLongitudinalAccel;

    // Update velocity with realistic physics
    this.state.vx += accelerationX * deltaTime;
    this.state.vy += accelerationY * deltaTime;

    // Apply angular velocity (realistic turning)
    this.state.angle += angularVelocity * deltaTime;

    // Apply lateral friction (prevents unrealistic sliding)
    const lateralVelocity = Math.sqrt(
      Math.pow(this.state.vx * Math.sin(this.state.angle) - this.state.vy * Math.cos(this.state.angle), 2)
    );
    
    if (lateralVelocity > maxLateralAccel * deltaTime) {
      // Reduce lateral velocity to realistic levels
      const reductionFactor = (maxLateralAccel * deltaTime) / lateralVelocity;
      const lateralVx = this.state.vx * Math.sin(this.state.angle);
      const lateralVy = this.state.vy * Math.cos(this.state.angle);
      
      this.state.vx -= lateralVx * (1 - reductionFactor);
      this.state.vy -= lateralVy * (1 - reductionFactor);
    }

    // Update speed
    this.state.speed = Math.sqrt(this.state.vx * this.state.vx + this.state.vy * this.state.vy);

    // Apply speed limits
    if (this.state.speed > this.config.maxSpeed) {
      const speedRatio = this.config.maxSpeed / this.state.speed;
      this.state.vx *= speedRatio;
      this.state.vy *= speedRatio;
      this.state.speed = this.config.maxSpeed;
    }

    // Update position
    const oldX = this.state.x;
    const oldY = this.state.y;
    this.state.x += this.state.vx * deltaTime;
    this.state.y += this.state.vy * deltaTime;

    if (shouldLog && (Math.abs(this.state.vx) > 0.1 || Math.abs(this.state.vy) > 0.1)) {
      console.log('🚗 SimpleCar: Position update - old:', oldX.toFixed(2), oldY.toFixed(2), 'new:', this.state.x.toFixed(2), this.state.y.toFixed(2));
      console.log('🚗 SimpleCar: Velocity:', this.state.vx.toFixed(2), this.state.vy.toFixed(2), 'speed:', this.state.speed.toFixed(2));
      console.log('🚗 SimpleCar: Forces - engine:', engineForce.toFixed(2), 'brake:', brakeForce.toFixed(2), 'total accel:', totalLongitudinalAccel.toFixed(2));
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

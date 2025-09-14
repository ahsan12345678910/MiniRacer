export interface CarControls {
  accelerate: boolean;
  brake: boolean;
  turnLeft: boolean;
  turnRight: boolean;
}

export interface SurfaceProperties {
  friction: number; // Surface friction coefficient (0-1)
  grip: number; // Surface grip coefficient (0-1)
  roughness: number; // Surface roughness affecting speed (0-1)
}

export interface CarPhysicsState {
  position: {
    x: number;
    y: number;
  };
  velocity: {
    x: number;
    y: number;
  };
  angle: number; // in radians
  speed: number; // magnitude of velocity
}

export interface CarParameters {
  maxSpeed: number; // Maximum speed in units per second
  acceleration: number; // Acceleration force
  brakePower: number; // Braking force
  friction: number; // Air/rolling resistance
  turnRate: number; // Turning rate in radians per second
  mass: number; // Car mass for physics calculations
}

export class CarModel {
  // Car state
  public position: { x: number; y: number };
  public velocity: { x: number; y: number };
  public angle: number;
  public speed: number;

  // Car parameters
  public maxSpeed: number;
  public acceleration: number;
  public brakePower: number;
  public friction: number;
  public turnRate: number;
  public mass: number;

  // Internal state (for future use)
  // private lastUpdateTime: number = 0;

  constructor(
    initialPosition: { x: number; y: number } = { x: 0, y: 0 },
    initialAngle: number = 0,
    parameters: Partial<CarParameters> = {}
  ) {
    // Initialize car state
    this.position = { ...initialPosition };
    this.velocity = { x: 0, y: 0 };
    this.angle = initialAngle;
    this.speed = 0;

    // Set car parameters with defaults
    this.maxSpeed = parameters.maxSpeed ?? 200; // 200 units/second
    this.acceleration = parameters.acceleration ?? 150; // 150 units/second²
    this.brakePower = parameters.brakePower ?? 300; // 300 units/second²
    this.friction = parameters.friction ?? 0.95; // 5% speed loss per second
    this.turnRate = parameters.turnRate ?? 3.0; // 3 radians/second
    this.mass = parameters.mass ?? 1.0; // 1 unit mass
  }

  /**
   * Update car physics based on controls and surface
   * @param deltaTime - Time elapsed since last update in milliseconds
   * @param controls - Player input controls
   * @param surface - Surface properties affecting physics
   */
  update(
    deltaTime: number,
    controls: CarControls,
    surface: SurfaceProperties
  ): void {
    const dt = deltaTime / 1000; // Convert to seconds

    // Apply steering (affects angle)
    this.applySteering(dt, controls);

    // Apply acceleration/braking (affects speed)
    this.applyAcceleration(dt, controls, surface);

    // Apply friction and surface effects
    this.applyFriction(dt, surface);

    // Update velocity components based on angle and speed
    this.updateVelocity();

    // Update position based on velocity
    this.updatePosition(dt);
  }

  /**
   * Apply steering input to change car angle
   */
  private applySteering(dt: number, controls: CarControls): void {
    let steeringInput = 0;

    if (controls.turnLeft) {
      steeringInput -= 1;
    }
    if (controls.turnRight) {
      steeringInput += 1;
    }

    // Steering effectiveness decreases at high speeds
    const speedFactor = Math.min(this.speed / this.maxSpeed, 1);
    const effectiveTurnRate = this.turnRate * (1 - speedFactor * 0.5);

    this.angle += steeringInput * effectiveTurnRate * dt;
  }

  /**
   * Apply acceleration and braking forces
   */
  private applyAcceleration(
    dt: number,
    controls: CarControls,
    surface: SurfaceProperties
  ): void {
    let accelerationForce = 0;

    if (controls.accelerate) {
      accelerationForce += this.acceleration;
    }
    if (controls.brake) {
      accelerationForce -= this.brakePower;
    }

    // Apply surface grip to acceleration
    const effectiveAcceleration = accelerationForce * surface.grip;

    // Update speed based on acceleration
    const speedChange = (effectiveAcceleration / this.mass) * dt;
    this.speed += speedChange;

    // Clamp speed to maximum
    this.speed = Math.max(
      0,
      Math.min(this.speed, this.maxSpeed * surface.roughness)
    );
  }

  /**
   * Apply friction and surface resistance
   */
  private applyFriction(dt: number, surface: SurfaceProperties): void {
    // Apply air resistance and rolling friction
    const frictionForce = this.friction * surface.friction;
    this.speed *= Math.pow(frictionForce, dt);

    // Minimum speed threshold to prevent infinite deceleration
    if (this.speed < 0.1) {
      this.speed = 0;
    }
  }

  /**
   * Update velocity components based on current angle and speed
   */
  private updateVelocity(): void {
    this.velocity.x = Math.cos(this.angle) * this.speed;
    this.velocity.y = Math.sin(this.angle) * this.speed;
  }

  /**
   * Update position based on velocity
   */
  private updatePosition(dt: number): void {
    this.position.x += this.velocity.x * dt;
    this.position.y += this.velocity.y * dt;
  }

  /**
   * Get current car state
   */
  getState(): CarPhysicsState {
    return {
      position: { ...this.position },
      velocity: { ...this.velocity },
      angle: this.angle,
      speed: this.speed,
    };
  }

  /**
   * Set car state (useful for loading saved states)
   */
  setState(state: CarPhysicsState): void {
    this.position = { ...state.position };
    this.velocity = { ...state.velocity };
    this.angle = state.angle;
    this.speed = state.speed;
  }

  /**
   * Reset car to starting position
   */
  resetToStart(
    startPosition: { x: number; y: number },
    startAngle: number = 0
  ): void {
    this.position = { ...startPosition };
    this.velocity = { x: 0, y: 0 };
    this.angle = startAngle;
    this.speed = 0;
  }

  /**
   * Get car's current direction vector (normalized)
   */
  getDirection(): { x: number; y: number } {
    return {
      x: Math.cos(this.angle),
      y: Math.sin(this.angle),
    };
  }

  /**
   * Get car's current speed in different units
   */
  getSpeedInfo(): {
    speed: number;
    speedPercent: number;
    isMoving: boolean;
  } {
    return {
      speed: this.speed,
      speedPercent: (this.speed / this.maxSpeed) * 100,
      isMoving: this.speed > 0.1,
    };
  }

  /**
   * Update car parameters
   */
  updateParameters(newParams: Partial<CarParameters>): void {
    if (newParams.maxSpeed !== undefined) this.maxSpeed = newParams.maxSpeed;
    if (newParams.acceleration !== undefined)
      this.acceleration = newParams.acceleration;
    if (newParams.brakePower !== undefined)
      this.brakePower = newParams.brakePower;
    if (newParams.friction !== undefined) this.friction = newParams.friction;
    if (newParams.turnRate !== undefined) this.turnRate = newParams.turnRate;
    if (newParams.mass !== undefined) this.mass = newParams.mass;
  }
}

// Default surface properties
export const DEFAULT_SURFACE: SurfaceProperties = {
  friction: 0.95, // 5% speed loss per second
  grip: 1.0, // Full grip
  roughness: 1.0, // No speed reduction
};

// Different surface types
export const SURFACE_TYPES = {
  ASPHALT: {
    friction: 0.95,
    grip: 1.0,
    roughness: 1.0,
  } as SurfaceProperties,

  GRASS: {
    friction: 0.85,
    grip: 0.7,
    roughness: 0.8,
  } as SurfaceProperties,

  DIRT: {
    friction: 0.9,
    grip: 0.8,
    roughness: 0.9,
  } as SurfaceProperties,

  ICE: {
    friction: 0.98,
    grip: 0.3,
    roughness: 1.0,
  } as SurfaceProperties,

  SAND: {
    friction: 0.8,
    grip: 0.6,
    roughness: 0.7,
  } as SurfaceProperties,
};

// Helper function to reset car at starting line
export const resetCarAtStartLine = (
  car: CarModel,
  startPosition: { x: number; y: number } = { x: 0, y: 0 },
  startAngle: number = 0
): void => {
  car.resetToStart(startPosition, startAngle);
};

// Helper function to create a new car with default parameters
export const createCar = (
  startPosition: { x: number; y: number } = { x: 0, y: 0 },
  startAngle: number = 0,
  parameters: Partial<CarParameters> = {}
): CarModel => {
  return new CarModel(startPosition, startAngle, parameters);
};

// Helper function to create car with preset configurations
export const createCarPreset = (
  preset: 'sports' | 'rally' | 'truck' | 'formula',
  startPosition: { x: number; y: number } = { x: 0, y: 0 },
  startAngle: number = 0
): CarModel => {
  const presets: Record<string, Partial<CarParameters>> = {
    sports: {
      maxSpeed: 250,
      acceleration: 180,
      brakePower: 350,
      friction: 0.96,
      turnRate: 3.5,
      mass: 0.9,
    },
    rally: {
      maxSpeed: 200,
      acceleration: 160,
      brakePower: 300,
      friction: 0.94,
      turnRate: 4.0,
      mass: 1.1,
    },
    truck: {
      maxSpeed: 150,
      acceleration: 120,
      brakePower: 400,
      friction: 0.92,
      turnRate: 2.0,
      mass: 2.0,
    },
    formula: {
      maxSpeed: 300,
      acceleration: 200,
      brakePower: 500,
      friction: 0.98,
      turnRate: 4.5,
      mass: 0.7,
    },
  };

  return new CarModel(startPosition, startAngle, presets[preset]);
};

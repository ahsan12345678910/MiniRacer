/**
 * Car Physics Model
 * 
 * Pure physics update function with no React dependencies
 * - Updates car state based on inputs, surface, and walls
 * - Uses meters/seconds units
 * - Mutates car state directly
 */

import { CarState, Track } from '../state/GameState';

export interface CarInputs {
  steer: number; // -1 to 1
  throttle: number; // 0 to 1
  brake: number; // 0 to 1
}

export interface Surface {
  friction: number; // 0-1
}

export interface PowerUpEffects {
  speedMultiplier: number;
  maxSpeedIncrease: number;
  accelerationBoost: number;
  frictionReduction: number;
  isInvulnerable: boolean;
}

/**
 * Updates car physics for one timestep
 * @param car - Car state to update (mutated)
 * @param inputs - Player input controls
 * @param surface - Surface properties affecting friction
 * @param walls - Wall segments for collision detection
 * @param dt - Time step in seconds
 * @param powerUpEffects - Optional power-up effects to apply
 */
export function updateCar(
  car: CarState,
  inputs: CarInputs,
  surface: Surface,
  walls: Array<[number, number, number, number]>,
  dt: number,
  powerUpEffects?: PowerUpEffects
): void {
  // Clamp inputs to valid ranges
  const steer = Math.max(-1, Math.min(1, inputs.steer));
  const throttle = Math.max(0, Math.min(1, inputs.throttle));
  const brake = Math.max(0, Math.min(1, inputs.brake));

  // Apply steering (turn rate scales with speed)
  if (Math.abs(steer) > 0.01) {
    const speed = Math.sqrt(car.vx * car.vx + car.vy * car.vy);
    const maxSpeed = 22; // 22 m/s (~80 km/h)
    const speedFactor = Math.min(speed / (maxSpeed * 0.5), 1);
    const turnRate = 2.2; // rad/s at 50% speed
    const effectiveTurnRate = turnRate * speedFactor;
    
    car.angle += steer * effectiveTurnRate * dt;
  }

  // Apply acceleration and braking
  let accelerationForce = 0;
  let baseAcceleration = 10; // Base acceleration in m/s²
  let baseBraking = 18; // Base braking in m/s²
  
  // Apply power-up effects to acceleration
  if (powerUpEffects) {
    baseAcceleration += powerUpEffects.accelerationBoost;
  }
  
  if (throttle > 0) {
    accelerationForce += baseAcceleration * throttle;
  }
  
  if (brake > 0) {
    accelerationForce -= baseBraking * brake;
  }

  // Update velocity based on acceleration
  const currentSpeed = Math.sqrt(car.vx * car.vx + car.vy * car.vy);
  const newSpeed = Math.max(0, currentSpeed + accelerationForce * dt);
  
  // Clamp speed to maximum (with power-up effects)
  let maxSpeed = 22; // Base max speed in m/s (~80 km/h)
  let speedMultiplier = 1.0;
  
  if (powerUpEffects) {
    maxSpeed += powerUpEffects.maxSpeedIncrease;
    speedMultiplier = powerUpEffects.speedMultiplier;
  }
  
  const effectiveMaxSpeed = maxSpeed * speedMultiplier;
  const clampedSpeed = Math.min(newSpeed, effectiveMaxSpeed);
  
  // Stop car if speed is very low
  if (clampedSpeed < 0.1) {
    car.vx = 0;
    car.vy = 0;
  } else {
    // Update velocity components based on angle and speed
    car.vx = Math.cos(car.angle) * clampedSpeed;
    car.vy = Math.sin(car.angle) * clampedSpeed;
  }

  // Apply surface friction (with power-up effects)
  let friction = 0.9 * surface.friction; // Base friction * surface friction
  
  if (powerUpEffects) {
    friction = Math.max(0.1, friction - powerUpEffects.frictionReduction);
  }
  
  car.vx *= Math.pow(friction, dt);
  car.vy *= Math.pow(friction, dt);

  // Update position
  car.x += car.vx * dt;
  car.y += car.vy * dt;

  // Resolve collisions with walls (skip if invulnerable)
  if (!powerUpEffects?.isInvulnerable) {
    resolveCollisions(car, walls);
  }
}

/**
 * Resolves collisions between car and walls
 * @param car - Car state to update
 * @param walls - Wall segments
 */
function resolveCollisions(car: CarState, walls: Array<[number, number, number, number]>): void {
  const carRadius = 1.0; // Car radius in meters
  
  for (const wall of walls) {
    const [x1, y1, x2, y2] = wall;
    const collision = segmentCircleCollision(x1, y1, x2, y2, car.x, car.y, carRadius);
    
    if (collision.hasCollision) {
      // Push car out along normal
      const pushDistance = collision.penetrationDepth! + 0.1; // Small buffer
      car.x += collision.collisionNormal!.x * pushDistance;
      car.y += collision.collisionNormal!.y * pushDistance;
      
      // Reflect velocity with bounce factor
      const velocityDot = car.vx * collision.collisionNormal!.x + car.vy * collision.collisionNormal!.y;
      
      if (velocityDot > 0) {
        const bounceFactor = 0.4;
        car.vx -= collision.collisionNormal!.x * velocityDot * (1 + bounceFactor);
        car.vy -= collision.collisionNormal!.y * velocityDot * (1 + bounceFactor);
      }
    }
  }
}

/**
 * Tests collision between a line segment and a circle
 */
function segmentCircleCollision(
  x1: number, y1: number,
  x2: number, y2: number,
  cx: number, cy: number,
  radius: number
): {
  hasCollision: boolean;
  collisionPoint?: { x: number; y: number };
  collisionNormal?: { x: number; y: number };
  penetrationDepth?: number;
} {
  // Vector from line start to end
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lineLength = Math.sqrt(dx * dx + dy * dy);

  if (lineLength === 0) {
    // Line segment is a point
    const distance = Math.sqrt((cx - x1) ** 2 + (cy - y1) ** 2);
    if (distance <= radius) {
      const normal = normalize(cx - x1, cy - y1);
      return {
        hasCollision: true,
        collisionPoint: { x: x1, y: y1 },
        collisionNormal: normal,
        penetrationDepth: radius - distance,
      };
    }
    return { hasCollision: false };
  }

  // Normalize line direction
  const lineDirX = dx / lineLength;
  const lineDirY = dy / lineLength;

  // Vector from line start to circle center
  const toCircleX = cx - x1;
  const toCircleY = cy - y1;

  // Project circle center onto line
  const projection = toCircleX * lineDirX + toCircleY * lineDirY;
  const clampedProjection = Math.max(0, Math.min(lineLength, projection));

  // Closest point on line segment to circle center
  const closestX = x1 + clampedProjection * lineDirX;
  const closestY = y1 + clampedProjection * lineDirY;

  // Distance from circle center to closest point on line
  const distance = Math.sqrt((cx - closestX) ** 2 + (cy - closestY) ** 2);

  if (distance <= radius) {
    // Collision detected
    const normal = normalize(cx - closestX, cy - closestY);
    return {
      hasCollision: true,
      collisionPoint: { x: closestX, y: closestY },
      collisionNormal: normal,
      penetrationDepth: radius - distance,
    };
  }

  return { hasCollision: false };
}

/**
 * Normalizes a vector to unit length
 */
function normalize(x: number, y: number): { x: number; y: number } {
  const length = Math.sqrt(x * x + y * y);
  if (length === 0) return { x: 0, y: 0 };
  return { x: x / length, y: y / length };
}

// Default surface types
export const SURFACE_TYPES = {
  ASPHALT: { friction: 0.98 },
  GRASS: { friction: 0.90 },
  DIRT: { friction: 0.92 },
  ICE: { friction: 0.95 },
  SAND: { friction: 0.85 },
} as const;

/**
 * Car Model Class
 * 
 * Wrapper around the updateCar function for object-oriented usage
 */
export class CarModel {
  private state: CarState;
  public maxSpeed: number = 22;
  public acceleration: number = 10;
  public brakePower: number = 18;
  public friction: number = 0.9;
  public turnRate: number = 2.2;

  constructor(initialPosition: { x: number; y: number }, initialAngle: number = 0) {
    this.state = {
      x: initialPosition.x,
      y: initialPosition.y,
      vx: 0,
      vy: 0,
      angle: initialAngle,
      speed: 0,
    };
  }

  /**
   * Update car physics
   */
  update(
    deltaTime: number,
    controls: CarInputs,
    surfaceProperties: any,
    powerUpEffects?: PowerUpEffects
  ): void {
    // Convert surface properties to the format expected by updateCar
    const surface: Surface = {
      friction: surfaceProperties.friction || 0.9,
    };

    // Get walls from track (empty for now, will be handled by collision system)
    const walls: Array<[number, number, number, number]> = [];

    // Use the updateCar function
    updateCar(this.state, controls, surface, walls, deltaTime, powerUpEffects);
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
  }
}
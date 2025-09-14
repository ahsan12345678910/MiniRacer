/**
 * Simplified Collision system
 * 
 * Implements segment-circle collision detection for car vs walls
 */

import { CarModel } from '../physics/CarModel';
import { Track } from '../track/Track';

export interface CollisionResult {
  /** Whether a collision occurred */
  hasCollision: boolean;
  /** Collision point */
  collisionPoint?: { x: number; y: number };
  /** Collision normal vector */
  collisionNormal?: { x: number; y: number };
  /** Penetration depth */
  penetrationDepth?: number;
}

/**
 * Simplified Collision system
 */
export class Collision {
  private track: Track | null = null;

  constructor(track?: Track) {
    this.track = track || null;
  }

  /**
   * Sets the track for collision detection
   * @param track - Track instance
   */
  setTrack(track: Track): void {
    this.track = track;
  }

  /**
   * Resolves barrier collision using segment-circle test
   * @param car - Car model to check collision for
   * @returns Collision result
   */
  resolveBarrierCollision(car: CarModel): CollisionResult {
    if (!this.track) {
      return { hasCollision: false };
    }

    const carState = car.getState();
    const carRadius = 1.0; // Car radius in meters
    const walls = this.track.getWalls();

    // Check collision with each wall segment
    for (const wall of walls) {
      const [x1, y1, x2, y2] = wall;
      const collision = this.segmentCircleCollision(
        x1, y1, x2, y2,
        carState.position.x, carState.position.y, carRadius
      );

      if (collision.hasCollision) {
        // Push car out along normal
        const pushDistance = collision.penetrationDepth! + 0.1; // Small buffer
        const newX = carState.position.x + collision.collisionNormal!.x * pushDistance;
        const newY = carState.position.y + collision.collisionNormal!.y * pushDistance;

        // Update car position
        car.setState({
          ...carState,
          position: { x: newX, y: newY },
        });

        // Reflect velocity by -0.4 factor
        const velocityDot = carState.velocity.x * collision.collisionNormal!.x + 
                           carState.velocity.y * collision.collisionNormal!.y;
        
        if (velocityDot > 0) {
          const newVelocityX = carState.velocity.x - collision.collisionNormal!.x * velocityDot * 1.4;
          const newVelocityY = carState.velocity.y - collision.collisionNormal!.y * velocityDot * 1.4;

          car.setState({
            ...car.getState(),
            velocity: { x: newVelocityX, y: newVelocityY },
          });
        }

        return collision;
      }
    }

    return { hasCollision: false };
  }

  /**
   * Tests collision between a line segment and a circle
   * @param x1 - Line start X
   * @param y1 - Line start Y
   * @param x2 - Line end X
   * @param y2 - Line end Y
   * @param cx - Circle center X
   * @param cy - Circle center Y
   * @param radius - Circle radius
   * @returns Collision result
   */
  private segmentCircleCollision(
    x1: number, y1: number,
    x2: number, y2: number,
    cx: number, cy: number,
    radius: number
  ): CollisionResult {
    // Vector from line start to end
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lineLength = Math.sqrt(dx * dx + dy * dy);

    if (lineLength === 0) {
      // Line segment is a point
      const distance = Math.sqrt((cx - x1) ** 2 + (cy - y1) ** 2);
      if (distance <= radius) {
        const normal = this.normalize(cx - x1, cy - y1);
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
      const normal = this.normalize(cx - closestX, cy - closestY);
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
   * @param x - Vector X component
   * @param y - Vector Y component
   * @returns Normalized vector
   */
  private normalize(x: number, y: number): { x: number; y: number } {
    const length = Math.sqrt(x * x + y * y);
    if (length === 0) return { x: 0, y: 0 };
    return { x: x / length, y: y / length };
  }
}

/**
 * Creates a new collision system
 * @param track - Optional track instance
 * @returns Collision system
 */
export function createCollisionSystem(track?: Track): Collision {
  return new Collision(track);
}

/**
 * Singleton collision system instance
 */
let collisionSystem: Collision | null = null;

/**
 * Gets the global collision system instance
 * @returns Collision system
 */
export function getCollisionSystem(): Collision {
  if (!collisionSystem) {
    collisionSystem = new Collision();
  }
  return collisionSystem;
}
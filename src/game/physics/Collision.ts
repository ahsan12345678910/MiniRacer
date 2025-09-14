/**
 * Collision System
 * 
 * Segment-circle collision detection with bounce
 * - No React imports or dependencies
 * - Pure collision resolution functions
 * - Used by physics systems
 */

import { CarState } from '../state/GameState';

export interface CollisionResult {
  hasCollision: boolean;
  collisionPoint?: { x: number; y: number };
  collisionNormal?: { x: number; y: number };
  penetrationDepth?: number;
}

/**
 * Resolves collisions between car and walls
 * @param car - Car state to update
 * @param walls - Wall segments
 */
export function resolve(car: CarState, walls: Array<[number, number, number, number]>): void {
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
 * @param x1 - Line start X
 * @param y1 - Line start Y
 * @param x2 - Line end X
 * @param y2 - Line end Y
 * @param cx - Circle center X
 * @param cy - Circle center Y
 * @param radius - Circle radius
 * @returns Collision result
 */
export function segmentCircleCollision(
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
 * @param x - Vector X component
 * @param y - Vector Y component
 * @returns Normalized vector
 */
function normalize(x: number, y: number): { x: number; y: number } {
  const length = Math.sqrt(x * x + y * y);
  if (length === 0) return { x: 0, y: 0 };
  return { x: x / length, y: y / length };
}

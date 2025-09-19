/**
 * Track Physics Integration
 * 
 * Handles physics interactions with different track surfaces
 */

import { RealisticTrackDesign, getSurfaceTypeAt } from './RealisticTrackDesign';

export interface SurfacePhysics {
  friction: number;
  grip: number;
  resistance: number;
  bounce: number;
  damage: number;
}

export interface TrackPhysicsState {
  surfaceType: 'road' | 'grass' | 'wall' | 'curb' | 'runoff' | 'barrier';
  physics: SurfacePhysics;
  isOnTrack: boolean;
  isInRunoff: boolean;
  isInWall: boolean;
}

/**
 * Get physics properties for a surface type
 */
export const getSurfacePhysics = (surfaceType: string): SurfacePhysics => {
  switch (surfaceType) {
    case 'road':
      return {
        friction: 0.98,
        grip: 1.0,
        resistance: 0.02,
        bounce: 0.0,
        damage: 0.0,
      };
    
    case 'grass':
      return {
        friction: 0.85,
        grip: 0.7,
        resistance: 0.05,
        bounce: 0.1,
        damage: 0.0,
      };
    
    case 'wall':
      return {
        friction: 1.0,
        grip: 0.0,
        resistance: 0.0,
        bounce: 0.8,
        damage: 0.1,
      };
    
    case 'curb':
      return {
        friction: 0.95,
        grip: 0.9,
        resistance: 0.03,
        bounce: 0.3,
        damage: 0.02,
      };
    
    case 'runoff':
      return {
        friction: 0.80,
        grip: 0.6,
        resistance: 0.08,
        bounce: 0.2,
        damage: 0.0,
      };
    
    case 'barrier':
      return {
        friction: 1.0,
        grip: 0.0,
        resistance: 0.0,
        bounce: 0.9,
        damage: 0.2,
      };
    
    default:
      return {
        friction: 0.85,
        grip: 0.7,
        resistance: 0.05,
        bounce: 0.1,
        damage: 0.0,
      };
  }
};

/**
 * Get track physics state at a position
 */
export const getTrackPhysicsState = (
  track: RealisticTrackDesign,
  x: number,
  y: number
): TrackPhysicsState => {
  const surfaceData = getSurfaceTypeAt(track, x, y);
  const physics = getSurfacePhysics(surfaceData.type);
  
  return {
    surfaceType: surfaceData.type,
    physics,
    isOnTrack: surfaceData.type === 'road',
    isInRunoff: surfaceData.type === 'runoff',
    isInWall: surfaceData.type === 'wall' || surfaceData.type === 'barrier',
  };
};

/**
 * Apply surface physics to car
 */
export const applySurfacePhysics = (
  track: RealisticTrackDesign,
  carX: number,
  carY: number,
  carVx: number,
  carVy: number,
  carSpeed: number
): {
  newVx: number;
  newVy: number;
  newSpeed: number;
  damage: number;
} => {
  const physicsState = getTrackPhysicsState(track, carX, carY);
  const { physics } = physicsState;
  
  // Apply friction
  const frictionFactor = physics.friction;
  const newVx = carVx * frictionFactor;
  const newVy = carVy * frictionFactor;
  
  // Apply grip (affects turning ability)
  const gripFactor = physics.grip;
  const speedReduction = 1 - (1 - gripFactor) * (1 - physics.resistance);
  
  // Apply resistance
  const resistanceFactor = 1 - physics.resistance;
  const finalVx = newVx * resistanceFactor * speedReduction;
  const finalVy = newVy * resistanceFactor * speedReduction;
  
  // Calculate new speed
  const newSpeed = Math.sqrt(finalVx * finalVx + finalVy * finalVy);
  
  // Calculate damage
  const damage = physics.damage * carSpeed;
  
  return {
    newVx: finalVx,
    newVy: finalVy,
    newSpeed,
    damage,
  };
};

/**
 * Check for collision with walls
 */
export const checkWallCollision = (
  track: RealisticTrackDesign,
  carX: number,
  carY: number,
  carWidth: number = 20,
  carHeight: number = 40
): {
  hasCollision: boolean;
  collisionType: 'wall' | 'barrier' | 'none';
  bounceDirection: { x: number; y: number };
} => {
  const physicsState = getTrackPhysicsState(track, carX, carY);
  
  if (!physicsState.isInWall) {
    return {
      hasCollision: false,
      collisionType: 'none',
      bounceDirection: { x: 0, y: 0 },
    };
  }
  
  // Calculate bounce direction based on surface type
  let bounceX = 0;
  let bounceY = 0;
  
  if (physicsState.surfaceType === 'wall') {
    // Simple wall bounce - reverse direction
    bounceX = -1;
    bounceY = -1;
  } else if (physicsState.surfaceType === 'barrier') {
    // Barrier bounce - stronger reverse
    bounceX = -1.5;
    bounceY = -1.5;
  }
  
  return {
    hasCollision: true,
    collisionType: physicsState.surfaceType === 'wall' ? 'wall' : 'barrier',
    bounceDirection: { x: bounceX, y: bounceY },
  };
};

/**
 * Get optimal racing line for AI
 */
export const getOptimalRacingLine = (track: RealisticTrackDesign): Array<{ x: number; y: number }> => {
  return track.racingLine;
};

/**
 * Check if position is on the racing line
 */
export const isOnRacingLine = (
  track: RealisticTrackDesign,
  x: number,
  y: number,
  tolerance: number = 30
): boolean => {
  for (const point of track.racingLine) {
    const distance = Math.sqrt((x - point.x) ** 2 + (y - point.y) ** 2);
    if (distance <= tolerance) {
      return true;
    }
  }
  return false;
};

/**
 * Get distance to racing line
 */
export const getDistanceToRacingLine = (
  track: RealisticTrackDesign,
  x: number,
  y: number
): number => {
  let minDistance = Infinity;
  
  for (const point of track.racingLine) {
    const distance = Math.sqrt((x - point.x) ** 2 + (y - point.y) ** 2);
    if (distance < minDistance) {
      minDistance = distance;
    }
  }
  
  return minDistance;
};

/**
 * Get next racing line point
 */
export const getNextRacingLinePoint = (
  track: RealisticTrackDesign,
  x: number,
  y: number
): { x: number; y: number } | null => {
  let closestIndex = 0;
  let minDistance = Infinity;
  
  for (let i = 0; i < track.racingLine.length; i++) {
    const point = track.racingLine[i];
    const distance = Math.sqrt((x - point.x) ** 2 + (y - point.y) ** 2);
    if (distance < minDistance) {
      minDistance = distance;
      closestIndex = i;
    }
  }
  
  // Return next point in the racing line
  const nextIndex = (closestIndex + 1) % track.racingLine.length;
  return track.racingLine[nextIndex];
};

export default {
  getSurfacePhysics,
  getTrackPhysicsState,
  applySurfacePhysics,
  checkWallCollision,
  getOptimalRacingLine,
  isOnRacingLine,
  getDistanceToRacingLine,
  getNextRacingLinePoint,
};

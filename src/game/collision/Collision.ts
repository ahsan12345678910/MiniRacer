import { CarModel, CarPhysicsState } from '../physics/CarModel';
import { Track, TrackZone } from '../track/Track';

export interface CollisionResult {
  hasCollision: boolean;
  collisionType: 'barrier' | 'checkpoint' | 'finish' | 'none';
  collisionPoint?: { x: number; y: number };
  collisionNormal?: { x: number; y: number };
  penetrationDepth?: number;
  zone?: TrackZone;
}

export interface CarBounds {
  center: { x: number; y: number };
  width: number;
  height: number;
  angle: number;
}

export class CollisionSystem {
  private track: Track | null = null;

  constructor(track?: Track) {
    this.track = track || null;
  }

  /**
   * Set the current track for collision detection
   */
  setTrack(track: Track): void {
    this.track = track;
  }

  /**
   * Resolve barrier collision for a car
   */
  resolveBarrierCollision(car: CarModel): CollisionResult {
    if (!this.track) {
      return { hasCollision: false, collisionType: 'none' };
    }

    const carState = car.getState();
    const carBounds = this.getCarBounds(carState);

    // Check for collisions with all collidable zones
    const collidableZones = this.track
      .getZones()
      .filter(zone => zone.properties.isCollidable);

    for (const zone of collidableZones) {
      const collision = this.checkCarZoneCollision(carBounds, zone);
      if (collision.hasCollision) {
        this.resolveCarCollision(car, collision);
        return collision;
      }
    }

    return { hasCollision: false, collisionType: 'none' };
  }

  /**
   * Check collision between car bounds and a track zone
   */
  private checkCarZoneCollision(
    carBounds: CarBounds,
    zone: TrackZone
  ): CollisionResult {
    switch (zone.geometry.type) {
      case 'rectangle':
        return this.checkCarRectangleCollision(carBounds, zone);
      case 'circle':
        return this.checkCarCircleCollision(carBounds, zone);
      case 'polygon':
        return this.checkCarPolygonCollision(carBounds, zone);
      default:
        return { hasCollision: false, collisionType: 'none' };
    }
  }

  /**
   * Check collision between car and rectangle zone
   */
  private checkCarRectangleCollision(
    carBounds: CarBounds,
    zone: TrackZone
  ): CollisionResult {
    if (
      zone.geometry.type !== 'rectangle' ||
      !zone.geometry.width ||
      !zone.geometry.height ||
      zone.geometry.points.length === 0
    ) {
      return { hasCollision: false, collisionType: 'none' };
    }

    const zoneTopLeft = zone.geometry.points[0];
    if (!zoneTopLeft) return { hasCollision: false, collisionType: 'none' };

    const zoneRight = zoneTopLeft.x + zone.geometry.width;
    const zoneBottom = zoneTopLeft.y + zone.geometry.height;

    // Get car corners
    const carCorners = this.getCarCorners(carBounds);

    // Check if any car corner is inside the zone
    for (const corner of carCorners) {
      if (
        corner.x >= zoneTopLeft.x &&
        corner.x <= zoneRight &&
        corner.y >= zoneTopLeft.y &&
        corner.y <= zoneBottom
      ) {
        // Calculate collision normal and penetration
        const collisionInfo = this.calculateRectangleCollisionInfo(
          carBounds,
          zone
        );

        return {
          hasCollision: true,
          collisionType: zone.type === 'barrier' ? 'barrier' : 'none',
          collisionPoint: { x: corner.x, y: corner.y },
          collisionNormal: collisionInfo.normal,
          penetrationDepth: collisionInfo.penetration,
          zone: zone,
        };
      }
    }

    return { hasCollision: false, collisionType: 'none' };
  }

  /**
   * Check collision between car and circle zone
   */
  private checkCarCircleCollision(
    carBounds: CarBounds,
    zone: TrackZone
  ): CollisionResult {
    if (
      zone.geometry.type !== 'circle' ||
      !zone.geometry.radius ||
      zone.geometry.points.length === 0
    ) {
      return { hasCollision: false, collisionType: 'none' };
    }

    const zoneCenter = zone.geometry.points[0];
    if (!zoneCenter) return { hasCollision: false, collisionType: 'none' };

    const zoneRadius = zone.geometry.radius;

    // Check if car center is within circle
    const distance = Math.sqrt(
      Math.pow(carBounds.center.x - zoneCenter.x, 2) +
        Math.pow(carBounds.center.y - zoneCenter.y, 2)
    );

    if (distance <= zoneRadius) {
      const penetration = zoneRadius - distance;
      const normal = {
        x: (carBounds.center.x - zoneCenter.x) / distance,
        y: (carBounds.center.y - zoneCenter.y) / distance,
      };

      return {
        hasCollision: true,
        collisionType: zone.type === 'barrier' ? 'barrier' : 'none',
        collisionPoint: { x: carBounds.center.x, y: carBounds.center.y },
        collisionNormal: normal,
        penetrationDepth: penetration,
        zone: zone,
      };
    }

    return { hasCollision: false, collisionType: 'none' };
  }

  /**
   * Check collision between car and polygon zone
   */
  private checkCarPolygonCollision(
    carBounds: CarBounds,
    zone: TrackZone
  ): CollisionResult {
    if (zone.geometry.type !== 'polygon') {
      return { hasCollision: false, collisionType: 'none' };
    }

    const carCorners = this.getCarCorners(carBounds);

    // Check if any car corner is inside the polygon
    for (const corner of carCorners) {
      if (this.isPointInPolygon(corner.x, corner.y, zone.geometry.points)) {
        return {
          hasCollision: true,
          collisionType: zone.type === 'barrier' ? 'barrier' : 'none',
          collisionPoint: { x: corner.x, y: corner.y },
          zone: zone,
        };
      }
    }

    return { hasCollision: false, collisionType: 'none' };
  }

  /**
   * Get car bounding box
   */
  private getCarBounds(carState: CarPhysicsState): CarBounds {
    return {
      center: { ...carState.position },
      width: 20, // Car width
      height: 40, // Car height
      angle: carState.angle,
    };
  }

  /**
   * Get car corner positions
   */
  private getCarCorners(carBounds: CarBounds): Array<{ x: number; y: number }> {
    const halfWidth = carBounds.width / 2;
    const halfHeight = carBounds.height / 2;
    const cos = Math.cos(carBounds.angle);
    const sin = Math.sin(carBounds.angle);

    const corners = [
      { x: -halfWidth, y: -halfHeight },
      { x: halfWidth, y: -halfHeight },
      { x: halfWidth, y: halfHeight },
      { x: -halfWidth, y: halfHeight },
    ];

    return corners.map(corner => ({
      x: carBounds.center.x + (corner.x * cos - corner.y * sin),
      y: carBounds.center.y + (corner.x * sin + corner.y * cos),
    }));
  }

  /**
   * Calculate collision information for rectangle collision
   */
  private calculateRectangleCollisionInfo(
    carBounds: CarBounds,
    zone: TrackZone
  ): {
    normal: { x: number; y: number };
    penetration: number;
  } {
    if (
      zone.geometry.type !== 'rectangle' ||
      !zone.geometry.width ||
      !zone.geometry.height ||
      zone.geometry.points.length === 0
    ) {
      return { normal: { x: 0, y: 0 }, penetration: 0 };
    }

    const zoneTopLeft = zone.geometry.points[0];
    if (!zoneTopLeft) return { normal: { x: 0, y: 0 }, penetration: 0 };

    const zoneRight = zoneTopLeft.x + zone.geometry.width;
    const zoneBottom = zoneTopLeft.y + zone.geometry.height;

    const carCenter = carBounds.center;
    const halfWidth = carBounds.width / 2;
    const halfHeight = carBounds.height / 2;

    // Calculate distances to each edge
    const distToLeft = Math.abs(carCenter.x - zoneTopLeft.x);
    const distToRight = Math.abs(carCenter.x - zoneRight);
    const distToTop = Math.abs(carCenter.y - zoneTopLeft.y);
    const distToBottom = Math.abs(carCenter.y - zoneBottom);

    // Find the minimum distance (collision normal direction)
    const minDist = Math.min(distToLeft, distToRight, distToTop, distToBottom);

    let normal = { x: 0, y: 0 };
    let penetration = 0;

    if (minDist === distToLeft) {
      normal = { x: -1, y: 0 };
      penetration = halfWidth - distToLeft;
    } else if (minDist === distToRight) {
      normal = { x: 1, y: 0 };
      penetration = halfWidth - distToRight;
    } else if (minDist === distToTop) {
      normal = { x: 0, y: -1 };
      penetration = halfHeight - distToTop;
    } else if (minDist === distToBottom) {
      normal = { x: 0, y: 1 };
      penetration = halfHeight - distToBottom;
    }

    return { normal, penetration };
  }

  /**
   * Check if point is inside polygon
   */
  private isPointInPolygon(
    x: number,
    y: number,
    points: Array<{ x: number; y: number }>
  ): boolean {
    let inside = false;

    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
      const pointI = points[i];
      const pointJ = points[j];

      if (!pointI || !pointJ) continue;

      const xi = pointI.x;
      const yi = pointI.y;
      const xj = pointJ.x;
      const yj = pointJ.y;

      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
        inside = !inside;
      }
    }

    return inside;
  }

  /**
   * Resolve car collision by adjusting position and velocity
   */
  private resolveCarCollision(car: CarModel, collision: CollisionResult): void {
    if (!collision.collisionNormal || !collision.penetrationDepth) {
      return;
    }

    const carState = car.getState();
    const normal = collision.collisionNormal;
    const penetration = collision.penetrationDepth;

    // Separate the car from the collision
    const separationX = normal.x * penetration;
    const separationY = normal.y * penetration;

    // Update car position
    car.setState({
      ...carState,
      position: {
        x: carState.position.x + separationX,
        y: carState.position.y + separationY,
      },
    });

    // Reduce velocity in collision direction
    const velocityDot =
      carState.velocity.x * normal.x + carState.velocity.y * normal.y;
    if (velocityDot > 0) {
      const newVelocityX = carState.velocity.x - normal.x * velocityDot * 0.8;
      const newVelocityY = carState.velocity.y - normal.y * velocityDot * 0.8;

      car.setState({
        ...car.getState(),
        velocity: { x: newVelocityX, y: newVelocityY },
      });
    }
  }

  /**
   * Check for checkpoint collisions
   */
  checkCheckpointCollision(car: CarModel): CollisionResult {
    if (!this.track) {
      return { hasCollision: false, collisionType: 'none' };
    }

    const carState = car.getState();
    const checkpoint = this.track.getCheckpointAt(
      carState.position.x,
      carState.position.y
    );

    if (checkpoint) {
      return {
        hasCollision: true,
        collisionType: 'checkpoint',
        collisionPoint: checkpoint.position,
      };
    }

    return { hasCollision: false, collisionType: 'none' };
  }

  /**
   * Check for finish line collision
   */
  checkFinishLineCollision(car: CarModel): CollisionResult {
    if (!this.track) {
      return { hasCollision: false, collisionType: 'none' };
    }

    const carState = car.getState();
    const finishZones = this.track
      .getZones()
      .filter(zone => zone.type === 'finishLine');

    for (const zone of finishZones) {
      const collision = this.checkCarZoneCollision(
        this.getCarBounds(carState),
        zone
      );
      if (collision.hasCollision) {
        return {
          ...collision,
          collisionType: 'finish',
        };
      }
    }

    return { hasCollision: false, collisionType: 'none' };
  }
}

// Singleton instance
let collisionSystem: CollisionSystem | null = null;

export const getCollisionSystem = (): CollisionSystem => {
  if (!collisionSystem) {
    collisionSystem = new CollisionSystem();
  }
  return collisionSystem;
};

// Helper function to create collision system with track
export const createCollisionSystem = (track: Track): CollisionSystem => {
  return new CollisionSystem(track);
};

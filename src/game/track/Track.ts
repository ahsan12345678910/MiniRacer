export interface TrackZone {
  id: string;
  type: 'asphalt' | 'grass' | 'barrier' | 'startLine' | 'checkpoint' | 'finishLine';
  name: string;
  color: string;
  properties: {
    friction: number;
    grip: number;
    roughness: number;
    isCollidable: boolean;
    isCheckpoint: boolean;
  };
  geometry: {
    type: 'rectangle' | 'circle' | 'polygon';
    points: Array<{ x: number; y: number }>;
    width?: number;
    height?: number;
    radius?: number;
  };
}

export interface TrackData {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  laps: number;
  width: number;
  height: number;
  startPosition: {
    x: number;
    y: number;
    angle: number;
  };
  checkpoints: Array<{
    id: string;
    position: { x: number; y: number };
    radius: number;
    order: number;
  }>;
  zones: TrackZone[];
  background: {
    color: string;
    image?: string;
  };
}

export class Track {
  private data: TrackData;
  private zones: Map<string, TrackZone> = new Map();

  constructor(trackData: TrackData) {
    this.data = trackData;
    this.initializeZones();
  }

  private initializeZones(): void {
    this.data.zones.forEach(zone => {
      this.zones.set(zone.id, zone);
    });
  }

  /**
   * Get surface properties at a specific position
   */
  getSurfaceAt(x: number, y: number): {
    type: string;
    friction: number;
    grip: number;
    roughness: number;
    isCollidable: boolean;
    isCheckpoint: boolean;
  } {
    // Check each zone to find which one contains the point
    for (const zone of this.data.zones) {
      if (this.isPointInZone(x, y, zone)) {
        return {
          type: zone.type,
          friction: zone.properties.friction,
          grip: zone.properties.grip,
          roughness: zone.properties.roughness,
          isCollidable: zone.properties.isCollidable,
          isCheckpoint: zone.properties.isCheckpoint,
        };
      }
    }

    // Default to grass if no zone is found
    return {
      type: 'grass',
      friction: 0.85,
      grip: 0.7,
      roughness: 0.8,
      isCollidable: false,
      isCheckpoint: false,
    };
  }

  /**
   * Check if a point is inside a zone
   */
  private isPointInZone(x: number, y: number, zone: TrackZone): boolean {
    const { geometry } = zone;

    switch (geometry.type) {
      case 'rectangle':
        return this.isPointInRectangle(x, y, geometry);
      case 'circle':
        return this.isPointInCircle(x, y, geometry);
      case 'polygon':
        return this.isPointInPolygon(x, y, geometry);
      default:
        return false;
    }
  }

  /**
   * Check if point is inside a rectangle
   */
  private isPointInRectangle(x: number, y: number, geometry: TrackZone['geometry']): boolean {
    if (geometry.type !== 'rectangle' || !geometry.width || !geometry.height || geometry.points.length === 0) {
      return false;
    }

    const topLeft = geometry.points[0];
    if (!topLeft) return false;

    const right = topLeft.x + geometry.width;
    const bottom = topLeft.y + geometry.height;

    return x >= topLeft.x && x <= right && y >= topLeft.y && y <= bottom;
  }

  /**
   * Check if point is inside a circle
   */
  private isPointInCircle(x: number, y: number, geometry: TrackZone['geometry']): boolean {
    if (geometry.type !== 'circle' || !geometry.radius || geometry.points.length === 0) {
      return false;
    }

    const center = geometry.points[0];
    if (!center) return false;

    const distance = Math.sqrt(
      Math.pow(x - center.x, 2) + Math.pow(y - center.y, 2)
    );

    return distance <= geometry.radius;
  }

  /**
   * Check if point is inside a polygon using ray casting algorithm
   */
  private isPointInPolygon(x: number, y: number, geometry: TrackZone['geometry']): boolean {
    if (geometry.type !== 'polygon' || geometry.points.length < 3) {
      return false;
    }

    let inside = false;
    const points = geometry.points;

    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
      const pointI = points[i];
      const pointJ = points[j];
      
      if (!pointI || !pointJ) continue;

      const xi = pointI.x;
      const yi = pointI.y;
      const xj = pointJ.x;
      const yj = pointJ.y;

      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }

    return inside;
  }

  /**
   * Get track data
   */
  getData(): TrackData {
    return { ...this.data };
  }

  /**
   * Get track zones
   */
  getZones(): TrackZone[] {
    return [...this.data.zones];
  }

  /**
   * Get zone by ID
   */
  getZone(id: string): TrackZone | undefined {
    return this.zones.get(id);
  }

  /**
   * Get start position
   */
  getStartPosition(): { x: number; y: number; angle: number } {
    return { ...this.data.startPosition };
  }

  /**
   * Get checkpoints
   */
  getCheckpoints(): Array<{
    id: string;
    position: { x: number; y: number };
    radius: number;
    order: number;
  }> {
    return [...this.data.checkpoints];
  }

  /**
   * Get track dimensions
   */
  getDimensions(): { width: number; height: number } {
    return {
      width: this.data.width,
      height: this.data.height,
    };
  }

  /**
   * Get track difficulty
   */
  getDifficulty(): string {
    return this.data.difficulty;
  }

  /**
   * Get number of laps
   */
  getLaps(): number {
    return this.data.laps;
  }

  /**
   * Check if position is within track bounds
   */
  isWithinBounds(x: number, y: number): boolean {
    return x >= 0 && x <= this.data.width && y >= 0 && y <= this.data.height;
  }

  /**
   * Get all collidable zones at a position
   */
  getCollidableZonesAt(x: number, y: number): TrackZone[] {
    return this.data.zones.filter(zone => 
      zone.properties.isCollidable && this.isPointInZone(x, y, zone)
    );
  }

  /**
   * Get checkpoint at position (if any)
   */
  getCheckpointAt(x: number, y: number): {
    id: string;
    position: { x: number; y: number };
    radius: number;
    order: number;
  } | null {
    for (const checkpoint of this.data.checkpoints) {
      const distance = Math.sqrt(
        Math.pow(x - checkpoint.position.x, 2) + 
        Math.pow(y - checkpoint.position.y, 2)
      );
      
      if (distance <= checkpoint.radius) {
        return checkpoint;
      }
    }
    
    return null;
  }
}

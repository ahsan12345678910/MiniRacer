/**
 * Simplified Track system
 * 
 * Loads track data from JSON and provides surface detection
 */

export interface TrackData {
  /** Track width in meters */
  width: number;
  /** Track height in meters */
  height: number;
  /** Starting position and angle */
  start: {
    x: number;
    y: number;
    angle: number;
  };
  /** Surface rectangles */
  surfaces: Array<{
    type: 'asphalt' | 'grass';
    rect: [number, number, number, number]; // [x, y, width, height]
  }>;
  /** Wall segments for collision */
  walls: Array<[number, number, number, number]>; // [x1, y1, x2, y2]
  /** Start line definition */
  startLine: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    norm: [number, number]; // Normal vector [nx, ny]
  };
}

export interface Surface {
  /** Surface type */
  type: 'asphalt' | 'grass';
  /** Surface friction coefficient */
  friction: number;
}

/**
 * Simplified Track class
 */
export class Track {
  private data: TrackData;

  constructor(trackData: TrackData) {
    this.data = trackData;
  }

  /**
   * Gets surface type at world coordinates
   * @param x - World X coordinate
   * @param y - World Y coordinate
   * @returns Surface properties
   */
  getSurfaceAt(x: number, y: number): Surface {
    // Check each surface rectangle
    for (const surface of this.data.surfaces) {
      const [rectX, rectY, rectWidth, rectHeight] = surface.rect;
      
      if (x >= rectX && x <= rectX + rectWidth && 
          y >= rectY && y <= rectY + rectHeight) {
        return {
          type: surface.type,
          friction: surface.type === 'asphalt' ? 0.98 : 0.90,
        };
      }
    }
    
    // Default to grass if not in any surface
    return {
      type: 'grass',
      friction: 0.90,
    };
  }

  /**
   * Gets track dimensions
   * @returns Track width and height
   */
  getDimensions(): { width: number; height: number } {
    return {
      width: this.data.width,
      height: this.data.height,
    };
  }

  /**
   * Gets starting position
   * @returns Starting position and angle
   */
  getStartPosition(): { x: number; y: number; angle: number } {
    return { ...this.data.start };
  }

  /**
   * Gets wall segments for collision detection
   * @returns Array of wall segments
   */
  getWalls(): Array<[number, number, number, number]> {
    return [...this.data.walls];
  }

  /**
   * Gets start line definition
   * @returns Start line coordinates and normal
   */
  getStartLine(): {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    norm: [number, number];
  } {
    return { ...this.data.startLine };
  }

  /**
   * Gets raw track data
   * @returns Complete track data
   */
  getData(): TrackData {
    return { ...this.data };
  }

  /**
   * Checks if position is within track bounds
   * @param x - World X coordinate
   * @param y - World Y coordinate
   * @returns True if within bounds
   */
  isWithinBounds(x: number, y: number): boolean {
    return x >= 0 && x <= this.data.width && y >= 0 && y <= this.data.height;
  }
}

/**
 * Loads track data from JSON
 * @param trackJson - Track data as JSON object
 * @returns Track instance
 */
export function loadTrack(trackJson: TrackData): Track {
  return new Track(trackJson);
}

/**
 * Default surface types
 */
export const SURFACE_TYPES = {
  ASPHALT: { type: 'asphalt' as const, friction: 0.98 },
  GRASS: { type: 'grass' as const, friction: 0.90 },
} as const;
/**
 * Track Loader
 * 
 * Async track loading with validation
 * - Loads track data from JSON files
 * - Validates track structure
 * - Throws clear errors for invalid data
 */

import { Track } from '../state/GameState';

export interface TrackData {
  width: number;
  height: number;
  start: {
    x: number;
    y: number;
    angle: number;
  };
  surfaces: Array<{
    type: 'asphalt' | 'grass';
    rect: [number, number, number, number]; // [x, y, width, height]
  }>;
  walls: Array<[number, number, number, number]>; // [x1, y1, x2, y2]
  startLine: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    norm: [number, number]; // Normal vector [nx, ny]
  };
}

/**
 * Loads a track by name
 * @param name - Track name (default: 'default')
 * @returns Promise<Track> - Loaded track data
 */
export async function loadTrack(name: string = 'default'): Promise<Track> {
  try {
    // Load track data from JSON file
    const trackData = await loadTrackData(name);
    
    // Validate track data
    validateTrackData(trackData);
    
    return trackData;
  } catch (error) {
    console.error(`Failed to load track '${name}':`, error);
    throw new Error(`Track loading failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Loads track data from JSON file
 */
async function loadTrackData(name: string): Promise<TrackData> {
  // In a real app, this would load from assets/tracks/${name}.json
  // For now, we'll return the default track data directly
  if (name === 'default') {
    return {
      width: 800,
      height: 600,
      start: {
        x: 100,
        y: 300,
        angle: 0
      },
      surfaces: [
        {
          type: "asphalt",
          rect: [50, 50, 700, 500]
        },
        {
          type: "grass",
          rect: [0, 0, 800, 50]
        },
        {
          type: "grass",
          rect: [0, 550, 800, 50]
        },
        {
          type: "grass",
          rect: [0, 0, 50, 600]
        },
        {
          type: "grass",
          rect: [750, 0, 50, 600]
        }
      ],
      walls: [
        [50, 50, 750, 50],
        [750, 50, 750, 550],
        [750, 550, 50, 550],
        [50, 550, 50, 50],
        [200, 200, 600, 200],
        [600, 200, 600, 400],
        [600, 400, 200, 400],
        [200, 400, 200, 200]
      ],
      startLine: {
        x1: 100,
        y1: 300,
        x2: 100,
        y2: 350,
        norm: [1, 0]
      }
    };
  }
  
  throw new Error(`Track '${name}' not found`);
}

/**
 * Validates track data structure
 */
function validateTrackData(data: any): asserts data is TrackData {
  if (!data || typeof data !== 'object') {
    throw new Error('Track data must be an object');
  }

  // Validate required fields
  const requiredFields = ['width', 'height', 'start', 'surfaces', 'walls', 'startLine'];
  for (const field of requiredFields) {
    if (!(field in data)) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  // Validate dimensions
  if (typeof data.width !== 'number' || data.width <= 0) {
    throw new Error('Track width must be a positive number');
  }
  if (typeof data.height !== 'number' || data.height <= 0) {
    throw new Error('Track height must be a positive number');
  }

  // Validate start position
  if (!data.start || typeof data.start !== 'object') {
    throw new Error('Start position must be an object');
  }
  if (typeof data.start.x !== 'number' || typeof data.start.y !== 'number' || typeof data.start.angle !== 'number') {
    throw new Error('Start position must have x, y, and angle numbers');
  }

  // Validate surfaces
  if (!Array.isArray(data.surfaces)) {
    throw new Error('Surfaces must be an array');
  }
  for (const surface of data.surfaces) {
    if (!surface || typeof surface !== 'object') {
      throw new Error('Each surface must be an object');
    }
    if (surface.type !== 'asphalt' && surface.type !== 'grass') {
      throw new Error('Surface type must be "asphalt" or "grass"');
    }
    if (!Array.isArray(surface.rect) || surface.rect.length !== 4) {
      throw new Error('Surface rect must be an array of 4 numbers [x, y, width, height]');
    }
    for (const coord of surface.rect) {
      if (typeof coord !== 'number') {
        throw new Error('Surface rect coordinates must be numbers');
      }
    }
  }

  // Validate walls
  if (!Array.isArray(data.walls)) {
    throw new Error('Walls must be an array');
  }
  for (const wall of data.walls) {
    if (!Array.isArray(wall) || wall.length !== 4) {
      throw new Error('Each wall must be an array of 4 numbers [x1, y1, x2, y2]');
    }
    for (const coord of wall) {
      if (typeof coord !== 'number') {
        throw new Error('Wall coordinates must be numbers');
      }
    }
  }

  // Validate start line
  if (!data.startLine || typeof data.startLine !== 'object') {
    throw new Error('Start line must be an object');
  }
  const startLineFields = ['x1', 'y1', 'x2', 'y2', 'norm'];
  for (const field of startLineFields) {
    if (!(field in data.startLine)) {
      throw new Error(`Start line missing field: ${field}`);
    }
  }
  if (!Array.isArray(data.startLine.norm) || data.startLine.norm.length !== 2) {
    throw new Error('Start line norm must be an array of 2 numbers');
  }
}

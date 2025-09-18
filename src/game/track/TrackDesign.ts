/**
 * Race Track Design
 * 
 * Defines a realistic racing circuit with roads, grass, and walls
 */

export interface TrackSegment {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'road' | 'grass' | 'wall' | 'checkpoint';
  rotation?: number;
}

export interface TrackCheckpoint {
  x: number;
  y: number;
  width: number;
  height: number;
  id: number;
}

export interface TrackDesign {
  name: string;
  width: number;
  height: number;
  segments: TrackSegment[];
  checkpoints: TrackCheckpoint[];
  startLine: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
  finishLine: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
}

/**
 * Create a realistic racing circuit
 */
export const createRaceTrack = (): TrackDesign => {
  return {
    name: "Silverstone Circuit",
    width: 1200,
    height: 800,
    
    // Start/Finish line
    startLine: {
      x1: 200,
      y1: 100,
      x2: 300,
      y2: 100,
    },
    finishLine: {
      x1: 200,
      y1: 100,
      x2: 300,
      y2: 100,
    },
    
    // Track segments - Simplified racing circuit
    segments: [
      // Main straight (start/finish)
      { x: 200, y: 80, width: 300, height: 40, type: 'road' },
      
      // Turn 1 - Right turn
      { x: 480, y: 80, width: 40, height: 80, type: 'road' },
      { x: 480, y: 120, width: 100, height: 40, type: 'road' },
      
      // Back straight
      { x: 560, y: 120, width: 120, height: 40, type: 'road' },
      
      // Turn 2 - Left turn
      { x: 660, y: 120, width: 40, height: 80, type: 'road' },
      { x: 620, y: 160, width: 100, height: 40, type: 'road' },
      
      // Turn 3 - Right turn
      { x: 620, y: 180, width: 100, height: 40, type: 'road' },
      { x: 580, y: 180, width: 40, height: 80, type: 'road' },
      
      // Turn 4 - Left turn
      { x: 540, y: 180, width: 100, height: 40, type: 'road' },
      { x: 540, y: 160, width: 40, height: 80, type: 'road' },
      
      // Turn 5 - Right turn
      { x: 500, y: 160, width: 100, height: 40, type: 'road' },
      { x: 500, y: 120, width: 40, height: 80, type: 'road' },
      
      // Turn 6 - Left turn
      { x: 460, y: 120, width: 100, height: 40, type: 'road' },
      { x: 460, y: 80, width: 40, height: 80, type: 'road' },
      
      // Turn 7 - Right turn back to start
      { x: 420, y: 80, width: 100, height: 40, type: 'road' },
      { x: 420, y: 40, width: 40, height: 80, type: 'road' },
      
      // Turn 8 - Left turn
      { x: 380, y: 40, width: 100, height: 40, type: 'road' },
      { x: 380, y: 80, width: 40, height: 80, type: 'road' },
      
      // Grass areas
      { x: 0, y: 0, width: 1200, height: 80, type: 'grass' },
      { x: 0, y: 80, width: 150, height: 40, type: 'grass' },
      { x: 350, y: 80, width: 200, height: 40, type: 'grass' },
      { x: 0, y: 120, width: 320, height: 40, type: 'grass' },
      { x: 460, y: 120, width: 200, height: 40, type: 'grass' },
      { x: 0, y: 160, width: 420, height: 40, type: 'grass' },
      { x: 500, y: 160, width: 200, height: 40, type: 'grass' },
      { x: 0, y: 200, width: 480, height: 40, type: 'grass' },
      { x: 560, y: 200, width: 200, height: 40, type: 'grass' },
      { x: 0, y: 240, width: 520, height: 40, type: 'grass' },
      { x: 580, y: 240, width: 200, height: 40, type: 'grass' },
      { x: 0, y: 280, width: 1200, height: 200, type: 'grass' },
      
      // Walls/Barriers
      { x: 140, y: 70, width: 20, height: 50, type: 'wall' },
      { x: 350, y: 70, width: 20, height: 50, type: 'wall' },
      { x: 310, y: 110, width: 50, height: 20, type: 'wall' },
      { x: 410, y: 110, width: 50, height: 20, type: 'wall' },
      { x: 570, y: 110, width: 50, height: 20, type: 'wall' },
      { x: 630, y: 150, width: 20, height: 50, type: 'wall' },
      { x: 590, y: 190, width: 50, height: 20, type: 'wall' },
      { x: 550, y: 230, width: 50, height: 20, type: 'wall' },
      { x: 510, y: 190, width: 50, height: 20, type: 'wall' },
      { x: 470, y: 150, width: 50, height: 20, type: 'wall' },
      { x: 390, y: 150, width: 50, height: 20, type: 'wall' },
      { x: 350, y: 190, width: 50, height: 20, type: 'wall' },
      { x: 310, y: 150, width: 50, height: 20, type: 'wall' },
    ],
    
    // Checkpoints for lap counting
    checkpoints: [
      { x: 200, y: 100, width: 100, height: 20, id: 0 },
      { x: 400, y: 120, width: 100, height: 20, id: 1 },
      { x: 600, y: 160, width: 100, height: 20, id: 2 },
      { x: 500, y: 240, width: 100, height: 20, id: 3 },
      { x: 300, y: 200, width: 100, height: 20, id: 4 },
    ],
  };
};

/**
 * Get track segment at a specific position
 */
export const getTrackSegmentAt = (track: TrackDesign, x: number, y: number): TrackSegment | null => {
  for (const segment of track.segments) {
    if (x >= segment.x && x <= segment.x + segment.width &&
        y >= segment.y && y <= segment.y + segment.height) {
      return segment;
    }
  }
  return null;
};

/**
 * Check if a position is on the road
 */
export const isOnRoad = (track: TrackDesign, x: number, y: number): boolean => {
  const segment = getTrackSegmentAt(track, x, y);
  return segment?.type === 'road';
};

/**
 * Check if a position is on grass
 */
export const isOnGrass = (track: TrackDesign, x: number, y: number): boolean => {
  const segment = getTrackSegmentAt(track, x, y);
  return segment?.type === 'grass';
};

/**
 * Check if a position hits a wall
 */
export const isOnWall = (track: TrackDesign, x: number, y: number): boolean => {
  const segment = getTrackSegmentAt(track, x, y);
  return segment?.type === 'wall';
};

/**
 * Get surface type for physics
 */
export const getSurfaceType = (track: TrackDesign, x: number, y: number): 'road' | 'grass' | 'wall' => {
  const segment = getTrackSegmentAt(track, x, y);
  if (segment?.type === 'road') return 'road';
  if (segment?.type === 'grass') return 'grass';
  if (segment?.type === 'wall') return 'wall';
  return 'grass'; // Default to grass
};

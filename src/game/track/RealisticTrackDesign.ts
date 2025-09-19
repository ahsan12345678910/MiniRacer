/**
 * Realistic Race Track Design
 * 
 * Creates a professional racing circuit with proper roads, grass, walls, and track markings
 */

export interface TrackPoint {
  x: number;
  y: number;
  width: number; // Track width at this point
  type: 'straight' | 'left_turn' | 'right_turn' | 'chicane';
  radius?: number; // For turns
  angle?: number; // For turns
}

export interface TrackSegment {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'road' | 'grass' | 'wall' | 'curb' | 'runoff' | 'barrier';
  rotation?: number;
  color?: string;
  texture?: string;
  friction?: number;
}

export interface TrackMarking {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'center_line' | 'edge_line' | 'start_line' | 'finish_line' | 'checkpoint';
  rotation?: number;
  color: string;
  style: 'solid' | 'dashed' | 'dotted';
}

export interface RealisticTrackDesign {
  name: string;
  width: number;
  height: number;
  trackWidth: number; // Standard track width
  segments: TrackSegment[];
  markings: TrackMarking[];
  checkpoints: Array<{
    id: number;
    x: number;
    y: number;
    width: number;
    height: number;
    angle: number;
  }>;
  startLine: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    angle: number;
  };
  finishLine: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    angle: number;
  };
  racingLine: Array<{ x: number; y: number }>; // Optimal racing line
  trackBounds: {
    inner: Array<{ x: number; y: number }>;
    outer: Array<{ x: number; y: number }>;
  };
}

/**
 * Create a realistic Silverstone-style racing circuit
 */
export const createRealisticRaceTrack = (): RealisticTrackDesign => {
  const trackWidth = 60; // 60 units wide track
  const trackLength = 1200; // Match old track size
  const trackHeight = 800;  // Match old track size
  
  return {
    name: "Silverstone Circuit",
    width: trackLength,
    height: trackHeight,
    trackWidth,
    
    // Start/Finish line - positioned to match old track
    startLine: {
      x1: 200,
      y1: 100,
      x2: 300,
      y2: 100,
      angle: 0,
    },
    finishLine: {
      x1: 200,
      y1: 100,
      x2: 300,
      y2: 100,
      angle: 0,
    },
    
    // Track segments - Professional racing circuit
    segments: [
      // === ROAD SEGMENTS ===
      
      // Main straight (start/finish) - positioned to match old track
      { id: 'main_straight', x: 200, y: 80, width: 300, height: trackWidth, type: 'road', friction: 0.98 },
      
      // Turn 1 - Copse (fast right turn)
      { id: 'turn1_entry', x: 480, y: 80, width: 80, height: trackWidth, type: 'road', friction: 0.98 },
      { id: 'turn1_apex', x: 540, y: 140, width: trackWidth, height: 80, type: 'road', friction: 0.98 },
      { id: 'turn1_exit', x: 540, y: 200, width: 100, height: trackWidth, type: 'road', friction: 0.98 },
      
      // Turn 2 - Maggots (left-right chicane)
      { id: 'turn2_left', x: 360, y: 380, width: 60, height: trackWidth, type: 'road', friction: 0.98 },
      { id: 'turn2_right', x: 400, y: 340, width: trackWidth, height: 60, type: 'road', friction: 0.98 },
      { id: 'turn2_exit', x: 460, y: 340, width: 80, height: trackWidth, type: 'road', friction: 0.98 },
      
      // Turn 3 - Becketts (complex left-right sequence)
      { id: 'turn3_left1', x: 520, y: 340, width: 60, height: trackWidth, type: 'road', friction: 0.98 },
      { id: 'turn3_right1', x: 560, y: 300, width: trackWidth, height: 60, type: 'road', friction: 0.98 },
      { id: 'turn3_left2', x: 560, y: 240, width: 60, height: trackWidth, type: 'road', friction: 0.98 },
      { id: 'turn3_right2', x: 600, y: 200, width: trackWidth, height: 60, type: 'road', friction: 0.98 },
      
      // Turn 4 - Chapel (fast right turn)
      { id: 'turn4_entry', x: 600, y: 140, width: 80, height: trackWidth, type: 'road', friction: 0.98 },
      { id: 'turn4_apex', x: 660, y: 80, width: trackWidth, height: 80, type: 'road', friction: 0.98 },
      { id: 'turn4_exit', x: 660, y: 20, width: 100, height: trackWidth, type: 'road', friction: 0.98 },
      
      // Turn 5 - Stowe (slow right turn)
      { id: 'turn5_entry', x: 660, y: -40, width: 60, height: trackWidth, type: 'road', friction: 0.98 },
      { id: 'turn5_apex', x: 600, y: -80, width: 80, height: trackWidth, type: 'road', friction: 0.98 },
      { id: 'turn5_exit', x: 520, y: -80, width: 100, height: trackWidth, type: 'road', friction: 0.98 },
      
      // Turn 6 - Vale (left turn)
      { id: 'turn6_entry', x: 420, y: -80, width: 60, height: trackWidth, type: 'road', friction: 0.98 },
      { id: 'turn6_apex', x: 360, y: -40, width: trackWidth, height: 80, type: 'road', friction: 0.98 },
      { id: 'turn6_exit', x: 360, y: 20, width: 100, height: trackWidth, type: 'road', friction: 0.98 },
      
      // Turn 7 - Club (right turn)
      { id: 'turn7_entry', x: 360, y: 80, width: 60, height: trackWidth, type: 'road', friction: 0.98 },
      { id: 'turn7_apex', x: 300, y: 140, width: trackWidth, height: 80, type: 'road', friction: 0.98 },
      { id: 'turn7_exit', x: 300, y: 200, width: 100, height: trackWidth, type: 'road', friction: 0.98 },
      
      // Turn 8 - Abbey (left turn back to start)
      { id: 'turn8_entry', x: 300, y: 260, width: 60, height: trackWidth, type: 'road', friction: 0.98 },
      { id: 'turn8_apex', x: 240, y: 320, width: trackWidth, height: 80, type: 'road', friction: 0.98 },
      { id: 'turn8_exit', x: 180, y: 320, width: 80, height: trackWidth, type: 'road', friction: 0.98 },
      
      // === GRASS AREAS ===
      
      // Outer grass areas
      { id: 'grass_outer_1', x: 0, y: 0, width: trackLength, height: 50, type: 'grass', friction: 0.85 },
      { id: 'grass_outer_2', x: 0, y: trackHeight - 50, width: trackLength, height: 50, type: 'grass', friction: 0.85 },
      { id: 'grass_outer_3', x: 0, y: 50, width: 50, height: trackHeight - 100, type: 'grass', friction: 0.85 },
      { id: 'grass_outer_4', x: trackLength - 50, y: 50, width: 50, height: trackHeight - 100, type: 'grass', friction: 0.85 },
      
      // Inner grass areas
      { id: 'grass_inner_1', x: 200, y: 200, width: 100, height: 100, type: 'grass', friction: 0.85 },
      { id: 'grass_inner_2', x: 400, y: 100, width: 80, height: 80, type: 'grass', friction: 0.85 },
      { id: 'grass_inner_3', x: 500, y: 300, width: 60, height: 60, type: 'grass', friction: 0.85 },
      
      // === CURBS ===
      
      // Turn 1 curbs
      { id: 'curb_turn1_inner', x: 250, y: 330, width: 20, height: 20, type: 'curb', friction: 0.95 },
      { id: 'curb_turn1_outer', x: 300, y: 400, width: 20, height: 20, type: 'curb', friction: 0.95 },
      
      // Turn 2 curbs
      { id: 'curb_turn2_left', x: 420, y: 400, width: 20, height: 20, type: 'curb', friction: 0.95 },
      { id: 'curb_turn2_right', x: 480, y: 360, width: 20, height: 20, type: 'curb', friction: 0.95 },
      
      // Turn 3 curbs
      { id: 'curb_turn3_1', x: 580, y: 360, width: 20, height: 20, type: 'curb', friction: 0.95 },
      { id: 'curb_turn3_2', x: 620, y: 320, width: 20, height: 20, type: 'curb', friction: 0.95 },
      { id: 'curb_turn3_3', x: 620, y: 260, width: 20, height: 20, type: 'curb', friction: 0.95 },
      { id: 'curb_turn3_4', x: 660, y: 220, width: 20, height: 20, type: 'curb', friction: 0.95 },
      
      // Turn 4 curbs
      { id: 'curb_turn4_inner', x: 640, y: 160, width: 20, height: 20, type: 'curb', friction: 0.95 },
      { id: 'curb_turn4_outer', x: 700, y: 100, width: 20, height: 20, type: 'curb', friction: 0.95 },
      
      // Turn 5 curbs
      { id: 'curb_turn5_inner', x: 640, y: -20, width: 20, height: 20, type: 'curb', friction: 0.95 },
      { id: 'curb_turn5_outer', x: 580, y: -60, width: 20, height: 20, type: 'curb', friction: 0.95 },
      
      // Turn 6 curbs
      { id: 'curb_turn6_inner', x: 400, y: -60, width: 20, height: 20, type: 'curb', friction: 0.95 },
      { id: 'curb_turn6_outer', x: 340, y: -20, width: 20, height: 20, type: 'curb', friction: 0.95 },
      
      // Turn 7 curbs
      { id: 'curb_turn7_inner', x: 340, y: 100, width: 20, height: 20, type: 'curb', friction: 0.95 },
      { id: 'curb_turn7_outer', x: 280, y: 160, width: 20, height: 20, type: 'curb', friction: 0.95 },
      
      // Turn 8 curbs
      { id: 'curb_turn8_inner', x: 280, y: 280, width: 20, height: 20, type: 'curb', friction: 0.95 },
      { id: 'curb_turn8_outer', x: 220, y: 340, width: 20, height: 20, type: 'curb', friction: 0.95 },
      
      // === WALLS/BARRIERS ===
      
      // Outer barriers
      { id: 'barrier_outer_1', x: 0, y: 0, width: trackLength, height: 10, type: 'wall', friction: 1.0 },
      { id: 'barrier_outer_2', x: 0, y: trackHeight - 10, width: trackLength, height: 10, type: 'wall', friction: 1.0 },
      { id: 'barrier_outer_3', x: 0, y: 10, width: 10, height: trackHeight - 20, type: 'wall', friction: 1.0 },
      { id: 'barrier_outer_4', x: trackLength - 10, y: 10, width: 10, height: trackHeight - 20, type: 'wall', friction: 1.0 },
      
      // Turn barriers
      { id: 'barrier_turn1', x: 320, y: 410, width: 40, height: 20, type: 'wall', friction: 1.0 },
      { id: 'barrier_turn2', x: 500, y: 420, width: 40, height: 20, type: 'wall', friction: 1.0 },
      { id: 'barrier_turn3', x: 680, y: 240, width: 20, height: 40, type: 'wall', friction: 1.0 },
      { id: 'barrier_turn4', x: 720, y: 80, width: 40, height: 20, type: 'wall', friction: 1.0 },
      { id: 'barrier_turn5', x: 580, y: -100, width: 40, height: 20, type: 'wall', friction: 1.0 },
      { id: 'barrier_turn6', x: 320, y: -100, width: 40, height: 20, type: 'wall', friction: 1.0 },
      { id: 'barrier_turn7', x: 200, y: 180, width: 20, height: 40, type: 'wall', friction: 1.0 },
      { id: 'barrier_turn8', x: 160, y: 360, width: 40, height: 20, type: 'wall', friction: 1.0 },
      
      // === RUNOFF AREAS ===
      
      // Turn 1 runoff
      { id: 'runoff_turn1', x: 320, y: 430, width: 60, height: 40, type: 'runoff', friction: 0.80 },
      
      // Turn 2 runoff
      { id: 'runoff_turn2', x: 500, y: 440, width: 60, height: 40, type: 'runoff', friction: 0.80 },
      
      // Turn 3 runoff
      { id: 'runoff_turn3', x: 700, y: 260, width: 40, height: 60, type: 'runoff', friction: 0.80 },
      
      // Turn 4 runoff
      { id: 'runoff_turn4', x: 740, y: 100, width: 60, height: 40, type: 'runoff', friction: 0.80 },
      
      // Turn 5 runoff
      { id: 'runoff_turn5', x: 580, y: -120, width: 60, height: 40, type: 'runoff', friction: 0.80 },
      
      // Turn 6 runoff
      { id: 'runoff_turn6', x: 320, y: -120, width: 60, height: 40, type: 'runoff', friction: 0.80 },
      
      // Turn 7 runoff
      { id: 'runoff_turn7', x: 180, y: 200, width: 40, height: 60, type: 'runoff', friction: 0.80 },
      
      // Turn 8 runoff
      { id: 'runoff_turn8', x: 120, y: 380, width: 60, height: 40, type: 'runoff', friction: 0.80 },
    ],
    
    // Track markings
    markings: [
      // Center line (dashed)
      { id: 'center_line_1', x: 50, y: 300, width: 200, height: 2, type: 'center_line', color: '#FFFFFF', style: 'dashed' },
      { id: 'center_line_2', x: 220, y: 300, width: 80, height: 2, type: 'center_line', color: '#FFFFFF', style: 'dashed' },
      { id: 'center_line_3', x: 280, y: 300, width: 2, height: 80, type: 'center_line', color: '#FFFFFF', style: 'dashed' },
      { id: 'center_line_4', x: 280, y: 380, width: 100, height: 2, type: 'center_line', color: '#FFFFFF', style: 'dashed' },
      
      // Edge lines
      { id: 'edge_line_left_1', x: 50, y: 270, width: 200, height: 1, type: 'edge_line', color: '#FFFFFF', style: 'solid' },
      { id: 'edge_line_right_1', x: 50, y: 330, width: 200, height: 1, type: 'edge_line', color: '#FFFFFF', style: 'solid' },
      
      // Start line
      { id: 'start_line', x: 100, y: 270, width: 60, height: 60, type: 'start_line', color: '#FFFFFF', style: 'solid' },
      
      // Finish line
      { id: 'finish_line', x: 100, y: 270, width: 60, height: 60, type: 'finish_line', color: '#FFFFFF', style: 'solid' },
    ],
    
    // Checkpoints
    checkpoints: [
      { id: 0, x: 100, y: 300, width: 60, height: 20, angle: 0 },
      { id: 1, x: 300, y: 400, width: 20, height: 60, angle: 90 },
      { id: 2, x: 600, y: 200, width: 60, height: 20, angle: 0 },
      { id: 3, x: 600, y: 0, width: 20, height: 60, angle: 90 },
      { id: 4, x: 300, y: -80, width: 60, height: 20, angle: 0 },
      { id: 5, x: 100, y: 0, width: 20, height: 60, angle: 90 },
    ],
    
    // Racing line (optimal path)
    racingLine: [
      { x: 100, y: 300 }, // Start
      { x: 200, y: 300 }, // Main straight
      { x: 250, y: 320 }, // Turn 1 entry
      { x: 300, y: 350 }, // Turn 1 apex
      { x: 320, y: 400 }, // Turn 1 exit
      { x: 380, y: 400 }, // Turn 2 entry
      { x: 420, y: 360 }, // Turn 2 left
      { x: 460, y: 320 }, // Turn 2 right
      { x: 520, y: 320 }, // Turn 3 entry
      { x: 560, y: 280 }, // Turn 3 left
      { x: 580, y: 240 }, // Turn 3 right
      { x: 600, y: 200 }, // Turn 3 exit
      { x: 640, y: 160 }, // Turn 4 entry
      { x: 680, y: 120 }, // Turn 4 apex
      { x: 700, y: 80 }, // Turn 4 exit
      { x: 700, y: 40 }, // Turn 5 entry
      { x: 680, y: 0 }, // Turn 5 apex
      { x: 640, y: -40 }, // Turn 5 exit
      { x: 580, y: -40 }, // Turn 6 entry
      { x: 520, y: -20 }, // Turn 6 apex
      { x: 480, y: 0 }, // Turn 6 exit
      { x: 420, y: 0 }, // Turn 7 entry
      { x: 360, y: 40 }, // Turn 7 apex
      { x: 320, y: 80 }, // Turn 7 exit
      { x: 280, y: 120 }, // Turn 8 entry
      { x: 240, y: 160 }, // Turn 8 apex
      { x: 200, y: 200 }, // Turn 8 exit
      { x: 160, y: 240 }, // Back to start
      { x: 140, y: 280 }, // Final approach
      { x: 100, y: 300 }, // Start/finish
    ],
    
    // Track bounds
    trackBounds: {
      inner: [
        { x: 100, y: 270 },
        { x: 250, y: 320 },
        { x: 300, y: 350 },
        { x: 320, y: 400 },
        { x: 380, y: 400 },
        { x: 420, y: 360 },
        { x: 460, y: 320 },
        { x: 520, y: 320 },
        { x: 560, y: 280 },
        { x: 580, y: 240 },
        { x: 600, y: 200 },
        { x: 640, y: 160 },
        { x: 680, y: 120 },
        { x: 700, y: 80 },
        { x: 700, y: 40 },
        { x: 680, y: 0 },
        { x: 640, y: -40 },
        { x: 580, y: -40 },
        { x: 520, y: -20 },
        { x: 480, y: 0 },
        { x: 420, y: 0 },
        { x: 360, y: 40 },
        { x: 320, y: 80 },
        { x: 280, y: 120 },
        { x: 240, y: 160 },
        { x: 200, y: 200 },
        { x: 160, y: 240 },
        { x: 140, y: 280 },
        { x: 100, y: 270 },
      ],
      outer: [
        { x: 100, y: 330 },
        { x: 250, y: 380 },
        { x: 300, y: 410 },
        { x: 320, y: 460 },
        { x: 380, y: 460 },
        { x: 420, y: 420 },
        { x: 460, y: 380 },
        { x: 520, y: 380 },
        { x: 560, y: 340 },
        { x: 580, y: 300 },
        { x: 600, y: 260 },
        { x: 640, y: 220 },
        { x: 680, y: 180 },
        { x: 700, y: 140 },
        { x: 700, y: 100 },
        { x: 680, y: 60 },
        { x: 640, y: 20 },
        { x: 580, y: 20 },
        { x: 520, y: 40 },
        { x: 480, y: 60 },
        { x: 420, y: 60 },
        { x: 360, y: 100 },
        { x: 320, y: 140 },
        { x: 280, y: 180 },
        { x: 240, y: 220 },
        { x: 200, y: 260 },
        { x: 160, y: 300 },
        { x: 140, y: 340 },
        { x: 100, y: 330 },
      ],
    },
  };
};

/**
 * Get surface type at a specific position
 */
export const getSurfaceTypeAt = (track: RealisticTrackDesign, x: number, y: number): {
  type: 'road' | 'grass' | 'wall' | 'curb' | 'runoff' | 'barrier';
  friction: number;
  color: string;
} => {
  // Check segments in order of priority
  for (const segment of track.segments) {
    if (x >= segment.x && x <= segment.x + segment.width &&
        y >= segment.y && y <= segment.y + segment.height) {
      return {
        type: segment.type,
        friction: segment.friction || getDefaultFriction(segment.type),
        color: segment.color || getDefaultColor(segment.type),
      };
    }
  }
  
  // Default to grass
  return {
    type: 'grass',
    friction: 0.85,
    color: '#2a4a2a',
  };
};

/**
 * Get default friction for surface type
 */
const getDefaultFriction = (type: string): number => {
  switch (type) {
    case 'road': return 0.98;
    case 'grass': return 0.85;
    case 'wall': return 1.0;
    case 'curb': return 0.95;
    case 'runoff': return 0.80;
    case 'barrier': return 1.0;
    default: return 0.85;
  }
};

/**
 * Get default color for surface type
 */
const getDefaultColor = (type: string): string => {
  switch (type) {
    case 'road': return '#404040';
    case 'grass': return '#2a4a2a';
    case 'wall': return '#8B4513';
    case 'curb': return '#FFD700';
    case 'runoff': return '#654321';
    case 'barrier': return '#A0522D';
    default: return '#2a4a2a';
  }
};

/**
 * Check if position is within track bounds
 */
export const isWithinTrackBounds = (track: RealisticTrackDesign, x: number, y: number): boolean => {
  return x >= 0 && x <= track.width && y >= 0 && y <= track.height;
};

/**
 * Get optimal racing line for AI
 */
export const getRacingLine = (track: RealisticTrackDesign): Array<{ x: number; y: number }> => {
  return track.racingLine;
};

/**
 * Get track segment at position
 */
export const getTrackSegmentAt = (track: RealisticTrackDesign, x: number, y: number): TrackSegment | null => {
  for (const segment of track.segments) {
    if (x >= segment.x && x <= segment.x + segment.width &&
        y >= segment.y && y <= segment.y + segment.height) {
      return segment;
    }
  }
  return null;
};

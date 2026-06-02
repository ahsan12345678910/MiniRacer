/**
 * Simple Straight Track Design
 * 
 * Creates a wide straight line track with no curves or circles
 */

export interface StraightTrackSegment {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'road' | 'grass' | 'start_finish' | 'barrier';
  color: string;
  friction: number;
}

export interface StraightTrack {
  name: string;
  width: number;
  height: number;
  segments: StraightTrackSegment[];
  startLine: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
  checkpoints: Array<{
    id: number;
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
}

/**
 * Create a simple straight track
 */
export const createStraightTrack = (): StraightTrack => {
  const trackWidth = 120; // Much wider track (was 80)
  const trackLength = 5000; // Even longer straight track (was 3000)
  const trackHeight = 250; // Track area height (was 200)
  
  return {
    name: "Simple Straight Track",
    width: trackLength,
    height: trackHeight,
    
    // Start/Finish line at the beginning
    startLine: {
      x1: 50,
      y1: 90,
      x2: 50,
      y2: 210,
    },
    
    // Track segments - Simple straight line
    segments: [
      // === MAIN STRAIGHT ROAD ===
      { id: 'main_road', x: 0, y: 90, width: trackLength, height: trackWidth, type: 'road', color: '#404040', friction: 0.98 },
      
      // === GRASS AREAS ===
      // Top grass
      { id: 'grass_top', x: 0, y: 0, width: trackLength, height: 90, type: 'grass', color: '#2a4a2a', friction: 0.85 },
      // Bottom grass
      { id: 'grass_bottom', x: 0, y: 210, width: trackLength, height: 40, type: 'grass', color: '#2a4a2a', friction: 0.85 },
      
      // === START/FINISH LINE ===
      { id: 'start_finish', x: 40, y: 90, width: 20, height: trackWidth, type: 'start_finish', color: '#FFFFFF', friction: 0.98 },
      
      // === BARRIERS ===
      // Left barriers - every 300px for 5000px track
      { id: 'barrier_left_1', x: 300, y: 80, width: 10, height: 20, type: 'barrier', color: '#8B4513', friction: 1.0 },
      { id: 'barrier_left_2', x: 600, y: 80, width: 10, height: 20, type: 'barrier', color: '#8B4513', friction: 1.0 },
      { id: 'barrier_left_3', x: 900, y: 80, width: 10, height: 20, type: 'barrier', color: '#8B4513', friction: 1.0 },
      { id: 'barrier_left_4', x: 1200, y: 80, width: 10, height: 20, type: 'barrier', color: '#8B4513', friction: 1.0 },
      { id: 'barrier_left_5', x: 1500, y: 80, width: 10, height: 20, type: 'barrier', color: '#8B4513', friction: 1.0 },
      { id: 'barrier_left_6', x: 1800, y: 80, width: 10, height: 20, type: 'barrier', color: '#8B4513', friction: 1.0 },
      { id: 'barrier_left_7', x: 2100, y: 80, width: 10, height: 20, type: 'barrier', color: '#8B4513', friction: 1.0 },
      { id: 'barrier_left_8', x: 2400, y: 80, width: 10, height: 20, type: 'barrier', color: '#8B4513', friction: 1.0 },
      { id: 'barrier_left_9', x: 2700, y: 80, width: 10, height: 20, type: 'barrier', color: '#8B4513', friction: 1.0 },
      { id: 'barrier_left_10', x: 3000, y: 80, width: 10, height: 20, type: 'barrier', color: '#8B4513', friction: 1.0 },
      { id: 'barrier_left_11', x: 3300, y: 80, width: 10, height: 20, type: 'barrier', color: '#8B4513', friction: 1.0 },
      { id: 'barrier_left_12', x: 3600, y: 80, width: 10, height: 20, type: 'barrier', color: '#8B4513', friction: 1.0 },
      { id: 'barrier_left_13', x: 3900, y: 80, width: 10, height: 20, type: 'barrier', color: '#8B4513', friction: 1.0 },
      { id: 'barrier_left_14', x: 4200, y: 80, width: 10, height: 20, type: 'barrier', color: '#8B4513', friction: 1.0 },
      { id: 'barrier_left_15', x: 4500, y: 80, width: 10, height: 20, type: 'barrier', color: '#8B4513', friction: 1.0 },
      { id: 'barrier_left_16', x: 4800, y: 80, width: 10, height: 20, type: 'barrier', color: '#8B4513', friction: 1.0 },
      
      // Right barriers - every 300px for 5000px track
      { id: 'barrier_right_1', x: 300, y: 190, width: 10, height: 20, type: 'barrier', color: '#8B4513', friction: 1.0 },
      { id: 'barrier_right_2', x: 600, y: 190, width: 10, height: 20, type: 'barrier', color: '#8B4513', friction: 1.0 },
      { id: 'barrier_right_3', x: 900, y: 190, width: 10, height: 20, type: 'barrier', color: '#8B4513', friction: 1.0 },
      { id: 'barrier_right_4', x: 1200, y: 190, width: 10, height: 20, type: 'barrier', color: '#8B4513', friction: 1.0 },
      { id: 'barrier_right_5', x: 1500, y: 190, width: 10, height: 20, type: 'barrier', color: '#8B4513', friction: 1.0 },
      { id: 'barrier_right_6', x: 1800, y: 190, width: 10, height: 20, type: 'barrier', color: '#8B4513', friction: 1.0 },
      { id: 'barrier_right_7', x: 2100, y: 190, width: 10, height: 20, type: 'barrier', color: '#8B4513', friction: 1.0 },
      { id: 'barrier_right_8', x: 2400, y: 190, width: 10, height: 20, type: 'barrier', color: '#8B4513', friction: 1.0 },
      { id: 'barrier_right_9', x: 2700, y: 190, width: 10, height: 20, type: 'barrier', color: '#8B4513', friction: 1.0 },
      { id: 'barrier_right_10', x: 3000, y: 190, width: 10, height: 20, type: 'barrier', color: '#8B4513', friction: 1.0 },
      { id: 'barrier_right_11', x: 3300, y: 190, width: 10, height: 20, type: 'barrier', color: '#8B4513', friction: 1.0 },
      { id: 'barrier_right_12', x: 3600, y: 190, width: 10, height: 20, type: 'barrier', color: '#8B4513', friction: 1.0 },
      { id: 'barrier_right_13', x: 3900, y: 190, width: 10, height: 20, type: 'barrier', color: '#8B4513', friction: 1.0 },
      { id: 'barrier_right_14', x: 4200, y: 190, width: 10, height: 20, type: 'barrier', color: '#8B4513', friction: 1.0 },
      { id: 'barrier_right_15', x: 4500, y: 190, width: 10, height: 20, type: 'barrier', color: '#8B4513', friction: 1.0 },
      { id: 'barrier_right_16', x: 4800, y: 190, width: 10, height: 20, type: 'barrier', color: '#8B4513', friction: 1.0 },
    ],
    
    // Checkpoints along the straight track - every 500px for 5000px track
    checkpoints: [
      { id: 0, x: 50, y: 150, width: 20, height: 20 },
      { id: 1, x: 500, y: 150, width: 20, height: 20 },
      { id: 2, x: 1000, y: 150, width: 20, height: 20 },
      { id: 3, x: 1500, y: 150, width: 20, height: 20 },
      { id: 4, x: 2000, y: 150, width: 20, height: 20 },
      { id: 5, x: 2500, y: 150, width: 20, height: 20 },
      { id: 6, x: 3000, y: 150, width: 20, height: 20 },
      { id: 7, x: 3500, y: 150, width: 20, height: 20 },
      { id: 8, x: 4000, y: 150, width: 20, height: 20 },
      { id: 9, x: 4500, y: 150, width: 20, height: 20 },
      { id: 10, x: 4950, y: 150, width: 20, height: 20 },
    ],
  };
};

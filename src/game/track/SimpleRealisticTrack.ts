/**
 * Simple Realistic Track
 * 
 * Creates a realistic track that matches the old coordinates exactly
 */

export interface SimpleTrackSegment {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'road' | 'grass' | 'wall' | 'curb' | 'runoff' | 'barrier';
  color: string;
  friction: number;
}

export interface TrackMarking {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'center_line' | 'edge_line' | 'start_line' | 'finish_line';
  color: string;
  style: 'solid' | 'dashed' | 'dotted';
}

export interface SimpleRealisticTrack {
  name: string;
  width: number;
  height: number;
  segments: SimpleTrackSegment[];
  markings: TrackMarking[];
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
 * Create a simple realistic track that matches old coordinates
 */
export const createSimpleRealisticTrack = (): SimpleRealisticTrack => {
  return {
    name: "Realistic Racing Circuit",
    width: 1200,
    height: 800,
    
    // Start/Finish line - match old coordinates exactly
    startLine: {
      x1: 200,
      y1: 100,
      x2: 300,
      y2: 100,
    },
    
    // Track segments - match old track layout but with realistic visuals
    segments: [
      // === ROAD SEGMENTS ===
      
      // Main straight (start/finish)
      { id: 'main_straight', x: 200, y: 80, width: 300, height: 40, type: 'road', color: '#404040', friction: 0.98 },
      
      // Turn 1 - Right turn
      { id: 'turn1_1', x: 480, y: 80, width: 40, height: 80, type: 'road', color: '#404040', friction: 0.98 },
      { id: 'turn1_2', x: 480, y: 120, width: 100, height: 40, type: 'road', color: '#404040', friction: 0.98 },
      
      // Back straight
      { id: 'back_straight', x: 560, y: 120, width: 120, height: 40, type: 'road', color: '#404040', friction: 0.98 },
      
      // Turn 2 - Left turn
      { id: 'turn2_1', x: 660, y: 120, width: 40, height: 80, type: 'road', color: '#404040', friction: 0.98 },
      { id: 'turn2_2', x: 620, y: 160, width: 100, height: 40, type: 'road', color: '#404040', friction: 0.98 },
      
      // Turn 3 - Right turn
      { id: 'turn3_1', x: 620, y: 180, width: 100, height: 40, type: 'road', color: '#404040', friction: 0.98 },
      { id: 'turn3_2', x: 580, y: 180, width: 40, height: 80, type: 'road', color: '#404040', friction: 0.98 },
      
      // Turn 4 - Left turn
      { id: 'turn4_1', x: 540, y: 180, width: 100, height: 40, type: 'road', color: '#404040', friction: 0.98 },
      { id: 'turn4_2', x: 540, y: 160, width: 40, height: 80, type: 'road', color: '#404040', friction: 0.98 },
      
      // Turn 5 - Right turn
      { id: 'turn5_1', x: 500, y: 160, width: 100, height: 40, type: 'road', color: '#404040', friction: 0.98 },
      { id: 'turn5_2', x: 500, y: 120, width: 40, height: 80, type: 'road', color: '#404040', friction: 0.98 },
      
      // Turn 6 - Left turn
      { id: 'turn6_1', x: 460, y: 120, width: 100, height: 40, type: 'road', color: '#404040', friction: 0.98 },
      { id: 'turn6_2', x: 460, y: 80, width: 40, height: 80, type: 'road', color: '#404040', friction: 0.98 },
      
      // Turn 7 - Right turn back to start
      { id: 'turn7_1', x: 420, y: 80, width: 100, height: 40, type: 'road', color: '#404040', friction: 0.98 },
      { id: 'turn7_2', x: 420, y: 40, width: 40, height: 80, type: 'road', color: '#404040', friction: 0.98 },
      
      // Turn 8 - Left turn
      { id: 'turn8_1', x: 380, y: 40, width: 100, height: 40, type: 'road', color: '#404040', friction: 0.98 },
      { id: 'turn8_2', x: 380, y: 80, width: 40, height: 80, type: 'road', color: '#404040', friction: 0.98 },
      
      // === GRASS AREAS ===
      
      // Outer grass areas
      { id: 'grass_outer_1', x: 0, y: 0, width: 1200, height: 80, type: 'grass', color: '#2a4a2a', friction: 0.85 },
      { id: 'grass_outer_2', x: 0, y: 80, width: 150, height: 40, type: 'grass', color: '#2a4a2a', friction: 0.85 },
      { id: 'grass_outer_3', x: 350, y: 80, width: 200, height: 40, type: 'grass', color: '#2a4a2a', friction: 0.85 },
      { id: 'grass_outer_4', x: 0, y: 120, width: 320, height: 40, type: 'grass', color: '#2a4a2a', friction: 0.85 },
      { id: 'grass_outer_5', x: 460, y: 120, width: 200, height: 40, type: 'grass', color: '#2a4a2a', friction: 0.85 },
      { id: 'grass_outer_6', x: 0, y: 160, width: 420, height: 40, type: 'grass', color: '#2a4a2a', friction: 0.85 },
      { id: 'grass_outer_7', x: 500, y: 160, width: 200, height: 40, type: 'grass', color: '#2a4a2a', friction: 0.85 },
      { id: 'grass_outer_8', x: 0, y: 200, width: 480, height: 40, type: 'grass', color: '#2a4a2a', friction: 0.85 },
      { id: 'grass_outer_9', x: 560, y: 200, width: 200, height: 40, type: 'grass', color: '#2a4a2a', friction: 0.85 },
      { id: 'grass_outer_10', x: 0, y: 240, width: 520, height: 40, type: 'grass', color: '#2a4a2a', friction: 0.85 },
      { id: 'grass_outer_11', x: 580, y: 240, width: 200, height: 40, type: 'grass', color: '#2a4a2a', friction: 0.85 },
      { id: 'grass_outer_12', x: 0, y: 280, width: 1200, height: 200, type: 'grass', color: '#2a4a2a', friction: 0.85 },
      
      // === WALLS/BARRIERS ===
      
      // Outer barriers
      { id: 'barrier_1', x: 140, y: 70, width: 20, height: 50, type: 'wall', color: '#8B4513', friction: 1.0 },
      { id: 'barrier_2', x: 350, y: 70, width: 20, height: 50, type: 'wall', color: '#8B4513', friction: 1.0 },
      { id: 'barrier_3', x: 310, y: 110, width: 50, height: 20, type: 'wall', color: '#8B4513', friction: 1.0 },
      { id: 'barrier_4', x: 410, y: 110, width: 50, height: 20, type: 'wall', color: '#8B4513', friction: 1.0 },
      { id: 'barrier_5', x: 570, y: 110, width: 50, height: 20, type: 'wall', color: '#8B4513', friction: 1.0 },
      { id: 'barrier_6', x: 630, y: 150, width: 20, height: 50, type: 'wall', color: '#8B4513', friction: 1.0 },
      { id: 'barrier_7', x: 590, y: 190, width: 50, height: 20, type: 'wall', color: '#8B4513', friction: 1.0 },
      { id: 'barrier_8', x: 550, y: 230, width: 50, height: 20, type: 'wall', color: '#8B4513', friction: 1.0 },
      { id: 'barrier_9', x: 510, y: 190, width: 50, height: 20, type: 'wall', color: '#8B4513', friction: 1.0 },
      { id: 'barrier_10', x: 470, y: 150, width: 50, height: 20, type: 'wall', color: '#8B4513', friction: 1.0 },
      { id: 'barrier_11', x: 390, y: 150, width: 50, height: 20, type: 'wall', color: '#8B4513', friction: 1.0 },
      { id: 'barrier_12', x: 350, y: 190, width: 50, height: 20, type: 'wall', color: '#8B4513', friction: 1.0 },
      { id: 'barrier_13', x: 310, y: 150, width: 50, height: 20, type: 'wall', color: '#8B4513', friction: 1.0 },
      
      // === CURBS ===
      
      // Turn curbs
      { id: 'curb_1', x: 250, y: 120, width: 20, height: 20, type: 'curb', color: '#FFD700', friction: 0.95 },
      { id: 'curb_2', x: 450, y: 120, width: 20, height: 20, type: 'curb', color: '#FFD700', friction: 0.95 },
      { id: 'curb_3', x: 650, y: 160, width: 20, height: 20, type: 'curb', color: '#FFD700', friction: 0.95 },
      { id: 'curb_4', x: 600, y: 200, width: 20, height: 20, type: 'curb', color: '#FFD700', friction: 0.95 },
      { id: 'curb_5', x: 520, y: 200, width: 20, height: 20, type: 'curb', color: '#FFD700', friction: 0.95 },
      { id: 'curb_6', x: 480, y: 160, width: 20, height: 20, type: 'curb', color: '#FFD700', friction: 0.95 },
      { id: 'curb_7', x: 440, y: 120, width: 20, height: 20, type: 'curb', color: '#FFD700', friction: 0.95 },
      { id: 'curb_8', x: 400, y: 80, width: 20, height: 20, type: 'curb', color: '#FFD700', friction: 0.95 },
      { id: 'curb_9', x: 360, y: 80, width: 20, height: 20, type: 'curb', color: '#FFD700', friction: 0.95 },
      
      // === RUNOFF AREAS ===
      
      // Turn runoff areas
      { id: 'runoff_1', x: 150, y: 50, width: 50, height: 30, type: 'runoff', color: '#654321', friction: 0.80 },
      { id: 'runoff_2', x: 450, y: 50, width: 50, height: 30, type: 'runoff', color: '#654321', friction: 0.80 },
      { id: 'runoff_3', x: 650, y: 100, width: 30, height: 50, type: 'runoff', color: '#654321', friction: 0.80 },
      { id: 'runoff_4', x: 650, y: 220, width: 30, height: 50, type: 'runoff', color: '#654321', friction: 0.80 },
      { id: 'runoff_5', x: 550, y: 250, width: 50, height: 30, type: 'runoff', color: '#654321', friction: 0.80 },
      { id: 'runoff_6', x: 450, y: 250, width: 50, height: 30, type: 'runoff', color: '#654321', friction: 0.80 },
      { id: 'runoff_7', x: 350, y: 250, width: 50, height: 30, type: 'runoff', color: '#654321', friction: 0.80 },
      { id: 'runoff_8', x: 250, y: 250, width: 50, height: 30, type: 'runoff', color: '#654321', friction: 0.80 },
      { id: 'runoff_9', x: 150, y: 250, width: 50, height: 30, type: 'runoff', color: '#654321', friction: 0.80 },
    ],
    
    // Track markings
    markings: [
      // Center lines (dashed white)
      { id: 'center_line_1', x: 200, y: 100, width: 300, height: 2, type: 'center_line', color: '#FFFFFF', style: 'dashed' },
      { id: 'center_line_2', x: 480, y: 100, width: 2, height: 80, type: 'center_line', color: '#FFFFFF', style: 'dashed' },
      { id: 'center_line_3', x: 480, y: 140, width: 100, height: 2, type: 'center_line', color: '#FFFFFF', style: 'dashed' },
      { id: 'center_line_4', x: 560, y: 140, width: 120, height: 2, type: 'center_line', color: '#FFFFFF', style: 'dashed' },
      { id: 'center_line_5', x: 660, y: 140, width: 2, height: 80, type: 'center_line', color: '#FFFFFF', style: 'dashed' },
      { id: 'center_line_6', x: 620, y: 180, width: 100, height: 2, type: 'center_line', color: '#FFFFFF', style: 'dashed' },
      { id: 'center_line_7', x: 620, y: 200, width: 100, height: 2, type: 'center_line', color: '#FFFFFF', style: 'dashed' },
      { id: 'center_line_8', x: 580, y: 200, width: 2, height: 80, type: 'center_line', color: '#FFFFFF', style: 'dashed' },
      { id: 'center_line_9', x: 540, y: 200, width: 100, height: 2, type: 'center_line', color: '#FFFFFF', style: 'dashed' },
      { id: 'center_line_10', x: 540, y: 180, width: 2, height: 80, type: 'center_line', color: '#FFFFFF', style: 'dashed' },
      { id: 'center_line_11', x: 500, y: 180, width: 100, height: 2, type: 'center_line', color: '#FFFFFF', style: 'dashed' },
      { id: 'center_line_12', x: 500, y: 140, width: 2, height: 80, type: 'center_line', color: '#FFFFFF', style: 'dashed' },
      { id: 'center_line_13', x: 460, y: 140, width: 100, height: 2, type: 'center_line', color: '#FFFFFF', style: 'dashed' },
      { id: 'center_line_14', x: 460, y: 100, width: 2, height: 80, type: 'center_line', color: '#FFFFFF', style: 'dashed' },
      { id: 'center_line_15', x: 420, y: 100, width: 100, height: 2, type: 'center_line', color: '#FFFFFF', style: 'dashed' },
      { id: 'center_line_16', x: 420, y: 60, width: 2, height: 80, type: 'center_line', color: '#FFFFFF', style: 'dashed' },
      { id: 'center_line_17', x: 380, y: 60, width: 100, height: 2, type: 'center_line', color: '#FFFFFF', style: 'dashed' },
      { id: 'center_line_18', x: 380, y: 100, width: 2, height: 80, type: 'center_line', color: '#FFFFFF', style: 'dashed' },
      
      // Edge lines (solid white)
      { id: 'edge_line_left_1', x: 200, y: 80, width: 300, height: 1, type: 'edge_line', color: '#FFFFFF', style: 'solid' },
      { id: 'edge_line_right_1', x: 200, y: 120, width: 300, height: 1, type: 'edge_line', color: '#FFFFFF', style: 'solid' },
      { id: 'edge_line_left_2', x: 480, y: 80, width: 1, height: 80, type: 'edge_line', color: '#FFFFFF', style: 'solid' },
      { id: 'edge_line_right_2', x: 500, y: 80, width: 1, height: 80, type: 'edge_line', color: '#FFFFFF', style: 'solid' },
      { id: 'edge_line_left_3', x: 480, y: 140, width: 100, height: 1, type: 'edge_line', color: '#FFFFFF', style: 'solid' },
      { id: 'edge_line_right_3', x: 480, y: 160, width: 100, height: 1, type: 'edge_line', color: '#FFFFFF', style: 'solid' },
      { id: 'edge_line_left_4', x: 560, y: 140, width: 120, height: 1, type: 'edge_line', color: '#FFFFFF', style: 'solid' },
      { id: 'edge_line_right_4', x: 560, y: 160, width: 120, height: 1, type: 'edge_line', color: '#FFFFFF', style: 'solid' },
      { id: 'edge_line_left_5', x: 660, y: 140, width: 1, height: 80, type: 'edge_line', color: '#FFFFFF', style: 'solid' },
      { id: 'edge_line_right_5', x: 680, y: 140, width: 1, height: 80, type: 'edge_line', color: '#FFFFFF', style: 'solid' },
      { id: 'edge_line_left_6', x: 620, y: 180, width: 100, height: 1, type: 'edge_line', color: '#FFFFFF', style: 'solid' },
      { id: 'edge_line_right_6', x: 620, y: 200, width: 100, height: 1, type: 'edge_line', color: '#FFFFFF', style: 'solid' },
      { id: 'edge_line_left_7', x: 620, y: 200, width: 100, height: 1, type: 'edge_line', color: '#FFFFFF', style: 'solid' },
      { id: 'edge_line_right_7', x: 620, y: 220, width: 100, height: 1, type: 'edge_line', color: '#FFFFFF', style: 'solid' },
      { id: 'edge_line_left_8', x: 580, y: 200, width: 1, height: 80, type: 'edge_line', color: '#FFFFFF', style: 'solid' },
      { id: 'edge_line_right_8', x: 600, y: 200, width: 1, height: 80, type: 'edge_line', color: '#FFFFFF', style: 'solid' },
      { id: 'edge_line_left_9', x: 540, y: 200, width: 100, height: 1, type: 'edge_line', color: '#FFFFFF', style: 'solid' },
      { id: 'edge_line_right_9', x: 540, y: 220, width: 100, height: 1, type: 'edge_line', color: '#FFFFFF', style: 'solid' },
      { id: 'edge_line_left_10', x: 540, y: 180, width: 1, height: 80, type: 'edge_line', color: '#FFFFFF', style: 'solid' },
      { id: 'edge_line_right_10', x: 560, y: 180, width: 1, height: 80, type: 'edge_line', color: '#FFFFFF', style: 'solid' },
      { id: 'edge_line_left_11', x: 500, y: 180, width: 100, height: 1, type: 'edge_line', color: '#FFFFFF', style: 'solid' },
      { id: 'edge_line_right_11', x: 500, y: 200, width: 100, height: 1, type: 'edge_line', color: '#FFFFFF', style: 'solid' },
      { id: 'edge_line_left_12', x: 500, y: 140, width: 1, height: 80, type: 'edge_line', color: '#FFFFFF', style: 'solid' },
      { id: 'edge_line_right_12', x: 520, y: 140, width: 1, height: 80, type: 'edge_line', color: '#FFFFFF', style: 'solid' },
      { id: 'edge_line_left_13', x: 460, y: 140, width: 100, height: 1, type: 'edge_line', color: '#FFFFFF', style: 'solid' },
      { id: 'edge_line_right_13', x: 460, y: 160, width: 100, height: 1, type: 'edge_line', color: '#FFFFFF', style: 'solid' },
      { id: 'edge_line_left_14', x: 460, y: 100, width: 1, height: 80, type: 'edge_line', color: '#FFFFFF', style: 'solid' },
      { id: 'edge_line_right_14', x: 480, y: 100, width: 1, height: 80, type: 'edge_line', color: '#FFFFFF', style: 'solid' },
      { id: 'edge_line_left_15', x: 420, y: 100, width: 100, height: 1, type: 'edge_line', color: '#FFFFFF', style: 'solid' },
      { id: 'edge_line_right_15', x: 420, y: 120, width: 100, height: 1, type: 'edge_line', color: '#FFFFFF', style: 'solid' },
      { id: 'edge_line_left_16', x: 420, y: 60, width: 1, height: 80, type: 'edge_line', color: '#FFFFFF', style: 'solid' },
      { id: 'edge_line_right_16', x: 440, y: 60, width: 1, height: 80, type: 'edge_line', color: '#FFFFFF', style: 'solid' },
      { id: 'edge_line_left_17', x: 380, y: 60, width: 100, height: 1, type: 'edge_line', color: '#FFFFFF', style: 'solid' },
      { id: 'edge_line_right_17', x: 380, y: 80, width: 100, height: 1, type: 'edge_line', color: '#FFFFFF', style: 'solid' },
      { id: 'edge_line_left_18', x: 380, y: 100, width: 1, height: 80, type: 'edge_line', color: '#FFFFFF', style: 'solid' },
      { id: 'edge_line_right_18', x: 400, y: 100, width: 1, height: 80, type: 'edge_line', color: '#FFFFFF', style: 'solid' },
    ],
    
    // Checkpoints
    checkpoints: [
      { id: 0, x: 200, y: 100, width: 100, height: 20 },
      { id: 1, x: 400, y: 120, width: 100, height: 20 },
      { id: 2, x: 600, y: 160, width: 100, height: 20 },
      { id: 3, x: 500, y: 240, width: 100, height: 20 },
      { id: 4, x: 300, y: 200, width: 100, height: 20 },
    ],
  };
};

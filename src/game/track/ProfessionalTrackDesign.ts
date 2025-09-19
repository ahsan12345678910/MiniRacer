/**
 * Professional Track Design
 * 
 * Creates a track matching the image with overpass, curbs, and professional elements
 */

export interface ProfessionalTrackSegment {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'road' | 'grass' | 'curb' | 'overpass' | 'underpass' | 'start_finish' | 'barrier';
  color: string;
  friction: number;
  rotation?: number;
}

export interface TrackDecoration {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'tree' | 'building' | 'barrier' | 'advertising';
  color: string;
}

export interface ProfessionalTrack {
  name: string;
  width: number;
  height: number;
  segments: ProfessionalTrackSegment[];
  decorations: TrackDecoration[];
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
 * Create a professional track matching the image
 */
export const createProfessionalTrack = (): ProfessionalTrack => {
  return {
    name: "Professional Racing Circuit",
    width: 1200,
    height: 800,
    
    // Start/Finish line - checkered pattern
    startLine: {
      x1: 100,
      y1: 700,
      x2: 300,
      y2: 700,
    },
    
    // Track segments - Professional racing circuit
    segments: [
      // === MAIN TRACK ===
      
      // Bottom straight (start/finish area)
      { id: 'bottom_straight', x: 50, y: 680, width: 400, height: 40, type: 'road', color: '#404040', friction: 0.98 },
      
      // Turn 1 - Right turn up
      { id: 'turn1_entry', x: 450, y: 680, width: 40, height: 60, type: 'road', color: '#404040', friction: 0.98 },
      { id: 'turn1_apex', x: 470, y: 620, width: 60, height: 40, type: 'road', color: '#404040', friction: 0.98 },
      { id: 'turn1_exit', x: 470, y: 580, width: 40, height: 60, type: 'road', color: '#404040', friction: 0.98 },
      
      // Upper right section
      { id: 'upper_right', x: 470, y: 520, width: 100, height: 40, type: 'road', color: '#404040', friction: 0.98 },
      
      // Turn 2 - Left turn
      { id: 'turn2_entry', x: 570, y: 520, width: 40, height: 60, type: 'road', color: '#404040', friction: 0.98 },
      { id: 'turn2_apex', x: 550, y: 460, width: 60, height: 40, type: 'road', color: '#404040', friction: 0.98 },
      { id: 'turn2_exit', x: 550, y: 420, width: 40, height: 60, type: 'road', color: '#404040', friction: 0.98 },
      
      // Upper section
      { id: 'upper_section', x: 550, y: 360, width: 100, height: 40, type: 'road', color: '#404040', friction: 0.98 },
      
      // Turn 3 - Left turn
      { id: 'turn3_entry', x: 550, y: 320, width: 40, height: 60, type: 'road', color: '#404040', friction: 0.98 },
      { id: 'turn3_apex', x: 490, y: 300, width: 60, height: 40, type: 'road', color: '#404040', friction: 0.98 },
      { id: 'turn3_exit', x: 490, y: 260, width: 40, height: 60, type: 'road', color: '#404040', friction: 0.98 },
      
      // Upper left section
      { id: 'upper_left', x: 490, y: 200, width: 100, height: 40, type: 'road', color: '#404040', friction: 0.98 },
      
      // Turn 4 - Right turn
      { id: 'turn4_entry', x: 490, y: 160, width: 40, height: 60, type: 'road', color: '#404040', friction: 0.98 },
      { id: 'turn4_apex', x: 430, y: 140, width: 60, height: 40, type: 'road', color: '#404040', friction: 0.98 },
      { id: 'turn4_exit', x: 430, y: 100, width: 40, height: 60, type: 'road', color: '#404040', friction: 0.98 },
      
      // Left section
      { id: 'left_section', x: 430, y: 40, width: 100, height: 40, type: 'road', color: '#404040', friction: 0.98 },
      
      // Turn 5 - Right turn down
      { id: 'turn5_entry', x: 430, y: 0, width: 40, height: 60, type: 'road', color: '#404040', friction: 0.98 },
      { id: 'turn5_apex', x: 370, y: 20, width: 60, height: 40, type: 'road', color: '#404040', friction: 0.98 },
      { id: 'turn5_exit', x: 370, y: 60, width: 40, height: 60, type: 'road', color: '#404040', friction: 0.98 },
      
      // Middle section
      { id: 'middle_section', x: 370, y: 120, width: 100, height: 40, type: 'road', color: '#404040', friction: 0.98 },
      
      // Turn 6 - Right turn
      { id: 'turn6_entry', x: 370, y: 160, width: 40, height: 60, type: 'road', color: '#404040', friction: 0.98 },
      { id: 'turn6_apex', x: 310, y: 180, width: 60, height: 40, type: 'road', color: '#404040', friction: 0.98 },
      { id: 'turn6_exit', x: 310, y: 220, width: 40, height: 60, type: 'road', color: '#404040', friction: 0.98 },
      
      // Lower left section
      { id: 'lower_left', x: 310, y: 280, width: 100, height: 40, type: 'road', color: '#404040', friction: 0.98 },
      
      // Turn 7 - Right turn
      { id: 'turn7_entry', x: 310, y: 320, width: 40, height: 60, type: 'road', color: '#404040', friction: 0.98 },
      { id: 'turn7_apex', x: 250, y: 340, width: 60, height: 40, type: 'road', color: '#404040', friction: 0.98 },
      { id: 'turn7_exit', x: 250, y: 380, width: 40, height: 60, type: 'road', color: '#404040', friction: 0.98 },
      
      // Lower section
      { id: 'lower_section', x: 250, y: 440, width: 100, height: 40, type: 'road', color: '#404040', friction: 0.98 },
      
      // Turn 8 - Right turn
      { id: 'turn8_entry', x: 250, y: 480, width: 40, height: 60, type: 'road', color: '#404040', friction: 0.98 },
      { id: 'turn8_apex', x: 190, y: 500, width: 60, height: 40, type: 'road', color: '#404040', friction: 0.98 },
      { id: 'turn8_exit', x: 190, y: 540, width: 40, height: 60, type: 'road', color: '#404040', friction: 0.98 },
      
      // Final section back to start
      { id: 'final_section', x: 190, y: 600, width: 100, height: 40, type: 'road', color: '#404040', friction: 0.98 },
      
      // === OVERPASS/UNDERPASS STRUCTURE ===
      
      // Overpass (upper track)
      { id: 'overpass', x: 200, y: 500, width: 200, height: 20, type: 'overpass', color: '#606060', friction: 0.98 },
      
      // Underpass (lower track)
      { id: 'underpass', x: 200, y: 520, width: 200, height: 20, type: 'underpass', color: '#303030', friction: 0.98 },
      
      // === RED/WHITE STRIPED CURBS ===
      
      // Turn 1 curbs
      { id: 'curb_turn1_inner', x: 420, y: 640, width: 20, height: 20, type: 'curb', color: '#FF0000', friction: 0.95 },
      { id: 'curb_turn1_outer', x: 500, y: 640, width: 20, height: 20, type: 'curb', color: '#FF0000', friction: 0.95 },
      
      // Turn 2 curbs
      { id: 'curb_turn2_inner', x: 520, y: 480, width: 20, height: 20, type: 'curb', color: '#FF0000', friction: 0.95 },
      { id: 'curb_turn2_outer', x: 600, y: 480, width: 20, height: 20, type: 'curb', color: '#FF0000', friction: 0.95 },
      
      // Turn 3 curbs
      { id: 'curb_turn3_inner', x: 500, y: 280, width: 20, height: 20, type: 'curb', color: '#FF0000', friction: 0.95 },
      { id: 'curb_turn3_outer', x: 580, y: 280, width: 20, height: 20, type: 'curb', color: '#FF0000', friction: 0.95 },
      
      // Turn 4 curbs
      { id: 'curb_turn4_inner', x: 440, y: 140, width: 20, height: 20, type: 'curb', color: '#FF0000', friction: 0.95 },
      { id: 'curb_turn4_outer', x: 520, y: 140, width: 20, height: 20, type: 'curb', color: '#FF0000', friction: 0.95 },
      
      // Turn 5 curbs
      { id: 'curb_turn5_inner', x: 380, y: 0, width: 20, height: 20, type: 'curb', color: '#FF0000', friction: 0.95 },
      { id: 'curb_turn5_outer', x: 460, y: 0, width: 20, height: 20, type: 'curb', color: '#FF0000', friction: 0.95 },
      
      // Turn 6 curbs
      { id: 'curb_turn6_inner', x: 320, y: 140, width: 20, height: 20, type: 'curb', color: '#FF0000', friction: 0.95 },
      { id: 'curb_turn6_outer', x: 400, y: 140, width: 20, height: 20, type: 'curb', color: '#FF0000', friction: 0.95 },
      
      // Turn 7 curbs
      { id: 'curb_turn7_inner', x: 260, y: 280, width: 20, height: 20, type: 'curb', color: '#FF0000', friction: 0.95 },
      { id: 'curb_turn7_outer', x: 340, y: 280, width: 20, height: 20, type: 'curb', color: '#FF0000', friction: 0.95 },
      
      // Turn 8 curbs
      { id: 'curb_turn8_inner', x: 200, y: 420, width: 20, height: 20, type: 'curb', color: '#FF0000', friction: 0.95 },
      { id: 'curb_turn8_outer', x: 280, y: 420, width: 20, height: 20, type: 'curb', color: '#FF0000', friction: 0.95 },
      
      // === GRASS AREAS ===
      
      // Outer grass
      { id: 'grass_outer_1', x: 0, y: 0, width: 1200, height: 40, type: 'grass', color: '#2a4a2a', friction: 0.85 },
      { id: 'grass_outer_2', x: 0, y: 40, width: 40, height: 760, type: 'grass', color: '#2a4a2a', friction: 0.85 },
      { id: 'grass_outer_3', x: 1160, y: 40, width: 40, height: 760, type: 'grass', color: '#2a4a2a', friction: 0.85 },
      { id: 'grass_outer_4', x: 0, y: 760, width: 1200, height: 40, type: 'grass', color: '#2a4a2a', friction: 0.85 },
      
      // Inner grass areas
      { id: 'grass_inner_1', x: 100, y: 100, width: 200, height: 200, type: 'grass', color: '#2a4a2a', friction: 0.85 },
      { id: 'grass_inner_2', x: 400, y: 100, width: 200, height: 200, type: 'grass', color: '#2a4a2a', friction: 0.85 },
      { id: 'grass_inner_3', x: 100, y: 400, width: 200, height: 200, type: 'grass', color: '#2a4a2a', friction: 0.85 },
      { id: 'grass_inner_4', x: 400, y: 400, width: 200, height: 200, type: 'grass', color: '#2a4a2a', friction: 0.85 },
      
      // === BARRIERS ===
      
      // Track barriers
      { id: 'barrier_1', x: 50, y: 660, width: 20, height: 20, type: 'barrier', color: '#8B4513', friction: 1.0 },
      { id: 'barrier_2', x: 450, y: 660, width: 20, height: 20, type: 'barrier', color: '#8B4513', friction: 1.0 },
      { id: 'barrier_3', x: 570, y: 500, width: 20, height: 20, type: 'barrier', color: '#8B4513', friction: 1.0 },
      { id: 'barrier_4', x: 550, y: 300, width: 20, height: 20, type: 'barrier', color: '#8B4513', friction: 1.0 },
      { id: 'barrier_5', x: 490, y: 100, width: 20, height: 20, type: 'barrier', color: '#8B4513', friction: 1.0 },
      { id: 'barrier_6', x: 430, y: 0, width: 20, height: 20, type: 'barrier', color: '#8B4513', friction: 1.0 },
      { id: 'barrier_7', x: 370, y: 100, width: 20, height: 20, type: 'barrier', color: '#8B4513', friction: 1.0 },
      { id: 'barrier_8', x: 310, y: 200, width: 20, height: 20, type: 'barrier', color: '#8B4513', friction: 1.0 },
      { id: 'barrier_9', x: 250, y: 300, width: 20, height: 20, type: 'barrier', color: '#8B4513', friction: 1.0 },
      { id: 'barrier_10', x: 190, y: 400, width: 20, height: 20, type: 'barrier', color: '#8B4513', friction: 1.0 },
    ],
    
    // Track decorations
    decorations: [
      // Trees
      { id: 'tree_1', x: 80, y: 80, width: 20, height: 20, type: 'tree', color: '#228B22' },
      { id: 'tree_2', x: 150, y: 120, width: 20, height: 20, type: 'tree', color: '#228B22' },
      { id: 'tree_3', x: 220, y: 80, width: 20, height: 20, type: 'tree', color: '#228B22' },
      { id: 'tree_4', x: 80, y: 200, width: 20, height: 20, type: 'tree', color: '#228B22' },
      { id: 'tree_5', x: 150, y: 240, width: 20, height: 20, type: 'tree', color: '#228B22' },
      { id: 'tree_6', x: 220, y: 200, width: 20, height: 20, type: 'tree', color: '#228B22' },
      { id: 'tree_7', x: 80, y: 320, width: 20, height: 20, type: 'tree', color: '#228B22' },
      { id: 'tree_8', x: 150, y: 360, width: 20, height: 20, type: 'tree', color: '#228B22' },
      { id: 'tree_9', x: 220, y: 320, width: 20, height: 20, type: 'tree', color: '#228B22' },
      { id: 'tree_10', x: 80, y: 440, width: 20, height: 20, type: 'tree', color: '#228B22' },
      { id: 'tree_11', x: 150, y: 480, width: 20, height: 20, type: 'tree', color: '#228B22' },
      { id: 'tree_12', x: 220, y: 440, width: 20, height: 20, type: 'tree', color: '#228B22' },
      
      // Buildings
      { id: 'building_1', x: 50, y: 50, width: 40, height: 30, type: 'building', color: '#8B4513' },
      { id: 'building_2', x: 1100, y: 50, width: 40, height: 30, type: 'building', color: '#8B4513' },
      { id: 'building_3', x: 500, y: 600, width: 40, height: 30, type: 'building', color: '#8B4513' },
      { id: 'building_4', x: 600, y: 600, width: 40, height: 30, type: 'building', color: '#8B4513' },
      { id: 'building_5', x: 700, y: 600, width: 40, height: 30, type: 'building', color: '#8B4513' },
      
      // Barriers/Advertising
      { id: 'barrier_1', x: 100, y: 50, width: 10, height: 30, type: 'barrier', color: '#A0522D' },
      { id: 'barrier_2', x: 200, y: 50, width: 10, height: 30, type: 'barrier', color: '#A0522D' },
      { id: 'barrier_3', x: 1000, y: 50, width: 10, height: 30, type: 'barrier', color: '#A0522D' },
      { id: 'barrier_4', x: 1100, y: 50, width: 10, height: 30, type: 'barrier', color: '#A0522D' },
      { id: 'barrier_5', x: 500, y: 550, width: 10, height: 30, type: 'barrier', color: '#A0522D' },
    ],
    
    // Checkpoints
    checkpoints: [
      { id: 0, x: 100, y: 700, width: 200, height: 20 },
      { id: 1, x: 500, y: 600, width: 20, height: 100 },
      { id: 2, x: 600, y: 400, width: 100, height: 20 },
      { id: 3, x: 500, y: 200, width: 20, height: 100 },
      { id: 4, x: 300, y: 100, width: 100, height: 20 },
      { id: 5, x: 200, y: 300, width: 20, height: 100 },
    ],
  };
};

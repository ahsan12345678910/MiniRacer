/**
 * Power-up Types and Interfaces
 * 
 * Defines the structure for power-ups in the racing game
 */

export type PowerUpType = 'speed_boost' | 'shield' | 'magnet' | 'nitro';

export interface PowerUpConfig {
  id: string;
  type: PowerUpType;
  name: string;
  description: string;
  duration: number; // Duration in seconds
  effect: PowerUpEffect;
  visual: PowerUpVisual;
  spawn: PowerUpSpawn;
}

export interface PowerUpEffect {
  speedMultiplier?: number; // Multiplier for car speed (e.g., 1.5 for 50% boost)
  maxSpeedIncrease?: number; // Additional max speed in m/s
  accelerationBoost?: number; // Additional acceleration in m/s²
  frictionReduction?: number; // Reduction in friction (0-1)
  invulnerability?: boolean; // Makes car invulnerable to collisions
  magnetRange?: number; // Range for magnet effect in meters
}

export interface PowerUpVisual {
  color: string;
  borderColor: string;
  size: number; // Size in meters
  animation: 'pulse' | 'rotate' | 'glow' | 'none';
  icon?: string; // Optional icon/text
}

export interface PowerUpSpawn {
  minDistance: number; // Minimum distance from other power-ups
  maxSpawnCount: number; // Maximum number of this type on track
  respawnTime: number; // Time before respawning after collection (seconds)
  spawnProbability: number; // Probability of spawning (0-1)
}

export interface PowerUpInstance {
  id: string;
  config: PowerUpConfig;
  position: { x: number; y: number };
  isActive: boolean;
  spawnTime: number;
  collectedBy?: string; // Car ID that collected it
  collectionTime?: number;
}

export interface CarPowerUpState {
  activePowerUps: Map<string, PowerUpInstance>;
  speedBoostMultiplier: number;
  maxSpeedIncrease: number;
  accelerationBoost: number;
  frictionReduction: number;
  isInvulnerable: boolean;
  magnetRange: number;
}

// Predefined power-up configurations
export const POWER_UP_CONFIGS: Record<PowerUpType, PowerUpConfig> = {
  speed_boost: {
    id: 'speed_boost',
    type: 'speed_boost',
    name: 'Speed Boost',
    description: 'Increases car speed by 50% for 5 seconds',
    duration: 5.0,
    effect: {
      speedMultiplier: 1.5,
      maxSpeedIncrease: 5.0, // Additional 5 m/s
      accelerationBoost: 3.0, // Additional 3 m/s²
    },
    visual: {
      color: '#FFD700', // Gold
      borderColor: '#FFA500', // Orange
      size: 1.5,
      animation: 'pulse',
      icon: '⚡',
    },
    spawn: {
      minDistance: 20,
      maxSpawnCount: 3,
      respawnTime: 10.0,
      spawnProbability: 0.8,
    },
  },
  shield: {
    id: 'shield',
    type: 'shield',
    name: 'Shield',
    description: 'Makes car invulnerable to collisions for 3 seconds',
    duration: 3.0,
    effect: {
      invulnerability: true,
    },
    visual: {
      color: '#00BFFF', // Deep sky blue
      borderColor: '#1E90FF', // Dodger blue
      size: 1.8,
      animation: 'glow',
      icon: '🛡️',
    },
    spawn: {
      minDistance: 25,
      maxSpawnCount: 2,
      respawnTime: 15.0,
      spawnProbability: 0.6,
    },
  },
  magnet: {
    id: 'magnet',
    type: 'magnet',
    name: 'Magnet',
    description: 'Attracts nearby power-ups for 8 seconds',
    duration: 8.0,
    effect: {
      magnetRange: 15.0, // 15 meter range
    },
    visual: {
      color: '#FF1493', // Deep pink
      borderColor: '#DC143C', // Crimson
      size: 1.6,
      animation: 'rotate',
      icon: '🧲',
    },
    spawn: {
      minDistance: 30,
      maxSpawnCount: 1,
      respawnTime: 20.0,
      spawnProbability: 0.4,
    },
  },
  nitro: {
    id: 'nitro',
    type: 'nitro',
    name: 'Nitro',
    description: 'Massive speed boost for 2 seconds',
    duration: 2.0,
    effect: {
      speedMultiplier: 2.0,
      maxSpeedIncrease: 10.0, // Additional 10 m/s
      accelerationBoost: 8.0, // Additional 8 m/s²
      frictionReduction: 0.1, // 10% less friction
    },
    visual: {
      color: '#FF4500', // Orange red
      borderColor: '#FF0000', // Red
      size: 2.0,
      animation: 'pulse',
      icon: '🔥',
    },
    spawn: {
      minDistance: 35,
      maxSpawnCount: 1,
      respawnTime: 25.0,
      spawnProbability: 0.3,
    },
  },
};

/**
 * Creates a new power-up instance
 */
export function createPowerUpInstance(
  config: PowerUpConfig,
  position: { x: number; y: number }
): PowerUpInstance {
  return {
    id: `${config.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    config,
    position,
    isActive: true,
    spawnTime: Date.now(),
  };
}

/**
 * Creates initial car power-up state
 */
export function createCarPowerUpState(): CarPowerUpState {
  return {
    activePowerUps: new Map(),
    speedBoostMultiplier: 1.0,
    maxSpeedIncrease: 0.0,
    accelerationBoost: 0.0,
    frictionReduction: 0.0,
    isInvulnerable: false,
    magnetRange: 0.0,
  };
}

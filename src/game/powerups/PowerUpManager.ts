/**
 * Power-up Manager
 * 
 * Handles power-up spawning, collection, effects, and lifecycle
 */

import {
  PowerUpType,
  PowerUpConfig,
  PowerUpInstance,
  CarPowerUpState,
  POWER_UP_CONFIGS,
  createPowerUpInstance,
  createCarPowerUpState,
} from './PowerUpTypes';
import { Track } from '../track/Track';
import { CarState } from '../physics/CarModel';

export interface PowerUpManagerConfig {
  maxTotalPowerUps: number;
  spawnInterval: number; // Minimum time between spawns (seconds)
  trackMargin: number; // Distance from track edges (meters)
}

export class PowerUpManager {
  private powerUps: Map<string, PowerUpInstance> = new Map();
  private carPowerUpStates: Map<string, CarPowerUpState> = new Map();
  private track: Track | null = null;
  private config: PowerUpManagerConfig;
  private lastSpawnTime: number = 0;
  private spawnPositions: Array<{ x: number; y: number }> = [];

  constructor(config: Partial<PowerUpManagerConfig> = {}) {
    this.config = {
      maxTotalPowerUps: 8,
      spawnInterval: 2.0,
      trackMargin: 5.0,
      ...config,
    };
  }

  /**
   * Initialize the power-up manager with a track
   */
  initialize(track: Track): void {
    this.track = track;
    this.generateSpawnPositions();
    console.log(`PowerUpManager initialized with ${this.spawnPositions.length} spawn positions`);
  }

  /**
   * Update power-up manager (called by game loop)
   */
  update(deltaTime: number): void {
    if (!this.track) return;

    const currentTime = Date.now() / 1000; // Convert to seconds

    // Update active power-ups and remove expired ones
    this.updateActivePowerUps(currentTime);

    // Update car power-up effects
    this.updateCarPowerUpEffects(deltaTime);

    // Spawn new power-ups if needed
    if (currentTime - this.lastSpawnTime >= this.config.spawnInterval) {
      this.trySpawnPowerUp(currentTime);
    }
  }

  /**
   * Check for power-up collection by a car
   */
  checkCollection(carId: string, carState: CarState): PowerUpInstance | null {
    const carRadius = 1.5; // Car collection radius in meters
    const collectedPowerUp = this.findPowerUpInRange(carState.x, carState.y, carRadius);

    if (collectedPowerUp) {
      this.collectPowerUp(carId, collectedPowerUp);
      return collectedPowerUp;
    }

    return null;
  }

  /**
   * Get all active power-ups
   */
  getActivePowerUps(): PowerUpInstance[] {
    return Array.from(this.powerUps.values()).filter(powerUp => powerUp.isActive);
  }

  /**
   * Get power-up state for a specific car
   */
  getCarPowerUpState(carId: string): CarPowerUpState {
    if (!this.carPowerUpStates.has(carId)) {
      this.carPowerUpStates.set(carId, createCarPowerUpState());
    }
    return this.carPowerUpStates.get(carId)!;
  }

  /**
   * Apply power-up effects to car physics
   */
  applyPowerUpEffects(carId: string, baseSpeed: number, baseAcceleration: number, baseFriction: number): {
    speed: number;
    acceleration: number;
    friction: number;
    isInvulnerable: boolean;
  } {
    const powerUpState = this.getCarPowerUpState(carId);

    const modifiedSpeed = baseSpeed * powerUpState.speedBoostMultiplier + powerUpState.maxSpeedIncrease;
    const modifiedAcceleration = baseAcceleration + powerUpState.accelerationBoost;
    const modifiedFriction = Math.max(0.1, baseFriction - powerUpState.frictionReduction);

    return {
      speed: modifiedSpeed,
      acceleration: modifiedAcceleration,
      friction: modifiedFriction,
      isInvulnerable: powerUpState.isInvulnerable,
    };
  }

  /**
   * Get magnet range for a car (for attracting other power-ups)
   */
  getMagnetRange(carId: string): number {
    const powerUpState = this.getCarPowerUpState(carId);
    return powerUpState.magnetRange;
  }

  /**
   * Clear all power-ups (for game reset)
   */
  clearAll(): void {
    this.powerUps.clear();
    this.carPowerUpStates.clear();
    this.lastSpawnTime = 0;
  }

  /**
   * Generate spawn positions on the track
   */
  private generateSpawnPositions(): void {
    if (!this.track) return;

    const trackData = this.track.getData();
    const margin = this.config.trackMargin;
    
    // Generate positions along the track centerline
    const positions: Array<{ x: number; y: number }> = [];
    
    // Add positions along the main track
    const trackWidth = trackData.width;
    const trackHeight = trackData.height;
    
    // Top section
    for (let x = margin; x < trackWidth - margin; x += 30) {
      positions.push({ x, y: margin + 50 });
    }
    
    // Right section
    for (let y = margin + 50; y < trackHeight - margin - 50; y += 30) {
      positions.push({ x: trackWidth - margin - 50, y });
    }
    
    // Bottom section
    for (let x = trackWidth - margin - 50; x > margin; x -= 30) {
      positions.push({ x, y: trackHeight - margin - 50 });
    }
    
    // Left section
    for (let y = trackHeight - margin - 50; y > margin + 50; y -= 30) {
      positions.push({ x: margin + 50, y });
    }

    // Filter positions to ensure they're on valid track surfaces
    this.spawnPositions = positions.filter(pos => {
      const surface = this.track!.getSurfaceAt(pos.x, pos.y);
      return surface.type === 'asphalt' || surface.type === 'startLine' || surface.type === 'finishLine';
    });

    console.log(`Generated ${this.spawnPositions.length} valid spawn positions`);
  }

  /**
   * Try to spawn a new power-up
   */
  private trySpawnPowerUp(currentTime: number): void {
    if (this.powerUps.size >= this.config.maxTotalPowerUps) {
      return;
    }

    // Select a random power-up type based on probability
    const powerUpType = this.selectRandomPowerUpType();
    if (!powerUpType) return;

    const config = POWER_UP_CONFIGS[powerUpType];
    
    // Check if we can spawn this type (respect max count)
    const existingCount = this.getPowerUpCountByType(powerUpType);
    if (existingCount >= config.spawn.maxSpawnCount) {
      return;
    }

    // Find a valid spawn position
    const position = this.findValidSpawnPosition(config);
    if (!position) return;

    // Create and add the power-up
    const powerUp = createPowerUpInstance(config, position);
    this.powerUps.set(powerUp.id, powerUp);
    this.lastSpawnTime = currentTime;

    console.log(`Spawned ${config.name} at (${position.x.toFixed(1)}, ${position.y.toFixed(1)})`);
  }

  /**
   * Select a random power-up type based on spawn probability
   */
  private selectRandomPowerUpType(): PowerUpType | null {
    const availableTypes = Object.keys(POWER_UP_CONFIGS) as PowerUpType[];
    const weightedTypes: PowerUpType[] = [];

    for (const type of availableTypes) {
      const config = POWER_UP_CONFIGS[type];
      const weight = Math.floor(config.spawn.spawnProbability * 100);
      for (let i = 0; i < weight; i++) {
        weightedTypes.push(type);
      }
    }

    if (weightedTypes.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * weightedTypes.length);
    return weightedTypes[randomIndex];
  }

  /**
   * Find a valid spawn position for a power-up
   */
  private findValidSpawnPosition(config: PowerUpConfig): { x: number; y: number } | null {
    const maxAttempts = 50;
    const minDistance = config.spawn.minDistance;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const randomIndex = Math.floor(Math.random() * this.spawnPositions.length);
      const candidate = this.spawnPositions[randomIndex];

      // Check distance from existing power-ups
      let isValid = true;
      for (const existingPowerUp of this.powerUps.values()) {
        if (!existingPowerUp.isActive) continue;

        const distance = Math.sqrt(
          Math.pow(candidate.x - existingPowerUp.position.x, 2) +
          Math.pow(candidate.y - existingPowerUp.position.y, 2)
        );

        if (distance < minDistance) {
          isValid = false;
          break;
        }
      }

      if (isValid) {
        return candidate;
      }
    }

    return null; // No valid position found
  }

  /**
   * Find power-up in range of a position
   */
  private findPowerUpInRange(x: number, y: number, radius: number): PowerUpInstance | null {
    for (const powerUp of this.powerUps.values()) {
      if (!powerUp.isActive) continue;

      const distance = Math.sqrt(
        Math.pow(x - powerUp.position.x, 2) +
        Math.pow(y - powerUp.position.y, 2)
      );

      if (distance <= radius + powerUp.config.visual.size / 2) {
        return powerUp;
      }
    }

    return null;
  }

  /**
   * Collect a power-up
   */
  private collectPowerUp(carId: string, powerUp: PowerUpInstance): void {
    powerUp.isActive = false;
    powerUp.collectedBy = carId;
    powerUp.collectionTime = Date.now() / 1000;

    // Apply power-up effect to car
    this.applyPowerUpToCar(carId, powerUp);

    console.log(`Car ${carId} collected ${powerUp.config.name}`);
  }

  /**
   * Apply power-up effect to a car
   */
  private applyPowerUpToCar(carId: string, powerUp: PowerUpInstance): void {
    const powerUpState = this.getCarPowerUpState(carId);
    const effect = powerUp.config.effect;

    // Add to active power-ups
    powerUpState.activePowerUps.set(powerUp.id, powerUp);

    // Apply effects
    if (effect.speedMultiplier) {
      powerUpState.speedBoostMultiplier *= effect.speedMultiplier;
    }
    if (effect.maxSpeedIncrease) {
      powerUpState.maxSpeedIncrease += effect.maxSpeedIncrease;
    }
    if (effect.accelerationBoost) {
      powerUpState.accelerationBoost += effect.accelerationBoost;
    }
    if (effect.frictionReduction) {
      powerUpState.frictionReduction += effect.frictionReduction;
    }
    if (effect.invulnerability) {
      powerUpState.isInvulnerable = true;
    }
    if (effect.magnetRange) {
      powerUpState.magnetRange = effect.magnetRange;
    }
  }

  /**
   * Update active power-ups and remove expired ones
   */
  private updateActivePowerUps(currentTime: number): void {
    for (const [powerUpId, powerUp] of this.powerUps.entries()) {
      if (!powerUp.isActive && powerUp.collectionTime) {
        const elapsed = currentTime - powerUp.collectionTime;
        if (elapsed >= powerUp.config.duration) {
          this.removePowerUpEffect(powerUpId, powerUp);
          this.powerUps.delete(powerUpId);
        }
      }
    }
  }

  /**
   * Update car power-up effects
   */
  private updateCarPowerUpEffects(deltaTime: number): void {
    for (const [carId, powerUpState] of this.carPowerUpStates.entries()) {
      const currentTime = Date.now() / 1000;
      const expiredPowerUps: string[] = [];

      for (const [powerUpId, powerUp] of powerUpState.activePowerUps.entries()) {
        if (powerUp.collectionTime) {
          const elapsed = currentTime - powerUp.collectionTime;
          if (elapsed >= powerUp.config.duration) {
            expiredPowerUps.push(powerUpId);
          }
        }
      }

      // Remove expired power-ups
      for (const powerUpId of expiredPowerUps) {
        const powerUp = powerUpState.activePowerUps.get(powerUpId);
        if (powerUp) {
          this.removePowerUpEffect(powerUpId, powerUp);
          powerUpState.activePowerUps.delete(powerUpId);
        }
      }
    }
  }

  /**
   * Remove power-up effect from a car
   */
  private removePowerUpEffect(powerUpId: string, powerUp: PowerUpInstance): void {
    const carId = powerUp.collectedBy;
    if (!carId) return;

    const powerUpState = this.getCarPowerUpState(carId);
    const effect = powerUp.config.effect;

    // Remove effects
    if (effect.speedMultiplier) {
      powerUpState.speedBoostMultiplier /= effect.speedMultiplier;
    }
    if (effect.maxSpeedIncrease) {
      powerUpState.maxSpeedIncrease -= effect.maxSpeedIncrease;
    }
    if (effect.accelerationBoost) {
      powerUpState.accelerationBoost -= effect.accelerationBoost;
    }
    if (effect.frictionReduction) {
      powerUpState.frictionReduction -= effect.frictionReduction;
    }
    if (effect.invulnerability) {
      powerUpState.isInvulnerable = false;
    }
    if (effect.magnetRange) {
      powerUpState.magnetRange = 0;
    }

    console.log(`Power-up ${powerUp.config.name} expired for car ${carId}`);
  }

  /**
   * Get count of power-ups by type
   */
  private getPowerUpCountByType(type: PowerUpType): number {
    let count = 0;
    for (const powerUp of this.powerUps.values()) {
      if (powerUp.isActive && powerUp.config.type === type) {
        count++;
      }
    }
    return count;
  }
}

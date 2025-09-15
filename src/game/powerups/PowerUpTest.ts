/**
 * Power-up System Test
 * 
 * Simple test to verify the power-up system works correctly
 */

import { PowerUpManager } from './PowerUpManager';
import { POWER_UP_CONFIGS, createPowerUpInstance } from './PowerUpTypes';
import { loadDefaultTrack } from '../track/TrackLoader';

export class PowerUpTest {
  private powerUpManager: PowerUpManager;
  private track: any;

  constructor() {
    this.powerUpManager = new PowerUpManager();
  }

  async initialize(): Promise<void> {
    try {
      // Load track
      this.track = await loadDefaultTrack();
      this.powerUpManager.initialize(this.track);
      console.log('PowerUpTest: Initialized successfully');
    } catch (error) {
      console.error('PowerUpTest: Failed to initialize:', error);
      throw error;
    }
  }

  /**
   * Test power-up spawning
   */
  testSpawning(): void {
    console.log('=== Testing Power-up Spawning ===');
    
    // Simulate time passing to trigger spawning
    for (let i = 0; i < 10; i++) {
      this.powerUpManager.update(1.0); // 1 second per update
    }

    const activePowerUps = this.powerUpManager.getActivePowerUps();
    console.log(`Active power-ups: ${activePowerUps.length}`);
    
    activePowerUps.forEach(powerUp => {
      console.log(`- ${powerUp.config.name} at (${powerUp.position.x.toFixed(1)}, ${powerUp.position.y.toFixed(1)})`);
    });
  }

  /**
   * Test power-up collection
   */
  testCollection(): void {
    console.log('=== Testing Power-up Collection ===');
    
    // Get active power-ups
    const activePowerUps = this.powerUpManager.getActivePowerUps();
    
    if (activePowerUps.length === 0) {
      console.log('No power-ups available for collection test');
      return;
    }

    // Simulate car collecting the first power-up
    const powerUp = activePowerUps[0];
    const carState = {
      x: powerUp.position.x,
      y: powerUp.position.y,
      vx: 0,
      vy: 0,
      angle: 0,
      speed: 0,
    };

    const collectedPowerUp = this.powerUpManager.checkCollection('testCar', carState);
    
    if (collectedPowerUp) {
      console.log(`✓ Collected: ${collectedPowerUp.config.name}`);
      
      // Check car power-up state
      const carPowerUpState = this.powerUpManager.getCarPowerUpState('testCar');
      console.log(`Car speed multiplier: ${carPowerUpState.speedBoostMultiplier}`);
      console.log(`Car max speed increase: ${carPowerUpState.maxSpeedIncrease}`);
      console.log(`Car acceleration boost: ${carPowerUpState.accelerationBoost}`);
      console.log(`Car is invulnerable: ${carPowerUpState.isInvulnerable}`);
    } else {
      console.log('✗ Failed to collect power-up');
    }
  }

  /**
   * Test power-up effects
   */
  testEffects(): void {
    console.log('=== Testing Power-up Effects ===');
    
    const carId = 'testCar';
    const baseSpeed = 20;
    const baseAcceleration = 10;
    const baseFriction = 0.9;

    const effects = this.powerUpManager.applyPowerUpEffects(
      carId,
      baseSpeed,
      baseAcceleration,
      baseFriction
    );

    console.log(`Base speed: ${baseSpeed} -> Modified: ${effects.speed}`);
    console.log(`Base acceleration: ${baseAcceleration} -> Modified: ${effects.acceleration}`);
    console.log(`Base friction: ${baseFriction} -> Modified: ${effects.friction}`);
    console.log(`Invulnerable: ${effects.isInvulnerable}`);
  }

  /**
   * Test power-up expiration
   */
  testExpiration(): void {
    console.log('=== Testing Power-up Expiration ===');
    
    const carId = 'testCar';
    const carPowerUpState = this.powerUpManager.getCarPowerUpState(carId);
    
    if (carPowerUpState.activePowerUps.size === 0) {
      console.log('No active power-ups to test expiration');
      return;
    }

    console.log(`Active power-ups before expiration test: ${carPowerUpState.activePowerUps.size}`);
    
    // Simulate time passing (more than the duration of any power-up)
    for (let i = 0; i < 20; i++) {
      this.powerUpManager.update(1.0); // 1 second per update
    }

    const updatedCarPowerUpState = this.powerUpManager.getCarPowerUpState(carId);
    console.log(`Active power-ups after expiration test: ${updatedCarPowerUpState.activePowerUps.size}`);
  }

  /**
   * Run all tests
   */
  async runAllTests(): Promise<void> {
    try {
      await this.initialize();
      
      this.testSpawning();
      this.testCollection();
      this.testEffects();
      this.testExpiration();
      
      console.log('=== All Power-up Tests Completed ===');
    } catch (error) {
      console.error('PowerUpTest: Test failed:', error);
    }
  }
}

// Export for use in other files
export const runPowerUpTests = async (): Promise<void> => {
  const test = new PowerUpTest();
  await test.runAllTests();
};

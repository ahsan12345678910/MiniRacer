/**
 * Simple Car Movement Test
 * 
 * Test the simplified car movement system step by step
 */

import { SimpleCar } from './SimpleCarMovement';

export class SimpleCarTest {
  private car: SimpleCar;

  constructor() {
    this.car = new SimpleCar({ x: 100, y: 100 }, 0);
  }

  /**
   * Test basic car initialization
   */
  testInitialization(): void {
    console.log('=== Testing Car Initialization ===');
    
    const state = this.car.getState();
    console.log('✓ Car created at position:', state.x, state.y);
    console.log('✓ Car angle:', state.angle);
    console.log('✓ Car speed:', state.speed);
    console.log('✓ Car velocity:', state.vx, state.vy);
  }

  /**
   * Test acceleration
   */
  testAcceleration(): void {
    console.log('=== Testing Acceleration ===');
    
    const initialState = this.car.getState();
    console.log('Initial speed:', initialState.speed);
    
    // Apply throttle for 1 second
    for (let i = 0; i < 60; i++) { // 60 updates = 1 second at 60 FPS
      this.car.update(1/60, { steer: 0, throttle: 1, brake: 0 });
    }
    
    const finalState = this.car.getState();
    console.log('Final speed:', finalState.speed);
    console.log('Speed increase:', finalState.speed - initialState.speed);
    
    if (finalState.speed > initialState.speed) {
      console.log('✓ Acceleration test passed');
    } else {
      console.log('✗ Acceleration test failed');
    }
  }

  /**
   * Test steering
   */
  testSteering(): void {
    console.log('=== Testing Steering ===');
    
    const initialState = this.car.getState();
    console.log('Initial angle:', initialState.angle);
    
    // Apply steering for 1 second
    for (let i = 0; i < 60; i++) { // 60 updates = 1 second at 60 FPS
      this.car.update(1/60, { steer: 1, throttle: 0.5, brake: 0 });
    }
    
    const finalState = this.car.getState();
    console.log('Final angle:', finalState.angle);
    console.log('Angle change:', finalState.angle - initialState.angle);
    
    if (Math.abs(finalState.angle - initialState.angle) > 0.1) {
      console.log('✓ Steering test passed');
    } else {
      console.log('✗ Steering test failed');
    }
  }

  /**
   * Test braking
   */
  testBraking(): void {
    console.log('=== Testing Braking ===');
    
    // First accelerate
    for (let i = 0; i < 60; i++) {
      this.car.update(1/60, { steer: 0, throttle: 1, brake: 0 });
    }
    
    const speedAfterAccel = this.car.getState().speed;
    console.log('Speed after acceleration:', speedAfterAccel);
    
    // Then brake
    for (let i = 0; i < 60; i++) {
      this.car.update(1/60, { steer: 0, throttle: 0, brake: 1 });
    }
    
    const speedAfterBrake = this.car.getState().speed;
    console.log('Speed after braking:', speedAfterBrake);
    
    if (speedAfterBrake < speedAfterAccel) {
      console.log('✓ Braking test passed');
    } else {
      console.log('✗ Braking test failed');
    }
  }

  /**
   * Test position movement
   */
  testPositionMovement(): void {
    console.log('=== Testing Position Movement ===');
    
    const initialState = this.car.getState();
    console.log('Initial position:', initialState.x, initialState.y);
    
    // Move forward for 2 seconds
    for (let i = 0; i < 120; i++) { // 120 updates = 2 seconds at 60 FPS
      this.car.update(1/60, { steer: 0, throttle: 1, brake: 0 });
    }
    
    const finalState = this.car.getState();
    console.log('Final position:', finalState.x, finalState.y);
    
    const distance = Math.sqrt(
      Math.pow(finalState.x - initialState.x, 2) + 
      Math.pow(finalState.y - initialState.y, 2)
    );
    console.log('Distance moved:', distance);
    
    if (distance > 1) {
      console.log('✓ Position movement test passed');
    } else {
      console.log('✗ Position movement test failed');
    }
  }

  /**
   * Test combined movement
   */
  testCombinedMovement(): void {
    console.log('=== Testing Combined Movement ===');
    
    const initialState = this.car.getState();
    console.log('Initial state:', {
      position: { x: initialState.x, y: initialState.y },
      angle: initialState.angle,
      speed: initialState.speed
    });
    
    // Simulate driving in a circle
    for (let i = 0; i < 180; i++) { // 3 seconds
      const steer = Math.sin(i * 0.1) * 0.5; // Gentle steering
      const throttle = 0.8; // Moderate throttle
      this.car.update(1/60, { steer, throttle, brake: 0 });
    }
    
    const finalState = this.car.getState();
    console.log('Final state:', {
      position: { x: finalState.x, y: finalState.y },
      angle: finalState.angle,
      speed: finalState.speed
    });
    
    const distance = Math.sqrt(
      Math.pow(finalState.x - initialState.x, 2) + 
      Math.pow(finalState.y - initialState.y, 2)
    );
    console.log('Total distance moved:', distance);
    
    if (distance > 5) {
      console.log('✓ Combined movement test passed');
    } else {
      console.log('✗ Combined movement test failed');
    }
  }

  /**
   * Run all tests
   */
  runAllTests(): void {
    console.log('🚗 Starting Simple Car Movement Tests...');
    
    this.testInitialization();
    this.testAcceleration();
    this.testSteering();
    this.testBraking();
    this.testPositionMovement();
    this.testCombinedMovement();
    
    console.log('🚗 All Simple Car Movement Tests Completed!');
  }
}

// Export for use in other files
export const runSimpleCarTests = (): void => {
  const test = new SimpleCarTest();
  test.runAllTests();
};

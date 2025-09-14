/**
 * Unit tests for CarModel
 * 
 * Run with: npx jest CarModel.test.ts
 * or: node CarModel.test.ts
 */

import { CarModel, SURFACE_TYPES, testCarUpdate } from './CarModel';

describe('CarModel', () => {
  let car: CarModel;
  const asphalt = SURFACE_TYPES.ASPHALT;

  beforeEach(() => {
    car = new CarModel({ x: 0, y: 0 }, 0);
  });

  test('should initialize with correct default parameters', () => {
    expect(car.maxSpeed).toBe(22);
    expect(car.acceleration).toBe(10);
    expect(car.brakePower).toBe(18);
    expect(car.friction).toBe(0.9);
    expect(car.turnRate).toBe(2.2);
  });

  test('should accelerate with throttle input', () => {
    const initialState = car.getState();
    car.update(1.0, asphalt, { steer: 0, throttle: 1.0, brake: 0 });
    const afterUpdate = car.getState();
    
    expect(afterUpdate.speed).toBeGreaterThan(initialState.speed);
    expect(afterUpdate.speed).toBeCloseTo(10, 1); // 1 second * 10 m/s²
  });

  test('should brake with brake input', () => {
    // First accelerate
    car.update(1.0, asphalt, { steer: 0, throttle: 1.0, brake: 0 });
    const speedAfterAccel = car.getState().speed;
    
    // Then brake
    car.update(1.0, asphalt, { steer: 0, throttle: 0, brake: 1.0 });
    const speedAfterBrake = car.getState().speed;
    
    expect(speedAfterBrake).toBeLessThan(speedAfterAccel);
  });

  test('should steer with steer input', () => {
    const initialState = car.getState();
    car.update(1.0, asphalt, { steer: 1.0, throttle: 0, brake: 0 });
    const afterUpdate = car.getState();
    
    expect(afterUpdate.angle).toBeGreaterThan(initialState.angle);
  });

  test('should clamp speed to maximum', () => {
    // Accelerate for a long time
    car.update(10.0, asphalt, { steer: 0, throttle: 1.0, brake: 0 });
    const finalState = car.getState();
    
    expect(finalState.speed).toBeLessThanOrEqual(car.maxSpeed);
  });

  test('should apply friction', () => {
    // Accelerate to some speed
    car.update(1.0, asphalt, { steer: 0, throttle: 1.0, brake: 0 });
    const speedBeforeFriction = car.getState().speed;
    
    // Apply friction (no throttle/brake)
    car.update(1.0, asphalt, { steer: 0, throttle: 0, brake: 0 });
    const speedAfterFriction = car.getState().speed;
    
    expect(speedAfterFriction).toBeLessThan(speedBeforeFriction);
  });

  test('should set speed to 0 when very low', () => {
    car.setState({
      position: { x: 0, y: 0 },
      velocity: { x: 0, y: 0 },
      angle: 0,
      speed: 0.05 // Very low speed
    });
    
    car.update(1.0, asphalt, { steer: 0, throttle: 0, brake: 0 });
    const afterUpdate = car.getState();
    
    expect(afterUpdate.speed).toBe(0);
  });

  test('should handle different surface friction', () => {
    // Accelerate on asphalt
    car.update(1.0, asphalt, { steer: 0, throttle: 1.0, brake: 0 });
    const speedOnAsphalt = car.getState().speed;
    
    // Reset and accelerate on grass
    car.resetToStart({ x: 0, y: 0 }, 0);
    car.update(1.0, SURFACE_TYPES.GRASS, { steer: 0, throttle: 1.0, brake: 0 });
    const speedOnGrass = car.getState().speed;
    
    // Both should be similar for acceleration, but grass has lower friction
    expect(speedOnAsphalt).toBeCloseTo(speedOnGrass, 1);
  });

  test('should update position based on velocity', () => {
    const initialState = car.getState();
    
    // Accelerate forward
    car.update(1.0, asphalt, { steer: 0, throttle: 1.0, brake: 0 });
    const afterUpdate = car.getState();
    
    expect(afterUpdate.position.x).toBeGreaterThan(initialState.position.x);
  });

  test('should scale turn rate with speed', () => {
    // Test turning at low speed
    car.update(1.0, asphalt, { steer: 1.0, throttle: 0.1, brake: 0 });
    const lowSpeedTurn = car.getState().angle;
    
    // Reset and test turning at high speed
    car.resetToStart({ x: 0, y: 0 }, 0);
    car.update(1.0, asphalt, { steer: 1.0, throttle: 1.0, brake: 0 });
    const highSpeedTurn = car.getState().angle;
    
    // High speed should turn less (more stable)
    expect(highSpeedTurn).toBeLessThan(lowSpeedTurn);
  });
});

// Run the built-in test if this file is executed directly
if (typeof window === 'undefined' && require.main === module) {
  console.log('Running CarModel built-in tests...');
  const success = testCarUpdate();
  process.exit(success ? 0 : 1);
}

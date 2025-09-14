# Car Physics System

This directory contains the car physics implementation for MiniRacer, providing realistic car movement, handling, and surface interaction.

## CarModel.ts

The core car physics model with realistic movement mechanics.

### Car Properties

```typescript
interface CarPhysicsState {
  position: { x: number; y: number }; // World position
  velocity: { x: number; y: number }; // Velocity vector
  angle: number; // Direction in radians
  speed: number; // Speed magnitude
}
```

### Car Parameters

```typescript
interface CarParameters {
  maxSpeed: number; // Maximum speed (units/second)
  acceleration: number; // Acceleration force
  brakePower: number; // Braking force
  friction: number; // Air/rolling resistance (0-1)
  turnRate: number; // Turning rate (radians/second)
  mass: number; // Car mass for physics
}
```

### Surface Properties

```typescript
interface SurfaceProperties {
  friction: number; // Surface friction (0-1)
  grip: number; // Surface grip (0-1)
  roughness: number; // Speed reduction factor (0-1)
}
```

## Key Features

### 1. Realistic Physics

- **Acceleration/Braking**: Force-based acceleration with mass consideration
- **Steering**: Speed-dependent turning (less effective at high speeds)
- **Friction**: Air resistance and rolling friction
- **Surface Effects**: Different surfaces affect grip, friction, and speed

### 2. Car Presets

Pre-configured car types with realistic parameters:

- **Sports Car**: High speed, good acceleration, responsive steering
- **Rally Car**: Balanced performance, good for off-road
- **Truck**: High mass, strong brakes, slow turning
- **Formula Car**: Maximum performance, very responsive

### 3. Surface Types

Different surface types with unique properties:

- **Asphalt**: Full grip, normal friction
- **Grass**: Reduced grip and speed
- **Dirt**: Moderate grip reduction
- **Ice**: Very low grip, high friction
- **Sand**: Significant speed reduction

## Usage Examples

### Basic Car Creation

```typescript
import { CarModel, createCar, createCarPreset } from './CarModel';

// Create a basic car
const car = createCar({ x: 100, y: 100 }, 0);

// Create a sports car preset
const sportsCar = createCarPreset('sports', { x: 0, y: 0 }, 0);
```

### Game Loop Integration

```typescript
import { CarModel, CarControls, SURFACE_TYPES } from './CarModel';

const car = new CarModel();
const controls: CarControls = {
  accelerate: true,
  brake: false,
  turnLeft: false,
  turnRight: true,
};

// In your game loop
function update(deltaTime: number) {
  car.update(deltaTime, controls, SURFACE_TYPES.ASPHALT);

  const state = car.getState();
  console.log('Position:', state.position);
  console.log('Speed:', state.speed);
}
```

### Control Handling

```typescript
const controls: CarControls = {
  accelerate: false,
  brake: false,
  turnLeft: false,
  turnRight: false,
};

// Handle input
document.addEventListener('keydown', e => {
  switch (e.key) {
    case 'ArrowUp':
      controls.accelerate = true;
      break;
    case 'ArrowDown':
      controls.brake = true;
      break;
    case 'ArrowLeft':
      controls.turnLeft = true;
      break;
    case 'ArrowRight':
      controls.turnRight = true;
      break;
  }
});

document.addEventListener('keyup', e => {
  switch (e.key) {
    case 'ArrowUp':
      controls.accelerate = false;
      break;
    case 'ArrowDown':
      controls.brake = false;
      break;
    case 'ArrowLeft':
      controls.turnLeft = false;
      break;
    case 'ArrowRight':
      controls.turnRight = false;
      break;
  }
});
```

### Store Integration

```typescript
import { getPhysicsIntegration } from './PhysicsIntegration';
import { useGameStore } from '../store/GameStore';

const physics = getPhysicsIntegration();

// Update physics and sync with store
function gameLoop(deltaTime: number) {
  physics.update(deltaTime);

  // Store is automatically updated with new car state
  const carState = useGameStore.getState().car;
  console.log('Store car position:', carState.position);
}
```

## Physics Implementation Details

### Acceleration

- Force-based acceleration: `speed += (force / mass) * dt`
- Surface grip affects acceleration effectiveness
- Speed is clamped to maximum

### Steering

- Turning rate decreases at high speeds (realistic handling)
- Effective turn rate: `turnRate * (1 - speedFactor * 0.5)`

### Friction

- Exponential speed decay: `speed *= friction^dt`
- Minimum speed threshold prevents infinite deceleration
- Surface friction modifies the friction coefficient

### Surface Effects

- **Grip**: Affects acceleration and braking effectiveness
- **Friction**: Modifies speed decay rate
- **Roughness**: Reduces maximum achievable speed

## Performance Considerations

- **Efficient Updates**: Physics calculations are optimized for 60 FPS
- **Minimal Allocations**: Reuses objects to reduce garbage collection
- **Fast Math**: Uses efficient trigonometric functions
- **State Caching**: Caches frequently accessed values

## Future Enhancements

- **Collision Detection**: Bounding box and circle collision
- **Advanced Physics**: Suspension, weight transfer, tire physics
- **Weather Effects**: Rain, snow affecting surface properties
- **Damage System**: Car damage affecting performance
- **Multiplayer Sync**: Network synchronization for multiplayer racing

## Integration with Game Systems

The physics system integrates seamlessly with:

- **Game Loop**: Fixed timestep updates at 60 FPS
- **Game Store**: Automatic state synchronization
- **Input System**: Control mapping and handling
- **Rendering**: Position and rotation for graphics
- **Audio**: Engine sounds based on speed and acceleration

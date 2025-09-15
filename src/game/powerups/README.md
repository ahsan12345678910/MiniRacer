# Power-up System

The power-up system adds collectible items to the racing game that provide temporary boosts and effects to cars.

## Features

### Power-up Types

1. **Speed Boost** ⚡
   - Increases car speed by 50% for 5 seconds
   - Additional 5 m/s max speed increase
   - Additional 3 m/s² acceleration boost
   - Gold color with pulse animation

2. **Shield** 🛡️
   - Makes car invulnerable to collisions for 3 seconds
   - Blue color with glow animation
   - Prevents wall collision damage

3. **Magnet** 🧲
   - Attracts nearby power-ups for 8 seconds
   - 15 meter range
   - Pink color with rotate animation

4. **Nitro** 🔥
   - Massive speed boost for 2 seconds
   - 2x speed multiplier
   - Additional 10 m/s max speed
   - Additional 8 m/s² acceleration
   - 10% friction reduction
   - Orange-red color with pulse animation

## Architecture

### Core Components

- **PowerUpTypes.ts**: Defines power-up configurations, interfaces, and types
- **PowerUpManager.ts**: Handles spawning, collection, effects, and lifecycle
- **PowerUpRenderer.tsx**: Visual components for rendering power-ups
- **PowerUpTest.ts**: Test suite for the power-up system

### Integration Points

- **CarModel.ts**: Modified to accept power-up effects in physics calculations
- **GameIntegration.ts**: Integrates power-up management with the game loop
- **PowerUpGameScreen.tsx**: Complete game screen with power-ups
- **SimplePowerUpDemo.tsx**: Demo screen for testing power-up functionality

## Usage

### Basic Integration

```typescript
import { PowerUpManager } from './powerups/PowerUpManager';
import { getGameIntegration } from './GameIntegration';

// Initialize power-up manager
const powerUpManager = new PowerUpManager();
await powerUpManager.initialize(track);

// In game loop
powerUpManager.update(deltaTime);

// Check for collection
const collectedPowerUp = powerUpManager.checkCollection('player', carState);

// Apply effects to car physics
const effects = powerUpManager.applyPowerUpEffects('player', baseSpeed, baseAcceleration, baseFriction);
```

### Custom Power-up Creation

```typescript
import { createPowerUpInstance, POWER_UP_CONFIGS } from './powerups/PowerUpTypes';

// Create a custom power-up
const customPowerUp = createPowerUpInstance(
  POWER_UP_CONFIGS.speed_boost,
  { x: 100, y: 200 }
);
```

### Visual Rendering

```typescript
import { PowerUpRenderer, PowerUpHUD } from './powerups/PowerUpRenderer';

// Render individual power-up
<PowerUpRenderer
  powerUp={powerUp}
  screenX={screenX}
  screenY={screenY}
  scale={1.0}
/>

// Render HUD for active power-ups
<PowerUpHUD
  activePowerUps={activePowerUps}
  screenWidth={screenWidth}
  screenHeight={screenHeight}
/>
```

## Configuration

### Power-up Spawning

- **Max Total Power-ups**: 8 simultaneous power-ups
- **Spawn Interval**: 2 seconds minimum between spawns
- **Track Margin**: 5 meters from track edges
- **Spawn Probability**: Configurable per power-up type

### Power-up Effects

- **Duration**: 2-8 seconds depending on type
- **Respawn Time**: 10-25 seconds after collection
- **Max Spawn Count**: 1-3 per type on track
- **Minimum Distance**: 20-35 meters between power-ups

## Testing

### Run Tests

```typescript
import { runPowerUpTests } from './powerups/PowerUpTest';

// Run all power-up tests
await runPowerUpTests();
```

### Demo Screen

Use `SimplePowerUpDemo.tsx` to test power-up functionality:
- Test spawning
- Test collection
- View active power-ups
- Monitor car power-up state
- Clear power-ups and reset car

## Performance Considerations

- **Spatial Optimization**: Power-ups are checked in order (could be optimized with spatial indexing)
- **Memory Management**: Expired power-ups are automatically cleaned up
- **Update Frequency**: Power-up state updates every 100ms for smooth gameplay
- **Visual Rendering**: Animations use requestAnimationFrame for smooth effects

## Future Enhancements

- **Spatial Indexing**: QuadTree or R-tree for faster power-up lookups
- **Dynamic Spawning**: Power-ups that spawn based on race conditions
- **Power-up Combinations**: Stacking and interaction between different power-ups
- **Visual Effects**: Particle systems and sound effects
- **AI Collection**: AI cars that can collect and use power-ups
- **Power-up Editor**: Visual tool for creating custom power-ups

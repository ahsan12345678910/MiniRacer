# Game System Documentation

This directory contains the core game systems for MiniRacer, including the fixed timestep game loop and state management.

## Architecture

### Fixed Timestep Game Loop

The game uses a fixed timestep loop running at 60 FPS for consistent physics and gameplay.

#### Files:

- `loop/FixedStepLoop.ts` - Core fixed timestep loop implementation
- `loop/GameLoopManager.ts` - Manager that connects the loop to the game store
- `loop/index.ts` - Exports for the loop system

#### Features:

- **60 FPS Fixed Timestep**: Consistent ~16.67ms updates
- **Spiral of Death Prevention**: Clamps maximum frame time to 250ms
- **Accumulator Pattern**: Handles variable frame rates gracefully
- **RequestAnimationFrame**: Uses browser's optimized animation timing

### Game State Management

The game state is managed using Zustand for reactive state updates.

#### Files:

- `store/GameStore.ts` - Zustand store with game state and actions
- `store/index.ts` - Store exports

#### State Structure:

```typescript
interface GameStoreState {
  car: CarState; // Car position, velocity, angle, speed
  lapData: LapData; // Lap tracking and timing
  isGameRunning: boolean; // Game running state
  isPaused: boolean; // Pause state
  score: number; // Current score
  level: number; // Current level
}
```

#### Car State:

```typescript
interface CarState {
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  angle: number; // in radians
  speed: number; // magnitude of velocity
}
```

#### Lap Data:

```typescript
interface LapData {
  currentLap: number;
  bestLapTime: number;
  currentLapTime: number;
  totalLaps: number;
  lapTimes: number[];
}
```

### Game Manager

The GameManager provides a high-level interface for controlling the game.

#### Files:

- `GameManager.ts` - High-level game control interface

#### Features:

- Start/stop game loop
- Pause/resume functionality
- Car control methods (accelerate, brake, turn)
- Game state access

## Usage

### Basic Setup

```typescript
import { getGameManager } from './game/GameManager';
import { useGameStore } from './game/store/GameStore';

const gameManager = getGameManager();

// Start the game
gameManager.startGame();

// Access game state reactively
const car = useGameStore(state => state.car);
const score = useGameStore(state => state.score);
```

### Car Controls

```typescript
// Accelerate the car
gameManager.accelerate(1.0);

// Brake the car
gameManager.brake(1.0);

// Turn the car
gameManager.turn(0.1); // positive = right, negative = left
```

### Game State Updates

The game loop automatically calls `store.update(deltaTime)` at 60 FPS, which:

- Updates car physics (position, velocity)
- Updates lap timing
- Handles game state transitions

### React Integration

```typescript
import { useGameStore } from './game/store/GameStore';

function GameComponent() {
  // Subscribe to specific state changes
  const car = useGameStore((state) => state.car);
  const isGameRunning = useGameStore((state) => state.isGameRunning);

  // Component will re-render when subscribed state changes
  return (
    <View>
      <Text>Position: {car.position.x}, {car.position.y}</Text>
      <Text>Speed: {car.speed}</Text>
    </View>
  );
}
```

## Performance Considerations

- **Fixed Timestep**: Ensures consistent physics regardless of frame rate
- **Selective Subscriptions**: Only subscribe to the state you need
- **Efficient Updates**: Zustand only triggers re-renders when subscribed state changes
- **Memory Management**: Game loop automatically stops when game is stopped

## Example Implementation

See `screens/GameScreenExample.tsx` for a complete example of:

- Starting/stopping the game loop
- Subscribing to game state
- Implementing car controls
- Displaying real-time game data

## Future Enhancements

- Collision detection
- Track/road system
- AI opponents
- Power-ups and obstacles
- Sound integration
- Particle effects

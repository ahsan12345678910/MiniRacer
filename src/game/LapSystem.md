# Lap System Documentation

The LapSystem provides comprehensive lap detection, timing, and persistence for the race game.

## Features

- **Start Line Detection**: Detects when the car crosses the start line in the forward direction
- **Lap Timing**: Tracks individual lap times and current lap progress
- **Best Lap Persistence**: Saves and loads best lap times using AsyncStorage
- **Race Progress**: Tracks current lap, total laps, and race completion
- **Event System**: Provides callbacks for lap completion, best lap, race start/finish
- **HUD Integration**: Real-time display of lap information

## Usage

### Basic Setup

```typescript
import { LapSystem, createLapSystem } from './game/LapSystem';
import { Track } from './game/track/Track';

// Create lap system with track and total laps
const lapSystem = new LapSystem(track, 3); // 3 laps race

// Or use helper function
const lapSystem = createLapSystem(track, 3);
```

### Event Handling

```typescript
const lapEvents = {
  onLapComplete: (lapTime: LapTime) => {
    console.log(`Lap ${lapTime.lapNumber} completed in ${lapTime.time}ms`);
  },
  onBestLap: (lapTime: LapTime) => {
    console.log(`New best lap: ${lapTime.time}ms`);
  },
  onRaceStart: () => {
    console.log('Race started!');
  },
  onRaceFinish: () => {
    console.log('Race finished!');
  },
  onStartLineCross: (isForward: boolean) => {
    console.log(`Start line crossed: ${isForward ? 'forward' : 'backward'}`);
  },
};

lapSystem.setEvents(lapEvents);
```

### Game Loop Integration

```typescript
// In your game loop
function update(deltaTime: number) {
  // Update car physics
  car.update(deltaTime, controls, surface);

  // Update lap system
  lapSystem.update(car, deltaTime);
}
```

### HUD Integration

```typescript
import { LapHUD } from '../ui/LapHUD';

// In your React component
<LapHUD lapSystem={lapSystem} style={styles.hud} />
```

## API Reference

### LapSystem Class

#### Constructor

```typescript
new LapSystem(track: Track, totalLaps: number = 3)
```

#### Methods

- `update(car: CarModel, deltaTime: number)`: Update lap system with car state
- `reset()`: Reset for new race (keeps best lap)
- `setEvents(events: Partial<LapSystemEvents>)`: Set event handlers
- `getState()`: Get current lap system state
- `getCurrentLapTime()`: Get current lap time in milliseconds
- `getFormattedCurrentLapTime()`: Get formatted current lap time
- `getRaceProgress()`: Get race progress percentage
- `getAverageLapTime()`: Get average lap time
- `getRaceStats()`: Get comprehensive race statistics

### LapSystemState Interface

```typescript
interface LapSystemState {
  currentLap: number;
  totalLaps: number;
  lapTimes: LapTime[];
  bestLap: LapTime | null;
  currentLapStartTime: number;
  isRaceStarted: boolean;
  isRaceFinished: boolean;
  lastStartLineCrossing: number;
  hasCrossedStartLine: boolean;
}
```

### LapTime Interface

```typescript
interface LapTime {
  lapNumber: number;
  time: number; // in milliseconds
  timestamp: number;
  isBestLap: boolean;
}
```

## Start Line Configuration

The lap system automatically detects start line zones from the track data. It looks for zones with `type: 'startLine'`.

### Track Zone Example

```json
{
  "id": "start_line",
  "type": "startLine",
  "name": "Start Line",
  "color": "#FFFFFF",
  "properties": {
    "friction": 1.0,
    "grip": 1.0,
    "roughness": 1.0,
    "isCollidable": false,
    "isCheckpoint": false
  },
  "geometry": {
    "type": "rectangle",
    "points": [{ "x": 100, "y": 200 }],
    "width": 50,
    "height": 10
  }
}
```

## Best Lap Persistence

Best lap times are automatically saved to AsyncStorage with the key `'race_game_best_lap'`. The system:

- Saves best lap when a new record is set
- Loads best lap on initialization
- Persists across app restarts
- Handles storage errors gracefully

## HUD Component

The `LapHUD` component provides a comprehensive display including:

- Race progress bar
- Current lap time
- Best lap time
- Lap times list
- Race status
- Race statistics (when finished)

### Styling

The HUD uses a semi-transparent dark background with customizable positioning. You can override styles by passing a `style` prop.

## Example Implementation

See `GameScreenWithLaps.tsx` for a complete example of integrating the lap system with the game engine and HUD.

## Configuration Options

- `MIN_LAP_TIME`: Minimum time for valid lap (default: 5000ms)
- `START_LINE_CROSSING_COOLDOWN`: Cooldown between crossings (default: 2000ms)
- `STORAGE_KEY`: AsyncStorage key for best lap (default: 'race_game_best_lap')

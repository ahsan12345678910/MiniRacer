# Track System

The track system provides track loading, surface detection, and zone management for the racing game.

## Track.ts

Core track data structure and surface detection.

### Track Data Structure

```typescript
interface TrackData {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  laps: number;
  width: number;
  height: number;
  startPosition: { x: number; y: number; angle: number };
  checkpoints: Array<{
    id: string;
    position: { x: number; y: number };
    radius: number;
    order: number;
  }>;
  zones: TrackZone[];
  background: { color: string; image?: string };
}
```

### Track Zones

```typescript
interface TrackZone {
  id: string;
  type: 'asphalt' | 'grass' | 'barrier' | 'startLine' | 'checkpoint' | 'finishLine';
  name: string;
  color: string;
  properties: {
    friction: number;
    grip: number;
    roughness: number;
    isCollidable: boolean;
    isCheckpoint: boolean;
  };
  geometry: {
    type: 'rectangle' | 'circle' | 'polygon';
    points: Array<{ x: number; y: number }>;
    width?: number;
    height?: number;
    radius?: number;
  };
}
```

### Key Methods

- `getSurfaceAt(x, y)` - Get surface properties at position
- `getStartPosition()` - Get track start position
- `getCheckpoints()` - Get all checkpoints
- `isWithinBounds(x, y)` - Check if position is within track bounds
- `getCollidableZonesAt(x, y)` - Get collidable zones at position

## TrackLoader.ts

Loads tracks from JSON files with caching and validation.

### Features

- **JSON Loading**: Loads track data from JSON files
- **Caching**: Caches loaded tracks for performance
- **Validation**: Validates track data structure
- **Fallback**: Provides default track if loading fails
- **Error Handling**: Comprehensive error handling

### Usage

```typescript
import { getTrackLoader, loadDefaultTrack } from './TrackLoader';

// Load default track
const track = await loadDefaultTrack();

// Load specific track
const loader = getTrackLoader();
const customTrack = await loader.loadTrack('custom');

// Load multiple tracks
const tracks = await loader.loadTracks(['default', 'custom']);
```

## Default Track

The default track (`/src/assets/tracks/default.json`) is a rectangular racing track with:

### Zones

1. **Main Track (Asphalt)**
   - Full grip and friction
   - Non-collidable
   - Primary racing surface

2. **Outer Grass**
   - Reduced grip and speed
   - Non-collidable
   - Surrounds the track

3. **Barriers**
   - Collidable boundaries
   - Prevents car from leaving track
   - Outer and inner barriers

4. **Start Line**
   - Checkpoint zone
   - White finish line
   - Starting position

5. **Finish Line**
   - Checkpoint zone
   - Gold finish line
   - Lap completion detection

### Checkpoints

- **CP1**: Right side of track (700, 300)
- **CP2**: Top right corner (700, 200)
- **CP3**: Top left corner (100, 200)

### Track Layout

```
┌─────────────────────────────────────┐
│  Grass Area (Outer Barrier)         │
│  ┌─────────────────────────────┐    │
│  │  Grass (Inner)              │    │
│  │  ┌─────────────────────┐    │    │
│  │  │  Asphalt Track      │    │    │
│  │  │  ┌─────────────┐    │    │    │
│  │  │  │  Start/     │    │    │    │
│  │  │  │  Finish     │    │    │    │
│  │  │  └─────────────┘    │    │    │
│  │  └─────────────────────┘    │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

## Surface Detection

The `getSurfaceAt(x, y)` method determines surface properties at any position:

### Surface Types

- **Asphalt**: Full grip, normal friction, maximum speed
- **Grass**: Reduced grip (0.7), lower friction (0.85), speed reduction (0.8)
- **Barrier**: Collidable, reduced grip (0.5), normal friction
- **Start/Finish Line**: Checkpoint zones, full performance

### Detection Algorithm

1. Check each zone in order
2. Use geometric intersection tests:
   - Rectangle: Point-in-rectangle test
   - Circle: Distance-to-center test
   - Polygon: Ray casting algorithm
3. Return first matching zone properties
4. Default to grass if no zone matches

## Integration with Physics

The track system integrates with the car physics system:

```typescript
// Get surface at car position
const surface = track.getSurfaceAt(car.position.x, car.position.y);

// Apply surface properties to car physics
car.update(deltaTime, controls, {
  friction: surface.friction,
  grip: surface.grip,
  roughness: surface.roughness,
});
```

## Performance Considerations

- **Spatial Indexing**: Zones are checked in order (could be optimized with spatial indexing)
- **Caching**: Track data is cached after loading
- **Efficient Geometry**: Fast geometric intersection tests
- **Minimal Allocations**: Reuses objects to reduce garbage collection

## Future Enhancements

- **Spatial Indexing**: QuadTree or R-tree for faster zone lookups
- **Dynamic Tracks**: Procedurally generated tracks
- **Track Editor**: Visual track creation tool
- **Weather Effects**: Dynamic surface property changes
- **Multiplayer Sync**: Network synchronization for track state

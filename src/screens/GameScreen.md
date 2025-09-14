# GameScreen Implementation

The GameScreen provides a complete racing game interface with car rendering, track background, HUD overlay, and touch controls.

## Features

### 🚗 **Car Rendering**
- **Placeholder Rectangle**: Red car with white border as a placeholder
- **Animated Movement**: Smooth position and rotation animations using React Native Animated
- **Real-time Updates**: Car position and rotation sync with game store state

### 🏁 **Track Background**
- **Tiled Pattern**: 20 tiled squares creating a basic track texture
- **Grass Background**: Green grass color for off-track areas
- **Track Boundaries**: White rounded rectangle defining the racing area
- **Visual Hierarchy**: Clear distinction between track and off-track areas

### 📊 **HUD Overlay**
- **Speed Display**: Real-time speed in km/h with monospace font
- **Lap Counter**: Current lap / total laps display
- **Current Lap Time**: Live lap timer with MM:SS.mmm format
- **Best Lap Time**: Golden-colored best lap time (when available)
- **Pause Button**: Circular pause/play button in top-right
- **Menu Button**: Quick navigation back to main menu

### 🎮 **Touch Controls**
- **Left Side**: Touch and drag for steering control
- **Right Side**: Touch and drag for acceleration/braking
- **Visual Feedback**: Control hint text at bottom of screen
- **Responsive**: Smooth input handling with PanResponder

### ⚙️ **Game Integration**
- **Game Loop**: 60fps game loop with delta time calculation
- **Physics Integration**: Connected to GameIntegration and LapSystem
- **State Management**: Uses Zustand store for game state
- **Pause/Resume**: Full pause functionality with visual indicators

## Technical Implementation

### Game Loop
```typescript
const gameLoop = (currentTime: number) => {
  const deltaTime = currentTime - lastTimeRef.current;
  lastTimeRef.current = currentTime;

  if (deltaTime > 0 && !isPaused) {
    // Update game integration
    if (gameIntegration) {
      gameIntegration.update(deltaTime);
    }
    
    // Update game store
    useGameStore.getState().update(deltaTime);
  }

  gameLoopRef.current = requestAnimationFrame(gameLoop);
};
```

### Car Animation
```typescript
const carPosition = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
const carRotation = useRef(new Animated.Value(0)).current;

// Update animations when store changes
useEffect(() => {
  carPosition.setValue({ x: car.position.x, y: car.position.y });
  carRotation.setValue(car.angle);
}, [car.position.x, car.position.y, car.angle]);
```

### Touch Controls
```typescript
const panResponder = PanResponder.create({
  onStartShouldSetPanResponder: () => true,
  onMoveShouldSetPanResponder: () => true,
  onPanResponderGrant: (evt) => {
    const { locationX, locationY } = evt.nativeEvent;
    handleTouchInput(locationX, locationY, true);
  },
  // ... more handlers
});
```

## Styling

### Color Scheme
- **Background**: Dark gray (#1a1a1a)
- **Track**: Green tones (#2a4a2a, #4a6a4a)
- **Car**: Red (#FF4444) with white border
- **HUD**: Semi-transparent overlays with white text
- **Speed**: White monospace font
- **Lap Time**: Green (#00FF00)
- **Best Lap**: Gold (#FFD700)

### Layout
- **Full Screen**: Uses Dimensions API for responsive design
- **Overlay System**: HUD elements positioned absolutely
- **Touch Areas**: Full-screen touch handling with visual hints
- **Responsive**: Adapts to different screen sizes

## Usage

The GameScreen is automatically integrated into the navigation system. Users can:

1. **Navigate to Game**: From MenuScreen, tap "Play"
2. **Control Car**: Touch left side to steer, right side to accelerate
3. **Pause Game**: Tap pause button to pause/resume
4. **Return to Menu**: Tap "MENU" button to go back
5. **View Stats**: See speed, lap progress, and times in real-time

## Integration Points

- **GameStore**: Uses Zustand for state management
- **GameIntegration**: Connects to physics and lap systems
- **LapSystem**: Displays lap times and progress
- **Navigation**: Integrates with React Navigation
- **Touch Input**: Uses PanResponder for smooth controls

## Performance Considerations

- **Game Loop**: Uses requestAnimationFrame for smooth 60fps
- **Animations**: React Native Animated for hardware acceleration
- **State Updates**: Efficient state management with Zustand
- **Memory Management**: Proper cleanup of game loop and animations
- **Touch Handling**: Optimized PanResponder configuration

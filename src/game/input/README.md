# Input System

The input system provides touch-based controls for the racing game with two distinct input modes: Touch Zones and Virtual Joystick.

## InputManager.ts

Core input management with support for multiple input modes.

### Input Modes

#### 1. Touch Zones Mode
- **Left Half Screen**: Steer left
- **Right Half Screen**: Steer right  
- **Brake Button**: Bottom-right corner brake button

#### 2. Virtual Joystick Mode
- **Drag Left/Right**: Steer left/right
- **Drag Up**: Accelerate
- **Drag Down**: Brake
- **Dead Zone**: Prevents accidental inputs

### Key Features

- **Dual Input Modes**: Switch between touch zones and virtual joystick
- **Configurable Settings**: Customizable button sizes, joystick properties
- **Real-time Controls**: Immediate response to touch input
- **Screen Adaptation**: Automatically adjusts to different screen sizes
- **State Management**: Integrates with GameStore for settings persistence

## InputIntegration.ts

Bridges the InputManager with the GameStore and car physics system.

### Features

- **Store Integration**: Syncs input settings with GameStore
- **Physics Integration**: Converts input to car control actions
- **Settings Management**: Handles input mode switching
- **Screen Updates**: Responds to screen dimension changes

## InputComponents.tsx

React Native components for rendering input controls.

### Components

- **InputControls**: Main input overlay component
- **TouchZonesControls**: Renders touch zone areas
- **VirtualJoystickControls**: Renders virtual joystick
- **useInputIntegration**: Hook for easy integration

## GameStore Integration

Input settings are stored in the GameStore for persistence:

```typescript
interface GameSettings {
  inputMode: 'touchZones' | 'virtualJoystick';
  soundEnabled: boolean;
  musicEnabled: boolean;
  touchZones: {
    brakeButtonSize: number;
    brakeButtonMargin: number;
  };
  virtualJoystick: {
    size: number;
    deadZone: number;
    maxDistance: number;
    position: 'left' | 'right';
  };
}
```

## Usage Examples

### Basic Setup

```typescript
import { useInputIntegration } from './InputComponents';

const GameScreen = () => {
  const { width, height } = Dimensions.get('window');
  const inputIntegration = useInputIntegration(width, height);
  
  return (
    <View style={{ flex: 1 }}>
      {/* Game content */}
      <InputControls
        inputIntegration={inputIntegration}
        screenWidth={width}
        screenHeight={height}
      />
    </View>
  );
};
```

### Input Mode Switching

```typescript
import { useGameStore } from './store/GameStore';

const SettingsScreen = () => {
  const setInputMode = useGameStore((state) => state.setInputMode);
  const currentMode = useGameStore((state) => state.settings.inputMode);
  
  const switchMode = () => {
    const newMode = currentMode === 'touchZones' ? 'virtualJoystick' : 'touchZones';
    setInputMode(newMode);
  };
  
  return (
    <TouchableOpacity onPress={switchMode}>
      <Text>Switch to {currentMode === 'touchZones' ? 'Virtual Joystick' : 'Touch Zones'}</Text>
    </TouchableOpacity>
  );
};
```

### Custom Input Settings

```typescript
import { useGameStore } from './store/GameStore';

const updateInputSettings = () => {
  const updateSettings = useGameStore.getState().updateSettings;
  
  updateSettings({
    touchZones: {
      brakeButtonSize: 100,
      brakeButtonMargin: 30,
    },
    virtualJoystick: {
      size: 150,
      deadZone: 15,
      maxDistance: 75,
      position: 'right',
    },
  });
};
```

## Input Mode Details

### Touch Zones Mode

**Layout:**
```
┌─────────────────────────────────┐
│  Steer Left    │  Steer Right   │
│                │                │
│                │                │
│                │                │
│                │                │
│                │        [Brake] │
└─────────────────────────────────┘
```

**Features:**
- Large touch areas for easy steering
- Dedicated brake button
- Visual feedback zones
- Simple and intuitive

### Virtual Joystick Mode

**Layout:**
```
┌─────────────────────────────────┐
│                                 │
│                                 │
│                                 │
│                                 │
│  [Joystick]                     │
│    ↑ Accelerate                 │
│  ← → Steer                      │
│    ↓ Brake                      │
└─────────────────────────────────┘
```

**Features:**
- Analog control for precise steering
- Combined acceleration and steering
- Dead zone to prevent accidental inputs
- Configurable position (left/right)

## Configuration Options

### Touch Zones Settings

- **brakeButtonSize**: Size of brake button (default: 80px)
- **brakeButtonMargin**: Margin from screen edge (default: 20px)

### Virtual Joystick Settings

- **size**: Joystick base size (default: 120px)
- **deadZone**: Dead zone radius (default: 10px)
- **maxDistance**: Maximum drag distance (default: 60px)
- **position**: Screen position 'left' or 'right' (default: 'left')

## Performance Considerations

- **Efficient Touch Handling**: Minimal overhead touch processing
- **State Caching**: Cached input state to reduce recalculations
- **Screen Adaptation**: Efficient screen dimension updates
- **Memory Management**: Proper cleanup of event listeners

## Integration with Game Systems

The input system integrates seamlessly with:

- **Car Physics**: Direct control of acceleration, braking, and steering
- **Game Store**: Settings persistence and state management
- **Game Loop**: Real-time input processing at 60 FPS
- **React Native**: Native touch handling and gesture recognition

## Future Enhancements

- **Haptic Feedback**: Vibration feedback for collisions and actions
- **Customizable Layouts**: User-defined input zone positioning
- **Gesture Recognition**: Swipe gestures for special actions
- **Accessibility**: Voice control and accessibility features
- **Multi-touch**: Support for multiple simultaneous inputs
- **Input Recording**: Record and playback input sequences

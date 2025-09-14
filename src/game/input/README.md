# New Input Manager

A single source of truth for input handling using Zustand store and react-native-gesture-handler.

## Features

- **Single Source of Truth**: All input state managed in Zustand store
- **Two Input Modes**: TouchZones and Joystick
- **Gesture Handler Integration**: Uses PanGestureHandler and TapGestureHandler
- **Debounced Cleanup**: Automatic reset on gesture end
- **Performance Optimized**: Shallow selectors to avoid re-renders

## Usage

### Basic Setup

```tsx
import { InputHandler, useControls } from '@/game/input';

function GameScreen() {
  return (
    <InputHandler>
      <YourGameContent />
    </InputHandler>
  );
}

function GameLogic() {
  const controls = useControls(); // { steer: -1..1, throttle: 0..1, brake: 0..1 }
  
  // Use controls in your game logic
  useEffect(() => {
    if (controls.throttle > 0) {
      // Accelerate
    }
    if (controls.brake > 0) {
      // Brake
    }
    if (controls.steer !== 0) {
      // Steer
    }
  }, [controls]);
}
```

### Input Modes

#### TouchZones Mode
- **Left 40%**: Steering based on horizontal position (-1 to +1)
- **Right 40%**: Throttle based on horizontal position (0 to 1)
- **Bottom-right 20%**: Brake button (0 or 1)

#### Joystick Mode
- **Circular thumbstick**: Returns angle and magnitude
- **Horizontal axis**: Steering (-1 to +1)
- **Vertical axis**: Throttle (up) or Brake (down) (0 to 1)

### Hooks

```tsx
import { 
  useControls, 
  useInputSettings, 
  useInputActions,
  useTouchZones,
  useJoystick 
} from '@/game/input';

// Get current control values
const controls = useControls();

// Get input settings
const settings = useInputSettings();

// Get input actions
const actions = useInputActions();

// Get touch zones for rendering
const touchZones = useTouchZones();

// Get joystick state for rendering
const joystick = useJoystick();
```

### Settings

```tsx
import { useInputActions } from '@/game/input';

const actions = useInputActions();

// Update input mode
actions.updateSettings({ mode: 'joystick' });

// Update screen dimensions
actions.updateScreenDimensions(width, height);

// Update joystick settings
actions.updateSettings({
  joystick: {
    size: 150,
    deadZone: 15,
    position: 'right'
  }
});
```

## Types

```tsx
interface Controls {
  steer: number;    // -1 to 1
  throttle: number; // 0 to 1
  brake: number;    // 0 to 1
}

type InputMode = 'touchZones' | 'joystick';

interface InputSettings {
  mode: InputMode;
  screenWidth: number;
  screenHeight: number;
  joystick: {
    size: number;
    deadZone: number;
    position: 'left' | 'right';
  };
  touchZones: {
    brakeButtonSize: number;
    brakeButtonMargin: number;
  };
}
```

## Migration from Old System

The new system is backward compatible. You can gradually migrate:

1. Replace `InputIntegration` with `InputHandler` component
2. Replace `useInputIntegration` with `useControls` hook
3. Update control handling to use the new `Controls` interface
4. Remove old `PanResponder` implementations

## Performance

- Uses Zustand's shallow comparison to prevent unnecessary re-renders
- Gesture handlers are optimized for touch performance
- Automatic cleanup prevents memory leaks
- Minimal state updates for smooth 60fps gameplay
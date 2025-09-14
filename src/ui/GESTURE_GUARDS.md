# Gesture Conflict Guards

This document lists all the exact props added to prevent gesture conflicts and ensure proper event handling.

## ButtonsPad Component (`src/ui/Controls/ButtonsPad.tsx`)

### Pressable Props Added:
```tsx
<Pressable
  // ... existing props
  android_ripple={null}                    // Disable Android ripple to avoid long-press delays
  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}  // Expand touch area by 10px
  pointerEvents="auto"                     // Ensure button receives touch events
/>
```

### Console Logging Added:
```tsx
onPressIn={() => {
  console.log(`Button ${control} pressed - should steer/throttle immediately`);
  handleControlPress(control, true);
}}
onPressOut={() => {
  console.log(`Button ${control} released`);
  handleControlPress(control, false);
}}
```

## HUD Component (`src/ui/HUD.tsx`)

### TouchableOpacity Props Added:
```tsx
<TouchableOpacity
  // ... existing props
  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}  // Expand touch area by 10px
  activeOpacity={0.7}                     // Visual feedback on press
  pointerEvents="auto"                    // Ensure button receives touch events
/>
```

### Console Logging Added:
```tsx
const handlePause = () => {
  console.log('HUD Pause button tapped - should log instantly');
  // ... rest of function
};

const handleMenu = () => {
  console.log('HUD Menu button tapped - should log instantly');
  // ... rest of function
};
```

## InputComponents (`src/game/input/InputComponents.tsx`)

### TouchZonesHandler - PanGestureHandler Props:
```tsx
<PanGestureHandler 
  ref={panGestureRef}                     // Reference for simultaneousHandlers
  onGestureEvent={handlePanGesture}
  hitSlop={{ top: 0, bottom: 0, left: 0, right: 0 }}  // No hit area expansion
  simultaneousHandlers={[tapGestureRef]}  // Allow simultaneous with tap gesture
>
```

### TouchZonesHandler - TapGestureHandler Props:
```tsx
<TapGestureHandler 
  ref={tapGestureRef}                     // Reference for simultaneousHandlers
  onGestureEvent={handleTapGesture}
  hitSlop={{ top: 0, bottom: 0, left: 0, right: 0 }}  // No hit area expansion
  simultaneousHandlers={[panGestureRef]}  // Allow simultaneous with pan gesture
  waitFor={[panGestureRef]}              // Wait for pan gesture to complete first
>
```

### JoystickHandler - PanGestureHandler Props:
```tsx
<PanGestureHandler 
  ref={panGestureRef}                     // Reference for gesture coordination
  onGestureEvent={handlePanGesture}
  hitSlop={{ top: 0, bottom: 0, left: 0, right: 0 }}  // No hit area expansion
>
```

## TestOverlay Component (`src/ui/TestOverlay.tsx`)

### TouchableOpacity Props for Testing:
```tsx
<TouchableOpacity
  // ... existing props
  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}  // Expand touch area
  pointerEvents="auto"                    // Ensure button receives touch events
/>
```

## Key Gesture Guard Strategies:

### 1. **hitSlop Expansion**
- **HUD/Control buttons**: `{ top: 10, bottom: 10, left: 10, right: 10 }`
- **Gesture handlers**: `{ top: 0, bottom: 0, left: 0, right: 0 }` (no expansion)
- **Purpose**: Makes buttons easier to tap while keeping gesture areas precise

### 2. **simultaneousHandlers Coordination**
- **TouchZones**: Pan and Tap gestures can work simultaneously
- **Joystick**: Only Pan gesture (no conflicts)
- **Purpose**: Prevents gesture conflicts and ensures only one handler is active

### 3. **waitFor Coordination**
- **TapGestureHandler**: `waitFor={[panGestureRef]}`
- **Purpose**: Ensures pan gestures take priority over tap gestures

### 4. **Android Ripple Disable**
- **Pressable**: `android_ripple={null}`
- **Purpose**: Prevents long-press delays on Android

### 5. **Pointer Events Management**
- **Interactive elements**: `pointerEvents="auto"`
- **Containers**: `pointerEvents="box-none"`
- **Track layer**: `pointerEvents="none"`
- **Purpose**: Ensures proper event propagation hierarchy

## Testing Verification:

### Expected Behavior:
1. **HUD buttons**: Should log instantly when tapped
2. **Control buttons**: Should steer/throttle immediately when held
3. **No conflicts**: Other gesture handlers should not receive these events
4. **Console logs**: Should show immediate response without delays

### Test Commands:
```bash
# Enable test overlay in GameScreen
<TestOverlay visible={true} />

# Check console for:
# "HUD Pause button tapped - should log instantly"
# "Button steerLeft pressed - should steer/throttle immediately"
```

## Z-Index Layering:
- **Track layer**: zIndex: 1, pointerEvents: "none"
- **Input gestures**: zIndex: 10, pointerEvents: "box-none"
- **HUD**: zIndex: 20, pointerEvents: "box-none"
- **Control buttons**: zIndex: 50, pointerEvents: "auto"
- **Test overlay**: zIndex: 100, pointerEvents: "box-none"

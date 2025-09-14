# UI Components

## HUD Component

The HUD component displays game information and control buttons in a translucent card style.

### Features:
- **Top-left panel**: Speed (km/h), Lap counter, Best lap time
- **Top-right panel**: Pause and Menu buttons
- **Styling**: Translucent cards with `rgba(0,0,0,0.35)` background
- **Responsive**: Adapts to different screen sizes

### Usage:
```tsx
import { HUD } from '@/ui';

function GameScreen() {
  return (
    <View style={{ flex: 1 }}>
      {/* Game content */}
      <HUD 
        onPause={() => console.log('Pause pressed')}
        onMenu={() => console.log('Menu pressed')}
      />
    </View>
  );
}
```

## ButtonsPad Component

The ButtonsPad component provides four circular control buttons for car control.

### Features:
- **Four buttons**: Left, Right, Throttle, Brake
- **Size**: 64px diameter with 32px border radius
- **Visual feedback**: Press animation and shadows
- **Safe area**: Respects device safe area insets
- **High z-index**: Ensures buttons are always accessible

### Button Layout:
```
[← LEFT] [→ RIGHT] [↑ GAS] [↓ BRAKE]
```

### Usage:
```tsx
import { ButtonsPad } from '@/ui';

function GameScreen() {
  return (
    <View style={{ flex: 1 }}>
      {/* Game content with pointerEvents="none" */}
      <ButtonsPad 
        onControlChange={(control, value) => {
          console.log(`${control}: ${value}`);
        }}
      />
    </View>
  );
}
```

## Integration with GameScreen

To properly integrate these components:

1. **Set track layer pointer events to 'none'**:
```tsx
<View style={styles.trackLayer} pointerEvents="none">
  {/* Track content */}
</View>
```

2. **Add HUD at the top**:
```tsx
<HUD />
```

3. **Add ButtonsPad at the bottom**:
```tsx
<ButtonsPad />
```

4. **Ensure proper z-index layering**:
- Track layer: zIndex: 1
- HUD: zIndex: 20
- ButtonsPad: zIndex: 50

## Styling

### HUD Cards
- Background: `rgba(0, 0, 0, 0.35)`
- Border radius: 12px
- Padding: 10px horizontal, 6px vertical
- Font weight: 600

### Control Buttons
- Size: 64x64px
- Border radius: 32px (circular)
- Shadow: 4px offset, 0.3 opacity
- Elevation: 8 (Android)
- Press animation: 0.95 scale

### Colors
- **Steering buttons**: Red (#FF6B6B)
- **Throttle button**: Teal (#4ECDC4)
- **Brake button**: Yellow (#FFE66D)
- **Text**: White with shadow

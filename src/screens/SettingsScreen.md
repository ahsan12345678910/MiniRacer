# SettingsScreen Implementation

The SettingsScreen provides comprehensive game configuration options with AsyncStorage persistence and real-time application in the GameScreen.

## Features

### 🎮 **Control Mode Toggle**

- **Touch Zones**: Left side for steering, right side for acceleration/braking
- **Virtual Joystick**: Touch and drag for combined steering and acceleration control
- **Visual Feedback**: Active control mode highlighted with blue styling
- **Real-time Application**: Changes apply immediately in GameScreen

### 🔊 **Audio Controls**

- **Sound Effects**: Toggle game sound effects on/off
- **Background Music**: Toggle background music on/off
- **Visual Indicators**: Switch components with custom styling
- **Immediate Effect**: Audio settings apply instantly

### 🏁 **Data Management**

- **Reset Best Lap**: Clear personal best lap time with confirmation dialog
- **Reset All Settings**: Restore all settings to default values
- **Confirmation Dialogs**: Prevent accidental data loss
- **Success Feedback**: User confirmation of successful operations

### 💾 **AsyncStorage Persistence**

- **Automatic Saving**: Settings saved immediately when changed
- **Automatic Loading**: Settings loaded on app startup
- **Error Handling**: Graceful handling of storage failures
- **Default Fallback**: Uses default settings if storage fails

## Technical Implementation

### Settings Structure

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

### AsyncStorage Integration

```typescript
const saveSettings = async (newSettings: GameSettings) => {
  try {
    await AsyncStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify(newSettings)
    );
    setLocalSettings(newSettings);
    updateSettings(newSettings);
  } catch (error) {
    console.error('Failed to save settings:', error);
    Alert.alert('Error', 'Failed to save settings');
  }
};
```

### GameStore Integration

```typescript
const { settings, updateSettings } = useGameStore();

// Settings are automatically synced with the global game store
// Changes are immediately available in GameScreen and other components
```

## UI/UX Design

### Layout Structure

- **Header**: Back button and title
- **ScrollView**: Scrollable content for all settings
- **Sections**: Organized into logical groups (Controls, Audio, Data, About)
- **Loading State**: Shows loading indicator while settings load

### Visual Design

- **Dark Theme**: Consistent with game's dark color scheme
- **Card-based Layout**: Each setting in its own card
- **Active States**: Clear visual feedback for selected options
- **Descriptions**: Helpful text explaining each setting

### Color Scheme

- **Background**: Dark gray (#1a1a1a)
- **Cards**: Medium gray (#2a2a2a) with borders
- **Text**: White primary, light gray secondary
- **Active Elements**: Blue (#007AFF) for selected states
- **Destructive Actions**: Red styling for reset operations

## Settings Sections

### Controls Section

- **Control Mode Selection**: Toggle between touch zones and virtual joystick
- **Visual Feedback**: Active mode highlighted in blue
- **Descriptions**: Clear explanation of each control method

### Audio Section

- **Sound Effects Toggle**: Enable/disable game sounds
- **Music Toggle**: Enable/disable background music
- **Switch Components**: Native iOS/Android switch styling

### Data Section

- **Reset Best Lap**: Clear personal best lap time
- **Reset All Settings**: Restore defaults
- **Confirmation Dialogs**: Prevent accidental data loss

### About Section

- **Game Version**: Display current version
- **Settings Status**: Show that settings are saved
- **Information Display**: Read-only information

## GameScreen Integration

### Control Mode Application

```typescript
// In GameScreen.tsx
const handleTouchInput = (x: number, y: number, isStart: boolean) => {
  if (settings.inputMode === 'touchZones') {
    // Touch zones logic
  } else {
    // Virtual joystick logic
  }
};
```

### Visual Feedback

- **Control Hints**: Dynamic text based on selected control mode
- **Virtual Joystick**: Visual joystick appears when active
- **Real-time Updates**: Settings changes apply immediately

### Audio Integration

- **Sound Effects**: Respects soundEnabled setting
- **Background Music**: Respects musicEnabled setting
- **Immediate Effect**: Audio changes apply instantly

## Error Handling

### Storage Errors

- **Graceful Degradation**: Falls back to default settings
- **User Feedback**: Alert dialogs for errors
- **Logging**: Console logging for debugging

### Validation

- **Type Safety**: TypeScript interfaces ensure data integrity
- **Default Values**: Always has valid fallback settings
- **Range Checking**: Ensures settings values are within valid ranges

## Performance Considerations

### AsyncStorage

- **Efficient Storage**: Only saves when settings change
- **JSON Serialization**: Lightweight data format
- **Error Recovery**: Handles storage failures gracefully

### State Management

- **Local State**: Immediate UI updates
- **Global State**: Synced with game store
- **Minimal Re-renders**: Efficient state updates

### Loading States

- **Initial Load**: Shows loading indicator
- **Fast Loading**: Quick settings retrieval
- **Fallback**: Default settings if loading fails

## Usage Examples

### Changing Control Mode

1. Open Settings from Menu
2. Tap "Touch Zones" or "Virtual Joystick"
3. Setting saves automatically
4. Return to game to see changes

### Resetting Best Lap

1. Go to Settings > Data section
2. Tap "Reset Best Lap Time"
3. Confirm in dialog
4. Best lap time is cleared

### Audio Control

1. Toggle sound effects or music switches
2. Settings save automatically
3. Audio changes apply immediately

## Future Enhancements

### Potential Additions

- **Graphics Settings**: Quality, resolution options
- **Advanced Controls**: Sensitivity, dead zone customization
- **Accessibility**: High contrast, large text options
- **Backup/Restore**: Export/import settings
- **Profiles**: Multiple setting profiles
- **Statistics**: View game statistics and achievements

# MiniRacer - Simplified Version

## 🚗 A Simple Racing Game for React Native

This is a simplified version of the MiniRacer game that removes complex dependencies and systems to ensure it runs without errors.

## ✨ Features

### ✅ Working Features
- **Navigation**: Smooth navigation between screens
- **Simple Gameplay**: Basic car movement with touch controls
- **Controls**: Button-based controls (steer left/right, accelerate, brake)
- **HUD**: Speed and score display
- **Pause/Resume**: Game pause functionality
- **Settings**: Basic settings screen with toggles
- **Menu**: Clean menu interface

### 🎮 How to Play
1. **Start**: Tap "Play" from the main menu
2. **Steer**: Use left/right arrow buttons to steer
3. **Accelerate**: Use up arrow button to speed up
4. **Brake**: Use down arrow button to slow down
5. **Pause**: Tap pause button to pause/resume
6. **Menu**: Tap menu button to return to main menu

## 🛠️ Technical Details

### Simplified Architecture
- **No Complex Physics**: Simple position-based movement
- **No Audio System**: Removed to avoid dependency issues
- **No Persistence**: Settings stored in memory only
- **No Complex Input**: Basic button controls only
- **No Track Loading**: Simple static track background

### Dependencies Used
- React Native
- React Navigation
- Expo
- Basic React Native components

### Dependencies Removed/Commented
- react-native-gesture-handler
- Complex audio systems
- Physics engines
- AsyncStorage
- Complex state management

## 🚀 Getting Started

### Prerequisites
- Node.js
- Expo CLI
- React Native development environment

### Installation
```bash
# Install dependencies
npm install

# Start the development server
npm start

# Run on specific platform
npm run android
npm run ios
npm run web
```

## 📱 Screens

### 1. Splash Screen
- Shows game title
- Auto-navigates to menu after 1.5 seconds

### 2. Menu Screen
- Play button (starts game)
- Settings button (opens settings)
- Quit button (shows confirmation)

### 3. Game Screen
- Simple track background
- Red car that moves based on controls
- HUD showing speed and score
- Control buttons at bottom
- Pause and menu buttons

### 4. Settings Screen
- Control mode selection (Buttons/Touch)
- Sound effects toggle
- Background music toggle
- Reset settings option
- Game information

## 🎯 Game Mechanics

### Car Movement
- **Position**: X, Y coordinates on screen
- **Angle**: Rotation in radians
- **Speed**: Simple velocity value
- **Collision**: Basic screen boundary checking

### Scoring
- Score increases over time
- Simple counter system
- No complex lap timing

### Controls
- **Steer Left**: Rotates car left
- **Steer Right**: Rotates car right
- **Accelerate**: Increases speed
- **Brake**: Decreases speed

## 🔧 Customization

### Easy Modifications
- **Car Speed**: Modify speed values in SimpleGameScreen.tsx
- **Track Colors**: Change colors in StyleSheet
- **Control Layout**: Adjust button positions and sizes
- **HUD Display**: Modify information shown

### Adding Features
1. **Audio**: Re-enable audio system (see SIMPLIFICATION_NOTES.md)
2. **Physics**: Add back physics system
3. **Persistence**: Add AsyncStorage for settings
4. **Complex Input**: Add gesture handling
5. **Track Loading**: Add dynamic track system

## 🐛 Troubleshooting

### Common Issues
1. **Navigation Errors**: Check React Navigation setup
2. **Button Not Working**: Verify TouchableOpacity implementation
3. **Styling Issues**: Check StyleSheet definitions
4. **Performance**: Reduce game loop frequency if needed

### Debug Mode
- Console logs added for button presses
- Simple error handling
- Basic state logging

## 📚 Documentation

- **SIMPLIFICATION_NOTES.md**: Detailed explanation of what was simplified
- **Original Code**: Complex systems remain in place but commented out
- **Re-enabling Guide**: Steps to restore full functionality

## 🎨 Styling

### Color Scheme
- **Background**: Dark (#1a1a1a)
- **Track**: Green (#2a4a2a)
- **Car**: Red (#FF4444)
- **UI**: Dark with white text
- **Buttons**: Color-coded by function

### Layout
- **Responsive**: Adapts to different screen sizes
- **Touch-Friendly**: Large button targets
- **Clean**: Minimal, focused design

## 🔄 Future Enhancements

### Phase 1: Stability
- ✅ Basic functionality working
- ✅ Error-free operation
- ✅ Simple controls

### Phase 2: Features
- 🔄 Add audio system
- 🔄 Add physics
- 🔄 Add persistence
- 🔄 Add complex input

### Phase 3: Polish
- 🔄 Add animations
- 🔄 Add sound effects
- 🔄 Add track variety
- 🔄 Add lap system

## 📄 License

This is a simplified version for educational purposes. The original complex systems remain in place for future development.

## 🤝 Contributing

1. Test the simplified version
2. Identify any remaining issues
3. Gradually re-enable complex features
4. Test each addition thoroughly
5. Document changes

---

**Note**: This simplified version prioritizes stability and basic functionality over advanced features. It serves as a solid foundation for building back the complex systems gradually.

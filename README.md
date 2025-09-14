# MiniRacer - React Native Racing Game

A high-performance racing game built with React Native, Expo, and TypeScript. Features realistic car physics, lap timing, audio system, and customizable controls.

## 🚗 Features

### Core Gameplay
- **Realistic Car Physics**: Advanced physics simulation with acceleration, braking, steering, and surface interaction
- **Lap System**: Complete lap detection with start line crossing, lap timing, and best lap persistence
- **Track System**: Configurable tracks with zones, checkpoints, and surface properties
- **Collision Detection**: Barrier and checkpoint collision system

### Audio System
- **Engine Sounds**: Dynamic engine audio with speed-based pitch and volume changes
- **UI Sounds**: Click sounds for all user interactions
- **Audio Settings**: Configurable sound effects and background music
- **Performance Optimized**: Efficient audio management with minimal performance impact

### Controls
- **Touch Zones**: Left side steering, right side acceleration/braking
- **Virtual Joystick**: Combined steering and acceleration control
- **Customizable**: Adjustable control sensitivity and dead zones
- **Responsive**: Smooth touch input handling with visual feedback

### User Interface
- **Modern HUD**: Real-time speed, lap counter, and timing display
- **Settings Screen**: Comprehensive configuration options
- **Menu System**: Intuitive navigation between screens
- **Dark Theme**: Professional racing game aesthetic

## 🛠️ Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (for testing)

### Setup
```bash
# Clone the repository
git clone <repository-url>
cd MiniRacer

# Install dependencies
npm install

# Start the development server
npm start

# After making changes to babel.config.js, clear cache and restart
expo start -c

# Run on specific platforms
npm run ios     # iOS Simulator
npm run android # Android Emulator
npm run web     # Web browser
```

## 🎮 How to Play

### Basic Controls

#### Touch Zones Mode (Default)
- **Left Side**: Touch and drag to steer left/right
- **Right Side**: Touch and drag to accelerate/brake
- **Steering**: Move finger left/right on left side of screen
- **Acceleration**: Move finger up/down on right side of screen

#### Virtual Joystick Mode
- **Touch Anywhere**: Touch and drag to control both steering and acceleration
- **Steering**: Horizontal movement controls left/right steering
- **Acceleration**: Vertical movement controls forward/backward
- **Dead Zone**: Small movements are ignored for precision

### Gameplay Tips
1. **Start Slow**: Begin with gentle inputs to get familiar with the physics
2. **Smooth Steering**: Avoid sharp steering inputs for better control
3. **Brake Early**: Start braking before turns to maintain speed through corners
4. **Use the Racing Line**: Take the optimal path around the track
5. **Practice**: Use the lap timing system to improve your performance

## ⚙️ Configuration

### Settings Menu
Access the settings from the main menu to customize your experience:

#### Controls
- **Input Mode**: Switch between Touch Zones and Virtual Joystick
- **Sensitivity**: Adjust control responsiveness (coming soon)
- **Dead Zone**: Configure joystick dead zone (coming soon)

#### Audio
- **Sound Effects**: Toggle engine and UI sounds
- **Background Music**: Enable/disable background music
- **Volume**: Adjust audio levels (coming soon)

#### Data Management
- **Reset Best Lap**: Clear your personal best lap time
- **Reset All Settings**: Restore default configuration

### Performance Tuning

#### For Smooth Gameplay
```typescript
// In GameScreen.tsx - Adjust game loop frequency
const TARGET_FPS = 60;
const FRAME_TIME = 1000 / TARGET_FPS;

// Optimize rendering
const useMemo = React.useMemo;
const useCallback = React.useCallback;
```

#### Audio Performance
```typescript
// In AudioManager.ts - Adjust audio update frequency
const AUDIO_UPDATE_THRESHOLD = 0.01; // Only update if change > 1%
const SMOOTH_FACTOR = 0.1; // Smooth audio transitions
```

#### Physics Tuning
```typescript
// In CarModel.ts - Adjust physics parameters
const CAR_PARAMETERS = {
  maxSpeed: 200,        // Maximum speed (units/second)
  acceleration: 150,    // Acceleration force
  brakePower: 300,      // Braking force
  friction: 0.95,       // Air/rolling resistance
  turnRate: 3.0,        // Turning rate (radians/second)
  mass: 1.0,            // Car mass
};
```

## 🏗️ Architecture

### Project Structure
```
src/
├── audio/              # Audio system
│   ├── AudioManager.ts # Main audio controller
│   ├── useAudio.ts     # React hooks for audio
│   └── index.ts        # Audio exports
├── game/               # Core game logic
│   ├── physics/        # Car physics simulation
│   ├── track/          # Track system
│   ├── collision/      # Collision detection
│   ├── input/          # Input handling
│   ├── store/          # State management
│   └── LapSystem.ts    # Lap timing system
├── screens/            # React Native screens
│   ├── GameScreen.tsx  # Main game screen
│   ├── MenuScreen.tsx  # Main menu
│   └── SettingsScreen.tsx # Settings
├── ui/                 # Reusable UI components
└── assets/             # Game assets
    └── sounds/         # Audio files
```

### Key Components

#### AudioManager
- Singleton pattern for efficient audio management
- Speed-based engine sound modulation
- Settings-aware audio control
- Performance optimized with minimal re-renders

#### LapSystem
- Start line detection with forward direction validation
- AsyncStorage persistence for best lap times
- Event-driven architecture for lap completion
- Real-time lap timing and statistics

#### GameScreen
- Optimized React component with useCallback and useMemo
- Real-time physics integration
- Touch input handling with PanResponder
- HUD overlay with performance metrics

## 🎯 Performance Optimization

### React Performance
- **useCallback**: Memoized event handlers to prevent unnecessary re-renders
- **useMemo**: Cached expensive calculations (time formatting, speed conversion)
- **useRef**: Direct DOM manipulation for animations
- **Animated API**: Hardware-accelerated car movement

### Game Loop Optimization
- **requestAnimationFrame**: 60fps game loop
- **Delta Time**: Frame-rate independent physics
- **Efficient Updates**: Only update when values change significantly
- **Memory Management**: Proper cleanup of timers and listeners

### Audio Performance
- **Singleton Pattern**: Single audio manager instance
- **Lazy Loading**: Audio files loaded on demand
- **Smooth Transitions**: Gradual volume/pitch changes
- **Settings Integration**: Audio respects user preferences

## 🔧 Development

### Code Quality
```bash
# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Type checking
npm run type-check
```

### Testing
```bash
# Run tests (when implemented)
npm test

# Run with coverage
npm run test:coverage
```

### Building
```bash
# Build for production
expo build:android
expo build:ios

# Build for web
expo build:web
```

## 📱 Platform Support

### iOS
- **Minimum Version**: iOS 11.0
- **Features**: Full audio support, smooth animations
- **Testing**: iOS Simulator and physical devices

### Android
- **Minimum Version**: Android 6.0 (API level 23)
- **Features**: Full audio support, hardware acceleration
- **Testing**: Android Emulator and physical devices

### Web
- **Browsers**: Chrome, Firefox, Safari, Edge
- **Features**: Limited audio support, touch controls
- **Performance**: Optimized for desktop and mobile browsers

## 🎵 Audio Assets

### Required Sound Files
Place these files in `src/assets/sounds/`:

- **engine.mp3**: Looping engine sound (2-3 seconds, seamless loop)
- **click.mp3**: Short UI click sound (0.1-0.3 seconds)

### Audio Specifications
- **Format**: MP3
- **Sample Rate**: 44.1kHz
- **Bit Rate**: 128kbps minimum
- **Channels**: Mono or Stereo
- **Engine Sound**: Should be designed for pitch shifting (0.8x to 1.5x)

### Creating Audio Assets
1. **Engine Sound**: Record or generate a smooth engine sound that loops seamlessly
2. **Click Sound**: Create a short, crisp click sound for UI feedback
3. **Optimization**: Compress files for mobile performance
4. **Testing**: Test on both iOS and Android devices

## 🐛 Troubleshooting

### Common Issues

#### Audio Not Playing
- Check device volume and mute settings
- Verify audio files are in correct location
- Ensure expo-av is properly installed
- Check console for audio initialization errors

#### Performance Issues
- Reduce game loop frequency if needed
- Optimize physics calculations
- Check for memory leaks in game loop
- Profile with React Native performance tools

#### Touch Controls Not Responsive
- Verify PanResponder configuration
- Check for overlapping touch areas
- Test on different device sizes
- Adjust dead zone settings

### Debug Mode
```typescript
// Enable debug logging
const DEBUG_MODE = __DEV__;

if (DEBUG_MODE) {
  console.log('Game state:', gameState);
  console.log('Audio state:', audioState);
}
```

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

### Code Style
- Use TypeScript for type safety
- Follow React Native best practices
- Write comprehensive comments
- Maintain consistent formatting

### Testing
- Test on multiple devices
- Verify audio functionality
- Check performance on older devices
- Test different screen sizes

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Expo Team**: For the excellent development platform
- **React Native Community**: For the robust mobile framework
- **Expo AV**: For audio capabilities
- **Zustand**: For state management
- **React Navigation**: For navigation system

## 📞 Support

For support, questions, or feature requests:
- Create an issue on GitHub
- Check the documentation
- Review the troubleshooting section
- Test on multiple devices

---

**Happy Racing! 🏁**
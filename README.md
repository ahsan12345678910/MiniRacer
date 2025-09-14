# MiniRacer

A React Native racing game built with Expo and TypeScript.

## Features

- 🏎️ Racing game mechanics
- 🎮 Touch controls with gesture handling
- 🎵 Sound effects and background music
- ⚙️ Settings screen with preferences
- 📱 Cross-platform (iOS, Android, Web)

## Tech Stack

- **Framework**: Expo React Native
- **Language**: TypeScript
- **Navigation**: React Navigation v7
- **State Management**: Zustand
- **Animations**: React Native Reanimated
- **Gestures**: React Native Gesture Handler
- **Audio**: Expo AV
- **Storage**: AsyncStorage
- **Linting**: ESLint + Prettier

## Project Structure

```
src/
├── app/           # App configuration and setup
├── screens/       # Screen components
│   ├── SplashScreen.tsx
│   ├── MenuScreen.tsx
│   ├── GameScreen.tsx
│   └── SettingsScreen.tsx
├── game/          # Game logic and state
│   ├── GameEngine.ts
│   └── GameState.ts
├── ui/            # Reusable UI components
│   ├── Button.tsx
│   └── Text.tsx
└── assets/        # Images, sounds, and other assets
    ├── images.ts
    └── sounds.ts
```

## Getting Started

### Prerequisites

- Node.js (v20.19.4 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Run on specific platforms:
   ```bash
   npm run android  # Android
   npm run ios      # iOS
   npm run web      # Web
   ```

## Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator
- `npm run web` - Run on web browser
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors automatically
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking

## Development

### Code Quality

The project uses ESLint and Prettier for code quality and formatting:

- ESLint configuration: `.eslintrc.js`
- Prettier configuration: `.prettierrc`
- TypeScript configuration: `tsconfig.json`

### Navigation

The app uses React Navigation v7 with a stack navigator. Navigation types are defined in `App.tsx`:

```typescript
export type RootStackParamList = {
  Splash: undefined;
  Menu: undefined;
  Game: undefined;
  Settings: undefined;
};
```

### State Management

The project is set up to use Zustand for state management. Game state is defined in `src/game/GameState.ts`.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run linting and type checking
5. Submit a pull request

## License

This project is licensed under the MIT License.

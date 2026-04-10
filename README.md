# MiniRacer

MiniRacer is a lightweight React Native (Expo) racing prototype with:

- touch or joystick control modes
- lap timing with persisted best lap
- engine + UI sound effects via `expo-av`

## Run

1. Install dependencies:
   - `npm install`
2. Start Expo:
   - `npm run start`
3. Open on device/simulator:
   - `npm run android`
   - `npm run ios`
   - `npm run web`

## Controls

- `Touch Zones`: left/right halves steer, bottom-right brake
- `Joystick`: drag for steer + acceleration

You can switch modes in `Settings`.

## Audio

- Engine loop uses pitch/rate and volume scaling based on car speed.
- UI buttons trigger a click sound.
- Audio obeys `Settings -> Sound`.

Current implementation uses URI-loaded sound files in `src/game/audio/AudioManager.ts`.
To tune or replace:

- update `ENGINE_SOUND_URI`
- update `CLICK_SOUND_URI`

## Quality Checks

- Lint: `npm run lint`
- Type check: `npm run typecheck`
- Format write: `npm run format`

## Tuning Tips

- Car feel:
  - `src/game/physics/CarModel.ts`
  - adjust `maxSpeed`, `accel`, `brakePower`, `friction`, `turnRate`
- Surface behavior:
  - `SURFACE_PRESETS` in `CarModel.ts`
  - tune `grip` and `dragMultiplier`
- Input responsiveness:
  - `src/game/InputManager.ts`
  - tune joystick radius and touch-zone brake region
- Lap behavior:
  - `src/game/LapSystem.ts`
  - adjust forward crossing logic and storage key
- Engine sound response:
  - `src/game/audio/AudioManager.ts`
  - tune normalized speed mapping to `rate` and `volume`

# MiniRacer

MiniRacer is a lightweight React Native (Expo) racing prototype with:

- touch or joystick control modes
- lap timing with persisted best lap
- engine + UI sound effects via `expo-av`

## Quick Start

1. Install dependencies: `npm install`
2. Start Expo: `npm run start`
3. Launch a target:
   - Android: `npm run android`
   - iOS: `npm run ios`
   - Web: `npm run web`

## Controls

- `Touch Zones`: left/right halves steer, bottom-right brake
- `Joystick`: drag for steer + acceleration

You can switch modes in `Settings`.

## Audio

- Engine loop uses pitch/rate and volume scaling based on speed.
- UI buttons trigger a click SFX.
- Audio obeys `Settings > Sound`.
- Local assets are loaded from:
  - `assets/audio/engine.mp3` (looped engine bed)
  - `assets/audio/click.mp3` (UI click)

To replace sounds, keep the same filenames or update paths in `src/game/audio/AudioManager.ts`.

## Quality Checks

- Lint: `npm run lint`
- Auto-fix lint issues: `npm run lint:fix`
- Format: `npm run format`
- Type check only: `npm run typecheck`

Recommended pre-commit run:

1. `npm run lint`
2. `npm run format`
3. `npm run typecheck`

## Performance Notes

- Main simulation runs in a fixed-step loop (`src/game/loop/FixedStepLoop.ts`).
- Engine audio updates are thresholded and rate-limited to avoid expensive per-frame calls.
- Track tile rendering is memoized to avoid re-creating static tile elements each frame.

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
  - tune `speedKmh` normalization and the `rate`/`volume` ranges
  - tweak update thresholds (`RATE_EPSILON`, `VOLUME_EPSILON`, `ENGINE_MIN_UPDATE_MS`) for smoother response vs CPU usage

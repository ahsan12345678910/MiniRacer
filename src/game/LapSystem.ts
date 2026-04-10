import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGameStore } from './GameStore';
import { Track, type RectZone } from './Track';
import { BEST_LAP_STORAGE_KEY } from './settingsStorage';

type Vector2 = {
  x: number;
  y: number;
};

export type LapHudSnapshot = {
  currentLap: number;
  currentLapTime: number;
  lapTimes: number[];
  bestLap: number | null;
};

type LapCompletePayload = {
  lapTime: number;
  lapNumber: number;
  bestLap: number | null;
};

type LapSystemOptions = {
  bestLapStorageKey?: string;
  onHudUpdate?: (hud: LapHudSnapshot) => void;
  onLapComplete?: (payload: LapCompletePayload) => void;
};

const DEFAULT_STORAGE_KEY = BEST_LAP_STORAGE_KEY;

function isPointInRect(point: Vector2, zone: RectZone): boolean {
  return (
    point.x >= zone.x &&
    point.x <= zone.x + zone.width &&
    point.y >= zone.y &&
    point.y <= zone.y + zone.height
  );
}

export class LapSystem {
  private readonly startLine: RectZone;
  private readonly storageKey: string;
  private readonly onHudUpdate?: LapSystemOptions['onHudUpdate'];
  private readonly onLapComplete?: LapSystemOptions['onLapComplete'];

  private currentLapTime = 0;
  private previousPosition: Vector2 | null = null;
  private wasInsideStartLine = false;

  constructor(track: Track, options: LapSystemOptions = {}) {
    const startLine = track.getZoneByLabel('startLine')[0];
    if (!startLine) {
      throw new Error('LapSystem requires a startLine zone in track data.');
    }

    this.startLine = startLine;
    this.storageKey = options.bestLapStorageKey ?? DEFAULT_STORAGE_KEY;
    this.onHudUpdate = options.onHudUpdate;
    this.onLapComplete = options.onLapComplete;
  }

  async init() {
    const rawBestLap = await AsyncStorage.getItem(this.storageKey);
    if (rawBestLap) {
      const parsed = Number(rawBestLap);
      if (!Number.isNaN(parsed) && parsed > 0) {
        useGameStore.getState().setBestLapTime(parsed);
      }
    }

    this.emitHudUpdate();
  }

  reset(initialPosition?: Vector2) {
    this.currentLapTime = 0;
    this.previousPosition = initialPosition ?? null;
    this.wasInsideStartLine = initialPosition ? isPointInRect(initialPosition, this.startLine) : false;
    this.emitHudUpdate();
  }

  update(dt: number, carPosition: Vector2) {
    this.currentLapTime += dt;
    const isInside = isPointInRect(carPosition, this.startLine);

    if (
      this.previousPosition &&
      this.didCrossStartLineForward(this.previousPosition, carPosition) &&
      !this.wasInsideStartLine &&
      isInside
    ) {
      this.completeLap();
    }

    this.wasInsideStartLine = isInside;
    this.previousPosition = carPosition;
    this.emitHudUpdate();
  }

  private didCrossStartLineForward(previous: Vector2, current: Vector2) {
    const isVerticalLine = this.startLine.height >= this.startLine.width;

    if (isVerticalLine) {
      const edgeX = this.startLine.x;
      const crossedEdge = previous.x < edgeX && current.x >= edgeX;
      const movingForward = current.x > previous.x;
      const intersectsY =
        Math.max(previous.y, current.y) >= this.startLine.y &&
        Math.min(previous.y, current.y) <= this.startLine.y + this.startLine.height;
      return crossedEdge && movingForward && intersectsY;
    }

    const edgeY = this.startLine.y;
    const crossedEdge = previous.y < edgeY && current.y >= edgeY;
    const movingForward = current.y > previous.y;
    const intersectsX =
      Math.max(previous.x, current.x) >= this.startLine.x &&
      Math.min(previous.x, current.x) <= this.startLine.x + this.startLine.width;
    return crossedEdge && movingForward && intersectsX;
  }

  private completeLap() {
    const store = useGameStore.getState();
    const lapDataBefore = store.lapData;
    const lapTime = this.currentLapTime;
    store.completeLap(lapTime);

    const lapDataAfter = useGameStore.getState().lapData;
    const bestLap = lapDataAfter.bestLapTime;
    this.currentLapTime = 0;

    if (bestLap !== null) {
      AsyncStorage.setItem(this.storageKey, String(bestLap)).catch(() => {
        // Non-fatal: game continues even if persistence fails.
      });
    }

    this.onLapComplete?.({
      lapTime,
      lapNumber: lapDataBefore.currentLap,
      bestLap,
    });
  }

  private emitHudUpdate() {
    const lapData = useGameStore.getState().lapData;
    this.onHudUpdate?.({
      currentLap: lapData.currentLap,
      currentLapTime: this.currentLapTime,
      lapTimes: lapData.lapTimes,
      bestLap: lapData.bestLapTime,
    });
  }
}

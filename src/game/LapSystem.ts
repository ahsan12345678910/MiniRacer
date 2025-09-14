import AsyncStorage from '@react-native-async-storage/async-storage';
import { CarModel, CarPhysicsState } from './physics/CarModel';
import { Track } from './track/Track';

export interface LapTime {
  lapNumber: number;
  time: number; // in milliseconds
  timestamp: number;
  isBestLap: boolean;
}

export interface LapSystemState {
  currentLap: number;
  totalLaps: number;
  lapTimes: LapTime[];
  bestLap: LapTime | null;
  currentLapStartTime: number;
  isRaceStarted: boolean;
  isRaceFinished: boolean;
  lastStartLineCrossing: number;
  hasCrossedStartLine: boolean;
}

export interface StartLineZone {
  id: string;
  position: { x: number; y: number };
  width: number;
  height: number;
  direction: { x: number; y: number }; // Normal vector indicating forward direction
}

export interface LapSystemEvents {
  onLapComplete: (lapTime: LapTime) => void;
  onBestLap: (lapTime: LapTime) => void;
  onRaceStart: () => void;
  onRaceFinish: () => void;
  onStartLineCross: (isForward: boolean) => void;
}

export class LapSystem {
  private state: LapSystemState;
  private track: Track;
  private startLineZone: StartLineZone | null = null;
  private events: Partial<LapSystemEvents> = {};
  private readonly STORAGE_KEY = 'race_game_best_lap';
  private readonly MIN_LAP_TIME = 5000; // Minimum 5 seconds for a valid lap
  private readonly START_LINE_CROSSING_COOLDOWN = 2000; // 2 seconds cooldown between crossings

  constructor(track: Track, totalLaps: number = 3) {
    this.track = track;
    this.state = {
      currentLap: 0,
      totalLaps,
      lapTimes: [],
      bestLap: null,
      currentLapStartTime: 0,
      isRaceStarted: false,
      isRaceFinished: false,
      lastStartLineCrossing: 0,
      hasCrossedStartLine: false,
    };

    this.initializeStartLine();
    this.loadBestLap();
  }

  /**
   * Initialize start line detection zone from track data
   */
  private initializeStartLine(): void {
    const startLineZones = this.track
      .getZones()
      .filter(zone => zone.type === 'startLine');

    if (startLineZones.length > 0) {
      const startLineZone = startLineZones[0];
      if (startLineZone && startLineZone.geometry.type === 'rectangle') {
        const points = startLineZone.geometry.points;
        const width = startLineZone.geometry.width || 0;
        const height = startLineZone.geometry.height || 0;

        if (points.length > 0) {
          this.startLineZone = {
            id: startLineZone.id,
            position: { x: points[0].x, y: points[0].y },
            width,
            height,
            direction: this.calculateStartLineDirection(startLineZone),
          };
        }
      }
    }

    // Fallback: create a default start line at the track start position
    if (!this.startLineZone) {
      const startPos = this.track.getStartPosition();
      this.startLineZone = {
        id: 'default_start_line',
        position: { x: startPos.x - 25, y: startPos.y - 5 },
        width: 50,
        height: 10,
        direction: { x: 1, y: 0 }, // Default forward direction
      };
    }
  }

  /**
   * Calculate the forward direction vector for the start line
   */
  private calculateStartLineDirection(): {
    x: number;
    y: number;
  } {
    // For now, use a default direction based on track start angle
    const startAngle = this.track.getStartPosition().angle;
    return {
      x: Math.cos(startAngle),
      y: Math.sin(startAngle),
    };
  }

  /**
   * Update lap system with current car state
   */
  update(car: CarModel): void {
    if (!this.startLineZone) return;

    const carState = car.getState();
    const currentTime = Date.now();

    // Check for start line crossing
    if (this.isCarCrossingStartLine(carState)) {
      this.handleStartLineCrossing(carState, currentTime);
    }
  }

  /**
   * Check if car is crossing the start line
   */
  private isCarCrossingStartLine(carState: CarPhysicsState): boolean {
    if (!this.startLineZone) return false;

    const { position } = carState;
    const { x, y } = position;
    const { position: linePos, width, height } = this.startLineZone;

    // Check if car is within the start line zone
    const isInZone =
      x >= linePos.x &&
      x <= linePos.x + width &&
      y >= linePos.y &&
      y <= linePos.y + height;

    return isInZone;
  }

  /**
   * Handle start line crossing detection
   */
  private handleStartLineCrossing(
    carState: CarPhysicsState,
    currentTime: number
  ): void {
    const { velocity } = carState;
    const { direction } = this.startLineZone!;

    // Calculate car's movement direction
    const carDirection = {
      x: velocity.x,
      y: velocity.y,
    };

    // Normalize car direction
    const speed = Math.sqrt(
      carDirection.x * carDirection.x + carDirection.y * carDirection.y
    );
    if (speed < 0.1) return; // Car is too slow to determine direction

    const normalizedCarDirection = {
      x: carDirection.x / speed,
      y: carDirection.y / speed,
    };

    // Calculate dot product to determine if moving forward
    const dotProduct =
      normalizedCarDirection.x * direction.x +
      normalizedCarDirection.y * direction.y;
    const isForward = dotProduct > 0.3; // Threshold for forward movement

    // Cooldown to prevent multiple rapid crossings
    if (
      currentTime - this.state.lastStartLineCrossing <
      this.START_LINE_CROSSING_COOLDOWN
    ) {
      return;
    }

    this.state.lastStartLineCrossing = currentTime;

    // Trigger event
    this.events.onStartLineCross?.(isForward);

    if (isForward) {
      this.handleForwardCrossing(currentTime);
    }
  }

  /**
   * Handle forward crossing of start line
   */
  private handleForwardCrossing(currentTime: number): void {
    if (!this.state.isRaceStarted) {
      // First crossing - start the race
      this.startRace(currentTime);
      return;
    }

    if (this.state.isRaceFinished) {
      return; // Race is already finished
    }

    // Check if this is a valid lap completion
    if (this.state.hasCrossedStartLine && this.state.currentLapStartTime > 0) {
      const lapTime = currentTime - this.state.currentLapStartTime;

      if (lapTime >= this.MIN_LAP_TIME) {
        this.completeLap(lapTime, currentTime);
      }
    }

    // Start new lap
    this.state.currentLapStartTime = currentTime;
    this.state.hasCrossedStartLine = true;
  }

  /**
   * Start the race
   */
  private startRace(currentTime: number): void {
    this.state.isRaceStarted = true;
    this.state.currentLap = 1;
    this.state.currentLapStartTime = currentTime;
    this.state.hasCrossedStartLine = true;
    this.events.onRaceStart?.();
  }

  /**
   * Complete a lap
   */
  private completeLap(lapTime: number, timestamp: number): void {
    const lapTimeData: LapTime = {
      lapNumber: this.state.currentLap,
      time: lapTime,
      timestamp,
      isBestLap: false,
    };

    // Check if this is a new best lap
    if (!this.state.bestLap || lapTime < this.state.bestLap.time) {
      lapTimeData.isBestLap = true;
      this.state.bestLap = lapTimeData;
      this.saveBestLap(lapTimeData);
      this.events.onBestLap?.(lapTimeData);
    }

    this.state.lapTimes.push(lapTimeData);
    this.state.currentLap++;

    this.events.onLapComplete?.(lapTimeData);

    // Check if race is finished
    if (this.state.currentLap > this.state.totalLaps) {
      this.finishRace();
    }
  }

  /**
   * Finish the race
   */
  private finishRace(): void {
    this.state.isRaceFinished = true;
    this.events.onRaceFinish?.();
  }

  /**
   * Save best lap to AsyncStorage
   */
  private async saveBestLap(lapTime: LapTime): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(lapTime));
    } catch (error) {
      console.error('Failed to save best lap:', error);
    }
  }

  /**
   * Load best lap from AsyncStorage
   */
  private async loadBestLap(): Promise<void> {
    try {
      const savedBestLap = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (savedBestLap) {
        this.state.bestLap = JSON.parse(savedBestLap);
      }
    } catch (error) {
      console.error('Failed to load best lap:', error);
    }
  }

  /**
   * Reset lap system for new race
   */
  reset(): void {
    this.state = {
      currentLap: 0,
      totalLaps: this.state.totalLaps,
      lapTimes: [],
      bestLap: this.state.bestLap, // Keep best lap from previous races
      currentLapStartTime: 0,
      isRaceStarted: false,
      isRaceFinished: false,
      lastStartLineCrossing: 0,
      hasCrossedStartLine: false,
    };
  }

  /**
   * Set event handlers
   */
  setEvents(events: Partial<LapSystemEvents>): void {
    this.events = { ...this.events, ...events };
  }

  /**
   * Get current lap system state
   */
  getState(): LapSystemState {
    return { ...this.state };
  }

  /**
   * Get current lap time (time elapsed since current lap started)
   */
  getCurrentLapTime(): number {
    if (!this.state.isRaceStarted || this.state.currentLapStartTime === 0) {
      return 0;
    }
    return Date.now() - this.state.currentLapStartTime;
  }

  /**
   * Get formatted current lap time
   */
  getFormattedCurrentLapTime(): string {
    return this.formatTime(this.getCurrentLapTime());
  }

  /**
   * Get formatted lap time
   */
  getFormattedLapTime(lapTime: number): string {
    return this.formatTime(lapTime);
  }

  /**
   * Format time in milliseconds to MM:SS.mmm format
   */
  private formatTime(timeMs: number): string {
    const totalSeconds = Math.floor(timeMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((timeMs % 1000) / 10);

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  }

  /**
   * Get race progress percentage
   */
  getRaceProgress(): number {
    if (this.state.totalLaps === 0) return 0;
    return Math.min((this.state.currentLap / this.state.totalLaps) * 100, 100);
  }

  /**
   * Get average lap time
   */
  getAverageLapTime(): number {
    if (this.state.lapTimes.length === 0) return 0;

    const totalTime = this.state.lapTimes.reduce(
      (sum, lap) => sum + lap.time,
      0
    );
    return totalTime / this.state.lapTimes.length;
  }

  /**
   * Get formatted average lap time
   */
  getFormattedAverageLapTime(): string {
    return this.formatTime(this.getAverageLapTime());
  }

  /**
   * Check if car is currently on the start line
   */
  isOnStartLine(carState: CarPhysicsState): boolean {
    return this.isCarCrossingStartLine(carState);
  }

  /**
   * Get start line zone information
   */
  getStartLineZone(): StartLineZone | null {
    return this.startLineZone ? { ...this.startLineZone } : null;
  }

  /**
   * Update total laps for the race
   */
  setTotalLaps(totalLaps: number): void {
    this.state.totalLaps = totalLaps;
  }

  /**
   * Get race statistics
   */
  getRaceStats(): {
    totalLaps: number;
    completedLaps: number;
    remainingLaps: number;
    bestLap: LapTime | null;
    averageLapTime: number;
    totalRaceTime: number;
    isRaceFinished: boolean;
  } {
    const completedLaps = this.state.lapTimes.length;
    const totalRaceTime = this.state.lapTimes.reduce(
      (sum, lap) => sum + lap.time,
      0
    );

    return {
      totalLaps: this.state.totalLaps,
      completedLaps,
      remainingLaps: Math.max(0, this.state.totalLaps - completedLaps),
      bestLap: this.state.bestLap,
      averageLapTime: this.getAverageLapTime(),
      totalRaceTime,
      isRaceFinished: this.state.isRaceFinished,
    };
  }
}

// Helper function to create a lap system with default settings
export const createLapSystem = (
  track: Track,
  totalLaps: number = 3,
  events?: Partial<LapSystemEvents>
): LapSystem => {
  const lapSystem = new LapSystem(track, totalLaps);
  if (events) {
    lapSystem.setEvents(events);
  }
  return lapSystem;
};

// Helper function to format time for display
export const formatLapTime = (timeMs: number): string => {
  const totalSeconds = Math.floor(timeMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = Math.floor((timeMs % 1000) / 10);

  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
};

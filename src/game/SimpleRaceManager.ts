/**
 * Simple Race Manager
 * 
 * A working race manager that actually moves cars when the race starts
 */

import { SimpleCar, SimpleCarInputs } from './SimpleCarMovement';
import { controlsRef } from './input/InputManager';
import { createRaceTrack } from './track/TrackDesign';
import { useGameStore } from './store/GameStore';

export interface SimpleRaceState {
  playerCar: SimpleCar;
  aiCars: SimpleCar[];
  raceStarted: boolean;
  raceTime: number;
  playerPosition: { x: number; y: number };
  aiPositions: Array<{ x: number; y: number }>;
  countdown: number; // 3, 2, 1, 0 (GO)
  countdownActive: boolean;
  // Lap system
  currentLap: number;
  totalLaps: number;
  lapTimes: Array<{ lapNumber: number; time: number; timestamp: number }>;
  bestLapTime: number;
  lastStartLineCrossing: number;
  hasCrossedStartLine: boolean;
  currentLapStartTime: number;
  lastLapStartTime: number;
  // Pause system
  isPaused: boolean;
  pauseTime: number;
  // Position system
  carPositions: Array<{
    carId: string;
    position: number;
    progress: number;
    lapProgress: number;
  }>;
}

export class SimpleRaceManager {
  private state: SimpleRaceState;
  private lastLogTime: number = 0;
  private track = createRaceTrack();

  constructor() {
    // Create player car at start line (straight track)
    const playerCar = new SimpleCar({ x: 50, y: 150 }, 0);
    
    // Create AI cars at different positions on the track (5 AI cars total)
    const aiCars = [
      new SimpleCar({ x: 80, y: 150 }, 0),
      new SimpleCar({ x: 110, y: 150 }, 0),
      new SimpleCar({ x: 140, y: 150 }, 0),
      new SimpleCar({ x: 170, y: 150 }, 0),
      new SimpleCar({ x: 200, y: 150 }, 0),
    ];

    this.state = {
      playerCar,
      aiCars,
      raceStarted: false, // Don't start race immediately
      raceTime: 0,
      playerPosition: { x: 50, y: 150 },
      aiPositions: [
        { x: 80, y: 150 },
        { x: 110, y: 150 },
        { x: 140, y: 150 },
        { x: 170, y: 150 },
        { x: 200, y: 150 },
      ],
      countdown: 3, // Start countdown at 3
      countdownActive: true, // Countdown is active
      // Lap system initialization
      currentLap: 0,
      totalLaps: 3,
      lapTimes: [],
      bestLapTime: 0,
      lastStartLineCrossing: 0,
      hasCrossedStartLine: false,
      currentLapStartTime: 0,
      lastLapStartTime: 0,
      // Pause system initialization
      isPaused: false,
      pauseTime: 0,
      // Position system initialization
      carPositions: [],
    };

    console.log('🏁 SimpleRaceManager: Created with', aiCars.length, 'AI cars');
    console.log('🏁 SimpleRaceManager: Race started by default:', this.state.raceStarted);
  }

  /**
   * Start the race (starts countdown)
   */
  startRace(): void {
    console.log('🏁 SimpleRaceManager: startRace() called');
    console.log('🏁 SimpleRaceManager: Starting countdown...');
    
    this.state.countdownActive = true;
    this.state.countdown = 3;
    this.state.raceStarted = false; // Don't start race until countdown finishes
    this.state.raceTime = 0;
    
    // Initialize GameStore with correct maxSpeed
    const carConfig = this.state.playerCar.getConfig();
    const gameStore = useGameStore.getState();
    gameStore.setCarMaxSpeed(carConfig.maxSpeed);
    console.log('🔊 SimpleRaceManager: Initialized GameStore maxSpeed to:', carConfig.maxSpeed);
    
    console.log('🏁 SimpleRaceManager: Countdown started at 3');
  }

  /**
   * Stop the race
   */
  stopRace(): void {
    this.state.raceStarted = false;
    console.log('🏁 SimpleRaceManager: Race stopped!');
  }

  /**
   * Reset the race
   */
  resetRace(): void {
    this.state.raceStarted = false;
    this.state.raceTime = 0;
    this.state.countdown = 3;
    this.state.countdownActive = true;
    
    // Reset lap system
    this.state.currentLap = 0;
    this.state.lapTimes = [];
    this.state.bestLapTime = 0;
    this.state.lastStartLineCrossing = 0;
    this.state.hasCrossedStartLine = false;
    this.state.currentLapStartTime = 0;
    this.state.lastLapStartTime = 0;
    
    // Reset pause system
    this.state.isPaused = false;
    this.state.pauseTime = 0;
    
    // Reset player car to start line (straight track)
    this.state.playerCar.resetToStart({ x: 50, y: 150 }, 0);
    
    // Reset AI cars to different positions on track
    this.state.aiCars.forEach((car, index) => {
      const positions = [
        { x: 80, y: 150 },
        { x: 110, y: 150 },
        { x: 140, y: 150 },
        { x: 170, y: 150 },
        { x: 200, y: 150 },
      ];
      car.resetToStart(positions[index], 0);
    });

    console.log('🏁 SimpleRaceManager: Race reset! Countdown restarted at 3, lap system reset');
  }

  /**
   * Pause the race
   */
  pauseRace(): void {
    if (!this.state.isPaused) {
      this.state.isPaused = true;
      this.state.pauseTime = Date.now();
      console.log('⏸️ SimpleRaceManager: Race paused');
    }
  }

  /**
   * Resume the race
   */
  resumeRace(): void {
    if (this.state.isPaused) {
      this.state.isPaused = false;
      const pauseDuration = Date.now() - this.state.pauseTime;
      console.log('▶️ SimpleRaceManager: Race resumed after', pauseDuration, 'ms pause');
    }
  }

  /**
   * Toggle pause state
   */
  togglePause(): void {
    if (this.state.isPaused) {
      this.resumeRace();
    } else {
      this.pauseRace();
    }
  }

  /**
   * Check if race is paused
   */
  isRacePaused(): boolean {
    return this.state.isPaused;
  }

  /**
   * Calculate car positions based on progress
   */
  private calculateCarPositions(): void {
    const cars = [
      { id: 'player', car: this.state.playerCar, position: this.state.playerPosition },
      ...this.state.aiCars.map((car, index) => ({
        id: `ai_${index}`,
        car,
        position: this.state.aiPositions[index]
      }))
    ];

    // Calculate progress for each car
    const carProgress = cars.map(({ id, car, position }) => {
      const carState = car.getState();
      const progress = this.calculateCarProgress(carState.x, carState.y);
      const lapProgress = this.calculateLapProgress(carState.x, carState.y);
      
      return {
        carId: id,
        position: 0, // Will be calculated below
        progress,
        lapProgress
      };
    });

    // Sort by progress (highest first)
    carProgress.sort((a, b) => b.progress - a.progress);

    // Assign positions
    carProgress.forEach((car, index) => {
      car.position = index + 1;
    });

    // Update state
    this.state.carPositions = carProgress;

    console.log('🏁 SimpleRaceManager: Car positions updated:', carProgress.map(c => `${c.carId}: ${c.position} (${c.progress.toFixed(1)})`));
  }

  /**
   * Calculate car progress along the track
   */
  private calculateCarProgress(x: number, y: number): number {
    // For straight track, progress is simply the X position
    // Track length is 5000px, so progress is x / 5000
    const trackLength = 5000;
    const progress = Math.max(0, Math.min(1, x / trackLength));
    return progress;
  }

  /**
   * Calculate lap progress (0-1 within current lap)
   */
  private calculateLapProgress(x: number, y: number): number {
    // For straight track, lap progress is X position within the track
    const trackLength = 5000;
    const lapProgress = Math.max(0, Math.min(1, x / trackLength));
    return lapProgress;
  }

  /**
   * Get player position (1st, 2nd, 3rd, etc.)
   */
  getPlayerPosition(): number {
    const playerPosition = this.state.carPositions.find(car => car.carId === 'player');
    return playerPosition ? playerPosition.position : 1;
  }

  /**
   * Get total number of cars
   */
  getTotalCars(): number {
    return this.state.carPositions.length;
  }

  /**
   * Check if car is crossing the start line
   */
  private isCarCrossingStartLine(car: SimpleCar): boolean {
    const carState = car.getState();
    const { x, y } = carState;
    
    // Start line coordinates from track design
    const startLine = this.track.startLine;
    const startLineX1 = startLine.x1;
    const startLineX2 = startLine.x2;
    const startLineY = startLine.y1;
    
    // Create a larger detection zone for more reliable detection
    const tolerance = 50; // Increased from 20 to 50 for better detection
    const isInStartLineZone = 
      x >= Math.min(startLineX1, startLineX2) - tolerance &&
      x <= Math.max(startLineX1, startLineX2) + tolerance &&
      y >= startLineY - tolerance &&
      y <= startLineY + tolerance;
    
    if (isInStartLineZone) {
      console.log('🏁 SimpleRaceManager: Car in start line zone at', x.toFixed(1), y.toFixed(1), 'start line:', startLineX1, '-', startLineX2, 'at Y:', startLineY);
    }
    
    return isInStartLineZone;
  }

  /**
   * Check if car is moving forward across start line
   */
  private isMovingForward(car: SimpleCar): boolean {
    const carState = car.getState();
    const { vx, vy } = carState;
    
    // Calculate speed
    const speed = Math.sqrt(vx * vx + vy * vy);
    
    // Car must be moving at reasonable speed (reduced from 2.0 to 1.0 for easier detection)
    if (speed < 1.0) {
      console.log('🏁 SimpleRaceManager: Car too slow for lap detection, speed:', speed.toFixed(2));
      return false;
    }
    
    // More flexible forward detection - check if car is moving in positive X direction
    // This works for our track design where start line is horizontal
    const isMovingForward = vx > 0.3; // Reduced threshold from 0.5 to 0.3
    
    if (isMovingForward) {
      console.log('🏁 SimpleRaceManager: Car moving forward, vx:', vx.toFixed(2), 'vy:', vy.toFixed(2), 'speed:', speed.toFixed(2));
    } else {
      console.log('🏁 SimpleRaceManager: Car not moving forward, vx:', vx.toFixed(2), 'vy:', vy.toFixed(2), 'speed:', speed.toFixed(2));
    }
    
    return isMovingForward;
  }

  /**
   * Handle start line crossing
   */
  private handleStartLineCrossing(): void {
    const currentTime = Date.now();
    
    // Cooldown to prevent multiple rapid crossings (increased to 3 seconds)
    const cooldown = 3000; // 3 seconds
    if (currentTime - this.state.lastStartLineCrossing < cooldown) {
      console.log('🏁 SimpleRaceManager: Start line crossing on cooldown, time since last:', (currentTime - this.state.lastStartLineCrossing), 'ms');
      return;
    }
    
    console.log('🏁 SimpleRaceManager: Start line crossing detected!');
    this.state.lastStartLineCrossing = currentTime;
    
    // Check if this is the first crossing (race start)
    if (!this.state.hasCrossedStartLine) {
      this.state.hasCrossedStartLine = true;
      this.state.currentLap = 1;
      this.state.currentLapStartTime = currentTime;
      this.state.lastLapStartTime = currentTime;
      console.log('🏁 SimpleRaceManager: First start line crossing - Lap 1 started!');
      return;
    }
    
    // Complete current lap
    if (this.state.currentLap > 0 && this.state.currentLapStartTime > 0) {
      const lapTime = currentTime - this.state.currentLapStartTime;
      
      // Minimum lap time validation (5 seconds minimum)
      const minLapTime = 5000; // 5 seconds
      if (lapTime < minLapTime) {
        console.log('🏁 SimpleRaceManager: Lap too short, ignoring. Time:', this.formatTime(lapTime), 'minimum:', this.formatTime(minLapTime));
        return;
      }
      
      const lapData = {
        lapNumber: this.state.currentLap,
        time: lapTime,
        timestamp: currentTime
      };
      
      this.state.lapTimes.push(lapData);
      
      // Check for best lap
      if (this.state.bestLapTime === 0 || lapTime < this.state.bestLapTime) {
        this.state.bestLapTime = lapTime;
        console.log('🏁 SimpleRaceManager: New best lap time:', this.formatTime(lapTime));
      }
      
      console.log('🏁 SimpleRaceManager: Lap', this.state.currentLap, 'completed in', this.formatTime(lapTime));
      
      // Move to next lap
      this.state.currentLap++;
      this.state.currentLapStartTime = currentTime;
      
      // Check if race is finished
      if (this.state.currentLap > this.state.totalLaps) {
        console.log('🏁 SimpleRaceManager: Race finished! Total laps:', this.state.totalLaps);
        this.state.raceStarted = false; // Stop the race
      } else {
        console.log('🏁 SimpleRaceManager: Starting lap', this.state.currentLap, 'of', this.state.totalLaps);
      }
    }
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
   * Update the race (required by game loop)
   */
  update(deltaTime: number): void {
    // Don't update if race is paused
    if (this.state.isPaused) {
      console.log('⏸️ SimpleRaceManager: Race is paused, skipping update');
      return;
    }

    const currentTime = Date.now();
    const shouldLog = currentTime - this.lastLogTime > 1000; // Log every 1 second for more frequent updates

    // ALWAYS log race state for debugging
    console.log('🏁 SimpleRaceManager: Update called - raceStarted:', this.state.raceStarted, 'countdownActive:', this.state.countdownActive, 'countdown:', this.state.countdown, 'deltaTime:', deltaTime.toFixed(3));

    // Handle countdown
    if (this.state.countdownActive) {
      this.state.countdown -= deltaTime;
      console.log('🏁 SimpleRaceManager: Countdown at:', this.state.countdown.toFixed(1));
      
      if (this.state.countdown <= 0) {
        this.state.countdownActive = false;
        this.state.raceStarted = true;
        console.log('🏁 SimpleRaceManager: GO! Race started!');
      } else {
        console.log('🏁 SimpleRaceManager: Countdown active, cars cannot move yet');
        return; // Don't update cars during countdown
      }
    }

    if (!this.state.raceStarted) {
        console.log('🏁 SimpleRaceManager: Race not started, skipping update');
      console.log('🏁 SimpleRaceManager: Race state:', this.state.raceStarted);
      return;
    }

    if (shouldLog) {
      console.log('🏁 SimpleRaceManager: Updating race, time:', this.state.raceTime.toFixed(1));
      this.lastLogTime = currentTime;
    }

    // Update race time
    this.state.raceTime += deltaTime;

    // Get player controls with detailed logging
    const playerControls = controlsRef.current;
    console.log('🏁 SimpleRaceManager: Raw controls from controlsRef:', playerControls);
    
    const playerInputs: SimpleCarInputs = {
      steer: playerControls.steer,
      throttle: playerControls.throttle,
      brake: playerControls.brake,
    };

    // ALWAYS log player inputs for debugging
    console.log('🏁 SimpleRaceManager: Player inputs:', playerInputs);

    // Log player car state before update
    const playerStateBefore = this.state.playerCar.getState();
    console.log('🏁 SimpleRaceManager: Player car state BEFORE update:', playerStateBefore);

    // Update player car
    this.state.playerCar.update(deltaTime, playerInputs);
    const playerState = this.state.playerCar.getState();
    this.state.playerPosition = { x: playerState.x, y: playerState.y };

    // Sync player car state with GameStore for audio system
    this.syncPlayerCarWithGameStore(playerState);

    // Check for start line crossing
    if (this.isCarCrossingStartLine(this.state.playerCar) && this.isMovingForward(this.state.playerCar)) {
      this.handleStartLineCrossing();
    }

    // Log player car state after update
    console.log('🏁 SimpleRaceManager: Player car state AFTER update:', playerState);
    console.log('🏁 SimpleRaceManager: Player position updated to:', this.state.playerPosition);
    console.log('🏁 SimpleRaceManager: Lap info - current:', this.state.currentLap, 'total:', this.state.totalLaps, 'best time:', this.state.bestLapTime > 0 ? this.formatTime(this.state.bestLapTime) : 'N/A');

    // Update AI cars with simple AI behavior
    this.state.aiCars.forEach((aiCar, index) => {
      const aiStateBefore = aiCar.getState();
      console.log(`🏁 SimpleRaceManager: AI car ${index} state BEFORE update:`, aiStateBefore);
      
      const aiInputs = this.generateAIInputs(aiCar, index);
      console.log(`🏁 SimpleRaceManager: AI car ${index} inputs:`, aiInputs);
      
      aiCar.update(deltaTime, aiInputs);
      const aiState = aiCar.getState();
      this.state.aiPositions[index] = { x: aiState.x, y: aiState.y };
      
      console.log(`🏁 SimpleRaceManager: AI car ${index} state AFTER update:`, aiState);
      console.log(`🏁 SimpleRaceManager: AI car ${index} position updated to:`, this.state.aiPositions[index]);
    });

    // Calculate car positions
    this.calculateCarPositions();

    // ALWAYS log final positions
    console.log('🏁 SimpleRaceManager: Final player position:', this.state.playerPosition);
    console.log('🏁 SimpleRaceManager: Final AI positions:', this.state.aiPositions);
  }

  /**
   * Generate AI inputs for a car to follow the track
   */
  private generateAIInputs(aiCar: SimpleCar, index: number): SimpleCarInputs {
    const carState = aiCar.getState();
    
    // Define a simple racing line for the wider and longer straight track
    const racingLine = [
      { x: 50, y: 150 }, // Start line
      { x: 500, y: 150 }, // First checkpoint
      { x: 1000, y: 150 }, // Second checkpoint
      { x: 1500, y: 150 }, // Third checkpoint
      { x: 2000, y: 150 }, // Fourth checkpoint
      { x: 2500, y: 150 }, // Fifth checkpoint
      { x: 3000, y: 150 }, // Sixth checkpoint
      { x: 3500, y: 150 }, // Seventh checkpoint
      { x: 4000, y: 150 }, // Eighth checkpoint
      { x: 4500, y: 150 }, // Ninth checkpoint
      { x: 4950, y: 150 }, // End of track
      { x: 50, y: 150 }, // Back to start (for lap completion)
    ];
    
    // Find the closest waypoint to the car
    let closestIndex = 0;
    let closestDistance = Infinity;
    
    for (let i = 0; i < racingLine.length; i++) {
      const waypoint = racingLine[i];
      const dx = waypoint.x - carState.x;
      const dy = waypoint.y - carState.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = i;
      }
    }
    
    // Target the next waypoint in the racing line with some variation
    const targetIndex = (closestIndex + 1) % racingLine.length;
    const baseTarget = racingLine[targetIndex];
    
    // Add some variation to make AI cars take different lines
    const variation = (index - 1) * 10; // Each AI car gets a different offset
    const target = {
      x: baseTarget.x + variation,
      y: baseTarget.y + variation * 0.5
    };
    
    // Calculate direction to target
    const dx = target.x - carState.x;
    const dy = target.y - carState.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < 15) {
      // Close to target, slow down slightly
      return { steer: 0, throttle: 0.6, brake: 0 };
    }
    
    // Calculate steering to face the target
    const targetAngle = Math.atan2(dy, dx);
    const angleDiff = this.normalizeAngle(targetAngle - carState.angle);
    const steer = Math.max(-1, Math.min(1, angleDiff * 1.5)); // Reduced steering sensitivity
    
    // Calculate throttle based on distance and current speed
    const currentSpeed = carState.speed;
    const maxSpeed = 10.0; // Reduced AI speed for better control
    const throttle = currentSpeed < maxSpeed ? 0.6 : 0.3; // Reduced throttle for smoother movement
    
    return { steer, throttle, brake: 0 };
  }

  /**
   * Normalize angle to [-π, π]
   */
  private normalizeAngle(angle: number): number {
    while (angle > Math.PI) angle -= 2 * Math.PI;
    while (angle < -Math.PI) angle += 2 * Math.PI;
    return angle;
  }

  /**
   * Get race state
   */
  getState(): SimpleRaceState {
    return { ...this.state };
  }

  /**
   * Get player car
   */
  getPlayerCar(): SimpleCar {
    return this.state.playerCar;
  }

  /**
   * Get AI cars
   */
  getAICars(): SimpleCar[] {
    return this.state.aiCars;
  }

  /**
   * Get player position
   */
  getPlayerPosition(): { x: number; y: number } {
    return this.state.playerPosition;
  }

  /**
   * Get AI positions
   */
  getAIPositions(): Array<{ x: number; y: number }> {
    return this.state.aiPositions;
  }

  /**
   * Check if race is started
   */
  isRaceStarted(): boolean {
    return this.state.raceStarted;
  }

  /**
   * Get race time
   */
  getRaceTime(): number {
    return this.state.raceTime;
  }

  /**
   * Get countdown value
   */
  getCountdown(): number {
    return this.state.countdown;
  }

  /**
   * Check if countdown is active
   */
  isCountdownActive(): boolean {
    return this.state.countdownActive;
  }

  /**
   * Get lap information
   */
  getLapInfo(): {
    currentLap: number;
    totalLaps: number;
    lapTimes: Array<{ lapNumber: number; time: number; timestamp: number }>;
    bestLapTime: number;
    isRaceFinished: boolean;
  } {
    return {
      currentLap: this.state.currentLap,
      totalLaps: this.state.totalLaps,
      lapTimes: this.state.lapTimes,
      bestLapTime: this.state.bestLapTime,
      isRaceFinished: this.state.currentLap > this.state.totalLaps
    };
  }

  /**
   * Get formatted best lap time
   */
  getFormattedBestLapTime(): string {
    return this.state.bestLapTime > 0 ? this.formatTime(this.state.bestLapTime) : 'N/A';
  }

  /**
   * Get race progress percentage
   */
  getRaceProgress(): number {
    if (this.state.totalLaps === 0) return 0;
    return Math.min((this.state.currentLap / this.state.totalLaps) * 100, 100);
  }

  /**
   * Get current lap time (time elapsed since current lap started)
   */
  getCurrentLapTime(): number {
    if (this.state.currentLapStartTime === 0) return 0;
    return Date.now() - this.state.currentLapStartTime;
  }

  /**
   * Get formatted current lap time
   */
  getFormattedCurrentLapTime(): string {
    return this.formatTime(this.getCurrentLapTime());
  }

  /**
   * Sync player car state with GameStore for audio system
   */
  private syncPlayerCarWithGameStore(playerState: any): void {
    try {
      const gameStore = useGameStore.getState();
      
      // Update GameStore with current car state
      gameStore.setCarPosition(playerState.x, playerState.y);
      gameStore.setCarVelocity(playerState.vx, playerState.vy);
      gameStore.setCarAngle(playerState.angle);
      
      // Update maxSpeed in GameStore (get from SimpleCar config)
      const carConfig = this.state.playerCar.getConfig();
      const currentCarState = gameStore.car;
      if (currentCarState.maxSpeed !== carConfig.maxSpeed) {
        gameStore.setCarMaxSpeed(carConfig.maxSpeed);
        console.log('🔊 SimpleRaceManager: Updated maxSpeed to:', carConfig.maxSpeed);
      }
      
      console.log('🔊 SimpleRaceManager: Synced car state with GameStore - position:', playerState.x.toFixed(1), playerState.y.toFixed(1), 'speed:', playerState.speed.toFixed(2));
    } catch (error) {
      console.error('❌ SimpleRaceManager: Failed to sync car state with GameStore:', error);
    }
  }

  /**
   * Get comprehensive lap information for HUD
   */
  getLapHUDData(): {
    currentLap: number;
    totalLaps: number;
    currentLapTime: number;
    currentLapTimeFormatted: string;
    bestLapTime: number;
    bestLapTimeFormatted: string;
    lastLapTime: number;
    lastLapTimeFormatted: string;
    isNewBestLap: boolean;
    raceProgress: number;
    playerPosition: number;
    totalCars: number;
  } {
    const currentLapTime = this.getCurrentLapTime();
    const lastLapTime = this.state.lapTimes.length > 0 
      ? this.state.lapTimes[this.state.lapTimes.length - 1].time 
      : 0;
    
    const isNewBestLap = this.state.bestLapTime > 0 && 
      currentLapTime > 0 && 
      currentLapTime < this.state.bestLapTime;

    return {
      currentLap: this.state.currentLap,
      totalLaps: this.state.totalLaps,
      currentLapTime,
      currentLapTimeFormatted: this.formatTime(currentLapTime),
      bestLapTime: this.state.bestLapTime,
      bestLapTimeFormatted: this.state.bestLapTime > 0 ? this.formatTime(this.state.bestLapTime) : '--:--.---',
      lastLapTime,
      lastLapTimeFormatted: lastLapTime > 0 ? this.formatTime(lastLapTime) : '--:--.---',
      isNewBestLap,
      raceProgress: this.getRaceProgress(),
      playerPosition: this.getPlayerPosition(),
      totalCars: this.getTotalCars()
    };
  }
}

// Singleton instance
let simpleRaceManager: SimpleRaceManager | null = null;

export const getSimpleRaceManager = (): SimpleRaceManager => {
  if (!simpleRaceManager) {
    simpleRaceManager = new SimpleRaceManager();
  }
  return simpleRaceManager;
};

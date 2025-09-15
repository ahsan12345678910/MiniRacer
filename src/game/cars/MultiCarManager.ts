import { CarState, CarInputs, updateCar, SURFACE_TYPES } from '../physics/CarModel';
import { AICar, AICarState } from './AICar';
import { CarConfig, CAR_TYPES, getAllAICars } from './CarTypes';

export interface MultiCarState {
  playerCar: CarState;
  aiCars: AICarState[];
  racePositions: Array<{ carId: string; position: number; distance: number }>;
  raceStarted: boolean;
  raceTime: number;
}

export class MultiCarManager {
  private state: MultiCarState;
  private aiCars: AICar[] = [];
  private racingPath: Array<{ x: number; y: number }> = [];
  private startPositions: Array<{ x: number; y: number; angle: number }> = [];

  constructor() {
    this.state = {
      playerCar: {
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        angle: 0,
        speed: 0,
      },
      aiCars: [],
      racePositions: [],
      raceStarted: false,
      raceTime: 0,
    };
  }

  /**
   * Initialize the race with specified number of AI cars
   */
  initializeRace(
    playerStartX: number, 
    playerStartY: number, 
    playerStartAngle: number = 0,
    numAICars: number = 3
  ): void {
    // Initialize player car
    this.state.playerCar = {
      x: playerStartX,
      y: playerStartY,
      vx: 0,
      vy: 0,
      angle: playerStartAngle,
      speed: 0,
    };

    // Clear existing AI cars
    this.aiCars = [];
    this.state.aiCars = [];

    // Get AI car configurations
    const aiConfigs = getAllAICars();
    
    // Create AI cars
    for (let i = 0; i < Math.min(numAICars, aiConfigs.length); i++) {
      const config = aiConfigs[i];
      const startPos = this.getStartPosition(i + 1); // +1 because player is at position 0
      
      const aiCar = new AICar(config, startPos.x, startPos.y, startPos.angle);
      aiCar.setPath(this.racingPath);
      
      this.aiCars.push(aiCar);
      this.state.aiCars.push(aiCar.getState());
    }

    // Initialize race positions
    this.updateRacePositions();
    
    this.state.raceStarted = false;
    this.state.raceTime = 0;
  }

  /**
   * Set the racing path for all cars
   */
  setRacingPath(points: Array<{ x: number; y: number }>): void {
    this.racingPath = points;
    
    // Update path for all AI cars
    this.aiCars.forEach(aiCar => {
      aiCar.setPath(points);
    });
  }

  /**
   * Get start position for a car based on grid position
   */
  private getStartPosition(gridPosition: number): { x: number; y: number; angle: number } {
    if (this.startPositions.length > gridPosition) {
      return this.startPositions[gridPosition];
    }
    
    // Default grid positions (can be customized)
    const baseX = 200;
    const baseY = 300;
    const spacing = 50;
    
    const row = Math.floor(gridPosition / 2);
    const col = gridPosition % 2;
    
    return {
      x: baseX + col * spacing,
      y: baseY + row * spacing,
      angle: 0,
    };
  }

  /**
   * Set custom start positions
   */
  setStartPositions(positions: Array<{ x: number; y: number; angle: number }>): void {
    this.startPositions = positions;
  }

  /**
   * Update all cars
   */
  update(deltaTime: number, playerInputs: CarInputs, surfaceProperties: any): void {
    if (!this.state.raceStarted) {
      return;
    }

    // Update race time
    this.state.raceTime += deltaTime;

    // Update player car using the function-based approach
    updateCar(this.state.playerCar, playerInputs, surfaceProperties, [], deltaTime);

    // Update AI cars
    this.aiCars.forEach((aiCar, index) => {
      aiCar.update(deltaTime, surfaceProperties);
      this.state.aiCars[index] = aiCar.getState();
    });

    // Update race positions
    this.updateRacePositions();
  }

  /**
   * Update race positions based on car progress
   */
  private updateRacePositions(): void {
    const positions: Array<{ carId: string; position: number; distance: number }> = [];

    // Add player car
    const playerState = this.state.playerCar;
    positions.push({
      carId: 'player',
      position: 0,
      distance: this.calculateRaceProgress(playerState.x, playerState.y),
    });

    // Add AI cars
    this.state.aiCars.forEach((aiCarState, index) => {
      const carState = aiCarState.car;
      positions.push({
        carId: aiCarState.config.id,
        position: 0,
        distance: this.calculateRaceProgress(carState.x, carState.y),
      });
    });

    // Sort by distance (descending - furthest first)
    positions.sort((a, b) => b.distance - a.distance);

    // Assign positions
    positions.forEach((pos, index) => {
      pos.position = index + 1;
    });

    this.state.racePositions = positions;
  }

  /**
   * Calculate race progress (simplified - can be enhanced with checkpoints)
   */
  private calculateRaceProgress(x: number, y: number): number {
    // Simple distance-based progress (can be enhanced with lap system)
    return Math.sqrt(x * x + y * y);
  }

  /**
   * Start the race
   */
  startRace(): void {
    this.state.raceStarted = true;
    this.state.raceTime = 0;
  }

  /**
   * Stop the race
   */
  stopRace(): void {
    this.state.raceStarted = false;
  }

  /**
   * Reset all cars to start positions
   */
  resetRace(): void {
    // Reset player car
    const playerStart = this.getStartPosition(0);
    this.state.playerCar = {
      x: playerStart.x,
      y: playerStart.y,
      vx: 0,
      vy: 0,
      angle: playerStart.angle,
      speed: 0,
    };

    // Reset AI cars
    this.aiCars.forEach((aiCar, index) => {
      const startPos = this.getStartPosition(index + 1);
      aiCar.reset(startPos.x, startPos.y, startPos.angle);
      this.state.aiCars[index] = aiCar.getState();
    });

    this.state.raceStarted = false;
    this.state.raceTime = 0;
    this.updateRacePositions();
  }

  /**
   * Get current race state
   */
  getState(): MultiCarState {
    return { ...this.state };
  }

  /**
   * Get player car
   */
  getPlayerCar(): CarState {
    return this.state.playerCar;
  }

  /**
   * Get all AI cars
   */
  getAICars(): AICar[] {
    return [...this.aiCars];
  }

  /**
   * Get race positions
   */
  getRacePositions(): Array<{ carId: string; position: number; distance: number }> {
    return [...this.state.racePositions];
  }

  /**
   * Get car by ID
   */
  getCarById(carId: string): CarState | null {
    if (carId === 'player') {
      return this.state.playerCar;
    }

    const aiCar = this.aiCars.find(aiCar => aiCar.getState().config.id === carId);
    return aiCar ? aiCar.getCarState() : null;
  }

  /**
   * Get car configuration by ID
   */
  getCarConfig(carId: string): CarConfig | null {
    if (carId === 'player') {
      return CAR_TYPES.player;
    }

    const aiCar = this.aiCars.find(aiCar => aiCar.getState().config.id === carId);
    return aiCar ? aiCar.getState().config : null;
  }
}

import { CarState, CarInputs, updateCar, SURFACE_TYPES } from '../physics/CarModel';
import { CarConfig } from './CarTypes';

export interface AICarState {
  car: CarState;
  config: CarConfig;
  targetX: number;
  targetY: number;
  currentPathIndex: number;
  lastUpdateTime: number;
  isActive: boolean;
}

export class AICar {
  private state: AICarState;
  private pathPoints: Array<{ x: number; y: number }> = [];
  private pathIndex: number = 0;

  constructor(config: CarConfig, startX: number, startY: number, startAngle: number = 0) {
    this.state = {
      car: {
        x: startX,
        y: startY,
        vx: 0,
        vy: 0,
        angle: startAngle,
        speed: 0,
      },
      config,
      targetX: startX,
      targetY: startY,
      currentPathIndex: 0,
      lastUpdateTime: 0,
      isActive: true,
    };
  }

  /**
   * Set the racing path for the AI car
   */
  setPath(points: Array<{ x: number; y: number }>): void {
    this.pathPoints = points;
    this.pathIndex = 0;
  }

  /**
   * Update AI car behavior
   */
  update(deltaTime: number, surfaceProperties: any): void {
    if (!this.state.isActive || !this.state.config.aiEnabled) {
      return;
    }

    // Update target position based on path
    this.updateTargetPosition();

    // Calculate AI inputs based on target
    const inputs = this.calculateAIInputs();

    // Update car physics using the function-based approach
    updateCar(this.state.car, inputs, surfaceProperties, [], deltaTime);

    this.state.lastUpdateTime += deltaTime;
  }

  /**
   * Update target position based on racing path
   */
  private updateTargetPosition(): void {
    if (this.pathPoints.length === 0) {
      return;
    }

    const currentPos = { x: this.state.car.x, y: this.state.car.y };
    const targetPoint = this.pathPoints[this.pathIndex];
    
    // Check if we're close enough to the current target
    const distance = Math.sqrt(
      Math.pow(currentPos.x - targetPoint.x, 2) + 
      Math.pow(currentPos.y - targetPoint.y, 2)
    );

    if (distance < 30) { // 30 pixel threshold
      this.pathIndex = (this.pathIndex + 1) % this.pathPoints.length;
    }

    this.state.targetX = this.pathPoints[this.pathIndex].x;
    this.state.targetY = this.pathPoints[this.pathIndex].y;
  }

  /**
   * Calculate AI inputs based on target position and car state
   */
  private calculateAIInputs(): CarInputs {
    const carState = this.state.car;
    const dx = this.state.targetX - carState.x;
    const dy = this.state.targetY - carState.y;
    
    // Calculate desired angle
    const targetAngle = Math.atan2(dy, dx);
    const angleDiff = this.normalizeAngle(targetAngle - carState.angle);
    
    // Calculate steering input
    let steer = 0;
    if (Math.abs(angleDiff) > 0.1) {
      steer = Math.sign(angleDiff) * Math.min(Math.abs(angleDiff) * 2, 1);
    }

    // Calculate throttle/brake based on speed and distance to target
    const distance = Math.sqrt(dx * dx + dy * dy);
    const speed = Math.sqrt(carState.vx * carState.vx + carState.vy * carState.vy);
    
    let throttle = 0;
    let brake = 0;

    // AI speed factor
    const maxSpeed = 100 * this.state.config.aiSpeed;
    
    if (speed < maxSpeed && distance > 20) {
      throttle = 0.8 + (Math.random() - 0.5) * 0.4; // Add some randomness
    } else if (speed > maxSpeed * 1.2) {
      brake = 0.3;
    } else if (distance < 15) {
      throttle = 0.3; // Slow down when close to target
    }

    // Add some AI personality based on aggressiveness
    if (this.state.config.aiAggressiveness > 0.7) {
      throttle = Math.min(throttle * 1.2, 1);
      steer = steer * 1.1; // More aggressive steering
    } else if (this.state.config.aiAggressiveness < 0.4) {
      throttle = throttle * 0.8; // More conservative
      steer = steer * 0.9;
    }

    return {
      steer: Math.max(-1, Math.min(1, steer)),
      throttle: Math.max(0, Math.min(1, throttle)),
      brake: Math.max(0, Math.min(1, brake)),
    };
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
   * Get current car state
   */
  getState(): AICarState {
    return { ...this.state };
  }

  /**
   * Get car state for physics
   */
  getCarState(): CarState {
    return this.state.car;
  }

  /**
   * Set car position
   */
  setPosition(x: number, y: number, angle: number = 0): void {
    this.state.car = {
      x,
      y,
      vx: 0,
      vy: 0,
      angle,
      speed: 0,
    };
  }

  /**
   * Enable/disable AI
   */
  setActive(active: boolean): void {
    this.state.isActive = active;
  }

  /**
   * Reset AI car to start position
   */
  reset(startX: number, startY: number, startAngle: number = 0): void {
    this.state.car = {
      x: startX,
      y: startY,
      vx: 0,
      vy: 0,
      angle: startAngle,
      speed: 0,
    };
    this.pathIndex = 0;
    this.state.lastUpdateTime = 0;
  }
}

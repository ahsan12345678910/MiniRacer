type Vector2 = {
  x: number;
  y: number;
};

export type CarState = {
  position: Vector2;
  velocity: Vector2;
  angle: number;
  speed: number;
};

export type CarParams = {
  maxSpeed: number;
  accel: number;
  brakePower: number;
  friction: number;
  turnRate: number;
};

export type CarControls = {
  throttle: number;
  brake: number;
  steer: number;
};

export type SurfaceType = 'track' | 'grass' | 'ice';

export type SurfacePhysics = {
  grip: number;
  dragMultiplier: number;
};

export const SURFACE_PRESETS: Record<SurfaceType, SurfacePhysics> = {
  track: { grip: 1, dragMultiplier: 1 },
  grass: { grip: 0.65, dragMultiplier: 1.35 },
  ice: { grip: 0.35, dragMultiplier: 0.6 },
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export class CarModel {
  private state: CarState;
  private readonly params: CarParams;

  constructor(initialState: CarState, params: CarParams) {
    this.state = { ...initialState };
    this.params = params;
  }

  getState(): CarState {
    return { ...this.state };
  }

  setState(nextState: CarState) {
    this.state = { ...nextState };
  }

  update(dt: number, controls: CarControls, surface: SurfacePhysics): CarState {
    const throttle = clamp(controls.throttle, 0, 1);
    const brake = clamp(controls.brake, 0, 1);
    const steer = clamp(controls.steer, -1, 1);

    const frictionForce = this.params.friction * surface.dragMultiplier;
    const accelForce = this.params.accel * throttle;
    const brakeForce = this.params.brakePower * brake;

    let speed =
      this.state.speed + (accelForce - brakeForce - frictionForce * this.state.speed) * dt;
    speed = clamp(speed, 0, this.params.maxSpeed);

    const steeringScale = speed / Math.max(this.params.maxSpeed, 0.0001);
    const turnAmount = steer * this.params.turnRate * surface.grip * steeringScale * dt;
    const angle = this.state.angle + turnAmount;

    const directionX = Math.cos(angle);
    const directionY = Math.sin(angle);

    const velocity = {
      x: directionX * speed,
      y: directionY * speed,
    };

    const position = {
      x: this.state.position.x + velocity.x * dt,
      y: this.state.position.y + velocity.y * dt,
    };

    this.state = {
      position,
      velocity,
      angle,
      speed,
    };

    return this.getState();
  }
}

export function resetCarAtStartingLine(startX = 0, startY = 0, startAngle = 0): CarState {
  return {
    position: { x: startX, y: startY },
    velocity: { x: 0, y: 0 },
    angle: startAngle,
    speed: 0,
  };
}

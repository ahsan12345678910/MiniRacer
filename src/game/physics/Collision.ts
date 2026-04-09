import { CarState } from './CarModel';

const BOUNCE_DAMPING = 0.2;
const POSITION_NUDGE = 8;

export function resolveBarrierCollision(car: CarState): CarState {
  const forwardX = Math.cos(car.angle);
  const forwardY = Math.sin(car.angle);

  return {
    ...car,
    position: {
      x: car.position.x - forwardX * POSITION_NUDGE,
      y: car.position.y - forwardY * POSITION_NUDGE,
    },
    velocity: {
      x: -car.velocity.x * BOUNCE_DAMPING,
      y: -car.velocity.y * BOUNCE_DAMPING,
    },
    speed: Math.max(0, car.speed * BOUNCE_DAMPING),
  };
}

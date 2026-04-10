import { useGameStore } from './GameStore';
import type { CarControls } from './physics/CarModel';

type TouchPoint = {
  id: number;
  x: number;
  y: number;
};

type JoystickState = {
  pointerId: number;
  originX: number;
  originY: number;
  currentX: number;
  currentY: number;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export class InputManager {
  private readonly activeTouches = new Map<number, TouchPoint>();
  private joystick: JoystickState | null = null;
  private screenWidth = 1;
  private screenHeight = 1;
  private readonly joystickRadius: number;

  constructor(joystickRadius = 80) {
    this.joystickRadius = joystickRadius;
  }

  setScreenSize(width: number, height: number) {
    this.screenWidth = Math.max(1, width);
    this.screenHeight = Math.max(1, height);
  }

  onTouchStart(id: number, x: number, y: number) {
    this.activeTouches.set(id, { id, x, y });

    if (this.getMode() === 'virtualJoystick' && !this.joystick) {
      this.joystick = {
        pointerId: id,
        originX: x,
        originY: y,
        currentX: x,
        currentY: y,
      };
    }
  }

  onTouchMove(id: number, x: number, y: number) {
    if (!this.activeTouches.has(id)) {
      return;
    }

    this.activeTouches.set(id, { id, x, y });

    if (this.joystick && this.joystick.pointerId === id) {
      this.joystick = {
        ...this.joystick,
        currentX: x,
        currentY: y,
      };
    }
  }

  onTouchEnd(id: number) {
    this.activeTouches.delete(id);

    if (this.joystick && this.joystick.pointerId === id) {
      this.joystick = null;
    }
  }

  reset() {
    this.activeTouches.clear();
    this.joystick = null;
  }

  getControls(): CarControls {
    return this.getMode() === 'virtualJoystick'
      ? this.getJoystickControls()
      : this.getTouchZoneControls();
  }

  private getMode() {
    return useGameStore.getState().settings.controlMode;
  }

  private getTouchZoneControls(): CarControls {
    let steer = 0;
    let brake = 0;

    for (const touch of this.activeTouches.values()) {
      const isBrakeButton = this.isInBrakeButton(touch.x, touch.y);
      if (isBrakeButton) {
        brake = 1;
        continue;
      }

      if (touch.x < this.screenWidth / 2) {
        steer = -1;
      } else {
        steer = 1;
      }
    }

    return {
      throttle: brake > 0 ? 0 : 1,
      brake,
      steer,
    };
  }

  private getJoystickControls(): CarControls {
    if (!this.joystick) {
      return { throttle: 0, brake: 0, steer: 0 };
    }

    const dx = this.joystick.currentX - this.joystick.originX;
    const dy = this.joystick.currentY - this.joystick.originY;
    const nx = clamp(dx / this.joystickRadius, -1, 1);
    const ny = clamp(dy / this.joystickRadius, -1, 1);

    return {
      steer: nx,
      throttle: clamp(-ny, 0, 1),
      brake: 0,
    };
  }

  private isInBrakeButton(x: number, y: number) {
    const buttonWidth = this.screenWidth * 0.24;
    const buttonHeight = this.screenHeight * 0.22;
    const buttonLeft = this.screenWidth - buttonWidth;
    const buttonTop = this.screenHeight - buttonHeight;

    return x >= buttonLeft && y >= buttonTop;
  }
}

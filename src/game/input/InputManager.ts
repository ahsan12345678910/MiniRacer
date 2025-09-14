import { CarControls } from '../physics/CarModel';

export type InputMode = 'touchZones' | 'virtualJoystick';

export interface TouchZone {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  action: 'steerLeft' | 'steerRight' | 'brake';
}

export interface VirtualJoystickState {
  isActive: boolean;
  centerX: number;
  centerY: number;
  currentX: number;
  currentY: number;
  radius: number;
  deadZone: number;
}

export interface InputSettings {
  mode: InputMode;
  touchZones: {
    enabled: boolean;
    brakeButtonSize: number;
    brakeButtonMargin: number;
  };
  virtualJoystick: {
    enabled: boolean;
    size: number;
    deadZone: number;
    maxDistance: number;
    position: 'left' | 'right';
  };
}

export interface InputState {
  controls: CarControls;
  touchZones: TouchZone[];
  virtualJoystick: VirtualJoystickState;
  screenWidth: number;
  screenHeight: number;
}

export class InputManager {
  private inputState: InputState;
  private settings: InputSettings;
  private onControlsChange?: (controls: CarControls) => void;

  constructor(
    screenWidth: number = 400,
    screenHeight: number = 800,
    settings: InputSettings
  ) {
    this.settings = settings;
    this.inputState = {
      controls: {
        accelerate: false,
        brake: false,
        turnLeft: false,
        turnRight: false,
      },
      touchZones: [],
      virtualJoystick: {
        isActive: false,
        centerX: 0,
        centerY: 0,
        currentX: 0,
        currentY: 0,
        radius: 0,
        deadZone: 0,
      },
      screenWidth,
      screenHeight,
    };

    this.initializeInputMode();
  }

  /**
   * Initialize input mode based on settings
   */
  private initializeInputMode(): void {
    if (this.settings.mode === 'touchZones') {
      this.initializeTouchZones();
    } else if (this.settings.mode === 'virtualJoystick') {
      this.initializeVirtualJoystick();
    }
  }

  /**
   * Initialize touch zones mode
   */
  private initializeTouchZones(): void {
    const { screenWidth, screenHeight } = this.inputState;
    const { brakeButtonSize, brakeButtonMargin } = this.settings.touchZones;

    this.inputState.touchZones = [
      // Left half of screen for steering left
      {
        id: 'steerLeft',
        x: 0,
        y: 0,
        width: screenWidth / 2,
        height: screenHeight,
        action: 'steerLeft',
      },
      // Right half of screen for steering right
      {
        id: 'steerRight',
        x: screenWidth / 2,
        y: 0,
        width: screenWidth / 2,
        height: screenHeight,
        action: 'steerRight',
      },
      // Brake button in bottom-right corner
      {
        id: 'brake',
        x: screenWidth - brakeButtonSize - brakeButtonMargin,
        y: screenHeight - brakeButtonSize - brakeButtonMargin,
        width: brakeButtonSize,
        height: brakeButtonSize,
        action: 'brake',
      },
    ];
  }

  /**
   * Initialize virtual joystick mode
   */
  private initializeVirtualJoystick(): void {
    const { screenWidth, screenHeight } = this.inputState;
    const { size, position } = this.settings.virtualJoystick;

    const centerX = position === 'left' ? size + 20 : screenWidth - size - 20;
    const centerY = screenHeight - size - 20;

    this.inputState.virtualJoystick = {
      isActive: false,
      centerX,
      centerY,
      currentX: centerX,
      currentY: centerY,
      radius: size / 2,
      deadZone: this.settings.virtualJoystick.deadZone,
    };
  }

  /**
   * Handle touch start
   */
  handleTouchStart(x: number, y: number): void {
    if (this.settings.mode === 'touchZones') {
      this.handleTouchZonesStart(x, y);
    } else if (this.settings.mode === 'virtualJoystick') {
      this.handleVirtualJoystickStart(x, y);
    }
  }

  /**
   * Handle touch move
   */
  handleTouchMove(x: number, y: number): void {
    if (this.settings.mode === 'virtualJoystick') {
      this.handleVirtualJoystickMove(x, y);
    }
  }

  /**
   * Handle touch end
   */
  handleTouchEnd(x: number, y: number): void {
    if (this.settings.mode === 'touchZones') {
      this.handleTouchZonesEnd(x, y);
    } else if (this.settings.mode === 'virtualJoystick') {
      this.handleVirtualJoystickEnd();
    }
  }

  /**
   * Handle touch zones start
   */
  private handleTouchZonesStart(x: number, y: number): void {
    const zone = this.getTouchZoneAt(x, y);
    if (zone) {
      this.updateControlFromZone(zone, true);
    }
  }

  /**
   * Handle touch zones end
   */
  private handleTouchZonesEnd(x: number, y: number): void {
    const zone = this.getTouchZoneAt(x, y);
    if (zone) {
      this.updateControlFromZone(zone, false);
    }
  }

  /**
   * Handle virtual joystick start
   */
  private handleVirtualJoystickStart(x: number, y: number): void {
    const joystick = this.inputState.virtualJoystick;
    const distance = Math.sqrt(
      Math.pow(x - joystick.centerX, 2) + Math.pow(y - joystick.centerY, 2)
    );

    if (distance <= joystick.radius) {
      joystick.isActive = true;
      this.updateVirtualJoystickPosition(x, y);
    }
  }

  /**
   * Handle virtual joystick move
   */
  private handleVirtualJoystickMove(x: number, y: number): void {
    if (this.inputState.virtualJoystick.isActive) {
      this.updateVirtualJoystickPosition(x, y);
    }
  }

  /**
   * Handle virtual joystick end
   */
  private handleVirtualJoystickEnd(): void {
    const joystick = this.inputState.virtualJoystick;
    joystick.isActive = false;
    joystick.currentX = joystick.centerX;
    joystick.currentY = joystick.centerY;
    this.updateControlsFromJoystick();
  }

  /**
   * Update virtual joystick position
   */
  private updateVirtualJoystickPosition(x: number, y: number): void {
    const joystick = this.inputState.virtualJoystick;
    const deltaX = x - joystick.centerX;
    const deltaY = y - joystick.centerY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance <= joystick.radius) {
      joystick.currentX = x;
      joystick.currentY = y;
    } else {
      // Clamp to joystick radius
      const angle = Math.atan2(deltaY, deltaX);
      joystick.currentX = joystick.centerX + Math.cos(angle) * joystick.radius;
      joystick.currentY = joystick.centerY + Math.sin(angle) * joystick.radius;
    }

    this.updateControlsFromJoystick();
  }

  /**
   * Update controls from virtual joystick
   */
  private updateControlsFromJoystick(): void {
    const joystick = this.inputState.virtualJoystick;
    const deltaX = joystick.currentX - joystick.centerX;
    const deltaY = joystick.currentY - joystick.centerY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Reset controls
    this.inputState.controls = {
      accelerate: false,
      brake: false,
      turnLeft: false,
      turnRight: false,
    };

    if (distance > joystick.deadZone) {
      // Steering based on X-axis
      const steerThreshold = joystick.radius * 0.3;
      if (deltaX < -steerThreshold) {
        this.inputState.controls.turnLeft = true;
      } else if (deltaX > steerThreshold) {
        this.inputState.controls.turnRight = true;
      }

      // Acceleration/Braking based on Y-axis
      const accelThreshold = joystick.radius * 0.3;
      if (deltaY < -accelThreshold) {
        this.inputState.controls.accelerate = true;
      } else if (deltaY > accelThreshold) {
        this.inputState.controls.brake = true;
      }
    }

    this.notifyControlsChange();
  }

  /**
   * Get touch zone at position
   */
  private getTouchZoneAt(x: number, y: number): TouchZone | null {
    for (const zone of this.inputState.touchZones) {
      if (
        x >= zone.x &&
        x <= zone.x + zone.width &&
        y >= zone.y &&
        y <= zone.y + zone.height
      ) {
        return zone;
      }
    }
    return null;
  }

  /**
   * Update control from zone
   */
  private updateControlFromZone(zone: TouchZone, active: boolean): void {
    switch (zone.action) {
      case 'steerLeft':
        this.inputState.controls.turnLeft = active;
        break;
      case 'steerRight':
        this.inputState.controls.turnRight = active;
        break;
      case 'brake':
        this.inputState.controls.brake = active;
        break;
    }
    this.notifyControlsChange();
  }

  /**
   * Notify controls change
   */
  private notifyControlsChange(): void {
    if (this.onControlsChange) {
      this.onControlsChange({ ...this.inputState.controls });
    }
  }

  /**
   * Set controls change callback
   */
  setControlsChangeCallback(callback: (controls: CarControls) => void): void {
    this.onControlsChange = callback;
  }

  /**
   * Get current controls
   */
  getControls(): CarControls {
    return { ...this.inputState.controls };
  }

  /**
   * Get current input state
   */
  getInputState(): InputState {
    return { ...this.inputState };
  }

  /**
   * Get current settings
   */
  getSettings(): InputSettings {
    return { ...this.settings };
  }

  /**
   * Update settings and reinitialize
   */
  updateSettings(newSettings: Partial<InputSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.initializeInputMode();
  }

  /**
   * Update screen dimensions
   */
  updateScreenDimensions(width: number, height: number): void {
    this.inputState.screenWidth = width;
    this.inputState.screenHeight = height;
    this.initializeInputMode();
  }

  /**
   * Get touch zones for rendering
   */
  getTouchZones(): TouchZone[] {
    return [...this.inputState.touchZones];
  }

  /**
   * Get virtual joystick state for rendering
   */
  getVirtualJoystickState(): VirtualJoystickState {
    return { ...this.inputState.virtualJoystick };
  }

  /**
   * Check if input mode is touch zones
   */
  isTouchZonesMode(): boolean {
    return this.settings.mode === 'touchZones';
  }

  /**
   * Check if input mode is virtual joystick
   */
  isVirtualJoystickMode(): boolean {
    return this.settings.mode === 'virtualJoystick';
  }

  /**
   * Reset all controls
   */
  resetControls(): void {
    this.inputState.controls = {
      accelerate: false,
      brake: false,
      turnLeft: false,
      turnRight: false,
    };
    this.notifyControlsChange();
  }
}

// Default input settings
export const DEFAULT_INPUT_SETTINGS: InputSettings = {
  mode: 'touchZones',
  touchZones: {
    enabled: true,
    brakeButtonSize: 80,
    brakeButtonMargin: 20,
  },
  virtualJoystick: {
    enabled: true,
    size: 120,
    deadZone: 10,
    maxDistance: 60,
    position: 'left',
  },
};

// Singleton instance
let inputManager: InputManager | null = null;

export const getInputManager = (): InputManager => {
  if (!inputManager) {
    inputManager = new InputManager(400, 800, DEFAULT_INPUT_SETTINGS);
  }
  return inputManager;
};

// Helper function to create input manager with custom settings
export const createInputManager = (
  screenWidth: number,
  screenHeight: number,
  settings: InputSettings = DEFAULT_INPUT_SETTINGS
): InputManager => {
  return new InputManager(screenWidth, screenHeight, settings);
};

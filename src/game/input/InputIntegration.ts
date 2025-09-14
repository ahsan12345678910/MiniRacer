import { InputManager, InputSettings } from './InputManager';
import { useGameStore, GameSettings } from '../store/GameStore';
import { CarControls } from '../physics/CarModel';

/**
 * Integration between InputManager and GameStore
 */
export class InputIntegration {
  private inputManager: InputManager;

  constructor(screenWidth: number = 400, screenHeight: number = 800) {
    // Initialize input manager with settings from store
    const storeSettings = useGameStore.getState().settings;
    const inputSettings =
      this.convertGameSettingsToInputSettings(storeSettings);

    this.inputManager = new InputManager(
      screenWidth,
      screenHeight,
      inputSettings
    );

    // Set up controls change callback
    this.inputManager.setControlsChangeCallback((controls: CarControls) => {
      this.handleControlsChange(controls);
    });
  }

  /**
   * Convert GameStore settings to InputManager settings
   */
  private convertGameSettingsToInputSettings(
    gameSettings: GameSettings
  ): InputSettings {
    return {
      mode: gameSettings.inputMode,
      touchZones: {
        enabled: true,
        brakeButtonSize: gameSettings.touchZones.brakeButtonSize,
        brakeButtonMargin: gameSettings.touchZones.brakeButtonMargin,
      },
      virtualJoystick: {
        enabled: true,
        size: gameSettings.virtualJoystick.size,
        deadZone: gameSettings.virtualJoystick.deadZone,
        maxDistance: gameSettings.virtualJoystick.maxDistance,
        position: gameSettings.virtualJoystick.position,
      },
    };
  }

  /**
   * Handle controls change from input manager
   */
  private handleControlsChange(controls: CarControls): void {
    // Apply controls to car physics
    const store = useGameStore.getState();

    if (controls.accelerate) {
      store.accelerate(1.0);
    }

    if (controls.brake) {
      store.brake(1.0);
    }

    if (controls.turnLeft) {
      store.turn(-0.1);
    }

    if (controls.turnRight) {
      store.turn(0.1);
    }
  }

  /**
   * Update input manager settings from game store
   */
  updateFromGameStore(): void {
    const storeSettings = useGameStore.getState().settings;
    const inputSettings =
      this.convertGameSettingsToInputSettings(storeSettings);
    this.inputManager.updateSettings(inputSettings);
  }

  /**
   * Handle touch start
   */
  handleTouchStart(x: number, y: number): void {
    this.inputManager.handleTouchStart(x, y);
  }

  /**
   * Handle touch move
   */
  handleTouchMove(x: number, y: number): void {
    this.inputManager.handleTouchMove(x, y);
  }

  /**
   * Handle touch end
   */
  handleTouchEnd(x: number, y: number): void {
    this.inputManager.handleTouchEnd(x, y);
  }

  /**
   * Update screen dimensions
   */
  updateScreenDimensions(width: number, height: number): void {
    this.inputManager.updateScreenDimensions(width, height);
  }

  /**
   * Get current controls
   */
  getControls(): CarControls {
    return this.inputManager.getControls();
  }

  /**
   * Get input state for rendering
   */
  getInputState() {
    return this.inputManager.getInputState();
  }

  /**
   * Get touch zones for rendering
   */
  getTouchZones() {
    return this.inputManager.getTouchZones();
  }

  /**
   * Get virtual joystick state for rendering
   */
  getVirtualJoystickState() {
    return this.inputManager.getVirtualJoystickState();
  }

  /**
   * Check if input mode is touch zones
   */
  isTouchZonesMode(): boolean {
    return this.inputManager.isTouchZonesMode();
  }

  /**
   * Check if input mode is virtual joystick
   */
  isVirtualJoystickMode(): boolean {
    return this.inputManager.isVirtualJoystickMode();
  }

  /**
   * Reset all controls
   */
  resetControls(): void {
    this.inputManager.resetControls();
  }

  /**
   * Get current input mode
   */
  getInputMode(): 'touchZones' | 'virtualJoystick' {
    return this.inputManager.getSettings().mode;
  }
}

// Singleton instance
let inputIntegration: InputIntegration | null = null;

export const getInputIntegration = (): InputIntegration => {
  if (!inputIntegration) {
    inputIntegration = new InputIntegration();
  }
  return inputIntegration;
};

// Helper function to create input integration
export const createInputIntegration = (
  screenWidth: number,
  screenHeight: number
): InputIntegration => {
  return new InputIntegration(screenWidth, screenHeight);
};

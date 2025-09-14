import { InputManager, InputSettings } from './InputManager';
import { useGameStore, GameSettings } from '../store/GameStore';
import { CarControls } from '../physics/CarModel';

/**
 * Integration between InputManager and GameStore
 */
export class InputIntegration {
  private inputManager: InputManager;
  private currentControls: CarControls = {
    accelerate: false,
    brake: false,
    turnLeft: false,
    turnRight: false,
  };

  constructor(screenWidth: number = 400, screenHeight: number = 800) {
    console.log('InputIntegration: Constructor called with screen size:', screenWidth, screenHeight);
    // Initialize input manager with settings from store
    const storeSettings = useGameStore.getState().settings;
    const inputSettings =
      this.convertGameSettingsToInputSettings(storeSettings);

    console.log('InputIntegration: Input settings:', inputSettings);

    this.inputManager = new InputManager(
      screenWidth,
      screenHeight,
      inputSettings
    );

    // Set up controls change callback
    this.inputManager.setControlsChangeCallback((controls: CarControls) => {
      this.handleControlsChange(controls);
    });
    
    console.log('InputIntegration: Constructor completed, callback set');
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
    // Store the controls for the game loop to pick up
    // The GameIntegration will handle the actual physics updates
    this.currentControls = controls;
    console.log('InputIntegration: Controls changed:', controls);
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
    // Reset controls when touch ends
    this.currentControls = {
      accelerate: false,
      brake: false,
      turnLeft: false,
      turnRight: false,
    };
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
    return { ...this.currentControls };
  }

  /**
   * Set a specific control value
   */
  setSpecificControl(control: keyof CarControls, value: boolean): void {
    this.currentControls[control] = value;
    console.log('InputIntegration: Set specific control:', control, '=', value);
    console.log('InputIntegration: Current controls after specific set:', this.currentControls);
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

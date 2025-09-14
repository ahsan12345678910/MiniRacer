// New input system exports
export * from './InputManager';
export * from './InputComponents';
export * from './types';

// Legacy exports for backward compatibility
export {
  InputManager,
  getInputManager,
  createInputManager,
  DEFAULT_INPUT_SETTINGS,
  type InputMode,
  type TouchZone,
  type VirtualJoystickState,
  type InputSettings,
  type InputState,
} from './InputManager';

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import {
  PanGestureHandler,
  TapGestureHandler,
  PanGestureHandlerGestureEvent,
  TapGestureHandlerGestureEvent,
  State,
} from 'react-native-gesture-handler';
import {
  useInputStore,
  useControls,
  useInputSettings,
  useTouchZones,
  useJoystick,
  useInputActions,
} from './InputManager';

interface InputHandlerProps {
  children?: React.ReactNode;
}

export const InputHandler: React.FC<InputHandlerProps> = ({ children }) => {
  const settings = useInputSettings();
  const actions = useInputActions();
  const panGestureRef = useRef(null);
  const tapGestureRef = useRef(null);

  // Initialize input mode when component mounts
  useEffect(() => {
    if (settings.mode === 'touchZones') {
      actions.initializeTouchZones();
    } else {
      actions.initializeJoystick();
    }
  }, [settings.mode, actions]);

  // Update screen dimensions when they change
  useEffect(() => {
    const { width, height } = Dimensions.get('window');
    actions.updateScreenDimensions(width, height);
  }, [actions]);

  if (settings.mode === 'touchZones') {
    return <TouchZonesHandler>{children}</TouchZonesHandler>;
  } else {
    return <JoystickHandler>{children}</JoystickHandler>;
  }
};

const TouchZonesHandler: React.FC<InputHandlerProps> = ({ children }) => {
  const actions = useInputActions();
  const panGestureRef = useRef(null);
  const tapGestureRef = useRef(null);

  const handlePanGesture = (event: PanGestureHandlerGestureEvent) => {
    const { x, y, state } = event.nativeEvent;

    switch (state) {
      case State.BEGAN:
        actions.handleTouchZoneStart(x, y);
        break;
      case State.ACTIVE:
        actions.handleTouchZoneMove(x, y);
        break;
      case State.END:
      case State.CANCELLED:
        actions.handleTouchZoneEnd();
        break;
    }
  };

  const handleTapGesture = (event: TapGestureHandlerGestureEvent) => {
    const { x, y, state } = event.nativeEvent;
    
    if (state === State.END) {
      actions.handleTouchZoneStart(x, y);
      // Small delay to ensure the tap is registered before reset
      setTimeout(() => actions.handleTouchZoneEnd(), 50);
    }
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      <PanGestureHandler 
        ref={panGestureRef}
        onGestureEvent={handlePanGesture}
        hitSlop={{ top: 0, bottom: 0, left: 0, right: 0 }}
        simultaneousHandlers={[tapGestureRef]}
      >
        <View style={styles.gestureArea} pointerEvents="box-none">
          <TapGestureHandler 
            ref={tapGestureRef}
            onGestureEvent={handleTapGesture}
            hitSlop={{ top: 0, bottom: 0, left: 0, right: 0 }}
            simultaneousHandlers={[panGestureRef]}
            waitFor={[panGestureRef]}
          >
            <View style={styles.gestureArea} pointerEvents="box-none">
              {children}
              <TouchZonesVisual />
            </View>
          </TapGestureHandler>
        </View>
      </PanGestureHandler>
    </View>
  );
};

const JoystickHandler: React.FC<InputHandlerProps> = ({ children }) => {
  const actions = useInputActions();
  const panGestureRef = useRef(null);

  const handlePanGesture = (event: PanGestureHandlerGestureEvent) => {
    const { x, y, state } = event.nativeEvent;

    switch (state) {
      case State.BEGAN:
        actions.handleJoystickStart(x, y);
        break;
      case State.ACTIVE:
        actions.handleJoystickMove(x, y);
        break;
      case State.END:
      case State.CANCELLED:
        actions.handleJoystickEnd();
        break;
    }
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      <PanGestureHandler 
        ref={panGestureRef}
        onGestureEvent={handlePanGesture}
        hitSlop={{ top: 0, bottom: 0, left: 0, right: 0 }}
      >
        <View style={styles.gestureArea} pointerEvents="box-none">
          {children}
          <JoystickVisual />
        </View>
      </PanGestureHandler>
    </View>
  );
};

const TouchZonesVisual: React.FC = () => {
  const touchZones = useTouchZones();
  const settings = useInputSettings();

  if (!settings.mode === 'touchZones') return null;

  return (
    <View style={styles.visualContainer} pointerEvents="none">
      {touchZones.map((zone) => (
        <View
          key={zone.id}
          style={[
            styles.touchZone,
            {
              left: zone.x,
              top: zone.y,
              width: zone.width,
              height: zone.height,
            },
            zone.type === 'steer' && styles.steerZone,
            zone.type === 'throttle' && styles.throttleZone,
            zone.type === 'brake' && styles.brakeZone,
          ]}
        />
      ))}
    </View>
  );
};

const JoystickVisual: React.FC = () => {
  const joystick = useJoystick();
  const settings = useInputSettings();

  if (settings.mode !== 'joystick') return null;

  return (
    <View style={styles.visualContainer} pointerEvents="none">
      {/* Joystick base */}
      <View
        style={[
          styles.joystickBase,
          {
            left: joystick.centerX - joystick.radius,
            top: joystick.centerY - joystick.radius,
            width: joystick.radius * 2,
            height: joystick.radius * 2,
          },
        ]}
      />
      
      {/* Joystick thumb */}
      <View
        style={[
          styles.joystickThumb,
          {
            left: joystick.currentX - 15,
            top: joystick.currentY - 15,
            width: 30,
            height: 30,
          },
        ]}
      />
    </View>
  );
};

// Debug component to show current controls
export const ControlsDebug: React.FC = () => {
  const controls = useControls();
  const settings = useInputSettings();

  return (
    <View style={styles.debugContainer} pointerEvents="none">
      <View style={styles.debugText}>
        Mode: {settings.mode}
      </View>
      <View style={styles.debugText}>
        Steer: {controls.steer.toFixed(2)}
      </View>
      <View style={styles.debugText}>
        Throttle: {controls.throttle.toFixed(2)}
      </View>
      <View style={styles.debugText}>
        Brake: {controls.brake.toFixed(2)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  gestureArea: {
    flex: 1,
  },
  visualContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  touchZone: {
    position: 'absolute',
    opacity: 0.1,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  steerZone: {
    backgroundColor: '#ff0000',
  },
  throttleZone: {
    backgroundColor: '#00ff00',
  },
  brakeZone: {
    backgroundColor: '#0000ff',
    borderRadius: 50,
  },
  joystickBase: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 100,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  joystickThumb: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 1)',
  },
  debugContainer: {
    position: 'absolute',
    top: 100,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  debugText: {
    color: '#00FF00',
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 2,
  },
});

// Export the main hook for external use
export { useControls, useInputSettings, useInputActions };
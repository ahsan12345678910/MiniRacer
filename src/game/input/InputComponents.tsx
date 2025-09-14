import React from 'react';
import { View, StyleSheet } from 'react-native';
import {
  PanGestureHandler,
  State,
  PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import { InputIntegration } from './InputIntegration';

interface InputControlsProps {
  inputIntegration: InputIntegration;
  screenWidth: number;
  screenHeight: number;
}

export const InputControls: React.FC<InputControlsProps> = ({
  inputIntegration,
  screenWidth,
  screenHeight,
}) => {
  const handleGestureEvent = (event: PanGestureHandlerGestureEvent) => {
    const { x, y } = event.nativeEvent;

    switch (event.nativeEvent.state) {
      case State.BEGAN:
        inputIntegration.handleTouchStart(x, y);
        break;
      case State.ACTIVE:
        inputIntegration.handleTouchMove(x, y);
        break;
      case State.END:
      case State.CANCELLED:
        inputIntegration.handleTouchEnd(x, y);
        break;
    }
  };

  return (
    <View
      style={[styles.container, { width: screenWidth, height: screenHeight }]}
    >
      <PanGestureHandler onGestureEvent={handleGestureEvent}>
        <View style={styles.gestureArea}>
          {inputIntegration.isTouchZonesMode() && (
            <TouchZonesControls inputIntegration={inputIntegration} />
          )}
          {inputIntegration.isVirtualJoystickMode() && (
            <VirtualJoystickControls inputIntegration={inputIntegration} />
          )}
        </View>
      </PanGestureHandler>
    </View>
  );
};

const TouchZonesControls: React.FC<{ inputIntegration: InputIntegration }> = ({
  inputIntegration,
}) => {
  const touchZones = inputIntegration.getTouchZones();

  return (
    <>
      {touchZones.map(zone => (
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
            zone.action === 'steerLeft' && styles.steerLeftZone,
            zone.action === 'steerRight' && styles.steerRightZone,
            zone.action === 'brake' && styles.brakeZone,
          ]}
        />
      ))}
    </>
  );
};

const VirtualJoystickControls: React.FC<{
  inputIntegration: InputIntegration;
}> = ({ inputIntegration }) => {
  const joystickState = inputIntegration.getVirtualJoystickState();

  return (
    <View style={styles.joystickContainer}>
      {/* Joystick base */}
      <View
        style={[
          styles.joystickBase,
          {
            left: joystickState.centerX - joystickState.radius,
            top: joystickState.centerY - joystickState.radius,
            width: joystickState.radius * 2,
            height: joystickState.radius * 2,
          },
        ]}
      />

      {/* Joystick thumb */}
      <View
        style={[
          styles.joystickThumb,
          {
            left: joystickState.currentX - 15,
            top: joystickState.currentY - 15,
            width: 30,
            height: 30,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1000,
  },
  gestureArea: {
    flex: 1,
  },
  touchZone: {
    position: 'absolute',
    opacity: 0.1,
  },
  steerLeftZone: {
    backgroundColor: '#ff0000',
  },
  steerRightZone: {
    backgroundColor: '#00ff00',
  },
  brakeZone: {
    backgroundColor: '#0000ff',
    borderRadius: 50,
  },
  joystickContainer: {
    position: 'absolute',
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
});

// Hook for using input integration in React components
export const useInputIntegration = (
  screenWidth: number,
  screenHeight: number
): InputIntegration => {
  const [inputIntegration] = React.useState(
    () => new InputIntegration(screenWidth, screenHeight)
  );

  React.useEffect(() => {
    inputIntegration.updateScreenDimensions(screenWidth, screenHeight);
  }, [screenWidth, screenHeight, inputIntegration]);

  return inputIntegration;
};

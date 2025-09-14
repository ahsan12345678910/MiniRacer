import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useInputActions } from '../../game/input/InputManager';

const { width: screenWidth } = Dimensions.get('window');

interface ButtonsPadProps {
  onControlChange?: (control: string, value: boolean) => void;
}

export const ButtonsPad: React.FC<ButtonsPadProps> = ({ onControlChange }) => {
  const insets = useSafeAreaInsets();
  const { setControls } = useInputActions();
  const gestureRef = useRef(null);

  const handleControlPress = (control: string, value: boolean) => {
    // Update the input store immediately
    const currentControls = { steer: 0, throttle: 0, brake: 0 };
    
    switch (control) {
      case 'steerLeft':
        setControls({ ...currentControls, steer: value ? -1 : 0 });
        break;
      case 'steerRight':
        setControls({ ...currentControls, steer: value ? 1 : 0 });
        break;
      case 'throttle':
        setControls({ ...currentControls, throttle: value ? 1 : 0 });
        break;
      case 'brake':
        setControls({ ...currentControls, brake: value ? 1 : 0 });
        break;
    }
    
    onControlChange?.(control, value);
  };

  const ControlButton: React.FC<{
    control: string;
    icon: string;
    label: string;
    style: any;
  }> = ({ control, icon, label, style }) => (
    <Pressable
      style={({ pressed }) => [
        styles.controlButton,
        style,
        pressed && styles.controlButtonPressed,
      ]}
      onPressIn={() => {
        console.log(`Button ${control} pressed - should steer/throttle immediately`);
        handleControlPress(control, true);
      }}
      onPressOut={() => {
        console.log(`Button ${control} released`);
        handleControlPress(control, false);
      }}
      pointerEvents="auto"
      android_ripple={null}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Text style={styles.controlButtonIcon}>{icon}</Text>
      <Text style={styles.controlButtonLabel}>{label}</Text>
    </Pressable>
  );

  return (
    <View 
      style={[
        styles.container,
        { paddingBottom: insets.bottom + 20 }
      ]}
      pointerEvents="box-none"
    >
      <View style={styles.buttonsContainer}>
        {/* Left steering button */}
        <ControlButton
          control="steerLeft"
          icon="←"
          label="LEFT"
          style={styles.steerLeftButton}
        />

        {/* Right steering button */}
        <ControlButton
          control="steerRight"
          icon="→"
          label="RIGHT"
          style={styles.steerRightButton}
        />

        {/* Throttle button */}
        <ControlButton
          control="throttle"
          icon="↑"
          label="GAS"
          style={styles.throttleButton}
        />

        {/* Brake button */}
        <ControlButton
          control="brake"
          icon="↓"
          label="BRAKE"
          style={styles.brakeButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    alignItems: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
    width: '100%',
    maxWidth: 400,
  },
  controlButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    borderWidth: 2,
  },
  controlButtonPressed: {
    transform: [{ scale: 0.95 }],
    shadowOpacity: 0.2,
  },
  steerLeftButton: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF4444',
  },
  steerRightButton: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF4444',
  },
  throttleButton: {
    backgroundColor: '#4ECDC4',
    borderColor: '#45B7B8',
  },
  brakeButton: {
    backgroundColor: '#FFE66D',
    borderColor: '#FFD93D',
  },
  controlButtonIcon: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  controlButtonLabel: {
    fontSize: 8,
    fontWeight: '600',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
    marginTop: 2,
    letterSpacing: 0.5,
  },
});

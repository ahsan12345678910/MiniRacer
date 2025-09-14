/**
 * Input Manager
 * 
 * Controls ref pattern without state loops
 * - Exposes controlsRef.current for direct access
 * - Input components write to ref, no React state updates
 * - Used by game loop to read current input state
 */

import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export interface Controls {
  steer: number; // -1 to 1
  throttle: number; // 0 to 1
  brake: number; // 0 to 1
}

// Global controls ref - accessed by game loop
export const controlsRef = { current: { steer: 0, throttle: 0, brake: 0 } as Controls };

/**
 * Touch Zones Input Component
 * - Left 40% for steering
 * - Right 40% for throttle
 * - Bottom-right corner for brake button
 */
export const TouchZones: React.FC = () => {
  const handleTouchStart = (event: any) => {
    const { locationX, locationY } = event.nativeEvent;
    
    // Check if touch is in brake button area
    const brakeButtonSize = 80;
    const brakeButtonMargin = 20;
    const brakeX = screenWidth - brakeButtonSize - brakeButtonMargin;
    const brakeY = screenHeight - brakeButtonSize - brakeButtonMargin;
    
    if (locationX >= brakeX && locationX <= brakeX + brakeButtonSize &&
        locationY >= brakeY && locationY <= brakeY + brakeButtonSize) {
      controlsRef.current.brake = 1;
      return;
    }
    
    // Handle steering and throttle zones
    handleTouchMove(event);
  };

  const handleTouchMove = (event: any) => {
    const { locationX } = event.nativeEvent;
    
    // Reset controls
    controlsRef.current.steer = 0;
    controlsRef.current.throttle = 0;
    
    // Check if we're in the steer zone (left 40%)
    if (locationX <= screenWidth * 0.4) {
      const centerX = screenWidth * 0.2;
      const steerValue = (locationX - centerX) / (screenWidth * 0.2);
      controlsRef.current.steer = Math.max(-1, Math.min(1, steerValue));
    }
    
    // Check if we're in the throttle zone (right 40%)
    if (locationX >= screenWidth * 0.4 && locationX <= screenWidth * 0.8) {
      const zoneStart = screenWidth * 0.4;
      const zoneWidth = screenWidth * 0.4;
      const throttleValue = (locationX - zoneStart) / zoneWidth;
      controlsRef.current.throttle = Math.max(0, Math.min(1, throttleValue));
    }
  };

  const handleTouchEnd = () => {
    controlsRef.current.steer = 0;
    controlsRef.current.throttle = 0;
    controlsRef.current.brake = 0;
  };

  return (
    <View style={styles.touchZones} pointerEvents="box-none">
      {/* Steer zone */}
      <View
        style={[styles.touchZone, styles.steerZone]}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        pointerEvents="auto"
      />
      
      {/* Throttle zone */}
      <View
        style={[styles.touchZone, styles.throttleZone]}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        pointerEvents="auto"
      />
      
      {/* Brake button */}
      <TouchableOpacity
        style={styles.brakeButton}
        onPressIn={() => { controlsRef.current.brake = 1; }}
        onPressOut={() => { controlsRef.current.brake = 0; }}
        pointerEvents="auto"
      >
        <Text style={styles.brakeButtonText}>BRAKE</Text>
      </TouchableOpacity>
    </View>
  );
};

/**
 * Buttons Pad Input Component
 * - Four directional buttons for steering and acceleration
 */
export const ButtonsPad: React.FC = () => {
  return (
    <View style={styles.buttonsPad} pointerEvents="box-none">
      {/* Steer Left Button */}
      <TouchableOpacity
        style={[styles.controlButton, styles.steerLeftButton]}
        onPressIn={() => { controlsRef.current.steer = -1; }}
        onPressOut={() => { controlsRef.current.steer = 0; }}
        pointerEvents="auto"
      >
        <Text style={styles.controlButtonText}>←</Text>
      </TouchableOpacity>

      {/* Steer Right Button */}
      <TouchableOpacity
        style={[styles.controlButton, styles.steerRightButton]}
        onPressIn={() => { controlsRef.current.steer = 1; }}
        onPressOut={() => { controlsRef.current.steer = 0; }}
        pointerEvents="auto"
      >
        <Text style={styles.controlButtonText}>→</Text>
      </TouchableOpacity>

      {/* Accelerate Button */}
      <TouchableOpacity
        style={[styles.controlButton, styles.accelerateButton]}
        onPressIn={() => { controlsRef.current.throttle = 1; }}
        onPressOut={() => { controlsRef.current.throttle = 0; }}
        pointerEvents="auto"
      >
        <Text style={styles.controlButtonText}>↑</Text>
      </TouchableOpacity>

      {/* Brake Button */}
      <TouchableOpacity
        style={[styles.controlButton, styles.brakeButton]}
        onPressIn={() => { controlsRef.current.brake = 1; }}
        onPressOut={() => { controlsRef.current.brake = 0; }}
        pointerEvents="auto"
      >
        <Text style={styles.controlButtonText}>↓</Text>
      </TouchableOpacity>
    </View>
  );
};

/**
 * Virtual Joystick Input Component
 * - Draggable joystick for steering and acceleration
 */
export const VirtualJoystick: React.FC = () => {
  const [joystickPosition, setJoystickPosition] = React.useState({ x: 0, y: 0 });
  const [isActive, setIsActive] = React.useState(false);
  const [centerPosition, setCenterPosition] = React.useState({ x: 0, y: 0 });

  const handleGestureEvent = (event: any) => {
    if (event.nativeEvent.state === State.BEGAN) {
      const { x, y } = event.nativeEvent;
      setCenterPosition({ x, y });
      setJoystickPosition({ x, y });
      setIsActive(true);
    } else if (event.nativeEvent.state === State.ACTIVE) {
      const { x, y } = event.nativeEvent;
      setJoystickPosition({ x, y });
      
      // Calculate controls from joystick position
      const deltaX = x - centerPosition.x;
      const deltaY = y - centerPosition.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const maxDistance = 60; // Joystick radius
      
      if (distance > maxDistance) {
        const angle = Math.atan2(deltaY, deltaX);
        const clampedX = centerPosition.x + Math.cos(angle) * maxDistance;
        const clampedY = centerPosition.y + Math.sin(angle) * maxDistance;
        setJoystickPosition({ x: clampedX, y: clampedY });
        
        // Calculate controls with clamped position
        const clampedDeltaX = clampedX - centerPosition.x;
        const clampedDeltaY = clampedY - centerPosition.y;
        
        controlsRef.current.steer = Math.max(-1, Math.min(1, clampedDeltaX / maxDistance));
        
        if (clampedDeltaY < 0) {
          controlsRef.current.throttle = Math.max(0, Math.min(1, -clampedDeltaY / maxDistance));
          controlsRef.current.brake = 0;
        } else {
          controlsRef.current.throttle = 0;
          controlsRef.current.brake = Math.max(0, Math.min(1, clampedDeltaY / maxDistance));
        }
      } else {
        controlsRef.current.steer = Math.max(-1, Math.min(1, deltaX / maxDistance));
        
        if (deltaY < 0) {
          controlsRef.current.throttle = Math.max(0, Math.min(1, -deltaY / maxDistance));
          controlsRef.current.brake = 0;
        } else {
          controlsRef.current.throttle = 0;
          controlsRef.current.brake = Math.max(0, Math.min(1, deltaY / maxDistance));
        }
      }
    } else if (event.nativeEvent.state === State.END || event.nativeEvent.state === State.CANCELLED) {
      setJoystickPosition(centerPosition);
      setIsActive(false);
      controlsRef.current.steer = 0;
      controlsRef.current.throttle = 0;
      controlsRef.current.brake = 0;
    }
  };

  return (
    <View style={styles.joystickContainer} pointerEvents="box-none">
      <PanGestureHandler onGestureEvent={handleGestureEvent} onHandlerStateChange={handleGestureEvent}>
        <View style={styles.joystickArea} pointerEvents="auto">
          {isActive && (
            <>
              <View
                style={[
                  styles.joystickBase,
                  {
                    left: centerPosition.x - 60,
                    top: centerPosition.y - 60,
                  },
                ]}
              />
              <View
                style={[
                  styles.joystickKnob,
                  {
                    left: joystickPosition.x - 15,
                    top: joystickPosition.y - 15,
                  },
                ]}
              />
            </>
          )}
        </View>
      </PanGestureHandler>
    </View>
  );
};

const styles = StyleSheet.create({
  touchZones: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  touchZone: {
    position: 'absolute',
    top: 0,
    bottom: 0,
  },
  steerZone: {
    left: 0,
    width: screenWidth * 0.4,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
  },
  throttleZone: {
    left: screenWidth * 0.4,
    width: screenWidth * 0.4,
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
  },
  brakeButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  brakeButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  buttonsPad: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  controlButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  steerLeftButton: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF4444',
  },
  steerRightButton: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF4444',
  },
  accelerateButton: {
    backgroundColor: '#4ECDC4',
    borderColor: '#45B7B8',
  },
  brakeButton: {
    backgroundColor: '#FFE66D',
    borderColor: '#FFD93D',
  },
  controlButtonText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  joystickContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  joystickArea: {
    flex: 1,
  },
  joystickBase: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  joystickKnob: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});
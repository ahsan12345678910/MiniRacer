import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Camera, CameraState } from '../../game/camera/Camera';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface CameraViewProps {
  camera: Camera;
  children: React.ReactNode;
  style?: any;
}

/**
 * CameraView component that applies camera transformations to its children
 * This creates a simple camera system for the racing game
 */
export const CameraView: React.FC<CameraViewProps> = ({ camera, children, style }) => {
  const [cameraState, setCameraState] = useState<CameraState>(camera.getState());

  // Update camera state when camera changes
  useEffect(() => {
    const updateCameraState = () => {
      setCameraState(camera.getState());
    };

    // Update immediately
    updateCameraState();

    // Set up interval to update camera state (60fps)
    const interval = setInterval(updateCameraState, 16);

    return () => clearInterval(interval);
  }, [camera]);

  // Calculate transform based on camera state
  const transform = {
    translateX: -cameraState.x,
    translateY: -cameraState.y,
    scale: cameraState.zoom,
  };

  return (
    <View 
      style={[
        styles.container,
        style,
        {
          transform: [
            { translateX: transform.translateX },
            { translateY: transform.translateY },
            { scale: transform.scale },
          ],
        },
      ]}
    >
      {children}
    </View>
  );
};

/**
 * WorldObject component that positions elements in world coordinates
 * Automatically converts world coordinates to screen coordinates using camera
 */
interface WorldObjectProps {
  camera: Camera;
  worldX: number;
  worldY: number;
  children: React.ReactNode;
  style?: any;
}

export const WorldObject: React.FC<WorldObjectProps> = ({ 
  camera, 
  worldX, 
  worldY, 
  children, 
  style 
}) => {
  const [cameraState, setCameraState] = useState<CameraState>(camera.getState());

  // Update camera state when camera changes
  useEffect(() => {
    const updateCameraState = () => {
      setCameraState(camera.getState());
    };

    // Update immediately
    updateCameraState();

    // Set up interval to update camera state (60fps)
    const interval = setInterval(updateCameraState, 16);

    return () => clearInterval(interval);
  }, [camera]);

  // Convert world coordinates to screen coordinates
  const screenPos = camera.worldToScreen(worldX, worldY);

  return (
    <View
      style={[
        styles.worldObject,
        {
          left: screenPos.x,
          top: screenPos.y,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

/**
 * TrackTile component for rendering track elements with camera
 */
interface TrackTileProps {
  camera: Camera;
  worldX: number;
  worldY: number;
  width: number;
  height: number;
  color: string;
  borderColor?: string;
}

export const TrackTile: React.FC<TrackTileProps> = ({
  camera,
  worldX,
  worldY,
  width,
  height,
  color,
  borderColor = '#3a5a3a',
}) => {
  const [cameraState, setCameraState] = useState<CameraState>(camera.getState());

  // Update camera state when camera changes
  useEffect(() => {
    const updateCameraState = () => {
      setCameraState(camera.getState());
    };

    // Update immediately
    updateCameraState();

    // Set up interval to update camera state (60fps)
    const interval = setInterval(updateCameraState, 16);

    return () => clearInterval(interval);
  }, [camera]);

  // Convert world coordinates to screen coordinates
  const screenPos = camera.worldToScreen(worldX, worldY);

  // Only render if visible on screen
  if (!camera.isVisible(worldX, worldY)) {
    return null;
  }

  return (
    <View
      style={[
        styles.trackTile,
        {
          left: screenPos.x,
          top: screenPos.y,
          width,
          height,
          backgroundColor: color,
          borderColor,
        },
      ]}
    />
  );
};

/**
 * Car Shadow component for rendering car shadow
 */
interface CarShadowProps {
  camera: Camera;
  worldX: number;
  worldY: number;
  angle: number;
  width?: number;
  height?: number;
}

export const CarShadow: React.FC<CarShadowProps> = ({
  camera,
  worldX,
  worldY,
  angle,
  width = 40,
  height = 20,
}) => {
  const [cameraState, setCameraState] = useState<CameraState>(camera.getState());

  // Update camera state when camera changes
  useEffect(() => {
    const updateCameraState = () => {
      setCameraState(camera.getState());
    };

    // Update immediately
    updateCameraState();

    // Set up interval to update camera state (60fps)
    const interval = setInterval(updateCameraState, 16);

    return () => clearInterval(interval);
  }, [camera]);

  // Convert world coordinates to screen coordinates
  const screenPos = camera.worldToScreen(worldX, worldY);

  // Only render if visible on screen
  if (!camera.isVisible(worldX, worldY)) {
    return null;
  }

  return (
    <View
      style={[
        styles.carShadow,
        {
          left: screenPos.x - width / 2,
          top: screenPos.y - height / 2 + 2, // Offset shadow slightly down
          width,
          height,
          transform: [{ rotate: `${angle * 180 / Math.PI}deg` }],
        },
      ]}
    />
  );
};

/**
 * Car component for rendering the car with camera
 */
interface CarProps {
  camera: Camera;
  worldX: number;
  worldY: number;
  angle: number;
  width?: number;
  height?: number;
  showShadow?: boolean;
  color?: string;
  borderColor?: string;
  windowColor?: string;
  headlightColor?: string;
  wheelColor?: string;
  spoilerColor?: string;
}

export const Car: React.FC<CarProps> = ({
  camera,
  worldX,
  worldY,
  angle,
  width = 40,
  height = 20,
  showShadow = true,
  color = '#FF4444',
  borderColor = '#CC3333',
  windowColor = 'rgba(135, 206, 250, 0.8)',
  headlightColor = '#FFFF99',
  wheelColor = '#333333',
  spoilerColor = '#222222',
}) => {
  const [cameraState, setCameraState] = useState<CameraState>(camera.getState());

  // Update camera state when camera changes
  useEffect(() => {
    const updateCameraState = () => {
      setCameraState(camera.getState());
    };

    // Update immediately
    updateCameraState();

    // Set up interval to update camera state (60fps)
    const interval = setInterval(updateCameraState, 16);

    return () => clearInterval(interval);
  }, [camera]);

  // Convert world coordinates to screen coordinates
  const screenPos = camera.worldToScreen(worldX, worldY);

  // Only render if visible on screen
  if (!camera.isVisible(worldX, worldY)) {
    return null;
  }

  return (
    <>
      {/* Car Shadow */}
      {showShadow && (
        <CarShadow
          camera={camera}
          worldX={worldX}
          worldY={worldY}
          angle={angle}
          width={width}
          height={height}
        />
      )}
      
      {/* Car Body */}
      <View
        style={[
          styles.carBody,
          {
            left: screenPos.x - width / 2,
            top: screenPos.y - height / 2,
            width,
            height,
            backgroundColor: color,
            borderColor,
            transform: [{ rotate: `${angle * 180 / Math.PI}deg` }],
          },
        ]}
      >
        {/* Car Windows */}
        <View style={[styles.carWindows, { backgroundColor: windowColor }]} />
        
        {/* Car Headlights */}
        <View style={[styles.carHeadlight, styles.carHeadlightLeft, { backgroundColor: headlightColor }]} />
        <View style={[styles.carHeadlight, styles.carHeadlightRight, { backgroundColor: headlightColor }]} />
        
        {/* Car Wheels */}
        <View style={[styles.carWheel, styles.carWheelFrontLeft, { backgroundColor: wheelColor }]} />
        <View style={[styles.carWheel, styles.carWheelFrontRight, { backgroundColor: wheelColor }]} />
        <View style={[styles.carWheel, styles.carWheelRearLeft, { backgroundColor: wheelColor }]} />
        <View style={[styles.carWheel, styles.carWheelRearRight, { backgroundColor: wheelColor }]} />
        
        {/* Car Spoiler */}
        <View style={[styles.carSpoiler, { backgroundColor: spoilerColor }]} />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: screenWidth,
    height: screenHeight,
  },
  worldObject: {
    position: 'absolute',
  },
  trackTile: {
    position: 'absolute',
    borderWidth: 1,
  },
  // Car Shadow
  carShadow: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    transform: [{ skewX: '15deg' }],
  },
  // Car Body
  carBody: {
    position: 'absolute',
    backgroundColor: '#FF4444',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#CC3333',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  // Car Windows
  carWindows: {
    position: 'absolute',
    top: 2,
    left: 4,
    right: 4,
    height: 8,
    backgroundColor: 'rgba(135, 206, 250, 0.8)',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(100, 149, 237, 0.6)',
  },
  // Car Headlights
  carHeadlight: {
    position: 'absolute',
    width: 4,
    height: 3,
    backgroundColor: '#FFFF99',
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  carHeadlightLeft: {
    top: 2,
    left: 2,
  },
  carHeadlightRight: {
    top: 2,
    right: 2,
  },
  // Car Wheels
  carWheel: {
    position: 'absolute',
    width: 6,
    height: 6,
    backgroundColor: '#333333',
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#666666',
  },
  carWheelFrontLeft: {
    top: 1,
    left: 1,
  },
  carWheelFrontRight: {
    top: 1,
    right: 1,
  },
  carWheelRearLeft: {
    bottom: 1,
    left: 1,
  },
  carWheelRearRight: {
    bottom: 1,
    right: 1,
  },
  // Car Spoiler
  carSpoiler: {
    position: 'absolute',
    top: -2,
    left: 8,
    right: 8,
    height: 2,
    backgroundColor: '#222222',
    borderRadius: 1,
    borderWidth: 1,
    borderColor: '#444444',
  },
});

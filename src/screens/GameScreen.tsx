import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getSimpleGameLoopManager } from '../game/loop/SimpleGameLoopManager';
import { getSimpleRaceManager } from '../game/SimpleRaceManager';
import { TouchZones, VirtualJoystick } from '../game/input/InputManager';
import { createCamera, DEFAULT_CAMERA_SETTINGS } from '../game/camera/Camera';
import { createRaceTrack } from '../game/track/TrackDesign';
import { TrackRenderer } from '../game/track/TrackRenderer';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const GameScreen: React.FC = () => {
  // Refs for game state
  const raceManagerRef = useRef(getSimpleRaceManager());
  const loopManagerRef = useRef(getSimpleGameLoopManager());
  const cameraRef = useRef(createCamera(screenWidth, screenHeight, {
    ...DEFAULT_CAMERA_SETTINGS,
    followSpeed: 6.0, // Smooth following
    defaultZoom: 0.8, // Slightly zoomed out to see more
  }));
  const mountedRef = useRef(true);

  // React state
  const [ready, setReady] = useState(false);
  const [inputMode, setInputMode] = useState<'touchZones' | 'joystick'>('touchZones');
  const [raceState, setRaceState] = useState<any>(null);
  const [track] = useState(createRaceTrack());

  // Initialize race on mount
  useEffect(() => {
    let mounted = true;
    
    (async () => {
      try {
        const raceManager = raceManagerRef.current;
        const loopManager = loopManagerRef.current;
        
        // Set up race manager with loop manager
        loopManager.setGameIntegration(raceManager);
        
        // Start the race automatically
        raceManager.startRace();
        console.log('🏁 GameScreen: Race started automatically');
        
        if (mounted) {
          setReady(true);
        }
      } catch (error) {
        console.error('Failed to initialize race:', error);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // Update race state and camera
  useEffect(() => {
    if (!ready) return;

    const updateRaceState = () => {
      const raceManager = raceManagerRef.current;
      const currentState = raceManager.getState();
      
      // Update camera to follow player car
      if (currentState.playerPosition) {
        cameraRef.current.setTarget(currentState.playerPosition.x, currentState.playerPosition.y);
        cameraRef.current.update(16); // ~60fps
      }
      
      setRaceState(currentState);
    };

    const interval = setInterval(updateRaceState, 16); // Update every 16ms (~60fps)
    return () => clearInterval(interval);
  }, [ready]);

  // Handle focus/blur
  useFocusEffect(
    useCallback(() => {
      mountedRef.current = true;
      
      if (ready) {
        const loopManager = loopManagerRef.current;
        loopManager.start();
      }

      return () => {
        mountedRef.current = false;
        const loopManager = loopManagerRef.current;
        loopManager.pause();
      };
    }, [ready])
  );

  // Handle input mode change
  const handleInputModeChange = useCallback((mode: 'touchZones' | 'joystick') => {
    setInputMode(mode);
  }, []);


  // Helper function to convert world coordinates to screen coordinates
  const worldToScreen = (worldX: number, worldY: number) => {
    return cameraRef.current.worldToScreen(worldX, worldY);
  };

  if (!ready) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading Game...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Game View */}
      <View style={styles.gameView}>
        {/* Track Background */}
        <View style={styles.trackBackground}>
          {/* Render the race track */}
          <TrackRenderer
            track={track}
            cameraX={cameraRef.current.getState().x}
            cameraY={cameraRef.current.getState().y}
            screenWidth={screenWidth}
            screenHeight={screenHeight}
          />

          {/* Player Car */}
          {raceState && raceState.playerPosition && (
            <View
              style={[
                styles.carBody,
                styles.playerCar,
                {
                  left: worldToScreen(raceState.playerPosition.x, raceState.playerPosition.y).x - 20,
                  top: worldToScreen(raceState.playerPosition.x, raceState.playerPosition.y).y - 10,
                  transform: [{ rotate: `${(raceState.playerCar?.getState?.()?.angle || 0) * 180 / Math.PI}deg` }],
                },
              ]}
            >
              <View style={styles.carWindows} />
              <View style={[styles.carHeadlight, styles.carHeadlightLeft]} />
              <View style={[styles.carHeadlight, styles.carHeadlightRight]} />
              <View style={[styles.carWheel, styles.carWheelFrontLeft]} />
              <View style={[styles.carWheel, styles.carWheelFrontRight]} />
              <View style={[styles.carWheel, styles.carWheelRearLeft]} />
              <View style={[styles.carWheel, styles.carWheelRearRight]} />
              <View style={styles.carSpoiler} />
            </View>
          )}

          {/* AI Cars */}
          {raceState?.aiPositions?.map((pos: any, index: number) => {
            const aiCar = raceState.aiCars?.[index];
            const carColors = ['#4444FF', '#44FF44', '#FFFF44']; // Blue, Green, Yellow
            const carColor = carColors[index] || '#FF44FF';
            const screenPos = worldToScreen(pos.x, pos.y);
            
            return (
              <View
                key={index}
                style={[
                  styles.carBody,
                  {
                    backgroundColor: carColor,
                    borderColor: carColor,
                    left: screenPos.x - 20,
                    top: screenPos.y - 10,
                    transform: [{ rotate: `${(aiCar?.getState?.()?.angle || 0) * 180 / Math.PI}deg` }],
                  },
                ]}
              >
                <View style={styles.carWindows} />
                <View style={[styles.carHeadlight, styles.carHeadlightLeft]} />
                <View style={[styles.carHeadlight, styles.carHeadlightRight]} />
                <View style={[styles.carWheel, styles.carWheelFrontLeft]} />
                <View style={[styles.carWheel, styles.carWheelFrontRight]} />
                <View style={[styles.carWheel, styles.carWheelRearLeft]} />
                <View style={[styles.carWheel, styles.carWheelRearRight]} />
                <View style={styles.carSpoiler} />
              </View>
            );
          })}
        </View>

        {/* Game HUD Overlay */}
        <View style={styles.gameHUD}>
          <View style={styles.hudHeader}>
            <Text style={styles.hudTitle}>Single Player Game</Text>
            <Text style={styles.hudSubtitle}>
              Time: {raceState?.raceTime?.toFixed(1) || '0.0'}s
            </Text>
          </View>
        </View>
      </View>

      {/* Input Controls */}
      <View style={styles.inputContainer}>
        <Text style={styles.sectionTitle}>Input Controls:</Text>
        {inputMode === 'touchZones' ? (
          <TouchZones
            onInputModeChange={handleInputModeChange}
            brakeButtonSize={80}
            brakeButtonMargin={20}
          />
        ) : (
          <VirtualJoystick
            onInputModeChange={handleInputModeChange}
            size={120}
            deadZone={10}
            maxDistance={60}
            position="left"
          />
        )}
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2C3E50',
  },
  gameView: {
    flex: 1,
    position: 'relative',
  },
  trackBackground: {
    flex: 1,
    backgroundColor: '#2a4a2a', // Grass color
    position: 'relative',
    overflow: 'hidden',
  },
  grassBackground: {
    position: 'absolute',
    top: -2000,
    left: -2000,
    width: 4000,
    height: 4000,
    backgroundColor: '#2a4a2a',
  },
  trackTile: {
    position: 'absolute',
    width: 80,
    height: 80,
    backgroundColor: '#4a6a4a',
    borderWidth: 1,
    borderColor: '#3a5a3a',
  },
  trackBoundary: {
    position: 'absolute',
    top: 50,
    left: 50,
    right: 50,
    bottom: 50,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  // Car Styles
  carBody: {
    position: 'absolute',
    width: 40,
    height: 20,
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
  playerCar: {
    backgroundColor: '#FF4444',
    borderColor: '#CC3333',
  },
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
  // HUD Styles
  gameHUD: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 10,
    padding: 15,
    zIndex: 100,
  },
  hudHeader: {
    alignItems: 'center',
    marginBottom: 10,
  },
  hudTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  hudSubtitle: {
    fontSize: 12,
    color: '#BDC3C7',
  },
  hudControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  startButton: {
    backgroundColor: '#27AE60',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
  },
  stopButton: {
    backgroundColor: '#E74C3C',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
  },
  resetButton: {
    backgroundColor: '#F39C12',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 12,
  },
  // Bottom UI
  inputContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 15,
    borderRadius: 10,
    margin: 10,
    minHeight: 100,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  debugContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 15,
    borderRadius: 10,
    margin: 10,
  },
  debugText: {
    color: '#BDC3C7',
    fontSize: 12,
    marginBottom: 3,
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
    marginTop: 20,
    textAlign: 'center',
  },
});

export default GameScreen;
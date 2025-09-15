import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { FixedStepLoop } from '../game/loop/FixedStepLoop';
import { SURFACE_TYPES } from '../game/physics/CarModel';
import { controlsRef } from '../game/input/InputManager';
import { useSetSnapshot, useSetPaused, usePaused } from '../game/state/UIState';
import { ButtonsPad } from '../game/input/InputManager';
import { HUD } from '../ui/HUD';
import { Car } from '../ui/Camera';
import { createCamera } from '../game/camera/Camera';
import { MultiCarManager } from '../game/cars/MultiCarManager';
import { CAR_TYPES } from '../game/cars/CarTypes';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const SimpleMultiCarTest: React.FC = () => {
  // Refs for game state
  const loopRef = useRef<FixedStepLoop | null>(null);
  const mountedRef = useRef(true);
  const cameraRef = useRef(createCamera(screenWidth, screenHeight));
  const multiCarManagerRef = useRef(new MultiCarManager());

  // React state
  const [ready, setReady] = useState(false);
  const [raceStarted, setRaceStarted] = useState(false);

  // UI store
  const setSnapshot = useSetSnapshot();
  const setPaused = useSetPaused();
  const paused = usePaused();

  // Initialize race on mount
  useEffect(() => {
    console.log('🚀 Initializing Simple Multi-Car Test');
    
    // Center the cars on screen
    const centerX = screenWidth / 2;
    const centerY = screenHeight / 2;
    
    const startPositions = [
      { x: centerX, y: centerY, angle: 0 }, // Player
      { x: centerX + 100, y: centerY, angle: 0 }, // AI 1
      { x: centerX, y: centerY + 100, angle: 0 }, // AI 2
      { x: centerX + 100, y: centerY + 100, angle: 0 }, // AI 3
    ];
    
    multiCarManagerRef.current.setStartPositions(startPositions);
    multiCarManagerRef.current.initializeRace(centerX, centerY, 0, 3);
    
    // Set camera to center
    cameraRef.current.setTarget(centerX, centerY);
    cameraRef.current.setPosition(centerX, centerY);
    
    // Debug: Log positions
    const playerCar = multiCarManagerRef.current.getPlayerCar();
    console.log('🚗 Player car position:', playerCar.x, playerCar.y);
    
    const aiCars = multiCarManagerRef.current.getAICars();
    aiCars.forEach((aiCar, index) => {
      const carState = aiCar.getCarState();
      console.log(`🤖 AI Car ${index + 1} position:`, carState.x, carState.y);
    });
    
    const cameraState = cameraRef.current.getState();
    console.log('📷 Camera state:', cameraState);
    
    setReady(true);
  }, []);

  // Game update function
  const update = useCallback((dt: number) => {
    // Read controls from ref
    const controls = controlsRef.current;
    
    // Get surface properties
    const surfaceType = SURFACE_TYPES.ASPHALT;
    
    // Update multi-car manager
    multiCarManagerRef.current.update(dt, controls, surfaceType);
    
    // Update camera to follow player car
    const playerCar = multiCarManagerRef.current.getPlayerCar();
    cameraRef.current.setTarget(playerCar.x, playerCar.y);
    cameraRef.current.update(dt);
    
    // Compute speed in km/h
    const speedKmh = Math.sqrt(playerCar.vx * playerCar.vx + playerCar.vy * playerCar.vy) * 3.6;
    
    // Publish UI snapshot (throttled by the store)
    setSnapshot({
      speedKmh,
      lap: '00:00.00',
      bestMs: 0,
    });
  }, [setSnapshot]);

  // Focus effect to start/stop loop
  useFocusEffect(
    useCallback(() => {
      if (!loopRef.current) {
        loopRef.current = new FixedStepLoop(update);
      }
      
      if (ready && !loopRef.current.isRunning()) {
        loopRef.current.start();
      }
      
      return () => {
        loopRef.current?.stop();
      };
    }, [ready, update])
  );

  // Handle pause
  const handlePause = useCallback(() => {
    const newPaused = !paused;
    setPaused(newPaused);
    
    if (newPaused) {
      loopRef.current?.stop();
    } else if (ready) {
      loopRef.current?.start();
    }
  }, [paused, setPaused, ready]);

  // Handle back to menu
  const handleBackToMenu = useCallback(() => {
    loopRef.current?.stop();
    // Navigation would go here
  }, []);

  // Handle start race
  const handleStartRace = useCallback(() => {
    console.log('🏁 Starting race!');
    multiCarManagerRef.current.startRace();
    setRaceStarted(true);
  }, []);

  // Handle reset race
  const handleResetRace = useCallback(() => {
    console.log('🔄 Resetting race!');
    multiCarManagerRef.current.resetRace();
    setRaceStarted(false);
  }, []);

  // Render loading state
  if (!ready) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading test...</Text>
      </View>
    );
  }

  const multiCarState = multiCarManagerRef.current.getState();

  // Render simple test
  return (
    <View style={styles.container}>
      {/* Simple background */}
      <View style={styles.background} />
      
      {/* Player Car - Static positioning for testing */}
      <Car
        camera={cameraRef.current}
        worldX={multiCarState.playerCar.x}
        worldY={multiCarState.playerCar.y}
        angle={multiCarState.playerCar.angle}
        {...CAR_TYPES.player}
      />

      {/* AI Cars - Static positioning for testing */}
      {multiCarState.aiCars.map((aiCarState) => {
        const carState = aiCarState.car;
        const config = aiCarState.config;
        
        return (
          <Car
            key={config.id}
            camera={cameraRef.current}
            worldX={carState.x}
            worldY={carState.y}
            angle={carState.angle}
            color={config.color}
            borderColor={config.borderColor}
            windowColor={config.windowColor}
            headlightColor={config.headlightColor}
            wheelColor={config.wheelColor}
            spoilerColor={config.spoilerColor}
          />
        );
      })}

      {/* HUD Overlay */}
      <HUD onPause={handlePause} onMenu={handleBackToMenu} />

      {/* Race Controls */}
      <View style={styles.raceControls}>
        {!raceStarted ? (
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartRace}
          >
            <Text style={styles.buttonText}>Start Race</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleResetRace}
          >
            <Text style={styles.buttonText}>Reset Race</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Debug Info */}
      <View style={styles.debugInfo}>
        <Text style={styles.debugText}>Screen: {screenWidth}x{screenHeight}</Text>
        <Text style={styles.debugText}>Player: ({Math.round(multiCarState.playerCar.x)}, {Math.round(multiCarState.playerCar.y)})</Text>
        <Text style={styles.debugText}>Camera: ({Math.round(cameraRef.current.getState().x)}, {Math.round(cameraRef.current.getState().y)})</Text>
        <Text style={styles.debugText}>Race Started: {raceStarted ? 'Yes' : 'No'}</Text>
      </View>

      {/* Input Controls */}
      <ButtonsPad />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    marginTop: 20,
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#2a4a2a',
  },
  raceControls: {
    position: 'absolute',
    top: 100,
    left: 20,
    zIndex: 100,
  },
  startButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  resetButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  debugInfo: {
    position: 'absolute',
    top: 100,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 8,
    padding: 12,
    zIndex: 100,
  },
  debugText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginBottom: 4,
  },
});

export default SimpleMultiCarTest;

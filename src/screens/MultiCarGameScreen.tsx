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
import { FixedStepLoop } from '../game/loop/FixedStepLoop';
import { loadTrack } from '../game/world/TrackLoader';
import { SURFACE_TYPES } from '../game/physics/CarModel';
import { controlsRef } from '../game/input/InputManager';
import { useSetSnapshot, useSetPaused, usePaused } from '../game/state/UIState';
import { TouchZones, ButtonsPad, VirtualJoystick } from '../game/input/InputManager';
import { HUD } from '../ui/HUD';
import { RaceHUD } from '../ui/RaceHUD';
import { CameraView, TrackTile, Car } from '../ui/Camera';
import { createCamera } from '../game/camera/Camera';
import { MultiCarManager } from '../game/cars/MultiCarManager';
import { CAR_TYPES } from '../game/cars/CarTypes';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const MultiCarGameScreen: React.FC = () => {
  // Refs for game state
  const trackRef = useRef<any>(null);
  const loopRef = useRef<FixedStepLoop | null>(null);
  const mountedRef = useRef(true);
  const cameraRef = useRef(createCamera(screenWidth, screenHeight));
  const multiCarManagerRef = useRef(new MultiCarManager());

  // React state
  const [ready, setReady] = useState(false);
  const [inputMode, setInputMode] = useState<'touchZones' | 'joystick'>('touchZones');
  const [cameraControlsVisible, setCameraControlsVisible] = useState(false);
  const [raceStarted, setRaceStarted] = useState(false);

  // UI store
  const setSnapshot = useSetSnapshot();
  const setPaused = useSetPaused();
  const paused = usePaused();

  // Load track and initialize race on mount
  useEffect(() => {
    let mounted = true;
    
    console.log('🚀 MultiCarGameScreen: Initializing...');
    
    (async () => {
      try {
        console.log('📁 Loading track...');
        const track = await loadTrack('default');
        if (!mounted) return;
        
        trackRef.current = track;
        console.log('✅ Track loaded successfully');
        
        // Initialize multi-car race
        const startPositions = [
          { x: 200, y: 300, angle: 0 }, // Player
          { x: 250, y: 300, angle: 0 }, // AI 1
          { x: 200, y: 350, angle: 0 }, // AI 2
          { x: 250, y: 350, angle: 0 }, // AI 3
        ];
        
        multiCarManagerRef.current.setStartPositions(startPositions);
        multiCarManagerRef.current.initializeRace(200, 300, 0, 3);
        
        // Set racing path (simple oval track)
        const racingPath = [
          { x: 200, y: 300 },
          { x: 400, y: 300 },
          { x: 400, y: 500 },
          { x: 200, y: 500 },
          { x: 200, y: 300 },
        ];
        multiCarManagerRef.current.setRacingPath(racingPath);
        
        // Set camera to follow player car
        const playerCar = multiCarManagerRef.current.getPlayerCar();
        console.log('🚗 Player car position:', playerCar.x, playerCar.y);
        cameraRef.current.setTarget(playerCar.x, playerCar.y);
        cameraRef.current.setPosition(playerCar.x, playerCar.y);
        
        // Debug camera state
        const cameraState = cameraRef.current.getState();
        console.log('📷 Camera state:', cameraState);
        
        // Debug: Log AI car positions
        const aiCars = multiCarManagerRef.current.getAICars();
        aiCars.forEach((aiCar, index) => {
          const carState = aiCar.getCarState();
          console.log(`🤖 AI Car ${index + 1} position:`, carState.x, carState.y);
        });
        
        console.log('🎮 MultiCarGameScreen: Ready!');
        setReady(true);
      } catch (error) {
        console.error('❌ Track load failed:', error);
      }
    })();

    return () => {
      mounted = false;
      mountedRef.current = false;
    };
  }, []);

  // Game update function
  const update = useCallback((dt: number) => {
    if (!trackRef.current) return;

    // Read controls from ref
    const controls = controlsRef.current;
    
    // Get surface properties (simplified)
    const surfaceType = SURFACE_TYPES.ASPHALT;
    
    // Update multi-car manager
    multiCarManagerRef.current.update(dt, controls, surfaceType);
    
    // Update camera to follow player car
    const playerCar = multiCarManagerRef.current.getPlayerCar();
    cameraRef.current.setTarget(playerCar.x, playerCar.y);
    cameraRef.current.update(dt);
    
    // Debug: Log car positions every second
    const multiCarState = multiCarManagerRef.current.getState();
    if (Math.floor(multiCarState.raceTime / 1000) !== Math.floor((multiCarState.raceTime - dt) / 1000)) {
      console.log('🚗 Player car position:', playerCar.x, playerCar.y);
      const aiCars = multiCarManagerRef.current.getAICars();
      aiCars.forEach((aiCar, index) => {
        const carState = aiCar.getCarState();
        console.log(`🤖 AI Car ${index + 1} position:`, carState.x, carState.y);
      });
    }
    
    
    // Compute speed in km/h
    const speedKmh = Math.sqrt(playerCar.vx * playerCar.vx + playerCar.vy * playerCar.vy) * 3.6;
    
    // Publish UI snapshot
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
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={styles.loadingText}>Loading race...</Text>
      </View>
    );
  }

  const multiCarState = multiCarManagerRef.current.getState();

  // Render game with multiple cars
  return (
    <View style={styles.container}>
      {/* Camera View - applies camera transformations */}
      <CameraView camera={cameraRef.current} style={styles.cameraView}>
        {/* Grass background */}
        <View style={styles.grassBackground} />
        
        {/* Track tiles */}
        {Array.from({ length: 20 }, (_, i) => (
          <TrackTile
            key={i}
            camera={cameraRef.current}
            worldX={(i % 5) * 80}
            worldY={Math.floor(i / 5) * 80}
            width={80}
            height={80}
            color="#4a6a4a"
            borderColor="#3a5a3a"
          />
        ))}

        {/* Track boundaries */}
        <View style={styles.trackBoundary} />

        {/* Player Car */}
        <Car
          camera={cameraRef.current}
          worldX={multiCarState.playerCar.x}
          worldY={multiCarState.playerCar.y}
          angle={multiCarState.playerCar.angle}
          {...CAR_TYPES.player}
        />

        {/* AI Cars */}
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
      </CameraView>

      {/* HUD Overlay - not affected by camera */}
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

      {/* Race HUD */}
      <RaceHUD
        positions={multiCarManagerRef.current.getRacePositions()}
        carConfigs={Object.fromEntries(
          multiCarManagerRef.current.getRacePositions().map(pos => [
            pos.carId, 
            multiCarManagerRef.current.getCarConfig(pos.carId) || CAR_TYPES.player
          ])
        )}
        raceTime={multiCarState.raceTime}
        currentLap={1}
        totalLaps={3}
      />

      {/* Input Controls - not affected by camera */}
      {inputMode === 'touchZones' && <TouchZones />}
      {inputMode === 'joystick' && <VirtualJoystick />}
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
  cameraView: {
    flex: 1,
    backgroundColor: '#2a4a2a', // Grass color
  },
  grassBackground: {
    position: 'absolute',
    top: -2000,
    left: -2000,
    width: 4000,
    height: 4000,
    backgroundColor: '#2a4a2a',
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
});

export default MultiCarGameScreen;

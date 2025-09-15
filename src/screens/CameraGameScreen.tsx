import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { FixedStepLoop } from '../game/loop/FixedStepLoop';
import { GameCore, makeInitialGame, resetCarAtStart } from '../game/state/GameState';
import { loadTrack } from '../game/world/TrackLoader';
import { updateCar, SURFACE_TYPES } from '../game/physics/CarModel';
import { controlsRef } from '../game/input/InputManager';
import { useUIStore } from '../game/state/UIState';
import { TouchZones, ButtonsPad, VirtualJoystick } from '../game/input/InputManager';
import { HUD } from '../ui/HUD';
import { CameraView, TrackTile, Car, CameraControls } from '../ui/Camera';
import { createCamera } from '../game/camera/Camera';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const CameraGameScreen: React.FC = () => {
  // Refs for game state
  const gameRef = useRef<GameCore>(makeInitialGame());
  const trackRef = useRef<any>(null);
  const loopRef = useRef<FixedStepLoop | null>(null);
  const mountedRef = useRef(true);
  const cameraRef = useRef(createCamera(screenWidth, screenHeight));

  // React state
  const [ready, setReady] = useState(false);
  const [inputMode, setInputMode] = useState<'touchZones' | 'joystick'>('touchZones');
  const [cameraControlsVisible, setCameraControlsVisible] = useState(false);

  // UI store
  const { setSnapshot, setPaused, paused } = useUIStore();

  // Load track on mount
  useEffect(() => {
    let mounted = true;
    
    (async () => {
      try {
        const track = await loadTrack('default');
        if (!mounted) return;
        
        trackRef.current = track;
        gameRef.current.track = track;
        
        // Place car at start position
        resetCarAtStart(gameRef.current);
        
        // Set camera to follow car initially
        const car = gameRef.current.car;
        cameraRef.current.setTarget(car.x, car.y);
        cameraRef.current.setPosition(car.x, car.y);
        
        setReady(true);
      } catch (error) {
        console.error('Track load failed:', error);
      }
    })();

    return () => {
      mounted = false;
      mountedRef.current = false;
    };
  }, []);

  // Game update function
  const update = useCallback((dt: number) => {
    const game = gameRef.current;
    if (!game.track) return;

    // Read controls from ref
    const controls = controlsRef.current;
    
    // Get surface at car position
    const surface = game.track.surfaces.find(s => {
      const [x, y, w, h] = s.rect;
      return game.car.x >= x && game.car.x <= x + w && 
             game.car.y >= y && game.car.y <= y + h;
    });
    
    const surfaceType = surface?.type === 'asphalt' ? SURFACE_TYPES.ASPHALT : SURFACE_TYPES.GRASS;
    
    // Update car physics
    updateCar(game.car, controls, surfaceType, game.track.walls, dt);
    
    // Update camera to follow the car
    cameraRef.current.setTarget(game.car.x, game.car.y);
    cameraRef.current.update(dt);
    
    // Update lap system (simplified)
    const startLine = game.track.startLine;
    const carX = game.car.x;
    const carY = game.car.y;
    
    // Check if car crossed start line
    if (carX >= startLine.x1 && carX <= startLine.x2 && 
        carY >= Math.min(startLine.y1, startLine.y2) && carY <= Math.max(startLine.y1, startLine.y2)) {
      const crossSide = carX > (startLine.x1 + startLine.x2) / 2 ? 1 : -1;
      
      if (game.lap.lastCrossSide !== 0 && game.lap.lastCrossSide !== crossSide) {
        // Lap completed
        game.lap.current += 1;
        if (game.lap.bestMs === 0 || game.lap.bestMs > 0) {
          game.lap.bestMs = Math.max(game.lap.bestMs, 0); // Placeholder
        }
      }
      
      game.lap.lastCrossSide = crossSide;
    }
    
    // Compute speed in km/h
    const speedKmh = Math.sqrt(game.car.vx * game.car.vx + game.car.vy * game.car.vy) * 3.6;
    
    // Format lap time (simplified)
    const lapTime = formatTime(0); // Placeholder
    
    // Publish UI snapshot (throttled)
    setSnapshot({
      speedKmh,
      lap: lapTime,
      bestMs: game.lap.bestMs,
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

  // Format time helper
  const formatTime = (timeMs: number): string => {
    const totalSeconds = Math.floor(timeMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((timeMs % 1000) / 10);

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

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

  // Render loading state
  if (!ready) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={styles.loadingText}>Loading track...</Text>
      </View>
    );
  }

  // Render game with camera
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

        {/* Car with camera positioning */}
        <Car
          camera={cameraRef.current}
          worldX={gameRef.current.car.x}
          worldY={gameRef.current.car.y}
          angle={gameRef.current.car.angle}
        />
      </CameraView>

      {/* HUD Overlay - not affected by camera */}
      <HUD onPause={handlePause} onMenu={handleBackToMenu} />

      {/* Input Controls - not affected by camera */}
      {inputMode === 'touchZones' && <TouchZones />}
      {inputMode === 'joystick' && <VirtualJoystick />}
      <ButtonsPad />

      {/* Camera Controls */}
      <CameraControls
        camera={cameraRef.current}
        visible={cameraControlsVisible}
        onToggle={() => setCameraControlsVisible(!cameraControlsVisible)}
      />
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
});

export default CameraGameScreen;

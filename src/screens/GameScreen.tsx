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
import { resolve } from '../game/physics/Collision';
import { controlsRef } from '../game/input/InputManager';
import { useSetSnapshot, useSetPaused, usePaused } from '../game/state/UIState';
import { TouchZones, ButtonsPad, VirtualJoystick } from '../game/input/InputManager';
import { HUD } from '../ui/HUD';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const GameScreen: React.FC = () => {
  // Refs for game state
  const gameRef = useRef<GameCore>(makeInitialGame());
  const trackRef = useRef<any>(null);
  const loopRef = useRef<FixedStepLoop | null>(null);
  const mountedRef = useRef(true);

  // React state
  const [ready, setReady] = useState(false);
  const [inputMode, setInputMode] = useState<'touchZones' | 'joystick'>('touchZones');

  // UI store
  const setSnapshot = useSetSnapshot();
  const setPaused = useSetPaused();
  const paused = usePaused();

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

  // Render game
  return (
    <View style={styles.container}>
      {/* Track Background */}
      <View style={styles.trackBackground} pointerEvents="none">
        {/* Tiled track pattern */}
        {Array.from({ length: 20 }, (_, i) => (
          <View
            key={i}
            style={[
              styles.trackTile,
              {
                left: (i % 5) * 80,
                top: Math.floor(i / 5) * 80,
              },
            ]}
          />
        ))}

        {/* Track boundaries */}
        <View style={styles.trackBoundary} />

        {/* Car with Shadow */}
        <View
          style={[
            styles.carShadow,
            {
              left: gameRef.current.car.x - 20,
              top: gameRef.current.car.y - 10 + 2,
              transform: [{ rotate: `${gameRef.current.car.angle * 180 / Math.PI}deg` }],
            },
          ]}
        />
        <View
          style={[
            styles.carBody,
            {
              left: gameRef.current.car.x - 20,
              top: gameRef.current.car.y - 10,
              transform: [{ rotate: `${gameRef.current.car.angle * 180 / Math.PI}deg` }],
            },
          ]}
        >
          {/* Car Windows */}
          <View style={styles.carWindows} />
          
          {/* Car Headlights */}
          <View style={[styles.carHeadlight, styles.carHeadlightLeft]} />
          <View style={[styles.carHeadlight, styles.carHeadlightRight]} />
          
          {/* Car Wheels */}
          <View style={[styles.carWheel, styles.carWheelFrontLeft]} />
          <View style={[styles.carWheel, styles.carWheelFrontRight]} />
          <View style={[styles.carWheel, styles.carWheelRearLeft]} />
          <View style={[styles.carWheel, styles.carWheelRearRight]} />
          
          {/* Car Spoiler */}
          <View style={styles.carSpoiler} />
        </View>
      </View>

      {/* HUD Overlay */}
      <HUD onPause={handlePause} onMenu={handleBackToMenu} />

      {/* Input Controls */}
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
  trackBackground: {
    flex: 1,
    backgroundColor: '#2a4a2a', // Grass color
    position: 'relative',
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
  // Car Shadow
  carShadow: {
    position: 'absolute',
    width: 40,
    height: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    transform: [{ skewX: '15deg' }],
  },
  // Car Body
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

export default GameScreen;
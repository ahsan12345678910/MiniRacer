import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions,
  PanResponder,
  Animated
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useGameStore } from '../game/store/GameStore';
import { GameIntegration } from '../game/GameIntegration';
import { LapSystem } from '../game/LapSystem';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const GameScreen: React.FC = () => {
  const navigation = useNavigation();
  const { 
    car, 
    lapData, 
    isGameRunning, 
    isPaused,
    settings,
    startGame, 
    pauseGame, 
    resumeGame,
    setCarPosition,
    setCarVelocity,
    setCarAngle,
    accelerate,
    brake,
    turn
  } = useGameStore();

  const [gameIntegration, setGameIntegration] = useState<GameIntegration | null>(null);
  const [lapSystem, setLapSystem] = useState<LapSystem | null>(null);
  const [joystickPosition, setJoystickPosition] = useState({ x: 0, y: 0 });
  const [isJoystickActive, setIsJoystickActive] = useState(false);
  const gameLoopRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const carPosition = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const carRotation = useRef(new Animated.Value(0)).current;

  // Initialize game
  useEffect(() => {
    initializeGame();
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, []);

  // Update car position animation when store changes
  useEffect(() => {
    carPosition.setValue({ x: car.position.x, y: car.position.y });
    carRotation.setValue(car.angle);
  }, [car.position.x, car.position.y, car.angle]);

  const initializeGame = async () => {
    try {
      const game = new GameIntegration();
      await game.initialize();
      
      setGameIntegration(game);
      setLapSystem(game.getLapSystem());
      startGame();
      
      // Start game loop
      startGameLoop();
    } catch (error) {
      console.error('Failed to initialize game:', error);
    }
  };

  const startGameLoop = () => {
    const gameLoop = (currentTime: number) => {
      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;

      if (deltaTime > 0 && !isPaused) {
        // Update game integration
        if (gameIntegration) {
          gameIntegration.update(deltaTime);
        }
        
        // Update game store
        useGameStore.getState().update(deltaTime);
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    lastTimeRef.current = performance.now();
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  };

  // Touch controls
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      if (settings.inputMode === 'virtualJoystick') {
        setIsJoystickActive(true);
        setJoystickPosition({ x: locationX, y: locationY });
      }
      handleTouchInput(locationX, locationY, true);
    },
    onPanResponderMove: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      if (settings.inputMode === 'virtualJoystick') {
        setJoystickPosition({ x: locationX, y: locationY });
      }
      handleTouchInput(locationX, locationY, false);
    },
    onPanResponderRelease: () => {
      // Stop all inputs
      accelerate(0);
      brake(0);
      turn(0);
      if (settings.inputMode === 'virtualJoystick') {
        setIsJoystickActive(false);
        setJoystickPosition({ x: 0, y: 0 });
      }
    },
  });

  const handleTouchInput = (x: number, y: number, isStart: boolean) => {
    const centerX = screenWidth / 2;
    const centerY = screenHeight / 2;
    
    // Apply settings-based control mode
    if (settings.inputMode === 'touchZones') {
      // Touch zones mode - left side for steering, right side for acceleration
      if (x < centerX) {
        // Left side - steering
        const steerAmount = (centerX - x) / centerX;
        turn(steerAmount * 0.1);
      } else {
        // Right side - acceleration
        const accelAmount = (x - centerX) / centerX;
        if (accelAmount > 0.3) {
          accelerate(accelAmount * 100);
        } else if (accelAmount < -0.3) {
          brake(Math.abs(accelAmount) * 100);
        }
      }
    } else {
      // Virtual joystick mode - different control scheme
      const deltaX = x - centerX;
      const deltaY = y - centerY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      if (distance > settings.virtualJoystick.deadZone) {
        // Steering based on horizontal movement
        const steerAmount = Math.max(-1, Math.min(1, deltaX / (screenWidth * 0.3)));
        turn(steerAmount * 0.1);
        
        // Acceleration based on vertical movement
        const accelAmount = Math.max(-1, Math.min(1, -deltaY / (screenHeight * 0.3)));
        if (accelAmount > 0.1) {
          accelerate(accelAmount * 100);
        } else if (accelAmount < -0.1) {
          brake(Math.abs(accelAmount) * 100);
        }
      }
    }
  };

  const handlePause = () => {
    if (isPaused) {
      resumeGame();
    } else {
      pauseGame();
    }
  };

  const handleBackToMenu = () => {
    pauseGame();
    navigation.navigate('Menu' as never);
  };

  const formatTime = (timeMs: number): string => {
    const totalSeconds = Math.floor(timeMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((timeMs % 1000) / 10);

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  const formatSpeed = (speed: number): string => {
    // Convert game units to km/h (assuming 1 game unit = 1 meter)
    const kmh = (speed * 3.6).toFixed(0);
    return `${kmh} km/h`;
  };

  return (
    <View style={styles.container}>
      {/* Track Background */}
      <View style={styles.trackBackground}>
        {/* Tiled track pattern */}
        {Array.from({ length: 20 }, (_, i) => (
          <View key={i} style={[styles.trackTile, { 
            left: (i % 5) * 80, 
            top: Math.floor(i / 5) * 80 
          }]} />
        ))}
        
        {/* Track boundaries */}
        <View style={styles.trackBoundary} />
        
        {/* Car */}
        <Animated.View
          style={[
            styles.car,
            {
              transform: [
                { translateX: carPosition.x },
                { translateY: carPosition.y },
                { rotate: carRotation.interpolate({
                  inputRange: [0, Math.PI * 2],
                  outputRange: ['0deg', '360deg'],
                }) },
              ],
            },
          ]}
        />
      </View>

      {/* HUD Overlay */}
      <View style={styles.hudOverlay}>
        {/* Top HUD */}
        <View style={styles.topHud}>
          <View style={styles.hudLeft}>
            <Text style={styles.speedText}>{formatSpeed(car.speed)}</Text>
            <Text style={styles.speedLabel}>SPEED</Text>
          </View>
          
          <TouchableOpacity
            style={styles.pauseButton}
            onPress={handlePause}
          >
            <Text style={styles.pauseButtonText}>
              {isPaused ? '▶' : '⏸'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.menuButton}
            onPress={handleBackToMenu}
          >
            <Text style={styles.menuButtonText}>MENU</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom HUD */}
        <View style={styles.bottomHud}>
          <View style={styles.lapInfo}>
            <Text style={styles.lapCounter}>
              LAP {lapData.currentLap} / {lapData.totalLaps}
            </Text>
            <Text style={styles.currentLapTime}>
              {formatTime(lapData.currentLapTime)}
            </Text>
          </View>
          
          {lapData.bestLapTime > 0 && (
            <View style={styles.bestLapInfo}>
              <Text style={styles.bestLapLabel}>BEST LAP</Text>
              <Text style={styles.bestLapTime}>
                {formatTime(lapData.bestLapTime)}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Virtual Joystick Visual */}
      {settings.inputMode === 'virtualJoystick' && isJoystickActive && (
        <View style={styles.joystickContainer}>
          <View style={[styles.joystickBase, { 
            left: joystickPosition.x - settings.virtualJoystick.size / 2,
            top: joystickPosition.y - settings.virtualJoystick.size / 2,
          }]} />
          <View style={[styles.joystickKnob, { 
            left: joystickPosition.x - 15,
            top: joystickPosition.y - 15,
          }]} />
        </View>
      )}

      {/* Touch Controls */}
      <View style={styles.touchControls} {...panResponder.panHandlers}>
        <View style={styles.controlHint}>
          <Text style={styles.controlHintText}>
            {settings.inputMode === 'touchZones' 
              ? 'Touch left side to steer, right side to accelerate'
              : 'Touch and drag to control steering and acceleration'
            }
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
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
  car: {
    position: 'absolute',
    width: 30,
    height: 15,
    backgroundColor: '#FF4444',
    borderRadius: 3,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    left: screenWidth / 2 - 15,
    top: screenHeight / 2 - 7.5,
  },
  hudOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'box-none',
  },
  topHud: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  hudLeft: {
    alignItems: 'center',
  },
  speedText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  speedLabel: {
    color: '#CCCCCC',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  pauseButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  pauseButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  menuButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  menuButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  bottomHud: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  lapInfo: {
    alignItems: 'flex-start',
  },
  lapCounter: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  currentLapTime: {
    color: '#00FF00',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    marginTop: 4,
  },
  bestLapInfo: {
    alignItems: 'flex-end',
  },
  bestLapLabel: {
    color: '#CCCCCC',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  bestLapTime: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    marginTop: 4,
  },
  touchControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'box-none',
  },
  controlHint: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  controlHintText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  joystickContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
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

export default GameScreen;

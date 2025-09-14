import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Alert, Text } from 'react-native';
import { GameIntegration } from '../game/GameIntegration';
import { LapSystem, LapTime } from '../game/LapSystem';
import { LapHUD } from '../ui/LapHUD';
import { InputComponents } from '../game/input/InputComponents';
import { Button } from '../ui/Button';

export const GameScreenWithLaps: React.FC = () => {
  const [gameIntegration, setGameIntegration] = useState<GameIntegration | null>(null);
  const [lapSystem, setLapSystem] = useState<LapSystem | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const gameLoopRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    initializeGame();
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, []);

  const initializeGame = async () => {
    try {
      const game = new GameIntegration();
      
      // Set up lap system events
      const lapEvents = {
        onLapComplete: (lapTime: LapTime) => {
          console.log(`Lap ${lapTime.lapNumber} completed in ${lapTime.time}ms`);
          if (lapTime.isBestLap) {
            Alert.alert('New Best Lap!', `Lap ${lapTime.lapNumber}: ${formatTime(lapTime.time)}`);
          }
        },
        onBestLap: (lapTime: LapTime) => {
          console.log(`New best lap: ${lapTime.time}ms`);
        },
        onRaceStart: () => {
          console.log('Race started!');
          Alert.alert('Race Started!', 'Good luck!');
        },
        onRaceFinish: () => {
          console.log('Race finished!');
          Alert.alert('Race Finished!', 'Congratulations!');
        },
        onStartLineCross: (isForward: boolean) => {
          console.log(`Start line crossed: ${isForward ? 'forward' : 'backward'}`);
        },
      };

      await game.initialize(lapEvents);
      
      setGameIntegration(game);
      setLapSystem(game.getLapSystem());
      setIsInitialized(true);
      
      // Start game loop
      startGameLoop(game);
    } catch (error) {
      console.error('Failed to initialize game:', error);
      Alert.alert('Error', 'Failed to initialize game');
    }
  };

  const startGameLoop = (game: GameIntegration) => {
    const gameLoop = (currentTime: number) => {
      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;

      if (deltaTime > 0) {
        game.update(deltaTime);
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    lastTimeRef.current = performance.now();
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  };

  const formatTime = (timeMs: number): string => {
    const totalSeconds = Math.floor(timeMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((timeMs % 1000) / 10);

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  const handleControlsChange = (controls: any) => {
    if (gameIntegration) {
      gameIntegration.setControls(controls);
    }
  };

  const resetRace = () => {
    if (gameIntegration) {
      gameIntegration.resetCar();
      gameIntegration.resetLapSystem();
    }
  };

  if (!isInitialized || !lapSystem) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading Game...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Game HUD */}
      <LapHUD lapSystem={lapSystem} style={styles.hud} />
      
      {/* Input Controls */}
      <View style={styles.controlsContainer}>
        <InputComponents
          onControlsChange={handleControlsChange}
          style={styles.controls}
        />
      </View>

      {/* Reset Button */}
      <View style={styles.resetButtonContainer}>
        <Button
          title="Reset Race"
          onPress={resetRace}
          style={styles.resetButton}
        />
      </View>
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
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  hud: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  controls: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 10,
    padding: 20,
    margin: 20,
  },
  resetButtonContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 1000,
  },
  resetButton: {
    backgroundColor: '#FF4444',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
});

export default GameScreenWithLaps;

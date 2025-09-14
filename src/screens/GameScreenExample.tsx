import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useGameStore } from '../game/store/GameStore';
import { getGameManager } from '../game/GameManager';

const GameScreenExample: React.FC = () => {
  const navigation = useNavigation();
  const gameManager = getGameManager();
  
  // Subscribe to game state changes
  const car = useGameStore((state) => state.car);
  const lapData = useGameStore((state) => state.lapData);
  const score = useGameStore((state) => state.score);

  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    return () => {
      // Cleanup: stop the game when component unmounts
      if (gameStarted) {
        gameManager.stopGame();
      }
    };
  }, [gameStarted, gameManager]);

  const handleStartGame = () => {
    gameManager.startGame();
    setGameStarted(true);
  };

  const handleStopGame = () => {
    gameManager.stopGame();
    setGameStarted(false);
  };

  const handleAccelerate = () => {
    gameManager.accelerate(1);
  };

  const handleBrake = () => {
    gameManager.brake(1);
  };

  const handleTurnLeft = () => {
    gameManager.turn(-0.1);
  };

  const handleTurnRight = () => {
    gameManager.turn(0.1);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('Menu' as never)}
        >
          <Text style={styles.backButtonText}>← Back to Menu</Text>
        </TouchableOpacity>
        <Text style={styles.score}>Score: {score}</Text>
      </View>

      <View style={styles.gameArea}>
        <Text style={styles.gameText}>MiniRacer Game</Text>
        
        {/* Game State Display */}
        <View style={styles.gameStateContainer}>
          <Text style={styles.stateText}>
            Position: ({car.position.x.toFixed(1)}, {car.position.y.toFixed(1)})
          </Text>
          <Text style={styles.stateText}>
            Speed: {car.speed.toFixed(2)}
          </Text>
          <Text style={styles.stateText}>
            Angle: {(car.angle * 180 / Math.PI).toFixed(1)}°
          </Text>
          <Text style={styles.stateText}>
            Lap: {lapData.currentLap}/{lapData.totalLaps}
          </Text>
          <Text style={styles.stateText}>
            Lap Time: {(lapData.currentLapTime / 1000).toFixed(1)}s
          </Text>
        </View>

        {/* Game Controls */}
        <View style={styles.controlsContainer}>
          {!gameStarted ? (
            <TouchableOpacity style={styles.startButton} onPress={handleStartGame}>
              <Text style={styles.buttonText}>Start Game</Text>
            </TouchableOpacity>
          ) : (
            <>
              <View style={styles.controlRow}>
                <TouchableOpacity style={styles.controlButton} onPress={handleTurnLeft}>
                  <Text style={styles.buttonText}>← Turn Left</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.controlButton} onPress={handleTurnRight}>
                  <Text style={styles.buttonText}>Turn Right →</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.controlRow}>
                <TouchableOpacity style={styles.controlButton} onPress={handleAccelerate}>
                  <Text style={styles.buttonText}>Accelerate</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.controlButton} onPress={handleBrake}>
                  <Text style={styles.buttonText}>Brake</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.stopButton} onPress={handleStopGame}>
                <Text style={styles.buttonText}>Stop Game</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <Text style={styles.instruction}>
          {gameStarted 
            ? 'Game is running with 60 FPS fixed timestep!'
            : 'Press Start Game to begin the racing simulation'
          }
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#2a2a2a',
  },
  backButton: {
    padding: 12,
    backgroundColor: '#4a4a4a',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  score: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  gameArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  gameText: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  gameStateContainer: {
    backgroundColor: '#2a2a2a',
    padding: 20,
    borderRadius: 10,
    marginBottom: 30,
    width: '100%',
  },
  stateText: {
    color: '#ffffff',
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  controlsContainer: {
    width: '100%',
    marginBottom: 20,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  controlButton: {
    backgroundColor: '#4a4a4a',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 0.45,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#00aa00',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  stopButton: {
    backgroundColor: '#aa0000',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  instruction: {
    color: '#cccccc',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default GameScreenExample;

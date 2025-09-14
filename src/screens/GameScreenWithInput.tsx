import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useGameStore } from '../game/store/GameStore';
import { getGameManager } from '../game/GameManager';
import {
  InputControls,
  useInputIntegration,
} from '../game/input/InputComponents';

const GameScreenWithInput: React.FC = () => {
  const navigation = useNavigation();
  const gameManager = getGameManager();

  // Get screen dimensions
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  // Initialize input integration
  const inputIntegration = useInputIntegration(screenWidth, screenHeight);

  // Subscribe to game state changes
  const car = useGameStore(state => state.car);
  const lapData = useGameStore(state => state.lapData);
  const score = useGameStore(state => state.score);
  const settings = useGameStore(state => state.settings);

  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    // Update input integration when settings change
    inputIntegration.updateFromGameStore();
  }, [settings, inputIntegration]);

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

  const handleSwitchInputMode = () => {
    const newMode =
      settings.inputMode === 'touchZones' ? 'virtualJoystick' : 'touchZones';
    useGameStore.getState().setInputMode(newMode);
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
          <Text style={styles.stateText}>Speed: {car.speed.toFixed(2)}</Text>
          <Text style={styles.stateText}>
            Angle: {((car.angle * 180) / Math.PI).toFixed(1)}°
          </Text>
          <Text style={styles.stateText}>
            Lap: {lapData.currentLap}/{lapData.totalLaps}
          </Text>
          <Text style={styles.stateText}>
            Lap Time: {(lapData.currentLapTime / 1000).toFixed(1)}s
          </Text>
        </View>

        {/* Input Mode Display */}
        <View style={styles.inputModeContainer}>
          <Text style={styles.inputModeText}>
            Input Mode:{' '}
            {settings.inputMode === 'touchZones'
              ? 'Touch Zones'
              : 'Virtual Joystick'}
          </Text>
          <TouchableOpacity
            style={styles.switchButton}
            onPress={handleSwitchInputMode}
          >
            <Text style={styles.buttonText}>Switch Input</Text>
          </TouchableOpacity>
        </View>

        {/* Game Controls */}
        <View style={styles.controlsContainer}>
          {!gameStarted ? (
            <TouchableOpacity
              style={styles.startButton}
              onPress={handleStartGame}
            >
              <Text style={styles.buttonText}>Start Game</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.stopButton}
              onPress={handleStopGame}
            >
              <Text style={styles.buttonText}>Stop Game</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.instruction}>
          {gameStarted
            ? `Use ${settings.inputMode === 'touchZones' ? 'touch zones' : 'virtual joystick'} to control the car!`
            : 'Press Start Game to begin the racing simulation'}
        </Text>

        {/* Input Mode Instructions */}
        <View style={styles.instructionsContainer}>
          {settings.inputMode === 'touchZones' ? (
            <>
              <Text style={styles.instructionTitle}>Touch Zones Mode:</Text>
              <Text style={styles.instructionText}>
                • Left half of screen: Steer Left
              </Text>
              <Text style={styles.instructionText}>
                • Right half of screen: Steer Right
              </Text>
              <Text style={styles.instructionText}>
                • Blue button (bottom-right): Brake
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.instructionTitle}>
                Virtual Joystick Mode:
              </Text>
              <Text style={styles.instructionText}>
                • Drag left/right: Steer
              </Text>
              <Text style={styles.instructionText}>• Drag up: Accelerate</Text>
              <Text style={styles.instructionText}>• Drag down: Brake</Text>
            </>
          )}
        </View>
      </View>

      {/* Input Controls Overlay */}
      {gameStarted && (
        <InputControls
          inputIntegration={inputIntegration}
          screenWidth={screenWidth}
          screenHeight={screenHeight}
        />
      )}
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
    marginBottom: 20,
    width: '100%',
  },
  stateText: {
    color: '#ffffff',
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  inputModeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  inputModeText: {
    color: '#ffffff',
    fontSize: 16,
    marginRight: 10,
  },
  switchButton: {
    backgroundColor: '#4a4a4a',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  controlsContainer: {
    marginBottom: 20,
  },
  startButton: {
    backgroundColor: '#00aa00',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: 'center',
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
    marginBottom: 20,
  },
  instructionsContainer: {
    backgroundColor: '#2a2a2a',
    padding: 15,
    borderRadius: 8,
    width: '100%',
  },
  instructionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  instructionText: {
    color: '#cccccc',
    fontSize: 14,
    marginBottom: 5,
    textAlign: 'center',
  },
});

export default GameScreenWithInput;

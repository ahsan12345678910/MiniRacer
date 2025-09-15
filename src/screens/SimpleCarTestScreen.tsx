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
import { getSimpleGameIntegration } from '../game/SimpleGameIntegration';
import { TouchZones, ButtonsPad, VirtualJoystick } from '../game/input/InputManager';
import { controlsRef } from '../game/input/InputManager';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const SimpleCarTestScreen: React.FC = () => {
  // Refs for game state
  const gameIntegrationRef = useRef(getSimpleGameIntegration());
  const loopManagerRef = useRef(getSimpleGameLoopManager());
  const mountedRef = useRef(true);

  // React state
  const [ready, setReady] = useState(false);
  const [inputMode, setInputMode] = useState<'touchZones' | 'joystick'>('touchZones');
  const [carState, setCarState] = useState<any>(null);
  const [controls, setControls] = useState(controlsRef.current);
  const [logs, setLogs] = useState<string[]>([]);

  // Add log function
  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-9), `[${timestamp}] ${message}`]);
  }, []);

  // Initialize game on mount
  useEffect(() => {
    let mounted = true;
    
    (async () => {
      try {
        const gameIntegration = gameIntegrationRef.current;
        const loopManager = loopManagerRef.current;
        
        addLog('Initializing game...');
        
        // Set up game integration with loop manager
        loopManager.setGameIntegration(gameIntegration);
        
        // Initialize the game
        await gameIntegration.initialize();

        if (!mounted) return;
        
        setReady(true);
        addLog('✓ Game initialized successfully');
      } catch (error) {
        console.error('Failed to initialize game:', error);
        if (mounted) {
          addLog(`✗ Failed to initialize: ${error}`);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [addLog]);

  // Update car state and controls
  useEffect(() => {
    if (!ready) return;

    const updateState = () => {
      const gameIntegration = gameIntegrationRef.current;
      const currentCarState = gameIntegration.getCarState();
      const currentControls = controlsRef.current;
      
      setCarState(currentCarState);
      setControls(currentControls);
    };

    const interval = setInterval(updateState, 100); // Update every 100ms
    return () => clearInterval(interval);
  }, [ready]);

  // Handle focus/blur
  useFocusEffect(
    useCallback(() => {
      mountedRef.current = true;
      
      if (ready) {
        const loopManager = loopManagerRef.current;
        loopManager.start();
        addLog('Game started');
      }

      return () => {
        mountedRef.current = false;
        const loopManager = loopManagerRef.current;
        loopManager.pause();
        addLog('Game paused');
      };
    }, [ready, addLog])
  );

  // Handle input mode change
  const handleInputModeChange = useCallback((mode: 'touchZones' | 'joystick') => {
    setInputMode(mode);
    addLog(`Input mode changed to: ${mode}`);
  }, [addLog]);

  // Test functions
  const testAccelerate = () => {
    const gameIntegration = gameIntegrationRef.current;
    gameIntegration.setTestControls({ steer: 0, throttle: 1, brake: 0 });
    addLog('Test: Accelerate');
  };

  const testSteerLeft = () => {
    const gameIntegration = gameIntegrationRef.current;
    gameIntegration.setTestControls({ steer: -1, throttle: 0.5, brake: 0 });
    addLog('Test: Steer Left');
  };

  const testSteerRight = () => {
    const gameIntegration = gameIntegrationRef.current;
    gameIntegration.setTestControls({ steer: 1, throttle: 0.5, brake: 0 });
    addLog('Test: Steer Right');
  };

  const testBrake = () => {
    const gameIntegration = gameIntegrationRef.current;
    gameIntegration.setTestControls({ steer: 0, throttle: 0, brake: 1 });
    addLog('Test: Brake');
  };

  const resetCar = () => {
    const gameIntegration = gameIntegrationRef.current;
    gameIntegration.resetCar();
    gameIntegration.setTestControls({ steer: 0, throttle: 0, brake: 0 });
    addLog('Car reset to start position');
  };

  const clearLogs = () => {
    setLogs([]);
  };

  if (!ready) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading Simple Car Test...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Simple Car Movement Test</Text>
        <Text style={styles.subtitle}>
          Position: ({carState?.x?.toFixed(1) || '0'}, {carState?.y?.toFixed(1) || '0'})
        </Text>
        <Text style={styles.subtitle}>
          Speed: {carState?.speed?.toFixed(1) || '0'} m/s
        </Text>
      </View>

      {/* Test Controls */}
      <View style={styles.testControlsContainer}>
        <Text style={styles.sectionTitle}>Test Controls:</Text>
        <View style={styles.testButtonsRow}>
          <TouchableOpacity style={styles.testButton} onPress={testAccelerate}>
            <Text style={styles.testButtonText}>Accelerate</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.testButton} onPress={testSteerLeft}>
            <Text style={styles.testButtonText}>Steer Left</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.testButtonsRow}>
          <TouchableOpacity style={styles.testButton} onPress={testSteerRight}>
            <Text style={styles.testButtonText}>Steer Right</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.testButton} onPress={testBrake}>
            <Text style={styles.testButtonText}>Brake</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.resetButton} onPress={resetCar}>
          <Text style={styles.resetButtonText}>Reset Car</Text>
        </TouchableOpacity>
      </View>

      {/* Current Controls */}
      <View style={styles.controlsContainer}>
        <Text style={styles.sectionTitle}>Current Controls:</Text>
        <Text style={styles.controlText}>
          Steer: {controls.steer.toFixed(2)} | Throttle: {controls.throttle.toFixed(2)} | Brake: {controls.brake.toFixed(2)}
        </Text>
      </View>

      {/* Car State */}
      {carState && (
        <View style={styles.carStateContainer}>
          <Text style={styles.sectionTitle}>Car State:</Text>
          <Text style={styles.stateText}>
            Position: ({carState.x.toFixed(2)}, {carState.y.toFixed(2)})
          </Text>
          <Text style={styles.stateText}>
            Velocity: ({carState.vx.toFixed(2)}, {carState.vy.toFixed(2)})
          </Text>
          <Text style={styles.stateText}>
            Speed: {carState.speed.toFixed(2)} m/s
          </Text>
          <Text style={styles.stateText}>
            Angle: {(carState.angle * 180 / Math.PI).toFixed(1)}°
          </Text>
        </View>
      )}

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

      {/* Logs */}
      <View style={styles.logsContainer}>
        <View style={styles.logsHeader}>
          <Text style={styles.sectionTitle}>Logs:</Text>
          <TouchableOpacity style={styles.clearButton} onPress={clearLogs}>
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>
        {logs.map((log, index) => (
          <Text key={index} style={styles.logText}>
            {log}
          </Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2C3E50',
    padding: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 15,
    borderRadius: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#BDC3C7',
  },
  testControlsContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  testButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  testButton: {
    backgroundColor: '#3498DB',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
  },
  testButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  resetButton: {
    backgroundColor: '#E74C3C',
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  resetButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  controlsContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  controlText: {
    color: '#BDC3C7',
    fontSize: 14,
  },
  carStateContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  stateText: {
    color: '#BDC3C7',
    fontSize: 12,
    marginBottom: 3,
  },
  inputContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    minHeight: 100,
  },
  logsContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 15,
    borderRadius: 10,
    flex: 1,
  },
  logsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  clearButton: {
    backgroundColor: '#95A5A6',
    padding: 5,
    borderRadius: 3,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 12,
  },
  logText: {
    color: '#BDC3C7',
    fontSize: 11,
    marginBottom: 2,
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
    marginTop: 20,
    textAlign: 'center',
  },
});

export default SimpleCarTestScreen;

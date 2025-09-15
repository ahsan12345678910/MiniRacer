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

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const SimpleRaceScreen: React.FC = () => {
  // Refs for game state
  const raceManagerRef = useRef(getSimpleRaceManager());
  const loopManagerRef = useRef(getSimpleGameLoopManager());
  const mountedRef = useRef(true);

  // React state
  const [ready, setReady] = useState(false);
  const [inputMode, setInputMode] = useState<'touchZones' | 'joystick'>('touchZones');
  const [raceState, setRaceState] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);

  // Add log function
  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-9), `[${timestamp}] ${message}`]);
  }, []);

  // Initialize race on mount
  useEffect(() => {
    let mounted = true;
    
    (async () => {
      try {
        const raceManager = raceManagerRef.current;
        const loopManager = loopManagerRef.current;
        
        addLog('Initializing race...');
        
        // Set up race manager with loop manager
        loopManager.setGameIntegration(raceManager);
        
        if (mounted) {
          setReady(true);
          addLog('✓ Race initialized successfully');
        }
      } catch (error) {
        console.error('Failed to initialize race:', error);
        if (mounted) {
          addLog(`✗ Failed to initialize: ${error}`);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [addLog]);

  // Update race state
  useEffect(() => {
    if (!ready) return;

    const updateRaceState = () => {
      const raceManager = raceManagerRef.current;
      const currentState = raceManager.getState();
      
      setRaceState(currentState);
    };

    const interval = setInterval(updateRaceState, 100); // Update every 100ms
    return () => clearInterval(interval);
  }, [ready]);

  // Handle focus/blur
  useFocusEffect(
    useCallback(() => {
      mountedRef.current = true;
      
      if (ready) {
        const loopManager = loopManagerRef.current;
        loopManager.start();
        addLog('Race loop started');
      }

      return () => {
        mountedRef.current = false;
        const loopManager = loopManagerRef.current;
        loopManager.pause();
        addLog('Race loop paused');
      };
    }, [ready, addLog])
  );

  // Handle input mode change
  const handleInputModeChange = useCallback((mode: 'touchZones' | 'joystick') => {
    setInputMode(mode);
    addLog(`Input mode changed to: ${mode}`);
  }, [addLog]);

  // Race control functions
  const startRace = () => {
    const raceManager = raceManagerRef.current;
    raceManager.startRace();
    addLog('🏁 Race started!');
  };

  const stopRace = () => {
    const raceManager = raceManagerRef.current;
    raceManager.stopRace();
    addLog('🛑 Race stopped!');
  };

  const resetRace = () => {
    const raceManager = raceManagerRef.current;
    raceManager.resetRace();
    addLog('🔄 Race reset!');
  };

  const clearLogs = () => {
    setLogs([]);
  };

  if (!ready) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading Simple Race...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Simple Race Test</Text>
        <Text style={styles.subtitle}>
          Race Started: {raceState?.raceStarted ? 'Yes' : 'No'}
        </Text>
        <Text style={styles.subtitle}>
          Race Time: {raceState?.raceTime?.toFixed(1) || '0.0'}s
        </Text>
      </View>

      {/* Race Controls */}
      <View style={styles.raceControlsContainer}>
        <Text style={styles.sectionTitle}>Race Controls:</Text>
        <View style={styles.raceButtonsRow}>
          <TouchableOpacity style={styles.startButton} onPress={startRace}>
            <Text style={styles.buttonText}>Start Race</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.stopButton} onPress={stopRace}>
            <Text style={styles.buttonText}>Stop Race</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.resetButton} onPress={resetRace}>
          <Text style={styles.buttonText}>Reset Race</Text>
        </TouchableOpacity>
      </View>

      {/* Car Positions */}
      <View style={styles.positionsContainer}>
        <Text style={styles.sectionTitle}>Car Positions:</Text>
        <Text style={styles.positionText}>
          Player: ({raceState?.playerPosition?.x?.toFixed(1) || '0'}, {raceState?.playerPosition?.y?.toFixed(1) || '0'})
        </Text>
        {raceState?.aiPositions?.map((pos: any, index: number) => (
          <Text key={index} style={styles.positionText}>
            AI {index + 1}: ({pos.x?.toFixed(1) || '0'}, {pos.y?.toFixed(1) || '0'})
          </Text>
        ))}
      </View>

      {/* Car States */}
      {raceState && (
        <View style={styles.carStatesContainer}>
          <Text style={styles.sectionTitle}>Car States:</Text>
          
          {/* Player Car */}
          <View style={styles.carStateSection}>
            <Text style={styles.carStateTitle}>Player Car:</Text>
            <Text style={styles.carStateText}>
              Speed: {raceState.playerCar?.getState?.()?.speed?.toFixed(1) || '0.0'} m/s
            </Text>
            <Text style={styles.carStateText}>
              Angle: {(raceState.playerCar?.getState?.()?.angle * 180 / Math.PI)?.toFixed(1) || '0.0'}°
            </Text>
          </View>

          {/* AI Cars */}
          {raceState.aiCars?.map((car: any, index: number) => (
            <View key={index} style={styles.carStateSection}>
              <Text style={styles.carStateTitle}>AI Car {index + 1}:</Text>
              <Text style={styles.carStateText}>
                Speed: {car.getState?.()?.speed?.toFixed(1) || '0.0'} m/s
              </Text>
              <Text style={styles.carStateText}>
                Angle: {(car.getState?.()?.angle * 180 / Math.PI)?.toFixed(1) || '0.0'}°
              </Text>
            </View>
          ))}
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
  raceControlsContainer: {
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
  raceButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
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
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  positionsContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  positionText: {
    color: '#BDC3C7',
    fontSize: 14,
    marginBottom: 3,
  },
  carStatesContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  carStateSection: {
    marginBottom: 10,
  },
  carStateTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  carStateText: {
    color: '#BDC3C7',
    fontSize: 12,
    marginBottom: 2,
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

export default SimpleRaceScreen;

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { getGameIntegration } from '../game/GameIntegration';
import { PowerUpInstance } from '../game/powerups/PowerUpTypes';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const SimplePowerUpDemo: React.FC = () => {
  const gameIntegrationRef = useRef(getGameIntegration());
  const [ready, setReady] = useState(false);
  const [activePowerUps, setActivePowerUps] = useState<PowerUpInstance[]>([]);
  const [carPowerUpState, setCarPowerUpState] = useState<any>(null);
  const [testResults, setTestResults] = useState<string[]>([]);

  // Initialize game
  useEffect(() => {
    let mounted = true;
    
    (async () => {
      try {
        const gameIntegration = gameIntegrationRef.current;
        await gameIntegration.initialize();
        
        if (mounted) {
          setReady(true);
          addTestResult('✓ Game initialized successfully');
        }
      } catch (error) {
        console.error('Failed to initialize:', error);
        if (mounted) {
          addTestResult(`✗ Failed to initialize: ${error}`);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // Update power-up state
  useEffect(() => {
    if (!ready) return;

    const updatePowerUpState = () => {
      const gameIntegration = gameIntegrationRef.current;
      const powerUps = gameIntegration.getActivePowerUps();
      const carPowerUpState = gameIntegration.getCarPowerUpState('player');
      
      setActivePowerUps(powerUps);
      setCarPowerUpState(carPowerUpState);
    };

    const interval = setInterval(updatePowerUpState, 500); // Update every 500ms
    return () => clearInterval(interval);
  }, [ready]);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev.slice(-9), result]); // Keep last 10 results
  };

  const testPowerUpSpawning = () => {
    addTestResult('Testing power-up spawning...');
    const gameIntegration = gameIntegrationRef.current;
    const powerUps = gameIntegration.getActivePowerUps();
    addTestResult(`Found ${powerUps.length} active power-ups`);
  };

  const testPowerUpCollection = () => {
    addTestResult('Testing power-up collection...');
    const gameIntegration = gameIntegrationRef.current;
    const carState = gameIntegration.getCarState();
    
    // Move car to a power-up position if available
    if (activePowerUps.length > 0) {
      const powerUp = activePowerUps[0];
      addTestResult(`Moving car to power-up at (${powerUp.position.x.toFixed(1)}, ${powerUp.position.y.toFixed(1)})`);
      
      // Simulate collection by setting car position
      gameIntegration.setControls({
        steer: 0,
        throttle: 0,
        brake: 0,
      });
    } else {
      addTestResult('No power-ups available for collection test');
    }
  };

  const clearPowerUps = () => {
    const gameIntegration = gameIntegrationRef.current;
    gameIntegration.clearPowerUps();
    addTestResult('Cleared all power-ups');
  };

  const resetCar = () => {
    const gameIntegration = gameIntegrationRef.current;
    gameIntegration.resetCar();
    addTestResult('Reset car to start position');
  };

  if (!ready) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading Power-up Demo...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Power-up System Demo</Text>
        <Text style={styles.subtitle}>
          Active Power-ups: {activePowerUps.length}
        </Text>
      </View>

      {/* Test Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity style={styles.button} onPress={testPowerUpSpawning}>
          <Text style={styles.buttonText}>Test Spawning</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={testPowerUpCollection}>
          <Text style={styles.buttonText}>Test Collection</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={clearPowerUps}>
          <Text style={styles.buttonText}>Clear Power-ups</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={resetCar}>
          <Text style={styles.buttonText}>Reset Car</Text>
        </TouchableOpacity>
      </View>

      {/* Power-up List */}
      <View style={styles.powerUpList}>
        <Text style={styles.sectionTitle}>Active Power-ups:</Text>
        {activePowerUps.map((powerUp, index) => (
          <View key={powerUp.id} style={styles.powerUpItem}>
            <Text style={styles.powerUpText}>
              {index + 1}. {powerUp.config.name} at ({powerUp.position.x.toFixed(1)}, {powerUp.position.y.toFixed(1)})
            </Text>
          </View>
        ))}
        {activePowerUps.length === 0 && (
          <Text style={styles.noPowerUps}>No active power-ups</Text>
        )}
      </View>

      {/* Car Power-up State */}
      {carPowerUpState && (
        <View style={styles.carStateContainer}>
          <Text style={styles.sectionTitle}>Car Power-up State:</Text>
          <Text style={styles.stateText}>
            Speed Multiplier: {carPowerUpState.speedBoostMultiplier?.toFixed(2) || '1.00'}x
          </Text>
          <Text style={styles.stateText}>
            Max Speed Increase: {carPowerUpState.maxSpeedIncrease?.toFixed(1) || '0.0'} m/s
          </Text>
          <Text style={styles.stateText}>
            Acceleration Boost: {carPowerUpState.accelerationBoost?.toFixed(1) || '0.0'} m/s²
          </Text>
          <Text style={styles.stateText}>
            Friction Reduction: {carPowerUpState.frictionReduction?.toFixed(2) || '0.00'}
          </Text>
          <Text style={styles.stateText}>
            Invulnerable: {carPowerUpState.isInvulnerable ? 'Yes' : 'No'}
          </Text>
          <Text style={styles.stateText}>
            Active Power-ups: {carPowerUpState.activePowerUps?.size || 0}
          </Text>
        </View>
      )}

      {/* Test Results */}
      <View style={styles.testResultsContainer}>
        <Text style={styles.sectionTitle}>Test Results:</Text>
        {testResults.map((result, index) => (
          <Text key={index} style={styles.testResult}>
            {result}
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
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#BDC3C7',
  },
  controlsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#3498DB',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    minWidth: '45%',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  powerUpList: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  powerUpItem: {
    marginBottom: 5,
  },
  powerUpText: {
    color: '#BDC3C7',
    fontSize: 14,
  },
  noPowerUps: {
    color: '#7F8C8D',
    fontStyle: 'italic',
  },
  carStateContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  stateText: {
    color: '#BDC3C7',
    fontSize: 14,
    marginBottom: 3,
  },
  testResultsContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 15,
    borderRadius: 10,
    flex: 1,
  },
  testResult: {
    color: '#BDC3C7',
    fontSize: 12,
    marginBottom: 2,
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
    marginTop: 20,
    textAlign: 'center',
  },
});

export default SimplePowerUpDemo;

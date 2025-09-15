import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getGameLoopManager } from '../game/loop/GameLoopManager';
import { getGameIntegration } from '../game/GameIntegration';
import { controlsRef } from '../game/input/InputManager';
import { useSetSnapshot, useSetPaused, usePaused } from '../game/state/UIState';
import { TouchZones, ButtonsPad, VirtualJoystick } from '../game/input/InputManager';
import { HUD } from '../ui/HUD';
import { PowerUpRenderer, PowerUpHUD } from '../game/powerups/PowerUpRenderer';
import { PowerUpInstance } from '../game/powerups/PowerUpTypes';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const PowerUpGameScreen: React.FC = () => {
  // Refs for game state
  const gameIntegrationRef = useRef(getGameIntegration());
  const loopManagerRef = useRef(getGameLoopManager());
  const mountedRef = useRef(true);

  // React state
  const [ready, setReady] = useState(false);
  const [inputMode, setInputMode] = useState<'touchZones' | 'joystick'>('touchZones');
  const [activePowerUps, setActivePowerUps] = useState<PowerUpInstance[]>([]);
  const [carPowerUpState, setCarPowerUpState] = useState<any>(null);

  // UI store
  const setSnapshot = useSetSnapshot();
  const setPaused = useSetPaused();
  const paused = usePaused();

  // Initialize game on mount
  useEffect(() => {
    let mounted = true;
    
    (async () => {
      try {
        const gameIntegration = gameIntegrationRef.current;
        const loopManager = loopManagerRef.current;
        
        // Set up game integration with loop manager
        loopManager.setGameIntegration(gameIntegration);
        
        // Initialize the game
        await gameIntegration.initialize({
          onLapComplete: (lapNumber: number, lapTime: number) => {
            console.log(`Lap ${lapNumber} completed in ${lapTime.toFixed(2)}s`);
          },
          onRaceComplete: (totalTime: number) => {
            console.log(`Race completed in ${totalTime.toFixed(2)}s`);
          },
        });

        if (!mounted) return;
        
        setReady(true);
        console.log('PowerUpGameScreen: Game initialized successfully');
      } catch (error) {
        console.error('PowerUpGameScreen: Failed to initialize game:', error);
        if (mounted) {
          setReady(false);
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

    const interval = setInterval(updatePowerUpState, 100); // Update every 100ms
    return () => clearInterval(interval);
  }, [ready]);

  // Handle focus/blur
  useFocusEffect(
    useCallback(() => {
      mountedRef.current = true;
      
      if (ready) {
        const loopManager = loopManagerRef.current;
        loopManager.start();
        setPaused(false);
        console.log('PowerUpGameScreen: Game started');
      }

      return () => {
        mountedRef.current = false;
        const loopManager = loopManagerRef.current;
        loopManager.pause();
        setPaused(true);
        console.log('PowerUpGameScreen: Game paused');
      };
    }, [ready, setPaused])
  );

  // Handle input mode change
  const handleInputModeChange = useCallback((mode: 'touchZones' | 'joystick') => {
    setInputMode(mode);
  }, []);

  // Render power-ups on screen
  const renderPowerUps = () => {
    if (!ready) return null;

    const gameIntegration = gameIntegrationRef.current;
    
    return activePowerUps.map((powerUp) => {
      const screenPos = gameIntegration.worldToScreen(
        powerUp.position.x,
        powerUp.position.y
      );
      
      return (
        <PowerUpRenderer
          key={powerUp.id}
          powerUp={powerUp}
          screenX={screenPos.x}
          screenY={screenPos.y}
          scale={1.0}
        />
      );
    });
  };

  if (!ready) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading Power-up Game...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Game View */}
      <View style={styles.gameView}>
        {/* Power-ups */}
        {renderPowerUps()}
        
        {/* Power-up HUD */}
        <PowerUpHUD
          activePowerUps={carPowerUpState?.activePowerUps ? Array.from(carPowerUpState.activePowerUps.values()) : []}
          screenWidth={screenWidth}
          screenHeight={screenHeight}
        />
        
        {/* Main HUD */}
        <HUD />
      </View>

      {/* Input Controls */}
      <View style={styles.controlsContainer}>
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

      {/* Debug Info */}
      {__DEV__ && (
        <View style={styles.debugContainer}>
          <Text style={styles.debugText}>
            Power-ups: {activePowerUps.length}
          </Text>
          <Text style={styles.debugText}>
            Speed Boost: {carPowerUpState?.speedBoostMultiplier?.toFixed(2) || '1.00'}x
          </Text>
          <Text style={styles.debugText}>
            Invulnerable: {carPowerUpState?.isInvulnerable ? 'Yes' : 'No'}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2C3E50',
  },
  gameView: {
    flex: 1,
    position: 'relative',
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
    marginTop: 20,
    textAlign: 'center',
  },
  debugContainer: {
    position: 'absolute',
    top: 100,
    left: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 5,
  },
  debugText: {
    color: 'white',
    fontSize: 12,
    marginBottom: 2,
  },
});

export default PowerUpGameScreen;

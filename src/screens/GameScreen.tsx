import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getSimpleGameLoopManager } from '../game/loop/SimpleGameLoopManager';
import { getSimpleRaceManager } from '../game/SimpleRaceManager';
import { TouchZones, VirtualJoystick } from '../game/input/InputManager';
import { createCamera, DEFAULT_CAMERA_SETTINGS } from '../game/camera/Camera';
import { createRaceTrack } from '../game/track/TrackDesign';
import { TrackRenderer } from '../game/track/TrackRenderer';
import { createSimpleRealisticTrack } from '../game/track/SimpleRealisticTrack';
import { SimpleRealisticTrackRenderer } from '../game/track/SimpleRealisticTrackRenderer';
import { createProfessionalTrack } from '../game/track/ProfessionalTrackDesign';
import { ProfessionalTrackRenderer } from '../game/track/ProfessionalTrackRenderer';
import { createStraightTrack } from '../game/track/StraightTrackDesign';
import { StraightTrackRenderer } from '../game/track/StraightTrackRenderer';
import { LapTimeHUD } from '../ui/LapTimeHUD';
import { useLapTimeHUD } from '../hooks/useLapTimeHUD';
import { useSimpleAudio } from '../audio/useSimpleAudio';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Helper function to format time
const formatTime = (timeMs: number): string => {
  const totalSeconds = Math.floor(timeMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = Math.floor((timeMs % 1000) / 10);

  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
};

const GameScreen: React.FC = () => {
  const navigation = useNavigation();
  // Refs for game state
  const raceManagerRef = useRef(getSimpleRaceManager());
  const loopManagerRef = useRef(getSimpleGameLoopManager());
  const cameraRef = useRef(createCamera(screenWidth, screenHeight, {
    ...DEFAULT_CAMERA_SETTINGS,
    followSpeed: 6.0, // Smooth following
    defaultZoom: 0.8, // Slightly zoomed out to see more
  }));
  const mountedRef = useRef(true);

  // React state
  const [ready, setReady] = useState(false);
  const [inputMode, setInputMode] = useState<'touchZones' | 'joystick'>('touchZones');
  const [raceState, setRaceState] = useState<any>(null);
  const [track] = useState(createRaceTrack());
  const [realisticTrack] = useState(createSimpleRealisticTrack());
  const [professionalTrack] = useState(createProfessionalTrack());
  const [straightTrack] = useState(createStraightTrack());
  const [isPaused, setIsPaused] = useState(false);
  
  // HUD hook
  const { hudData, isActive, startHUDUpdates, stopHUDUpdates, resetHUD } = useLapTimeHUD(50); // 20 FPS updates
  
  // Simple audio hook for engine sound
  const { playEngineStart, stopEngineSound, pauseAllAudio, resumeAllAudio } = useSimpleAudio();

  // Pause button handler
  const handlePauseToggle = () => {
    const raceManager = raceManagerRef.current;
    if (raceManager) {
      raceManager.togglePause();
      const isPaused = raceManager.isRacePaused();
      setIsPaused(isPaused);
      
      // Handle audio based on pause state
      if (isPaused) {
        pauseAllAudio();
      } else {
        resumeAllAudio();
      }
      
      console.log('⏸️ GameScreen: Pause toggled, isPaused:', isPaused);
    }
  };

  // Menu button handler
  const handleMenuPress = () => {
    console.log('🏠 GameScreen: Returning to main menu');
    
    // Stop HUD updates
    stopHUDUpdates();
    
    // Stop all audio
    stopEngineSound();
    
    // Stop the game loop
    if (loopManagerRef.current) {
      loopManagerRef.current.stop();
    }
    
    // Reset the race
    if (raceManagerRef.current) {
      raceManagerRef.current.resetRace();
    }
    
    // Navigate back to main menu
    navigation.navigate('Menu' as never);
  };

  // Initialize race on mount
  useEffect(() => {
    let mounted = true;
    
    (async () => {
      try {
        const raceManager = raceManagerRef.current;
        const loopManager = loopManagerRef.current;
        
        // Set up race manager with loop manager
        loopManager.setGameIntegration(raceManager);
        
        // Start the race automatically
        raceManager.startRace();
        console.log('🏁 GameScreen: Race started automatically');
        
        // Start engine sound
        playEngineStart();
        
        // Start HUD updates
        startHUDUpdates();
        console.log('🏁 GameScreen: HUD updates started!');
        
        if (mounted) {
          setReady(true);
        }
      } catch (error) {
        console.error('Failed to initialize race:', error);
      }
    })();

    return () => {
      mounted = false;
      stopHUDUpdates();
      stopEngineSound();
    };
  }, []);

  // Update race state and camera
  useEffect(() => {
    if (!ready) return;

    const updateRaceState = () => {
      const raceManager = raceManagerRef.current;
      const currentState = raceManager.getState();
      
      // Update camera to follow player car
      if (currentState.playerPosition) {
        cameraRef.current.setTarget(currentState.playerPosition.x, currentState.playerPosition.y);
        cameraRef.current.update(16); // ~60fps
      }
      
      // Sync pause state
      setIsPaused(currentState.isPaused);
      
      setRaceState(currentState);
    };

    const interval = setInterval(updateRaceState, 16); // Update every 16ms (~60fps)
    return () => clearInterval(interval);
  }, [ready]);

  // Handle focus/blur
  useFocusEffect(
    useCallback(() => {
      mountedRef.current = true;
      
      if (ready) {
        const loopManager = loopManagerRef.current;
        loopManager.start();
      }

      return () => {
        mountedRef.current = false;
        const loopManager = loopManagerRef.current;
        loopManager.pause();
        stopEngineSound();
      };
    }, [ready])
  );

  // Handle input mode change
  const handleInputModeChange = useCallback((mode: 'touchZones' | 'joystick') => {
    setInputMode(mode);
  }, []);


  // Helper function to convert world coordinates to screen coordinates
  const worldToScreen = (worldX: number, worldY: number) => {
    return cameraRef.current.worldToScreen(worldX, worldY);
  };

  if (!ready) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading Game...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Game View */}
      <View style={styles.gameView}>
        {/* Realistic Track Background */}
        <View style={styles.trackBackground}>
          {/* Render the realistic race track */}
          <StraightTrackRenderer
            track={straightTrack}
            cameraX={cameraRef.current.getState().x}
            cameraY={cameraRef.current.getState().y}
            screenWidth={screenWidth}
            screenHeight={screenHeight}
          />

          {/* Player Car */}
          {raceState && raceState.playerPosition && (
            <View
              style={[
                styles.carBody,
                styles.playerCar,
                {
                  left: worldToScreen(raceState.playerPosition.x, raceState.playerPosition.y).x - 20,
                  top: worldToScreen(raceState.playerPosition.x, raceState.playerPosition.y).y - 10,
                  transform: [{ rotate: `${(raceState.playerCar?.getState?.()?.angle || 0) * 180 / Math.PI}deg` }],
                },
              ]}
            >
              <View style={styles.carWindows} />
              <View style={[styles.carHeadlight, styles.carHeadlightLeft]} />
              <View style={[styles.carHeadlight, styles.carHeadlightRight]} />
              <View style={[styles.carWheel, styles.carWheelFrontLeft]} />
              <View style={[styles.carWheel, styles.carWheelFrontRight]} />
              <View style={[styles.carWheel, styles.carWheelRearLeft]} />
              <View style={[styles.carWheel, styles.carWheelRearRight]} />
              <View style={styles.carSpoiler} />
            </View>
          )}

          {/* AI Cars */}
          {raceState?.aiPositions?.map((pos: any, index: number) => {
            const aiCar = raceState.aiCars?.[index];
            const carColors = ['#4444FF', '#44FF44', '#FFFF44']; // Blue, Green, Yellow
            const carColor = carColors[index] || '#FF44FF';
            const screenPos = worldToScreen(pos.x, pos.y);
            
            // Debug AI car rendering
            console.log(`🚗 AI Car ${index}:`, {
              position: pos,
              screenPos: screenPos,
              aiCar: aiCar,
              carColor: carColor
            });
            
            return (
              <View
                key={`ai-car-${index}`}
                style={[
                  styles.carBody,
                  styles.aiCar, // Add AI car specific styling
                  {
                    backgroundColor: carColor,
                    borderColor: carColor,
                    left: screenPos.x - 20,
                    top: screenPos.y - 10,
                    transform: [{ rotate: `${(aiCar?.getState?.()?.angle || 0) * 180 / Math.PI}deg` }],
                  },
                ]}
              >
                <View style={styles.carWindows} />
                <View style={[styles.carHeadlight, styles.carHeadlightLeft]} />
                <View style={[styles.carHeadlight, styles.carHeadlightRight]} />
                <View style={[styles.carWheel, styles.carWheelFrontLeft]} />
                <View style={[styles.carWheel, styles.carWheelFrontRight]} />
                <View style={[styles.carWheel, styles.carWheelRearLeft]} />
                <View style={[styles.carWheel, styles.carWheelRearRight]} />
                <View style={styles.carSpoiler} />
              </View>
            );
          })}
          
          {/* Fallback AI Cars - Always show 5 AI cars even if race state is not updated */}
          {(!raceState?.aiPositions || raceState.aiPositions.length === 0) && (
            <>
              {/* AI Car 1 - Blue */}
              <View
                key="fallback-ai-car-0"
                style={[
                  styles.carBody,
                  styles.aiCar,
                  {
                    backgroundColor: '#4444FF',
                    borderColor: '#4444FF',
                    left: worldToScreen(80, 150).x - 20,
                    top: worldToScreen(80, 150).y - 10,
                  },
                ]}
              >
                <View style={styles.carWindows} />
                <View style={[styles.carHeadlight, styles.carHeadlightLeft]} />
                <View style={[styles.carHeadlight, styles.carHeadlightRight]} />
                <View style={[styles.carWheel, styles.carWheelFrontLeft]} />
                <View style={[styles.carWheel, styles.carWheelFrontRight]} />
                <View style={[styles.carWheel, styles.carWheelRearLeft]} />
                <View style={[styles.carWheel, styles.carWheelRearRight]} />
                <View style={styles.carSpoiler} />
              </View>
              
              {/* AI Car 2 - Green */}
              <View
                key="fallback-ai-car-1"
                style={[
                  styles.carBody,
                  styles.aiCar,
                  {
                    backgroundColor: '#44FF44',
                    borderColor: '#44FF44',
                    left: worldToScreen(110, 150).x - 20,
                    top: worldToScreen(110, 150).y - 10,
                  },
                ]}
              >
                <View style={styles.carWindows} />
                <View style={[styles.carHeadlight, styles.carHeadlightLeft]} />
                <View style={[styles.carHeadlight, styles.carHeadlightRight]} />
                <View style={[styles.carWheel, styles.carWheelFrontLeft]} />
                <View style={[styles.carWheel, styles.carWheelFrontRight]} />
                <View style={[styles.carWheel, styles.carWheelRearLeft]} />
                <View style={[styles.carWheel, styles.carWheelRearRight]} />
                <View style={styles.carSpoiler} />
              </View>
              
              {/* AI Car 3 - Yellow */}
              <View
                key="fallback-ai-car-2"
                style={[
                  styles.carBody,
                  styles.aiCar,
                  {
                    backgroundColor: '#FFFF44',
                    borderColor: '#FFFF44',
                    left: worldToScreen(140, 150).x - 20,
                    top: worldToScreen(140, 150).y - 10,
                  },
                ]}
              >
                <View style={styles.carWindows} />
                <View style={[styles.carHeadlight, styles.carHeadlightLeft]} />
                <View style={[styles.carHeadlight, styles.carHeadlightRight]} />
                <View style={[styles.carWheel, styles.carWheelFrontLeft]} />
                <View style={[styles.carWheel, styles.carWheelFrontRight]} />
                <View style={[styles.carWheel, styles.carWheelRearLeft]} />
                <View style={[styles.carWheel, styles.carWheelRearRight]} />
                <View style={styles.carSpoiler} />
              </View>
              
              {/* AI Car 4 - Red */}
              <View
                key="fallback-ai-car-3"
                style={[
                  styles.carBody,
                  styles.aiCar,
                  {
                    backgroundColor: '#FF4444',
                    borderColor: '#FF4444',
                    left: worldToScreen(170, 150).x - 20,
                    top: worldToScreen(170, 150).y - 10,
                  },
                ]}
              >
                <View style={styles.carWindows} />
                <View style={[styles.carHeadlight, styles.carHeadlightLeft]} />
                <View style={[styles.carHeadlight, styles.carHeadlightRight]} />
                <View style={[styles.carWheel, styles.carWheelFrontLeft]} />
                <View style={[styles.carWheel, styles.carWheelFrontRight]} />
                <View style={[styles.carWheel, styles.carWheelRearLeft]} />
                <View style={[styles.carWheel, styles.carWheelRearRight]} />
                <View style={styles.carSpoiler} />
              </View>
              
              {/* AI Car 5 - Purple */}
              <View
                key="fallback-ai-car-4"
                style={[
                  styles.carBody,
                  styles.aiCar,
                  {
                    backgroundColor: '#FF44FF',
                    borderColor: '#FF44FF',
                    left: worldToScreen(200, 150).x - 20,
                    top: worldToScreen(200, 150).y - 10,
                  },
                ]}
              >
                <View style={styles.carWindows} />
                <View style={[styles.carHeadlight, styles.carHeadlightLeft]} />
                <View style={[styles.carHeadlight, styles.carHeadlightRight]} />
                <View style={[styles.carWheel, styles.carWheelFrontLeft]} />
                <View style={[styles.carWheel, styles.carWheelFrontRight]} />
                <View style={[styles.carWheel, styles.carWheelRearLeft]} />
                <View style={[styles.carWheel, styles.carWheelRearRight]} />
                <View style={styles.carSpoiler} />
              </View>
            </>
          )}
        </View>

        {/* Enhanced Lap Time HUD */}
        <LapTimeHUD
          currentLap={hudData.currentLap}
          totalLaps={hudData.totalLaps}
          currentLapTime={hudData.currentLapTime}
          currentLapTimeFormatted={hudData.currentLapTimeFormatted}
          bestLapTime={hudData.bestLapTime}
          bestLapTimeFormatted={hudData.bestLapTimeFormatted}
          lastLapTime={hudData.lastLapTime}
          lastLapTimeFormatted={hudData.lastLapTimeFormatted}
          isNewBestLap={hudData.isNewBestLap}
          raceProgress={hudData.raceProgress}
          speed={hudData.speed}
          raceTime={hudData.raceTime}
          playerPosition={hudData.playerPosition}
          totalCars={hudData.totalCars}
        />

        {/* Pause Button */}
        <View style={styles.pauseButtonContainer}>
          <TouchableOpacity
            style={[styles.pauseButton, isPaused && styles.pauseButtonActive]}
            onPress={handlePauseToggle}
            activeOpacity={0.7}
          >
            <Text style={styles.pauseButtonText}>
              {isPaused ? '▶️' : '⏸️'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Menu Button */}
        <View style={styles.menuButtonContainer}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={handleMenuPress}
            activeOpacity={0.7}
          >
            <Text style={styles.menuButtonText}>🏠</Text>
          </TouchableOpacity>
        </View>

        {/* Countdown Display */}
        {raceState?.countdownActive && (
          <View style={styles.countdownContainer}>
            <Text style={styles.countdownText}>
              {raceState.countdown > 0 ? Math.ceil(raceState.countdown).toString() : 'GO!'}
            </Text>
          </View>
        )}
      </View>

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
  trackBackground: {
    flex: 1,
    backgroundColor: '#2a4a2a', // Grass color
    position: 'relative',
    overflow: 'hidden',
  },
  grassBackground: {
    position: 'absolute',
    top: -2000,
    left: -2000,
    width: 4000,
    height: 4000,
    backgroundColor: '#2a4a2a',
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
  // Car Styles
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
  playerCar: {
    backgroundColor: '#FF4444',
    borderColor: '#CC3333',
  },
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
  // AI Car specific styling
  aiCar: {
    borderWidth: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  // Pause Button Styles
  pauseButtonContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1000,
  },
  pauseButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 5,
  },
  pauseButtonActive: {
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    borderColor: '#FFD700',
  },
  pauseButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  // Menu Button Styles
  menuButtonContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 1000,
  },
  menuButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 5,
  },
  menuButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  // HUD Styles
  gameHUD: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 10,
    padding: 15,
    zIndex: 100,
  },
  hudHeader: {
    alignItems: 'center',
    marginBottom: 10,
  },
  hudTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  hudSubtitle: {
    fontSize: 12,
    color: '#BDC3C7',
  },
  lapInfo: {
    color: '#00FF00',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
    fontFamily: 'monospace',
  },
  bestLapInfo: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
    fontFamily: 'monospace',
  },
  currentLapTime: {
    color: '#00FFFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
    fontFamily: 'monospace',
  },
  hudControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
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
    flex: 1,
    marginHorizontal: 5,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 12,
  },
  // Bottom UI
  inputContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 15,
    borderRadius: 10,
    margin: 10,
    minHeight: 100,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  debugContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 15,
    borderRadius: 10,
    margin: 10,
  },
  debugText: {
    color: '#BDC3C7',
    fontSize: 12,
    marginBottom: 3,
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
    marginTop: 20,
    textAlign: 'center',
  },
  // Countdown Styles
  countdownContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 100,
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  countdownText: {
    fontSize: 80,
    fontWeight: 'bold',
    color: '#FFD700',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
});

export default GameScreen;
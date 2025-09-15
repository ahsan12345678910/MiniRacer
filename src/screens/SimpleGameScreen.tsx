// SIMPLIFIED GAME SCREEN - Basic version without complex systems
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Simple car state
interface SimpleCar {
  x: number;
  y: number;
  angle: number;
  speed: number;
}

// Track offset for scrolling effect
interface TrackOffset {
  x: number;
  y: number;
}

const SimpleGameScreen: React.FC = () => {
  const navigation = useNavigation();
  const [car, setCar] = useState<SimpleCar>({
    x: screenWidth / 2 - 15, // Car stays in center
    y: screenHeight / 2 - 7.5, // Car stays in center
    angle: 0,
    speed: 0,
  });
  const [trackOffset, setTrackOffset] = useState<TrackOffset>({
    x: 0,
    y: 0,
  });
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  // SIMPLIFIED: No automatic movement, just score counter
  useEffect(() => {
    if (!isPaused) {
      gameLoopRef.current = setInterval(() => {
        // Just increase score over time - no automatic car movement
        setScore(prev => prev + 1);
      }, 100); // 10 FPS for score updates
    } else {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [isPaused]);

  // REMOVED: Old unused functions - now using inline button handlers

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleBackToMenu = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Enhanced track background with scrolling */}
      <View style={styles.trackBackground}>
        {/* Grass background tiles */}
        {Array.from({ length: 50 }, (_, i) => (
          <View
            key={`grass-${i}`}
            style={[
              styles.grassTile,
              {
                left: (i % 10) * 80 + trackOffset.x,
                top: Math.floor(i / 10) * 80 + trackOffset.y,
              },
            ]}
          />
        ))}

        {/* Track surface tiles */}
        {Array.from({ length: 30 }, (_, i) => (
          <View
            key={`track-${i}`}
            style={[
              styles.trackTile,
              {
                left: (i % 6) * 80 + 80 + trackOffset.x,
                top: Math.floor(i / 6) * 80 + 80 + trackOffset.y,
              },
            ]}
          />
        ))}

        {/* Track center line */}
        <View 
          style={[
            styles.trackCenterLine,
            {
              left: screenWidth / 2 - 2 + trackOffset.x,
              top: 50 + trackOffset.y,
              bottom: 50 - trackOffset.y,
            }
          ]} 
        />

        {/* Track boundaries */}
        <View 
          style={[
            styles.trackBoundary,
            {
              left: 50 + trackOffset.x,
              top: 50 + trackOffset.y,
              right: 50 - trackOffset.x,
              bottom: 50 - trackOffset.y,
            }
          ]} 
        />

        {/* Enhanced car - stays in center */}
        <View
          style={[
            styles.car,
            {
              left: car.x,
              top: car.y,
              transform: [{ rotate: `${car.angle * 180 / Math.PI}deg` }],
            },
          ]}
        />
      </View>

      {/* Simple HUD */}
      <View style={styles.hud}>
        <View style={styles.hudLeft}>
          <View style={styles.infoCard}>
            <Text style={styles.speedValue}>{Math.floor(score / 10)}</Text>
            <Text style={styles.speedLabel}>MOVES</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.scoreValue}>{score}</Text>
            <Text style={styles.scoreLabel}>SCORE</Text>
          </View>
          {/* ESSENTIAL CONTROL BUTTONS */}
          <TouchableOpacity
            style={styles.arrowButton}
            onPress={() => {
              setTrackOffset(prev => ({ ...prev, x: prev.x + 20 })); // Move track right (car appears to go left)
            }}
          >
            <Text style={styles.arrowButtonText}>←</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.arrowButton}
            onPress={() => {
              setTrackOffset(prev => ({ ...prev, y: prev.y + 20 })); // Move track down (car appears to go up)
            }}
          >
            <Text style={styles.arrowButtonText}>↑</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.arrowButton}
            onPress={() => {
              setTrackOffset(prev => ({ ...prev, x: prev.x - 20 })); // Move track left (car appears to go right)
            }}
          >
            <Text style={styles.arrowButtonText}>→</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.arrowButton}
            onPress={() => {
              setTrackOffset(prev => ({ ...prev, y: prev.y - 20 })); // Move track up (car appears to go down)
            }}
          >
            <Text style={styles.arrowButtonText}>↓</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.hudRight}>
          <TouchableOpacity style={styles.controlButton} onPress={handlePause}>
            <Text style={styles.controlButtonText}>
              {isPaused ? '▶' : '⏸'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* REMOVED OLD BUTTONS - Now using test buttons in top-left area */}
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
    backgroundColor: '#1a4a1a', // Darker grass background
    position: 'relative',
    overflow: 'hidden', // Hide overflow for cleaner scrolling
  },
  grassTile: {
    position: 'absolute',
    width: 80,
    height: 80,
    backgroundColor: '#2a5a2a', // Medium grass color
    borderWidth: 1,
    borderColor: '#1a3a1a', // Darker grass border
  },
  trackTile: {
    position: 'absolute',
    width: 80,
    height: 80,
    backgroundColor: '#4a4a4a', // Dark asphalt color
    borderWidth: 1,
    borderColor: '#3a3a3a', // Darker asphalt border
  },
  trackCenterLine: {
    position: 'absolute',
    width: 4,
    backgroundColor: '#FFFF00', // Yellow center line
    borderWidth: 1,
    borderColor: '#CCCC00',
  },
  trackBoundary: {
    position: 'absolute',
    borderWidth: 6,
    borderColor: '#FFFFFF',
    borderRadius: 25,
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  car: {
    position: 'absolute',
    width: 35,
    height: 18,
    backgroundColor: '#FF3333',
    borderRadius: 4,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 4,
  },
  hud: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
  },
  hudLeft: {
    position: 'absolute',
    top: 50,
    left: 20,
  },
  hudRight: {
    position: 'absolute',
    top: 50,
    right: 20,
    flexDirection: 'row',
    gap: 12,
  },
  infoCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 8,
    alignItems: 'center',
    minWidth: 80,
  },
  speedValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  speedLabel: {
    color: '#CCCCCC',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    marginTop: 2,
  },
  scoreValue: {
    color: '#00FF00',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  scoreLabel: {
    color: '#CCCCCC',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    marginTop: 2,
  },
  testButton: {
    backgroundColor: '#FF0000',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  arrowButton: {
    backgroundColor: '#FF4444',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  arrowButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  simpleButton: {
    backgroundColor: '#FF0000',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginHorizontal: 5,
    alignItems: 'center',
    minWidth: 60,
  },
  simpleButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  controlButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  controls: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  steerButton: {
    backgroundColor: '#FF6B6B',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  accelerateButton: {
    backgroundColor: '#4ECDC4',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brakeButton: {
    backgroundColor: '#FFE66D',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SimpleGameScreen;

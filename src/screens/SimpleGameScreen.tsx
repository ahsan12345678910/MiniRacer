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
      {/* Simple track background with scrolling */}
      <View style={styles.trackBackground}>
        {/* Track tiles with offset */}
        {Array.from({ length: 50 }, (_, i) => (
          <View
            key={i}
            style={[
              styles.trackTile,
              {
                left: (i % 10) * 80 + trackOffset.x,
                top: Math.floor(i / 10) * 80 + trackOffset.y,
              },
            ]}
          />
        ))}

        {/* Track boundary with offset */}
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

        {/* Simple car - stays in center */}
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
          {/* CONTROL BUTTONS */}
          <TouchableOpacity
            style={styles.testButton}
            onPress={() => {
              setTrackOffset(prev => ({ ...prev, x: prev.x + 20 })); // Move track right (car appears to go left)
            }}
          >
            <Text style={styles.testButtonText}>LEFT</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.testButton}
            onPress={() => {
              setTrackOffset(prev => ({ ...prev, y: prev.y + 20 })); // Move track down (car appears to go up)
            }}
          >
            <Text style={styles.testButtonText}>UP</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.testButton}
            onPress={() => {
              setTrackOffset(prev => ({ ...prev, x: prev.x - 20 })); // Move track left (car appears to go right)
            }}
          >
            <Text style={styles.testButtonText}>RIGHT</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.testButton}
            onPress={() => {
              setTrackOffset(prev => ({ ...prev, y: prev.y - 20 })); // Move track up (car appears to go down)
            }}
          >
            <Text style={styles.testButtonText}>DOWN</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.testButton, styles.accelerateButton]}
            onPress={() => {
              setTrackOffset(prev => ({ ...prev, x: prev.x - 30 })); // Move track left faster (car appears to accelerate right)
            }}
          >
            <Text style={styles.testButtonText}>ACCELERATE</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.hudRight}>
          <TouchableOpacity style={styles.controlButton} onPress={handlePause}>
            <Text style={styles.controlButtonText}>
              {isPaused ? '▶' : '⏸'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton} onPress={handleBackToMenu}>
            <Text style={styles.controlButtonText}>MENU</Text>
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
    backgroundColor: '#2a4a2a',
    position: 'relative',
    overflow: 'hidden', // Hide overflow for cleaner scrolling
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
  accelerateButton: {
    backgroundColor: '#00FF00', // Green color for accelerate
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

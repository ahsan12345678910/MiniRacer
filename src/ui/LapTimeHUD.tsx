import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Helper function to get position suffix (1st, 2nd, 3rd, etc.)
const getPositionSuffix = (position: number): string => {
  if (position === 1) return 'st';
  if (position === 2) return 'nd';
  if (position === 3) return 'rd';
  return 'th';
};

interface LapTimeHUDProps {
  currentLap: number;
  totalLaps: number;
  currentLapTime: number;
  currentLapTimeFormatted: string;
  bestLapTime: number;
  bestLapTimeFormatted: string;
  lastLapTime: number;
  lastLapTimeFormatted: string;
  isNewBestLap: boolean;
  raceProgress: number;
  speed?: number;
  raceTime?: number;
  playerPosition?: number;
  totalCars?: number;
}

export const LapTimeHUD: React.FC<LapTimeHUDProps> = React.memo(({
  currentLap,
  totalLaps,
  currentLapTime,
  currentLapTimeFormatted,
  bestLapTime,
  bestLapTimeFormatted,
  lastLapTime,
  lastLapTimeFormatted,
  isNewBestLap,
  raceProgress,
  speed = 0,
  raceTime = 0,
  playerPosition = 1,
  totalCars = 6,
}) => {
  // Animation for new best lap
  const bestLapScale = React.useRef(new Animated.Value(1)).current;
  const bestLapOpacity = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (isNewBestLap) {
      // Animate when new best lap is achieved
      Animated.sequence([
        Animated.parallel([
          Animated.timing(bestLapScale, {
            toValue: 1.2,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(bestLapOpacity, {
            toValue: 0.8,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(bestLapScale, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(bestLapOpacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }
  }, [isNewBestLap, bestLapScale, bestLapOpacity]);

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Top-left panel */}
      <View style={styles.leftPanel}>
        {/* Speed display */}
        <View style={styles.infoCard}>
          <Text style={styles.speedValue}>{speed.toFixed(1)}</Text>
          <Text style={styles.speedLabel}>KM/H</Text>
        </View>

        {/* Lap counter */}
        <View style={styles.infoCard}>
          <Text style={styles.lapCounter}>
            LAP {currentLap}/{totalLaps}
          </Text>
          <Text style={styles.raceProgress}>
            {raceProgress.toFixed(0)}% COMPLETE
          </Text>
        </View>

        {/* Position display */}
        <View style={styles.infoCard}>
          <Text style={styles.positionLabel}>POSITION</Text>
          <Text style={styles.positionValue}>
            {playerPosition}{getPositionSuffix(playerPosition)}/{totalCars}
          </Text>
        </View>

        {/* Current lap time */}
        <View style={styles.infoCard}>
          <Text style={styles.currentLapLabel}>CURRENT LAP</Text>
          <Text style={[
            styles.currentLapTime,
            isNewBestLap && styles.newBestLapTime
          ]}>
            {currentLapTimeFormatted}
          </Text>
          {isNewBestLap && (
            <Text style={styles.newBestIndicator}>NEW BEST!</Text>
          )}
        </View>

        {/* Best lap time */}
        {bestLapTime > 0 && (
          <Animated.View 
            style={[
              styles.infoCard,
              {
                transform: [{ scale: bestLapScale }],
                opacity: bestLapOpacity,
              }
            ]}
          >
            <Text style={styles.bestLapLabel}>BEST LAP</Text>
            <Text style={styles.bestLapTime}>
              {bestLapTimeFormatted}
            </Text>
          </Animated.View>
        )}

        {/* Last lap time */}
        {lastLapTime > 0 && (
          <View style={styles.infoCard}>
            <Text style={styles.lastLapLabel}>LAST LAP</Text>
            <Text style={styles.lastLapTime}>
              {lastLapTimeFormatted}
            </Text>
          </View>
        )}
      </View>

      {/* Top-right panel */}
      <View style={styles.rightPanel}>
        {/* Race time */}
        <View style={styles.infoCard}>
          <Text style={styles.raceTimeLabel}>RACE TIME</Text>
          <Text style={styles.raceTimeValue}>
            {formatRaceTime(raceTime)}
          </Text>
        </View>
      </View>
    </View>
  );
});

// Helper function to format race time
const formatRaceTime = (timeMs: number): string => {
  const totalSeconds = Math.floor(timeMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = Math.floor((timeMs % 1000) / 10);

  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
  },
  leftPanel: {
    position: 'absolute',
    top: 50,
    left: 20,
    alignItems: 'flex-start',
  },
  rightPanel: {
    position: 'absolute',
    top: 50,
    right: 20,
    alignItems: 'flex-end',
  },
  infoCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
    alignItems: 'center',
    minWidth: 100,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  // Speed styles
  speedValue: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  speedLabel: {
    color: '#CCCCCC',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    marginTop: 2,
  },
  // Lap counter styles
  lapCounter: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  raceProgress: {
    color: '#00FF00',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  // Position styles
  positionLabel: {
    color: '#CCCCCC',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
  },
  positionValue: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  // Current lap time styles
  currentLapLabel: {
    color: '#CCCCCC',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
  },
  currentLapTime: {
    color: '#00FFFF',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  newBestLapTime: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: '800',
  },
  newBestIndicator: {
    color: '#FFD700',
    fontSize: 8,
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  // Best lap time styles
  bestLapLabel: {
    color: '#CCCCCC',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
  },
  bestLapTime: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  // Last lap time styles
  lastLapLabel: {
    color: '#CCCCCC',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
  },
  lastLapTime: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  // Race time styles
  raceTimeLabel: {
    color: '#CCCCCC',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
  },
  raceTimeValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'monospace',
    marginTop: 2,
  },
});

export default LapTimeHUD;

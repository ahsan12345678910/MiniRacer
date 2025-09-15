import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { CarConfig } from '../game/cars/CarTypes';

interface RacePosition {
  carId: string;
  position: number;
  distance: number;
}

interface RaceHUDProps {
  positions: RacePosition[];
  carConfigs: Record<string, CarConfig>;
  raceTime?: number;
  currentLap?: number;
  totalLaps?: number;
}

export const RaceHUD: React.FC<RaceHUDProps> = ({
  positions,
  carConfigs,
  raceTime = 0,
  currentLap = 1,
  totalLaps = 3,
}) => {
  const formatTime = (timeMs: number): string => {
    const totalSeconds = Math.floor(timeMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((timeMs % 1000) / 10);

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {/* Race Timer */}
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>{formatTime(raceTime)}</Text>
        <Text style={styles.lapText}>LAP {currentLap}/{totalLaps}</Text>
      </View>

      {/* Race Positions */}
      <View style={styles.positionsContainer}>
        <Text style={styles.positionsTitle}>POSITIONS</Text>
        {positions.map((position) => {
          const config = carConfigs[position.carId];
          const isPlayer = position.carId === 'player';
          
          return (
            <View 
              key={position.carId} 
              style={[
                styles.positionRow,
                isPlayer && styles.playerRow
              ]}
            >
              <View style={styles.positionNumber}>
                <Text style={[
                  styles.positionNumberText,
                  isPlayer && styles.playerText
                ]}>
                  {position.position}
                </Text>
              </View>
              <View style={[styles.carIndicator, { backgroundColor: config?.color || '#FF4444' }]} />
              <Text style={[
                styles.carName,
                isPlayer && styles.playerText
              ]}>
                {config?.name || 'Unknown'}
              </Text>
              <Text style={[
                styles.distanceText,
                isPlayer && styles.playerText
              ]}>
                {Math.floor(position.distance)}m
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 100,
  },
  timerContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  timerText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  lapText: {
    color: '#CCCCCC',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  positionsContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 8,
    padding: 8,
    minWidth: 140,
    maxWidth: 160,
  },
  positionsTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
  },
  positionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    marginBottom: 1,
  },
  playerRow: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  positionNumber: {
    width: 20,
    alignItems: 'center',
  },
  positionNumberText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  playerText: {
    color: '#FFD700',
  },
  carIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 6,
  },
  carName: {
    color: '#FFFFFF',
    fontSize: 11,
    flex: 1,
  },
  distanceText: {
    color: '#CCCCCC',
    fontSize: 10,
    fontFamily: 'monospace',
  },
});

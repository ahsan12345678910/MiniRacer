import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { LapSystem, LapTime, formatLapTime } from '../game/LapSystem';

export interface LapHUDProps {
  lapSystem: LapSystem;
  style?: Record<string, unknown>;
}

export const LapHUD: React.FC<LapHUDProps> = ({ lapSystem, style }) => {
  const state = lapSystem.getState();
  const raceStats = lapSystem.getRaceStats();

  const renderLapTime = (lapTime: LapTime, isCurrent: boolean = false) => {
    const timeColor = lapTime.isBestLap
      ? '#FFD700'
      : isCurrent
        ? '#00FF00'
        : '#FFFFFF';

    return (
      <View key={lapTime.lapNumber} style={styles.lapTimeRow}>
        <Text style={[styles.lapNumber, { color: timeColor }]}>
          Lap {lapTime.lapNumber}:
        </Text>
        <Text style={[styles.lapTime, { color: timeColor }]}>
          {formatLapTime(lapTime.time)}
        </Text>
        {lapTime.isBestLap && <Text style={styles.bestLapIndicator}>★</Text>}
      </View>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {/* Race Progress */}
      <View style={styles.raceProgress}>
        <Text style={styles.progressText}>
          {state.currentLap} / {state.totalLaps} Laps
        </Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${(raceStats.completedLaps / state.totalLaps) * 100}%`,
              },
            ]}
          />
        </View>
      </View>

      {/* Current Lap Time */}
      {state.isRaceStarted && (
        <View style={styles.currentLapSection}>
          <Text style={styles.currentLapLabel}>Current Lap:</Text>
          <Text style={styles.currentLapTime}>
            {lapSystem.getFormattedCurrentLapTime()}
          </Text>
        </View>
      )}

      {/* Best Lap */}
      {state.bestLap && (
        <View style={styles.bestLapSection}>
          <Text style={styles.bestLapLabel}>Best Lap:</Text>
          <Text style={styles.bestLapTime}>
            {formatLapTime(state.bestLap.time)}
          </Text>
        </View>
      )}

      {/* Lap Times List */}
      {state.lapTimes.length > 0 && (
        <View style={styles.lapTimesSection}>
          <Text style={styles.sectionTitle}>Lap Times:</Text>
          {state.lapTimes.map(lapTime => renderLapTime(lapTime))}
        </View>
      )}

      {/* Race Status */}
      <View style={styles.raceStatus}>
        {!state.isRaceStarted && (
          <Text style={styles.statusText}>Ready to Race</Text>
        )}
        {state.isRaceStarted && !state.isRaceFinished && (
          <Text style={styles.statusText}>Racing...</Text>
        )}
        {state.isRaceFinished && (
          <Text style={[styles.statusText, styles.finishedText]}>
            Race Finished!
          </Text>
        )}
      </View>

      {/* Race Statistics */}
      {state.isRaceFinished && (
        <View style={styles.raceStats}>
          <Text style={styles.statsTitle}>Race Statistics:</Text>
          <Text style={styles.statText}>
            Total Time: {formatLapTime(raceStats.totalRaceTime)}
          </Text>
          <Text style={styles.statText}>
            Average Lap: {lapSystem.getFormattedAverageLapTime()}
          </Text>
          {state.bestLap && (
            <Text style={styles.statText}>
              Best Lap: {formatLapTime(state.bestLap.time)}
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 10,
    padding: 15,
    maxHeight: '80%',
  },
  raceProgress: {
    marginBottom: 15,
  },
  progressText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00FF00',
    borderRadius: 4,
  },
  currentLapSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
  },
  currentLapLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  currentLapTime: {
    color: '#00FF00',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  bestLapSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
  },
  bestLapLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  bestLapTime: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  lapTimesSection: {
    marginBottom: 15,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  lapTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  lapNumber: {
    fontSize: 14,
    fontWeight: '500',
    minWidth: 60,
  },
  lapTime: {
    fontSize: 14,
    fontFamily: 'monospace',
    flex: 1,
    textAlign: 'right',
    marginRight: 10,
  },
  bestLapIndicator: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
  },
  raceStatus: {
    alignItems: 'center',
    marginBottom: 10,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  finishedText: {
    color: '#FFD700',
    fontSize: 18,
  },
  raceStats: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 10,
  },
  statsTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  statText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 4,
    textAlign: 'center',
  },
});

export default LapHUD;

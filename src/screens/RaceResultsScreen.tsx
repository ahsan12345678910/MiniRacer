import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSimpleClickSound } from '../audio/useSimpleAudio';

interface RaceResultsData {
  totalLaps: number;
  completedLaps: number;
  lapTimes: Array<{ lapNumber: number; time: number; timestamp: number }>;
  bestLapTime: number;
  totalRaceTime: number;
  playerPosition: number;
  totalCars: number;
  isRaceFinished: boolean;
}

interface RaceResultsScreenProps {
  route?: {
    params?: {
      results?: RaceResultsData;
    };
  };
}

const RaceResultsScreen: React.FC<RaceResultsScreenProps> = ({ route }) => {
  const navigation = useNavigation();
  const { playClickSound } = useSimpleClickSound();
  
  const results = route?.params?.results || {
    totalLaps: 3,
    completedLaps: 0,
    lapTimes: [],
    bestLapTime: 0,
    totalRaceTime: 0,
    playerPosition: 1,
    totalCars: 6,
    isRaceFinished: false,
  };

  // Debug the results data
  console.log('🏁 RaceResults: Results data received:', results);
  console.log('🏁 RaceResults: Player position type:', typeof results.playerPosition, 'value:', results.playerPosition);

  const formatTime = (timeMs: number): string => {
    if (timeMs === 0) return '--:--.---';
    const totalSeconds = Math.floor(timeMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((timeMs % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  const handlePlayAgain = () => {
    playClickSound();
    console.log('🏁 RaceResults: Navigating to Game...');
    navigation.navigate('Game' as never);
  };

  const handleMainMenu = () => {
    playClickSound();
    console.log('🏁 RaceResults: Navigating to Menu...');
    navigation.navigate('Menu' as never);
  };

  const handleSettings = () => {
    playClickSound();
    console.log('🏁 RaceResults: Navigating to Settings...');
    navigation.navigate('Settings' as never);
  };

  const getPositionText = (position: number, total: number): string => {
    // Ensure position is a number
    const pos = typeof position === 'number' ? position : 1;
    if (pos === 1) return '1st Place 🥇';
    if (pos === 2) return '2nd Place 🥈';
    if (pos === 3) return '3rd Place 🥉';
    return `${pos}${getOrdinalSuffix(pos)} Place`;
  };

  const getOrdinalSuffix = (num: number): string => {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return 'st';
    if (j === 2 && k !== 12) return 'nd';
    if (j === 3 && k !== 13) return 'rd';
    return 'th';
  };

  const getRaceStatus = (): string => {
    if (results.isRaceFinished) {
      return 'Race Completed! 🏁';
    }
    if (results.completedLaps > 0) {
      return `Race Incomplete (${results.completedLaps}/${results.totalLaps} laps)`;
    }
    return 'Race Not Started';
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Race Results</Text>
          <Text style={styles.status}>{getRaceStatus()}</Text>
        </View>

        {/* Position */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 Final Position</Text>
          <Text style={styles.positionText}>
            {getPositionText(
              typeof results.playerPosition === 'number' ? results.playerPosition : 1, 
              results.totalCars
            )}
          </Text>
          <Text style={styles.positionSubtext}>
            Out of {results.totalCars} cars
          </Text>
        </View>

        {/* Race Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Race Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Laps:</Text>
            <Text style={styles.summaryValue}>{results.totalLaps}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Completed Laps:</Text>
            <Text style={styles.summaryValue}>{results.completedLaps}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Race Time:</Text>
            <Text style={styles.summaryValue}>{formatTime(results.totalRaceTime)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Best Lap Time:</Text>
            <Text style={styles.summaryValue}>{formatTime(results.bestLapTime)}</Text>
          </View>
        </View>

        {/* Lap Times */}
        {results.lapTimes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⏱️ Lap Times</Text>
            {results.lapTimes.map((lap, index) => (
              <View key={index} style={styles.lapRow}>
                <Text style={styles.lapNumber}>Lap {lap.lapNumber}:</Text>
                <Text style={styles.lapTime}>{formatTime(lap.time)}</Text>
                {lap.time === results.bestLapTime && results.bestLapTime > 0 && (
                  <Text style={styles.bestLapBadge}>🏆 BEST</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{results.completedLaps}</Text>
              <Text style={styles.statLabel}>Laps Completed</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {results.lapTimes.length > 0 
                  ? formatTime(results.lapTimes.reduce((sum, lap) => sum + lap.time, 0) / results.lapTimes.length)
                  : '--:--.---'
                }
              </Text>
              <Text style={styles.statLabel}>Avg Lap Time</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {results.isRaceFinished ? '100%' : `${Math.round((results.completedLaps / results.totalLaps) * 100)}%`}
              </Text>
              <Text style={styles.statLabel}>Race Progress</Text>
            </View>
          </View>
        </View>

        {/* Performance Message */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💬 Performance</Text>
          <Text style={styles.performanceText}>
            {(() => {
              const position = typeof results.playerPosition === 'number' ? results.playerPosition : 1;
              if (position === 1) return "🏆 Outstanding! You won the race!";
              if (position <= 3) return "🥉 Great job! You made it to the podium!";
              if (position <= results.totalCars / 2) return "👍 Good race! You finished in the top half!";
              return "💪 Keep practicing! You'll get better with time!";
            })()}
          </Text>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.playAgainButton]} onPress={handlePlayAgain}>
          <Text style={styles.buttonText}>🏁 Play Again</Text>
        </TouchableOpacity>
        
        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={handleMainMenu}>
            <Text style={styles.buttonText}>🏠 Main Menu</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={handleSettings}>
            <Text style={styles.buttonText}>⚙️ Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 10,
  },
  status: {
    fontSize: 18,
    color: '#4CAF50',
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 15,
  },
  positionText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 5,
  },
  positionSubtext: {
    fontSize: 16,
    color: '#CCC',
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#CCC',
  },
  summaryValue: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
  },
  lapRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 5,
  },
  lapNumber: {
    fontSize: 16,
    color: '#CCC',
  },
  lapTime: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
  },
  bestLapBadge: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: 'bold',
    backgroundColor: '#333',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#CCC',
    textAlign: 'center',
  },
  performanceText: {
    fontSize: 16,
    color: '#FFF',
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    padding: 20,
    backgroundColor: '#1a1a1a',
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  playAgainButton: {
    backgroundColor: '#FF6B35',
    marginBottom: 15,
  },
  secondaryButton: {
    backgroundColor: '#333',
    flex: 1,
    marginHorizontal: 5,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RaceResultsScreen;

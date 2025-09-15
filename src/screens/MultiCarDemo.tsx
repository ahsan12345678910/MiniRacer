import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { MultiCarGameScreen } from './MultiCarGameScreen';

interface MultiCarDemoProps {
  onBack?: () => void;
}

/**
 * Demo component showing how to use the MultiCarGameScreen
 * This demonstrates all the racing features
 */
export const MultiCarDemo: React.FC<MultiCarDemoProps> = ({ onBack }) => {
  return (
    <View style={styles.container}>
      <MultiCarGameScreen />
      
      {/* Demo Instructions Overlay */}
      <View style={styles.instructionsOverlay}>
        <ScrollView style={styles.instructionsContainer}>
          <Text style={styles.title}>🏁 Multi-Car Racing Demo</Text>
          
          <Text style={styles.sectionTitle}>✅ Features Implemented:</Text>
          
          <Text style={styles.feature}>🎮 Use MultiCarGameScreen for the full racing experience</Text>
          <Text style={styles.description}>
            • Complete racing game with multiple AI opponents{'\n'}
            • Camera follows your car smoothly{'\n'}
            • Real-time race positions and timing
          </Text>
          
          <Text style={styles.feature}>🏁 Start Race: Tap "Start Race" to begin</Text>
          <Text style={styles.description}>
            • All cars start in grid formation{'\n'}
            • Race timer begins counting{'\n'}
            • AI cars start racing immediately
          </Text>
          
          <Text style={styles.feature}>🎯 Control Player Car: Use the same controls as before</Text>
          <Text style={styles.description}>
            • LEFT/RIGHT buttons for steering{'\n'}
            • GAS button for acceleration{'\n'}
            • BRAKE button for braking{'\n'}
            • Touch zones and joystick also work
          </Text>
          
          <Text style={styles.feature}>🤖 Watch AI Cars: AI cars will race alongside you</Text>
          <Text style={styles.description}>
            • 5 different colored AI opponents{'\n'}
            • Each has unique personality and speed{'\n'}
            • AI cars follow racing path intelligently{'\n'}
            • Different aggressiveness levels
          </Text>
          
          <Text style={styles.feature}>📊 Check Positions: See live race positions in the HUD</Text>
          <Text style={styles.description}>
            • Real-time position updates{'\n'}
            • Distance tracking for each car{'\n'}
            • Player car highlighted in gold{'\n'}
            • Race timer and lap counter
          </Text>
          
          <Text style={styles.feature}>🔄 Reset Race: Tap "Reset Race" to start over</Text>
          <Text style={styles.description}>
            • All cars return to start positions{'\n'}
            • Race timer resets to zero{'\n'}
            • Ready for a new race
          </Text>
          
          <Text style={styles.sectionTitle}>🎨 Car Variants:</Text>
          <Text style={styles.description}>
            • Player: Red racing car{'\n'}
            • Blue Lightning: Fast and aggressive{'\n'}
            • Green Machine: Moderate speed, conservative{'\n'}
            • Yellow Thunder: Fast and very aggressive{'\n'}
            • Purple Storm: Moderate speed, very aggressive{'\n'}
            • Orange Blaze: Fast with moderate aggression
          </Text>
          
          <Text style={styles.sectionTitle}>🎮 How to Test:</Text>
          <Text style={styles.description}>
            1. Tap "Start Race" to begin{'\n'}
            2. Use controls to drive your car{'\n'}
            3. Watch AI cars race around the track{'\n'}
            4. Check the HUD for live positions{'\n'}
            5. Tap "Reset Race" to start over{'\n'}
            6. Try different control methods (buttons/touch/joystick)
          </Text>
          
          {onBack && (
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
              <Text style={styles.backButtonText}>← Back to Menu</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  instructionsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    zIndex: 1000,
  },
  instructionsContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  feature: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
  },
  description: {
    color: '#CCCCCC',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  backButton: {
    backgroundColor: '#FF4444',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    alignSelf: 'center',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MultiCarDemo;

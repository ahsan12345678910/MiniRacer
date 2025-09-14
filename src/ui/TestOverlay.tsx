import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface TestOverlayProps {
  visible?: boolean;
  onToggle?: () => void;
}

export const TestOverlay: React.FC<TestOverlayProps> = ({ 
  visible = false, 
  onToggle 
}) => {
  const [testLog, setTestLog] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTestLog(prev => [`${timestamp}: ${message}`, ...prev.slice(0, 9)]);
  };

  const clearLog = () => {
    setTestLog([]);
  };

  if (!visible) return null;

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Test buttons */}
      <View style={styles.testButtons}>
        <TouchableOpacity
          style={styles.testButton}
          onPress={() => {
            addLog('Test button 1 tapped - should log instantly');
          }}
          pointerEvents="auto"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.testButtonText}>TEST 1</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.testButton}
          onPress={() => {
            addLog('Test button 2 tapped - should log instantly');
          }}
          pointerEvents="auto"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.testButtonText}>TEST 2</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.clearButton}
          onPress={clearLog}
          pointerEvents="auto"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.clearButtonText}>CLEAR</Text>
        </TouchableOpacity>
      </View>

      {/* Log display */}
      <View style={styles.logContainer}>
        <Text style={styles.logTitle}>Gesture Test Log:</Text>
        {testLog.map((log, index) => (
          <Text key={index} style={styles.logEntry}>
            {log}
          </Text>
        ))}
        {testLog.length === 0 && (
          <Text style={styles.logEmpty}>No events logged yet</Text>
        )}
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionText}>
          Test Instructions:
        </Text>
        <Text style={styles.instructionText}>
          • Tap HUD buttons - should log instantly
        </Text>
        <Text style={styles.instructionText}>
          • Hold control buttons - car should steer/throttle
        </Text>
        <Text style={styles.instructionText}>
          • No other handler should receive these events
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  testButtons: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  testButton: {
    backgroundColor: 'rgba(0, 150, 255, 0.8)',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: 'rgba(255, 100, 100, 0.8)',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  logContainer: {
    position: 'absolute',
    top: 160,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: 8,
    padding: 10,
    maxHeight: 200,
  },
  logTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  logEntry: {
    color: '#00FF00',
    fontSize: 11,
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  logEmpty: {
    color: '#666666',
    fontSize: 11,
    fontStyle: 'italic',
  },
  instructions: {
    position: 'absolute',
    bottom: 200,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: 8,
    padding: 10,
  },
  instructionText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginBottom: 4,
  },
});

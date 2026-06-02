import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { runAudioTests } from '../audio/AudioTest';
import { useAudio } from '../audio/useAudio';

const AudioTestScreen: React.FC = () => {
  const navigation = useNavigation();
  const { playClickSound, playEngineStart, stopEngineSound } = useAudio();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addLog = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    addLog('Starting audio tests...');
    
    try {
      // Override console.log to capture test output
      const originalLog = console.log;
      console.log = (...args) => {
        addLog(args.join(' '));
        originalLog(...args);
      };
      
      await runAudioTests();
      
      console.log = originalLog;
      addLog('All tests completed successfully!');
    } catch (error) {
      addLog(`Test failed: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  const testEngineSound = async () => {
    addLog('Testing engine sound...');
    try {
      await playEngineStart();
      addLog('Engine started');
      
      setTimeout(async () => {
        await stopEngineSound();
        addLog('Engine stopped');
      }, 2000);
    } catch (error) {
      addLog(`Engine test failed: ${error}`);
    }
  };

  const testClickSound = async () => {
    addLog('Testing click sound...');
    try {
      await playClickSound();
      addLog('Click sound played');
    } catch (error) {
      addLog(`Click test failed: ${error}`);
    }
  };

  const clearLogs = () => {
    setTestResults([]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Audio System Test</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, isRunning && styles.disabledButton]} 
          onPress={runTests}
          disabled={isRunning}
        >
          <Text style={styles.buttonText}>
            {isRunning ? 'Running Tests...' : 'Run All Tests'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={testEngineSound}>
          <Text style={styles.buttonText}>Test Engine Sound</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={testClickSound}>
          <Text style={styles.buttonText}>Test Click Sound</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={clearLogs}>
          <Text style={styles.buttonText}>Clear Logs</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.backButton]} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.logContainer}>
        <Text style={styles.logTitle}>Test Results:</Text>
        {testResults.map((result, index) => (
          <Text key={index} style={styles.logText}>{result}</Text>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#666666',
  },
  backButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logContainer: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 10,
  },
  logTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  logText: {
    color: '#cccccc',
    fontSize: 12,
    marginBottom: 2,
    fontFamily: 'monospace',
  },
});

export default AudioTestScreen;

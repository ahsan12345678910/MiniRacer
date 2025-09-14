import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useClickSound } from '../audio/useAudio';

const MenuScreen: React.FC = () => {
  const navigation = useNavigation();
  const { playClickSound } = useClickSound();

  const handlePlay = () => {
    playClickSound();
    navigation.navigate('Game' as never);
  };

  const handleSettings = () => {
    playClickSound();
    navigation.navigate('Settings' as never);
  };

  const handleQuit = () => {
    playClickSound();
    console.log('Quit button pressed');
    Alert.alert('Quit Game', 'Are you sure you want to quit?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Quit',
        style: 'destructive',
        onPress: () => console.log('Game quit confirmed'),
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MiniRacer</Text>
      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuButton} onPress={handlePlay}>
          <Text style={styles.buttonText}>Play</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuButton} onPress={handleSettings}>
          <Text style={styles.buttonText}>Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.menuButton, styles.quitButton]}
          onPress={handleQuit}
        >
          <Text style={[styles.buttonText, styles.quitButtonText]}>Quit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 60,
    textAlign: 'center',
    letterSpacing: 2,
  },
  menuContainer: {
    width: '100%',
    maxWidth: 300,
  },
  menuButton: {
    backgroundColor: '#4a4a4a',
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginVertical: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  quitButton: {
    backgroundColor: '#8b0000',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 1,
  },
  quitButtonText: {
    color: '#ffffff',
  },
});

export default MenuScreen;

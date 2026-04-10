import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RootStackParamList } from '../../App';
import { loadGameSettings } from '../game/settingsStorage';
import { useGameStore } from '../game/GameStore';
import { audioManager } from '../game/audio/AudioManager';

type Props = NativeStackScreenProps<RootStackParamList, 'Menu'>;

export function MenuScreen({ navigation }: Props) {
  const setSettings = useGameStore((state) => state.setSettings);

  useEffect(() => {
    let cancelled = false;
    audioManager.init().catch(() => undefined);
    loadGameSettings().then((stored) => {
      if (!cancelled && stored) {
        setSettings(stored);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [setSettings]);

  const onQuit = () => {
    audioManager.playClick().catch(() => undefined);
    console.log('Quit pressed');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MiniRacer</Text>
      <Pressable
        style={styles.button}
        onPress={() => {
          audioManager.playClick().catch(() => undefined);
          navigation.navigate('Game');
        }}
      >
        <Text style={styles.buttonText}>Play</Text>
      </Pressable>
      <Pressable
        style={styles.button}
        onPress={() => {
          audioManager.playClick().catch(() => undefined);
          navigation.navigate('Settings');
        }}
      >
        <Text style={styles.buttonText}>Settings</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={onQuit}>
        <Text style={styles.buttonText}>Quit</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 14,
  },
  title: {
    color: '#f8fafc',
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 16,
  },
  button: {
    width: '100%',
    maxWidth: 240,
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  buttonText: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '600',
  },
});

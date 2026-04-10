import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RootStackParamList } from '../../App';
import { useGameStore } from '../game/GameStore';
import { clearBestLap, loadGameSettings, saveGameSettings } from '../game/settingsStorage';
import { audioManager } from '../game/audio/AudioManager';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export function SettingsScreen({ navigation }: Props) {
  const hydratedRef = useRef(false);
  const { settings, setControlMode, setSoundEnabled, setSettings, setBestLapTime } = useGameStore(
    (state) => ({
      settings: state.settings,
      setControlMode: state.setControlMode,
      setSoundEnabled: state.setSoundEnabled,
      setSettings: state.setSettings,
      setBestLapTime: state.setBestLapTime,
    }),
  );

  useEffect(() => {
    let cancelled = false;
    audioManager.init().catch(() => undefined);
    loadGameSettings()
      .then((stored) => {
        if (!cancelled && stored) {
          setSettings(stored);
        }
      })
      .finally(() => {
        if (!cancelled) {
          hydratedRef.current = true;
        }
      });

    return () => {
      cancelled = true;
    };
  }, [setSettings]);

  useEffect(() => {
    if (!hydratedRef.current) {
      return;
    }

    saveGameSettings(settings).catch(() => {
      // Non-fatal if persistence fails.
    });
    audioManager.setEnabled(settings.soundEnabled).catch(() => undefined);
  }, [settings]);

  const onResetBestLap = async () => {
    await audioManager.playClick().catch(() => undefined);
    await clearBestLap();
    setBestLapTime(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Control Mode</Text>
        <View style={styles.row}>
          <Pressable
            style={[
              styles.optionButton,
              settings.controlMode === 'touchZones' && styles.optionActive,
            ]}
            onPress={() => {
              audioManager.playClick().catch(() => undefined);
              setControlMode('touchZones');
            }}
          >
            <Text style={styles.optionText}>Touch Zones</Text>
          </Pressable>
          <Pressable
            style={[
              styles.optionButton,
              settings.controlMode === 'virtualJoystick' && styles.optionActive,
            ]}
            onPress={() => {
              audioManager.playClick().catch(() => undefined);
              setControlMode('virtualJoystick');
            }}
          >
            <Text style={styles.optionText}>Joystick</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Sound</Text>
        <Pressable
          style={[styles.optionButton, settings.soundEnabled && styles.optionActive]}
          onPress={() => {
            audioManager.playClick().catch(() => undefined);
            setSoundEnabled(!settings.soundEnabled);
          }}
        >
          <Text style={styles.optionText}>{settings.soundEnabled ? 'On' : 'Off'}</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Pressable style={styles.dangerButton} onPress={onResetBestLap}>
          <Text style={styles.buttonText}>Reset Best Lap</Text>
        </Pressable>
      </View>

      <Pressable
        style={styles.button}
        onPress={() => {
          audioManager.playClick().catch(() => undefined);
          navigation.goBack();
        }}
      >
        <Text style={styles.buttonText}>Back</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    padding: 24,
    gap: 16,
  },
  title: {
    color: '#f8fafc',
    fontSize: 30,
    fontWeight: '700',
  },
  section: {
    backgroundColor: '#111b2e',
    borderWidth: 1,
    borderColor: '#243248',
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  sectionLabel: {
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  optionButton: {
    backgroundColor: '#334155',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#475569',
    flex: 1,
  },
  optionActive: {
    backgroundColor: '#2563eb',
    borderColor: '#60a5fa',
  },
  optionText: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '600',
  },
  dangerButton: {
    backgroundColor: '#b91c1c',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  button: {
    marginTop: 8,
    backgroundColor: '#334155',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '600',
  },
});

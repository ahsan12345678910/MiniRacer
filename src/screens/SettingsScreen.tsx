import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Switch, 
  Alert,
  ScrollView 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGameStore } from '../game/store/GameStore';

const SETTINGS_STORAGE_KEY = 'race_game_settings';
const BEST_LAP_STORAGE_KEY = 'race_game_best_lap';

interface GameSettings {
  inputMode: 'touchZones' | 'virtualJoystick';
  soundEnabled: boolean;
  musicEnabled: boolean;
  touchZones: {
    brakeButtonSize: number;
    brakeButtonMargin: number;
  };
  virtualJoystick: {
    size: number;
    deadZone: number;
    maxDistance: number;
    position: 'left' | 'right';
  };
}

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { settings, updateSettings } = useGameStore();
  
  const [localSettings, setLocalSettings] = useState<GameSettings>(settings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setLocalSettings(parsedSettings);
        updateSettings(parsedSettings);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (newSettings: GameSettings) => {
    try {
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
      setLocalSettings(newSettings);
      updateSettings(newSettings);
    } catch (error) {
      console.error('Failed to save settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  const handleInputModeChange = (mode: 'touchZones' | 'virtualJoystick') => {
    const newSettings = { ...localSettings, inputMode: mode };
    saveSettings(newSettings);
  };

  const handleSoundToggle = (enabled: boolean) => {
    const newSettings = { ...localSettings, soundEnabled: enabled };
    saveSettings(newSettings);
  };

  const handleMusicToggle = (enabled: boolean) => {
    const newSettings = { ...localSettings, musicEnabled: enabled };
    saveSettings(newSettings);
  };

  const handleResetBestLap = () => {
    Alert.alert(
      'Reset Best Lap',
      'Are you sure you want to reset your best lap time? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(BEST_LAP_STORAGE_KEY);
              Alert.alert('Success', 'Best lap time has been reset');
            } catch (error) {
              console.error('Failed to reset best lap:', error);
              Alert.alert('Error', 'Failed to reset best lap time');
            }
          }
        }
      ]
    );
  };

  const handleResetAllSettings = () => {
    Alert.alert(
      'Reset All Settings',
      'Are you sure you want to reset all settings to default values?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: async () => {
            try {
              const defaultSettings: GameSettings = {
                inputMode: 'touchZones',
                soundEnabled: true,
                musicEnabled: true,
                touchZones: {
                  brakeButtonSize: 80,
                  brakeButtonMargin: 20,
                },
                virtualJoystick: {
                  size: 120,
                  deadZone: 10,
                  maxDistance: 60,
                  position: 'left',
                },
              };
              await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(defaultSettings));
              setLocalSettings(defaultSettings);
              updateSettings(defaultSettings);
              Alert.alert('Success', 'All settings have been reset to default');
            } catch (error) {
              console.error('Failed to reset settings:', error);
              Alert.alert('Error', 'Failed to reset settings');
            }
          }
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('Menu' as never)}
          >
            <Text style={styles.backButtonText}>← Back to Menu</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Settings</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading settings...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('Menu' as never)}
        >
          <Text style={styles.backButtonText}>← Back to Menu</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
      </View>
      
      <ScrollView style={styles.settingsContainer} showsVerticalScrollIndicator={false}>
        {/* Control Mode Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Controls</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Control Mode</Text>
              <Text style={styles.settingDescription}>
                Choose how you want to control the car
              </Text>
            </View>
            <View style={styles.controlModeButtons}>
              <TouchableOpacity
                style={[
                  styles.controlModeButton,
                  localSettings.inputMode === 'touchZones' && styles.controlModeButtonActive
                ]}
                onPress={() => handleInputModeChange('touchZones')}
              >
                <Text style={[
                  styles.controlModeButtonText,
                  localSettings.inputMode === 'touchZones' && styles.controlModeButtonTextActive
                ]}>
                  Touch Zones
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.controlModeButton,
                  localSettings.inputMode === 'virtualJoystick' && styles.controlModeButtonActive
                ]}
                onPress={() => handleInputModeChange('virtualJoystick')}
              >
                <Text style={[
                  styles.controlModeButtonText,
                  localSettings.inputMode === 'virtualJoystick' && styles.controlModeButtonTextActive
                ]}>
                  Virtual Joystick
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Audio Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Audio</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Sound Effects</Text>
              <Text style={styles.settingDescription}>
                Enable or disable game sound effects
              </Text>
            </View>
            <Switch
              value={localSettings.soundEnabled}
              onValueChange={handleSoundToggle}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={localSettings.soundEnabled ? '#f5dd4b' : '#f4f3f4'}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Background Music</Text>
              <Text style={styles.settingDescription}>
                Enable or disable background music
              </Text>
            </View>
            <Switch
              value={localSettings.musicEnabled}
              onValueChange={handleMusicToggle}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={localSettings.musicEnabled ? '#f5dd4b' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Data Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleResetBestLap}>
            <Text style={styles.actionButtonText}>Reset Best Lap Time</Text>
            <Text style={styles.actionButtonDescription}>
              Clear your personal best lap record
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleResetAllSettings}>
            <Text style={styles.actionButtonText}>Reset All Settings</Text>
            <Text style={styles.actionButtonDescription}>
              Restore all settings to default values
            </Text>
          </TouchableOpacity>
        </View>

        {/* Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Game Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Settings Status</Text>
            <Text style={styles.infoValue}>Saved</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#2a2a2a',
  },
  backButton: {
    padding: 12,
    backgroundColor: '#4a4a4a',
    borderRadius: 8,
    marginRight: 20,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '500',
  },
  settingsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    paddingLeft: 5,
  },
  settingItem: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#333333',
  },
  settingInfo: {
    flex: 1,
    marginBottom: 15,
  },
  settingLabel: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  settingDescription: {
    color: '#cccccc',
    fontSize: 14,
    lineHeight: 20,
  },
  controlModeButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  controlModeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#4a4a4a',
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  controlModeButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#0056CC',
  },
  controlModeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  controlModeButtonTextActive: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  actionButton: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#333333',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  actionButtonDescription: {
    color: '#cccccc',
    fontSize: 14,
    lineHeight: 20,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#333333',
  },
  infoLabel: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  infoValue: {
    color: '#cccccc',
    fontSize: 16,
    fontWeight: '400',
  },
});

export default SettingsScreen;

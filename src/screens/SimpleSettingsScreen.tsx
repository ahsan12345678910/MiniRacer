// SIMPLIFIED SETTINGS SCREEN - Basic version without complex dependencies
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

// Simple settings interface
interface SimpleSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  controlMode: 'buttons' | 'touch';
}

const SimpleSettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [settings, setSettings] = useState<SimpleSettings>({
    soundEnabled: true,
    musicEnabled: true,
    controlMode: 'buttons',
  });

  const handleSoundToggle = (enabled: boolean) => {
    console.log('Sound toggled:', enabled);
    setSettings(prev => ({ ...prev, soundEnabled: enabled }));
  };

  const handleMusicToggle = (enabled: boolean) => {
    console.log('Music toggled:', enabled);
    setSettings(prev => ({ ...prev, musicEnabled: enabled }));
  };

  const handleControlModeChange = (mode: 'buttons' | 'touch') => {
    console.log('Control mode changed:', mode);
    setSettings(prev => ({ ...prev, controlMode: mode }));
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setSettings({
              soundEnabled: true,
              musicEnabled: true,
              controlMode: 'buttons',
            });
            Alert.alert('Success', 'Settings have been reset to default');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back to Menu</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView
        style={styles.settingsContainer}
        showsVerticalScrollIndicator={false}
      >
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
                  settings.controlMode === 'buttons' && styles.controlModeButtonActive,
                ]}
                onPress={() => handleControlModeChange('buttons')}
              >
                <Text
                  style={[
                    styles.controlModeButtonText,
                    settings.controlMode === 'buttons' && styles.controlModeButtonTextActive,
                  ]}
                >
                  Buttons
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.controlModeButton,
                  settings.controlMode === 'touch' && styles.controlModeButtonActive,
                ]}
                onPress={() => handleControlModeChange('touch')}
              >
                <Text
                  style={[
                    styles.controlModeButtonText,
                    settings.controlMode === 'touch' && styles.controlModeButtonTextActive,
                  ]}
                >
                  Touch
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
              value={settings.soundEnabled}
              onValueChange={handleSoundToggle}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={settings.soundEnabled ? '#f5dd4b' : '#f4f3f4'}
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
              value={settings.musicEnabled}
              onValueChange={handleMusicToggle}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={settings.musicEnabled ? '#f5dd4b' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Data Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleResetSettings}
          >
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
            <Text style={styles.infoValue}>1.0.0 (Simplified)</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Settings Status</Text>
            <Text style={styles.infoValue}>In Memory</Text>
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

export default SimpleSettingsScreen;

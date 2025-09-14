import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
      </View>
      <View style={styles.settingsContainer}>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Sound Effects</Text>
          <Switch
            value={soundEnabled}
            onValueChange={setSoundEnabled}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={soundEnabled ? '#f5dd4b' : '#f4f3f4'}
          />
        </View>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Background Music</Text>
          <Switch
            value={musicEnabled}
            onValueChange={setMusicEnabled}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={musicEnabled ? '#f5dd4b' : '#f4f3f4'}
          />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    padding: 10,
    marginRight: 20,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
  },
  title: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  settingsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  settingLabel: {
    color: '#ffffff',
    fontSize: 18,
  },
});

export default SettingsScreen;

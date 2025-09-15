import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Dimensions,
} from 'react-native';
import { Camera } from '../../game/camera/Camera';

const { width: screenWidth } = Dimensions.get('window');

interface CameraControlsProps {
  camera: Camera;
  visible?: boolean;
  onToggle?: () => void;
}

/**
 * CameraControls component for adjusting camera settings
 */
export const CameraControls: React.FC<CameraControlsProps> = ({ 
  camera, 
  visible = false, 
  onToggle 
}) => {
  const [settings, setSettings] = useState(camera.getSettings());

  const updateSetting = (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    camera.updateSettings(newSettings);
  };

  const adjustZoom = (delta: number) => {
    camera.adjustZoom(delta);
  };

  const resetCamera = () => {
    camera.reset();
    setSettings(camera.getSettings());
  };

  if (!visible) {
    return (
      <TouchableOpacity
        style={styles.toggleButton}
        onPress={onToggle}
      >
        <Text style={styles.toggleButtonText}>📷</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Camera Controls</Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onToggle}
        >
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Follow Target Toggle */}
      <View style={styles.controlRow}>
        <Text style={styles.label}>Follow Car</Text>
        <Switch
          value={settings.followTarget}
          onValueChange={(value) => updateSetting('followTarget', value)}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={settings.followTarget ? '#f5dd4b' : '#f4f3f4'}
        />
      </View>

      {/* Smooth Follow Toggle */}
      <View style={styles.controlRow}>
        <Text style={styles.label}>Smooth Follow</Text>
        <Switch
          value={settings.smoothFollow}
          onValueChange={(value) => updateSetting('smoothFollow', value)}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={settings.smoothFollow ? '#f5dd4b' : '#f4f3f4'}
        />
      </View>

      {/* Zoom Controls */}
      <View style={styles.controlRow}>
        <Text style={styles.label}>Zoom</Text>
        <View style={styles.zoomControls}>
          <TouchableOpacity
            style={styles.zoomButton}
            onPress={() => adjustZoom(-0.1)}
          >
            <Text style={styles.zoomButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.zoomValue}>
            {camera.getState().zoom.toFixed(1)}x
          </Text>
          <TouchableOpacity
            style={styles.zoomButton}
            onPress={() => adjustZoom(0.1)}
          >
            <Text style={styles.zoomButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Follow Speed */}
      <View style={styles.controlRow}>
        <Text style={styles.label}>Follow Speed</Text>
        <View style={styles.speedControls}>
          <TouchableOpacity
            style={styles.speedButton}
            onPress={() => updateSetting('followSpeed', Math.max(1, settings.followSpeed - 1))}
          >
            <Text style={styles.speedButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.speedValue}>
            {settings.followSpeed.toFixed(1)}
          </Text>
          <TouchableOpacity
            style={styles.speedButton}
            onPress={() => updateSetting('followSpeed', Math.min(20, settings.followSpeed + 1))}
          >
            <Text style={styles.speedButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Reset Button */}
      <TouchableOpacity
        style={styles.resetButton}
        onPress={resetCamera}
      >
        <Text style={styles.resetButtonText}>Reset Camera</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    right: 20,
    width: 200,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 12,
    padding: 16,
    zIndex: 100,
  },
  toggleButton: {
    position: 'absolute',
    top: 100,
    right: 20,
    width: 50,
    height: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  toggleButtonText: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 14,
    flex: 1,
  },
  zoomControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  zoomButton: {
    width: 30,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  zoomValue: {
    color: '#FFFFFF',
    fontSize: 14,
    marginHorizontal: 12,
    minWidth: 40,
    textAlign: 'center',
  },
  speedControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  speedButton: {
    width: 30,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  speedButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  speedValue: {
    color: '#FFFFFF',
    fontSize: 14,
    marginHorizontal: 12,
    minWidth: 40,
    textAlign: 'center',
  },
  resetButton: {
    backgroundColor: 'rgba(255, 0, 0, 0.6)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

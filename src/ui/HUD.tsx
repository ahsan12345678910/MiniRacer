import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useSpeedDisplay, useLapDisplay, useBestDisplay, usePaused, useUIActions } from '../game/state/UIState';

interface HUDProps {
  onPause?: () => void;
  onMenu?: () => void;
}

export const HUD: React.FC<HUDProps> = React.memo(({ onPause, onMenu }) => {
  const speedDisplay = useSpeedDisplay();
  const lapDisplay = useLapDisplay();
  const bestDisplay = useBestDisplay();
  const paused = usePaused();
  const { setPaused } = useUIActions();

  const handlePause = () => {
    setPaused(!paused);
    onPause?.();
  };

  const handleMenu = () => {
    onMenu?.();
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Top-left info panel */}
      <View style={styles.leftPanel}>
        {/* Speed display */}
        <View style={styles.infoCard}>
          <Text style={styles.speedValue}>{speedDisplay}</Text>
          <Text style={styles.speedLabel}>SPEED</Text>
        </View>

        {/* Lap info */}
        <View style={styles.infoCard}>
          <Text style={styles.lapValue}>
            LAP 1/3
          </Text>
          <Text style={styles.lapTime}>{lapDisplay}</Text>
        </View>

        {/* Best lap */}
        {bestDisplay && (
          <View style={styles.infoCard}>
            <Text style={styles.bestLabel}>BEST LAP</Text>
            <Text style={styles.bestTime}>{bestDisplay}</Text>
          </View>
        )}
      </View>

      {/* Top-right control panel */}
      <View style={styles.rightPanel}>
        {/* Pause button */}
        <TouchableOpacity
          style={styles.controlButton}
          onPress={handlePause}
          pointerEvents="auto"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.7}
        >
          <Text style={styles.controlButtonText}>
            {paused ? '▶' : '⏸'}
          </Text>
        </TouchableOpacity>

        {/* Menu button */}
        <TouchableOpacity
          style={styles.controlButton}
          onPress={handleMenu}
          pointerEvents="auto"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.7}
        >
          <Text style={styles.controlButtonText}>MENU</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
  },
  leftPanel: {
    position: 'absolute',
    top: 50,
    left: 20,
    alignItems: 'flex-start',
  },
  rightPanel: {
    position: 'absolute',
    top: 50,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 8,
    alignItems: 'center',
    minWidth: 80,
  },
  speedValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  speedLabel: {
    color: '#CCCCCC',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    marginTop: 2,
  },
  lapValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  lapTime: {
    color: '#00FF00',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  bestLabel: {
    color: '#CCCCCC',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
  },
  bestTime: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  controlButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
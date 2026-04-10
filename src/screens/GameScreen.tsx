import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { memo, useEffect, useMemo } from 'react';
import { RootStackParamList } from '../../App';
import { useGameStore } from '../game/GameStore';
import { loadGameSettings } from '../game/settingsStorage';
import { audioManager } from '../game/audio/AudioManager';

type Props = NativeStackScreenProps<RootStackParamList, 'Game'>;
const TRACK_TILES = Array.from({ length: 80 }, (_, index) => index);

export function GameScreen({ navigation }: Props) {
  const carPosition = useGameStore((state) => state.carPosition);
  const carVelocity = useGameStore((state) => state.carVelocity);
  const carAngle = useGameStore((state) => state.carAngle);
  const currentLap = useGameStore((state) => state.lapData.currentLap);
  const bestLapTime = useGameStore((state) => state.lapData.bestLapTime);
  const settings = useGameStore((state) => state.settings);
  const setSettings = useGameStore((state) => state.setSettings);

  useEffect(() => {
    let cancelled = false;
    loadGameSettings()
      .then((stored) => {
        if (!cancelled && stored) {
          setSettings(stored);
        }
      })
      .finally(() => {
        if (!cancelled) {
          audioManager.init().catch(() => undefined);
        }
      });

    return () => {
      cancelled = true;
      audioManager.shutdown().catch(() => undefined);
    };
  }, [setSettings]);

  useEffect(() => {
    audioManager.setEnabled(settings.soundEnabled).catch(() => undefined);
  }, [settings.soundEnabled]);

  const controlModeLabel = settings.controlMode === 'touchZones' ? 'Touch Zones' : 'Joystick';
  const soundLabel = settings.soundEnabled ? 'On' : 'Off';

  const trackWidth = 1000;
  const trackHeight = 700;
  const screenTrackWidth = 340;
  const screenTrackHeight = 238;
  const carWidth = 20;
  const carHeight = 12;

  const carSpeedKmH = Math.hypot(carVelocity.x, carVelocity.y) * 3.6;
  const bestLapLabel = bestLapTime === null ? '--:--.---' : formatLapTime(bestLapTime);

  const audioSpeedSample = useMemo(() => Math.round(carSpeedKmH * 2) / 2, [carSpeedKmH]);

  useEffect(() => {
    audioManager.updateEngineFromSpeed(audioSpeedSample).catch(() => undefined);
  }, [audioSpeedSample]);

  const carStyle = useMemo(() => {
    const clampedX = Math.max(0, Math.min(trackWidth, carPosition.x));
    const clampedY = Math.max(0, Math.min(trackHeight, carPosition.y));
    const pixelX = (clampedX / trackWidth) * screenTrackWidth - carWidth / 2;
    const pixelY = (clampedY / trackHeight) * screenTrackHeight - carHeight / 2;

    return {
      left: pixelX,
      top: pixelY,
      transform: [{ rotate: `${carAngle}rad` }],
    };
  }, [carAngle, carPosition.x, carPosition.y]);

  return (
    <View style={styles.container}>
      <View style={styles.hud}>
        <View style={styles.hudRow}>
          <Text style={styles.hudLabel}>Speed</Text>
          <Text style={styles.hudValue}>{carSpeedKmH.toFixed(1)} km/h</Text>
        </View>
        <View style={styles.hudRow}>
          <Text style={styles.hudLabel}>Lap</Text>
          <Text style={styles.hudValue}>{currentLap}</Text>
        </View>
        <View style={styles.hudRow}>
          <Text style={styles.hudLabel}>Best</Text>
          <Text style={styles.hudValue}>{bestLapLabel}</Text>
        </View>
        <View style={styles.hudRow}>
          <Text style={styles.hudLabel}>Controls</Text>
          <Text style={styles.hudValue}>{controlModeLabel}</Text>
        </View>
        <View style={styles.hudRow}>
          <Text style={styles.hudLabel}>Sound</Text>
          <Text style={styles.hudValue}>{soundLabel}</Text>
        </View>
      </View>

      <Pressable
        style={styles.pauseButton}
        onPress={() => {
          audioManager.playClick().catch(() => undefined);
          navigation.navigate('Menu');
        }}
      >
        <Text style={styles.pauseButtonText}>Pause</Text>
      </Pressable>

      <View style={styles.trackWrapper}>
        <View style={styles.trackSurface}>
          <TrackTiles />
          <View style={[styles.startLine, { left: 44, top: 102 }]} />
          <View style={[styles.car, carStyle]} />
        </View>
      </View>
    </View>
  );
}

const TrackTiles = memo(function TrackTiles() {
  return (
    <>
      {TRACK_TILES.map((index) => (
        <View key={index} style={styles.tile} />
      ))}
    </>
  );
});

function formatLapTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const milliseconds = Math.floor((totalSeconds - Math.floor(totalSeconds)) * 1000);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(
    milliseconds,
  ).padStart(3, '0')}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b1220',
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  hud: {
    position: 'absolute',
    top: 56,
    left: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 6,
    zIndex: 3,
  },
  hudRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    minWidth: 150,
    gap: 10,
  },
  hudLabel: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },
  hudValue: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '700',
  },
  pauseButton: {
    position: 'absolute',
    top: 56,
    right: 16,
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    borderWidth: 1,
    borderColor: '#475569',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    zIndex: 3,
  },
  pauseButtonText: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '600',
  },
  trackWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackSurface: {
    width: 340,
    height: 238,
    backgroundColor: '#0f172a',
    borderWidth: 2,
    borderColor: '#1f2937',
    borderRadius: 14,
    overflow: 'hidden',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tile: {
    width: 34,
    height: 29.75,
    backgroundColor: '#1f2937',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#273449',
  },
  startLine: {
    position: 'absolute',
    width: 6,
    height: 40,
    backgroundColor: '#e2e8f0',
    opacity: 0.9,
  },
  car: {
    position: 'absolute',
    width: 20,
    height: 12,
    borderRadius: 3,
    backgroundColor: '#ef4444',
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
});

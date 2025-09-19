import { useState, useEffect, useCallback } from 'react';
import { getSimpleRaceManager } from '../game/SimpleRaceManager';

interface LapTimeHUDData {
  currentLap: number;
  totalLaps: number;
  currentLapTime: number;
  currentLapTimeFormatted: string;
  bestLapTime: number;
  bestLapTimeFormatted: string;
  lastLapTime: number;
  lastLapTimeFormatted: string;
  isNewBestLap: boolean;
  raceProgress: number;
  speed: number;
  raceTime: number;
}

export const useLapTimeHUD = (updateInterval: number = 100) => {
  const [hudData, setHudData] = useState<LapTimeHUDData>({
    currentLap: 0,
    totalLaps: 3,
    currentLapTime: 0,
    currentLapTimeFormatted: '00:00.000',
    bestLapTime: 0,
    bestLapTimeFormatted: '--:--.---',
    lastLapTime: 0,
    lastLapTimeFormatted: '--:--.---',
    isNewBestLap: false,
    raceProgress: 0,
    speed: 0,
    raceTime: 0,
  });

  const [isActive, setIsActive] = useState(false);

  const updateHUDData = useCallback(() => {
    try {
      const raceManager = getSimpleRaceManager();
      const raceState = raceManager.getState();
      const lapHUDData = raceManager.getLapHUDData();
      
      // Get player car speed
      const playerCar = raceManager.getPlayerCar();
      const carState = playerCar.getState();
      const speed = carState.speed * 3.6; // Convert m/s to km/h

      setHudData({
        currentLap: lapHUDData.currentLap,
        totalLaps: lapHUDData.totalLaps,
        currentLapTime: lapHUDData.currentLapTime,
        currentLapTimeFormatted: lapHUDData.currentLapTimeFormatted,
        bestLapTime: lapHUDData.bestLapTime,
        bestLapTimeFormatted: lapHUDData.bestLapTimeFormatted,
        lastLapTime: lapHUDData.lastLapTime,
        lastLapTimeFormatted: lapHUDData.lastLapTimeFormatted,
        isNewBestLap: lapHUDData.isNewBestLap,
        raceProgress: lapHUDData.raceProgress,
        speed: Math.round(speed),
        raceTime: raceState.raceTime,
      });
    } catch (error) {
      console.error('Error updating HUD data:', error);
    }
  }, []);

  const startHUDUpdates = useCallback(() => {
    setIsActive(true);
    console.log('🏁 useLapTimeHUD: Starting HUD updates');
  }, []);

  const stopHUDUpdates = useCallback(() => {
    setIsActive(false);
    console.log('🏁 useLapTimeHUD: Stopping HUD updates');
  }, []);

  const resetHUD = useCallback(() => {
    setHudData({
      currentLap: 0,
      totalLaps: 3,
      currentLapTime: 0,
      currentLapTimeFormatted: '00:00.000',
      bestLapTime: 0,
      bestLapTimeFormatted: '--:--.---',
      lastLapTime: 0,
      lastLapTimeFormatted: '--:--.---',
      isNewBestLap: false,
      raceProgress: 0,
      speed: 0,
      raceTime: 0,
    });
    console.log('🏁 useLapTimeHUD: HUD data reset');
  }, []);

  // Real-time updates
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(updateHUDData, updateInterval);
    
    return () => {
      clearInterval(interval);
    };
  }, [isActive, updateHUDData, updateInterval]);

  return {
    hudData,
    isActive,
    startHUDUpdates,
    stopHUDUpdates,
    resetHUD,
    updateHUDData,
  };
};

export default useLapTimeHUD;

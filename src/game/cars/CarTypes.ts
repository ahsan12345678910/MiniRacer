export interface CarConfig {
  id: string;
  name: string;
  color: string;
  borderColor: string;
  windowColor: string;
  headlightColor: string;
  wheelColor: string;
  spoilerColor: string;
  isPlayer: boolean;
  aiEnabled: boolean;
  aiSpeed: number;
  aiAggressiveness: number;
}

export const CAR_TYPES: Record<string, CarConfig> = {
  player: {
    id: 'player',
    name: 'Player',
    color: '#FF4444',
    borderColor: '#CC3333',
    windowColor: 'rgba(135, 206, 250, 0.8)',
    headlightColor: '#FFFF99',
    wheelColor: '#333333',
    spoilerColor: '#222222',
    isPlayer: true,
    aiEnabled: false,
    aiSpeed: 0,
    aiAggressiveness: 0,
  },
  ai_red: {
    id: 'ai_red',
    name: 'Red Racer',
    color: '#FF4444',
    borderColor: '#CC3333',
    windowColor: 'rgba(135, 206, 250, 0.8)',
    headlightColor: '#FFFF99',
    wheelColor: '#333333',
    spoilerColor: '#222222',
    isPlayer: false,
    aiEnabled: true,
    aiSpeed: 0.8,
    aiAggressiveness: 0.6,
  },
  ai_blue: {
    id: 'ai_blue',
    name: 'Blue Lightning',
    color: '#4444FF',
    borderColor: '#3333CC',
    windowColor: 'rgba(135, 206, 250, 0.8)',
    headlightColor: '#FFFF99',
    wheelColor: '#333333',
    spoilerColor: '#222222',
    isPlayer: false,
    aiEnabled: true,
    aiSpeed: 0.9,
    aiAggressiveness: 0.7,
  },
  ai_green: {
    id: 'ai_green',
    name: 'Green Machine',
    color: '#44FF44',
    borderColor: '#33CC33',
    windowColor: 'rgba(135, 206, 250, 0.8)',
    headlightColor: '#FFFF99',
    wheelColor: '#333333',
    spoilerColor: '#222222',
    isPlayer: false,
    aiEnabled: true,
    aiSpeed: 0.7,
    aiAggressiveness: 0.5,
  },
  ai_yellow: {
    id: 'ai_yellow',
    name: 'Yellow Thunder',
    color: '#FFFF44',
    borderColor: '#CCCC33',
    windowColor: 'rgba(135, 206, 250, 0.8)',
    headlightColor: '#FFFF99',
    wheelColor: '#333333',
    spoilerColor: '#222222',
    isPlayer: false,
    aiEnabled: true,
    aiSpeed: 0.85,
    aiAggressiveness: 0.8,
  },
  ai_purple: {
    id: 'ai_purple',
    name: 'Purple Storm',
    color: '#FF44FF',
    borderColor: '#CC33CC',
    windowColor: 'rgba(135, 206, 250, 0.8)',
    headlightColor: '#FFFF99',
    wheelColor: '#333333',
    spoilerColor: '#222222',
    isPlayer: false,
    aiEnabled: true,
    aiSpeed: 0.75,
    aiAggressiveness: 0.9,
  },
  ai_orange: {
    id: 'ai_orange',
    name: 'Orange Blaze',
    color: '#FF8844',
    borderColor: '#CC6633',
    windowColor: 'rgba(135, 206, 250, 0.8)',
    headlightColor: '#FFFF99',
    wheelColor: '#333333',
    spoilerColor: '#222222',
    isPlayer: false,
    aiEnabled: true,
    aiSpeed: 0.8,
    aiAggressiveness: 0.6,
  },
};

export const getRandomAICar = (): CarConfig => {
  const aiCars = Object.values(CAR_TYPES).filter(car => car.aiEnabled);
  const randomIndex = Math.floor(Math.random() * aiCars.length);
  return { ...aiCars[randomIndex] };
};

export const getAllAICars = (): CarConfig[] => {
  return Object.values(CAR_TYPES).filter(car => car.aiEnabled);
};

/**
 * Power-up Renderer Component
 * 
 * Renders power-ups on the game screen with animations and effects
 */

import React, { useEffect, useRef } from 'react';
import { PowerUpInstance } from './PowerUpTypes';

interface PowerUpRendererProps {
  powerUp: PowerUpInstance;
  screenX: number;
  screenY: number;
  scale: number;
}

export const PowerUpRenderer: React.FC<PowerUpRendererProps> = ({
  powerUp,
  screenX,
  screenY,
  scale,
}) => {
  const animationRef = useRef<number>();
  const [animationPhase, setAnimationPhase] = React.useState(0);

  useEffect(() => {
    const animate = () => {
      setAnimationPhase(prev => (prev + 0.1) % (Math.PI * 2));
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const { visual } = powerUp.config;
  const size = visual.size * scale;
  
  // Calculate animation effects
  let animationStyle: React.CSSProperties = {};
  
  switch (visual.animation) {
    case 'pulse':
      const pulseScale = 1 + Math.sin(animationPhase * 2) * 0.2;
      animationStyle = {
        transform: `scale(${pulseScale})`,
        transition: 'transform 0.1s ease-out',
      };
      break;
    case 'rotate':
      animationStyle = {
        transform: `rotate(${animationPhase * 180 / Math.PI}deg)`,
        transition: 'transform 0.1s ease-out',
      };
      break;
    case 'glow':
      const glowIntensity = 0.5 + Math.sin(animationPhase * 3) * 0.3;
      animationStyle = {
        boxShadow: `0 0 ${glowIntensity * 20}px ${visual.color}`,
        filter: `brightness(${1 + glowIntensity * 0.5})`,
      };
      break;
    default:
      break;
  }

  return (
    <div
      style={{
        position: 'absolute',
        left: screenX - size / 2,
        top: screenY - size / 2,
        width: size,
        height: size,
        backgroundColor: visual.color,
        border: `2px solid ${visual.borderColor}`,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.6,
        fontWeight: 'bold',
        color: 'white',
        textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
        zIndex: 10,
        ...animationStyle,
      }}
    >
      {visual.icon}
    </div>
  );
};

interface PowerUpHUDProps {
  activePowerUps: PowerUpInstance[];
  screenWidth: number;
  screenHeight: number;
}

export const PowerUpHUD: React.FC<PowerUpHUDProps> = ({
  activePowerUps,
  screenWidth,
  screenHeight,
}) => {
  if (activePowerUps.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: 20,
        right: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        zIndex: 100,
      }}
    >
      {activePowerUps.map((powerUp) => {
        const timeRemaining = powerUp.config.duration - 
          ((Date.now() / 1000) - (powerUp.collectionTime || 0));
        
        if (timeRemaining <= 0) return null;

        return (
          <div
            key={powerUp.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              padding: '8px 12px',
              borderRadius: 8,
              border: `2px solid ${powerUp.config.visual.borderColor}`,
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                backgroundColor: powerUp.config.visual.color,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                color: 'white',
              }}
            >
              {powerUp.config.visual.icon}
            </div>
            <div style={{ color: 'white', fontSize: 12 }}>
              {powerUp.config.name}
            </div>
            <div style={{ color: 'white', fontSize: 10 }}>
              {timeRemaining.toFixed(1)}s
            </div>
          </div>
        );
      })}
    </div>
  );
};

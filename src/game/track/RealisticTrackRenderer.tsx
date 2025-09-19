/**
 * Realistic Track Renderer
 * 
 * Renders a professional racing circuit with realistic visuals, textures, and effects
 */

import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { RealisticTrackDesign, TrackSegment, TrackMarking } from './RealisticTrackDesign';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface RealisticTrackRendererProps {
  track: RealisticTrackDesign;
  cameraX: number;
  cameraY: number;
  screenWidth: number;
  screenHeight: number;
  showRacingLine?: boolean;
  showCheckpoints?: boolean;
}

export const RealisticTrackRenderer: React.FC<RealisticTrackRendererProps> = ({
  track,
  cameraX,
  cameraY,
  screenWidth,
  screenHeight,
  showRacingLine = false,
  showCheckpoints = true,
}) => {
  // Convert world coordinates to screen coordinates
  const worldToScreen = (worldX: number, worldY: number) => {
    const screenX = screenWidth / 2 + (worldX - cameraX);
    const screenY = screenHeight / 2 + (worldY - cameraY);
    return { x: screenX, y: screenY };
  };

  // Check if a segment is visible on screen
  const isSegmentVisible = (segment: TrackSegment) => {
    const screenPos = worldToScreen(segment.x, segment.y);
    const screenEndPos = worldToScreen(segment.x + segment.width, segment.y + segment.height);
    
    return !(screenEndPos.x < -100 || screenPos.x > screenWidth + 100 || 
             screenEndPos.y < -100 || screenPos.y > screenHeight + 100);
  };

  // Get segment style based on type
  const getSegmentStyle = (segment: TrackSegment) => {
    const baseStyle = {
      left: worldToScreen(segment.x, segment.y).x,
      top: worldToScreen(segment.x, segment.y).y,
      width: segment.width,
      height: segment.height,
    };

    switch (segment.type) {
      case 'road':
        return {
          ...baseStyle,
          backgroundColor: '#404040',
          borderColor: '#606060',
          borderWidth: 1,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 3,
        };
      
      case 'grass':
        return {
          ...baseStyle,
          backgroundColor: '#2a4a2a',
          borderColor: '#1a3a1a',
          borderWidth: 0.5,
        };
      
      case 'wall':
        return {
          ...baseStyle,
          backgroundColor: '#8B4513',
          borderColor: '#654321',
          borderWidth: 2,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.5,
          shadowRadius: 6,
          elevation: 5,
        };
      
      case 'curb':
        return {
          ...baseStyle,
          backgroundColor: '#FFD700',
          borderColor: '#FFA500',
          borderWidth: 1,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.3,
          shadowRadius: 2,
          elevation: 2,
        };
      
      case 'runoff':
        return {
          ...baseStyle,
          backgroundColor: '#654321',
          borderColor: '#4a2a1a',
          borderWidth: 1,
        };
      
      case 'barrier':
        return {
          ...baseStyle,
          backgroundColor: '#A0522D',
          borderColor: '#8B4513',
          borderWidth: 2,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.4,
          shadowRadius: 4,
          elevation: 4,
        };
      
      default:
        return baseStyle;
    }
  };

  // Get marking style
  const getMarkingStyle = (marking: TrackMarking) => {
    const baseStyle = {
      left: worldToScreen(marking.x, marking.y).x,
      top: worldToScreen(marking.x, marking.y).y,
      width: marking.width,
      height: marking.height,
      backgroundColor: marking.color,
    };

    switch (marking.type) {
      case 'center_line':
        return {
          ...baseStyle,
          borderStyle: marking.style === 'dashed' ? 'dashed' : 'solid',
          borderWidth: 1,
          borderColor: marking.color,
        };
      
      case 'edge_line':
        return {
          ...baseStyle,
          borderStyle: 'solid',
          borderWidth: 1,
          borderColor: marking.color,
        };
      
      case 'start_line':
        return {
          ...baseStyle,
          backgroundColor: '#FFFFFF',
          borderColor: '#000000',
          borderWidth: 2,
          borderStyle: 'dashed',
        };
      
      case 'finish_line':
        return {
          ...baseStyle,
          backgroundColor: '#FFFFFF',
          borderColor: '#000000',
          borderWidth: 2,
          borderStyle: 'solid',
        };
      
      default:
        return baseStyle;
    }
  };

  return (
    <View style={styles.trackContainer}>
      {/* Render track segments */}
      {track.segments.map((segment, index) => {
        if (!isSegmentVisible(segment)) return null;
        
        return (
          <View
            key={`segment-${segment.id}`}
            style={[
              styles.trackSegment,
              getSegmentStyle(segment),
            ]}
          />
        );
      })}
      
      {/* Render track markings */}
      {track.markings.map((marking, index) => {
        if (!isSegmentVisible(marking)) return null;
        
        return (
          <View
            key={`marking-${marking.id}`}
            style={[
              styles.trackMarking,
              getMarkingStyle(marking),
            ]}
          />
        );
      })}
      
      {/* Render racing line */}
      {showRacingLine && (
        <View style={styles.racingLineContainer}>
          {track.racingLine.map((point, index) => {
            if (index === 0) return null;
            
            const prevPoint = track.racingLine[index - 1];
            const screenPos1 = worldToScreen(prevPoint.x, prevPoint.y);
            const screenPos2 = worldToScreen(point.x, point.y);
            
            return (
              <View
                key={`racing-line-${index}`}
                style={[
                  styles.racingLineSegment,
                  {
                    left: Math.min(screenPos1.x, screenPos2.x),
                    top: Math.min(screenPos1.y, screenPos2.y),
                    width: Math.abs(screenPos2.x - screenPos1.x) || 2,
                    height: Math.abs(screenPos2.y - screenPos1.y) || 2,
                  },
                ]}
              />
            );
          })}
        </View>
      )}
      
      {/* Render checkpoints */}
      {showCheckpoints && track.checkpoints.map((checkpoint, index) => {
        if (!isSegmentVisible(checkpoint)) return null;
        
        const screenPos = worldToScreen(checkpoint.x, checkpoint.y);
        
        return (
          <View
            key={`checkpoint-${checkpoint.id}`}
            style={[
              styles.checkpoint,
              {
                left: screenPos.x,
                top: screenPos.y,
                width: checkpoint.width,
                height: checkpoint.height,
                transform: [{ rotate: `${checkpoint.angle}deg` }],
              },
            ]}
          />
        );
      })}
      
      {/* Render start/finish line */}
      <View
        style={[
          styles.startFinishLine,
          {
            left: worldToScreen(track.startLine.x1, track.startLine.y1).x,
            top: worldToScreen(track.startLine.x1, track.startLine.y1).y,
            width: Math.abs(worldToScreen(track.startLine.x2, track.startLine.y2).x - 
                           worldToScreen(track.startLine.x1, track.startLine.y1).x),
            height: Math.abs(worldToScreen(track.startLine.x2, track.startLine.y2).y - 
                            worldToScreen(track.startLine.x1, track.startLine.y1).y),
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  trackContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  trackSegment: {
    position: 'absolute',
  },
  trackMarking: {
    position: 'absolute',
  },
  racingLineContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  racingLineSegment: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 0, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 0, 0.6)',
    borderStyle: 'dashed',
  },
  checkpoint: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderWidth: 2,
    borderColor: '#FFD700',
    borderStyle: 'dashed',
  },
  startFinishLine: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 3,
    borderColor: '#000000',
    borderStyle: 'dashed',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
});

export default RealisticTrackRenderer;

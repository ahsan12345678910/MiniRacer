/**
 * Professional Track Renderer
 * 
 * Renders a professional racing circuit with overpass, curbs, and decorations
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ProfessionalTrack, ProfessionalTrackSegment, TrackDecoration } from './ProfessionalTrackDesign';

interface ProfessionalTrackRendererProps {
  track: ProfessionalTrack;
  cameraX: number;
  cameraY: number;
  screenWidth: number;
  screenHeight: number;
}

export const ProfessionalTrackRenderer: React.FC<ProfessionalTrackRendererProps> = ({
  track,
  cameraX,
  cameraY,
  screenWidth,
  screenHeight,
}) => {
  // Convert world coordinates to screen coordinates
  const worldToScreen = (worldX: number, worldY: number) => {
    const screenX = screenWidth / 2 + (worldX - cameraX);
    const screenY = screenHeight / 2 + (worldY - cameraY);
    return { x: screenX, y: screenY };
  };

  // Check if a segment is visible on screen
  const isSegmentVisible = (segment: ProfessionalTrackSegment | TrackDecoration) => {
    const screenPos = worldToScreen(segment.x, segment.y);
    const screenEndPos = worldToScreen(segment.x + segment.width, segment.y + segment.height);
    
    return !(screenEndPos.x < -100 || screenPos.x > screenWidth + 100 || 
             screenEndPos.y < -100 || screenPos.y > screenHeight + 100);
  };

  // Get segment style based on type
  const getSegmentStyle = (segment: ProfessionalTrackSegment) => {
    const baseStyle = {
      left: worldToScreen(segment.x, segment.y).x,
      top: worldToScreen(segment.x, segment.y).y,
      width: segment.width,
      height: segment.height,
      backgroundColor: segment.color,
    };

    switch (segment.type) {
      case 'road':
        return {
          ...baseStyle,
          borderColor: '#606060',
          borderWidth: 2,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.4,
          shadowRadius: 6,
          elevation: 4,
        };
      
      case 'grass':
        return {
          ...baseStyle,
          borderColor: '#1a3a1a',
          borderWidth: 1,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.2,
          shadowRadius: 2,
          elevation: 1,
        };
      
      case 'curb':
        return {
          ...baseStyle,
          borderColor: '#FFFFFF',
          borderWidth: 2,
          borderStyle: 'dashed',
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.4,
          shadowRadius: 3,
          elevation: 3,
        };
      
      case 'overpass':
        return {
          ...baseStyle,
          borderColor: '#808080',
          borderWidth: 3,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.6,
          shadowRadius: 8,
          elevation: 6,
        };
      
      case 'underpass':
        return {
          ...baseStyle,
          borderColor: '#404040',
          borderWidth: 2,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 2,
        };
      
      case 'barrier':
        return {
          ...baseStyle,
          borderColor: '#654321',
          borderWidth: 2,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.5,
          shadowRadius: 5,
          elevation: 4,
        };
      
      default:
        return baseStyle;
    }
  };

  // Get decoration style
  const getDecorationStyle = (decoration: TrackDecoration) => {
    const baseStyle = {
      left: worldToScreen(decoration.x, decoration.y).x,
      top: worldToScreen(decoration.x, decoration.y).y,
      width: decoration.width,
      height: decoration.height,
      backgroundColor: decoration.color,
    };

    switch (decoration.type) {
      case 'tree':
        return {
          ...baseStyle,
          borderRadius: 10,
          borderColor: '#006400',
          borderWidth: 1,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.3,
          shadowRadius: 2,
          elevation: 2,
        };
      
      case 'building':
        return {
          ...baseStyle,
          borderColor: '#654321',
          borderWidth: 2,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.4,
          shadowRadius: 5,
          elevation: 3,
        };
      
      case 'barrier':
        return {
          ...baseStyle,
          borderColor: '#8B4513',
          borderWidth: 1,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.2,
          shadowRadius: 2,
          elevation: 1,
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
      
      {/* Render track decorations */}
      {track.decorations.map((decoration, index) => {
        if (!isSegmentVisible(decoration)) return null;
        
        return (
          <View
            key={`decoration-${decoration.id}`}
            style={[
              styles.trackDecoration,
              getDecorationStyle(decoration),
            ]}
          />
        );
      })}
      
      {/* Render start/finish line with checkered pattern */}
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
      
      {/* Render checkpoints */}
      {track.checkpoints.map((checkpoint, index) => {
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
              },
            ]}
          />
        );
      })}
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
  trackDecoration: {
    position: 'absolute',
  },
  startFinishLine: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderWidth: 4,
    borderColor: '#000000',
    borderStyle: 'dashed',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 5,
  },
  checkpoint: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 215, 0, 0.4)',
    borderWidth: 3,
    borderColor: '#FFD700',
    borderStyle: 'dashed',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default ProfessionalTrackRenderer;

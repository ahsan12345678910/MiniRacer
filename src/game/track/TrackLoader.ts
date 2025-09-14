/**
 * Track loader utility
 * 
 * Loads track data from JSON files
 */

import { Track, TrackData } from './Track';

/**
 * Loads track data from a JSON file
 * @param trackJson - Track data as JSON object
 * @returns Track instance
 */
export function loadTrackFromJson(trackJson: TrackData): Track {
  return new Track(trackJson);
}

/**
 * Loads the default track
 * @returns Default track instance
 */
export function loadDefaultTrack(): Track {
  // In a real app, this would load from assets/tracks/default.json
  // For now, we'll return the track data directly
  const defaultTrackData: TrackData = {
    width: 800,
    height: 600,
    start: {
      x: 100,
      y: 300,
      angle: 0
    },
    surfaces: [
      {
        type: "asphalt",
        rect: [50, 50, 700, 500]
      },
      {
        type: "grass",
        rect: [0, 0, 800, 50]
      },
      {
        type: "grass",
        rect: [0, 550, 800, 50]
      },
      {
        type: "grass",
        rect: [0, 0, 50, 600]
      },
      {
        type: "grass",
        rect: [750, 0, 50, 600]
      }
    ],
    walls: [
      [50, 50, 750, 50],
      [750, 50, 750, 550],
      [750, 550, 50, 550],
      [50, 550, 50, 50],
      [200, 200, 600, 200],
      [600, 200, 600, 400],
      [600, 400, 200, 400],
      [200, 400, 200, 200]
    ],
    startLine: {
      x1: 100,
      y1: 300,
      x2: 100,
      y2: 350,
      norm: [1, 0]
    }
  };

  return new Track(defaultTrackData);
}
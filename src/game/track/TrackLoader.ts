import { Track, TrackData } from './Track';

export interface TrackLoaderOptions {
  basePath?: string;
  cacheEnabled?: boolean;
}

export class TrackLoader {
  private basePath: string;
  private cache: Map<string, Track> = new Map();
  private cacheEnabled: boolean;

  constructor(options: TrackLoaderOptions = {}) {
    this.basePath = options.basePath || '/src/assets/tracks/';
    this.cacheEnabled = options.cacheEnabled ?? true;
  }

  /**
   * Load a track from a JSON file
   */
  async loadTrack(trackId: string): Promise<Track> {
    // Check cache first
    if (this.cacheEnabled && this.cache.has(trackId)) {
      return this.cache.get(trackId)!;
    }

    try {
      const trackData = await this.loadTrackData(trackId);
      const track = new Track(trackData);

      // Cache the track
      if (this.cacheEnabled) {
        this.cache.set(trackId, track);
      }

      return track;
    } catch (error) {
      console.error(`Failed to load track: ${trackId}`, error);
      throw new Error(`Track loading failed: ${trackId}`);
    }
  }

  /**
   * Load track data from JSON file
   */
  private async loadTrackData(trackId: string): Promise<TrackData> {
    const filePath = `${this.basePath}${trackId}.json`;
    
    try {
      // In a real React Native app, you would use a different method to load JSON
      // For now, we'll use a dynamic import approach
      const response = await fetch(filePath);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const trackData: TrackData = await response.json();
      
      // Validate track data
      this.validateTrackData(trackData);
      
      return trackData;
    } catch (error) {
      console.error(`Error loading track data from ${filePath}:`, error);
      
      // Fallback to default track if loading fails
      if (trackId === 'default') {
        return this.getDefaultTrackData();
      }
      
      throw error;
    }
  }

  /**
   * Validate track data structure
   */
  private validateTrackData(data: any): asserts data is TrackData {
    const requiredFields = ['id', 'name', 'zones', 'startPosition'];
    
    for (const field of requiredFields) {
      if (!(field in data)) {
        throw new Error(`Invalid track data: missing required field '${field}'`);
      }
    }

    if (!Array.isArray(data.zones) || data.zones.length === 0) {
      throw new Error('Invalid track data: zones must be a non-empty array');
    }

    if (!data.startPosition.x || !data.startPosition.y) {
      throw new Error('Invalid track data: startPosition must have x and y coordinates');
    }
  }

  /**
   * Get default track data (fallback)
   */
  private getDefaultTrackData(): TrackData {
    return {
      id: 'default',
      name: 'Default Track',
      description: 'A simple rectangular racing track',
      version: '1.0.0',
      author: 'MiniRacer',
      difficulty: 'easy',
      laps: 3,
      width: 800,
      height: 600,
      startPosition: {
        x: 100,
        y: 300,
        angle: 0,
      },
      checkpoints: [
        {
          id: 'cp1',
          position: { x: 700, y: 300 },
          radius: 50,
          order: 1,
        },
        {
          id: 'cp2',
          position: { x: 700, y: 200 },
          radius: 50,
          order: 2,
        },
        {
          id: 'cp3',
          position: { x: 100, y: 200 },
          radius: 50,
          order: 3,
        },
      ],
      zones: [
        {
          id: 'asphalt_main',
          type: 'asphalt',
          name: 'Main Track',
          color: '#333333',
          properties: {
            friction: 0.95,
            grip: 1.0,
            roughness: 1.0,
            isCollidable: false,
            isCheckpoint: false,
          },
          geometry: {
            type: 'rectangle',
            points: [{ x: 50, y: 150 }],
            width: 700,
            height: 300,
          },
        },
        {
          id: 'grass_outer',
          type: 'grass',
          name: 'Outer Grass',
          color: '#228B22',
          properties: {
            friction: 0.85,
            grip: 0.7,
            roughness: 0.8,
            isCollidable: false,
            isCheckpoint: false,
          },
          geometry: {
            type: 'rectangle',
            points: [{ x: 0, y: 0 }],
            width: 800,
            height: 600,
          },
        },
        {
          id: 'barrier_outer',
          type: 'barrier',
          name: 'Outer Barrier',
          color: '#8B4513',
          properties: {
            friction: 0.9,
            grip: 0.5,
            roughness: 1.0,
            isCollidable: true,
            isCheckpoint: false,
          },
          geometry: {
            type: 'rectangle',
            points: [{ x: 0, y: 0 }],
            width: 800,
            height: 600,
          },
        },
        {
          id: 'start_line',
          type: 'startLine',
          name: 'Start Line',
          color: '#FFFFFF',
          properties: {
            friction: 0.95,
            grip: 1.0,
            roughness: 1.0,
            isCollidable: false,
            isCheckpoint: true,
          },
          geometry: {
            type: 'rectangle',
            points: [{ x: 90, y: 290 }],
            width: 20,
            height: 20,
          },
        },
      ],
      background: {
        color: '#87CEEB',
      },
    };
  }

  /**
   * Load multiple tracks
   */
  async loadTracks(trackIds: string[]): Promise<Map<string, Track>> {
    const tracks = new Map<string, Track>();
    
    const loadPromises = trackIds.map(async (trackId) => {
      try {
        const track = await this.loadTrack(trackId);
        tracks.set(trackId, track);
      } catch (error) {
        console.error(`Failed to load track ${trackId}:`, error);
      }
    });

    await Promise.all(loadPromises);
    return tracks;
  }

  /**
   * Get available track IDs (in a real app, this would read from a directory)
   */
  getAvailableTracks(): string[] {
    return ['default'];
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cached track
   */
  getCachedTrack(trackId: string): Track | undefined {
    return this.cache.get(trackId);
  }

  /**
   * Check if track is cached
   */
  isTrackCached(trackId: string): boolean {
    return this.cache.has(trackId);
  }

  /**
   * Preload tracks
   */
  async preloadTracks(trackIds: string[]): Promise<void> {
    const loadPromises = trackIds.map(trackId => this.loadTrack(trackId));
    await Promise.all(loadPromises);
  }
}

// Singleton instance
let trackLoader: TrackLoader | null = null;

export const getTrackLoader = (): TrackLoader => {
  if (!trackLoader) {
    trackLoader = new TrackLoader();
  }
  return trackLoader;
};

// Helper function to load default track
export const loadDefaultTrack = async (): Promise<Track> => {
  const loader = getTrackLoader();
  return loader.loadTrack('default');
};

export interface CameraState {
  x: number;
  y: number;
  zoom: number;
  rotation: number;
}

export interface CameraSettings {
  followTarget: boolean;
  smoothFollow: boolean;
  followSpeed: number;
  zoomSpeed: number;
  minZoom: number;
  maxZoom: number;
  defaultZoom: number;
}

export class Camera {
  private state: CameraState;
  private settings: CameraSettings;
  private targetX: number = 0;
  private targetY: number = 0;
  private screenWidth: number = 400;
  private screenHeight: number = 800;

  constructor(
    screenWidth: number = 400,
    screenHeight: number = 800,
    settings: Partial<CameraSettings> = {}
  ) {
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
    
    this.state = {
      x: 0,
      y: 0,
      zoom: 1.0,
      rotation: 0,
    };

    this.settings = {
      followTarget: true,
      smoothFollow: true,
      followSpeed: 5.0,
      zoomSpeed: 0.1,
      minZoom: 0.5,
      maxZoom: 2.0,
      defaultZoom: 1.0,
      ...settings,
    };
  }

  /**
   * Update camera position
   */
  update(deltaTime: number): void {
    if (this.settings.followTarget) {
      if (this.settings.smoothFollow) {
        // Smooth follow with interpolation
        const followFactor = this.settings.followSpeed * (deltaTime / 1000);
        this.state.x += (this.targetX - this.state.x) * followFactor;
        this.state.y += (this.targetY - this.state.y) * followFactor;
      } else {
        // Instant follow
        this.state.x = this.targetX;
        this.state.y = this.targetY;
      }
    }
  }

  /**
   * Set the target position to follow
   */
  setTarget(x: number, y: number): void {
    this.targetX = x;
    this.targetY = y;
  }

  /**
   * Convert world coordinates to screen coordinates
   */
  worldToScreen(worldX: number, worldY: number): { x: number; y: number } {
    // Apply camera transformation
    const relativeX = worldX - this.state.x;
    const relativeY = worldY - this.state.y;

    // Apply zoom
    const zoomedX = relativeX * this.state.zoom;
    const zoomedY = relativeY * this.state.zoom;

    // Center on screen
    const screenX = this.screenWidth / 2 + zoomedX;
    const screenY = this.screenHeight / 2 + zoomedY;

    return { x: screenX, y: screenY };
  }

  /**
   * Convert screen coordinates to world coordinates
   */
  screenToWorld(screenX: number, screenY: number): { x: number; y: number } {
    // Convert to relative coordinates
    const relativeX = screenX - this.screenWidth / 2;
    const relativeY = screenY - this.screenHeight / 2;

    // Apply inverse zoom
    const unzoomedX = relativeX / this.state.zoom;
    const unzoomedY = relativeY / this.state.zoom;

    // Add camera position
    const worldX = this.state.x + unzoomedX;
    const worldY = this.state.y + unzoomedY;

    return { x: worldX, y: worldY };
  }

  /**
   * Set camera position directly
   */
  setPosition(x: number, y: number): void {
    this.state.x = x;
    this.state.y = y;
    this.targetX = x;
    this.targetY = y;
  }

  /**
   * Set zoom level
   */
  setZoom(zoom: number): void {
    this.state.zoom = Math.max(
      this.settings.minZoom,
      Math.min(this.settings.maxZoom, zoom)
    );
  }

  /**
   * Adjust zoom by delta
   */
  adjustZoom(delta: number): void {
    this.setZoom(this.state.zoom + delta);
  }

  /**
   * Reset camera to default state
   */
  reset(): void {
    this.state.x = 0;
    this.state.y = 0;
    this.state.zoom = this.settings.defaultZoom;
    this.state.rotation = 0;
    this.targetX = 0;
    this.targetY = 0;
  }

  /**
   * Update screen dimensions
   */
  updateScreenDimensions(width: number, height: number): void {
    this.screenWidth = width;
    this.screenHeight = height;
  }

  /**
   * Get current camera state
   */
  getState(): CameraState {
    return { ...this.state };
  }

  /**
   * Get camera settings
   */
  getSettings(): CameraSettings {
    return { ...this.settings };
  }

  /**
   * Update camera settings
   */
  updateSettings(newSettings: Partial<CameraSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
  }

  /**
   * Check if a world position is visible on screen
   */
  isVisible(worldX: number, worldY: number): boolean {
    const screenPos = this.worldToScreen(worldX, worldY);
    return (
      screenPos.x >= -100 &&
      screenPos.x <= this.screenWidth + 100 &&
      screenPos.y >= -100 &&
      screenPos.y <= this.screenHeight + 100
    );
  }

  /**
   * Get the visible world bounds
   */
  getVisibleBounds(): {
    left: number;
    right: number;
    top: number;
    bottom: number;
  } {
    const topLeft = this.screenToWorld(0, 0);
    const bottomRight = this.screenToWorld(this.screenWidth, this.screenHeight);
    
    return {
      left: topLeft.x,
      right: bottomRight.x,
      top: topLeft.y,
      bottom: bottomRight.y,
    };
  }
}

// Default camera settings
export const DEFAULT_CAMERA_SETTINGS: CameraSettings = {
  followTarget: true,
  smoothFollow: true,
  followSpeed: 8.0,
  zoomSpeed: 0.1,
  minZoom: 0.3,
  maxZoom: 3.0,
  defaultZoom: 1.0,
};

// Helper function to create camera
export const createCamera = (
  screenWidth: number,
  screenHeight: number,
  settings: Partial<CameraSettings> = {}
): Camera => {
  return new Camera(screenWidth, screenHeight, settings);
};

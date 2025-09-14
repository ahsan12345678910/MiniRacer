/**
 * Math utilities for coordinate transformations and calculations
 */

export interface Viewport {
  /** Screen width in pixels */
  screenWidth: number;
  /** Screen height in pixels */
  screenHeight: number;
  /** World width in meters */
  worldWidth: number;
  /** World height in meters */
  worldHeight: number;
  /** Camera position in world coordinates */
  cameraX: number;
  /** Camera position in world coordinates */
  cameraY: number;
  /** Zoom level (1.0 = normal, 2.0 = 2x zoom) */
  zoom: number;
}

/**
 * Default viewport configuration
 */
export const DEFAULT_VIEWPORT: Viewport = {
  screenWidth: 800,
  screenHeight: 600,
  worldWidth: 800,
  worldHeight: 600,
  cameraX: 0,
  cameraY: 0,
  zoom: 1.0,
};

/**
 * Converts world coordinates to screen coordinates
 * @param worldX - X coordinate in world space (meters)
 * @param worldY - Y coordinate in world space (meters)
 * @param viewport - Viewport configuration
 * @returns Screen coordinates in pixels
 */
export function worldToScreen(
  worldX: number,
  worldY: number,
  viewport: Viewport = DEFAULT_VIEWPORT
): { x: number; y: number } {
  // Apply camera offset and zoom
  const screenX = (worldX - viewport.cameraX) * viewport.zoom + viewport.screenWidth / 2;
  const screenY = (worldY - viewport.cameraY) * viewport.zoom + viewport.screenHeight / 2;
  
  return { x: screenX, y: screenY };
}

/**
 * Converts screen coordinates to world coordinates
 * @param screenX - X coordinate in screen space (pixels)
 * @param screenY - Y coordinate in screen space (pixels)
 * @param viewport - Viewport configuration
 * @returns World coordinates in meters
 */
export function screenToWorld(
  screenX: number,
  screenY: number,
  viewport: Viewport = DEFAULT_VIEWPORT
): { x: number; y: number } {
  // Remove screen offset and apply inverse zoom and camera offset
  const worldX = (screenX - viewport.screenWidth / 2) / viewport.zoom + viewport.cameraX;
  const worldY = (screenY - viewport.screenHeight / 2) / viewport.zoom + viewport.cameraY;
  
  return { x: worldX, y: worldY };
}

/**
 * Calculates distance between two points
 * @param x1 - First point X coordinate
 * @param y1 - First point Y coordinate
 * @param x2 - Second point X coordinate
 * @param y2 - Second point Y coordinate
 * @returns Distance between points
 */
export function distance(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Normalizes a vector to unit length
 * @param x - Vector X component
 * @param y - Vector Y component
 * @returns Normalized vector
 */
export function normalize(x: number, y: number): { x: number; y: number } {
  const length = Math.sqrt(x * x + y * y);
  if (length === 0) return { x: 0, y: 0 };
  return { x: x / length, y: y / length };
}

/**
 * Calculates dot product of two vectors
 * @param x1 - First vector X component
 * @param y1 - First vector Y component
 * @param x2 - Second vector X component
 * @param y2 - Second vector Y component
 * @returns Dot product
 */
export function dotProduct(x1: number, y1: number, x2: number, y2: number): number {
  return x1 * x2 + y1 * y2;
}

/**
 * Clamps a value between min and max
 * @param value - Value to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped value
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation between two values
 * @param a - Start value
 * @param b - End value
 * @param t - Interpolation factor (0-1)
 * @returns Interpolated value
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Converts degrees to radians
 * @param degrees - Angle in degrees
 * @returns Angle in radians
 */
export function degToRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Converts radians to degrees
 * @param radians - Angle in radians
 * @returns Angle in degrees
 */
export function radToDeg(radians: number): number {
  return radians * (180 / Math.PI);
}

/**
 * Calculates angle between two points
 * @param x1 - First point X coordinate
 * @param y1 - First point Y coordinate
 * @param x2 - Second point X coordinate
 * @param y2 - Second point Y coordinate
 * @returns Angle in radians
 */
export function angleBetween(x1: number, y1: number, x2: number, y2: number): number {
  return Math.atan2(y2 - y1, x2 - x1);
}

/**
 * Rotates a point around another point
 * @param pointX - Point to rotate X coordinate
 * @param pointY - Point to rotate Y coordinate
 * @param centerX - Rotation center X coordinate
 * @param centerY - Rotation center Y coordinate
 * @param angle - Rotation angle in radians
 * @returns Rotated point coordinates
 */
export function rotatePoint(
  pointX: number,
  pointY: number,
  centerX: number,
  centerY: number,
  angle: number
): { x: number; y: number } {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  
  const dx = pointX - centerX;
  const dy = pointY - centerY;
  
  return {
    x: centerX + dx * cos - dy * sin,
    y: centerY + dx * sin + dy * cos,
  };
}

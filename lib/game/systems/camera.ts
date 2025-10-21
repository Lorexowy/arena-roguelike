/**
 * Camera System
 * 
 * Handles camera positioning and world-to-screen coordinate conversion.
 * Creates a scrolling effect for larger game worlds.
 */

import { Camera, Player } from '../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, WORLD_WIDTH, WORLD_HEIGHT } from '../config';

/**
 * Create initial camera state
 */
export function createCamera(): Camera {
  return {
    x: WORLD_WIDTH / 2,
    y: WORLD_HEIGHT / 2,
    worldWidth: WORLD_WIDTH,
    worldHeight: WORLD_HEIGHT,
    viewportWidth: CANVAS_WIDTH,
    viewportHeight: CANVAS_HEIGHT,
  };
}

/**
 * Update camera to follow player smoothly
 * Camera moves when player gets close to viewport edges
 */
export function updateCamera(camera: Camera, player: Player): void {
  const deadZone = 0.25; // Camera starts moving when player is 25% from center
  const viewportHalfW = camera.viewportWidth / 2;
  const viewportHalfH = camera.viewportHeight / 2;
  
  // Calculate player position relative to camera center
  const playerRelX = player.x - camera.x;
  const playerRelY = player.y - camera.y;
  
  // Define dead zone boundaries
  const deadZoneX = viewportHalfW * deadZone;
  const deadZoneY = viewportHalfH * deadZone;
  
  // Move camera if player is outside dead zone
  if (Math.abs(playerRelX) > deadZoneX) {
    const sign = playerRelX > 0 ? 1 : -1;
    camera.x += (Math.abs(playerRelX) - deadZoneX) * sign;
  }
  
  if (Math.abs(playerRelY) > deadZoneY) {
    const sign = playerRelY > 0 ? 1 : -1;
    camera.y += (Math.abs(playerRelY) - deadZoneY) * sign;
  }
  
  // Clamp camera to world bounds
  camera.x = Math.max(viewportHalfW, Math.min(camera.worldWidth - viewportHalfW, camera.x));
  camera.y = Math.max(viewportHalfH, Math.min(camera.worldHeight - viewportHalfH, camera.y));
}

/**
 * Reset camera to world center
 */
export function resetCamera(camera: Camera): void {
  camera.x = camera.worldWidth / 2;
  camera.y = camera.worldHeight / 2;
  camera.worldWidth = WORLD_WIDTH;
  camera.worldHeight = WORLD_HEIGHT;
  camera.viewportWidth = CANVAS_WIDTH;
  camera.viewportHeight = CANVAS_HEIGHT;
}

/**
 * Convert world coordinates to screen coordinates
 */
export function worldToScreen(
  worldX: number,
  worldY: number,
  camera: Camera
): { x: number; y: number } {
  const viewportHalfW = camera.viewportWidth / 2;
  const viewportHalfH = camera.viewportHeight / 2;
  
  return {
    x: worldX - camera.x + viewportHalfW,
    y: worldY - camera.y + viewportHalfH,
  };
}

/**
 * Convert screen coordinates to world coordinates (for mouse input)
 */
export function screenToWorld(
  screenX: number,
  screenY: number,
  camera: Camera
): { x: number; y: number } {
  const viewportHalfW = camera.viewportWidth / 2;
  const viewportHalfH = camera.viewportHeight / 2;
  
  return {
    x: screenX - viewportHalfW + camera.x,
    y: screenY - viewportHalfH + camera.y,
  };
}


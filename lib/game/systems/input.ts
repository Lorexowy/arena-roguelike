/**
 * Input System
 * 
 * Manages keyboard and mouse input handling.
 */

import { CANVAS_WIDTH, CANVAS_HEIGHT, WORLD_WIDTH, WORLD_HEIGHT } from '../config';
import { Cursor, Camera } from '../types';

/**
 * Create keyboard state tracker
 */
export function createKeyState(): { [key: string]: boolean } {
  return {};
}

/**
 * Create cursor state (in world space)
 */
export function createCursor(): Cursor {
  return {
    x: WORLD_WIDTH / 2,
    y: WORLD_HEIGHT / 2 - 20,
    isValid: false,
  };
}

/**
 * Setup keyboard event listeners
 */
export function setupKeyboardListeners(
  keys: { [key: string]: boolean }
): () => void {
  const handleKeyDown = (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    if (['w', 'a', 's', 'd'].includes(key)) {
      keys[key] = true;
      e.preventDefault();
    }
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    if (['w', 'a', 's', 'd'].includes(key)) {
      keys[key] = false;
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);

  return () => {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
  };
}

/**
 * Convert screen coordinates to logical canvas coordinates
 */
export function screenToLogicalCoords(
  canvas: HTMLCanvasElement,
  screenX: number,
  screenY: number
): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  const relativeX = (screenX - rect.left) / rect.width;
  const relativeY = (screenY - rect.top) / rect.height;
  const logicalX = relativeX * CANVAS_WIDTH;
  const logicalY = relativeY * CANVAS_HEIGHT;
  return { x: logicalX, y: logicalY };
}

/**
 * Setup mouse event listeners
 * Uses a function to get camera state for world-space conversion
 */
export function setupMouseListeners(
  canvas: HTMLCanvasElement,
  cursor: Cursor,
  getCamera: () => Camera
): () => void {
  const handleMouseMove = (e: MouseEvent) => {
    const coords = screenToLogicalCoords(canvas, e.clientX, e.clientY);
    const camera = getCamera();
    
    // Convert screen coords to world coords
    const viewportHalfW = camera.viewportWidth / 2;
    const viewportHalfH = camera.viewportHeight / 2;
    cursor.x = coords.x - viewportHalfW + camera.x;
    cursor.y = coords.y - viewportHalfH + camera.y;
    cursor.isValid = true;
  };

  const handleMouseEnter = () => {
    cursor.isValid = true;
  };

  const handleMouseLeave = () => {
    cursor.isValid = false;
  };

  canvas.addEventListener('mousemove', handleMouseMove);
  canvas.addEventListener('mouseenter', handleMouseEnter);
  canvas.addEventListener('mouseleave', handleMouseLeave);

  return () => {
    canvas.removeEventListener('mousemove', handleMouseMove);
    canvas.removeEventListener('mouseenter', handleMouseEnter);
    canvas.removeEventListener('mouseleave', handleMouseLeave);
  };
}


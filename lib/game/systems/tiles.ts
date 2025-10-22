/**
 * Tile System
 * 
 * Handles tile loading, generation, and rendering for the game world.
 */

import { TILE_CONFIG, TILE_SIZE, WORLD_WIDTH, WORLD_HEIGHT } from '../config';

export interface Tile {
  id: string;
  filename: string;
  weight: number;
}

export interface TileMap {
  tiles: string[][];
  width: number;
  height: number;
}

export interface LoadedTile {
  id: string;
  image: HTMLImageElement;
}

// Cache for loaded tile images
const tileImageCache = new Map<string, HTMLImageElement>();

/**
 * Load a single tile image
 */
export function loadTileImage(filename: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    // Check cache first
    if (tileImageCache.has(filename)) {
      resolve(tileImageCache.get(filename)!);
      return;
    }

    const img = new Image();
    img.onload = () => {
      tileImageCache.set(filename, img);
      resolve(img);
    };
    img.onerror = () => {
      console.error(`Failed to load tile image: ${filename}`);
      reject(new Error(`Failed to load tile image: ${filename}`));
    };
    img.src = TILE_CONFIG.assetsPath + filename;
  });
}

/**
 * Load all tile images
 */
export async function loadAllTiles(): Promise<LoadedTile[]> {
  const loadPromises = TILE_CONFIG.tileTypes.map(async (tile) => {
    const image = await loadTileImage(tile.filename);
    return {
      id: tile.id,
      image,
    };
  });

  return Promise.all(loadPromises);
}

/**
 * Generate a weighted random tile ID based on distribution weights
 */
function getRandomTileId(): string {
  const totalWeight = TILE_CONFIG.tileTypes.reduce((sum, tile) => sum + tile.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const tile of TILE_CONFIG.tileTypes) {
    random -= tile.weight;
    if (random <= 0) {
      return tile.id;
    }
  }
  
  // Fallback (should never reach here)
  return TILE_CONFIG.tileTypes[0].id;
}

/**
 * Generate a tile map for the entire world
 */
export function generateTileMap(): TileMap {
  const tilesX = Math.ceil(WORLD_WIDTH / TILE_SIZE);
  const tilesY = Math.ceil(WORLD_HEIGHT / TILE_SIZE);
  
  const tiles: string[][] = [];
  
  for (let y = 0; y < tilesY; y++) {
    tiles[y] = [];
    for (let x = 0; x < tilesX; x++) {
      tiles[y][x] = getRandomTileId();
    }
  }
  
  return {
    tiles,
    width: tilesX,
    height: tilesY,
  };
}

/**
 * Get tile coordinates from world coordinates
 */
export function worldToTileCoords(worldX: number, worldY: number): { tileX: number, tileY: number } {
  return {
    tileX: Math.floor(worldX / TILE_SIZE),
    tileY: Math.floor(worldY / TILE_SIZE),
  };
}

/**
 * Get tile coordinates from screen coordinates (considering camera)
 */
export function screenToTileCoords(
  screenX: number, 
  screenY: number, 
  cameraX: number, 
  cameraY: number,
  viewportWidth: number,
  viewportHeight: number
): { tileX: number, tileY: number } {
  // Convert screen coords to world coords
  const worldX = screenX + cameraX - viewportWidth / 2;
  const worldY = screenY + cameraY - viewportHeight / 2;
  
  return worldToTileCoords(worldX, worldY);
}

/**
 * Get visible tile range for rendering optimization
 */
export function getVisibleTileRange(
  cameraX: number,
  cameraY: number,
  viewportWidth: number,
  viewportHeight: number
): {
  startX: number;
  endX: number;
  startY: number;
  endY: number;
} {
  const { tileX: startTileX, tileY: startTileY } = screenToTileCoords(0, 0, cameraX, cameraY, viewportWidth, viewportHeight);
  const { tileX: endTileX, tileY: endTileY } = screenToTileCoords(viewportWidth, viewportHeight, cameraX, cameraY, viewportWidth, viewportHeight);
  
  return {
    startX: Math.max(0, startTileX - 1), // Extra tile for smooth scrolling
    endX: Math.min(Math.ceil(WORLD_WIDTH / TILE_SIZE) - 1, endTileX + 1),
    startY: Math.max(0, startTileY - 1),
    endY: Math.min(Math.ceil(WORLD_HEIGHT / TILE_SIZE) - 1, endTileY + 1),
  };
}

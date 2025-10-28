/**
 * Render System
 * 
 * All drawing and rendering logic for the game.
 * Game objects rendered with pixelated style on main canvas.
 */

import { CANVAS_WIDTH, CANVAS_HEIGHT, GRID_SIZE, BASE_STATS, VISUAL_SCALE, WORLD_WIDTH, WORLD_HEIGHT, TILE_SIZE } from '../config';
import { Player, Enemy, Bullet, XPOrb, WaveState, ScreenShake, Cursor, Camera, Chest } from '../types';
import { TileMap, getVisibleTileRange, loadAllTiles } from './tiles';
import { CHEST_CONFIG, getChestFilename } from './chests';

/**
 * Draw tiles (in world space)
 */
function drawTiles(ctx: CanvasRenderingContext2D, tileMap: TileMap, camera: Camera): void {
  // Check if tiles are loaded, if not draw solid background
  if (!tilesLoaded || tileImageCache.size === 0) {
    ctx.fillStyle = '#0B1020';
    ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    return;
  }

  // Get visible tile range for optimization
  const visibleRange = getVisibleTileRange(
    camera.x, 
    camera.y, 
    camera.viewportWidth, 
    camera.viewportHeight
  );

  // Draw only visible tiles
  for (let tileY = visibleRange.startY; tileY <= visibleRange.endY; tileY++) {
    for (let tileX = visibleRange.startX; tileX <= visibleRange.endX; tileX++) {
      if (tileY >= 0 && tileY < tileMap.height && tileX >= 0 && tileX < tileMap.width) {
        const tileId = tileMap.tiles[tileY][tileX];
        const worldX = tileX * TILE_SIZE;
        const worldY = tileY * TILE_SIZE;
        
        // Get tile image from cache
        const tileImage = getTileImage(tileId);
        if (tileImage) {
          ctx.drawImage(tileImage, worldX, worldY, TILE_SIZE, TILE_SIZE);
        }
      }
    }
  }
}

/**
 * Draw grid overlay (in world space)
 */
function drawGrid(ctx: CanvasRenderingContext2D): void {
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1 * VISUAL_SCALE;
  
  const gridSize = GRID_SIZE * VISUAL_SCALE;

  for (let x = 0; x <= WORLD_WIDTH; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, WORLD_HEIGHT);
    ctx.stroke();
  }

  for (let y = 0; y <= WORLD_HEIGHT; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(WORLD_WIDTH, y);
    ctx.stroke();
  }
}

// Cache for tile images
const tileImageCache = new Map<string, HTMLImageElement>();
let tilesLoaded = false;

/**
 * Preload all tile images and chest images
 */
export async function preloadTiles(): Promise<void> {
  if (tilesLoaded) return;
  
  const tileTypes = [
    { id: 'grass_1', filename: 'tile_grass_1.png' },
    { id: 'grass_2', filename: 'tile_grass_2.png' },
    { id: 'grass_3', filename: 'tile_grass_3.png' },
  ];
  
  const chestTypes = [
    { id: 'common', filename: 'chest_common.png' },
    { id: 'uncommon', filename: 'chest_uncommon.png' },
    { id: 'rare', filename: 'chest_rare.png' },
    { id: 'legendary', filename: 'chest_legendary.png' },
  ];
  
  const loadPromises = [
    ...tileTypes.map((tile) => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          tileImageCache.set(tile.id, img);
          resolve();
        };
        img.onerror = () => {
          console.warn(`Failed to load tile: ${tile.filename}`);
          resolve(); // Continue even if one tile fails
        };
        img.src = `/tiles/${tile.filename}`;
      });
    }),
    ...chestTypes.map((chest) => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          chestImageCache.set(chest.id, img);
          resolve();
        };
        img.onerror = () => {
          console.warn(`Failed to load chest: ${chest.filename}`);
          resolve(); // Continue even if one chest fails
        };
        img.src = `/chests/${chest.filename}`;
      });
    }),
  ];
  
  await Promise.all(loadPromises);
  tilesLoaded = true;
  console.log('Tiles and chests loaded successfully');
}

/**
 * Get tile image from cache
 */
function getTileImage(tileId: string): HTMLImageElement | null {
  return tileImageCache.get(tileId) || null;
}

/**
 * Draw chests
 */
function drawChests(ctx: CanvasRenderingContext2D, chests: Chest[], now: number): void {
  for (const chest of chests) {
    if (chest.isOpened && chest.openingStartTime) {
      // Draw opening animation
      const openingProgress = Math.min(1, (now - chest.openingStartTime) / CHEST_CONFIG.openingDuration);
      drawOpeningChest(ctx, chest, openingProgress);
    } else {
      // Draw closed chest
      drawClosedChest(ctx, chest);
    }
  }
}

/**
 * Draw a closed chest
 */
function drawClosedChest(ctx: CanvasRenderingContext2D, chest: Chest): void {
  const chestImage = getChestImage(chest.rarity);
  const size = CHEST_CONFIG.chestSize;
  
  if (chestImage) {
    ctx.drawImage(chestImage, chest.x - size/2, chest.y - size/2, size, size);
  } else {
    // Fallback: draw colored rectangle
    const colors = {
      common: '#8B4513',    // Brown
      uncommon: '#4169E1',  // Blue
      rare: '#8A2BE2',      // Purple
      legendary: '#FFD700', // Gold
    };
    
    ctx.fillStyle = colors[chest.rarity];
    ctx.fillRect(chest.x - size/2, chest.y - size/2, size, size);
    
    // Add glow effect
    ctx.shadowColor = colors[chest.rarity];
    ctx.shadowBlur = 10;
    ctx.fillRect(chest.x - size/2, chest.y - size/2, size, size);
    ctx.shadowBlur = 0;
  }
}

/**
 * Draw opening chest animation
 */
function drawOpeningChest(ctx: CanvasRenderingContext2D, chest: Chest, progress: number): void {
  const size = CHEST_CONFIG.chestSize;
  const chestImage = getChestImage(chest.rarity);
  
  // Draw chest with opening animation
  if (chestImage) {
    // Simple opening effect - scale and rotate slightly
    const scale = 1 + progress * 0.2;
    const rotation = progress * 0.1;
    
    ctx.save();
    ctx.translate(chest.x, chest.y);
    ctx.rotate(rotation);
    ctx.scale(scale, scale);
    ctx.drawImage(chestImage, -size/2, -size/2, size, size);
    ctx.restore();
  } else {
    // Fallback with animation
    const colors = {
      common: '#8B4513',
      uncommon: '#4169E1',
      rare: '#8A2BE2',
      legendary: '#FFD700',
    };
    
    const animatedSize = size * (1 + progress * 0.2);
    ctx.fillStyle = colors[chest.rarity];
    ctx.fillRect(chest.x - animatedSize/2, chest.y - animatedSize/2, animatedSize, animatedSize);
  }
  
  // Add sparkle effects
  if (progress > 0.5) {
    drawSparkles(ctx, chest, progress);
  }
}

/**
 * Draw sparkle effects around chest
 */
function drawSparkles(ctx: CanvasRenderingContext2D, chest: Chest, progress: number): void {
  const sparkleCount = Math.floor(progress * 12); // More sparkles for larger chests
  
  for (let i = 0; i < sparkleCount; i++) {
    const angle = (i / sparkleCount) * Math.PI * 2;
    const distance = 40 + Math.sin(progress * Math.PI) * 20; // Scaled up distance
    const x = chest.x + Math.cos(angle) * distance;
    const y = chest.y + Math.sin(angle) * distance;
    
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2); // Larger sparkles
    ctx.fill();
  }
}

/**
 * Get chest image from cache
 */
function getChestImage(rarity: string): HTMLImageElement | null {
  return chestImageCache.get(rarity) || null;
}

// Cache for chest images
const chestImageCache = new Map<string, HTMLImageElement>();


/**
 * Draw XP orbs
 */
function drawXPOrbs(ctx: CanvasRenderingContext2D, xpOrbs: XPOrb[]): void {
  ctx.fillStyle = '#FFD700';
  for (const orb of xpOrbs) {
    ctx.beginPath();
    ctx.arc(orb.x, orb.y, BASE_STATS.xp.orbSize, 0, Math.PI * 2);
    ctx.fill();
    
    if (orb.magnetized) {
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }
}

/**
 * Draw bullets
 */
function drawBullets(ctx: CanvasRenderingContext2D, bullets: Bullet[]): void {
  ctx.fillStyle = '#FFD700';
  for (const bullet of bullets) {
    ctx.fillRect(
      bullet.x - BASE_STATS.bullet.width / 2,
      bullet.y - BASE_STATS.bullet.height / 2,
      BASE_STATS.bullet.width,
      BASE_STATS.bullet.height
    );
  }
}

/**
 * Draw enemies (chasers and shooters)
 */
function drawEnemies(ctx: CanvasRenderingContext2D, enemies: Enemy[], now: number): void {
  for (const enemy of enemies) {
    const isFlashing = now < enemy.hitFlashEndTime;
    const size = enemy.size || BASE_STATS.enemy.chaser.size;
    
    // Color based on type
    let fillColor: string;
    if (isFlashing) {
      fillColor = '#FFFFFF';
    } else {
      fillColor = '#FF4444'; // Red for chasers
    }
    
    ctx.fillStyle = fillColor;
    ctx.strokeStyle = '#0B0F1A'; // Dark outline
    ctx.lineWidth = 1;
    
    // Draw diamond shape
    ctx.beginPath();
    ctx.moveTo(enemy.x, enemy.y - size);
    ctx.lineTo(enemy.x + size, enemy.y);
    ctx.lineTo(enemy.x, enemy.y + size);
    ctx.lineTo(enemy.x - size, enemy.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Health bar for damaged enemies
    if (enemy.health < enemy.maxHealth) {
      const barWidth = size * 2;
      const barHeight = 2;
      const healthPercent = enemy.health / enemy.maxHealth;
      
      ctx.fillStyle = '#000000';
      ctx.fillRect(enemy.x - barWidth/2, enemy.y - size - 4, barWidth, barHeight);
      
      ctx.fillStyle = '#44FF44';
      ctx.fillRect(enemy.x - barWidth/2, enemy.y - size - 4, barWidth * healthPercent, barHeight);
    }
  }
}

/**
 * Draw player
 */
function drawPlayer(ctx: CanvasRenderingContext2D, player: Player, now: number): void {
  if (!player.iframes || Math.floor(now / 100) % 2 === 0) {
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * Draw crosshair
 */
function drawCrosshair(ctx: CanvasRenderingContext2D, cursor: Cursor): void {
  if (!cursor.isValid) return;

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.lineWidth = 1;
  
  ctx.beginPath();
  ctx.moveTo(cursor.x - 4, cursor.y);
  ctx.lineTo(cursor.x + 4, cursor.y);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(cursor.x, cursor.y - 4);
  ctx.lineTo(cursor.x, cursor.y + 4);
  ctx.stroke();
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.fillRect(cursor.x - 1, cursor.y - 1, 2, 2);
}

// HUD rendering moved to hud.ts for crisp text rendering

/**
 * Draw wave banner (Wave X)
 */
function drawWaveBanner(ctx: CanvasRenderingContext2D, waveState: WaveState): void {
  if (!waveState.showBanner) return;

  // No background - just text
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold ${16 * VISUAL_SCALE}px monospace`;
  ctx.textAlign = 'center';
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.lineWidth = 5;
  ctx.strokeText(`WAVE ${waveState.currentWave}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
  ctx.fillText(`WAVE ${waveState.currentWave}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
  
  if (waveState.currentModifier) {
    ctx.fillStyle = '#FF8844';
    ctx.font = `bold ${10 * VISUAL_SCALE}px monospace`;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.lineWidth = 5;
    ctx.strokeText(waveState.currentModifier.name, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 12 * VISUAL_SCALE);
    ctx.fillText(waveState.currentModifier.name, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 12 * VISUAL_SCALE);
  }
  
  ctx.textAlign = 'left';
}

/**
 * Draw wave complete banner
 */
export function drawWaveCompleteBanner(ctx: CanvasRenderingContext2D): void {
  // No background - just text with outline
  ctx.fillStyle = '#44FF44';
  ctx.font = `bold ${16 * VISUAL_SCALE}px monospace`;
  ctx.textAlign = 'center';
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.lineWidth = 5;
  ctx.strokeText('✓ Fala pokonana!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
  ctx.fillText('✓ Fala pokonana!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
  ctx.textAlign = 'left';
}

/**
 * Draw countdown
 */
export function drawCountdown(ctx: CanvasRenderingContext2D, remaining: number): void {
  // No background - just text with outline
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold ${14 * VISUAL_SCALE}px monospace`;
  ctx.textAlign = 'center';
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.lineWidth = 5;
  ctx.strokeText('Następna fala za', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 8 * VISUAL_SCALE);
  ctx.fillText('Następna fala za', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 8 * VISUAL_SCALE);
  
  ctx.fillStyle = '#FFD700';
  ctx.font = `bold ${24 * VISUAL_SCALE}px monospace`;
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.lineWidth = 5;
  ctx.strokeText(`${remaining}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 16 * VISUAL_SCALE);
  ctx.fillText(`${remaining}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 16 * VISUAL_SCALE);
  ctx.textAlign = 'left';
}

/**
 * Draw "Get Ready" message
 */
export function drawGetReady(ctx: CanvasRenderingContext2D): void {
  // No background - just text with outline
  ctx.fillStyle = '#FFD700';
  ctx.font = `bold ${20 * VISUAL_SCALE}px monospace`;
  ctx.textAlign = 'center';
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.lineWidth = 5;
  ctx.strokeText('Przygotuj się...', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 4 * VISUAL_SCALE);
  ctx.fillText('Przygotuj się...', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 4 * VISUAL_SCALE);
  ctx.textAlign = 'left';
}

/**
 * Main render function for game objects only
 * HUD is rendered separately with crisp fonts
 */
export function renderGameObjects(
  ctx: CanvasRenderingContext2D,
  player: Player,
  enemies: Enemy[],
  bullets: Bullet[],
  xpOrbs: XPOrb[],
  waveState: WaveState,
  screenShake: ScreenShake,
  cursor: Cursor,
  camera: Camera,
  tileMap: TileMap,
  chests: Chest[]
): void {
  const now = Date.now();

  ctx.save();
  
  // Apply camera offset (convert world space to screen space)
  const viewportHalfW = camera.viewportWidth / 2;
  const viewportHalfH = camera.viewportHeight / 2;
  ctx.translate(-camera.x + viewportHalfW, -camera.y + viewportHalfH);
  ctx.translate(screenShake.offsetX, screenShake.offsetY);

  drawTiles(ctx, tileMap, camera);
  drawGrid(ctx);
  drawChests(ctx, chests, now);
  drawXPOrbs(ctx, xpOrbs);
  drawBullets(ctx, bullets);
  // Removed enemy projectiles - only chasers now
  drawEnemies(ctx, enemies, now);
  drawPlayer(ctx, player, now);
  drawCrosshair(ctx, cursor);

  ctx.restore();

  // Wave banner (rendered without camera transform)
  drawWaveBanner(ctx, waveState);
}

// Removed drawEnemyProjectiles - only chasers now


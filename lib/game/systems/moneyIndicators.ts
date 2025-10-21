/**
 * Money Indicators System
 * 
 * Pooled floating money indicators that appear when money drops.
 */

import { VISUAL_SCALE } from '../config';
import { Camera } from '../types';

export interface MoneyIndicator {
  x: number;
  y: number;
  amount: number;
  spawnTime: number;
  active: boolean;
}

const MONEY_INDICATOR_CONFIG = {
  poolSize: 30,
  lifetime: 600,      // 600ms total lifetime
  fadeStart: 300,     // Start fading at 300ms
  riseSpeed: 0.5 * VISUAL_SCALE,     // Scaled - visual effect
  fontSize: 14,
};

/**
 * Create money indicator pool
 */
export function createMoneyIndicatorPool(): MoneyIndicator[] {
  const pool: MoneyIndicator[] = [];
  for (let i = 0; i < MONEY_INDICATOR_CONFIG.poolSize; i++) {
    pool.push({
      x: 0,
      y: 0,
      amount: 0,
      spawnTime: 0,
      active: false,
    });
  }
  return pool;
}

/**
 * Spawn a money indicator
 */
export function spawnMoneyIndicator(
  pool: MoneyIndicator[],
  x: number,
  y: number,
  amount: number,
  now: number
): void {
  // Find inactive indicator in pool
  const indicator = pool.find(mi => !mi.active);
  if (indicator) {
    indicator.x = x;
    indicator.y = y;
    indicator.amount = amount;
    indicator.spawnTime = now;
    indicator.active = true;
  }
}

/**
 * Update money indicators (deactivate expired ones) - delta time based
 */
export function updateMoneyIndicators(pool: MoneyIndicator[], now: number, deltaTime: number = 16.67): void {
  const timeMultiplier = deltaTime / 16.67; // Normalize to 60 FPS baseline
  
  for (const mi of pool) {
    if (!mi.active) continue;

    const elapsed = now - mi.spawnTime;
    
    // Move upward
    mi.y -= MONEY_INDICATOR_CONFIG.riseSpeed * timeMultiplier;
    
    // Deactivate after lifetime
    if (elapsed >= MONEY_INDICATOR_CONFIG.lifetime) {
      mi.active = false;
    }
  }
}

/**
 * Draw money indicators (with camera transform)
 */
export function drawMoneyIndicators(
  ctx: CanvasRenderingContext2D,
  pool: MoneyIndicator[],
  now: number,
  camera: Camera
): void {
  ctx.save();
  
  // Apply camera offset to match game world
  const viewportHalfW = camera.viewportWidth / 2;
  const viewportHalfH = camera.viewportHeight / 2;
  ctx.translate(-camera.x + viewportHalfW, -camera.y + viewportHalfH);
  
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  for (const mi of pool) {
    if (!mi.active) continue;

    const elapsed = now - mi.spawnTime;
    const fadeStart = MONEY_INDICATOR_CONFIG.fadeStart;
    const lifetime = MONEY_INDICATOR_CONFIG.lifetime;

    // Calculate opacity
    let opacity = 1;
    if (elapsed > fadeStart) {
      opacity = 1 - (elapsed - fadeStart) / (lifetime - fadeStart);
    }

    // Bright green color (#22C55E)
    const color = `rgba(34, 197, 94, ${opacity})`;
    const fontSize = MONEY_INDICATOR_CONFIG.fontSize * VISUAL_SCALE;

    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.fillStyle = color;
    ctx.strokeStyle = `rgba(0, 0, 0, ${opacity * 0.5})`;
    ctx.lineWidth = 3 * VISUAL_SCALE;
    
    const text = `+$${mi.amount}`;
    ctx.strokeText(text, mi.x, mi.y);
    ctx.fillText(text, mi.x, mi.y);
  }

  ctx.textAlign = 'left';
  ctx.restore();
}


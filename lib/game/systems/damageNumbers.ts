/**
 * Damage Numbers System
 * 
 * Pooled floating damage numbers that appear on enemy hits.
 */

import { DAMAGE_NUMBER_CONFIG, VISUAL_SCALE } from '../config';
import { DamageNumber, Camera } from '../types';

/**
 * Create damage number pool
 */
export function createDamageNumberPool(): DamageNumber[] {
  const pool: DamageNumber[] = [];
  for (let i = 0; i < DAMAGE_NUMBER_CONFIG.poolSize; i++) {
    pool.push({
      x: 0,
      y: 0,
      damage: 0,
      spawnTime: 0,
      active: false,
      isCrit: false,
      isPlayerDamage: false,
    });
  }
  return pool;
}

/**
 * Spawn a damage number
 */
export function spawnDamageNumber(
  pool: DamageNumber[],
  x: number,
  y: number,
  damage: number,
  isCrit: boolean,
  now: number,
  isPlayerDamage: boolean = false
): void {
  // Find inactive number in pool
  const damageNum = pool.find(dn => !dn.active);
  if (damageNum) {
    damageNum.x = x;
    damageNum.y = y;
    damageNum.damage = Math.round(damage * 10) / 10; // Round to 1 decimal
    damageNum.spawnTime = now;
    damageNum.active = true;
    damageNum.isCrit = isCrit;
    damageNum.isPlayerDamage = isPlayerDamage;
  }
}

/**
 * Update all active damage numbers (delta time based)
 */
export function updateDamageNumbers(pool: DamageNumber[], now: number, deltaTime: number = 16.67): void {
  const timeMultiplier = deltaTime / 16.67; // Normalize to 60 FPS baseline
  
  for (const dn of pool) {
    if (!dn.active) continue;

    const elapsed = now - dn.spawnTime;
    
    // Deactivate if lifetime exceeded
    if (elapsed >= DAMAGE_NUMBER_CONFIG.lifetime) {
      dn.active = false;
      continue;
    }

    // Rise upward
    dn.y -= DAMAGE_NUMBER_CONFIG.riseSpeed * timeMultiplier;
  }
}

/**
 * Draw damage numbers (with camera transform)
 */
export function drawDamageNumbers(
  ctx: CanvasRenderingContext2D,
  pool: DamageNumber[],
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

  for (const dn of pool) {
    if (!dn.active) continue;

    const elapsed = now - dn.spawnTime;
    const fadeStart = DAMAGE_NUMBER_CONFIG.fadeStart;
    const lifetime = DAMAGE_NUMBER_CONFIG.lifetime;

    // Calculate opacity
    let opacity = 1;
    if (elapsed > fadeStart) {
      opacity = 1 - (elapsed - fadeStart) / (lifetime - fadeStart);
    }

    // Determine size and color based on type
    let fontSize = DAMAGE_NUMBER_CONFIG.fontSize * VISUAL_SCALE;
    let color: string;
    let text: string;

    if (dn.isPlayerDamage) {
      // Player damage: red with minus sign
      color = `rgba(239, 68, 68, ${opacity})`; // #EF4444 red
      text = `-${dn.damage}`;
    } else if (dn.isCrit) {
      // Crit damage: larger, yellow
      fontSize = (DAMAGE_NUMBER_CONFIG.fontSize + 4) * VISUAL_SCALE;
      color = `rgba(250, 204, 21, ${opacity})`; // #FACC15 yellow
      text = dn.damage.toString();
    } else {
      // Normal damage: white
      color = `rgba(255, 255, 255, ${opacity})`;
      text = dn.damage.toString();
    }

    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.fillStyle = color;
    ctx.strokeStyle = `rgba(0, 0, 0, ${opacity * 0.5})`;
    ctx.lineWidth = 3 * VISUAL_SCALE;
    
    ctx.strokeText(text, dn.x, dn.y);
    ctx.fillText(text, dn.x, dn.y);
  }

  ctx.textAlign = 'left';
  ctx.restore();
}


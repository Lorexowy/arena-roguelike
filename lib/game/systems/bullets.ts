/**
 * Bullet System
 * 
 * Handles bullet spawning, movement, and lifecycle.
 */

import { BASE_STATS, CANVAS_WIDTH, CANVAS_HEIGHT } from '../config';
import { Bullet, Player, Cursor } from '../types';
import { playPlayerShootSound } from '../audio/sounds';

/**
 * Spawn bullets from player toward cursor
 * Supports multishot with angle spread
 */
export function spawnBullets(
  bullets: Bullet[],
  player: Player,
  cursor: Cursor
): void {
  if (!cursor.isValid) return;

  const dx = cursor.x - player.x;
  const dy = cursor.y - player.y;
  const magnitude = Math.sqrt(dx * dx + dy * dy);
  
  if (magnitude <= 1) return;

  const baseAngle = Math.atan2(dy, dx);
  const isCrit = Math.random() < player.critChance;
  const bulletDamage = player.championDamage * (isCrit ? 2 : 1);

  // Spawn multiple bullets for multishot
  for (let i = 0; i < player.multishot; i++) {
    let angle = baseAngle;
    
    // Add angle spread for multishot (±10 degrees per bullet)
    if (player.multishot > 1) {
      const spreadRange = (player.multishot - 1) * 0.17;
      const step = spreadRange / (player.multishot - 1);
      angle = baseAngle - spreadRange / 2 + step * i;
    }

    bullets.push({
      x: player.x,
      y: player.y,
      vx: Math.cos(angle) * BASE_STATS.bullet.speed,
      vy: Math.sin(angle) * BASE_STATS.bullet.speed,
      damage: bulletDamage,
      isCrit: isCrit,
      maxRange: player.bulletRange,
      distanceTraveled: 0,
    });
  }

  // Play shoot sound effect (only once per shot, not per bullet)
  playPlayerShootSound();
}

/**
 * Update all bullet positions and remove off-screen bullets (delta time based)
 */
export function updateBullets(bullets: Bullet[], deltaTime: number): void {
  const timeMultiplier = deltaTime / 16.67; // Normalize to 60 FPS baseline
  
  for (let i = bullets.length - 1; i >= 0; i--) {
    const bullet = bullets[i];
    
    // Calculate distance traveled this frame
    const frameDistance = Math.sqrt(bullet.vx * bullet.vx + bullet.vy * bullet.vy) * timeMultiplier;
    bullet.distanceTraveled = (bullet.distanceTraveled || 0) + frameDistance;
    
    bullet.x += bullet.vx * timeMultiplier;
    bullet.y += bullet.vy * timeMultiplier;

    // Remove bullets that exceed their range (for champions with limited range)
    if (bullet.maxRange && bullet.distanceTraveled >= bullet.maxRange) {
      bullets.splice(i, 1);
      continue;
    }

    // Remove off-screen bullets
    if (bullet.x < -10 || bullet.x > CANVAS_WIDTH + 10 || 
        bullet.y < -10 || bullet.y > CANVAS_HEIGHT + 10) {
      bullets.splice(i, 1);
    }
  }
}


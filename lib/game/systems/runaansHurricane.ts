/**
 * Runaan's Hurricane System
 * 
 * Handles automatic targeting shots that fire at the nearest enemy.
 */

import { Player, Enemy, Bullet } from '../types';
import { GAMEPLAY_SCALE } from '../config';

/**
 * Find the N nearest enemies to the player
 * Returns an array of enemies sorted by distance (closest first)
 */
function findNearestEnemies(player: Player, enemies: Enemy[], count: number): Enemy[] {
  if (enemies.length === 0) return [];
  
  // Calculate distances for all enemies
  const enemiesWithDistance = enemies.map(enemy => {
    const dx = enemy.x - player.x;
    const dy = enemy.y - player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return { enemy, distance };
  });
  
  // Sort by distance (closest first) and take the first N
  enemiesWithDistance.sort((a, b) => a.distance - b.distance);
  
  return enemiesWithDistance
    .slice(0, Math.min(count, enemiesWithDistance.length))
    .map(item => item.enemy);
}

/**
 * Spawn auto-targeting shots from Runaan's Hurricane
 * Each shot targets a different nearby enemy (1st nearest, 2nd nearest, etc.)
 */
export function spawnRunaansShots(
  bullets: Bullet[],
  player: Player,
  enemies: Enemy[],
  now: number
): void {
  if (player.runaansShots <= 0) return;
  if (enemies.length === 0) return;
  
  // Find the N nearest enemies (where N = number of Runaan's stacks)
  const targetEnemies = findNearestEnemies(player, enemies, player.runaansShots);
  
  // Spawn one shot per target enemy
  for (const targetEnemy of targetEnemies) {
    // Calculate direction to this target enemy
    const dx = targetEnemy.x - player.x;
    const dy = targetEnemy.y - player.y;
    const magnitude = Math.sqrt(dx * dx + dy * dy);
    
    if (magnitude <= 1) continue; // Skip if too close
    
    const angle = Math.atan2(dy, dx);
    
    // Calculate damage (50% of normal shot)
    const bulletDamage = player.championDamage * 0.5;
    
    // Scale speed with gameplay scale (3 is base speed, slightly slower than normal bullets)
    const bulletSpeed = 3 * GAMEPLAY_SCALE;
    
    bullets.push({
      x: player.x,
      y: player.y,
      vx: Math.cos(angle) * bulletSpeed,
      vy: Math.sin(angle) * bulletSpeed,
      damage: bulletDamage,
      isCrit: false, // Auto-targeting shots don't crit
      maxRange: null, // Infinite range for Runaan's Hurricane shots
      distanceTraveled: 0,
    });
  }
}

/**
 * Check if it's time to fire Runaan's Hurricane shots
 * Returns true if shots should be fired
 */
export function shouldFireRunaansShots(
  player: Player,
  lastRunaansFireTime: number,
  now: number
): boolean {
  if (player.runaansShots <= 0) return false;
  
  const runaansFireRate = 1000 / 1.5; // 1.5 shots per second = 666ms between shots
  return now - lastRunaansFireTime >= runaansFireRate;
}


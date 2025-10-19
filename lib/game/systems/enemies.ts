/**
 * Enemy System
 * 
 * Handles enemy spawning, movement, and behavior.
 */

import { BASE_STATS, CANVAS_WIDTH, CANVAS_HEIGHT, ENEMY_SCALING_CONFIG } from '../config';
import { Enemy, Player, WaveState, EnemyType } from '../types';

/**
 * Calculate scaled enemy stats based on current wave
 */
export function calculateScaledEnemyStats(enemyType: EnemyType, currentWave: number) {
  const baseStats = BASE_STATS.enemy[enemyType];
  
  // Calculate scaling factor based on wave
  const scalingWaves = Math.max(0, currentWave - ENEMY_SCALING_CONFIG.minWaveForScaling);
  const hpMultiplier = Math.pow(ENEMY_SCALING_CONFIG.hpScalingMultiplier, scalingWaves);
  const damageMultiplier = Math.pow(ENEMY_SCALING_CONFIG.damageScalingMultiplier, scalingWaves);
  
  return {
    health: Math.ceil(baseStats.health * hpMultiplier),
    damage: Math.ceil(baseStats.damage * damageMultiplier),
    speed: baseStats.speed, // Speed doesn't scale for now
    size: baseStats.size,
    xpValue: baseStats.xpValue,
    shootCooldown: 'shootCooldown' in baseStats ? baseStats.shootCooldown : 0,
    preferredDistance: 'preferredDistance' in baseStats ? baseStats.preferredDistance : 0,
    distanceThreshold: 'distanceThreshold' in baseStats ? baseStats.distanceThreshold : 0,
  };
}

/**
 * Spawn an enemy at a random edge position (off-screen)
 * Applies current wave modifiers and scaling to stats
 */
export function spawnEnemy(enemies: Enemy[], waveState: WaveState, type: EnemyType = 'chaser'): void {
  // Get scaled stats for enemy type and wave
  const scaledStats = calculateScaledEnemyStats(type, waveState.currentWave);
  
  const edge = Math.floor(Math.random() * 4);
  const offscreenDistance = 20 + Math.random() * 20; // 20-40px beyond edge
  let x = 0, y = 0;

  switch (edge) {
    case 0: // Top
      x = Math.random() * CANVAS_WIDTH; 
      y = -scaledStats.size - offscreenDistance;
      break;
    case 1: // Right
      x = CANVAS_WIDTH + scaledStats.size + offscreenDistance; 
      y = Math.random() * CANVAS_HEIGHT;
      break;
    case 2: // Bottom
      x = Math.random() * CANVAS_WIDTH; 
      y = CANVAS_HEIGHT + scaledStats.size + offscreenDistance;
      break;
    case 3: // Left
      x = -scaledStats.size - offscreenDistance; 
      y = Math.random() * CANVAS_HEIGHT;
      break;
  }
  
  // Apply wave modifiers
  let enemySpeed = scaledStats.speed;
  let enemyHealth = scaledStats.health;
  let enemyDamage = scaledStats.damage;

  if (waveState.currentModifier) {
    const mod = waveState.currentModifier;
    if (mod.stat === 'speed') enemySpeed *= mod.multiplier;
    if (mod.stat === 'health') enemyHealth *= mod.multiplier;
    if (mod.stat === 'damage') enemyDamage *= mod.multiplier;
  }

  enemies.push({
    x,
    y,
    health: Math.ceil(enemyHealth),
    maxHealth: Math.ceil(enemyHealth),
    hitFlashEndTime: 0,
    speed: enemySpeed,
    damage: Math.ceil(enemyDamage),
    type,
    lastShotTime: type === 'shooter' ? 0 : undefined,
    size: scaledStats.size,
    xpValue: scaledStats.xpValue,
    shootCooldown: scaledStats.shootCooldown,
    preferredDistance: scaledStats.preferredDistance,
    distanceThreshold: scaledStats.distanceThreshold,
  });

  waveState.enemiesSpawned++;
}

/**
 * Update all enemy positions based on their type (delta time based)
 */
export function updateEnemies(enemies: Enemy[], player: Player, deltaTime: number): void {
  const timeMultiplier = deltaTime / 16.67; // Normalize to 60 FPS baseline
  
  for (const enemy of enemies) {
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) continue;

    const moveDistance = enemy.speed * timeMultiplier;

    if (enemy.type === 'chaser') {
      // Chaser: always move toward player
      enemy.x += (dx / distance) * moveDistance;
      enemy.y += (dy / distance) * moveDistance;
    } else if (enemy.type === 'shooter') {
      // Shooter: maintain preferred distance
      const preferredDist = BASE_STATS.enemy.shooter.preferredDistance;
      const threshold = BASE_STATS.enemy.shooter.distanceThreshold;

      if (distance > preferredDist + threshold) {
        // Too far: move toward player
        enemy.x += (dx / distance) * moveDistance;
        enemy.y += (dy / distance) * moveDistance;
      } else if (distance < preferredDist - threshold) {
        // Too close: move away from player
        enemy.x -= (dx / distance) * moveDistance;
        enemy.y -= (dy / distance) * moveDistance;
      }
      // Otherwise: maintain distance (strafe or hold position)
    }
  }
}

/**
 * Damage an enemy
 * Returns true if enemy is dead
 */
export function damageEnemy(enemy: Enemy, damage: number, now: number): boolean {
  enemy.health -= damage;
  enemy.hitFlashEndTime = now + 80; // Hit flash duration
  return enemy.health <= 0;
}


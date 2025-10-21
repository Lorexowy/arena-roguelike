/**
 * Enemy System
 * 
 * Handles enemy spawning, movement, and behavior.
 */

import { BASE_STATS, WORLD_WIDTH, WORLD_HEIGHT, ENEMY_SCALING_CONFIG, GAMEPLAY_SCALE } from '../config';
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
      x = Math.random() * WORLD_WIDTH; 
      y = -scaledStats.size - offscreenDistance;
      break;
    case 1: // Right
      x = WORLD_WIDTH + scaledStats.size + offscreenDistance; 
      y = Math.random() * WORLD_HEIGHT;
      break;
    case 2: // Bottom
      x = Math.random() * WORLD_WIDTH; 
      y = WORLD_HEIGHT + scaledStats.size + offscreenDistance;
      break;
    case 3: // Left
      x = -scaledStats.size - offscreenDistance; 
      y = Math.random() * WORLD_HEIGHT;
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
 * Apply separation forces to prevent enemies from overlapping
 */
function applyEnemySeparation(enemies: Enemy[], deltaTime: number): void {
  const timeMultiplier = deltaTime / 16.67; // Normalize to 60 FPS baseline
  const separationForce = 0.5 * GAMEPLAY_SCALE; // Scale the force with gameplay
  const minDistance = 12 * GAMEPLAY_SCALE; // Scale minimum distance with gameplay
  
  for (let i = 0; i < enemies.length; i++) {
    const enemy1 = enemies[i];
    let separationX = 0;
    let separationY = 0;
    let separationCount = 0;
    
    for (let j = 0; j < enemies.length; j++) {
      if (i === j) continue;
      
      const enemy2 = enemies[j];
      const dx = enemy1.x - enemy2.x;
      const dy = enemy1.y - enemy2.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // If enemies are too close, apply separation force
      if (distance > 0 && distance < minDistance) {
        const separationStrength = (minDistance - distance) / minDistance;
        const normalizedDx = dx / distance;
        const normalizedDy = dy / distance;
        
        separationX += normalizedDx * separationStrength;
        separationY += normalizedDy * separationStrength;
        separationCount++;
      }
    }
    
    // Apply separation force if there are overlapping enemies
    if (separationCount > 0) {
      const avgSeparationX = separationX / separationCount;
      const avgSeparationY = separationY / separationCount;
      
      enemy1.x += avgSeparationX * separationForce * timeMultiplier;
      enemy1.y += avgSeparationY * separationForce * timeMultiplier;
    }
  }
}

/**
 * Keep enemies within the game boundaries
 */
function enforceEnemyBoundaries(enemies: Enemy[]): void {
  const margin = 5 * GAMEPLAY_SCALE; // Scale margin with gameplay
  
  for (const enemy of enemies) {
    const enemySize = enemy.size || (5 * GAMEPLAY_SCALE); // Default size if not defined
    
    // Check left boundary
    if (enemy.x - enemySize < margin) {
      enemy.x = margin + enemySize;
    }
    
    // Check right boundary
    if (enemy.x + enemySize > WORLD_WIDTH - margin) {
      enemy.x = WORLD_WIDTH - margin - enemySize;
    }
    
    // Check top boundary
    if (enemy.y - enemySize < margin) {
      enemy.y = margin + enemySize;
    }
    
    // Check bottom boundary
    if (enemy.y + enemySize > WORLD_HEIGHT - margin) {
      enemy.y = WORLD_HEIGHT - margin - enemySize;
    }
  }
}

/**
 * Update all enemy positions based on their type (delta time based)
 */
export function updateEnemies(enemies: Enemy[], player: Player, deltaTime: number): void {
  const timeMultiplier = deltaTime / 16.67; // Normalize to 60 FPS baseline
  
  // First, update enemy movement toward player
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
  
  // Then, apply separation forces to prevent overlapping
  applyEnemySeparation(enemies, deltaTime);
  
  // Finally, enforce boundaries to keep enemies in the game area
  enforceEnemyBoundaries(enemies);
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


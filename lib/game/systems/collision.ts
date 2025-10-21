/**
 * Collision System
 * 
 * Collision detection helpers for various shape combinations.
 */

import { BASE_STATS, ECONOMY_CONFIG } from '../config';
import { Bullet, Enemy, Player, XPOrb, DamageNumber, EnemyProjectile, WaveState } from '../types';
import { damageEnemy } from './enemies';
import { damagePlayer } from './player';
import { spawnXPOrb } from './xp';
import { spawnDamageNumber } from './damageNumbers';
import { MoneyIndicator, spawnMoneyIndicator } from './moneyIndicators';

/**
 * Circle-circle collision
 */
export function circleCollision(
  x1: number, y1: number, r1: number,
  x2: number, y2: number, r2: number
): boolean {
  const dx = x1 - x2;
  const dy = y1 - y2;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < r1 + r2;
}

/**
 * Rectangle-circle collision (for bullets vs enemies)
 */
export function rectCircleCollision(
  rx: number, ry: number, rw: number, rh: number,
  cx: number, cy: number, cr: number
): boolean {
  const closestX = Math.max(rx - rw/2, Math.min(cx, rx + rw/2));
  const closestY = Math.max(ry - rh/2, Math.min(cy, ry + rh/2));
  const dx = cx - closestX;
  const dy = cy - closestY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < cr;
}

/**
 * Calculate scaled money drop based on current wave
 */
export function calculateMoneyDrop(baseAmount: number, currentWave: number): number {
  const intervals = Math.floor((currentWave - ECONOMY_CONFIG.minWaveForScaling) / ECONOMY_CONFIG.moneyScalingWaves);
  const multiplier = Math.pow(ECONOMY_CONFIG.moneyScalingMultiplier, intervals);
  return Math.ceil(baseAmount * multiplier);
}

/**
 * Check and handle bullets vs enemies collisions
 * Returns money earned from kills and applies lifesteal
 */
export function handleBulletEnemyCollisions(
  bullets: Bullet[],
  enemies: Enemy[],
  xpOrbs: XPOrb[],
  damageNumbers: DamageNumber[],
  moneyIndicators: MoneyIndicator[],
  player: Player,
  waveState: WaveState,
  now: number
): number {
  let moneyEarned = 0;

  for (let i = bullets.length - 1; i >= 0; i--) {
    const bullet = bullets[i];
    let bulletHit = false;

    for (let j = enemies.length - 1; j >= 0; j--) {
      const enemy = enemies[j];
      
      const enemySize = enemy.type === 'shooter' ? BASE_STATS.enemy.shooter.size : BASE_STATS.enemy.chaser.size;
      if (rectCircleCollision(
        bullet.x, bullet.y, BASE_STATS.bullet.width, BASE_STATS.bullet.height,
        enemy.x, enemy.y, enemySize
      )) {
        // Calculate if this is a critical hit
        const isCrit = Math.random() < player.critChance;
        const finalDamage = isCrit ? bullet.damage * 2 : bullet.damage;
        
        const enemyDied = damageEnemy(enemy, finalDamage, now);
        
        // Apply lifesteal if player has any
        if (player.lifesteal > 0) {
          const healAmount = finalDamage * player.lifesteal;
          player.health = Math.min(player.health + healAmount, player.maxHealth);
        }
        
        // Spawn floating damage number
        const enemyDmgSize = enemy.type === 'shooter' ? BASE_STATS.enemy.shooter.size : BASE_STATS.enemy.chaser.size;
        spawnDamageNumber(damageNumbers, enemy.x, enemy.y - enemyDmgSize, finalDamage, isCrit, now);
        
        if (enemyDied) {
          // Increment kill counter
          player.killCount++;
          
          // Drop XP based on enemy type
          const xpValue = enemy.type === 'shooter' 
            ? BASE_STATS.enemy.shooter.xpValue 
            : BASE_STATS.enemy.chaser.xpValue;
          spawnXPOrb(xpOrbs, enemy.x, enemy.y, xpValue);
          
          // 30% chance to drop money
          if (Math.random() < ECONOMY_CONFIG.moneyDropChance) {
            // Calculate scaled money based on current wave
            const baseAmount = enemy.type === 'shooter' 
              ? ECONOMY_CONFIG.baseMoneyPerShooter 
              : ECONOMY_CONFIG.baseMoneyPerKill;
            const moneyAmount = calculateMoneyDrop(baseAmount, waveState.currentWave);
            moneyEarned += moneyAmount;
            
            // Spawn green money indicator
            const enemySize = enemy.type === 'shooter' 
              ? BASE_STATS.enemy.shooter.size 
              : BASE_STATS.enemy.chaser.size;
            spawnMoneyIndicator(moneyIndicators, enemy.x, enemy.y - enemySize, moneyAmount, now);
          }
          
          enemies.splice(j, 1);
        }
        
        bulletHit = true;
        break;
      }
    }

    if (bulletHit) {
      bullets.splice(i, 1);
    }
  }

  return moneyEarned;
}

/**
 * Check and handle enemy vs player collisions
 * Returns true if player died
 */
export function handleEnemyPlayerCollisions(
  enemies: Enemy[],
  player: Player,
  damageNumbers: DamageNumber[],
  now: number
): boolean {
  if (player.iframes) return false;

  for (const enemy of enemies) {
    const enemyColSize = enemy.type === 'shooter' ? BASE_STATS.enemy.shooter.size : BASE_STATS.enemy.chaser.size;
    if (circleCollision(
      player.x, player.y, player.radius,
      enemy.x, enemy.y, enemyColSize
    )) {
      const playerDied = damagePlayer(player, enemy.damage, now, damageNumbers);
      if (playerDied) {
        player.health = 0;
        return true;
      }
      break; // Only one hit per frame
    }
  }

  return false;
}

/**
 * Handle enemy projectile vs player collisions
 * Returns true if player died
 */
export function handleProjectilePlayerCollisions(
  projectiles: EnemyProjectile[],
  player: Player,
  damageNumbers: DamageNumber[],
  now: number
): boolean {
  // Skip if player has iframes
  if (player.iframes) return false;

  for (let i = projectiles.length - 1; i >= 0; i--) {
    const proj = projectiles[i];
    
    // Circle collision (projectile vs player)
    if (circleCollision(proj.x, proj.y, 3, player.x, player.y, player.radius)) {
      // Damage player with damage indicator
      const playerDied = damagePlayer(player, proj.damage, now, damageNumbers);
      
      // Remove projectile
      projectiles.splice(i, 1);
      
      if (playerDied) {
        return true;
      }
    }
  }

  return false;
}


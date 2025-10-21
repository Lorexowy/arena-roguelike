/**
 * Enemy Projectile System
 * 
 * Handles shooter enemy projectiles (spawning, updating, rendering).
 */

import { BASE_STATS, WORLD_WIDTH, WORLD_HEIGHT, ENEMY_SCALING_CONFIG, GAMEPLAY_SCALE } from '../config';
import { EnemyProjectile, Enemy, Player } from '../types';

/**
 * Update shooters and spawn projectiles
 * Only shoots if player is within shooting range
 */
export function updateShooters(
  enemies: Enemy[],
  projectiles: EnemyProjectile[],
  player: Player,
  now: number,
  currentWave: number
): void {
  // Maximum shooting range (scaled with gameplay)
  const maxShootingRange = 300 * GAMEPLAY_SCALE;
  
  for (const enemy of enemies) {
    if (enemy.type !== 'shooter') continue;

    // Check if ready to shoot
    const cooldown = BASE_STATS.enemy.shooter.shootCooldown;
    if (enemy.lastShotTime === undefined) enemy.lastShotTime = 0;
    
    if (now - enemy.lastShotTime >= cooldown) {
      // Calculate direction and distance to player
      const dx = player.x - enemy.x;
      const dy = player.y - enemy.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Only shoot if player is within range
      if (distance > 0 && distance <= maxShootingRange) {
        // Spawn projectile with normalized direction
        const speed = BASE_STATS.enemy.shooter.projectileSpeed;
        const dirX = dx / distance;
        const dirY = dy / distance;
        
        projectiles.push({
          x: enemy.x,
          y: enemy.y,
          vx: dirX * speed,
          vy: dirY * speed,
          damage: enemy.damage,
        });

        enemy.lastShotTime = now;
      }
    }
  }
}

/**
 * Update enemy projectile positions (delta time based)
 */
export function updateEnemyProjectiles(projectiles: EnemyProjectile[], deltaTime: number): void {
  const timeMultiplier = deltaTime / 16.67; // Normalize to 60 FPS baseline
  
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const proj = projectiles[i];
    
    proj.x += proj.vx * timeMultiplier;
    proj.y += proj.vy * timeMultiplier;

    // Remove if out of bounds (using world bounds)
    if (
      proj.x < -10 ||
      proj.x > WORLD_WIDTH + 10 ||
      proj.y < -10 ||
      proj.y > WORLD_HEIGHT + 10
    ) {
      projectiles.splice(i, 1);
    }
  }
}

/**
 * Draw enemy projectiles (light blue orbs)
 */
export function drawEnemyProjectiles(
  ctx: CanvasRenderingContext2D,
  projectiles: EnemyProjectile[]
): void {
  const size = BASE_STATS.enemy.shooter.projectileSize;
  
  for (const proj of projectiles) {
    // Draw glowing blue orb
    ctx.fillStyle = '#60A5FA'; // Light blue
    ctx.strokeStyle = '#0B0F1A'; // Dark outline
    ctx.lineWidth = 1;
    
    ctx.beginPath();
    ctx.arc(proj.x, proj.y, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
}


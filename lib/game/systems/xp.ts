/**
 * XP System
 * 
 * Handles XP orb spawning, magnetization, and collection.
 */

import { BASE_STATS } from '../config';
import { XPOrb, Player } from '../types';

/**
 * Spawn an XP orb at position
 */
export function spawnXPOrb(xpOrbs: XPOrb[], x: number, y: number, value: number): void {
  xpOrbs.push({ x, y, value, magnetized: false });
}

/**
 * Update XP orbs (magnet effect and collection) - delta time based
 * Returns total XP collected this frame
 */
export function updateXPOrbs(xpOrbs: XPOrb[], player: Player, deltaTime: number = 16.67): number {
  const timeMultiplier = deltaTime / 16.67; // Normalize to 60 FPS baseline
  const magnetRadius = BASE_STATS.xp.magnetRadius * player.magnetMultiplier;
  let xpCollected = 0;
  
  for (let i = xpOrbs.length - 1; i >= 0; i--) {
    const orb = xpOrbs[i];
    const dx = player.x - orb.x;
    const dy = player.y - orb.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Check if within magnet radius
    if (distance < magnetRadius) {
      orb.magnetized = true;
      
      // Lerp toward player
      if (distance > player.radius) {
        const moveDistance = BASE_STATS.xp.moveSpeed * timeMultiplier;
        orb.x += (dx / distance) * moveDistance;
        orb.y += (dy / distance) * moveDistance;
      }
    }

    // Collect if touching player
    if (distance < player.radius + BASE_STATS.xp.orbSize) {
      xpCollected += orb.value;
      xpOrbs.splice(i, 1);
    }
  }

  return xpCollected;
}


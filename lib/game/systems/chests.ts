/**
 * Chest System
 * 
 * Handles chest spawning, rewards, and opening mechanics.
 */

import { Chest, ChestRarity, ChestReward, Player } from '../types';
import { applyTemporaryBoost, applyPermanentBoost } from './player';

// Re-export types for convenience
export type { Chest, ChestRarity, ChestReward };
import { WORLD_WIDTH, WORLD_HEIGHT, GAMEPLAY_SCALE } from '../config';

// Chest configuration
export const CHEST_CONFIG = {
  // Spawn settings (time-based)
  minChestsPerSpawn: 1,
  maxChestsPerSpawn: 2,
  spawnDistanceFromPlayer: 50, // Minimum distance from player spawn (scaled for world size)
  
  // Rarity distribution
  rarityChances: {
    common: 0.60,      // 60%
    uncommon: 0.25,    // 25%
    rare: 0.12,        // 12%
    legendary: 0.03,   // 3%
  },
  
  // Opening animation
  openingDuration: 3000, // 3 seconds
  
  // Visual settings
  chestSize: 64, // 16 * 4 = 64 (400% increase)
  glowRadius: 80, // 20 * 4 = 80 (400% increase)
};

/**
 * Generate a random chest rarity based on distribution
 */
export function generateChestRarity(): ChestRarity {
  const random = Math.random();
  let cumulative = 0;
  
  for (const [rarity, chance] of Object.entries(CHEST_CONFIG.rarityChances)) {
    cumulative += chance;
    if (random <= cumulative) {
      return rarity as ChestRarity;
    }
  }
  
  return 'common'; // Fallback
}

/**
 * Generate a reward based on chest rarity
 */
export function generateChestReward(rarity: ChestRarity): ChestReward {
  const rewards = {
    common: [
      { type: 'money' as const, amount: Math.floor(Math.random() * 6) + 5 }, // 5-10 gold
      { type: 'xp' as const, amount: Math.floor(Math.random() * 26) + 25 }, // 25-50 XP
      { type: 'health' as const, amount: Math.floor(Math.random() * 11) + 10 }, // 10-20 HP
    ],
    uncommon: [
      { type: 'money' as const, amount: Math.floor(Math.random() * 11) + 15 }, // 15-25 gold
      { type: 'xp' as const, amount: Math.floor(Math.random() * 26) + 75 }, // 75-100 XP
      { type: 'health' as const, amount: Math.floor(Math.random() * 21) + 30 }, // 30-50 HP
      { type: 'temporary_boost' as const, amount: 1, duration: 30000, statType: 'speed' as const }, // 30s speed boost
    ],
    rare: [
      { type: 'money' as const, amount: Math.floor(Math.random() * 21) + 30 }, // 30-50 gold
      { type: 'xp' as const, amount: Math.floor(Math.random() * 51) + 150 }, // 150-200 XP
      { type: 'temporary_boost' as const, amount: 1, duration: 30000, statType: 'damage' as const }, // 30s damage boost
      { type: 'temporary_boost' as const, amount: 1, duration: 30000, statType: 'fireRate' as const }, // 30s fire rate boost
    ],
    legendary: [
      { type: 'money' as const, amount: Math.floor(Math.random() * 26) + 75 }, // 75-100 gold
      { type: 'xp' as const, amount: Math.floor(Math.random() * 101) + 300 }, // 300-400 XP
      { type: 'permanent_boost' as const, amount: 0.1, statType: 'damage' as const }, // +0.1 permanent damage
      { type: 'permanent_boost' as const, amount: 0.05, statType: 'speed' as const }, // +0.05 permanent speed
    ],
  };
  
  const rarityRewards = rewards[rarity];
  const randomReward = rarityRewards[Math.floor(Math.random() * rarityRewards.length)];
  
  return randomReward;
}

/**
 * Spawn chests based on time (new system)
 */
export function spawnChestsTimeBased(playerX: number, playerY: number): Chest[] {
  const chestCount = Math.floor(Math.random() * (CHEST_CONFIG.maxChestsPerSpawn - CHEST_CONFIG.minChestsPerSpawn + 1)) + CHEST_CONFIG.minChestsPerSpawn;
  const chests: Chest[] = [];
  
  for (let i = 0; i < chestCount; i++) {
    let attempts = 0;
    let validPosition = false;
    let x = 0, y = 0;
    
    // Try to find a valid position (not too close to player, not too close to other chests)
    while (!validPosition && attempts < 50) {
      x = Math.random() * WORLD_WIDTH;
      y = Math.random() * WORLD_HEIGHT;
      
      // Check distance from player
      const distanceFromPlayer = Math.sqrt((x - playerX) ** 2 + (y - playerY) ** 2);
      
      // Check distance from other chests
      let tooCloseToOtherChest = false;
      for (const chest of chests) {
        const distanceFromChest = Math.sqrt((x - chest.x) ** 2 + (y - chest.y) ** 2);
        if (distanceFromChest < 80) { // Minimum 80px between chests (scaled for larger chests)
          tooCloseToOtherChest = true;
          break;
        }
      }
      
      if (distanceFromPlayer >= CHEST_CONFIG.spawnDistanceFromPlayer && !tooCloseToOtherChest) {
        validPosition = true;
      }
      
      attempts++;
    }
    
    if (validPosition) {
      const rarity = generateChestRarity();
      chests.push({
        x,
        y,
        rarity,
        isOpened: false,
      });
    }
  }
  
  return chests;
}

/**
 * Spawn chests for a new wave (legacy function - kept for compatibility)
 * @deprecated Use spawnChestsTimeBased instead
 */
export function spawnChestsForWave(playerX: number, playerY: number): Chest[] {
  return spawnChestsTimeBased(playerX, playerY);
}

/**
 * Check if player is colliding with a chest
 */
export function checkChestCollision(player: Player, chest: Chest): boolean {
  const distance = Math.sqrt((player.x - chest.x) ** 2 + (player.y - chest.y) ** 2);
  const collisionRadius = (CHEST_CONFIG.chestSize + player.radius) / 2 + 16; // Add 16px buffer for easier collision (scaled up)
  
  return distance <= collisionRadius;
}

/**
 * Start opening a chest
 */
export function startChestOpening(chest: Chest, now: number): void {
  chest.isOpened = true;
  chest.openingStartTime = now;
  chest.reward = generateChestReward(chest.rarity);
}

/**
 * Check if chest opening animation is complete
 */
export function isChestOpeningComplete(chest: Chest, now: number): boolean {
  if (!chest.openingStartTime) return false;
  return now - chest.openingStartTime >= CHEST_CONFIG.openingDuration;
}

/**
 * Check if player is still close enough to chest during opening
 */
export function isPlayerStillNearChest(player: Player, chest: Chest): boolean {
  const distance = Math.sqrt((player.x - chest.x) ** 2 + (player.y - chest.y) ** 2);
  const maxDistance = CHEST_CONFIG.chestSize + player.radius + 20; // Allow some buffer
  return distance <= maxDistance;
}

/**
 * Cancel chest opening (reset to closed state)
 */
export function cancelChestOpening(chest: Chest): void {
  chest.isOpened = false;
  chest.openingStartTime = undefined;
  chest.reward = undefined;
}

/**
 * Apply chest reward to player
 */
export function applyChestReward(reward: ChestReward, player: Player): void {
  switch (reward.type) {
    case 'money':
      player.money += reward.amount;
      break;
    case 'xp':
      player.xp += reward.amount;
      break;
    case 'health':
      player.health = Math.min(player.maxHealth, player.health + reward.amount);
      break;
    case 'temporary_boost':
      if (reward.statType && reward.duration) {
        applyTemporaryBoost(player, reward.statType, reward.amount, reward.duration, Date.now());
      }
      break;
    case 'permanent_boost':
      if (reward.statType) {
        applyPermanentBoost(player, reward.statType, reward.amount);
      }
      break;
  }
}

/**
 * Get chest filename based on rarity
 */
export function getChestFilename(rarity: ChestRarity): string {
  const filenames = {
    common: 'chest_common.png',
    uncommon: 'chest_uncommon.png',
    rare: 'chest_rare.png',
    legendary: 'chest_legendary.png',
  };
  return filenames[rarity];
}

/**
 * Game Time System
 * 
 * Manages continuous time-based gameplay instead of wave-based progression.
 * Handles enemy spawning, scaling, shop appearances, and chest spawning.
 */

import { GameTimeState, WaveModifier } from '../types';
import { WAVE_CONFIG, ENEMY_SCALING_CONFIG, BASE_STATS } from '../config';

// Time-based configuration
export const TIME_CONFIG = {
  // Enemy spawning - BALANCED INTENSITY
  initialEnemySpawnInterval: 0.6,    // Start with 0.6 seconds between spawns (moderate)
  minEnemySpawnInterval: 0.15,       // Minimum 0.15 seconds (6.7 enemies/sec max)
  enemySpawnAcceleration: 0.97,      // Moderate acceleration
  enemySpawnAccelerationTime: 15,    // Apply acceleration every 15 seconds
  
  // Removed shooter spawning - only chasers now
  
  // Shop system - KILL-BASED
  shopKillThreshold: 70,              // Shop appears every 70 kills
  shopAvailabilityDuration: 5,        // Shop available for 5 seconds
  shopDuration: 30,                  // Shop stays open for 30 seconds
  
  // Chest spawning
  initialChestSpawnInterval: 45,     // Start with 45 seconds between chests
  minChestSpawnInterval: 20,         // Minimum 20 seconds
  chestSpawnAcceleration: 0.99,      // Very slow acceleration
  chestSpawnAccelerationTime: 60,    // Apply acceleration every 60 seconds
  
  // Modifiers
  modifierChance: 0.3,               // 30% chance for modifier every 2 minutes
  modifierDuration: 60,              // Modifiers last 1 minute
  modifierInterval: 120,             // Check for modifiers every 2 minutes
};

/**
 * Create initial game time state
 */
export function createGameTimeState(): GameTimeState {
  return {
    gameTime: 0,
    enemySpawnTimer: TIME_CONFIG.initialEnemySpawnInterval,
    enemySpawnInterval: TIME_CONFIG.initialEnemySpawnInterval,
    enemyCount: 0,
    killsSinceLastShop: 0,
    chestTimer: TIME_CONFIG.initialChestSpawnInterval,
    chestSpawnInterval: TIME_CONFIG.initialChestSpawnInterval,
    currentModifier: null,
    modifierEndTime: 0,
    shopAvailableUntil: 0,
  };
}

/**
 * Update game time state
 */
export function updateGameTimeState(gameTimeState: GameTimeState, deltaTime: number): void {
  const deltaSeconds = deltaTime / 1000; // Convert ms to seconds
  gameTimeState.gameTime += deltaSeconds;
  
  // Update timers
  gameTimeState.enemySpawnTimer -= deltaSeconds;
  gameTimeState.chestTimer -= deltaSeconds;
  
  // Check for modifier expiration
  if (gameTimeState.currentModifier && gameTimeState.gameTime >= gameTimeState.modifierEndTime) {
    gameTimeState.currentModifier = null;
    gameTimeState.modifierEndTime = 0;
  }
  
  // Accelerate enemy spawning
  if (gameTimeState.gameTime > 0 && 
      gameTimeState.gameTime % TIME_CONFIG.enemySpawnAccelerationTime < deltaSeconds) {
    gameTimeState.enemySpawnInterval = Math.max(
      TIME_CONFIG.minEnemySpawnInterval,
      gameTimeState.enemySpawnInterval * TIME_CONFIG.enemySpawnAcceleration
    );
  }
  
  // Removed shooter acceleration - only chasers now
  
  // Accelerate chest spawning
  if (gameTimeState.gameTime > 0 && 
      gameTimeState.gameTime % TIME_CONFIG.chestSpawnAccelerationTime < deltaSeconds) {
    gameTimeState.chestSpawnInterval = Math.max(
      TIME_CONFIG.minChestSpawnInterval,
      gameTimeState.chestSpawnInterval * TIME_CONFIG.chestSpawnAcceleration
    );
  }
}

/**
 * Check if it's time to spawn an enemy
 */
export function shouldSpawnEnemy(gameTimeState: GameTimeState): boolean {
  return gameTimeState.enemySpawnTimer <= 0;
}

/**
 * Reset enemy spawn timer
 */
export function resetEnemySpawnTimer(gameTimeState: GameTimeState): void {
  gameTimeState.enemySpawnTimer = gameTimeState.enemySpawnInterval;
  gameTimeState.enemyCount++;
}

// Removed shooter functions - only chasers now

/**
 * Check if it's time to spawn a chest
 */
export function shouldSpawnChest(gameTimeState: GameTimeState): boolean {
  return gameTimeState.chestTimer <= 0;
}

/**
 * Reset chest spawn timer
 */
export function resetChestSpawnTimer(gameTimeState: GameTimeState): void {
  gameTimeState.chestTimer = gameTimeState.chestSpawnInterval;
}

/**
 * Check if shop should appear (kill-based)
 */
export function shouldShopAppear(gameTimeState: GameTimeState): boolean {
  return gameTimeState.killsSinceLastShop >= TIME_CONFIG.shopKillThreshold;
}

/**
 * Reset shop kill counter
 */
export function resetShopKillCounter(gameTimeState: GameTimeState): void {
  gameTimeState.killsSinceLastShop = 0;
}

/**
 * Make shop available for a limited time
 */
export function makeShopAvailable(gameTimeState: GameTimeState, now: number): void {
  gameTimeState.shopAvailableUntil = now + (TIME_CONFIG.shopAvailabilityDuration * 1000);
}

/**
 * Check if shop is currently available (within time limit)
 */
export function isShopAvailable(gameTimeState: GameTimeState, now: number): boolean {
  return gameTimeState.shopAvailableUntil > 0 && now < gameTimeState.shopAvailableUntil;
}

/**
 * Check if shop availability has expired
 */
export function hasShopAvailabilityExpired(gameTimeState: GameTimeState, now: number): boolean {
  return gameTimeState.shopAvailableUntil > 0 && now >= gameTimeState.shopAvailableUntil;
}

/**
 * Clear shop availability
 */
export function clearShopAvailability(gameTimeState: GameTimeState): void {
  gameTimeState.shopAvailableUntil = 0;
}

/**
 * Get remaining shop availability time in seconds
 */
export function getShopAvailabilityRemaining(gameTimeState: GameTimeState, now: number): number {
  if (gameTimeState.shopAvailableUntil === 0) return 0;
  const remaining = Math.max(0, gameTimeState.shopAvailableUntil - now);
  return Math.ceil(remaining / 1000); // Convert to seconds and round up
}

/**
 * Increment kill counter for shop
 */
export function incrementShopKillCounter(gameTimeState: GameTimeState): void {
  gameTimeState.killsSinceLastShop++;
}

/**
 * Check if a new modifier should be applied
 */
export function shouldApplyModifier(gameTimeState: GameTimeState): boolean {
  // Only apply if no current modifier and random chance
  if (gameTimeState.currentModifier) return false;
  
  // Check every 2 minutes
  const timeSinceLastCheck = gameTimeState.gameTime % TIME_CONFIG.modifierInterval;
  const deltaTime = 0.016; // Approximate frame time
  
  return timeSinceLastCheck < deltaTime && Math.random() < TIME_CONFIG.modifierChance;
}

/**
 * Apply a random modifier
 */
export function applyRandomModifier(gameTimeState: GameTimeState): void {
  if (WAVE_CONFIG.modifiers.length === 0) return;
  
  const randomMod = WAVE_CONFIG.modifiers[Math.floor(Math.random() * WAVE_CONFIG.modifiers.length)];
  gameTimeState.currentModifier = randomMod;
  gameTimeState.modifierEndTime = gameTimeState.gameTime + TIME_CONFIG.modifierDuration;
}

/**
 * Calculate scaled enemy stats based on game time (chasers only)
 */
export function calculateTimeBasedEnemyStats(enemyType: 'chaser', gameTime: number): {
  health: number;
  damage: number;
  speed: number;
  size: number;
  xpValue: number;
} {
  // Convert time to "wave equivalent" for scaling
  // Every 30 seconds = 1 wave equivalent
  const waveEquivalent = Math.floor(gameTime / 30) + 1;
  
  // Use existing scaling logic but with time-based wave equivalent
  const scalingWaves = Math.max(0, waveEquivalent - ENEMY_SCALING_CONFIG.minWaveForScaling);
  const hpMultiplier = Math.pow(ENEMY_SCALING_CONFIG.hpScalingMultiplier, scalingWaves);
  const damageMultiplier = Math.pow(ENEMY_SCALING_CONFIG.damageScalingMultiplier, scalingWaves);
  
  // Get base stats from config
  const baseStats = BASE_STATS.enemy[enemyType];
  
  return {
    health: Math.ceil(baseStats.health * hpMultiplier),
    damage: Math.ceil(baseStats.damage * damageMultiplier),
    speed: baseStats.speed,
    size: baseStats.size,
    xpValue: baseStats.xpValue,
  };
}

/**
 * Reset game time state (for new game)
 */
export function resetGameTimeState(gameTimeState: GameTimeState): void {
  gameTimeState.gameTime = 0;
  gameTimeState.enemySpawnTimer = TIME_CONFIG.initialEnemySpawnInterval;
  gameTimeState.enemySpawnInterval = TIME_CONFIG.initialEnemySpawnInterval;
  gameTimeState.enemyCount = 0;
  gameTimeState.killsSinceLastShop = 0;
  gameTimeState.chestTimer = TIME_CONFIG.initialChestSpawnInterval;
  gameTimeState.chestSpawnInterval = TIME_CONFIG.initialChestSpawnInterval;
  gameTimeState.currentModifier = null;
  gameTimeState.modifierEndTime = 0;
  gameTimeState.shopAvailableUntil = 0;
}

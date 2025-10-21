/**
 * Player System
 * 
 * Handles player state initialization, movement, and stats calculations.
 */

import { BASE_STATS, LEVEL_CONFIG, CANVAS_WIDTH, CANVAS_HEIGHT, SHOP_ITEM_CONFIG, GAMEPLAY_SCALE } from '../config';
import { Player, DamageNumber } from '../types';
import { spawnDamageNumber } from './damageNumbers';
import { playLevelUpSound, playPlayerDamageSound } from '../audio/sounds';
import { getChampion, ChampionId } from '../champions/catalog';

/**
 * Create initial player state with champion stats
 */
export function createPlayer(championId: ChampionId = 'sascha'): Player {
  const champion = getChampion(championId);
  
  return {
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT / 2,
    radius: BASE_STATS.player.radius,
    baseSpeed: champion.stats.moveSpeed, // Use absolute value, not multiplier
    speedMultiplier: 1.0, // Reset to 1.0 since we're using absolute values
    health: champion.stats.maxHealth,
    maxHealth: champion.stats.maxHealth,
    iframes: false,
    iframeEndTime: 0,
    level: 1,
    xp: 0,
    xpToNextLevel: LEVEL_CONFIG.xpPerLevel(1),
    multishot: champion.stats.multishot,
    fireRateMultiplier: 1.0, // Reset to 1.0 since we'll calculate fire rate differently
    damageMultiplier: 1.0, // Reset to 1.0 since we'll use absolute damage
    magnetMultiplier: 1.0,
    critChance: champion.stats.critChance,
    money: 0,
    lifesteal: 0.0,
    hpRegenRate: 0.0,
    lastDamageTakenTime: 0,
    championId: championId,
    bulletRange: champion.stats.bulletRange,
    // Store champion stats for calculations
    championDamage: champion.stats.damage,
    championAttackSpeed: champion.stats.attackSpeed,
    runaansShots: 0,
    killCount: 0,
  };
}

/**
 * Get current player speed (base * multiplier)
 */
export function getPlayerSpeed(player: Player): number {
  return player.baseSpeed * player.speedMultiplier;
}

/**
 * Get player speed for display (unscaled base stat)
 */
export function getPlayerSpeedDisplay(player: Player): number {
  return (player.baseSpeed * player.speedMultiplier) / GAMEPLAY_SCALE;
}

/**
 * Update player position based on input (delta time based)
 */
export function updatePlayerMovement(
  player: Player,
  keys: { [key: string]: boolean },
  deltaTime: number
): void {
  const speed = getPlayerSpeed(player);
  const distance = speed * (deltaTime / 16.67); // Normalize to 60 FPS baseline

  if (keys['w']) player.y -= distance;
  if (keys['s']) player.y += distance;
  if (keys['a']) player.x -= distance;
  if (keys['d']) player.x += distance;

  // Keep within bounds
  player.x = Math.max(player.radius, Math.min(CANVAS_WIDTH - player.radius, player.x));
  player.y = Math.max(player.radius, Math.min(CANVAS_HEIGHT - player.radius, player.y));
}

/**
 * Update player invincibility frames
 */
export function updatePlayerIframes(player: Player, now: number): void {
  if (player.iframes && now >= player.iframeEndTime) {
    player.iframes = false;
  }
}

/**
 * Damage the player
 * Returns true if player died
 */
export function damagePlayer(
  player: Player, 
  damage: number, 
  now: number,
  damageNumbers?: DamageNumber[]
): boolean {
  if (player.iframes) return false;

  player.health -= damage;
  player.iframes = true;
  player.iframeEndTime = now + BASE_STATS.player.iframeDuration;
  
  // Track damage time for HP regen delay
  player.lastDamageTakenTime = now;

  // Play damage sound effect
  playPlayerDamageSound();

  // Spawn red damage indicator above player
  if (damageNumbers) {
    spawnDamageNumber(damageNumbers, player.x, player.y - player.radius - 10, damage, false, now, true);
  }

  return player.health <= 0;
}

/**
 * Add XP to player and check for level-up
 */
export function addXP(player: Player, amount: number): boolean {
  player.xp += amount;
  
  if (player.xp >= player.xpToNextLevel) {
    player.level++;
    player.xp = 0;
    player.xpToNextLevel = LEVEL_CONFIG.xpPerLevel(player.level);
    
    // Play level up sound
    playLevelUpSound();
    
    return true; // Level up occurred
  }
  
  return false;
}

/**
 * Reset player to initial state with champion stats
 */
export function resetPlayer(player: Player, championId: ChampionId = 'sascha'): void {
  const champion = getChampion(championId);
  
  player.x = CANVAS_WIDTH / 2;
  player.y = CANVAS_HEIGHT / 2;
  player.health = champion.stats.maxHealth;
  player.maxHealth = champion.stats.maxHealth;
  player.iframes = false;
  player.level = 1;
  player.xp = 0;
  player.xpToNextLevel = LEVEL_CONFIG.xpPerLevel(1);
  player.multishot = champion.stats.multishot;
  player.fireRateMultiplier = 1.0; // Reset to 1.0 since we use absolute values
  player.damageMultiplier = 1.0; // Reset to 1.0 since we use absolute values
  player.baseSpeed = champion.stats.moveSpeed; // Use absolute value
  player.speedMultiplier = 1.0; // Reset to 1.0 since we use absolute values
  player.magnetMultiplier = 1.0;
  player.critChance = champion.stats.critChance;
  player.money = 0;
  player.lifesteal = 0.0;
  player.hpRegenRate = 0.0;
  player.lastDamageTakenTime = 0;
  player.championId = championId;
  player.bulletRange = champion.stats.bulletRange;
  player.championDamage = champion.stats.damage;
  player.championAttackSpeed = champion.stats.attackSpeed;
  player.runaansShots = 0;
  player.killCount = 0;
}

/**
 * Update player HP regeneration
 * Heals player over time if they haven't taken damage recently
 */
export function updatePlayerRegeneration(player: Player, now: number, deltaTime: number): void {
  // Only regen if player has regen rate and isn't at full HP
  if (player.hpRegenRate <= 0 || player.health >= player.maxHealth) {
    return;
  }
  
  // Check if enough time has passed since last damage
  const timeSinceLastDamage = now - player.lastDamageTakenTime;
  if (timeSinceLastDamage >= SHOP_ITEM_CONFIG.regenDelayMs) {
    // Apply regen based on delta time (HP per second)
    const regenAmount = player.hpRegenRate * (deltaTime / 1000);
    player.health = Math.min(player.health + regenAmount, player.maxHealth);
  }
}


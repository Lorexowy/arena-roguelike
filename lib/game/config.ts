/**
 * Game Configuration
 * 
 * Central location for all game balance parameters and constants.
 * Adjust these values to tune difficulty, progression, and game feel.
 */

// Original design dimensions (for reference)
const ORIGINAL_WIDTH = 320;
const ORIGINAL_HEIGHT = 180;

// Dynamic canvas dimensions (full viewport - what player sees)
export let CANVAS_WIDTH = typeof window !== 'undefined' ? window.innerWidth : 1920;
export let CANVAS_HEIGHT = typeof window !== 'undefined' ? window.innerHeight : 1080;

// World size multiplier - makes the playable world larger than viewport
export const WORLD_SIZE_MULTIPLIER = 3; // World is 3x larger than viewport

// World dimensions (actual playable area)
export let WORLD_WIDTH = CANVAS_WIDTH * WORLD_SIZE_MULTIPLIER;
export let WORLD_HEIGHT = CANVAS_HEIGHT * WORLD_SIZE_MULTIPLIER;

// Scaling factor for visual elements (so they don't appear tiny)
// Calculate based on average viewport size to maintain visual consistency
export let VISUAL_SCALE = typeof window !== 'undefined' 
  ? Math.min(window.innerWidth / ORIGINAL_WIDTH, window.innerHeight / ORIGINAL_HEIGHT)
  : 6;

// Gameplay scale - for speeds, distances, etc. to maintain same relative gameplay
// This makes movement speeds feel the same relative to screen size
export let GAMEPLAY_SCALE = VISUAL_SCALE;

export const GRID_SIZE = 16;       // Grid spacing in pixels

// Function to update canvas dimensions
export function updateCanvasDimensions(width: number, height: number): void {
  CANVAS_WIDTH = width;
  CANVAS_HEIGHT = height;
  WORLD_WIDTH = width * WORLD_SIZE_MULTIPLIER;
  WORLD_HEIGHT = height * WORLD_SIZE_MULTIPLIER;
  
  // Update visual scale based on viewport size
  const scaleX = width / ORIGINAL_WIDTH;
  const scaleY = height / ORIGINAL_HEIGHT;
  VISUAL_SCALE = Math.min(scaleX, scaleY);
  GAMEPLAY_SCALE = VISUAL_SCALE;
}

/**
 * Base stats for all game entities
 * Speeds/distances use GAMEPLAY_SCALE, visual sizes use VISUAL_SCALE
 * This maintains gameplay balance while adapting to screen size
 */
function getScaledStats() {
  const visualScale = VISUAL_SCALE;
  const gameplayScale = GAMEPLAY_SCALE;
  
  return {
    player: {
      moveSpeed: 1.5 * gameplayScale,  // Scaled for relative movement
      maxHealth: 75,
      startHealth: 75,
      iframeDuration: 800,
      radius: 4 * visualScale,  // Visual size
    },
    bullet: {
      speed: 4 * gameplayScale,  // Scaled for relative movement
      damage: 1,
      fireRate: 400,
      width: 3 * visualScale,  // Visual size
      height: 6 * visualScale,  // Visual size
    },
    enemy: {
      chaser: {
        speed: 0.7 * gameplayScale,  // Scaled for relative movement
        health: 3,
        damage: 5,
        size: 5 * visualScale,  // Visual size
        xpValue: 10,
      },
      shooter: {
        speed: 0.56 * gameplayScale,  // Scaled for relative movement
        health: 4.5,
        damage: 10,
        size: 5 * visualScale,  // Visual size
        xpValue: 15,
        preferredDistance: 100 * gameplayScale,  // Scaled for relative distance
        distanceThreshold: 10 * gameplayScale,  // Scaled for relative distance
        shootCooldown: 2000,
        projectileSpeed: 2.0 * gameplayScale,  // Scaled for relative movement
        projectileSize: 3 * visualScale,  // Visual size
      },
    },
    xp: {
      magnetRadius: 64 * gameplayScale,  // Scaled for relative distance
      moveSpeed: 3 * gameplayScale,  // Scaled for relative movement
      orbSize: 3 * visualScale,  // Visual size
    },
  };
}

export const BASE_STATS = getScaledStats();

/**
 * Enemy scaling configuration
 * Enemies become stronger with each wave
 */
export const ENEMY_SCALING_CONFIG = {
  // HP scaling: +5% per wave (multiplicative) - more gradual progression
  hpScalingMultiplier: 1.05,
  
  // Damage scaling: +6% per wave (multiplicative) - more gradual progression
  damageScalingMultiplier: 1.06,
  
  // Start scaling from wave 3 (wave 1-2 use base stats)
  minWaveForScaling: 3,
  
  // Projectile damage scaling (for shooter enemies)
  projectileDamageScalingMultiplier: 1.06,
};

/**
 * Level-up system configuration
 */
export const LEVEL_CONFIG = {
  xpPerLevel: (level: number) => {
    return 50 * level;  // Linear scaling: 50, 100, 150, etc.
  },
};

/**
 * Wave system configuration
 */
export const WAVE_CONFIG = {
  wave1EnemyCount: 5,
  enemyCountIncreasePerWave: 4, // Increased from 3 to 4
  modifierChance: 0.5,
  modifiers: [
    { name: 'Speed Boost', stat: 'speed', multiplier: 1.15 },
    { name: 'Damage Boost', stat: 'damage', multiplier: 1.25 },
    { name: 'HP Boost', stat: 'health', multiplier: 1.20 },
    { name: 'Rapid Spawn', stat: 'spawnInterval', multiplier: 0.85 },
  ],
};

/**
 * Visual effects configuration
 */
export const GAME_CONFIG = {
  hitFlashDuration: 80,
  screenShakeDuration: 120,
  screenShakeAmplitude: 5 * VISUAL_SCALE,  // Scaled - visual effect
  waveBannerDuration: 1500,
  waveCompleteBannerDuration: 2000,
  countdownDuration: 5000,   // 5 seconds between waves
  getReadyDuration: 1000,    // 1 second "Przygotuj się" message
};

/**
 * Economy configuration
 */
export const ECONOMY_CONFIG = {
  moneyDropChance: 0.3,  // 30% chance to drop money per kill
  baseMoneyPerKill: 1,   // Base money for chaser enemies
  baseMoneyPerShooter: 2, // Base money for shooter enemies
  
  // Money scaling with waves (more conservative than shop scaling)
  moneyScalingWaves: 4,        // Apply scaling every 4 waves (slower than shop)
  moneyScalingMultiplier: 1.10, // +10% per interval (less than shop's 15%)
  minWaveForScaling: 2,        // Start scaling from wave 2 (same as shop)
};

/**
 * Floating damage numbers configuration
 */
export const DAMAGE_NUMBER_CONFIG = {
  lifetime: 600,          // Milliseconds before fade out
  riseSpeed: 0.5 * VISUAL_SCALE,  // Scaled - visual effect
  fontSize: 14,           // Font size for damage numbers
  fadeStart: 300,         // When to start fading (ms)
  poolSize: 50,           // Max active damage numbers
};

/**
 * HUD configuration
 */
export const HUD_CONFIG = {
  panelWidth: 200,
  panelPadding: 12,
  statFontSize: 12,
  labelFontSize: 10,
  perkIconSize: 24,
};

/**
 * Shop item configuration
 */
export const SHOP_ITEM_CONFIG = {
  regenDelayMs: 3000,        // 3 seconds without damage before regen starts
  lifestealCap: 0.5,         // Maximum 50% lifesteal
};

/**
 * Game Configuration
 * 
 * Central location for all game balance parameters and constants.
 * Adjust these values to tune difficulty, progression, and game feel.
 */

export const CANVAS_WIDTH = 320;   // Logical resolution
export const CANVAS_HEIGHT = 180;  // Maintains 16:9 aspect ratio
export const GRID_SIZE = 16;       // Grid spacing in pixels

/**
 * Base stats for all game entities
 * These are the starting/default values before any upgrades or modifiers
 */
export const BASE_STATS = {
  player: {
    moveSpeed: 1.5,
    maxHealth: 75,         // Maximum HP
    startHealth: 75,       // Starting HP
    iframeDuration: 800,   // Milliseconds
    radius: 4,             // Reduced from 6 to 4 (33% smaller)
  },
  bullet: {
    speed: 4,
    damage: 1,
    fireRate: 400,         // Milliseconds between shots
    width: 3,              // Reduced from 4 to 3 (25% smaller)
    height: 6,             // Reduced from 8 to 6 (25% smaller)
  },
  enemy: {
    chaser: {
      speed: 0.7,
      health: 3,
      damage: 5,             // Contact damage to player
      size: 5,               // Reduced from 8 to 5 (37% smaller)
      xpValue: 10,
    },
    shooter: {
      speed: 0.56,           // 80% of chaser speed
      health: 4.5,           // 1.5x chaser health
      damage: 10,            // Projectile damage to player
      size: 5,               // Reduced from 8 to 5 (37% smaller)
      xpValue: 15,           // 1.5x chaser XP
      preferredDistance: 100, // Maintain ~100px from player
      distanceThreshold: 10,  // ±10px tolerance
      shootCooldown: 2000,    // 2 seconds between shots
      projectileSpeed: 2.0,   // Fast projectiles (dodgeable but threatening)
      projectileSize: 3,
    },
  },
  xp: {
    magnetRadius: 64,
    moveSpeed: 3,
    orbSize: 3,
  },
};

/**
 * Enemy scaling configuration
 * Enemies become stronger with each wave
 */
export const ENEMY_SCALING_CONFIG = {
  // HP scaling: +8% per wave (multiplicative) - reduced from 15%
  hpScalingMultiplier: 1.08,
  
  // Damage scaling: +10% per wave (multiplicative)  
  damageScalingMultiplier: 1.10,
  
  // Start scaling from wave 3 (wave 1-2 use base stats)
  minWaveForScaling: 3,
  
  // Projectile damage scaling (for shooter enemies)
  projectileDamageScalingMultiplier: 1.10,
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
  screenShakeAmplitude: 5,
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
  riseSpeed: 0.5,         // Pixels per frame upward
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

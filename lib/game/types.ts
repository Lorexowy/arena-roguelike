/**
 * Game Types
 * 
 * TypeScript type definitions for all game entities and state.
 */

export type GameState = 'intro' | 'getready' | 'countdown' | 'playing' | 'waveComplete' | 'gameover' | 'levelup';

export interface Position {
  x: number;
  y: number;
}

export interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  isCrit: boolean;
  maxRange?: number; // Optional: for champions with limited range
  distanceTraveled?: number; // Track distance for range limiting
}

export interface EnemyProjectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
}

export type EnemyType = 'chaser' | 'shooter';

export interface Enemy {
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  hitFlashEndTime: number;
  speed: number;
  damage: number;
  type: EnemyType;
  lastShotTime?: number; // For shooters
  size?: number;
  xpValue?: number;
  shootCooldown?: number;
  preferredDistance?: number;
  distanceThreshold?: number;
}

export interface XPOrb {
  x: number;
  y: number;
  value: number;
  magnetized: boolean;
}

export interface WaveModifier {
  name: string;
  stat: string;
  multiplier: number;
}

export interface Camera {
  x: number;              // Camera center X in world space
  y: number;              // Camera center Y in world space
  worldWidth: number;     // Total world width
  worldHeight: number;    // Total world height
  viewportWidth: number;  // What player sees (canvas width)
  viewportHeight: number; // What player sees (canvas height)
}

export interface Player {
  x: number;
  y: number;
  radius: number;
  baseSpeed: number;
  speedMultiplier: number;
  health: number;
  maxHealth: number;
  iframes: boolean;
  iframeEndTime: number;
  level: number;
  xp: number;
  xpToNextLevel: number;
  multishot: number;
  fireRateMultiplier: number;
  damageMultiplier: number;
  magnetMultiplier: number;
  critChance: number;          // 0.0 to 1.0
  money: number;               // Currency earned from kills
  lifesteal: number;           // 0.0 to 0.5 (0% to 50% cap)
  hpRegenRate: number;         // HP per second
  lastDamageTakenTime: number; // Timestamp for regen delay
  championId: string;          // Track which champion is being played
  bulletRange?: number;        // Optional: for champions with limited range
  championDamage: number;      // Champion's base damage value
  championAttackSpeed: number; // Champion's base attack speed value
  runaansShots: number;        // Number of auto-targeting shots from Runaan's Hurricane
  killCount: number;           // Total enemies killed in this run
}

export interface WaveState {
  currentWave: number;
  enemiesToSpawn: number;
  enemiesSpawned: number;
  shootersToSpawn: number;      // Shooters in this wave
  shootersSpawned: number;
  waveActive: boolean;
  showBanner: boolean;
  bannerEndTime: number;
  currentModifier: WaveModifier | null;
  baseEnemyCount: number;
  countdownRemaining: number;  // Seconds remaining (display only)
  
  // Deadline-based break system (robust to modals)
  breakActive: boolean;           // True during wave breaks
  breakDeadline: number | null;   // Absolute timestamp when break ends
  breakRemainingSnapshot: number; // Saved remaining ms when modal opens
  nextWavePending: boolean;       // Guard against duplicate wave starts
  
  // Shop system
  shopAppearanceChance: number;      // Current appearance chance (pity system)
  breaksSinceLastShop: number;       // Counter for guaranteed shop
  shopAvailable: boolean;            // Is shop available this break?
  shopBannerShown: boolean;          // Has the shop banner been shown?
}

export interface ScreenShake {
  active: boolean;
  endTime: number;
  offsetX: number;
  offsetY: number;
}

export interface Cursor {
  x: number;
  y: number;
  isValid: boolean;
}

export interface DamageNumber {
  x: number;
  y: number;
  damage: number;
  spawnTime: number;
  active: boolean;
  isCrit: boolean;             // Yellow/larger if true
  isPlayerDamage?: boolean;    // Red with minus sign if true
}

export interface UpgradeCount {
  multishot: number;
  attackSpeed: number;
  magnet: number;
  moveSpeed: number;
  damage: number;
  critChance: number;
}

export type UpgradeTier = 1 | 2 | 3;

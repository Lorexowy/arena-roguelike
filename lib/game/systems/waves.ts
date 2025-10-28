/**
 * Wave System
 * 
 * Manages wave progression, enemy spawning, and wave modifiers.
 */

import { WAVE_CONFIG, GAME_CONFIG } from '../config';
import { WaveState } from '../types';

/**
 * Create initial wave state
 */
export function createWaveState(): WaveState {
  return {
    currentWave: 1,
    enemiesToSpawn: WAVE_CONFIG.wave1EnemyCount,
    enemiesSpawned: 0,
    shootersToSpawn: 0,
    shootersSpawned: 0,
    waveActive: false, // Start inactive (will be activated after countdown)
    showBanner: true,
    bannerEndTime: Date.now() + GAME_CONFIG.waveBannerDuration,
    currentModifier: null,
    baseEnemyCount: WAVE_CONFIG.wave1EnemyCount,
    countdownRemaining: 5,
    
    // Deadline-based break system
    breakActive: false,
    breakDeadline: null,
    breakRemainingSnapshot: 0,
    nextWavePending: false,
    
    // Shop system
    shopAppearanceChance: 0.25,  // 25% base chance
    breaksSinceLastShop: 0,
    shopAvailable: false,
    shopBannerShown: false,
  };
}

/**
 * Start a wave break (deadline-based countdown)
 * Sets absolute deadline timestamp for when break ends
 */
export function startWaveBreak(waveState: WaveState, now: number): void {
  waveState.breakActive = true;
  waveState.breakDeadline = now + GAME_CONFIG.countdownDuration; // 5 seconds
  waveState.breakRemainingSnapshot = 0;
  waveState.nextWavePending = true;
  waveState.waveActive = false;
  
  // Initialize countdown display
  waveState.countdownRemaining = 5;
}

/**
 * Update break countdown (deadline-based)
 * Returns true when break naturally completes
 */
export function updateBreakCountdown(waveState: WaveState, now: number): boolean {
  if (!waveState.breakActive || !waveState.breakDeadline) return false;

  // Calculate remaining time from deadline
  const remainingMs = Math.max(0, waveState.breakDeadline - now);
  waveState.countdownRemaining = Math.ceil(remainingMs / 1000);

  // Check if break naturally completed
  if (remainingMs <= 0 && waveState.nextWavePending) {
    return true; // Break complete, ready to start next wave
  }

  return false;
}

/**
 * Pause break (when modal opens during break)
 * Snapshots remaining time so we can restore the deadline later
 */
export function pauseBreak(waveState: WaveState, now: number): void {
  if (waveState.breakActive && waveState.breakDeadline) {
    waveState.breakRemainingSnapshot = Math.max(0, waveState.breakDeadline - now);
  }
}

/**
 * Resume break (when modal closes during break)
 * Restores deadline based on snapshotted remaining time
 * Returns true if break already expired (should start wave immediately)
 */
export function resumeBreak(waveState: WaveState, now: number): boolean {
  if (waveState.breakActive) {
    // If break already expired, signal to start wave immediately
    if (waveState.breakRemainingSnapshot <= 0) {
      return true;
    }
    
    // Restore deadline based on remaining time
    waveState.breakDeadline = now + waveState.breakRemainingSnapshot;
    waveState.breakRemainingSnapshot = 0;
  }
  return false;
}

/**
 * Start the next wave (after break countdown completes)
 * This is the single entry point for wave activation
 */
export function startNextWave(waveState: WaveState, now: number): void {
  // Guard: only start if wave is pending
  if (!waveState.nextWavePending) return;
  
  // Clear break state
  waveState.breakActive = false;
  waveState.breakDeadline = null;
  waveState.breakRemainingSnapshot = 0;
  waveState.nextWavePending = false;
  
  // Activate wave
  waveState.waveActive = true;
  waveState.showBanner = true;
  waveState.bannerEndTime = now + GAME_CONFIG.waveBannerDuration;
  waveState.enemiesSpawned = 0;
}

/**
 * Prepare next wave
 * Decides between increasing enemy count or applying a modifier
 */
export function prepareNextWave(waveState: WaveState): void {
  waveState.currentWave++;

  // Calculate shooters for this wave
  // Wave 4: 1 shooter, Wave 6: 2, Wave 8: 3, etc. (reduced spawn rate)
  if (waveState.currentWave >= 4) {
    waveState.shootersToSpawn = 1 + Math.floor((waveState.currentWave - 4) / 2);
  } else {
    waveState.shootersToSpawn = 0;
  }
  waveState.shootersSpawned = 0;

  // Decide: increase count or apply modifier?
  if (Math.random() < WAVE_CONFIG.modifierChance && WAVE_CONFIG.modifiers.length > 0) {
    // Apply random modifier
    const randomMod = WAVE_CONFIG.modifiers[Math.floor(Math.random() * WAVE_CONFIG.modifiers.length)];
    waveState.currentModifier = randomMod;
    waveState.enemiesToSpawn = waveState.baseEnemyCount;
  } else {
    // Increase enemy count
    waveState.currentModifier = null;
    waveState.baseEnemyCount += WAVE_CONFIG.enemyCountIncreasePerWave;
    waveState.enemiesToSpawn = waveState.baseEnemyCount;
  }
}

/**
 * Update wave banner display
 */
export function updateWaveBanner(waveState: WaveState, now: number): void {
  if (waveState.showBanner && now >= waveState.bannerEndTime) {
    waveState.showBanner = false;
  }
}

/**
 * Check if current wave is cleared
 * Returns true if wave just cleared
 */
export function checkWaveCleared(
  waveState: WaveState,
  enemyCount: number
): boolean {
  // Check if all enemies (chasers + shooters) spawned and killed
  const totalToSpawn = waveState.enemiesToSpawn + waveState.shootersToSpawn;
  const totalSpawned = waveState.enemiesSpawned + waveState.shootersSpawned;
  
  if (waveState.waveActive && 
      totalSpawned >= totalToSpawn && 
      enemyCount === 0) {
    waveState.waveActive = false;
    return true; // Wave cleared
  }
  return false;
}

/**
 * Reset wave state
 */
export function resetWaveState(waveState: WaveState): void {
  waveState.currentWave = 1;
  waveState.enemiesToSpawn = WAVE_CONFIG.wave1EnemyCount;
  waveState.enemiesSpawned = 0;
  waveState.shootersToSpawn = 0;
  waveState.shootersSpawned = 0;
  waveState.waveActive = false;
  waveState.showBanner = false;
  waveState.bannerEndTime = 0;
  waveState.currentModifier = null;
  waveState.baseEnemyCount = WAVE_CONFIG.wave1EnemyCount;
  waveState.countdownRemaining = 5;
  
  // Clear break state
  waveState.breakActive = false;
  waveState.breakDeadline = null;
  waveState.breakRemainingSnapshot = 0;
  waveState.nextWavePending = false;
  
  // Clear shop state
  waveState.shopAppearanceChance = 0.25;
  waveState.breaksSinceLastShop = 0;
  waveState.shopAvailable = false;
  waveState.shopBannerShown = false;
}


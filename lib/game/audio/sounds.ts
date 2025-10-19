/**
 * Game Sounds Configuration
 * 
 * Defines all sound effects used in the game.
 * Each sound has a name, file path, and optional configuration.
 */

import { audioManager } from './audioManager';

export interface SoundDefinition {
  name: string;
  path: string;
  volume?: number;        // Override volume for this sound (0.0 to 1.0)
  preload?: boolean;      // Whether to preload this sound
}

/**
 * All game sounds
 */
export const GAME_SOUNDS: SoundDefinition[] = [
  {
    name: 'player_shoot',
    path: '/sounds/player_shoot.mp3',
    volume: 0.3,          // Lower volume for frequent sound
    preload: true,
  },
  {
    name: 'level_up',
    path: '/sounds/level_up.mp3',
    volume: 0.3,          // Reduced from 0.6 to 0.4 for quieter sound
    preload: true,
  },
  {
    name: 'merchant_arrival',
    path: '/sounds/merchant_arrival.mp3',
    volume: 0.5,          // Medium volume for special event
    preload: true,
  },
  // Future sounds can be added here:
  // {
  //   name: 'enemy_hit',
  //   path: '/sounds/enemy_hit.wav',
  //   volume: 0.4,
  //   preload: true,
  // },
  // {
  //   name: 'player_hit',
  //   path: '/sounds/player_hit.wav',
  //   volume: 0.5,
  //   preload: true,
  // },
];

/**
 * Initialize and preload all game sounds
 */
export async function initializeSounds(): Promise<void> {
  console.log('Initializing sounds...');
  console.log('Audio debug info:', audioManager.getDebugInfo());
  
  const preloadPromises = GAME_SOUNDS
    .filter(sound => sound.preload)
    .map(sound => audioManager.loadSound(sound.name, sound.path));
  
  try {
    await Promise.all(preloadPromises);
    console.log('All sounds loaded successfully');
    console.log('Final audio debug info:', audioManager.getDebugInfo());
  } catch (error) {
    console.error('Failed to load some sounds:', error);
  }
}

/**
 * Play a sound by name
 */
export function playSound(soundName: string, volumeOverride?: number): void {
  const soundDef = GAME_SOUNDS.find(s => s.name === soundName);
  if (!soundDef) {
    console.warn(`Sound ${soundName} not found`);
    return;
  }

  const volume = volumeOverride ?? soundDef.volume ?? 1.0;
  audioManager.playSound(soundName, volume);
}

/**
 * Convenience function for player shoot sound
 */
export function playPlayerShootSound(): void {
  console.log('playPlayerShootSound called');
  playSound('player_shoot');
}

/**
 * Convenience function for level up sound
 */
export function playLevelUpSound(): void {
  console.log('playLevelUpSound called');
  playSound('level_up');
}

/**
 * Convenience function for merchant arrival sound
 */
export function playMerchantArrivalSound(): void {
  console.log('playMerchantArrivalSound called');
  playSound('merchant_arrival');
}

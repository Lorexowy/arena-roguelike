/**
 * Champion Catalog
 * 
 * Defines all available champions with their unique stats and abilities.
 */

import { Champion, ChampionId } from './types';
import { GAMEPLAY_SCALE } from '../config';

export type { ChampionId };

export const CHAMPIONS: Record<ChampionId, Champion> = {
  sascha: {
    id: 'sascha',
    name: 'Sascha',
    description: 'Balanced warrior with standard abilities',
    stats: {
      damage: 1.0,
      attackSpeed: 1.0,
      multishot: 1,
      critChance: 0.0,
      moveSpeed: 1.2,
      maxHealth: 75,
      bulletRange: 200,
    },
    iconSrc: '/icons/champions/sascha.webp',
    iconAlt: 'Sascha',
  },
  
  byczan: {
    id: 'byczan',
    name: 'Byczan',
    description: 'High damage, limited range specialist',
    stats: {
      damage: 1.7,
      attackSpeed: 1.0,
      multishot: 2,
      critChance: 0.05,
      moveSpeed: 1.0,
      maxHealth: 100,
      bulletRange: 75, 
    },
    iconSrc: '/icons/champions/byczan.webp',
    iconAlt: 'Byczan',
  },
};

/**
 * Get champion by ID with gameplay-scaled stats
 */
export function getChampion(id: ChampionId): Champion {
  const champion = CHAMPIONS[id];
  
  // Scale movement and range for gameplay consistency
  return {
    ...champion,
    stats: {
      ...champion.stats,
      moveSpeed: champion.stats.moveSpeed * GAMEPLAY_SCALE,
      bulletRange: champion.stats.bulletRange ? champion.stats.bulletRange * GAMEPLAY_SCALE : undefined,
    },
  };
}

/**
 * Get all available champions (for display - unscaled stats)
 */
export function getAllChampions(): Champion[] {
  return Object.values(CHAMPIONS);
}

/**
 * Get champion for display purposes (unscaled stats)
 */
export function getChampionForDisplay(id: ChampionId): Champion {
  return CHAMPIONS[id];
}

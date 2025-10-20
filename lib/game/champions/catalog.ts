/**
 * Champion Catalog
 * 
 * Defines all available champions with their unique stats and abilities.
 */

import { Champion, ChampionId } from './types';

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
      bulletRange: 75, // Limited range for more challenge
    },
    iconSrc: '/icons/champions/byczan.webp',
    iconAlt: 'Byczan',
  },
};

/**
 * Get champion by ID
 */
export function getChampion(id: ChampionId): Champion {
  return CHAMPIONS[id];
}

/**
 * Get all available champions
 */
export function getAllChampions(): Champion[] {
  return Object.values(CHAMPIONS);
}

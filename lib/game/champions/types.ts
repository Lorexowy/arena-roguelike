/**
 * Champion System Types
 * 
 * Defines the data structures for different playable characters.
 */

export interface ChampionStats {
  damage: number;
  attackSpeed: number;
  multishot: number;
  critChance: number;
  moveSpeed: number;
  maxHealth: number;
  bulletRange?: number; // Optional: for champions with limited range
}

export interface Champion {
  id: string;
  name: string;
  description: string;
  stats: ChampionStats;
  iconSrc?: string;
  iconAlt?: string;
}

export type ChampionId = 'sascha' | 'byczan';

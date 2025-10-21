/**
 * Shop Catalog
 * 
 * Defines all purchasable perks and items for the merchant shop.
 * Each entry includes pricing, rarity, availability conditions, and effects.
 */

import { Player } from '../types';
import { UpgradeCount } from '../types';
import { SHOP_ITEM_CONFIG } from '../config';

export type ShopEntryType = 'perk' | 'item';
export type ShopRarity = 'common' | 'uncommon' | 'rare' | 'epic';

export interface ShopEntry {
  id: string;
  type: ShopEntryType;
  name: string;
  description: string;
  rarity: ShopRarity;
  baseCost: number;
  
  // Optional icon support (to be added later)
  icon?: string;        // Icon identifier or emoji
  iconSrc?: string;     // Path to icon image
  iconAlt?: string;     // Alt text for icon
  
  /**
   * Check if this entry is available for purchase
   * Return false to exclude from shop offers
   */
  isAvailable: (player: Player, upgradeCount: UpgradeCount) => boolean;
  
  /**
   * Apply the effect when purchased
   */
  apply: (player: Player, upgradeCount: UpgradeCount) => void;
}

/**
 * Shop Catalog - all available entries
 */
export const SHOP_CATALOG: ShopEntry[] = [
  // ===== PERKS (Stackable Upgrades) =====
  {
    id: 'dagger',
    type: 'perk',
    name: 'Dagger',
    description: '+20% attack speed',
    rarity: 'common',
    baseCost: 10, // Reduced from 30 to 10
    iconSrc: '/icons/shop/dagger.webp',
    iconAlt: 'Dagger',
    isAvailable: () => true, // Always available, stacks infinitely
    apply: (player) => {
      player.championAttackSpeed += 0.2; // +0.2 attacks per second
    },
  },
  {
    id: 'boots_of_speed',
    type: 'perk',
    name: 'Boots of Speed',
    description: '+20% movement speed',
    rarity: 'common',
    baseCost: 10, // Reduced from 30 to 10
    iconSrc: '/icons/shop/boots_of_speed.webp',
    iconAlt: 'Boots of Speed',
    isAvailable: () => true, // Always available, stacks infinitely
    apply: (player) => {
      player.baseSpeed += 0.2; // +0.2 movement speed
    },
  },
  
  // ===== ITEMS (Unique Effects) =====
  {
    id: 'ruby_crystal',
    type: 'item',
    name: 'Ruby Crystal',
    description: '+25 max HP and heal +25 HP',
    rarity: 'common',
    baseCost: 9, 
    iconSrc: '/icons/shop/ruby_crystal.webp',
    iconAlt: 'Ruby Crystal',
    isAvailable: () => true,
    apply: (player) => {
      player.maxHealth += 25;
      player.health = Math.min(player.health + 25, player.maxHealth);
    },
  },
  {
    id: 'rejuvenation_bead',
    type: 'item',
    name: 'Rejuvenation Bead',
    description: '+0.2 HP/sec after 3s without damage',
    rarity: 'uncommon',
    baseCost: 12,
    iconSrc: '/icons/shop/rejuvenation_bead.webp',
    iconAlt: 'Rejuvenation Bead',
    isAvailable: () => true,
    apply: (player) => {
      player.hpRegenRate += 0.2;
    },
  },
  {
    id: 'vampiric_scepter',
    type: 'item',
    name: 'Vampiric Scepter',
    description: '+10% lifesteal (max 50%)',
    rarity: 'uncommon',
    baseCost: 12,
    iconSrc: '/icons/shop/vampiric_scepter.webp',
    iconAlt: 'Vampiric Scepter',
    isAvailable: (player) => player.lifesteal < SHOP_ITEM_CONFIG.lifestealCap,
    apply: (player) => {
      player.lifesteal = Math.min(
        player.lifesteal + 0.10,
        SHOP_ITEM_CONFIG.lifestealCap
      );
    },
  },
  {
    id: 'runaans_hurricane',
    type: 'item',
    name: 'Runaan\'s Hurricane',
    description: 'Auto-targeting shot at nearby enemy',
    rarity: 'uncommon',
    baseCost: 14,
    iconSrc: '/icons/shop/runaans_hurricane.webp',
    iconAlt: 'Runaan\'s Hurricane',
    isAvailable: (player) => (player.runaansShots || 0) < 6, // Max 6 stacks
    apply: (player) => {
      player.runaansShots = (player.runaansShots || 0) + 1; // Add one auto-targeting shot
    },
  },
];

/**
 * Get rarity weight for random selection
 * Higher weight = more likely to appear
 */
export function getRarityWeight(rarity: ShopRarity): number {
  switch (rarity) {
    case 'common': return 50;
    case 'uncommon': return 30;
    case 'rare': return 15;
    case 'epic': return 5;
  }
}

/**
 * Get rarity color for UI display
 */
export function getRarityColor(rarity: ShopRarity): string {
  switch (rarity) {
    case 'common': return '#9CA3AF'; // Gray
    case 'uncommon': return '#10B981'; // Green
    case 'rare': return '#3B82F6'; // Blue
    case 'epic': return '#A855F7'; // Purple
  }
}

/**
 * Get rarity label for UI display
 */
export function getRarityLabel(rarity: ShopRarity): string {
  return rarity.charAt(0).toUpperCase() + rarity.slice(1);
}

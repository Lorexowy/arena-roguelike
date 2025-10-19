/**
 * Shop Logic System
 * 
 * Handles shop appearance probability, pity system, and offer generation.
 */

import { Player } from '../types';
import { UpgradeCount } from '../types';
import { SHOP_CATALOG, ShopEntry, getRarityWeight } from './catalog';

export interface ShopState {
  appearanceChance: number;      // Current chance (0.0 to 1.0)
  breaksSinceLastShop: number;   // Pity counter
  isOpen: boolean;               // Is shop modal open?
  currentOffer: ShopEntry[];     // Current shop inventory
  purchasesMade: number;         // Purchases in current visit
  rerollCost: number;            // Current reroll cost
  totalRerolls: number;          // Rerolls in current visit
}

/**
 * Shop configuration constants
 */
export const SHOP_CONFIG = {
  BASE_CHANCE: 0.25,              // 25% base chance
  PITY_INCREMENT: 0.05,           // +5% per failed attempt
  GUARANTEED_AFTER: 4,            // Guarantee after 4 breaks
  MIN_WAVE: 2,                    // Start appearing from wave 2
  OFFER_SIZE: 3,                  // Always 3 cards per offer
  MIN_PERKS: 1,                   // Minimum 1 perk per offer
  MIN_ITEMS: 1,                   // Minimum 1 item per offer
  PURCHASE_LIMIT: 1,              // Max purchases per visit
  BASE_REROLL_COST: 5,            // First reroll cost
  REROLL_COST_INCREMENT: 5,       // Cost increase per reroll
  PRICE_SCALING_WAVES: 3,         // Apply scaling every 3 waves (slower scaling)
  PRICE_SCALING_MULTIPLIER: 1.15, // +15% per interval (more meaningful scaling)
};

/**
 * Create initial shop state
 */
export function createShopState(): ShopState {
  return {
    appearanceChance: SHOP_CONFIG.BASE_CHANCE,
    breaksSinceLastShop: 0,
    isOpen: false,
    currentOffer: [],
    purchasesMade: 0,
    rerollCost: SHOP_CONFIG.BASE_REROLL_COST,
    totalRerolls: 0,
  };
}

/**
 * Decide if shop should appear this break
 * Uses pity system with guaranteed appearance
 */
export function shouldShopAppear(shopState: ShopState, currentWave: number): boolean {
  // Not available before wave 2
  if (currentWave < SHOP_CONFIG.MIN_WAVE) return false;
  
  // Guarantee after max breaks
  if (shopState.breaksSinceLastShop >= SHOP_CONFIG.GUARANTEED_AFTER) {
    return true;
  }
  
  // Random chance with pity
  return Math.random() < shopState.appearanceChance;
}

/**
 * Update shop state after a wave break
 * Call this when shop appears or doesn't appear
 */
export function updateShopAppearance(shopState: ShopState, appeared: boolean): void {
  if (appeared) {
    // Reset pity system
    shopState.appearanceChance = SHOP_CONFIG.BASE_CHANCE;
    shopState.breaksSinceLastShop = 0;
  } else {
    // Increase pity
    shopState.appearanceChance += SHOP_CONFIG.PITY_INCREMENT;
    shopState.breaksSinceLastShop++;
  }
}

/**
 * Calculate scaled price for current wave
 */
export function calculatePrice(baseCost: number, currentWave: number): number {
  const intervals = Math.floor((currentWave - SHOP_CONFIG.MIN_WAVE) / SHOP_CONFIG.PRICE_SCALING_WAVES);
  const multiplier = Math.pow(SHOP_CONFIG.PRICE_SCALING_MULTIPLIER, intervals);
  return Math.ceil(baseCost * multiplier);
}

/**
 * Generate a random shop offer
 * Shows 3 items with at least 1 perk and 1 item, randomly distributed
 */
export function generateShopOffer(
  player: Player,
  upgradeCount: UpgradeCount
): ShopEntry[] {
  // Filter available entries by type
  const availablePerks = SHOP_CATALOG.filter(entry => 
    entry.type === 'perk' && entry.isAvailable(player, upgradeCount)
  );
  
  const availableItems = SHOP_CATALOG.filter(entry => 
    entry.type === 'item' && entry.isAvailable(player, upgradeCount)
  );
  
  // Need at least 1 of each type to build an offer
  if (availablePerks.length === 0 || availableItems.length === 0) {
    return []; // Can't build a valid offer
  }
  
  const offer: ShopEntry[] = [];
  const selectedIds = new Set<string>();
  
  // Helper function to select one entry from a pool using weighted random
  const selectWeightedEntry = (pool: ShopEntry[], exclude: Set<string>): ShopEntry | null => {
    // Filter out already selected entries
    const filteredPool = pool.filter(entry => !exclude.has(entry.id));
    if (filteredPool.length === 0) return null;
    
    // Create weighted pool
    const weightedPool = filteredPool.map(entry => ({
      entry,
      weight: getRarityWeight(entry.rarity),
    }));
    
    // Calculate total weight
    const totalWeight = weightedPool.reduce((sum, item) => sum + item.weight, 0);
    
    // Random selection
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < weightedPool.length; i++) {
      random -= weightedPool[i].weight;
      if (random <= 0) {
        return weightedPool[i].entry;
      }
    }
    
    // Fallback to last item if rounding causes issues
    return weightedPool[weightedPool.length - 1].entry;
  };
  
  // Guarantee at least 1 perk and 1 item
  const firstPerk = selectWeightedEntry(availablePerks, selectedIds);
  if (firstPerk) {
    offer.push(firstPerk);
    selectedIds.add(firstPerk.id);
  }
  
  const firstItem = selectWeightedEntry(availableItems, selectedIds);
  if (firstItem) {
    offer.push(firstItem);
    selectedIds.add(firstItem.id);
  }
  
  // For the 3rd slot, randomly choose from all remaining entries
  const allAvailable = [...availablePerks, ...availableItems];
  const thirdEntry = selectWeightedEntry(allAvailable, selectedIds);
  if (thirdEntry) {
    offer.push(thirdEntry);
    selectedIds.add(thirdEntry.id);
  }
  
  // Shuffle the offer so guaranteed items aren't always in the same positions
  return offer.sort(() => Math.random() - 0.5);
}

/**
 * Open the shop with a new offer
 */
export function openShop(
  shopState: ShopState,
  player: Player,
  upgradeCount: UpgradeCount,
  _currentWave: number // Reserved for future wave-based filtering
): void {
  shopState.isOpen = true;
  shopState.currentOffer = generateShopOffer(player, upgradeCount);
  shopState.purchasesMade = 0;
  shopState.rerollCost = SHOP_CONFIG.BASE_REROLL_COST;
  shopState.totalRerolls = 0;
}

/**
 * Close the shop
 */
export function closeShop(shopState: ShopState): void {
  shopState.isOpen = false;
  shopState.currentOffer = [];
  shopState.purchasesMade = 0;
  shopState.rerollCost = SHOP_CONFIG.BASE_REROLL_COST;
  shopState.totalRerolls = 0;
}

/**
 * Reroll the shop offer
 * Returns true if successful, false if not enough money
 */
export function rerollShop(
  shopState: ShopState,
  player: Player,
  upgradeCount: UpgradeCount,
  _currentWave: number // Reserved for future wave-based filtering
): boolean {
  // Check if player can afford
  if (player.money < shopState.rerollCost) {
    return false;
  }
  
  // Deduct cost
  player.money -= shopState.rerollCost;
  
  // Generate new offer
  shopState.currentOffer = generateShopOffer(player, upgradeCount);
  
  // Increase reroll cost for next reroll
  shopState.rerollCost += SHOP_CONFIG.REROLL_COST_INCREMENT;
  shopState.totalRerolls++;
  
  return true;
}

/**
 * Purchase an item from the shop
 * Returns true if successful, false if not enough money or purchase limit reached
 */
export function purchaseShopItem(
  shopState: ShopState,
  player: Player,
  upgradeCount: UpgradeCount,
  entryId: string,
  currentWave: number
): boolean {
  // Check purchase limit
  if (shopState.purchasesMade >= SHOP_CONFIG.PURCHASE_LIMIT) {
    return false;
  }
  
  // Find entry in current offer
  const entry = shopState.currentOffer.find(e => e.id === entryId);
  if (!entry) {
    return false;
  }
  
  // Calculate price
  const price = calculatePrice(entry.baseCost, currentWave);
  
  // Check if player can afford
  if (player.money < price) {
    return false;
  }
  
  // Deduct money
  player.money -= price;
  
  // Apply effect
  entry.apply(player, upgradeCount);
  
  // Increment purchases
  shopState.purchasesMade++;
  
  return true;
}

/**
 * Check if player can make more purchases
 */
export function canPurchaseMore(shopState: ShopState): boolean {
  return shopState.purchasesMade < SHOP_CONFIG.PURCHASE_LIMIT;
}


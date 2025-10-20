/**
 * Upgrade System
 * 
 * Manages player upgrades with tiered progression.
 */

import { Player, UpgradeCount, UpgradeTier as UpgradeTierType } from '../types';

// Re-export UpgradeTier for external use
export type UpgradeTier = UpgradeTierType;

/**
 * Available upgrade IDs
 */
export const UPGRADE_IDS = [
  'multishot',
  'attackSpeed',
  'magnet',
  'moveSpeed',
  'damage',
  'critChance',
] as const;

export type UpgradeId = typeof UPGRADE_IDS[number];

/**
 * Upgrade tier benefits
 * Tier I: 1x benefit
 * Tier II: 1.5x benefit (50% more)
 * Tier III: 2x benefit (100% more)
 */
const TIER_MULTIPLIERS: Record<UpgradeTierType, number> = {
  1: 1.0,
  2: 1.5,
  3: 2.0,
};

/**
 * Wave-based tier probability
 * Waves 1-3: Only Tier I
 * Wave 4+: 75% Tier I, 20% Tier II, 5% Tier III
 */
export function getUpgradeTier(currentWave: number): UpgradeTierType {
  if (currentWave < 4) return 1;
  
  const roll = Math.random();
  if (roll < 0.05) return 3;      // 5% chance for Tier III
  if (roll < 0.25) return 2;      // 20% chance for Tier II
  return 1;                        // 75% chance for Tier I
}

/**
 * Upgrade card display information with tier
 */
export function getUpgradeInfo(upgradeId: UpgradeId, tier: UpgradeTierType): { name: string; desc: string } {
  const tierNum = ['I', 'II', 'III'][tier - 1];
  const tierMult = TIER_MULTIPLIERS[tier];
  
  const baseInfo: Record<UpgradeId, { name: string; desc: string }> = {
    multishot: { 
      name: `Multishot ${tierNum}`, 
      desc: `+${Math.floor(tierMult)} additional bullet${tierMult > 1 ? 's' : ''} per shot` 
    },
    attackSpeed: { 
      name: `Attack Speed ${tierNum}`, 
      desc: `Fire rate ${(tierMult * 12).toFixed(0)}% faster` 
    },
    magnet: { 
      name: `Magnet ${tierNum}`, 
      desc: `XP radius ${(tierMult * 30).toFixed(0)}% larger` 
    },
    moveSpeed: { 
      name: `Move Speed ${tierNum}`, 
      desc: `Movement ${(tierMult * 11).toFixed(0)}% faster` 
    },
    damage: { 
      name: `Damage ${tierNum}`, 
      desc: `+${(tierMult * 15).toFixed(0)}% bullet damage` 
    },
    critChance: { 
      name: `Crit Chance ${tierNum}`, 
      desc: `+${(tierMult * 5).toFixed(0)}% critical hit chance` 
    },
  };

  return baseInfo[upgradeId];
}

/**
 * Generate random upgrade choices with tiers based on current wave
 */
export function generateUpgradeChoices(
  count: number = 3, 
  currentWave: number = 1
): Array<{ id: UpgradeId; tier: UpgradeTierType }> {
  const shuffled = [...UPGRADE_IDS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map(id => ({
    id,
    tier: getUpgradeTier(currentWave),
  }));
}

/**
 * Apply an upgrade to the player with tier-based scaling
 */
export function applyUpgrade(
  player: Player, 
  upgradeId: UpgradeId, 
  tier: UpgradeTierType,
  upgradeCount: UpgradeCount
): void {
  const tierMult = TIER_MULTIPLIERS[tier];
  
  switch (upgradeId) {
    case 'multishot':
      player.multishot += Math.floor(tierMult);
      upgradeCount.multishot += Math.floor(tierMult);
      break;
    case 'attackSpeed':
      // Tier I: +0.2 attacks/sec, Tier II: +0.3 attacks/sec, Tier III: +0.4 attacks/sec
      player.championAttackSpeed += 0.2 * tierMult;
      upgradeCount.attackSpeed++;
      break;
    case 'magnet':
      // Tier I: 30% larger, Tier II: 45% larger, Tier III: 60% larger
      player.magnetMultiplier *= 1 + (0.3 * tierMult);
      upgradeCount.magnet++;
      break;
    case 'moveSpeed':
      // Tier I: +0.2 speed, Tier II: +0.3 speed, Tier III: +0.4 speed
      player.baseSpeed += 0.2 * tierMult;
      upgradeCount.moveSpeed++;
      break;
    case 'damage':
      // Tier I: +0.3 damage, Tier II: +0.45 damage, Tier III: +0.6 damage
      player.championDamage += 0.3 * tierMult;
      upgradeCount.damage++;
      break;
    case 'critChance':
      // Tier I: +5%, Tier II: +7.5%, Tier III: +10%
      player.critChance += 0.05 * tierMult;
      upgradeCount.critChance++;
      break;
  }
}

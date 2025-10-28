/**
 * Reward Indicators System
 * 
 * Handles floating reward indicators when chests are opened.
 */

import { VISUAL_SCALE } from '../config';
import { ChestReward } from '../types';

export interface RewardIndicator {
  x: number;
  y: number;
  text: string;
  color: string;
  startTime: number;
  active: boolean;
  vx: number; // Horizontal velocity
  vy: number; // Vertical velocity
  gravity: number;
  fadeStartTime: number;
}

// Configuration for reward indicators
export const REWARD_INDICATOR_CONFIG = {
  duration: 2000, // 2 seconds
  fadeStartTime: 1500, // Start fading after 1.5 seconds
  riseSpeed: -2 * VISUAL_SCALE, // Initial upward velocity
  horizontalSpread: 1 * VISUAL_SCALE, // Random horizontal spread
  gravity: 0.1 * VISUAL_SCALE, // Gravity effect
  fontSize: 16 * VISUAL_SCALE,
  fontFamily: 'monospace',
};

// Colors for different reward types
const REWARD_COLORS = {
  money: '#FFD700',      // Gold
  xp: '#00FF00',         // Green
  health: '#FF6B6B',     // Red
  temporary_boost: '#FFA500', // Orange
  permanent_boost: '#9D4EDD', // Purple
};

/**
 * Create a pool of reward indicators
 */
export function createRewardIndicatorPool(): RewardIndicator[] {
  const pool: RewardIndicator[] = [];
  for (let i = 0; i < 20; i++) {
    pool.push({
      x: 0,
      y: 0,
      text: '',
      color: '#FFFFFF',
      startTime: 0,
      active: false,
      vx: 0,
      vy: 0,
      gravity: REWARD_INDICATOR_CONFIG.gravity,
      fadeStartTime: 0,
    });
  }
  return pool;
}

/**
 * Spawn a reward indicator
 */
export function spawnRewardIndicator(
  pool: RewardIndicator[],
  x: number,
  y: number,
  reward: ChestReward,
  now: number
): void {
  const indicator = pool.find(ind => !ind.active);
  if (!indicator) return;

  // Generate text based on reward type
  let text = '';
  let color = REWARD_COLORS[reward.type] || '#FFFFFF';

  switch (reward.type) {
    case 'money':
      text = `+${reward.amount} Gold`;
      break;
    case 'xp':
      text = `+${reward.amount} XP`;
      break;
    case 'health':
      text = `+${reward.amount} HP`;
      break;
    case 'temporary_boost':
      text = `+${reward.amount} ${reward.statType} (30s)`;
      break;
    case 'permanent_boost':
      text = `+${reward.amount} ${reward.statType} (PERM)`;
      break;
  }

  // Set up indicator
  indicator.x = x;
  indicator.y = y;
  indicator.text = text;
  indicator.color = color;
  indicator.startTime = now;
  indicator.fadeStartTime = now + REWARD_INDICATOR_CONFIG.fadeStartTime;
  indicator.active = true;
  
  // Random horizontal velocity
  indicator.vx = (Math.random() - 0.5) * REWARD_INDICATOR_CONFIG.horizontalSpread;
  indicator.vy = REWARD_INDICATOR_CONFIG.riseSpeed;
}

/**
 * Update reward indicators
 */
export function updateRewardIndicators(indicators: RewardIndicator[], now: number): void {
  for (const indicator of indicators) {
    if (!indicator.active) continue;

    const elapsed = now - indicator.startTime;
    
    // Check if indicator should be deactivated
    if (elapsed >= REWARD_INDICATOR_CONFIG.duration) {
      indicator.active = false;
      continue;
    }

    // Update position
    indicator.x += indicator.vx;
    indicator.y += indicator.vy;
    indicator.vy += indicator.gravity; // Apply gravity
  }
}

/**
 * Draw reward indicators
 */
export function drawRewardIndicators(
  ctx: CanvasRenderingContext2D,
  indicators: RewardIndicator[],
  now: number,
  camera: { x: number; y: number; viewportWidth: number; viewportHeight: number }
): void {
  const viewportHalfW = camera.viewportWidth / 2;
  const viewportHalfH = camera.viewportHeight / 2;
  
  ctx.save();
  ctx.translate(-camera.x + viewportHalfW, -camera.y + viewportHalfH);
  
  for (const indicator of indicators) {
    if (!indicator.active) continue;

    const elapsed = now - indicator.startTime;
    const fadeStart = indicator.fadeStartTime - indicator.startTime;
    
    // Calculate alpha (fade out in the last 0.5 seconds)
    let alpha = 1;
    if (elapsed > fadeStart) {
      const fadeProgress = (elapsed - fadeStart) / (REWARD_INDICATOR_CONFIG.duration - fadeStart);
      alpha = 1 - fadeProgress;
    }

    // Set up text rendering
    ctx.font = `${REWARD_INDICATOR_CONFIG.fontSize}px ${REWARD_INDICATOR_CONFIG.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Draw text with shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 2;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    
    // Set color with alpha
    const colorWithAlpha = `${indicator.color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
    ctx.fillStyle = colorWithAlpha;
    ctx.fillText(indicator.text, indicator.x, indicator.y);
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }
  
  ctx.restore();
}

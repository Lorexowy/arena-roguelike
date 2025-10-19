/**
 * Effects System
 * 
 * Visual effects like screen shake.
 */

import { GAME_CONFIG } from '../config';
import { ScreenShake } from '../types';

/**
 * Create screen shake state
 */
export function createScreenShake(): ScreenShake {
  return {
    active: false,
    endTime: 0,
    offsetX: 0,
    offsetY: 0,
  };
}

/**
 * Trigger screen shake effect
 */
export function triggerScreenShake(screenShake: ScreenShake): void {
  screenShake.active = true;
  screenShake.endTime = Date.now() + GAME_CONFIG.screenShakeDuration;
}

/**
 * Update screen shake state
 */
export function updateScreenShake(screenShake: ScreenShake, now: number): void {
  if (!screenShake.active) return;

  if (now >= screenShake.endTime) {
    screenShake.active = false;
    screenShake.offsetX = 0;
    screenShake.offsetY = 0;
  } else {
    screenShake.offsetX = (Math.random() - 0.5) * GAME_CONFIG.screenShakeAmplitude * 2;
    screenShake.offsetY = (Math.random() - 0.5) * GAME_CONFIG.screenShakeAmplitude * 2;
  }
}


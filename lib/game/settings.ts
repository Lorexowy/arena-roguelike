/**
 * Game Settings System
 * 
 * Manages game settings with localStorage persistence.
 */

export interface GameSettings {
  masterVolume: number;      // 0-100
  effectsVolume: number;     // 0-100 (separate from master volume)
  reduceMotion: boolean;     // Disable trails/particles
  disableScreenShake: boolean;
}

const SETTINGS_KEY = 'arena-roguelike-settings';

/**
 * Default settings
 */
export const DEFAULT_SETTINGS: GameSettings = {
  masterVolume: 70,
  effectsVolume: 50,
  reduceMotion: false,
  disableScreenShake: false,
};

/**
 * Load settings from localStorage
 */
export function loadSettings(): GameSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (error) {
    console.warn('Failed to load settings:', error);
  }
  return { ...DEFAULT_SETTINGS };
}

/**
 * Save settings to localStorage
 */
export function saveSettings(settings: GameSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.warn('Failed to save settings:', error);
  }
}

/**
 * Get master volume (for future audio)
 */
export function getMasterVolume(settings: GameSettings): number {
  return settings.masterVolume / 100; // 0.0 to 1.0
}

/**
 * Get effects volume (for sound effects)
 */
export function getEffectsVolume(settings: GameSettings): number {
  return settings.effectsVolume / 100; // 0.0 to 1.0
}


/**
 * Audio Manager
 * 
 * Handles all game audio including sound effects and music.
 * Provides a simple interface for playing sounds with volume control.
 */

export interface AudioConfig {
  masterVolume: number;  // 0.0 to 1.0 (master volume)
  effectsVolume: number; // 0.0 to 1.0 (effects volume)
  enabled: boolean;      // Master audio toggle
}

export class AudioManager {
  private config: AudioConfig;
  private audioContext: AudioContext | null = null;
  private soundCache: Map<string, AudioBuffer> = new Map();

  constructor(config: AudioConfig = { masterVolume: 0.5, effectsVolume: 0.5, enabled: true }) {
    this.config = config;
    this.initializeAudioContext();
  }

  /**
   * Initialize Web Audio API context
   */
  private initializeAudioContext(): void {
    try {
      this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  /**
   * Load and cache a sound file
   */
  async loadSound(name: string, url: string): Promise<void> {
    if (!this.audioContext) {
      console.warn('Audio context not available');
      return;
    }

    try {
      console.log(`Loading sound: ${name} from ${url}`);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      this.soundCache.set(name, audioBuffer);
      console.log(`Successfully loaded sound: ${name}`);
    } catch (error) {
      console.error(`Failed to load sound ${name}:`, error);
    }
  }

  /**
   * Play a cached sound
   */
  playSound(name: string, volume: number = 1.0, isEffect: boolean = true): void {
    console.log(`Attempting to play sound: ${name}, volume: ${volume}, enabled: ${this.config.enabled}`);
    
    if (!this.config.enabled) {
      console.log('Audio disabled in config');
      return;
    }
    
    if (!this.audioContext) {
      console.warn('Audio context not available');
      return;
    }

    const audioBuffer = this.soundCache.get(name);
    if (!audioBuffer) {
      console.warn(`Sound ${name} not found in cache. Available sounds:`, Array.from(this.soundCache.keys()));
      return;
    }

    try {
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      
      source.buffer = audioBuffer;
      
      // Use effects volume for sound effects, master volume for everything else
      const volumeMultiplier = isEffect ? this.config.effectsVolume : this.config.masterVolume;
      gainNode.gain.value = volume * volumeMultiplier;
      
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      source.start();
      console.log(`Playing sound: ${name} at volume ${gainNode.gain.value}`);
    } catch (error) {
      console.error(`Failed to play sound ${name}:`, error);
    }
  }

  /**
   * Update audio configuration
   */
  updateConfig(config: Partial<AudioConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): AudioConfig {
    return { ...this.config };
  }

  /**
   * Resume audio context (required after user interaction)
   */
  async resumeContext(): Promise<void> {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      console.log('Resuming audio context...');
      await this.audioContext.resume();
      console.log('Audio context resumed');
    }
  }

  /**
   * Get debug information about the audio system
   */
  getDebugInfo(): Record<string, unknown> {
    return {
      audioContext: this.audioContext ? {
        state: this.audioContext.state,
        sampleRate: this.audioContext.sampleRate,
        currentTime: this.audioContext.currentTime,
      } : null,
      config: this.config,
      cachedSounds: Array.from(this.soundCache.keys()),
    };
  }
}

// Global audio manager instance
export const audioManager = new AudioManager();

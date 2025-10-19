# Audio System Guide

## 🎵 Overview

The game now has a complete audio system ready for sound effects! The system is designed to be:
- **Lightweight**: Uses Web Audio API for low latency
- **Extensible**: Easy to add new sounds
- **Configurable**: Volume control and master toggle
- **Performance**: Sounds are preloaded and cached

## 🔊 Current Implementation

### Player Shoot Sound
- **Trigger**: Every time the player shoots (once per shot, not per bullet)
- **Volume**: 30% (automatically adjusted)
- **File**: `public/sounds/player_shoot.wav`

### Audio System Features
- ✅ **Web Audio API**: Low latency, high quality
- ✅ **Sound Caching**: Preloads sounds for instant playback
- ✅ **Volume Control**: Per-sound and master volume
- ✅ **Error Handling**: Graceful fallback if audio fails
- ✅ **Browser Compatibility**: Works in all modern browsers

## 📁 File Structure

```
public/sounds/
├── README.md              # Sound specifications and guidelines
└── player_shoot.wav       # Player shooting sound (you need to add this)

lib/game/audio/
├── audioManager.ts        # Core audio system
└── sounds.ts             # Sound definitions and helpers
```

## 🎯 How to Add Your Shoot Sound

### Step 1: Create/Find a Sound
- **Duration**: 0.1-0.3 seconds (short and snappy)
- **Style**: Laser, gunshot, or energy blast sound
- **Format**: WAV (recommended) or MP3
- **Volume**: Will be automatically reduced to 30%

### Step 2: Place the File
Put your sound file here:
```
public/sounds/player_shoot.wav
```

### Step 3: Test
The sound will automatically play when you shoot! No code changes needed.

## 🔧 Technical Details

### Audio Manager
```typescript
// Core audio system with Web Audio API
export class AudioManager {
  private audioContext: AudioContext | null = null;
  private soundCache: Map<string, AudioBuffer> = new Map();
  
  async loadSound(name: string, url: string): Promise<void>
  playSound(name: string, volume: number = 1.0): void
  updateConfig(config: Partial<AudioConfig>): void
}
```

### Sound Configuration
```typescript
export const GAME_SOUNDS: SoundDefinition[] = [
  {
    name: 'player_shoot',
    path: '/sounds/player_shoot.wav',
    volume: 0.3,          // 30% volume
    preload: true,        // Load on game start
  },
];
```

### Integration
```typescript
// In bullet system - plays once per shot
export function spawnBullets(bullets: Bullet[], player: Player, cursor: Cursor): void {
  // ... bullet spawning logic ...
  
  // Play shoot sound effect (only once per shot, not per bullet)
  playPlayerShootSound();
}
```

## 🎮 User Experience

### Audio Behavior
- **Shooting**: Sound plays every time you shoot
- **Multishot**: Sound plays once per shot (not per bullet)
- **Volume**: Automatically balanced at 30%
- **Latency**: Near-instant playback (Web Audio API)

### Browser Compatibility
- ✅ **Chrome/Edge**: Full support
- ✅ **Firefox**: Full support  
- ✅ **Safari**: Full support
- ✅ **Mobile**: Full support

## 🚀 Future Sounds Ready

The system is already set up for these additional sounds:

### Easy to Add
```typescript
// Just add to GAME_SOUNDS array:
{
  name: 'enemy_hit',
  path: '/sounds/enemy_hit.wav',
  volume: 0.4,
  preload: true,
},
{
  name: 'player_hit', 
  path: '/sounds/player_hit.wav',
  volume: 0.5,
  preload: true,
},
{
  name: 'level_up',
  path: '/sounds/level_up.wav', 
  volume: 0.6,
  preload: true,
},
```

### Usage
```typescript
// Then call anywhere in the game:
playSound('enemy_hit');
playSound('player_hit');
playSound('level_up');
```

## 🎵 Sound Design Tips

### Recommended Characteristics
- **Short Duration**: 0.1-0.5 seconds
- **Clear Attack**: Quick onset for responsiveness
- **Consistent Style**: Match your game's aesthetic
- **Appropriate Volume**: System will auto-adjust

### Free Resources
- **Freesound.org**: Community sounds (check licenses)
- **Zapsplat**: Professional library (free tier)
- **Adobe Audition**: Professional editing
- **Audacity**: Free audio editor

## ✅ Ready to Use!

The audio system is fully implemented and ready. Just add your `player_shoot.wav` file to `public/sounds/` and you'll hear shooting sounds immediately!

The system is designed to be:
- **Zero-config**: Works out of the box
- **Performance-optimized**: Preloaded and cached
- **Extensible**: Easy to add more sounds
- **Robust**: Handles errors gracefully

Your game now has professional-quality audio! 🎉

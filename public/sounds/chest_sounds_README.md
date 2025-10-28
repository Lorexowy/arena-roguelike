# Chest Sound Effects

Add these optional sound files to enhance the chest system:

## Recommended Sounds

- `chest_open.mp3` - Sound when player steps on a chest (opening starts)
- `chest_reward_common.mp3` - Sound when common chest reward is given
- `chest_reward_uncommon.mp3` - Sound when uncommon chest reward is given
- `chest_reward_rare.mp3` - Sound when rare chest reward is given
- `chest_reward_legendary.mp3` - Sound when legendary chest reward is given
- `chest_sparkle.mp3` - Optional sparkle/magic sound during opening animation

## Sound Specifications

- **Format**: MP3
- **Duration**: 0.5-2 seconds (short and punchy)
- **Volume**: Normalized to match existing game sounds

## Implementation Status

Chest sounds are currently marked with TODO comments in the code. To implement:

1. Add sound files to `/public/sounds/`
2. Update `lib/game/audio/sounds.ts` to import and initialize chest sounds
3. Update `components/game/GameCanvas.tsx` chest collision detection to play sounds

## Sound Timing

- **Opening sound**: Plays immediately when player collides with chest
- **Reward sound**: Plays after 3-second opening animation completes
- Different rarity rewards should have different sound effects to make legendary chests feel special


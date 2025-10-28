# Chest System Guide

## Overview

The chest system adds exploration and random rewards to your arena roguelike game. Chests spawn randomly on the map at the start of each wave, and players can collect them for various rewards.

## Features

### Chest Spawning
- **1-3 chests spawn per wave** randomly across the map
- Chests spawn at least 100 pixels away from the player
- Minimum 80 pixels between chests to prevent clustering
- New chests spawn at the beginning of each wave

### Chest Rarities

The game features 4 rarity tiers with different spawn chances:

1. **Common (60%)** - Brown chests
   - 5-10 gold
   - 25-50 XP
   - 10-20 HP

2. **Uncommon (25%)** - Blue chests
   - 15-25 gold
   - 75-100 XP
   - 30-50 HP
   - 30s speed boost (temporary)

3. **Rare (12%)** - Purple chests
   - 30-50 gold
   - 150-200 XP
   - 30s damage boost (temporary)
   - 30s fire rate boost (temporary)

4. **Legendary (3%)** - Gold chests
   - 75-100 gold
   - 300-400 XP
   - +0.1 permanent damage
   - +0.05 permanent speed

### Opening Animation

When a player steps on a chest:
1. The chest begins a 3-second opening animation
2. The chest scales and rotates slightly
3. After 1.5 seconds, sparkle effects appear
4. After 3 seconds, the reward is applied and the chest disappears

### Visual Effects

- **Closed chests**: Display chest icon or colored rectangle with glow
- **Opening animation**: Scale, rotation, and sparkle effects
- **Fallback rendering**: If no chest images are provided, colored rectangles with glow effects are used

## Asset Requirements

### Chest Icons

Place 64x64 PNG files in `/public/chests/`:

- `chest_common.png` - Brown chest
- `chest_uncommon.png` - Blue chest
- `chest_rare.png` - Purple chest  
- `chest_legendary.png` - Gold chest

**Tip**: Use pixel art style matching your game's aesthetic. Transparency is supported. The 64x64 size makes chests much more visible and easier to interact with.

### Sound Effects (Optional)

Place MP3 files in `/public/sounds/`:

- `chest_open.mp3` - Plays when player steps on chest
- `chest_reward_common.mp3` - Plays when common reward given
- `chest_reward_uncommon.mp3` - Plays when uncommon reward given
- `chest_reward_rare.mp3` - Plays when rare reward given
- `chest_reward_legendary.mp3` - Plays when legendary reward given

**Note**: Sound integration is marked with TODO comments in the code for future implementation.

## Configuration

Edit chest behavior in `/lib/game/systems/chests.ts`:

```typescript
export const CHEST_CONFIG = {
  minChestsPerWave: 1,        // Minimum chests per wave
  maxChestsPerWave: 3,        // Maximum chests per wave
  spawnDistanceFromPlayer: 100, // Min distance from player
  
  rarityChances: {
    common: 0.60,      // 60%
    uncommon: 0.25,    // 25%
    rare: 0.12,        // 12%
    legendary: 0.03,   // 3%
  },
  
  openingDuration: 3000, // 3 seconds
  chestSize: 64,         // Visual size in pixels (400% increase)
};
```

## Implementation Details

### Files Modified

1. **`lib/game/types.ts`**
   - Added `Chest`, `ChestRarity`, and `ChestReward` interfaces

2. **`lib/game/systems/chests.ts`** (NEW)
   - Chest spawning logic
   - Reward generation
   - Collision detection
   - Opening animation tracking

3. **`lib/game/systems/render.ts`**
   - Chest rendering functions
   - Opening animation effects
   - Sparkle particle effects
   - Chest image preloading

4. **`components/game/GameCanvas.tsx`**
   - Chest state management
   - Collision detection in game loop
   - Reward application
   - Chest spawning on wave start

### Key Functions

- `spawnChestsForWave(x, y)` - Spawns chests for new wave
- `checkChestCollision(player, chest)` - Detects player-chest collision
- `startChestOpening(chest, now)` - Begins opening animation
- `applyChestReward(reward, player)` - Applies reward to player
- `generateChestRarity()` - Random rarity based on distribution
- `generateChestReward(rarity)` - Random reward for rarity

## Future Enhancements

### Temporary Boosts (TODO)

Currently, temporary boosts (speed, damage, fire rate) are logged to console but not fully implemented. To implement:

1. Add boost tracking to player state:
   ```typescript
   activeBoosts: {
     speed?: { amount: number, endTime: number },
     damage?: { amount: number, endTime: number },
     fireRate?: { amount: number, endTime: number },
   }
   ```

2. Update relevant systems to apply boost multipliers
3. Add visual indicators for active boosts in HUD

### Permanent Boosts (TODO)

Permanent boosts are logged to console. To implement:

1. Apply directly to player stats:
   ```typescript
   player.damageMultiplier += reward.amount;
   player.speedMultiplier += reward.amount;
   ```

2. Consider balance implications (legendary chests should feel powerful but fair)

### Sound Integration (TODO)

Chest opening sound marked with TODO in `GameCanvas.tsx` line 392.

To add sounds:
1. Add sound files to `/public/sounds/`
2. Import and initialize in `lib/game/audio/sounds.ts`
3. Call sound functions in chest collision detection

## Gameplay Tips

- **Exploration encouragement**: Chests spawn away from the player, encouraging movement
- **Risk vs. Reward**: 3-second opening animation keeps player stationary, adding tension
- **Legendary excitement**: 3% legendary spawn rate makes them special
- **Wave rewards**: Players get new chest chances each wave

## Testing

To test the chest system:

1. Start a new game
2. Look for colored glowing objects on the map (or chest icons if added)
3. Walk over a chest to trigger opening animation
4. Wait 3 seconds to receive reward
5. Check that reward is applied (money, XP, or HP)
6. Progress to next wave and verify new chests spawn

## Troubleshooting

**Chests not visible?**
- Check that chest images are in `/public/chests/` (or fallback rectangles should appear)
- Verify chest preloading in browser console: "Tiles and chests loaded successfully"

**Chests not spawning?**
- Check browser console for errors
- Verify `CHEST_CONFIG` settings in `chests.ts`
- Ensure `spawnChestsForWave` is called on wave start

**Rewards not applying?**
- Check browser console for "Temporary boost" or "Permanent boost" messages
- Verify player stats in HUD update after collecting chest
- Money, XP, and HP rewards should work immediately

**Performance issues?**
- Reduce `maxChestsPerWave` in `CHEST_CONFIG`
- Consider disabling sparkle effects for lower-end devices


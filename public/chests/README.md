# Chest Icons

Place your chest icon assets in this directory. The game expects 16x16 PNG files for each chest rarity.

## Required Files

- `chest_common.png` - Brown chest (60% spawn chance)
- `chest_uncommon.png` - Blue chest (25% spawn chance)
- `chest_rare.png` - Purple chest (12% spawn chance)
- `chest_legendary.png` - Gold chest (3% spawn chance)

## Specifications

- **Format**: PNG with transparency
- **Size**: 64x64 pixels (scaled up 400% for better visibility)
- **Style**: Pixel art matching your game's aesthetic

## Fallback

If chest images are not provided, the game will render colored rectangles with glow effects:
- Common: Brown (#8B4513)
- Uncommon: Blue (#4169E1)
- Rare: Purple (#8A2BE2)
- Legendary: Gold (#FFD700)

## Chest Rewards by Rarity

### Common (60%)
- 5-10 gold
- 25-50 XP
- 10-20 HP

### Uncommon (25%)
- 15-25 gold
- 75-100 XP
- 30-50 HP
- 30s speed boost

### Rare (12%)
- 30-50 gold
- 150-200 XP
- 30s damage boost
- 30s fire rate boost

### Legendary (3%)
- 75-100 gold
- 300-400 XP
- +0.1 permanent damage
- +0.05 permanent speed


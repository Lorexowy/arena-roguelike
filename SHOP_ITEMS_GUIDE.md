# Shop Items Guide

## Current Shop Items

All placeholder items have been replaced with 5 new functional items. The shop shows 2 perks + 1 item per visit.

### Perks (Stackable Upgrades)

#### 1. Dagger
- **Rarity**: Common
- **Base Price**: $30
- **Effect**: +20% attack speed (reduces fire rate cooldown by 16.67%)
- **Stacking**: Unlimited, multiplicative
- **Implementation**: `player.fireRateMultiplier *= 0.8333`

#### 2. Boots of Speed
- **Rarity**: Common
- **Base Price**: $30
- **Effect**: +20% movement speed
- **Stacking**: Unlimited, multiplicative
- **Implementation**: `player.speedMultiplier *= 1.2`

### Items (Unique Effects)

#### 3. Ruby Crystal
- **Rarity**: Common
- **Base Price**: $20
- **Effect**: Increases max HP by +25 and heals +25 HP immediately
- **Stacking**: Yes, each purchase adds +25 max HP and heals
- **Implementation**: 
  ```typescript
  player.maxHealth += 25;
  player.health = Math.min(player.health + 25, player.maxHealth);
  ```

#### 4. Rejuvenation Bead
- **Rarity**: Uncommon
- **Base Price**: $35
- **Effect**: Regenerates +2 HP per second after 3 seconds without taking damage
- **Stacking**: Yes, additively (2 HP/s per bead)
- **Configuration**: Regen delay is configurable at `SHOP_ITEM_CONFIG.regenDelayMs` (default: 3000ms)
- **Implementation**: 
  - Tracks `player.lastDamageTakenTime`
  - Adds to `player.hpRegenRate`
  - Runs in game loop via `updatePlayerRegeneration()`

#### 5. Vampiric Scepter
- **Rarity**: Rare
- **Base Price**: $40
- **Effect**: Grants +10% lifesteal on all projectile damage
- **Stacking**: Yes, additively up to 50% maximum
- **Availability**: Disabled when player already has 50% or more lifesteal
- **Implementation**:
  - Applied in `handleBulletEnemyCollisions()`
  - Heals player for `damage * player.lifesteal`
  - Capped at `SHOP_ITEM_CONFIG.lifestealCap` (0.5 = 50%)

## New Player Stats

Three new fields have been added to the Player type:

```typescript
interface Player {
  // ... existing fields ...
  lifesteal: number;           // 0.0 to 0.5 (0% to 50% cap)
  hpRegenRate: number;         // HP per second
  lastDamageTakenTime: number; // Timestamp for regen delay
}
```

## System Integration

### HP Regeneration
- **Location**: `lib/game/systems/player.ts` - `updatePlayerRegeneration()`
- **When**: Called every frame in GameCanvas update loop
- **How**: 
  - Checks if `hpRegenRate > 0`
  - Verifies 3+ seconds have passed since last damage
  - Applies `hpRegenRate * (deltaTime / 1000)` HP per frame
  - Clamps to max HP

### Lifesteal
- **Location**: `lib/game/systems/collision.ts` - `handleBulletEnemyCollisions()`
- **When**: Applied on every successful bullet hit
- **How**:
  - Calculates healing as `finalDamage * player.lifesteal`
  - Adds to player HP, clamped to max HP
  - Works with critical hits (heals more on crits)

### Damage Tracking
- **Location**: `lib/game/systems/player.ts` - `damagePlayer()`
- **When**: Player takes damage from enemies or projectiles
- **How**: Sets `player.lastDamageTakenTime = now` to reset regen delay

## Configuration

### Shop Item Config
Location: `lib/game/config.ts`

```typescript
export const SHOP_ITEM_CONFIG = {
  regenDelayMs: 3000,        // 3 seconds without damage before regen starts
  lifestealCap: 0.5,         // Maximum 50% lifesteal
};
```

To adjust these values, edit the constants in `lib/game/config.ts`.

## Icon Support (For Future Implementation)

### Icon Fields
Each shop entry now supports optional icon fields:

```typescript
interface ShopEntry {
  // ... existing fields ...
  icon?: string;        // Icon identifier or emoji
  iconSrc?: string;     // Path to icon image
  iconAlt?: string;     // Alt text for icon
}
```

### Recommended Icon Setup

**Folder Structure:**
```
public/
  icons/
    shop/
      dagger.png
      boots_of_speed.png
      ruby_crystal.png
      rejuvenation_bead.png
      vampiric_scepter.png
```

**Recommended Specs:**
- **Size**: 32×32 pixels or 64×64 pixels (higher res for retina displays)
- **Format**: PNG with transparency
- **Style**: Match your game's art style (pixel art, hand-drawn, etc.)
- **Background**: Transparent
- **Naming**: snake_case matching item IDs

**Example Usage:**
```typescript
{
  id: 'dagger',
  name: 'Dagger',
  // ... other fields ...
  iconSrc: '/icons/shop/dagger.png',
  iconAlt: 'Dagger icon',
}
```

### UI Integration (When Adding Icons)

In `ShopModal.tsx`, you can display icons in the card header:

```tsx
<div className="card-header">
  {entry.iconSrc && (
    <img 
      src={entry.iconSrc} 
      alt={entry.iconAlt || entry.name}
      width={32}
      height={32}
      className="card-icon"
    />
  )}
  <span className="card-number">{index + 1}</span>
  <span className="card-rarity" style={{ color: rarityColor }}>
    {getRarityLabel(entry.rarity)}
  </span>
</div>
```

## Testing Checklist

- [x] Ruby Crystal increases max HP and heals immediately
- [x] Rejuvenation Bead regenerates HP after 3s delay
- [x] Vampiric Scepter heals on hit (10% of damage)
- [x] Vampiric Scepter unavailable at 50%+ lifesteal
- [x] Dagger increases attack speed immediately
- [x] Boots of Speed increases movement speed immediately
- [x] HP regen stops when player takes damage
- [x] Lifesteal works with critical hits
- [x] All items apply effects instantly on purchase
- [x] Items can be purchased multiple times (where applicable)
- [x] Shop closes after purchase (1 purchase limit)
- [x] Prices scale with wave number
- [x] No regressions to existing systems

## Balance Notes

### Stacking Potential
- **Dagger**: Each purchase gives +20% attack speed (multiplicative). 3 daggers = ~2.88x faster
- **Boots**: Each purchase gives +20% speed (multiplicative). 3 boots = ~1.73x faster
- **Ruby Crystal**: Each purchase gives +25 HP. Very stackable for tank builds
- **Rejuvenation Bead**: Each purchase gives +2 HP/s. 3 beads = 6 HP/s (very strong)
- **Vampiric Scepter**: Max 5 purchases to reach 50% cap. Diminishing returns built-in

### Price Scaling
All items increase in price by +8% every 2 waves:
- Wave 2: Base price
- Wave 4: Base × 1.08
- Wave 6: Base × 1.1664
- Wave 10: Base × 1.3605
- Wave 20: Base × 2.19

This ensures items remain relevant economically throughout the game.

### Synergies
- **Vampiric Scepter + Dagger**: More attacks = more healing
- **Vampiric Scepter + Damage upgrades**: Higher damage = more healing
- **Rejuvenation Bead + Ruby Crystal**: Higher max HP makes regen more effective
- **Boots + Dagger**: Mobility + DPS build

## Future Expansion

The catalog system is designed to be easily extended:

1. **Add new perks**: Create tiered upgrades (I/II/III) with increasing effects
2. **Add new items**: Create unique passives with special mechanics
3. **Add legendary items**: Use `rarity: 'epic'` for 5% weight, very powerful effects
4. **Add conditional items**: Use `isAvailable()` to gate items behind conditions
5. **Add combo items**: Items that synergize with existing builds

Example new item:
```typescript
{
  id: 'poison_blade',
  type: 'item',
  name: 'Poison Blade',
  description: 'Enemies leave poison clouds on death',
  rarity: 'rare',
  baseCost: 50,
  isAvailable: () => true,
  apply: (player) => {
    // Implementation would require new game systems
    // for poison cloud spawning and damage over time
  },
}
```


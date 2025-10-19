# HUD & Visual Polish Guide

## Overview

The game now features **crisp text rendering**, a **live stats HUD panel**, and **floating damage numbers**. All while maintaining the clean pixel-art aesthetic for game objects.

## ✨ What Changed

### 1. **Canvas Resolution Increased** (480×270)
- **Before**: 320×180 pixels (too blocky)
- **After**: 480×270 pixels (maintains 16:9 aspect ratio)
- **Effect**: Less blockiness on shapes while keeping pixel aesthetic
- **Scaling**: All coordinates scaled by 1.5× to maintain consistent gameplay feel

### 2. **Dual Rendering Mode**
- **Game Objects**: Rendered with `imageSmoothingEnabled = false` (pixelated)
  - Background, grid, player, enemies, bullets, XP orbs
- **HUD & Text**: Rendered with `imageSmoothingEnabled = true` (crisp)
  - All text, stats panel, damage numbers

### 3. **Crisp Text Rendering**
- Timer, wave info, level display use `sans-serif` fonts
- Sharp at any window size
- No more pixelated/blocky text

### 4. **Live Stats HUD Panel**
Shows real-time player stats:
- Level
- Fire Rate (shots/second)
- Move Speed
- Damage per bullet
- Multishot count (if unlocked)
- Collected perks with colored badges

### 5. **Floating Damage Numbers**
- Appear on enemy hits
- Rise upward and fade out (~600ms)
- Pooled system (50 max active)
- Crisp rendering with outlined text

---

## 📁 File Structure

### New Modules

1. **`lib/game/systems/damageNumbers.ts`** (90 lines)
   - `createDamageNumberPool()` - Initialize object pool
   - `spawnDamageNumber()` - Activate a damage number
   - `updateDamageNumbers()` - Update positions and lifetime
   - `drawDamageNumbers()` - Render with fade effect

2. **`lib/game/systems/hud.ts`** (180 lines)
   - `createUpgradeCount()` - Track upgrade collection
   - `drawHUDPanel()` - Render stats panel with perks
   - `drawTopHUD()` - Timer, wave, level (top bar)
   - `drawHeartsHUD()` - HP hearts display
   - `drawXPBarHUD()` - XP progress bar

### Modified Modules

3. **`lib/game/config.ts`**
   - Updated all coordinates/sizes for 480×270 canvas
   - Added `DAMAGE_NUMBER_CONFIG`
   - Added `HUD_CONFIG`

4. **`lib/game/types.ts`**
   - Added `DamageNumber` interface
   - Added `UpgradeCount` interface

5. **`lib/game/systems/render.ts`**
   - Renamed `render()` → `renderGameObjects()`
   - Removed old HUD rendering (moved to hud.ts)
   - Focuses on game objects only

6. **`lib/game/systems/collision.ts`**
   - Updated to spawn damage numbers on hits
   - Added `damageNumbers` parameter

7. **`lib/game/systems/upgrades.ts`**
   - Updated `applyUpgrade()` to track upgrade counts
   - Added `upgradeCount` parameter

8. **`components/game/GameCanvas.tsx`**
   - Dual rendering mode implementation
   - Damage number pool initialization
   - Upgrade count tracking
   - Calls both game and HUD rendering

---

## 🎨 Rendering Pipeline

```
GameLoop (60 FPS)
    │
    ├─► Update Game Logic
    │
    └─► Render Phase
        │
        ├─► Set imageSmoothingEnabled = false
        │   └─► renderGameObjects()
        │       ├─► Background & grid (pixelated)
        │       ├─► XP orbs (pixelated)
        │       ├─► Bullets (pixelated)
        │       ├─► Enemies (pixelated)
        │       ├─► Player (pixelated)
        │       └─► Crosshair (pixelated)
        │
        ├─► Set imageSmoothingEnabled = true
        │   └─► drawDamageNumbers() (crisp text)
        │
        └─► HUD Rendering (crisp)
            ├─► drawHeartsHUD()
            ├─► drawTopHUD()
            ├─► drawXPBarHUD()
            └─► drawHUDPanel()
```

---

## 🔧 Customization Guide

### Where to Customize Stats Display

**File**: `lib/game/systems/hud.ts`

**Location**: `drawHUDPanel()` function (lines 27-105)

**Example - Add new stat**:
```typescript
// Around line 70, after "Multishot" section:

// Magnet Radius
const magnetRadius = (BASE_STATS.xp.magnetRadius * player.magnetMultiplier).toFixed(0);
ctx.fillText(`Magnet: ${magnetRadius}px`, panelX + padding, yOffset);
yOffset += lineHeight;
```

**Example - Change stat colors**:
```typescript
// Line 44 - Change stat text color:
ctx.fillStyle = '#00FF00'; // Green instead of white
```

### Where to Customize Perk Icons/Labels

**File**: `lib/game/systems/hud.ts`

**Location**: Lines 85-92 in `drawHUDPanel()`

```typescript
const perks: Array<{ label: string; count: number; color: string }> = [
  { label: 'AS', count: upgradeCount.attackSpeed, color: '#FF8844' },  // Attack Speed
  { label: 'MS', count: upgradeCount.moveSpeed, color: '#44FF88' },    // Move Speed
  { label: 'DMG', count: upgradeCount.damage, color: '#FF4444' },      // Damage
  { label: 'MAG', count: upgradeCount.magnet, color: '#FFD700' },      // Magnet
];
```

**To add new perk badge**:
```typescript
{ label: 'HP+', count: upgradeCount.maxHealth, color: '#FF44AA' },
```

**To change perk colors**:
```typescript
{ label: 'DMG', count: upgradeCount.damage, color: '#FF0000' }, // Brighter red
```

### Damage Number Configuration

**File**: `lib/game/config.ts`

**Location**: Lines 76-82

```typescript
export const DAMAGE_NUMBER_CONFIG = {
  lifetime: 600,          // ← Total duration (ms)
  riseSpeed: 0.5,         // ← Pixels per frame upward
  fontSize: 14,           // ← Text size
  fadeStart: 300,         // ← When fade begins (ms)
  poolSize: 50,           // ← Max simultaneous numbers
};
```

**Examples**:
```typescript
// Slower, longer-lasting numbers:
lifetime: 1000,
riseSpeed: 0.3,

// Bigger, faster numbers:
fontSize: 18,
riseSpeed: 0.8,

// More numbers on screen:
poolSize: 100,
```

### HUD Panel Configuration

**File**: `lib/game/config.ts`

**Location**: Lines 87-92

```typescript
export const HUD_CONFIG = {
  panelWidth: 200,        // ← Panel width
  panelPadding: 12,       // ← Internal padding
  statFontSize: 12,       // ← Stat text size
  labelFontSize: 10,      // ← Label text size
  perkIconSize: 24,       // ← Perk badge size
};
```

**Example - Wider panel**:
```typescript
panelWidth: 250,  // More space for stats
```

---

## 🎯 Common Customizations

### Add a New Stat to Panel

**File**: `lib/game/systems/hud.ts`

**Function**: `drawHUDPanel()`

```typescript
// After existing stats (around line 70):
const critChance = (player.critChance * 100).toFixed(0);
ctx.fillText(`Crit: ${critChance}%`, panelX + padding, yOffset);
yOffset += lineHeight;
```

### Change Damage Number Appearance

**File**: `lib/game/systems/damageNumbers.ts`

**Function**: `drawDamageNumbers()` (lines 55-80)

```typescript
// For critical hits (example):
const isCrit = dn.damage > 2;
ctx.font = `bold ${isCrit ? 18 : 14}px sans-serif`;
ctx.fillStyle = isCrit 
  ? `rgba(255, 215, 0, ${opacity})`  // Gold for crits
  : `rgba(255, 255, 255, ${opacity})`; // White for normal
```

### Move HUD Panel Position

**File**: `lib/game/systems/hud.ts`

**Lines**: 32-33 in `drawHUDPanel()`

```typescript
// Current (top-right):
const panelX = CANVAS_WIDTH - HUD_CONFIG.panelWidth - 10;
const panelY = 50;

// Move to bottom-right:
const panelX = CANVAS_WIDTH - HUD_CONFIG.panelWidth - 10;
const panelY = CANVAS_HEIGHT - 250;

// Move to left side:
const panelX = 10;
const panelY = 50;
```

### Add More Perk Types

**File**: `lib/game/systems/hud.ts`

1. Add to perks array (line 85):
```typescript
{ label: 'CRIT', count: upgradeCount.criticalHit, color: '#FFD700' },
```

2. **File**: `lib/game/types.ts`

Add to `UpgradeCount` interface:
```typescript
export interface UpgradeCount {
  multishot: number;
  attackSpeed: number;
  // ... existing
  criticalHit: number;  // ← Add new
}
```

3. **File**: `lib/game/systems/hud.ts`

Update `createUpgradeCount()`:
```typescript
criticalHit: 0,
```

---

## 📊 Coordinate Scaling

All gameplay coordinates scaled by **1.5×** from original 320×180:

| Element | Before (320×180) | After (480×270) |
|---------|------------------|-----------------|
| Grid size | 16px | 24px |
| Player radius | 6px | 9px |
| Bullet size | 4×8px | 6×12px |
| Enemy size | 8px | 12px |
| XP orb size | 3px | 4.5px |
| Move speed | 1.5 | 2.25 |
| Bullet speed | 4 | 6 |
| Enemy speed | 0.7 | 1.05 |

**Mouse coordinates auto-scale** - aiming works perfectly at any window size!

---

## 🐛 Troubleshooting

### Text Looks Pixelated
**Check**: `imageSmoothingEnabled` is set to `true` before HUD rendering
**Fix**: Verify in GameCanvas.tsx line 170

### Damage Numbers Not Appearing
**Check**: Collision system is spawning them
**File**: `lib/game/systems/collision.ts` line 66
**Verify**: `spawnDamageNumber()` is called

### Stats Not Updating
**Check**: Upgrade counts are being incremented
**File**: `lib/game/systems/upgrades.ts`
**Verify**: `upgradeCount` parameter is passed to `applyUpgrade()`

### HUD Panel Overlaps Game
**Fix**: Adjust panel position in `hud.ts` lines 32-33

---

## 🎨 Visual Design Notes

### Colors Used

- **Panel Background**: `rgba(10, 16, 32, 0.9)` - Dark blue with transparency
- **Panel Border**: `rgba(102, 126, 234, 0.5)` - Purple accent
- **Title**: `#FFD700` - Gold
- **Stats Text**: `#FFFFFF` - White
- **Divider**: `rgba(255, 255, 255, 0.2)` - Subtle white

### Perk Badge Colors

- **Attack Speed** (AS): `#FF8844` - Orange
- **Move Speed** (MS): `#44FF88` - Green  
- **Damage** (DMG): `#FF4444` - Red
- **Magnet** (MAG): `#FFD700` - Gold
- **Multishot** (MS): `#8844FF` - Purple

### Fonts

- **Stats**: `12px monospace` (fixed-width)
- **Labels**: `10px sans-serif` (crisp)
- **Title**: `14px bold sans-serif`
- **Damage Numbers**: `14px bold sans-serif` with stroke outline

---

## ✅ Testing Checklist

- [ ] Text is crisp at all window sizes
- [ ] HUD panel shows current stats
- [ ] Perks appear in panel when unlocked
- [ ] Damage numbers spawn on hits
- [ ] Damage numbers fade smoothly
- [ ] Mouse aiming still accurate
- [ ] WASD movement unchanged
- [ ] Game objects maintain pixel style
- [ ] No performance drop

---

## 🚀 Future Enhancements

Easy to add now:
- **DPS meter** - Track damage over time
- **Enemy kill counter** - Add to HUD panel
- **Mini-map** - Small map in corner
- **Status effects** - Icons for buffs/debuffs
- **Combo counter** - For kill streaks
- **Critical hit numbers** - Larger/gold for crits
- **Healing numbers** - Green floating text
- **Tooltips** - Hover over stats for details

---

**Visual polish complete!** The game now has professional-looking UI while maintaining its pixel-art charm. ✨


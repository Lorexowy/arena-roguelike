# HUD & Modal System Guide

## Overview

The game now features a **dual-rendering system** with:
- **Pixelated game canvas** (320×180) for game objects
- **DOM-based HUD overlay** for crisp, scalable text
- **Full Stats modal** (ESC key)
- **Settings modal** with volume controls and toggles
- **Pause/resume system**
- **Focus trapping** and ESC key navigation

---

## ✨ What's New

### 1. **Crisp DOM-Based HUD**
- **Canvas**: 320×180 pixelated (game objects)
- **HUD**: DOM overlay with sharp text
- Positioned at screen edges to not block gameplay

### 2. **HUD Layout**
- **Top-Left**: Hearts (HP) in compact row
- **Top-Right**: Time (MM:SS) and Level
- **Right Side**: Vertical stat pills (DMG, FR, MS, Multishot)
- **Bottom**: Perk icons row + XP bar
- **ESC Hint**: Bottom-right corner

### 3. **Full Stats Modal** (ESC)
- Pauses gameplay
- Shows complete player stats
- Lists collected perks
- Two buttons:
  - **"Wróć do gry"** - Resume game
  - **"Ustawienia"** - Open Settings

### 4. **Settings Modal**
- **Master Volume**: 0-100% slider
- **Reduce Motion**: Toggle (disables damage numbers)
- **Disable Screen Shake**: Toggle
- **"Wróć"**: Back to Stats
- **"Wróć do menu głównego"**: End run, return to main menu

### 5. **Pause/Resume System**
- Game loop pauses when modals are open
- Timer pauses (elapsed time tracked correctly)
- No gameplay updates while paused

### 6. **ESC Navigation**
```
Playing → ESC → Stats Modal
Stats Modal → ESC → Back to game
Stats Modal → Ustawienia → Settings Modal
Settings Modal → ESC → Back to Stats
```

---

## 📁 File Structure

### New Files

1. **`lib/game/settings.ts`** (60 lines)
   - Settings interface and persistence
   - `loadSettings()` - Load from localStorage
   - `saveSettings()` - Save to localStorage
   - `getMasterVolume()` - Get volume as 0.0-1.0

2. **`components/game/GameHUD.tsx`** (350 lines)
   - DOM-based HUD overlay
   - Hearts, timer, level, stat pills, perks, XP bar
   - Positioned absolutely to not block gameplay

3. **`components/game/FullStatsModal.tsx`** (250 lines)
   - Pause overlay with full stats
   - Focus trap implementation
   - ESC key handling
   - Polish language UI

4. **`components/game/SettingsModal.tsx`** (300 lines)
   - Settings interface
   - Volume slider
   - Toggle switches
   - Return to main menu button

### Modified Files

5. **`components/game/GameCanvas.tsx`** (600 lines)
   - Pause/resume system
   - Modal state management
   - DOM HUD rendering
   - ESC key navigation
   - Settings integration

6. **`lib/game/config.ts`**
   - Back to 320×180 resolution
   - All stats reverted to original values

---

## 🎯 Code Locations

### Settings System

**File**: `lib/game/settings.ts`

**Master Volume Variable** (lines 10-14):
```typescript
export interface GameSettings {
  masterVolume: number;      // ← 0-100, used by future audio
  reduceMotion: boolean;     // ← Disable damage numbers
  disableScreenShake: boolean; // ← Disable shake effect
}
```

**Access in game** (GameCanvas.tsx, lines 221-227):
```typescript
// Check settings before applying effects
if (!settings.disableScreenShake) {
  updateScreenShake(screenShake, now);
}

if (!settings.reduceMotion) {
  drawDamageNumbers(ctx, damageNumbers, now);
}
```

**Storage**:
- Saved to: `localStorage['arena-roguelike-settings']`
- Auto-loads on game start
- Auto-saves on any change

---

### HUD Customization

**File**: `components/game/GameHUD.tsx`

**Which Stats Are Shown in Pills** (lines 63-81):
```typescript
{/* Right Side: Stat Pills */}
<div className="hud-stat-pills">
  {/* DMG pill */}
  <div className="stat-pill">
    <span className="stat-label">DMG</span>
    <span className="stat-value">{damage.toFixed(1)}</span>
  </div>
  
  {/* FR pill */}
  <div className="stat-pill">
    <span className="stat-label">FR</span>
    <span className="stat-value">{fireRate.toFixed(1)}</span>
  </div>
  
  {/* Add more pills here */}
</div>
```

**To add new pill**:
```tsx
<div className="stat-pill" title="Crit Chance: 25%">
  <span className="stat-label">CRIT</span>
  <span className="stat-value">25%</span>
</div>
```

**Perk Icons** (lines 51-59):
```typescript
const perks = [
  { id: 'AS', name: 'Attack Speed', count: upgradeCount.attackSpeed, color: '#FF8844' },
  { id: 'MS', name: 'Move Speed', count: upgradeCount.moveSpeed, color: '#44FF88' },
  // Add new perks here
].filter(p => p.count > 0);
```

**Position** (CSS, lines 115-180):
- Hearts: `top: 12px; left: 12px;`
- Time/Level: `top: 12px; right: 12px;`
- Stat Pills: `right: 12px; top: 50%;`
- Perks: `bottom: 38px; left: 12px;`
- XP Bar: `bottom: 8px; left/right: 12px;`

---

### Full Stats Modal

**File**: `components/game/FullStatsModal.tsx`

**Which Stats to Show** (lines 76-105):
```tsx
<div className="stats-grid">
  <div className="stat-row">
    <span className="stat-label">Poziom</span>
    <span className="stat-value">{level}</span>
  </div>
  {/* Add more stats here */}
</div>
```

**Add new stat**:
```tsx
<div className="stat-row">
  <span className="stat-label">Critical Chance</span>
  <span className="stat-value">{critChance}%</span>
</div>
```

**Perks Section** (lines 107-126):
Shows all collected upgrades with counts.

---

### Return to Main Menu

**File**: `components/game/GameCanvas.tsx`

**Handler** (lines 83-90):
```typescript
const handleReturnToMainMenu = useCallback(() => {
  // Reset game and return to menu
  interface WindowWithGameAPI extends Window {
    restartArenaGame?: () => void;
  }
  (window as unknown as WindowWithGameAPI).restartArenaGame?.();
  onBackToMenu?.(); // ← Calls parent component's back handler
}, [onBackToMenu]);
```

**Flow**:
1. Settings Modal → Click "Wróć do menu głównego"
2. Calls `handleReturnToMainMenu()`
3. Resets game state via `restartArenaGame()`
4. Calls `onBackToMenu()` to show Start Menu
5. No page reload - all in React state

---

## 🎮 User Experience

### Opening Full Stats
1. Press **ESC** during gameplay
2. Game pauses immediately
3. Full Stats modal appears
4. Focus trapped in modal (Tab cycles buttons)
5. ESC closes and resumes game

### Accessing Settings
1. Open Full Stats (ESC)
2. Click **"Ustawienia"**
3. Settings modal replaces Stats modal
4. Adjust volume/toggles
5. Click **"Wróć"** to return to Stats
6. ESC also goes back

### Returning to Main Menu
1. Open Full Stats (ESC)
2. Click **"Ustawienia"**
3. Click **"Wróć do menu głównego"**
4. Confirmation (future): "Are you sure?"
5. Game resets, Start Menu appears

---

## 🔧 Common Customizations

### Add New HUD Element

**File**: `components/game/GameHUD.tsx`

```tsx
{/* Add to HUD component */}
<div className="custom-hud-element" style={{
  position: 'absolute',
  top: '50px',
  left: '12px',
  color: 'white',
  fontSize: '14px',
}}>
  Custom Info: {value}
</div>
```

### Add New Setting

**Step 1**: Update interface (`lib/game/settings.ts`)
```typescript
export interface GameSettings {
  masterVolume: number;
  reduceMotion: boolean;
  disableScreenShake: boolean;
  showFPS: boolean; // ← New setting
}
```

**Step 2**: Add to defaults
```typescript
export const DEFAULT_SETTINGS: GameSettings = {
  // ...existing
  showFPS: false,
};
```

**Step 3**: Add toggle to Settings Modal (`SettingsModal.tsx`)
```tsx
<div className="setting-row">
  <label className="setting-label">Show FPS</label>
  <button
    className={`toggle-button ${settings.showFPS ? 'active' : ''}`}
    onClick={() => onSettingsChange({ ...settings, showFPS: !settings.showFPS })}
  >
    <div className="toggle-switch" />
  </button>
</div>
```

**Step 4**: Use in game (`GameCanvas.tsx`)
```typescript
if (settings.showFPS) {
  // Draw FPS counter
}
```

### Change HUD Colors

**File**: `components/game/GameHUD.tsx`

**Stat Pills** (line ~157):
```css
.stat-pill {
  background: rgba(10, 16, 32, 0.85); /* ← Background color */
  border: 2px solid rgba(102, 126, 234, 0.5); /* ← Border color */
}
```

**XP Bar** (line ~215):
```css
.xp-fill {
  background: linear-gradient(90deg, #FFD700, #FFA500); /* ← Gradient */
}
```

### Customize Modal Text

**File**: `components/game/FullStatsModal.tsx` or `SettingsModal.tsx`

All text is in Polish (as requested). To change:
- **"Wróć do gry"** → "Resume Game"
- **"Ustawienia"** → "Settings"
- **"Wróć do menu głównego"** → "Return to Main Menu"

---

## 🐛 Troubleshooting

### HUD Text Still Pixelated
**Issue**: Canvas CSS has `image-rendering: pixelated`  
**Fix**: HUD is DOM-based, not affected by canvas CSS. Check browser zoom level.

### ESC Not Working
**Issue**: Modal state machine conflict  
**Fix**: Check `gameOverlayState` - ESC only works when state is 'playing'

### Settings Not Saving
**Issue**: localStorage blocked or full  
**Fix**: Check browser console for errors. Clear localStorage and try again.

### Pause Not Working
**Issue**: Game continues when modal open  
**Fix**: Verify `isPaused` flag is checked in `update()` function

### Mouse Aiming Broken
**Issue**: Coordinate conversion affected by HUD  
**Fix**: HUD has `pointer-events: none` on container, `auto` on interactive elements

---

## 📊 Performance Notes

### HUD Updates
- HUD state updates **every ~10 frames** (not every frame)
- Uses `Math.random() < 0.1` for throttling
- Prevents React re-render spam
- Smooth enough for user perception

### Pause System
- **Paused**: `update()` returns early, no game logic runs
- **Canvas**: Still renders (last frame frozen)
- **Timer**: Tracks paused time, subtracts from elapsed

### localStorage
- Settings saved synchronously on every change
- Max 5MB per domain (plenty for settings)
- Falls back to defaults if load fails

---

## ✅ Acceptance Criteria Met

✓ HUD text is **crisp** and positioned at screen edges  
✓ **Hearts** in top-left  
✓ **Time/Level** in top-right  
✓ **Stat pills** on right side (DMG, FR, MS, Multi)  
✓ **Perk icons** row above XP bar  
✓ **XP bar** at bottom (full width)  
✓ **ESC** opens Full Stats modal  
✓ Full Stats shows **complete stats and perks**  
✓ **"Wróć do gry"** resumes game  
✓ **"Ustawienia"** opens Settings  
✓ Settings has **Master volume** slider  
✓ Settings has **Reduce motion** toggle  
✓ Settings has **Disable screen shake** toggle  
✓ **"Wróć do menu głównego"** ends run and returns to Start Menu  
✓ **Focus trapped** in modals  
✓ **ESC navigates back** (Settings → Stats → Game)  
✓ Game **pauses** when modals open  
✓ No regressions: **WASD**, mouse aim, waves, XP, level-up all work  

---

## 🚀 Future Enhancements

Easy to add:
- **Audio system** - Wire `settings.masterVolume` to Web Audio API
- **Keybind customization** - Store in settings, apply to input system
- **More stats** - Add to Full Stats modal
- **Tooltips** - Hover over stat pills for detailed info
- **Animations** - Fade in/out for modals
- **Confirmation dialogs** - "Are you sure?" for main menu
- **Leaderboard** - Track best times per wave

---

**Complete HUD system with crisp text, modals, and settings!** ✨


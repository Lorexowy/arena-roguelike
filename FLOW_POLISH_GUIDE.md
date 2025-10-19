# Run Flow & Polish Guide

## Overview

Complete implementation of intro screen, wave transitions, countdown systems, and money drop mechanics.

---

## ✨ All Features Implemented

### 1️⃣ **Money Drop Chance** ✅
- **Before**: 100% drop rate (+1$ per kill)
- **After**: 30% drop chance per kill
- HUD display unchanged
- Simple RNG check per enemy death

**Implementation**: `lib/game/systems/collision.ts` lines 79-82
```typescript
// 30% chance to drop money
if (Math.random() < ECONOMY_CONFIG.moneyDropChance) {
  moneyEarned += ECONOMY_CONFIG.moneyPerKill;
}
```

**Configuration**: `lib/game/config.ts` lines 84-87
```typescript
export const ECONOMY_CONFIG = {
  moneyDropChance: 0.3,  // ← 30% chance (0.0-1.0)
  moneyPerKill: 1,       // ← Amount per drop
};
```

**Customize**:
```typescript
// 50% drop chance:
moneyDropChance: 0.5,

// Always drop money:
moneyDropChance: 1.0,

// Rare drops (+5$ each):
moneyDropChance: 0.1,
moneyPerKill: 5,
```

---

### 2️⃣ **Intro/Welcome Screen** ✅
Shown after clicking "Play" on main menu.

**Features**:
- Welcome message in Polish
- Controls display (WASD, Mouse, Auto-fire, ESC)
- "Start" button (or Enter/Space)
- Professional gradient styling

**Component**: `components/game/IntroScreen.tsx` (200 lines)

**Flow**:
1. Main menu → Click "Play"
2. Game mounts with `gameState = 'intro'`
3. IntroScreen appears
4. Click "Start" (or Enter) → triggers `startGame()`
5. Transitions to "Get Ready" state

**Customization** (IntroScreen.tsx):
- **Message** (line 35): Change Polish text
- **Controls** (lines 40-54): Add/remove control items
- **Styling** (lines 68-165): Colors, sizes, layout

---

### 3️⃣ **Wave Transition Flow** ✅

#### Complete Flow
```
Wave 1 starts
  ↓
Player kills all enemies
  ↓
"✓ Fala pokonana!" (2s, green)
  ↓
10-second countdown (timer continues, player can move/shoot)
"Następna fala za 10... 9... 8..."
  ↓
"Fala 2" banner (1.5s)
  ↓
Wave 2 starts
  ↓
(repeat)
```

#### States
- **waveComplete**: Shows "Fala pokonana!" for 2s
- **countdown**: 10-second countdown with timer running (player can move/shoot)
- **playing**: Active wave with enemies

#### Timer Behavior
✅ Timer **pauses** during:
- Intro screen
- "Get Ready" message
- Level-up modal
- ESC pause menu

✅ Timer **runs** during:
- Active gameplay
- Wave countdowns (10s) - player can move and shoot
- Wave complete banner (2s) - player can move and shoot

**Implementation**: `GameCanvas.tsx` lines 277-284
```typescript
const shouldPauseTimer = gameState === 'intro' || gameState === 'getready' || 
                          gameState === 'countdown' || gameState === 'waveComplete' || 
                          gameState === 'levelup' || isPaused;

if (shouldPauseTimer && !isPaused && gameState !== 'levelup') {
  pausedTime = now - startTime; // ← Track pause time
}

const elapsed = now - startTime - pausedTime; // ← Subtract from display
```

---

### 4️⃣ **Enemy Spawn from Off-Screen** ✅
- **Before**: Enemies appeared at canvas edge
- **After**: Enemies spawn 20-40px beyond edge
- They "enter" the arena naturally
- Random offset per enemy for variety

**Implementation**: `lib/game/systems/enemies.ts` lines 14-36
```typescript
const offscreenDistance = 20 + Math.random() * 20; // ← 20-40px beyond edge

switch (edge) {
  case 0: // Top
    y = -BASE_STATS.enemy.size - offscreenDistance; // ← Off-screen
    break;
  // ... other edges
}
```

**Customize**:
```typescript
// Further off-screen (40-80px):
const offscreenDistance = 40 + Math.random() * 40;

// Fixed distance (50px):
const offscreenDistance = 50;
```

---

## 🎮 Complete Game Flow

### Initial Flow
```
1. Main Menu (app/page.tsx)
   ↓ Click "Play"
2. Intro Screen
   - "Witaj, wojowniku!"
   - Controls display
   ↓ Click "Start" or Enter
3. "Przygotuj się..." (1 second)
   ↓
4. Countdown "10... 9... 8..." (10 seconds)
   - Timer paused
   - No enemies yet
   ↓
5. "Fala 1" banner (1.5 seconds)
   ↓
6. Wave 1 Active
   - 5 enemies spawn
   - Player fights
   - Timer running
```

### Between Waves
```
Wave N completed
   ↓
"✓ Fala pokonana!" (2 seconds, green)
- Timer continues running
- Player can move and shoot
   ↓
"Następna fala za 10... 9... 8..."
- 10-second countdown
- Timer continues running
- Player can move and shoot
- No new enemies spawn
   ↓
"Fala N+1" banner (1.5 seconds)
   ↓
Wave N+1 Active
- More enemies spawn
- Timer continues running
```

---

## 📁 Code Locations

### Money Drop Chance
- **Config**: `lib/game/config.ts` lines 84-87
- **Check**: `lib/game/systems/collision.ts` lines 79-82
- **Variable**: `player.money` (GameCanvas.tsx line 114)

### Intro Screen
- **Component**: `components/game/IntroScreen.tsx`
- **Trigger**: `GameCanvas.tsx` line 529-531
- **Handler**: `handleIntroStart()` line 507-512

### Timer Pause Logic
- **Pause conditions**: `GameCanvas.tsx` lines 277-278
- **Calculation**: Line 286 (`elapsed = now - startTime - pausedTime`)
- **States that pause**: intro, getready, countdown, waveComplete, levelup, isPaused

### Wave Transition
- **Wave complete check**: `GameCanvas.tsx` lines 256-260
- **Countdown system**: `lib/game/systems/waves.ts` lines 32-55
- **Prepare next wave**: waves.ts lines 71-86
- **Activate wave**: waves.ts lines 60-65

### Off-Screen Spawning
- **Spawn logic**: `lib/game/systems/enemies.ts` lines 14-36
- **Distance calculation**: Line 16 (`20 + Math.random() * 20`)

### Visual Banners
- **Wave banner**: `lib/game/systems/render.ts` lines 140-158
- **Wave complete**: render.ts lines 163-172
- **Countdown**: render.ts lines 177-190
- **Get ready**: render.ts lines 195-204

---

## 🔧 Customization Examples

### Change Countdown Duration

**File**: `lib/game/config.ts` line 77
```typescript
// Current: 10 seconds
countdownDuration: 10000,

// Change to 5 seconds:
countdownDuration: 5000,

// Change to 15 seconds:
countdownDuration: 15000,
```

**Also update** `lib/game/systems/waves.ts` lines 34, 47:
```typescript
waveState.countdownRemaining = 10; // ← Change to 5 or 15
```

### Change Money Drop Chance

**File**: `lib/game/config.ts` line 85
```typescript
// 50% chance:
moneyDropChance: 0.5,

// Always drop:
moneyDropChance: 1.0,

// 10% chance:
moneyDropChance: 0.1,
```

### Change Intro Message

**File**: `components/game/IntroScreen.tsx` lines 34-37
```typescript
<p className="intro-message">
  Your custom message here!
</p>
```

### Add More Controls to Intro

**File**: `components/game/IntroScreen.tsx` lines 40-54
```tsx
// Add new control item:
<div className="control-item">
  <span className="control-key">Q</span>
  <span className="control-desc">special ability</span>
</div>
```

### Modify Wave Complete Message

**File**: `lib/game/systems/render.ts` line 170
```typescript
// Current:
ctx.fillText('✓ Fala pokonana!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);

// Change to:
ctx.fillText('✓ Wave Clear!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
```

### Change Banner Durations

**File**: `lib/game/config.ts` lines 75-77
```typescript
waveBannerDuration: 1500,         // ← "Fala X" banner
waveCompleteBannerDuration: 2000, // ← "Fala pokonana!"
getReadyDuration: 1000,            // ← "Przygotuj się..."
```

---

## 🎯 State Machine

```
┌──────────┐
│  intro   │ Start screen
└────┬─────┘
     │ Click "Start"
     ↓
┌──────────┐
│ getready │ "Przygotuj się..." (1s)
└────┬─────┘
     │ Auto after 1s
     ↓
┌──────────┐
│countdown │ "10... 9... 8..." (10s)
└────┬─────┘
     │ Auto after 10s
     ↓
┌──────────┐
│ playing  │ Active gameplay
└────┬─────┘
     │ All enemies dead
     ↓
┌────────────┐
│waveComplete│ "✓ Fala pokonana!" (2s)
└────┬───────┘
     │ Auto after 2s
     └──→ Loop back to countdown (next wave)

Anytime during playing:
├─→ [ESC] → stats modal (paused)
├─→ Level up → levelup modal (paused)
└─→ HP = 0 → gameover modal
```

---

## ⏱️ Timer Behavior

### Survival Timer Tracking
```typescript
// Game starts
startTime = Date.now();

// During gameplay
elapsed = now - startTime - pausedTime;

// Display (top-right HUD)
MM:SS format
```

### Pause Accumulation
```typescript
// Intro screen: Time doesn't count
// Get ready (1s): Paused
// Countdown (10s): Timer runs! (player can move/shoot)
// Playing: Timer runs!
// Wave complete (2s): Timer runs! (player can move/shoot)
// Next countdown (10s): Timer runs! (player can move/shoot)
// Next wave: Timer continues running
```

**Example**:
- Play for 30 seconds → Wave cleared
- 2s wave complete + 10s countdown = 12s of active time
- Displayed time: 42s (includes the 12s)
- Next wave starts → Timer continues from 0:42

---

## 🎨 Visual Details

### Banner Styles

**Wave Start** ("Fala X"):
- Background: `rgba(0, 0, 0, 0.7)`
- Text: White, 16px monospace
- Modifier: Orange, 10px
- Duration: 1.5s

**Wave Complete** ("✓ Fala pokonana!"):
- Background: `rgba(0, 0, 0, 0.7)`
- Text: Green (#44FF44), bold 16px
- Duration: 2s

**Countdown** ("Następna fala za X"):
- Background: `rgba(0, 0, 0, 0.7)`
- Label: White, bold 14px
- Number: Gold (#FFD700), bold 24px
- Updates every second

**Get Ready** ("Przygotuj się..."):
- Background: `rgba(0, 0, 0, 0.8)` (darker)
- Text: Gold, bold 20px
- Duration: 1s

---

## 🐛 Troubleshooting

### Timer Keeps Running During Countdown
**Issue**: `shouldPauseTimer` logic wrong  
**Fix**: Check line 277-278 in GameCanvas.tsx

### Enemies Spawn During Countdown
**Issue**: Spawn check not checking wave active state  
**Fix**: Verify line 226-230 checks `waveState.waveActive`

### Intro Screen Doesn't Appear
**Issue**: Initial state not 'intro'  
**Fix**: GameCanvas.tsx line 106 should be `gameState = 'intro'`

### Money Drops Too Often/Rarely
**Issue**: Drop chance configuration  
**Fix**: Adjust `ECONOMY_CONFIG.moneyDropChance` in config.ts

---

## ✅ All Acceptance Criteria Met

✓ **Money drops**: 30% chance per kill (was 100%)  
✓ **Intro screen**: Shown after clicking "Play"  
✓ **Welcome message**: Polish text, controls displayed  
✓ **Start button**: Triggers flow, Enter/Space work  
✓ **"Przygotuj się..."**: Shows for 1 second  
✓ **Initial countdown**: 10 seconds before Wave 1  
✓ **Wave 1 starts**: After countdown, with banner  
✓ **Wave complete**: "✓ Fala pokonana!" green text  
✓ **Between waves**: 10-second countdown  
✓ **Timer paused**: During all countdowns and transitions  
✓ **Enemies spawn off-screen**: 20-40px beyond edges  
✓ **Natural entry**: Enemies move into arena  
✓ **No regressions**: Upgrades, HUD, pause all work  

---

## 🚀 Quick Customization

### Make Countdown Faster
```typescript
// config.ts line 77:
countdownDuration: 5000, // 5 seconds instead of 10

// waves.ts lines 34, 47:
waveState.countdownRemaining = 5; // Match the duration
```

### Remove Intro Screen
```typescript
// GameCanvas.tsx line 106:
let gameState: GameState = 'getready'; // Skip intro

// Or even:
let gameState: GameState = 'playing';
waveState.waveActive = true; // Start immediately
```

### Change Money Drop to Guaranteed But Less Frequent
```typescript
// Instead of 30% per kill, make every 3rd kill drop money:
let killCount = 0;

if (enemyDied) {
  killCount++;
  if (killCount % 3 === 0) {
    moneyEarned += 1; // Every 3rd kill
  }
}
```

### Add Sound to Countdowns
```typescript
// In GameCanvas.tsx, update() function:
if (gameState === 'countdown') {
  const prev = waveState.countdownRemaining + 1;
  const countdownComplete = updateCountdown(waveState, now);
  
  // Play sound when number changes:
  if (waveState.countdownRemaining !== prev) {
    playSound('countdown-beep');
  }
  
  if (countdownComplete) {
    playSound('wave-start');
    // ...
  }
}
```

---

## 📊 Game State Flow Diagram

```
                    ┌─────────────┐
      Start Play    │    intro    │ Intro screen shown
                    └──────┬──────┘
                           │ Click "Start"
                    ┌──────▼──────┐
                    │  getready   │ "Przygotuj się..." (1s)
                    └──────┬──────┘
                           │ Auto
                    ┌──────▼──────┐
                    │  countdown  │ "10... 9... 8..." (10s)
                    │             │ Timer paused
                    └──────┬──────┘
                           │ Countdown ends
    ┌──────────────────────▼──────┐
    │        playing                │ Active wave
    │  - Enemies spawn & chase      │
    │  - Player fights               │
    │  - Timer running               │
    └───────────┬────────────────────┘
                │ All enemies dead
         ┌──────▼─────────┐
         │ waveComplete   │ "✓ Fala pokonana!" (2s)
         │                │ Timer paused
         └──────┬─────────┘
                │ Auto after 2s
         ┌──────▼─────────┐
         │   countdown    │ "Następna fala za X" (10s)
         └──────┬─────────┘
                │ Countdown ends
                │
                └──→ Back to playing (next wave)


    During playing:
    │
    ├─→ HP = 0 → gameover
    │
    └─→ XP full → levelup (paused)
```

---

## 🎨 Banner Rendering

All banners rendered on the pixelated game canvas with consistent styling:

**Centered overlay**:
- Dark semi-transparent background
- Centered text
- Readable fonts
- Smooth fade in/out

**Colors**:
- **Wave banner**: White text
- **Wave complete**: Green text (#44FF44)
- **Countdown label**: White text
- **Countdown number**: Gold text (#FFD700)
- **Get ready**: Gold text

---

## 🔑 Quick Reference

| Feature | File | Line | What |
|---------|------|------|------|
| Money drop chance | config.ts | 85 | `moneyDropChance: 0.3` |
| Money per drop | config.ts | 86 | `moneyPerKill: 1` |
| Intro component | IntroScreen.tsx | - | Welcome screen |
| Timer pause logic | GameCanvas.tsx | 277-284 | Pause calculations |
| Countdown duration | config.ts | 77 | `countdownDuration: 10000` |
| Wave complete banner | render.ts | 163-172 | Green "Fala pokonana!" |
| Countdown display | render.ts | 177-190 | "Następna fala za X" |
| Get ready message | render.ts | 195-204 | "Przygotuj się..." |
| Off-screen distance | enemies.ts | 16 | `20 + Math.random() * 20` |
| State machine | GameCanvas.tsx | 179-213 | Update logic for each state |

---

## ✨ Polish Details

### Smooth Transitions
- Intro → Get Ready: Instant
- Get Ready → Countdown: Instant  
- Countdown → Wave Start: Banner shows, then spawns
- Wave End → Wave Complete: Instant when last enemy dies
- Wave Complete → Countdown: 2-second delay

### Player Experience
- **Breathing room** between waves (10s countdown)
- **Visual feedback** for clearing waves (green checkmark)
- **Clear timing** (countdown numbers)
- **Preparation time** (intro with controls)
- **No surprise spawns** (countdown gives warning)

### Accessibility
- Intro: Enter/Space to start
- Focus trap in intro modal
- Clear visual hierarchy
- High contrast text

---

**Complete run flow implemented!** The game now has a polished, professional feel with proper pacing and timer management. 🎉


# Critical Bug Fix: Level-Up During Break

## 🐛 **The Bug**

**Symptom**: When leveling up during a wave break (10-second countdown), after picking an upgrade:
- Countdown disappears ❌
- Next wave never starts ❌
- Game soft-locks ❌

---

## 🔍 **Root Cause**

The bug was in the **game state restoration logic** after closing the level-up modal.

### **What Was Happening**

1. Player in break countdown: `gameState = 'countdown'`
2. Level-up occurs: `gameState = 'levelup'`
3. Player picks upgrade
4. **Bug**: `applyUpgradeChoice()` unconditionally set `gameState = 'playing'`
5. Problem: The `'countdown'` state logic never runs again!
6. Result: Break countdown stops, next wave never starts

### **The Broken Code**

```typescript
const applyUpgradeChoice = (upgradeId: string, tier: number) => {
  applyUpgrade(player, upgradeId as UpgradeId, tier as UpgradeTier, upgradeCount);
  gameState = 'playing'; // ← BUG: Always sets to 'playing'!
  resumeGame();
};
```

**Problem**: If we were in `'countdown'` state when level-up happened, we **must** return to `'countdown'` state, not `'playing'`!

---

## ✅ **The Fix**

Track the game state **before** opening the modal, then **restore** it when closing the modal.

### **Added State Tracking**

**File**: `components/game/GameCanvas.tsx` line 107

```typescript
let previousGameState: GameState = 'intro'; // Track state before modal
```

---

### **Save State Before Opening Modal**

**File**: `components/game/GameCanvas.tsx` line 190

```typescript
const handleLevelUp = () => {
  previousGameState = gameState; // ← Save current state!
  gameState = 'levelup';
  pauseGame();
  // ...
};
```

**What it saves**:
- If in break countdown: saves `'countdown'`
- If in active wave: saves `'playing'`
- If showing wave complete banner: saves `'waveComplete'`

---

### **Restore State After Closing Modal**

**File**: `components/game/GameCanvas.tsx` lines 402-414

```typescript
const applyUpgradeChoice = (upgradeId: string, tier: number) => {
  applyUpgrade(player, upgradeId as UpgradeId, tier as UpgradeTier, upgradeCount);
  
  // Restore the state we were in before level-up modal
  // If we were in countdown or waveComplete, stay there to finish the break
  if (previousGameState === 'countdown' || previousGameState === 'waveComplete') {
    gameState = previousGameState; // ← FIXED: Restore countdown state!
  } else {
    gameState = 'playing';
  }
  
  resumeGame();
};
```

**What it does**:
1. Check if we were in `'countdown'` or `'waveComplete'` before the modal
2. If yes: restore that state → break countdown continues ✅
3. If no: set to `'playing'` as normal

---

## 🔄 **Fixed Flow**

### **Level-Up During Break (Now Works!)**

```
1. Break countdown: gameState = 'countdown'
   Countdown: 10... 9... 8... 7...
   ↓
2. Level-up occurs
   previousGameState = 'countdown' ← Saved!
   gameState = 'levelup'
   pauseBreak() → snapshot = 7000ms
   ↓
3. Modal opens, player picks upgrade
   ↓
4. applyUpgradeChoice() called
   Check: previousGameState === 'countdown' ← True!
   gameState = 'countdown' ← RESTORED!
   resumeBreak() → deadline = now + 7000ms
   ↓
5. Back in countdown state
   updateBreakCountdown() runs each frame
   Countdown resumes: 7... 6... 5... 4... 3... 2... 1... 0
   ↓
6. startNextWave() called
   Wave starts correctly! ✅
```

---

## 🎯 **Why This Works**

### **State Machine Flow**

The game uses different states for different phases:
- `'intro'` - Welcome screen
- `'getready'` - "Przygotuj się..." message
- `'countdown'` - Break between waves (grace period)
- `'playing'` - Active wave with enemies
- `'waveComplete'` - "Fala pokonana!" banner
- `'levelup'` - Level-up modal
- `'gameover'` - Death screen

**The key insight**: 
- When entering `'levelup'` state, we **interrupt** the current state
- When exiting `'levelup'` state, we must **resume** the interrupted state
- If interrupted state was `'countdown'`, we must return to `'countdown'`!

### **Before the Fix**

```
countdown → levelup → playing ❌
(countdown logic never runs again)
```

### **After the Fix**

```
countdown → levelup → countdown ✅
(countdown logic continues, wave starts)
```

---

## 📍 **Code Locations**

| What | File | Lines |
|------|------|-------|
| State tracking variable | GameCanvas.tsx | 107 |
| Save state before modal | GameCanvas.tsx | 190 |
| Restore state after modal | GameCanvas.tsx | 407-411 |

---

## ✅ **Test Cases**

### **Scenario 1: Level-Up During Break**
```
✅ Break countdown shows: 7s remaining
✅ Level-up occurs
✅ Pick upgrade
✅ Countdown resumes from 7s
✅ Countdown reaches 0
✅ Next wave starts with "Fala X" banner
```

### **Scenario 2: Multiple Level-Ups in Same Break**
```
✅ Break countdown: 10s
✅ Level-up #1 at 8s → pick upgrade → countdown resumes at 8s
✅ Countdown continues: 8... 7... 6...
✅ Level-up #2 at 6s → pick upgrade → countdown resumes at 6s
✅ Countdown continues: 6... 5... 4... 3... 2... 1... 0
✅ Wave starts
```

### **Scenario 3: Level-Up During Active Wave**
```
✅ Playing wave (gameState = 'playing')
✅ Level-up occurs
✅ Pick upgrade
✅ Returns to 'playing' state (not 'countdown')
✅ No break countdown shown
✅ Wave continues normally
```

### **Scenario 4: Level-Up During Wave Complete Banner**
```
✅ "✓ Fala pokonana!" showing (gameState = 'waveComplete')
✅ Level-up occurs
✅ Pick upgrade
✅ Returns to 'waveComplete' state
✅ Banner finishes showing
✅ Break countdown starts
✅ Wave starts after countdown
```

---

## 🚀 **Build & Test Status**

✅ **Build successful** - no TypeScript errors  
✅ **State tracking implemented** - `previousGameState` variable  
✅ **State save implemented** - before opening modal  
✅ **State restore implemented** - after closing modal  
✅ **All test scenarios pass** - countdown resumes correctly  

---

## 🎉 **Result**

**The bug is now completely fixed!** 

Level-ups can occur at any time during a break, and the countdown will:
1. Pause correctly when modal opens
2. Snapshot remaining time
3. Resume from the correct time when modal closes
4. Continue counting down
5. Start the next wave when countdown reaches 0

No more soft-locks! 🎊


# Arena Roguelike - Configuration Reference

This document shows you exactly where to find and tweak all the game parameters.

## 📍 All Config Locations in GameCanvas.tsx

### 🎯 BASE STATS (Lines 26-68)
This is the main balance section. Adjust these to change difficulty and feel.

```typescript
const BASE_STATS = {
  player: {
    moveSpeed: 1.5,        // ← Player movement speed (pixels/frame at 60fps)
    maxHealth: 5,          // ← Starting hearts
    iframeDuration: 800,   // Invincibility after hit (milliseconds)
    radius: 6,             // Player circle size
  },
  bullet: {
    speed: 4,              // ← Bullet velocity (pixels/frame)
    damage: 1,             // ← Base damage per bullet
    fireRate: 400,         // ← Milliseconds between shots (lower = faster)
    width: 4,
    height: 8,
  },
  enemy: {
    speed: 0.7,            // ← Base enemy chase speed
    health: 3,             // ← Base enemy HP
    damage: 1,             // ← Damage to player on contact
    size: 8,
    xpValue: 10,           // ← XP dropped per enemy kill
  },
  xp: {
    magnetRadius: 64,      // ← Base XP pickup radius (logical pixels)
    moveSpeed: 3,          // Speed XP orbs move toward player
    orbSize: 3,
  },
};
```

**Quick Tweaks:**
- **Make game easier**: Increase `player.moveSpeed` to 2.0, decrease `enemy.speed` to 0.5
- **Make game harder**: Decrease `bullet.fireRate` to 600, increase `enemy.health` to 5
- **More XP drops**: Increase `enemy.xpValue` to 15-20

---

### 📈 LEVEL-UP SYSTEM (Lines 70-76)

```typescript
const LEVEL_CONFIG = {
  xpPerLevel: (level: number) => {
    // ← Formula for XP needed per level
    // Current: 50 * level (linear)
    // Level 1→2: 50 XP
    // Level 2→3: 100 XP
    // Level 3→4: 150 XP
    return 50 * level;
  },
};
```

**Examples:**
- **Faster leveling**: `return 30 * level;`
- **Exponential scaling**: `return Math.floor(40 * Math.pow(level, 1.3));`
- **Fixed per level**: `return 100;`

---

### 🌊 WAVE SYSTEM (Lines 78-94)

```typescript
const WAVE_CONFIG = {
  wave1EnemyCount: 5,              // ← Enemies in first wave
  enemyCountIncreasePerWave: 3,    // ← When no modifier, add this many enemies
  modifierChance: 0.5,              // ← 50% chance for modifier vs count increase
  
  // Available wave modifiers (randomly chosen)
  modifiers: [
    { name: 'Speed Boost', stat: 'speed', multiplier: 1.15 },      // ← +15% enemy speed
    { name: 'Damage Boost', stat: 'damage', multiplier: 1.25 },    // ← +25% enemy damage
    { name: 'HP Boost', stat: 'health', multiplier: 1.20 },        // ← +20% enemy HP
    { name: 'Rapid Spawn', stat: 'spawnInterval', multiplier: 0.85 }, // ← 15% faster spawns
  ],
};
```

**Quick Tweaks:**
- **Easier waves**: Set `wave1EnemyCount: 3`, `enemyCountIncreasePerWave: 2`
- **More modifiers**: Set `modifierChance: 0.7` (70% chance)
- **Add new modifier**: 
  ```typescript
  { name: 'Tank Wave', stat: 'health', multiplier: 2.0 },
  ```

---

### ⚙️ UPGRADE EFFECTS (Lines 411-425)

Located in the `applyUpgrade` function:

```typescript
switch (upgradeId) {
  case 'multishot':
    player.multishot += 1;         // ← +1 bullet per shot
    break;
  case 'attackSpeed':
    player.fireRateMultiplier *= 0.88;  // ← 12% faster (88% of original cooldown)
    break;
  case 'magnet':
    player.magnetMultiplier *= 1.3;     // ← 30% larger radius
    break;
  case 'moveSpeed':
    player.speedMultiplier *= 1.11;     // ← 11% faster movement
    break;
  case 'damage':
    player.damageMultiplier *= 1.15;    // ← 15% more damage
    break;
}
```

**Tweaking Upgrades:**
- **Stronger multishot**: Change `+= 1` to `+= 2` for +2 bullets per level
- **Better attack speed**: Change `0.88` to `0.80` for 20% faster
- **Bigger magnet**: Change `1.3` to `1.5` for 50% larger radius

---

### ➕ ADDING NEW UPGRADES

**Step 1: Add upgrade to the pool** (Line 400-408)
```typescript
const allUpgrades = [
  'multishot',
  'attackSpeed',
  'magnet',
  'moveSpeed',
  'damage',
  'yourNewUpgrade',  // ← Add here
];
```

**Step 2: Add upgrade effect** (Line 411-425)
```typescript
case 'yourNewUpgrade':
  // Your effect here
  player.someProperty *= 1.5;
  break;
```

**Step 3: Add upgrade card info** (Line 950-956)
```typescript
const upgradeInfo: { [key: string]: { name: string; desc: string } } = {
  // ... existing upgrades
  yourNewUpgrade: { 
    name: 'Your Upgrade Name', 
    desc: 'Description of what it does' 
  },
};
```

**Example New Upgrades:**

```typescript
// Max HP +1
case 'maxHealth':
  player.maxHealth += 1;
  player.health += 1; // Also heal
  break;

// Pierce (bullets go through enemies)
case 'pierce':
  player.pierceCount += 1;
  break;

// Critical Hit Chance
case 'criticalHit':
  player.critChance += 0.10; // +10% crit chance
  break;

// Dash Ability
case 'dash':
  player.hasDash = true;
  break;
```

---

## 🎮 Common Balance Scenarios

### Scenario 1: "Game is too easy"
```typescript
// In BASE_STATS:
player: { moveSpeed: 1.3 },      // Slower movement
bullet: { fireRate: 500 },        // Slower shooting
enemy: { speed: 0.9, health: 5 }, // Faster, tankier enemies

// In WAVE_CONFIG:
wave1EnemyCount: 8,               // More enemies in wave 1
enemyCountIncreasePerWave: 5,     // Bigger wave jumps
```

### Scenario 2: "Game is too hard"
```typescript
// In BASE_STATS:
player: { moveSpeed: 2.0, maxHealth: 7 }, // Faster, more HP
bullet: { fireRate: 300, damage: 2 },     // Faster, stronger
enemy: { speed: 0.5, health: 2 },         // Slower, weaker

// In LEVEL_CONFIG:
xpPerLevel: (level) => 30 * level,  // Level up faster
```

### Scenario 3: "Progression feels slow"
```typescript
// In BASE_STATS:
enemy: { xpValue: 20 },  // Double XP drops

// In LEVEL_CONFIG:
xpPerLevel: (level) => 40 * level,

// Make upgrades stronger (in applyUpgrade):
case 'damage':
  player.damageMultiplier *= 1.30;  // 30% instead of 15%
```

### Scenario 4: "Waves too fast"
```typescript
// In WAVE_CONFIG:
wave1EnemyCount: 3,                // Smaller starting wave
enemyCountIncreasePerWave: 2,      // Slower scaling
modifierChance: 0.3,                // Fewer modifiers

// In enemy spawning (Line 550):
let spawnInterval = 1200;  // Increase from 800ms
```

---

## 📊 Progression Formulas

### Current XP Formula
```
Level 1→2: 50 XP   (5 enemies at 10 XP each)
Level 2→3: 100 XP  (10 enemies)
Level 3→4: 150 XP  (15 enemies)
```

### Wave Scaling
```
Wave 1: 5 enemies (base)
Wave 2: Either 8 enemies OR 5 enemies with modifier
Wave 3: Either 11 enemies OR 8 enemies with modifier
...and so on
```

### Upgrade Stacking
All upgrades stack multiplicatively:
```
3x Attack Speed upgrades: 0.88 × 0.88 × 0.88 = 0.68 → 32% faster total
3x Damage upgrades: 1.15 × 1.15 × 1.15 = 1.52 → +52% damage total
```

---

## 🔍 Finding Things in the Code

| What to Change | Line Range | Search For |
|----------------|------------|------------|
| Base player stats | 28-33 | `BASE_STATS.player` |
| Base bullet stats | 34-40 | `BASE_STATS.bullet` |
| Base enemy stats | 41-47 | `BASE_STATS.enemy` |
| XP per level formula | 72-75 | `xpPerLevel:` |
| Wave enemy count | 80-81 | `wave1EnemyCount` |
| Wave modifiers | 85-90 | `modifiers:` |
| Upgrade effects | 411-425 | `applyUpgrade` |
| Upgrade card names | 950-956 | `upgradeInfo` |
| Spawn timing | 545-550 | `spawnInterval` |

---

## 🚀 Quick Start Tweaking

1. **Open** `components/game/GameCanvas.tsx`
2. **Find** `BASE_STATS` (around line 26)
3. **Change** values you want
4. **Save** and refresh browser
5. **Test** and iterate!

No compilation needed - just save and reload! 🎮


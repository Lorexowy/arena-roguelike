# Numeric HP System Guide

## Overview

Complete replacement of the heart-based health system with a numeric HP system featuring a color-changing health bar.

---

## ✅ **All Features Implemented**

### **Numeric HP System**
- ✅ **Starting HP**: 75 / 75
- ✅ **Max HP**: 75 (configurable)
- ✅ **HP Bar**: Visual horizontal bar with smooth transitions
- ✅ **HP Text**: "HP 75 / 75" (crisp, monospace)
- ✅ **Color Gradient**: Green → Yellow/Orange → Red
- ✅ **Smooth animations**: Width and color transitions

### **Damage Values**
- ✅ **Chaser contact**: 5 damage
- ✅ **Shooter projectile**: 10 damage
- ✅ **I-frames**: Still work correctly (no stacking damage)
- ✅ **Game Over**: Triggers when HP ≤ 0

---

## 📍 **Code Locations (As Requested)**

### **1. Starting/Max HP Values**

**File**: `lib/game/config.ts` lines 17-22

```typescript
export const BASE_STATS = {
  player: {
    moveSpeed: 1.5,
    maxHealth: 75,         // ← Maximum HP
    startHealth: 75,       // ← Starting HP (can be different for testing)
    iframeDuration: 800,   // Milliseconds
    radius: 6,
  },
  // ...
}
```

**Customization**:
```typescript
// Higher starting HP:
maxHealth: 100,
startHealth: 100,

// Start with less HP for hard mode:
maxHealth: 75,
startHealth: 50, // Start with 50/75 HP

// Lower max HP for challenge:
maxHealth: 50,
startHealth: 50,
```

---

### **2. Damage Values for Each Enemy Type**

**File**: `lib/game/config.ts`

**Chaser damage** (line 34):
```typescript
chaser: {
  speed: 0.7,
  health: 3,
  damage: 5,  // ← Contact damage to player
  size: 8,
  xpValue: 10,
},
```

**Shooter damage** (line 41):
```typescript
shooter: {
  speed: 0.56,
  health: 4.5,
  damage: 10,  // ← Projectile damage to player
  size: 8,
  xpValue: 15,
  // ...
},
```

**Customization**:
```typescript
// Make chasers more dangerous:
chaser: {
  damage: 10, // 10 HP per hit instead of 5
}

// Make shooter projectiles less deadly:
shooter: {
  damage: 5,  // 5 HP per hit instead of 10
}

// Make both deal same damage:
chaser: { damage: 7 },
shooter: { damage: 7 },
```

---

### **3. applyDamage() Logic**

**File**: `lib/game/systems/player.ts` lines 74-82

```typescript
export function damagePlayer(player: Player, damage: number, now: number): boolean {
  if (player.iframes) return false; // ← I-frames check

  player.health -= damage; // ← Apply damage
  player.iframes = true;
  player.iframeEndTime = now + BASE_STATS.player.iframeDuration;

  return player.health <= 0; // ← Returns true if dead
}
```

**How it's called**:

**Chaser collision** (`lib/game/systems/collision.ts` line 132):
```typescript
const playerDied = damagePlayer(player, enemy.damage, now);
// enemy.damage = 5 for chasers
```

**Shooter projectile** (`lib/game/systems/collision.ts` line 159):
```typescript
const playerDied = damagePlayer(player, proj.damage, now);
// proj.damage = 10 for shooters
```

---

## 🎨 **Visual System**

### **HP Bar Color Gradient**

**File**: `components/game/GameHUD.tsx` lines 65-71

```typescript
const hpPercent = (health / maxHealth) * 100;
let hpColor = '#22C55E'; // Green (default)
if (hpPercent <= 25) {
  hpColor = '#EF4444'; // ← Red (critical)
} else if (hpPercent <= 50) {
  hpColor = '#F59E0B'; // ← Orange/Yellow (warning)
}
```

**Color Thresholds**:
- **76-100% HP**: Green (#22C55E) - Healthy
- **51-75% HP**: Green (#22C55E) - Good
- **26-50% HP**: Orange (#F59E0B) - Warning
- **1-25% HP**: Red (#EF4444) - Critical
- **0% HP**: Game Over

**Customization**:
```typescript
// More gradual color changes:
if (hpPercent <= 20) {
  hpColor = '#EF4444'; // Red
} else if (hpPercent <= 40) {
  hpColor = '#F59E0B'; // Orange
} else if (hpPercent <= 70) {
  hpColor = '#FBBF24'; // Yellow
} else {
  hpColor = '#22C55E'; // Green
}

// Always green (no color change):
hpColor = '#22C55E';

// Custom colors:
if (hpPercent <= 25) {
  hpColor = '#9333EA'; // Purple for critical
}
```

---

## 🎮 **Damage Examples**

### **Combat Scenarios**

**Starting health**: 75 HP

**Scenario 1: Chaser hits**
```
75 HP → Hit by chaser → 70 HP (75 - 5)
70 HP → I-frames active (0.8s)
70 HP → Hit by another chaser → No damage (i-frames!)
70 HP → I-frames expire
70 HP → Hit by chaser → 65 HP
```

**Scenario 2: Shooter projectile**
```
75 HP → Hit by projectile → 65 HP (75 - 10)
65 HP → I-frames active (0.8s)
65 HP → Hit by another projectile → No damage (i-frames!)
```

**Scenario 3: Mixed damage**
```
75 HP → Chaser hit → 70 HP
70 HP → I-frames (0.8s)
70 HP → Projectile hit during i-frames → No damage
70 HP → I-frames expire
70 HP → Projectile hit → 60 HP
60 HP → I-frames (0.8s)
60 HP → Chaser hit during i-frames → No damage
```

**Scenario 4: Death**
```
15 HP → Chaser hit → 10 HP
10 HP → Chaser hit → 5 HP
5 HP → Chaser hit → 0 HP
→ Game Over!
```

---

## 🔧 **Customization**

### **Change HP Bar Appearance**

**File**: `components/game/GameHUD.tsx` lines 191-204

```typescript
// Longer bar:
.hp-bar-container {
  width: 250px;  // Default: 200px
}

// Thicker bar:
.hp-bar-container {
  height: 25px;  // Default: 20px
}

// Different border color:
.hp-bar-container {
  border: 2px solid #FFD700;  // Gold border
}

// No border:
.hp-bar-container {
  border: none;
}
```

### **Change HP Text Style**

**File**: `components/game/GameHUD.tsx` lines 183-189

```typescript
// Larger text:
.hp-text {
  font-size: 16px;  // Default: 14px
}

// Different font:
.hp-text {
  font-family: sans-serif;
}

// Add HP icon:
<div className="hp-text">❤ HP {health} / {maxHealth}</div>
```

### **Add HP Regeneration**

**File**: `lib/game/systems/player.ts` (create new function)

```typescript
export function regenerateHealth(player: Player, amount: number): void {
  player.health = Math.min(player.maxHealth, player.health + amount);
}

// In GameCanvas update loop:
if (now - lastRegenTime >= 5000) {
  regenerateHealth(player, 5); // +5 HP every 5 seconds
  lastRegenTime = now;
}
```

### **Add Max HP Upgrade**

**File**: `lib/game/systems/upgrades.ts`

Add to `UPGRADE_IDS`:
```typescript
'maxHealth',
```

Add to `getUpgradeInfo`:
```typescript
maxHealth: { 
  name: `Max HP ${tierNum}`, 
  desc: `+${(15 * tierMult).toFixed(0)} Maximum Health` 
},
```

Add to `applyUpgrade`:
```typescript
case 'maxHealth':
  player.maxHealth += 15 * tierMult;
  player.health += 15 * tierMult; // Also heal
  upgradeCount.maxHealth++;
  break;
```

---

## 📊 **Damage Balance**

### **Hits to Kill Player**

**Starting from 75 HP**:

| Enemy Type | Damage | Hits to Kill |
|------------|--------|--------------|
| **Chaser** | 5 | 15 hits |
| **Shooter** | 10 | 8 hits |

**Mixed damage examples**:
- 5 chaser hits + 5 shooter hits = 75 damage = Death
- 10 chaser hits + 2 shooter hits = 70 damage = Still alive (5 HP)
- 1 chaser hit + 7 shooter hits = 75 damage = Death

### **With I-Frames (0.8s)**

Effective damage rate:
- **Chaser**: Max 5 damage every 0.8s = ~6.25 DPS
- **Shooter**: Max 10 damage every 0.8s = ~12.5 DPS (if hitting every cooldown)

**Time to kill** (continuous hits):
- **Chasers only**: 15 hits × 0.8s = 12 seconds minimum
- **Shooters only**: 8 hits × 0.8s = 6.4 seconds minimum
- **Realistic** (mixed, dodging): 30-60+ seconds depending on skill

---

## 🎯 **HP System Summary**

### **Before (Hearts)**
- ❌ Max 5 hearts
- ❌ All damage = 1 heart
- ❌ Simple but limited
- ❌ No granular balance

### **After (Numeric HP)**
- ✅ 75 HP pool
- ✅ Chaser: 5 damage, Shooter: 10 damage
- ✅ Configurable and balanced
- ✅ Visual HP bar with color gradient
- ✅ Precise damage values

---

## ✅ **Acceptance Criteria - All Met**

✅ **Start of run**: 75 / 75 HP visible  
✅ **Chaser hit**: -5 HP  
✅ **Shooter projectile**: -10 HP  
✅ **HP ≤ 0**: Game Over screen  
✅ **HP bar**: Updates in real-time  
✅ **Color gradient**: Green → Orange → Red  
✅ **I-frames**: Still work (no double damage)  
✅ **No regressions**: XP, timer, waves, HUD, money all work  

---

## 🚀 **Build Status**

✅ **Build successful** - no errors  
✅ **HP system replaced** - hearts → numeric  
✅ **HP bar implemented** - color gradient works  
✅ **Damage values set** - 5 for chasers, 10 for shooters  
✅ **All systems working** - no regressions  

---

## 🔑 **Quick Reference**

| What | File | Lines | Value |
|------|------|-------|-------|
| **Starting/Max HP** | config.ts | 19-20 | 75 |
| **Chaser damage** | config.ts | 34 | 5 |
| **Shooter damage** | config.ts | 41 | 10 |
| **Damage function** | player.ts | 74-82 | `damagePlayer()` |
| **HP bar rendering** | GameHUD.tsx | 76-87 | HP bar + text |
| **Color logic** | GameHUD.tsx | 65-71 | Gradient thresholds |
| **HP bar CSS** | GameHUD.tsx | 174-204 | Styling |

---

**The HP system is now fully numeric with proper damage values and a beautiful color-changing health bar!** 💚💛❤️


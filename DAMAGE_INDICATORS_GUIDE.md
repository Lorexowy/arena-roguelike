# Damage Indicators System

## Overview

Complete floating damage indicator system showing all damage sources in the game with color-coded visual feedback.

---

## 🎨 **Indicator Types**

### **1. Enemy Damage (White)**
- **When**: Player hits an enemy with a normal attack
- **Color**: White (#FFFFFF)
- **Format**: `"3"`, `"5"`, `"7.5"` (damage amount)
- **Size**: 14px
- **Position**: Above enemy

### **2. Critical Hits (Yellow)**
- **When**: Player lands a critical hit on an enemy
- **Color**: Yellow (#FACC15)
- **Format**: `"6"`, `"10"`, `"15"` (2x damage)
- **Size**: 18px (larger)
- **Position**: Above enemy

### **3. Money Drops (Green)**
- **When**: Enemy dies and drops money (30% chance)
- **Color**: Bright green (#22C55E)
- **Format**: `"+$1"`, `"+$2"` (money earned)
- **Size**: 14px
- **Position**: Above enemy death location

### **4. Player Damage (Red)** ✨ NEW!
- **When**: Player takes damage from enemies or projectiles
- **Color**: Red (#EF4444)
- **Format**: `"-5"`, `"-10"` (damage taken)
- **Size**: 14px
- **Position**: Above player

---

## ✅ **Player Damage Implementation**

### **Visual Feedback**
When the player is hit:
- ✅ **Red floating number** appears above player
- ✅ **Minus sign** prefix (e.g., `-5`, `-10`)
- ✅ **Floats upward** and fades out (600ms)
- ✅ **Black outline** for readability
- ✅ **Same pooling system** as other indicators

### **Integration**

**File**: `lib/game/systems/player.ts` lines 88-91

```typescript
// Spawn red damage indicator above player
if (damageNumbers) {
  spawnDamageNumber(damageNumbers, player.x, player.y - player.radius - 10, damage, false, now, true);
}
```

**Parameters**:
- `x, y`: Player position (slightly above)
- `damage`: Amount of damage taken (5 or 10)
- `isCrit`: `false` (not applicable to player damage)
- `now`: Current timestamp
- `isPlayerDamage`: `true` ← Triggers red color and minus sign

---

## 🎮 **Visual Examples**

### **Combat Scenario**
```
Player shoots enemy:
  Enemy position: White "5" floats up

Enemy hits player:
  Player position: Red "-5" floats up

Critical hit on enemy:
  Enemy position: Yellow "10" floats up (larger)

Shooter projectile hits player:
  Player position: Red "-10" floats up

Enemy dies and drops money:
  Enemy death position: Green "+$2" floats up
```

---

## 🔧 **Damage Indicator Colors**

**File**: `lib/game/systems/damageNumbers.ts` lines 103-116

```typescript
if (dn.isPlayerDamage) {
  // Player damage: red with minus sign
  color = `rgba(239, 68, 68, ${opacity})`; // ← Red
  text = `-${dn.damage}`;                   // ← Minus prefix
} else if (dn.isCrit) {
  // Crit damage: larger, yellow
  fontSize = DAMAGE_NUMBER_CONFIG.fontSize + 4;
  color = `rgba(250, 204, 21, ${opacity})`; // ← Yellow
  text = dn.damage.toString();
} else {
  // Normal damage: white
  color = `rgba(255, 255, 255, ${opacity})`; // ← White
  text = dn.damage.toString();
}
```

---

## 📍 **Code Locations**

| What | File | Lines | Details |
|------|------|-------|---------|
| **Player damage spawn** | player.ts | 88-91 | Called in `damagePlayer()` |
| **isPlayerDamage field** | types.ts | 118 | Optional boolean flag |
| **Color logic** | damageNumbers.ts | 103-116 | Red for player damage |
| **Chaser collision** | collision.ts | 133 | Passes damageNumbers |
| **Projectile collision** | collision.ts | 164 | Passes damageNumbers |

---

## 🎯 **Customization**

### **Change Player Damage Color**

**File**: `lib/game/systems/damageNumbers.ts` line 105

```typescript
// Purple instead of red:
color = `rgba(147, 51, 234, ${opacity})`; // #9333EA

// Orange:
color = `rgba(249, 115, 22, ${opacity})`; // #F97316

// Dark red:
color = `rgba(185, 28, 28, ${opacity})`; // #B91C1C
```

### **Change Player Damage Size**

**File**: `lib/game/systems/damageNumbers.ts` line 103-106

```typescript
if (dn.isPlayerDamage) {
  fontSize = DAMAGE_NUMBER_CONFIG.fontSize + 4; // Make it larger
  color = `rgba(239, 68, 68, ${opacity})`;
  text = `-${dn.damage}`;
}
```

### **Remove Minus Sign**

**File**: `lib/game/systems/damageNumbers.ts` line 106

```typescript
text = dn.damage.toString(); // Just "5" instead of "-5"
```

### **Add Exclamation Mark**

**File**: `lib/game/systems/damageNumbers.ts` line 106

```typescript
text = `-${dn.damage}!`; // Shows "-5!" or "-10!"
```

### **Change Position**

**File**: `lib/game/systems/player.ts` line 90

```typescript
// Higher above player:
spawnDamageNumber(damageNumbers, player.x, player.y - player.radius - 20, damage, false, now, true);

// To the side of player:
spawnDamageNumber(damageNumbers, player.x + 15, player.y, damage, false, now, true);
```

---

## 📊 **Complete Indicator Summary**

| Indicator | Color | Size | Format | When |
|-----------|-------|------|--------|------|
| **Normal Hit** | White | 14px | `"5"` | Hit enemy |
| **Critical Hit** | Yellow | 18px | `"10"` | Crit on enemy |
| **Money Drop** | Green | 14px | `"+$1"` | Enemy drops money |
| **Player Damage** | Red | 14px | `"-5"` | Player takes damage |

---

## ✅ **Visual Feedback Complete**

Now all damage sources have clear visual feedback:

✅ **Enemy damage**: White/Yellow numbers (offensive feedback)  
✅ **Money earned**: Green `+$X` (reward feedback)  
✅ **Player damage**: Red `-X` (defensive feedback)  
✅ **All use same system**: Pooled, optimized, consistent  
✅ **Respects reduce motion**: Can be disabled in settings  

---

## 🚀 **Build Status**

✅ **Build successful** - no errors  
✅ **Player damage indicators** - red with minus sign  
✅ **All damage sources** - now have visual feedback  
✅ **Color-coded system** - clear differentiation  

**The damage feedback system is now complete!** Every damage event in the game has clear, color-coded visual feedback. 🎯


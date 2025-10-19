# Shooter Enemy Implementation Guide

## Overview

Complete implementation of the Shooter enemy - a ranged enemy that maintains distance and fires blue projectiles at the player.

---

## ✅ **All Features Implemented**

### **Enemy Type: Shooter**
- ✅ **Appears starting Wave 3** (2 shooters)
- ✅ **Scales every 2 waves** (Wave 5: 3, Wave 7: 4, etc.)
- ✅ **HP**: 4.5 (1.5x chaser health)
- ✅ **Damage**: 1.25 (1.25x chaser damage)
- ✅ **Move speed**: 0.56 (80% of chaser speed)
- ✅ **XP reward**: 15 (1.5x chaser XP)
- ✅ **Money drop**: 30% chance to drop +$1 (same as chasers)

### **AI Behavior**
- ✅ **Preferred distance**: ~100px from player
- ✅ **Moves toward** if farther than 110px
- ✅ **Moves away** if closer than 90px
- ✅ **Holds position** in optimal range
- ✅ **Shoots every 2 seconds** (independent cooldown per shooter)

### **Projectiles**
- ✅ **Color**: Light blue (#60A5FA)
- ✅ **Size**: 3px radius orbs
- ✅ **Speed**: 0.07 px/ms (70 px/sec)
- ✅ **Damage**: 1.25 (shooter's damage value)
- ✅ **Despawn**: On hit or leaving arena

### **Visuals**
- ✅ **Shape**: Blue diamond with dark outline
- ✅ **Chaser**: Red diamond (unchanged)
- ✅ **Shooter**: Blue diamond (#38BDF8)
- ✅ **Outline**: Dark (#0B0F1A) for both types
- ✅ **Clean pixel style**: Sharp outlines, no blur

---

## 📍 **Code Locations (As Requested)**

### **1. Shooter Behavior (Movement + Shooting)**

#### **Movement AI**
**File**: `lib/game/systems/enemies.ts` lines 79-98

```typescript
if (enemy.type === 'chaser') {
  // Chaser: always move toward player
  enemy.x += (dx / distance) * enemy.speed;
  enemy.y += (dy / distance) * enemy.speed;
} else if (enemy.type === 'shooter') {
  // Shooter: maintain preferred distance
  const preferredDist = BASE_STATS.enemy.shooter.preferredDistance;
  const threshold = BASE_STATS.enemy.shooter.distanceThreshold;

  if (distance > preferredDist + threshold) {
    // Too far: move toward player
    enemy.x += (dx / distance) * enemy.speed;
    enemy.y += (dy / distance) * enemy.speed;
  } else if (distance < preferredDist - threshold) {
    // Too close: move away from player
    enemy.x -= (dx / distance) * enemy.speed;
    enemy.y -= (dy / distance) * enemy.speed;
  }
  // Otherwise: maintain distance (strafe or hold position)
}
```

#### **Shooting Logic**
**File**: `lib/game/systems/enemyProjectiles.ts` lines 13-46

```typescript
export function updateShooters(
  enemies: Enemy[],
  projectiles: EnemyProjectile[],
  player: Player,
  now: number
): void {
  for (const enemy of enemies) {
    if (enemy.type !== 'shooter') continue;

    // Check if ready to shoot
    const cooldown = BASE_STATS.enemy.shooter.shootCooldown;
    if (enemy.lastShotTime === undefined) enemy.lastShotTime = 0;
    
    if (now - enemy.lastShotTime >= cooldown) {
      // Calculate direction to player
      const dx = player.x - enemy.x;
      const dy = player.y - enemy.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 0) {
        // Spawn projectile
        const speed = BASE_STATS.enemy.shooter.projectileSpeed;
        projectiles.push({
          x: enemy.x,
          y: enemy.y,
          vx: (dx / distance) * speed,
          vy: (dy / distance) * speed,
          damage: enemy.damage,
        });

        enemy.lastShotTime = now;
      }
    }
  }
}
```

---

### **2. Spawn Logic in Wave System**

**File**: `lib/game/systems/waves.ts` lines 126-133

```typescript
// Calculate shooters for this wave
// Wave 3: 2 shooters, Wave 5: 3, Wave 7: 4, etc.
if (waveState.currentWave >= 3) {
  waveState.shootersToSpawn = 2 + Math.floor((waveState.currentWave - 3) / 2);
} else {
  waveState.shootersToSpawn = 0;
}
waveState.shootersSpawned = 0;
```

**File**: `components/game/GameCanvas.tsx` lines 254-265

```typescript
// Spawn chasers
if (waveState.waveActive && 
    waveState.enemiesSpawned < waveState.enemiesToSpawn) {
  spawnEnemy(enemies, waveState, 'chaser');
}

// Spawn shooters (starting wave 3)
if (waveState.waveActive && 
    waveState.shootersSpawned < waveState.shootersToSpawn) {
  spawnEnemy(enemies, waveState, 'shooter');
  waveState.shootersSpawned++;
}
```

---

### **3. Projectile Damage Values**

**File**: `lib/game/config.ts` lines 38-49

```typescript
shooter: {
  speed: 0.56,           // Movement speed
  health: 4.5,           // Hit points
  damage: 1.25,          // ← Projectile damage
  size: 8,
  xpValue: 15,
  preferredDistance: 100, // ← Preferred distance from player
  distanceThreshold: 10,  // ± tolerance
  shootCooldown: 2000,    // ← 2 seconds between shots
  projectileSpeed: 0.07,  // ← 70 px/sec
  projectileSize: 3,
},
```

---

## 🔧 **Customization Examples**

### **Adjust Shooter Stats**

**File**: `lib/game/config.ts` lines 38-49

```typescript
// Make shooters faster but weaker
shooter: {
  speed: 0.8,           // Faster movement
  health: 3,            // Less HP
  damage: 1.0,          // Same damage as chasers
  // ... other properties
}

// Make shooters tankier with higher damage
shooter: {
  speed: 0.4,           // Slower
  health: 6,            // More HP
  damage: 2.0,          // Double damage
  // ... other properties
}
```

### **Change Shooting Behavior**

```typescript
// Shoot more frequently
shootCooldown: 1000,    // 1 second between shots

// Shoot slower but faster projectiles
shootCooldown: 3000,    // 3 seconds between shots
projectileSpeed: 0.15,  // 150 px/sec

// Maintain farther distance
preferredDistance: 150, // Stay 150px away
distanceThreshold: 15,  // Larger tolerance
```

### **Change Spawn Pattern**

**File**: `lib/game/systems/waves.ts` lines 126-133

```typescript
// More shooters per wave (Wave 3: 3 shooters, then +1 per wave)
if (waveState.currentWave >= 3) {
  waveState.shootersToSpawn = 3 + (waveState.currentWave - 3);
}

// Start shooters earlier (Wave 2)
if (waveState.currentWave >= 2) {
  waveState.shootersToSpawn = 2 + Math.floor((waveState.currentWave - 2) / 2);
}

// Fixed count per wave
if (waveState.currentWave >= 3) {
  waveState.shootersToSpawn = 3; // Always 3 shooters
}
```

### **Change Visual Appearance**

**File**: `lib/game/systems/render.ts` lines 72-114

```typescript
// Different color for shooters
} else if (enemy.type === 'shooter') {
  fillColor = '#FF6B6B'; // Red shooter instead of blue
}

// Different projectile color
// File: lib/game/systems/render.ts lines 269-273
ctx.fillStyle = '#FFD700'; // Gold projectiles
```

---

## 🎮 **How It Works**

### **Wave Progression**
```
Wave 1: 5 chasers, 0 shooters
Wave 2: 7 chasers, 0 shooters
Wave 3: 9 chasers, 2 shooters ← Shooters appear!
Wave 4: 11 chasers, 2 shooters
Wave 5: 13 chasers, 3 shooters ← +1 shooter
Wave 6: 15 chasers, 3 shooters
Wave 7: 17 chasers, 4 shooters ← +1 shooter
...
```

### **Shooter Behavior Loop**
```
1. Check distance to player
   ↓
2. If too far (>110px) → Move toward player
   If too close (<90px) → Move away from player
   If in range (90-110px) → Hold position
   ↓
3. Every 2 seconds:
   - Calculate direction to player
   - Spawn blue projectile toward player
   - Reset shoot timer
   ↓
4. Projectile:
   - Flies toward player at 70 px/sec
   - Deals 1.25 damage on hit
   - Despawns on collision or leaving arena
```

### **Player Interaction**
- **Bullets kill shooters**: Player bullets work normally
- **Projectiles damage player**: 1.25 damage, respects i-frames
- **Rewards**: 15 XP + 30% chance for +$1

---

## 📊 **Stats Comparison**

| Stat | Chaser (Melee) | Shooter (Ranged) |
|------|----------------|------------------|
| **Speed** | 0.7 | 0.56 (80%) |
| **Health** | 3 | 4.5 (150%) |
| **Damage** | 1 | 1.25 (125%) |
| **XP** | 10 | 15 (150%) |
| **Size** | 8px | 8px |
| **Money drop** | 30% | 30% |
| **Behavior** | Chase player | Maintain 100px distance |
| **Attack** | Touch player | Shoot projectile |

---

## 🆕 **New Files Created**

### **`lib/game/systems/enemyProjectiles.ts`**
- Handles shooter shooting logic
- Updates projectile positions
- Renders projectiles
- 90 lines

---

## 🔄 **Modified Files**

### **Types (`lib/game/types.ts`)**
- Added `EnemyType` ('chaser' | 'shooter')
- Added `EnemyProjectile` interface
- Updated `Enemy` interface with `type` and `lastShotTime`
- Updated `WaveState` with `shootersToSpawn` and `shootersSpawned`

### **Config (`lib/game/config.ts`)**
- Restructured `BASE_STATS.enemy` to have `chaser` and `shooter` sub-objects
- Added all shooter-specific stats

### **Enemy System (`lib/game/systems/enemies.ts`)**
- Updated `spawnEnemy()` to accept enemy type parameter
- Updated `updateEnemies()` to handle different movement patterns

### **Wave System (`lib/game/systems/waves.ts`)**
- Updated `prepareNextWave()` to calculate shooter count
- Updated `checkWaveCleared()` to include shooters in count
- Updated all state management for shooters

### **Collision System (`lib/game/systems/collision.ts`)**
- Fixed size lookups to use `enemy.type`
- Added `handleProjectilePlayerCollisions()` function
- Updated XP/money drops for shooter type

### **Render System (`lib/game/systems/render.ts`)**
- Updated `drawEnemies()` to render blue diamonds for shooters
- Added `drawEnemyProjectiles()` function
- Updated `renderGameObjects()` signature

### **Game Canvas (`components/game/GameCanvas.tsx`)**
- Added enemy projectiles array
- Integrated shooter shooting logic
- Integrated projectile collision handling
- Added projectile rendering

---

## ✅ **Acceptance Criteria - All Met**

✅ **Starting wave 3**: 2 shooters spawn  
✅ **Every 2 waves**: +1 shooter added  
✅ **Maintains 100px distance**: Moves toward if far, away if close  
✅ **Fires every 2 seconds**: Blue projectiles toward player  
✅ **Player bullets kill shooters**: Standard collision works  
✅ **Projectiles damage player**: 1.25 damage, respects i-frames  
✅ **XP drop**: 15 XP (1.5x chasers)  
✅ **Money drop**: 30% chance for +$1  
✅ **Blue diamond visual**: Clear differentiation from red chasers  
✅ **No regressions**: Melee enemies, waves, upgrades, HUD all work  

---

## 🚀 **Build Status**

✅ **Build successful** - no errors  
✅ **All systems integrated** - enemy types, projectiles, rendering  
✅ **Wave system updated** - shooter spawning works correctly  
✅ **Collision system complete** - projectile vs player implemented  

---

## 🎯 **Quick Reference**

| What | File | Lines |
|------|------|-------|
| Shooter stats | config.ts | 38-49 |
| Shooter movement AI | enemies.ts | 84-96 |
| Shooter shooting logic | enemyProjectiles.ts | 13-46 |
| Projectile updates | enemyProjectiles.ts | 51-69 |
| Projectile rendering | enemyProjectiles.ts | 74-90 |
| Shooter spawn count | waves.ts | 126-133 |
| Chaser spawn call | GameCanvas.tsx | 254-258 |
| Shooter spawn call | GameCanvas.tsx | 260-265 |
| Projectile collision | collision.ts | 145-171 |

---

**The Shooter enemy is now fully operational!** 🎯 Blue diamond enemies maintain distance, fire projectiles, and add a new ranged threat to the arena.


# Money Economy Balance Guide

## 🎯 Overview

The money economy now scales with wave progression to match shop price increases, creating a balanced progression system where players can afford items throughout the game.

## 💰 Money Drop System

### Base Values
- **Chaser Enemies**: $1 base (30% drop chance)
- **Shooter Enemies**: $2 base (30% drop chance)

### Scaling Formula
```typescript
const intervals = Math.floor((currentWave - 2) / 3);
const multiplier = Math.pow(1.15, intervals);
const moneyAmount = Math.ceil(baseAmount * multiplier);
```

### Scaling Parameters
- **Scaling Interval**: Every 3 waves (matches shop scaling)
- **Scaling Multiplier**: +15% per interval (matches shop scaling)
- **Start Wave**: Wave 2 (matches shop scaling)

## 📊 Money Drop Progression

| Wave Range | Chaser Drop | Shooter Drop | Expected Income* |
|------------|-------------|--------------|------------------|
| 1          | $1          | $2           | $3-5             |
| 2-4        | $1          | $2           | $5-8             |
| 5-7        | $1          | $2           | $8-12            |
| 8-10       | $1          | $2           | $12-18           |
| 11-13      | $1          | $2           | $18-25           |
| 14-16      | $1          | $2           | $25-35           |
| 17-19      | $1          | $2           | $35-50           |
| 20-22      | $1          | $2           | $50-70           |

*Expected income per wave (varies by enemy spawn rate and player efficiency)

## 🛒 Shop Price vs Money Income Balance

### Early Game (Waves 2-7)
| Item | Price | Money/Wave | Affordability |
|------|-------|------------|---------------|
| Ruby Crystal | $9 | $5-8 | ✅ 1-2 waves |
| Dagger | $10 | $5-8 | ✅ 1-2 waves |
| Boots | $10 | $5-8 | ✅ 1-2 waves |
| Rejuv Bead | $12 | $5-8 | ✅ 1-2 waves |
| Vamp Scepter | $12 | $5-8 | ✅ 1-2 waves |

### Mid Game (Waves 8-16)
| Item | Price | Money/Wave | Affordability |
|------|-------|------------|---------------|
| Ruby Crystal | $12-16 | $12-25 | ✅ 1 wave |
| Dagger | $14-18 | $12-25 | ✅ 1 wave |
| Boots | $14-18 | $12-25 | ✅ 1 wave |
| Rejuv Bead | $16-21 | $12-25 | ✅ 1 wave |
| Vamp Scepter | $16-21 | $12-25 | ✅ 1 wave |

### Late Game (Waves 17+)
| Item | Price | Money/Wave | Affordability |
|------|-------|------------|---------------|
| Ruby Crystal | $18+ | $35+ | ✅ 1 wave |
| Dagger | $21+ | $35+ | ✅ 1 wave |
| Boots | $21+ | $35+ | ✅ 1 wave |
| Rejuv Bead | $24+ | $35+ | ✅ 1 wave |
| Vamp Scepter | $24+ | $35+ | ✅ 1 wave |

## 🎮 Game Balance Benefits

### ✅ Early Game (Waves 2-7)
- **Accessible**: Players can buy items within 1-2 waves
- **Progressive**: Money income grows with difficulty
- **Engaging**: Shop feels useful from the start

### ✅ Mid Game (Waves 8-16)
- **Balanced**: Income matches item prices
- **Strategic**: Players can afford most items per wave
- **Rewarding**: Higher waves provide better value

### ✅ Late Game (Waves 17+)
- **Challenging**: Prices require strategic planning
- **Endgame**: High income maintains engagement
- **Prestige**: Expensive items feel valuable

## 🔧 Technical Implementation

### Configuration
```typescript
export const ECONOMY_CONFIG = {
  moneyDropChance: 0.3,           // 30% chance to drop money
  baseMoneyPerKill: 1,            // Base money for chasers
  baseMoneyPerShooter: 2,         // Base money for shooters
  
  // Scaling parameters (match shop scaling)
  moneyScalingWaves: 3,           // Every 3 waves
  moneyScalingMultiplier: 1.15,   // +15% per interval
  minWaveForScaling: 2,           // Start from wave 2
};
```

### Usage in Code
```typescript
// Calculate scaled money drop
const baseAmount = enemy.type === 'shooter' 
  ? ECONOMY_CONFIG.baseMoneyPerShooter 
  : ECONOMY_CONFIG.baseMoneyPerKill;
const moneyAmount = calculateMoneyDrop(baseAmount, waveState.currentWave);
```

## 📈 Economic Flow

### Player Experience
1. **Wave 2-4**: Can buy 1-2 items per wave
2. **Wave 5-10**: Can buy 1 item per wave + save
3. **Wave 11+**: Can buy multiple items or save for expensive ones

### Strategic Depth
- **Early**: Focus on immediate power spikes
- **Mid**: Balance offense and defense
- **Late**: Optimize for endgame builds

## 🎯 Balance Goals Achieved

1. **✅ Proportional Scaling**: Money scales with shop prices
2. **✅ Early Access**: Items affordable from wave 2
3. **✅ Progressive Difficulty**: Higher waves = more income
4. **✅ Strategic Depth**: Players must manage money wisely
5. **✅ Fair Economy**: Prices match income progression
6. **✅ Endgame Challenge**: Late game maintains difficulty

## 🔄 Future Extensions

### Easy to Add
- **Money multipliers** from perks/items
- **Boss money drops** (higher base amounts)
- **Money bonuses** for perfect waves
- **Interest system** for saved money

### Advanced Features
- **Dynamic pricing** based on player performance
- **Market fluctuations** for different item types
- **Investment system** for long-term gains
- **Auction house** for rare items

The new money economy creates a smooth progression curve that keeps the shop engaging throughout the entire game! 🎉

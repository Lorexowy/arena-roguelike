# Shop Price Balance Guide

## 🎯 New Price Structure

### Base Prices (Wave 2-4)
- **Ruby Crystal**: $9 (was $20)
- **Dagger**: $10 (was $30) 
- **Boots of Speed**: $10 (was $30)
- **Rejuvenation Bead**: $12 (was $35)
- **Vampiric Scepter**: $12 (was $40)

### Price Scaling System
- **Scaling Interval**: Every 3 waves (was every 2 waves)
- **Scaling Multiplier**: +15% per interval (was +8%)
- **Formula**: `Math.ceil(baseCost * (1.15 ^ intervals))`

## 📊 Price Progression Examples

| Wave Range | Ruby Crystal | Dagger | Boots | Rejuv Bead | Vamp Scepter |
|------------|--------------|--------|-------|------------|--------------|
| 2-4        | $9          | $10    | $10   | $12        | $12          |
| 5-7        | $10         | $12    | $12   | $14        | $14          |
| 8-10       | $12         | $14    | $14   | $16        | $16          |
| 11-13      | $14         | $16    | $16   | $18        | $18          |
| 14-16      | $16         | $18    | $18   | $21        | $21          |
| 17-19      | $18         | $21    | $21   | $24        | $24          |
| 20-22      | $21         | $24    | $24   | $28        | $28          |

## 🎮 Game Balance Benefits

### Early Game (Waves 2-7)
- **Affordable**: Players can buy items with early wave money
- **Accessible**: No need to save for multiple waves
- **Progressive**: Prices gradually increase to maintain challenge

### Mid Game (Waves 8-16)
- **Balanced**: Prices scale with player income
- **Strategic**: Players must choose between items
- **Rewarding**: Higher waves provide better value

### Late Game (Waves 17+)
- **Challenging**: Prices require strategic money management
- **Endgame**: High prices maintain difficulty curve
- **Prestige**: Expensive items feel valuable

## 💰 Money Economy

### Typical Player Income
- **Wave 2-3**: ~$5-8 per wave
- **Wave 4-6**: ~$8-12 per wave  
- **Wave 7-10**: ~$12-18 per wave
- **Wave 11+**: ~$18+ per wave

### Purchase Affordability
- **Early**: Can buy 1-2 items per wave
- **Mid**: Can buy 1 item per wave + save
- **Late**: Must save multiple waves for expensive items

## 🔧 Technical Details

### Scaling Formula
```typescript
const intervals = Math.floor((currentWave - 2) / 3);
const multiplier = Math.pow(1.15, intervals);
const price = Math.ceil(baseCost * multiplier);
```

### Configuration
```typescript
PRICE_SCALING_WAVES: 3,         // Every 3 waves
PRICE_SCALING_MULTIPLIER: 1.15, // +15% per interval
```

## ✅ Balance Goals Achieved

1. **Early Game Access**: Items affordable from wave 2
2. **Progressive Scaling**: Prices grow with game difficulty
3. **Strategic Depth**: Players must manage money wisely
4. **Late Game Challenge**: Expensive items maintain difficulty
5. **Fair Economy**: Prices match player income progression

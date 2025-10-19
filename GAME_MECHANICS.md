# Arena Roguelike - Game Mechanics Reference

## 🎮 Current Features

### Timer System
- **Counts UP** from 0:00 (survival mode)
- No time limit - game only ends on player death
- Format: MM:SS (e.g., 02:47 for 2 minutes 47 seconds)

### Aiming System
- **Mouse-based aiming** - bullets fire toward cursor position
- Accurate at all viewport sizes (uses coordinate conversion)
- Crosshair visible when cursor is over canvas
- If cursor leaves canvas, shooting pauses until it returns

### Controls
- **WASD**: Movement (Arrow keys disabled)
- **Mouse**: Aim direction
- **Auto-fire**: Every 250ms toward cursor

## 🔧 Key Code Sections

### 1. Mouse Coordinate Conversion (Lines 145-157)
```typescript
const screenToLogicalCoords = (screenX: number, screenY: number) => {
  const rect = canvas.getBoundingClientRect();
  
  // Calculate position relative to canvas element (0 to 1 range)
  const relativeX = (screenX - rect.left) / rect.width;
  const relativeY = (screenY - rect.top) / rect.height;
  
  // Convert to logical canvas coordinates
  const logicalX = relativeX * CANVAS_WIDTH;
  const logicalY = relativeY * CANVAS_HEIGHT;
  
  return { x: logicalX, y: logicalY };
};
```
**What it does**: Converts screen mouse coordinates to logical 320×180 canvas space.
This ensures aiming works correctly regardless of canvas scale (mobile, desktop, different resolutions).

### 2. Bullet Firing Logic (Lines 194-212)
```typescript
const spawnBullet = () => {
  // Don't fire if cursor is invalid (outside canvas or not moved yet)
  if (!cursor.isValid) return;

  // Calculate direction vector from player to cursor
  const dx = cursor.x - player.x;
  const dy = cursor.y - player.y;
  const magnitude = Math.sqrt(dx * dx + dy * dy);
  
  // Only fire if cursor is not directly on player
  if (magnitude > 1) {
    bullets.push({
      x: player.x,
      y: player.y,
      vx: (dx / magnitude) * BULLET_CONFIG.speed,
      vy: (dy / magnitude) * BULLET_CONFIG.speed,
    });
  }
};
```
**What it does**: Creates a normalized direction vector from player to cursor and applies bullet speed.

### 3. Timer Display (Lines 538-548)
```typescript
// Draw Timer (top-right) - counts UP from 0 (survival timer)
const elapsed = now - startTime;
const totalSeconds = Math.floor(elapsed / 1000);
const minutes = Math.floor(totalSeconds / 60);
const seconds = totalSeconds % 60;

ctx.fillStyle = '#FFFFFF';
ctx.font = '10px monospace';
ctx.textAlign = 'right';
ctx.fillText(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`, CANVAS_WIDTH - 10, 15);
```
**What it does**: Calculates elapsed time and formats as MM:SS.

### 4. Crosshair Rendering (Lines 479-499)
```typescript
// Draw crosshair at cursor position (optional, for debug/visual feedback)
if (cursor.isValid) {
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.lineWidth = 1;
  
  // Horizontal line
  ctx.beginPath();
  ctx.moveTo(cursor.x - 4, cursor.y);
  ctx.lineTo(cursor.x + 4, cursor.y);
  ctx.stroke();
  
  // Vertical line
  ctx.beginPath();
  ctx.moveTo(cursor.x, cursor.y - 4);
  ctx.lineTo(cursor.x, cursor.y + 4);
  ctx.stroke();
  
  // Center dot
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.fillRect(cursor.x - 1, cursor.y - 1, 2, 2);
}
```
**What it does**: Draws a small crosshair at cursor position to verify aiming accuracy.

## ⚙️ Tweakable Parameters (Lines 26-69)

### Bullet Configuration
```typescript
const BULLET_CONFIG = {
  speed: 4,          // ← Bullet velocity (pixels/frame)
  damage: 1,         // Damage per hit
  width: 4,          // Bullet width
  height: 8,         // Bullet length
  fireRate: 250,     // ← Milliseconds between shots (lower = faster)
};
```
**To tweak**:
- Increase `speed` for faster bullets (try 5-6)
- Decrease `fireRate` for rapid fire (try 150-200ms)
- Increase `damage` for one-shot kills (try 3+)

### Player Configuration
```typescript
const PLAYER_CONFIG = {
  speed: 2,              // Movement speed
  maxHealth: 5,          // Starting hearts
  iframeDuration: 800,   // Invincibility after hit (ms)
  radius: 6,             // Player size
};
```

### Enemy Configuration
```typescript
const ENEMY_CONFIG = {
  speed: 0.8,        // Chase speed
  health: 3,         // HP per enemy
  damage: 1,         // Damage on contact
  size: 8,           // Rhombus size
  spawnRate: 2000,   // MS between spawns
  maxCount: 15,      // Max enemies on screen
};
```

## 🎯 Testing the Changes

### Test Mouse Aiming
1. Start the game
2. Move mouse around canvas - crosshair should follow
3. Bullets should fire toward crosshair
4. Move mouse outside canvas - crosshair disappears, shooting pauses
5. Move mouse back in - shooting resumes

### Test Coordinate Accuracy
1. Resize browser window to different sizes
2. Aim at canvas edges/corners
3. Bullets should fire accurately toward cursor regardless of scale

### Test Timer
1. Watch timer count up: 00:00, 00:01, 00:02...
2. At 60 seconds: should show 01:00
3. Timer continues indefinitely (no win condition)
4. Game only ends when HP = 0

## 🐛 Edge Cases Handled

1. **Cursor outside canvas**: `cursor.isValid = false` prevents shooting
2. **Cursor on player**: `magnitude > 1` check prevents zero-length bullets
3. **No cursor movement yet**: Default position provided, `isValid = false` initially
4. **Canvas scaling**: Coordinate conversion works at any viewport size
5. **Screen shake**: Crosshair and HUD not affected by shake (rendered after `ctx.restore()`)

## 🚀 Performance Notes

- Mouse events update cursor position (lightweight)
- Coordinate conversion uses `getBoundingClientRect()` (cached by browser)
- Crosshair adds minimal render overhead (4 draw calls)
- Timer calculation is simple integer math
- No performance impact at 60 FPS

## 📝 Future Extensions

### Easy Additions
- **Laser sight**: Draw line from player to cursor
- **Charge shots**: Hold fire button for power shots
- **Spread fire**: Spawn multiple bullets at angles
- **Recoil**: Push player back when shooting

### Advanced Features
- **Bullet types**: Different colors/speeds based on power-ups
- **Homing bullets**: Curve toward nearest enemy
- **Bullet time**: Slow motion when aiming
- **Survival leaderboard**: Save best times to localStorage


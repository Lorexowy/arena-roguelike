# Game Components

This directory contains React components specific to the roguelike game.

## Suggested Component Structure

### Core Game Components

- **GameBoard.tsx** - Main game rendering component (grid/map display)
- **Player.tsx** - Player character rendering
- **Enemy.tsx** - Enemy rendering component
- **Tile.tsx** - Individual map tile component
- **GameUI.tsx** - User interface (health, inventory, stats)

### UI Components

- **HealthBar.tsx** - Player health display
- **Inventory.tsx** - Item management interface
- **MessageLog.tsx** - Game message/combat log
- **StatusPanel.tsx** - Player stats and status effects
- **Menu.tsx** - Game menu (start, pause, settings)

### Game Logic Components

- **GameController.tsx** - Main game loop and state management
- **InputHandler.tsx** - Keyboard/mouse input handling

## Component Guidelines

1. Use TypeScript for type safety
2. Keep components focused and single-purpose
3. Use React hooks for state management
4. Import types from `@/lib/game/types`
5. Import utilities from `@/lib/game/utils`
6. Style with Tailwind CSS classes

## Example Component

```tsx
'use client';

import { Player } from '@/lib/game/types';

interface HealthBarProps {
  player: Player;
}

export default function HealthBar({ player }: HealthBarProps) {
  const healthPercent = (player.health / player.maxHealth) * 100;
  
  return (
    <div className="w-full bg-gray-700 rounded">
      <div 
        className="bg-red-600 h-4 rounded transition-all"
        style={{ width: `${healthPercent}%` }}
      />
      <p className="text-sm text-center">
        {player.health} / {player.maxHealth}
      </p>
    </div>
  );
}
```

Start building your components here!


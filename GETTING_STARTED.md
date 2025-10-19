# Getting Started with Arena Roguelike Development

Welcome to your roguelike game project! This guide will help you get started with development.

## 🎯 Quick Start

1. **Start the development server:**
   ```bash
   cd arena-roguelike
   npm run dev
   ```

2. **Open your browser:**
   Visit [http://localhost:3000](http://localhost:3000)

3. **Start coding:**
   Edit `app/page.tsx` to see changes in real-time!

## 📂 Project Structure

```
arena-roguelike/
├── app/                          # Next.js App Router
│   ├── page.tsx                 # Main game page (START HERE)
│   ├── layout.tsx               # Root layout with metadata
│   └── globals.css              # Global styles
│
├── components/
│   └── game/                    # Game-specific components
│       └── README.md            # Component guidelines
│
├── lib/
│   └── game/                    # Game logic and utilities
│       ├── types/index.ts       # TypeScript interfaces
│       └── utils/index.ts       # Helper functions
│
└── public/                      # Static assets (images, sounds)
```

## 🎮 Development Roadmap

### Phase 1: Core Rendering
- [ ] Create a grid-based game board component
- [ ] Render the player character (@)
- [ ] Display basic tiles (walls #, floors .)
- [ ] Add keyboard input handling (arrow keys/WASD)

### Phase 2: Player Movement
- [ ] Implement turn-based movement system
- [ ] Add collision detection
- [ ] Create a simple test map
- [ ] Add viewport/camera following player

### Phase 3: Combat System
- [ ] Add enemy entities
- [ ] Implement basic AI (move toward player)
- [ ] Create combat mechanics
- [ ] Display combat messages

### Phase 4: Items & Inventory
- [ ] Create item system
- [ ] Add inventory UI
- [ ] Implement item pickup
- [ ] Add consumables (potions)

### Phase 5: Procedural Generation
- [ ] Generate random dungeons
- [ ] Create room-and-corridor layouts
- [ ] Add stairs to next level
- [ ] Spawn enemies and items randomly

### Phase 6: Polish & Features
- [ ] Add sound effects
- [ ] Improve UI/UX
- [ ] Add save/load system
- [ ] Create main menu
- [ ] Add animations

## 🔧 Key Technologies

- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **React 19**: Latest React features

## 💡 Development Tips

### 1. Component Structure
Keep your components small and focused. Example:
```tsx
'use client'; // Add this for interactive components

export default function GameBoard() {
  // Component logic here
}
```

### 2. State Management
Start with React's `useState` and `useEffect`:
```tsx
const [player, setPlayer] = useState<Player>({ ... });
```

For complex state, consider React Context or libraries like Zustand.

### 3. Keyboard Input
Handle keyboard events:
```tsx
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      // Move player up
    }
  };
  
  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, []);
```

### 4. Grid Rendering
Use CSS Grid or Canvas for efficient rendering:
```tsx
<div className="grid grid-cols-[repeat(40,1fr)] gap-0">
  {tiles.map((tile, i) => (
    <div key={i} className="w-4 h-4">
      {tile.symbol}
    </div>
  ))}
</div>
```

### 5. Game Loop
For turn-based games, you don't need a constant loop:
- Player input triggers one turn
- Process player action
- Process enemy actions
- Update display

## 📚 Helpful Resources

### Roguelike Development
- [RogueBasin](http://www.roguebasin.com/) - Roguelike development wiki
- [/r/roguelikedev](https://www.reddit.com/r/roguelikedev/) - Community
- [Complete Roguelike Tutorial](http://www.roguebasin.com/index.php?title=Complete_Roguelike_Tutorial,_using_python%2Blibtcod)

### Next.js & React
- [Next.js Documentation](https://nextjs.org/docs)
- [React Hooks](https://react.dev/reference/react)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

### Algorithms
- **Pathfinding**: A* algorithm for AI
- **Procedural Generation**: BSP trees, Cellular Automata
- **Field of View**: Raycasting, Shadow casting

## 🎨 ASCII Art Tips

Common roguelike symbols:
- `@` - Player
- `#` - Wall
- `.` - Floor
- `+` - Door
- `>` `<` - Stairs
- `g` `o` `D` - Enemies (goblin, orc, dragon)
- `!` - Potion
- `/` - Sword
- `[` - Armor

## 🚀 Next Steps

1. Open `app/page.tsx` and start building your game board
2. Create a `GameBoard.tsx` component in `components/game/`
3. Import and use the types from `lib/game/types`
4. Test frequently with `npm run dev`
5. Have fun and be creative!

---

Happy coding! 🎮✨


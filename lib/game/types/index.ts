// Game Types for Arena Roguelike

export interface Position {
  x: number;
  y: number;
}

export interface Entity {
  id: string;
  position: Position;
  symbol: string;
  color?: string;
}

export interface Player extends Entity {
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  inventory: Item[];
  level: number;
  experience: number;
}

export interface Enemy extends Entity {
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  aiType: 'passive' | 'aggressive' | 'patrol';
}

export interface Item {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'consumable' | 'key';
  symbol: string;
  effect?: {
    stat: string;
    value: number;
  };
}

export interface Tile {
  type: 'floor' | 'wall' | 'door' | 'stairs';
  walkable: boolean;
  transparent: boolean;
  symbol: string;
}

export interface GameMap {
  width: number;
  height: number;
  tiles: Tile[][];
}

export interface GameState {
  player: Player;
  enemies: Enemy[];
  items: Item[];
  map: GameMap;
  currentLevel: number;
  turn: number;
  gameOver: boolean;
  message: string[];
}


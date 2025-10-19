// Game Utility Functions

import { Position } from '../types';

/**
 * Calculate Manhattan distance between two positions
 */
export function manhattanDistance(pos1: Position, pos2: Position): number {
  return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
}

/**
 * Calculate Euclidean distance between two positions
 */
export function euclideanDistance(pos1: Position, pos2: Position): number {
  return Math.sqrt(
    Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2)
  );
}

/**
 * Check if two positions are equal
 */
export function positionsEqual(pos1: Position, pos2: Position): boolean {
  return pos1.x === pos2.x && pos1.y === pos2.y;
}

/**
 * Get adjacent positions (4-directional)
 */
export function getAdjacentPositions(pos: Position): Position[] {
  return [
    { x: pos.x, y: pos.y - 1 }, // North
    { x: pos.x + 1, y: pos.y }, // East
    { x: pos.x, y: pos.y + 1 }, // South
    { x: pos.x - 1, y: pos.y }, // West
  ];
}

/**
 * Get all surrounding positions (8-directional)
 */
export function getSurroundingPositions(pos: Position): Position[] {
  return [
    { x: pos.x - 1, y: pos.y - 1 }, // NW
    { x: pos.x, y: pos.y - 1 },     // N
    { x: pos.x + 1, y: pos.y - 1 }, // NE
    { x: pos.x + 1, y: pos.y },     // E
    { x: pos.x + 1, y: pos.y + 1 }, // SE
    { x: pos.x, y: pos.y + 1 },     // S
    { x: pos.x - 1, y: pos.y + 1 }, // SW
    { x: pos.x - 1, y: pos.y },     // W
  ];
}

/**
 * Check if position is within bounds
 */
export function isInBounds(pos: Position, width: number, height: number): boolean {
  return pos.x >= 0 && pos.x < width && pos.y >= 0 && pos.y < height;
}

/**
 * Generate random integer between min and max (inclusive)
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Pick random element from array
 */
export function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Generate unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}


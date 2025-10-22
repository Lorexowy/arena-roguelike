# Game Tiles Directory

This directory contains the tile assets for the game's background system.

## Required Files

Place your 16x16 pixel tile images here:

- `tile_grass_1.png` - Plain grass tile (70% distribution)
- `tile_grass_2.png` - Grass with bush #1 (15% distribution)  
- `tile_grass_3.png` - Grass with bush #2 (15% distribution)

## File Requirements

- **Format**: PNG
- **Size**: 16x16 pixels
- **Transparency**: Supported (optional)

## Usage

The tile system will automatically:
1. Load these images when the game starts
2. Generate a random tile map using the specified distribution
3. Render tiles as the background instead of solid color
4. Optimize rendering by only drawing visible tiles

## Distribution

The tiles are distributed randomly across the world map:
- 70% plain grass (`tile_grass_1.png`)
- 15% grass with bush #1 (`tile_grass_2.png`)
- 15% grass with bush #2 (`tile_grass_3.png`)

This creates a natural-looking grass field with scattered bushes.

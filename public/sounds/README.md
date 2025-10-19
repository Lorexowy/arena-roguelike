# Game Sounds

Place your game sound files here. All sounds should be in WAV or MP3 format.

## Required Sounds

### Player Shoot Sound
- **File**: `player_shoot.mp3`
- **Format**: WAV (recommended) or MP3
- **Duration**: 0.1-0.3 seconds (short and snappy)
- **Volume**: Will be automatically adjusted to 30% in game
- **Style**: Should sound like a laser, gunshot, or energy blast

### Level Up Sound
- **File**: `level_up.mp3`
- **Format**: WAV (recommended) or MP3
- **Duration**: 0.5-1.0 seconds (longer for celebration)
- **Volume**: Will be automatically adjusted to 60% in game
- **Style**: Should sound triumphant, like a fanfare, chime, or power-up sound

## Sound Specifications

### Recommended Format
- **Format**: WAV (uncompressed) for best quality and low latency
- **Sample Rate**: 44.1kHz or 48kHz
- **Bit Depth**: 16-bit or 24-bit
- **Channels**: Mono (smaller file size) or Stereo

### Alternative Format
- **Format**: MP3 (compressed) for smaller file sizes
- **Bitrate**: 128kbps or higher
- **Sample Rate**: 44.1kHz

## File Naming Convention

Use descriptive names with underscores:
- `player_shoot.wav`
- `enemy_hit.wav`
- `player_hit.wav`
- `level_up.wav`
- `shop_open.wav`

## Volume Guidelines

- **Frequent sounds** (shooting, movement): 20-40% volume
- **Occasional sounds** (hits, pickups): 40-60% volume
- **Rare sounds** (level up, shop): 60-80% volume
- **UI sounds** (clicks, notifications): 30-50% volume

## Creating Sounds

### Free Sound Resources
- **Freesound.org**: Community sounds (check licenses)
- **Zapsplat**: Professional sound library (free tier available)
- **Adobe Audition**: Professional audio editing
- **Audacity**: Free audio editor

### Sound Design Tips
- Keep sounds short (0.1-0.5 seconds)
- Use consistent audio style across the game
- Test sounds at different volumes
- Consider audio compression for web delivery

## Integration

Sounds are automatically loaded when the game starts. The audio system will:
1. Load all preloaded sounds
2. Cache them in memory
3. Play them instantly when triggered
4. Handle volume mixing automatically

## Future Sounds

The system is ready for these additional sounds:
- Enemy hit/death sounds
- Player damage sounds
- Level up notification
- Shop interaction sounds
- Wave complete sounds
- Background music

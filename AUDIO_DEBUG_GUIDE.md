# Audio Debug Guide

## 🔍 Troubleshooting Your Shoot Sound

I've added extensive debugging to help identify why you can't hear the sound. Here's how to troubleshoot:

## 📋 Step-by-Step Debugging

### Step 1: Check Browser Console
1. **Open Developer Tools**: Press `F12` or right-click → "Inspect"
2. **Go to Console tab**
3. **Start the game** and try shooting
4. **Look for these messages**:

#### ✅ Expected Console Messages (Success)
```
Initializing sounds...
Audio debug info: { audioContext: { state: "running", ... }, ... }
Loading sound: player_shoot from /sounds/player_shoot.mp3
Successfully loaded sound: player_shoot
All sounds loaded successfully
playPlayerShootSound called
Attempting to play sound: player_shoot, volume: 0.3, enabled: true
Playing sound: player_shoot at volume 0.15
```

#### ❌ Common Error Messages
```
Failed to load sound player_shoot: HTTP 404: Not Found
Sound player_shoot not found in cache
Audio context not available
Audio disabled in config
```

### Step 2: Check File Path
Make sure your file is exactly here:
```
public/sounds/player_shoot.mp3
```

**Common mistakes:**
- ❌ `public/sounds/player_shoot.wav` (wrong extension)
- ❌ `public/sound/player_shoot.mp3` (missing 's' in sounds)
- ❌ `sounds/player_shoot.mp3` (missing public/ folder)

### Step 3: Test File Accessibility
1. **Open browser** and go to: `http://localhost:3000/sounds/player_shoot.mp3`
2. **Should play the sound** or download the file
3. **If 404 error**: File path is wrong

### Step 4: Check Audio Context State
Look in console for:
```
Audio debug info: { 
  audioContext: { 
    state: "suspended"  ← This is the problem!
  }
}
```

**Solution**: Click anywhere in the game or press any key to resume audio context.

## 🎯 Most Common Issues & Solutions

### Issue 1: Audio Context Suspended
**Symptoms**: No sound, console shows `state: "suspended"`
**Solution**: Click anywhere in the game or press any key
**Why**: Browsers require user interaction before playing audio

### Issue 2: File Not Found (404)
**Symptoms**: Console shows `HTTP 404: Not Found`
**Solutions**:
- Check file path: `public/sounds/player_shoot.mp3`
- Check file extension: `.mp3` not `.wav`
- Restart development server: `npm run dev`

### Issue 3: Audio Disabled
**Symptoms**: Console shows `Audio disabled in config`
**Solution**: Check if audio is muted in browser/system

### Issue 4: Wrong File Format
**Symptoms**: Console shows `Failed to decode audio data`
**Solutions**:
- Try converting to WAV format
- Check if MP3 file is corrupted
- Use a different audio file

### Issue 5: Volume Too Low
**Symptoms**: Sound plays but very quiet
**Solutions**:
- Check system volume
- Check browser volume
- Check if audio is muted

## 🔧 Quick Fixes

### Fix 1: Restart Everything
```bash
# Stop the dev server (Ctrl+C)
# Then restart:
npm run dev
```

### Fix 2: Clear Browser Cache
- Press `Ctrl+Shift+R` (hard refresh)
- Or clear browser cache completely

### Fix 3: Try Different File
1. **Download a test sound**: [Free laser sound](https://freesound.org/search/?q=laser+shoot)
2. **Convert to MP3**: Use online converter
3. **Replace the file**: `public/sounds/player_shoot.mp3`

### Fix 4: Test with WAV
1. **Convert your MP3 to WAV**
2. **Update the path** in `lib/game/audio/sounds.ts`:
   ```typescript
   path: '/sounds/player_shoot.wav',  // Change from .mp3 to .wav
   ```

## 🎵 Audio File Requirements

### Recommended Specifications
- **Format**: WAV (uncompressed) or MP3 (compressed)
- **Duration**: 0.1-0.3 seconds
- **Sample Rate**: 44.1kHz
- **Bit Depth**: 16-bit
- **Channels**: Mono or Stereo
- **File Size**: Under 100KB

### Test File
If you need a test file, you can:
1. **Record a short "pew" sound** with your phone
2. **Use online text-to-speech** to generate a "pew" sound
3. **Download from Freesound.org** (free account required)

## 🚨 Emergency Fallback

If nothing works, try this simple test:

### Create Test Sound
1. **Create a simple beep** using online tone generator
2. **Save as WAV file**
3. **Place in**: `public/sounds/player_shoot.wav`
4. **Update path** in `sounds.ts`:
   ```typescript
   path: '/sounds/player_shoot.wav',
   ```

## 📞 Still Not Working?

If you're still having issues, please share:
1. **Console output** (copy/paste the messages)
2. **File path** you're using
3. **Browser** you're testing in
4. **File format** (MP3/WAV) and size

The debugging messages will tell us exactly what's going wrong! 🔍

# Settings Debug Guide

## 🐛 Game Restart Bug Investigation

You're experiencing a bug where changing the volume in settings causes the game to restart instead of just updating the volume. Let me help you debug this.

## 🔍 Debugging Steps

### Step 1: Check Console Messages
When you change the volume, you should see:
```
handleSettingsChange called with: { masterVolume: 50, reduceMotion: false, disableScreenShake: false }
```

If you see this instead:
```
handleReturnToMainMenu called - this will restart the game!
```

Then you're accidentally clicking the "Wróć do menu głównego" button.

### Step 2: Check Which Button You're Clicking

In the settings modal, there are **two buttons**:

1. **"Wróć"** (Back) - Returns to stats modal, keeps game running
2. **"Wróć do menu głównego"** (Return to main menu) - Restarts the game

Make sure you're clicking **"Wróć"** and not **"Wróć do menu głównego"**.

## 🎯 Most Likely Causes

### Cause 1: Accidental Button Click
- **Problem**: Clicking "Wróć do menu głównego" instead of "Wróć"
- **Solution**: Be careful which button you click
- **Visual**: The dangerous button is red/danger colored

### Cause 2: Focus Issue
- **Problem**: Tab key navigation might be selecting the wrong button
- **Solution**: Use mouse clicks instead of keyboard navigation
- **Check**: Press Tab in settings to see which button is highlighted

### Cause 3: Modal Layout Issue
- **Problem**: Buttons might be too close together
- **Solution**: I can adjust the button spacing if needed

## 🔧 Quick Test

1. **Open settings** (ESC → Ustawienia)
2. **Change volume** (move the slider)
3. **Check console** for the debug message
4. **Click "Wróć"** (not the red button)
5. **Game should resume** from where you paused

## 🎨 Button Layout

```
┌─────────────────────────────────┐
│           Ustawienia            │
├─────────────────────────────────┤
│ Audio                           │
│ Głośność główna: [====●====] 50%│
├─────────────────────────────────┤
│ Efekty wizualne                 │
│ [Toggle] Ogranicz ruch          │
│ [Toggle] Wyłącz wstrząsy ekranu │
├─────────────────────────────────┤
│        [Wróć] [Wróć do menu]    │
│         ↑        ↑              │
│      SAFE    DANGEROUS          │
└─────────────────────────────────┘
```

## 🚨 If Still Restarting

If you're still getting restarts after being careful with button clicks, please share:

1. **Console output** when you change volume
2. **Which button** you're clicking
3. **Browser** you're using
4. **Steps** you're taking exactly

The debug messages will tell us exactly what's happening! 🔍

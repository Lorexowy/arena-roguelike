'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

// Configuration and types
import { BASE_STATS, CANVAS_WIDTH, CANVAS_HEIGHT, updateCanvasDimensions, GAMEPLAY_SCALE } from '@/lib/game/config';
import { GameState, Bullet, Enemy, XPOrb, EnemyProjectile } from '@/lib/game/types';
import { ChampionId } from '@/lib/game/champions/catalog';
import { GameSettings, loadSettings, saveSettings } from '@/lib/game/settings';

// Game systems
import { createPlayer, updatePlayerMovement, updatePlayerIframes, addXP, resetPlayer, getPlayerSpeed, getPlayerSpeedDisplay, updatePlayerRegeneration } from '@/lib/game/systems/player';
import { createKeyState, createCursor, setupKeyboardListeners, setupMouseListeners } from '@/lib/game/systems/input';
import { spawnBullets, updateBullets } from '@/lib/game/systems/bullets';
import { spawnRunaansShots, shouldFireRunaansShots } from '@/lib/game/systems/runaansHurricane';
import { spawnEnemy, updateEnemies } from '@/lib/game/systems/enemies';
import { updateXPOrbs } from '@/lib/game/systems/xp';
import { createWaveState, updateWaveBanner, checkWaveCleared, resetWaveState, startWaveBreak, updateBreakCountdown, startNextWave, prepareNextWave, pauseBreak, resumeBreak } from '@/lib/game/systems/waves';
import { generateUpgradeChoices, applyUpgrade, getUpgradeInfo, UpgradeId, UpgradeTier } from '@/lib/game/systems/upgrades';
import { handleBulletEnemyCollisions, handleEnemyPlayerCollisions, handleProjectilePlayerCollisions } from '@/lib/game/systems/collision';
import { createScreenShake, triggerScreenShake, updateScreenShake } from '@/lib/game/systems/effects';
import { renderGameObjects, drawWaveCompleteBanner, drawCountdown, drawGetReady } from '@/lib/game/systems/render';
import { updateShooters, updateEnemyProjectiles } from '@/lib/game/systems/enemyProjectiles';
import { initializeSounds, playMerchantArrivalSound } from '@/lib/game/audio/sounds';
import { audioManager } from '@/lib/game/audio/audioManager';
import { createDamageNumberPool, updateDamageNumbers, drawDamageNumbers } from '@/lib/game/systems/damageNumbers';
import { createMoneyIndicatorPool, updateMoneyIndicators, drawMoneyIndicators } from '@/lib/game/systems/moneyIndicators';
import { createUpgradeCount } from '@/lib/game/systems/hud';

// UI Components
import GameHUD from './GameHUD';
import FullStatsModal from './FullStatsModal';
import SettingsModal from './SettingsModal';
import IntroScreen from './IntroScreen';
import ShopModal from './ShopModal';

// Shop system
import { createShopState, shouldShopAppear, updateShopAppearance, openShop, closeShop, rerollShop, purchaseShopItem, ShopState } from '@/lib/game/shop/logic';

/**
 * GameCanvas Component
 * 
 * Main game with:
 * - Pixelated game canvas (full viewport)
 * - DOM-based crisp HUD overlay
 * - Full Stats and Settings modals
 * - Pause/resume system
 */

interface GameCanvasProps {
  onBackToMenu?: () => void;
  selectedChampion: ChampionId;
}

type ModalState = 'none' | 'stats' | 'settings' | 'shop';

export default function GameCanvas({ onBackToMenu, selectedChampion }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // React state for UI
  const [gameOverlayState, setGameOverlayState] = useState<GameState>('playing');
  const [upgradeOptions, setUpgradeOptions] = useState<Array<{ id: UpgradeId; tier: UpgradeTier }>>([]);
  const [rerollCost, setRerollCost] = useState(3); // Starts at $3, increases by $3 per reroll
  const [modalState, setModalState] = useState<ModalState>('none');
  const [settings, setSettings] = useState<GameSettings>(loadSettings());
  
  // Shop state
  const [shopState, setShopState] = useState<ShopState>(createShopState());
  const [showShopBanner, setShowShopBanner] = useState(false);
  
  // HUD state (updated every frame)
  const [hudState, setHUDState] = useState({
    health: 5,
    maxHealth: 5,
    level: 1,
    xp: 0,
    xpToNextLevel: 50,
    survivalTime: 0,
    fireRate: 2.5,
    moveSpeed: 1.5,
    damage: 1,
    multishot: 1,
    currentWave: 1,
    magnetRadius: 64,
    critChance: 0,
    money: 0,
    lifesteal: 0,
    killCount: 0,
    upgradeCount: {
      multishot: 0,
      attackSpeed: 0,
      magnet: 0,
      moveSpeed: 0,
      damage: 0,
      critChance: 0,
    },
  });

  const handleSettingsChange = useCallback((newSettings: GameSettings) => {
    console.log('handleSettingsChange called with:', newSettings);
    setSettings(newSettings);
    saveSettings(newSettings);
    
    // Update audio manager with new volumes
    audioManager.updateConfig({
      masterVolume: newSettings.masterVolume / 100, // Convert 0-100 to 0.0-1.0
      effectsVolume: newSettings.effectsVolume / 100, // Convert 0-100 to 0.0-1.0
    });
  }, []);

  const handleReturnToMainMenu = useCallback(() => {
    console.log('handleReturnToMainMenu called - this will restart the game!');
    // Reset game and return to menu
    interface WindowWithGameAPI extends Window {
      restartArenaGame?: () => void;
    }
    (window as unknown as WindowWithGameAPI).restartArenaGame?.();
    onBackToMenu?.();
  }, [onBackToMenu]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match viewport
    const updateCanvasSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      updateCanvasDimensions(width, height);
    };
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    containerRef.current?.focus();

    // Initialize audio system (only once)
    initializeSounds().catch(console.error);
    
    // Set initial audio volumes from settings
    audioManager.updateConfig({
      masterVolume: settings.masterVolume / 100, // Convert 0-100 to 0.0-1.0
      effectsVolume: settings.effectsVolume / 100, // Convert 0-100 to 0.0-1.0
    });

    // === GAME STATE INITIALIZATION ===
    let gameState: GameState = 'intro';
    let previousGameState: GameState = 'intro'; // Track state before modal
    let isPaused = false;
    let startTime = Date.now();
    let pausedTime = 0;
    let pauseStartTime = 0;
    let lastFireTime = 0;
    let lastRunaansFireTime = 0;
    let getReadyEndTime = 0;
    let waveCompleteEndTime = 0;
    let lastFrameTime = Date.now(); // For delta time calculation
    const TARGET_FPS = 60;
    const FRAME_TIME = 1000 / TARGET_FPS; // ~16.67ms per frame

    const player = createPlayer(selectedChampion);
    const bullets: Bullet[] = [];
    const enemies: Enemy[] = [];
    const enemyProjectiles: EnemyProjectile[] = [];
    const xpOrbs: XPOrb[] = [];
    const waveState = createWaveState();
    const screenShake = createScreenShake();
    const cursor = createCursor();
    const keys = createKeyState();
    const damageNumbers = createDamageNumberPool();
    const moneyIndicators = createMoneyIndicatorPool();
    const upgradeCount = createUpgradeCount();

    let pendingUpgrades: Array<{ id: UpgradeId; tier: UpgradeTier }> = [];
    let currentRerollCost = 3; // Track reroll cost in game engine
    
    // Shop engine state
    let internalShopState = createShopState();

    // Window API
    interface WindowWithGameAPI extends Window {
      restartArenaGame?: () => void;
      getArenaGameState?: () => GameState;
      arenaApplyUpgrade?: (upgradeId: string, tier: number) => void;
      arenaGetPendingUpgrades?: () => Array<{ id: UpgradeId; tier: UpgradeTier }>;
      arenaLevelUpOccurred?: () => void;
      arenaPauseGame?: () => void;
      arenaResumeGame?: () => void;
      arenaStartGame?: () => void;
      arenaRerollUpgrades?: (cost: number) => { success: boolean; newOptions: Array<{ id: UpgradeId; tier: UpgradeTier }> };
      arenaOpenShop?: () => void;
      arenaGetShopState?: () => ShopState;
      arenaShopPurchase?: (entryId: string) => boolean;
      arenaShopReroll?: () => boolean;
      arenaCloseShop?: () => void;
      arenaShopAvailable?: () => void;
      arenaHideShopBanner?: () => void;
    }
    const win = window as unknown as WindowWithGameAPI;

    // === INPUT SETUP ===
    const cleanupKeyboard = setupKeyboardListeners(keys);
    const cleanupMouse = setupMouseListeners(canvas, cursor);

    // === PAUSE/RESUME ===
    const pauseGame = () => {
      if (!isPaused) {
        isPaused = true;
        pauseStartTime = Date.now();
        
        // Snapshot break remaining time if in a break
        if (waveState.breakActive) {
          pauseBreak(waveState, Date.now());
        }
      }
    };

    const resumeGame = () => {
      if (isPaused) {
        const now = Date.now();
        pausedTime += now - pauseStartTime;
        isPaused = false;
        
        // Restore break deadline if in a break
        if (waveState.breakActive) {
          const breakExpired = resumeBreak(waveState, now);
          
          // If break expired while modal was open, start wave immediately
          if (breakExpired) {
            prepareNextWave(waveState);
            startNextWave(waveState, now);
          }
        }
      }
    };

    // Start the actual game flow
    const startGame = () => {
      gameState = 'getready';
      getReadyEndTime = Date.now() + 1000; // 1 second "Get ready"
    };

    win.arenaPauseGame = pauseGame;
    win.arenaResumeGame = resumeGame;
    win.arenaStartGame = startGame;

    // === GAME LOGIC ===
    const handleLevelUp = () => {
      previousGameState = gameState; // Save current state before opening modal
      gameState = 'levelup';
      pauseGame(); // Pause timer and break countdown during level-up
      pendingUpgrades = generateUpgradeChoices(3, waveState.currentWave);
      currentRerollCost = 3; // Reset reroll cost for new level-up
      triggerScreenShake(screenShake);
      win.arenaLevelUpOccurred?.();
    };

    const update = (deltaTime: number) => {
      const now = Date.now();

      // Handle intro states (no gameplay)
      if (gameState === 'intro') return;

      // Handle "Get Ready" state
      if (gameState === 'getready') {
        if (now >= getReadyEndTime) {
          gameState = 'countdown';
          // Don't call prepareNextWave for first wave (already at wave 1)
          startWaveBreak(waveState, now);
        }
        return;
      }

      // Handle wave complete state (show banner, then start break countdown)
      if (gameState === 'waveComplete') {
        if (now >= waveCompleteEndTime) {
          gameState = 'countdown';
          prepareNextWave(waveState);
          startWaveBreak(waveState, now);
        }
        // Continue with game logic during wave complete banner
      }

      // Handle countdown state (break between waves) - game continues running
      if (gameState === 'countdown') {
        // Check if shop should appear (once per break)
        if (!waveState.shopBannerShown) {
          const shouldAppear = shouldShopAppear(internalShopState, waveState.currentWave);
          waveState.shopAvailable = shouldAppear;
          waveState.shopBannerShown = true; // Mark as checked regardless of result
          updateShopAppearance(internalShopState, shouldAppear);
          
          if (shouldAppear) {
            // Play merchant arrival sound
            playMerchantArrivalSound();
            
            // Trigger shop banner in React
            win.arenaShopAvailable?.();
          }
        }
        
        // Update break countdown (deadline-based)
        const breakComplete = updateBreakCountdown(waveState, now);
        if (breakComplete) {
          // Break naturally completed - start next wave
          gameState = 'playing';
          startNextWave(waveState, now);
          // Reset shop flags for next break
          waveState.shopAvailable = false;
          waveState.shopBannerShown = false;
          // Hide shop banner in React
          win.arenaHideShopBanner?.();
        }
        // Continue with game logic during countdown
      }

      // Pause checks (only for levelup, gameover, and manual pause)
      if (gameState === 'levelup' || gameState === 'gameover' || isPaused) return;
      updateWaveBanner(waveState, now);
      updatePlayerIframes(player, now);
      updatePlayerMovement(player, keys, deltaTime);

      const fireRate = 1000 / player.championAttackSpeed; // Convert attacks per second to milliseconds between shots
      if (now - lastFireTime >= fireRate) {
        spawnBullets(bullets, player, cursor);
        lastFireTime = now;
      }

      // Handle Runaan's Hurricane auto-targeting shots
      if (shouldFireRunaansShots(player, lastRunaansFireTime, now)) {
        spawnRunaansShots(bullets, player, enemies, now);
        lastRunaansFireTime = now;
      }

      updateBullets(bullets, deltaTime);

      // Spawn chasers
      if (waveState.waveActive && 
          waveState.enemiesSpawned < waveState.enemiesToSpawn) {
        spawnEnemy(enemies, waveState, 'chaser');
      }

      // Spawn shooters (starting wave 3)
      if (waveState.waveActive && 
          waveState.shootersSpawned < waveState.shootersToSpawn) {
        spawnEnemy(enemies, waveState, 'shooter');
        waveState.shootersSpawned++;
      }

      updateEnemies(enemies, player, deltaTime);
      
      // Update shooters and their projectiles
      updateShooters(enemies, enemyProjectiles, player, now, waveState.currentWave);
      updateEnemyProjectiles(enemyProjectiles, deltaTime);

      const xpCollected = updateXPOrbs(xpOrbs, player, deltaTime);
      if (xpCollected > 0) {
        const leveledUp = addXP(player, xpCollected);
        if (leveledUp) {
          handleLevelUp();
        }
      }

      // Handle collisions and earn money
      const moneyEarned = handleBulletEnemyCollisions(bullets, enemies, xpOrbs, damageNumbers, moneyIndicators, player, waveState, now);
      player.money += moneyEarned;
      
      // Update HP regeneration
      updatePlayerRegeneration(player, now, deltaTime);
      
      const playerDiedFromEnemy = handleEnemyPlayerCollisions(enemies, player, damageNumbers, now);
      const playerDiedFromProjectile = handleProjectilePlayerCollisions(enemyProjectiles, player, damageNumbers, now);
      
      if (playerDiedFromEnemy || playerDiedFromProjectile) {
        gameState = 'gameover';
        if (!settings.disableScreenShake) {
          triggerScreenShake(screenShake);
        }
      }

      // Check if wave cleared
      const waveCleared = checkWaveCleared(waveState, enemies.length);
      if (waveCleared) {
        gameState = 'waveComplete';
        waveCompleteEndTime = now + 2000; // Show "Wave Complete" for 2s
      }
      
      if (!settings.disableScreenShake) {
        updateScreenShake(screenShake, now);
      } else {
        screenShake.active = false;
        screenShake.offsetX = 0;
        screenShake.offsetY = 0;
      }
      
      updateDamageNumbers(damageNumbers, now, deltaTime);
      updateMoneyIndicators(moneyIndicators, now, deltaTime);
    };

    const gameLoop = () => {
      const now = Date.now();
      
      // Calculate delta time (capped to prevent spiral of death)
      const rawDelta = now - lastFrameTime;
      const deltaTime = Math.min(rawDelta, 100); // Cap at 100ms to prevent huge jumps
      lastFrameTime = now;
      
      // Calculate elapsed time (pause only during intro, getready, levelup, and manual pause)
      const shouldPauseTimer = gameState === 'intro' || gameState === 'getready' || 
                                gameState === 'levelup' || isPaused;
      
      if (shouldPauseTimer && !isPaused && gameState !== 'levelup') {
        // Track automatic pause time (intro, getready)
        pausedTime = now - startTime;
      }
      
      const elapsed = now - startTime - pausedTime;
      
      update(deltaTime);

      // Render game objects (pixelated)
      ctx.imageSmoothingEnabled = false;
      renderGameObjects(ctx, player, enemies, bullets, xpOrbs, enemyProjectiles, waveState, screenShake, cursor);

      // Render state-specific overlays
      ctx.imageSmoothingEnabled = false;
      
      if (gameState === 'getready') {
        drawGetReady(ctx);
      } else if (gameState === 'countdown') {
        drawCountdown(ctx, waveState.countdownRemaining);
      } else if (gameState === 'waveComplete') {
        drawWaveCompleteBanner(ctx);
      }

      // Render damage numbers and money indicators (crisp)
      ctx.imageSmoothingEnabled = true;
      if (!settings.reduceMotion) {
        drawDamageNumbers(ctx, damageNumbers, now);
        drawMoneyIndicators(ctx, moneyIndicators, now);
      }

      // Update HUD state for React
      if (Math.random() < 0.1) { // Update HUD state less frequently
        setHUDState({
          health: player.health,
          maxHealth: player.maxHealth,
          level: player.level,
          xp: player.xp,
          xpToNextLevel: player.xpToNextLevel,
          survivalTime: Math.floor(elapsed / 1000),
          fireRate: player.championAttackSpeed,
          moveSpeed: getPlayerSpeedDisplay(player),  // Use display version for HUD
          damage: player.championDamage,
          multishot: player.multishot,
          currentWave: waveState.currentWave,
          magnetRadius: (BASE_STATS.xp.magnetRadius * player.magnetMultiplier) / GAMEPLAY_SCALE,  // Unscale for display
          critChance: player.critChance,
          money: player.money,
          lifesteal: player.lifesteal,
          killCount: player.killCount,
          upgradeCount: {
            multishot: upgradeCount.multishot,
            attackSpeed: upgradeCount.attackSpeed,
            magnet: upgradeCount.magnet,
            moveSpeed: upgradeCount.moveSpeed,
            damage: upgradeCount.damage,
            critChance: upgradeCount.critChance,
          },
        });
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    let animationFrameId: number;
    gameLoop();

    // === EXTERNAL API ===
    const restartGame = () => {
      gameState = 'intro';
      isPaused = false;
      startTime = Date.now();
      pausedTime = 0;
      lastFireTime = 0;
      lastRunaansFireTime = 0;
      getReadyEndTime = 0;
      waveCompleteEndTime = 0;
      
      resetPlayer(player, selectedChampion);
      bullets.length = 0;
      enemies.length = 0;
      enemyProjectiles.length = 0;
      xpOrbs.length = 0;
      pendingUpgrades.length = 0;
      resetWaveState(waveState);
      
      for (const dn of damageNumbers) {
        dn.active = false;
      }

      upgradeCount.multishot = 0;
      upgradeCount.attackSpeed = 0;
      upgradeCount.magnet = 0;
      upgradeCount.moveSpeed = 0;
      upgradeCount.damage = 0;
      upgradeCount.critChance = 0;
      
      screenShake.active = false;
      screenShake.offsetX = 0;
      screenShake.offsetY = 0;
      
      // Reset shop state
      internalShopState = createShopState();
    };

    const applyUpgradeChoice = (upgradeId: string, tier: number) => {
      applyUpgrade(player, upgradeId as UpgradeId, tier as UpgradeTier, upgradeCount);
      
      // Restore the state we were in before level-up modal
      // If we were in countdown or waveComplete, stay there to finish the break
      if (previousGameState === 'countdown' || previousGameState === 'waveComplete') {
        gameState = previousGameState;
      } else {
        gameState = 'playing';
      }
      
      resumeGame(); // Resume timer and break countdown after level-up
    };

    const rerollUpgrades = (cost: number): { success: boolean; newOptions: Array<{ id: UpgradeId; tier: UpgradeTier }> } => {
      // Check if player has enough money
      if (player.money < cost) {
        return { success: false, newOptions: [] };
      }
      
      // Deduct money
      player.money -= cost;
      
      // Generate new upgrade options
      const newOptions = generateUpgradeChoices(3, waveState.currentWave);
      pendingUpgrades = newOptions;
      
      return { success: true, newOptions };
    };

    // Shop API
    const handleOpenShop = () => {
      openShop(internalShopState, player, upgradeCount, waveState.currentWave);
      pauseGame();
    };
    
    const handleCloseShop = () => {
      closeShop(internalShopState);
      resumeGame();
    };
    
    const handleShopPurchase = (entryId: string): boolean => {
      return purchaseShopItem(internalShopState, player, upgradeCount, entryId, waveState.currentWave);
    };
    
    const handleShopReroll = (): boolean => {
      return rerollShop(internalShopState, player, upgradeCount, waveState.currentWave);
    };
    
    win.restartArenaGame = restartGame;
    win.getArenaGameState = () => gameState;
    win.arenaApplyUpgrade = applyUpgradeChoice;
    win.arenaGetPendingUpgrades = () => pendingUpgrades;
    win.arenaRerollUpgrades = rerollUpgrades;
    win.arenaOpenShop = handleOpenShop;
    win.arenaGetShopState = () => internalShopState;
    win.arenaShopPurchase = handleShopPurchase;
    win.arenaShopReroll = handleShopReroll;
    win.arenaCloseShop = handleCloseShop;

    // === CLEANUP ===
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      cleanupKeyboard();
      cleanupMouse();
      cancelAnimationFrame(animationFrameId);
      delete win.restartArenaGame;
      delete win.getArenaGameState;
      delete win.arenaApplyUpgrade;
      delete win.arenaGetPendingUpgrades;
      delete win.arenaLevelUpOccurred;
      delete win.arenaPauseGame;
      delete win.arenaResumeGame;
      delete win.arenaStartGame;
      delete win.arenaRerollUpgrades;
      delete win.arenaOpenShop;
      delete win.arenaGetShopState;
      delete win.arenaShopPurchase;
      delete win.arenaShopReroll;
      delete win.arenaCloseShop;
      delete win.arenaShopAvailable;
      delete win.arenaHideShopBanner;
    };
  }, [onBackToMenu]);

  // React state sync
  useEffect(() => {
    interface WindowWithGameAPI extends Window {
      restartArenaGame?: () => void;
      getArenaGameState?: () => GameState;
      arenaApplyUpgrade?: (upgradeId: string, tier: number) => void;
      arenaGetPendingUpgrades?: () => Array<{ id: UpgradeId; tier: UpgradeTier }>;
      arenaLevelUpOccurred?: () => void;
      arenaPauseGame?: () => void;
      arenaResumeGame?: () => void;
      arenaGetShopState?: () => ShopState;
      arenaShopAvailable?: () => void;
      arenaHideShopBanner?: () => void;
    }
    const win = window as unknown as WindowWithGameAPI;

    const interval = setInterval(() => {
      const state = win.getArenaGameState?.() || 'playing';
      setGameOverlayState(state);
      
      if (state === 'levelup') {
        const options = win.arenaGetPendingUpgrades?.() || [];
        setUpgradeOptions([...options]);
      }
      
      // Sync shop state
      const currentShopState = win.arenaGetShopState?.();
      if (currentShopState) {
        setShopState({...currentShopState});
      }
    }, 100);

    win.arenaLevelUpOccurred = () => {
      const options = win.arenaGetPendingUpgrades?.() || [];
      setUpgradeOptions([...options]);
      setGameOverlayState('levelup');
    };
    
    win.arenaShopAvailable = () => {
      setShowShopBanner(true);
    };
    
    win.arenaHideShopBanner = () => {
      setShowShopBanner(false);
    };

    return () => clearInterval(interval);
  }, []);

  // ESC key handling for modals
  useEffect(() => {
    interface WindowWithGameAPI extends Window {
      arenaPauseGame?: () => void;
      arenaResumeGame?: () => void;
    }
    const win = window as unknown as WindowWithGameAPI;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Resume audio context on first user interaction
      audioManager.resumeContext().catch(console.error);
      
      if (e.key === 'Escape') {
        // Shop modal has its own ESC handler
        if (modalState === 'shop') {
          return;
        }
        
        // Allow ESC during playing, countdown, and waveComplete states
        if (gameOverlayState !== 'playing' && 
            gameOverlayState !== 'countdown' && 
            gameOverlayState !== 'waveComplete') {
          return; // Don't interfere with intro, getready, levelup, gameover
        }
        
        e.preventDefault();
        if (modalState === 'none') {
          setModalState('stats');
          win.arenaPauseGame?.();
        } else if (modalState === 'stats') {
          setModalState('none');
          win.arenaResumeGame?.();
        } else if (modalState === 'settings') {
          setModalState('stats');
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [modalState, gameOverlayState]);

  const handleRestart = () => {
    interface WindowWithGameAPI extends Window {
      restartArenaGame?: () => void;
    }
    (window as unknown as WindowWithGameAPI).restartArenaGame?.();
    setGameOverlayState('playing');
    setShowShopBanner(false);
    setModalState('none');
  };

  const handleUpgradeSelect = (upgradeId: UpgradeId, tier: UpgradeTier) => {
    interface WindowWithGameAPI extends Window {
      arenaApplyUpgrade?: (upgradeId: string, tier: number) => void;
    }
    (window as unknown as WindowWithGameAPI).arenaApplyUpgrade?.(upgradeId, tier);
    setGameOverlayState('playing');
    setRerollCost(3); // Reset reroll cost for next level-up
  };

  const handleReroll = () => {
    interface WindowWithGameAPI extends Window {
      arenaRerollUpgrades?: (cost: number) => { success: boolean; newOptions: Array<{ id: UpgradeId; tier: UpgradeTier }> };
    }
    const result = (window as unknown as WindowWithGameAPI).arenaRerollUpgrades?.(rerollCost);
    if (result?.success) {
      setUpgradeOptions(result.newOptions);
      setRerollCost(prev => prev + 3); // Increase cost by $3 for next reroll
    }
  };

  const handleOpenStats = () => {
    interface WindowWithGameAPI extends Window {
      arenaPauseGame?: () => void;
    }
    setModalState('stats');
    (window as unknown as WindowWithGameAPI).arenaPauseGame?.();
  };

  const handleCloseStats = () => {
    interface WindowWithGameAPI extends Window {
      arenaResumeGame?: () => void;
    }
    setModalState('none');
    (window as unknown as WindowWithGameAPI).arenaResumeGame?.();
  };

  const handleOpenSettings = () => {
    setModalState('settings');
  };

  const handleCloseSettings = () => {
    setModalState('stats');
  };

  const handleIntroStart = () => {
    interface WindowWithGameAPI extends Window {
      arenaStartGame?: () => void;
    }
    (window as unknown as WindowWithGameAPI).arenaStartGame?.();
  };

  // Shop handlers
  const handleOpenShop = () => {
    interface WindowWithGameAPI extends Window {
      arenaOpenShop?: () => void;
    }
    setShowShopBanner(false);
    setModalState('shop');
    (window as unknown as WindowWithGameAPI).arenaOpenShop?.();
  };

  const handleCloseShop = () => {
    interface WindowWithGameAPI extends Window {
      arenaCloseShop?: () => void;
    }
    setModalState('none');
    (window as unknown as WindowWithGameAPI).arenaCloseShop?.();
  };

  const handleShopPurchase = (entryId: string) => {
    interface WindowWithGameAPI extends Window {
      arenaShopPurchase?: (entryId: string) => boolean;
    }
    const success = (window as unknown as WindowWithGameAPI).arenaShopPurchase?.(entryId);
    if (success) {
      // Auto-close after purchase (since purchase limit is 1)
      setTimeout(() => {
        handleCloseShop();
      }, 500); // Small delay to show purchase feedback
    }
  };

  const handleShopReroll = () => {
    interface WindowWithGameAPI extends Window {
      arenaShopReroll?: () => boolean;
    }
    (window as unknown as WindowWithGameAPI).arenaShopReroll?.();
  };

  return (
    <div 
      ref={containerRef}
      className="game-container"
      tabIndex={0}
    >
      {/* Game canvas (pixelated) */}
      <canvas
        ref={canvasRef}
        className="game-canvas"
      />

      {/* Intro Screen */}
      {gameOverlayState === 'intro' && (
        <IntroScreen onStart={handleIntroStart} />
      )}

      {/* DOM-based HUD overlay (crisp) */}
      {gameOverlayState === 'playing' && modalState === 'none' && (
        <GameHUD
          {...hudState}
          onOpenStats={handleOpenStats}
        />
      )}
      
      {/* HUD during breaks (countdown/waveComplete) */}
      {(gameOverlayState === 'countdown' || gameOverlayState === 'waveComplete') && modalState === 'none' && (
        <GameHUD
          {...hudState}
          onOpenStats={handleOpenStats}
        />
      )}

      {/* Shop Banner */}
      {showShopBanner && modalState === 'none' && (
        <div className="shop-banner">
          <div className="shop-banner-content">
            <h3 className="shop-banner-title">🏪 Merchant has arrived!</h3>
            <button 
              className="shop-banner-button"
              onClick={handleOpenShop}
            >
              Open Shop
            </button>
          </div>
        </div>
      )}

      {/* Full Stats Modal */}
      {modalState === 'stats' && (
        <FullStatsModal
          level={hudState.level}
          damage={hudState.damage}
          fireRate={hudState.fireRate}
          moveSpeed={hudState.moveSpeed}
          multishot={hudState.multishot}
          magnetRadius={hudState.magnetRadius}
          critChance={hudState.critChance}
          money={hudState.money}
          currentWave={hudState.currentWave}
          survivalTime={hudState.survivalTime}
          upgradeCount={hudState.upgradeCount}
          onClose={handleCloseStats}
          onOpenSettings={handleOpenSettings}
        />
      )}

      {/* Settings Modal */}
      {modalState === 'settings' && (
        <SettingsModal
          settings={settings}
          onSettingsChange={handleSettingsChange}
          onBack={handleCloseSettings}
          onReturnToMainMenu={handleReturnToMainMenu}
        />
      )}

      {/* Shop Modal */}
      {modalState === 'shop' && (
        <ShopModal
          currentOffer={shopState.currentOffer}
          currentWave={hudState.currentWave}
          playerMoney={hudState.money}
          rerollCost={shopState.rerollCost}
          purchasesMade={shopState.purchasesMade}
          onPurchase={handleShopPurchase}
          onReroll={handleShopReroll}
          onClose={handleCloseShop}
        />
      )}

      {/* Level-Up Overlay */}
      {gameOverlayState === 'levelup' && (
        <div className="overlay">
          <div className="levelup-content">
            <h2 className="levelup-title">LEVEL UP!</h2>
            <p className="levelup-subtitle">Choose an upgrade</p>
            
            <div className="upgrade-cards">
              {upgradeOptions.map((option) => {
                const info = getUpgradeInfo(option.id, option.tier);
                return (
                  <button
                    key={`${option.id}-${option.tier}`}
                    onClick={() => handleUpgradeSelect(option.id, option.tier)}
                    className="upgrade-card"
                  >
                    <h3 className="upgrade-name">{info.name}</h3>
                    <p className="upgrade-desc">{info.desc}</p>
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleReroll}
              disabled={hudState.money < rerollCost}
              className="reroll-button"
              title={`Reroll upgrade options for $${rerollCost}`}
            >
              🎲 Reroll (${rerollCost}$)
            </button>
          </div>
        </div>
      )}

      {/* Game Over Overlay */}
      {gameOverlayState === 'gameover' && (
        <div className="overlay">
          <div className="overlay-content">
            <h2 className="overlay-title">Game Over</h2>
            <p className="overlay-text">You were overwhelmed!</p>
            <div className="overlay-buttons">
              <button onClick={handleRestart} className="overlay-button primary">
                ↻ Restart
              </button>
              <button onClick={onBackToMenu} className="overlay-button secondary">
                ← Back to Menu
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .game-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100vw;
          height: 100vh;
          background-color: #000000;
          padding: 0;
          margin: 0;
          outline: none;
          position: fixed;
          top: 0;
          left: 0;
          overflow: hidden;
        }

        .game-canvas {
          width: 100vw;
          height: 100vh;
          image-rendering: pixelated;
          image-rendering: -moz-crisp-edges;
          image-rendering: crisp-edges;
          display: block;
        }

        .overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          animation: fadeIn 0.3s ease;
        }

        .overlay-content {
          background: linear-gradient(135deg, #1a1e2e 0%, #2a2e3e 100%);
          border: 3px solid #3a4352;
          border-radius: 12px;
          padding: 40px;
          text-align: center;
          min-width: 300px;
          box-shadow: 0 10px 50px rgba(0, 0, 0, 0.5);
        }

        .overlay-title {
          font-size: 36px;
          font-weight: 800;
          color: #FF4444;
          margin: 0 0 15px 0;
          text-shadow: 0 0 20px rgba(255, 68, 68, 0.5);
        }

        .overlay-text {
          font-size: 16px;
          color: #888;
          margin: 0 0 30px 0;
          font-family: monospace;
        }

        .overlay-buttons {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .overlay-button {
          padding: 14px 28px;
          font-size: 16px;
          font-weight: 600;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: monospace;
        }

        .overlay-button.primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .overlay-button.primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        .overlay-button.secondary {
          background-color: #2a3342;
          color: #aaa;
          border: 2px solid #3a4352;
        }

        .overlay-button.secondary:hover {
          background-color: #3a4352;
          color: #ccc;
        }

        .levelup-content {
          background: linear-gradient(135deg, #1a1e2e 0%, #2a2e3e 100%);
          border: 3px solid #FFD700;
          border-radius: 12px;
          padding: 40px;
          text-align: center;
          max-width: 700px;
          box-shadow: 0 10px 50px rgba(255, 215, 0, 0.3);
        }

        .levelup-title {
          font-size: 42px;
          font-weight: 800;
          color: #FFD700;
          margin: 0 0 10px 0;
          text-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
        }

        .levelup-subtitle {
          font-size: 16px;
          color: #888;
          margin: 0 0 30px 0;
          font-family: monospace;
        }

        .upgrade-cards {
          display: flex;
          gap: 15px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .upgrade-card {
          background: linear-gradient(135deg, #2a3342 0%, #3a4352 100%);
          border: 2px solid #4a5362;
          border-radius: 10px;
          padding: 20px;
          width: 180px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: center;
        }

        .upgrade-card:hover {
          border-color: #FFD700;
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(255, 215, 0, 0.3);
        }

        .reroll-button {
          margin-top: 20px;
          padding: 12px 24px;
          font-size: 16px;
          font-weight: 600;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border: 2px solid #34d399;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .reroll-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
        }

        .reroll-button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          background: #374151;
          border-color: #4b5563;
        }

        .upgrade-name {
          font-size: 18px;
          font-weight: 700;
          color: #FFD700;
          margin: 0 0 10px 0;
          font-family: monospace;
        }

        .upgrade-desc {
          font-size: 13px;
          color: #AAA;
          margin: 0;
          line-height: 1.4;
          font-family: monospace;
        }

        .shop-banner {
          position: fixed;
          top: 20%;
          left: 50%;
          transform: translateX(-50%);
          z-index: 150;
          animation: slideDown 0.5s ease;
        }

        .shop-banner-content {
          background: linear-gradient(135deg, #8B7355 0%, #A0826D 100%);
          border: 3px solid #F59E0B;
          border-radius: 12px;
          padding: 24px 32px;
          text-align: center;
          box-shadow: 0 10px 40px rgba(245, 158, 11, 0.5);
        }

        .shop-banner-title {
          font-size: 24px;
          font-weight: 800;
          color: #FFD700;
          margin: 0 0 16px 0;
          text-shadow: 0 0 15px rgba(255, 215, 0, 0.5);
        }

        .shop-banner-button {
          padding: 12px 28px;
          font-size: 16px;
          font-weight: 600;
          background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .shop-banner-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4);
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

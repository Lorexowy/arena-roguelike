/**
 * HUD System
 * 
 * Renders the stats panel and collected perks.
 * Uses crisp text rendering for better readability.
 */

import { CANVAS_WIDTH, CANVAS_HEIGHT, HUD_CONFIG, BASE_STATS } from '../config';
import { Player, WaveState, UpgradeCount } from '../types';

/**
 * Create upgrade counter
 */
export function createUpgradeCount(): UpgradeCount {
  return {
    multishot: 0,
    attackSpeed: 0,
    magnet: 0,
    moveSpeed: 0,
    damage: 0,
    critChance: 0,
  };
}

/**
 * Draw sharp HUD panel with stats
 */
export function drawHUDPanel(
  ctx: CanvasRenderingContext2D,
  player: Player,
  upgradeCount: UpgradeCount
): void {
  const panelX = CANVAS_WIDTH - HUD_CONFIG.panelWidth - 10;
  const panelY = 50;
  const padding = HUD_CONFIG.panelPadding;

  // Panel background
  ctx.fillStyle = 'rgba(10, 16, 32, 0.9)';
  ctx.strokeStyle = 'rgba(102, 126, 234, 0.5)';
  ctx.lineWidth = 2;
  ctx.fillRect(panelX, panelY, HUD_CONFIG.panelWidth, 200);
  ctx.strokeRect(panelX, panelY, HUD_CONFIG.panelWidth, 200);

  // Title
  ctx.fillStyle = '#FFD700';
  ctx.font = `bold ${HUD_CONFIG.statFontSize + 2}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('STATS', panelX + HUD_CONFIG.panelWidth / 2, panelY + padding);

  // Stats
  ctx.font = `${HUD_CONFIG.statFontSize}px monospace`;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#FFFFFF';
  
  let yOffset = panelY + padding + 20;
  const lineHeight = 18;

  // Level
  ctx.fillText(`Level: ${player.level}`, panelX + padding, yOffset);
  yOffset += lineHeight;

  // Attack Speed (shots per second)
  const fireRate = BASE_STATS.bullet.fireRate * player.fireRateMultiplier;
  const shotsPerSec = (1000 / fireRate).toFixed(1);
  ctx.fillText(`Fire Rate: ${shotsPerSec}/s`, panelX + padding, yOffset);
  yOffset += lineHeight;

  // Move Speed
  const moveSpeed = (player.baseSpeed * player.speedMultiplier).toFixed(1);
  ctx.fillText(`Move Spd: ${moveSpeed}`, panelX + padding, yOffset);
  yOffset += lineHeight;

  // Damage
  const damage = (BASE_STATS.bullet.damage * player.damageMultiplier).toFixed(1);
  ctx.fillText(`Damage: ${damage}`, panelX + padding, yOffset);
  yOffset += lineHeight;

  // Multishot
  if (player.multishot > 1) {
    ctx.fillText(`Multishot: ×${player.multishot}`, panelX + padding, yOffset);
    yOffset += lineHeight;
  }

  // Divider
  yOffset += 5;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(panelX + padding, yOffset);
  ctx.lineTo(panelX + HUD_CONFIG.panelWidth - padding, yOffset);
  ctx.stroke();
  yOffset += 10;

  // Perks section
  ctx.fillStyle = '#FFD700';
  ctx.font = `bold ${HUD_CONFIG.labelFontSize}px sans-serif`;
  ctx.fillText('PERKS', panelX + padding, yOffset);
  yOffset += 16;

  // Draw perk icons
  ctx.font = `${HUD_CONFIG.labelFontSize}px monospace`;
  ctx.fillStyle = '#FFFFFF';

  const perks: Array<{ label: string; count: number; color: string }> = [
    { label: 'AS', count: upgradeCount.attackSpeed, color: '#FF8844' },
    { label: 'MS', count: upgradeCount.moveSpeed, color: '#44FF88' },
    { label: 'DMG', count: upgradeCount.damage, color: '#FF4444' },
    { label: 'MAG', count: upgradeCount.magnet, color: '#FFD700' },
  ];

  if (player.multishot > 1) {
    perks.unshift({ label: 'MS', count: player.multishot - 1, color: '#8844FF' });
  }

  let perkY = yOffset;
  for (const perk of perks) {
    if (perk.count === 0) continue;

    // Perk box
    ctx.fillStyle = perk.color + '33';
    ctx.strokeStyle = perk.color;
    ctx.lineWidth = 2;
    ctx.fillRect(panelX + padding, perkY, 60, 20);
    ctx.strokeRect(panelX + padding, perkY, 60, 20);

    // Label
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${HUD_CONFIG.labelFontSize}px monospace`;
    ctx.fillText(`${perk.label} ${perk.count > 1 ? 'x' + perk.count : ''}`, 
                 panelX + padding + 4, perkY + 14);

    perkY += 24;
  }

  ctx.textAlign = 'left';
}

/**
 * Draw crisp timer and wave info (top HUD)
 */
export function drawTopHUD(
  ctx: CanvasRenderingContext2D,
  player: Player,
  waveState: WaveState,
  startTime: number
): void {
  const now = Date.now();

  // Timer (top-right)
  const elapsed = now - startTime;
  const totalSeconds = Math.floor(elapsed / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`, 
               CANVAS_WIDTH - 15, 25);

  // Level (below timer)
  ctx.fillStyle = '#FFD700';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText(`Level ${player.level}`, CANVAS_WIDTH - 15, 45);
  
  // Wave info (top-center)
  ctx.fillStyle = '#AAAAAA';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`Wave ${waveState.currentWave}`, CANVAS_WIDTH / 2, 20);
  
  if (waveState.currentModifier) {
    ctx.fillStyle = '#FF8844';
    ctx.font = '12px sans-serif';
    ctx.fillText(waveState.currentModifier.name, CANVAS_WIDTH / 2, 38);
  }

  ctx.textAlign = 'left';
}

/**
 * Draw hearts with crisp rendering
 */
export function drawHeartsHUD(ctx: CanvasRenderingContext2D, player: Player): void {
  const heartSize = 12;
  const heartSpacing = 18;
  
  for (let i = 0; i < player.maxHealth; i++) {
    const x = 15 + i * heartSpacing;
    const y = 15;
    
    if (i < player.health) {
      // Filled heart
      ctx.fillStyle = '#FF4444';
      ctx.beginPath();
      ctx.moveTo(x + heartSize / 2, y + 3);
      ctx.lineTo(x + heartSize, y);
      ctx.lineTo(x + heartSize, y + heartSize / 2);
      ctx.lineTo(x + heartSize / 2, y + heartSize);
      ctx.lineTo(x, y + heartSize / 2);
      ctx.lineTo(x, y);
      ctx.closePath();
      ctx.fill();
    } else {
      // Empty heart outline
      ctx.strokeStyle = '#444444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + heartSize / 2, y + 3);
      ctx.lineTo(x + heartSize, y);
      ctx.lineTo(x + heartSize, y + heartSize / 2);
      ctx.lineTo(x + heartSize / 2, y + heartSize);
      ctx.lineTo(x, y + heartSize / 2);
      ctx.lineTo(x, y);
      ctx.closePath();
      ctx.stroke();
    }
  }
}

/**
 * Draw XP bar with crisp text
 */
export function drawXPBarHUD(ctx: CanvasRenderingContext2D, player: Player): void {
  const xpBarWidth = CANVAS_WIDTH - 30;
  const xpBarHeight = 8;
  const xpBarX = 15;
  const xpBarY = CANVAS_HEIGHT - 25;
  const xpPercent = player.xp / player.xpToNextLevel;

  // Background
  ctx.fillStyle = '#1a2332';
  ctx.fillRect(xpBarX, xpBarY, xpBarWidth, xpBarHeight);

  // Fill
  ctx.fillStyle = '#FFD700';
  ctx.fillRect(xpBarX, xpBarY, xpBarWidth * xpPercent, xpBarHeight);

  // Border
  ctx.strokeStyle = '#3a4352';
  ctx.lineWidth = 2;
  ctx.strokeRect(xpBarX, xpBarY, xpBarWidth, xpBarHeight);

  // XP text (crisp)
  ctx.fillStyle = '#AAAAAA';
  ctx.font = '11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${player.xp}/${player.xpToNextLevel} XP`, CANVAS_WIDTH / 2, xpBarY - 5);
  ctx.textAlign = 'left';
}


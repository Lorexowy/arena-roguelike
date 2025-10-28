/**
 * Game HUD Overlay
 * 
 * DOM-based HUD for crisp text rendering.
 * Positioned at screen edges to not block gameplay.
 */

import React from 'react';

interface GameHUDProps {
  health: number;
  maxHealth: number;
  level: number;
  xp: number;
  xpToNextLevel: number;
  survivalTime: number; // seconds
  fireRate: number; // shots/sec
  moveSpeed: number;
  damage: number;
  multishot: number;
  upgradeCount: {
    multishot: number;
    attackSpeed: number;
    magnet: number;
    moveSpeed: number;
    damage: number;
    critChance: number;
  };
  critChance: number;
  money: number;
  lifesteal?: number;
  currentWave?: number;
  killCount?: number;
  fps?: number;
  shopKillsRemaining?: number;
  onOpenStats: () => void;
}

export default function GameHUD({
  health,
  maxHealth,
  level,
  xp,
  xpToNextLevel,
  survivalTime,
  fireRate,
  moveSpeed,
  damage,
  multishot,
  upgradeCount,
  critChance,
  money,
  lifesteal = 0,
  currentWave = 1,
  killCount = 0,
  fps = 0,
  shopKillsRemaining = 70,
  onOpenStats,
}: GameHUDProps) {
  const minutes = Math.floor(survivalTime / 60);
  const seconds = survivalTime % 60;
  const xpPercent = (xp / xpToNextLevel) * 100;

  // Collected perks with count > 0
  const perks = [
    { id: 'AS', name: 'Attack Speed', count: upgradeCount.attackSpeed, color: '#FF8844' },
    { id: 'MS', name: 'Move Speed', count: upgradeCount.moveSpeed, color: '#44FF88' },
    { id: 'DMG', name: 'Damage', count: upgradeCount.damage, color: '#FF4444' },
    { id: 'MAG', name: 'Magnet', count: upgradeCount.magnet, color: '#FFD700' },
    { id: 'MULTI', name: 'Multishot', count: upgradeCount.multishot, color: '#8844FF' },
    { id: 'CRIT', name: 'Crit Chance', count: upgradeCount.critChance, color: '#FACC15' },
  ].filter(p => p.count > 0);

  // Calculate HP percentage and color
  const hpPercent = (health / maxHealth) * 100;
  let hpColor = '#22C55E'; // Green
  if (hpPercent <= 25) {
    hpColor = '#EF4444'; // Red
  } else if (hpPercent <= 50) {
    hpColor = '#F59E0B'; // Orange/Yellow
  }

  // Format HP values for clean display (like professional games)
  const displayHealth = Math.floor(health);
  const displayMaxHealth = Math.floor(maxHealth);


  return (
    <div className="game-hud">
      {/* Left Side: Vertical HP Bar */}
      <div className="hud-hp-vertical">
        <div className="hp-text-horizontal">HP</div>
        <div className="hp-bar-container-vertical">
          <div 
            className="hp-bar-fill-vertical" 
            style={{ 
              height: `${hpPercent}%`,
              backgroundColor: hpColor,
            }}
          />
        </div>
        <div className="hp-values-vertical">
          <div className="hp-current">{displayHealth}</div>
          <div className="hp-separator">/</div>
          <div className="hp-max">{displayMaxHealth}</div>
        </div>
      </div>

      {/* Top-Left: FPS Counter */}
      <div className="hud-fps">
        <div className="fps-label">FPS</div>
        <div className="fps-value">{fps}</div>
      </div>

      {/* Top-Left: Mission Container */}
      <div className="hud-mission">
        <div className="mission-label">Current mission:</div>
        <div className="mission-text">Next shop: {shopKillsRemaining} kills</div>
      </div>

      {/* Top-Right: Time, Level, Money & Kills */}
      <div className="hud-top-right">
        <div className="time">
          {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
        </div>
        <div className="level">Level {level}</div>
        <div className="money">${money}</div>
        <div className="kills">kills: {killCount}</div>
      </div>

      {/* Right Side: Stat Pills */}
      <div className="hud-stat-pills">
        <div className="stat-pill" title={`Damage: ${damage.toFixed(1)}`}>
          <span className="stat-label">DMG</span>
          <span className="stat-value">{damage.toFixed(1)}</span>
        </div>
        <div className="stat-pill" title={`Fire Rate: ${fireRate.toFixed(1)} shots/sec`}>
          <span className="stat-label">FR</span>
          <span className="stat-value">{fireRate.toFixed(1)}</span>
        </div>
        <div className="stat-pill" title={`Move Speed: ${moveSpeed.toFixed(1)}`}>
          <span className="stat-label">MS</span>
          <span className="stat-value">{moveSpeed.toFixed(1)}</span>
        </div>
        {multishot > 1 && (
          <div className="stat-pill" title={`Multishot: ×${multishot}`}>
            <span className="stat-label">×</span>
            <span className="stat-value">{multishot}</span>
          </div>
        )}
        <div className="stat-pill" title={`Critical Hit Chance: ${(critChance * 100).toFixed(0)}%`}>
          <span className="stat-label">CRIT</span>
          <span className="stat-value">{(critChance * 100).toFixed(0)}%</span>
        </div>
        <div className="stat-pill" title={`Lifesteal: ${(lifesteal * 100).toFixed(0)}%`}>
          <span className="stat-label">LS</span>
          <span className="stat-value">{(lifesteal * 100).toFixed(0)}%</span>
        </div>
      </div>


      {/* Bottom: XP Bar */}
      <div className="hud-xp-bar">
        <div className="xp-fill" style={{ width: `${xpPercent}%` }} />
        <div className="xp-label">
          {xp} / {xpToNextLevel} XP
        </div>
      </div>

      {/* ESC hint */}
      <div className="hud-esc-hint" onClick={onOpenStats}>
        ESC - Stats
      </div>

      <style jsx>{`
        .game-hud {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .game-hud > * {
          pointer-events: auto;
        }

        /* Left Side: Vertical HP Bar */
        .hud-hp-vertical {
          position: absolute;
          left: 8px;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }

        .hp-text-horizontal {
          font-size: 14px;
          font-weight: 800;
          color: #ffffff;
          text-shadow: 0 0 8px rgba(255, 68, 68, 0.8), 0 2px 4px rgba(0, 0, 0, 0.9);
          font-family: 'Arial Black', sans-serif;
          letter-spacing: 1px;
        }

        .hp-bar-container-vertical {
          width: 28px;
          height: 160px;
          background: linear-gradient(180deg, rgba(20, 20, 30, 0.95) 0%, rgba(10, 10, 20, 0.95) 100%);
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 
            inset 0 2px 8px rgba(0, 0, 0, 0.7),
            0 4px 16px rgba(0, 0, 0, 0.6),
            0 0 0 1px rgba(255, 255, 255, 0.1);
          position: relative;
        }

        .hp-bar-fill-vertical {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          transition: height 0.3s ease, background-color 0.3s ease;
          border-radius: 11px;
          box-shadow: 
            0 0 16px currentColor,
            inset 0 2px 4px rgba(255, 255, 255, 0.3),
            inset 0 -2px 4px rgba(0, 0, 0, 0.3);
          background: linear-gradient(180deg, 
            rgba(255, 255, 255, 0.15) 0%, 
            transparent 50%, 
            rgba(0, 0, 0, 0.2) 100%
          );
        }

        .hp-values-vertical {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1px;
          font-size: 12px;
          font-weight: 700;
          color: white;
          text-shadow: 
            0 0 4px rgba(255, 68, 68, 0.8),
            0 2px 4px rgba(0, 0, 0, 0.9);
          font-family: 'Arial', sans-serif;
          background: rgba(0, 0, 0, 0.6);
          padding: 4px 6px;
          border-radius: 6px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .hp-current {
          color: #ff6b6b;
          font-size: 13px;
          font-weight: 800;
        }

        .hp-separator {
          color: #666;
          font-size: 10px;
        }

        .hp-max {
          color: #999;
          font-size: 11px;
        }

        /* Top-Left: FPS Counter */
        .hud-fps {
          position: absolute;
          top: 4px;
          left: 4px;
          text-align: left;
          color: white;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
          background: rgba(0, 0, 0, 0.7);
          padding: 6px 10px;
          border-radius: 6px;
          border: 2px solid rgba(255, 255, 255, 0.2);
          min-width: 60px;
        }

        .fps-label {
          font-size: 10px;
          color: #888;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .fps-value {
          font-size: 16px;
          font-weight: 700;
          color: #4ADE80;
          margin-top: 2px;
        }

        /* Top-Left: Mission Container */
        .hud-mission {
          position: absolute;
          top: 60px;
          left: 4px;
          text-align: left;
          color: white;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
          background: rgba(0, 0, 0, 0.7);
          padding: 6px 10px;
          border-radius: 6px;
          border: 2px solid rgba(255, 215, 0, 0.3);
          min-width: 140px;
        }

        .mission-label {
          font-size: 10px;
          color: #FFD700;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 2px;
        }

        .mission-text {
          font-size: 12px;
          font-weight: 700;
          color: #FFD700;
          text-shadow: 0 0 8px rgba(255, 215, 0, 0.5);
        }

        /* Top-Right: Time & Level */
        .hud-top-right {
          position: absolute;
          top: 4px;
          right: 4px;
          text-align: right;
          color: white;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
          background: rgba(0, 0, 0, 0.7);
          padding: 6px 10px;
          border-radius: 6px;
          border: 2px solid rgba(255, 255, 255, 0.2);
        }

        .time {
          font-size: 16px;
          font-weight: 700;
          letter-spacing: 0.5px;
          color: #4a9eff;
        }

        .level {
          font-size: 12px;
          color: #FFD700;
          margin-top: 2px;
          font-weight: 600;
        }

        .money {
          font-size: 11px;
          color: #4ADE80;
          margin-top: 2px;
          font-weight: 600;
        }

        .kills {
          font-size: 11px;
          color: #FF6B9D;
          margin-top: 2px;
          font-weight: 600;
        }

        /* Right Side: Stat Pills */
        .hud-stat-pills {
          position: absolute;
          right: 4px;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .stat-pill {
          background: rgba(10, 16, 32, 0.9);
          border: 2px solid rgba(102, 126, 234, 0.6);
          border-radius: 6px;
          padding: 3px 6px;
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 45px;
          cursor: help;
          transition: all 0.3s;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
          position: relative;
        }

        .stat-pill:hover {
          background: rgba(20, 26, 42, 0.95);
          border-color: rgba(102, 126, 234, 0.9);
          transform: translateX(-6px) scale(1.05);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
        }

        .stat-pill:hover::after {
          content: attr(title);
          position: absolute;
          right: calc(100% + 8px);
          top: 50%;
          transform: translateY(-50%);
          background: rgba(10, 16, 32, 0.98);
          border: 2px solid rgba(102, 126, 234, 0.8);
          border-radius: 6px;
          padding: 6px 10px;
          white-space: nowrap;
          font-size: 12px;
          color: #e0e0e0;
          font-weight: 500;
          pointer-events: none;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
          z-index: 1000;
          animation: tooltipFadeIn 0.2s ease;
        }

        @keyframes tooltipFadeIn {
          from {
            opacity: 0;
            transform: translateY(-50%) translateX(5px);
          }
          to {
            opacity: 1;
            transform: translateY(-50%) translateX(0);
          }
        }

        .stat-label {
          font-size: 10px;
          color: #888;
          font-weight: 600;
        }

        .stat-value {
          font-size: 13px;
          color: white;
          font-weight: 700;
        }


        /* Bottom: XP Bar */
        .hud-xp-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          width: 100%;
          height: 24px;
          background: rgba(10, 16, 32, 0.95);
          border-top: 2px solid rgba(102, 126, 234, 0.6);
          overflow: hidden;
          box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.5);
        }

        .xp-fill {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          background: linear-gradient(90deg, #FFD700, #FFA500, #FF8C00);
          transition: width 0.3s ease;
          box-shadow: 0 0 12px rgba(255, 215, 0, 0.6);
        }

        .xp-label {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 11px;
          font-weight: 700;
          color: white;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
          z-index: 1;
        }

        /* ESC Hint */
        .hud-esc-hint {
          position: absolute;
          bottom: 28px;
          right: 4px;
          font-size: 9px;
          color: #888;
          background: rgba(10, 16, 32, 0.7);
          padding: 2px 4px;
          border-radius: 3px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .hud-esc-hint:hover {
          color: #FFD700;
          background: rgba(20, 26, 42, 0.9);
        }


        @media (max-width: 768px) {
          .stat-pill {
            min-width: 42px;
            padding: 3px 6px;
          }

          .stat-label {
            font-size: 9px;
          }

          .stat-value {
            font-size: 11px;
          }
        }
      `}</style>
    </div>
  );
}


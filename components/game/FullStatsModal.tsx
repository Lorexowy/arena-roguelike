/**
 * Full Stats Modal
 * 
 * Opened with ESC key, shows complete player stats and perks.
 * Pauses gameplay while open.
 */

import React, { useEffect, useRef } from 'react';

interface FullStatsModalProps {
  // Player stats
  level: number;
  damage: number;
  fireRate: number;
  moveSpeed: number;
  multishot: number;
  magnetRadius: number;
  critChance: number;
  money: number;
  
  // Game stats
  currentWave: number;
  survivalTime: number;
  
  // Upgrade counts
  upgradeCount: {
    multishot: number;
    attackSpeed: number;
    magnet: number;
    moveSpeed: number;
    damage: number;
    critChance: number;
  };
  
  // Actions
  onClose: () => void;
  onOpenSettings: () => void;
}

export default function FullStatsModal({
  level,
  damage,
  fireRate,
  moveSpeed,
  multishot,
  magnetRadius,
  critChance,
  money,
  currentWave,
  survivalTime,
  upgradeCount,
  onClose,
  onOpenSettings,
}: FullStatsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const minutes = Math.floor(survivalTime / 60);
  const seconds = survivalTime % 60;

  // Focus trap
  useEffect(() => {
    closeButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }

      // Tab key focus trap
      if (e.key === 'Tab') {
        const focusableElements = modalRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusableElements || focusableElements.length === 0) return;

        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const perks = [
    { name: 'Attack Speed', count: upgradeCount.attackSpeed },
    { name: 'Move Speed', count: upgradeCount.moveSpeed },
    { name: 'Damage', count: upgradeCount.damage },
    { name: 'Magnet', count: upgradeCount.magnet },
    { name: 'Multishot', count: upgradeCount.multishot },
    { name: 'Crit Chance', count: upgradeCount.critChance },
  ].filter(p => p.count > 0);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        ref={modalRef}
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="modal-title">Statystyki</h2>

        <div className="stats-grid">
          <div className="stat-row">
            <span className="stat-label">Poziom</span>
            <span className="stat-value">{level}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Fala</span>
            <span className="stat-value">{currentWave}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Czas przetrwania</span>
            <span className="stat-value">
              {minutes}:{seconds.toString().padStart(2, '0')}
            </span>
          </div>
          <div className="stat-divider" />
          <div className="stat-row">
            <span className="stat-label">Obrażenia</span>
            <span className="stat-value">{damage.toFixed(1)}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Szybkość ataku</span>
            <span className="stat-value">{fireRate.toFixed(1)} strz./s</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Prędkość ruchu</span>
            <span className="stat-value">{moveSpeed.toFixed(1)}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Multishot</span>
            <span className="stat-value">×{multishot}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Promień magnesu</span>
            <span className="stat-value">{magnetRadius.toFixed(0)}px</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Szansa na trafienie krytyczne</span>
            <span className="stat-value">{(critChance * 100).toFixed(1)}%</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Pieniądze</span>
            <span className="stat-value">${money}</span>
          </div>
        </div>

        {perks.length > 0 && (
          <>
            <h3 className="perks-title">Zebrane ulepszenia</h3>
            <div className="perks-list">
              {perks.map((perk, i) => (
                <div key={i} className="perk-item">
                  <span className="perk-name">{perk.name}</span>
                  <span className="perk-count">×{perk.count}</span>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="modal-buttons">
          <button
            ref={closeButtonRef}
            className="modal-button primary"
            onClick={onClose}
          >
            Wróć do gry
          </button>
          <button
            className="modal-button secondary"
            onClick={onOpenSettings}
          >
            Ustawienia
          </button>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.2s ease;
        }

        .modal-content {
          background: linear-gradient(135deg, #1a1e2e 0%, #2a2e3e 100%);
          border: 3px solid #3a4352;
          border-radius: 12px;
          padding: 32px;
          max-width: 500px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 10px 50px rgba(0, 0, 0, 0.5);
        }

        .modal-title {
          font-size: 32px;
          font-weight: 800;
          color: #FFD700;
          margin: 0 0 24px 0;
          text-align: center;
        }

        .stats-grid {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 24px;
        }

        .stat-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 6px;
        }

        .stat-label {
          color: #AAA;
          font-size: 14px;
        }

        .stat-value {
          color: white;
          font-weight: 700;
          font-size: 15px;
        }

        .stat-divider {
          height: 2px;
          background: rgba(255, 255, 255, 0.1);
          margin: 8px 0;
        }

        .perks-title {
          font-size: 18px;
          font-weight: 700;
          color: #FFD700;
          margin: 24px 0 12px 0;
        }

        .perks-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 8px;
          margin-bottom: 24px;
        }

        .perk-item {
          background: rgba(102, 126, 234, 0.2);
          border: 2px solid rgba(102, 126, 234, 0.5);
          border-radius: 6px;
          padding: 8px 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .perk-name {
          color: white;
          font-size: 13px;
        }

        .perk-count {
          color: #FFD700;
          font-weight: 700;
          font-size: 13px;
        }

        .modal-buttons {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 24px;
        }

        .modal-button {
          padding: 14px 24px;
          font-size: 16px;
          font-weight: 600;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
        }

        .modal-button.primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .modal-button.primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        .modal-button.secondary {
          background: #2a3342;
          color: #AAA;
          border: 2px solid #3a4352;
        }

        .modal-button.secondary:hover {
          background: #3a4352;
          color: white;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}


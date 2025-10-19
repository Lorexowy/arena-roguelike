/**
 * Settings Modal
 * 
 * Opened from Full Stats modal.
 * Allows changing game settings and returning to main menu.
 */

import React, { useEffect, useRef } from 'react';
import { GameSettings } from '@/lib/game/settings';

interface SettingsModalProps {
  settings: GameSettings;
  onSettingsChange: (settings: GameSettings) => void;
  onBack: () => void;
  onReturnToMainMenu: () => void;
}

export default function SettingsModal({
  settings,
  onSettingsChange,
  onBack,
  onReturnToMainMenu,
}: SettingsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const backButtonRef = useRef<HTMLButtonElement>(null);

  // Focus trap
  useEffect(() => {
    backButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onBack();
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
  }, [onBack]);

  const handleVolumeChange = (value: number) => {
    onSettingsChange({ ...settings, masterVolume: value });
  };

  const handleToggleReduceMotion = () => {
    onSettingsChange({ ...settings, reduceMotion: !settings.reduceMotion });
  };

  const handleToggleScreenShake = () => {
    onSettingsChange({ ...settings, disableScreenShake: !settings.disableScreenShake });
  };

  return (
    <div className="modal-overlay" onClick={onBack}>
      <div
        ref={modalRef}
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="modal-title">Ustawienia</h2>

        <div className="settings-section">
          <h3 className="section-title">Audio</h3>
          
          <div className="setting-row">
            <label htmlFor="master-volume" className="setting-label">
              Głośność główna
            </label>
            <div className="volume-control">
              <input
                id="master-volume"
                type="range"
                min="0"
                max="100"
                value={settings.masterVolume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className="volume-slider"
              />
              <span className="volume-value">{settings.masterVolume}%</span>
            </div>
          </div>
          
          <div className="setting-row">
            <label htmlFor="effects-volume" className="setting-label">
              Głośność efektów
            </label>
            <div className="volume-control">
              <input
                id="effects-volume"
                type="range"
                min="0"
                max="100"
                value={settings.effectsVolume}
                onChange={(e) => onSettingsChange({
                  ...settings,
                  effectsVolume: Number(e.target.value)
                })}
                className="volume-slider"
              />
              <span className="volume-value">{settings.effectsVolume}%</span>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h3 className="section-title">Efekty wizualne</h3>
          
          <div className="setting-row">
            <label className="setting-label">Ogranicz ruch</label>
            <button
              className={`toggle-button ${settings.reduceMotion ? 'active' : ''}`}
              onClick={handleToggleReduceMotion}
              aria-label="Toggle reduce motion"
            >
              <div className="toggle-switch" />
            </button>
          </div>

          <div className="setting-row">
            <label className="setting-label">Wyłącz wstrząsy ekranu</label>
            <button
              className={`toggle-button ${settings.disableScreenShake ? 'active' : ''}`}
              onClick={handleToggleScreenShake}
              aria-label="Toggle screen shake"
            >
              <div className="toggle-switch" />
            </button>
          </div>
        </div>

        <div className="settings-divider" />

        <div className="modal-buttons">
          <button
            ref={backButtonRef}
            className="modal-button primary"
            onClick={onBack}
          >
            Wróć
          </button>
          <button
            className="modal-button danger"
            onClick={onReturnToMainMenu}
          >
            Wróć do menu głównego
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
          z-index: 1001;
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

        .settings-section {
          margin-bottom: 24px;
        }

        .section-title {
          font-size: 18px;
          font-weight: 700;
          color: white;
          margin: 0 0 16px 0;
        }

        .setting-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 6px;
          margin-bottom: 12px;
        }

        .setting-label {
          color: #AAA;
          font-size: 14px;
        }

        .volume-control {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .volume-slider {
          width: 150px;
          height: 6px;
          border-radius: 3px;
          background: rgba(255, 255, 255, 0.1);
          outline: none;
          -webkit-appearance: none;
        }

        .volume-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #667eea;
          cursor: pointer;
        }

        .volume-slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #667eea;
          cursor: pointer;
          border: none;
        }

        .volume-value {
          color: white;
          font-weight: 700;
          font-size: 14px;
          min-width: 40px;
          text-align: right;
        }

        .toggle-button {
          width: 50px;
          height: 26px;
          border-radius: 13px;
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid rgba(255, 255, 255, 0.2);
          cursor: pointer;
          transition: all 0.3s;
          position: relative;
          padding: 0;
        }

        .toggle-button.active {
          background: #667eea;
          border-color: #667eea;
        }

        .toggle-switch {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: white;
          position: absolute;
          top: 2px;
          left: 2px;
          transition: transform 0.3s;
        }

        .toggle-button.active .toggle-switch {
          transform: translateX(24px);
        }

        .settings-divider {
          height: 2px;
          background: rgba(255, 255, 255, 0.1);
          margin: 24px 0;
        }

        .modal-buttons {
          display: flex;
          flex-direction: column;
          gap: 12px;
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

        .modal-button.danger {
          background: #FF4444;
          color: white;
        }

        .modal-button.danger:hover {
          background: #FF2222;
          transform: translateY(-2px);
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


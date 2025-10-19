'use client';

import { useState } from 'react';
import GameCanvas from '@/components/game/GameCanvas';
import { GameSettings, loadSettings, saveSettings } from '@/lib/game/settings';

/**
 * Home Page / Main Menu
 * 
 * This component manages the game state:
 * - Shows Start Menu when gameStarted is false
 * - Shows GameCanvas when gameStarted is true
 * - Handles transitions between menu and game
 */
export default function Home() {
  const [gameStarted, setGameStarted] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [settings, setSettings] = useState<GameSettings>(loadSettings());

  /**
   * Start the game
   * Hides menu and mounts the game canvas
   */
  const handleStartGame = () => {
    setGameStarted(true);
  };

  /**
   * Return to menu
   * Unmounts the game canvas (stopping the game loop)
   * and shows the menu again
   */
  const handleBackToMenu = () => {
    setGameStarted(false);
  };

  /**
   * Handle settings change
   */
  const handleSettingsChange = (newSettings: GameSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  /**
   * Open options modal
   */
  const handleOpenOptions = () => {
    setShowOptions(true);
  };

  /**
   * Close options modal
   */
  const handleCloseOptions = () => {
    setShowOptions(false);
  };

  // If game is started, render the game canvas
  if (gameStarted) {
    return <GameCanvas onBackToMenu={handleBackToMenu} />;
  }

  // Otherwise, show the Start Menu
  return (
    <div className="menu-container">
      <main className="menu-content">
        {/* Game Title */}
        <h1 className="title">
          Arena Roguelike
        </h1>
        
        <p className="subtitle">
          Survive the endless waves
        </p>

        {/* Main Menu Buttons */}
        <div className="menu-buttons">
          {/* Play Button - starts the game */}
          <button 
            onClick={handleStartGame}
            className="menu-button primary"
          >
            ▶ Play
          </button>
          
          {/* Options Button */}
          <button 
            onClick={handleOpenOptions}
            className="menu-button secondary"
          >
            ⚙️ Options
          </button>
          
          <button 
            className="menu-button secondary"
            disabled
          >
            Credits (Coming Soon)
          </button>
        </div>


        {/* Game Info */}
        <div className="info">
          <p>Use WASD to move • Survive as long as you can</p>
          <p className="tech-stack">Built with Next.js, React & TypeScript</p>
        </div>
      </main>

      {/* Options Modal */}
      {showOptions && (
        <div className="options-overlay" onClick={handleCloseOptions}>
          <div className="options-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="options-title">Options</h2>
            
            <div className="options-section">
              <h3 className="section-title">Audio</h3>
              
              <div className="setting-row">
                <label className="setting-label">Master Volume</label>
                <div className="volume-control">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.masterVolume}
                    onChange={(e) => handleSettingsChange({
                      ...settings,
                      masterVolume: Number(e.target.value)
                    })}
                    className="volume-slider"
                  />
                  <span className="volume-value">{settings.masterVolume}%</span>
                </div>
              </div>
              
              <div className="setting-row">
                <label className="setting-label">Effects Volume</label>
                <div className="volume-control">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.effectsVolume}
                    onChange={(e) => handleSettingsChange({
                      ...settings,
                      effectsVolume: Number(e.target.value)
                    })}
                    className="volume-slider"
                  />
                  <span className="volume-value">{settings.effectsVolume}%</span>
                </div>
              </div>
            </div>

            <div className="options-buttons">
              <button 
                onClick={handleCloseOptions}
                className="options-button primary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .menu-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: linear-gradient(to bottom, #0a0e1a 0%, #1a1e2e 100%);
          padding: 20px;
        }

        .menu-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 30px;
          max-width: 500px;
          width: 100%;
        }

        .title {
          font-size: 48px;
          font-weight: 800;
          text-align: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0;
          text-shadow: 0 0 40px rgba(102, 126, 234, 0.3);
          letter-spacing: -1px;
        }

        .subtitle {
          font-size: 18px;
          color: #888;
          text-align: center;
          margin: -15px 0 0 0;
          font-family: monospace;
          letter-spacing: 1px;
        }

        .menu-buttons {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
          margin-top: 20px;
        }

        .menu-button {
          padding: 16px 32px;
          font-size: 18px;
          font-weight: 600;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: inherit;
          width: 100%;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        .menu-button.primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          font-size: 22px;
          padding: 20px 32px;
        }

        .menu-button.primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 25px rgba(102, 126, 234, 0.4);
        }

        .menu-button.primary:active {
          transform: translateY(-1px);
        }

        .menu-button.secondary {
          background-color: #1a2332;
          color: #888;
          border: 2px solid #2a3342;
        }

        .menu-button.secondary:not(:disabled):hover {
          background-color: #2a3342;
          border-color: #3a4352;
          color: #aaa;
          transform: translateY(-2px);
        }

        .menu-button:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }

        .info {
          margin-top: 20px;
          text-align: center;
          color: #666;
          font-family: monospace;
          font-size: 14px;
        }

        .info p {
          margin: 8px 0;
        }

        .tech-stack {
          font-size: 12px;
          color: #444;
        }

        /* Options Modal */
        .options-overlay {
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

        .options-modal {
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

        .options-title {
          color: #fff;
          font-size: 24px;
          font-weight: 700;
          margin: 0 0 24px 0;
          text-align: center;
        }

        .options-section {
          margin-bottom: 24px;
        }

        .section-title {
          color: #4a9eff;
          font-size: 18px;
          font-weight: 600;
          margin: 0 0 16px 0;
        }

        .setting-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .setting-label {
          color: #e0e0e0;
          font-size: 14px;
          font-weight: 500;
          min-width: 120px;
        }

        .volume-control {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }

        .volume-slider {
          flex: 1;
          height: 6px;
          background: #3a4352;
          border-radius: 3px;
          outline: none;
          -webkit-appearance: none;
          appearance: none;
        }

        .volume-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          background: #4a9eff;
          border-radius: 50%;
          cursor: pointer;
          border: 2px solid #fff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .volume-slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          background: #4a9eff;
          border-radius: 50%;
          cursor: pointer;
          border: 2px solid #fff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .volume-value {
          color: #4a9eff;
          font-size: 14px;
          font-weight: 600;
          min-width: 40px;
          text-align: right;
        }

        .options-buttons {
          display: flex;
          justify-content: center;
          gap: 16px;
          margin-top: 24px;
        }

        .options-button {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .options-button.primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .options-button.primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @media (max-width: 600px) {
          .title {
            font-size: 36px;
          }

          .menu-button.primary {
            font-size: 18px;
            padding: 16px 24px;
          }
        }
      `}</style>
    </div>
  );
}

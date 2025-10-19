/**
 * Intro/Welcome Screen
 * 
 * Shown after clicking "Play" on main menu.
 * Displays welcome message, controls, and Start button.
 */

import React, { useRef, useEffect } from 'react';

interface IntroScreenProps {
  onStart: () => void;
}

export default function IntroScreen({ onStart }: IntroScreenProps) {
  const startButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    startButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onStart();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onStart]);

  return (
    <div className="intro-overlay">
      <div className="intro-content">
        <h1 className="intro-title">Witaj, wojowniku!</h1>
        
        <p className="intro-message">
          Twoim zadaniem jest przetrwać jak najdłużej i pokonać wszystkich wrogów. 
          Powodzenia!
        </p>

        <div className="controls-section">
          <h3 className="controls-title">Sterowanie</h3>
          <div className="controls-grid">
            <div className="control-item">
              <span className="control-key">WASD</span>
              <span className="control-desc">ruch</span>
            </div>
            <div className="control-item">
              <span className="control-key">Myszka</span>
              <span className="control-desc">celowanie</span>
            </div>
            <div className="control-item">
              <span className="control-key">Auto-fire</span>
              <span className="control-desc">włączony</span>
            </div>
            <div className="control-item">
              <span className="control-key">ESC</span>
              <span className="control-desc">pauza / statystyki</span>
            </div>
          </div>
        </div>

        <button
          ref={startButtonRef}
          className="start-button"
          onClick={onStart}
        >
          Start
        </button>

        <p className="hint">Naciśnij Enter lub Spację</p>
      </div>

      <style jsx>{`
        .intro-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.95);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.3s ease;
        }

        .intro-content {
          max-width: 600px;
          padding: 48px;
          text-align: center;
        }

        .intro-title {
          font-size: 42px;
          font-weight: 800;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0 0 24px 0;
        }

        .intro-message {
          font-size: 18px;
          color: #AAA;
          line-height: 1.6;
          margin: 0 0 40px 0;
        }

        .controls-section {
          background: rgba(26, 30, 46, 0.8);
          border: 2px solid rgba(102, 126, 234, 0.3);
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 40px;
        }

        .controls-title {
          font-size: 20px;
          font-weight: 700;
          color: #FFD700;
          margin: 0 0 20px 0;
        }

        .controls-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .control-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .control-key {
          font-size: 14px;
          font-weight: 700;
          color: white;
          background: rgba(102, 126, 234, 0.3);
          padding: 8px 12px;
          border-radius: 6px;
          font-family: monospace;
        }

        .control-desc {
          font-size: 13px;
          color: #888;
        }

        .start-button {
          padding: 18px 48px;
          font-size: 22px;
          font-weight: 700;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        .start-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 30px rgba(102, 126, 234, 0.6);
        }

        .start-button:active {
          transform: translateY(-1px);
        }

        .hint {
          font-size: 13px;
          color: #666;
          margin-top: 16px;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @media (max-width: 600px) {
          .intro-content {
            padding: 32px 24px;
          }

          .intro-title {
            font-size: 32px;
          }

          .controls-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}


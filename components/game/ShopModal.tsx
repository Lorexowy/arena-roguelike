/**
 * Shop Modal Component
 * 
 * Displays merchant shop during wave breaks.
 * Shows purchasable perks and items with keyboard shortcuts.
 */

'use client';

import { useEffect, useState } from 'react';
import { ShopEntry, getRarityColor, getRarityLabel } from '@/lib/game/shop/catalog';
import { calculatePrice, SHOP_CONFIG } from '@/lib/game/shop/logic';

interface ShopModalProps {
  currentOffer: ShopEntry[];
  currentWave: number;
  playerMoney: number;
  rerollCost: number;
  purchasesMade: number;
  onPurchase: (entryId: string) => void;
  onReroll: () => void;
  onClose: () => void;
}

export default function ShopModal({
  currentOffer,
  currentWave,
  playerMoney,
  rerollCost,
  purchasesMade,
  onPurchase,
  onReroll,
  onClose,
}: ShopModalProps) {
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  
  const canPurchaseMore = purchasesMade < SHOP_CONFIG.PURCHASE_LIMIT;
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Numeric keys 1-4 for purchase
      if (e.key >= '1' && e.key <= '4') {
        const index = parseInt(e.key) - 1;
        if (index < currentOffer.length && canPurchaseMore) {
          const entry = currentOffer[index];
          const price = calculatePrice(entry.baseCost, currentWave);
          if (playerMoney >= price) {
            e.preventDefault();
            onPurchase(entry.id);
          }
        }
      }
      
      // R for reroll
      if (e.key.toLowerCase() === 'r') {
        if (playerMoney >= rerollCost && canPurchaseMore) {
          e.preventDefault();
          onReroll();
        }
      }
      
      // Escape to close
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentOffer, currentWave, playerMoney, rerollCost, canPurchaseMore, onPurchase, onReroll, onClose]);
  
  return (
    <div className="shop-overlay">
      <div className="shop-modal">
        {/* Header */}
        <div className="shop-header">
          <h2 className="shop-title">🏪 Merchant Shop</h2>
          <div className="shop-money">
            <span className="money-label">Your Money:</span>
            <span className="money-value">${playerMoney}</span>
          </div>
        </div>
        
        {/* Purchase limit notice */}
        {!canPurchaseMore && (
          <div className="shop-notice">
            ✓ Purchase complete! Close shop to continue.
          </div>
        )}
        
        {/* Shop cards */}
        <div className="shop-cards">
          {currentOffer.map((entry, index) => {
            const price = calculatePrice(entry.baseCost, currentWave);
            const canAfford = playerMoney >= price;
            const canBuy = canAfford && canPurchaseMore;
            const rarityColor = getRarityColor(entry.rarity);
            
            return (
              <div
                key={entry.id}
                className={`shop-card ${!canBuy ? 'disabled' : ''} ${selectedIndex === index ? 'selected' : ''}`}
                onMouseEnter={() => setSelectedIndex(index)}
                onMouseLeave={() => setSelectedIndex(-1)}
                onClick={() => canBuy && onPurchase(entry.id)}
              >
                {/* Card header with icon */}
                <div className="card-header">
                  {entry.iconSrc && (
                    <div className="card-icon-wrapper">
                      <img 
                        src={entry.iconSrc} 
                        alt={entry.iconAlt || entry.name}
                        className="card-icon"
                      />
                    </div>
                  )}
                  <div className="card-header-text">
                    <span className="card-number">{index + 1}</span>
                    <span 
                      className="card-rarity"
                      style={{ color: rarityColor }}
                    >
                      {getRarityLabel(entry.rarity)}
                    </span>
                  </div>
                </div>
                
                {/* Card content */}
                <div className="card-content">
                  <h3 className="card-name">{entry.name}</h3>
                  <p className="card-type">{entry.type === 'perk' ? '⚡ Perk' : '💎 Item'}</p>
                  <p className="card-description">{entry.description}</p>
                </div>
                
                {/* Card footer */}
                <div className="card-footer">
                  <span className={`card-price ${!canAfford ? 'too-expensive' : ''}`}>
                    ${price}
                  </span>
                  {!canAfford && <span className="card-warning">Not enough $</span>}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Action buttons */}
        <div className="shop-actions">
          <button
            className="shop-button reroll-button"
            onClick={onReroll}
            disabled={playerMoney < rerollCost || !canPurchaseMore}
          >
            🎲 Reroll (R) - ${rerollCost}
          </button>
          
          <button
            className="shop-button close-button"
            onClick={onClose}
          >
            Close Shop (ESC)
          </button>
        </div>
        
        {/* Shortcuts hint */}
        <div className="shop-hint">
          Press 1-3 to buy • R to reroll • ESC to close
        </div>
      </div>
      
      <style jsx>{`
        .shop-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 200;
          animation: fadeIn 0.3s ease;
        }
        
        .shop-modal {
          background: linear-gradient(135deg, #1a1e2e 0%, #2a2e3e 100%);
          border: 3px solid #8B7355;
          border-radius: 16px;
          padding: 32px;
          max-width: 900px;
          width: 90%;
          box-shadow: 0 10px 50px rgba(139, 115, 85, 0.5);
        }
        
        .shop-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 2px solid #3a4352;
        }
        
        .shop-title {
          font-size: 32px;
          font-weight: 800;
          color: #F59E0B;
          margin: 0;
          text-shadow: 0 0 20px rgba(245, 158, 11, 0.4);
        }
        
        .shop-money {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 20px;
          font-weight: 600;
        }
        
        .money-label {
          color: #888;
        }
        
        .money-value {
          color: #10B981;
          font-size: 24px;
          font-weight: 700;
        }
        
        .shop-notice {
          background: linear-gradient(135deg, #10B981 0%, #059669 100%);
          color: white;
          padding: 12px 20px;
          border-radius: 8px;
          text-align: center;
          font-weight: 600;
          margin-bottom: 20px;
          animation: slideDown 0.3s ease;
        }
        
        .shop-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }
        
        .shop-card {
          background: linear-gradient(135deg, #2a3342 0%, #3a4352 100%);
          border: 2px solid #4a5362;
          border-radius: 12px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          min-height: 220px;
        }
        
        .shop-card:hover:not(.disabled) {
          border-color: #F59E0B;
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(245, 158, 11, 0.3);
        }
        
        .shop-card.selected:not(.disabled) {
          border-color: #F59E0B;
          transform: translateY(-3px);
          box-shadow: 0 6px 20px rgba(245, 158, 11, 0.25);
        }
        
        .shop-card.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .card-header {
          display: flex;
          gap: 12px;
          align-items: center;
          margin-bottom: 12px;
        }
        
        .card-icon-wrapper {
          flex-shrink: 0;
          width: 48px;
          height: 48px;
          border-radius: 8px;
          background: rgba(26, 35, 50, 0.6);
          border: 2px solid #4a5362;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
        }
        
        .card-icon {
          width: 100%;
          height: 100%;
          object-fit: contain;
          image-rendering: auto;
        }
        
        .card-header-text {
          flex: 1;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .card-number {
          background: #1a2332;
          color: #FFD700;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 12px;
        }
        
        .card-rarity {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .card-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .card-name {
          font-size: 18px;
          font-weight: 700;
          color: #F59E0B;
          margin: 0;
        }
        
        .card-type {
          font-size: 12px;
          color: #888;
          margin: 0;
          font-weight: 600;
        }
        
        .card-description {
          font-size: 13px;
          color: #AAA;
          margin: 0;
          line-height: 1.4;
        }
        
        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #4a5362;
        }
        
        .card-price {
          font-size: 20px;
          font-weight: 700;
          color: #10B981;
        }
        
        .card-price.too-expensive {
          color: #EF4444;
        }
        
        .card-warning {
          font-size: 11px;
          color: #EF4444;
          font-weight: 600;
        }
        
        .shop-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
        }
        
        .shop-button {
          padding: 12px 24px;
          font-size: 16px;
          font-weight: 600;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
        }
        
        .reroll-button {
          background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
          color: white;
          border: 2px solid #60A5FA;
        }
        
        .reroll-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
        }
        
        .reroll-button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          background: #374151;
          border-color: #4b5563;
        }
        
        .close-button {
          background: #374151;
          color: #D1D5DB;
          border: 2px solid #4b5563;
        }
        
        .close-button:hover {
          background: #4b5563;
          color: white;
        }
        
        .shop-hint {
          text-align: center;
          font-size: 12px;
          color: #666;
          margin-top: 16px;
          font-style: italic;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}


import React, { useEffect } from 'react';

// PUBLIC_INTERFACE
export default function Dice({ rolling, value, canRoll, onRoll, currentPlayer }) {
  /**
   * Displays a modern dice with subtle animation.
   * When rolling, a shimmer animation is shown. Clicking rolls the dice.
   */
  useEffect(() => {
    // minimal effect placeholder for any future sounds/animations
  }, [rolling]);

  return (
    <div>
      <div style={{ display: 'grid', placeItems: 'center', padding: 10 }}>
        <div
          aria-live="polite"
          className="card"
          style={{
            width: 96,
            height: 96,
            borderRadius: 18,
            display: 'grid',
            placeItems: 'center',
            background: 'linear-gradient(180deg, rgba(255,255,255,1), rgba(229, 231, 235, 0.35))',
            border: '1px solid rgba(17, 24, 39, 0.08)',
            boxShadow: rolling ? '0 20px 40px rgba(37, 99, 235, 0.25)' : 'var(--shadow)',
            transform: rolling ? 'translateY(-3px) rotate(6deg)' : 'none',
            transition: 'all 240ms ease',
          }}
        >
          <span style={{ fontSize: 36, fontWeight: 800, color: currentPlayer?.color || 'var(--primary)' }}>
            {value ?? '—'}
          </span>
        </div>
      </div>
      <button className="btn btn-primary" disabled={!canRoll} onClick={onRoll} aria-label="Roll dice">
        {rolling ? 'Rolling...' : 'Roll'}
      </button>
    </div>
  );
}

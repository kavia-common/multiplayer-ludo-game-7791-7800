import React, { useEffect }; from 'react';

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
```

````write file="multiplayer-ludo-game-7791-7800/ludo_frontend/src/game/components/PlayerPanel.jsx"
import React from 'react';

// PUBLIC_INTERFACE
export default function PlayerPanel({ player, tokens, isActive }) {
  /** Shows a player's status and tokens count */
  const inYard = tokens.filter(t => t.state === 'yard').length;
  const inHome = tokens.filter(t => t.state === 'home').length;
  const onBoard = tokens.filter(t => t.state === 'board').length;

  return (
    <div className="stat" style={{ borderColor: isActive ? 'rgba(37, 99, 235, 0.35)' : undefined }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span
          style={{
            width: 12,
            height: 12,
            borderRadius: 999,
            background: player.color,
            boxShadow: isActive ? '0 0 0 4px rgba(37, 99, 235, 0.12)' : undefined,
          }}
        />
        <b>{player.name}</b>
        {isActive && <span className="badge">Your Turn</span>}
      </div>
      <div style={{ display: 'flex', gap: 10, color: '#374151' }}>
        <span>🏠 {inYard}</span>
        <span>🟢 {onBoard}</span>
        <span>🏁 {inHome}</span>
      </div>
    </div>
  );
}
```

````write file="multiplayer-ludo-game-7791-7800/ludo_frontend/src/game/components/LobbyModal.jsx"
import React, { useState } from 'react';

const PRESET_COLORS = ['#2563EB', '#F59E0B', '#10B981', '#EF4444'];

// PUBLIC_INTERFACE
export default function LobbyModal({ open, onClose, players, addPlayer, removePlayer, canStart, onStart }) {
  /**
   * Simple lobby to add/remove players locally and start game.
   * Acts as placeholder for a real-time lobby (WebSocket/REST).
   */
  const [name, setName] = useState('');
  const [colorIdx, setColorIdx] = useState(0);

  if (!open) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <div className="modal-header">
          <div style={{ fontWeight: 700, color: 'var(--primary)' }}>Multiplayer Lobby</div>
          <button className="btn" onClick={onClose} aria-label="Close lobby">Close</button>
        </div>
        <div className="modal-body">
          <div style={{ display: 'grid', gap: 12 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Player name"
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  borderRadius: 12,
                  border: '1px solid rgba(17, 24, 39, 0.12)',
                }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 28px)', gap: 6 }}>
                {PRESET_COLORS.map((c, idx) => (
                  <button
                    key={c}
                    onClick={() => setColorIdx(idx)}
                    title={c}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 999,
                      border: `2px solid ${idx === colorIdx ? 'var(--primary)' : 'rgba(17, 24, 39, 0.12)'}`,
                      background: c,
                      cursor: 'pointer',
                    }}
                  />
                ))}
              </div>
              <button
                className="btn btn-primary"
                onClick={() => {
                  if (!name.trim()) return;
                  addPlayer(name.trim(), PRESET_COLORS[colorIdx]);
                  setName('');
                }}
              >
                Add
              </button>
            </div>

            <div style={{ display: 'grid', gap: 8 }}>
              {players.map((p) => (
                <div key={p.id} className="stat">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ width: 12, height: 12, borderRadius: 999, background: p.color }} />
                    <b>{p.name}</b>
                  </div>
                  <button className="btn" onClick={() => removePlayer(p.id)}>Remove</button>
                </div>
              ))}
              {players.length === 0 && <div style={{ color: '#6B7280' }}>No players yet. Add at least two.</div>}
            </div>
          </div>
        </div>
        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button className="btn" onClick={onClose}>Close</button>
          <button className="btn btn-primary" onClick={onStart} disabled={!canStart}>Start Game</button>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';

const PRESET_COLORS = ['#2563EB', '#F59E0B', '#10B981', '#EF4444'];

// PUBLIC_INTERFACE
export default function LobbyModal({ open, onClose, players, addPlayer, removePlayer, canStart, onStart }) {
  /**
   * Multiplayer lobby modal (mock). Lets users add/remove local players and start the match.
   * Replace with WebSocket/REST-backed lobby when backend is available.
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

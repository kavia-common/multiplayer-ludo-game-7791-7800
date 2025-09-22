import React from 'react';

// PUBLIC_INTERFACE
export default function PlayerPanel({ player, tokens, isActive }) {
  /** Displays player info and token counts in yard/on board/home, with active highlight. */
  const inYard = tokens.filter(t => t.state === 'yard').length;
  const inHome = tokens.filter(t => t.state === 'home').length;
  const onBoard = tokens.filter(t => t.state === 'board').length;

  return (
    <div
      className="stat"
      style={{
        borderColor: isActive ? 'rgba(37, 99, 235, 0.35)' : undefined,
        boxShadow: isActive ? '0 6px 16px rgba(37, 99, 235, 0.12)' : undefined,
      }}
    >
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
        <span title="In Yard">🏠 {inYard}</span>
        <span title="On Board">🟢 {onBoard}</span>
        <span title="In Home">🏁 {inHome}</span>
      </div>
    </div>
  );
}

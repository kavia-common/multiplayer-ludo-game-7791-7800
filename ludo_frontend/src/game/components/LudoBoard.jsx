import React from 'react';
import { getCellStyle, tokenStyleFor, TOKEN_RADIUS } from '../logic/layout';

// PUBLIC_INTERFACE
export default function LudoBoard({ cells, players, tokens, highlights, onTokenClick, onCellClick, currentPlayerId }) {
  /**
   * Renders the Ludo grid cells and tokens.
   * - cells: 15x15 logical board cells with roles/owner
   * - tokens: positioned by board coords or in yard/home
   * - highlights: array of selectable cell coords
   */
  return (
    <svg viewBox="0 0 600 600" width="100%" height="100%" style={{ display: 'block' }}>
      {/* Grid cells */}
      {cells.map(cell => {
        const style = getCellStyle(cell);
        const isHighlight = highlights.some(h => h.x === cell.x && h.y === cell.y);
        return (
          <rect
            key={`c-${cell.x}-${cell.y}`}
            x={cell.px}
            y={cell.py}
            width={cell.size}
            height={cell.size}
            fill={style.fill}
            stroke={style.stroke}
            strokeWidth={style.strokeWidth}
            opacity={isHighlight ? 0.9 : style.opacity}
            onClick={() => onCellClick(cell)}
            style={{ cursor: isHighlight ? 'pointer' : 'default', transition: 'opacity 160ms ease' }}
          />
        );
      })}

      {/* Safe stars */}
      {cells.filter(c => c.safe).map((c, idx) => (
        <circle key={`safe-${idx}`} cx={c.px + c.size / 2} cy={c.py + c.size / 2} r={c.size * 0.16} fill="rgba(37,99,235,0.6)" />
      ))}

      {/* Tokens */}
      {tokens.map(t => {
        if (t.state === 'yard') {
          const cell = cells.find(c => c.kind === 'yard' && c.ownerId === t.playerId && c.yardIndex === t.yardIndex);
          if (!cell) return null;
          const style = tokenStyleFor(t, players, currentPlayerId === t.playerId);
          return (
            <g key={t.id} onClick={() => onTokenClick(t)} style={{ cursor: currentPlayerId === t.playerId ? 'pointer' : 'default' }}>
              <circle cx={cell.px + cell.size / 2} cy={cell.py + cell.size / 2} r={TOKEN_RADIUS} fill={style.fill} stroke={style.stroke} strokeWidth="2" />
              <circle cx={cell.px + cell.size / 2} cy={cell.py + cell.size / 2} r={TOKEN_RADIUS * 0.5} fill="white" opacity="0.8" />
            </g>
          );
        }
        if (t.state === 'home') {
          const cell = cells.find(c => c.kind === 'home' && c.ownerId === t.playerId);
          if (!cell) return null;
          const style = tokenStyleFor(t, players, currentPlayerId === t.playerId);
          return (
            <g key={t.id} onClick={() => onTokenClick(t)} style={{ cursor: currentPlayerId === t.playerId ? 'pointer' : 'default' }}>
              <rect x={cell.px + 10} y={cell.py + 10} width={cell.size - 20} height={cell.size - 20} rx="10" fill={style.fill} opacity="0.85" />
            </g>
          );
        }
        // board position
        const cell = cells.find(c => c.x === t.x && c.y === t.y);
        if (!cell) return null;
        const style = tokenStyleFor(t, players, currentPlayerId === t.playerId);
        return (
          <g key={t.id} onClick={() => onTokenClick(t)} style={{ cursor: currentPlayerId === t.playerId ? 'pointer' : 'default' }}>
            <circle cx={cell.px + cell.size / 2} cy={cell.py + cell.size / 2} r={TOKEN_RADIUS} fill={style.fill} stroke={style.stroke} strokeWidth="2" />
            <circle cx={cell.px + cell.size / 2} cy={cell.py + cell.size / 2} r={TOKEN_RADIUS * 0.45} fill="white" opacity="0.9" />
          </g>
        );
      })}
    </svg>
  );
}

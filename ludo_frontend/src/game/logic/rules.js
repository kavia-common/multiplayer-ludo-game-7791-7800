import { getCell } from './layout';

// Basic rules helpers for Ludo movements.

// PUBLIC_INTERFACE
export function canEnterFromYard(diceValue) {
  /** A token can enter the board from the yard when dice roll is 6 */
  return diceValue === 6;
}

// PUBLIC_INTERFACE
export function pathForPlayer(playerIndex) {
  /** Returns a naive clockwise path of board coordinates for movement. */
  // Simple ring path around center cross. This is a simplified track ensuring 52-ish steps is not strictly enforced.
  const path = [];
  // top row middle
  for (let x = 0; x < 15; x++) path.push({ x, y: 6 });
  // right column middle
  for (let y = 0; y < 15; y++) path.push({ x: 8, y });
  // bottom row middle
  for (let x = 14; x >= 0; x--) path.push({ x, y: 8 });
  // left column middle
  for (let y = 14; y >= 0; y--) path.push({ x: 6, y });

  // entry indexes for each player offset so they start at different part of ring
  const offsets = [2, 17, 32, 47];
  const off = offsets[playerIndex % offsets.length];
  // rotate path by offset
  const rotated = path.slice(off).concat(path.slice(0, off));
  // remove duplicates
  const seen = new Set();
  const unique = [];
  for (const p of rotated) {
    const key = `${p.x},${p.y}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(p);
    }
  }
  return unique;
}

// PUBLIC_INTERFACE
export function nextPositionAlongPath(cells, token, diceValue, players) {
  /**
   * Computes new board coordinates N steps ahead following player's path.
   * Returns { x, y } or 'home' if enters home.
   */
  const playerIndex = players.findIndex(p => p.id === token.playerId);
  const track = pathForPlayer(playerIndex);
  if (token.state === 'board') {
    const idx = track.findIndex(p => p.x === token.x && p.y === token.y);
    if (idx < 0) return null;
    const destIdx = idx + diceValue;
    if (destIdx < track.length) {
      return track[destIdx];
    }
    // If exceeds, consider it needs exact roll to reach home; else remain.
    return 'no-move';
  }
  if (token.state === 'yard') {
    // must be entering at player's entry cell
    const entry = track[0];
    const c = getCell(cells, entry.x, entry.y);
    if (c) return entry;
  }
  return null;
}

// PUBLIC_INTERFACE
export function canCaptureAt(cells, tokens, dest, movingToken) {
  /** A capture happens if destination has opponent tokens and it's not a safe cell. */
  const c = cells.find(cc => cc.x === dest.x && cc.y === dest.y);
  if (!c || c.safe) return false;
  const others = tokens.filter(t => t.state === 'board' && t.x === dest.x && t.y === dest.y && t.playerId !== movingToken.playerId);
  return others.length > 0;
}

// PUBLIC_INTERFACE
export function sendCapturedToYard(tokens, dest, movingToken, cells) {
  /** Sends all opponent tokens from dest back to their yard positions. */
  const victims = tokens.filter(t => t.state === 'board' && t.x === dest.x && t.y === dest.y && t.playerId !== movingToken.playerId);
  victims.forEach(v => {
    // choose an available yard slot for that player
    const yardCells = cells.filter(c => c.kind === 'yard' && c.ownerId === v.playerId && typeof c.yardIndex !== 'undefined');
    const usedIdx = new Set(tokens.filter(tt => tt.playerId === v.playerId && tt.state === 'yard').map(tt => tt.yardIndex));
    const spot = yardCells.find(yc => !usedIdx.has(yc.yardIndex));
    v.state = 'yard';
    v.x = null; v.y = null;
    v.yardIndex = spot?.yardIndex ?? 0;
  });
}

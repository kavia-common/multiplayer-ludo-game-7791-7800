const GRID = 15;
const SIZE = 600;
const CELL = SIZE / GRID;
export const TOKEN_RADIUS = CELL * 0.28;

// Defines the classic Ludo layout in a 15x15 grid with yards, tracks, safe cells, and homes.
export function buildCells(players) {
  const cells = [];
  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID; x++) {
      const px = x * CELL;
      const py = y * CELL;
      const base = { x, y, px, py, size: CELL, kind: 'empty', ownerId: null, safe: false };

      // Yard quadrants 6x6 at corners
      const inTopLeft = x < 6 && y < 6;
      const inTopRight = x > 8 && y < 6;
      const inBottomLeft = x < 6 && y > 8;
      const inBottomRight = x > 8 && y > 8;

      if (inTopLeft) cells.push({ ...base, kind: 'yard', ownerId: players[0]?.id ?? 'P1' });
      else if (inTopRight) cells.push({ ...base, kind: 'yard', ownerId: players[1]?.id ?? 'P2' });
      else if (inBottomLeft) cells.push({ ...base, kind: 'yard', ownerId: players[2]?.id ?? 'P3' });
      else if (inBottomRight) cells.push({ ...base, kind: 'yard', ownerId: players[3]?.id ?? 'P4' });
      else cells.push({ ...base, kind: 'track' });
    }
  }

  // Set center home
  for (let y = 6; y <= 8; y++) {
    for (let x = 6; x <= 8; x++) {
      const idx = y * GRID + x;
      cells[idx] = { ...cells[idx], kind: 'home', ownerId: null };
    }
  }
  // Assign home triangles as single cell per player (use center squares)
  // We'll mark the very center [7,7] as neutral; corners around as player homes
  const homes = [
    { x: 6, y: 6, idx: 0 }, // P1
    { x: 8, y: 6, idx: 1 }, // P2
    { x: 6, y: 8, idx: 2 }, // P3
    { x: 8, y: 8, idx: 3 }, // P4
  ];
  homes.forEach((h, i) => {
    const cell = getCell(cells, h.x, h.y);
    if (cell) {
      cell.ownerId = players[i]?.id ?? `P${i + 1}`;
      cell.kind = 'home';
    }
  });

  // Safe cells - roughly at entries and mid-points
  const safeCoords = [
    [1, 6],[2, 6],[3, 6],[4, 6],[5, 6], // lane to center
    [6, 1],[6, 2],[6, 3],[6, 4],[6, 5],
    [13, 8],[12, 8],[11, 8],[10, 8],[9, 8],
    [8, 13],[8, 12],[8, 11],[8, 10],[8, 9],
    [6, 8],[8, 6],
    [7, 1],[13, 7],[7, 13],[1, 7],
  ];
  safeCoords.forEach(([x, y]) => {
    const c = getCell(cells, x, y);
    if (c) c.safe = true;
  });

  // Yard token spots (2x2 inside each yard)
  const yardSpots = [
    { ox: 1, oy: 1, ownerIdx: 0 },
    { ox: 10, oy: 1, ownerIdx: 1 },
    { ox: 1, oy: 10, ownerIdx: 2 },
    { ox: 10, oy: 10, ownerIdx: 3 },
  ];
  yardSpots.forEach(({ ox, oy, ownerIdx }) => {
    for (let yy = 0; yy < 2; yy++) {
      for (let xx = 0; xx < 2; xx++) {
        const c = getCell(cells, ox + xx, oy + yy);
        if (c && c.kind === 'yard') {
          c.yardIndex = yy * 2 + xx;
          c.ownerId = players[ownerIdx]?.id ?? `P${ownerIdx + 1}`;
        }
      }
    }
  });

  // Starting entry positions for each player (where tokens enter the track)
  const entries = [
    { x: 6, y: 2 },  // P1 Top
    { x: 12, y: 6 }, // P2 Right
    { x: 8, y: 12 }, // P3 Bottom
    { x: 2, y: 8 },  // P4 Left
  ];
  entries.forEach((e, i) => {
    const c = getCell(cells, e.x, e.y);
    if (c) {
      c.entry = true;
      c.ownerId = players[i]?.id ?? `P${i + 1}`;
    }
  });

  return cells;
}

export function getCell(cells, x, y) {
  if (x < 0 || y < 0 || x >= GRID || y >= GRID) return null;
  return cells[y * GRID + x];
}

export function getCellStyle(cell) {
  if (cell.kind === 'yard') {
    return {
      fill: 'rgba(37,99,235,0.06)',
      stroke: 'rgba(37,99,235,0.18)',
      strokeWidth: 1,
      opacity: 1,
    };
  }
  if (cell.kind === 'home') {
    return {
      fill: 'rgba(245,158,11,0.10)',
      stroke: 'rgba(245,158,11,0.30)',
      strokeWidth: 1,
      opacity: 1,
    };
  }
  return {
    fill: 'rgba(255,255,255,1)',
    stroke: 'rgba(17,24,39,0.08)',
    strokeWidth: 1,
    opacity: 1,
  };
}

export function tokenStyleFor(token, players, isActive) {
  const player = players.find(p => p.id === token.playerId);
  const fill = player?.color || '#2563EB';
  return {
    fill: isActive ? fill : fill + 'CC',
    stroke: isActive ? 'rgba(17,24,39,0.45)' : 'rgba(17,24,39,0.25)',
  };
}

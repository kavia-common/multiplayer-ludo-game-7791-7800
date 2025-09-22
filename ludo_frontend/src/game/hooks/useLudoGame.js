import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { buildCells, getCell } from '../logic/layout';
import { canEnterFromYard, nextPositionAlongPath, canCaptureAt, sendCapturedToYard } from '../logic/rules';

// Helper to create ids
const uid = () => Math.random().toString(36).slice(2, 9);
const DEFAULT_PLAYERS = [
  { id: 'P1', name: 'Blue', color: '#2563EB' },
  { id: 'P2', name: 'Amber', color: '#F59E0B' },
];

function createTokensForPlayer(playerId, cells) {
  // four tokens at yard spots
  const yardCells = cells.filter(c => c.kind === 'yard' && c.ownerId === playerId && typeof c.yardIndex !== 'undefined');
  return [0, 1, 2, 3].map(i => {
    const spot = yardCells[i % yardCells.length];
    return {
      id: uid(),
      playerId,
      state: 'yard',
      yardIndex: spot?.yardIndex ?? 0,
      x: null,
      y: null,
    };
  });
}

// PUBLIC_INTERFACE
export function useLudoGame() {
  /**
   * Stateful game hook encapsulating all gameplay: players, tokens, board, dice, turns, capture, win.
   * Mock "network" is simulated by local state and timeouts.
   */
  const [players, setPlayers] = useState(DEFAULT_PLAYERS);
  const [cells, setCells] = useState(() => buildCells(DEFAULT_PLAYERS));
  const [tokens, setTokens] = useState(() => players.flatMap(p => createTokensForPlayer(p.id, cells)));
  const [turnIndex, setTurnIndex] = useState(0);
  const [winners, setWinners] = useState([]);
  const [moveCount, setMoveCount] = useState(0);

  const [diceRolling, setDiceRolling] = useState(false);
  const [diceValue, setDiceValue] = useState(null);
  const [phase, setPhase] = useState('idle'); // idle | rolled | moved
  const [highlights, setHighlights] = useState([]);
  const [autoPlay, setAutoPlay] = useState(false);

  // rebuild cells when players change
  useEffect(() => {
    const c = buildCells(players);
    setCells(c);
  }, [players]);

  // ensure tokens align with players
  useEffect(() => {
    setTokens(prev => {
      const byPlayer = new Map(prev.map(t => [t.playerId + ':' + t.id, t]));
      const updated = [];
      players.forEach(p => {
        const pts = prev.filter(t => t.playerId === p.id);
        if (pts.length >= 4) {
          updated.push(...pts.slice(0, 4));
        } else {
          const needed = 4 - pts.length;
          const newOnes = createTokensForPlayer(p.id, cells).slice(0, needed);
          updated.push(...pts, ...newOnes);
        }
      });
      return updated;
    });
  }, [players, cells]);

  const currentPlayer = players[turnIndex % players.length];

  const canRoll = phase === 'idle' && !diceRolling && winners.length < players.length - 1;
  const canEndTurn = phase !== 'idle' && !diceRolling;
  const canAutoStep = diceValue != null && phase === 'rolled';

  const ui = { diceRolling, diceValue, phase, canRoll, canEndTurn, canAutoStep, highlights, autoPlay };

  // PUBLIC_INTERFACE
  const addPlayer = useCallback((name, color) => {
    setPlayers(prev => {
      if (prev.length >= 4) return prev;
      const id = uid().toUpperCase();
      return [...prev, { id, name, color }];
    });
  }, []);

  // PUBLIC_INTERFACE
  const removePlayer = useCallback((id) => {
    setPlayers(prev => prev.filter(p => p.id !== id));
    setTokens(prev => prev.filter(t => t.playerId !== id));
    setTurnIndex(0);
  }, []);

  // PUBLIC_INTERFACE
  const randomizeSeats = useCallback(() => {
    setPlayers(prev => {
      const arr = [...prev];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    });
  }, []);

  // PUBLIC_INTERFACE
  const startGame = useCallback(() => {
    setTurnIndex(0);
    setWinners([]);
    setMoveCount(0);
    setDiceRolling(false);
    setDiceValue(null);
    setPhase('idle');
    setHighlights([]);
    // reset tokens to yard
    setTokens(prev => prev.map(t => {
      const yardCells = cells.filter(c => c.kind === 'yard' && c.ownerId === t.playerId && typeof c.yardIndex !== 'undefined');
      const idx = t.yardIndex ?? 0;
      const fixedIdx = yardCells[idx] ? idx : 0;
      return { ...t, state: 'yard', x: null, y: null, yardIndex: fixedIdx };
    }));
  }, [cells]);

  // PUBLIC_INTERFACE
  const resetGame = useCallback(() => {
    setPlayers(DEFAULT_PLAYERS);
    setCells(buildCells(DEFAULT_PLAYERS));
    setTokens(prev => DEFAULT_PLAYERS.flatMap(p => createTokensForPlayer(p.id, cells)));
    setTurnIndex(0);
    setWinners([]);
    setMoveCount(0);
    setDiceRolling(false);
    setDiceValue(null);
    setPhase('idle');
    setHighlights([]);
    setAutoPlay(false);
  }, [cells]);

  // PUBLIC_INTERFACE
  const rollDice = useCallback(() => {
    if (!canRoll) return;
    setDiceRolling(true);
    setPhase('rolling');
    // mock network animation delay
    setTimeout(() => {
      const v = 1 + Math.floor(Math.random() * 6);
      setDiceValue(v);
      setDiceRolling(false);
      setPhase('rolled');
      // compute highlights (movable tokens)
      const movable = [];
      const myTokens = tokens.filter(t => t.playerId === currentPlayer.id);
      myTokens.forEach(t => {
        const canEnter = t.state === 'yard' && canEnterFromYard(v);
        if (canEnter) movable.push({ tokenId: t.id });
        if (t.state === 'board') {
          const dest = nextPositionAlongPath(cells, t, v, players);
          if (dest && dest !== 'no-move') movable.push({ tokenId: t.id });
        }
      });
      setHighlights(movable.length ? computeTokenTargets(movable, tokens, cells) : []);
      if (autoPlay) {
        // auto choose after small delay
        setTimeout(() => autoPlayStep(), 400);
      }
    }, 600);
  }, [canRoll, autoPlay, currentPlayer?.id, tokens, players, cells]);

  function computeTokenTargets(movable, allTokens, cells) {
    const result = [];
    movable.forEach(m => {
      const tok = allTokens.find(t => t.id === m.tokenId);
      if (!tok) return;
      if (tok.state === 'yard') {
        // highlight the player's entry
        const dest = nextPositionAlongPath(cells, tok, 6, players);
        if (dest && dest !== 'no-move') result.push(dest);
      } else if (tok.state === 'board' && diceValue != null) {
        const dest = nextPositionAlongPath(cells, tok, diceValue, players);
        if (dest && dest !== 'no-move') result.push(dest);
      }
    });
    return result;
  }

  // PUBLIC_INTERFACE
  const onTokenClick = useCallback((token) => {
    if (phase !== 'rolled') return;
    if (token.playerId !== currentPlayer.id) return;

    if (token.state === 'yard') {
      if (!canEnterFromYard(diceValue)) return;
      const dest = nextPositionAlongPath(cells, token, diceValue, players);
      if (!dest || dest === 'no-move') return;
      performMove(token, dest);
      return;
    }
    if (token.state === 'board') {
      const dest = nextPositionAlongPath(cells, token, diceValue, players);
      if (!dest || dest === 'no-move') return;
      performMove(token, dest);
    }
  }, [phase, diceValue, currentPlayer?.id, players, cells]);

  // PUBLIC_INTERFACE
  const onCellClick = useCallback((_cell) => {
    // Optional: Allow clicking cells to move if exactly one token can go there.
    // Not essential; token click is the primary action.
  }, []);

  const performMove = useCallback((token, dest) => {
    setTokens(prev => {
      const next = prev.map(t => ({ ...t }));
      const found = next.find(t => t.id === token.id);
      if (!found) return prev;

      // handle capture
      if (dest !== 'home' && canCaptureAt(cells, next, dest, found)) {
        sendCapturedToYard(next, dest, found, cells);
      }

      if (token.state === 'yard') {
        found.state = 'board';
        found.x = dest.x; found.y = dest.y;
      } else if (dest === 'home') {
        found.state = 'home'; found.x = null; found.y = null;
      } else {
        found.x = dest.x; found.y = dest.y;
      }
      return next;
    });
    setMoveCount(m => m + 1);
    setPhase('moved');
    setHighlights([]);

    // if dice was 6, grant another roll; else advance turn
    if (diceValue === 6) {
      setPhase('idle');
      setDiceValue(null);
    } else {
      endTurn();
    }
  }, [cells, diceValue]);

  const endTurn = useCallback(() => {
    setPhase('idle');
    setDiceValue(null);
    // Check win condition for current player (all home)
    setTokens(prev => {
      const myId = currentPlayer?.id;
      const myTokens = prev.filter(t => t.playerId === myId);
      const allHome = myTokens.length > 0 && myTokens.every(t => t.state === 'home');
      if (allHome) {
        setWinners(w => {
          if (w.find(x => x.id === myId)) return w;
          const me = players.find(p => p.id === myId);
          return me ? [...w, me] : w;
        });
      }
      return prev;
    });
    setTurnIndex(i => (i + 1) % players.length);
  }, [players, currentPlayer?.id]);

  // PUBLIC_INTERFACE
  const endTurnManually = useCallback(() => {
    if (!canEndTurn) return;
    if (phase === 'rolled') {
      // no move made; if dice was 6 allow another roll
      if (diceValue === 6) {
        setPhase('idle');
        setDiceValue(null);
        return;
      }
    }
    endTurn();
  }, [canEndTurn, diceValue, phase, endTurn]);

  // PUBLIC_INTERFACE
  const toggleAutoPlay = useCallback(() => setAutoPlay(a => !a), []);

  const autoPlayRef = useRef(null);
  const autoPlayStep = useCallback(() => {
    if (!autoPlay) return;
    if (phase === 'idle') {
      rollDice();
      return;
    }
    if (phase === 'rolled') {
      // pick first movable token
      const myTokens = tokens.filter(t => t.playerId === currentPlayer.id);
      for (const tok of myTokens) {
        if (tok.state === 'yard' && canEnterFromYard(diceValue)) {
          const dest = nextPositionAlongPath(cells, tok, diceValue, players);
          if (dest && dest !== 'no-move') {
            performMove(tok, dest);
            return;
          }
        }
        if (tok.state === 'board') {
          const dest = nextPositionAlongPath(cells, tok, diceValue, players);
          if (dest && dest !== 'no-move') {
            performMove(tok, dest);
            return;
          }
        }
      }
      // no moves -> end turn
      endTurnManually();
    }
  }, [autoPlay, phase, rollDice, tokens, currentPlayer?.id, diceValue, cells, players, performMove, endTurnManually]);

  useEffect(() => {
    if (!autoPlay) return;
    autoPlayRef.current = setInterval(() => {
      autoPlayStep();
    }, 1500);
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [autoPlay, autoPlayStep]);

  const actions = {
    addPlayer,
    removePlayer,
    randomizeSeats,
    startGame,
    resetGame,
    rollDice,
    onTokenClick,
    onCellClick,
    endTurnManually,
    toggleAutoPlay,
    autoPlayStep,
  };

  const state = { players, cells, tokens, turnIndex, winners, moveCount };
  return { state, ui, actions };
}

import React, { useMemo, useState } from 'react';
import { useLudoGame } from './hooks/useLudoGame';
import LudoBoard from './components/LudoBoard';
import Dice from './components/Dice';
import PlayerPanel from './components/PlayerPanel';
import LobbyModal from './components/LobbyModal';

// PUBLIC_INTERFACE
export default function GamePage() {
  /**
   * GamePage composes the full UI:
   * - Header with branding and controls
   * - Left panel: dice + controls
   * - Center: LudoBoard (grid + tokens)
   * - Right panel: player stats and turn info
   * - Lobby modal for setting up multiplayer
   */
  const [showLobby, setShowLobby] = useState(true);
  const {
    state,
    ui,
    actions,
  } = useLudoGame();

  const currentPlayer = useMemo(() => state.players[state.turnIndex], [state.players, state.turnIndex]);

  return (
    <div className="container-app">
      <header className="header">
        <div className="brand">
          <div className="logo" />
          Ludo Ocean
        </div>
        <div className="actions">
          <span className="badge">Players: {state.players.length}</span>
          <button className="btn" onClick={() => setShowLobby(true)} aria-label="Open lobby">Lobby</button>
          <button className="btn" onClick={actions.resetGame} aria-label="Reset game">Reset</button>
          <button className="btn btn-primary" onClick={actions.randomizeSeats} aria-label="Randomize seats">Shuffle Seats</button>
        </div>
      </header>

      <main className="layout">
        <aside className="side">
          <section className="card section">
            <div className="section-title">Dice</div>
            <Dice
              rolling={ui.diceRolling}
              value={ui.diceValue}
              canRoll={ui.canRoll}
              onRoll={actions.rollDice}
              currentPlayer={currentPlayer}
            />
          </section>

          <section className="card section">
            <div className="section-title">Turn</div>
            <div className="stats">
              <div className="stat">
                <span>Current</span>
                <b style={{ color: currentPlayer.color }}>{currentPlayer.name}</b>
              </div>
              <div className="stat">
                <span>Dice</span>
                <b>{ui.diceValue ?? '-'}</b>
              </div>
              <div className="stat">
                <span>Phase</span>
                <b>{ui.phase}</b>
              </div>
            </div>
          </section>

          <section className="card section">
            <div className="section-title">Controls</div>
            <div className="stats">
              <button className="btn" onClick={actions.autoPlayStep} disabled={!ui.canAutoStep}>Auto Step</button>
              <button className="btn" onClick={actions.toggleAutoPlay}>{ui.autoPlay ? 'Stop Auto' : 'Start Auto'}</button>
              <button className="btn" onClick={actions.endTurnManually} disabled={!ui.canEndTurn}>End Turn</button>
            </div>
          </section>
        </aside>

        <section className="center-board card">
          <div className="board-wrapper">
            <div className="board-surface" />
            <div className="board-canvas">
              <LudoBoard
                cells={state.cells}
                players={state.players}
                tokens={state.tokens}
                highlights={ui.highlights}
                onTokenClick={actions.onTokenClick}
                onCellClick={actions.onCellClick}
                currentPlayerId={currentPlayer.id}
              />
            </div>
          </div>
        </section>

        <aside className="side">
          <section className="card section">
            <div className="section-title">Players</div>
            {state.players.map(p => (
              <PlayerPanel key={p.id} player={p} tokens={state.tokens.filter(t => t.playerId === p.id)} isActive={p.id === currentPlayer.id} />
            ))}
          </section>

          <section className="card section">
            <div className="section-title">Game</div>
            <div className="stats">
              <div className="stat">
                <span>Winners</span>
                <b>{state.winners.length ? state.winners.map(w => w.name).join(', ') : '—'}</b>
              </div>
              <div className="stat">
                <span>Moves</span>
                <b>{state.moveCount}</b>
              </div>
            </div>
          </section>
        </aside>
      </main>

      <footer className="footer">Ocean Professional UI • Blue & Amber • Minimal, Rounded, Subtle Gradients</footer>

      <LobbyModal
        open={showLobby}
        onClose={() => setShowLobby(false)}
        players={state.players}
        addPlayer={actions.addPlayer}
        removePlayer={actions.removePlayer}
        canStart={state.players.length >= 2}
        onStart={() => { setShowLobby(false); actions.startGame(); }}
      />
    </div>
  );
}

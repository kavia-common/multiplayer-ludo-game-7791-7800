import React from 'react';
import './index.css';
import GamePage from './game/GamePage';

// PUBLIC_INTERFACE
export default function App() {
  /** The root App renders the GamePage which includes the board, dice, sidebars and lobby modal. */
  return <GamePage />;
}

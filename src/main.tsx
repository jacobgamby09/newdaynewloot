import { createRoot } from 'react-dom/client';
import App from './App';
import { sfx } from './game/audio';
import { useGameStore } from './state/store';
import './index.css';

// Keep the audio engine in sync with the persisted mute preference.
sfx.setMuted(useGameStore.getState().muted);
useGameStore.subscribe((state, prev) => {
  if (state.muted !== prev.muted) sfx.setMuted(state.muted);
});

if (import.meta.env.DEV) {
  // Lets tooling inspect and drive game state, e.g. for headless UI testing.
  (window as unknown as { __store: typeof useGameStore }).__store = useGameStore;
}

// No StrictMode: its double-mount in dev would create/destroy the Phaser
// canvas twice on every load for no benefit to this game shell.
createRoot(document.getElementById('root')!).render(<App />);

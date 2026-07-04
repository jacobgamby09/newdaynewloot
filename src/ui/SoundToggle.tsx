import { useGameStore } from '../state/store';

export function SoundToggle({ className = '' }: { className?: string }) {
  const muted = useGameStore((s) => s.muted);
  return (
    <button
      onClick={() => useGameStore.getState().toggleMuted()}
      aria-label={muted ? 'Unmute sound' : 'Mute sound'}
      title={muted ? 'Unmute sound' : 'Mute sound'}
      className={`grid size-7 place-items-center rounded-lg bg-white/10 text-sm transition hover:bg-white/20 ${className}`}
    >
      {muted ? '🔇' : '🔊'}
    </button>
  );
}

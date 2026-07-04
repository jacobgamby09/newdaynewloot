import { useGameStore } from './state/store';
import { CampScreen } from './ui/CampScreen';
import { HUD } from './ui/HUD';
import { PhaserMount } from './ui/PhaserMount';
import { SummaryScreen } from './ui/SummaryScreen';

export default function App() {
  const phase = useGameStore((s) => s.phase);
  const campOpen = useGameStore((s) => s.campOpen);

  return (
    <div className="relative h-full w-full overflow-hidden select-none">
      <PhaserMount />
      <HUD />
      <div id="loot-fly-layer" className="pointer-events-none absolute inset-0 z-40" />
      {phase === 'idle' && campOpen && <CampScreen />}
      {phase === 'idle' && !campOpen && (
        <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center">
          <span className="animate-pulse rounded-full bg-black/60 px-4 py-2 text-sm font-semibold text-amber-200 ring-1 ring-amber-300/30">
            ⛺ Click your tent to manage the camp
          </span>
        </div>
      )}
      {phase === 'summary' && <SummaryScreen />}
    </div>
  );
}

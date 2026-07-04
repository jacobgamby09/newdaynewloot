import { useGameStore } from './state/store';
import { CampOverlay } from './ui/CampUI';
import { HUD } from './ui/HUD';
import { PhaserMount } from './ui/PhaserMount';
import { SummaryScreen } from './ui/SummaryScreen';

export default function App() {
  const phase = useGameStore((s) => s.phase);

  return (
    <div className="relative h-full w-full overflow-hidden select-none">
      <PhaserMount />
      <HUD />
      <div id="loot-fly-layer" className="pointer-events-none absolute inset-0 z-40" />
      {phase === 'idle' && <CampOverlay />}
      {phase === 'summary' && <SummaryScreen />}
    </div>
  );
}

import { sfx } from '../game/audio';
import { RESOURCES, type ResourceType } from '../sim/types';
import {
  UPGRADE_ORDER,
  canAfford,
  isUpgradeUnlocked,
  upgradeCost,
} from '../sim/upgrades';
import { useGameStore } from '../state/store';
import { RESOURCE_LABELS, ResourceIcon } from './icons';
import { useCountUp } from './useCountUp';

function LootRow({
  resource,
  amount,
  delay,
}: {
  resource: ResourceType;
  amount: number;
  delay: number;
}) {
  const value = useCountUp(amount, 500, delay);
  return (
    <div
      className={`flex items-center justify-between rounded-lg bg-black/30 px-3 py-2 ${amount === 0 ? 'opacity-40' : ''}`}
    >
      <div className="flex items-center gap-2.5">
        <ResourceIcon resource={resource} size={20} />
        <span className="text-sm font-semibold text-white/80">{RESOURCE_LABELS[resource]}</span>
      </div>
      <span className="text-lg font-extrabold text-white tabular-nums">{value}</span>
    </div>
  );
}

export function SummaryScreen() {
  const runLoot = useGameStore((s) => s.runLoot);
  const totals = useGameStore((s) => s.totals);
  const depth = useGameStore((s) => s.depth);
  const upgrades = useGameStore((s) => s.upgrades);

  const upgradeReady = UPGRADE_ORDER.some((kind) => {
    const cost = upgradeCost(kind, upgrades[kind]);
    return isUpgradeUnlocked(kind, upgrades) && cost !== null && canAfford(totals, cost);
  });

  const again = () => {
    sfx.unlock();
    useGameStore.getState().startRun();
  };

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60">
      <div className="w-80 rounded-2xl bg-[#1d1712] p-6 shadow-2xl ring-1 ring-white/10">
        <h2 className="text-center text-xl font-extrabold text-amber-300">Run Complete</h2>
        <p className="mt-1 text-center text-xs text-white/50">
          Your miner is exhausted · reached {depth} m
        </p>
        <div className="mt-4 flex flex-col gap-2">
          {RESOURCES.map((r, i) => (
            <LootRow key={r} resource={r} amount={runLoot[r]} delay={250 + i * 350} />
          ))}
        </div>
        <p className="mt-3 text-center text-xs text-white/40">
          Camp storage · {totals.stone} stone · {totals.copper} copper · {totals.iron} iron
        </p>
        <button
          onClick={again}
          className="mt-4 w-full rounded-xl bg-amber-500 py-3 text-lg font-bold text-black transition hover:bg-amber-400 active:scale-95"
        >
          Mine Again
        </button>
        <button
          onClick={() => useGameStore.getState().goIdle()}
          className="mt-2 w-full rounded-xl py-2 text-sm font-semibold text-white/60 transition hover:text-white/90"
        >
          Camp{upgradeReady ? ' · 💡 upgrade available' : ''}
        </button>
      </div>
    </div>
  );
}

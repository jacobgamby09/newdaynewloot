import { SIM } from '../sim/config';
import { deriveLoadout } from '../sim/upgrades';
import type { ResourceType } from '../sim/types';
import { useGameStore } from '../state/store';
import { ResourceIcon } from './icons';
import { INTENT_INFO } from './intents';
import { SoundToggle } from './SoundToggle';

function BombSlot() {
  const bombsLeft = useGameStore((s) => s.bombsLeft);
  const arming = useGameStore((s) => s.arming);
  const phase = useGameStore((s) => s.phase);
  const upgrades = useGameStore((s) => s.upgrades);

  if (deriveLoadout(upgrades).bombCharges === 0) return null;

  const toggle = () => useGameStore.getState().setArming(!arming && bombsLeft > 0);

  return (
    <div className="pointer-events-auto absolute right-3 bottom-3 flex flex-col items-end gap-1">
      {arming && (
        <span className="rounded bg-black/60 px-2 py-1 text-xs font-semibold text-amber-300">
          Click a tile to blast (3×3)
        </span>
      )}
      <button
        onClick={toggle}
        disabled={bombsLeft === 0 || phase !== 'running'}
        className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold transition active:scale-95 ${
          arming
            ? 'bg-amber-500 text-black ring-2 ring-amber-300'
            : bombsLeft > 0
              ? 'bg-black/60 text-white ring-1 ring-white/20 hover:ring-amber-400'
              : 'cursor-not-allowed bg-black/40 text-white/30 ring-1 ring-white/10'
        }`}
      >
        💣 ×{bombsLeft}
      </button>
    </div>
  );
}

function LootChip({ resource, count }: { resource: ResourceType; count: number }) {
  return (
    <div
      id={`loot-${resource}`}
      className="flex min-w-28 items-center gap-2.5 rounded-xl bg-black/50 px-3 py-2 ring-1 ring-white/15"
    >
      <ResourceIcon resource={resource} size={22} />
      <span key={count} className="chip-pop text-xl font-extrabold tabular-nums">
        {count}
      </span>
    </div>
  );
}

function WorkerCard({
  name,
  stamina,
  maxStamina,
  done,
}: {
  name: string;
  stamina: number;
  maxStamina: number;
  done: boolean;
}) {
  const pct = Math.max(0, (stamina / maxStamina) * 100);
  const barColor = done
    ? 'bg-gray-500'
    : pct > 50
      ? 'bg-lime-500'
      : pct > 25
        ? 'bg-amber-500'
        : 'bg-red-500';
  return (
    <div className={`w-44 rounded-lg bg-black/50 px-2.5 py-1.5 ring-1 ring-white/15 ${done ? 'opacity-50' : ''}`}>
      <div className="mb-1 flex justify-between text-[11px] font-semibold tracking-wide text-white/70 uppercase">
        <span>{name}</span>
        <span className="tabular-nums">{done ? '💤' : Math.ceil(stamina)}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-black/50 ring-1 ring-white/15">
        <div
          className={`h-full rounded-full transition-[width] duration-200 ${barColor} ${!done && pct <= 25 ? 'bar-pulse' : ''}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function HUD() {
  const phase = useGameStore((s) => s.phase);
  const runLoot = useGameStore((s) => s.runLoot);
  const workers = useGameStore((s) => s.workers);
  const depth = useGameStore((s) => s.depth);
  const intent = useGameStore((s) => s.intent);

  if (phase === 'idle') return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-20 text-white">
      <div className="absolute top-3 left-3 flex flex-col gap-1.5">
        <LootChip resource="stone" count={runLoot.stone} />
        <LootChip resource="copper" count={runLoot.copper} />
        <LootChip resource="iron" count={runLoot.iron} />
      </div>

      <div className="absolute top-3 right-3 flex flex-col gap-1.5">
        {workers.map((w) => (
          <WorkerCard
            key={w.id}
            name={w.name}
            stamina={w.stamina}
            maxStamina={w.maxStamina}
            done={w.done}
          />
        ))}
      </div>

      <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
        <span className="rounded bg-black/40 px-2 py-1 text-xs font-medium text-white/80">
          Depth {depth} m
        </span>
        <span
          className={`rounded px-2 py-1 text-xs font-bold ${
            depth >= SIM.layers.layer2Row
              ? 'bg-orange-500/80 text-white'
              : 'bg-black/40 text-white/60'
          }`}
        >
          Layer {depth >= SIM.layers.layer2Row ? 2 : 1}
        </span>
        <span className="rounded bg-black/40 px-2 py-1 text-xs font-medium text-white/70">
          {INTENT_INFO[intent].icon} {INTENT_INFO[intent].name}
        </span>
        <SoundToggle className="pointer-events-auto bg-black/40" />
      </div>

      <BombSlot />
    </div>
  );
}

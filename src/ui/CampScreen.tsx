import { sfx } from '../game/audio';
import { RESOURCES, RUN_INTENTS, type LootTotals } from '../sim/types';
import {
  UPGRADES,
  canAfford,
  upgradeCost,
  type UpgradeKind,
} from '../sim/upgrades';
import { useGameStore } from '../state/store';
import { RESOURCE_LABELS, ResourceIcon } from './icons';
import { INTENT_INFO } from './intents';

function CostChips({ cost }: { cost: Partial<LootTotals> }) {
  return (
    <span className="flex items-center gap-2">
      {RESOURCES.filter((r) => (cost[r] ?? 0) > 0).map((r) => (
        <span key={r} className="flex items-center gap-1 text-xs font-semibold tabular-nums">
          <ResourceIcon resource={r} size={13} />
          {cost[r]}
        </span>
      ))}
    </span>
  );
}

/** Human-readable effect preview, e.g. "Damage 1 → 2". */
function effectPreview(kind: UpgradeKind, level: number): string {
  const def = UPGRADES[kind];
  const current = def.levels[level - 1].value;
  const next = def.levels[level]?.value;
  const fmt = (v: number) => (kind === 'elevator' ? `${v} m` : `${v}`);
  const label =
    kind === 'blacksmith'
      ? 'Damage'
      : kind === 'bunkhouse'
        ? 'Stamina'
        : kind === 'elevator'
          ? 'Start'
          : kind === 'satchel'
            ? 'Bombs'
            : 'Miners';
  return next === undefined ? `${label} ${fmt(current)}` : `${label} ${fmt(current)} → ${fmt(next)}`;
}

function BuildingCard({ kind }: { kind: UpgradeKind }) {
  const level = useGameStore((s) => s.upgrades[kind]);
  const totals = useGameStore((s) => s.totals);
  const def = UPGRADES[kind];
  const cost = upgradeCost(kind, level);
  const affordable = cost !== null && canAfford(totals, cost);

  const buy = () => {
    sfx.unlock();
    useGameStore.getState().buyUpgrade(kind);
  };

  return (
    <div className="flex items-center gap-3 rounded-xl bg-black/30 px-3 py-2.5 ring-1 ring-white/10">
      <div className="text-2xl">{def.icon}</div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-bold text-white">{def.name}</span>
          <span className="text-[11px] font-semibold text-amber-300/80">Lv {level}</span>
        </div>
        <div className="truncate text-xs text-white/50">
          {def.levels[level - 1].label} · {effectPreview(kind, level)}
        </div>
      </div>
      {cost === null ? (
        <span className="text-xs font-bold text-white/40">MAX</span>
      ) : (
        <button
          onClick={buy}
          disabled={!affordable}
          className={`flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
            affordable
              ? 'bg-amber-500 text-black hover:bg-amber-400 active:scale-95'
              : 'cursor-not-allowed bg-white/10 text-white/40'
          }`}
        >
          Upgrade
          <CostChips cost={cost} />
        </button>
      )}
    </div>
  );
}

function IntentPicker() {
  const intent = useGameStore((s) => s.intent);
  return (
    <div className="mt-3">
      <div className="mb-1.5 text-[11px] font-semibold tracking-wide text-white/50 uppercase">
        Run intent
      </div>
      <div className="grid grid-cols-3 gap-2">
        {RUN_INTENTS.map((i) => (
          <button
            key={i}
            onClick={() => useGameStore.getState().setIntent(i)}
            className={`flex flex-col items-center gap-0.5 rounded-lg px-2 py-2 text-xs font-bold transition ${
              intent === i
                ? 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-400'
                : 'bg-black/30 text-white/60 ring-1 ring-white/10 hover:text-white/90'
            }`}
          >
            <span className="text-base">{INTENT_INFO[i].icon}</span>
            {INTENT_INFO[i].name}
          </button>
        ))}
      </div>
      <p className="mt-1.5 min-h-8 text-center text-xs text-white/50">
        {INTENT_INFO[intent].blurb}
      </p>
    </div>
  );
}

export function CampScreen() {
  const totals = useGameStore((s) => s.totals);
  const runCount = useGameStore((s) => s.runCount);

  const start = () => {
    sfx.unlock();
    useGameStore.getState().startRun();
  };

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60">
      <div className="w-[26rem] max-w-[92vw] rounded-2xl bg-[#1d1712] p-6 shadow-2xl ring-1 ring-white/10">
        <div className="text-center">
          <div className="text-3xl">⛏️</div>
          <h1 className="mt-1 text-2xl font-extrabold text-amber-300">
            {runCount === 0 ? 'New Day New Loot' : 'Camp'}
          </h1>
          {runCount === 0 && (
            <p className="mt-2 text-sm text-white/60">
              Send your miner into the shaft. He digs on his own — the run ends when his stamina
              runs out.
            </p>
          )}
        </div>

        <div className="mt-4">
          <div className="mb-1.5 text-[11px] font-semibold tracking-wide text-white/50 uppercase">
            Camp storage
          </div>
          <div className="grid grid-cols-3 gap-2">
            {RESOURCES.map((r) => (
              <div
                key={r}
                className="flex flex-col items-center gap-0.5 rounded-xl bg-black/30 px-2 py-2.5 ring-1 ring-white/10"
              >
                <ResourceIcon resource={r} size={24} />
                <span className="text-xl leading-tight font-extrabold text-white tabular-nums">
                  {totals[r]}
                </span>
                <span className="text-[11px] font-semibold text-white/50">
                  {RESOURCE_LABELS[r]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-2">
          <BuildingCard kind="blacksmith" />
          <BuildingCard kind="bunkhouse" />
          <BuildingCard kind="elevator" />
          <BuildingCard kind="satchel" />
          <BuildingCard kind="crew" />
        </div>

        <IntentPicker />

        <button
          onClick={start}
          className="mt-4 w-full rounded-xl bg-amber-500 py-3 text-lg font-bold text-black transition hover:bg-amber-400 active:scale-95"
        >
          Start Run
        </button>
      </div>
    </div>
  );
}

import { sfx } from '../game/audio';
import { RESOURCES, type LootTotals } from '../sim/types';
import {
  REQUIRED_CAMP_LEVEL,
  UPGRADE_ORDER,
  UPGRADES,
  campLevel,
  canAfford,
  isUpgradeUnlocked,
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

function UpgradeIcon({ kind }: { kind: UpgradeKind }) {
  return (
    <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-amber-500/15 text-xl ring-1 ring-amber-300/20">
      {UPGRADES[kind].icon}
    </div>
  );
}

/** Human-readable effect preview, e.g. "Damage 1 -> 2". */
function effectPreview(kind: UpgradeKind, level: number): string {
  const def = UPGRADES[kind];
  const current = def.levels[level - 1].value;
  const next = def.levels[level]?.value;
  const fmt = (v: number) =>
    kind === 'elevator' ? `${v} m` : kind === 'townhall' ? `Lv ${v}` : `${v}`;
  const label =
    kind === 'townhall'
      ? 'Camp'
      : kind === 'blacksmith'
        ? 'Damage'
        : kind === 'bunkhouse'
          ? 'Stamina'
          : kind === 'elevator'
            ? 'Start'
            : kind === 'satchel'
              ? 'Bombs'
              : 'Miners';
  return next === undefined ? `${label} ${fmt(current)}` : `${label} ${fmt(current)} -> ${fmt(next)}`;
}

function BuildingCard({ kind }: { kind: UpgradeKind }) {
  const level = useGameStore((s) => s.upgrades[kind]);
  const levels = useGameStore((s) => s.upgrades);
  const totals = useGameStore((s) => s.totals);
  const def = UPGRADES[kind];
  const cost = upgradeCost(kind, level);
  const unlocked = isUpgradeUnlocked(kind, levels);
  const affordable = unlocked && cost !== null && canAfford(totals, cost);
  const requiredLevel = REQUIRED_CAMP_LEVEL[kind];

  const buy = () => {
    if (!affordable) return;
    sfx.unlock();
    useGameStore.getState().buyUpgrade(kind);
  };

  return (
    <div
      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 ring-1 ${
        unlocked ? 'bg-black/28 ring-white/10' : 'bg-black/18 opacity-75 ring-white/5'
      }`}
    >
      <UpgradeIcon kind={kind} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-bold text-white">{def.name}</span>
          <span className="text-[11px] font-semibold text-amber-300/80">Lv {level}</span>
        </div>
        <div className="truncate text-xs text-white/50">
          {unlocked
            ? `${def.levels[level - 1].label} - ${effectPreview(kind, level)}`
            : `Requires Camp Hub Lv ${requiredLevel}`}
        </div>
      </div>
      {!unlocked ? (
        <span className="rounded bg-white/5 px-2 py-1 text-[11px] font-bold text-white/35">
          LOCKED
        </span>
      ) : cost === null ? (
        <span className="text-xs font-bold text-white/40">MAX</span>
      ) : (
        <button
          onClick={buy}
          disabled={!affordable}
          className={`flex min-w-20 flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
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
    <div>
      <div className="mb-1.5 text-[11px] font-semibold tracking-wide text-white/50 uppercase">
        Run intent
      </div>
      <div className="grid grid-cols-3 gap-2">
        {(['balanced', 'depth', 'harvest'] as const).map((i) => (
          <button
            key={i}
            onClick={() => useGameStore.getState().setIntent(i)}
            className={`flex min-h-16 flex-col items-center justify-center gap-0.5 rounded-lg px-2 py-2 text-xs font-bold transition ${
              intent === i
                ? 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-400'
                : 'bg-black/30 text-white/60 ring-1 ring-white/10 hover:text-white/90'
            }`}
          >
            <span className="text-[11px] uppercase tracking-wide">{INTENT_INFO[i].name}</span>
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
  const upgrades = useGameStore((s) => s.upgrades);
  const currentCampLevel = campLevel(upgrades);
  const visibleKinds = UPGRADE_ORDER.filter(
    (kind) => isUpgradeUnlocked(kind, upgrades) || REQUIRED_CAMP_LEVEL[kind] <= currentCampLevel + 1,
  );

  const start = () => {
    sfx.unlock();
    useGameStore.getState().startRun();
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-30 text-white">
      <div className="pointer-events-auto absolute right-3 top-3 bottom-3 flex w-[25rem] max-w-[calc(100vw-1.5rem)] flex-col rounded-xl bg-[#1d1712]/90 p-4 shadow-2xl ring-1 ring-white/10 backdrop-blur-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold tracking-wide text-amber-300/70 uppercase">
              Camp Hub Lv {currentCampLevel}
            </div>
            <h1 className="text-2xl font-extrabold text-amber-300">
              {runCount === 0 ? 'New Day New Loot' : UPGRADES.townhall.levels[currentCampLevel - 1].label}
            </h1>
            {runCount === 0 && (
              <p className="mt-1 max-w-72 text-sm text-white/60">
                Send your miner into the shaft, bring loot home, and grow this camp.
              </p>
            )}
          </div>
          <button
            onClick={start}
            className="shrink-0 rounded-lg bg-amber-500 px-4 py-2 text-sm font-black text-black transition hover:bg-amber-400 active:scale-95"
          >
            Start Run
          </button>
        </div>

        <div className="mt-4">
          <div className="mb-1.5 text-[11px] font-semibold tracking-wide text-white/50 uppercase">
            Camp storage
          </div>
          <div className="grid grid-cols-3 gap-2">
            {RESOURCES.map((r) => (
              <div
                key={r}
                className="flex items-center justify-between gap-2 rounded-lg bg-black/30 px-2.5 py-2 ring-1 ring-white/10"
              >
                <div className="flex items-center gap-1.5">
                  <ResourceIcon resource={r} size={18} />
                  <span className="text-[11px] font-semibold text-white/50">
                    {RESOURCE_LABELS[r]}
                  </span>
                </div>
                <span className="text-lg leading-tight font-extrabold text-white tabular-nums">
                  {totals[r]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 min-h-0 flex-1 overflow-y-auto pr-1">
          <div className="mb-1.5 text-[11px] font-semibold tracking-wide text-white/50 uppercase">
            Camp projects
          </div>
          <div className="flex flex-col gap-2">
            {visibleKinds.map((kind) => (
              <BuildingCard key={kind} kind={kind} />
            ))}
          </div>
        </div>

        <div className="mt-3">
          <IntentPicker />
        </div>
      </div>
    </div>
  );
}

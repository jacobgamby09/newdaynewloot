import { useState } from 'react';
import { sfx } from '../game/audio';
import { modifierForDay } from '../sim/days';
import { RESOURCES, RUN_INTENTS, type LootTotals } from '../sim/types';
import {
  UPGRADES,
  canAfford,
  isBuilt,
  upgradeCost,
  type UpgradeKind,
} from '../sim/upgrades';
import { useGameStore } from '../state/store';
import { RESOURCE_LABELS, ResourceIcon } from './icons';
import { INTENT_INFO } from './intents';
import { SoundToggle } from './SoundToggle';

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
          ? 'Start depth'
          : kind === 'satchel'
            ? 'Bombs'
            : 'Miners';
  return next === undefined ? `${label} ${fmt(current)}` : `${label} ${fmt(current)} → ${fmt(next)}`;
}

function BuildingPopover({ kind }: { kind: UpgradeKind }) {
  const upgrades = useGameStore((s) => s.upgrades);
  const totals = useGameStore((s) => s.totals);
  const def = UPGRADES[kind];
  const level = upgrades[kind];
  const built = isBuilt(kind, upgrades);
  const cost = upgradeCost(kind, level);
  const affordable = cost !== null && canAfford(totals, cost);
  const close = () => useGameStore.getState().setSelectedBuilding(null);

  const buy = () => {
    if (!affordable) return;
    sfx.unlock();
    useGameStore.getState().buyUpgrade(kind);
  };

  return (
    <div className="pointer-events-auto w-[22rem] max-w-[92vw] rounded-2xl bg-[#1d1712]/95 p-4 shadow-2xl ring-1 ring-white/10 backdrop-blur-sm">
      <div className="flex items-start gap-3">
        <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-amber-500/15 text-2xl ring-1 ring-amber-300/20">
          {def.icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-extrabold text-white">{def.name}</span>
            <span className="text-xs font-semibold text-amber-300/80">
              {built ? `Lv ${level - 1}` : 'Not built'}
            </span>
          </div>
          <div className="text-xs text-white/55">{def.desc}</div>
        </div>
        <button
          onClick={close}
          aria-label="Close"
          className="grid size-7 shrink-0 place-items-center rounded-lg bg-white/10 text-sm font-bold text-white/70 transition hover:bg-white/20 hover:text-white"
        >
          ✕
        </button>
      </div>

      <div className="mt-3 rounded-lg bg-black/30 px-3 py-2 text-sm">
        <span className="font-semibold text-white/80">{def.levels[level - 1].label}</span>
        <span className="text-white/50"> · {effectPreview(kind, level)}</span>
      </div>

      {cost === null ? (
        <div className="mt-3 rounded-xl bg-white/5 py-2.5 text-center text-sm font-bold text-white/40">
          Fully upgraded
        </div>
      ) : (
        <button
          onClick={buy}
          disabled={!affordable}
          className={`mt-3 flex w-full items-center justify-center gap-3 rounded-xl py-2.5 text-sm font-black transition ${
            affordable
              ? 'bg-amber-500 text-black hover:bg-amber-400 active:scale-95'
              : 'cursor-not-allowed bg-white/10 text-white/40'
          }`}
        >
          {built ? 'Upgrade' : 'Build'}
          <CostChips cost={cost} />
        </button>
      )}
      {!affordable && cost !== null && (
        <p className="mt-1.5 text-center text-[11px] text-white/40">
          Not enough resources — keep mining!
        </p>
      )}
    </div>
  );
}

function IntentButtons() {
  const intent = useGameStore((s) => s.intent);
  return (
    <div className="flex items-center gap-1.5" title={INTENT_INFO[intent].blurb}>
      {RUN_INTENTS.map((i) => (
        <button
          key={i}
          onClick={() => useGameStore.getState().setIntent(i)}
          title={INTENT_INFO[i].blurb}
          className={`rounded-lg px-2.5 py-2 text-xs font-bold transition ${
            intent === i
              ? 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-400'
              : 'bg-black/30 text-white/60 ring-1 ring-white/10 hover:text-white/90'
          }`}
        >
          {INTENT_INFO[i].icon} {INTENT_INFO[i].name}
        </button>
      ))}
    </div>
  );
}

function ResetSaveButton() {
  const [confirming, setConfirming] = useState(false);

  const click = () => {
    if (!confirming) {
      setConfirming(true);
      // Auto-cancel so a stray click can't linger as an armed reset.
      setTimeout(() => setConfirming(false), 4000);
      return;
    }
    useGameStore.getState().resetSave();
    setConfirming(false);
  };

  return (
    <button
      onClick={click}
      title="Reset save"
      className={`grid h-7 place-items-center rounded-lg px-2 text-xs font-semibold transition ${
        confirming
          ? 'bg-red-500/20 text-red-300 ring-1 ring-red-400/50'
          : 'bg-white/10 text-white/50 hover:bg-white/20 hover:text-white/80'
      }`}
    >
      {confirming ? 'Wipe all progress?' : '🗑'}
    </button>
  );
}

export function CampOverlay() {
  const totals = useGameStore((s) => s.totals);
  const runCount = useGameStore((s) => s.runCount);
  const selected = useGameStore((s) => s.selectedBuilding);

  const day = runCount + 1;
  const mod = modifierForDay(day);

  const start = () => {
    sfx.unlock();
    useGameStore.getState().startRun();
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-30 text-white">
      {/* camp storage, always visible */}
      <div className="absolute top-3 left-3 flex flex-col gap-1.5">
        {RESOURCES.map((r) => (
          <div
            key={r}
            className="flex min-w-32 items-center gap-2.5 rounded-xl bg-black/50 px-3 py-2 ring-1 ring-white/15"
          >
            <ResourceIcon resource={r} size={22} />
            <span className="text-xl font-extrabold tabular-nums">{totals[r]}</span>
            <span className="ml-auto text-[11px] font-semibold text-white/45">
              {RESOURCE_LABELS[r]}
            </span>
          </div>
        ))}
      </div>

      {/* utilities */}
      <div className="pointer-events-auto absolute top-3 right-3 flex items-center gap-1.5">
        <SoundToggle />
        <ResetSaveButton />
      </div>

      {/* onboarding hint on the very first day */}
      {runCount === 0 && !selected && (
        <div className="absolute inset-x-0 top-16 flex justify-center">
          <span className="rounded-full bg-black/60 px-4 py-2 text-sm font-semibold text-amber-200 ring-1 ring-amber-300/30">
            ⛏️ Click a staked plot to build — or just start digging
          </span>
        </div>
      )}

      {/* popover + bottom bar */}
      <div className="absolute inset-x-0 bottom-3 flex flex-col items-center gap-2 px-3">
        {selected && <BuildingPopover kind={selected} />}
        <div className="pointer-events-auto flex max-w-full flex-wrap items-center justify-center gap-2 rounded-2xl bg-[#1d1712]/90 p-2.5 ring-1 ring-white/10 backdrop-blur-sm">
          <span
            className="flex items-center gap-1.5 rounded-lg bg-black/30 px-2.5 py-2 text-xs font-semibold text-amber-200/90 ring-1 ring-white/10"
            title={`${mod.blurb} ${mod.tip}`}
          >
            {mod.icon} Day {day} · {mod.name}
          </span>
          <IntentButtons />
          <button
            onClick={start}
            className="rounded-xl bg-amber-500 px-5 py-2 text-base font-black text-black transition hover:bg-amber-400 active:scale-95"
          >
            Start Run
          </button>
        </div>
      </div>
    </div>
  );
}

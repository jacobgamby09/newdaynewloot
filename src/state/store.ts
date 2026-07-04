import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  DEFAULT_LEVELS,
  canAfford,
  deriveLoadout,
  isUpgradeUnlocked,
  upgradeCost,
  type UpgradeKind,
  type UpgradeLevels,
} from '../sim/upgrades';
import { WORKER_ROSTER } from '../sim/workers';
import {
  RESOURCES,
  type LootTotals,
  type ResourceType,
  type RunEndReason,
  type RunIntent,
} from '../sim/types';

export type Phase = 'idle' | 'running' | 'summary';

const emptyLoot = (): LootTotals => ({ stone: 0, copper: 0, iron: 0 });

/** Per-worker HUD card data, mirrored from sim events. */
export interface WorkerHud {
  id: number;
  name: string;
  stamina: number;
  maxStamina: number;
  done: boolean;
}

function rosterWorkers(levels: UpgradeLevels): WorkerHud[] {
  const loadout = deriveLoadout(levels);
  return WORKER_ROSTER.slice(0, loadout.workerCount).map((def, i) => {
    const maxStamina = Math.round(loadout.maxStamina * def.staminaMult);
    return { id: i, name: def.name, stamina: maxStamina, maxStamina, done: false };
  });
}

interface GameStore {
  phase: Phase;
  seed: number;
  runCount: number;
  workers: WorkerHud[];
  depth: number;
  /** Live tracker — incremented as loot icons arrive in the HUD. */
  runLoot: LootTotals;
  /** Camp storage / wallet, persisted across sessions. */
  totals: LootTotals;
  upgrades: UpgradeLevels;
  intent: RunIntent;
  endReason: RunEndReason;
  /** Bomb charges remaining in the current run. */
  bombsLeft: number;
  /** True while the player is aiming a bomb (targeting mode). */
  arming: boolean;
  setIntent: (intent: RunIntent) => void;
  setArming: (arming: boolean) => void;
  setBombsLeft: (bombsLeft: number) => void;
  setWorkerStamina: (id: number, value: number, max: number) => void;
  setWorkerDone: (id: number) => void;
  startRun: () => void;
  /** Called by the scene when the run ends; snaps runLoot to the sim's authoritative totals. */
  finishRun: (loot: LootTotals, reason: RunEndReason) => void;
  goIdle: () => void;
  buyUpgrade: (kind: UpgradeKind) => void;
  addLoot: (resource: ResourceType, amount: number) => void;
  setDepth: (depth: number) => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      phase: 'idle',
      seed: 1,
      runCount: 0,
      workers: rosterWorkers(DEFAULT_LEVELS),
      depth: 0,
      runLoot: emptyLoot(),
      totals: emptyLoot(),
      upgrades: { ...DEFAULT_LEVELS },
      intent: 'balanced',
      endReason: 'exhausted',
      bombsLeft: 0,
      arming: false,

      setIntent: (intent) => set({ intent }),

      setArming: (arming) => set({ arming }),

      setBombsLeft: (bombsLeft) => set({ bombsLeft }),

      setWorkerStamina: (id, value, max) =>
        set((s) => ({
          workers: s.workers.map((w) =>
            w.id === id ? { ...w, stamina: value, maxStamina: max } : w,
          ),
        })),

      setWorkerDone: (id) =>
        set((s) => ({
          workers: s.workers.map((w) => (w.id === id ? { ...w, done: true } : w)),
        })),

      startRun: () =>
        set((s) => {
          const loadout = deriveLoadout(s.upgrades);
          return {
            phase: 'running',
            seed: (Math.random() * 0x7fffffff) | 0,
            runCount: s.runCount + 1,
            workers: rosterWorkers(s.upgrades),
            depth: loadout.startRow,
            runLoot: emptyLoot(),
            bombsLeft: loadout.bombCharges,
            arming: false,
          };
        }),

      finishRun: (loot, reason) =>
        set((s) => {
          const totals = { ...s.totals };
          for (const r of RESOURCES) totals[r] += loot[r];
          return {
            phase: 'summary',
            runLoot: { ...loot },
            endReason: reason,
            totals,
            arming: false,
          };
        }),

      goIdle: () => set({ phase: 'idle' }),

      buyUpgrade: (kind) => {
        const s = get();
        if (!isUpgradeUnlocked(kind, s.upgrades)) return;
        const cost = upgradeCost(kind, s.upgrades[kind]);
        if (!cost || !canAfford(s.totals, cost)) return;
        const totals = { ...s.totals };
        for (const r of RESOURCES) totals[r] -= cost[r] ?? 0;
        set({ totals, upgrades: { ...s.upgrades, [kind]: s.upgrades[kind] + 1 } });
      },

      addLoot: (resource, amount) =>
        set((s) => {
          // Icons still flying when the run ends must not double-count on top
          // of the authoritative snap from finishRun.
          if (s.phase !== 'running') return s;
          return { runLoot: { ...s.runLoot, [resource]: s.runLoot[resource] + amount } };
        }),

      setDepth: (depth) => set({ depth }),
    }),
    {
      name: 'ndnl-save-v1',
      partialize: (s) => ({
        totals: s.totals,
        upgrades: s.upgrades,
        runCount: s.runCount,
        intent: s.intent,
      }),
      // Deep-merge the nested records so saves from before a new resource or
      // building was added still load with sane defaults.
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<GameStore>;
        return {
          ...current,
          ...p,
          totals: { ...current.totals, ...p.totals },
          upgrades: { ...current.upgrades, ...p.upgrades },
        };
      },
    },
  ),
);

import type { LootTotals } from './types';

export type UpgradeKind = 'blacksmith' | 'bunkhouse' | 'elevator' | 'satchel' | 'crew';

export interface UpgradeLevel {
  /** Cost to reach this level (level 1 is the unbuilt baseline, cost ignored). */
  cost: Partial<LootTotals>;
  /** Meaning depends on the building: damage, max stamina, start depth, etc. */
  value: number;
  label: string;
}

export interface UpgradeDef {
  name: string;
  icon: string;
  desc: string;
  /**
   * levels[0] is the unbuilt baseline. Reaching level 2 IS constructing the
   * building (it appears physically in the camp); further levels upgrade it.
   */
  levels: UpgradeLevel[];
}

export const UPGRADES: Record<UpgradeKind, UpgradeDef> = {
  blacksmith: {
    name: 'Blacksmith',
    icon: '🔨',
    desc: 'Pickaxe damage per swing',
    levels: [
      { cost: {}, value: 1, label: 'No blacksmith' },
      { cost: { stone: 20, copper: 8 }, value: 2, label: 'Copper-capped pickaxe' },
      { cost: { stone: 40, iron: 12 }, value: 3, label: 'Iron pickaxe' },
    ],
  },
  bunkhouse: {
    name: 'Bunkhouse',
    icon: '🛏️',
    desc: 'Worker max stamina',
    levels: [
      { cost: {}, value: 80, label: 'Sleeping rough' },
      { cost: { stone: 12 }, value: 105, label: 'Bunk beds' },
      { cost: { stone: 30, copper: 10 }, value: 130, label: 'Warm meals' },
      { cost: { stone: 55, iron: 10 }, value: 160, label: 'Private rooms' },
    ],
  },
  elevator: {
    name: 'Elevator',
    icon: '🛗',
    desc: 'Run starts deeper in a pre-dug shaft',
    levels: [
      { cost: {}, value: 0, label: 'Surface entry' },
      { cost: { stone: 25, copper: 12 }, value: 5, label: 'Winch platform' },
      { cost: { stone: 50, iron: 15 }, value: 10, label: 'Steam lift' },
    ],
  },
  satchel: {
    name: 'Workshop',
    icon: '💣',
    desc: 'Bombs per run - blast a 3x3 area',
    levels: [
      { cost: {}, value: 0, label: 'No workshop' },
      { cost: { stone: 30, copper: 10 }, value: 1, label: 'Canvas satchel' },
      { cost: { stone: 45, iron: 8 }, value: 2, label: 'Reinforced satchel' },
    ],
  },
  crew: {
    name: 'Notice Board',
    icon: '📌',
    desc: 'Crew size - hire more miners',
    levels: [
      { cost: {}, value: 1, label: 'Lone miner' },
      { cost: { stone: 80, copper: 25, iron: 5 }, value: 2, label: 'Pip joins the crew' },
    ],
  },
};

/** 1-based level per building. Level 1 = not built yet. */
export type UpgradeLevels = Record<UpgradeKind, number>;

export const DEFAULT_LEVELS: UpgradeLevels = {
  blacksmith: 1,
  bunkhouse: 1,
  elevator: 1,
  satchel: 1,
  crew: 1,
};

export const UPGRADE_ORDER: UpgradeKind[] = [
  'blacksmith',
  'bunkhouse',
  'elevator',
  'crew',
  'satchel',
];

/** A building physically exists in the camp once its first level is bought. */
export function isBuilt(kind: UpgradeKind, levels: UpgradeLevels): boolean {
  return (levels[kind] ?? 1) >= 2;
}

/** Everything the run simulation needs to know about the player's camp. */
export interface Loadout {
  pickaxeDamage: number;
  maxStamina: number;
  startRow: number;
  bombCharges: number;
  workerCount: number;
}

export function deriveLoadout(levels: UpgradeLevels): Loadout {
  return {
    pickaxeDamage: UPGRADES.blacksmith.levels[(levels.blacksmith ?? 1) - 1].value,
    maxStamina: UPGRADES.bunkhouse.levels[(levels.bunkhouse ?? 1) - 1].value,
    startRow: UPGRADES.elevator.levels[(levels.elevator ?? 1) - 1].value,
    bombCharges: UPGRADES.satchel.levels[(levels.satchel ?? 1) - 1].value,
    workerCount: UPGRADES.crew.levels[(levels.crew ?? 1) - 1].value,
  };
}

/** Cost of the next level, or null when maxed. */
export function upgradeCost(kind: UpgradeKind, currentLevel: number): Partial<LootTotals> | null {
  return UPGRADES[kind].levels[currentLevel]?.cost ?? null;
}

export function canAfford(totals: LootTotals, cost: Partial<LootTotals>): boolean {
  return (Object.entries(cost) as [keyof LootTotals, number][]).every(
    ([resource, amount]) => totals[resource] >= amount,
  );
}

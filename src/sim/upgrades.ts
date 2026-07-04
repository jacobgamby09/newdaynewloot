import type { LootTotals } from './types';

export type UpgradeKind = 'townhall' | 'blacksmith' | 'bunkhouse' | 'elevator' | 'satchel' | 'crew';

export interface UpgradeLevel {
  /** Cost to reach this level (ignored for the built-in level 1). */
  cost: Partial<LootTotals>;
  /** Meaning depends on the building: damage, max stamina, start depth, etc. */
  value: number;
  label: string;
}

export interface UpgradeDef {
  name: string;
  icon: string;
  desc: string;
  levels: UpgradeLevel[];
}

export const UPGRADES: Record<UpgradeKind, UpgradeDef> = {
  townhall: {
    name: 'Camp Hub',
    icon: '⛺',
    desc: 'Camp level and upgrade access',
    levels: [
      { cost: {}, value: 1, label: 'Survey tent' },
      { cost: { stone: 10, copper: 3 }, value: 2, label: 'Staked camp' },
      { cost: { stone: 32, copper: 10 }, value: 3, label: 'Crew camp' },
      { cost: { stone: 58, copper: 18, iron: 4 }, value: 4, label: 'Workshop yard' },
      { cost: { stone: 95, copper: 30, iron: 12 }, value: 5, label: 'Mining outpost' },
    ],
  },
  blacksmith: {
    name: 'Blacksmith',
    icon: '🔨',
    desc: 'Pickaxe damage per swing',
    levels: [
      { cost: {}, value: 1, label: 'Rusty pickaxe' },
      { cost: { stone: 20, copper: 8 }, value: 2, label: 'Copper-capped pickaxe' },
      { cost: { stone: 40, iron: 12 }, value: 3, label: 'Iron pickaxe' },
    ],
  },
  bunkhouse: {
    name: 'Bunkhouse',
    icon: '🛏️',
    desc: 'Worker max stamina',
    levels: [
      { cost: {}, value: 80, label: 'Bedroll' },
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
    name: 'Bomb Satchel',
    icon: '💣',
    desc: 'Bombs per run - blast a 3x3 area',
    levels: [
      { cost: {}, value: 0, label: 'No satchel' },
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

/** 1-based level per building. */
export type UpgradeLevels = Record<UpgradeKind, number>;

export const DEFAULT_LEVELS: UpgradeLevels = {
  townhall: 1,
  blacksmith: 1,
  bunkhouse: 1,
  elevator: 1,
  satchel: 1,
  crew: 1,
};

export const UPGRADE_ORDER: UpgradeKind[] = [
  'townhall',
  'blacksmith',
  'bunkhouse',
  'elevator',
  'crew',
  'satchel',
];

export const REQUIRED_CAMP_LEVEL: Record<UpgradeKind, number> = {
  townhall: 1,
  blacksmith: 1,
  bunkhouse: 1,
  elevator: 2,
  crew: 3,
  satchel: 4,
};

export function campLevel(levels: UpgradeLevels): number {
  return levels.townhall ?? DEFAULT_LEVELS.townhall;
}

export function isUpgradeUnlocked(kind: UpgradeKind, levels: UpgradeLevels): boolean {
  if (kind === 'townhall') return true;
  // Existing saves may already own advanced categories. Keep those usable even
  // when the newly-added camp level starts at 1.
  if ((levels[kind] ?? DEFAULT_LEVELS[kind]) > 1) return true;
  return campLevel(levels) >= REQUIRED_CAMP_LEVEL[kind];
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

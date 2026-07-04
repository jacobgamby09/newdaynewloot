import { mulberry32 } from './rng';

export type DayModifierKind =
  | 'quiet'
  | 'richVeins'
  | 'unstableTunnels'
  | 'oreBloom'
  | 'collapsedShaft';

/**
 * A day modifier is a pure data profile applied on top of the existing
 * systems (grid generation, stamina drain, loot rolls) — no special-case
 * code paths. The game rolls one per day; the player counters with intent,
 * crew and bombs.
 */
export interface DayModifier {
  key: DayModifierKind;
  name: string;
  icon: string;
  /** Player-facing flavor for the camp notice. */
  blurb: string;
  /** Counter-play hint so no modifier reads as a pure penalty. */
  tip: string;
  /** Multiplier on copper/iron spawn probability. */
  oreMult: number;
  /** Rows the ore distribution creeps toward the surface. */
  oreDepthShift: number;
  /** Multiplier on all stamina costs (movement and mining). */
  staminaMult: number;
  /** Multiplier on the bonus-loot rolls (double copper/iron, hardstone iron). */
  richLootChance: number;
  /** Hardstone rubble blobs scattered through layer 1. */
  collapseClusters: number;
  /** Pre-dug open pockets in layer 1. */
  caves: number;
}

/** Internal neutral profile — used when no day modifier is in play (tests, defaults). */
export const NEUTRAL_DAY: DayModifier = {
  key: 'quiet',
  name: 'Ordinary Day',
  icon: '⛅',
  blurb: 'Nothing remarkable in the rock today.',
  tip: '',
  oreMult: 1,
  oreDepthShift: 0,
  staminaMult: 1,
  richLootChance: 1,
  collapseClusters: 0,
  caves: 0,
};

export const DAY_MODIFIERS: Record<DayModifierKind, DayModifier> = {
  quiet: {
    key: 'quiet',
    name: 'Quiet Day',
    icon: '🌤️',
    blurb: 'Calm, predictable digging. Fewer surprises, slightly easier work.',
    tip: 'Solid day to stockpile stone.',
    oreMult: 0.75,
    oreDepthShift: 0,
    staminaMult: 0.95,
    richLootChance: 0.7,
    collapseClusters: 0,
    caves: 0,
  },
  richVeins: {
    key: 'richVeins',
    name: 'Rich Veins',
    icon: '✨',
    blurb: 'The veins run fat today — ore everywhere.',
    tip: 'Harvest will feast.',
    oreMult: 1.7,
    oreDepthShift: 0,
    staminaMult: 1,
    richLootChance: 1.2,
    collapseClusters: 0,
    caves: 0,
  },
  unstableTunnels: {
    key: 'unstableTunnels',
    name: 'Unstable Tunnels',
    icon: '⚠️',
    blurb: 'The rock fights back and drains you fast, but drops run rich.',
    tip: 'Expect short runs — Push Depth or bombs make them count.',
    oreMult: 1.1,
    oreDepthShift: 0,
    staminaMult: 1.35,
    richLootChance: 1.6,
    collapseClusters: 0,
    caves: 0,
  },
  oreBloom: {
    key: 'oreBloom',
    name: 'Ore Bloom',
    icon: '🌋',
    blurb: 'Deep veins have crept toward the surface overnight.',
    tip: 'Harvest shallow — iron sits near the layer 2 border.',
    oreMult: 1.15,
    oreDepthShift: 4,
    staminaMult: 1,
    richLootChance: 1,
    collapseClusters: 0,
    caves: 0,
  },
  collapsedShaft: {
    key: 'collapsedShaft',
    name: 'Collapsed Shaft',
    icon: '🪨',
    blurb: 'Old tunnels riddle the rock — rubble walls and open pockets.',
    tip: 'Caves speed you down; bombs clear the rubble.',
    oreMult: 1,
    oreDepthShift: 0,
    staminaMult: 1,
    richLootChance: 1,
    collapseClusters: 4,
    caves: 3,
  },
};

const ROTATION: { kind: DayModifierKind; weight: number }[] = [
  { kind: 'quiet', weight: 2 },
  { kind: 'richVeins', weight: 2 },
  { kind: 'unstableTunnels', weight: 2 },
  { kind: 'oreBloom', weight: 1.5 },
  { kind: 'collapsedShaft', weight: 1.5 },
];

/**
 * Deterministic modifier for a given day number, so the camp can announce it
 * before the run and it stays stable across reloads. Day 1 is always quiet
 * for a gentle start.
 */
export function modifierForDay(day: number): DayModifier {
  if (day <= 1) return DAY_MODIFIERS.quiet;
  const rng = mulberry32((day * 0x9e3779b1) >>> 0);
  const total = ROTATION.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = rng() * total;
  for (const entry of ROTATION) {
    roll -= entry.weight;
    if (roll <= 0) return DAY_MODIFIERS[entry.kind];
  }
  return DAY_MODIFIERS.quiet;
}

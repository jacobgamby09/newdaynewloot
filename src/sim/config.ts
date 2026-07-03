import type { RunIntent, TileType } from './types';

interface TileDef {
  hits: number;
  staminaPerHit: number;
  /** Loot value used by the worker's tile scoring. */
  value: number;
}

interface IntentProfile {
  /** Weight on tile loot value — high for Harvest. */
  valueWeight: number;
  /** Deeper tiles score higher — high for Push Depth. */
  depthWeight: number;
  /** Score penalty per tile of walking distance. */
  distanceWeight: number;
  /** Stamina-cost penalty so cheap tiles are mildly preferred. */
  costWeight: number;
  /** Random jitter so paths meander instead of drilling one straight column. */
  jitter: number;
}

/**
 * All tuning knobs for the feel prototype live here.
 * Targets from docs/MVP_ROADMAP.md: 1 swing/sec, dirt 1 hit, stone 2 hits,
 * run length 15-30 seconds ending on stamina depletion.
 */
export const SIM = {
  grid: {
    width: 12,
    height: 40,
    startX: 6,
  },
  tiles: {
    dirt: { hits: 1, staminaPerHit: 2.5, value: 1 },
    stone: { hits: 2, staminaPerHit: 3.2, value: 2.5 },
    copper: { hits: 2, staminaPerHit: 3.2, value: 6 },
    hardstone: { hits: 4, staminaPerHit: 3.5, value: 2 },
    iron: { hits: 3, staminaPerHit: 3.5, value: 8 },
  } satisfies Record<TileType, TileDef>,
  layers: {
    /** First row of layer 2 — harder tiles and higher stamina drain below this. */
    layer2Row: 12,
    layer2StaminaMult: 1.8,
  },
  worker: {
    maxStamina: 80,
    moveStaminaPerTile: 0.6,
    moveDurationPerTile: 0.26,
    /** Climbing one tile up onto a ledge is slightly slower than walking. */
    stepUpDuration: 0.32,
    /** Falling is fast and free — gravity does the work. */
    fallDurationPerTile: 0.1,
    swingPeriod: 1.0,
    /** Fraction of the swing period where the hit lands (wind-up before, recovery after). */
    impactPoint: 0.45,
  },
  bomb: {
    /** HP removed from every tile in the blast — clears weak tiles, weakens hard ones. */
    damage: 2,
    /** Seconds from planting to explosion. */
    fuse: 0.9,
    /** Blast reach in tiles from the center (1 = 3x3). */
    radius: 1,
  },
  /** Tile-scoring profiles — the run intent is the player's pre-run agency. */
  intents: {
    balanced: { valueWeight: 1.0, depthWeight: 0.5, distanceWeight: 0.9, costWeight: 0.15, jitter: 1.0 },
    depth: { valueWeight: 0.3, depthWeight: 1.6, distanceWeight: 1.1, costWeight: 0.1, jitter: 0.4 },
    harvest: { valueWeight: 2.5, depthWeight: -0.4, distanceWeight: 0.7, costWeight: 0.2, jitter: 0.8 },
  } satisfies Record<RunIntent, IntentProfile>,
} as const;

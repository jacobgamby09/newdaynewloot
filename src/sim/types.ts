export type TileType = 'dirt' | 'stone' | 'copper' | 'hardstone' | 'iron';
export type ResourceType = 'stone' | 'copper' | 'iron';

export const RESOURCES: ResourceType[] = ['stone', 'copper', 'iron'];

export type RunIntent = 'balanced' | 'depth' | 'harvest';

export const RUN_INTENTS: RunIntent[] = ['balanced', 'depth', 'harvest'];

export interface Tile {
  type: TileType;
  hp: number;
  maxHp: number;
}

export interface Cell {
  x: number;
  y: number;
}

export interface LootDrop {
  resource: ResourceType;
  amount: number;
}

export type LootTotals = Record<ResourceType, number>;

export type RunEndReason = 'exhausted' | 'cleared';

export interface BrokenTile {
  cell: Cell;
  tile: TileType;
  loot: LootDrop[];
}

export interface DamagedTile {
  cell: Cell;
  hpLeft: number;
  maxHp: number;
}

export type SimEvent =
  | { kind: 'moveStarted'; workerId: number; from: Cell; to: Cell; duration: number; fall: boolean }
  | { kind: 'landed'; workerId: number; cell: Cell; distance: number }
  | { kind: 'bombPlanted'; cell: Cell; fuse: number }
  | { kind: 'bombExploded'; cell: Cell; broken: BrokenTile[]; damaged: DamagedTile[] }
  | { kind: 'swing'; workerId: number; worker: Cell; target: Cell }
  | {
      kind: 'hit';
      workerId: number;
      target: Cell;
      tile: TileType;
      broken: boolean;
      hpLeft: number;
      maxHp: number;
    }
  | { kind: 'tileBroken'; target: Cell; tile: TileType; loot: LootDrop[] }
  | { kind: 'staminaChanged'; workerId: number; value: number; max: number }
  | { kind: 'workerDone'; workerId: number }
  | { kind: 'depthChanged'; depth: number }
  | { kind: 'runEnded'; reason: RunEndReason; loot: LootTotals };

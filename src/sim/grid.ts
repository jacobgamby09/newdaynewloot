import { SIM } from './config';
import { mulberry32 } from './rng';
import type { Tile, TileType } from './types';

function makeTile(type: TileType): Tile {
  const hits = SIM.tiles[type].hits;
  return { type, hp: hits, maxHp: hits };
}

/**
 * Generates the mine as rows of tiles. Row 0 is the empty surface the worker
 * walks on. Layer 1 grows denser with stone and copper veins; from
 * SIM.layers.layer2Row down, hardstone dominates with iron veins. An elevator
 * shaft is pre-dug down to startRow, one column per crew member.
 */
export function generateGrid(seed: number, startRow = 0, shaftColumns = 1): (Tile | null)[][] {
  const rng = mulberry32(seed ^ 0x9e3779b9);
  const { width, height, startX } = SIM.grid;
  const grid: (Tile | null)[][] = [];

  for (let y = 0; y < height; y++) {
    const row: (Tile | null)[] = [];
    for (let x = 0; x < width; x++) {
      if (y === 0) {
        row.push(null);
        continue;
      }
      let type: TileType;
      const r = rng();
      if (y < SIM.layers.layer2Row) {
        const depth = y - 1;
        const pStone = Math.min(0.14 + depth * 0.02, 0.5);
        const pCopper = 0.05 + Math.min(depth * 0.005, 0.05);
        type = r < pCopper ? 'copper' : r < pCopper + pStone ? 'stone' : 'dirt';
      } else {
        // Layer 2: a wall of hardstone with iron veins and scattered soft spots.
        type = r < 0.08 ? 'iron' : r < 0.23 ? 'stone' : r < 0.35 ? 'dirt' : 'hardstone';
      }
      row.push(makeTile(type));
    }
    grid.push(row);
  }

  // Clump ores into small veins by occasionally spreading to a neighbour.
  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ] as const;
  for (let y = 1; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const type = grid[y][x]?.type;
      if ((type !== 'copper' && type !== 'iron') || rng() >= 0.4) continue;
      const [dx, dy] = dirs[Math.floor(rng() * dirs.length)];
      const neighbour = grid[y + dy]?.[x + dx];
      if (neighbour && neighbour.type !== type) {
        grid[y + dy][x + dx] = makeTile(type);
      }
    }
  }

  // Elevator shaft: pre-dug columns down to the start row.
  for (let c = 0; c < shaftColumns; c++) {
    const x = Math.min(startX + c, width - 1);
    for (let y = 1; y <= startRow && y < height; y++) {
      grid[y][x] = null;
    }
  }

  return grid;
}

import type { TileType } from '../sim/types';
import copper01 from '../assets/tiles/layer1/copper_01.png';
import copper02 from '../assets/tiles/layer1/copper_02.png';
import copper03 from '../assets/tiles/layer1/copper_03.png';
import dirt01 from '../assets/tiles/layer1/dirt_01.png';
import dirt02 from '../assets/tiles/layer1/dirt_02.png';
import dirt03 from '../assets/tiles/layer1/dirt_03.png';
import iron01 from '../assets/tiles/layer1/iron_01.png';
import iron02 from '../assets/tiles/layer1/iron_02.png';
import iron03 from '../assets/tiles/layer1/iron_03.png';
import stone01 from '../assets/tiles/layer1/stone_01.png';
import stone02 from '../assets/tiles/layer1/stone_02.png';
import stone03 from '../assets/tiles/layer1/stone_03.png';

/**
 * PNG tile art (32x32, docs/visual.md style). Tile types not listed here
 * (hardstone for now) keep their procedural textures from textures.ts, which
 * also serve as fallbacks if an asset fails to load.
 *
 * Extend per layer as new art lands: add imports and list them here.
 */
export const TILE_ASSET_VARIANTS: Partial<Record<TileType, string[]>> = {
  dirt: [dirt01, dirt02, dirt03],
  stone: [stone01, stone02, stone03],
  copper: [copper01, copper02, copper03],
  iron: [iron01, iron02, iron03],
};

export function tileVariantCount(type: TileType): number {
  return TILE_ASSET_VARIANTS[type]?.length ?? 0;
}

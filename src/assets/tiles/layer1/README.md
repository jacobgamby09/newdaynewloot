# Layer 1 Tile Assets

Clean modern pixel-art tiles for the early mine layer.

Each tile is 32x32 pixels and follows `docs/visual.md`:

- crisp pixel edges
- chunky readable silhouettes
- limited texture marks
- clear top highlight and bottom weight
- large readable ore clusters

## Files

- `dirt_01.png` to `dirt_03.png`
- `stone_01.png` to `stone_03.png`
- `copper_01.png` to `copper_03.png`
- `iron_01.png` to `iron_03.png`
- `layer1_tilesheet.png` - 4 columns x 3 rows, 32px grid
- `layer1_tiles_preview.png` - scaled preview for review only
- `layer1_tilesheet.json` - frame metadata for the spritesheet

## Spritesheet Order

Rows are packed left to right:

1. `dirt_01`, `dirt_02`, `dirt_03`, `stone_01`
2. `stone_02`, `stone_03`, `copper_01`, `copper_02`
3. `copper_03`, `iron_01`, `iron_02`, `iron_03`

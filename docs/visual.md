# Visual Style Direction

This document defines the target art direction for New Day New Loot. Use it as
the visual reference when creating sprites, tiles, camp assets, effects, and
future concept images.

## Core Direction

Use a clean modern pixel-art style as the baseline.

The preferred style is readable first, decorative second. The game should look
warm, tactile, and satisfying without making the mine hard to parse. Tiles must
be distinguishable at a glance while the worker is moving, the camera is
following, loot is flying, and UI overlays are present.

The target blend:

- Baseline: clean modern pixel art with clear shapes, crisp tile edges, and
  controlled texture density.
- Borrow from the toy-like/chunky direction: stronger silhouettes, chunkier
  tile blocks, and more satisfying breakable forms.
- Reserve the darker/moody direction for deeper layers, rare mines, special
  events, and late-game atmosphere.

Avoid making the default early-game mine too dark, noisy, painterly, or
realistic. It should feel immediately playable.

## Visual Priorities

1. Tile readability.
2. Clear material identity.
3. Satisfying block shapes.
4. Cozy camp progression.
5. Layer atmosphere that escalates with depth.

If a detail makes the tile prettier but harder to identify, remove or simplify
the detail.

## Pixel Treatment

Use chunky pixel forms with a modern cleanup pass:

- Crisp edges.
- No blur.
- No soft gradients inside sprites.
- Limited texture pixels.
- Strong top/side/bottom plane separation on tiles.
- Subtle outline or edge contrast where tiles meet.
- Highlights should be blocky and intentional, not noisy.

Tiles should feel like objects the player wants to break. They can be slightly
chunky, rounded, or weighty, but should still sit neatly in the grid.

## Tile Language

Tiles are the most important visual system.

Each material needs a distinct read:

- Dirt: warm brown, loose strata, small pebble flecks, softest visual weight.
- Stone: cooler gray, angular chips, stronger cracks, heavier block feeling.
- Copper: warm ore clusters embedded in dirt or stone, high saturation accents.
- Hardstone: darker/cooler stone, denser mass, fewer bright highlights.
- Iron: pale metallic flecks or slabs inside hardstone, cooler and heavier than
  copper.

Use texture as a material signal, not as random decoration. A player should be
able to identify tile type even in peripheral vision.

## Tile Construction Rules

For a standard tile:

- Use one dominant base color.
- Add one shadow color, one edge color, and one highlight color.
- Use 3-7 meaningful texture marks, not dozens of noise pixels.
- Add a top-edge highlight when it helps separate rows.
- Add a darker bottom or side edge to give the tile weight.
- Keep ore clusters large enough to read at game scale.

Preferred tile personality:

- Squared but not sterile.
- Chunky but not childish.
- Textured but not noisy.
- Colorful but grounded.

## Layer Palette

Layer 1 should be readable, warm, and inviting:

- Dirt browns.
- Neutral gray stones.
- Bright copper accents.
- Clear daylight contrast near the surface.

Layer 2 should become heavier and cooler:

- Darker gray hardstone.
- More compressed texture.
- Less warm dirt.
- Sharper cracks and deeper shadows.
- Iron accents that read as valuable but tougher than copper.

Layer 3 and special mines can use the darker/moody inspiration:

- Cooler shadows.
- Glow accents.
- Crystal or gem light.
- More atmosphere around rare resources.
- Stronger contrast, but never so much that tile identity is lost.

## Camp Style

The camp should feel cozy, practical, and built by hand.

Camp assets should share the same clean pixel style as the mine but use warmer
materials:

- Canvas.
- Wood.
- Rope.
- Stone foundation.
- Small metal details.
- Warm lantern or forge accents later.

The Camp Hub starts as a modest tent and becomes a stronger mining outpost over
time. The player should see that their loot became something physical.

Camp progression should be visible through:

- Larger silhouette.
- Added support beams.
- Crates and tools.
- Work areas.
- Small banners or signs.
- Lanterns, forge glow, and machinery at higher levels.

Avoid turning the camp into a complex base-builder too early. The first goal is
visual satisfaction, not management complexity.

## Silhouette Rules

Sprites should read clearly before details are noticed.

Good silhouettes:

- Tent: triangular, low, stable, clearly on the grass line.
- Blacksmith: roof + chimney/forge shape.
- Bunkhouse: wider, calmer, with bedroll/wooden structure cues.
- Elevator: vertical frame, pulley, shaft connection.
- Workshop: tool clutter, bomb/scanner cues, small mechanical shapes.
- Notice Board: post-and-board shape with papers or markers.

Do not rely on tiny interior details to explain what a building is.

## Effects

Effects should support the chunky tile feel:

- Hit chips should be square or shard-like.
- Dirt dust should be soft but still pixel-clustered.
- Tile break should have a small burst and quick disappearance.
- Loot icons should stay simple and high contrast.
- Construction upgrades should use dust, small pop motion, and a brief highlight.

Effects should be readable and brief. They should not hide the tile being mined.

## UI Relationship

The UI should feel connected to the camp and mine without becoming heavy.

Use:

- Compact panels.
- Dark translucent backing.
- Warm amber highlights for available actions.
- Resource icons with clear material colors.
- Stable dimensions so numbers and buttons do not shift the layout.

Avoid generic dashboard styling. The UI can be clean, but it should still feel
like it belongs to a small mining camp.

## Do

- Keep early-game tiles bright enough to read quickly.
- Use the clean modern style as the default.
- Give every tile type a unique color and texture signature.
- Use chunky silhouettes for buildings and tiles.
- Save darker, richer atmosphere for deeper layers and special content.
- Test tiles at actual in-game scale before finalizing.

## Do Not

- Make default tiles overly noisy.
- Use realistic rendering, soft painting, or blurred lighting.
- Let ore details become tiny speckles.
- Make all stone variants the same gray with minor texture changes.
- Make the early mine too dark.
- Add decorative detail that competes with worker movement or loot fly-ups.

## Practical Asset Target

For initial production sprites:

- Build tiles at the same base grid size as the game currently uses.
- Keep each material readable at 100% game scale.
- Create a small test sheet before replacing all procedural textures.
- Start with Layer 1 tiles and Camp Hub levels before expanding to deeper
  layers.

First art pass priority:

1. Dirt.
2. Stone.
3. Copper.
4. Hardstone.
5. Iron.
6. Camp Hub levels 1-5.

Once those read well, expand to buildings, workers, effects, and deeper-layer
variants.

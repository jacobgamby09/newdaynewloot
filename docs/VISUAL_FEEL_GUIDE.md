# Visual Feel Guide

## Camera Direction

Use a side-view mine cross-section inspired by classic digging games. The camera should keep the active worker, nearby tiles, and immediate goals readable.

Prefer a closer, character-focused view over a full-map strategy view. The player should see enough of the mine to understand the worker's current plan, but not so much that the screen becomes noisy.

During a run:

- Start with the worker entering from camp, an elevator, or the top of the mine.
- Follow the active worker smoothly.
- Keep nearby resources and the next few target tiles visible.
- Use small focus moments for rare finds or ability impacts.
- At run end, briefly show the cleared path before the loot summary.

## Readability Goals

At a glance, the player should understand:

- Which worker is active.
- What tile is being mined.
- How much stamina each worker has.
- What resources are entering the loot tracker.
- Which layer the worker is currently in.
- Whether the run is focused on depth, harvest, or a target resource.

## Mining Feedback Stack

Each mined tile should communicate progress in layers:

1. Target indication: the worker approaches or faces the tile.
2. Wind-up: the pickaxe motion prepares the hit.
3. Impact: hit flash, tiny shake, particles, and sound.
4. Damage: cracks or state change on the tile.
5. Break: dust puff, tile disappears or changes to empty ground.
6. Collection: resource icons fly to the UI counter.

## Animation Defaults

Start with simple animation states:

- Idle.
- Walk.
- Wind-up.
- Hit.
- Recover.
- Optional: carry/return.

Good timing is more important than large animation sets. One clear hit per second is the first target.

## Particles

Keep early particles modest:

- Small chips on hit.
- Dust puff on tile break.
- Resource sparkle or tiny icon burst on collection.
- Larger effect only for rare drops or abilities.

Particles should support clarity, not cover the tilemap.

## Resource Flow

Loot should fly to the UI rather than only updating numbers. This links the visual mining action to incremental reward.

Recommended flow:

- Tile breaks.
- 2-5 small resource icons pop from the tile.
- Icons arc or float toward the loot tracker.
- Counter updates when icons arrive or shortly after launch.

Rare resources can use a slower, more deliberate arc and a separate reveal sound.

## Stamina Presentation

Each worker should have its own stamina meter.

Options:

- Small bar above the worker.
- Worker cards in the HUD.
- Both, if multiple workers make it necessary.

Low stamina should be shown mostly through UI:

- Orange/red bar state.
- Gentle pulse.
- Warning tick near depletion.
- Subtle audio change.

Avoid requiring the player to inspect worker animation to understand stamina.

## UI During Runs

The run UI should be compact and should not compete with the mine.

Core run UI:

- Current loot tracker.
- Worker stamina.
- Selected run intent.
- Depth or layer indicator.
- Ability slot if unlocked.

Avoid large panels during the run. Save detail and decisions for pre-run setup and post-run upgrades.

## End-of-Run Payoff

The summary screen should feel rewarding.

Use:

- Count-up animation.
- Resource grouping.
- Rare item reveal.
- Clear upgrade affordances.
- A small visual callback to the completed run, such as the cleared path or returning worker.

The summary should be fast enough that repeated runs feel good.

## Prototype Feel Targets

First feel prototype should test:

- Does 1 swing per second feel good?
- Do 2-hit tier 1 tiles feel satisfying?
- Is the resource fly-to-UI effect clear?
- Does stamina depletion create a natural endpoint?
- Is a 20-30 second run short enough to invite another run?
- Does the camera follow the action without hiding important context?

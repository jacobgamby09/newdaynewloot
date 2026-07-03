# MVP Roadmap

## Goal

Build a vertical slice that proves the mining run feels satisfying before expanding the economy or content.

The MVP is successful if watching one worker clear a small mine for 15-30 seconds feels good enough that the player wants to run it again.

## Phase 1 - Feel Prototype

Implement:

- Side-view mine grid.
- One worker.
- Basic camera follow.
- Dirt, stone, and one ore tile.
- 1 swing per second.
- 2-hit stone.
- Stamina meter.
- Resource icons flying to UI.
- Run ends when stamina is empty.
- Simple loot summary.

Do not focus on:

- Full economy.
- Many resources.
- Multiple workers.
- Daily modifiers.
- Automation.

Success criteria:

- Mining impact is readable.
- Tile breaks feel satisfying.
- Loot flow is clear.
- A 20-30 second run does not feel slow.

## Phase 2 - First Progression

Implement:

- Camp screen or camp panel.
- Blacksmith upgrade.
- Bunkhouse upgrade.
- Elevator or depth unlock.
- Layer 2 with harder tiles.
- Basic upgrade costs and persistence.

Success criteria:

- Upgrades visibly improve the next run.
- Layer 2 initially feels like a wall.
- The player understands why they need upgrades.

## Phase 3 - Run Intent

Implement:

- Push Depth.
- Harvest.
- Target Ore or Balanced.
- Simple worker tile scoring.
- UI indicator for selected intent.

Success criteria:

- Different intents produce visibly different routes.
- The player can predict worker behavior.
- Intent choice affects resource outcomes.

## Phase 4 - First Agency Tool

Implement:

- One ability slot.
- Bomb ability.
- Limited uses per run.
- Tile damage and loot collection from bombed tiles.
- Ability upgrade hook in camp.

Success criteria:

- Bomb feels satisfying.
- Bomb creates a real decision.
- Bomb does not require constant interaction.

## Phase 5 - More Workers

Implement:

- Unlock second worker.
- Worker cards with stamina bars.
- Basic worker stat differences.
- Multi-worker mining without visual chaos.

Success criteria:

- Multiple workers are readable.
- The screen feels busier in a satisfying way.
- Worker differences matter.

## Prototype Tuning Defaults

Use these as starting points, then tune by feel:

- Run length: 15-30 seconds.
- Swing rate: 1 per second.
- Dirt durability: 1 hit.
- Stone durability: 2 hits.
- Hard stone durability: 4 hits.
- Tier 2 stamina multiplier: 1.5x to 2.5x.
- First bomb radius: 3x3.
- First ability charge count: 1.

## First Playtest Questions

Ask after the first playable prototype:

- Did you understand what the worker was doing?
- Did mining tiles feel satisfying?
- Did loot collection feel rewarding?
- Did the run end too quickly, too slowly, or about right?
- Did you want to start another run?
- Did any UI cover the action?
- Was the next upgrade obvious?

## Non-Goals For MVP

Avoid these until the core loop feels good:

- Prestige system.
- Offline progression.
- Large worker roster.
- Full procedural generation.
- Complex crafting.
- Many biomes.
- Advanced automation.
- Deep narrative or quests.

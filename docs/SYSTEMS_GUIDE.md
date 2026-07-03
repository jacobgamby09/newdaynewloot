# Systems Guide

## Run Intent System

Run intent controls worker priorities during a run.

Initial intents:

- Push Depth: prefer downward tiles and layer progression.
- Harvest: prefer nearby high-value tiles and efficient clearing.
- Target Ore: prefer selected resource types when reachable.

Later intents:

- Scout: reveal hidden tiles, events, rare finds, and contracts.
- Safe Run: reduce risk and stamina pressure, lower rare reward.
- Balanced: default mixed behavior.

## Worker Decision Model

Workers should feel autonomous but understandable.

At each decision point, a worker can score reachable tiles based on:

- Distance.
- Stamina cost.
- Tile value.
- Run intent bonus.
- Layer progress value.
- Target marker bonus.
- Risk or unknown tile penalty.

The exact formula can change, but behavior should remain legible to the player.

## Tile Properties

Each tile can define:

- Material type.
- Durability or hits required.
- Stamina cost per hit.
- Movement cost.
- Loot table.
- Layer.
- Visibility or hidden state.
- Special behavior, such as explosive damage multiplier.

Example starting values:

| Tile | Hits | Stamina Per Hit | Loot |
| --- | ---: | ---: | --- |
| Dirt | 1 | Low | Small stone chance |
| Stone | 2 | Normal | Stone |
| Copper Vein | 2 | Normal | Stone + copper |
| Hard Stone | 4 | High | Stone + iron chance |

## Stamina Model

Stamina should be a worker-specific run resource.

Possible costs:

- Movement cost per tile.
- Mining cost per hit.
- Layer multiplier.
- Ability or hazard modifier.

Layer multipliers create progression walls. A new layer can shorten runs until upgrades reduce the penalty or increase worker efficiency.

## Upgrades

Upgrade categories:

- Worker: stamina, efficiency, luck, movement speed.
- Tool: mining speed, damage per hit, hard-material efficiency.
- Camp: unlock buildings, workers, automation, abilities.
- Mine: elevator depth, route options, layer access.
- Ability: charges, radius, effect strength, cooldown.

Keep early upgrades concrete and readable.

Examples:

- Pickaxe Level 2: tier 1 stone takes fewer effective hits.
- Better Boots: movement costs less stamina.
- Bunkhouse: worker max stamina increases.
- Elevator: start closer to layer 2.
- Bomb Satchel: unlock one bomb per run.

## Ability Rules

Abilities should be limited and impactful.

Initial rules:

- One ability slot.
- One use per run.
- Abilities are selected before the run.
- Ability use during the run should be quick and visual.

Candidate first ability:

- Bomb: damages a 3x3 area, clears weak tiles, weakens hard tiles, emits loot fly-up for broken resource tiles.

## Resource Economy

Early resources should have clear jobs:

- Stone: basic camp and worker upgrades.
- Copper: tool upgrades.
- Iron: tier 2 progression.
- Gems: rare upgrades and ability unlocks.
- Relics: advanced systems or special workers.

Avoid resource bloat. Add a resource only when it supports a new decision or unlock.

## Daily Mine Reset

The daily reset should eventually become a source of variation.

Possible daily modifiers:

- Rich Veins: more ore.
- Unstable Tunnels: higher stamina drain, better rare odds.
- Crystal Bloom: gems appear earlier.
- Collapsed Shaft: blocks some paths, opens alternatives.
- Quiet Day: predictable layout, lower rare chance.

For MVP, reset can simply regenerate or refill the mine.

## Automation

Automation should arrive after the manual loop is fun.

Possible automation unlocks:

- Auto-repeat selected run intent.
- Auto-spend on chosen upgrade track.
- Auto-assign workers.
- Offline or away progress.
- Priority rules for target resources.

Automation should reduce repetition without removing the joy of watching meaningful runs.

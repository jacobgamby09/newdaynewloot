# New Day New Loot - Game Design Document

## High Concept

New Day New Loot is a short-session incremental mining game where the player sends workers into a resetting mine, watches them automatically clear tiles, collects resources, and upgrades a growing camp.

Runs should become more intense and rewarding over time, not dramatically longer. The main fantasy is building a small mining camp into an efficient operation through better workers, tools, buildings, and run planning.

## Design Pillars

### Short, Satisfying Runs

Early runs should last roughly 15-30 seconds. Progression should primarily increase resource density, mining speed, worker efficiency, tile clear rate, and strategic options rather than stretching runs into long idle timers.

### Visual Mining Payoff

The player should enjoy watching workers clear the mine. Mining should be readable, tactile, and rewarding through tile cracking, impact feedback, particles, resource icons flying to the UI, and a clear end-of-run loot summary.

### Plan, Watch, Intervene, Upgrade

The player should not need to micromanage every action. The intended rhythm is:

1. Choose a run plan.
2. Watch workers execute the plan.
3. Make a few meaningful interventions if desired.
4. Spend loot on camp and worker upgrades.

### Camp as Meta Progression

The camp is the long-term progression surface. It should visually grow as the player unlocks buildings, workers, automation, tools, and deeper mine access.

## Core Loop

1. The day starts and the mine is reset or refreshed.
2. The player selects workers and a run intent.
3. Workers enter the mine and automatically mine according to the selected intent.
4. Stamina drains as workers move and mine, with harder layers draining stamina faster.
5. Resources and rare drops flow into the run loot tracker.
6. Workers stop when stamina is depleted or the run ends.
7. A loot summary shows all collected resources.
8. The player spends resources on camp, tools, workers, or unlocks.
9. The next run begins with improved efficiency or new options.

## Run Length Philosophy

Runs should stay compact. A stronger player should clear more valuable content in the same rough amount of time instead of simply waiting longer.

Target pacing:

- Early game: 15-30 seconds.
- Early upgrades: 25-40 seconds.
- Standard later runs: 30-60 seconds.
- Special deep-push runs may exceed this, but should not become the default play pattern.

## Mine Structure

The mine should be represented as a visible tile grid or side-view cross-section. The camera should focus on workers and nearby tiles rather than showing an overwhelming full-map strategy view.

Layers act as progression walls:

- Layer 1: soft dirt, stone, basic ore.
- Layer 2: harder stone, iron-like ore, higher stamina drain.
- Layer 3: crystal, rare materials, special events.
- Later layers: ancient materials, machines, prestige or advanced systems.

New layers should initially feel harsh. A worker may enter a new layer and quickly run out of stamina. Later, upgrades turn that layer into routine farming.

## Stamina

Each worker has individual stamina. Stamina is drained by movement, mining, and material resistance.

Stamina should be visible through UI rather than heavy worker animation changes. Each worker should have a stamina meter, and multi-worker runs should show clear worker cards or compact status bars.

Low stamina feedback can include:

- Bar color shift.
- Pulse or warning state.
- Slightly heavier hit audio.
- Subtle UI urgency.

Avoid making workers look comically exhausted unless the art direction later calls for it.

## Mining Timing Defaults

Initial prototype values:

- Worker attack rhythm: 1 mining swing per second.
- Tier 1 tile durability: 2 hits.
- First-layer run length: 15-30 seconds.
- Resource fly-to-UI delay: short and snappy.

The mining swing should have clear timing:

- Wind-up.
- Impact.
- Recovery.
- Tile break when durability reaches zero.

Impact timing matters more than particle quantity.

## Run Intents

Run intent is the player's main pre-run agency.

Initial intent candidates:

- Balanced: mixes depth and nearby resources.
- Push Depth: prioritizes downward progress and new layers.
- Harvest: clears known valuable nearby tiles.
- Target Ore: prioritizes a selected resource type.
- Scout: looks for events, rare finds, hidden tiles, or worker unlocks.
- Safe Run: lower risk, lower rare reward, stable resource income.

For MVP, start with three:

- Push Depth.
- Harvest.
- Target Ore or Balanced.

## Player Agency

Player agency should be meaningful but limited. The player should affect a run through a few strong decisions, not constant clicking.

Agency layers:

- Before run: choose workers, intent, target resource, tools, consumables.
- During run: mark a priority tile, drop a bomb, use a scanner, apply a stamina item, recall a worker.
- After run: spend loot on camp, tools, workers, and unlocks.

Suggested limits:

- 1-3 priority marks per run.
- 1 ability use per run at first.
- Additional ability slots unlocked through camp progression.

## Abilities

Abilities should be visually satisfying and strategically useful.

Candidates:

- Bomb: damages or clears a small tile area.
- Drill Charge: clears or damages a vertical line.
- Lantern: reveals hidden nearby resources.
- Scanner: highlights valuable tiles.
- Ration: restores worker stamina once.
- Support Beam: reduces stamina drain in a zone.
- Cart Drop: temporarily improves loot collection or capacity in an area.

For the first playable version, Bomb is the strongest candidate because it is easy to understand, visually satisfying, and mechanically useful.

## Camp Progression

The camp is the meta-progression hub and should visually improve over time.

Core buildings:

- Blacksmith: tool and pickaxe upgrades.
- Bunkhouse: worker stamina, recovery, worker capacity.
- Elevator: deeper layer access and depth milestones.
- Workshop: automation, ability upgrades, machines.
- Map Table: run intents, scouting, route planning.
- Storage Yard: capacity, conversion, resource processing.
- Notice Board or Tavern: worker recruitment, contracts, daily modifiers.

MVP buildings:

- Blacksmith.
- Bunkhouse.
- Elevator.

## Workers

The game starts with one worker. Additional workers unlock through progression, discoveries, or camp upgrades.

Workers should eventually differ by stats, role, or ability.

Possible worker roles:

- Miner: strong general mining output.
- Scout: finds rare resources, events, and hidden tiles.
- Engineer: improves tools, machines, and ability effects.
- Hauler: improves collection value or carry efficiency.
- Foreman: buffs other workers or improves run coordination.

For MVP, workers can be simple stat variants before roles are fully implemented.

## Resources

Resources should map naturally to camp upgrades and layer progression.

Early examples:

- Stone: common base upgrade resource.
- Copper or basic ore: tool upgrades.
- Iron-like ore: tier 2 tool and building upgrades.
- Gems: rare upgrades, abilities, worker unlocks.
- Relics or machine parts: advanced unlocks.

Avoid introducing too many resources before the player has meaningful uses for them.

## End-of-Run Summary

The loot summary is a payoff moment. It should feel like emptying a cart or loot sack, not reading a static spreadsheet.

Summary sequence:

1. Worker exits or returns to camp.
2. Loot container/cart is presented.
3. Common resources count up quickly.
4. Rare finds get a separate reveal.
5. The UI points naturally toward available upgrades.

## MVP Scope

The first playable slice should prove the feel of the game, not the full progression economy.

MVP target:

- One visible mine grid.
- One worker.
- Three tile/resource types.
- Stamina meter.
- 15-30 second run.
- 2-hit tier 1 tiles.
- Resource icons flying to UI.
- End-of-run loot summary.
- Three camp upgrades.
- One deeper layer or layer gate.
- Optional: one Bomb ability after the base loop feels good.

## Open Questions

- Should the mine layout be fully reset each day, partially reset, or procedurally refreshed?
- Should workers enter from the top, an elevator, or a camp-side tunnel?
- Should resources be collected instantly to UI, or should worker/cart capacity eventually matter?
- Should the player be able to pause during a run to make decisions?
- How much failure is acceptable: does a worker simply return exhausted, or can runs have risk states?

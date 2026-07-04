# Post-MVP Roadmap

## Context

All five phases of `MVP_ROADMAP.md` are implemented and verified (2026-07-03):
feel prototype, camp progression with layer 2, gravity physics, run intents,
the Bomb ability, and a two-miner crew.

This roadmap covers the phases after that. It assumes the playtest and
feel-hardening pass (deploy, save reset, sound toggle, tuning from real
player feedback) happens first — everything below builds on a core loop that
real players have confirmed is fun.

Guiding principle, inherited from the GDD: add variation and decisions before
adding volume. Every phase below should make the pre-run choice or the
mid-run intervention more interesting, not just make numbers bigger.

## Phase 6 - Living Camp (build-first physical buildings) [DONE]

Implemented after one revision. The first attempt (a townhall tent that
gated upgrade categories by camp level and opened a central upgrade menu)
felt like a menu hiding behind a sprite; it was replaced with build-first
physical buildings.

As implemented:

- The surface strip is the camp: decorative tent + campfire, the idle crew,
  and one spot per upgrade track.
- Unbuilt buildings show as staked-out plots; constructing one (its first
  purchase) makes the building physically appear with a pop, dust and hammer
  audio. Further purchases upgrade it in place.
- Clicking a building/plot opens a small focused panel for that building
  only. No central upgrade menu, no townhall, no camp-level gate —
  construction costs pace progression.
- An upgrade-available badge bounces over buildings the player can afford.
- Idle camera frames the whole camp strip; day notice, intent picker and
  Start Run live in a compact bottom bar.

Success criteria (met):

- The first screen reads as "my camp above my mine", not a menu overlay.
- Upgrades are tied to physical places in the camp.
- The player can tell at a glance that the camp has improved over time.

Still not implemented (by design):

- Full base-building placement.
- Prestige / moving to a new mine.
- Large camp management systems.

## Phase 7 - Daily Modifiers ("New Day")

The game is called New Day New Loot, but every day currently plays the same.
Daily modifiers are cheap to build (weight and spawn adjustments on top of
existing systems) and multiply the replay value of everything already built.

Implement:

- Day counter that advances per run.
- A "today's notice" card on the camp screen announcing the modifier.
- Initial modifier set:
  - Rich Veins: more ore.
  - Unstable Tunnels: higher stamina drain, better rare odds.
  - Crystal Bloom: gems appear earlier (once layer 3 exists; before that, copper/iron shifted up a layer).
  - Collapsed Shaft: blocks some paths, opens alternatives.
  - Quiet Day: predictable layout, lower rare chance.
- Modifiers implemented as data profiles (like intents), not special-case code.

Success criteria:

- Players change intent based on the day's modifier.
- The camp screen answers "what kind of day is it?" at a glance.
- No modifier feels like a pure penalty with no counter-play.

## Phase 8 - Layer 3, Gems and the Workshop

First real content expansion, gated on the loop being proven.

Implement:

- Layer 3: crystal tiles and gems, with a stamina wall like layer 2's.
- The first "rare find" moment: camera focus pause + separate reveal in the
  end-of-run summary (the GDD's payoff section is still unpaid here).
- Workshop building as the gem sink:
  - Bomb upgrades: radius, damage, charge count.
  - Second ability: Scanner (highlights valuable tiles). Chosen over Drill
    Charge because it strengthens the plan phase, where Bomb already
    strengthens the intervene phase.
- Gems as the rare currency that makes layer 3 a destination, the same way
  iron made layer 2 one.

Success criteria:

- Layer 3 initially feels like a wall, then becomes farmable (same curve as layer 2).
- A rare find is a visible, audible moment — not just a counter increment.
- Players can articulate why they want gems.

## Phase 9 - Crew Roles

Expand the roster from stat variants to roles, and complete the GDD's
"plan, watch, intervene, upgrade" rhythm — "plan" is the thinnest part today.

Implement:

- Crew picker on the pre-run screen: which miners go down today?
- Third and fourth hireable workers with roles:
  - Hauler: increases loot value / collection.
  - Scout: reveals hidden tiles and finds events (synergy with Scanner).
  - (Later: Foreman buffs the rest of the crew.)
- Hidden tiles in generation to give Scout something to find.
- Worker cards in camp showing role and stats.

Success criteria:

- Crew composition is a real pre-run decision that interacts with intent and
  the daily modifier.
- Roles are readable in-run without reading tooltips.
- Multi-worker runs stay visually legible with 3+ miners.

## Phase 10 - Automation and Retention

Deliberately last. The systems guide's own warning applies: automation must
arrive only after the manual loop is proven fun, or it automates the joy away.

Implement (in this order, each gated on the previous feeling right):

- Auto-repeat last run setup (crew + intent).
- Auto-spend on a chosen upgrade track.
- Offline/away progress (conservative).

Success criteria:

- Automation reduces repetition without replacing the decision moments.
- Players still watch runs they care about (deep pushes, rare hunts).

## Ongoing Technical Track

- Commit per phase; keep `scripts/simcheck.ts` green before every merge —
  it has already caught balance regressions repeatedly.
- Keep all tuning in `src/sim/config.ts` and content as data
  (tiles, intents, modifiers, workers, upgrades) so phases stay cheap.
- Save versioning is handled via the persist deep-merge; extend carefully
  when adding resources or buildings.
- Consider moving the repo out of OneDrive (sync noise on node_modules/.git).
- Deploy pipeline for shareable playtest builds.

## Deliberately Not Yet

Prestige / moving to a new mine, narrative/quests, procedural biomes,
mobile/touch port, cart capacity and hauling logistics. Not rejected — parked
until the phases above answer whether the loop deserves them.

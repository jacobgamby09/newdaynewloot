/**
 * Headless sanity check for the run simulation. Verifies the feel targets
 * from docs/MVP_ROADMAP.md without a browser, across upgrade stages:
 * baseline runs 15-30s, layer 2 acts as a wall early and opens up later.
 *
 * Run with: npx tsx scripts/simcheck.ts
 */
import { SIM } from '../src/sim/config';
import { DAY_MODIFIERS, NEUTRAL_DAY, type DayModifier } from '../src/sim/days';
import { RunSim } from '../src/sim/run';
import { deriveLoadout, type Loadout, type UpgradeLevels } from '../src/sim/upgrades';
import { RUN_INTENTS, type LootTotals, type RunIntent, type SimEvent } from '../src/sim/types';

const RUNS = 30;
const DT = 1 / 60;
const MAX_SIM_SECONDS = 180;

interface Scenario {
  name: string;
  levels: UpgradeLevels;
}

const SCENARIOS: Scenario[] = [
  { name: 'baseline (all Lv1)', levels: { townhall: 1, blacksmith: 1, bunkhouse: 1, elevator: 1, satchel: 1, crew: 1 } },
  { name: 'early (smith 2, bunk 2)', levels: { townhall: 2, blacksmith: 2, bunkhouse: 2, elevator: 1, satchel: 1, crew: 1 } },
  { name: 'mid (smith 2, bunk 3, elev 2)', levels: { townhall: 3, blacksmith: 2, bunkhouse: 3, elevator: 2, satchel: 1, crew: 1 } },
  { name: 'mid + crew (2 workers)', levels: { townhall: 3, blacksmith: 2, bunkhouse: 3, elevator: 2, satchel: 1, crew: 2 } },
  { name: 'maxed (3 / 4 / 3 / crew 2)', levels: { townhall: 5, blacksmith: 3, bunkhouse: 4, elevator: 3, satchel: 3, crew: 2 } },
];

interface RunResult {
  seconds: number;
  loot: LootTotals;
  depth: number;
  tilesBroken: number;
}

const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
const min = (xs: number[]) => Math.min(...xs);
const max = (xs: number[]) => Math.max(...xs);

function simulate(
  loadout: Loadout,
  intent: RunIntent,
  label: string,
  day: DayModifier = NEUTRAL_DAY,
): RunResult[] {
  const results: RunResult[] = [];
  for (let i = 0; i < RUNS; i++) {
    const sim = new RunSim(1000 + i * 7919, loadout, intent, day);
    let t = 0;
    let depth = loadout.startRow;
    let tilesBroken = 0;
    let ended: (SimEvent & { kind: 'runEnded' }) | null = null;

    while (t < MAX_SIM_SECONDS && !ended) {
      for (const ev of sim.update(DT)) {
        if (ev.kind === 'depthChanged') depth = ev.depth;
        if (ev.kind === 'tileBroken') tilesBroken++;
        if (ev.kind === 'runEnded') ended = ev;
      }
      t += DT;
    }

    if (!ended) {
      console.error(`${label} run ${i}: DID NOT TERMINATE within ${MAX_SIM_SECONDS}s`);
      process.exit(1);
    }
    results.push({ seconds: t, loot: ended.loot, depth, tilesBroken });
  }
  return results;
}

function report(label: string, results: RunResult[]) {
  const seconds = results.map((r) => r.seconds);
  const depths = results.map((r) => r.depth);
  const layer2Runs = results.filter((r) => r.depth >= SIM.layers.layer2Row).length;

  console.log(`\n=== ${label} ===`);
  console.log(
    `Duration s  avg ${avg(seconds).toFixed(1)}  min ${min(seconds).toFixed(1)}  max ${max(seconds).toFixed(1)}`,
  );
  console.log(
    `Depth       avg ${avg(depths).toFixed(1)}  max ${max(depths)}  (layer 2 at ${SIM.layers.layer2Row}, reached in ${layer2Runs}/${RUNS} runs)`,
  );
  console.log(
    `Loot avg    stone ${avg(results.map((r) => r.loot.stone)).toFixed(1)}  copper ${avg(results.map((r) => r.loot.copper)).toFixed(1)}  iron ${avg(results.map((r) => r.loot.iron)).toFixed(1)}`,
  );
  console.log(`Tiles avg   ${avg(results.map((r) => r.tilesBroken)).toFixed(1)}`);
}

console.log('#### Upgrade progression (balanced intent) ####');
for (const scenario of SCENARIOS) {
  report(scenario.name, simulate(deriveLoadout(scenario.levels), 'balanced', scenario.name));
}

console.log('\n#### Intent comparison (early loadout: smith 2, bunk 2) ####');
const earlyLoadout = deriveLoadout({
  townhall: 2,
  blacksmith: 2,
  bunkhouse: 2,
  elevator: 1,
  satchel: 1,
  crew: 1,
});
for (const intent of RUN_INTENTS) {
  report(`intent: ${intent}`, simulate(earlyLoadout, intent, `intent ${intent}`));
}

console.log('\n#### Day modifiers (early loadout, balanced intent) ####');
report('neutral (no modifier)', simulate(earlyLoadout, 'balanced', 'day neutral'));
for (const mod of Object.values(DAY_MODIFIERS)) {
  report(`day: ${mod.name}`, simulate(earlyLoadout, 'balanced', `day ${mod.key}`, mod));
}

console.log('\n#### Bomb sanity ####');
{
  const loadout = deriveLoadout({
    townhall: 5,
    blacksmith: 1,
    bunkhouse: 1,
    elevator: 1,
    satchel: 3,
    crew: 2,
  });
  let planted = 0;
  let exploded = 0;
  let bombBroken = 0;
  let terminated = 0;
  for (let i = 0; i < 10; i++) {
    const sim = new RunSim(5000 + i * 991, loadout, 'balanced');
    let t = 0;
    let dropped = false;
    let ended = false;
    while (t < MAX_SIM_SECONDS && !ended) {
      if (!dropped && t > 3) {
        const w = sim.workers[0].pos;
        // blast just below the first worker's current position
        dropped = sim.dropBomb({ x: w.x, y: Math.min(w.y + 2, SIM.grid.height - 1) });
        // second charge somewhere off to the side
        sim.dropBomb({ x: Math.max(0, w.x - 3), y: Math.min(w.y + 3, SIM.grid.height - 1) });
      }
      for (const ev of sim.update(DT)) {
        if (ev.kind === 'bombPlanted') planted++;
        if (ev.kind === 'bombExploded') {
          exploded++;
          bombBroken += ev.broken.length;
        }
        if (ev.kind === 'runEnded') ended = true;
      }
      t += DT;
    }
    if (ended) terminated++;
  }
  console.log(
    `planted ${planted} (expect 20)  exploded ${exploded} (expect 20)  tiles broken by bombs ${bombBroken}  terminated ${terminated}/10`,
  );
}

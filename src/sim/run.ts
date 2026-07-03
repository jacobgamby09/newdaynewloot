import { SIM } from './config';
import { generateGrid } from './grid';
import { mulberry32 } from './rng';
import { DEFAULT_LEVELS, deriveLoadout, type Loadout } from './upgrades';
import { WORKER_ROSTER, type WorkerDef } from './workers';
import type {
  BrokenTile,
  Cell,
  DamagedTile,
  LootDrop,
  LootTotals,
  RunEndReason,
  RunIntent,
  SimEvent,
  Tile,
  TileType,
} from './types';

/** One movement step of a planned path: walk, step-up or fall. */
interface PathLeg {
  x: number;
  y: number;
  duration: number;
  fall: boolean;
}

interface TargetPlan {
  target: Cell;
  path: PathLeg[];
}

interface PendingBomb {
  cell: Cell;
  timeLeft: number;
}

type WorkerState = 'deciding' | 'walking' | 'mining' | 'done';

/** Full runtime state of one crew member. */
export interface ActiveWorker {
  id: number;
  def: WorkerDef;
  pos: Cell;
  stamina: number;
  maxStamina: number;
  state: WorkerState;
  path: PathLeg[];
  target: Cell | null;
  moveTimer: number;
  swingTimer: number;
  hitDone: boolean;
  fallStreak: number;
}

/**
 * Pure simulation of one mining run with simple platformer physics: workers
 * need a tile (or the grid bottom) under their feet, fall into holes, can
 * step up a single tile onto a ledge, and cannot climb vertical shafts.
 * Each crew member runs its own state machine over the shared grid; the run
 * ends when every worker is exhausted. No rendering or React imports — the
 * scene drives it with update(dt) and reacts to the emitted events.
 */
export class RunSim {
  readonly grid: (Tile | null)[][];
  readonly width = SIM.grid.width;
  readonly height = SIM.grid.height;
  readonly loadout: Loadout;
  readonly intent: RunIntent;
  readonly workers: ActiveWorker[] = [];
  loot: LootTotals = { stone: 0, copper: 0, iron: 0 };
  bombsLeft: number;

  private pendingBombs: PendingBomb[] = [];
  private runOver = false;
  private maxDepth: number;
  private events: SimEvent[] = [];
  private pendingEvents: SimEvent[] = [];
  private rng: () => number;

  constructor(
    seed: number,
    loadout: Loadout = deriveLoadout(DEFAULT_LEVELS),
    intent: RunIntent = 'balanced',
  ) {
    this.rng = mulberry32(seed);
    this.loadout = loadout;
    this.intent = intent;
    const count = Math.min(loadout.workerCount, WORKER_ROSTER.length);
    this.grid = generateGrid(seed, loadout.startRow, count);
    this.maxDepth = loadout.startRow;
    this.bombsLeft = loadout.bombCharges;
    for (let i = 0; i < count; i++) {
      const def = WORKER_ROSTER[i];
      const maxStamina = Math.round(loadout.maxStamina * def.staminaMult);
      this.workers.push({
        id: i,
        def,
        pos: { x: Math.min(SIM.grid.startX + i, this.width - 1), y: loadout.startRow },
        stamina: maxStamina,
        maxStamina,
        state: 'deciding',
        path: [],
        target: null,
        moveTimer: 0,
        swingTimer: 0,
        hitDone: false,
        fallStreak: 0,
      });
    }
  }

  /**
   * Player agency: plant a bomb on a cell. Returns false when out of charges,
   * the run is over, or the cell is out of bounds. Explodes after a short fuse.
   */
  dropBomb(cell: Cell): boolean {
    if (this.runOver || this.bombsLeft <= 0) return false;
    if (!this.inBounds(cell.x, cell.y) || cell.y < 1) return false;
    this.bombsLeft -= 1;
    this.pendingBombs.push({ cell: { ...cell }, timeLeft: SIM.bomb.fuse });
    // dropBomb is called between update() ticks, so buffer the event for the
    // next tick's batch instead of the already-consumed one.
    this.pendingEvents.push({ kind: 'bombPlanted', cell: { ...cell }, fuse: SIM.bomb.fuse });
    return true;
  }

  update(dt: number): SimEvent[] {
    this.events = this.pendingEvents;
    this.pendingEvents = [];
    this.tickBombs(dt);
    for (const worker of this.workers) {
      switch (worker.state) {
        case 'deciding':
          this.decide(worker);
          break;
        case 'walking':
          this.walk(worker, dt);
          break;
        case 'mining':
          this.mineStep(worker, dt);
          break;
        case 'done':
          break;
      }
    }
    return this.events;
  }

  private emit(event: SimEvent) {
    this.events.push(event);
  }

  private inBounds(x: number, y: number): boolean {
    return x >= 0 && y >= 0 && x < this.width && y < this.height;
  }

  private isEmpty(x: number, y: number): boolean {
    return this.inBounds(x, y) && this.grid[y][x] === null;
  }

  private tileExists(x: number, y: number): boolean {
    return this.inBounds(x, y) && this.grid[y][x] !== null;
  }

  /** A cell is supported when a tile (or the grid bottom) is directly below. */
  private supportedAt(x: number, y: number): boolean {
    return y + 1 >= this.height || this.grid[y + 1][x] !== null;
  }

  private tileAt(c: Cell): Tile | null {
    return this.inBounds(c.x, c.y) ? this.grid[c.y][c.x] : null;
  }

  /** Stamina drain multiplier for a row — layer 2 is a progression wall. */
  private layerMult(y: number): number {
    return y >= SIM.layers.layer2Row ? SIM.layers.layer2StaminaMult : 1;
  }

  private spend(worker: ActiveWorker, amount: number) {
    worker.stamina = Math.max(0, worker.stamina - amount);
    this.emit({
      kind: 'staminaChanged',
      workerId: worker.id,
      value: worker.stamina,
      max: worker.maxStamina,
    });
  }

  private finishWorker(worker: ActiveWorker) {
    worker.state = 'done';
    this.emit({ kind: 'workerDone', workerId: worker.id });
    if (this.workers.every((w) => w.state === 'done')) {
      this.runOver = true;
      this.emit({ kind: 'runEnded', reason: this.endReason(), loot: { ...this.loot } });
    }
  }

  private endReason(): RunEndReason {
    return this.workers.some((w) => w.stamina <= 0) ? 'exhausted' : 'cleared';
  }

  private tickBombs(dt: number) {
    if (this.pendingBombs.length === 0 || this.runOver) return;
    for (const bomb of this.pendingBombs) bomb.timeLeft -= dt;
    const exploding = this.pendingBombs.filter((b) => b.timeLeft <= 0);
    this.pendingBombs = this.pendingBombs.filter((b) => b.timeLeft > 0);
    for (const bomb of exploding) this.explode(bomb.cell);
  }

  private explode(center: Cell) {
    const broken: BrokenTile[] = [];
    const damaged: DamagedTile[] = [];
    const r = SIM.bomb.radius;
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        const x = center.x + dx;
        const y = center.y + dy;
        if (y < 1 || !this.inBounds(x, y)) continue;
        const tile = this.grid[y][x];
        if (!tile) continue;
        tile.hp -= SIM.bomb.damage;
        if (tile.hp <= 0) {
          const drops = this.rollLoot(tile.type);
          for (const drop of drops) this.loot[drop.resource] += drop.amount;
          this.grid[y][x] = null;
          broken.push({ cell: { x, y }, tile: tile.type, loot: drops });
        } else {
          damaged.push({ cell: { x, y }, hpLeft: tile.hp, maxHp: tile.maxHp });
        }
      }
    }
    this.emit({ kind: 'bombExploded', cell: { ...center }, broken, damaged });

    // The terrain changed under everyone's plans — react to it.
    for (const worker of this.workers) {
      if (worker.state === 'done') continue;
      if (!this.supportedAt(worker.pos.x, worker.pos.y)) {
        this.startFall(worker);
      } else if (worker.state === 'walking' || worker.state === 'mining') {
        worker.target = null;
        worker.path = [];
        worker.state = 'deciding';
      }
    }
  }

  private decide(worker: ActiveWorker) {
    if (worker.stamina <= 0) {
      this.finishWorker(worker);
      return;
    }
    const plan = this.choose(worker);
    if (!plan) {
      this.finishWorker(worker);
      return;
    }
    worker.target = plan.target;
    this.startPath(worker, plan.path);
  }

  private startPath(worker: ActiveWorker, legs: PathLeg[]) {
    worker.path = legs;
    if (legs.length === 0) {
      this.startSwing(worker);
      return;
    }
    worker.state = 'walking';
    worker.moveTimer = 0;
    this.emitMoveStarted(worker, legs[0]);
  }

  private emitMoveStarted(worker: ActiveWorker, leg: PathLeg) {
    this.emit({
      kind: 'moveStarted',
      workerId: worker.id,
      from: { ...worker.pos },
      to: { x: leg.x, y: leg.y },
      duration: leg.duration,
      fall: leg.fall,
    });
  }

  private startSwing(worker: ActiveWorker) {
    worker.state = 'mining';
    worker.swingTimer = 0;
    worker.hitDone = false;
    this.emit({
      kind: 'swing',
      workerId: worker.id,
      worker: { ...worker.pos },
      target: { ...worker.target! },
    });
  }

  /** Gravity kicked in (support mined away): fall until landing, then re-plan. */
  private startFall(worker: ActiveWorker) {
    const legs: PathLeg[] = [];
    let y = worker.pos.y;
    while (!this.supportedAt(worker.pos.x, y)) {
      y += 1;
      legs.push({ x: worker.pos.x, y, duration: SIM.worker.fallDurationPerTile, fall: true });
    }
    worker.target = null;
    this.startPath(worker, legs);
  }

  private walk(worker: ActiveWorker, dt: number) {
    worker.moveTimer += dt;
    while (worker.path.length > 0 && worker.moveTimer >= worker.path[0].duration) {
      const leg = worker.path.shift()!;
      worker.moveTimer -= leg.duration;
      worker.pos = { x: leg.x, y: leg.y };

      if (leg.fall) {
        worker.fallStreak += 1;
      } else {
        this.spend(worker, SIM.worker.moveStaminaPerTile);
      }
      if (leg.y > this.maxDepth) {
        this.maxDepth = leg.y;
        this.emit({ kind: 'depthChanged', depth: this.maxDepth });
      }
      if (worker.fallStreak > 0 && (worker.path.length === 0 || !worker.path[0].fall)) {
        this.emit({
          kind: 'landed',
          workerId: worker.id,
          cell: { ...worker.pos },
          distance: worker.fallStreak,
        });
        worker.fallStreak = 0;
      }
      // Exhaustion only ends the run on solid ground; mid-air we finish the fall.
      if (worker.stamina <= 0 && this.supportedAt(worker.pos.x, worker.pos.y)) {
        this.finishWorker(worker);
        return;
      }
      if (worker.path.length > 0) {
        this.emitMoveStarted(worker, worker.path[0]);
      } else if (worker.target && this.tileAt(worker.target)) {
        this.startSwing(worker);
      } else {
        worker.state = 'deciding';
      }
    }
  }

  private mineStep(worker: ActiveWorker, dt: number) {
    const target = worker.target!;
    const tile = this.tileAt(target);
    if (!tile) {
      worker.state = 'deciding';
      return;
    }
    worker.swingTimer += dt;
    const period = SIM.worker.swingPeriod * worker.def.swingMult;

    if (!worker.hitDone && worker.swingTimer >= period * SIM.worker.impactPoint) {
      worker.hitDone = true;
      tile.hp -= this.loadout.pickaxeDamage;
      this.spend(worker, SIM.tiles[tile.type].staminaPerHit * this.layerMult(target.y));
      const broken = tile.hp <= 0;
      this.emit({
        kind: 'hit',
        workerId: worker.id,
        target: { ...target },
        tile: tile.type,
        broken,
        hpLeft: Math.max(0, tile.hp),
        maxHp: tile.maxHp,
      });
      if (broken) {
        const drops = this.rollLoot(tile.type);
        for (const drop of drops) this.loot[drop.resource] += drop.amount;
        this.grid[target.y][target.x] = null;
        this.emit({ kind: 'tileBroken', target: { ...target }, tile: tile.type, loot: drops });
        // Someone may have mined the block under their own feet — gravity.
        for (const w of this.workers) {
          if (w.state !== 'done' && !this.supportedAt(w.pos.x, w.pos.y)) {
            this.startFall(w);
          }
        }
        if (worker.state !== 'mining') return; // this worker started falling
      }
      if (worker.stamina <= 0) {
        this.finishWorker(worker);
        return;
      }
    }

    if (worker.swingTimer >= period) {
      if (this.tileAt(target)) {
        this.startSwing(worker);
      } else {
        worker.state = 'deciding';
      }
    }
  }

  private rollLoot(type: TileType): LootDrop[] {
    const drops: LootDrop[] = [];
    if (type === 'dirt') {
      if (this.rng() < 0.3) drops.push({ resource: 'stone', amount: 1 });
    } else if (type === 'stone') {
      drops.push({ resource: 'stone', amount: 1 });
    } else if (type === 'copper') {
      drops.push({ resource: 'stone', amount: 1 });
      drops.push({ resource: 'copper', amount: this.rng() < 0.45 ? 2 : 1 });
    } else if (type === 'hardstone') {
      drops.push({ resource: 'stone', amount: 1 });
      if (this.rng() < 0.3) drops.push({ resource: 'iron', amount: 1 });
    } else {
      drops.push({ resource: 'stone', amount: 1 });
      drops.push({ resource: 'iron', amount: this.rng() < 0.45 ? 2 : 1 });
    }
    return drops;
  }

  /** Movement edges from an empty cell, respecting gravity. */
  private edgesFrom(worker: ActiveWorker, x: number, y: number): PathLeg[] {
    // Mid-air: the only way is down.
    if (!this.supportedAt(x, y)) {
      return [{ x, y: y + 1, duration: SIM.worker.fallDurationPerTile, fall: true }];
    }
    const walkDur = SIM.worker.moveDurationPerTile * worker.def.moveMult;
    const stepDur = SIM.worker.stepUpDuration * worker.def.moveMult;
    const out: PathLeg[] = [];
    for (const dx of [-1, 1]) {
      // Walk sideways into an open cell (walking off an edge starts a fall
      // from that cell on the next hop).
      if (this.isEmpty(x + dx, y)) {
        out.push({ x: x + dx, y, duration: walkDur, fall: false });
      }
      // Step up one tile onto an adjacent ledge, if there is headroom.
      if (this.tileExists(x + dx, y) && this.isEmpty(x + dx, y - 1) && this.isEmpty(x, y - 1)) {
        out.push({ x: x + dx, y: y - 1, duration: stepDur, fall: false });
      }
    }
    // Hop down into a hole below.
    if (this.isEmpty(x, y + 1)) {
      out.push({ x, y: y + 1, duration: SIM.worker.fallDurationPerTile, fall: true });
    }
    return out;
  }

  /**
   * BFS through dug-out cells using the physics movement edges. Tiles can
   * only be mined from a supported cell next to them; score by loot value,
   * depth, walking distance and stamina cost, with jitter for variety.
   * Tiles another crew member is already working toward are skipped so the
   * workers spread out.
   */
  private choose(worker: ActiveWorker): TargetPlan | null {
    const W = this.width;
    const key = (x: number, y: number) => y * W + x;
    const startKey = key(worker.pos.x, worker.pos.y);
    const dist = new Map<number, number>([[startKey, 0]]);
    const parentEdge = new Map<number, { from: number; leg: PathLeg }>();
    const queue: Cell[] = [{ ...worker.pos }];
    const candidates = new Map<number, { target: Cell; approach: number; d: number }>();
    const mineDirs = [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ] as const;

    const claimed = new Set<number>();
    for (const other of this.workers) {
      if (other.id !== worker.id && other.state !== 'done' && other.target) {
        claimed.add(key(other.target.x, other.target.y));
      }
    }

    while (queue.length > 0) {
      const cell = queue.shift()!;
      const cellKey = key(cell.x, cell.y);
      const d = dist.get(cellKey)!;

      // Mining requires solid ground under the worker.
      if (this.supportedAt(cell.x, cell.y)) {
        for (const [dx, dy] of mineDirs) {
          const tx = cell.x + dx;
          const ty = cell.y + dy;
          if (!this.tileExists(tx, ty)) continue;
          const targetKey = key(tx, ty);
          const existing = candidates.get(targetKey);
          if (!existing || d < existing.d) {
            candidates.set(targetKey, { target: { x: tx, y: ty }, approach: cellKey, d });
          }
        }
      }

      for (const leg of this.edgesFrom(worker, cell.x, cell.y)) {
        const legKey = key(leg.x, leg.y);
        if (dist.has(legKey)) continue;
        dist.set(legKey, d + 1);
        parentEdge.set(legKey, { from: cellKey, leg });
        queue.push({ x: leg.x, y: leg.y });
      }
    }

    if (candidates.size === 0) return null;

    const profile = SIM.intents[this.intent];
    let best: { target: Cell; approach: number; d: number } | null = null;
    let bestScore = -Infinity;
    // Two passes: first respecting other workers' claims, then a fallback so
    // a worker never idles just because everything nearby is claimed.
    for (const respectClaims of [true, false]) {
      for (const candidate of candidates.values()) {
        if (respectClaims && claimed.has(key(candidate.target.x, candidate.target.y))) continue;
        const tile = this.grid[candidate.target.y][candidate.target.x]!;
        const def = SIM.tiles[tile.type];
        // A better pickaxe makes tough tiles cheaper, so the worker is more
        // willing to chew through them.
        const effectiveHits = Math.ceil(def.hits / this.loadout.pickaxeDamage);
        const staminaCost =
          effectiveHits * def.staminaPerHit * this.layerMult(candidate.target.y);
        const score =
          def.value * profile.valueWeight +
          candidate.target.y * profile.depthWeight -
          candidate.d * profile.distanceWeight -
          staminaCost * profile.costWeight +
          this.rng() * profile.jitter;
        if (score > bestScore) {
          bestScore = score;
          best = candidate;
        }
      }
      if (best) break;
    }

    const path: PathLeg[] = [];
    let cursor = best!.approach;
    while (cursor !== startKey) {
      const edge = parentEdge.get(cursor)!;
      path.unshift(edge.leg);
      cursor = edge.from;
    }
    return { target: best!.target, path };
  }
}

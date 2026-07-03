import Phaser from 'phaser';
import { SIM } from '../sim/config';
import { RunSim } from '../sim/run';
import { deriveLoadout } from '../sim/upgrades';
import type { Cell, LootDrop, SimEvent, TileType } from '../sim/types';
import { useGameStore } from '../state/store';
import { flyLootIcon } from '../ui/lootFly';
import { sfx } from './audio';
import { ensureTextures, TILE } from './textures';

/** Rows of sky rendered above the mine grid. */
const SKY_ROWS = 4;

const CHIP_TINT: Record<TileType, number> = {
  dirt: 0x9d6134,
  stone: 0x98a2b3,
  copper: 0xff8c26,
  hardstone: 0x646b78,
  iron: 0xcfd6e2,
};

const wx = (x: number) => x * TILE + TILE / 2;
const wy = (y: number) => (SKY_ROWS + y) * TILE + TILE / 2;

interface WorkerVisual {
  container: Phaser.GameObjects.Container;
  body: Phaser.GameObjects.Image;
  pickaxe: Phaser.GameObjects.Image;
  miningDown: boolean;
  done: boolean;
}

export class MineScene extends Phaser.Scene {
  private sim: RunSim | null = null;
  private running = false;
  private tileSprites: (Phaser.GameObjects.Image | null)[][] = [];
  private crackSprites: (Phaser.GameObjects.Image | null)[][] = [];
  private holeSprites: Phaser.GameObjects.Image[] = [];
  private workerVisuals = new Map<number, WorkerVisual>();
  private followPoint!: Phaser.GameObjects.Rectangle;
  private reticle!: Phaser.GameObjects.Graphics;
  private bombSprites = new Map<string, Phaser.GameObjects.Container>();
  private unsub?: () => void;

  constructor() {
    super('mine');
  }

  create() {
    ensureTextures(this);
    const worldW = SIM.grid.width * TILE;
    const worldH = (SKY_ROWS + SIM.grid.height) * TILE;
    const margin = TILE * 8;

    const bg = this.add.graphics().setDepth(-10);
    // underground backdrop (also fills the sides beyond the grid)
    bg.fillStyle(0x1c1013, 1);
    bg.fillRect(-margin, 0, worldW + margin * 2, worldH + TILE * 4);
    // sky
    bg.fillGradientStyle(0x3f97e0, 0x3f97e0, 0x9fe0f7, 0x9fe0f7, 1);
    bg.fillRect(-margin, 0, worldW + margin * 2, SKY_ROWS * TILE);
    // sun
    bg.fillStyle(0xffd94d, 1);
    bg.fillCircle(worldW - TILE, TILE, 14);
    bg.fillStyle(0xffe98a, 1);
    bg.fillCircle(worldW - TILE, TILE, 10);
    // clouds
    bg.fillStyle(0xffffff, 0.92);
    for (const [cx, cy] of [
      [TILE * 1.5, TILE * 1.3],
      [worldW * 0.45, TILE * 0.8],
    ] as const) {
      bg.fillCircle(cx, cy, 8);
      bg.fillCircle(cx + 11, cy - 3, 10);
      bg.fillCircle(cx + 23, cy, 8);
      bg.fillCircle(cx + 11, cy + 4, 9);
    }
    // grass lip at the surface
    bg.fillStyle(0x63c74d, 1);
    bg.fillRect(-margin, SKY_ROWS * TILE - 6, worldW + margin * 2, 6);
    bg.fillStyle(0x3e8f2f, 1);
    bg.fillRect(-margin, SKY_ROWS * TILE - 2, worldW + margin * 2, 2);

    // invisible camera focus that tracks the deepest active worker
    this.followPoint = this.add.rectangle(wx(SIM.grid.startX), wy(0), 2, 2, 0x000000, 0);

    const cam = this.cameras.main;
    cam.setBounds(-TILE * 4, 0, worldW + TILE * 8, worldH + TILE * 2);
    cam.startFollow(this.followPoint, true, 0.12, 0.12);
    cam.setDeadzone(TILE * 1.5, TILE * 2);
    this.applyZoom();
    this.scale.on(Phaser.Scale.Events.RESIZE, this.applyZoom, this);

    this.reticle = this.add.graphics().setDepth(20).setVisible(false);
    this.input.on(Phaser.Input.Events.POINTER_MOVE, this.onPointerMove, this);
    this.input.on(Phaser.Input.Events.POINTER_DOWN, this.onPointerDown, this);

    this.unsub = useGameStore.subscribe((state, prev) => {
      if (state.phase === 'running' && prev.phase !== 'running') {
        this.beginRun(state.seed);
      }
      if (!state.arming && prev.arming) this.reticle.setVisible(false);
    });
    const cleanup = () => {
      this.unsub?.();
      this.scale.off(Phaser.Scale.Events.RESIZE, this.applyZoom, this);
    };
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, cleanup);
    this.events.once(Phaser.Scenes.Events.DESTROY, cleanup);

    if (useGameStore.getState().phase === 'running') {
      // Handles HMR / re-mount while a run is already flagged as active.
      this.beginRun(useGameStore.getState().seed);
    } else {
      // Show the mine behind the start screen instead of an empty pit.
      this.beginRun(useGameStore.getState().seed, false);
    }
  }

  private applyZoom() {
    const zoom = Phaser.Math.Clamp(this.scale.width / 420, 2, 3);
    this.cameras.main.setZoom(zoom);
  }

  private beginRun(seed: number, autoStart = true) {
    for (const row of this.tileSprites) for (const s of row) s?.destroy();
    for (const row of this.crackSprites) for (const s of row) s?.destroy();
    for (const s of this.holeSprites) s.destroy();
    this.holeSprites = [];
    for (const bomb of this.bombSprites.values()) bomb.destroy();
    this.bombSprites.clear();
    for (const visual of this.workerVisuals.values()) visual.container.destroy();
    this.workerVisuals.clear();
    this.reticle.setVisible(false);

    const { upgrades, intent } = useGameStore.getState();
    this.sim = new RunSim(seed, deriveLoadout(upgrades), intent);

    this.tileSprites = [];
    this.crackSprites = [];
    for (let y = 0; y < this.sim.height; y++) {
      const spriteRow: (Phaser.GameObjects.Image | null)[] = [];
      const crackRow: (Phaser.GameObjects.Image | null)[] = [];
      for (let x = 0; x < this.sim.width; x++) {
        const tile = this.sim.grid[y][x];
        spriteRow.push(tile ? this.add.image(wx(x), wy(y), `tile-${tile.type}`) : null);
        crackRow.push(null);
      }
      this.tileSprites.push(spriteRow);
      this.crackSprites.push(crackRow);
    }

    for (const worker of this.sim.workers) {
      const body = this.add.image(0, 0, `worker-${worker.def.key}`);
      const pickaxe = this.add.image(6, 4, 'pickaxe').setOrigin(0.5, 0.9).setAngle(30);
      const container = this.add
        .container(wx(worker.pos.x), wy(worker.pos.y), [body, pickaxe])
        .setDepth(10);
      this.workerVisuals.set(worker.id, {
        container,
        body,
        pickaxe,
        miningDown: false,
        done: false,
      });
    }

    this.followPoint.setPosition(
      wx(this.sim.workers[0].pos.x),
      wy(this.sim.workers[0].pos.y),
    );
    this.applyZoom();
    this.cameras.main.centerOn(this.followPoint.x, this.followPoint.y);

    this.running = autoStart;
  }

  update(_time: number, deltaMs: number) {
    if (!this.running || !this.sim) return;
    // Clamp dt so a background tab slows the sim instead of teleporting it.
    const dt = Math.min(deltaMs / 1000, 0.05);
    for (const event of this.sim.update(dt)) this.handle(event);
    this.updateFollowPoint();
  }

  /** Camera tracks the deepest still-active worker. */
  private updateFollowPoint() {
    if (!this.sim) return;
    const active = this.sim.workers.filter((w) => w.state !== 'done');
    const pool = active.length > 0 ? active : this.sim.workers;
    let focus = pool[0];
    for (const w of pool) if (w.pos.y > focus.pos.y) focus = w;
    const visual = this.workerVisuals.get(focus.id);
    if (visual) this.followPoint.setPosition(visual.container.x, visual.container.y);
  }

  /** Grid cell under the pointer, or null when outside the mine. */
  private cellFromPointer(pointer: Phaser.Input.Pointer): Cell | null {
    const world = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
    const x = Math.floor(world.x / TILE);
    const y = Math.floor(world.y / TILE) - SKY_ROWS;
    if (!this.sim || x < 0 || x >= this.sim.width || y < 1 || y >= this.sim.height) return null;
    return { x, y };
  }

  private onPointerMove(pointer: Phaser.Input.Pointer) {
    const store = useGameStore.getState();
    if (!store.arming || !this.running) return;
    const cell = this.cellFromPointer(pointer);
    if (!cell) {
      this.reticle.setVisible(false);
      return;
    }
    this.reticle
      .clear()
      .setVisible(true)
      .lineStyle(2, 0xffd94d, 0.9)
      .strokeRect(wx(cell.x) - TILE * 1.5, wy(cell.y) - TILE * 1.5, TILE * 3, TILE * 3)
      .fillStyle(0xffd94d, 0.12)
      .fillRect(wx(cell.x) - TILE * 1.5, wy(cell.y) - TILE * 1.5, TILE * 3, TILE * 3);
  }

  private onPointerDown(pointer: Phaser.Input.Pointer) {
    const store = useGameStore.getState();
    if (!store.arming || !this.running || !this.sim) return;
    const cell = this.cellFromPointer(pointer);
    if (!cell) return;
    if (this.sim.dropBomb(cell)) {
      store.setArming(false);
      store.setBombsLeft(this.sim.bombsLeft);
      this.reticle.setVisible(false);
    }
  }

  private handle(ev: SimEvent) {
    switch (ev.kind) {
      case 'moveStarted': {
        const visual = this.workerVisuals.get(ev.workerId);
        if (!visual) break;
        if (ev.to.x !== ev.from.x) {
          visual.container.setScale(ev.to.x < ev.from.x ? -1 : 1, 1);
        }
        this.tweens.killTweensOf(visual.container);
        this.tweens.add({
          targets: visual.container,
          x: wx(ev.to.x),
          y: wy(ev.to.y),
          duration: ev.duration * 1000,
          ease: ev.fall ? 'Quad.easeIn' : 'Sine.easeInOut',
        });
        this.tweens.killTweensOf(visual.pickaxe);
        visual.pickaxe.setAngle(ev.fall ? 55 : 30);
        break;
      }
      case 'landed': {
        const visual = this.workerVisuals.get(ev.workerId);
        if (!visual) break;
        if (ev.distance >= 2) {
          this.spawnBurst(ev.cell, 'dust', 0xbfb2a2, Math.min(4 + ev.distance * 2, 12));
          this.cameras.main.shake(60, 0.002 + Math.min(ev.distance, 6) * 0.0008);
          sfx.land();
        }
        // small landing squash for readability
        this.tweens.add({
          targets: visual.body,
          scaleY: 0.85,
          duration: 60,
          yoyo: true,
          ease: 'Quad.easeOut',
        });
        break;
      }
      case 'swing': {
        const visual = this.workerVisuals.get(ev.workerId);
        if (!visual) break;
        const dx = ev.target.x - ev.worker.x;
        if (dx !== 0) visual.container.setScale(dx < 0 ? -1 : 1, 1);
        visual.miningDown = ev.target.y > ev.worker.y;
        const windupAngle = visual.miningDown ? -30 : -80;
        const swingMult = this.sim?.workers[ev.workerId]?.def.swingMult ?? 1;
        this.tweens.killTweensOf(visual.pickaxe);
        this.tweens.add({
          targets: visual.pickaxe,
          angle: windupAngle,
          duration: SIM.worker.swingPeriod * swingMult * SIM.worker.impactPoint * 850,
          ease: 'Quad.easeOut',
        });
        break;
      }
      case 'hit': {
        const visual = this.workerVisuals.get(ev.workerId);
        if (visual) {
          const strikeAngle = visual.miningDown ? 80 : 20;
          this.tweens.killTweensOf(visual.pickaxe);
          this.tweens.add({
            targets: visual.pickaxe,
            angle: strikeAngle,
            duration: 60,
            ease: 'Expo.easeIn',
          });
        }

        const sprite = this.tileSprites[ev.target.y][ev.target.x];
        if (sprite) {
          sprite.setTintFill(0xffffff);
          this.time.delayedCall(45, () => {
            if (sprite.active) sprite.clearTint();
          });
        }
        if (!ev.broken) {
          this.updateCrack(ev.target, ev.hpLeft, ev.maxHp);
        }
        this.spawnBurst(ev.target, 'chip', CHIP_TINT[ev.tile], ev.broken ? 8 : 4);
        this.cameras.main.shake(50, ev.broken ? 0.004 : 0.0015);
        sfx.hit(ev.broken);
        break;
      }
      case 'tileBroken': {
        this.destroyTileSprite(ev.target);
        this.spawnBurst(ev.target, 'dust', 0xbfb2a2, 6);
        sfx.break();
        this.flyLoot(ev.target, ev.loot, 0);
        break;
      }
      case 'bombPlanted': {
        const spark = this.add.image(4, -8, 'spark');
        const bomb = this.add
          .container(wx(ev.cell.x), wy(ev.cell.y), [this.add.image(0, 0, 'bomb'), spark])
          .setDepth(9);
        this.bombSprites.set(`${ev.cell.x},${ev.cell.y}`, bomb);
        this.tweens.add({
          targets: bomb,
          scaleX: 1.2,
          scaleY: 1.2,
          duration: 140,
          yoyo: true,
          repeat: -1,
        });
        this.tweens.add({ targets: spark, alpha: 0.2, duration: 70, yoyo: true, repeat: -1 });
        sfx.fuse();
        break;
      }
      case 'bombExploded': {
        this.bombSprites.get(`${ev.cell.x},${ev.cell.y}`)?.destroy();
        this.bombSprites.delete(`${ev.cell.x},${ev.cell.y}`);

        const flash = this.add
          .circle(wx(ev.cell.x), wy(ev.cell.y), TILE * 1.7, 0xfff2c0, 0.95)
          .setDepth(15);
        this.tweens.add({
          targets: flash,
          alpha: 0,
          scale: 1.5,
          duration: 260,
          ease: 'Quad.easeOut',
          onComplete: () => flash.destroy(),
        });
        this.spawnBurst(ev.cell, 'chip', 0xffa040, 16);
        this.spawnBurst(ev.cell, 'dust', 0x8d7f70, 12);
        this.cameras.main.shake(200, 0.012);
        sfx.explode();

        for (const dmg of ev.damaged) this.updateCrack(dmg.cell, dmg.hpLeft, dmg.maxHp);
        let index = 0;
        for (const brk of ev.broken) {
          this.destroyTileSprite(brk.cell);
          index = this.flyLoot(brk.cell, brk.loot, index);
        }
        break;
      }
      case 'staminaChanged':
        useGameStore.getState().setWorkerStamina(ev.workerId, ev.value, ev.max);
        break;
      case 'workerDone': {
        const visual = this.workerVisuals.get(ev.workerId);
        if (visual && !visual.done) {
          visual.done = true;
          visual.body.setTint(0x9aa0a8);
          this.tweens.add({
            targets: visual.pickaxe,
            angle: 95,
            duration: 350,
            ease: 'Sine.easeIn',
          });
        }
        useGameStore.getState().setWorkerDone(ev.workerId);
        break;
      }
      case 'depthChanged':
        useGameStore.getState().setDepth(ev.depth);
        break;
      case 'runEnded': {
        this.running = false;
        sfx.exhausted();
        // brief zoom-out so the player sees the cleared paths before the summary
        this.cameras.main.zoomTo(Math.max(1.5, this.cameras.main.zoom * 0.65), 800, 'Sine.easeInOut');
        this.time.delayedCall(1100, () => {
          useGameStore.getState().finishRun(ev.loot, ev.reason);
        });
        break;
      }
    }
  }

  private updateCrack(cell: Cell, hpLeft: number, maxHp: number) {
    const damage = 1 - hpLeft / maxHp;
    const texture = damage >= 0.66 ? 'crack-2' : 'crack-1';
    let crack = this.crackSprites[cell.y][cell.x];
    if (!crack) {
      crack = this.add.image(wx(cell.x), wy(cell.y), texture).setDepth(1);
      this.crackSprites[cell.y][cell.x] = crack;
    } else {
      crack.setTexture(texture);
    }
  }

  private destroyTileSprite(cell: Cell) {
    this.tileSprites[cell.y][cell.x]?.destroy();
    this.tileSprites[cell.y][cell.x] = null;
    this.crackSprites[cell.y][cell.x]?.destroy();
    this.crackSprites[cell.y][cell.x] = null;
    this.holeSprites.push(this.add.image(wx(cell.x), wy(cell.y), 'tile-hole').setDepth(-5));
  }

  /** Sends loot icons flying to the HUD; returns the next stagger index. */
  private flyLoot(cell: Cell, loot: LootDrop[], startIndex: number): number {
    let index = startIndex;
    for (const drop of loot) {
      for (let n = 0; n < drop.amount; n++) {
        const screen = this.worldToScreen(wx(cell.x), wy(cell.y));
        flyLootIcon(screen.x, screen.y, drop.resource, index * 90, () => {
          useGameStore.getState().addLoot(drop.resource, 1);
          sfx.collect();
        });
        index++;
      }
    }
    return index;
  }

  private spawnBurst(cell: Cell, texture: string, tint: number, quantity: number) {
    const particles = this.add.particles(wx(cell.x), wy(cell.y), texture, {
      speed: { min: 40, max: 130 },
      angle: { min: 200, max: 340 },
      lifespan: { min: 250, max: 450 },
      scale: { start: 1, end: 0 },
      gravityY: 320,
      tint,
      emitting: false,
    });
    particles.setDepth(5);
    particles.explode(quantity);
    this.time.delayedCall(700, () => particles.destroy());
  }

  private worldToScreen(worldX: number, worldY: number): { x: number; y: number } {
    const cam = this.cameras.main;
    return {
      x: (worldX - cam.worldView.x) * cam.zoom,
      y: (worldY - cam.worldView.y) * cam.zoom,
    };
  }
}

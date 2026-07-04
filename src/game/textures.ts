import Phaser from 'phaser';
import { WORKER_ROSTER } from '../sim/workers';

export const TILE = 32;

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const randInt = (min: number, max: number) => Math.floor(rand(min, max + 1));

function genDirt(g: Phaser.GameObjects.Graphics) {
  g.clear();
  g.fillStyle(0x9d6134, 1);
  g.fillRect(0, 0, TILE, TILE);
  for (let i = 0; i < 14; i++) {
    g.fillStyle(i % 2 ? 0x84502a : 0xb5793f, 1);
    g.fillRect(randInt(2, TILE - 5), randInt(2, TILE - 5), randInt(2, 3), 2);
  }
  g.fillStyle(0xbc7f47, 0.9);
  g.fillRect(0, 0, TILE, 2);
  g.fillStyle(0x6f451f, 1);
  g.fillRect(0, TILE - 2, TILE, 2);
  g.lineStyle(1, 0x5a3517, 1);
  g.strokeRect(0.5, 0.5, TILE - 1, TILE - 1);
  g.generateTexture('tile-dirt', TILE, TILE);
}

function genStone(g: Phaser.GameObjects.Graphics) {
  g.clear();
  g.fillStyle(0x7e8795, 1);
  g.fillRect(0, 0, TILE, TILE);
  for (let i = 0; i < 6; i++) {
    g.fillStyle(i % 2 ? 0x98a2b3 : 0x616a7a, 1);
    g.fillRect(randInt(2, TILE - 10), randInt(2, TILE - 8), randInt(5, 9), randInt(3, 5));
  }
  g.fillStyle(0xa7b1c2, 0.8);
  g.fillRect(0, 0, TILE, 2);
  g.fillStyle(0x4e5563, 1);
  g.fillRect(0, TILE - 2, TILE, 2);
  g.lineStyle(1, 0x3c4250, 1);
  g.strokeRect(0.5, 0.5, TILE - 1, TILE - 1);
  g.generateTexture('tile-stone', TILE, TILE);
}

function genCopper(g: Phaser.GameObjects.Graphics) {
  g.clear();
  g.fillStyle(0x7a6f63, 1);
  g.fillRect(0, 0, TILE, TILE);
  for (let i = 0; i < 4; i++) {
    g.fillStyle(0x63594e, 1);
    g.fillRect(randInt(2, TILE - 10), randInt(2, TILE - 8), randInt(5, 9), randInt(3, 5));
  }
  // fixed spread so nugget clusters read as ore rather than random shapes
  const spots: [number, number][] = [
    [8, 8],
    [22, 10],
    [12, 20],
    [24, 24],
  ];
  for (const [sx, sy] of spots) {
    const x = sx + randInt(-2, 2);
    const y = sy + randInt(-2, 2);
    g.fillStyle(0xa35414, 1);
    g.fillCircle(x + 1, y + 1, 2.5);
    g.fillStyle(0xff8c26, 1);
    g.fillCircle(x, y, 2.5);
    g.fillStyle(0xffc985, 1);
    g.fillCircle(x - 1, y - 1, 1);
  }
  g.fillStyle(0x968a7c, 0.8);
  g.fillRect(0, 0, TILE, 2);
  g.fillStyle(0x4e463d, 1);
  g.fillRect(0, TILE - 2, TILE, 2);
  g.lineStyle(1, 0x413a32, 1);
  g.strokeRect(0.5, 0.5, TILE - 1, TILE - 1);
  g.generateTexture('tile-copper', TILE, TILE);
}

function genHardstone(g: Phaser.GameObjects.Graphics) {
  g.clear();
  g.fillStyle(0x4f5560, 1);
  g.fillRect(0, 0, TILE, TILE);
  for (let i = 0; i < 7; i++) {
    g.fillStyle(i % 2 ? 0x646b78 : 0x3a3f49, 1);
    g.fillRect(randInt(2, TILE - 10), randInt(2, TILE - 8), randInt(5, 9), randInt(3, 5));
  }
  g.fillStyle(0x6a7180, 0.8);
  g.fillRect(0, 0, TILE, 2);
  g.fillStyle(0x333842, 1);
  g.fillRect(0, TILE - 2, TILE, 2);
  g.lineStyle(1, 0x272b33, 1);
  g.strokeRect(0.5, 0.5, TILE - 1, TILE - 1);
  g.generateTexture('tile-hardstone', TILE, TILE);
}

function genIron(g: Phaser.GameObjects.Graphics) {
  g.clear();
  g.fillStyle(0x565c66, 1);
  g.fillRect(0, 0, TILE, TILE);
  for (let i = 0; i < 5; i++) {
    g.fillStyle(0x454b54, 1);
    g.fillRect(randInt(2, TILE - 10), randInt(2, TILE - 8), randInt(5, 9), randInt(3, 5));
  }
  const spots: [number, number][] = [
    [9, 9],
    [23, 11],
    [11, 22],
    [23, 24],
  ];
  for (const [sx, sy] of spots) {
    const x = sx + randInt(-2, 2);
    const y = sy + randInt(-2, 2);
    g.fillStyle(0x6e7684, 1);
    g.fillCircle(x + 1, y + 1, 2.5);
    g.fillStyle(0xcfd6e2, 1);
    g.fillCircle(x, y, 2.5);
    g.fillStyle(0xb5643a, 1);
    g.fillCircle(x + 1, y - 1, 1);
  }
  g.fillStyle(0x707784, 0.8);
  g.fillRect(0, 0, TILE, 2);
  g.fillStyle(0x393e47, 1);
  g.fillRect(0, TILE - 2, TILE, 2);
  g.lineStyle(1, 0x2d3139, 1);
  g.strokeRect(0.5, 0.5, TILE - 1, TILE - 1);
  g.generateTexture('tile-iron', TILE, TILE);
}

function genHole(g: Phaser.GameObjects.Graphics) {
  g.clear();
  g.fillStyle(0x33201c, 1);
  g.fillRect(0, 0, TILE, TILE);
  for (let i = 0; i < 8; i++) {
    g.fillStyle(0x281713, 1);
    g.fillRect(randInt(2, TILE - 5), randInt(2, TILE - 4), randInt(2, 4), 2);
  }
  g.fillStyle(0x22120e, 1);
  g.fillRect(0, 0, TILE, 3);
  g.generateTexture('tile-hole', TILE, TILE);
}

function genCrack(g: Phaser.GameObjects.Graphics, key: string, lines: number) {
  g.clear();
  g.lineStyle(1.5, 0x140f0b, 0.85);
  for (let i = 0; i < lines; i++) {
    const cx = rand(10, 22);
    const cy = rand(10, 22);
    g.beginPath();
    g.moveTo(cx, cy);
    let x = cx;
    let y = cy;
    const segments = randInt(2, 3);
    const angle = rand(0, Math.PI * 2);
    for (let s = 0; s < segments; s++) {
      x += Math.cos(angle + rand(-0.7, 0.7)) * rand(5, 9);
      y += Math.sin(angle + rand(-0.7, 0.7)) * rand(5, 9);
      g.lineTo(x, y);
    }
    g.strokePath();
  }
  g.generateTexture(key, TILE, TILE);
}

function genParticles(g: Phaser.GameObjects.Graphics) {
  g.clear();
  g.fillStyle(0xffffff, 1);
  g.fillRect(0, 0, 4, 4);
  g.generateTexture('chip', 4, 4);

  g.clear();
  g.fillStyle(0xffffff, 0.9);
  g.fillCircle(3, 3, 3);
  g.generateTexture('dust', 6, 6);
}

function genWorker(
  g: Phaser.GameObjects.Graphics,
  key: string,
  overalls: number,
  overallsDark: number,
) {
  g.clear();
  // helmet
  g.fillStyle(0xf2b53a, 1);
  g.fillRoundedRect(3, 0, 10, 6, 2);
  g.fillStyle(0xd99b22, 1);
  g.fillRect(3, 4, 10, 2);
  // head
  g.fillStyle(0xe8b48c, 1);
  g.fillRect(4, 6, 8, 5);
  g.fillStyle(0x2b2b2b, 1);
  g.fillRect(9, 7, 2, 2); // eye, facing right
  // body (overalls)
  g.fillStyle(overalls, 1);
  g.fillRect(3, 11, 10, 9);
  g.fillStyle(overallsDark, 1);
  g.fillRect(3, 11, 10, 2);
  // arms
  g.fillStyle(0xe8b48c, 1);
  g.fillRect(1, 12, 2, 5);
  g.fillRect(13, 12, 2, 5);
  // legs + boots
  g.fillStyle(0x35342f, 1);
  g.fillRect(4, 20, 3, 3);
  g.fillRect(9, 20, 3, 3);
  g.fillStyle(0x241f1a, 1);
  g.fillRect(4, 22, 4, 2);
  g.fillRect(9, 22, 4, 2);
  g.generateTexture(key, 16, 24);
}

function genPickaxe(g: Phaser.GameObjects.Graphics) {
  g.clear();
  // handle
  g.fillStyle(0x8a5a33, 1);
  g.fillRect(8, 3, 2, 14);
  // head
  g.fillStyle(0xb9bec7, 1);
  g.fillTriangle(9, 0, 1, 6, 9, 4);
  g.fillTriangle(9, 0, 17, 6, 9, 4);
  g.fillStyle(0x878c95, 1);
  g.fillRect(7, 2, 4, 3);
  g.generateTexture('pickaxe', 18, 18);
}

function genBomb(g: Phaser.GameObjects.Graphics) {
  g.clear();
  // body
  g.fillStyle(0x23262e, 1);
  g.fillCircle(7, 9, 6);
  g.fillStyle(0x3a3f4c, 1);
  g.fillCircle(5, 7, 2);
  // cap + fuse
  g.fillStyle(0x565c66, 1);
  g.fillRect(5, 1, 4, 3);
  g.lineStyle(1.5, 0xc9a15a, 1);
  g.beginPath();
  g.moveTo(7, 1);
  g.lineTo(10, 0);
  g.strokePath();
  g.generateTexture('bomb', 14, 16);

  // spark for the fuse tip
  g.clear();
  g.fillStyle(0xffd94d, 1);
  g.fillCircle(2, 2, 2);
  g.generateTexture('spark', 4, 4);
}

// ---------------------------------------------------------------------------
// Camp buildings. Shared palette so the camp reads as one place.
const WOOD = 0x8a5a33;
const WOOD_DARK = 0x5f3c1f;
const WOOD_LIGHT = 0xa9713f;
const OUTLINE = 0x332214;
const ROOF = 0xb5502e;
const ROOF_DARK = 0x83371e;
const STONE_WALL = 0x7e8795;
const STONE_WALL_DARK = 0x5b636f;

function groundShadow(g: Phaser.GameObjects.Graphics, w: number, h: number, spread = 0.85) {
  g.fillStyle(0x1e2f1a, 0.35);
  g.fillEllipse(w / 2, h - 2.5, w * spread, 6);
}

function genBlacksmith(g: Phaser.GameObjects.Graphics) {
  const w = 52;
  const h = 40;
  g.clear();
  groundShadow(g, w, h);
  // stone walls
  g.fillStyle(STONE_WALL, 1);
  g.fillRect(4, 16, 44, 21);
  g.fillStyle(STONE_WALL_DARK, 1);
  g.fillRect(4, 16, 44, 3);
  for (const [bx, by] of [[8, 24], [18, 30], [30, 22], [38, 29]] as const) {
    g.fillRect(bx, by, 6, 3);
  }
  // open forge front
  g.fillStyle(0x2a1c12, 1);
  g.fillRect(9, 22, 14, 15);
  // forge glow + anvil
  g.fillStyle(0xff8c26, 0.95);
  g.fillRect(11, 30, 10, 6);
  g.fillStyle(0xffd94d, 0.9);
  g.fillRect(13, 32, 6, 3);
  g.fillStyle(0x3a3f49, 1);
  g.fillRect(28, 30, 10, 3);
  g.fillRect(31, 33, 4, 4);
  // slanted plank roof
  g.fillStyle(ROOF_DARK, 1);
  g.fillRect(0, 10, 52, 8);
  g.fillStyle(ROOF, 1);
  g.fillRect(0, 10, 52, 4);
  // chimney with embers
  g.fillStyle(STONE_WALL_DARK, 1);
  g.fillRect(38, 0, 8, 12);
  g.fillStyle(0xff8c26, 0.8);
  g.fillRect(40, 0, 4, 2);
  g.lineStyle(1, OUTLINE, 1);
  g.strokeRect(4.5, 16.5, 43, 20);
  g.strokeRect(38.5, 0.5, 7, 11);
  g.generateTexture('bld-blacksmith', w, h);
}

function genBunkhouse(g: Phaser.GameObjects.Graphics) {
  const w = 52;
  const h = 42;
  g.clear();
  groundShadow(g, w, h);
  // log walls
  g.fillStyle(WOOD, 1);
  g.fillRect(4, 18, 44, 21);
  g.fillStyle(WOOD_DARK, 1);
  for (let y = 21; y < 39; y += 5) g.fillRect(4, y, 44, 1.5);
  // gable roof
  g.fillStyle(ROOF, 1);
  g.fillTriangle(0, 20, 26, 2, 52, 20);
  g.fillStyle(ROOF_DARK, 1);
  g.fillTriangle(26, 2, 52, 20, 40, 20);
  // door + lit window
  g.fillStyle(0x3a2416, 1);
  g.fillRect(9, 25, 10, 14);
  g.fillStyle(0xffd94d, 0.95);
  g.fillRect(30, 25, 10, 8);
  g.lineStyle(1.5, WOOD_DARK, 1);
  g.strokeRect(30, 25, 10, 8);
  g.lineBetween(35, 25, 35, 33);
  g.lineStyle(1, OUTLINE, 1);
  g.strokeRect(4.5, 18.5, 43, 20);
  g.strokeTriangle(0, 20, 26, 2, 52, 20);
  g.generateTexture('bld-bunkhouse', w, h);
}

function genNoticeBoard(g: Phaser.GameObjects.Graphics) {
  const w = 40;
  const h = 34;
  g.clear();
  groundShadow(g, w, h, 0.7);
  // posts
  g.fillStyle(WOOD_DARK, 1);
  g.fillRect(5, 8, 4, 24);
  g.fillRect(31, 8, 4, 24);
  // board with little roof
  g.fillStyle(WOOD, 1);
  g.fillRect(2, 6, 36, 16);
  g.fillStyle(WOOD_LIGHT, 1);
  g.fillRect(4, 8, 32, 12);
  g.fillStyle(ROOF_DARK, 1);
  g.fillRect(0, 3, 40, 4);
  // pinned notes
  g.fillStyle(0xf2ead8, 1);
  g.fillRect(7, 10, 7, 8);
  g.fillRect(17, 9, 7, 9);
  g.fillStyle(0xffd94d, 1);
  g.fillRect(27, 10, 6, 7);
  g.fillStyle(0xd14b3a, 1);
  g.fillCircle(10, 11, 1);
  g.fillCircle(20, 10, 1);
  g.fillCircle(30, 11, 1);
  g.lineStyle(1, OUTLINE, 1);
  g.strokeRect(2.5, 6.5, 35, 15);
  g.generateTexture('bld-board', w, h);
}

function genWorkshop(g: Phaser.GameObjects.Graphics) {
  const w = 48;
  const h = 38;
  g.clear();
  groundShadow(g, w, h);
  // plank shed
  g.fillStyle(WOOD, 1);
  g.fillRect(4, 12, 40, 23);
  g.fillStyle(WOOD_DARK, 1);
  for (let x = 10; x < 44; x += 7) g.fillRect(x, 12, 1.5, 23);
  // flat tilted roof
  g.fillStyle(ROOF_DARK, 1);
  g.fillTriangle(0, 14, 0, 8, 48, 4);
  g.fillRect(0, 12, 48, 3);
  // door
  g.fillStyle(0x3a2416, 1);
  g.fillRect(30, 21, 10, 14);
  // bomb sign
  g.fillStyle(0xf2ead8, 1);
  g.fillCircle(15, 23, 7);
  g.fillStyle(0x23262e, 1);
  g.fillCircle(15, 24, 4);
  g.lineStyle(1.5, 0xc9a15a, 1);
  g.lineBetween(15, 20, 18, 17);
  g.lineStyle(1, OUTLINE, 1);
  g.strokeRect(4.5, 12.5, 39, 22);
  g.generateTexture('bld-workshop', w, h);
}

function genElevatorFrame(g: Phaser.GameObjects.Graphics) {
  const w = 44;
  const h = 52;
  g.clear();
  groundShadow(g, w, h, 0.75);
  // A-frame legs
  g.fillStyle(WOOD_DARK, 1);
  g.fillTriangle(2, 50, 9, 50, 22, 4);
  g.fillTriangle(42, 50, 35, 50, 22, 4);
  // crossbeams
  g.fillStyle(WOOD, 1);
  g.fillRect(9, 34, 26, 4);
  g.fillRect(13, 20, 18, 4);
  // wheel at the top
  g.lineStyle(2.5, 0x3a3f49, 1);
  g.strokeCircle(22, 8, 6);
  g.lineStyle(1.5, 0x3a3f49, 1);
  g.lineBetween(16, 8, 28, 8);
  g.lineBetween(22, 2, 22, 14);
  // rope down the middle
  g.lineStyle(1.5, 0xc9a15a, 1);
  g.lineBetween(22, 14, 22, 46);
  // bucket
  g.fillStyle(0x5b636f, 1);
  g.fillRect(17, 44, 10, 7);
  g.lineStyle(1, OUTLINE, 1);
  g.strokeRect(17.5, 44.5, 9, 6);
  g.generateTexture('bld-elevator', w, h);
}

/** Staked-out plot for a building that has not been constructed yet. */
function genPlot(g: Phaser.GameObjects.Graphics) {
  const w = 44;
  const h = 26;
  g.clear();
  // dirt patch
  g.fillStyle(0x9d6134, 0.5);
  g.fillEllipse(w / 2, h - 8, 36, 12);
  // corner stakes
  g.fillStyle(WOOD_DARK, 1);
  for (const [sx, sy] of [[3, 12], [37, 12], [3, 20], [37, 20]] as const) {
    g.fillRect(sx, sy, 3, 6);
  }
  // rope between stakes (dashed)
  g.lineStyle(1, 0xdec79a, 0.9);
  for (let x = 7; x < 36; x += 6) {
    g.lineBetween(x, 13, x + 3, 13);
    g.lineBetween(x, 21, x + 3, 21);
  }
  g.generateTexture('plot', w, h);
}

function genCampDecor(g: Phaser.GameObjects.Graphics) {
  // small crisp tent (pure decoration)
  const w = 36;
  const h = 28;
  g.clear();
  groundShadow(g, w, h, 0.8);
  g.fillStyle(0xc98748, 1);
  g.fillTriangle(2, 25, 18, 3, 34, 25);
  g.fillStyle(0x9c6134, 1);
  g.fillTriangle(18, 3, 34, 25, 24, 25);
  g.fillStyle(0x3b2418, 1);
  g.fillTriangle(13, 25, 18, 11, 23, 25);
  g.lineStyle(1.5, OUTLINE, 1);
  g.strokeTriangle(2, 25, 18, 3, 34, 25);
  g.generateTexture('decor-tent', w, h);

  // campfire logs
  g.clear();
  g.fillStyle(WOOD_DARK, 1);
  g.fillRect(2, 12, 14, 3);
  g.fillRect(4, 14, 14, 3);
  g.fillStyle(0x3a3f49, 1);
  g.fillCircle(6, 14, 1.5);
  g.fillCircle(14, 15, 1.5);
  g.generateTexture('decor-logs', 20, 18);

  // flame (tweened separately)
  g.clear();
  g.fillStyle(0xff8c26, 0.95);
  g.fillTriangle(1, 12, 6, 0, 11, 12);
  g.fillStyle(0xffd94d, 0.95);
  g.fillTriangle(3, 12, 6, 4, 9, 12);
  g.generateTexture('decor-flame', 12, 12);
}

/** Generates every texture the scene needs. Safe to call more than once. */
export function ensureTextures(scene: Phaser.Scene) {
  if (scene.textures.exists('tile-dirt')) return;
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  genDirt(g);
  genStone(g);
  genCopper(g);
  genHardstone(g);
  genIron(g);
  genHole(g);
  genCrack(g, 'crack-1', 3);
  genCrack(g, 'crack-2', 6);
  genParticles(g);
  for (const def of WORKER_ROSTER) {
    genWorker(g, `worker-${def.key}`, def.color, def.colorDark);
  }
  genPickaxe(g);
  genBomb(g);
  genBlacksmith(g);
  genBunkhouse(g);
  genNoticeBoard(g);
  genWorkshop(g);
  genElevatorFrame(g);
  genPlot(g);
  genCampDecor(g);
  g.destroy();
}

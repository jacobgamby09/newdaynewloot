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

function genCampHub(g: Phaser.GameObjects.Graphics, level: number) {
  const w = 96;
  const h = 56;
  g.clear();

  // ground shadow
  g.fillStyle(0x23351f, 0.35);
  g.fillEllipse(w / 2, h - 5, 82, 10);

  // tent body
  const tent = level >= 4 ? 0xd6b67a : 0xc98748;
  const tentDark = level >= 4 ? 0x8f7042 : 0x7c4b2b;
  const trim = level >= 3 ? 0xffd94d : 0x6b2d1f;
  g.fillStyle(tentDark, 1);
  g.fillTriangle(12, h - 8, 42, 10, 72, h - 8);
  g.fillStyle(tent, 1);
  g.fillTriangle(20, h - 8, 46, 12, 72, h - 8);
  g.fillStyle(0x3b2418, 1);
  g.fillTriangle(40, h - 8, 50, 31, 61, h - 8);
  g.lineStyle(2, trim, 1);
  g.lineBetween(46, 12, 20, h - 8);
  g.lineBetween(46, 12, 72, h - 8);

  // rope stakes
  g.lineStyle(1, 0xdec79a, 1);
  g.lineBetween(20, h - 8, 7, h - 3);
  g.lineBetween(72, h - 8, 87, h - 3);
  g.fillStyle(0x66402a, 1);
  g.fillRect(6, h - 6, 3, 7);
  g.fillRect(86, h - 6, 3, 7);

  if (level >= 2) {
    // crates and workbench
    g.fillStyle(0x8a5a33, 1);
    g.fillRect(4, h - 20, 15, 14);
    g.fillRect(75, h - 18, 14, 12);
    g.lineStyle(1, 0x5a351f, 1);
    g.strokeRect(4.5, h - 19.5, 14, 13);
    g.strokeRect(75.5, h - 17.5, 13, 11);
  }

  if (level >= 3) {
    // banner and extra awning
    g.fillStyle(0x4f7ec9, 1);
    g.fillRect(51, 7, 3, 19);
    g.fillStyle(0xffd94d, 1);
    g.fillTriangle(54, 8, 69, 12, 54, 17);
    g.fillStyle(0x6b3b28, 1);
    g.fillRoundedRect(64, h - 24, 22, 18, 2);
    g.fillStyle(0x9d6134, 1);
    g.fillRect(65, h - 23, 20, 5);
  }

  if (level >= 4) {
    // workshop chimney and forge glow
    g.fillStyle(0x6f451f, 1);
    g.fillRect(12, h - 34, 8, 24);
    g.fillStyle(0x34221a, 1);
    g.fillRect(10, h - 36, 12, 4);
    g.fillStyle(0xff8c26, 0.9);
    g.fillCircle(80, h - 9, 5);
    g.fillStyle(0xffd94d, 0.9);
    g.fillCircle(80, h - 9, 2.5);
  }

  if (level >= 5) {
    // timber frame roof turns the camp into a tiny outpost
    g.fillStyle(0x3f2a1d, 1);
    g.fillRect(24, 13, 45, 4);
    g.fillRect(24, h - 12, 45, 4);
    g.fillRect(25, 16, 4, 33);
    g.fillRect(65, 16, 4, 33);
    g.lineStyle(2, 0x3f2a1d, 1);
    g.lineBetween(28, 17, 66, h - 12);
  }

  g.generateTexture(`camp-hub-${level}`, w, h);
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
  for (let level = 1; level <= 5; level++) genCampHub(g, level);
  g.destroy();
}

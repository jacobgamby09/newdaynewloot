import Phaser from 'phaser';
import { MineScene } from './MineScene';

export function createGame(parent: HTMLElement): Phaser.Game {
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    backgroundColor: '#0d0b09',
    scale: {
      mode: Phaser.Scale.RESIZE,
      width: '100%',
      height: '100%',
    },
    render: {
      pixelArt: true,
      antialias: false,
      roundPixels: true,
    },
    scene: [MineScene],
  });
  if (import.meta.env.DEV) {
    // Lets tooling drive the game loop manually, e.g. when the tab is hidden.
    (window as unknown as { __game: Phaser.Game }).__game = game;
  }
  return game;
}

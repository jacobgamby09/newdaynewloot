import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { createGame } from '../game/createGame';

export function PhaserMount() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current!;
    const game = createGame(el);

    // Phaser can boot while the tab is hidden or before layout settles, which
    // leaves the canvas at 0x0. Track the mount element directly instead of
    // relying on window resize events.
    const sync = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (game.isBooted && w > 0 && h > 0) game.scale.resize(w, h);
    };
    game.events.once(Phaser.Core.Events.READY, sync);
    const observer = new ResizeObserver(sync);
    observer.observe(el);

    return () => {
      observer.disconnect();
      game.destroy(true);
    };
  }, []);

  return <div ref={ref} className="absolute inset-0" />;
}

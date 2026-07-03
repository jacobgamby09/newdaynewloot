import type { ResourceType } from '../sim/types';
import { resourceIconSvg } from './icons';

/**
 * Animates a small resource icon from a screen position (the broken tile)
 * to the matching HUD loot chip, then invokes onArrive. Runs in the DOM so
 * screen coordinates stay correct regardless of camera zoom.
 */
export function flyLootIcon(
  fromX: number,
  fromY: number,
  resource: ResourceType,
  delayMs: number,
  onArrive: () => void,
) {
  const layer = document.getElementById('loot-fly-layer');
  const target = document.getElementById(`loot-${resource}`);
  if (!layer || !target) {
    onArrive();
    return;
  }
  const rect = target.getBoundingClientRect();
  const toX = rect.left + rect.width / 2 - 8;
  const toY = rect.top + rect.height / 2 - 8;

  const el = document.createElement('div');
  el.style.cssText =
    'position:absolute;left:0;top:0;width:16px;height:16px;pointer-events:none;will-change:transform;';
  el.innerHTML = resourceIconSvg(resource, 16);
  layer.appendChild(el);

  const startX = fromX - 8 + (Math.random() * 16 - 8);
  const startY = fromY - 8 + (Math.random() * 10 - 5);
  const midX = startX + (toX - startX) * 0.35 + (Math.random() * 40 - 20);
  const midY = Math.min(startY, toY) - 60 - Math.random() * 30;

  const animation = el.animate(
    [
      { transform: `translate(${startX}px, ${startY}px) scale(0.9)`, opacity: 1 },
      { transform: `translate(${midX}px, ${midY}px) scale(1.15)`, opacity: 1, offset: 0.45 },
      { transform: `translate(${toX}px, ${toY}px) scale(0.55)`, opacity: 0.9 },
    ],
    {
      duration: 620 + Math.random() * 120,
      delay: delayMs,
      easing: 'cubic-bezier(.5,.05,.45,1)',
      fill: 'backwards',
    },
  );
  animation.onfinish = () => {
    el.remove();
    onArrive();
  };
}

import type { ResourceType } from '../sim/types';

export const RESOURCE_LABELS: Record<ResourceType, string> = {
  stone: 'Stone',
  copper: 'Copper',
  iron: 'Iron',
};

/** SVG markup shared by the React HUD and the DOM loot-fly layer. */
export function resourceIconSvg(resource: ResourceType, size: number): string {
  if (resource === 'copper') {
    return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 12 L4.5 6 L11.5 6 L13.5 12 Z" fill="#ff8c26" stroke="#a35414" stroke-width="1.2" stroke-linejoin="round"/><path d="M5 7.5 L10 7.5" stroke="#ffc985" stroke-width="1.2" stroke-linecap="round"/></svg>`;
  }
  if (resource === 'iron') {
    return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 12 L4.5 6 L11.5 6 L13.5 12 Z" fill="#cfd6e2" stroke="#6e7684" stroke-width="1.2" stroke-linejoin="round"/><path d="M5 7.5 L10 7.5" stroke="#f0f3f8" stroke-width="1.2" stroke-linecap="round"/></svg>`;
  }
  return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M3 10 L5 5 L11 4 L14 8 L12 13 L5 13 Z" fill="#aeb6c2" stroke="#5f6675" stroke-width="1.2" stroke-linejoin="round"/><path d="M5.5 7.5 L8.5 6.5" stroke="#d7dce4" stroke-width="1.2" stroke-linecap="round"/></svg>`;
}

export function ResourceIcon({ resource, size = 16 }: { resource: ResourceType; size?: number }) {
  return (
    <span
      style={{ width: size, height: size, display: 'inline-block', lineHeight: 0 }}
      dangerouslySetInnerHTML={{ __html: resourceIconSvg(resource, size) }}
    />
  );
}

import type { RunIntent } from '../sim/types';

/** Presentation metadata for run intents (sim behaviour lives in SIM.intents). */
export const INTENT_INFO: Record<RunIntent, { name: string; icon: string; blurb: string }> = {
  balanced: {
    name: 'Balanced',
    icon: '⚖️',
    blurb: 'A bit of everything — decent depth, grabs ore along the way.',
  },
  depth: {
    name: 'Push Depth',
    icon: '⬇️',
    blurb: 'Drill straight down toward new layers. Ignores most ore.',
  },
  harvest: {
    name: 'Harvest',
    icon: '🧺',
    blurb: 'Sweep nearby ore veins clean. Slow downward progress.',
  },
};

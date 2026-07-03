/** Static roster of hireable miners — simple stat variants for the MVP. */
export interface WorkerDef {
  key: string;
  name: string;
  /** Multiplier on the camp's max stamina. */
  staminaMult: number;
  /** Multiplier on swing period — lower is faster. */
  swingMult: number;
  /** Multiplier on walk/step durations — lower is faster. */
  moveMult: number;
  /** Overalls colors so workers are tellable apart at a glance. */
  color: number;
  colorDark: number;
}

export const WORKER_ROSTER: WorkerDef[] = [
  {
    key: 'bors',
    name: 'Bors',
    staminaMult: 1.0,
    swingMult: 1.0,
    moveMult: 1.0,
    color: 0x3d6db5,
    colorDark: 0x2b4d80,
  },
  {
    key: 'pip',
    name: 'Pip',
    staminaMult: 0.7,
    swingMult: 0.75,
    moveMult: 0.8,
    color: 0x2fa45a,
    colorDark: 0x1f7440,
  },
];

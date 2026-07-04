/**
 * Tiny WebAudio synth for prototype feedback sounds — no asset files needed.
 * unlock() must be called from a user gesture (the Start Run button).
 */
class Sfx {
  private ctx: AudioContext | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private muted = false;

  setMuted(muted: boolean) {
    this.muted = muted;
  }

  unlock() {
    if (!this.ctx) {
      try {
        this.ctx = new AudioContext();
      } catch {
        return;
      }
    }
    void this.ctx.resume();
  }

  private getNoise(ctx: AudioContext): AudioBuffer {
    if (!this.noiseBuffer) {
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      this.noiseBuffer = buffer;
    }
    return this.noiseBuffer;
  }

  private noise(freq: number, duration: number, volume: number, type: BiquadFilterType) {
    const ctx = this.ctx;
    if (this.muted || !ctx || ctx.state !== 'running') return;
    const src = ctx.createBufferSource();
    src.buffer = this.getNoise(ctx);
    const filter = ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = freq;
    filter.Q.value = 1;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    src.connect(filter).connect(gain).connect(ctx.destination);
    src.start();
    src.stop(ctx.currentTime + duration);
  }

  private tone(
    from: number,
    to: number,
    duration: number,
    volume: number,
    type: OscillatorType,
  ) {
    const ctx = this.ctx;
    if (this.muted || !ctx || ctx.state !== 'running') return;
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(from, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), ctx.currentTime + duration);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  }

  hit(broken: boolean) {
    this.noise(broken ? 500 : 900 + Math.random() * 300, 0.06, 0.12, 'bandpass');
  }

  break() {
    this.noise(350, 0.14, 0.2, 'lowpass');
    this.tone(90, 55, 0.12, 0.08, 'square');
  }

  collect() {
    this.tone(620 + Math.random() * 260, 900 + Math.random() * 200, 0.09, 0.05, 'sine');
  }

  land() {
    this.noise(200, 0.09, 0.14, 'lowpass');
  }

  fuse() {
    this.noise(2400, 0.5, 0.05, 'highpass');
  }

  explode() {
    this.noise(140, 0.4, 0.35, 'lowpass');
    this.tone(85, 28, 0.35, 0.16, 'square');
  }

  exhausted() {
    this.tone(240, 90, 0.5, 0.08, 'triangle');
  }
}

export const sfx = new Sfx();

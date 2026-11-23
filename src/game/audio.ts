export class Sound {
  ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private music: GainNode | null = null;
  private sfx: GainNode | null = null;
  private engine: GainNode | null = null;
  private oscA: OscillatorNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private noise: AudioBuffer | null = null;
  private musicOn = false;
  muted = false;
  private timer = 0;

  unlock() {
    if (!this.ctx) {
      const ctx = new AudioContext({ latencyHint: "interactive" });
      this.ctx = ctx;
      const master = ctx.createGain();
      const music = ctx.createGain();
      const sfx = ctx.createGain();
      const engine = ctx.createGain();
      master.gain.value = 0.85;
      music.gain.value = 0;
      sfx.gain.value = 0.85;
      engine.gain.value = 0;
      music.connect(master);
      sfx.connect(master);
      engine.connect(master);
      master.connect(ctx.destination);
      this.master = master;
      this.music = music;
      this.sfx = sfx;
      this.engine = engine;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 220;
      const oscA = ctx.createOscillator();
      const oscB = ctx.createOscillator();
      oscA.type = "sawtooth";
      oscB.type = "square";
      oscA.frequency.value = 52;
      oscB.frequency.value = 78;
      const gb = ctx.createGain();
      gb.gain.value = 0.22;
      oscA.connect(filter);
      oscB.connect(gb);
      gb.connect(filter);
      filter.connect(engine);
      oscA.start();
      oscB.start();
      this.oscA = oscA;
      this.filter = filter;

      const len = Math.floor(ctx.sampleRate * 0.45);
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      this.noise = buf;
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
  }

  setMuted(m: boolean) {
    this.muted = m;
    if (!this.ctx || !this.master) return;
    this.master.gain.setTargetAtTime(m ? 0 : 0.85, this.ctx.currentTime, 0.03);
  }

  engineSpeed(speed: number, nitro: boolean, on: boolean) {
    if (!this.ctx || !this.engine || !this.oscA || !this.filter) return;
    const now = this.ctx.currentTime;
    const vol = on ? Math.min(0.2, 0.035 + Math.abs(speed) * 0.0045) : 0;
    this.engine.gain.setTargetAtTime(vol, now, 0.05);
    this.oscA.frequency.setTargetAtTime(40 + Math.abs(speed) * 2.5 + (nitro ? 30 : 0), now, 0.06);
    this.filter.frequency.setTargetAtTime(160 + Math.abs(speed) * 16 + (nitro ? 380 : 0), now, 0.06);
  }

  blip(kind: "gun" | "boom" | "hit" | "nitro" | "lap") {
    if (!this.ctx || !this.noise || !this.sfx || this.muted) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    if (kind === "lap") {
      const o = ctx.createOscillator();
      o.type = "square";
      o.frequency.setValueAtTime(196, now);
      o.frequency.setValueAtTime(294, now + 0.09);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.07, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      o.connect(g);
      g.connect(this.sfx);
      o.start(now);
      o.stop(now + 0.3);
      o.onended = () => {
        o.disconnect();
        g.disconnect();
      };
      return;
    }
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const g = ctx.createGain();
    const f = ctx.createBiquadFilter();
    if (kind === "gun") {
      f.type = "bandpass";
      f.frequency.value = 1600 + Math.random() * 400;
      g.gain.setValueAtTime(0.16, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
      src.playbackRate.value = 1.2 + Math.random() * 0.4;
      src.start(now, 0, 0.08);
    } else if (kind === "boom") {
      f.type = "lowpass";
      f.frequency.setValueAtTime(900, now);
      f.frequency.exponentialRampToValueAtTime(70, now + 0.48);
      g.gain.setValueAtTime(0.48, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      src.playbackRate.value = 0.55;
      src.start(now, 0, 0.5);
    } else if (kind === "hit") {
      f.type = "highpass";
      f.frequency.value = 500;
      g.gain.setValueAtTime(0.2, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      src.playbackRate.value = 0.7 + Math.random() * 0.5;
      src.start(now, 0, 0.12);
    } else {
      f.type = "bandpass";
      f.frequency.value = 520;
      g.gain.setValueAtTime(0.14, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
      src.playbackRate.value = 0.45;
      src.start(now, 0, 0.32);
    }
    src.connect(f);
    f.connect(g);
    g.connect(this.sfx);
    src.onended = () => {
      src.disconnect();
      f.disconnect();
      g.disconnect();
    };
  }

  startMusic() {
    if (!this.ctx || !this.music || this.musicOn) return;
    this.musicOn = true;
    this.music.gain.setTargetAtTime(0.045, this.ctx.currentTime, 0.4);
    this.scheduleMusic();
  }

  stopMusic() {
    this.musicOn = false;
    window.clearTimeout(this.timer);
    if (this.ctx && this.music) this.music.gain.setTargetAtTime(0, this.ctx.currentTime, 0.2);
  }

  private scheduleMusic() {
    if (!this.ctx || !this.music || !this.musicOn) return;
    const ctx = this.ctx;
    const bus = this.music;
    const now = ctx.currentTime + 0.06;
    const notes = [55, 55, 65.41, 55, 49, 55, 73.42, 65.41];
    for (let i = 0; i < notes.length; i++) {
      const freq = notes[i]!;
      const t = now + i * 0.48;
      const o = ctx.createOscillator();
      o.type = "triangle";
      o.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.45, t + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);
      o.connect(g);
      g.connect(bus);
      o.start(t);
      o.stop(t + 0.44);
      o.onended = () => {
        o.disconnect();
        g.disconnect();
      };
    }
    this.timer = window.setTimeout(() => this.scheduleMusic(), notes.length * 480 - 60);
  }
}

import { forward, right, clamp, wrap, segmentsIntersect, hypot } from "@/game/math";
import type { Baked, ModelSet } from "@/game/models";
import { bakeAll } from "@/game/models";
import {
  buildTrack,
  cloneProps,
  HALF_WIDTH,
  type Prop,
  type Track,
  worldToTex,
  TEX,
} from "@/game/track";

export const LAPS = 3;
const SAVE_KEY = "ash-circuit-v1";

export type Stats = {
  accel: number;
  brake: number;
  max: number;
  turn: number;
  grip: number;
  driftGrip: number;
  drag: number;
  coast: number;
  hp: number;
  dmg: number;
  fireRate: number;
  heat: number;
  spread: number;
  ram: number;
  circles: { z: number; r: number }[];
};

const INTER: Stats = {
  accel: 30,
  brake: 40,
  max: 34,
  turn: 2.35,
  grip: 7.4,
  driftGrip: 1.65,
  drag: 0.16,
  coast: 0.9,
  hp: 100,
  dmg: 9,
  fireRate: 0.11,
  heat: 0.08,
  spread: 0.02,
  ram: 1.2,
  circles: [
    { z: 0.15, r: 1.15 },
    { z: 1.45, r: 0.8 },
  ],
};

const RIG: Stats = {
  accel: 17,
  brake: 30,
  max: 27,
  turn: 1.42,
  grip: 8.8,
  driftGrip: 2.3,
  drag: 0.14,
  coast: 0.72,
  hp: 190,
  dmg: 12,
  fireRate: 0.17,
  heat: 0.1,
  spread: 0.04,
  ram: 1.9,
  circles: [
    { z: 1.9, r: 1.25 },
    { z: -0.5, r: 1.35 },
    { z: -2.6, r: 1.3 },
  ],
};

const BUGGY: Stats = {
  accel: 38,
  brake: 36,
  max: 39,
  turn: 2.9,
  grip: 5.1,
  driftGrip: 1.3,
  drag: 0.2,
  coast: 1.1,
  hp: 72,
  dmg: 6.5,
  fireRate: 0.075,
  heat: 0.055,
  spread: 0.05,
  ram: 0.72,
  circles: [{ z: 0.05, r: 1.05 }],
};

export function statsFor(model: string): Stats {
  if (model === "rig") return RIG;
  if (model === "buggy" || model === "buggy2") return BUGGY;
  return INTER;
}

export type Car = {
  id: number;
  name: string;
  model: string;
  isPlayer: boolean;
  x: number;
  z: number;
  yaw: number;
  vx: number;
  vz: number;
  hp: number;
  maxHp: number;
  nitro: number;
  heat: number;
  overheat: number;
  fireCd: number;
  dropCd: number;
  ramCd: number;
  invuln: number;
  alive: boolean;
  respawn: number;
  laps: number;
  nextCp: number;
  sample: number;
  lastCpX: number;
  lastCpZ: number;
  lastCpYaw: number;
  lapStamp: number;
  lapTimes: number[];
  raceTime: number;
  finished: boolean;
  finishPlace: number;
  finishTime: number;
  place: number;
  kills: number;
  drift: number;
  boost: number;
  scrape: number;
  nitroOn: boolean;
  stuck: number;
  flash: number;
  wrong: boolean;
  stats: Stats;
};

export type Bullet = {
  x: number;
  z: number;
  vx: number;
  vz: number;
  life: number;
  dmg: number;
  owner: number;
  color: string;
};

export type Particle = {
  x: number;
  z: number;
  y: number;
  vx: number;
  vz: number;
  vy: number;
  life: number;
  max: number;
  color: string;
  size: number;
};

export type Strip = {
  x: number;
  z: number;
  yaw: number;
  life: number;
  grace: number;
  owner: number;
  hit: Set<number>;
};

export type Feed = { text: string; life: number };

export type Result = {
  place: number;
  time: number;
  kills: number;
  bestLap: number | null;
  laps: number[];
  won: boolean;
};

export type TouchState = {
  left: boolean;
  right: boolean;
  gas: boolean;
  brake: boolean;
  fire: boolean;
  nitro: boolean;
  drift: boolean;
  drop: boolean;
};

export type FxKind = "gun" | "boom" | "hit" | "nitro" | "lap";

type Save = { bestRace: number | null; bestLap: number | null };

function loadSave(): Save {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return { bestRace: null, bestLap: null };
    const p = JSON.parse(raw) as Save;
    return { bestRace: p.bestRace ?? null, bestLap: p.bestLap ?? null };
  } catch {
    return { bestRace: null, bestLap: null };
  }
}

function storeSave(s: Save) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(s));
  } catch {
    /* ignore quota */
  }
}

const NAMES: Record<string, string> = {
  black: "BLACK MILE",
  rig: "MOTHER",
  buggy: "BUZZARD",
};

function roster(playerModel: string) {
  const ai = [
    { model: "red", name: "RED HOOK" },
    { model: "bone", name: "WIDOW" },
    { model: "rig", name: "MOTHER" },
    { model: "buggy", name: "SALT RAT" },
    { model: "buggy2", name: "VULTURE" },
    { model: "black", name: "IRON JAW" },
  ].filter((a) => a.model !== playerModel);
  return [{ model: playerModel, name: NAMES[playerModel] ?? "YOU", player: true }, ...ai.slice(0, 5)];
}

export class Race {
  models: ModelSet;
  track: Track;
  template: Prop[];
  props: Prop[] = [];
  cars: Car[] = [];
  bullets: Bullet[] = [];
  particles: Particle[] = [];
  strips: Strip[] = [];
  feed: Feed[] = [];
  keys = new Set<string>();
  touch: TouchState = {
    left: false,
    right: false,
    gas: false,
    brake: false,
    fire: false,
    nitro: false,
    drift: false,
    drop: false,
  };
  steerOverride: number | null = null;
  phase: "menu" | "racing" | "paused" | "done" = "menu";
  clock = 0;
  tick = 0;
  banner = "";
  bannerT = 0;
  shakeAmp = 0;
  result: Result | null = null;
  bestLap: number | null;
  bestRace: number | null;
  vehicleId = "black";
  dropLatch = false;
  resetLatch = false;
  onFx: ((k: FxKind) => void) | null = null;
  private finishCount = 0;

  constructor() {
    this.models = bakeAll();
    this.track = buildTrack();
    this.template = this.track.props;
    const save = loadSave();
    this.bestLap = save.bestLap;
    this.bestRace = save.bestRace;
  }

  get player() {
    return this.cars[0]!;
  }

  start(modelId: string) {
    this.vehicleId = modelId;
    this.props = cloneProps(this.template);
    this.bullets = [];
    this.particles = [];
    this.strips = [];
    this.feed = [];
    this.clock = 0;
    this.tick = 0;
    this.banner = "GO";
    this.bannerT = 1.25;
    this.result = null;
    this.finishCount = 0;
    this.phase = "racing";
    this.track.decalCtx.clearRect(0, 0, TEX, TEX);
    const lineup = roster(modelId);
    this.cars = lineup.map((entry, i) => {
      const sp = this.track.spawns[i] ?? this.track.spawns[0]!;
      const stats = statsFor(entry.model);
      return {
        id: i,
        name: entry.name,
        model: entry.model,
        isPlayer: "player" in entry && entry.player === true,
        x: sp.x,
        z: sp.z,
        yaw: sp.yaw,
        vx: 0,
        vz: 0,
        hp: stats.hp,
        maxHp: stats.hp,
        nitro: 1,
        heat: 0,
        overheat: 0,
        fireCd: 0,
        dropCd: 0,
        ramCd: 0,
        invuln: 0.6,
        alive: true,
        respawn: 0,
        laps: 0,
        nextCp: 1,
        sample: sp.sample,
        lastCpX: sp.x,
        lastCpZ: sp.z,
        lastCpYaw: sp.yaw,
        lapStamp: 0,
        lapTimes: [],
        raceTime: 0,
        finished: false,
        finishPlace: 0,
        finishTime: 0,
        place: i + 1,
        kills: 0,
        drift: 0,
        boost: 0,
        scrape: 0,
        nitroOn: false,
        stuck: 0,
        flash: 0,
        wrong: false,
        stats,
      };
    });
  }

  step(dt: number) {
    if (this.phase !== "racing" && this.phase !== "done") return;
    this.clock += dt;
    this.tick++;
    this.bannerT = Math.max(0, this.bannerT - dt);
    for (const f of this.feed) f.life -= dt;
    this.feed = this.feed.filter((f) => f.life > 0);

    const input = this.readInput();
    for (const car of this.cars) {
      if (car.finished) {
        car.vx *= 1 - Math.min(1, 2.2 * dt);
        car.vz *= 1 - Math.min(1, 2.2 * dt);
        car.x += car.vx * dt;
        car.z += car.vz * dt;
        car.nitroOn = false;
        continue;
      }
      if (!car.alive) {
        car.respawn -= dt;
        car.nitroOn = false;
        if (car.respawn <= 0) this.respawn(car);
        continue;
      }
      car.raceTime = this.clock;
      const ai = car.isPlayer ? null : this.aiInput(car);
      const use = car.isPlayer && this.phase === "racing" ? input : (ai ?? ZERO);
      this.integrate(car, use, dt);
      this.combat(car, use, dt);
    }
    this.collide(dt);
    this.bulletsAndStrips(dt);
    this.hazards(dt);
    this.rank();
    this.fadeDecals();
    let w = 0;
    for (const p of this.particles) {
      p.life -= dt;
      p.x += p.vx * dt;
      p.z += p.vz * dt;
      p.y += p.vy * dt;
      p.vy -= 10 * dt;
      p.vx *= 1 - Math.min(1, 0.8 * dt);
      p.vz *= 1 - Math.min(1, 0.8 * dt);
      if (p.y < 0) {
        p.y = 0;
        p.vy *= -0.25;
      }
      if (p.life > 0) this.particles[w++] = p;
    }
    this.particles.length = w;
  }

  private readInput() {
    const k = this.keys;
    const t = this.touch;
    let steer = 0;
    if (k.has("KeyA") || k.has("ArrowLeft") || t.left) steer += 1;
    if (k.has("KeyD") || k.has("ArrowRight") || t.right) steer -= 1;
    const pads = navigator.getGamepads?.();
    const gp = pads ? pads[0] : null;
    let gas = t.gas;
    let brake = t.brake;
    if (gp) {
      const ax = gp.axes[0] ?? 0;
      if (Math.abs(ax) > 0.18) steer -= ax;
      const rt = gp.buttons[7]?.value ?? 0;
      const lt = gp.buttons[6]?.value ?? 0;
      if (rt > 0.2 || gp.buttons[0]?.pressed) gas = true;
      if (lt > 0.2) brake = true;
    }
    if (this.steerOverride !== null) steer = this.steerOverride;
    steer = clamp(steer, -1, 1);
    let throttle = 0;
    if (k.has("KeyW") || k.has("ArrowUp") || gas) throttle += 1;
    if (k.has("KeyS") || k.has("ArrowDown") || brake) throttle -= 1;
    throttle = clamp(throttle, -1, 1);
    const fire = k.has("Space") || t.fire || !!gp?.buttons[2]?.pressed;
    const nitro = k.has("ShiftLeft") || k.has("ShiftRight") || t.nitro || !!gp?.buttons[1]?.pressed;
    const drift = k.has("KeyC") || t.drift || !!gp?.buttons[4]?.pressed;
    const dropEdge = k.has("KeyE") || t.drop || !!gp?.buttons[5]?.pressed;
    const drop = dropEdge && !this.dropLatch;
    this.dropLatch = dropEdge;
    const resetEdge = k.has("KeyR");
    if (resetEdge && !this.resetLatch && this.phase === "racing") {
      const p = this.player;
      if (p && !p.finished) {
        if (!p.alive) p.respawn = 0;
        else this.respawn(p);
      }
    }
    this.resetLatch = resetEdge;
    return { steer, throttle, fire, nitro, drift, drop };
  }

  private aiInput(car: Car) {
    const samples = this.track.samples;
    const s = samples[car.sample] ?? samples[0]!;
    const look = 7 + Math.floor(Math.abs(car.vx * s.tx + car.vz * s.tz) * 0.15);
    const tgt = samples[(car.sample + look) % samples.length]!;
    const dx = tgt.x - car.x;
    const dz = tgt.z - car.z;
    const desired = Math.atan2(-dx, -dz);
    let diff = wrap(desired - car.yaw);
    let steer = clamp(diff * 2.1, -1, 1);
    const ahead = samples[(car.sample + 6) % samples.length]!;
    const turn = Math.abs(wrap(Math.atan2(-ahead.tx, -ahead.tz) - car.yaw));
    let throttle = 1;
    if (turn > 0.55) throttle = 0.45;
    if (turn > 0.95) throttle = 0.05;
    const f = forward(car.yaw);
    const rgt = right(car.yaw);
    for (const o of this.cars) {
      if (o === car || !o.alive || o.finished) continue;
      const ox = o.x - car.x;
      const oz = o.z - car.z;
      const dist = hypot(ox, oz);
      if (dist < 7 && dist > 0.2) {
        const fore = ox * f.x + oz * f.z;
        if (fore > 0) {
          const side = ox * rgt.x + oz * rgt.z;
          steer -= clamp((7 - dist) * 0.22, 0, 1) * Math.sign(side || 1);
          if (dist < 3.6) throttle = Math.min(throttle, 0.35);
        }
      }
    }
    steer = clamp(steer, -1, 1);
    const straight = Math.abs(diff) < 0.25;
    const nitro = straight && car.nitro > 0.45 && car.sample % 50 < 18;
    let drop = false;
    if (car.dropCd <= 0) {
      const player = this.player;
      if (player?.alive) {
        const px = player.x - car.x;
        const pz = player.z - car.z;
        const fore = px * f.x + pz * f.z;
        if (fore < -1.2 && fore > -8 && hypot(px, pz) < 8) drop = true;
      }
    }
    const aim = this.aim(car);
    return { steer, throttle, fire: !!aim, nitro, drift: false, drop, aim };
  }

  private aim(car: Car) {
    const f = forward(car.yaw);
    let best: Car | null = null;
    let bestD = 34 * 34;
    for (const o of this.cars) {
      if (o === car || !o.alive || o.finished) continue;
      const dx = o.x + o.vx * 0.18 - car.x;
      const dz = o.z + o.vz * 0.18 - car.z;
      const d2 = dx * dx + dz * dz;
      if (d2 > bestD || d2 < 4) continue;
      const dist = Math.sqrt(d2);
      if ((dx * f.x + dz * f.z) / dist < 0.8) continue;
      best = o;
      bestD = d2;
    }
    if (!best) return null;
    return { x: best.x + best.vx * 0.18, z: best.z + best.vz * 0.18 };
  }

  private integrate(
    car: Car,
    input: { steer: number; throttle: number; nitro: boolean; drift: boolean },
    dt: number,
  ) {
    const x0 = car.x;
    const z0 = car.z;
    const spd = hypot(car.vx, car.vz);
    const f0 = forward(car.yaw);
    const signed = car.vx * f0.x + car.vz * f0.z;
    const rev = signed >= -0.4 ? 1 : -1;
    const speedFactor = clamp(spd / 9, 0.22, 1);
    car.yaw += input.steer * car.stats.turn * speedFactor * rev * dt;
    const f = forward(car.yaw);
    const nitro = input.nitro && car.nitro > 0.02 && input.throttle > 0;
    if (nitro && !car.nitroOn) this.onFx?.("nitro");
    car.nitroOn = nitro;
    let acc = car.stats.accel;
    if (nitro) acc *= 1.48;
    if (car.boost > 0) acc *= 1.18;
    if (input.throttle > 0) {
      car.vx += f.x * acc * input.throttle * dt;
      car.vz += f.z * acc * input.throttle * dt;
    } else if (input.throttle < 0) {
      car.vx += f.x * car.stats.brake * input.throttle * dt;
      car.vz += f.z * car.stats.brake * input.throttle * dt;
    }
    const sample = this.track.samples[car.sample] ?? this.track.samples[0]!;
    const lateralOff =
      (car.x - sample.x) * sample.nx + (car.z - sample.z) * sample.nz;
    const off = Math.abs(lateralOff) > HALF_WIDTH + 0.5;
    let drag = input.throttle > 0 ? car.stats.drag : car.stats.coast;
    if (off) drag += 1.55;
    if (nitro) drag *= 0.5;
    car.vx -= car.vx * drag * dt;
    car.vz -= car.vz * drag * dt;

    const fs = car.vx * f.x + car.vz * f.z;
    const lx = car.vx - f.x * fs;
    const lz = car.vz - f.z * fs;
    const lat = hypot(lx, lz);
    let grip = car.stats.grip;
    const drifting = input.drift && Math.abs(fs) > 7;
    if (drifting) {
      grip = car.stats.driftGrip;
      car.drift = Math.min(1.3, car.drift + dt);
    } else if (car.drift > 0.4 && !input.drift) {
      car.boost = 0.6;
      car.scrape = 0.85;
      car.drift = 0;
      if (car.isPlayer) {
        this.banner = "SCRAPE";
        this.bannerT = 0.7;
      }
    } else car.drift = Math.max(0, car.drift - dt * 1.6);
    const kill = 1 - Math.exp(-grip * dt);
    car.vx -= lx * kill;
    car.vz -= lz * kill;
    if (car.boost > 0) car.boost -= dt;
    if (car.scrape > 0) car.scrape -= dt;

    let capped = car.vx * f.x + car.vz * f.z;
    let max = car.stats.max;
    if (nitro) max *= 1.3;
    if (car.boost > 0) max *= 1.1;
    if (capped > max) {
      car.vx -= f.x * (capped - max);
      car.vz -= f.z * (capped - max);
    } else if (capped < -max * 0.28) {
      const extra = capped + max * 0.28;
      car.vx -= f.x * extra;
      car.vz -= f.z * extra;
    }
    car.x += car.vx * dt;
    car.z += car.vz * dt;
    if (nitro) car.nitro = Math.max(0, car.nitro - dt * 0.33);
    else car.nitro = Math.min(1, car.nitro + dt * 0.065);

    const along = car.vx * sample.tx + car.vz * sample.tz;
    car.wrong = along < -6;
    if (spd < 2.2 && car.isPlayer) car.stuck += dt;
    else car.stuck = 0;

    if (drifting || lat > 8 || off) {
      const rgt = right(car.yaw);
      for (const side of [-0.8, 0.8]) {
        this.skid(
          x0 + rgt.x * side,
          z0 + rgt.z * side,
          car.x + rgt.x * side,
          car.z + rgt.z * side,
          off ? 0.22 : 0.4,
        );
      }
      if (this.particles.length < 300 && (car.isPlayer || this.tick % 2 === 0)) {
        this.puff(car.x, car.z, 0.2, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, 1.5, 0.45, "#c4a57a", 3);
      }
    }
    if (nitro && this.particles.length < 320) {
      const baked = this.model(car);
      for (const ex of baked.exhausts) {
        const p = mount(car, baked, ex);
        this.puff(p.x, p.z, ex.y * baked.vu, -f.x * 6, -f.z * 6, 1, 0.22, Math.random() > 0.4 ? "#ffb03a" : "#ff5a28", 3.2);
      }
    }
    if (car.hp < car.maxHp * 0.42 && this.particles.length < 320 && Math.random() < 0.5) {
      this.puff(car.x, car.z, 1.2, (Math.random() - 0.5) * 1.2, (Math.random() - 0.5) * 1.2, 2.4, 0.7, "#2a2724", 4);
    }
    this.progress(car, x0, z0);
  }

  private progress(car: Car, x0: number, z0: number) {
    const samples = this.track.samples;
    const N = samples.length;
    let hint = car.sample;
    let best = hint;
    let bestD = Infinity;
    for (let k = -15; k <= 18; k++) {
      const i = (hint + k + N) % N;
      const s = samples[i]!;
      const d = (s.x - car.x) ** 2 + (s.z - car.z) ** 2;
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    if (bestD > 36 * 36) {
      for (let i = 0; i < N; i++) {
        const s = samples[i]!;
        const d = (s.x - car.x) ** 2 + (s.z - car.z) ** 2;
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      }
    }
    car.sample = best;
    const gate = this.track.gates[car.nextCp];
    if (!gate) return;
    if (
      !segmentsIntersect(x0, z0, car.x, car.z, gate.ax, gate.az, gate.bx, gate.bz)
    )
      return;
    const s = samples[gate.sample]!;
    const mx = car.x - x0;
    const mz = car.z - z0;
    if (mx * s.tx + mz * s.tz <= 0) return;
    if (gate.index === 0) {
      car.laps += 1;
      const lapT = this.clock - car.lapStamp;
      if (lapT > 8) {
        car.lapTimes.push(lapT);
        if (car.isPlayer && (this.bestLap === null || lapT < this.bestLap)) {
          this.bestLap = lapT;
          storeSave({ bestLap: this.bestLap, bestRace: this.bestRace });
        }
      }
      car.lapStamp = this.clock;
      if (car.laps >= LAPS) {
        this.finish(car);
      } else if (car.isPlayer) {
        this.banner = car.laps === LAPS - 1 ? "FINAL LAP" : `LAP ${car.laps + 1}`;
        this.bannerT = 1.4;
        this.onFx?.("lap");
      }
    }
    car.nextCp = (gate.index + 1) % this.track.gates.length;
    car.lastCpX = s.x;
    car.lastCpZ = s.z;
    car.lastCpYaw = Math.atan2(-s.tx, -s.tz);
  }

  private finish(car: Car) {
    if (car.finished) return;
    car.finished = true;
    this.finishCount += 1;
    car.finishPlace = this.finishCount;
    car.place = this.finishCount;
    car.finishTime = this.clock;
    car.invuln = 99;
    if (car.isPlayer) {
      const won = car.finishPlace === 1;
      if (this.bestRace === null || car.finishTime < this.bestRace) {
        this.bestRace = car.finishTime;
        storeSave({ bestLap: this.bestLap, bestRace: this.bestRace });
      }
      this.result = {
        place: car.finishPlace,
        time: car.finishTime,
        kills: car.kills,
        bestLap: this.bestLap,
        laps: [...car.lapTimes],
        won,
      };
      this.banner = won ? "THE FLATS ARE YOURS" : "FINISH";
      this.bannerT = 2.4;
      this.phase = "done";
      this.onFx?.("lap");
    }
  }

  private combat(
    car: Car,
    input: { fire: boolean; drop: boolean; aim?: { x: number; z: number } | null },
    dt: number,
  ) {
    car.fireCd = Math.max(0, car.fireCd - dt);
    car.dropCd = Math.max(0, car.dropCd - dt);
    car.ramCd = Math.max(0, car.ramCd - dt);
    car.invuln = Math.max(0, car.invuln - dt);
    car.flash = Math.max(0, car.flash - dt);
    if (car.overheat > 0) {
      car.overheat -= dt;
      car.heat = Math.max(0, car.heat - dt * 0.22);
    } else car.heat = Math.max(0, car.heat - dt * 0.34);

    const want = input.fire && (car.isPlayer || input.aim);
    if (want && car.fireCd <= 0) {
      if (car.heat >= 1 || car.overheat > 0) {
        if (car.overheat <= 0) car.overheat = 0.85;
      } else {
        this.shoot(car, input.aim ?? null);
      }
    }
    if (input.drop && car.dropCd <= 0) {
      const f = forward(car.yaw);
      this.strips.push({
        x: car.x - f.x * 2.4,
        z: car.z - f.z * 2.4,
        yaw: car.yaw,
        life: 8,
        grace: 0.65,
        owner: car.id,
        hit: new Set(),
      });
      car.dropCd = 7.5;
    }
  }

  private shoot(car: Car, aim: { x: number; z: number } | null) {
    const baked = this.model(car);
    const f = forward(car.yaw);
    let dirx = f.x;
    let dirz = f.z;
    if (!car.isPlayer && aim) {
      const dx = aim.x - car.x;
      const dz = aim.z - car.z;
      const mag = hypot(dx, dz) || 1;
      dirx = dx / mag;
      dirz = dz / mag;
    }
    const spread = car.isPlayer ? car.stats.spread : 0.14;
    const guns = baked.guns.length ? baked.guns : [{ x: 0, y: 5, z: 8 }];
    for (const g of guns) {
      const a = (Math.random() - 0.5) * spread;
      const c = Math.cos(a);
      const s = Math.sin(a);
      const vx = dirx * c - dirz * s;
      const vz = dirx * s + dirz * c;
      const m = mount(car, baked, g);
      this.bullets.push({
        x: m.x + vx * 0.4,
        z: m.z + vz * 0.4,
        vx: vx * 58 + car.vx * 0.25,
        vz: vz * 58 + car.vz * 0.25,
        life: 0.72,
        dmg: car.stats.dmg,
        owner: car.id,
        color: car.isPlayer ? "#ffd27a" : "#ff5a32",
      });
      this.puff(m.x, m.z, g.y * baked.vu, vx * 2, vz * 2, 0.2, 0.06, "#fff1c4", 3);
    }
    car.fireCd = car.stats.fireRate;
    car.heat = Math.min(1.25, car.heat + car.stats.heat);
    if (car.heat >= 1) car.overheat = 0.85;
    if (car.isPlayer || this.tick % 2 === 0) this.onFx?.("gun");
  }

  private collide(dt: number) {
    const cars = this.cars.filter((c) => c.alive && !c.finished);
    for (let i = 0; i < cars.length; i++) {
      for (let j = i + 1; j < cars.length; j++) {
        this.carHit(cars[i]!, cars[j]!, dt);
      }
    }
    for (const car of cars) {
      for (const prop of this.props) {
        if (prop.dead || prop.solid === "none") continue;
        this.propHit(car, prop);
      }
    }
  }

  private carHit(a: Car, b: Car, _dt: number) {
    const ac = worldCircles(a);
    const bc = worldCircles(b);
    let best = 0;
    let nx = 0;
    let nz = 0;
    for (const c1 of ac) {
      for (const c2 of bc) {
        const dx = c2.x - c1.x;
        const dz = c2.z - c1.z;
        const dist = hypot(dx, dz) || 0.0001;
        const pen = c1.r + c2.r - dist;
        if (pen > best) {
          best = pen;
          nx = dx / dist;
          nz = dz / dist;
        }
      }
    }
    if (best <= 0) return;
    a.x -= nx * best * 0.5;
    a.z -= nz * best * 0.5;
    b.x += nx * best * 0.5;
    b.z += nz * best * 0.5;
    const rel = (a.vx - b.vx) * nx + (a.vz - b.vz) * nz;
    if (rel > 0) {
      a.vx -= nx * rel * 0.55;
      a.vz -= nz * rel * 0.55;
      b.vx += nx * rel * 0.55;
      b.vz += nz * rel * 0.55;
    }
    if (rel > 7 && a.ramCd <= 0 && b.ramCd <= 0) {
      const fa = forward(a.yaw);
      const fb = forward(b.yaw);
      const noseA = fa.x * nx + fa.z * nz;
      const noseB = fb.x * -nx + fb.z * -nz;
      if (noseA > 0.4) this.hurt(b, (rel - 5) * a.stats.ram * 0.55 * noseA, a);
      if (noseB > 0.4) this.hurt(a, (rel - 5) * b.stats.ram * 0.55 * noseB, b);
      if (noseA <= 0.4 && noseB <= 0.4) {
        this.hurt(a, (rel - 5) * 0.18, b);
        this.hurt(b, (rel - 5) * 0.18, a);
      }
      a.ramCd = 0.4;
      b.ramCd = 0.4;
      this.burst(a.x + nx * 0.5, a.z + nz * 0.5, "#e6d3b0", 8);
      if (a.isPlayer || b.isPlayer) {
        this.shakeAmp = Math.max(this.shakeAmp, Math.min(14, rel * 0.45));
        this.onFx?.("hit");
      }
    }
  }

  private propHit(car: Car, prop: Prop) {
    const circles = worldCircles(car);
    for (const c of circles) {
      if (prop.solid === "circle") {
        const dx = c.x - prop.x;
        const dz = c.z - prop.z;
        const dist = hypot(dx, dz) || 0.0001;
        const pen = c.r + prop.r - dist;
        if (pen > 0) {
          const nx = dx / dist;
          const nz = dz / dist;
          car.x += nx * pen;
          car.z += nz * pen;
          const into = car.vx * nx + car.vz * nz;
          if (into < 0) {
            car.vx -= nx * into;
            car.vz -= nz * into;
            if (-into > 10 && prop.kind === "drum") this.hurt(car, (-into - 8) * 0.3, null);
          }
        }
      } else if (prop.solid === "obb") {
        const push = pushCircleOBB(c.x, c.z, c.r, prop);
        if (push) {
          car.x += push.px;
          car.z += push.pz;
          const plen = hypot(push.px, push.pz) || 1;
          const nx = push.px / plen;
          const nz = push.pz / plen;
          const into = car.vx * nx + car.vz * nz;
          if (into < 0) {
            car.vx -= nx * into * 0.95;
            car.vz -= nz * into * 0.95;
          }
        }
      }
    }
  }

  private bulletsAndStrips(dt: number) {
    let w = 0;
    for (const b of this.bullets) {
      b.life -= dt;
      b.x += b.vx * dt;
      b.z += b.vz * dt;
      if (b.life <= 0) continue;
      let dead = false;
      for (const car of this.cars) {
        if (!car.alive || car.finished || car.id === b.owner || car.invuln > 0) continue;
        for (const c of worldCircles(car)) {
          if ((c.x - b.x) ** 2 + (c.z - b.z) ** 2 < (c.r + 0.25) ** 2) {
            const owner = this.cars[b.owner] ?? null;
            this.hurt(car, b.dmg, owner);
            this.burst(b.x, b.z, "#ffd27a", 5);
            if (owner?.isPlayer || car.isPlayer) this.onFx?.("hit");
            dead = true;
            break;
          }
        }
        if (dead) break;
      }
      if (!dead) {
        for (const prop of this.props) {
          if (prop.dead || prop.hp > 900) continue;
          const hit =
            prop.solid === "circle"
              ? (prop.x - b.x) ** 2 + (prop.z - b.z) ** 2 < (prop.r + 0.3) ** 2
              : Math.abs(localOf(prop, b.x, b.z).lx) < prop.hx + 0.3 &&
                Math.abs(localOf(prop, b.x, b.z).lz) < prop.hz + 0.3;
          if (hit) {
            prop.hp -= b.dmg;
            this.burst(b.x, b.z, "#e6d3b0", 4);
            if (prop.hp <= 0) this.breakProp(prop);
            dead = true;
            break;
          }
        }
      }
      if (!dead) this.bullets[w++] = b;
    }
    this.bullets.length = w;

    let s = 0;
    for (const strip of this.strips) {
      strip.life -= dt;
      strip.grace -= dt;
      if (strip.life <= 0) continue;
      for (const car of this.cars) {
        if (!car.alive || car.finished || strip.hit.has(car.id)) continue;
        if (strip.owner === car.id && strip.grace > 0) continue;
        const f = forward(strip.yaw);
        const r = right(strip.yaw);
        const dx = car.x - strip.x;
        const dz = car.z - strip.z;
        const lx = dx * r.x + dz * r.z;
        const lz = dx * f.x + dz * f.z;
        if (Math.abs(lx) < 2.7 && Math.abs(lz) < 0.85) {
          strip.hit.add(car.id);
          const owner = this.cars[strip.owner] ?? null;
          this.hurt(car, 26, owner);
          car.vx *= 0.7;
          car.vz *= 0.7;
          this.burst(car.x, car.z, "#e6d3b0", 7);
        }
      }
      this.strips[s++] = strip;
    }
    this.strips.length = s;
  }

  private hazards(dt: number) {
    for (const prop of this.props) {
      if (prop.dead) continue;
      if (prop.kind === "barrel" && this.tick % 2 === 0 && this.particles.length < 300) {
        this.puff(
          prop.x + (Math.random() - 0.5) * 0.3,
          prop.z + (Math.random() - 0.5) * 0.3,
          1.5,
          (Math.random() - 0.5) * 0.6,
          (Math.random() - 0.5) * 0.6,
          2.2 + Math.random(),
          0.45,
          Math.random() > 0.5 ? "#ff8a32" : "#ffd27a",
          2.4,
        );
      }
      if (prop.kind !== "spike" && prop.kind !== "jet") continue;
      const jetOn = prop.kind === "jet" && Math.sin(this.clock * 3 + prop.phase) > 0.25;
      if (prop.kind === "jet" && jetOn && this.tick % 2 === 0) {
        this.puff(prop.x, prop.z, 0.8, (Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 1.5, 6, 0.35, "#ff5a28", 3);
      }
      for (const car of this.cars) {
        if (!car.alive || car.finished || car.invuln > 0) continue;
        if (prop.kind === "spike") {
          const { lx, lz } = localOf(prop, car.x, car.z);
          if (Math.abs(lx) < prop.hx + 0.8 && Math.abs(lz) < prop.hz + 0.7) {
            this.hurt(car, 36 * dt, null);
            car.vx *= 1 - Math.min(0.45, 3.2 * dt);
            car.vz *= 1 - Math.min(0.45, 3.2 * dt);
          }
        } else if (jetOn && (car.x - prop.x) ** 2 + (car.z - prop.z) ** 2 < 2.3 * 2.3) {
          this.hurt(car, 34 * dt, null);
        }
      }
    }
  }

  private hurt(car: Car, amount: number, by: Car | null) {
    if (!car.alive || car.finished || car.invuln > 0 || amount <= 0) return;
    car.hp -= amount;
    car.flash = 0.12;
    if (car.isPlayer) this.shakeAmp = Math.max(this.shakeAmp, Math.min(10, amount * 0.35));
    if (car.hp <= 0) {
      car.hp = 0;
      this.wreck(car, by);
    }
  }

  private wreck(car: Car, by: Car | null) {
    car.alive = false;
    car.respawn = 2.35;
    car.vx = 0;
    car.vz = 0;
    car.nitroOn = false;
    this.boom(car.x, car.z);
    this.onFx?.("boom");
    if (car.isPlayer) this.shakeAmp = Math.max(this.shakeAmp, 16);
    if (by && by !== car && by.alive) {
      by.kills += 1;
      by.nitro = Math.min(1, by.nitro + 0.4);
      const text = by.isPlayer ? `${car.name} WRECKED` : car.isPlayer ? `${by.name} WRECKED YOU` : `${by.name} GOT ${car.name}`;
      this.feed.unshift({ text, life: 3.2 });
      if (this.feed.length > 4) this.feed.pop();
      if (car.isPlayer) {
        this.banner = "WRECKED";
        this.bannerT = 1.3;
      }
    } else if (car.isPlayer) {
      this.banner = "WRECKED";
      this.bannerT = 1.3;
    }
  }

  respawn(car: Car) {
    const f = forward(car.lastCpYaw);
    car.x = car.lastCpX - f.x * 1.5;
    car.z = car.lastCpZ - f.z * 1.5;
    car.yaw = car.lastCpYaw;
    car.vx = f.x * 12;
    car.vz = f.z * 12;
    car.hp = car.maxHp * 0.62;
    car.alive = true;
    car.invuln = 1.8;
    car.heat = 0;
    car.overheat = 0;
    car.respawn = 0;
    const samples = this.track.samples;
    let best = 0;
    let bestD = Infinity;
    for (let i = 0; i < samples.length; i++) {
      const s = samples[i]!;
      const d = (s.x - car.x) ** 2 + (s.z - car.z) ** 2;
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    car.sample = best;
  }

  private breakProp(prop: Prop) {
    prop.dead = true;
    prop.solid = "none";
    this.boom(prop.x, prop.z);
    this.onFx?.("boom");
  }

  private boom(x: number, z: number) {
    this.burst(x, z, "#ff8a32", 16);
    this.burst(x, z, "#ffd27a", 10);
    this.burst(x, z, "#2a241e", 8);
  }

  private burst(x: number, z: number, color: string, n: number) {
    for (let i = 0; i < n; i++) {
      if (this.particles.length > 340) return;
      const a = Math.random() * Math.PI * 2;
      const s = 3 + Math.random() * 12;
      this.particles.push({
        x,
        z,
        y: Math.random() * 1.2,
        vx: Math.cos(a) * s,
        vz: Math.sin(a) * s,
        vy: 2 + Math.random() * 7,
        life: 0.35 + Math.random() * 0.4,
        max: 0.7,
        color,
        size: 2 + Math.random() * 3,
      });
    }
  }

  private puff(x: number, z: number, y: number, vx: number, vz: number, vy: number, life: number, color: string, size: number) {
    if (this.particles.length > 340) return;
    this.particles.push({ x, z, y, vx, vz, vy, life, max: life, color, size });
  }

  private skid(x0: number, z0: number, x1: number, z1: number, alpha: number) {
    const ctx = this.track.decalCtx;
    const a = worldToTex(x0, z0);
    const b = worldToTex(x1, z1);
    ctx.strokeStyle = `rgba(22,16,12,${alpha})`;
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(a[0], a[1]);
    ctx.lineTo(b[0], b[1]);
    ctx.stroke();
  }

  private fadeDecals() {
    if (this.tick % 3 !== 0) return;
    const ctx = this.track.decalCtx;
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "rgba(0,0,0,0.035)";
    ctx.fillRect(0, 0, TEX, TEX);
    ctx.globalCompositeOperation = "source-over";
  }

  private rank() {
    const scored = this.cars.map((c) => ({
      c,
      score: c.finished ? 1_000_000 - c.finishPlace : c.laps * 10000 + c.sample,
    }));
    scored.sort((a, b) => b.score - a.score);
    scored.forEach((s, i) => {
      if (!s.c.finished) s.c.place = i + 1;
    });
  }

  model(car: Car): Baked {
    return this.models[car.model] ?? this.models.black!;
  }
}

const ZERO = { steer: 0, throttle: 0, fire: false, nitro: false, drift: false, drop: false, aim: null };

function mount(car: Car, baked: Baked, m: { x: number; y: number; z: number }) {
  const f = forward(car.yaw);
  const r = right(car.yaw);
  const lx = m.x * baked.vu;
  const lz = m.z * baked.vu;
  return { x: car.x + r.x * lx + f.x * lz, z: car.z + r.z * lx + f.z * lz };
}

function worldCircles(car: Car) {
  const f = forward(car.yaw);
  return car.stats.circles.map((c) => ({
    x: car.x + f.x * c.z,
    z: car.z + f.z * c.z,
    r: c.r,
  }));
}

function localOf(prop: Prop, x: number, z: number) {
  const f = forward(prop.yaw);
  const r = right(prop.yaw);
  const dx = x - prop.x;
  const dz = z - prop.z;
  return { lx: dx * r.x + dz * r.z, lz: dx * f.x + dz * f.z };
}

function closestOnRect(lx: number, lz: number, hx: number, hz: number) {
  const inside = Math.abs(lx) <= hx && Math.abs(lz) <= hz;
  if (!inside) return { x: clamp(lx, -hx, hx), z: clamp(lz, -hz, hz), inside: false };
  const px = hx - Math.abs(lx);
  const pz = hz - Math.abs(lz);
  if (px < pz) return { x: Math.sign(lx || 1) * hx, z: lz, inside: true };
  return { x: lx, z: Math.sign(lz || 1) * hz, inside: true };
}

function pushCircleOBB(cx: number, cz: number, cr: number, box: Prop) {
  const f = forward(box.yaw);
  const r = right(box.yaw);
  const dx = cx - box.x;
  const dz = cz - box.z;
  const lx = dx * r.x + dz * r.z;
  const lz = dx * f.x + dz * f.z;
  const c = closestOnRect(lx, lz, box.hx, box.hz);
  if (!c.inside) {
    let nx = lx - c.x;
    let nz = lz - c.z;
    const dist = Math.hypot(nx, nz);
    if (dist >= cr || dist < 1e-5) return null;
    const pen = cr - dist;
    nx /= dist;
    nz /= dist;
    return { px: (r.x * nx + f.x * nz) * pen, pz: (r.z * nx + f.z * nz) * pen };
  }
  const ex = box.hx - Math.abs(lx);
  const ez = box.hz - Math.abs(lz);
  let lnx = 0;
  let lnz = 0;
  let pen = 0;
  if (ex < ez) {
    lnx = Math.sign(lx || 1);
    pen = ex + cr;
  } else {
    lnz = Math.sign(lz || 1);
    pen = ez + cr;
  }
  return { px: (r.x * lnx + f.x * lnz) * pen, pz: (r.z * lnx + f.z * lnz) * pen };
}

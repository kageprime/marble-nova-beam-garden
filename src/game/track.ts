import { mulberry32 } from "@/game/math";

export const WORLD_MIN = -200;
export const WORLD_SIZE = 400;
export const TEX = 1400;
export const HALF_WIDTH = 9;
export const CP_COUNT = 8;

export type Sample = {
  x: number;
  z: number;
  tx: number;
  tz: number;
  nx: number;
  nz: number;
};

export type Gate = {
  index: number;
  sample: number;
  ax: number;
  az: number;
  bx: number;
  bz: number;
};

export type Prop = {
  model: string;
  x: number;
  z: number;
  yaw: number;
  solid: "none" | "circle" | "obb";
  r: number;
  hx: number;
  hz: number;
  hp: number;
  maxHp: number;
  dead: boolean;
  kind: "static" | "drum" | "spike" | "jet" | "barrel";
  phase: number;
};

export type Spawn = { x: number; z: number; yaw: number; sample: number };

export type Track = {
  samples: Sample[];
  gates: Gate[];
  props: Prop[];
  spawns: Spawn[];
  ground: HTMLCanvasElement;
  decals: HTMLCanvasElement;
  decalCtx: CanvasRenderingContext2D;
};

const RAW: [number, number][] = [
  [0, -92],
  [58, -104],
  [112, -64],
  [124, -6],
  [98, 44],
  [50, 66],
  [6, 46],
  [-30, 74],
  [-82, 56],
  [-122, 14],
  [-114, -42],
  [-70, -80],
  [-22, -90],
];

function catmull(pts: [number, number][], per: number) {
  const n = pts.length;
  const out: { x: number; z: number }[] = [];
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n]!;
    const p1 = pts[i]!;
    const p2 = pts[(i + 1) % n]!;
    const p3 = pts[(i + 2) % n]!;
    for (let s = 0; s < per; s++) {
      const t = s / per;
      const t2 = t * t;
      const t3 = t2 * t;
      const x =
        0.5 *
        (2 * p1[0] +
          (-p0[0] + p2[0]) * t +
          (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 +
          (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3);
      const z =
        0.5 *
        (2 * p1[1] +
          (-p0[1] + p2[1]) * t +
          (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 +
          (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3);
      out.push({ x, z });
    }
  }
  return out;
}

function heading(tx: number, tz: number) {
  return Math.atan2(-tx, -tz);
}

export function worldToTex(x: number, z: number): [number, number] {
  const s = TEX / WORLD_SIZE;
  return [(x - WORLD_MIN) * s, (z - WORLD_MIN) * s];
}

function hash(x: number, y: number) {
  let n = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}

function noise(x: number, y: number) {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = x - x0;
  const fy = y - y0;
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);
  const v00 = hash(x0, y0);
  const v10 = hash(x0 + 1, y0);
  const v01 = hash(x0, y0 + 1);
  const v11 = hash(x0 + 1, y0 + 1);
  const a = v00 + (v10 - v00) * sx;
  const b = v01 + (v11 - v01) * sx;
  return a + (b - a) * sy;
}

function paintGround(samples: Sample[]) {
  const cvs = document.createElement("canvas");
  cvs.width = TEX;
  cvs.height = TEX;
  const ctx = cvs.getContext("2d");
  if (!ctx) return cvs;
  const img = ctx.createImageData(TEX, TEX);
  const data = img.data;
  const step = 2;
  for (let y = 0; y < TEX; y += step) {
    for (let x = 0; x < TEX; x += step) {
      const wx = WORLD_MIN + (x / TEX) * WORLD_SIZE;
      const wz = WORLD_MIN + (y / TEX) * WORLD_SIZE;
      const n = noise(wx * 0.045, wz * 0.045) * 0.7 + noise(wx * 0.15, wz * 0.15) * 0.3;
      const grit = hash(x, y);
      const r = 146 + n * 48 + grit * 10;
      const g = 108 + n * 32 + grit * 6;
      const b = 66 + n * 18;
      for (let oy = 0; oy < step; oy++) {
        for (let ox = 0; ox < step; ox++) {
          const i = ((y + oy) * TEX + (x + ox)) * 4;
          data[i] = r;
          data[i + 1] = g;
          data[i + 2] = b;
          data[i + 3] = 255;
        }
      }
    }
  }
  ctx.putImageData(img, 0, 0);
  const scale = TEX / WORLD_SIZE;
  const path = new Path2D();
  const p0 = worldToTex(samples[0]!.x, samples[0]!.z);
  path.moveTo(p0[0], p0[1]);
  for (let i = 1; i < samples.length; i++) {
    const p = worldToTex(samples[i]!.x, samples[i]!.z);
    path.lineTo(p[0], p[1]);
  }
  path.closePath();
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.strokeStyle = "#6e533c";
  ctx.lineWidth = (HALF_WIDTH * 2 + 3.2) * scale;
  ctx.stroke(path);
  ctx.strokeStyle = "#3a322c";
  ctx.lineWidth = HALF_WIDTH * 2 * scale;
  ctx.stroke(path);
  ctx.strokeStyle = "#c4512a";
  ctx.lineWidth = 0.55 * scale;
  ctx.stroke(path);
  ctx.setLineDash([2.4 * scale, 3.4 * scale]);
  ctx.strokeStyle = "#e6d3b0";
  ctx.lineWidth = 0.28 * scale;
  ctx.stroke(path);
  ctx.setLineDash([]);

  const s = samples[0]!;
  ctx.save();
  const tp = worldToTex(s.x, s.z);
  ctx.translate(tp[0], tp[1]);
  const ang = Math.atan2(s.nx, s.tx);
  ctx.rotate(ang);
  const band = HALF_WIDTH * scale;
  const cell = (band * 2) / 10;
  for (let i = 0; i < 10; i++) {
    ctx.fillStyle = i % 2 === 0 ? "#f3e6d0" : "#1a1614";
    ctx.fillRect(-band + i * cell, -0.7 * scale, cell + 0.5, 1.4 * scale);
  }
  ctx.restore();

  ctx.fillStyle = "rgba(30, 22, 16, 0.35)";
  const rnd = mulberry32(9);
  for (let i = 0; i < 18; i++) {
    const sm = samples[Math.floor(rnd() * samples.length)]!;
    const lat = (rnd() - 0.5) * HALF_WIDTH * 1.4;
    const px = worldToTex(sm.x + sm.nx * lat, sm.z + sm.nz * lat);
    ctx.beginPath();
    ctx.ellipse(px[0], px[1], (1.2 + rnd() * 2) * scale, (0.8 + rnd()) * scale, rnd() * 3, 0, Math.PI * 2);
    ctx.fill();
  }
  return cvs;
}

function nearestDist(samples: Sample[], x: number, z: number) {
  let best = Infinity;
  for (const s of samples) {
    const d = (s.x - x) ** 2 + (s.z - z) ** 2;
    if (d < best) best = d;
  }
  return Math.sqrt(best);
}

export function buildTrack(): Track {
  const pts = catmull(RAW, 10);
  const samples: Sample[] = pts.map((p, i) => {
    const n = pts[(i + 1) % pts.length]!;
    const prev = pts[(i - 1 + pts.length) % pts.length]!;
    let tx = n.x - prev.x;
    let tz = n.z - prev.z;
    const mag = Math.hypot(tx, tz) || 1;
    tx /= mag;
    tz /= mag;
    return { x: p.x, z: p.z, tx, tz, nx: -tz, nz: tx };
  });

  const gates: Gate[] = [];
  for (let k = 0; k < CP_COUNT; k++) {
    const sample = Math.floor((k * samples.length) / CP_COUNT) % samples.length;
    const s = samples[sample]!;
    gates.push({
      index: k,
      sample,
      ax: s.x + s.nx * (HALF_WIDTH + 1),
      az: s.z + s.nz * (HALF_WIDTH + 1),
      bx: s.x - s.nx * (HALF_WIDTH + 1),
      bz: s.z - s.nz * (HALF_WIDTH + 1),
    });
  }

  const props: Prop[] = [];
  const push = (p: Prop) => props.push(p);

  for (let i = 24; i < samples.length; i += 8) {
    const s = samples[i]!;
    const yaw = heading(s.nx, s.nz);
    for (const side of [-1, 1]) {
      if ((i + side) % 24 === 0) continue;
      push({
        model: "wall",
        x: s.x + s.nx * side * (HALF_WIDTH + 2.4),
        z: s.z + s.nz * side * (HALF_WIDTH + 2.4),
        yaw,
        solid: "obb",
        r: 0,
        hx: 2.35,
        hz: 0.48,
        hp: 90,
        maxHp: 90,
        dead: false,
        kind: "static",
        phase: 0,
      });
    }
  }

  const spikeAt = [0.22, 0.37, 0.53, 0.68, 0.84];
  for (let i = 0; i < spikeAt.length; i++) {
    const s = samples[Math.floor(spikeAt[i]! * samples.length) % samples.length]!;
    const side = i % 2 === 0 ? 1 : -1;
    push({
      model: "spike",
      x: s.x + s.nx * side * (HALF_WIDTH * 0.42),
      z: s.z + s.nz * side * (HALF_WIDTH * 0.42),
      yaw: heading(s.tx, s.tz),
      solid: "obb",
      r: 0,
      hx: 2.5,
      hz: 0.55,
      hp: 60,
      maxHp: 60,
      dead: false,
      kind: "spike",
      phase: i,
    });
  }

  for (const frac of [0.3, 0.58, 0.77]) {
    const s = samples[Math.floor(frac * samples.length) % samples.length]!;
    push({
      model: "pipe",
      x: s.x + s.nx * (HALF_WIDTH + 1.1),
      z: s.z + s.nz * (HALF_WIDTH + 1.1),
      yaw: heading(s.tx, s.tz),
      solid: "circle",
      r: 0.9,
      hx: 0,
      hz: 0,
      hp: 40,
      maxHp: 40,
      dead: false,
      kind: "jet",
      phase: frac * 12,
    });
  }

  const rnd = mulberry32(42);
  for (let n = 0; n < 26; n++) {
    const s = samples[Math.floor(rnd() * samples.length)]!;
    const side = rnd() < 0.5 ? -1 : 1;
    const dist = HALF_WIDTH + 6 + rnd() * 16;
    const x = s.x + s.nx * side * dist + (rnd() - 0.5) * 6;
    const z = s.z + s.nz * side * dist + (rnd() - 0.5) * 6;
    if (nearestDist(samples, x, z) < HALF_WIDTH + 4) continue;
    const roll = rnd();
    if (roll < 0.34) {
      push({
        model: "rock",
        x,
        z,
        yaw: rnd() * 6,
        solid: "circle",
        r: 1.7,
        hx: 0,
        hz: 0,
        hp: 999,
        maxHp: 999,
        dead: false,
        kind: "static",
        phase: 0,
      });
    } else if (roll < 0.62) {
      push({
        model: "tree",
        x,
        z,
        yaw: rnd() * 6,
        solid: "circle",
        r: 0.55,
        hx: 0,
        hz: 0,
        hp: 40,
        maxHp: 40,
        dead: false,
        kind: "static",
        phase: 0,
      });
    } else if (roll < 0.78) {
      push({
        model: "tires",
        x,
        z,
        yaw: rnd() * 6,
        solid: "circle",
        r: 0.9,
        hx: 0,
        hz: 0,
        hp: 30,
        maxHp: 30,
        dead: false,
        kind: "static",
        phase: 0,
      });
    } else if (roll < 0.9) {
      push({
        model: "drum",
        x,
        z,
        yaw: 0,
        solid: "circle",
        r: 0.85,
        hx: 0,
        hz: 0,
        hp: 22,
        maxHp: 22,
        dead: false,
        kind: "drum",
        phase: 0,
      });
    } else {
      push({
        model: "barrel",
        x,
        z,
        yaw: 0,
        solid: "circle",
        r: 0.85,
        hx: 0,
        hz: 0,
        hp: 22,
        maxHp: 22,
        dead: false,
        kind: "barrel",
        phase: rnd() * 6,
      });
    }
  }

  for (let i = 0; i < 4; i++) {
    const s = samples[(40 + i * 18) % samples.length]!;
    push({
      model: "wreck",
      x: s.x - s.nx * (HALF_WIDTH + 5 + (i % 2)),
      z: s.z - s.nz * (HALF_WIDTH + 5),
      yaw: heading(s.tx, s.tz) + (i % 2 ? 0.4 : -0.8),
      solid: "circle",
      r: 1.5,
      hx: 0,
      hz: 0,
      hp: 80,
      maxHp: 80,
      dead: false,
      kind: "static",
      phase: 0,
    });
  }

  for (let i = 0; i < 3; i++) {
    const s = samples[(18 + i * 40) % samples.length]!;
    push({
      model: "tower",
      x: s.x + s.nx * (HALF_WIDTH + 14),
      z: s.z + s.nz * (HALF_WIDTH + 14),
      yaw: heading(s.nx, s.nz),
      solid: "circle",
      r: 1.15,
      hx: 0,
      hz: 0,
      hp: 999,
      maxHp: 999,
      dead: false,
      kind: "static",
      phase: i,
    });
  }

  const arch = samples[15]!;
  const archYaw = heading(arch.tx, arch.tz);
  for (const side of [-1, 1]) {
    push({
      model: "post",
      x: arch.x + arch.nx * side * (HALF_WIDTH + 0.4),
      z: arch.z + arch.nz * side * (HALF_WIDTH + 0.4),
      yaw: archYaw,
      solid: "circle",
      r: 0.7,
      hx: 0,
      hz: 0,
      hp: 999,
      maxHp: 999,
      dead: false,
      kind: "static",
      phase: 0,
    });
  }
  push({
    model: "beam",
    x: arch.x,
    z: arch.z,
    yaw: archYaw,
    solid: "none",
    r: 0,
    hx: 0,
    hz: 0,
    hp: 999,
    maxHp: 999,
    dead: false,
    kind: "static",
    phase: 0,
  });

  let cx = 0;
  let cz = 0;
  for (const s of samples) {
    cx += s.x;
    cz += s.z;
  }
  cx /= samples.length;
  cz /= samples.length;
  push({
    model: "wreck",
    x: cx,
    z: cz,
    yaw: 0.4,
    solid: "circle",
    r: 1.6,
    hx: 0,
    hz: 0,
    hp: 70,
    maxHp: 70,
    dead: false,
    kind: "static",
    phase: 0,
  });
  push({
    model: "barrel",
    x: cx + 3.2,
    z: cz - 1.4,
    yaw: 0,
    solid: "circle",
    r: 0.85,
    hx: 0,
    hz: 0,
    hp: 20,
    maxHp: 20,
    dead: false,
    kind: "barrel",
    phase: 1,
  });
  push({
    model: "barrel",
    x: cx - 2.4,
    z: cz + 2.2,
    yaw: 0.2,
    solid: "circle",
    r: 0.85,
    hx: 0,
    hz: 0,
    hp: 20,
    maxHp: 20,
    dead: false,
    kind: "barrel",
    phase: 2.2,
  });

  const spawns: Spawn[] = [];
  for (let i = 0; i < 6; i++) {
    const row = Math.floor(i / 2);
    const col = i % 2;
    const sample = 11 - row * 3;
    const s = samples[sample]!;
    const side = col === 0 ? -2.5 : 2.5;
    spawns.push({
      x: s.x + s.nx * side,
      z: s.z + s.nz * side,
      yaw: heading(s.tx, s.tz),
      sample,
    });
  }

  const ground = paintGround(samples);
  const decals = document.createElement("canvas");
  decals.width = TEX;
  decals.height = TEX;
  const decalCtx = decals.getContext("2d");
  if (!decalCtx) throw new Error("no decal context");
  decalCtx.lineCap = "round";

  return { samples, gates, props, spawns, ground, decals, decalCtx };
}

export function cloneProps(props: Prop[]): Prop[] {
  return props.map((p) => ({ ...p }));
}

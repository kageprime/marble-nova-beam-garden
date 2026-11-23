import { shade } from "@/game/math";

export type Vox = { x: number; y: number; z: number; c: number; g: number };
export type Mount = { x: number; y: number; z: number };

export type Baked = {
  id: string;
  slices: (HTMLCanvasElement | null)[];
  glow: (HTMLCanvasElement | null)[];
  ox: number;
  oy: number;
  vu: number;
  layers: number;
  guns: Mount[];
  exhausts: Mount[];
  hasGlow: boolean;
};

const INK = 0x14110f;
const RUBBER = 0x161412;
const STEEL = 0x8d8680;
const STEEL_D = 0x3e3a36;
const BRASS = 0xd4a24a;
const BONE = 0xe6d3b0;
const GLASS = 0x163032;
const AMBER = 0xffc56a;
const REDL = 0xff3a2a;
const RUST = 0xb5522c;

class Vol {
  v: Vox[] = [];
  box(x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, c: number, g = 0) {
    for (let x = x0; x <= x1; x++) {
      for (let y = y0; y <= y1; y++) {
        for (let z = z0; z <= z1; z++) this.v.push({ x, y, z, c, g });
      }
    }
  }
  at(x: number, y: number, z: number, c: number, g = 0) {
    this.v.push({ x, y, z, c, g });
  }
  wheel(cx: number, cy: number, cz: number, rad: number, half: number, hub: number) {
    const inner = Math.max(1, rad - 2);
    for (let x = cx - half; x <= cx + half; x++) {
      for (let y = cy - rad; y <= cy + rad; y++) {
        for (let z = cz - rad; z <= cz + rad; z++) {
          const dy = y - cy;
          const dz = z - cz;
          const d2 = dy * dy + dz * dz;
          if (d2 > rad * rad) continue;
          const face = x === cx - half || x === cx + half;
          if (d2 >= inner * inner) this.at(x, y, z, RUBBER);
          else if (face && (Math.abs(dy) <= 1 || Math.abs(dz) <= 1)) this.at(x, y, z, hub);
          else if (!face && d2 <= 1.2) this.at(x, y, z, STEEL_D);
        }
      }
    }
  }
}

function interceptor(body: number, trim: number) {
  const vol = new Vol();
  vol.box(-5, 5, 4, 6, -14, 12, body);
  vol.box(-4, 4, 4, 5, 12, 16, body);
  vol.box(-3, 3, 5, 6, 13, 16, trim);
  vol.box(-4, 4, 7, 10, -2, 8, body);
  vol.box(-3, 3, 8, 9, 5, 8, GLASS);
  vol.box(-4, 4, 6, 7, 8, 13, body);
  vol.box(-2, 2, 7, 9, 3, 8, STEEL);
  vol.box(-1, 1, 9, 10, 4, 7, BRASS);
  vol.box(-6, 6, 8, 9, -14, -11, STEEL_D);
  vol.box(-5, 5, 3, 4, -12, 10, INK);
  vol.box(-6, -5, 5, 6, -8, 8, trim);
  vol.box(5, 6, 5, 6, -8, 8, trim);
  vol.box(-7, -6, 5, 7, 4, 13, INK);
  vol.box(6, 7, 5, 7, 4, 13, INK);
  vol.box(-1, 1, 6, 6, 14, 16, AMBER, 1);
  vol.at(-4, 5, 16, AMBER, 1);
  vol.at(4, 5, 16, AMBER, 1);
  vol.at(-3, 5, 16, AMBER, 1);
  vol.at(3, 5, 16, AMBER, 1);
  vol.at(-4, 5, -14, REDL, 1);
  vol.at(4, 5, -14, REDL, 1);
  vol.at(-3, 6, -14, REDL, 1);
  vol.at(3, 6, -14, REDL, 1);
  for (const x of [-5, -2, 0, 2, 5]) {
    for (let i = 0; i < 4; i++) vol.at(x, 4 + (i > 2 ? 1 : 0), 16 + i, BONE);
  }
  vol.box(-5, -4, 7, 8, -13, -12, STEEL);
  vol.box(4, 5, 7, 8, -13, -12, STEEL);
  vol.box(-1, 1, 10, 12, 0, 1, body);
  vol.wheel(-6, 4, -9, 4, 1, STEEL);
  vol.wheel(6, 4, -9, 4, 1, STEEL);
  vol.wheel(-6, 3, 10, 3, 1, BRASS);
  vol.wheel(6, 3, 10, 3, 1, BRASS);
  return vol.v;
}

function warRig() {
  const vol = new Vol();
  const cab = 0x3a342c;
  const tank = 0x5c6044;
  vol.box(-5, 5, 4, 8, 2, 16, cab);
  vol.box(-4, 4, 8, 12, 4, 12, cab);
  vol.box(-3, 3, 10, 11, 8, 12, GLASS);
  vol.box(-6, 6, 5, 11, -26, 2, tank);
  vol.box(-6, 6, 11, 12, -22, -2, RUST);
  vol.box(-7, 7, 6, 7, -24, 0, STEEL_D);
  vol.box(-2, 2, 12, 18, 6, 8, INK);
  vol.box(-4, -3, 12, 17, 5, 7, INK);
  vol.box(3, 4, 12, 17, 5, 7, INK);
  vol.at(-2, 18, 7, AMBER, 1);
  vol.at(2, 18, 7, 0x665544);
  vol.box(-6, 6, 3, 5, 14, 17, STEEL);
  for (const x of [-5, -2, 2, 5]) {
    for (let i = 0; i < 4; i++) vol.at(x, 4, 17 + i, BONE);
  }
  vol.at(-4, 6, 16, AMBER, 1);
  vol.at(4, 6, 16, AMBER, 1);
  vol.at(-3, 7, -26, REDL, 1);
  vol.at(3, 7, -26, REDL, 1);
  for (const z of [-22, -16, -10, -4]) {
    vol.at(-6, 8, z, BONE);
    vol.at(6, 8, z, BONE);
    vol.at(-7, 7, z, BONE);
    vol.at(7, 7, z, BONE);
  }
  vol.box(-7, -6, 6, 8, 6, 12, INK);
  vol.box(6, 7, 6, 8, 6, 12, INK);
  const hubs = BRASS;
  vol.wheel(-6, 4, 12, 3, 1, hubs);
  vol.wheel(6, 4, 12, 3, 1, hubs);
  for (const z of [-6, -14, -22]) {
    vol.wheel(-6, 4, z, 4, 1, STEEL);
    vol.wheel(6, 4, z, 4, 1, STEEL);
  }
  return vol.v;
}

function buggy(body: number, cage: number) {
  const vol = new Vol();
  vol.box(-5, 5, 3, 4, -12, 12, body);
  vol.box(-4, 4, 4, 5, -8, 10, STEEL_D);
  vol.box(-1, 1, 4, 5, -4, 6, 0x6a3030);
  vol.box(-5, -4, 5, 9, -6, -5, cage);
  vol.box(4, 5, 5, 9, -6, -5, cage);
  vol.box(-5, -4, 5, 9, 4, 5, cage);
  vol.box(4, 5, 5, 9, 4, 5, cage);
  vol.box(-5, 5, 9, 10, -6, 5, cage);
  vol.box(-3, 3, 5, 8, -12, -8, STEEL);
  vol.box(-2, 2, 6, 8, -11, -9, RUST);
  vol.box(-6, 6, 4, 5, 11, 14, STEEL_D);
  for (const x of [-4, 0, 4]) {
    for (let i = 0; i < 3; i++) vol.at(x, 5, 14 + i, BONE);
  }
  vol.at(-3, 5, 13, AMBER, 1);
  vol.at(3, 5, 13, AMBER, 1);
  vol.at(-2, 4, -12, REDL, 1);
  vol.at(2, 4, -12, REDL, 1);
  vol.box(-6, -5, 5, 6, 2, 8, INK);
  vol.box(5, 6, 5, 6, 2, 8, INK);
  vol.wheel(-6, 4, -8, 5, 1, STEEL);
  vol.wheel(6, 4, -8, 5, 1, STEEL);
  vol.wheel(-5, 3, 8, 3, 1, BRASS);
  vol.wheel(5, 3, 8, 3, 1, BRASS);
  return vol.v;
}

function drum(color: number, lit: boolean) {
  const vol = new Vol();
  for (let y = 0; y <= 8; y++) {
    for (let x = -3; x <= 3; x++) {
      for (let z = -3; z <= 3; z++) {
        if (x * x + z * z > 10) continue;
        const band = y === 2 || y === 6;
        const top = lit && y >= 7;
        vol.at(x, y, z, top ? AMBER : band ? BONE : color, top ? 1 : 0);
      }
    }
  }
  return vol.v;
}

function rock() {
  const vol = new Vol();
  const rad = 6;
  for (let x = -rad; x <= rad; x++) {
    for (let z = -rad; z <= rad; z++) {
      const d = Math.sqrt(x * x + z * z) / rad;
      if (d > 1) continue;
      const h = Math.max(1, Math.round((1 - d) * (6 + ((x * 3 + z) & 3))));
      for (let y = 0; y < h; y++) {
        const c = (x + z + y) % 5 === 0 ? 0x8d7868 : 0x6a5646;
        vol.at(x, y, z, c);
      }
    }
  }
  return vol.v;
}

function tree() {
  const vol = new Vol();
  vol.box(-1, 1, 0, 14, -1, 1, 0x3a2a22);
  vol.box(0, 0, 8, 12, 1, 6, 0x2e241c);
  vol.box(-6, -1, 10, 12, 0, 1, 0x2a221c);
  vol.box(1, 5, 7, 9, -1, 0, 0x322820);
  vol.box(-2, 2, 13, 16, -2, 2, 0x1e1a16);
  return vol.v;
}

function tower() {
  const vol = new Vol();
  for (const x of [-3, 3]) {
    for (const z of [-3, 3]) vol.box(x, x, 0, 18, z, z, STEEL_D);
  }
  vol.box(-4, 4, 16, 17, -4, 4, 0x5a4034);
  vol.box(-2, 2, 18, 20, -2, 2, INK);
  vol.at(0, 20, 2, AMBER, 1);
  vol.box(-4, 4, 8, 8, -4, 4, 0x4a342c);
  return vol.v;
}

function wall() {
  const vol = new Vol();
  vol.box(-12, 12, 0, 3, -1, 1, 0x5a463c);
  vol.box(-12, 12, 3, 4, -1, 1, RUST);
  for (let x = -10; x <= 10; x += 4) {
    vol.box(x, x, 4, 8, 0, 2, BONE);
  }
  return vol.v;
}

function spikePlate() {
  const vol = new Vol();
  vol.box(-14, 14, 0, 1, -1, 1, STEEL_D);
  for (let x = -12; x <= 12; x += 3) {
    vol.at(x, 2, 0, BONE);
    vol.at(x, 3, 0, BONE);
    vol.at(x, 4, 1, BONE);
  }
  return vol.v;
}

function wreck() {
  const vol = new Vol();
  vol.box(-5, 5, 1, 3, -10, 8, 0x2a2420);
  vol.box(-4, 4, 3, 5, -2, 4, 0x1a1614);
  vol.box(-3, 0, 3, 4, 5, 9, RUST);
  vol.wheel(-6, 3, -6, 3, 1, STEEL_D);
  vol.wheel(5, 2, 4, 3, 1, 0x3a2a24);
  vol.at(-3, 3, -10, REDL, 1);
  vol.at(2, 4, 6, AMBER, 1);
  return vol.v;
}

function tires() {
  const vol = new Vol();
  vol.wheel(0, 3, 0, 3, 1, STEEL_D);
  vol.wheel(-2, 6, 1, 3, 1, STEEL);
  vol.wheel(2, 5, -1, 3, 1, STEEL_D);
  return vol.v;
}

function post() {
  const vol = new Vol();
  vol.box(-2, 2, 0, 16, -2, 2, 0x4a3830);
  vol.box(-3, 3, 14, 16, -3, 3, RUST);
  vol.at(0, 16, 0, AMBER, 1);
  return vol.v;
}

function beam() {
  const vol = new Vol();
  vol.box(-22, 22, 14, 16, -1, 1, 0x3a3028);
  vol.box(-18, 18, 16, 17, -1, 1, RUST);
  for (let x = -16; x <= 16; x += 8) vol.at(x, 15, -1, AMBER, 1);
  vol.box(-8, 8, 12, 13, -1, 1, BONE);
  return vol.v;
}

function pipe() {
  const vol = new Vol();
  vol.box(-2, 2, 0, 2, -4, 4, STEEL_D);
  vol.box(-1, 1, 2, 5, -1, 1, INK);
  vol.at(0, 5, 0, AMBER, 1);
  return vol.v;
}

export function bake(id: string, voxels: Vox[], vu: number, guns: Mount[] = [], exhausts: Mount[] = []): Baked {
  const map = new Map<string, Vox>();
  let maxX = 1;
  let maxZ = 1;
  let maxY = 0;
  for (const v of voxels) {
    map.set(`${v.x},${v.y},${v.z}`, v);
    maxX = Math.max(maxX, Math.abs(v.x));
    maxZ = Math.max(maxZ, Math.abs(v.z));
    maxY = Math.max(maxY, v.y);
  }
  const R = Math.max(maxX, maxZ) + 1;
  const size = R * 2 + 1;
  const slices: (HTMLCanvasElement | null)[] = [];
  const glow: (HTMLCanvasElement | null)[] = [];
  let hasGlow = false;
  for (let y = 0; y <= maxY; y++) {
    const cvs = document.createElement("canvas");
    cvs.width = size;
    cvs.height = size;
    const gctx = cvs.getContext("2d");
    if (!gctx) {
      slices.push(null);
      glow.push(null);
      continue;
    }
    const img = gctx.createImageData(size, size);
    const gcvs = document.createElement("canvas");
    gcvs.width = size;
    gcvs.height = size;
    const gg = gcvs.getContext("2d");
    const gimg = gg?.createImageData(size, size) ?? null;
    let any = false;
    let anyG = false;
    for (const v of map.values()) {
      if (v.y !== y) continue;
      const px = v.x + R;
      const py = R - v.z;
      if (px < 0 || py < 0 || px >= size || py >= size) continue;
      const buried = map.has(`${v.x},${v.y + 1},${v.z}`);
      const col = v.g ? v.c : shade(v.c, buried ? 0.74 : 1.16);
      const i = (py * size + px) * 4;
      img.data[i] = (col >> 16) & 255;
      img.data[i + 1] = (col >> 8) & 255;
      img.data[i + 2] = col & 255;
      img.data[i + 3] = 255;
      any = true;
      if (v.g && gimg) {
        gimg.data[i] = Math.min(255, ((col >> 16) & 255) + 40);
        gimg.data[i + 1] = (col >> 8) & 255;
        gimg.data[i + 2] = col & 255;
        gimg.data[i + 3] = 230;
        anyG = true;
        hasGlow = true;
      }
    }
    if (any) {
      gctx.putImageData(img, 0, 0);
      slices.push(cvs);
    } else slices.push(null);
    if (anyG && gg && gimg) {
      gg.putImageData(gimg, 0, 0);
      glow.push(gcvs);
    } else glow.push(null);
  }
  return { id, slices, glow, ox: R, oy: R, vu, layers: maxY + 1, guns, exhausts, hasGlow };
}

export type ModelSet = Record<string, Baked>;

export function bakeAll(): ModelSet {
  const gunsI = [
    { x: -6, y: 6, z: 14 },
    { x: 6, y: 6, z: 14 },
  ];
  const exI = [
    { x: -2, y: 5, z: -15 },
    { x: 2, y: 5, z: -15 },
  ];
  return {
    black: bake("black", interceptor(0x1c1b19, RUST), 0.16, gunsI, exI),
    red: bake("red", interceptor(0x7a2822, 0x1a120e), 0.16, gunsI, exI),
    bone: bake("bone", interceptor(0xd5c4a4, 0x3a3228), 0.16, gunsI, exI),
    rig: bake(
      "rig",
      warRig(),
      0.15,
      [
        { x: -4, y: 7, z: 16 },
        { x: 4, y: 7, z: 16 },
      ],
      [
        { x: -3, y: 6, z: -26 },
        { x: 3, y: 6, z: -26 },
      ],
    ),
    buggy: bake(
      "buggy",
      buggy(0xc4a36a, 0xe6d3b0),
      0.16,
      [
        { x: -5, y: 5, z: 12 },
        { x: 5, y: 5, z: 12 },
      ],
      [{ x: 0, y: 6, z: -12 }],
    ),
    buggy2: bake(
      "buggy2",
      buggy(0x8a3a28, 0x1a1614),
      0.16,
      [
        { x: -5, y: 5, z: 12 },
        { x: 5, y: 5, z: 12 },
      ],
      [{ x: 0, y: 6, z: -12 }],
    ),
    drum: bake("drum", drum(RUST, false), 0.28),
    barrel: bake("barrel", drum(0x6e3018, true), 0.28),
    rock: bake("rock", rock(), 0.34),
    tree: bake("tree", tree(), 0.22),
    tower: bake("tower", tower(), 0.2),
    wall: bake("wall", wall(), 0.2),
    spike: bake("spike", spikePlate(), 0.18),
    wreck: bake("wreck", wreck(), 0.17),
    tires: bake("tires", tires(), 0.22),
    post: bake("post", post(), 0.22),
    beam: bake("beam", beam(), 0.32),
    pipe: bake("pipe", pipe(), 0.24),
  };
}

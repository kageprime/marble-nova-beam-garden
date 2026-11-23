import { forward, lerpAngle } from "@/game/math";
import type { Baked, ModelSet } from "@/game/models";
import type { Bullet, Car, Particle, Strip } from "@/game/sim";
import { HALF_WIDTH, WORLD_MIN, WORLD_SIZE, type Prop, type Track } from "@/game/track";

export type Cam = {
  x: number;
  z: number;
  yaw: number;
  zoom: number;
  vScale: number;
  baseY: number;
  panX: number;
  shake: number;
};

export function makeCam(): Cam {
  return { x: 0, z: 0, yaw: 0, zoom: 40, vScale: 0.52, baseY: 0.68, panX: 0, shake: 0 };
}

export function snapCam(cam: Cam, car: { x: number; z: number; yaw: number }) {
  cam.x = car.x;
  cam.z = car.z;
  cam.yaw = car.yaw;
  cam.zoom = 40;
  cam.shake = 0;
}

export function followCam(cam: Cam, car: { x: number; z: number; yaw: number }, dt: number, speed: number) {
  const k = 1 - Math.exp(-4.6 * dt);
  cam.yaw = lerpAngle(cam.yaw, car.yaw, k);
  const p = 1 - Math.exp(-6 * dt);
  cam.x += (car.x - cam.x) * p;
  cam.z += (car.z - cam.z) * p;
  const target = 42 - Math.min(8, Math.abs(speed) * 0.14);
  cam.zoom += (target - cam.zoom) * (1 - Math.exp(-2.4 * dt));
}

type Item =
  | { kind: "model"; depth: number; model: Baked; x: number; z: number; yaw: number; alpha: number; hp: number; maxHp: number; name: string; bar: boolean; player: boolean }
  | { kind: "part"; depth: number; x: number; z: number; y: number; color: string; size: number; alpha: number }
  | { kind: "bolt"; depth: number; x: number; z: number; x2: number; z2: number; color: string };

export function drawFrame(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  dpr: number,
  time: number,
  cam: Cam,
  track: Track,
  models: ModelSet,
  opts: {
    mode: "menu" | "race";
    narrow: boolean;
    reduce: boolean;
    menuYaw: number;
    showModel: string;
    cars: Car[];
    props: Prop[];
    strips: Strip[];
    particles: Particle[];
    bullets: Bullet[];
    speed: number;
    nitro: boolean;
    hurt: number;
  },
) {
  const shake = opts.reduce ? 0 : cam.shake;
  const sx = Math.sin(time * 47) * shake;
  const sy = Math.cos(time * 41) * shake * 0.65;
  const look = opts.mode === "menu" ? (opts.narrow ? 0.4 : 1.2) : 7.4 + Math.min(4.5, Math.abs(opts.speed) * 0.06);
  const f = forward(cam.yaw);
  const focus = { x: cam.x + f.x * look, z: cam.z + f.z * look };
  cam.baseY = opts.mode === "menu" ? (opts.narrow ? 0.34 : 0.48) : 0.7;
  cam.panX = opts.mode === "menu" && !opts.narrow ? w * 0.16 : 0;
  cam.vScale = 0.52;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#2a120e");
  sky.addColorStop(0.42, "#a85a32");
  sky.addColorStop(0.7, "#e0a15a");
  sky.addColorStop(1, "#8a5a34");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  const rx = Math.cos(cam.yaw);
  const rz = -Math.sin(cam.yaw);
  const fx = -Math.sin(cam.yaw);
  const fz = -Math.cos(cam.yaw);
  const zoom = cam.zoom;
  const v = cam.vScale;
  const a = rx * zoom;
  const b = -fx * zoom * v;
  const c = rz * zoom;
  const d = -fz * zoom * v;
  const e = w * 0.5 + cam.panX + sx - (focus.x * rx + focus.z * rz) * zoom;
  const fterm = h * cam.baseY + sy + (focus.x * fx + focus.z * fz) * zoom * v;
  ctx.imageSmoothingEnabled = true;
  ctx.setTransform(a * dpr, b * dpr, c * dpr, d * dpr, e * dpr, fterm * dpr);
  ctx.drawImage(track.ground, WORLD_MIN, WORLD_MIN, WORLD_SIZE, WORLD_SIZE);
  ctx.drawImage(track.decals, WORLD_MIN, WORLD_MIN, WORLD_SIZE, WORLD_SIZE);

  const project = (wx: number, wz: number) => {
    const dx = wx - focus.x;
    const dz = wz - focus.z;
    const right = dx * rx + dz * rz;
    const depth = dx * fx + dz * fz;
    return {
      x: w * 0.5 + cam.panX + sx + right * zoom,
      y: h * cam.baseY + sy - depth * zoom * v,
      depth,
    };
  };

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = false;
  const items: Item[] = [];

  const pushModel = (
    model: Baked,
    x: number,
    z: number,
    yaw: number,
    alpha: number,
    hp: number,
    maxHp: number,
    name: string,
    bar: boolean,
    player: boolean,
  ) => {
    const p = project(x, z);
    if (p.x < -380 || p.x > w + 380 || p.y < -320 || p.y > h + 240) return;
    items.push({ kind: "model", depth: p.depth, model, x, z, yaw, alpha, hp, maxHp, name, bar, player });
  };

  for (const prop of opts.props) {
    if (prop.dead) continue;
    const model = models[prop.model];
    if (!model) continue;
    pushModel(model, prop.x, prop.z, prop.yaw, 1, prop.hp, prop.maxHp, "", false, false);
  }

  if (opts.mode === "menu") {
    const sp = track.spawns[0]!;
    const show = models[opts.showModel] ?? models.black!;
    pushModel(show, sp.x, sp.z, opts.menuYaw, 1, 1, 1, "", false, false);
    const aCar = track.samples[30]!;
    const bCar = track.samples[40]!;
    if (models.rig) pushModel(models.rig, aCar.x + aCar.nx * 2.2, aCar.z + aCar.nz * 2.2, Math.atan2(-aCar.tx, -aCar.tz), 1, 1, 1, "", false, false);
    if (models.buggy2) pushModel(models.buggy2, bCar.x - bCar.nx * 2, bCar.z - bCar.nz * 2, Math.atan2(-bCar.tx, -bCar.tz), 1, 1, 1, "", false, false);
  } else {
    for (const car of opts.cars) {
      if (!car.alive) continue;
      const model = models[car.model] ?? models.black!;
      let alpha = 1;
      if (car.invuln > 0 && Math.sin(time * 28) > 0) alpha = 0.45;
      if (car.finished) alpha = 0.75;
      pushModel(model, car.x, car.z, car.yaw, alpha, car.hp, car.maxHp, car.name, true, car.isPlayer);
    }
    const spike = models.spike;
    if (spike) {
      for (const strip of opts.strips) {
        pushModel(spike, strip.x, strip.z, strip.yaw, Math.min(1, strip.life), 1, 1, "", false, false);
      }
    }
    for (const p of opts.particles) {
      const pr = project(p.x, p.z);
      if (pr.x < -40 || pr.x > w + 40 || pr.y < -40 || pr.y > h + 40) continue;
      items.push({
        kind: "part",
        depth: pr.depth,
        x: p.x,
        z: p.z,
        y: p.y,
        color: p.color,
        size: p.size,
        alpha: Math.max(0, p.life / p.max),
      });
    }
    for (const b of opts.bullets) {
      const pr = project(b.x, b.z);
      items.push({
        kind: "bolt",
        depth: pr.depth,
        x: b.x,
        z: b.z,
        x2: b.x - b.vx * 0.04,
        z2: b.z - b.vz * 0.04,
        color: b.color,
      });
    }
  }

  items.sort((u, v) => v.depth - u.depth);
  const liftK = 0.8;
  for (const item of items) {
    if (item.kind === "part") {
      const p = project(item.x, item.z);
      const rise = item.y * zoom * liftK;
      ctx.globalAlpha = item.alpha;
      ctx.fillStyle = item.color;
      ctx.fillRect(p.x - item.size * 0.5, p.y - rise, item.size, item.size);
      ctx.globalAlpha = 1;
      continue;
    }
    if (item.kind === "bolt") {
      const p1 = project(item.x, item.z);
      const p2 = project(item.x2, item.z2);
      ctx.strokeStyle = item.color;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
      continue;
    }
    const p = project(item.x, item.z);
    const model = item.model;
    const px = model.vu * zoom;
    const lift = px * liftK;
    ctx.save();
    ctx.globalAlpha = 0.32 * item.alpha;
    ctx.fillStyle = "#140e0a";
    ctx.beginPath();
    const shadow = Math.max(10, model.ox * px * 0.42);
    ctx.ellipse(p.x, p.y, shadow, shadow * 0.38, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.globalAlpha = item.alpha;
    for (let i = 0; i < model.layers; i++) {
      const slice = model.slices[i];
      if (!slice) continue;
      ctx.save();
      ctx.translate(p.x, p.y - i * lift);
      ctx.rotate(cam.yaw - item.yaw);
      ctx.scale(px, px * v);
      ctx.drawImage(slice, -model.ox, -model.oy);
      ctx.restore();
    }
    if (model.hasGlow) {
      const pulse = 0.55 + 0.45 * Math.sin(time * 7 + item.x);
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = item.alpha * pulse;
      for (let i = 0; i < model.layers; i++) {
        const g = model.glow[i];
        if (!g) continue;
        ctx.save();
        ctx.translate(p.x, p.y - i * lift);
        ctx.rotate(cam.yaw - item.yaw);
        ctx.scale(px, px * v);
        ctx.drawImage(g, -model.ox, -model.oy);
        ctx.restore();
      }
      ctx.restore();
    }
    ctx.globalAlpha = 1;
    if (item.bar && item.name) {
      const top = p.y - (model.layers - 1) * lift - 16;
      ctx.font = "700 13px Barlow Condensed, Arial Narrow, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const label = item.player ? "YOU" : item.name;
      const tw = ctx.measureText(label).width;
      ctx.fillStyle = "rgba(18,12,9,0.72)";
      ctx.fillRect(p.x - tw / 2 - 5, top - 7, tw + 10, 14);
      ctx.fillStyle = item.player ? "#e2a23a" : "#f3e6d0";
      ctx.fillText(label, p.x, top);
      const ratio = Math.max(0, item.hp / item.maxHp);
      ctx.fillStyle = "#1a120e";
      ctx.fillRect(p.x - 16, top + 10, 32, 3);
      ctx.fillStyle = ratio < 0.35 ? "#d2452d" : item.player ? "#e2a23a" : "#c4512a";
      ctx.fillRect(p.x - 16, top + 10, 32 * ratio, 3);
    }
  }

  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const fog = ctx.createLinearGradient(0, 0, 0, h * 0.48);
  fog.addColorStop(0, "rgba(42,18,12,0.55)");
  fog.addColorStop(1, "rgba(42,18,12,0)");
  ctx.fillStyle = fog;
  ctx.fillRect(0, 0, w, h * 0.48);
  const vig = ctx.createRadialGradient(w * 0.5, h * 0.55, h * 0.2, w * 0.5, h * 0.5, h * 0.72);
  vig.addColorStop(0, "rgba(0,0,0,0)");
  vig.addColorStop(1, "rgba(12,6,4,0.55)");
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);
  if (opts.hurt > 0.62) {
    ctx.fillStyle = `rgba(160,32,18,${(opts.hurt - 0.62) * 0.55})`;
    ctx.fillRect(0, 0, w, h);
  }
  if (opts.nitro && opts.mode === "race") {
    ctx.strokeStyle = "rgba(255,176,64,0.35)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 7; i++) {
      const y = h * (0.55 + ((time * 1.4 + i * 0.17) % 1) * 0.45);
      ctx.beginPath();
      ctx.moveTo(8, y);
      ctx.lineTo(28 + (i % 3) * 10, y - 16);
      ctx.stroke();
    }
  }

  if (opts.mode === "race") drawMini(ctx, w, track, opts.cars, opts.narrow);
}

function drawMini(ctx: CanvasRenderingContext2D, w: number, track: Track, cars: Car[], narrow: boolean) {
  const mw = narrow ? 104 : 142;
  const mh = narrow ? 78 : 100;
  const x = w - mw - 12;
  const y = narrow ? 62 : 68;
  ctx.fillStyle = "rgba(18,12,9,0.78)";
  ctx.fillRect(x, y, mw, mh);
  ctx.strokeStyle = "#4a3428";
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, y + 0.5, mw - 1, mh - 1);
  let minX = Infinity;
  let maxX = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;
  for (const s of track.samples) {
    minX = Math.min(minX, s.x);
    maxX = Math.max(maxX, s.x);
    minZ = Math.min(minZ, s.z);
    maxZ = Math.max(maxZ, s.z);
  }
  const pad = 8;
  const sx = (mw - pad * 2) / (maxX - minX || 1);
  const sz = (mh - pad * 2) / (maxZ - minZ || 1);
  const sc = Math.min(sx, sz);
  const ox = x + mw / 2 - ((minX + maxX) / 2) * sc;
  const oz = y + mh / 2 - ((minZ + maxZ) / 2) * sc;
  ctx.beginPath();
  const s0 = track.samples[0]!;
  ctx.moveTo(ox + s0.x * sc, oz + s0.z * sc);
  for (const s of track.samples) ctx.lineTo(ox + s.x * sc, oz + s.z * sc);
  ctx.closePath();
  ctx.strokeStyle = "#c4512a";
  ctx.lineWidth = Math.max(2, HALF_WIDTH * sc * 0.35);
  ctx.stroke();
  ctx.strokeStyle = "#3a322c";
  ctx.lineWidth = Math.max(1, HALF_WIDTH * sc * 0.55);
  ctx.stroke();
  for (const car of cars) {
    ctx.fillStyle = car.isPlayer ? "#e2a23a" : car.alive ? "#f3e6d0" : "#d2452d";
    ctx.fillRect(ox + car.x * sc - 1.5, oz + car.z * sc - 1.5, 3, 3);
  }
}

export function primeMenuCam(cam: Cam, track: Track) {
  const sp = track.spawns[0]!;
  cam.x = sp.x;
  cam.z = sp.z;
  cam.yaw = sp.yaw;
  cam.zoom = 46;
}

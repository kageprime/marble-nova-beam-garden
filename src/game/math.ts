export function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}

export function wrap(a: number) {
  let x = a;
  while (x > Math.PI) x -= Math.PI * 2;
  while (x < -Math.PI) x += Math.PI * 2;
  return x;
}

export function lerpAngle(a: number, b: number, t: number) {
  return a + wrap(b - a) * t;
}

/** yaw 0 faces world −Z. +yaw turns the nose toward −X (left on a chase cam). */
export function forward(yaw: number) {
  return { x: -Math.sin(yaw), z: -Math.cos(yaw) };
}

export function right(yaw: number) {
  return { x: Math.cos(yaw), z: -Math.sin(yaw) };
}

export function hypot(x: number, z: number) {
  return Math.hypot(x, z);
}

export function shade(hex: number, m: number) {
  const r = Math.max(0, Math.min(255, Math.round(((hex >> 16) & 255) * m)));
  const g = Math.max(0, Math.min(255, Math.round(((hex >> 8) & 255) * m)));
  const b = Math.max(0, Math.min(255, Math.round((hex & 255) * m)));
  return (r << 16) | (g << 8) | b;
}

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function segmentsIntersect(
  ax: number,
  az: number,
  bx: number,
  bz: number,
  cx: number,
  cz: number,
  dx: number,
  dz: number,
) {
  const rx = bx - ax;
  const rz = bz - az;
  const sx = dx - cx;
  const sz = dz - cz;
  const den = rx * sz - rz * sx;
  if (Math.abs(den) < 1e-8) return false;
  const qx = cx - ax;
  const qz = cz - az;
  const t = (qx * sz - qz * sx) / den;
  const u = (qx * rz - qz * rx) / den;
  return t >= 0 && t <= 1 && u >= 0 && u <= 1;
}

export function formatTime(t: number) {
  if (!Number.isFinite(t) || t < 0) return "—:—";
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  const cs = Math.floor((t % 1) * 100);
  return `${m}:${s.toString().padStart(2, "0")}.${cs.toString().padStart(2, "0")}`;
}

export function ordinal(n: number) {
  const j = n % 10;
  const k = n % 100;
  if (j === 1 && k !== 11) return `${n}ST`;
  if (j === 2 && k !== 12) return `${n}ND`;
  if (j === 3 && k !== 13) return `${n}RD`;
  return `${n}TH`;
}

export type ControlsProbe = {
  getYaw: () => number;
  getSpeed: () => number;
  setKeys?: (codes: string[]) => void;
  setSteer?: (v: number) => void;
};

declare global {
  interface Window {
    __controlsTest?: ControlsProbe;
  }
}

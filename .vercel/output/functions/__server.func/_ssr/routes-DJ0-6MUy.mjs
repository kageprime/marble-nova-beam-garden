import { i as __toESM } from "../_runtime.mjs";
import { K as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Play, c as Flame, i as RotateCcw, l as Flag, n as Volume2, o as Pause, s as Gauge, t as VolumeX, u as Crosshair } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DJ0-6MUy.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function clamp(v, a, b) {
	return Math.max(a, Math.min(b, v));
}
function wrap(a) {
	let x = a;
	while (x > Math.PI) x -= Math.PI * 2;
	while (x < -Math.PI) x += Math.PI * 2;
	return x;
}
function lerpAngle(a, b, t) {
	return a + wrap(b - a) * t;
}
/** yaw 0 faces world −Z. +yaw turns the nose toward −X (left on a chase cam). */
function forward(yaw) {
	return {
		x: -Math.sin(yaw),
		z: -Math.cos(yaw)
	};
}
function right(yaw) {
	return {
		x: Math.cos(yaw),
		z: -Math.sin(yaw)
	};
}
function hypot(x, z) {
	return Math.hypot(x, z);
}
function shade(hex, m) {
	const r = Math.max(0, Math.min(255, Math.round((hex >> 16 & 255) * m)));
	const g = Math.max(0, Math.min(255, Math.round((hex >> 8 & 255) * m)));
	const b = Math.max(0, Math.min(255, Math.round((hex & 255) * m)));
	return r << 16 | g << 8 | b;
}
function mulberry32(seed) {
	let a = seed >>> 0;
	return () => {
		a |= 0;
		a = a + 1831565813 | 0;
		let t = Math.imul(a ^ a >>> 15, 1 | a);
		t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
		return ((t ^ t >>> 14) >>> 0) / 4294967296;
	};
}
function segmentsIntersect(ax, az, bx, bz, cx, cz, dx, dz) {
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
function formatTime(t) {
	if (!Number.isFinite(t) || t < 0) return "—:—";
	const m = Math.floor(t / 60);
	const s = Math.floor(t % 60);
	const cs = Math.floor(t % 1 * 100);
	return `${m}:${s.toString().padStart(2, "0")}.${cs.toString().padStart(2, "0")}`;
}
function ordinal(n) {
	const j = n % 10;
	const k = n % 100;
	if (j === 1 && k !== 11) return `${n}ST`;
	if (j === 2 && k !== 12) return `${n}ND`;
	if (j === 3 && k !== 13) return `${n}RD`;
	return `${n}TH`;
}
var WORLD_MIN = -200;
var TEX = 1400;
var RAW = [
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
	[-22, -90]
];
function catmull(pts, per) {
	const n = pts.length;
	const out = [];
	for (let i = 0; i < n; i++) {
		const p0 = pts[(i - 1 + n) % n];
		const p1 = pts[i];
		const p2 = pts[(i + 1) % n];
		const p3 = pts[(i + 2) % n];
		for (let s = 0; s < per; s++) {
			const t = s / per;
			const t2 = t * t;
			const t3 = t2 * t;
			const x = .5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3);
			const z = .5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3);
			out.push({
				x,
				z
			});
		}
	}
	return out;
}
function heading(tx, tz) {
	return Math.atan2(-tx, -tz);
}
function worldToTex(x, z) {
	const s = TEX / 400;
	return [(x - WORLD_MIN) * s, (z - WORLD_MIN) * s];
}
function hash(x, y) {
	let n = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263);
	n = Math.imul(n ^ n >>> 13, 1274126177);
	return ((n ^ n >>> 16) >>> 0) / 4294967296;
}
function noise(x, y) {
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
	return a + (v01 + (v11 - v01) * sx - a) * sy;
}
function paintGround(samples) {
	const cvs = document.createElement("canvas");
	cvs.width = TEX;
	cvs.height = TEX;
	const ctx = cvs.getContext("2d");
	if (!ctx) return cvs;
	const img = ctx.createImageData(TEX, TEX);
	const data = img.data;
	const step = 2;
	for (let y = 0; y < TEX; y += step) for (let x = 0; x < TEX; x += step) {
		const wx = WORLD_MIN + x / TEX * 400;
		const wz = WORLD_MIN + y / TEX * 400;
		const n = noise(wx * .045, wz * .045) * .7 + noise(wx * .15, wz * .15) * .3;
		const grit = hash(x, y);
		const r = 146 + n * 48 + grit * 10;
		const g = 108 + n * 32 + grit * 6;
		const b = 66 + n * 18;
		for (let oy = 0; oy < step; oy++) for (let ox = 0; ox < step; ox++) {
			const i = ((y + oy) * TEX + (x + ox)) * 4;
			data[i] = r;
			data[i + 1] = g;
			data[i + 2] = b;
			data[i + 3] = 255;
		}
	}
	ctx.putImageData(img, 0, 0);
	const scale = TEX / 400;
	const path = new Path2D();
	const p0 = worldToTex(samples[0].x, samples[0].z);
	path.moveTo(p0[0], p0[1]);
	for (let i = 1; i < samples.length; i++) {
		const p = worldToTex(samples[i].x, samples[i].z);
		path.lineTo(p[0], p[1]);
	}
	path.closePath();
	ctx.lineJoin = "round";
	ctx.lineCap = "round";
	ctx.strokeStyle = "#6e533c";
	ctx.lineWidth = 21.2 * scale;
	ctx.stroke(path);
	ctx.strokeStyle = "#3a322c";
	ctx.lineWidth = 18 * scale;
	ctx.stroke(path);
	ctx.strokeStyle = "#c4512a";
	ctx.lineWidth = .55 * scale;
	ctx.stroke(path);
	ctx.setLineDash([2.4 * scale, 3.4 * scale]);
	ctx.strokeStyle = "#e6d3b0";
	ctx.lineWidth = .28 * scale;
	ctx.stroke(path);
	ctx.setLineDash([]);
	const s = samples[0];
	ctx.save();
	const tp = worldToTex(s.x, s.z);
	ctx.translate(tp[0], tp[1]);
	const ang = Math.atan2(s.nx, s.tx);
	ctx.rotate(ang);
	const cell = 9 * scale * 2 / 10;
	for (let i = 0; i < 10; i++) {
		ctx.fillStyle = i % 2 === 0 ? "#f3e6d0" : "#1a1614";
		ctx.fillRect(-31.5 + i * cell, -.7 * scale, 6.8, 1.4 * scale);
	}
	ctx.restore();
	ctx.fillStyle = "rgba(30, 22, 16, 0.35)";
	const rnd = mulberry32(9);
	for (let i = 0; i < 18; i++) {
		const sm = samples[Math.floor(rnd() * samples.length)];
		const lat = (rnd() - .5) * 9 * 1.4;
		const px = worldToTex(sm.x + sm.nx * lat, sm.z + sm.nz * lat);
		ctx.beginPath();
		ctx.ellipse(px[0], px[1], (1.2 + rnd() * 2) * scale, (.8 + rnd()) * scale, rnd() * 3, 0, Math.PI * 2);
		ctx.fill();
	}
	return cvs;
}
function nearestDist(samples, x, z) {
	let best = Infinity;
	for (const s of samples) {
		const d = (s.x - x) ** 2 + (s.z - z) ** 2;
		if (d < best) best = d;
	}
	return Math.sqrt(best);
}
function buildTrack() {
	const pts = catmull(RAW, 10);
	const samples = pts.map((p, i) => {
		const n = pts[(i + 1) % pts.length];
		const prev = pts[(i - 1 + pts.length) % pts.length];
		let tx = n.x - prev.x;
		let tz = n.z - prev.z;
		const mag = Math.hypot(tx, tz) || 1;
		tx /= mag;
		tz /= mag;
		return {
			x: p.x,
			z: p.z,
			tx,
			tz,
			nx: -tz,
			nz: tx
		};
	});
	const gates = [];
	for (let k = 0; k < 8; k++) {
		const sample = Math.floor(k * samples.length / 8) % samples.length;
		const s = samples[sample];
		gates.push({
			index: k,
			sample,
			ax: s.x + s.nx * 10,
			az: s.z + s.nz * 10,
			bx: s.x - s.nx * 10,
			bz: s.z - s.nz * 10
		});
	}
	const props = [];
	const push = (p) => props.push(p);
	for (let i = 24; i < samples.length; i += 8) {
		const s = samples[i];
		const yaw = heading(s.nx, s.nz);
		for (const side of [-1, 1]) {
			if ((i + side) % 24 === 0) continue;
			push({
				model: "wall",
				x: s.x + s.nx * side * 11.4,
				z: s.z + s.nz * side * 11.4,
				yaw,
				solid: "obb",
				r: 0,
				hx: 2.35,
				hz: .48,
				hp: 90,
				maxHp: 90,
				dead: false,
				kind: "static",
				phase: 0
			});
		}
	}
	const spikeAt = [
		.22,
		.37,
		.53,
		.68,
		.84
	];
	for (let i = 0; i < spikeAt.length; i++) {
		const s = samples[Math.floor(spikeAt[i] * samples.length) % samples.length];
		const side = i % 2 === 0 ? 1 : -1;
		push({
			model: "spike",
			x: s.x + s.nx * side * 3.78,
			z: s.z + s.nz * side * 3.78,
			yaw: heading(s.tx, s.tz),
			solid: "obb",
			r: 0,
			hx: 2.5,
			hz: .55,
			hp: 60,
			maxHp: 60,
			dead: false,
			kind: "spike",
			phase: i
		});
	}
	for (const frac of [
		.3,
		.58,
		.77
	]) {
		const s = samples[Math.floor(frac * samples.length) % samples.length];
		push({
			model: "pipe",
			x: s.x + s.nx * 10.1,
			z: s.z + s.nz * 10.1,
			yaw: heading(s.tx, s.tz),
			solid: "circle",
			r: .9,
			hx: 0,
			hz: 0,
			hp: 40,
			maxHp: 40,
			dead: false,
			kind: "jet",
			phase: frac * 12
		});
	}
	const rnd = mulberry32(42);
	for (let n = 0; n < 26; n++) {
		const s = samples[Math.floor(rnd() * samples.length)];
		const side = rnd() < .5 ? -1 : 1;
		const dist = 15 + rnd() * 16;
		const x = s.x + s.nx * side * dist + (rnd() - .5) * 6;
		const z = s.z + s.nz * side * dist + (rnd() - .5) * 6;
		if (nearestDist(samples, x, z) < 13) continue;
		const roll = rnd();
		if (roll < .34) push({
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
			phase: 0
		});
		else if (roll < .62) push({
			model: "tree",
			x,
			z,
			yaw: rnd() * 6,
			solid: "circle",
			r: .55,
			hx: 0,
			hz: 0,
			hp: 40,
			maxHp: 40,
			dead: false,
			kind: "static",
			phase: 0
		});
		else if (roll < .78) push({
			model: "tires",
			x,
			z,
			yaw: rnd() * 6,
			solid: "circle",
			r: .9,
			hx: 0,
			hz: 0,
			hp: 30,
			maxHp: 30,
			dead: false,
			kind: "static",
			phase: 0
		});
		else if (roll < .9) push({
			model: "drum",
			x,
			z,
			yaw: 0,
			solid: "circle",
			r: .85,
			hx: 0,
			hz: 0,
			hp: 22,
			maxHp: 22,
			dead: false,
			kind: "drum",
			phase: 0
		});
		else push({
			model: "barrel",
			x,
			z,
			yaw: 0,
			solid: "circle",
			r: .85,
			hx: 0,
			hz: 0,
			hp: 22,
			maxHp: 22,
			dead: false,
			kind: "barrel",
			phase: rnd() * 6
		});
	}
	for (let i = 0; i < 4; i++) {
		const s = samples[(40 + i * 18) % samples.length];
		push({
			model: "wreck",
			x: s.x - s.nx * (14 + i % 2),
			z: s.z - s.nz * 14,
			yaw: heading(s.tx, s.tz) + (i % 2 ? .4 : -.8),
			solid: "circle",
			r: 1.5,
			hx: 0,
			hz: 0,
			hp: 80,
			maxHp: 80,
			dead: false,
			kind: "static",
			phase: 0
		});
	}
	for (let i = 0; i < 3; i++) {
		const s = samples[(18 + i * 40) % samples.length];
		push({
			model: "tower",
			x: s.x + s.nx * 23,
			z: s.z + s.nz * 23,
			yaw: heading(s.nx, s.nz),
			solid: "circle",
			r: 1.15,
			hx: 0,
			hz: 0,
			hp: 999,
			maxHp: 999,
			dead: false,
			kind: "static",
			phase: i
		});
	}
	const arch = samples[15];
	const archYaw = heading(arch.tx, arch.tz);
	for (const side of [-1, 1]) push({
		model: "post",
		x: arch.x + arch.nx * side * 9.4,
		z: arch.z + arch.nz * side * 9.4,
		yaw: archYaw,
		solid: "circle",
		r: .7,
		hx: 0,
		hz: 0,
		hp: 999,
		maxHp: 999,
		dead: false,
		kind: "static",
		phase: 0
	});
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
		phase: 0
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
		yaw: .4,
		solid: "circle",
		r: 1.6,
		hx: 0,
		hz: 0,
		hp: 70,
		maxHp: 70,
		dead: false,
		kind: "static",
		phase: 0
	});
	push({
		model: "barrel",
		x: cx + 3.2,
		z: cz - 1.4,
		yaw: 0,
		solid: "circle",
		r: .85,
		hx: 0,
		hz: 0,
		hp: 20,
		maxHp: 20,
		dead: false,
		kind: "barrel",
		phase: 1
	});
	push({
		model: "barrel",
		x: cx - 2.4,
		z: cz + 2.2,
		yaw: .2,
		solid: "circle",
		r: .85,
		hx: 0,
		hz: 0,
		hp: 20,
		maxHp: 20,
		dead: false,
		kind: "barrel",
		phase: 2.2
	});
	const spawns = [];
	for (let i = 0; i < 6; i++) {
		const row = Math.floor(i / 2);
		const col = i % 2;
		const sample = 11 - row * 3;
		const s = samples[sample];
		const side = col === 0 ? -2.5 : 2.5;
		spawns.push({
			x: s.x + s.nx * side,
			z: s.z + s.nz * side,
			yaw: heading(s.tx, s.tz),
			sample
		});
	}
	const ground = paintGround(samples);
	const decals = document.createElement("canvas");
	decals.width = TEX;
	decals.height = TEX;
	const decalCtx = decals.getContext("2d");
	if (!decalCtx) throw new Error("no decal context");
	decalCtx.lineCap = "round";
	return {
		samples,
		gates,
		props,
		spawns,
		ground,
		decals,
		decalCtx
	};
}
function cloneProps(props) {
	return props.map((p) => ({ ...p }));
}
function makeCam() {
	return {
		x: 0,
		z: 0,
		yaw: 0,
		zoom: 40,
		vScale: .52,
		baseY: .68,
		panX: 0,
		shake: 0
	};
}
function snapCam(cam, car) {
	cam.x = car.x;
	cam.z = car.z;
	cam.yaw = car.yaw;
	cam.zoom = 40;
	cam.shake = 0;
}
function followCam(cam, car, dt, speed) {
	const k = 1 - Math.exp(-4.6 * dt);
	cam.yaw = lerpAngle(cam.yaw, car.yaw, k);
	const p = 1 - Math.exp(-6 * dt);
	cam.x += (car.x - cam.x) * p;
	cam.z += (car.z - cam.z) * p;
	const target = 42 - Math.min(8, Math.abs(speed) * .14);
	cam.zoom += (target - cam.zoom) * (1 - Math.exp(-2.4 * dt));
}
function drawFrame(ctx, w, h, dpr, time, cam, track, models, opts) {
	const shake = opts.reduce ? 0 : cam.shake;
	const sx = Math.sin(time * 47) * shake;
	const sy = Math.cos(time * 41) * shake * .65;
	const look = opts.mode === "menu" ? opts.narrow ? .4 : 1.2 : 7.4 + Math.min(4.5, Math.abs(opts.speed) * .06);
	const f = forward(cam.yaw);
	const focus = {
		x: cam.x + f.x * look,
		z: cam.z + f.z * look
	};
	cam.baseY = opts.mode === "menu" ? opts.narrow ? .34 : .48 : .7;
	cam.panX = opts.mode === "menu" && !opts.narrow ? w * .16 : 0;
	cam.vScale = .52;
	ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
	const sky = ctx.createLinearGradient(0, 0, 0, h);
	sky.addColorStop(0, "#2a120e");
	sky.addColorStop(.42, "#a85a32");
	sky.addColorStop(.7, "#e0a15a");
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
	const e = w * .5 + cam.panX + sx - (focus.x * rx + focus.z * rz) * zoom;
	const fterm = h * cam.baseY + sy + (focus.x * fx + focus.z * fz) * zoom * v;
	ctx.imageSmoothingEnabled = true;
	ctx.setTransform(a * dpr, b * dpr, c * dpr, d * dpr, e * dpr, fterm * dpr);
	ctx.drawImage(track.ground, WORLD_MIN, WORLD_MIN, 400, 400);
	ctx.drawImage(track.decals, WORLD_MIN, WORLD_MIN, 400, 400);
	const project = (wx, wz) => {
		const dx = wx - focus.x;
		const dz = wz - focus.z;
		const right = dx * rx + dz * rz;
		const depth = dx * fx + dz * fz;
		return {
			x: w * .5 + cam.panX + sx + right * zoom,
			y: h * cam.baseY + sy - depth * zoom * v,
			depth
		};
	};
	ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
	ctx.imageSmoothingEnabled = false;
	const items = [];
	const pushModel = (model, x, z, yaw, alpha, hp, maxHp, name, bar, player) => {
		const p = project(x, z);
		if (p.x < -380 || p.x > w + 380 || p.y < -320 || p.y > h + 240) return;
		items.push({
			kind: "model",
			depth: p.depth,
			model,
			x,
			z,
			yaw,
			alpha,
			hp,
			maxHp,
			name,
			bar,
			player
		});
	};
	for (const prop of opts.props) {
		if (prop.dead) continue;
		const model = models[prop.model];
		if (!model) continue;
		pushModel(model, prop.x, prop.z, prop.yaw, 1, prop.hp, prop.maxHp, "", false, false);
	}
	if (opts.mode === "menu") {
		const sp = track.spawns[0];
		pushModel(models[opts.showModel] ?? models.black, sp.x, sp.z, opts.menuYaw, 1, 1, 1, "", false, false);
		const aCar = track.samples[30];
		const bCar = track.samples[40];
		if (models.rig) pushModel(models.rig, aCar.x + aCar.nx * 2.2, aCar.z + aCar.nz * 2.2, Math.atan2(-aCar.tx, -aCar.tz), 1, 1, 1, "", false, false);
		if (models.buggy2) pushModel(models.buggy2, bCar.x - bCar.nx * 2, bCar.z - bCar.nz * 2, Math.atan2(-bCar.tx, -bCar.tz), 1, 1, 1, "", false, false);
	} else {
		for (const car of opts.cars) {
			if (!car.alive) continue;
			const model = models[car.model] ?? models.black;
			let alpha = 1;
			if (car.invuln > 0 && Math.sin(time * 28) > 0) alpha = .45;
			if (car.finished) alpha = .75;
			pushModel(model, car.x, car.z, car.yaw, alpha, car.hp, car.maxHp, car.name, true, car.isPlayer);
		}
		const spike = models.spike;
		if (spike) for (const strip of opts.strips) pushModel(spike, strip.x, strip.z, strip.yaw, Math.min(1, strip.life), 1, 1, "", false, false);
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
				alpha: Math.max(0, p.life / p.max)
			});
		}
		for (const b of opts.bullets) {
			const pr = project(b.x, b.z);
			items.push({
				kind: "bolt",
				depth: pr.depth,
				x: b.x,
				z: b.z,
				x2: b.x - b.vx * .04,
				z2: b.z - b.vz * .04,
				color: b.color
			});
		}
	}
	items.sort((u, v) => v.depth - u.depth);
	const liftK = .8;
	for (const item of items) {
		if (item.kind === "part") {
			const p = project(item.x, item.z);
			const rise = item.y * zoom * liftK;
			ctx.globalAlpha = item.alpha;
			ctx.fillStyle = item.color;
			ctx.fillRect(p.x - item.size * .5, p.y - rise, item.size, item.size);
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
		ctx.globalAlpha = .32 * item.alpha;
		ctx.fillStyle = "#140e0a";
		ctx.beginPath();
		const shadow = Math.max(10, model.ox * px * .42);
		ctx.ellipse(p.x, p.y, shadow, shadow * .38, 0, 0, Math.PI * 2);
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
			const pulse = .55 + .45 * Math.sin(time * 7 + item.x);
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
			ctx.fillStyle = ratio < .35 ? "#d2452d" : item.player ? "#e2a23a" : "#c4512a";
			ctx.fillRect(p.x - 16, top + 10, 32 * ratio, 3);
		}
	}
	ctx.globalAlpha = 1;
	ctx.globalCompositeOperation = "source-over";
	ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
	const fog = ctx.createLinearGradient(0, 0, 0, h * .48);
	fog.addColorStop(0, "rgba(42,18,12,0.55)");
	fog.addColorStop(1, "rgba(42,18,12,0)");
	ctx.fillStyle = fog;
	ctx.fillRect(0, 0, w, h * .48);
	const vig = ctx.createRadialGradient(w * .5, h * .55, h * .2, w * .5, h * .5, h * .72);
	vig.addColorStop(0, "rgba(0,0,0,0)");
	vig.addColorStop(1, "rgba(12,6,4,0.55)");
	ctx.fillStyle = vig;
	ctx.fillRect(0, 0, w, h);
	if (opts.hurt > .62) {
		ctx.fillStyle = `rgba(160,32,18,${(opts.hurt - .62) * .55})`;
		ctx.fillRect(0, 0, w, h);
	}
	if (opts.nitro && opts.mode === "race") {
		ctx.strokeStyle = "rgba(255,176,64,0.35)";
		ctx.lineWidth = 2;
		for (let i = 0; i < 7; i++) {
			const y = h * (.55 + (time * 1.4 + i * .17) % 1 * .45);
			ctx.beginPath();
			ctx.moveTo(8, y);
			ctx.lineTo(28 + i % 3 * 10, y - 16);
			ctx.stroke();
		}
	}
	if (opts.mode === "race") drawMini(ctx, w, track, opts.cars, opts.narrow);
}
function drawMini(ctx, w, track, cars, narrow) {
	const mw = narrow ? 104 : 142;
	const mh = narrow ? 78 : 100;
	const x = w - mw - 12;
	const y = narrow ? 62 : 68;
	ctx.fillStyle = "rgba(18,12,9,0.78)";
	ctx.fillRect(x, y, mw, mh);
	ctx.strokeStyle = "#4a3428";
	ctx.lineWidth = 1;
	ctx.strokeRect(x + .5, y + .5, mw - 1, mh - 1);
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
	const sx = (mw - 16) / (maxX - minX || 1);
	const sz = (mh - 16) / (maxZ - minZ || 1);
	const sc = Math.min(sx, sz);
	const ox = x + mw / 2 - (minX + maxX) / 2 * sc;
	const oz = y + mh / 2 - (minZ + maxZ) / 2 * sc;
	ctx.beginPath();
	const s0 = track.samples[0];
	ctx.moveTo(ox + s0.x * sc, oz + s0.z * sc);
	for (const s of track.samples) ctx.lineTo(ox + s.x * sc, oz + s.z * sc);
	ctx.closePath();
	ctx.strokeStyle = "#c4512a";
	ctx.lineWidth = Math.max(2, 9 * sc * .35);
	ctx.stroke();
	ctx.strokeStyle = "#3a322c";
	ctx.lineWidth = Math.max(1, 9 * sc * .55);
	ctx.stroke();
	for (const car of cars) {
		ctx.fillStyle = car.isPlayer ? "#e2a23a" : car.alive ? "#f3e6d0" : "#d2452d";
		ctx.fillRect(ox + car.x * sc - 1.5, oz + car.z * sc - 1.5, 3, 3);
	}
}
function primeMenuCam(cam, track) {
	const sp = track.spawns[0];
	cam.x = sp.x;
	cam.z = sp.z;
	cam.yaw = sp.yaw;
	cam.zoom = 46;
}
var INK = 1315087;
var RUBBER = 1446930;
var STEEL = 9275008;
var STEEL_D = 4078134;
var BRASS = 13935178;
var BONE = 15127472;
var GLASS = 1454130;
var AMBER = 16762218;
var REDL = 16726570;
var RUST = 11883052;
var Vol = class {
	v = [];
	box(x0, x1, y0, y1, z0, z1, c, g = 0) {
		for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) for (let z = z0; z <= z1; z++) this.v.push({
			x,
			y,
			z,
			c,
			g
		});
	}
	at(x, y, z, c, g = 0) {
		this.v.push({
			x,
			y,
			z,
			c,
			g
		});
	}
	wheel(cx, cy, cz, rad, half, hub) {
		const inner = Math.max(1, rad - 2);
		for (let x = cx - half; x <= cx + half; x++) for (let y = cy - rad; y <= cy + rad; y++) for (let z = cz - rad; z <= cz + rad; z++) {
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
};
function interceptor(body, trim) {
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
	for (const x of [
		-5,
		-2,
		0,
		2,
		5
	]) for (let i = 0; i < 4; i++) vol.at(x, 4 + (i > 2 ? 1 : 0), 16 + i, BONE);
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
	const cab = 3814444;
	const tank = 6053956;
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
	vol.at(2, 18, 7, 6706500);
	vol.box(-6, 6, 3, 5, 14, 17, STEEL);
	for (const x of [
		-5,
		-2,
		2,
		5
	]) for (let i = 0; i < 4; i++) vol.at(x, 4, 17 + i, BONE);
	vol.at(-4, 6, 16, AMBER, 1);
	vol.at(4, 6, 16, AMBER, 1);
	vol.at(-3, 7, -26, REDL, 1);
	vol.at(3, 7, -26, REDL, 1);
	for (const z of [
		-22,
		-16,
		-10,
		-4
	]) {
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
	for (const z of [
		-6,
		-14,
		-22
	]) {
		vol.wheel(-6, 4, z, 4, 1, STEEL);
		vol.wheel(6, 4, z, 4, 1, STEEL);
	}
	return vol.v;
}
function buggy(body, cage) {
	const vol = new Vol();
	vol.box(-5, 5, 3, 4, -12, 12, body);
	vol.box(-4, 4, 4, 5, -8, 10, STEEL_D);
	vol.box(-1, 1, 4, 5, -4, 6, 6959152);
	vol.box(-5, -4, 5, 9, -6, -5, cage);
	vol.box(4, 5, 5, 9, -6, -5, cage);
	vol.box(-5, -4, 5, 9, 4, 5, cage);
	vol.box(4, 5, 5, 9, 4, 5, cage);
	vol.box(-5, 5, 9, 10, -6, 5, cage);
	vol.box(-3, 3, 5, 8, -12, -8, STEEL);
	vol.box(-2, 2, 6, 8, -11, -9, RUST);
	vol.box(-6, 6, 4, 5, 11, 14, STEEL_D);
	for (const x of [
		-4,
		0,
		4
	]) for (let i = 0; i < 3; i++) vol.at(x, 5, 14 + i, BONE);
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
function drum(color, lit) {
	const vol = new Vol();
	for (let y = 0; y <= 8; y++) for (let x = -3; x <= 3; x++) for (let z = -3; z <= 3; z++) {
		if (x * x + z * z > 10) continue;
		const band = y === 2 || y === 6;
		const top = lit && y >= 7;
		vol.at(x, y, z, top ? AMBER : band ? BONE : color, top ? 1 : 0);
	}
	return vol.v;
}
function rock() {
	const vol = new Vol();
	const rad = 6;
	for (let x = -6; x <= rad; x++) for (let z = -6; z <= rad; z++) {
		const d = Math.sqrt(x * x + z * z) / rad;
		if (d > 1) continue;
		const h = Math.max(1, Math.round((1 - d) * (6 + (x * 3 + z & 3))));
		for (let y = 0; y < h; y++) {
			const c = (x + z + y) % 5 === 0 ? 9271400 : 6968902;
			vol.at(x, y, z, c);
		}
	}
	return vol.v;
}
function tree() {
	const vol = new Vol();
	vol.box(-1, 1, 0, 14, -1, 1, 3811874);
	vol.box(0, 0, 8, 12, 1, 6, 3023900);
	vol.box(-6, -1, 10, 12, 0, 1, 2761244);
	vol.box(1, 5, 7, 9, -1, 0, 3287072);
	vol.box(-2, 2, 13, 16, -2, 2, 1972758);
	return vol.v;
}
function tower() {
	const vol = new Vol();
	for (const x of [-3, 3]) for (const z of [-3, 3]) vol.box(x, x, 0, 18, z, z, STEEL_D);
	vol.box(-4, 4, 16, 17, -4, 4, 5914676);
	vol.box(-2, 2, 18, 20, -2, 2, INK);
	vol.at(0, 20, 2, AMBER, 1);
	vol.box(-4, 4, 8, 8, -4, 4, 4863020);
	return vol.v;
}
function wall() {
	const vol = new Vol();
	vol.box(-12, 12, 0, 3, -1, 1, 5916220);
	vol.box(-12, 12, 3, 4, -1, 1, RUST);
	for (let x = -10; x <= 10; x += 4) vol.box(x, x, 4, 8, 0, 2, BONE);
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
	vol.box(-5, 5, 1, 3, -10, 8, 2761760);
	vol.box(-4, 4, 3, 5, -2, 4, 1709588);
	vol.box(-3, 0, 3, 4, 5, 9, RUST);
	vol.wheel(-6, 3, -6, 3, 1, STEEL_D);
	vol.wheel(5, 2, 4, 3, 1, 3811876);
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
	vol.box(-2, 2, 0, 16, -2, 2, 4864048);
	vol.box(-3, 3, 14, 16, -3, 3, RUST);
	vol.at(0, 16, 0, AMBER, 1);
	return vol.v;
}
function beam() {
	const vol = new Vol();
	vol.box(-22, 22, 14, 16, -1, 1, 3813416);
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
function bake(id, voxels, vu, guns = [], exhausts = []) {
	const map = /* @__PURE__ */ new Map();
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
	const slices = [];
	const glow = [];
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
			const col = v.g ? v.c : shade(v.c, buried ? .74 : 1.16);
			const i = (py * size + px) * 4;
			img.data[i] = col >> 16 & 255;
			img.data[i + 1] = col >> 8 & 255;
			img.data[i + 2] = col & 255;
			img.data[i + 3] = 255;
			any = true;
			if (v.g && gimg) {
				gimg.data[i] = Math.min(255, (col >> 16 & 255) + 40);
				gimg.data[i + 1] = col >> 8 & 255;
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
	return {
		id,
		slices,
		glow,
		ox: R,
		oy: R,
		vu,
		layers: maxY + 1,
		guns,
		exhausts,
		hasGlow
	};
}
function bakeAll() {
	const gunsI = [{
		x: -6,
		y: 6,
		z: 14
	}, {
		x: 6,
		y: 6,
		z: 14
	}];
	const exI = [{
		x: -2,
		y: 5,
		z: -15
	}, {
		x: 2,
		y: 5,
		z: -15
	}];
	return {
		black: bake("black", interceptor(1841945, RUST), .16, gunsI, exI),
		red: bake("red", interceptor(8005666, 1708558), .16, gunsI, exI),
		bone: bake("bone", interceptor(14009508, 3813928), .16, gunsI, exI),
		rig: bake("rig", warRig(), .15, [{
			x: -4,
			y: 7,
			z: 16
		}, {
			x: 4,
			y: 7,
			z: 16
		}], [{
			x: -3,
			y: 6,
			z: -26
		}, {
			x: 3,
			y: 6,
			z: -26
		}]),
		buggy: bake("buggy", buggy(12886890, 15127472), .16, [{
			x: -5,
			y: 5,
			z: 12
		}, {
			x: 5,
			y: 5,
			z: 12
		}], [{
			x: 0,
			y: 6,
			z: -12
		}]),
		buggy2: bake("buggy2", buggy(9058856, 1709588), .16, [{
			x: -5,
			y: 5,
			z: 12
		}, {
			x: 5,
			y: 5,
			z: 12
		}], [{
			x: 0,
			y: 6,
			z: -12
		}]),
		drum: bake("drum", drum(RUST, false), .28),
		barrel: bake("barrel", drum(7221272, true), .28),
		rock: bake("rock", rock(), .34),
		tree: bake("tree", tree(), .22),
		tower: bake("tower", tower(), .2),
		wall: bake("wall", wall(), .2),
		spike: bake("spike", spikePlate(), .18),
		wreck: bake("wreck", wreck(), .17),
		tires: bake("tires", tires(), .22),
		post: bake("post", post(), .22),
		beam: bake("beam", beam(), .32),
		pipe: bake("pipe", pipe(), .24)
	};
}
var SAVE_KEY = "ash-circuit-v1";
var INTER = {
	accel: 30,
	brake: 40,
	max: 34,
	turn: 2.35,
	grip: 7.4,
	driftGrip: 1.65,
	drag: .16,
	coast: .9,
	hp: 100,
	dmg: 9,
	fireRate: .11,
	heat: .08,
	spread: .02,
	ram: 1.2,
	circles: [{
		z: .15,
		r: 1.15
	}, {
		z: 1.45,
		r: .8
	}]
};
var RIG = {
	accel: 17,
	brake: 30,
	max: 27,
	turn: 1.42,
	grip: 8.8,
	driftGrip: 2.3,
	drag: .14,
	coast: .72,
	hp: 190,
	dmg: 12,
	fireRate: .17,
	heat: .1,
	spread: .04,
	ram: 1.9,
	circles: [
		{
			z: 1.9,
			r: 1.25
		},
		{
			z: -.5,
			r: 1.35
		},
		{
			z: -2.6,
			r: 1.3
		}
	]
};
var BUGGY = {
	accel: 38,
	brake: 36,
	max: 39,
	turn: 2.9,
	grip: 5.1,
	driftGrip: 1.3,
	drag: .2,
	coast: 1.1,
	hp: 72,
	dmg: 6.5,
	fireRate: .075,
	heat: .055,
	spread: .05,
	ram: .72,
	circles: [{
		z: .05,
		r: 1.05
	}]
};
function statsFor(model) {
	if (model === "rig") return RIG;
	if (model === "buggy" || model === "buggy2") return BUGGY;
	return INTER;
}
function loadSave() {
	try {
		const raw = localStorage.getItem(SAVE_KEY);
		if (!raw) return {
			bestRace: null,
			bestLap: null
		};
		const p = JSON.parse(raw);
		return {
			bestRace: p.bestRace ?? null,
			bestLap: p.bestLap ?? null
		};
	} catch {
		return {
			bestRace: null,
			bestLap: null
		};
	}
}
function storeSave(s) {
	try {
		localStorage.setItem(SAVE_KEY, JSON.stringify(s));
	} catch {}
}
var NAMES = {
	black: "BLACK MILE",
	rig: "MOTHER",
	buggy: "BUZZARD"
};
function roster(playerModel) {
	const ai = [
		{
			model: "red",
			name: "RED HOOK"
		},
		{
			model: "bone",
			name: "WIDOW"
		},
		{
			model: "rig",
			name: "MOTHER"
		},
		{
			model: "buggy",
			name: "SALT RAT"
		},
		{
			model: "buggy2",
			name: "VULTURE"
		},
		{
			model: "black",
			name: "IRON JAW"
		}
	].filter((a) => a.model !== playerModel);
	return [{
		model: playerModel,
		name: NAMES[playerModel] ?? "YOU",
		player: true
	}, ...ai.slice(0, 5)];
}
var Race = class {
	models;
	track;
	template;
	props = [];
	cars = [];
	bullets = [];
	particles = [];
	strips = [];
	feed = [];
	keys = /* @__PURE__ */ new Set();
	touch = {
		left: false,
		right: false,
		gas: false,
		brake: false,
		fire: false,
		nitro: false,
		drift: false,
		drop: false
	};
	steerOverride = null;
	phase = "menu";
	clock = 0;
	tick = 0;
	banner = "";
	bannerT = 0;
	shakeAmp = 0;
	result = null;
	bestLap;
	bestRace;
	vehicleId = "black";
	dropLatch = false;
	resetLatch = false;
	onFx = null;
	finishCount = 0;
	constructor() {
		this.models = bakeAll();
		this.track = buildTrack();
		this.template = this.track.props;
		const save = loadSave();
		this.bestLap = save.bestLap;
		this.bestRace = save.bestRace;
	}
	get player() {
		return this.cars[0];
	}
	start(modelId) {
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
			const sp = this.track.spawns[i] ?? this.track.spawns[0];
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
				invuln: .6,
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
				stats
			};
		});
	}
	step(dt) {
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
			const use = car.isPlayer && this.phase === "racing" ? input : ai ?? ZERO;
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
			p.vx *= 1 - Math.min(1, .8 * dt);
			p.vz *= 1 - Math.min(1, .8 * dt);
			if (p.y < 0) {
				p.y = 0;
				p.vy *= -.25;
			}
			if (p.life > 0) this.particles[w++] = p;
		}
		this.particles.length = w;
	}
	readInput() {
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
			if (Math.abs(ax) > .18) steer -= ax;
			const rt = gp.buttons[7]?.value ?? 0;
			const lt = gp.buttons[6]?.value ?? 0;
			if (rt > .2 || gp.buttons[0]?.pressed) gas = true;
			if (lt > .2) brake = true;
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
		return {
			steer,
			throttle,
			fire,
			nitro,
			drift,
			drop
		};
	}
	aiInput(car) {
		const samples = this.track.samples;
		const s = samples[car.sample] ?? samples[0];
		const look = 7 + Math.floor(Math.abs(car.vx * s.tx + car.vz * s.tz) * .15);
		const tgt = samples[(car.sample + look) % samples.length];
		const dx = tgt.x - car.x;
		const dz = tgt.z - car.z;
		let diff = wrap(Math.atan2(-dx, -dz) - car.yaw);
		let steer = clamp(diff * 2.1, -1, 1);
		const ahead = samples[(car.sample + 6) % samples.length];
		const turn = Math.abs(wrap(Math.atan2(-ahead.tx, -ahead.tz) - car.yaw));
		let throttle = 1;
		if (turn > .55) throttle = .45;
		if (turn > .95) throttle = .05;
		const f = forward(car.yaw);
		const rgt = right(car.yaw);
		for (const o of this.cars) {
			if (o === car || !o.alive || o.finished) continue;
			const ox = o.x - car.x;
			const oz = o.z - car.z;
			const dist = hypot(ox, oz);
			if (dist < 7 && dist > .2) {
				if (ox * f.x + oz * f.z > 0) {
					const side = ox * rgt.x + oz * rgt.z;
					steer -= clamp((7 - dist) * .22, 0, 1) * Math.sign(side || 1);
					if (dist < 3.6) throttle = Math.min(throttle, .35);
				}
			}
		}
		steer = clamp(steer, -1, 1);
		const nitro = Math.abs(diff) < .25 && car.nitro > .45 && car.sample % 50 < 18;
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
		return {
			steer,
			throttle,
			fire: !!aim,
			nitro,
			drift: false,
			drop,
			aim
		};
	}
	aim(car) {
		const f = forward(car.yaw);
		let best = null;
		let bestD = 1156;
		for (const o of this.cars) {
			if (o === car || !o.alive || o.finished) continue;
			const dx = o.x + o.vx * .18 - car.x;
			const dz = o.z + o.vz * .18 - car.z;
			const d2 = dx * dx + dz * dz;
			if (d2 > bestD || d2 < 4) continue;
			const dist = Math.sqrt(d2);
			if ((dx * f.x + dz * f.z) / dist < .8) continue;
			best = o;
			bestD = d2;
		}
		if (!best) return null;
		return {
			x: best.x + best.vx * .18,
			z: best.z + best.vz * .18
		};
	}
	integrate(car, input, dt) {
		const x0 = car.x;
		const z0 = car.z;
		const spd = hypot(car.vx, car.vz);
		const f0 = forward(car.yaw);
		const rev = car.vx * f0.x + car.vz * f0.z >= -.4 ? 1 : -1;
		const speedFactor = clamp(spd / 9, .22, 1);
		car.yaw += input.steer * car.stats.turn * speedFactor * rev * dt;
		const f = forward(car.yaw);
		const nitro = input.nitro && car.nitro > .02 && input.throttle > 0;
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
		const sample = this.track.samples[car.sample] ?? this.track.samples[0];
		const lateralOff = (car.x - sample.x) * sample.nx + (car.z - sample.z) * sample.nz;
		const off = Math.abs(lateralOff) > 9.5;
		let drag = input.throttle > 0 ? car.stats.drag : car.stats.coast;
		if (off) drag += 1.55;
		if (nitro) drag *= .5;
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
		} else if (car.drift > .4 && !input.drift) {
			car.boost = .6;
			car.scrape = .85;
			car.drift = 0;
			if (car.isPlayer) {
				this.banner = "SCRAPE";
				this.bannerT = .7;
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
		} else if (capped < -max * .28) {
			const extra = capped + max * .28;
			car.vx -= f.x * extra;
			car.vz -= f.z * extra;
		}
		car.x += car.vx * dt;
		car.z += car.vz * dt;
		if (nitro) car.nitro = Math.max(0, car.nitro - dt * .33);
		else car.nitro = Math.min(1, car.nitro + dt * .065);
		car.wrong = car.vx * sample.tx + car.vz * sample.tz < -6;
		if (spd < 2.2 && car.isPlayer) car.stuck += dt;
		else car.stuck = 0;
		if (drifting || lat > 8 || off) {
			const rgt = right(car.yaw);
			for (const side of [-.8, .8]) this.skid(x0 + rgt.x * side, z0 + rgt.z * side, car.x + rgt.x * side, car.z + rgt.z * side, off ? .22 : .4);
			if (this.particles.length < 300 && (car.isPlayer || this.tick % 2 === 0)) this.puff(car.x, car.z, .2, (Math.random() - .5) * 2, (Math.random() - .5) * 2, 1.5, .45, "#c4a57a", 3);
		}
		if (nitro && this.particles.length < 320) {
			const baked = this.model(car);
			for (const ex of baked.exhausts) {
				const p = mount(car, baked, ex);
				this.puff(p.x, p.z, ex.y * baked.vu, -f.x * 6, -f.z * 6, 1, .22, Math.random() > .4 ? "#ffb03a" : "#ff5a28", 3.2);
			}
		}
		if (car.hp < car.maxHp * .42 && this.particles.length < 320 && Math.random() < .5) this.puff(car.x, car.z, 1.2, (Math.random() - .5) * 1.2, (Math.random() - .5) * 1.2, 2.4, .7, "#2a2724", 4);
		this.progress(car, x0, z0);
	}
	progress(car, x0, z0) {
		const samples = this.track.samples;
		const N = samples.length;
		let hint = car.sample;
		let best = hint;
		let bestD = Infinity;
		for (let k = -15; k <= 18; k++) {
			const i = (hint + k + N) % N;
			const s = samples[i];
			const d = (s.x - car.x) ** 2 + (s.z - car.z) ** 2;
			if (d < bestD) {
				bestD = d;
				best = i;
			}
		}
		if (bestD > 1296) for (let i = 0; i < N; i++) {
			const s = samples[i];
			const d = (s.x - car.x) ** 2 + (s.z - car.z) ** 2;
			if (d < bestD) {
				bestD = d;
				best = i;
			}
		}
		car.sample = best;
		const gate = this.track.gates[car.nextCp];
		if (!gate) return;
		if (!segmentsIntersect(x0, z0, car.x, car.z, gate.ax, gate.az, gate.bx, gate.bz)) return;
		const s = samples[gate.sample];
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
					storeSave({
						bestLap: this.bestLap,
						bestRace: this.bestRace
					});
				}
			}
			car.lapStamp = this.clock;
			if (car.laps >= 3) this.finish(car);
			else if (car.isPlayer) {
				this.banner = car.laps === 2 ? "FINAL LAP" : `LAP ${car.laps + 1}`;
				this.bannerT = 1.4;
				this.onFx?.("lap");
			}
		}
		car.nextCp = (gate.index + 1) % this.track.gates.length;
		car.lastCpX = s.x;
		car.lastCpZ = s.z;
		car.lastCpYaw = Math.atan2(-s.tx, -s.tz);
	}
	finish(car) {
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
				storeSave({
					bestLap: this.bestLap,
					bestRace: this.bestRace
				});
			}
			this.result = {
				place: car.finishPlace,
				time: car.finishTime,
				kills: car.kills,
				bestLap: this.bestLap,
				laps: [...car.lapTimes],
				won
			};
			this.banner = won ? "THE FLATS ARE YOURS" : "FINISH";
			this.bannerT = 2.4;
			this.phase = "done";
			this.onFx?.("lap");
		}
	}
	combat(car, input, dt) {
		car.fireCd = Math.max(0, car.fireCd - dt);
		car.dropCd = Math.max(0, car.dropCd - dt);
		car.ramCd = Math.max(0, car.ramCd - dt);
		car.invuln = Math.max(0, car.invuln - dt);
		car.flash = Math.max(0, car.flash - dt);
		if (car.overheat > 0) {
			car.overheat -= dt;
			car.heat = Math.max(0, car.heat - dt * .22);
		} else car.heat = Math.max(0, car.heat - dt * .34);
		if (input.fire && (car.isPlayer || input.aim) && car.fireCd <= 0) {
			if (car.heat >= 1 || car.overheat > 0) {
				if (car.overheat <= 0) car.overheat = .85;
			} else this.shoot(car, input.aim ?? null);
		}
		if (input.drop && car.dropCd <= 0) {
			const f = forward(car.yaw);
			this.strips.push({
				x: car.x - f.x * 2.4,
				z: car.z - f.z * 2.4,
				yaw: car.yaw,
				life: 8,
				grace: .65,
				owner: car.id,
				hit: /* @__PURE__ */ new Set()
			});
			car.dropCd = 7.5;
		}
	}
	shoot(car, aim) {
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
		const spread = car.isPlayer ? car.stats.spread : .14;
		const guns = baked.guns.length ? baked.guns : [{
			x: 0,
			y: 5,
			z: 8
		}];
		for (const g of guns) {
			const a = (Math.random() - .5) * spread;
			const c = Math.cos(a);
			const s = Math.sin(a);
			const vx = dirx * c - dirz * s;
			const vz = dirx * s + dirz * c;
			const m = mount(car, baked, g);
			this.bullets.push({
				x: m.x + vx * .4,
				z: m.z + vz * .4,
				vx: vx * 58 + car.vx * .25,
				vz: vz * 58 + car.vz * .25,
				life: .72,
				dmg: car.stats.dmg,
				owner: car.id,
				color: car.isPlayer ? "#ffd27a" : "#ff5a32"
			});
			this.puff(m.x, m.z, g.y * baked.vu, vx * 2, vz * 2, .2, .06, "#fff1c4", 3);
		}
		car.fireCd = car.stats.fireRate;
		car.heat = Math.min(1.25, car.heat + car.stats.heat);
		if (car.heat >= 1) car.overheat = .85;
		if (car.isPlayer || this.tick % 2 === 0) this.onFx?.("gun");
	}
	collide(dt) {
		const cars = this.cars.filter((c) => c.alive && !c.finished);
		for (let i = 0; i < cars.length; i++) for (let j = i + 1; j < cars.length; j++) this.carHit(cars[i], cars[j], dt);
		for (const car of cars) for (const prop of this.props) {
			if (prop.dead || prop.solid === "none") continue;
			this.propHit(car, prop);
		}
	}
	carHit(a, b, _dt) {
		const ac = worldCircles(a);
		const bc = worldCircles(b);
		let best = 0;
		let nx = 0;
		let nz = 0;
		for (const c1 of ac) for (const c2 of bc) {
			const dx = c2.x - c1.x;
			const dz = c2.z - c1.z;
			const dist = hypot(dx, dz) || 1e-4;
			const pen = c1.r + c2.r - dist;
			if (pen > best) {
				best = pen;
				nx = dx / dist;
				nz = dz / dist;
			}
		}
		if (best <= 0) return;
		a.x -= nx * best * .5;
		a.z -= nz * best * .5;
		b.x += nx * best * .5;
		b.z += nz * best * .5;
		const rel = (a.vx - b.vx) * nx + (a.vz - b.vz) * nz;
		if (rel > 0) {
			a.vx -= nx * rel * .55;
			a.vz -= nz * rel * .55;
			b.vx += nx * rel * .55;
			b.vz += nz * rel * .55;
		}
		if (rel > 7 && a.ramCd <= 0 && b.ramCd <= 0) {
			const fa = forward(a.yaw);
			const fb = forward(b.yaw);
			const noseA = fa.x * nx + fa.z * nz;
			const noseB = fb.x * -nx + fb.z * -nz;
			if (noseA > .4) this.hurt(b, (rel - 5) * a.stats.ram * .55 * noseA, a);
			if (noseB > .4) this.hurt(a, (rel - 5) * b.stats.ram * .55 * noseB, b);
			if (noseA <= .4 && noseB <= .4) {
				this.hurt(a, (rel - 5) * .18, b);
				this.hurt(b, (rel - 5) * .18, a);
			}
			a.ramCd = .4;
			b.ramCd = .4;
			this.burst(a.x + nx * .5, a.z + nz * .5, "#e6d3b0", 8);
			if (a.isPlayer || b.isPlayer) {
				this.shakeAmp = Math.max(this.shakeAmp, Math.min(14, rel * .45));
				this.onFx?.("hit");
			}
		}
	}
	propHit(car, prop) {
		const circles = worldCircles(car);
		for (const c of circles) if (prop.solid === "circle") {
			const dx = c.x - prop.x;
			const dz = c.z - prop.z;
			const dist = hypot(dx, dz) || 1e-4;
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
					if (-into > 10 && prop.kind === "drum") this.hurt(car, (-into - 8) * .3, null);
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
					car.vx -= nx * into * .95;
					car.vz -= nz * into * .95;
				}
			}
		}
	}
	bulletsAndStrips(dt) {
		let w = 0;
		for (const b of this.bullets) {
			b.life -= dt;
			b.x += b.vx * dt;
			b.z += b.vz * dt;
			if (b.life <= 0) continue;
			let dead = false;
			for (const car of this.cars) {
				if (!car.alive || car.finished || car.id === b.owner || car.invuln > 0) continue;
				for (const c of worldCircles(car)) if ((c.x - b.x) ** 2 + (c.z - b.z) ** 2 < (c.r + .25) ** 2) {
					const owner = this.cars[b.owner] ?? null;
					this.hurt(car, b.dmg, owner);
					this.burst(b.x, b.z, "#ffd27a", 5);
					if (owner?.isPlayer || car.isPlayer) this.onFx?.("hit");
					dead = true;
					break;
				}
				if (dead) break;
			}
			if (!dead) for (const prop of this.props) {
				if (prop.dead || prop.hp > 900) continue;
				if (prop.solid === "circle" ? (prop.x - b.x) ** 2 + (prop.z - b.z) ** 2 < (prop.r + .3) ** 2 : Math.abs(localOf(prop, b.x, b.z).lx) < prop.hx + .3 && Math.abs(localOf(prop, b.x, b.z).lz) < prop.hz + .3) {
					prop.hp -= b.dmg;
					this.burst(b.x, b.z, "#e6d3b0", 4);
					if (prop.hp <= 0) this.breakProp(prop);
					dead = true;
					break;
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
				if (Math.abs(lx) < 2.7 && Math.abs(lz) < .85) {
					strip.hit.add(car.id);
					const owner = this.cars[strip.owner] ?? null;
					this.hurt(car, 26, owner);
					car.vx *= .7;
					car.vz *= .7;
					this.burst(car.x, car.z, "#e6d3b0", 7);
				}
			}
			this.strips[s++] = strip;
		}
		this.strips.length = s;
	}
	hazards(dt) {
		for (const prop of this.props) {
			if (prop.dead) continue;
			if (prop.kind === "barrel" && this.tick % 2 === 0 && this.particles.length < 300) this.puff(prop.x + (Math.random() - .5) * .3, prop.z + (Math.random() - .5) * .3, 1.5, (Math.random() - .5) * .6, (Math.random() - .5) * .6, 2.2 + Math.random(), .45, Math.random() > .5 ? "#ff8a32" : "#ffd27a", 2.4);
			if (prop.kind !== "spike" && prop.kind !== "jet") continue;
			const jetOn = prop.kind === "jet" && Math.sin(this.clock * 3 + prop.phase) > .25;
			if (prop.kind === "jet" && jetOn && this.tick % 2 === 0) this.puff(prop.x, prop.z, .8, (Math.random() - .5) * 1.5, (Math.random() - .5) * 1.5, 6, .35, "#ff5a28", 3);
			for (const car of this.cars) {
				if (!car.alive || car.finished || car.invuln > 0) continue;
				if (prop.kind === "spike") {
					const { lx, lz } = localOf(prop, car.x, car.z);
					if (Math.abs(lx) < prop.hx + .8 && Math.abs(lz) < prop.hz + .7) {
						this.hurt(car, 36 * dt, null);
						car.vx *= 1 - Math.min(.45, 3.2 * dt);
						car.vz *= 1 - Math.min(.45, 3.2 * dt);
					}
				} else if (jetOn && (car.x - prop.x) ** 2 + (car.z - prop.z) ** 2 < 2.3 * 2.3) this.hurt(car, 34 * dt, null);
			}
		}
	}
	hurt(car, amount, by) {
		if (!car.alive || car.finished || car.invuln > 0 || amount <= 0) return;
		car.hp -= amount;
		car.flash = .12;
		if (car.isPlayer) this.shakeAmp = Math.max(this.shakeAmp, Math.min(10, amount * .35));
		if (car.hp <= 0) {
			car.hp = 0;
			this.wreck(car, by);
		}
	}
	wreck(car, by) {
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
			by.nitro = Math.min(1, by.nitro + .4);
			const text = by.isPlayer ? `${car.name} WRECKED` : car.isPlayer ? `${by.name} WRECKED YOU` : `${by.name} GOT ${car.name}`;
			this.feed.unshift({
				text,
				life: 3.2
			});
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
	respawn(car) {
		const f = forward(car.lastCpYaw);
		car.x = car.lastCpX - f.x * 1.5;
		car.z = car.lastCpZ - f.z * 1.5;
		car.yaw = car.lastCpYaw;
		car.vx = f.x * 12;
		car.vz = f.z * 12;
		car.hp = car.maxHp * .62;
		car.alive = true;
		car.invuln = 1.8;
		car.heat = 0;
		car.overheat = 0;
		car.respawn = 0;
		const samples = this.track.samples;
		let best = 0;
		let bestD = Infinity;
		for (let i = 0; i < samples.length; i++) {
			const s = samples[i];
			const d = (s.x - car.x) ** 2 + (s.z - car.z) ** 2;
			if (d < bestD) {
				bestD = d;
				best = i;
			}
		}
		car.sample = best;
	}
	breakProp(prop) {
		prop.dead = true;
		prop.solid = "none";
		this.boom(prop.x, prop.z);
		this.onFx?.("boom");
	}
	boom(x, z) {
		this.burst(x, z, "#ff8a32", 16);
		this.burst(x, z, "#ffd27a", 10);
		this.burst(x, z, "#2a241e", 8);
	}
	burst(x, z, color, n) {
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
				life: .35 + Math.random() * .4,
				max: .7,
				color,
				size: 2 + Math.random() * 3
			});
		}
	}
	puff(x, z, y, vx, vz, vy, life, color, size) {
		if (this.particles.length > 340) return;
		this.particles.push({
			x,
			z,
			y,
			vx,
			vz,
			vy,
			life,
			max: life,
			color,
			size
		});
	}
	skid(x0, z0, x1, z1, alpha) {
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
	fadeDecals() {
		if (this.tick % 3 !== 0) return;
		const ctx = this.track.decalCtx;
		ctx.globalCompositeOperation = "destination-out";
		ctx.fillStyle = "rgba(0,0,0,0.035)";
		ctx.fillRect(0, 0, TEX, TEX);
		ctx.globalCompositeOperation = "source-over";
	}
	rank() {
		const scored = this.cars.map((c) => ({
			c,
			score: c.finished ? 1e6 - c.finishPlace : c.laps * 1e4 + c.sample
		}));
		scored.sort((a, b) => b.score - a.score);
		scored.forEach((s, i) => {
			if (!s.c.finished) s.c.place = i + 1;
		});
	}
	model(car) {
		return this.models[car.model] ?? this.models.black;
	}
};
var ZERO = {
	steer: 0,
	throttle: 0,
	fire: false,
	nitro: false,
	drift: false,
	drop: false,
	aim: null
};
function mount(car, baked, m) {
	const f = forward(car.yaw);
	const r = right(car.yaw);
	const lx = m.x * baked.vu;
	const lz = m.z * baked.vu;
	return {
		x: car.x + r.x * lx + f.x * lz,
		z: car.z + r.z * lx + f.z * lz
	};
}
function worldCircles(car) {
	const f = forward(car.yaw);
	return car.stats.circles.map((c) => ({
		x: car.x + f.x * c.z,
		z: car.z + f.z * c.z,
		r: c.r
	}));
}
function localOf(prop, x, z) {
	const f = forward(prop.yaw);
	const r = right(prop.yaw);
	const dx = x - prop.x;
	const dz = z - prop.z;
	return {
		lx: dx * r.x + dz * r.z,
		lz: dx * f.x + dz * f.z
	};
}
function closestOnRect(lx, lz, hx, hz) {
	if (!(Math.abs(lx) <= hx && Math.abs(lz) <= hz)) return {
		x: clamp(lx, -hx, hx),
		z: clamp(lz, -hz, hz),
		inside: false
	};
	if (hx - Math.abs(lx) < hz - Math.abs(lz)) return {
		x: Math.sign(lx || 1) * hx,
		z: lz,
		inside: true
	};
	return {
		x: lx,
		z: Math.sign(lz || 1) * hz,
		inside: true
	};
}
function pushCircleOBB(cx, cz, cr, box) {
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
		return {
			px: (r.x * nx + f.x * nz) * pen,
			pz: (r.z * nx + f.z * nz) * pen
		};
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
	return {
		px: (r.x * lnx + f.x * lnz) * pen,
		pz: (r.z * lnx + f.z * lnz) * pen
	};
}
var Sound = class {
	ctx = null;
	master = null;
	music = null;
	sfx = null;
	engine = null;
	oscA = null;
	filter = null;
	noise = null;
	musicOn = false;
	muted = false;
	timer = 0;
	unlock() {
		if (!this.ctx) {
			const ctx = new AudioContext({ latencyHint: "interactive" });
			this.ctx = ctx;
			const master = ctx.createGain();
			const music = ctx.createGain();
			const sfx = ctx.createGain();
			const engine = ctx.createGain();
			master.gain.value = .85;
			music.gain.value = 0;
			sfx.gain.value = .85;
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
			gb.gain.value = .22;
			oscA.connect(filter);
			oscB.connect(gb);
			gb.connect(filter);
			filter.connect(engine);
			oscA.start();
			oscB.start();
			this.oscA = oscA;
			this.filter = filter;
			const len = Math.floor(ctx.sampleRate * .45);
			const buf = ctx.createBuffer(1, len, ctx.sampleRate);
			const data = buf.getChannelData(0);
			for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
			this.noise = buf;
		}
		if (this.ctx.state === "suspended") this.ctx.resume();
	}
	setMuted(m) {
		this.muted = m;
		if (!this.ctx || !this.master) return;
		this.master.gain.setTargetAtTime(m ? 0 : .85, this.ctx.currentTime, .03);
	}
	engineSpeed(speed, nitro, on) {
		if (!this.ctx || !this.engine || !this.oscA || !this.filter) return;
		const now = this.ctx.currentTime;
		const vol = on ? Math.min(.2, .035 + Math.abs(speed) * .0045) : 0;
		this.engine.gain.setTargetAtTime(vol, now, .05);
		this.oscA.frequency.setTargetAtTime(40 + Math.abs(speed) * 2.5 + (nitro ? 30 : 0), now, .06);
		this.filter.frequency.setTargetAtTime(160 + Math.abs(speed) * 16 + (nitro ? 380 : 0), now, .06);
	}
	blip(kind) {
		if (!this.ctx || !this.noise || !this.sfx || this.muted) return;
		const ctx = this.ctx;
		const now = ctx.currentTime;
		if (kind === "lap") {
			const o = ctx.createOscillator();
			o.type = "square";
			o.frequency.setValueAtTime(196, now);
			o.frequency.setValueAtTime(294, now + .09);
			const g = ctx.createGain();
			g.gain.setValueAtTime(.07, now);
			g.gain.exponentialRampToValueAtTime(.001, now + .28);
			o.connect(g);
			g.connect(this.sfx);
			o.start(now);
			o.stop(now + .3);
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
			g.gain.setValueAtTime(.16, now);
			g.gain.exponentialRampToValueAtTime(.001, now + .07);
			src.playbackRate.value = 1.2 + Math.random() * .4;
			src.start(now, 0, .08);
		} else if (kind === "boom") {
			f.type = "lowpass";
			f.frequency.setValueAtTime(900, now);
			f.frequency.exponentialRampToValueAtTime(70, now + .48);
			g.gain.setValueAtTime(.48, now);
			g.gain.exponentialRampToValueAtTime(.001, now + .5);
			src.playbackRate.value = .55;
			src.start(now, 0, .5);
		} else if (kind === "hit") {
			f.type = "highpass";
			f.frequency.value = 500;
			g.gain.setValueAtTime(.2, now);
			g.gain.exponentialRampToValueAtTime(.001, now + .12);
			src.playbackRate.value = .7 + Math.random() * .5;
			src.start(now, 0, .12);
		} else {
			f.type = "bandpass";
			f.frequency.value = 520;
			g.gain.setValueAtTime(.14, now);
			g.gain.exponentialRampToValueAtTime(.001, now + .32);
			src.playbackRate.value = .45;
			src.start(now, 0, .32);
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
		this.music.gain.setTargetAtTime(.045, this.ctx.currentTime, .4);
		this.scheduleMusic();
	}
	stopMusic() {
		this.musicOn = false;
		window.clearTimeout(this.timer);
		if (this.ctx && this.music) this.music.gain.setTargetAtTime(0, this.ctx.currentTime, .2);
	}
	scheduleMusic() {
		if (!this.ctx || !this.music || !this.musicOn) return;
		const ctx = this.ctx;
		const bus = this.music;
		const now = ctx.currentTime + .06;
		const notes = [
			55,
			55,
			65.41,
			55,
			49,
			55,
			73.42,
			65.41
		];
		for (let i = 0; i < notes.length; i++) {
			const freq = notes[i];
			const t = now + i * .48;
			const o = ctx.createOscillator();
			o.type = "triangle";
			o.frequency.value = freq;
			const g = ctx.createGain();
			g.gain.setValueAtTime(1e-4, t);
			g.gain.exponentialRampToValueAtTime(.45, t + .03);
			g.gain.exponentialRampToValueAtTime(1e-4, t + .42);
			o.connect(g);
			g.connect(bus);
			o.start(t);
			o.stop(t + .44);
			o.onended = () => {
				o.disconnect();
				g.disconnect();
			};
		}
		this.timer = window.setTimeout(() => this.scheduleMusic(), notes.length * 480 - 60);
	}
};
var VEHICLES = [
	{
		id: "black",
		name: "BLACK MILE",
		role: "INTERCEPTOR",
		blurb: "Balanced coupe. Twin guns, a spiked shovel, enough iron to trade paint.",
		pace: "w-3/4",
		hull: "w-2/3",
		ram: "w-2/3"
	},
	{
		id: "rig",
		name: "MOTHER",
		role: "WAR RIG",
		blurb: "Armored tanker. Slow in the bends. Miserable to ram and worse to pass.",
		pace: "w-1/2",
		hull: "w-full",
		ram: "w-full"
	},
	{
		id: "buggy",
		name: "BUZZARD",
		role: "SAND RAIL",
		blurb: "Light, loud, and one good hit from becoming a parts pile.",
		pace: "w-full",
		hull: "w-2/5",
		ram: "w-2/5"
	}
];
function AshCircuit() {
	const wrapRef = (0, import_react.useRef)(null);
	const canvasRef = (0, import_react.useRef)(null);
	const raceRef = (0, import_react.useRef)(null);
	const soundRef = (0, import_react.useRef)(null);
	const camRef = (0, import_react.useRef)(makeCam());
	const selectedRef = (0, import_react.useRef)("black");
	const modeRef = (0, import_react.useRef)("menu");
	const hud = (0, import_react.useRef)({});
	const [mode, setMode] = (0, import_react.useState)("menu");
	const [vehicle, setVehicle] = (0, import_react.useState)("black");
	const [touchUi, setTouchUi] = (0, import_react.useState)(false);
	const [muted, setMuted] = (0, import_react.useState)(false);
	const [result, setResult] = (0, import_react.useState)(null);
	const [best, setBest] = (0, import_react.useState)({
		lap: null,
		race: null
	});
	const [bootError, setBootError] = (0, import_react.useState)("");
	selectedRef.current = vehicle;
	modeRef.current = mode;
	(0, import_react.useEffect)(() => {
		const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		const coarse = window.matchMedia("(pointer: coarse)");
		const syncTouch = () => setTouchUi(coarse.matches || window.innerWidth < 820);
		syncTouch();
		coarse.addEventListener("change", syncTouch);
		window.addEventListener("resize", syncTouch);
		let race;
		try {
			race = new Race();
		} catch (err) {
			setBootError(err instanceof Error ? err.message : "Could not build the circuit.");
			return () => {
				coarse.removeEventListener("change", syncTouch);
				window.removeEventListener("resize", syncTouch);
			};
		}
		raceRef.current = race;
		setBest({
			lap: race.bestLap,
			race: race.bestRace
		});
		const sound = new Sound();
		soundRef.current = sound;
		race.onFx = (k) => sound.blip(k);
		const cam = camRef.current;
		primeMenuCam(cam, race.track);
		if (localStorage.getItem("ash-circuit-mute") === "1") {
			sound.muted = true;
			setMuted(true);
		}
		const onKeyDown = (e) => {
			if ([
				"Space",
				"ArrowUp",
				"ArrowDown",
				"ArrowLeft",
				"ArrowRight"
			].includes(e.code)) e.preventDefault();
			race.keys.add(e.code);
			if (e.code === "Escape") {
				if (race.phase === "racing") {
					race.phase = "paused";
					modeRef.current = "paused";
					setMode("paused");
				} else if (race.phase === "paused") {
					race.phase = "racing";
					modeRef.current = "racing";
					setMode("racing");
				}
			}
			if (e.code === "KeyM") {
				const next = !sound.muted;
				sound.unlock();
				sound.setMuted(next);
				localStorage.setItem("ash-circuit-mute", next ? "1" : "0");
				setMuted(next);
			}
		};
		const onKeyUp = (e) => race.keys.delete(e.code);
		const onBlur = () => race.keys.clear();
		const onVis = () => {
			if (document.visibilityState === "visible" && sound.ctx?.state === "suspended") sound.ctx.resume();
		};
		window.addEventListener("keydown", onKeyDown);
		window.addEventListener("keyup", onKeyUp);
		window.addEventListener("blur", onBlur);
		document.addEventListener("visibilitychange", onVis);
		window.__controlsTest = {
			getYaw: () => race.player?.yaw ?? 0,
			getSpeed: () => {
				const p = race.player;
				if (!p) return 0;
				const f = forward(p.yaw);
				return p.vx * f.x + p.vz * f.z;
			},
			setKeys: (codes) => {
				race.keys.clear();
				for (const c of codes) race.keys.add(c);
			},
			setSteer: (v) => {
				race.steerOverride = v;
			}
		};
		let raf = 0;
		let last = performance.now();
		let acc = 0;
		let spin = 0;
		const frame = (now) => {
			const dt = Math.min(.05, (now - last) / 1e3);
			last = now;
			if (race.phase !== "paused") spin += dt;
			cam.shake = Math.min(18, cam.shake * Math.exp(-3.4 * dt) + race.shakeAmp);
			race.shakeAmp = 0;
			if (race.phase === "racing" || race.phase === "done") {
				acc += dt;
				const h = 1 / 60;
				let n = 0;
				while (acc >= h && n < 5) {
					race.step(h);
					acc -= h;
					n++;
				}
			} else acc = 0;
			if (race.phase !== modeRef.current) {
				modeRef.current = race.phase;
				setMode(race.phase);
				if (race.phase === "done") setResult(race.result);
			}
			const canvas = canvasRef.current;
			const box = wrapRef.current;
			if (canvas && box) {
				const dpr = Math.min(2, window.devicePixelRatio || 1);
				const w = box.clientWidth;
				const hgt = box.clientHeight;
				const bw = Math.max(1, Math.floor(w * dpr));
				const bh = Math.max(1, Math.floor(hgt * dpr));
				if (canvas.width !== bw || canvas.height !== bh) {
					canvas.width = bw;
					canvas.height = bh;
				}
				const ctx = canvas.getContext("2d", { alpha: false });
				if (ctx && w > 0 && hgt > 0) {
					const narrow = w < 820;
					const p = race.cars[0];
					const fw = p ? forward(p.yaw) : {
						x: 0,
						z: -1
					};
					const speed = p ? p.vx * fw.x + p.vz * fw.z : 0;
					if (race.phase === "menu") primeMenuCam(cam, race.track);
					else if (p) followCam(cam, p, dt, speed);
					drawFrame(ctx, w, hgt, dpr, spin, cam, race.track, race.models, {
						mode: race.phase === "menu" ? "menu" : "race",
						narrow,
						reduce,
						menuYaw: spin * (reduce ? .18 : .55),
						showModel: selectedRef.current,
						cars: race.cars,
						props: race.phase === "menu" ? race.track.props : race.props,
						strips: race.strips,
						particles: race.particles,
						bullets: race.bullets,
						speed,
						nitro: !!p?.nitroOn,
						hurt: p && p.alive ? 1 - p.hp / p.maxHp : 0
					});
					paintHud(hud.current, race, speed);
					sound.engineSpeed(speed, !!p?.nitroOn, race.phase === "racing" || race.phase === "done");
				}
			}
			raf = requestAnimationFrame(frame);
		};
		raf = requestAnimationFrame(frame);
		return () => {
			cancelAnimationFrame(raf);
			window.removeEventListener("keydown", onKeyDown);
			window.removeEventListener("keyup", onKeyUp);
			window.removeEventListener("blur", onBlur);
			document.removeEventListener("visibilitychange", onVis);
			coarse.removeEventListener("change", syncTouch);
			window.removeEventListener("resize", syncTouch);
			sound.stopMusic();
			delete window.__controlsTest;
		};
	}, []);
	function bind(key) {
		return (el) => {
			hud.current[key] = el;
		};
	}
	function unlock() {
		soundRef.current?.unlock();
	}
	function begin() {
		const race = raceRef.current;
		const sound = soundRef.current;
		if (!race || !sound) return;
		sound.unlock();
		if (sound.muted) sound.setMuted(true);
		sound.startMusic();
		race.start(selectedRef.current);
		snapCam(camRef.current, race.player);
		race.keys.clear();
		if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
		modeRef.current = "racing";
		setMode("racing");
		setResult(null);
	}
	function toggleMute() {
		const sound = soundRef.current;
		if (!sound) return;
		sound.unlock();
		const next = !sound.muted;
		sound.setMuted(next);
		localStorage.setItem("ash-circuit-mute", next ? "1" : "0");
		setMuted(next);
	}
	function hold(field) {
		const down = (e) => {
			e.preventDefault();
			e.currentTarget.setPointerCapture(e.pointerId);
			const race = raceRef.current;
			if (race) race.touch[field] = true;
		};
		const up = () => {
			const race = raceRef.current;
			if (race) race.touch[field] = false;
		};
		return {
			onPointerDown: down,
			onPointerUp: up,
			onPointerCancel: up,
			onLostPointerCapture: up
		};
	}
	const showHud = mode === "racing" || mode === "paused";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		ref: wrapRef,
		className: "relative h-dvh w-full overflow-hidden bg-bg text-fg",
		onPointerDown: unlock,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
				ref: canvasRef,
				className: "absolute inset-0 h-full w-full touch-none",
				"aria-label": "Ash Circuit race view"
			}),
			bootError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "absolute inset-x-0 top-8 px-6 text-center text-danger",
				children: bootError
			}) : null,
			mode === "menu" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 flex flex-col justify-end sm:justify-center sm:px-10",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "plate enter safe-b max-h-[78%] w-full overflow-y-auto px-5 py-5 sm:max-h-[92%] sm:max-w-md sm:px-6 sm:py-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-semibold tracking-widest text-primary",
							children: "ASH FLATS · STACKED IRON"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-1 font-display text-5xl leading-none text-fg sm:text-6xl",
							children: "ASH CIRCUIT"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 max-w-sm text-base leading-snug text-muted",
							children: "Guns, shovel spikes, and a bottle of nitro. Three laps on the ash. Finish, or burn."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4 grid gap-2",
							role: "radiogroup",
							"aria-label": "Choose a rig",
							children: VEHICLES.map((v) => {
								const on = vehicle === v.id;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									role: "radio",
									"aria-checked": on,
									onClick: () => setVehicle(v.id),
									className: "plate border px-3 py-2 text-left " + (on ? "border-primary" : "border-border"),
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "flex items-baseline justify-between gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-display text-lg text-fg",
												children: v.name
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-xs font-semibold tracking-widest text-primary",
												children: v.role
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "mt-1 block text-sm leading-snug text-muted",
											children: v.blurb
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "mt-2 grid grid-cols-3 gap-2 text-xs font-semibold tracking-wide text-muted",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meter, {
													label: "PACE",
													width: v.pace
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meter, {
													label: "HULL",
													width: v.hull
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Meter, {
													label: "RAM",
													width: v.ram
												})
											]
										})
									]
								}, v.id);
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: begin,
							className: "mt-4 flex h-12 w-full items-center justify-center gap-2 bg-primary font-display text-lg text-bg",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flag, {
								className: "size-5",
								"aria-hidden": true
							}), "Start Race"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm leading-snug text-muted",
							children: "W throttle, S brake, A and D steer. Space guns, Shift nitro, C scrape, E spike drop, R reset."
						}),
						best.race != null || best.lap != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 text-sm font-semibold tracking-wide text-fg",
							children: [
								best.race != null ? `BEST ${formatTime(best.race)}` : "",
								best.race != null && best.lap != null ? " · " : "",
								best.lap != null ? `LAP ${formatTime(best.lap)}` : ""
							]
						}) : null
					]
				})
			}) : null,
			showHud ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-3 sm:p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-display text-3xl leading-none text-fg sm:text-4xl",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								ref: bind("place"),
								children: "1ST"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "ml-2 text-base text-muted",
								children: "/ 6"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-sm font-semibold tracking-widest text-fg",
							children: [
								"LAP ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									ref: bind("lap"),
									children: ["1/", 3]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ml-3 text-muted",
									ref: bind("time"),
									children: "0:00.00"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							ref: bind("feed"),
							className: "mt-1 max-w-xs text-sm font-semibold text-danger"
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "pointer-events-auto flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: toggleMute,
							className: "flex size-11 items-center justify-center border border-border bg-surface text-fg",
							"aria-label": muted ? "Unmute" : "Mute",
							children: muted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "size-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-5" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => {
								const race = raceRef.current;
								if (!race || race.phase === "done") return;
								const next = race.phase === "paused" ? "racing" : "paused";
								race.phase = next;
								modeRef.current = next;
								setMode(next);
							},
							className: "flex size-11 items-center justify-center border border-border bg-surface text-fg",
							"aria-label": mode === "paused" ? "Resume" : "Pause",
							children: mode === "paused" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-5" })
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					ref: bind("banner"),
					hidden: true,
					"aria-live": "polite",
					className: "pointer-events-none absolute top-[22%] left-1/2 -translate-x-1/2 font-display text-4xl text-primary sm:text-6xl"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					ref: bind("wrong"),
					hidden: true,
					className: "pointer-events-none absolute top-[34%] left-1/2 -translate-x-1/2 font-display text-2xl text-danger",
					children: "WRONG WAY"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					ref: bind("wreck"),
					hidden: true,
					className: "pointer-events-none absolute top-[42%] left-1/2 -translate-x-1/2 text-sm font-semibold tracking-widest text-fg"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "pointer-events-none absolute inset-x-0 bottom-36 flex items-end justify-between gap-4 p-3 sm:bottom-4 sm:p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "w-44 sm:w-56",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
								bind,
								id: "hp",
								label: "HULL",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crosshair, { className: "size-3.5" }),
								tone: "bg-danger"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
								bind,
								id: "nitro",
								label: "NITRO",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flame, { className: "size-3.5" }),
								tone: "bg-primary"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
								bind,
								id: "heat",
								label: "GUNS",
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gauge, { className: "size-3.5" }),
								tone: "bg-fg",
								labelRef: "heatLabel"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								ref: bind("hint"),
								className: "mt-2 hidden text-xs font-semibold tracking-wide text-muted sm:block",
								children: "HOLD C THROUGH A BEND FOR A SCRAPE BOOST"
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-right",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							ref: bind("pace"),
							className: "block font-display text-4xl leading-none text-fg",
							children: "0"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs font-semibold tracking-widest text-muted",
							children: "PACE"
						})]
					})]
				})
			] }) : null,
			mode === "paused" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 flex items-center justify-center bg-bg/70 p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "plate w-full max-w-sm border border-border px-6 py-6 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-4xl text-fg",
							children: "HOLDING"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-muted",
							children: "The flats wait. The guns don't cool for free."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "mt-5 h-12 w-full bg-primary font-display text-lg text-bg",
							onClick: () => {
								const race = raceRef.current;
								if (!race) return;
								race.phase = "racing";
								modeRef.current = "racing";
								setMode("racing");
							},
							children: "Resume"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "mt-2 h-12 w-full border border-border font-display text-lg text-fg",
							onClick: () => {
								const race = raceRef.current;
								if (!race) return;
								race.phase = "menu";
								race.keys.clear();
								soundRef.current?.stopMusic();
								modeRef.current = "menu";
								setMode("menu");
								setBest({
									lap: race.bestLap,
									race: race.bestRace
								});
							},
							children: "Retire"
						})
					]
				})
			}) : null,
			mode === "done" && result ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 flex items-center justify-center bg-bg/75 p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "plate w-full max-w-sm border border-border px-6 py-6 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-semibold tracking-widest text-primary",
							children: result.won ? "THE FLATS ARE YOURS" : "CHECKERED AND BLEEDING"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-1 font-display text-5xl text-fg",
							children: ordinal(result.place)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-lg text-fg",
							children: formatTime(result.time)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted",
							children: [
								result.kills,
								" wrecks",
								result.bestLap != null ? ` · best lap ${formatTime(result.bestLap)}` : ""
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "mt-5 flex h-12 w-full items-center justify-center gap-2 bg-primary font-display text-lg text-bg",
							onClick: begin,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, {
								className: "size-5",
								"aria-hidden": true
							}), "Run it back"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "mt-2 h-12 w-full border border-border font-display text-lg text-fg",
							onClick: () => {
								const race = raceRef.current;
								if (race) {
									race.phase = "menu";
									setBest({
										lap: race.bestLap,
										race: race.bestRace
									});
								}
								soundRef.current?.stopMusic();
								modeRef.current = "menu";
								setMode("menu");
							},
							children: "Switch rig"
						})
					]
				})
			}) : null,
			touchUi && mode === "racing" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "safe-b absolute inset-x-0 bottom-0 z-20 grid grid-cols-4 gap-2 p-3 sm:hidden",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Touch, {
						label: "LEFT",
						...hold("left")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Touch, {
						label: "RIGHT",
						...hold("right")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Touch, {
						label: "DRIFT",
						...hold("drift")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Touch, {
						label: "SPIKE",
						...hold("drop")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Touch, {
						label: "BRAKE",
						...hold("brake")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Touch, {
						label: "GAS",
						className: "col-span-1 bg-primary text-bg",
						...hold("gas")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Touch, {
						label: "FIRE",
						...hold("fire")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Touch, {
						label: "NITRO",
						className: "bg-primary text-bg",
						...hold("nitro")
					})
				]
			}) : null
		]
	});
}
function Meter({ label, width }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "block",
		children: label
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "mt-1 block h-1 bg-bg",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "block h-full bg-primary " + width })
	})] });
}
function Bar({ bind, id, label, icon, tone, labelRef }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-1.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-0.5 flex items-center gap-1 text-xs font-semibold tracking-widest text-muted",
			children: [icon, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				ref: labelRef ? bind(labelRef) : void 0,
				children: label
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "h-2 w-full bg-bg",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				ref: bind(id),
				className: "h-full origin-left " + tone
			})
		})]
	});
}
function Touch({ label, className = "", ...rest }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		tabIndex: -1,
		className: "flex h-12 items-center justify-center border border-border bg-surface font-display text-sm text-fg " + className,
		...rest,
		children: label
	});
}
function paintHud(els, race, speed) {
	const p = race.cars[0];
	if (!p || race.phase === "menu") return;
	const place = els.place;
	if (place) place.textContent = ordinal(p.place);
	const lap = els.lap;
	if (lap) lap.textContent = `${Math.min(3, p.finished ? p.laps : p.laps + 1)}/3`;
	const time = els.time;
	if (time) time.textContent = formatTime(p.finished ? p.finishTime : p.raceTime);
	const pace = els.pace;
	if (pace) pace.textContent = String(Math.round(Math.abs(speed) * 7));
	const hp = els.hp;
	if (hp) hp.style.transform = `scaleX(${Math.max(0, p.hp / p.maxHp)})`;
	const nitro = els.nitro;
	if (nitro) nitro.style.transform = `scaleX(${p.nitro})`;
	const heat = els.heat;
	if (heat) heat.style.transform = `scaleX(${Math.min(1, p.heat)})`;
	const heatLabel = els.heatLabel;
	if (heatLabel) heatLabel.textContent = p.overheat > 0 ? "VENT" : "GUNS";
	const feed = els.feed;
	if (feed) feed.textContent = race.feed.map((f) => f.text).join("  ·  ");
	const banner = els.banner;
	if (banner) {
		const show = race.bannerT > 0 && race.banner.length > 0;
		banner.hidden = !show;
		if (show) banner.textContent = race.banner;
	}
	const wrong = els.wrong;
	if (wrong) wrong.hidden = !(p.wrong && p.alive && !p.finished);
	const wreck = els.wreck;
	if (wreck) {
		if (!p.alive) {
			wreck.hidden = false;
			wreck.textContent = `BACK IN ${Math.max(1, Math.ceil(p.respawn))}`;
		} else if (p.stuck > 2.2 && !p.finished) {
			wreck.hidden = false;
			wreck.textContent = "R RESET";
		} else wreck.hidden = true;
	}
	const hint = els.hint;
	if (hint) hint.hidden = race.clock > 8;
}
var SplitComponent = AshCircuit;
//#endregion
export { SplitComponent as component };

import { useEffect, useRef, useState, type ButtonHTMLAttributes, type PointerEvent, type ReactNode } from "react";
import { Crosshair, Flag, Flame, Gauge, Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { forward, formatTime, ordinal } from "@/game/math";
import { drawFrame, followCam, makeCam, primeMenuCam, snapCam, type Cam } from "@/game/draw";
import { Race, LAPS, type Result, type TouchState } from "@/game/sim";
import { Sound } from "@/game/audio";

const VEHICLES = [
  {
    id: "black",
    name: "BLACK MILE",
    role: "INTERCEPTOR",
    blurb: "Balanced coupe. Twin guns, a spiked shovel, enough iron to trade paint.",
    pace: "w-3/4",
    hull: "w-2/3",
    ram: "w-2/3",
  },
  {
    id: "rig",
    name: "MOTHER",
    role: "WAR RIG",
    blurb: "Armored tanker. Slow in the bends. Miserable to ram and worse to pass.",
    pace: "w-1/2",
    hull: "w-full",
    ram: "w-full",
  },
  {
    id: "buggy",
    name: "BUZZARD",
    role: "SAND RAIL",
    blurb: "Light, loud, and one good hit from becoming a parts pile.",
    pace: "w-full",
    hull: "w-2/5",
    ram: "w-2/5",
  },
] as const;

type Mode = "menu" | "racing" | "paused" | "done";

export function AshCircuit() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const raceRef = useRef<Race | null>(null);
  const soundRef = useRef<Sound | null>(null);
  const camRef = useRef<Cam>(makeCam());
  const selectedRef = useRef<(typeof VEHICLES)[number]["id"]>("black");
  const modeRef = useRef<Mode>("menu");
  const hud = useRef<Record<string, HTMLElement | null>>({});
  const [mode, setMode] = useState<Mode>("menu");
  const [vehicle, setVehicle] = useState<(typeof VEHICLES)[number]["id"]>("black");
  const [touchUi, setTouchUi] = useState(false);
  const [muted, setMuted] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [best, setBest] = useState<{ lap: number | null; race: number | null }>({ lap: null, race: null });
  const [bootError, setBootError] = useState("");

  selectedRef.current = vehicle;
  modeRef.current = mode;

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)");
    const syncTouch = () => setTouchUi(coarse.matches || window.innerWidth < 820);
    syncTouch();
    coarse.addEventListener("change", syncTouch);
    window.addEventListener("resize", syncTouch);

    let race: Race;
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
    setBest({ lap: race.bestLap, race: race.bestRace });
    const sound = new Sound();
    soundRef.current = sound;
    race.onFx = (k) => sound.blip(k);
    const cam = camRef.current;
    primeMenuCam(cam, race.track);

    const savedMute = localStorage.getItem("ash-circuit-mute") === "1";
    if (savedMute) {
      sound.muted = true;
      setMuted(true);
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) e.preventDefault();
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
    const onKeyUp = (e: KeyboardEvent) => race.keys.delete(e.code);
    const onBlur = () => race.keys.clear();
    const onVis = () => {
      if (document.visibilityState === "visible" && sound.ctx?.state === "suspended") void sound.ctx.resume();
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
      },
    };

    let raf = 0;
    let last = performance.now();
    let acc = 0;
    let spin = 0;
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
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
          const fw = p ? forward(p.yaw) : { x: 0, z: -1 };
          const speed = p ? p.vx * fw.x + p.vz * fw.z : 0;
          if (race.phase === "menu") primeMenuCam(cam, race.track);
          else if (p) followCam(cam, p, dt, speed);
          drawFrame(ctx, w, hgt, dpr, spin, cam, race.track, race.models, {
            mode: race.phase === "menu" ? "menu" : "race",
            narrow,
            reduce,
            menuYaw: spin * (reduce ? 0.18 : 0.55),
            showModel: selectedRef.current,
            cars: race.cars,
            props: race.phase === "menu" ? race.track.props : race.props,
            strips: race.strips,
            particles: race.particles,
            bullets: race.bullets,
            speed,
            nitro: !!p?.nitroOn,
            hurt: p && p.alive ? 1 - p.hp / p.maxHp : 0,
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

  function bind(key: string) {
    return (el: HTMLElement | null) => {
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

  function hold(field: keyof TouchState) {
  const down = (e: PointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      const race = raceRef.current;
      if (race) race.touch[field] = true;
    };
    const up = () => {
      const race = raceRef.current;
      if (race) race.touch[field] = false;
    };
    return { onPointerDown: down, onPointerUp: up, onPointerCancel: up, onLostPointerCapture: up };
  }

  const showHud = mode === "racing" || mode === "paused";

  return (
    <main ref={wrapRef} className="relative h-dvh w-full overflow-hidden bg-bg text-fg" onPointerDown={unlock}>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full touch-none" aria-label="Ash Circuit race view" />
      {bootError ? (
        <p className="absolute inset-x-0 top-8 px-6 text-center text-danger">{bootError}</p>
      ) : null}

      {mode === "menu" ? (
        <div className="absolute inset-0 flex flex-col justify-end sm:justify-center sm:px-10">
          <section className="plate enter safe-b max-h-[78%] w-full overflow-y-auto px-5 py-5 sm:max-h-[92%] sm:max-w-md sm:px-6 sm:py-6">
            <p className="text-xs font-semibold tracking-widest text-primary">ASH FLATS · STACKED IRON</p>
            <h1 className="mt-1 font-display text-5xl leading-none text-fg sm:text-6xl">ASH CIRCUIT</h1>
            <p className="mt-3 max-w-sm text-base leading-snug text-muted">
              Guns, shovel spikes, and a bottle of nitro. Three laps on the ash. Finish, or burn.
            </p>
            <div className="mt-4 grid gap-2" role="radiogroup" aria-label="Choose a rig">
              {VEHICLES.map((v) => {
                const on = vehicle === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => setVehicle(v.id)}
                    className={
                      "plate border px-3 py-2 text-left " +
                      (on ? "border-primary" : "border-border")
                    }
                  >
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="font-display text-lg text-fg">{v.name}</span>
                      <span className="text-xs font-semibold tracking-widest text-primary">{v.role}</span>
                    </span>
                    <span className="mt-1 block text-sm leading-snug text-muted">{v.blurb}</span>
                    <span className="mt-2 grid grid-cols-3 gap-2 text-xs font-semibold tracking-wide text-muted">
                      <Meter label="PACE" width={v.pace} />
                      <Meter label="HULL" width={v.hull} />
                      <Meter label="RAM" width={v.ram} />
                    </span>
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={begin}
              className="mt-4 flex h-12 w-full items-center justify-center gap-2 bg-primary font-display text-lg text-bg"
            >
              <Flag className="size-5" aria-hidden />
              Start Race
            </button>
            <p className="mt-3 text-sm leading-snug text-muted">
              W throttle, S brake, A and D steer. Space guns, Shift nitro, C scrape, E spike drop, R reset.
            </p>
            {best.race != null || best.lap != null ? (
              <p className="mt-2 text-sm font-semibold tracking-wide text-fg">
                {best.race != null ? `BEST ${formatTime(best.race)}` : ""}
                {best.race != null && best.lap != null ? " · " : ""}
                {best.lap != null ? `LAP ${formatTime(best.lap)}` : ""}
              </p>
            ) : null}
          </section>
        </div>
      ) : null}

      {showHud ? (
        <>
          <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-3 sm:p-4">
            <div>
              <p className="font-display text-3xl leading-none text-fg sm:text-4xl">
                <span ref={bind("place")}>1ST</span>
                <span className="ml-2 text-base text-muted">/ 6</span>
              </p>
              <p className="mt-1 text-sm font-semibold tracking-widest text-fg">
                LAP <span ref={bind("lap")}>1/{LAPS}</span>
                <span className="ml-3 text-muted" ref={bind("time")}>
                  0:00.00
                </span>
              </p>
              <p ref={bind("feed")} className="mt-1 max-w-xs text-sm font-semibold text-danger" />
            </div>
            <div className="pointer-events-auto flex gap-2">
              <button
                type="button"
                onClick={toggleMute}
                className="flex size-11 items-center justify-center border border-border bg-surface text-fg"
                aria-label={muted ? "Unmute" : "Mute"}
              >
                {muted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
              </button>
              <button
                type="button"
                onClick={() => {
                  const race = raceRef.current;
                  if (!race || race.phase === "done") return;
                  const next = race.phase === "paused" ? "racing" : "paused";
                  race.phase = next;
                  modeRef.current = next;
                  setMode(next);
                }}
                className="flex size-11 items-center justify-center border border-border bg-surface text-fg"
                aria-label={mode === "paused" ? "Resume" : "Pause"}
              >
                {mode === "paused" ? <Play className="size-5" /> : <Pause className="size-5" />}
              </button>
            </div>
          </div>

          <p
            ref={bind("banner")}
            hidden
            aria-live="polite"
            className="pointer-events-none absolute top-[22%] left-1/2 -translate-x-1/2 font-display text-4xl text-primary sm:text-6xl"
          />
          <p
            ref={bind("wrong")}
            hidden
            className="pointer-events-none absolute top-[34%] left-1/2 -translate-x-1/2 font-display text-2xl text-danger"
          >
            WRONG WAY
          </p>
          <p
            ref={bind("wreck")}
            hidden
            className="pointer-events-none absolute top-[42%] left-1/2 -translate-x-1/2 text-sm font-semibold tracking-widest text-fg"
          />

          <div className="pointer-events-none absolute inset-x-0 bottom-36 flex items-end justify-between gap-4 p-3 sm:bottom-4 sm:p-4">
            <div className="w-44 sm:w-56">
              <Bar bind={bind} id="hp" label="HULL" icon={<Crosshair className="size-3.5" />} tone="bg-danger" />
              <Bar bind={bind} id="nitro" label="NITRO" icon={<Flame className="size-3.5" />} tone="bg-primary" />
              <Bar bind={bind} id="heat" label="GUNS" icon={<Gauge className="size-3.5" />} tone="bg-fg" labelRef="heatLabel" />
              <p ref={bind("hint")} className="mt-2 hidden text-xs font-semibold tracking-wide text-muted sm:block">
                HOLD C THROUGH A BEND FOR A SCRAPE BOOST
              </p>
            </div>
            <p className="text-right">
              <span ref={bind("pace")} className="block font-display text-4xl leading-none text-fg">
                0
              </span>
              <span className="text-xs font-semibold tracking-widest text-muted">PACE</span>
            </p>
          </div>
        </>
      ) : null}

      {mode === "paused" ? (
        <div className="absolute inset-0 flex items-center justify-center bg-bg/70 p-4">
          <div className="plate w-full max-w-sm border border-border px-6 py-6 text-center">
            <h2 className="font-display text-4xl text-fg">HOLDING</h2>
            <p className="mt-2 text-muted">The flats wait. The guns don't cool for free.</p>
            <button
              type="button"
              className="mt-5 h-12 w-full bg-primary font-display text-lg text-bg"
              onClick={() => {
                const race = raceRef.current;
                if (!race) return;
                race.phase = "racing";
                modeRef.current = "racing";
                setMode("racing");
              }}
            >
              Resume
            </button>
            <button
              type="button"
              className="mt-2 h-12 w-full border border-border font-display text-lg text-fg"
              onClick={() => {
                const race = raceRef.current;
                if (!race) return;
                race.phase = "menu";
                race.keys.clear();
                soundRef.current?.stopMusic();
                modeRef.current = "menu";
                setMode("menu");
                setBest({ lap: race.bestLap, race: race.bestRace });
              }}
            >
              Retire
            </button>
          </div>
        </div>
      ) : null}

      {mode === "done" && result ? (
        <div className="absolute inset-0 flex items-center justify-center bg-bg/75 p-4">
          <div className="plate w-full max-w-sm border border-border px-6 py-6 text-center">
            <p className="text-xs font-semibold tracking-widest text-primary">
              {result.won ? "THE FLATS ARE YOURS" : "CHECKERED AND BLEEDING"}
            </p>
            <h2 className="mt-1 font-display text-5xl text-fg">{ordinal(result.place)}</h2>
            <p className="mt-2 text-lg text-fg">{formatTime(result.time)}</p>
            <p className="text-sm text-muted">
              {result.kills} wrecks
              {result.bestLap != null ? ` · best lap ${formatTime(result.bestLap)}` : ""}
            </p>
            <button type="button" className="mt-5 flex h-12 w-full items-center justify-center gap-2 bg-primary font-display text-lg text-bg" onClick={begin}>
              <RotateCcw className="size-5" aria-hidden />
              Run it back
            </button>
            <button
              type="button"
              className="mt-2 h-12 w-full border border-border font-display text-lg text-fg"
              onClick={() => {
                const race = raceRef.current;
                if (race) {
                  race.phase = "menu";
                  setBest({ lap: race.bestLap, race: race.bestRace });
                }
                soundRef.current?.stopMusic();
                modeRef.current = "menu";
                setMode("menu");
              }}
            >
              Switch rig
            </button>
          </div>
        </div>
      ) : null}

      {touchUi && mode === "racing" ? (
        <div className="safe-b absolute inset-x-0 bottom-0 z-20 grid grid-cols-4 gap-2 p-3 sm:hidden">
          <Touch label="LEFT" {...hold("left")} />
          <Touch label="RIGHT" {...hold("right")} />
          <Touch label="DRIFT" {...hold("drift")} />
          <Touch label="SPIKE" {...hold("drop")} />
          <Touch label="BRAKE" {...hold("brake")} />
          <Touch label="GAS" className="col-span-1 bg-primary text-bg" {...hold("gas")} />
          <Touch label="FIRE" {...hold("fire")} />
          <Touch label="NITRO" className="bg-primary text-bg" {...hold("nitro")} />
        </div>
      ) : null}
    </main>
  );
}

function Meter({ label, width }: { label: string; width: string }) {
  return (
    <span>
      <span className="block">{label}</span>
      <span className="mt-1 block h-1 bg-bg">
        <span className={"block h-full bg-primary " + width} />
      </span>
    </span>
  );
}

function Bar({
  bind,
  id,
  label,
  icon,
  tone,
  labelRef,
}: {
  bind: (key: string) => (el: HTMLElement | null) => void;
  id: string;
  label: string;
  icon: ReactNode;
  tone: string;
  labelRef?: string;
}) {
  return (
    <div className="mt-1.5">
      <div className="mb-0.5 flex items-center gap-1 text-xs font-semibold tracking-widest text-muted">
        {icon}
        <span ref={labelRef ? bind(labelRef) : undefined}>{label}</span>
      </div>
      <div className="h-2 w-full bg-bg">
        <div ref={bind(id)} className={"h-full origin-left " + tone} />
      </div>
    </div>
  );
}

function Touch({
  label,
  className = "",
  ...rest
}: { label: string; className?: string } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      tabIndex={-1}
      className={
        "flex h-12 items-center justify-center border border-border bg-surface font-display text-sm text-fg " +
        className
      }
      {...rest}
    >
      {label}
    </button>
  );
}

function paintHud(els: Record<string, HTMLElement | null>, race: Race, speed: number) {
  const p = race.cars[0];
  if (!p || race.phase === "menu") return;
  const place = els.place;
  if (place) place.textContent = ordinal(p.place);
  const lap = els.lap;
  if (lap) lap.textContent = `${Math.min(LAPS, p.finished ? p.laps : p.laps + 1)}/${LAPS}`;
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

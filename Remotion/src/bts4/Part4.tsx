import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import manifest from "./manifest.json";
import { fontFamily } from "../island/fonts";
import { PassengerId } from "../bts/cast";
import { Passenger } from "../bts/Passenger";
import { FLOOR_Y, TrainInterior } from "../bts/TrainInterior";
import { MapMarker, TrainMap } from "../bts/TrainMap";
import { Countdown } from "../bts/Countdown";
import { ZombieFace } from "../bts/ZombieFace";
import { Cloud, Impact, SlidingDoor } from "../bts/Fx";
import { ANCHOR, Cam, makeCamera } from "./camera";

const { cues, shots, starts, total, outroStart } = manifest;
const c = cues as Record<string, number>;
const le = (i: number) => c[`lineEnd${i}`];
const W = 1080;
const H = 1920;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ramp = (g: number, a: number, b: number) => clamp01((g - a) / Math.max(1, b - a));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);
const PHASE_SPEED = 0.22;
const RUN_SPEED = 0.36;
const TAG_FRAMES = 34;
const FADE = 10;
const ZOMBIE_FACE_FRAMES = 55;

// ---------------- the cast on stage ----------------
type Item = "umbrella" | "extinguisher" | "bag" | null;
type Pp = { key: string; id: PassengerId; x: number; y: number; facing: 1 | -1; pose: "stand" | "sit" | "hold" | "shamble" | "fall"; walk: number; infection: number; fear: number; headTilt: number; label: boolean; rot: number; mark: number; item: Item; swing?: number; swingAmp?: number; run: boolean };

// one name tag at a time (the living only)
const TAGS: { id: PassengerId; t: number }[] = [
  { id: "mike", t: c.itemsAt + 10 },
  { id: "nun", t: c.itemsAt + 48 },
  { id: "aunt", t: c.holdAt - 4 },
];

const P = (g: number, o: Partial<Pp> & { key: string; id: PassengerId; x: number; y: number }): Pp => {
  const tag = TAGS.find((t) => t.id === o.id);
  const living = (o.infection ?? 0) < 0.5;
  return { facing: -1, pose: "stand", walk: 0, infection: 0, fear: 0, headTilt: 0, rot: 0, mark: 0, item: null, run: false, ...o, label: !!tag && living && g >= tag.t && g < tag.t + TAG_FRAMES } as Pp;
};
const keyHash = (k: string) => Array.from(k).reduce((s, ch) => s + ch.charCodeAt(0), 0) % 7;

const Cast: React.FC<{ g: number; list: Pp[] }> = ({ g, list }) => (
  <>
    {[...list].sort((a, b) => a.y - b.y).map((p) => (
      <g key={p.key} transform={p.rot ? `rotate(${p.rot} ${p.x} ${p.y})` : undefined}>
        <Passenger id={p.id} x={p.x} y={p.y} scale={1.7} facing={p.facing} phase={g * (p.run ? RUN_SPEED : PHASE_SPEED) + keyHash(p.key) * 0.9} walk={p.walk} frame={g} infection={p.infection} pose={p.pose} headTilt={p.headTilt} label={p.label} fear={p.fear} mark={p.mark} item={p.item} swing={p.swing} swingAmp={p.swingAmp} />
      </g>
    ))}
  </>
);

const scrollAt = (g: number) => 22 * g;
const zb = (g: number, key: string, id: PassengerId, x: number, y: number, facing: 1 | -1, extra: Partial<Pp> = {}) => P(g, { key, id, x, y, facing, pose: "shamble", walk: 1, infection: 1, headTilt: 12, ...extra });

// ====================================================================================================================
// Scene A: car 4 (mirrored, as in Part 3): the clock runs out, the boy rises, everybody runs for the walkway
// ====================================================================================================================
const S4_END = c.itemsAt + FADE;
const OFF = 1500;
const REAR_X = 2100;
const CORRIDOR_X = 600;
const RUN_END = 640; // the walkway, where the dark corridor begins

const RunLeft = (g: number, x0: number, t0: number, x1: number) => lerp(x0, x1, ramp(g, t0, S4_END));

const stage4 = (g: number): Pp[] => {
  const out: Pp[] = [];
  const wob = (k: number, f = 0.5) => Math.sin(g * f + k);
  const limp = ramp(g, c.clockZero - 30, c.clockZero);
  const turned = g >= c.riseAt;
  const lane = (t0: number, y0: number, y1: number) => FLOOR_Y + lerp(y0, y1, smooth(ramp(g, t0, t0 + 25)));
  const scared = ramp(g, c.riseAt - 20, c.riseAt + 10);

  // the boy: slumps as the time runs out, rises as a zombie facing ป้าสมจิตร, then turns after the others
  const boyInf = turned ? 1 : lerp(0.55, 0.95, ramp(g, c.clockZero - 30, c.riseAt));
  out.push(P(g, { key: "nueng", id: "nueng", x: g >= c.runAt ? 1560 - 0.45 * (g - c.runAt) : 1560, y: FLOOR_Y + 115, facing: g < c.runAt ? 1 : -1, pose: turned ? "shamble" : "stand", walk: turned ? (g >= c.runAt ? 1 : 0.3) : 0, infection: boyInf, headTilt: turned ? 12 : 6 + 34 * limp + wob(1, 0.2) * 2, fear: turned ? 0 : 0.2 * (1 - limp), mark: 1 }));

  // ป้าสมจิตร holds him until the last seconds, lets go, runs
  const auntT0 = c.letGoAt + 8;
  const auntRun = g >= auntT0;
  out.push(P(g, { key: "aunt", id: "aunt", x: auntRun ? RunLeft(g, 1650, auntT0, RUN_END - 20) : 1650, y: lane(auntT0, 115, 140), facing: -1, walk: auntRun ? 1 : 0, run: auntRun, fear: auntRun ? 0.6 : 0.7, headTilt: auntRun ? 0 : wob(2, 0.3) * 4 + 8 * limp }));

  // the other three: watch, then run past the boy in the lanes in front of him
  const nunT0 = c.runAt - 30;
  const nunRun = g >= nunT0;
  out.push(P(g, { key: "nun", id: "nun", x: nunRun ? RunLeft(g, 1440, nunT0, RUN_END - 40) : 1440, y: lane(nunT0, 55, 165), facing: -1, walk: nunRun ? 1 : 0, run: nunRun, fear: Math.max(0.4, 0.6 * scared) }));
  const mikeT0 = c.runAt - 10;
  const mikeRun = g >= mikeT0;
  out.push(P(g, { key: "mike", id: "mike", x: mikeRun ? RunLeft(g, 1800, mikeT0, RUN_END + 20) : 1800, y: lane(mikeT0, 30, 190), facing: -1, walk: mikeRun ? 1 : 0, run: mikeRun, fear: Math.max(0.3, 0.5 * scared) }));
  const youT0 = c.runAt;
  const youRun = g >= youT0;
  out.push(P(g, { key: "you", id: "you", x: youRun ? RunLeft(g, 1950, youT0, RUN_END) : 1950, y: lane(youT0, 40, 215), facing: -1, walk: youRun ? 1 : 0, run: youRun, fear: Math.max(0.4, 0.6 * scared) }));

  // the three zombies from Part 3 keep coming; they turn after the survivors
  const hold = Math.min(g, c.runAt + 60);
  const zx = (base: number) => base + 0.25 * hold - 0.3 * Math.max(0, g - (c.runAt + 60));
  const zf: 1 | -1 = g < c.runAt + 60 ? 1 : -1;
  out.push(zb(g, "man1", "man1", zx(1000), FLOOR_Y + 40, zf));
  out.push(zb(g, "woman1", "woman1", zx(890), FLOOR_Y + 55, zf));
  out.push(zb(g, "uncle", "uncle", zx(780), FLOOR_Y + 45, zf));
  return out;
};

const Corridor: React.FC = () => (
  <g>
    <rect x={-700} y={-1200} width={CORRIDOR_X + 700} height={3100} fill="#23262a" />
    <rect x={-700} y={FLOOR_Y} width={CORRIDOR_X + 700} height={700} fill="#3a3d41" />
    {Array.from({ length: 5 }, (_, i) => <rect key={i} x={CORRIDOR_X - 80 - i * 130} y={780} width={14} height={FLOOR_Y - 780} fill="#14161a" opacity={0.7} />)}
    <rect x={-700} y={FLOOR_Y} width={CORRIDOR_X + 700} height={8} fill="#6b6f74" opacity={0.6} />
  </g>
);

const RearEnd: React.FC = () => (
  <g>
    <rect x={REAR_X} y={-1200} width={1500} height={3100} fill="#cfcbbd" />
    <rect x={REAR_X} y={FLOOR_Y} width={1500} height={700} fill="#5f6367" />
    <rect x={REAR_X + 80} y={800} width={240} height={420} rx={14} fill="#2a2f33" stroke="#8c918f" strokeWidth={10} />
    <rect x={REAR_X + 100} y={830} width={200} height={170} fill="#8fb0c4" opacity={0.7} />
    <rect x={REAR_X} y={500} width={14} height={800} fill="#8c918f" />
  </g>
);

const cam4 = makeCamera("car4", [
  [0, 1620, 1020, 1.9],
  [c.hookCut - 30, 1580, 1030, 1.6],
  [c.hookCut, 1330, 1040, 1.0],
  [c.clockZero - 20, 1600, 1030, 1.5],
  [c.riseAt - 4, 1580, 1020, 1.8],
  [c.faceEnd + 10, 1520, 1040, 1.25],
  [c.runAt, 1400, 1050, 1.1],
  [c.runAt + 90, 1050, 1050, 1.0],
  [S4_END, 760, 1050, 1.0],
]);

const SceneCar4: React.FC<{ g: number }> = ({ g }) => {
  const cam = cam4(g);
  return (
    <Stage cam={cam}>
      <g transform={`translate(${OFF},0)`}>
        <TrainInterior frame={g} scroll={scrollAt(g)} doors={0} lights={0.9 + 0.1 * clamp01((g - c.riseAt) / 30)} station="เพลินจิต" carNumber={4} mirror />
      </g>
      <Corridor />
      <RearEnd />
      <Cast g={g} list={stage4(g)} />
    </Stage>
  );
};

// ====================================================================================================================
// Scene B: car 3: the umbrella, the extinguisher, the bags
// ====================================================================================================================
const S3_FROM = c.itemsAt;
const S3_END = c.car2At + FADE;
const EXT_X = 1410; // the extinguisher hangs on the window pillar
const BAG_X = 1000; // the bags lie on the bench

const stage3 = (g: number): Pp[] => {
  const t = g - S3_FROM;
  const mv = (x0: number, x1: number, a: number, b: number) => lerp(x0, x1, smooth(ramp(t, a, b)));
  const moving = (a: number, b: number) => (t > a && t < b ? 1 : 0);
  const out: Pp[] = [];
  const mikeX = mv(1650, 1330, 0, 60);
  out.push(P(g, { key: "mike", id: "mike", x: mikeX, y: FLOOR_Y + 30, walk: moving(0, 60), item: t >= 22 ? "umbrella" : null, fear: 0.2, swing: t >= 22 ? 0.08 : undefined, swingAmp: 12 }));
  const nunX = mv(1760, EXT_X + 110, 0, 55);
  out.push(P(g, { key: "nun", id: "nun", x: nunX, y: FLOOR_Y + 85, walk: moving(0, 55), item: t >= 58 ? "extinguisher" : null, fear: 0.3, swing: t >= 58 ? 0.08 : undefined, swingAmp: 6, facing: -1 }));
  const youX = mv(1860, BAG_X + 150, 0, 92);
  out.push(P(g, { key: "you", id: "you", x: youX, y: FLOOR_Y + 140, walk: moving(0, 92), item: t >= 96 ? "bag" : null, fear: 0.3, swing: t >= 96 ? -1.5 : undefined, swingAmp: 60 }));
  out.push(P(g, { key: "aunt", id: "aunt", x: mv(1960, 1700, 0, 70), y: FLOOR_Y + 40, walk: moving(0, 70), fear: 0.7 }));
  return out;
};

const WallExtinguisher: React.FC<{ taken: boolean }> = ({ taken }) => (
  <g>
    <rect x={EXT_X - 34} y={846} width={68} height={170} rx={10} fill="#f2f2ee" stroke="#c9392f" strokeWidth={5} />
    <rect x={EXT_X - 24} y={800} width={48} height={36} rx={6} fill="#c9392f" />
    <text x={EXT_X} y={827} textAnchor="middle" fontFamily={fontFamily} fontSize={20} fill="#fff">ดับเพลิง</text>
    {!taken && (
      <g>
        <rect x={EXT_X - 17} y={868} width={34} height={104} rx={13} fill="#d9322b" />
        <rect x={EXT_X - 9} y={852} width={18} height={20} rx={5} fill="#2a2e33" />
        <rect x={EXT_X - 22} y={900} width={44} height={10} fill="#f1f1f1" opacity={0.8} />
      </g>
    )}
  </g>
);

const BagPile: React.FC<{ taken: boolean }> = ({ taken }) => (
  <g opacity={taken ? 0 : 1}>
    <rect x={BAG_X - 70} y={1146} width={58} height={48} rx={12} fill="#b5651d" />
    <rect x={BAG_X - 4} y={1138} width={62} height={56} rx={14} fill="#3f6fa5" />
    <rect x={BAG_X + 66} y={1150} width={54} height={44} rx={12} fill="#6b8f71" />
  </g>
);

const cam3 = makeCamera("car3", [
  [S3_FROM, 1760, 1040, 1.15],
  [S3_FROM + 50, 1500, 1050, 1.3],
  [S3_FROM + 95, 1250, 1050, 1.3],
  [S3_END, 1150, 1050, 1.1],
]);

const SceneCar3: React.FC<{ g: number }> = ({ g }) => {
  const cam = cam3(g);
  const t = g - S3_FROM;
  return (
    <Stage cam={cam}>
      <TrainInterior frame={g} scroll={scrollAt(g)} doors={0} lights={1} station="อโศก" carNumber={3} />
      <Vestibule />
      <WallExtinguisher taken={t >= 56} />
      <BagPile taken={t >= 94} />
      <Cast g={g} list={stage3(g)} />
    </Stage>
  );
};

// ====================================================================================================================
// Scene C: car 2: the fight. Survivors walk LEFT toward the front; the zombies fill the aisle.
// ====================================================================================================================
const S2_END = c.doorAt + FADE;
const M0 = 1500;
const FIGHT_DIST = 900;
const M = (g: number) => (g < c.fightAt ? lerp(1950, M0, smooth(ramp(g, c.car2At, c.car2At + 95))) : M0 - FIGHT_DIST * ramp(g, c.fightAt, c.doorAt - 15));
const OFF_N = 150;
const OFF_Y = 280;
const OFF_A = 430;
const LANE_M = 30;
const LANE_N = 90;
const LANE_Y = 150;
const REACH = 340;
const DRIFT = 0.3;

type Beat = { lane: number; off: number; h: number; kind: "jab" | "cloud" | "swing"; id: PassengerId };
const BEATS: Beat[] = [
  { lane: LANE_M, off: 0, h: c.fightAt + 12, kind: "jab", id: "man1" },
  { lane: LANE_M, off: 0, h: c.fightAt + 28, kind: "jab", id: "woman1" },
  { lane: LANE_M, off: 0, h: c.fightAt + 44, kind: "jab", id: "uncle" },
  { lane: LANE_N, off: OFF_N, h: c.sprayAt + 8, kind: "cloud", id: "uncle" },
  { lane: LANE_N, off: OFF_N, h: c.sprayAt + 22, kind: "cloud", id: "man1" },
  { lane: LANE_N, off: OFF_N, h: c.sprayAt + 36, kind: "cloud", id: "woman1" },
  { lane: LANE_Y, off: OFF_Y, h: c.swingAt + 8, kind: "swing", id: "woman1" },
  { lane: LANE_Y, off: OFF_Y, h: c.swingAt + 22, kind: "swing", id: "uncle" },
  { lane: LANE_Y, off: OFF_Y, h: c.swingAt + 36, kind: "swing", id: "man1" },
];
const CROWD: { lane: number; x: number; id: PassengerId }[] = [
  { lane: 10, x: 430, id: "man1" }, { lane: 70, x: 490, id: "woman1" }, { lane: 130, x: 360, id: "uncle" }, { lane: 45, x: 290, id: "woman1" },
  { lane: 105, x: 210, id: "man1" }, { lane: 165, x: 270, id: "uncle" }, { lane: 20, x: 120, id: "uncle" }, { lane: 85, x: 60, id: "man1" },
  { lane: 145, x: 10, id: "woman1" }, { lane: 55, x: -100, id: "woman1" }, { lane: 115, x: -160, id: "man1" }, { lane: 170, x: -60, id: "uncle" },
];

const beatZombie = (g: number, b: Beat, i: number): Pp => {
  const x0 = M(b.h) + b.off - REACH - DRIFT * (b.h - c.fightAt);
  const hit = ramp(g, b.h, b.h + 14);
  const kb = (b.kind === "cloud" ? 70 : 150) * smooth(hit);
  const fall = b.kind === "cloud" ? ramp(g, b.h + 22, b.h + 46) : ramp(g, b.h + 4, b.h + 26);
  const x = x0 + DRIFT * (Math.min(g, b.h) - c.fightAt) - kb;
  const y = FLOOR_Y + lerp(b.lane, -8, smooth(fall));
  const reel = b.kind === "cloud" && g >= b.h && fall < 1 ? Math.sin(g * 0.8) * 22 : 0;
  return zb(g, `bz${i}`, b.id, x, y, 1, { pose: fall > 0 ? "stand" : "shamble", walk: fall > 0 ? 0 : 1, headTilt: 12 + reel + 20 * hit, rot: -88 * smooth(fall), fear: fall > 0 ? 0.6 : 0 });
};

const stage2 = (g: number): Pp[] => {
  const out: Pp[] = [];
  const m = M(g);
  const walking = g < c.car2At + 95 || (g >= c.fightAt && g < c.doorAt - 15) ? 1 : 0;
  const readyT = ramp(g, c.fightAt - 40, c.fightAt - 10);
  const run = false;
  // ไมค์: the umbrella, jabs in the first beat
  const jabbing = g >= c.fightAt && g < c.sprayAt + 8;
  out.push(P(g, { key: "mike", id: "mike", x: m, y: FLOOR_Y + LANE_M, walk: walking, run, item: "umbrella", swing: jabbing ? (g - c.fightAt) * 0.42 : 0.08, swingAmp: jabbing ? 26 : 10, fear: 0.2 }));
  // พี่นุ่น: the extinguisher, sprays in the second beat
  out.push(P(g, { key: "nun", id: "nun", x: m + OFF_N, y: FLOOR_Y + LANE_N, walk: walking, item: "extinguisher", swing: 0.08, swingAmp: 4, fear: 0.2 }));
  // "you": the bags, swings in the third beat
  const swinging = g >= c.swingAt && g < c.sprayEnd + 25;
  out.push(P(g, { key: "you", id: "you", x: m + OFF_Y, y: FLOOR_Y + LANE_Y, walk: walking, item: "bag", swing: swinging ? (g - c.swingAt) * 0.34 : -1.5, swingAmp: swinging ? 65 : 60, fear: 0.3 * (1 - readyT) + 0.1 }));
  // ป้าสมจิตร: behind them, frightened
  out.push(P(g, { key: "aunt", id: "aunt", x: m + OFF_A, y: FLOOR_Y + 60, walk: walking, fear: 0.8, headTilt: Math.sin(g * 0.3) * 4 }));

  BEATS.forEach((b, i) => out.push(beatZombie(g, b, i)));
  CROWD.forEach((z, i) => out.push(zb(g, `cz${i}`, z.id, z.x + DRIFT * (g - c.fightAt), FLOOR_Y + z.lane, 1)));
  return out;
};

const camKeys2 = () => {
  const mj = M(c.jabAt);
  const ms = M(c.sprayAt) + OFF_N;
  const mw = M(c.swingAt) + OFF_Y;
  return [
    [c.car2At, 1700, 1040, 1.0],
    [c.car2At + 70, 1380, 1040, 1.0],
    [c.car2At + 125, 700, 1040, 0.85],
    [c.fightAt - 30, 1200, 1040, 1.0],
    [c.jabAt + 8, mj - 240, 1060, 1.5],
    [c.sprayAt, ms - 250, 1060, 1.5],
    [c.swingAt, mw - 250, 1060, 1.5],
    [c.swingAt + 45, M(c.swingAt + 45) - 150, 1050, 1.15],
    [c.sprayEnd, M(c.sprayEnd) - 100, 1050, 1.05],
    [S2_END, 500, 1040, 1.0],
  ] as [number, number, number, number][];
};
const cam2 = makeCamera("car2", camKeys2());

const SceneCar2: React.FC<{ g: number }> = ({ g }) => {
  const cam = cam2(g);
  const nunX = M(g) + OFF_N;
  const sprayT = g < c.sprayEnd ? 0.5 * ramp(g, c.sprayAt, c.sprayAt + 25) : 0.5 + 0.5 * ramp(g, c.sprayEnd, c.sprayEnd + 25);
  const impacts = BEATS.filter((b) => g >= b.h && g < b.h + 14);
  return (
    <Stage cam={cam}>
      <TrainInterior frame={g} scroll={scrollAt(g)} doors={0} lights={0.92 + 0.08 * Math.sin(g * 0.3)} station="ชิดลม" carNumber={2} />
      <Vestibule />
      <Cast g={g} list={stage2(g)} />
      {g >= c.sprayAt && g < c.sprayEnd + 28 && <Cloud x={nunX - 160} y={FLOOR_Y + LANE_N - 300} t={sprayT} facing={-1} />}
      {impacts.filter((b) => b.kind !== "cloud").map((b) => <Impact key={b.h} x={M(b.h) + b.off - REACH + 40} y={FLOOR_Y + b.lane - 270} t={(g - b.h) / 14} />)}
    </Stage>
  );
};

// ====================================================================================================================
// Scene D: car 1, the sliding door at the rear end: ป้าสมจิตร holds it, the boy slips through
// ====================================================================================================================
const S1_FROM = c.doorAt;
const S1_END = c.skinAt + 50;
const DOOR_X = 1880;
const VEST_X = 2000;
const doorOpen = (g: number) => {
  const pushed = 0.18 + 0.05 * Math.sin(g * 1.7);
  if (g < c.holdAt) return lerp(1, 1, 0);
  if (g < c.holdAt + 30) return lerp(1, pushed, smooth(ramp(g, c.holdAt, c.holdAt + 30)));
  if (g < c.endAt) return pushed;
  return lerp(pushed, 0.3, ramp(g, c.endAt, c.endAt + 16));
};

const stage1 = (g: number): Pp[] => {
  const out: Pp[] = [];
  const t = g - S1_FROM;
  const aunt = g < c.endAt + 2;
  const noticed = ramp(g, c.holdAt - 20, c.holdAt);
  // the horde presses at the door; the boy leads
  const boyX = g < c.endAt + 8 ? Math.max(2050, 2110 - 0.5 * t) : 2050 - 5 * ramp(g, c.endAt + 8, c.endAt + 40) - 0.45 * Math.max(0, g - (c.endAt + 40)) * 1;
  const boySlipped = g >= c.endAt + 8;
  out.push(P(g, aunt && g < c.endAt ? { key: "aunt", id: "aunt", x: lerp(2000, 1760, smooth(ramp(g, S1_FROM, S1_FROM + 40))), y: FLOOR_Y + 40, facing: 1, walk: ramp(g, S1_FROM, S1_FROM + 40) < 1 ? 1 : 0, swing: g >= c.holdAt - 6 ? 0.08 : undefined, swingAmp: 4, fear: 0.75, headTilt: -6 * noticed } : { key: "aunt", id: "aunt", x: -999, y: FLOOR_Y, infection: 0 }));
  out.push(P(g, { key: "nun", id: "nun", x: lerp(1950, 1250, ramp(g, S1_FROM, S1_FROM + 85)), y: FLOOR_Y + 85, facing: -1, walk: ramp(g, S1_FROM, S1_FROM + 85) < 1 ? 1 : 0, run: true, item: "extinguisher", swing: 0.08, swingAmp: 4, fear: 0.5 }));
  out.push(P(g, { key: "mike", id: "mike", x: lerp(2000, 1370, ramp(g, S1_FROM, S1_FROM + 85)), y: FLOOR_Y + 35, facing: g < c.endAt + 20 ? -1 : -1, walk: ramp(g, S1_FROM, S1_FROM + 85) < 1 ? 1 : 0, run: true, item: "umbrella", swing: 0.08, swingAmp: 10, fear: 0.4 }));
  // "you": stop next to the door to watch, then turn away and run when the door gives
  const youStop = lerp(2040, 1690, smooth(ramp(g, S1_FROM, S1_FROM + 45)));
  const away = ramp(g, c.endAt + 22, c.biteAt - 6);
  const youX = youStop - 90 * away;
  const youFace: 1 | -1 = g < c.endAt + 22 && g > S1_FROM + 45 ? 1 : -1;
  out.push(P(g, { key: "you", id: "you", x: youX, y: FLOOR_Y + 130, facing: g < S1_FROM + 45 ? -1 : youFace, walk: ramp(g, S1_FROM, S1_FROM + 45) < 1 ? 1 : away > 0 && away < 1 ? 1 : 0, run: true, fear: 0.7, item: "bag", swing: -1.5, swingAmp: 60 }));
  // the horde
  out.push(zb(g, "z-boy", "nueng", boySlipped ? Math.min(boyX, 2050) - 190 * ramp(g, c.endAt + 8, c.endAt + 40) * 0.8 : boyX, FLOOR_Y + 55, boySlipped ? -1 : -1, { infection: 1, mark: 1, walk: 1 }));
  out.push(zb(g, "z-man", "man1", 2170 - 0.3 * t, FLOOR_Y + 30, -1));
  out.push(zb(g, "z-woman", "woman1", 2240 - 0.3 * t, FLOOR_Y + 85, -1));
  out.push(zb(g, "z-uncle", "uncle", 2320 - 0.3 * t, FLOOR_Y + 50, -1));
  return out;
};

const Vestibule: React.FC = () => (
  <g>
    <rect x={VEST_X} y={-1200} width={1100} height={3100} fill="#1b1e22" />
    <rect x={VEST_X} y={FLOOR_Y} width={1100} height={700} fill="#2d3034" />
    {Array.from({ length: 6 }, (_, i) => <rect key={i} x={VEST_X + 60 + i * 150} y={780} width={14} height={FLOOR_Y - 780} fill="#0d0f12" opacity={0.7} />)}
    <rect x={VEST_X} y={FLOOR_Y} width={1100} height={8} fill="#55595e" opacity={0.6} />
  </g>
);

const cam1 = makeCamera("car1door", [
  [S1_FROM, 1800, 1040, 1.1],
  [c.holdAt, 1900, 1050, 1.5],
  [c.endAt - 10, 1920, 1050, 1.7],
  [c.endAt + 30, 1760, 1050, 1.4],
  [c.biteAt - 15, 1760, 1050, 1.5],
  [c.skinAt + 30, 1600, 1050, 1.2],
  [S1_END, 1400, 1050, 1.0],
]);

const SceneCar1Door: React.FC<{ g: number }> = ({ g }) => {
  const cam = cam1(g);
  const people = stage1(g);
  const behind = people.filter((p) => p.key.startsWith("z-") && p.x >= VEST_X - 30 + 10);
  const front = people.filter((p) => !behind.includes(p));
  const shake = g >= c.holdAt && g < c.endAt ? Math.sin(g * 2.3) * 3 : 0;
  return (
    <Stage cam={cam}>
      <TrainInterior frame={g} scroll={scrollAt(g)} doors={0} lights={0.85 + 0.1 * Math.sin(g * 0.9)} station="ราชดำริ" carNumber={1} />
      <Vestibule />
      <Cast g={g} list={behind} />
      <g transform={`translate(${shake},0)`}><SlidingDoor x={DOOR_X} open={doorOpen(g)} /></g>
      <Cast g={g} list={front} />
    </Stage>
  );
};

// ====================================================================================================================
// Scene E: the front of car 1: the cab door
// ====================================================================================================================
const S5_FROM = c.skinAt + 40;
const CAB_X = -640;

const stage5 = (g: number): Pp[] => {
  const t = (a: number, b: number) => smooth(ramp(g, a, b));
  const arrive = (x0: number, x1: number, a: number, b: number) => lerp(x0, x1, t(a, b));
  const moving = (a: number, b: number) => (g > a && g < b ? 1 : 0);
  const f = c.cabAt + 30;
  const calm = ramp(g, c.cabAt, c.cabAt + 40);
  return [
    P(g, { key: "mike", id: "mike", x: arrive(120, CAB_X + 190, S5_FROM, f), y: FLOOR_Y + 30, facing: -1, walk: moving(S5_FROM, f), run: true, item: "umbrella", swing: 0.08, swingAmp: 10, fear: 0.4 }),
    P(g, { key: "nun", id: "nun", x: arrive(280, CAB_X + 360, S5_FROM, f + 6), y: FLOOR_Y + 90, facing: -1, walk: moving(S5_FROM, f + 6), run: true, item: "extinguisher", swing: 0.08, swingAmp: 4, fear: 0.4 }),
    P(g, { key: "you", id: "you", x: arrive(440, CAB_X + 530, S5_FROM, f + 12), y: FLOOR_Y + 145, facing: -1, walk: moving(S5_FROM, f + 12), run: true, item: "bag", swing: -1.5, swingAmp: 60, fear: 0.6 * (1 - calm) + 0.3 }),
  ];
};

const CabDoor: React.FC<{ g: number }> = ({ g }) => {
  const lamp = 0.5 + 0.5 * Math.sin(g * 0.35);
  return (
    <g>
      <rect x={CAB_X - 130} y={700} width={260} height={FLOOR_Y - 700} fill="#1a1d21" />
      <rect x={CAB_X - 106} y={730} width={212} height={FLOOR_Y - 730} fill="#454c54" stroke="#8c918f" strokeWidth={8} />
      <rect x={CAB_X - 62} y={800} width={124} height={170} rx={10} fill="#10161b" stroke="#6b737b" strokeWidth={6} />
      <ellipse cx={CAB_X} cy={900} rx={46} ry={62} fill="#ff6a3a" opacity={0.1 + 0.1 * lamp} />
      <rect x={CAB_X + 58} y={1080} width={16} height={70} rx={6} fill="#d9dde0" />
      <rect x={CAB_X - 94} y={650} width={188} height={46} rx={8} fill="#0d3d2a" />
      <text x={CAB_X} y={684} textAnchor="middle" fontFamily={fontFamily} fontSize={30} fill="#ffffff">ห้องคนขับ</text>
      <circle cx={CAB_X} cy={620} r={14} fill="#ff3b30" opacity={0.3 + 0.7 * lamp} />
    </g>
  );
};

const cam5 = makeCamera("cab", [
  [S5_FROM, 60, 1040, 1.05],
  [c.cabAt, -150, 1040, 1.1],
  [c.cabAt + 60, -420, 1040, 1.3],
  [outroStart, -430, 1050, 1.5],
]);

const SceneCab: React.FC<{ g: number }> = ({ g }) => {
  const cam = cam5(g);
  return (
    <Stage cam={cam}>
      <TrainInterior frame={g} scroll={scrollAt(g)} doors={0} lights={0.82 + 0.1 * Math.sin(g * 0.9)} station="ราชดำริ" carNumber={1} />
      <CabDoor g={g} />
      <Cast g={g} list={stage5(g)} />
    </Stage>
  );
};

// ---------------- stage + screen-space pieces ----------------
const Stage: React.FC<{ cam: Cam; children: React.ReactNode }> = ({ cam, children }) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
    <g transform={`translate(${ANCHOR.x},${ANCHOR.y}) rotate(${cam.rot}) scale(${cam.zoom}) translate(${-cam.fx},${-cam.fy})`}>{children}</g>
  </svg>
);

const SceneBox: React.FC<{ g: number; from: number; to: number; first?: boolean; children: React.ReactNode }> = ({ g, from, to, first, children }) => {
  if (g < from || g > to) return null;
  const o = (first ? 1 : ramp(g, from, from + FADE)) * clamp01((to - g) / FADE);
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};

const Subtitle: React.FC<{ text: string }> = ({ text }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: 60, right: 160, bottom: 340, textAlign: "center", opacity: clamp01(f / 6), fontFamily, fontSize: 52, lineHeight: 1.6, color: "#fff", textShadow: "0 0 12px rgba(0,0,0,0.95), 0 3px 6px rgba(0,0,0,0.95)" }}>
      {text}
    </div>
  );
};

const Card: React.FC<{ g: number; from: number; to: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ g, from, to, children, style }) => {
  const o = clamp01((g - from) / 10) * clamp01((to - g) / 8);
  return <div style={{ position: "absolute", left: 80, right: 160, textAlign: "center", fontFamily, color: "#fff", opacity: o, textShadow: "0 2px 12px rgba(0,0,0,0.95)", ...style }}>{children}</div>;
};

const PART4_MARKERS: MapMarker[] = [
  { id: "cab", car: 1, pos: 0.06, kind: "driver", appearAt: 0.0 },
  { id: "nun", car: 4, pos: 0.58, kind: "ok", appearAt: 0.15 },
  { id: "mike", car: 4, pos: 0.7, kind: "ok", appearAt: 0.25 },
  { id: "aunt", car: 4, pos: 0.8, kind: "ok", appearAt: 0.35 },
  { id: "you", car: 4, pos: 0.9, kind: "you", appearAt: 0.45 },
  { id: "nueng", car: 4, pos: 0.42, kind: "infected", appearAt: 0.6 },
  { id: "man1", car: 4, pos: 0.28, kind: "infected", appearAt: 0.7 },
  { id: "woman1", car: 4, pos: 0.16, kind: "infected", appearAt: 0.8 },
  { id: "uncle", car: 4, pos: 0.06, kind: "infected", appearAt: 0.9 },
];

/** the route along the cars, drawn over the map card in the same 900x460 coordinates */
const RouteArrow: React.FC<{ t: number }> = ({ t }) => {
  const x1 = 830;
  const x2 = 70;
  const x = lerp(x1, x2, clamp01(t));
  return (
    <svg width={900} height={460} viewBox="0 0 900 460" style={{ position: "absolute", left: 0, top: 0 }}>
      <path d={`M${x1} 252 L${x} 252`} stroke="#ffd86b" strokeWidth={9} strokeDasharray="24 14" strokeLinecap="round" fill="none" opacity={0.95} />
      {t > 0.02 && <path d={`M${x + 22} 232 L${x - 8} 252 L${x + 22} 272`} stroke="#ffd86b" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" fill="none" />}
    </svg>
  );
};

const ItemIcons: React.FC<{ g: number }> = ({ g }) => {
  const t = (a: number) => ramp(g, c.itemsAt + a, c.itemsAt + a + 8);
  const slot = (cx: number, a: number, label: string, icon: React.ReactNode) => (
    <g transform={`translate(${cx},120) scale(${0.5 + 0.5 * t(a)})`} opacity={t(a)}>
      <circle r={52} fill="#1c2328" stroke="#4a5158" strokeWidth={4} />
      {icon}
      <text y={92} textAnchor="middle" fontFamily={fontFamily} fontSize={28} fill="#f1f1f1">{label}</text>
    </g>
  );
  return (
    <svg width={540} height={250} viewBox="0 0 540 250">
      <rect x={4} y={4} width={532} height={242} rx={34} fill="#0f1215" opacity={0.9} stroke="#4a5158" strokeWidth={4} />
      <text x={270} y={46} textAnchor="middle" fontFamily={fontFamily} fontSize={34} fill="#ffd86b">ของที่มี</text>
      {slot(110, 20, "ร่ม", <g transform="rotate(30)"><rect x={-3} y={-34} width={6} height={64} rx={3} fill="#23262b" /><path d="M-3 -26 Q-14 -4 -3 16 L3 16 Q14 -4 3 -26 Z" fill="#d9534f" /></g>)}
      {slot(270, 50, "ถังดับเพลิง", <g><rect x={-14} y={-28} width={28} height={58} rx={10} fill="#d9322b" /><rect x={-6} y={-38} width={12} height={12} rx={3} fill="#2a2e33" /><rect x={-14} y={-6} width={28} height={8} fill="#f1f1f1" opacity={0.85} /></g>)}
      {slot(430, 85, "กระเป๋า", <g><rect x={-26} y={-12} width={52} height={40} rx={10} fill="#b5651d" /><path d="M-10 -12 Q0 -32 10 -12" stroke="#3a2a1c" strokeWidth={5} fill="none" /></g>)}
    </svg>
  );
};

/** ป้าสมจิตร's end as a silhouette behind the door: a flash, her dark shape holding the pane, zombie arms from the right */
const DoorSilhouette: React.FC<{ g: number }> = ({ g }) => {
  const a = Math.min(1, ramp(g, c.endAt - 3, c.endAt) * (1 - ramp(g, c.endAt + 14, c.endAt + 28)));
  if (a <= 0) return null;
  const tug = ramp(g, c.endAt, c.endAt + 20);
  const sx = 120 * tug;
  return (
    <AbsoluteFill style={{ opacity: a }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 44%, #f4f1e6 0%, #bdb7a4 38%, #0b0c0e 82%)" }} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <g fill="#070707">
          <rect x={232} y={420} width={34} height={1000} />
          <rect x={800} y={420} width={34} height={1000} />
          <rect x={246} y={470} width={576} height={22} />
          {/* ป้าสมจิตร: pulled toward the door, one hand still on the pane */}
          <g transform={`translate(${sx},0)`}>
            <circle cx={400} cy={780} r={66} />
            <circle cx={380} cy={700} r={30} />
            <path d="M310 1250 Q300 900 380 860 L470 860 Q520 900 506 1250 Z" />
            <path d="M470 900 L620 820 L632 850 L494 950 Z" />
            <path d="M330 900 L250 820 L270 800 L360 870 Z" />
          </g>
          {/* the zombies on the other side: heads and reaching arms */}
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(${690 + i * 90},${i * 30})`}>
              <circle cx={0} cy={700 + i * 20} r={58} />
              <path d={`M-70 1250 Q-80 800 -20 770 L40 770 Q90 800 80 1250 Z`} />
              <path d={`M-30 840 L-${220 - tug * 90} ${800 + i * 30} L-${210 - tug * 90} ${830 + i * 30} L-10 900 Z`} />
            </g>
          ))}
        </g>
      </svg>
    </AbsoluteFill>
  );
};

const ZOMBIE_SKIN = "#a9b996";
/** the boy's teeth catch the strap of "you"'s backpack; then the skin under it, unbroken */
const StrapBite: React.FC<{ g: number }> = ({ g }) => {
  const phase1 = g < c.skinAt;
  const a = ramp(g, c.biteAt - 3, c.biteAt + 3) * (1 - ramp(g, c.skinAt + 34, c.skinAt + 46));
  if (a <= 0) return null;
  const tug = Math.sin(g * 0.9) * 7;
  const pulse = 1 + 0.03 * Math.sin(g * 0.5);
  return (
    <AbsoluteFill style={{ opacity: a }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <defs>
          <radialGradient id="sb-bg" cx="0.5" cy="0.45" r="0.8">
            <stop offset="0" stopColor="#3b4a42" />
            <stop offset="1" stopColor="#080a09" />
          </radialGradient>
        </defs>
        <rect width={W} height={H} fill="url(#sb-bg)" />
        {phase1 ? (
          <g transform={`scale(${pulse})`} style={{ transformOrigin: "540px 900px" }}>
            {/* the backpack and its strap, pulled taut */}
            <rect x={780} y={560} width={420} height={620} rx={60} fill="#2d3a52" transform={`rotate(-8 990 870) translate(${tug},0)`} />
            <rect x={840} y={900} width={260} height={150} rx={22} fill="#26324a" transform={`rotate(-8 990 870) translate(${tug},0)`} />
            <g transform={`rotate(-14 560 940) translate(${tug},0)`}>
              <rect x={330} y={900} width={640} height={70} rx={10} fill="#2d3a52" />
              <path d="M340 912 H960 M340 958 H960" stroke="#5a6d92" strokeWidth={3} strokeDasharray="14 10" />
            </g>
            {/* the boy: head in profile, mouth open over the strap */}
            <g transform={`translate(${250 + tug * 0.5},900)`}>
              <circle r={230} fill={ZOMBIE_SKIN} />
              <path d="M-228 -20 A230 230 0 0 1 150 -176 Q10 -150 -70 -90 Q-160 -60 -228 -20 Z" fill="#2a1c14" />
              <ellipse cx={86} cy={-48} rx={40} ry={46} fill="#141815" />
              <circle cx={96} cy={-52} r={13} fill="#dfe6c8" />
              <path d="M60 -120 q30 -10 60 4" stroke="#4a6a4a" strokeWidth={8} fill="none" />
              <path d="M-40 30 q16 22 8 56 M20 -10 q-14 24 -4 52" stroke="#4a6a4a" strokeWidth={6} fill="none" opacity={0.8} />
              <ellipse cx={180} cy={72} rx={96} ry={70} fill="#241313" />
              {/* teeth either side of the strap */}
              {[0, 1, 2, 3].map((i) => <path key={i} d={`M${112 + i * 36} 20 l16 54 l16 -54 Z`} fill="#e9e6d6" />)}
              {[0, 1, 2, 3].map((i) => <path key={i} d={`M${120 + i * 36} 132 l16 -46 l16 46 Z`} fill="#e9e6d6" />)}
            </g>
            {/* the strap drawn again over the lower teeth so it reads as caught between them */}
            <rect x={300} y={918} width={90} height={38} fill="#2d3a52" transform="rotate(-14 560 940)" opacity={0.0} />
          </g>
        ) : (
          <g transform={`scale(${1 + 0.05 * ramp(g, c.skinAt, c.skinAt + 40)})`} style={{ transformOrigin: "540px 900px" }}>
            {/* the shoulder: white shirt, a patch of skin at the neck, the strap torn loose with two tooth marks */}
            <path d="M-60 1500 Q80 880 540 820 Q1000 880 1140 1500 Z" fill="#f1f1ec" />
            <path d="M360 840 Q540 760 720 840 Q700 1000 540 1020 Q380 1000 360 840 Z" fill="#e9c3a3" />
            <path d="M420 860 Q540 820 660 860" stroke="#c9a285" strokeWidth={6} fill="none" opacity={0.7} />
            <path d="M720 836 L1000 1120 L930 1180 L650 900 Z" fill="#2d3a52" />
            <path d="M980 1118 l30 56 l-40 -10 l-24 40 l-8 -60 Z" fill="#2d3a52" />
            <path d="M780 900 l14 20 M812 928 l14 20" stroke="#0e1522" strokeWidth={9} strokeLinecap="round" />
            <path d="M632 860 q10 26 0 52" stroke="#9ad0ff" strokeWidth={7} fill="none" strokeLinecap="round" opacity={0.9} />
          </g>
        )}
      </svg>
    </AbsoluteFill>
  );
};

const Outro: React.FC<{ g: number }> = ({ g }) => {
  const t = g - outroStart;
  const bg = clamp01((g - (outroStart - 14)) / 14);
  return (
    <AbsoluteFill style={{ opacity: bg }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, #1d242a 0%, #07090b 70%)" }} />
      <div style={{ position: "absolute", left: 80, right: 160, top: 560, textAlign: "center", fontFamily, color: "#f1f1f1" }}>
        <div style={{ fontSize: 46, opacity: clamp01(t / 14), lineHeight: 1.6, color: "#aeb4b6" }}>ตอนต่อไป:</div>
        <div style={{ fontSize: 58, opacity: clamp01((t - 26) / 14), lineHeight: 1.5, marginTop: 12 }}>ห้องคนขับ...</div>
        <div style={{ fontSize: 56, opacity: clamp01((t - 76) / 14), marginTop: 70, color: "#ffd86b" }}>ติดตามตอนที่ 5 (ตอนจบ)</div>
      </div>
    </AbsoluteFill>
  );
};

const World: React.FC = () => {
  const g = useCurrentFrame();
  const fade = ramp(g, 0, 10);
  const clockOn = g < c.riseAt + 14;
  const seconds = Math.max(0, (c.clockZero - g) / 30);
  const heart = Math.max(0, Math.sin(g * (g < c.clockZero ? 0.5 : 0.25)));
  const mapOn = g >= c.mapIn && g < c.mapOut;
  const mapP = clamp01((g - c.mapIn) / 100);
  const faceOn = g >= c.riseAt && g < c.riseAt + ZOMBIE_FACE_FRAMES + 5;
  const itemsOn = g >= c.itemsAt + 12 && g < c.car2At + 4;
  const red = g < c.riseAt ? 0.18 + 0.2 * heart * ramp(g, 0, 30) : 0;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000", opacity: fade }}>
      <SceneBox g={g} from={0} to={S4_END} first><SceneCar4 g={g} /></SceneBox>
      <SceneBox g={g} from={S3_FROM} to={S3_END}><SceneCar3 g={g} /></SceneBox>
      <SceneBox g={g} from={c.car2At} to={S2_END}><SceneCar2 g={g} /></SceneBox>
      <SceneBox g={g} from={S1_FROM} to={S1_END}><SceneCar1Door g={g} /></SceneBox>
      <SceneBox g={g} from={S5_FROM} to={total}><SceneCab g={g} /></SceneBox>

      {red > 0 && <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 40%, rgba(150,20,20,${red}) 100%)` }} />}

      {faceOn && (
        <AbsoluteFill style={{ opacity: ramp(g, c.riseAt, c.riseAt + 5) * clamp01((c.riseAt + ZOMBIE_FACE_FRAMES + 5 - g) / 5) }}>
          <ZombieFace id="nueng" frame={g} t={clamp01((g - c.riseAt) / ZOMBIE_FACE_FRAMES)} />
        </AbsoluteFill>
      )}
      <DoorSilhouette g={g} />
      <StrapBite g={g} />

      {clockOn && !faceOn && (
        <div style={{ position: "absolute", left: 90, top: 130, opacity: ramp(g, 4, 12) * clamp01((c.riseAt + 14 - g) / 8), transform: `scale(${1 + 0.1 * (seconds <= 0 ? heart : 0)})`, transformOrigin: "top left" }}>
          <Countdown seconds={seconds} label="น้องเต้ย" pulse={heart} />
        </div>
      )}
      {g >= c.biteAt && g < c.skinAt + 6 && (
        <div style={{ position: "absolute", left: 90, top: 130, opacity: clamp01((g - c.biteAt) / 4) * clamp01((c.skinAt + 6 - g) / 6) * (0.55 + 0.45 * Math.abs(Math.sin(g * 0.7))) }}>
          <Countdown seconds={60} label="คุณ" pulse={Math.abs(Math.sin(g * 0.7))} />
        </div>
      )}
      {mapOn && (
        <div style={{ position: "absolute", left: 90, top: 130, transform: "scale(0.9)", transformOrigin: "top left", opacity: clamp01((c.mapOut - g) / 14) }}>
          <TrainMap progress={mapP} markers={PART4_MARKERS} />
          <RouteArrow t={ramp(g, c.mapIn + 45, c.mapIn + 100)} />
        </div>
      )}
      {itemsOn && (
        <div style={{ position: "absolute", left: 270, top: 150, opacity: ramp(g, c.itemsAt + 12, c.itemsAt + 20) * clamp01((c.car2At + 4 - g) / 8) }}>
          <ItemIcons g={g} />
        </div>
      )}

      {/* hook: the part's title card, on a dark plate, after the first line */}
      <Card g={g} from={Math.max(le(0), c.hookCut - 80)} to={c.hookCut} style={{ top: 150, left: 370, right: 160, fontSize: 52, lineHeight: 1.5, background: "rgba(11,13,16,0.66)", borderRadius: 32, padding: "22px 16px" }}>
        ฝ่าไปหัวขบวน...<br />ทีละตู้
      </Card>

      {/* lighting and grade: vignette, cool-top warm-bottom split tone, film grain */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 42%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.5) 100%)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(120,150,170,0.16) 0%, rgba(0,0,0,0) 45%, rgba(190,150,110,0.14) 100%)", mixBlendMode: "soft-light" }} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: 0.08, mixBlendMode: "overlay", pointerEvents: "none" }}>
        <filter id="bts4-grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={g % 7} /><feColorMatrix type="saturate" values="0" /></filter>
        <rect width={W} height={H} filter="url(#bts4-grain)" />
      </svg>

      {g >= outroStart - 14 && <Outro g={g} />}
    </AbsoluteFill>
  );
};

export const Part4: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <World />
    {shots.map((shot, i) => (
      <Sequence key={i} from={starts[i] + shot.leadFrames} durationInFrames={shot.audioFrames}>
        <Audio src={staticFile(shot.audio)} />
        <Subtitle text={shot.text} />
      </Sequence>
    ))}
    <Audio src={staticFile("bts4/bed.wav")} volume={0.5} />
  </AbsoluteFill>
);

export const PART4_TOTAL = total;

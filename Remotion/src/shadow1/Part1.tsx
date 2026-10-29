import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import manifest from "./manifest.json";
import { fontFamily } from "../island/fonts";
import { Figure, LOOKS, Mood } from "./Figure";
import { Traveller, TravellerMood } from "./Traveller";
import { Bucket, Crates, INK, Mooring, Net, PIER_TOP, Rope, SHADOW, Shade } from "./VillageVert";
import { clamp01, lerp, smooth } from "../onestar3/util";

// "หมู่บ้านที่ไม่มีใครมีเงา" Part 1, "เงาของคุณ". One world (the plank pier and the stilt village, 1080x1920 world coordinates) seen through a list of short shots
// (a new angle every 2 to 3 s, hard cuts inside a set, each shot drifting slowly). All timing comes from manifest.json (the narration audio).
// Characters only walk while they actually move, and idle (breathe, sway) otherwise. Only "you" and objects cast shadows; villagers never do.

const C = manifest.cues as Record<string, number>;
const ls = (i: number) => C[`lineStart${i}`];
const le = (i: number) => C[`lineEnd${i}`];
const SEC = 30;

const SUBTITLE_FIX = (t: string) => t.replace(/ใกล้เที่ยง/g, "ใกล้⁠เที่ยง").replace(/เงาสวยจังเลย/g, "เงา⁠สวย⁠จังเลย").replace(/พร้อมกัน/g, "พร้อม⁠กัน").replace(/ผู้ใหญ่บ้าน/g, "ผู้ใหญ่⁠บ้าน");

const Subtitle: React.FC<{ text: string; from: number; g: number }> = ({ text, from, g }) => (
  <div style={{ position: "absolute", left: 60, right: 160, bottom: 340, textAlign: "center", opacity: clamp01((g - from) / 6), fontFamily, fontSize: 52, lineHeight: 1.6, color: "#fff", textShadow: "0 0 12px rgba(0,0,0,0.95), 0 3px 6px rgba(0,0,0,0.95)" }}>
    <span style={{ background: "rgba(8,6,4,0.55)", borderRadius: 18, padding: "4px 16px", WebkitBoxDecorationBreak: "clone" } as React.CSSProperties}>{text}</span>
  </div>
);

const Card: React.FC<{ a: string; b: string; at: number; dur: number; g: number }> = ({ a, b, at, dur, g }) => {
  const o = clamp01(Math.min((g - at) / 8, (at + dur - g) / 10));
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 90, right: 170, top: 330, textAlign: "center", fontFamily, color: "#f4ead2", opacity: o, background: "rgba(10,8,6,0.62)", borderRadius: 32, padding: "26px 16px", border: "2px solid #c9b79a66", textShadow: "0 2px 12px rgba(0,0,0,0.95)" }}>
      <div style={{ fontSize: 60, lineHeight: 1.3 }}>{a}</div>
      <div style={{ fontSize: 42, marginTop: 10, color: "#d8c3a0" }}>{b}</div>
    </div>
  );
};

// ------------------------------------------------------------------ tracks: where a character is, by frame
type Pt = [number, number, number, number]; // frame, x, y, scale
const at = (g: number, pts: Pt[]) => {
  if (g <= pts[0][0]) return { x: pts[0][1], y: pts[0][2], s: pts[0][3] };
  for (let i = 1; i < pts.length; i++) {
    if (g <= pts[i][0]) {
      const a = pts[i - 1];
      const b = pts[i];
      const k = smooth(clamp01((g - a[0]) / Math.max(1, b[0] - a[0])));
      return { x: lerp(a[1], b[1], k), y: lerp(a[2], b[2], k), s: lerp(a[3], b[3], k) };
    }
  }
  const l = pts[pts.length - 1];
  return { x: l[1], y: l[2], s: l[3] };
};
/** the position and how fast it is changing (px per frame): a figure walks only when this is above a small threshold */
const track = (g: number, pts: Pt[]) => {
  const p = at(g, pts);
  const a = at(g - 2, pts);
  const b = at(g + 2, pts);
  const v = Math.hypot(b.x - a.x, (b.y - a.y) * 2) / 4;
  return { ...p, v, dir: b.x >= a.x ? 1 : -1, walk: clamp01((v - 0.25) / 0.9) };
};

type Who = { id: string; x: number; y: number; s: number; mood: Mood; face?: 1 | -1; walk?: number; up?: number; nod?: number; seed?: number };

/** a living idle: slow breathing and a small sway so nobody is a statue; walking figures skip it */
const idle = (t: number, seed: number, still: boolean) => (still ? { rot: Math.sin(t * 0.05 + seed) * 0.9, sy: 1 + Math.sin(t * 0.11 + seed * 2) * 0.008, dy: Math.sin(t * 0.11 + seed * 2) * -1.5 } : { rot: 0, sy: 1, dy: Math.abs(Math.sin(t * 0.25 + seed)) * -3 });

/** a villager: never casts a shadow */
const Villager: React.FC<Who & { t: number }> = ({ id, x, y, s, mood, face = 1, walk = 0, up = 0, nod = 0, seed = 0, t }) => {
  const i = idle(t, seed, walk < 0.05);
  return (
    <g transform={`translate(${x},${y + i.dy}) rotate(${i.rot}) scale(${s},${s * i.sy}) translate(0,${nod * 14})`}>
      <Figure look={LOOKS[id]} mood={mood} facing={face} walk={walk} armsUp={up} t={t + seed * 40} />
    </g>
  );
};

/** the wooden clapper on the mooring post: two blocks, struck once */
const Clapper: React.FC<{ hit: number }> = ({ hit }) => (
  <g transform={`translate(0,-150) rotate(${-34 * (1 - hit)})`}>
    <rect x={-74} y={-12} width={70} height={24} fill="#8a6a44" stroke={INK} strokeWidth={5} />
    <rect x={4} y={-12} width={64} height={24} fill="#7a5a3a" stroke={INK} strokeWidth={5} />
  </g>
);

const Boat: React.FC<{ x: number; y: number; rock: number }> = ({ x, y, rock }) => (
  <g transform={`translate(${x},${y + Math.sin(rock) * 4}) rotate(${Math.sin(rock * 0.8) * 1.2})`} strokeLinejoin="round">
    <path d="M-120 0 Q-60 26 130 4 L170 -22 Q0 -4 -140 -18 Z" fill="#4a3a2a" stroke={INK} strokeWidth={6} />
    <rect x={-40} y={-44} width={80} height={26} fill="#6a5034" stroke={INK} strokeWidth={5} />
    <line x1={150} y1={-14} x2={250} y2={-70} stroke={INK} strokeWidth={8} />
    <ellipse cx={0} cy={10} rx={150} ry={7} fill="#e9dcc0" opacity={0.25} />
  </g>
);

const dipOf = (g: number, a: number, b: number) => clamp01(Math.min((g - a) / 7, (b - g) / 7));

// ------------------------------------------------------------------ the shot list: [from, to, camera at the start, camera at the end]; fx = follow "you" (camera x = your x + fx)
type Cam4 = { x: number; y: number; z: number; r?: number; fx?: number };
type Shot = [number, number, Cam4, Cam4];
const SHOTS: Shot[] = [
  // hook (flash-forward): feet on the planks, the group, the faces
  [0, 64, { x: 640, y: 1230, z: 2.7 }, { x: 640, y: 1230, z: 2.45 }],
  [64, ls(1), { x: 520, y: 1040, z: 1.25 }, { x: 540, y: 1040, z: 1.4 }],
  [ls(1), ls(2), { x: 470, y: 900, z: 1.7 }, { x: 460, y: 895, z: 2.2, r: -1.5 }],
  // landing: the boat, you stepping on, your feet
  [ls(2), ls(2) + 75, { x: 520, y: 1060, z: 1.05 }, { x: 540, y: 1050, z: 1.15 }],
  [ls(2) + 75, ls(2) + 160, { x: 620, y: 1150, z: 1.4, fx: -30 }, { x: 700, y: 1220, z: 1.6, fx: -20 }],
  [ls(2) + 160, le(2) + 8, { x: 790, y: 1290, z: 2.4 }, { x: 790, y: 1290, z: 2.1 }],
  // set B: props and shadows, the child, the greeting
  [ls(3), ls(3) + 70, { x: 220, y: 1700, z: 1.6, r: 2 }, { x: 250, y: 1690, z: 1.75, r: 2 }],
  [ls(3) + 70, ls(3) + 150, { x: 820, y: 1640, z: 1.55, r: -3 }, { x: 800, y: 1630, z: 1.7, r: -3 }],
  [ls(3) + 150, ls(4) - 2, { x: 600, y: 1240, z: 1.05 }, { x: 590, y: 1230, z: 1.2 }],
  [ls(4), ls(4) + 55, { x: 150, y: 1060, z: 1.5, r: 1 }, { x: 260, y: 1070, z: 1.7, r: 1 }],
  [ls(4) + 55, le(4) + 6, { x: 250, y: 1100, z: 2.6 }, { x: 250, y: 1095, z: 2.75 }],
  [ls(5) - 6, ls(5) + 50, { x: 460, y: 1030, z: 1.15 }, { x: 460, y: 1030, z: 1.3 }],
  [ls(5) + 50, le(5) + 6, { x: 420, y: 940, z: 1.9 }, { x: 430, y: 930, z: 2.05 }],
  [ls(6), ls(6) + 80, { x: 390, y: 900, z: 2.0 }, { x: 390, y: 890, z: 2.35 }],
  [ls(6) + 80, le(6) + 6, { x: 500, y: 1050, z: 1.5, r: 2 }, { x: 600, y: 1100, z: 1.6, r: 2 }],
  [ls(7), ls(7) + 55, { x: 390, y: 880, z: 2.5 }, { x: 390, y: 875, z: 2.7 }],
  [ls(7) + 55, ls(7) + 110, { x: 800, y: 1300, z: 1.9, r: -2 }, { x: 790, y: 1290, z: 1.9, r: -2 }],
  [ls(7) + 110, le(7) + 6, { x: 790, y: 1060, z: 2.5 }, { x: 790, y: 1050, z: 2.7 }],
  // set C: walking along the planks
  [ls(8), ls(8) + 60, { x: 700, y: 1150, z: 1.4, fx: 90 }, { x: 640, y: 1150, z: 1.4, fx: 90 }],
  [ls(8) + 60, le(8) + 6, { x: 600, y: 1330, z: 2.3, fx: 0 }, { x: 520, y: 1330, z: 2.5, fx: 0 }],
  [ls(9), ls(9) + 60, { x: 420, y: 1250, z: 1.45, r: 1.5 }, { x: 470, y: 1250, z: 1.55, r: 1.5 }],
  [ls(9) + 60, le(9) + 6, { x: 600, y: 1200, z: 2.2 }, { x: 610, y: 1190, z: 2.4 }],
  [ls(10), ls(10) + 60, { x: 560, y: 1090, z: 2.0 }, { x: 560, y: 1070, z: 2.3 }],
  [ls(10) + 60, le(10) + 6, { x: 560, y: 1250, z: 3.0 }, { x: 560, y: 1255, z: 3.1 }],
  // set D: noon
  [ls(11), ls(11) + 50, { x: 880, y: 1700, z: 1.5, r: 1 }, { x: 890, y: 1690, z: 1.6, r: 1 }],
  [ls(11) + 50, le(11) + 6, { x: 930, y: 1590, z: 2.6 }, { x: 930, y: 1585, z: 2.5 }],
  [ls(12), ls(12) + 70, { x: 440, y: 1020, z: 1.15 }, { x: 450, y: 1020, z: 1.3 }],
  [ls(12) + 70, le(12) + 6, { x: 430, y: 900, z: 2.2 }, { x: 430, y: 890, z: 2.35 }],
  [ls(13), ls(13) + 60, { x: 440, y: 1020, z: 1.55 }, { x: 460, y: 1030, z: 1.6, r: -1.5 }],
  [ls(13) + 60, le(13) + 6, { x: 480, y: 1230, z: 2.8 }, { x: 480, y: 1235, z: 3.0 }],
  // set E: the afternoon
  [ls(14), ls(14) + 65, { x: 520, y: 1290, z: 1.1, r: -1 }, { x: 540, y: 1290, z: 1.2, r: -1 }],
  [ls(14) + 65, le(14) + 6, { x: 640, y: 1380, z: 1.45, r: 2 }, { x: 460, y: 1380, z: 1.45, r: 2 }],
  [ls(15), ls(15) + 80, { x: 470, y: 960, z: 1.25 }, { x: 470, y: 950, z: 1.6 }],
  [ls(15) + 80, le(15) + 40, { x: 780, y: 1080, z: 1.8 }, { x: 780, y: 1060, z: 2.2 }],
];

export const Part1: React.FC<{ g?: number }> = ({ g: gOverride }) => {
  const frameNow = useCurrentFrame();
  const g = gOverride ?? frameNow;
  const t = g;

  const hook = g < ls(2);
  const landing = g >= ls(2) && g < ls(3) - 8;
  const setB = g >= ls(3) - 8 && g < ls(8) - 6;
  const setC = g >= ls(8) - 6 && g < ls(11) - 6;
  const setD = g >= ls(11) - 6 && g < ls(14) - 6;
  const setE = g >= ls(14) - 6;
  // dips to black only between different sets
  const black = 1 - Math.max(dipOf(g, -999, ls(2) - 6), dipOf(g, ls(2) - 6, ls(3) - 6), dipOf(g, ls(3) - 6, ls(8) - 6), dipOf(g, ls(8) - 6, ls(11) - 6), dipOf(g, ls(11) - 6, ls(14) - 6), dipOf(g, ls(14) - 6, 99999));

  // ---------------------------------------------------------------- the cast, by set
  const LINE: Record<string, Pt> = {
    oldman: [0, 480, 1090, 0.5],
    cook: [0, 250, 1100, 0.52],
    head: [0, 370, 1180, 0.68],
    mother: [0, 585, 1190, 0.66],
    child: [0, 140, 1200, 0.9],
  };
  const MOODS: Record<string, Mood> = { oldman: "smile", cook: "smile", head: "smile", mother: "smile", child: "smile" };
  let you = { x: 800, y: 1300, s: 0.95, yaw: -25, mood: "worry" as TravellerMood, walk: 0, shadowK: 1, skew: -55, sq: 0.34, seed: 0 };
  const people: Who[] = [];
  const line = (id: string, m: Mood = MOODS[id], extra: Partial<Who> = {}) => people.push({ id, x: LINE[id][1], y: LINE[id][2], s: LINE[id][3], mood: m, seed: id.length, ...extra });

  if (hook) {
    // a flash-forward: the whole village stands and stares at you; only your feet have a shadow
    const m: Mood = g >= ls(1) ? "stare" : "smile";
    ["oldman", "cook", "head", "mother", "child"].forEach((id) => line(id, m));
    you = { ...you, x: 800, y: 1300, s: 0.95, yaw: -25 };
  }
  if (landing) {
    // you step off the boat onto the pier and walk toward the camera
    const tr = track(g, [[ls(2) + 30, 470, 1020, 0.62], [ls(2) + 150, 800, 1300, 0.95]]);
    you = { ...you, x: tr.x, y: tr.y, s: tr.s, walk: tr.walk, yaw: tr.walk > 0.1 ? 60 : -25 };
  }
  const grp = (id: string, from: number, side: number): Pt[] => [[from, side < 0 ? -140 : 1240, LINE[id][2], LINE[id][3]], [from + 54, LINE[id][1], LINE[id][2], LINE[id][3]]];
  if (setB) {
    you = { ...you, x: 800, y: 1300, s: 0.95, yaw: -25 };
    // the child runs across the planks (line 4)
    if (g >= ls(4) - 8 && g < ls(5) - 6) {
      const tr = track(g, [[ls(4) - 8, -90, 1190, 0.9], [ls(4) + 48, 215, 1190, 0.9]]);
      people.push({ id: "child", x: tr.x, y: tr.y, s: tr.s, mood: "smile", walk: tr.walk, seed: 3 });
    }
    // everyone walks in and greets together (line 5)
    if (g >= ls(5) - 6) {
      const wave = g >= ls(5) + 56 && g < le(5) ? Math.max(0, Math.sin((g - ls(5) - 56) / 5)) * 0.9 : 0;
      const sides: Record<string, number> = { oldman: 1, cook: -1, head: -1, mother: 1, child: -1 };
      ["oldman", "cook", "head", "mother", "child"].forEach((id) => {
        const tr = track(g, grp(id, ls(5) - 6, sides[id]));
        const faceDir: 1 | -1 = tr.walk > 0.05 ? (sides[id] < 0 ? 1 : -1) : 1;
        people.push({ id, x: tr.x, y: tr.y, s: tr.s, mood: "smile", walk: tr.walk, face: faceDir, up: tr.walk > 0.05 ? 0 : wave, seed: id.length });
      });
    }
    if (g >= ls(6) + 55) {
      // the head looks down at your feet, then back up with the same smile
      const idx = people.findIndex((p) => p.id === "head");
      if (idx >= 0) people[idx] = { ...people[idx], mood: g > ls(6) + 80 ? "smile" : "calm", nod: clamp01((g - ls(6) - 50) / 10) * (g > ls(6) + 95 ? clamp01(1 - (g - ls(6) - 95) / 10) : 1) };
    }
  }
  // set C: you follow the head along the planks, then everyone is still (they never walk in place)
  const youC = track(g, [[ls(8), 820, 1320, 0.9], [le(8), 560, 1320, 0.9]]);
  const headC = track(g, [[ls(8), 650, 1300, 0.72], [le(8), 400, 1300, 0.72]]);
  const clothT = track(g, [[ls(9) + 10, 300, 1230, 0.66], [le(9) - 10, 640, 1230, 0.66]]);
  if (setC) {
    you = { ...you, x: youC.x, y: youC.y, s: youC.s, yaw: youC.walk > 0.05 ? 270 : -20, walk: youC.walk };
    people.push(
      { id: "head", x: headC.x, y: headC.y, s: 0.72, mood: "smile", face: headC.walk > 0.05 ? -1 : 1, walk: headC.walk, seed: 1 },
      { id: "mother", x: g >= ls(9) ? clothT.x : 300, y: 1230, s: 0.66, mood: "calm", walk: g >= ls(9) ? clothT.walk : 0, face: 1, seed: 2 },
      { id: "cook", x: g >= ls(10) - 6 ? 560 : 140, y: g >= ls(10) - 6 ? 1260 : 1130, s: g >= ls(10) - 6 ? 0.85 : 0.52, mood: g >= ls(10) - 6 ? "worry" : "calm", seed: 3 },
      { id: "oldman", x: 700, y: 1110, s: 0.5, mood: "calm", seed: 4 },
    );
  }
  if (setD) {
    const down = g >= ls(12) && g < ls(12) + 40 ? clamp01((g - ls(12)) / 10) : g >= ls(12) + 40 && g < ls(13) ? clamp01(1 - (g - ls(12) - 40) / 12) : 0;
    const m: Mood = g >= ls(12) + 46 ? "smile" : "calm";
    const walkIn = track(g, [[ls(13), 800, 1300, 0.95], [ls(13) + 45, 485, 1222, 0.95]]);
    const toHat = clamp01((g - ls(13)) / 45);
    you = { ...you, x: walkIn.x, y: walkIn.y, yaw: walkIn.walk > 0.05 ? 270 : 280, walk: walkIn.walk, shadowK: lerp(1, 0.12, smooth(toHat)), sq: lerp(0.34, 0.2, toHat) };
    people.push(
      { id: "head", x: 380, y: 1180, s: 0.68, mood: m, nod: down, seed: 1 },
      { id: "mother", x: 585, y: 1190, s: 0.66, mood: m, nod: down, seed: 2 },
      { id: "oldman", x: 480, y: 1090, s: 0.5, mood: m, nod: down, seed: 4 },
      { id: "cook", x: 250, y: 1100, s: 0.52, mood: m, nod: down, seed: 3 },
      { id: "child", x: 140, y: 1200, s: 0.9, mood: m, nod: down, seed: 5 },
    );
    // the oldman by the post strikes the clapper (lines 11): he stands beside the post only for that shot
    if (g < ls(12) - 6) {
      people.length = 0;
      people.push({ id: "oldman", x: 800, y: 1860, s: 0.95, mood: "calm", up: g < C.clapAt ? clamp01((g - ls(11)) / Math.max(1, C.clapAt - ls(11))) : clamp01(1 - (g - C.clapAt) / 6), seed: 4 });
    }
  }
  if (setE) {
    const stretch = smooth(clamp01((g - ls(14)) / (le(14) - ls(14) + 40)));
    you = { ...you, x: 780, y: 1300, yaw: -20, shadowK: lerp(1, 2.1, stretch), skew: lerp(-55, -72, stretch), sq: lerp(0.34, 0.42, stretch) };
    const m: Mood = g >= ls(15) ? "stare" : "smile";
    ["oldman", "cook", "head", "mother", "child"].forEach((id) => line(id, m));
  }
  const still = you.walk < 0.05;
  const yi = idle(t, 0.7, still);
  void yi;

  // ---------------------------------------------------------------- camera: pick the shot, drift inside it, hard cut at its end
  let cam = { x: 540, y: 1100, z: 1.2, r: 0 };
  for (const [a, b, c0, c1] of SHOTS) {
    if (g >= a && g < b) {
      const k = smooth(clamp01((g - a) / Math.max(1, b - a)));
      const fx = (c: Cam4) => (c.fx !== undefined ? you.x + c.fx : c.x);
      cam = { x: lerp(fx(c0), fx(c1), k), y: lerp(c0.y, c1.y, k), z: lerp(c0.z, c1.z, k), r: lerp(c0.r ?? 0, c1.r ?? 0, k) };
    } else if (g >= b && SHOTS.indexOf([a, b, c0, c1] as Shot) < 0) {
      // after the last shot that has ended, hold its final framing until the next starts
      cam = cam;
    }
  }
  // hold the previous framing in gaps between listed shots
  if (!SHOTS.some(([a, b]) => g >= a && g < b)) {
    const prev = [...SHOTS].reverse().find(([, b]) => b <= g);
    if (prev) cam = { x: prev[3].fx !== undefined ? you.x + prev[3].fx : prev[3].x, y: prev[3].y, z: prev[3].z, r: prev[3].r ?? 0 };
  }
  cam = { ...cam, x: Math.min(Math.max(cam.x, 540 / cam.z), 1080 - 540 / cam.z), y: Math.max(cam.y, 900 / cam.z) };

  const boatX = lerp(420, 1300, smooth(clamp01((g - ls(2) - 70) / 160)));
  const clapHit = g >= C.clapAt && g < C.clapAt + 5 ? 1 : 0;
  const flash = g >= C.clapAt && g < C.clapAt + 6 ? 0.35 * (1 - (g - C.clapAt) / 6) : 0;
  const sweatT = clamp01((g - ls(10) - 8) / 30);
  const sweatOn = g >= ls(10) - 6 && g <= le(10) + 6;

  return (
    <AbsoluteFill style={{ background: "#0a0706" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <defs>
          <linearGradient id="p1-pier" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6a5438" /><stop offset="1" stopColor="#3a2a1a" /></linearGradient>
          <filter id="pv-grade" colorInterpolationFilters="sRGB">
            <feColorMatrix type="saturate" values="0.62" />
            <feColorMatrix type="matrix" values="0.92 0 0 0 0.02  0 0.88 0 0 0.02  0 0 0.8 0 0.03  0 0 0 1 0" />
            <feComponentTransfer><feFuncR type="gamma" amplitude="0.92" exponent="1.12" /><feFuncG type="gamma" amplitude="0.92" exponent="1.12" /><feFuncB type="gamma" amplitude="0.92" exponent="1.12" /></feComponentTransfer>
          </filter>
          <linearGradient id="p1-fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0.93" stopColor="#2a2118" stopOpacity="0" /><stop offset="1" stopColor="#2a2118" stopOpacity="1" /></linearGradient>
          <radialGradient id="p1-vig" cx="0.5" cy="0.5" r="0.75"><stop offset="0.5" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#0a0604" stopOpacity="0.75" /></radialGradient>
          <filter id="p1-grain"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="4" /><feColorMatrix type="saturate" values="0" /></filter>
        </defs>
        <g transform={`translate(540,900) rotate(${cam.r}) scale(${cam.z}) translate(${-cam.x},${-cam.y})`}>
          <image href={staticFile("shadow1/bg_asia.png")} x={0} y={0} width={1080} height={1250} />
          <rect y={0} width={1080} height={1250} fill="url(#p1-fade)" />
          {(hook || landing) && <Boat x={hook ? 420 : boatX} y={920} rock={t * 0.07} />}
          <g filter="url(#pv-grade)">
            <polygon points={`-400,${PIER_TOP} 1480,${PIER_TOP} 1480,2400 -400,2400`} fill="url(#p1-pier)" />
            <rect x={-400} y={PIER_TOP - 10} width={1880} height={14} fill="#2a2016" stroke={INK} strokeWidth={5} />
            {Array.from({ length: 22 }, (_, i) => {
              const y0 = PIER_TOP + 4 + i * i * 3.1 + i * 12;
              const y1 = PIER_TOP + 4 + (i + 1) * (i + 1) * 3.1 + (i + 1) * 12;
              const tone = ["#6a5438", "#5e4a32", "#6f5a3e", "#58432c"][i % 4];
              const joints = [(i * 173) % 400 + 80, (i * 291) % 380 + 560, (i * 97) % 300 + 330].sort((a, b) => a - b);
              return (
                <g key={i}>
                  <rect x={-400} y={y0} width={1880} height={y1 - y0} fill={tone} />
                  <line x1={-400} y1={y1} x2={1480} y2={y1} stroke={INK} strokeWidth={3 + i * 0.35} opacity={0.7} />
                  {joints.map((x, j) => <line key={j} x1={x} y1={y0} x2={x + (x - 540) * 0.03 * (i + 1)} y2={y1} stroke={INK} strokeWidth={2.4} opacity={0.45} />)}
                </g>
              );
            })}
            <g stroke={INK} strokeWidth={6}>
              <rect x={60} y={PIER_TOP - 150} width={26} height={150} fill="#5a4630" />
              <rect x={430} y={PIER_TOP - 150} width={26} height={150} fill="#5a4630" />
            </g>
            <Shade x={73} y={PIER_TOP + 8} skew={you.skew} sq={you.sq}><rect x={-13} y={-150} width={26} height={150} fill={SHADOW} /></Shade>
            <Shade x={443} y={PIER_TOP + 8} skew={you.skew} sq={you.sq}><rect x={-13} y={-150} width={26} height={150} fill={SHADOW} /></Shade>
            {[[430, 1470, 150, 22], [250, 1700, 120, 18], [860, 1850, 170, 24]].map(([x, y, rx, ry], i) => <ellipse key={"pd" + i} cx={x} cy={y} rx={rx} ry={ry} fill="#8c8f95" opacity={0.55} />)}
            <Shade x={940} y={1860} k={1.1} skew={you.skew} sq={you.sq}><Mooring shadow /></Shade>
            <g transform="translate(940,1860) scale(1.1)"><Mooring /><Clapper hit={clapHit} /></g>
            <Shade x={160} y={1790} skew={you.skew} sq={you.sq}><Crates shadow /></Shade>
            <g transform="translate(160,1790)"><Crates /></g>
            <Shade x={290} y={1560} k={0.8} skew={you.skew} sq={you.sq}><Bucket shadow /></Shade>
            <g transform="translate(290,1560) scale(0.8)"><Bucket /></g>
            <Shade x={640} y={1700} skew={you.skew} sq={you.sq}><Rope shadow /></Shade>
            <g transform="translate(640,1700)"><Rope /></g>
            <g transform="translate(470,1330) scale(0.9)"><Net /></g>
            {setB && g >= ls(4) - 8 && g < ls(5) && <g><Shade x={330} y={1200} k={0.9} skew={you.skew} sq={you.sq}><Bucket shadow /></Shade><g transform="translate(330,1200) scale(0.9)"><Bucket /></g></g>}
            {setD && g >= ls(13) && <ellipse cx={420} cy={1192} rx={110} ry={16} fill={SHADOW} opacity={clamp01((g - ls(13)) / 20) * 0.5} />}
            {setC && <Shade x={440} y={1500} k={1.5} skew={-55} sq={0.34}><rect x={-120} y={-110} width={240} height={110} fill={SHADOW} /><polygon points="-150,-110 0,-190 150,-110" fill={SHADOW} /></Shade>}
            {setC && g >= ls(9) && g < le(9) && <rect x={clothT.x + 30} y={1150} width={46} height={60} fill="#e9dcc0" stroke={INK} strokeWidth={4} />}
            {[...people].sort((a, b) => a.y - b.y).map((p, i) => <Villager key={p.id + i} {...p} t={setE && g >= ls(15) ? 0 : t} />)}
            {!(setD && g < ls(12) - 6) && (
              <g>
                <Shade x={you.x} y={you.y} k={you.s * you.shadowK} skew={you.skew} sq={you.sq}><Traveller yaw={you.yaw} silhouette walk={you.walk} phase={t * 0.25} /></Shade>
                <g transform={`translate(${you.x},${you.y + yi.dy}) rotate(${yi.rot}) scale(${you.s},${you.s * yi.sy})`}><Traveller yaw={you.yaw} mood={you.mood} walk={you.walk} phase={t * 0.25} t={t} /></g>
              </g>
            )}
            {sweatOn && (
              <g transform="translate(540,0)">
                {sweatT >= 0.8 && <g><ellipse cx={20} cy={1268} rx={24 + (sweatT - 0.8) * 160} ry={7 + (sweatT - 0.8) * 30} fill="none" stroke="#2a1d10" strokeWidth={4} opacity={0.7} /><ellipse cx={20} cy={1268} rx={14} ry={5} fill="#2a1d10" opacity={0.6} /></g>}
                {sweatT < 0.8 && <path d={`M20 ${940 + (sweatT / 0.8) * 322} q-14 24 0 36 q14 -12 0 -36 Z`} fill="#9cd0f2" stroke={INK} strokeWidth={3} />}
              </g>
            )}
          </g>
        </g>
        <rect width={1080} height={1920} fill="#fff6dc" opacity={flash} />
        <rect width={1080} height={1920} filter="url(#p1-grain)" opacity={0.14} />
        <rect width={1080} height={1920} fill="url(#p1-vig)" />
        <rect width={1080} height={1920} fill="#050403" opacity={black} />
      </svg>
      <Card a="หมู่บ้านที่ไม่มีใครมีเงา" b="ตอนที่ 1 · เงาของคุณ" at={C.titleAt} dur={46} g={g} />
      {manifest.shots.map((shot, i) => (
        <Sequence key={i} from={manifest.starts[i] + shot.leadFrames} durationInFrames={shot.audioFrames}>
          <Audio src={staticFile(shot.audio)} />
          <Subtitle text={SUBTITLE_FIX(shot.text)} from={manifest.starts[i] + shot.leadFrames} g={g} />
        </Sequence>
      ))}
      {g >= manifest.outroStart && (
        <div style={{ position: "absolute", inset: 0, background: "#0a0706", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily, color: "#f4ead2", opacity: clamp01((g - manifest.outroStart) / 12) }}>
          <div style={{ fontSize: 46, color: "#c9b79a" }}>ตอนต่อไป</div>
          <div style={{ fontSize: 74, marginTop: 20 }}>ห้ามยืนในที่ร่ม</div>
        </div>
      )}
      <Audio src={staticFile("shadow1v/bed.wav")} volume={0.6} />
    </AbsoluteFill>
  );
};
void SEC;

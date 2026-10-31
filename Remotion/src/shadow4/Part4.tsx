import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import manifest from "./manifest.json";
import { fontFamily } from "../island/fonts";
import { Mood } from "../shadow1/Figure";
import { Traveller, TravellerMood } from "../shadow1/Traveller";
import { INK, SHADOW, Shade } from "../shadow1/VillageVert";
import { Card, Ground, Subtitle, Villager, Who, dipOf, idle, track } from "../shadow1/Part1";
import { Lantern } from "../shadow3/Part3";
import { clamp01, lerp, smooth } from "../onestar3/util";

// "หมู่บ้านที่ไม่มีใครมีเงา" Part 4, "ทางออกที่ไม่มีแสง" (the finale). Sets:
//   lane (lines 0-1, night): you stand in the lane while a ring of lantern-bearers closes in
//   alley (lines 2-8, night, then dark): you run, your shadow splits and stretches under their lanterns; you blow your lantern out, your shadow goes, and you walk between lantern points like stars
//   dawn (line 9): the road, the first truck of the morning
//   home (lines 10-11): a room; the first lamp; a bare wall
//   mouth (lines 12-13): noon at the village mouth; you smile at a newcomer who has a shadow
// Each place change dips to black. All timing comes from manifest.json (the narration audio).

const C = manifest.cues as Record<string, number>;
const ls = (i: number) => C[`lineStart${i}`];
const le = (i: number) => C[`lineEnd${i}`];
const mid = (i: number, k: number) => Math.round(ls(i) + k * (le(i) - ls(i)));

type Place = "lane" | "alley" | "dawn" | "home" | "mouth";
const ALLEY_AT = () => ls(2) - 6;
const DAWN_AT = () => ls(9) - 6;
const HOME_AT = () => ls(10) - 6;
const MOUTH_AT = () => ls(12) - 6;
const placeAt = (g: number): Place => (g < ALLEY_AT() ? "lane" : g < DAWN_AT() ? "alley" : g < HOME_AT() ? "dawn" : g < MOUTH_AT() ? "home" : "mouth");
const EDGES = () => [-999, ALLEY_AT(), DAWN_AT(), HOME_AT(), MOUTH_AT(), 99999];
const BG: Record<string, { src: string; edge: string }> = {
  lane: { src: "shadow1/bg_lane.png", edge: "#95754d" },
  alley: { src: "shadow1/bg_alley.png", edge: "#8b6c52" },
  dawn: { src: "shadow1/bg_lane.png", edge: "#95754d" },
  mouth: { src: "shadow1/bg_lane.png", edge: "#95754d" },
};
const SUBTITLE_FIX = (t: string) => t.replace(/ตะเกียง/g, "ตะ⁠เกียง").replace(/เงาสวยจังเลย/g, "เงา⁠สวย⁠จังเลย").replace(/ปากทาง/g, "ปาก⁠ทาง").replace(/แปลกหน้า/g, "แปลก⁠หน้า");

type Cam = { x: number; y: number; z: number };
type Shot = [number, number, Cam, Cam];
const SHOTS = (): Shot[] => [
  [0, ls(1), { x: 540, y: 1000, z: 1.05 }, { x: 540, y: 1010, z: 1.2 }],
  [ls(1), ls(2), { x: 540, y: 1020, z: 1.5 }, { x: 540, y: 1000, z: 1.9 }],
  [ls(2), ls(3), { x: 540, y: 1000, z: 1.05 }, { x: 540, y: 1010, z: 1.12 }],
  [ls(3), ls(4), { x: 540, y: 1000, z: 1.15 }, { x: 540, y: 1020, z: 1.35 }],
  [ls(4), ls(5), { x: 540, y: 880, z: 2.3 }, { x: 540, y: 870, z: 2.6 }],
  [ls(5), ls(6), { x: 540, y: 960, z: 2.0 }, { x: 540, y: 960, z: 2.1 }],
  [ls(6), ls(7), { x: 540, y: 1050, z: 1.8 }, { x: 540, y: 1100, z: 1.5 }],
  [ls(7), ls(8), { x: 540, y: 1000, z: 1.0 }, { x: 540, y: 1000, z: 1.0 }],
  [ls(8), ls(9), { x: 540, y: 1010, z: 1.5 }, { x: 540, y: 1020, z: 1.7 }],
  [ls(9), ls(10), { x: 540, y: 1020, z: 1.1 }, { x: 540, y: 1020, z: 1.25 }],
  [ls(10), ls(11), { x: 540, y: 960, z: 1.05 }, { x: 540, y: 960, z: 1.2 }],
  [ls(11), ls(12), { x: 400, y: 900, z: 1.9 }, { x: 400, y: 900, z: 2.1 }],
  [ls(12), ls(13), { x: 540, y: 1020, z: 1.15 }, { x: 540, y: 1020, z: 1.25 }],
  [ls(13), le(13) + 40, { x: 540, y: 1010, z: 1.3 }, { x: 540, y: 1000, z: 1.6 }],
];

const rnd = (i: number, k: number) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };

/** a bearer's lantern on a staff, planted at the hand: a pole with the lantern hung at the top */
type Lant = { x: number; y: number; s: number; lit: number; gy: number };

const Truck: React.FC<{ x: number; y: number; s: number; tilt?: number }> = ({ x, y, s, tilt = 0 }) => (
  <g transform={`translate(${x},${y}) scale(${s}) rotate(${tilt})`} strokeLinejoin="round">
    <ellipse cx={0} cy={4} rx={260} ry={14} fill="#000" opacity={0.25} />
    <rect x={-250} y={-150} width={300} height={110} fill="#8a6a44" stroke={INK} strokeWidth={8} />
    {[-210, -150, -90, -30, 20].map((px) => <line key={px} x1={px} y1={-150} x2={px} y2={-40} stroke={INK} strokeWidth={3} opacity={0.5} />)}
    <path d="M50 -40 L50 -170 L150 -170 L220 -95 L250 -85 L250 -40 Z" fill="#6d8a5a" stroke={INK} strokeWidth={8} />
    <path d="M90 -150 L140 -150 L190 -100 L90 -100 Z" fill="#cfe0e8" stroke={INK} strokeWidth={6} />
    <rect x={-260} y={-48} width={520} height={16} fill="#3a3028" stroke={INK} strokeWidth={6} />
    {[-150, 140].map((cx) => (
      <g key={cx}><circle cx={cx} cy={-18} r={42} fill="#1c1a18" stroke={INK} strokeWidth={7} /><circle cx={cx} cy={-18} r={18} fill="#8a8478" stroke={INK} strokeWidth={4} /></g>
    ))}
  </g>
);

/** a bare-walled room: window, ceiling lamp, a chair and a plant with shadows on the wall; yours is missing */
const Room: React.FC<{ lamp: number; t: number }> = ({ lamp, t }) => (
  <g strokeLinejoin="round">
    <rect x={-200} y={0} width={1480} height={1236} fill="#9a9690" />
    {Array.from({ length: 16 }, (_, i) => <path key={i} d={`M${rnd(i, 1) * 1100} ${rnd(i, 2) * 1100} q${(rnd(i, 3) - 0.5) * 50} 40 ${(rnd(i, 4) - 0.5) * 30} ${60 + rnd(i, 5) * 60}`} fill="none" stroke="#7a766e" strokeWidth={2.5} opacity={0.5} />)}
    <rect x={-200} y={1090} width={1480} height={150} fill="#85817a" stroke={INK} strokeWidth={6} />
    <rect x={-200} y={1236} width={1480} height={1400} fill="#6a5240" />
    {Array.from({ length: 14 }, (_, i) => <line key={i} x1={-200} y1={1236 + i * 60} x2={1280} y2={1236 + i * 60} stroke="#4a3828" strokeWidth={3} opacity={0.5} />)}
    {/* the window: a pale dawn, no light enters */}
    <rect x={70} y={330} width={200} height={340} fill="#a8b6cc" stroke={INK} strokeWidth={8} />
    <line x1={170} y1={330} x2={170} y2={670} stroke={INK} strokeWidth={6} /><line x1={70} y1={500} x2={270} y2={500} stroke={INK} strokeWidth={6} />
    {/* the lamp's warm pool on the wall */}
    <ellipse cx={700} cy={600} rx={560} ry={620} fill="url(#p4-room-glow)" opacity={lamp} />
    {/* shadows on the wall, offset from each object by the lamp: the chair's and the plant's */}
    <g fill={SHADOW} opacity={0.5 * lamp}>
      <rect x={512} y={720} width={20} height={380} /><rect x={512} y={880} width={150} height={20} /><rect x={645} y={880} width={18} height={220} />
      <ellipse cx={1020} cy={860} rx={90} ry={120} /><rect x={1008} y={940} width={24} height={150} />
    </g>
    {/* the chair */}
    <g stroke={INK} strokeWidth={6}>
      <rect x={480} y={740} width={20} height={360} fill="#7a5a3a" /><rect x={480} y={900} width={150} height={20} fill="#8a6a44" /><rect x={612} y={900} width={18} height={200} fill="#7a5a3a" />
      <rect x={480} y={740} width={20} height={20} fill="#8a6a44" />
    </g>
    {/* the plant in a pot */}
    <g stroke={INK} strokeWidth={6}>
      <path d="M965 1020 L1075 1020 L1060 1100 L980 1100 Z" fill="#b8573f" />
      <path d="M1020 1020 Q960 940 970 840 Q1010 900 1020 1020 Z M1020 1020 Q1080 920 1070 830 Q1040 910 1020 1020 Z M1020 1020 Q1020 900 1020 800 Q1030 900 1020 1020 Z" fill="#4f7d34" />
    </g>
    {/* the ceiling lamp on its cord */}
    <line x1={700} y1={0} x2={700} y2={300} stroke={INK} strokeWidth={6} />
    <g transform="translate(700,330)">
      <path d="M-50 20 Q-50 -40 0 -40 Q50 -40 50 20 Z" fill="#cfc7a8" stroke={INK} strokeWidth={7} />
      <circle cx={0} cy={26} r={18 + 3 * Math.sin(t * 0.4) * lamp} fill={lamp > 0.05 ? "#fff3c4" : "#8a8678"} stroke={INK} strokeWidth={5} />
    </g>
  </g>
);

export const Part4: React.FC<{ g?: number }> = ({ g: gOverride }) => {
  const frameNow = useCurrentFrame();
  const g = gOverride ?? frameNow;
  const t = g;
  const place = placeAt(g);
  const edges = EDGES();
  const dark = 1 - Math.max(...edges.slice(0, -1).map((e, i) => dipOf(g, e, edges[i + 1])));

  let you = { x: 540, y: 1215, s: 0.7, yaw: 180, mood: "stare" as TravellerMood, walk: 0, phase: t * 0.25, shadow: false, cold: false };
  const people: Who[] = [];
  const lanterns: Lant[] = [];
  const shadows: { skew: number; sq: number; k: number; o: number }[] = [];
  let youLantern: { lit: number } | null = null;
  let puff = 0;

  // darkness: night (lines 0-4), then total dark after the lantern goes out (line 5), dawn and day afterwards
  const blow = ls(5) + 24;
  const night = place === "lane" || place === "alley" ? (g < blow ? 0.5 : 0.5 + 0.34 * smooth(clamp01((g - blow) / 6))) : 0;

  const bearer = (id: string, x0: number, y: number, s: number, f: 1 | -1, i: number, tr?: [number, number, number][]): void => {
    let x = x0, walk = 0;
    if (tr) { const p = track(g, tr.map(([fr, px]) => [fr, px, y, s] as [number, number, number, number])); x = p.x; walk = p.walk; }
    const lit = 1;
    people.push({ id, x, y, s, mood: "calm", face: f, walk, up: 0.0, seed: i });
    lanterns.push({ x: x + f * 86 * s, y: y - 330 * s, s: 0.75 * s + 0.25, lit, gy: y + 4 });
  };

  if (place === "lane") {
    const k = clamp01(g / Math.max(1, ls(2)));
    you = { ...you, x: 540, y: 1215, s: 0.66, yaw: 180, mood: g >= ls(1) ? "scared" : "stare", shadow: true };
    shadows.push({ skew: -60, sq: 0.34, k: 1, o: 0.75 });
    const L: [string, number, number, number, number, number][] = [
      ["head", 80, 1150, 0.56, 1, 40], ["mother", 240, 1130, 0.5, 1, 90], ["cook", 960, 1150, 0.54, -1, 40], ["oldman", 820, 1130, 0.5, -1, 90], ["child", 380, 1160, 0.62, 1, 160], ["mother", 700, 1160, 0.62, -1, 160],
    ];
    L.forEach(([id, x, y, s, f, d], i) => bearer(id, x, y, s, f as 1 | -1, i, [[0, x, 0], [ls(2), x + f * d, 0]]));
  }

  if (place === "alley") {
    const lit = (g: number) => (g >= blow ? 0 : 1);
    // you run, then stop; your shadow splits under the lanterns closing in (line 3), then you blow your lantern out (line 5)
    const run = track(g, [[ls(2) - 4, 920, 1215, 0.8], [ls(2) + 90, 560, 1215, 0.8]]);
    const sh = g < blow;
    you = { ...you, x: run.x, y: run.y, s: run.s, walk: run.walk, phase: t * 0.5, yaw: run.walk > 0.05 ? 270 : 20, mood: g >= ls(4) ? "scared" : "worry", shadow: sh };
    if (g < ls(3)) shadows.push({ skew: lerp(-58, -80, smooth(clamp01((g - ls(2)) / 120))), sq: lerp(0.34, 0.5, smooth(clamp01((g - ls(2)) / 120))), k: lerp(1, 1.3, smooth(clamp01((g - ls(2)) / 120))), o: 0.8 });
    else if (sh) {
      // three lanterns, three shadows
      const kk = smooth(clamp01((g - ls(3)) / 50));
      shadows.push({ skew: -72, sq: 0.42, k: 1.2, o: 0.7 }, { skew: lerp(-72, 72, kk), sq: 0.4, k: 1.2, o: 0.6 * kk }, { skew: lerp(-72, -5, kk), sq: 0.5, k: 1.1, o: 0.55 * kk });
    }
    // the lantern bearers close in from both ends; after the lantern goes out they drift about, searching
    const closing = smooth(clamp01((g - ls(2)) / (ls(4) - ls(2))));
    const L: [string, number, number, number, number][] = [
      ["head", 70, 1170, 0.62, 1], ["mother", 190, 1150, 0.55, 1], ["cook", 1000, 1170, 0.62, -1], ["oldman", 880, 1150, 0.55, -1], ["child", 320, 1190, 0.7, 1], ["mother", 780, 1190, 0.7, -1],
    ];
    L.forEach(([id, x, y, s, f], i) => {
      const toward = f * -1 * (-1); // f=1 are on the left and move right
      const near = g < ls(5) ? closing : 1;
      const sway = g >= ls(5) ? Math.sin(g * 0.02 + i * 2) * 60 : 0;
      const tx = x + f * (i < 4 ? 170 : 150) * near + sway;
      bearer(id, tx, y, s, f as 1 | -1, i);
      void toward;
    });
    // your own lantern, on a staff held at your side
    if (g < blow + 6) {
      const l = lit(g) * 1;
      youLantern = { lit: l };
      lanterns.push({ x: you.x + 105 * you.s, y: you.y - 330 * you.s, s: 0.75 * you.s + 0.25, lit: l, gy: you.y + 4 });
      puff = g >= blow ? clamp01(1 - (g - blow) / 20) : 0;
    }
    if (g >= blow) {
      // the dark: you walk left through the lantern points; the bearers have their backs to you or stand looking about
      const w = track(g, [[ls(6), 520, 1215, 0.82], [ls(7) - 10, 520, 1215, 0.82], [le(7) - 10, 160, 1210, 0.8], [ls(8) + 20, 160, 1210, 0.8], [le(8), 540, 1215, 0.9]]);
      you = { ...you, x: g >= ls(6) ? w.x : you.x, y: g >= ls(6) ? w.y : you.y, s: g >= ls(6) ? w.s : you.s, walk: g >= ls(6) ? w.walk : 0, phase: t * 0.28, yaw: g >= ls(6) ? (w.walk > 0.05 ? 270 : 10) : you.yaw, mood: "worry", shadow: false, cold: true };
    }
  }
  const darkAlley = place === "alley" && g >= blow;

  // dawn: the road and the first truck
  if (place === "dawn") {
    const arrive = smooth(clamp01((g - ls(9) + 6) / 60));
    const go = track(g, [[ls(9) + 40, 210, 1215, 0.85], [le(9) - 10, 640, 1210, 0.85]]);
    you = { ...you, x: go.x, y: go.y, s: go.s, walk: go.walk, phase: t * 0.28, yaw: 90, mood: "calm", shadow: false };
    void arrive;
  }

  // home
  const lamp = place === "home" ? smooth(clamp01((g - ls(10) - 50) / 12)) : 0;
  if (place === "home") {
    const w = track(g, [[ls(10) - 2, 120, 1215, 0.9], [ls(10) + 46, 380, 1215, 0.9]]);
    you = { ...you, x: w.x, y: w.y, s: w.s, walk: w.walk, phase: t * 0.28, yaw: w.walk > 0.05 ? 90 : g >= ls(11) ? 0 : 60, mood: g >= ls(11) ? "scared" : "calm", shadow: false };
  }

  // the village mouth, noon
  let newcomer: { x: number; y: number; walk: number } | null = null;
  if (place === "mouth") {
    you = { ...you, x: 330, y: 1205, s: 0.84, yaw: 90, mood: g >= ls(13) ? "smile" : "calm", shadow: false };
    const nc = track(g, [[ls(12) + 10, 850, 1195, 0.78], [ls(13) - 20, 560, 1200, 0.82]]);
    newcomer = { x: nc.x, y: nc.y, walk: nc.walk };
  }

  // ---------------------------------------------------------------- camera
  const shots = SHOTS();
  let cam = { x: 540, y: 1000, z: 1.2 };
  const startOf = (a: number) => (a === ls(2) || a === ls(9) || a === ls(10) || a === ls(12) ? a - 6 : a);
  const cur = shots.find(([a, b]) => g >= startOf(a) && g < b);
  if (cur) {
    const [a, b, c0, c1] = cur;
    const k = smooth(clamp01((g - a) / Math.max(1, b - a)));
    cam = { x: lerp(c0.x, c1.x, k), y: lerp(c0.y, c1.y, k), z: lerp(c0.z, c1.z, k) };
  } else {
    const prev = [...shots].reverse().find(([, b]) => b <= g);
    if (prev) cam = { ...prev[3] };
  }
  cam = { ...cam, x: Math.min(Math.max(cam.x, 540 / cam.z), 1080 - 540 / cam.z), y: Math.max(cam.y, 900 / cam.z) };
  const bg = BG[place] ?? BG.lane;
  const yi = idle(t, 0.7, you.walk < 0.05);
    const isPhoto = place !== "home";
  const dawnK = place === "dawn" ? 1 : 0;
  const truckX = place === "dawn" ? lerp(1500, 840, smooth(clamp01((g - ls(9) + 6) / 70))) : place === "mouth" ? 960 : 0;

  return (
    <AbsoluteFill style={{ background: "#0a0706" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <defs>
          <filter id="pv-grade" colorInterpolationFilters="sRGB">
            <feColorMatrix type="saturate" values="0.62" />
            <feColorMatrix type="matrix" values="0.92 0 0 0 0.02  0 0.88 0 0 0.02  0 0 0.8 0 0.03  0 0 0 1 0" />
            <feComponentTransfer><feFuncR type="gamma" amplitude="0.92" exponent="1.12" /><feFuncG type="gamma" amplitude="0.92" exponent="1.12" /><feFuncB type="gamma" amplitude="0.92" exponent="1.12" /></feComponentTransfer>
          </filter>
          <filter id="p4-cold" colorInterpolationFilters="sRGB">
            <feColorMatrix type="saturate" values="0.5" />
            <feColorMatrix type="matrix" values="0.7 0 0 0 0.02  0 0.8 0 0 0.03  0 0 1.05 0 0.07  0 0 0 1 0" />
          </filter>
          <filter id="p4-dimp" colorInterpolationFilters="sRGB"><feComponentTransfer><feFuncR type="linear" slope={1 - night} intercept={night * 0.063} /><feFuncG type="linear" slope={1 - night} intercept={night * 0.086} /><feFuncB type="linear" slope={1 - night} intercept={night * 0.235} /></feComponentTransfer></filter>
          <filter id="p4-dimy" colorInterpolationFilters="sRGB"><feComponentTransfer><feFuncR type="linear" slope={1 - night * 0.45} intercept={night * 0.028} /><feFuncG type="linear" slope={1 - night * 0.45} intercept={night * 0.039} /><feFuncB type="linear" slope={1 - night * 0.45} intercept={night * 0.106} /></feComponentTransfer></filter>
          <filter id="p4-desat" colorInterpolationFilters="sRGB"><feColorMatrix type="saturate" values="0.72" /></filter>
          <linearGradient id="p4-fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0.93" stopColor={bg.edge} stopOpacity="0" /><stop offset="1" stopColor={bg.edge} stopOpacity="1" /></linearGradient>
          <radialGradient id="p4-vig" cx="0.5" cy="0.5" r="0.75"><stop offset="0.5" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#0a0604" stopOpacity="0.75" /></radialGradient>
          <radialGradient id="p3-glow"><stop offset="0" stopColor="#ffd27a" stopOpacity="0.9" /><stop offset="0.35" stopColor="#ff9a3c" stopOpacity="0.35" /><stop offset="1" stopColor="#ff7a2a" stopOpacity="0" /></radialGradient>
          <radialGradient id="p4-room-glow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#ffe6a0" stopOpacity="0.8" /><stop offset="0.6" stopColor="#e9b46a" stopOpacity="0.3" /><stop offset="1" stopColor="#b9a888" stopOpacity="0" /></radialGradient>
          <filter id="p4-grain"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="4" /><feColorMatrix type="saturate" values="0" /></filter>
        </defs>
        <g transform={`translate(540,900) scale(${cam.z}) translate(${-cam.x},${-cam.y})`}>
          {isPhoto && <image href={staticFile(bg.src)} x={0} y={0} width={1080} height={1250} filter="url(#p4-desat)" />}
          {isPhoto && <rect y={0} width={1080} height={1250} fill="url(#p4-fade)" />}
          {isPhoto && <Ground kind={place === "alley" ? "alley" : "lane"} edge={bg.edge} />}
          {place === "home" && <Room lamp={lamp} t={t} />}
          {(place === "dawn" || place === "mouth") && <Truck x={truckX} y={1225} s={place === "dawn" ? 0.9 : 0.6} />}

          {night > 0 && <rect x={-200} y={0} width={1480} height={2700} fill="#10163c" opacity={night} />}
          {/* things on the ground that lie under everyone: the newcomer's shadow and yours */}
          <g filter="url(#pv-grade)">
            {place === "mouth" && newcomer && <Shade x={newcomer.x} y={newcomer.y} k={0.82} skew={-55} sq={0.34}><Traveller yaw={newcomer.walk > 0.05 ? 270 : 300} silhouette walk={newcomer.walk} phase={t * 0.25} /></Shade>}
            {you.shadow && shadows.map((sh, i) => (
              <g key={i} opacity={sh.o}><Shade x={you.x} y={you.y} k={you.s * sh.k} skew={sh.skew} sq={sh.sq}><Traveller yaw={you.yaw} silhouette walk={you.walk} phase={you.phase} /></Shade></g>
            ))}
          </g>
          {/* everyone and every lantern staff, in depth order, so a lantern in front of you hides you and one behind you does not */}
          {[
            ...people.map((p, i) => ({ y: p.y, k: "v" + i, n: <g filter={night > 0 ? "url(#p4-dimp)" : undefined}><g filter="url(#pv-grade)"><Villager {...p} t={t} /></g></g> })),
            ...lanterns.map((l, i) => ({
              y: l.gy + 0.5, k: "l" + i, n: (
                <g>
                  <line x1={l.x} y1={l.gy} x2={l.x} y2={l.y - 70 * l.s} stroke={INK} strokeWidth={11 * l.s} />
                  <line x1={l.x} y1={l.gy} x2={l.x} y2={l.y - 70 * l.s} stroke="#6a5236" strokeWidth={6 * l.s} />
                  <g transform={`translate(${l.x},${l.y})`}><Lantern lit={l.lit} s={l.s} t={t} seed={i} /></g>
                </g>
              ),
            })),
            ...(place === "mouth" && newcomer ? [{ y: newcomer.y, k: "nc", n: <g filter="url(#pv-grade)"><g transform={`translate(${newcomer.x},${newcomer.y}) scale(0.82)`}><g stroke={INK} strokeWidth={6} strokeLinejoin="round"><rect x={26} y={-310} width={72} height={130} rx={18} fill="#d9782a" /><rect x={40} y={-290} width={44} height={36} rx={8} fill="#b85f1c" /></g><Traveller yaw={newcomer.walk > 0.05 ? 270 : 300} mood="worry" walk={newcomer.walk} phase={t * 0.25} t={t + 40} /></g></g> }] : []),
            {
              y: you.y, k: "you", n: (
                <g filter={you.cold ? "url(#p4-cold)" : undefined}>
                  <g filter={night > 0 ? "url(#p4-dimy)" : undefined}>
                    <g filter="url(#pv-grade)">
                      <g transform={`translate(${you.x},${you.y + yi.dy}) rotate(${yi.rot}) scale(${you.s},${you.s * yi.sy})`}>
                        <Traveller yaw={you.yaw} mood={you.mood} walk={you.walk} phase={you.phase} t={t} />
                        {place === "mouth" && <g transform="translate(34,-292)"><circle r={19} fill="#f1e6cf" stroke={INK} strokeWidth={4} /><circle r={12} fill="none" stroke="#b9382c" strokeWidth={5} /><circle r={4.5} fill={INK} /></g>}
                      </g>
                    </g>
                  </g>
                </g>
              ),
            },
          ].sort((a, b) => a.y - b.y).map((it) => <g key={it.k}>{it.n}</g>)}
          {/* your puff of smoke as the flame goes out */}
          {puff > 0 && youLantern && [0, 1, 2].map((i) => <ellipse key={i} cx={you.x + 105 * you.s + i * 6 * (1 - puff)} cy={you.y - 330 * you.s - 50 - (1 - puff) * 60 - i * 14} rx={(14 + i * 6) * (2 - puff)} ry={(10 + i * 4) * (2 - puff)} fill="#cfd4dc" opacity={0.5 * puff} />)}
        </g>
        {dawnK > 0 && <rect width={1080} height={1920} fill="#ffb08a" opacity={0.22} />}
        {dawnK > 0 && <rect width={1080} height={1920} fill="#5a6aa8" opacity={0.18} />}
        <rect width={1080} height={1920} filter="url(#p4-grain)" opacity={0.14} />
        <rect width={1080} height={1920} fill="url(#p4-vig)" />
        <rect width={1080} height={1920} fill="#050403" opacity={dark} />
      </svg>
      <Card a="หมู่บ้านที่ไม่มีใครมีเงา" b="ตอนที่ 4 · ทางออกที่ไม่มีแสง" at={C.titleAt} dur={46} g={g} />
      {manifest.shots.map((shot, i) => (
        <Sequence key={i} from={manifest.starts[i] + shot.leadFrames} durationInFrames={shot.audioFrames}>
          <Audio src={staticFile(shot.audio)} />
          <Subtitle text={SUBTITLE_FIX(shot.text)} from={manifest.starts[i] + shot.leadFrames} g={g} />
        </Sequence>
      ))}
      {g >= manifest.outroStart && (
        <div style={{ position: "absolute", inset: 0, background: "#0a0706", fontFamily, color: "#f4ead2", opacity: clamp01((g - manifest.outroStart) / 12) }}>
          <div style={{ position: "absolute", top: 520, left: 80, right: 160, textAlign: "center", opacity: 1 - clamp01((g - manifest.outroStart - 90) / 14) }}>
            <div style={{ fontSize: 66, lineHeight: 1.5 }}>จบแล้ว…<br />แต่ยังมีคนใหม่มาเรื่อยๆ</div>
          </div>
          <div style={{ position: "absolute", top: 520, left: 80, right: 160, textAlign: "center", opacity: clamp01((g - manifest.outroStart - 96) / 14) }}>
            <div style={{ fontSize: 60, lineHeight: 1.45 }}>ถ้าเป็นคุณ<br />จะเป่าตะเกียงดับ<br />หรือวิ่งหนีต่อ?</div>
            <div style={{ fontSize: 40, marginTop: 28, color: "#c9b79a" }}>คอมเมนต์บอกหน่อย</div>
          </div>
          <div style={{ position: "absolute", top: 1180, left: 80, right: 160, textAlign: "center", opacity: clamp01((g - manifest.outroStart - 170) / 14) }}>
            <div style={{ fontSize: 46, color: "#c9b79a" }}>ขอบคุณที่ดูจนจบ</div>
          </div>
        </div>
      )}
      <Audio src={staticFile("shadow4v/bed.wav")} volume={0.6} />
    </AbsoluteFill>
  );
};

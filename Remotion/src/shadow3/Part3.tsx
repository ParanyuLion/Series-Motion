import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import manifest from "./manifest.json";
import { fontFamily } from "../island/fonts";
import { Mood, SKIN } from "../shadow1/Figure";
import { Traveller, TravellerMood } from "../shadow1/Traveller";
import { INK, SHADOW, Shade } from "../shadow1/VillageVert";
import { Card, Ground, Subtitle, Villager, Who, dipOf, idle, track } from "../shadow1/Part1";
import { clamp01, lerp, smooth } from "../onestar3/util";

// "หมู่บ้านที่ไม่มีใครมีเงา" Part 3, "ต้นไม้ที่มีเงาเยอะเกินไป". Five sets:
//   hook  (lines 0-1, tree backdrop, wide): you stand small before the great tree between two rows of staring villagers
//   lane  (lines 2-3): the head invites you; you walk to the tree and the whole village files in behind you
//   tree  (lines 4-7, cold): the blue shadow pool, thin silhouettes leaning at its edge, thousands of them, a child waves
//   wall  (lines 8-11, code-drawn): a lantern lit in daylight, hand-shadow puppets, the mother's grip (insert), your shadow slides toward the tree
//   dusk  (lines 12-13, lane backdrop): you run out; the clapper; every villager lights a lantern together
// Cuts only on story beats, each place change dips to black. All timing comes from manifest.json (the narration audio).

const C = manifest.cues as Record<string, number>;
const ls = (i: number) => C[`lineStart${i}`];
const le = (i: number) => C[`lineEnd${i}`];
const mid = (i: number, k: number) => Math.round(ls(i) + k * (le(i) - ls(i)));

type Place = "hook" | "lane" | "tree" | "wall" | "dusk";
const LANE_AT = () => ls(2) - 6;
const TREE_AT = () => ls(4) - 6;
const WALL_AT = () => ls(8) - 6;
const DUSK_AT = () => ls(12) - 6;
const placeAt = (g: number): Place => (g < LANE_AT() ? "hook" : g < TREE_AT() ? "lane" : g < WALL_AT() ? "tree" : g < DUSK_AT() ? "wall" : "dusk");
const EDGES = () => [-999, LANE_AT(), TREE_AT(), WALL_AT(), DUSK_AT(), 99999];
const BG: Record<string, { src: string; edge: string; desat: boolean }> = {
  hook: { src: "shadow1/bg_tree.png", edge: "#c19158", desat: true },
  tree: { src: "shadow1/bg_tree.png", edge: "#c19158", desat: true },
  lane: { src: "shadow1/bg_lane.png", edge: "#95754d", desat: true },
  dusk: { src: "shadow1/bg_lane.png", edge: "#95754d", desat: true },
};

const SUBTITLE_FIX = (t: string) => t.replace(/ผู้ใหญ่บ้าน/g, "ผู้ใหญ่⁠บ้าน").replace(/นักเดินทาง/g, "นัก⁠เดินทาง").replace(/ที่ร่ม/g, "ที่⁠ร่ม").replace(/ตะเกียง/g, "ตะ⁠เกียง");

// ------------------------------------------------------------------ shots: [from, to, camera at the start, camera at the end]
type Cam = { x: number; y: number; z: number };
type Shot = [number, number, Cam, Cam];
const SHOTS = (): Shot[] => [
  // hook: wide, then a slow push toward your back
  [0, ls(1), { x: 540, y: 960, z: 1.0 }, { x: 540, y: 990, z: 1.18 }],
  [ls(1), ls(2), { x: 540, y: 1010, z: 1.35 }, { x: 540, y: 1000, z: 1.8 }],
  // the head invites you; you set off with the village behind you
  [ls(2), ls(3), { x: 430, y: 1030, z: 1.7 }, { x: 460, y: 1030, z: 1.8 }],
  [ls(3), ls(4), { x: 420, y: 1020, z: 1.35 }, { x: 760, y: 1020, z: 1.35 }],
  // under the tree
  [ls(4), ls(5), { x: 540, y: 1010, z: 1.15 }, { x: 540, y: 1000, z: 1.3 }],
  [ls(5), ls(6), { x: 760, y: 1010, z: 1.9 }, { x: 800, y: 1010, z: 2.1 }],
  [ls(6), ls(7), { x: 540, y: 1090, z: 1.5 }, { x: 540, y: 1075, z: 2.6 }],
  [ls(7), mid(7, 0.62), { x: 555, y: 1040, z: 1.9 }, { x: 555, y: 1030, z: 2.2 }],
  [mid(7, 0.62), ls(8), { x: 300, y: 960, z: 2.4 }, { x: 300, y: 950, z: 2.6 }],
  // the wall
  [ls(8), ls(9), { x: 330, y: 1010, z: 1.7 }, { x: 330, y: 1000, z: 1.4 }],
  [ls(9), mid(10, 0.25), { x: 540, y: 960, z: 1.2 }, { x: 560, y: 960, z: 1.3 }],
  [mid(10, 0.25), ls(11), { x: 540, y: 960, z: 1.2 }, { x: 540, y: 960, z: 1.2 }],
  [ls(11), ls(12), { x: 620, y: 1060, z: 1.5 }, { x: 640, y: 1060, z: 1.3 }],
  // dusk
  [ls(12), ls(13), { x: 520, y: 1030, z: 1.45 }, { x: 500, y: 1030, z: 1.35 }],
  [ls(13), le(13) + 40, { x: 540, y: 1000, z: 1.1 }, { x: 540, y: 1040, z: 1.5 }],
];

// ------------------------------------------------------------------ simple silhouettes (the thin shapes of the pool, the child, the puppet)
const rnd = (i: number, k: number) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };
const POOL = "#16224a";
const POOL_DARK = "#050816";

/** a standing figure about 380 high: body, round head, thin arms; `wave` raises one arm and swings it */
const Sil: React.FC<{ x: number; y: number; s: number; lean?: number; wave?: number; t?: number; fill?: string; thin?: number; flip?: number; rim?: string }> = ({ x, y, s, lean = 0, wave = 0, t = 0, fill = POOL_DARK, thin = 1, flip = 1, rim }) => (
  <g transform={`translate(${x},${y}) rotate(${lean}) scale(${s * thin * flip},${s})`} fill={fill} stroke={rim} strokeWidth={rim ? 6 : 0}>
    <path d="M-34 0 L-27 -225 Q-25 -296 0 -296 Q25 -296 27 -225 L34 0 Z" />
    <circle cx={0} cy={-340} r={34} />
    {wave > 0 ? (
      <path d={`M24 -270 Q${70} -300 ${58 + Math.sin(t * 0.34) * 22} ${-392 + Math.cos(t * 0.34) * 8}`} fill="none" stroke={fill} strokeWidth={17} strokeLinecap="round" />
    ) : (
      <path d="M-24 -270 Q-40 -180 -30 -110" fill="none" stroke={fill} strokeWidth={14} strokeLinecap="round" />
    )}
  </g>
);

/** the pool: thousands of tiny silhouettes standing in the dark, each with a lean and a tilt of the head; `k` fades them in */
const Crowd: React.FC<{ k: number; cx: number; cy: number; rx: number; ry: number; n: number }> = ({ k, cx, cy, rx, ry, n }) => {
  if (k <= 0) return null;
  const rows = Array.from({ length: n }, (_, i) => {
    const a = rnd(i, 1) * Math.PI * 2;
    const d = Math.sqrt(rnd(i, 2));
    return { i, x: cx + Math.cos(a) * rx * d, y: cy + Math.sin(a) * ry * d };
  }).sort((a, b) => a.y - b.y);
  return (
    <g opacity={k}>
      {rows.map(({ i, x, y }) => {
        const s = 0.07 + 0.2 * ((y - (cy - ry)) / (2 * ry));
        return <Sil key={i} x={x} y={y} s={s} lean={(rnd(i, 3) - 0.5) * 14} thin={0.8} fill={POOL_DARK} />;
      })}
    </g>
  );
};

/** a lantern: a warm glow, a paper body with red bands, a flame; `lit` 0..1 */
const Lantern: React.FC<{ lit: number; s?: number; t: number; seed?: number }> = ({ lit, s = 1, t, seed = 0 }) => {
  const fl = 1 + Math.sin(t * 0.45 + seed * 3) * 0.07;
  return (
    <g transform={`scale(${s})`}>
      <circle cx={0} cy={0} r={190 * fl} fill="url(#p3-glow)" opacity={lit} />
      <line x1={0} y1={-70} x2={0} y2={-34} stroke={INK} strokeWidth={5} />
      <path d="M-26 -34 Q-36 0 -24 34 L24 34 Q36 0 26 -34 Z" fill={lit > 0.05 ? "#ffcf6a" : "#9a8a68"} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <path d="M-30 -18 Q0 -10 30 -18 M-32 14 Q0 22 32 14" fill="none" stroke="#a8332a" strokeWidth={6} />
      <rect x={-18} y={30} width={36} height={9} fill="#5a4630" stroke={INK} strokeWidth={4} />
      {lit > 0.05 && <ellipse cx={0} cy={-2} rx={7 * fl} ry={13 * fl} fill="#fff6d0" opacity={lit} />}
    </g>
  );
};

/** a hand-shadow puppet play on the wall (line 9): a little traveller walks toward the tree; its own shadow slips away to the tree; the puppet goes pale */
const Puppet: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  const TREE_X = 840;
  const walk = smooth(clamp01(k / 0.5));
  const px = lerp(360, 640, walk);
  const sep = smooth(clamp01((k - 0.45) / 0.45));
  const shx = lerp(px - 70, TREE_X - 40, sep);
  const gone = smooth(clamp01((k - 0.7) / 0.3));
  const INKW = "#2a1c10";
  return (
    <g>
      {/* the tree, a hand-shadow: a trunk and a lumpy crown */}
      <g fill={INKW} opacity={0.82}>
        <rect x={TREE_X - 22} y={620} width={44} height={150} />
        <ellipse cx={TREE_X} cy={560} rx={120} ry={80} />
        <ellipse cx={TREE_X - 80} cy={600} rx={70} ry={50} />
        <ellipse cx={TREE_X + 85} cy={605} rx={72} ry={50} />
      </g>
      {/* the puppet's own shadow lags, then slips away along the wall to the tree */}
      <g opacity={0.5 + 0.3 * sep}><Sil x={shx} y={800} s={0.6} fill="#150d06" lean={-6 * sep} /></g>
      {/* the puppet: a hand-shadow figure that bobs as it walks, and fades once its shadow has gone */}
      <g opacity={0.82 * (1 - 0.8 * gone)}><Sil x={px} y={800 + Math.abs(Math.sin(t * 0.3)) * (walk < 0.99 ? -6 : 0)} s={0.6} fill={INKW} /></g>
      {/* the hands that make it, rising from the bottom left */}
      <g fill={INKW} opacity={0.8}>
        <ellipse cx={px - 40} cy={870} rx={46} ry={34} transform={`rotate(-18 ${px - 40} 870)`} />
        {[0, 1, 2, 3].map((i) => <rect key={i} x={px - 54 + i * 18} y={820 - (i === 1 || i === 2 ? 10 : 0)} width={11} height={44} rx={5} />)}
      </g>
    </g>
  );
};

/** the close-up of the mother's grip on your hand (line 10): hers wrap and tighten; yours casts a shadow, hers does not */
const GripInsert: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  const tight = smooth(clamp01(k * 1.4));
  return (
    <g filter="url(#pv-grade)">
      <rect width={1080} height={1920} fill="#8a8c98" />
      <rect width={1080} height={1920} fill="url(#p3-glow-b)" />
      {Array.from({ length: 26 }, (_, i) => <line key={i} x1={0} y1={i * 78} x2={1080} y2={i * 78 + 12} stroke="#7a7c88" strokeWidth={3} opacity={0.6} />)}
      {/* the shadow of your hand on the wall: only yours */}
      <g transform="translate(60,34)" opacity={0.65}>
        <ellipse cx={430} cy={980} rx={190} ry={150} fill="#1a1228" />
        <rect x={110} y={930} width={250} height={110} rx={50} fill="#1a1228" />
      </g>
      {/* your hand and wrist: a black jacket cuff, a white shirt cuff, a palm with a thumb */}
      <g strokeLinejoin="round" strokeLinecap="round">
        <rect x={-60} y={890} width={200} height={190} rx={22} fill="#24252b" stroke={INK} strokeWidth={9} />
        <rect x={120} y={905} width={60} height={160} fill="#f1ede4" stroke={INK} strokeWidth={8} />
        <path d="M170 920 Q330 880 470 925 Q560 975 470 1050 Q330 1085 170 1050 Z" fill={SKIN} stroke={INK} strokeWidth={9} />
        <path d="M300 925 Q380 880 470 900" fill="none" stroke={INK} strokeWidth={30} />
        <path d="M300 925 Q380 880 470 900" fill="none" stroke={SKIN} strokeWidth={17} />
      </g>
      {/* her hand from the right: a wrinkled wrist in a red sleeve; four fingers close over the back of yours and tighten */}
      <g strokeLinejoin="round" strokeLinecap="round">
        <rect x={900} y={880} width={260} height={210} rx={30} fill="#b8573f" stroke={INK} strokeWidth={9} />
        <path d="M920 930 q-12 8 0 18 M920 990 q-12 8 0 18" fill="none" stroke="#7a3624" strokeWidth={5} />
        <path d="M900 905 Q780 870 650 900 Q600 980 650 1060 Q780 1080 900 1060 Z" fill="#d9a67e" stroke={INK} strokeWidth={9} />
        {[0, 1, 2, 3].map((i) => {
          const y = 905 + i * 40;
          const x1 = lerp(450, 360, tight);
          const y1 = y + lerp(-4, 30, tight);
          return (
            <g key={i}>
              <path d={`M650 ${y} Q540 ${y - 40} ${x1} ${y1}`} fill="none" stroke={INK} strokeWidth={50} />
              <path d={`M650 ${y} Q540 ${y - 40} ${x1} ${y1}`} fill="none" stroke="#d9a67e" strokeWidth={36} />
              <ellipse cx={x1} cy={y1} rx={14} ry={11} fill="#f0d8c4" stroke={INK} strokeWidth={4} />
            </g>
          );
        })}
        <path d="M660 1050 Q560 1090 420 1040" fill="none" stroke={INK} strokeWidth={46} />
        <path d="M660 1050 Q560 1090 420 1040" fill="none" stroke="#d9a67e" strokeWidth={32} />
      </g>
      {/* a bead of cold sweat on your knuckle */}
      <ellipse cx={250 + Math.sin(t * 0.05) * 2} cy={940 + (k * 24) % 24} rx={9} ry={14} fill="#dfe8f2" opacity={0.8} />
    </g>
  );
};

/** a wooden post with a clapper (the noon/dusk signal), struck at `hit` 0..1 */
const Clapper: React.FC<{ hit: number }> = ({ hit }) => (
  <g strokeLinejoin="round">
    <rect x={-22} y={-340} width={44} height={340} fill="#5a4630" stroke={INK} strokeWidth={7} />
    <g transform={`translate(0,-300) rotate(${-34 * (1 - hit)})`}>
      <rect x={-84} y={-14} width={80} height={28} fill="#8a6a44" stroke={INK} strokeWidth={5} />
      <rect x={4} y={-14} width={74} height={28} fill="#7a5a3a" stroke={INK} strokeWidth={5} />
    </g>
  </g>
);

export const Part3: React.FC<{ g?: number }> = ({ g: gOverride }) => {
  const frameNow = useCurrentFrame();
  const g = gOverride ?? frameNow;
  const t = g;
  const place = placeAt(g);
  const edges = EDGES();
  const dark = 1 - Math.max(...edges.slice(0, -1).map((e, i) => dipOf(g, e, edges[i + 1])));

  // ---------------------------------------------------------------- the cast
  let you = { x: 540, y: 1220, s: 0.7, yaw: 180, mood: "worry" as TravellerMood, walk: 0, phase: t * 0.25, shadow: true, cold: false };
  const people: Who[] = [];
  const lanterns: { x: number; y: number; s: number; lit: number; gy: number }[] = [];
  let showShadow = true;

  if (place === "hook") {
    // two rows of villagers either side, all staring; you small in the middle with your back to us, looking at the tree
    const st = g >= ls(1) - 20 ? 1 : 0;
    const m: Mood = "stare";
    const rowL: [string, number, number, number][] = [["head", 270, 1190, 0.7], ["mother", 150, 1230, 0.7], ["cook", 370, 1170, 0.55], ["oldman", 60, 1175, 0.55]];
    const rowR: [string, number, number, number][] = [["child", 790, 1230, 0.9], ["oldman", 900, 1190, 0.62], ["cook", 1010, 1230, 0.7], ["mother", 700, 1170, 0.55]];
    rowL.forEach(([id, x, y, s], i) => people.push({ id, x, y, s, mood: m, face: 1, seed: i, turn: 0 }));
    rowR.forEach(([id, x, y, s], i) => people.push({ id, x, y, s, mood: m, face: -1, seed: i + 4, turn: st * 0 }));
    you = { ...you, x: 540, y: 1215, s: 0.6, yaw: 180, mood: "stare" };
  }

  if (place === "lane") {
    // the head invites you; he stands left of you and points toward the tree; then you walk and the whole village files in behind you
    const go = ls(3);
    const youT = track(g, [[go - 10, 520, 1195, 0.85], [go + 6, 520, 1195, 0.85], [le(3) + 30, 1020, 1175, 0.78]]);
    you = { ...you, x: youT.x, y: youT.y, s: youT.s, walk: youT.walk, phase: t * 0.25, yaw: youT.walk > 0.05 ? 90 : 60, mood: "worry" };
    const lead = (id: string, d: number, seed: number, y: number, s: number, x0: number): Who => {
      const tr = track(g, [[go - 10 + d, x0, y, s], [go + 6 + d, x0, y, s], [le(3) + 30 + d, x0 + 500, y - 20, s - 0.04]]);
      return { id, x: tr.x, y: tr.y, s: tr.s, mood: "smile", walk: tr.walk, face: 1, seed };
    };
    const head = lead("head", 8, 1, 1190, 0.72, 300);
    people.push({ ...head, talk: g >= ls(2) && g < le(2) ? 1 : 0, point: g >= ls(2) + 20 && g < go ? smooth(clamp01((g - ls(2) - 20) / 14)) : 0, mood: g >= ls(2) ? "calm" : "smile" });
    people.push(lead("mother", 24, 2, 1215, 0.7, 150), lead("child", 30, 3, 1230, 0.9, 80), lead("cook", 44, 4, 1180, 0.58, 20), lead("oldman", 56, 5, 1165, 0.54, -40));
    // a late few at the back
    people.push(lead("cook", 66, 6, 1200, 0.5, -140), lead("mother", 76, 7, 1150, 0.46, -220));
  }

  // under the tree
  const poolK = place === "tree" ? 1 : 0;
  const crowdK = smooth(clamp01((g - ls(6) + 20) / 90));
  const lean0 = (g: number, i: number) => -4 - Math.sin(g * 0.02 + i) * 2;
  if (place === "tree") {
    showShadow = true;
    const st = track(g, [[TREE_AT() + 10, 150, 1250, 0.82], [ls(4) + 70, 470, 1230, 0.82], [ls(6) + 20, 470, 1230, 0.82], [ls(6) + 70, 200, 1235, 0.82]]);
    you = { ...you, x: st.x, y: st.y, s: st.s, walk: st.walk, phase: t * 0.25, yaw: st.walk > 0.05 ? 90 : g >= ls(7) ? 120 + 20 * smooth(clamp01((g - mid(7, 0.62)) / 20)) : 70, mood: g >= ls(6) ? (g >= ls(7) ? "scared" : "stare") : "worry" };
    people.length = 0;
  }
  const childWave = g >= ls(7) ? 1 : 0;

  // the wall
  const lantLit = place === "wall" ? smooth(clamp01((g - ls(8) - 26) / 30)) : 0;
  const puppetK = place === "wall" ? clamp01((g - ls(9)) / Math.max(1, le(9) - ls(9) - 20)) : 0;
  const insert = g >= mid(10, 0.25) && g < ls(11);
  const slide = place === "wall" ? smooth(clamp01((g - ls(11)) / Math.max(1, (le(11) - ls(11)) * 0.8))) : 0;
  if (place === "wall") {
    you = { ...you, x: 720, y: 1215, s: 0.8, yaw: 20, mood: g >= ls(10) ? "scared" : "worry", cold: false };
    const t0 = ls(8);
    people.push({ id: "head", x: 230, y: 1190, s: 0.72, mood: "calm", face: 1, up: g >= t0 + 6 && g < t0 + 56 ? smooth(clamp01((g - t0 - 6) / 16)) * (1 - smooth(clamp01((g - t0 - 40) / 16))) : g >= ls(9) && g < le(9) ? 0.75 : 0, talk: g >= ls(10) - 1 ? 0 : 0, seed: 1 });
    people.push({ id: "mother", x: 560, y: 1205, s: 0.68, mood: "smile", face: 1, talk: g >= ls(10) + 4 && g < mid(10, 0.4) ? 1 : 0, seed: 2 });
    people.push({ id: "child", x: 440, y: 1225, s: 0.86, mood: "smile", face: 1, seed: 3 });
  }

  // dusk
  const strike = ls(13) + 6;
  const hit = g >= strike ? clamp01((g - strike) / 4) : 0;
  const duskK = place === "dusk" ? smooth(clamp01((g - ls(12) - 20) / 120)) * 0.35 + (g >= strike ? smooth(clamp01((g - strike) / 12)) * 0.65 : 0) : 0;
  if (place === "dusk") {
    const run = track(g, [[ls(12) - 4, 940, 1235, 0.76], [ls(12) + 70, 560, 1215, 0.82]]);
    const lit = (i: number) => (g >= strike + 8 + i * 8 ? smooth(clamp01((g - strike - 8 - i * 8) / 12)) : 0);
    you = { ...you, x: run.x, y: run.y, s: run.s, walk: run.walk, phase: t * 0.5, yaw: run.walk > 0.05 ? 270 : 10, mood: "scared", shadow: duskK < 0.9 };
    const ring: [string, number, number, number, number][] = [
      ["head", 330, 1130, 0.58, 1], ["mother", 160, 1160, 0.64, 1], ["cook", 70, 1130, 0.52, 1], ["oldman", 730, 1120, 0.56, -1], ["child", 880, 1170, 0.78, -1], ["cook", 990, 1130, 0.58, -1],
    ];
    ring.forEach(([id, x, y, s, f], i) => {
      const l = lit(i);
      people.push({ id, x, y, s, mood: "calm", face: f as 1 | -1, up: l * 0.7, seed: i + 8, turn: 0 });
      lanterns.push({ x: x + f * 86 * s, y: y - 330 * s, s: 0.75 * s + 0.25, lit: l, gy: y + 4 });
    });
  }

  // ---------------------------------------------------------------- camera
  const shots = SHOTS();
  let cam = { x: 540, y: 1000, z: 1.2 };
  const startOf = (a: number) => (a === ls(2) || a === ls(4) || a === ls(8) || a === ls(12) ? a - 6 : a);
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
  const sorted = [...people].sort((a, b) => a.y - b.y);
  const isPhoto = place !== "wall";
  const coldPlace = place === "tree";

  // your shadow on the ground in the wall scene starts as the sun's and slides toward the tree (right) while you do not move
  const shSkew = place === "wall" ? lerp(-55, 80, slide) : -55;
  const shSq = place === "wall" ? lerp(0.34, 0.3, slide) : 0.34;
  const shK = place === "wall" ? lerp(1, 1.1, slide) : 1;

  return (
    <AbsoluteFill style={{ background: "#0a0706" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <defs>
          <filter id="pv-grade" colorInterpolationFilters="sRGB">
            <feColorMatrix type="saturate" values="0.62" />
            <feColorMatrix type="matrix" values="0.92 0 0 0 0.02  0 0.88 0 0 0.02  0 0 0.8 0 0.03  0 0 0 1 0" />
            <feComponentTransfer><feFuncR type="gamma" amplitude="0.92" exponent="1.12" /><feFuncG type="gamma" amplitude="0.92" exponent="1.12" /><feFuncB type="gamma" amplitude="0.92" exponent="1.12" /></feComponentTransfer>
          </filter>
          <filter id="p3-cold" colorInterpolationFilters="sRGB">
            <feColorMatrix type="saturate" values="0.45" />
            <feColorMatrix type="matrix" values="0.62 0 0 0 0.01  0 0.7 0 0 0.02  0 0 0.95 0 0.05  0 0 0 1 0" />
          </filter>
          <filter id="p3-desat" colorInterpolationFilters="sRGB"><feColorMatrix type="saturate" values="0.72" /></filter>
          <filter id="p3-blur"><feGaussianBlur stdDeviation="10" /></filter>
          <linearGradient id="p3-fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0.93" stopColor={bg.edge} stopOpacity="0" /><stop offset="1" stopColor={bg.edge} stopOpacity="1" /></linearGradient>
          <radialGradient id="p3-vig" cx="0.5" cy="0.5" r="0.75"><stop offset="0.5" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#0a0604" stopOpacity="0.75" /></radialGradient>
          <radialGradient id="p3-glow"><stop offset="0" stopColor="#ffd27a" stopOpacity="0.9" /><stop offset="0.35" stopColor="#ff9a3c" stopOpacity="0.35" /><stop offset="1" stopColor="#ff7a2a" stopOpacity="0" /></radialGradient>
          <radialGradient id="p3-glow-b" cx="0.4" cy="0.5" r="0.7"><stop offset="0" stopColor="#ffcf7a" stopOpacity="0.5" /><stop offset="1" stopColor="#ffcf7a" stopOpacity="0" /></radialGradient>
          <radialGradient id="p3-wall-glow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#ffd98a" stopOpacity="0.85" /><stop offset="0.5" stopColor="#e9a85a" stopOpacity="0.35" /><stop offset="1" stopColor="#b9a888" stopOpacity="0" /></radialGradient>
          <filter id="p3-grain"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="4" /><feColorMatrix type="saturate" values="0" /></filter>
        </defs>
        <g transform={`translate(540,900) scale(${cam.z}) translate(${-cam.x},${-cam.y})`}>
          {isPhoto && <image href={staticFile(bg.src)} x={0} y={0} width={1080} height={1250} filter={bg.desat ? "url(#p3-desat)" : undefined} />}
          {isPhoto && <rect y={0} width={1080} height={1250} fill="url(#p3-fade)" />}
          {isPhoto && <Ground kind="lane" edge={bg.edge} />}

          {/* the wall: plaster in the tree's cold edge-shade, a lantern bracket, a stone step */}
          {place === "wall" && (
            <g>
              <rect x={-200} y={0} width={1480} height={1236} fill="#8e93a2" />
              {Array.from({ length: 34 }, (_, i) => <path key={i} d={`M${rnd(i, 1) * 1100 - 20} ${rnd(i, 2) * 1100} q${(rnd(i, 3) - 0.5) * 60} ${20 + rnd(i, 4) * 40} ${(rnd(i, 5) - 0.5) * 40} ${50 + rnd(i, 6) * 60}`} fill="none" stroke="#6a6f80" strokeWidth={2 + rnd(i, 7) * 3} opacity={0.5} />)}
              {Array.from({ length: 22 }, (_, i) => <ellipse key={"s" + i} cx={rnd(i, 8) * 1100} cy={rnd(i, 9) * 1100} rx={30 + rnd(i, 10) * 80} ry={14 + rnd(i, 11) * 40} fill="#7b8092" opacity={0.35} />)}
              <rect x={-200} y={1090} width={1480} height={150} fill="#7a7f90" stroke={INK} strokeWidth={6} />
              <rect x={-200} y={1090} width={1480} height={18} fill="#a4a9b8" />
              <rect x={-200} y={1236} width={1480} height={1400} fill="#6a5a46" />
              {Array.from({ length: 40 }, (_, i) => <ellipse key={"g" + i} cx={rnd(i, 12) * 1080} cy={1250 + Math.pow(rnd(i, 13), 1.6) * 600} rx={8 + rnd(i, 14) * 18} ry={4 + rnd(i, 15) * 6} fill={rnd(i, 16) > 0.5 ? "#53442f" : "#8a775a"} stroke={INK} strokeWidth={2} opacity={0.7} />)}
              {/* the lantern's warm pool on the wall */}
              <ellipse cx={330} cy={740} rx={620} ry={560} fill="url(#p3-wall-glow)" opacity={lantLit} />
              <path d="M330 540 L330 640" stroke={INK} strokeWidth={8} />
              <path d="M240 540 L330 540" stroke="#4a3a2a" strokeWidth={16} strokeLinecap="round" />
              <g transform="translate(330,700)"><Lantern lit={lantLit} t={t} s={1.5} /></g>
              <g opacity={lantLit}><Puppet k={puppetK} t={t} /></g>
            </g>
          )}

          {/* the tree's cold shadow pool and what stands in it */}
          {coldPlace && (
            <g>
              <rect x={-100} y={0} width={1300} height={1250} fill="#18285c" opacity={0.28} />
              <ellipse cx={540} cy={1110} rx={720} ry={150} fill={POOL} opacity={0.92} />
              <ellipse cx={560} cy={1095} rx={600} ry={110} fill="#0d1634" opacity={0.85} />
              <Crowd k={crowdK} cx={560} cy={1085} rx={560} ry={95} n={260} />
              {/* the thin ones at the edge, leaning in to listen */}
              {[[160, 1150, 0.78], [300, 1170, 0.86], [440, 1150, 0.8], [660, 1178, 0.88], [800, 1152, 0.8], [940, 1168, 0.84]].map(([x, y, s], i) => (
                <Sil key={i} x={x} y={y} s={s} lean={lean0(g, i) + (i < 3 ? 5 : -5) * (i % 2 ? 1 : 0.4)} thin={0.62} flip={i < 3 ? 1 : -1} fill="#060a1c" />
              ))}
              {/* the child, waving from inside the pool */}
              <g opacity={g >= ls(7) - 18 ? smooth(clamp01((g - ls(7) + 18) / 22)) : 0}>
                <Sil x={555} y={1215} s={0.78} wave={childWave} t={t} fill="#2a3a78" rim="#9fb4ec" thin={0.9} />
              </g>
              <ellipse cx={540} cy={1260} rx={600} ry={46} fill="#0d1634" opacity={0.4} />
            </g>
          )}

          <g filter={coldPlace ? "url(#p3-cold)" : "url(#pv-grade)"}>
            {sorted.filter((p) => p.y <= you.y).map((p, i) => <Villager key={p.id + i + "a"} {...p} t={t} />)}
            {you.shadow && showShadow && place !== "tree" && <Shade x={you.x} y={you.y} k={you.s * shK} skew={shSkew} sq={shSq}><Traveller yaw={you.yaw} silhouette walk={you.walk} phase={you.phase} /></Shade>}
            <g>
              <g transform={`translate(${you.x},${you.y + yi.dy}) rotate(${yi.rot}) scale(${you.s},${you.s * yi.sy})`}><Traveller yaw={you.yaw} mood={you.mood} walk={you.walk} phase={you.phase} t={t} /></g>
            </g>
            {sorted.filter((p) => p.y > you.y).map((p, i) => <Villager key={"f" + p.id + i} {...p} t={t} />)}
          </g>

          {/* dusk: the clapper post and the lanterns lit by everyone together */}
          {place === "dusk" && (
            <g>
              <g transform="translate(1000,1250)"><Clapper hit={hit} /></g>
              {lanterns.map((l, i) => <g key={"p" + i}><line x1={l.x} y1={l.gy} x2={l.x} y2={l.y - 70 * l.s} stroke={INK} strokeWidth={11 * l.s} /><line x1={l.x} y1={l.gy} x2={l.x} y2={l.y - 70 * l.s} stroke="#6a5236" strokeWidth={6 * l.s} /></g>)}
              {lanterns.map((l, i) => <g key={i} transform={`translate(${l.x},${l.y})`}><Lantern lit={l.lit} s={l.s} t={t} seed={i} /></g>)}
            </g>
          )}
        </g>
        {place === "dusk" && <rect width={1080} height={1920} fill="#1d2152" opacity={0.55 * duskK} />}
        {place === "dusk" && <rect width={1080} height={1920} fill="#ff7a2a" opacity={0.14 * duskK} />}
        {place === "dusk" && (
          <g transform={`translate(540,900) scale(${cam.z}) translate(${-cam.x},${-cam.y})`}>
            {lanterns.map((l, i) => <circle key={i} cx={l.x} cy={l.y} r={170 * l.s} fill="url(#p3-glow)" opacity={0.8 * l.lit} />)}
          </g>
        )}
        {insert && <GripInsert k={(g - mid(10, 0.25)) / Math.max(1, ls(11) - mid(10, 0.25))} t={t} />}
        <rect width={1080} height={1920} fill="#fffaf0" opacity={g >= strike && g < strike + 5 ? 0.5 * (1 - (g - strike) / 5) : 0} />
        <rect width={1080} height={1920} filter="url(#p3-grain)" opacity={0.14} />
        <rect width={1080} height={1920} fill="url(#p3-vig)" />
        <rect width={1080} height={1920} fill="#050403" opacity={dark} />
      </svg>
      <Card a="หมู่บ้านที่ไม่มีใครมีเงา" b="ตอนที่ 3 · ต้นไม้ที่มีเงาเยอะเกินไป" at={C.titleAt} dur={46} g={g} />
      {manifest.shots.map((shot, i) => (
        <Sequence key={i} from={manifest.starts[i] + shot.leadFrames} durationInFrames={shot.audioFrames}>
          <Audio src={staticFile(shot.audio)} />
          <Subtitle text={SUBTITLE_FIX(shot.text)} from={manifest.starts[i] + shot.leadFrames} g={g} />
        </Sequence>
      ))}
      {g >= manifest.outroStart && (
        <div style={{ position: "absolute", inset: 0, background: "#0a0706", fontFamily, color: "#f4ead2", opacity: clamp01((g - manifest.outroStart) / 12) }}>
          <div style={{ position: "absolute", top: 520, left: 80, right: 160, textAlign: "center" }}>
            <div style={{ fontSize: 60, lineHeight: 1.45 }}>ถ้าเป็นคุณ<br />จะกล้ายืนนิ่งๆ ให้เงาตัวเอง<br />ยืดไปหาต้นไม้มั้ย?</div>
            <div style={{ fontSize: 40, marginTop: 28, color: "#c9b79a" }}>คอมเมนต์บอกหน่อย</div>
          </div>
          <div style={{ position: "absolute", top: 1080, left: 80, right: 160, textAlign: "center", opacity: clamp01((g - manifest.outroStart - 60) / 12) }}>
            <div style={{ fontSize: 40, color: "#c9b79a" }}>ตอนต่อไป</div>
            <div style={{ fontSize: 66, marginTop: 14 }}>ทางออกที่ไม่มีแสง</div>
          </div>
        </div>
      )}
      <Audio src={staticFile("shadow3v/bed.wav")} volume={0.6} />
    </AbsoluteFill>
  );
};

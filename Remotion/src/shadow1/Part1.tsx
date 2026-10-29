import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import manifest from "./manifest.json";
import { fontFamily } from "../island/fonts";
import { Figure, HAT_HOLD_END, LOOKS, Mood } from "./Figure";
import { Traveller, TravellerMood } from "./Traveller";
import { Bucket, Crates, INK, Mooring, Net, PIER_TOP, Rope, SHADOW, Shade } from "./VillageVert";
import { clamp01, lerp, smooth } from "../onestar3/util";

// "หมู่บ้านที่ไม่มีใครมีเงา" Part 1, "เงาของคุณ". Three places in one village, each a painted-over CC0 photo backdrop (public/shadow1/bg_*.png) behind code-drawn cast:
//   lane  (a dirt lane between wooden houses, Laos photo): the hook, the greeting, the hat and the final stare
//   pier  (a plank pier by a stilt house, Myanmar photo): the landing, the objects and the child, the clapper, the stretching shadow
//   alley (a stone alley between old houses, Nepal photo): the walk and the washing
// A list of short shots (a new angle every 2 to 3 s, hard cuts inside a place, each shot drifting); all timing comes from manifest.json (the narration audio).
// Characters only walk while they actually move and idle (breathe, sway) otherwise. Only "you" and objects cast shadows; villagers never do.

const C = manifest.cues as Record<string, number>;
const ls = (i: number) => C[`lineStart${i}`];
const le = (i: number) => C[`lineEnd${i}`];

/** the head lifts his straw hat off and holds it out over you (line 11) and keeps holding it to the end */
const hatHold = (g: number) => clamp01((g - ls(11) - 14) / 30);
/** the world x where you stand under the held hat: the head stands at LANEL.head (760, scale 0.7 x look scale) */
const HAT_X = 760 - HAT_HOLD_END[0] * 0.7 * 1.08;

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

type Who = { id: string; x: number; y: number; s: number; mood: Mood; face?: 1 | -1; walk?: number; up?: number; nod?: number; seed?: number; talk?: number; hatHold?: number; turn?: number };

/** a living idle: slow breathing and a small sway so nobody is a statue; walking figures bob instead */
const idle = (t: number, seed: number, still: boolean) => (still ? { rot: Math.sin(t * 0.05 + seed) * 0.9, sy: 1 + Math.sin(t * 0.11 + seed * 2) * 0.008, dy: Math.sin(t * 0.11 + seed * 2) * -1.5 } : { rot: 0, sy: 1, dy: Math.abs(Math.sin(t * 0.25 + seed)) * -3 });

/** a villager: never casts a shadow */
const Villager: React.FC<Who & { t: number }> = ({ id, x, y, s, mood, face = 1, walk = 0, up = 0, nod = 0, seed = 0, talk = 0, hatHold = 0, turn = 0, t }) => {
  const i = idle(t, seed, walk < 0.05);
  return (
    <g transform={`translate(${x},${y + i.dy}) rotate(${i.rot}) scale(${s},${s * i.sy}) translate(0,${nod * 14})`}>
      <Figure look={LOOKS[id]} mood={mood} facing={face} walk={walk} armsUp={up} talk={talk} hatHold={hatHold} turn={turn} t={t + seed * 40} />
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


/** the ground in front of a photo backdrop, drawn in code in the same flat-colour + ink style: packed dirt with ruts and pebbles (lane) or stone paving (alley) */
const Ground: React.FC<{ kind: "lane" | "alley"; edge: string }> = ({ kind, edge }) => {
  const rnd = (i: number, k: number) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };
  const top = 1236;
  return (
    <g strokeLinejoin="round">
      <rect x={-200} y={top} width={1480} height={1500} fill={edge} />
      {kind === "lane" ? (
        <g>
          {/* two wheel ruts running toward the horizon */}
          {[[300, 120], [760, 980]].map(([x0, x1], i) => (
            <g key={i}><path d={`M${x0} ${top + 20} Q${(x0 + x1) / 2} ${top + 300} ${x1} 1900`} fill="none" stroke="#5a4326" strokeWidth={34} opacity={0.45} /><path d={`M${x0} ${top + 20} Q${(x0 + x1) / 2} ${top + 300} ${x1} 1900`} fill="none" stroke={INK} strokeWidth={4} opacity={0.5} /></g>
          ))}
          {Array.from({ length: 70 }, (_, i) => {
            const y = top + 30 + Math.pow(rnd(i, 1), 1.6) * 640;
            const k = 0.5 + (y - top) / 500;
            return <ellipse key={i} cx={rnd(i, 2) * 1080} cy={y} rx={(5 + rnd(i, 3) * 12) * k} ry={(3 + rnd(i, 4) * 5) * k} fill={rnd(i, 5) > 0.5 ? "#6a5232" : "#c9b184"} stroke={INK} strokeWidth={2} opacity={0.75} />;
          })}
          {Array.from({ length: 9 }, (_, i) => <path key={"c" + i} d={`M${rnd(i, 6) * 1000} ${top + 60 + i * 70} l${40 + rnd(i, 7) * 60} ${10 + rnd(i, 8) * 16} l${30} ${-8}`} fill="none" stroke="#3a2a18" strokeWidth={3} opacity={0.55} />)}
        </g>
      ) : (
        <g>
          {Array.from({ length: 9 }, (_, r) => {
            const y0 = top + Math.pow(r / 9, 1.5) * 700;
            const y1 = top + Math.pow((r + 1) / 9, 1.5) * 700;
            const n = 3 + r;
            return (
              <g key={r}>
                {Array.from({ length: n + 1 }, (_, c) => {
                  const x0 = -100 + (c * 1280) / n + (r % 2 ? 40 : 0) + (rnd(r * 9 + c, 1) - 0.5) * 20;
                  const x1 = -100 + ((c + 1) * 1280) / n + (r % 2 ? 40 : 0) + (rnd(r * 9 + c, 2) - 0.5) * 20;
                  const tone = ["#a38864", "#94795a", "#b09670", "#8a7050"][Math.floor(rnd(r * 9 + c, 3) * 4)];
                  return <path key={c} d={`M${x0 + 3} ${y0 + 2} L${x1 - 3} ${y0 + 3} L${x1 - 8} ${y1 - 3} L${x0 + 8} ${y1 - 2} Z`} fill={tone} stroke={INK} strokeWidth={2.5 + r * 0.4} opacity={0.95} />;
                })}
              </g>
            );
          })}
        </g>
      )}
      <rect x={-200} y={top + 500} width={1480} height={1000} fill="#1a120a" opacity={0.18} />
      <rect x={-200} y={top - 2} width={1480} height={90} fill={`url(#gfade-${kind})`} />
      <defs><linearGradient id={`gfade-${kind}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={edge} stopOpacity="1" /><stop offset="1" stopColor={edge} stopOpacity="0" /></linearGradient></defs>
    </g>
  );
};

const dipOf = (g: number, a: number, b: number) => clamp01(Math.min((g - a) / 7, (b - g) / 7));

type Place = "lane" | "pier" | "alley";
const placeAt = (g: number): Place => (g < ls(2) ? "lane" : g < ls(4) ? "pier" : g < ls(7) ? "lane" : g < ls(9) ? "alley" : g < ls(10) ? "pier" : "lane");
const BREAKS = () => [ls(2), ls(4), ls(7), ls(9), ls(10)];
const BG: Record<Place, { src: string; edge: string }> = {
  lane: { src: "shadow1/bg_lane.png", edge: "#95754d" },
  pier: { src: "shadow1/bg_asia.png", edge: "#987f60" },
  alley: { src: "shadow1/bg_alley.png", edge: "#8b6c52" },
};

// ------------------------------------------------------------------ the shot list: [from, to, camera at the start, camera at the end]; fx = follow "you" (camera x = your x + fx)
type Cam4 = { x: number; y: number; z: number; r?: number; fx?: number };
type Shot = [number, number, Cam4, Cam4];
const SHOTS = (): Shot[] => [
  // cuts only on a story beat (a new line, someone acts, a point of view); inside a shot the camera drifts slowly; no tilts
  // hook (the lane): from your feet, pull back to reveal the whole village standing there; then their faces
  [0, ls(1), { x: 560, y: 1250, z: 2.6 }, { x: 660, y: 1090, z: 1.35 }],
  [ls(1), ls(2), { x: 740, y: 1010, z: 1.9 }, { x: 740, y: 1005, z: 2.3 }],
  // the landing (the pier): the boat leaves while you walk up the planks, then your feet and shadow
  [ls(2), ls(2) + 150, { x: 540, y: 1060, z: 1.05 }, { x: 690, y: 1190, z: 1.4 }],
  [ls(2) + 150, le(2) + 8, { x: 790, y: 1290, z: 2.4 }, { x: 790, y: 1290, z: 2.15 }],
  // line 3: a pan across the objects and their shadows, then the child runs in with none
  [ls(3), ls(3) + 80, { x: 260, y: 1690, z: 1.6 }, { x: 780, y: 1640, z: 1.6 }],
  [ls(3) + 80, le(3) + 6, { x: 240, y: 1100, z: 2.4 }, { x: 260, y: 1095, z: 2.6 }],
  // line 4 (the lane): everyone walks in and greets you together
  [ls(4), le(4) + 6, { x: 700, y: 1100, z: 1.2 }, { x: 690, y: 1080, z: 1.35 }],
  // line 5: the head's face, then what he looks at (your feet and shadow)
  [ls(5), ls(5) + 50, { x: 740, y: 1010, z: 2.2 }, { x: 740, y: 1000, z: 2.5 }],
  [ls(5) + 50, le(5) + 6, { x: 440, y: 1220, z: 1.9 }, { x: 420, y: 1225, z: 2.0 }],
  // line 6: he speaks, then your face
  [ls(6), ls(6) + 55, { x: 740, y: 1000, z: 2.5 }, { x: 740, y: 995, z: 2.7 }],
  [ls(6) + 55, le(6) + 6, { x: 430, y: 1060, z: 2.5 }, { x: 430, y: 1050, z: 2.65 }],
  // line 7 (the alley): one tracking shot of the walk
  [ls(7), le(7) + 6, { x: 640, y: 1150, z: 1.4, fx: 90 }, { x: 600, y: 1150, z: 1.45, fx: 90 }],
  // line 8: the woman takes her washing out of the shadow and into the sun; then the same woman, sweating
  [ls(8), ls(8) + 62, { x: 340, y: 1120, z: 1.8 }, { x: 470, y: 1130, z: 1.7 }],
  [ls(8) + 62, le(8) + 6, { x: 700, y: 1060, z: 2.2 }, { x: 700, y: 1050, z: 2.45 }],
  // line 9 (the pier): the oldman and the clapper, one slow push in
  [ls(9), le(9) + 6, { x: 870, y: 1700, z: 1.5 }, { x: 900, y: 1660, z: 1.85 }],
  // line 10 (the lane): everyone looks down; then the faces come up smiling
  [ls(10), ls(10) + 50, { x: 700, y: 1110, z: 1.2 }, { x: 700, y: 1100, z: 1.3 }],
  [ls(10) + 50, le(10) + 6, { x: 760, y: 990, z: 2.2 }, { x: 760, y: 985, z: 2.35 }],
  // line 11: you walk to the head; he holds his hat over you
  [ls(11), ls(11) + 55, { x: 600, y: 1130, z: 1.4 }, { x: 640, y: 1120, z: 1.5 }],
  [ls(11) + 55, le(11) + 6, { x: 640, y: 1010, z: 2.0 }, { x: 630, y: 1020, z: 2.1 }],
  // line 12: the shadow grows out from under the hat across the dirt
  [ls(12), le(12) + 6, { x: 560, y: 1180, z: 1.5 }, { x: 470, y: 1220, z: 1.3 }],
  // line 13: the whole village turns to look at it; slow push in on the faces
  [ls(13), ls(13) + 60, { x: 700, y: 1110, z: 1.2 }, { x: 700, y: 1100, z: 1.3 }],
  [ls(13) + 60, le(13) + 40, { x: 780, y: 1010, z: 1.8 }, { x: 780, y: 995, z: 2.2 }],
];

export const Part1: React.FC<{ g?: number }> = ({ g: gOverride }) => {
  const frameNow = useCurrentFrame();
  const g = gOverride ?? frameNow;
  const t = g;
  const place = placeAt(g + 6);
  // dips to black between different places
  const edges = [-999, ...BREAKS().map((b) => b - 6), 99999];
  let black = 1;
  for (let i = 0; i + 1 < edges.length; i++) black = Math.min(black, 1 - dipOf(g, edges[i], edges[i + 1]));
  black = Math.min(black, 1);
  const dark = 1 - Math.max(...edges.slice(0, -1).map((e, i) => dipOf(g, e, edges[i + 1])));
  void black;

  // ---------------------------------------------------------------- the cast
  const PIERL: Record<string, Pt> = { oldman: [0, 480, 1090, 0.5], cook: [0, 250, 1100, 0.52], head: [0, 370, 1180, 0.68], mother: [0, 585, 1190, 0.66], child: [0, 140, 1200, 0.9] };
  const LANEL: Record<string, Pt> = { cook: [0, 640, 1085, 0.55], oldman: [0, 880, 1070, 0.52], head: [0, 760, 1140, 0.7], mother: [0, 940, 1190, 0.68], child: [0, 620, 1190, 0.9] };
  const IDS = ["oldman", "cook", "head", "mother", "child"];
  let you = { x: 420, y: 1230, s: 0.95, yaw: 50, mood: "worry" as TravellerMood, walk: 0, shadowK: 1, skew: -55, sq: 0.34 };
  const people: Who[] = [];
  const stand = (L: Record<string, Pt>, m: (id: string) => Mood, extra: (id: string) => Partial<Who> = () => ({})) => IDS.forEach((id) => people.push({ id, x: L[id][1], y: L[id][2], s: L[id][3], mood: m(id), seed: id.length, ...extra(id) }));

  if (g < ls(2) && place === "lane") {
    // a flash-forward: the whole village stands and stares at you; only your feet have a shadow
    stand(LANEL, () => (g >= ls(1) ? "stare" : "smile"));
  }
  if (place === "pier" && g >= ls(2) && g < ls(4)) {
    you = { ...you, x: 800, y: 1300, yaw: -25 };
    if (g < ls(3)) {
      // you step off the boat onto the pier and walk toward the camera
      const tr = track(g, [[ls(2) + 30, 470, 1020, 0.62], [ls(2) + 150, 800, 1300, 0.95]]);
      you = { ...you, x: tr.x, y: tr.y, s: tr.s, walk: tr.walk, yaw: tr.walk > 0.1 ? 60 : -25 };
    } else if (g >= ls(3) + 80) {
      // the child runs across the planks
      const tr = track(g, [[ls(3) + 80, -90, 1190, 0.9], [ls(3) + 140, 215, 1190, 0.9]]);
      people.push({ id: "child", x: tr.x, y: tr.y, s: tr.s, mood: "smile", walk: tr.walk, seed: 3 });
    }
  }
  if (place === "lane" && g >= ls(4) && g < ls(7)) {
    // everyone walks in from the right and greets together (line 4)
    const wave = g >= ls(4) + 50 && g < le(4) ? Math.max(0, Math.sin((g - ls(4) - 50) / 5)) * 0.9 : 0;
    IDS.forEach((id, k) => {
      const from = ls(4) - 10 + k * 3;
      const tr = track(g, [[from, 1260 + k * 30, LANEL[id][2], LANEL[id][3]], [from + 55, LANEL[id][1], LANEL[id][2], LANEL[id][3]]]);
      const talking = id === "head" && g >= ls(6) + 2 && g < ls(6) + 40;
      people.push({ id, x: tr.x, y: tr.y, s: tr.s, mood: "smile", walk: tr.walk, face: tr.walk > 0.05 ? -1 : 1, up: tr.walk > 0.05 ? 0 : wave, seed: id.length, talk: talking ? 1 : 0 });
    });
    if (g >= ls(5) + 55) {
      // the head looks down at your feet, then back up with the same smile
      const idx = people.findIndex((p) => p.id === "head");
      if (idx >= 0) people[idx] = { ...people[idx], mood: g > ls(5) + 85 ? "smile" : "calm", nod: clamp01((g - ls(5) - 50) / 10) * (g > ls(5) + 100 ? clamp01(1 - (g - ls(5) - 100) / 10) : 1) };
    }
  }
  const youA = track(g, [[ls(7), 800, 1180, 0.9], [le(7), 520, 1180, 0.9]]);
  const headA = track(g, [[ls(7), 680, 1170, 0.72], [le(7), 380, 1170, 0.72]]);
  // line 8: a woman lifts the washing out of the house's shadow and carries it into the sun; then a cut to a villager sweating in the glare
  const motherA = track(g, [[ls(8) + 28, 290, 1215, 0.66], [ls(8) + 78, 700, 1220, 0.66]]);
  const lifted = g >= ls(8) + 14;
  const carried = g >= ls(8) + 28;
  if (place === "alley") {
    if (g < ls(8)) {
      you = { ...you, x: youA.x, y: youA.y, s: youA.s, yaw: youA.walk > 0.05 ? 270 : -20, walk: youA.walk };
      people.push({ id: "head", x: headA.x, y: headA.y, s: 0.72, mood: "smile", face: headA.walk > 0.05 ? -1 : 1, walk: headA.walk, seed: 1 });
    } else if (g < ls(8) + 62) {
      people.push({ id: "mother", x: carried ? motherA.x : 290, y: carried ? motherA.y : 1215, s: 0.66, mood: "calm", walk: carried ? motherA.walk : 0, up: lifted && !carried ? clamp01((g - ls(8) - 14) / 12) * 0.8 : 0, seed: 2 });
    } else {
      // the same woman, now standing in the full sun with the cloth, sweating, refusing to step back into the shade
      people.push({ id: "mother", x: 700, y: 1220, s: 0.66, mood: "worry", seed: 2 });
    }
  }
  if (place === "pier" && g >= ls(9) && g < ls(10)) {
    // the oldman by the post strikes the clapper
    people.push({ id: "oldman", x: 800, y: 1860, s: 0.95, mood: "calm", up: g < C.clapAt ? clamp01((g - ls(9)) / Math.max(1, C.clapAt - ls(9))) : clamp01(1 - (g - C.clapAt) / 6), seed: 4 });
  }
  if (place === "lane" && g >= ls(10)) {
    const down = g >= ls(10) && g < ls(10) + 40 ? clamp01((g - ls(10)) / 10) : g >= ls(10) + 40 && g < ls(11) ? clamp01(1 - (g - ls(10) - 40) / 12) : 0;
    const m: Mood = g >= ls(13) + 30 ? "stare" : g >= ls(10) + 46 ? "smile" : "calm";
    const walkIn = track(g, [[ls(11), 420, 1230, 0.95], [ls(11) + 45, HAT_X, 1150, 0.76]]);
    const toHat = clamp01((g - ls(11)) / 45);
    // under the brim the shadow shrinks to a dot; as the light slants (line 12) it grows again and stretches toward the left
    const grow = g >= ls(12) ? smooth(clamp01((g - ls(12)) / (le(13) - ls(12)))) : 0;
    you = {
      ...you,
      x: g >= ls(11) ? walkIn.x : 420,
      y: g >= ls(11) ? walkIn.y : 1230,
      s: g >= ls(11) ? walkIn.s : 0.95,
      yaw: g >= ls(11) && walkIn.walk > 0.05 ? 90 : g >= ls(11) ? 60 : 50,
      walk: g >= ls(11) ? walkIn.walk : 0,
      shadowK: g >= ls(12) ? lerp(0.3, 2.6, grow) : lerp(1, 0.3, smooth(toHat)),
      skew: g >= ls(12) ? lerp(-55, -76, grow) : -55,
      sq: g >= ls(12) ? lerp(0.2, 0.45, grow) : lerp(0.34, 0.2, toHat),
    };
    const LATE: Record<string, Pt> = g >= ls(11) ? { ...LANEL, cook: [0, 1010, 1080, 0.55], child: [0, 860, 1228, 0.9] } : LANEL;
    // in the final stare everyone turns toward your shadow (to the left) and lowers the eyes a little
    const look = g >= ls(13) ? smooth(clamp01((g - ls(13) - 10) / 20)) : 0;
    stand(LATE, () => m, (id) => (id === "head" ? { nod: down + look * 0.4, face: g >= ls(11) ? -1 : 1, hatHold: hatHold(g), turn: look } : { nod: down + look * 0.4, turn: -look }));
  }
  const still = you.walk < 0.05;
  const yi = idle(t, 0.7, still);

  // ---------------------------------------------------------------- camera: pick the shot, drift inside it, hard cut at its end
  const shots = SHOTS();
  let cam = { x: 540, y: 1100, z: 1.2, r: 0 };
  const brk = BREAKS();
  const cur = shots.find(([a, b]) => g >= (brk.includes(a) ? a - 6 : a) && g < b);
  const fxOf = (c: Cam4) => (c.fx !== undefined ? you.x + c.fx : c.x);
  if (cur) {
    const [a, b, c0, c1] = cur;
    const k = smooth(clamp01((g - a) / Math.max(1, b - a)));
    cam = { x: lerp(fxOf(c0), fxOf(c1), k), y: lerp(c0.y, c1.y, k), z: lerp(c0.z, c1.z, k), r: lerp(c0.r ?? 0, c1.r ?? 0, k) };
  } else {
    const prev = [...shots].reverse().find(([, b]) => b <= g);
    if (prev) cam = { x: fxOf(prev[3]), y: prev[3].y, z: prev[3].z, r: prev[3].r ?? 0 };
  }
  cam = { ...cam, x: Math.min(Math.max(cam.x, 540 / cam.z), 1080 - 540 / cam.z), y: Math.max(cam.y, 900 / cam.z) };

  const boatX = lerp(420, 1300, smooth(clamp01((g - ls(2) - 70) / 160)));
  const clapHit = g >= C.clapAt && g < C.clapAt + 5 ? 1 : 0;
  const flash = g >= C.clapAt && g < C.clapAt + 6 ? 0.35 * (1 - (g - C.clapAt) / 6) : 0;
  const sweatT = clamp01((g - ls(8) - 66) / 30);
  const sweatOn = place === "alley" && g >= ls(8) + 62 && g <= le(8) + 6;
  const bg = BG[place];
  const youShown = !(place === "pier" && g >= ls(9) && g < ls(10)) && !(place === "alley" && g >= ls(8));

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
          <filter id="p1-bgdesat" colorInterpolationFilters="sRGB"><feColorMatrix type="saturate" values="0.72" /></filter>
          <linearGradient id="p1-fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0.93" stopColor={bg.edge} stopOpacity="0" /><stop offset="1" stopColor={bg.edge} stopOpacity="1" /></linearGradient>
          <linearGradient id="p1-ground" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={bg.edge} /><stop offset="1" stopColor="#3a2c1e" /></linearGradient>
                    <radialGradient id="p1-vig" cx="0.5" cy="0.5" r="0.75"><stop offset="0.5" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#0a0604" stopOpacity="0.75" /></radialGradient>
          <filter id="p1-grain"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="4" /><feColorMatrix type="saturate" values="0" /></filter>
        </defs>
        <g transform={`translate(540,900) rotate(${cam.r}) scale(${cam.z}) translate(${-cam.x},${-cam.y})`}>
          <image href={staticFile(bg.src)} x={0} y={0} width={1080} height={1250} filter={place === "pier" ? undefined : "url(#p1-bgdesat)"} />
          <rect y={0} width={1080} height={1250} fill="url(#p1-fade)" />
          {place === "pier" && (g < ls(4)) && <Boat x={g < ls(2) ? 420 : boatX} y={920} rock={t * 0.07} />}
          {place !== "pier" && <Ground kind={place} edge={bg.edge} />}
          <g filter="url(#pv-grade)">
            {place === "pier" ? (
              <g>
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
                {g >= ls(3) + 60 && g < ls(4) && <g><Shade x={330} y={1200} k={0.9} skew={you.skew} sq={you.sq}><Bucket shadow /></Shade><g transform="translate(330,1200) scale(0.9)"><Bucket /></g></g>}
              </g>
            ) : (
              <g>
                
                {/* things with hard shadows on the ground */}
                <Shade x={150} y={place === "lane" ? 1100 : 1180} k={0.55} skew={you.skew} sq={you.sq}><Crates shadow /></Shade>
                <g transform={`translate(150,${place === "lane" ? 1100 : 1180}) scale(0.55)`}><Crates /></g>
                <Shade x={1010} y={place === "lane" ? 1130 : 1240} k={0.8} skew={you.skew} sq={you.sq}><Bucket shadow /></Shade>
                <g transform={`translate(1010,${place === "lane" ? 1130 : 1240}) scale(0.8)`}><Bucket /></g>
                <Shade x={place === "lane" ? 300 : 880} y={place === "lane" ? 1075 : 1090} k={0.7} skew={you.skew} sq={you.sq}><Mooring shadow /></Shade>
                <g transform={`translate(${place === "lane" ? 300 : 880},${place === "lane" ? 1075 : 1090}) scale(0.7)`}><Mooring /></g>
                {place === "alley" && (
                  <g>
                    <polygon points="140,1150 520,1150 580,1250 90,1250" fill={SHADOW} opacity={0.62} />
                    <g stroke={INK} strokeWidth={5}><rect x={190} y={1100} width={14} height={150} fill="#5a4630" /><rect x={400} y={1100} width={14} height={150} fill="#5a4630" /></g>
                    <line x1={197} y1={1112} x2={407} y2={1112} stroke={INK} strokeWidth={4} />
                    {[[225, "#e9dcc0"], [290, "#e9dcc0"], [350, "#c8512d"]].map(([x, c], i) => (i === 1 && lifted) ? null : <rect key={i} x={x as number} y={1116} width={42} height={64} fill={c as string} stroke={INK} strokeWidth={4} />)}
                  </g>
                )}
                {place === "alley" && lifted && <rect x={(carried ? motherA.x : 290) + 18} y={(carried ? motherA.y : 1215) - 150} width={42} height={64} fill="#e9dcc0" stroke={INK} strokeWidth={4} />}
                {place === "lane" && g >= ls(11) + 14 && (() => {
                  // the held hat's own shadow, thrown by the same sun as everything else (height above the ground where you stand)
                  const k = 0.7 * 1.08;
                  const hx = 760 - (HAT_HOLD_END[0] * smooth(hatHold(g))) * k;
                  const hy = 1140 + (HAT_HOLD_END[1] * smooth(hatHold(g)) + (-442 - 52) * (1 - smooth(hatHold(g)))) * k;
                  return <Shade x={hx} y={1150} skew={you.skew} sq={you.sq}><ellipse cx={0} cy={-(1150 - hy)} rx={150 * k} ry={34 * k} fill={SHADOW} /></Shade>;
                })()}
              </g>
            )}
            {[...people].filter((p) => !(place === "lane" && g >= ls(11) && p.id === "head")).sort((a, b) => a.y - b.y).map((p, i) => <Villager key={p.id + i} {...p} t={g >= ls(13) + 30 ? 0 : t} />)}
            {youShown && (
              <g>
                <Shade x={you.x} y={you.y} k={you.s * you.shadowK} skew={you.skew} sq={you.sq}><Traveller yaw={you.yaw} silhouette walk={you.walk} phase={t * 0.25} /></Shade>
                <g transform={`translate(${you.x},${you.y + yi.dy}) rotate(${yi.rot}) scale(${you.s},${you.s * yi.sy})`}><Traveller yaw={you.yaw} mood={you.mood} walk={you.walk} phase={t * 0.25} t={t} /></g>
              </g>
            )}
            {place === "lane" && g >= ls(11) && people.filter((p) => p.id === "head").map((p, i) => <Villager key={p.id + i} {...p} t={g >= ls(13) + 30 ? 0 : t} />)}
            {sweatOn && (
              <g transform="translate(700,0)">
                {sweatT >= 0.8 && <g><ellipse cx={34} cy={1222} rx={24 + (sweatT - 0.8) * 160} ry={7 + (sweatT - 0.8) * 30} fill="none" stroke="#2a1d10" strokeWidth={4} opacity={0.7} /><ellipse cx={34} cy={1222} rx={14} ry={5} fill="#2a1d10" opacity={0.6} /></g>}
                {sweatT < 0.8 && <path d={`M34 ${930 + (sweatT / 0.8) * 270} q-14 24 0 36 q14 -12 0 -36 Z`} fill="#9cd0f2" stroke={INK} strokeWidth={3} />}
              </g>
            )}
          </g>
        </g>
        <rect width={1080} height={1920} fill="#fff6dc" opacity={flash} />
        <rect width={1080} height={1920} filter="url(#p1-grain)" opacity={0.14} />
        <rect width={1080} height={1920} fill="url(#p1-vig)" />
        <rect width={1080} height={1920} fill="#050403" opacity={dark} />
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
          {/* a question for the comments first, then the teaser */}
          <div style={{ position: "absolute", top: 560, left: 80, right: 160, textAlign: "center" }}>
            <div style={{ fontSize: 62, lineHeight: 1.45 }}>คุณคิดว่าชาวบ้าน<br />อยากได้อะไรจากเงาของคุณ?</div>
            <div style={{ fontSize: 40, marginTop: 28, color: "#c9b79a" }}>คอมเมนต์บอกหน่อย</div>
          </div>
          <div style={{ position: "absolute", top: 1040, left: 80, right: 160, textAlign: "center", opacity: clamp01((g - manifest.outroStart - 60) / 12) }}>
            <div style={{ fontSize: 40, color: "#c9b79a" }}>ตอนต่อไป</div>
            <div style={{ fontSize: 66, marginTop: 14 }}>ห้ามยืนในที่ร่ม</div>
          </div>
        </div>
      )}
      <Audio src={staticFile("shadow1v/bed.wav")} volume={0.6} />
    </AbsoluteFill>
  );
};

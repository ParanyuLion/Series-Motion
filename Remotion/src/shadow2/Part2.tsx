import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import manifest from "./manifest.json";
import { fontFamily } from "../island/fonts";
import { Mood } from "../shadow1/Figure";
import { Traveller, TravellerMood } from "../shadow1/Traveller";
import { INK, Mooring, SHADOW, Shade } from "../shadow1/VillageVert";
import { Card, Ground, Subtitle, Villager, Who, dipOf, idle, track } from "../shadow1/Part1";
import { clamp01, lerp, smooth } from "../onestar3/util";

// "หมู่บ้านที่ไม่มีใครมีเงา" Part 2, "ห้ามยืนในที่ร่ม". Four places, each a cartoonised photo backdrop with code-drawn cast and props:
//   lane  (lines 0-5): the hook (you step into the only patch of shade, the village stares), then the noon meal at a long table in the full sun
//   barn  (line 6 to the middle of line 9): the cold granary, the thing in the corner, you run for the door
//   alley (to the middle of line 12): you burst out into the glare, the head is waiting, speaks, points
//   tree  (to the end): the great tree, whose cold shadow does not move while the post's shadow sweeps round
// Cuts only on story beats; inside a shot the camera drifts slowly. All timing comes from manifest.json (the narration audio).

const C = manifest.cues as Record<string, number>;
const ls = (i: number) => C[`lineStart${i}`];
const le = (i: number) => C[`lineEnd${i}`];
const mid = (i: number, k: number) => Math.round(ls(i) + k * (le(i) - ls(i)));

type Place = "lane" | "barn" | "alley" | "tree";
const BARN_AT = () => ls(6);
const ALLEY_AT = () => mid(9, 0.45);
const TREE_AT = () => mid(12, 0.5);
const placeAt = (g: number): Place => (g < BARN_AT() - 6 ? "lane" : g < ALLEY_AT() ? "barn" : g < TREE_AT() ? "alley" : "tree");
const BG: Record<Place, { src: string; edge: string; desat: boolean }> = {
  lane: { src: "shadow1/bg_lane.png", edge: "#95754d", desat: true },
  barn: { src: "shadow1/bg_barn.png", edge: "#1a1f29", desat: false },
  alley: { src: "shadow1/bg_alley.png", edge: "#8b6c52", desat: true },
  tree: { src: "shadow1/bg_tree.png", edge: "#c19158", desat: true },
};

const SUBTITLE_FIX = (t: string) => t.replace(/ผู้ใหญ่บ้าน/g, "ผู้ใหญ่⁠บ้าน").replace(/โรงเก็บข้าว/g, "โรง⁠เก็บ⁠ข้าว").replace(/ดวงอาทิตย์/g, "ดวง⁠อาทิตย์");

// ------------------------------------------------------------------ shots: [from, to, camera at the start, camera at the end]
type Cam4 = { x: number; y: number; z: number };
type Shot = [number, number, Cam4, Cam4];
const SHOTS = (): Shot[] => [
  // hook: you walk into the one patch of shade; then the village's faces turn to stare
  [0, ls(1), { x: 600, y: 1060, z: 1.25 }, { x: 660, y: 1060, z: 1.35 }],
  [ls(1), ls(2), { x: 260, y: 960, z: 2.0 }, { x: 260, y: 955, z: 2.35 }],
  // the noon meal in the glare
  [ls(2), ls(3), { x: 540, y: 1000, z: 1.3 }, { x: 610, y: 1000, z: 1.4 }],
  [ls(3), ls(4), { x: 880, y: 990, z: 2.0 }, { x: 890, y: 1000, z: 2.2 }],
  [ls(5), BARN_AT(), { x: 420, y: 880, z: 2.0 }, { x: 760, y: 880, z: 2.0 }],
  // the granary
  [BARN_AT(), ls(7), { x: 520, y: 980, z: 1.2 }, { x: 540, y: 1000, z: 1.3 }],
  [ls(7), mid(8, 0.35), { x: 560, y: 760, z: 2.6 }, { x: 560, y: 755, z: 2.8 }],
  [mid(8, 0.35), ls(9), { x: 860, y: 740, z: 2.2 }, { x: 870, y: 735, z: 2.6 }],
  [ls(9), ALLEY_AT(), { x: 500, y: 1000, z: 1.2 }, { x: 470, y: 980, z: 1.25 }],
  // out into the glare; the head is waiting; he speaks; he points
  [ALLEY_AT(), ls(11), { x: 420, y: 1050, z: 1.6 }, { x: 680, y: 1040, z: 1.6 }],
  [ls(11), ls(12), { x: 760, y: 880, z: 2.3 }, { x: 760, y: 875, z: 2.5 }],
  [ls(12), TREE_AT(), { x: 650, y: 1000, z: 1.5 }, { x: 640, y: 990, z: 1.55 }],
  // the tree: its shadow stays while the post's shadow sweeps round
  [TREE_AT(), ls(13), { x: 700, y: 780, z: 1.2 }, { x: 720, y: 800, z: 1.25 }],
  [ls(13), le(13) + 40, { x: 660, y: 960, z: 1.2 }, { x: 740, y: 920, z: 1.4 }],
];

const Table: React.FC = () => (
  // a long table seen from the front: a top in perspective, a cloth hanging to the ground with a red border
  <g strokeLinejoin="round">
    <polygon points="300,1040 980,1040 1010,1078 270,1078" fill="#f1e6cf" stroke={INK} strokeWidth={6} />
    <rect x={270} y={1078} width={740} height={92} fill="#e6d7b8" stroke={INK} strokeWidth={6} />
    <rect x={270} y={1150} width={740} height={14} fill="#a8332a" />
    {[360, 500, 640, 780, 920].map((x) => <path key={x} d={`M${x} 1082 q6 40 -2 84`} fill="none" stroke="#b9a782" strokeWidth={3} opacity={0.7} />)}
    {/* plates and bowls on the top */}
    {[[380, 1056], [520, 1052], [660, 1056], [800, 1052]].map(([x, y], i) => (
      <g key={i}><ellipse cx={x} cy={y} rx={44} ry={11} fill="#fbf6ea" stroke={INK} strokeWidth={4} /><ellipse cx={x} cy={y - 5} rx={24} ry={8} fill="#f4efe0" stroke={INK} strokeWidth={3} /></g>
    ))}
  </g>
);

/** the close-up on the tablecloth: your shadow lies across it and a hand slides a plate over it (line 4) */
const TableInsert: React.FC<{ k: number; t: number }> = ({ k, t }) => {
  const px = lerp(1500, 610, smooth(clamp01(k)));
  return (
    <g filter="url(#pv-grade)">
      <rect width={1080} height={1920} fill="#e8dcc0" />
      {Array.from({ length: 30 }, (_, i) => <line key={"w" + i} x1={0} y1={i * 66} x2={1080} y2={i * 66 + 20} stroke="#cdbd98" strokeWidth={3} opacity={0.6} />)}
      {Array.from({ length: 18 }, (_, i) => <line key={"v" + i} x1={i * 64} y1={0} x2={i * 64 - 20} y2={1920} stroke="#d6c6a2" strokeWidth={2} opacity={0.5} />)}
      <rect x={0} y={1640} width={1080} height={60} fill="#a8332a" />
      <rect x={0} y={1700} width={1080} height={220} fill="#5a4030" />
      {/* other plates */}
      {[[200, 420], [930, 1500]].map(([x, y], i) => (
        <g key={i}><ellipse cx={x} cy={y} rx={190} ry={150} fill="#fbf6ea" stroke={INK} strokeWidth={8} /><ellipse cx={x} cy={y} rx={120} ry={92} fill="#f4efe0" stroke={INK} strokeWidth={4} /><ellipse cx={x - 20} cy={y - 10} rx={70} ry={50} fill="#fffdf4" opacity={0.8} /></g>
      ))}
      {/* your shadow across the cloth: head and shoulders */}
      <g transform="translate(470,-260) rotate(172) scale(2.4,-2.4)" opacity={0.8}><g transform="scale(1,-1)"><Traveller silhouette /></g></g>
      {/* the sleeve and the hand that slide a plate over it */}
      <g transform={`translate(${px},820)`}>
        <path d="M120 40 Q420 70 900 20" fill="none" stroke={INK} strokeWidth={150} strokeLinecap="round" />
        <path d="M120 40 Q420 70 900 20" fill="none" stroke="#eee6d4" strokeWidth={134} strokeLinecap="round" />
        <ellipse cx={0} cy={0} rx={230} ry={175} fill="#fbf6ea" stroke={INK} strokeWidth={9} />
        <ellipse cx={0} cy={0} rx={150} ry={110} fill="#f4efe0" stroke={INK} strokeWidth={5} />
        <ellipse cx={-26} cy={-14} rx={90} ry={60} fill="#fffdf4" opacity={0.8} />
        <ellipse cx={170} cy={70} rx={56} ry={44} fill="#e7b890" stroke={INK} strokeWidth={7} />
        {[0, 1, 2].map((i) => <path key={i} d={`M${150 + i * 18} ${36} q-8 -22 4 -40`} fill="none" stroke={INK} strokeWidth={5} />)}
      </g>
      <rect width={1080} height={1920} fill="#fff4d6" opacity={0.08 + 0.03 * Math.sin(t * 0.07)} />
    </g>
  );
};

export const Part2: React.FC<{ g?: number }> = ({ g: gOverride }) => {
  const frameNow = useCurrentFrame();
  const g = gOverride ?? frameNow;
  const t = g;
  const place = placeAt(g + (g < BARN_AT() ? 0 : 0));
  // a dip to black at the time jump (hook -> meal) and at the move into the granary; hard cuts elsewhere (white flash into the glare)
  const edges = [-999, ls(2) - 6, BARN_AT() - 6, 99999];
  const dark = 1 - Math.max(...edges.slice(0, -1).map((e, i) => dipOf(g, e, edges[i + 1])));
  const flash = g >= ALLEY_AT() && g < ALLEY_AT() + 10 ? 1 - (g - ALLEY_AT()) / 10 : 0;
  const insert = g >= ls(4) && g < ls(5);

  // ---------------------------------------------------------------- the cast
  let you = { x: 500, y: 1200, s: 0.85, yaw: 90, mood: "worry" as TravellerMood, walk: 0, phase: t * 0.25, shadow: true, cold: false };
  const people: Who[] = [];
  if (place === "lane" && g < ls(2)) {
    // hook: you walk into the eave's shade on the right; the villagers on the left turn and stare
    const tr = track(g, [[8, 470, 1200, 0.85], [78, 860, 1195, 0.85]]);
    you = { ...you, x: tr.x, y: tr.y, walk: tr.walk, yaw: tr.walk > 0.05 ? 90 : -20 };
    const m: Mood = g >= ls(1) - 6 ? "stare" : "smile";
    const turn = smooth(clamp01((g - 60) / 20));
    const L: [string, number, number, number][] = [["cook", 130, 1085, 0.55], ["oldman", 330, 1070, 0.52], ["head", 220, 1140, 0.7], ["mother", 400, 1190, 0.68], ["child", 90, 1200, 0.9]];
    L.forEach(([id, x, y, s]) => people.push({ id, x, y, s, mood: m, turn, seed: id.length }));
  }
  const behind: Who[] = [];
  if (place === "lane" && g >= ls(2)) {
    // the meal: everyone eats in the glare without squinting (small arm lifts); the cook serves you
    const eat = (seed: number) => Math.max(0, Math.sin(t * 0.12 + seed)) * 0.35;
    behind.push(
      { id: "oldman", x: 420, y: 1100, s: 0.5, mood: "smile", up: eat(1), seed: 1 },
      { id: "mother", x: 545, y: 1100, s: 0.55, mood: "smile", up: eat(2), seed: 2 },
      { id: "child", x: 655, y: 1100, s: 0.66, mood: "smile", up: eat(3), seed: 3 },
      { id: "head", x: 780, y: 1100, s: 0.55, mood: "smile", up: eat(4), seed: 4 },
    );
    you = { ...you, x: 1010, y: 1190, s: 0.78, yaw: 290 };
    const cook = track(g, [[ls(3) - 4, 230, 1190, 0.6], [ls(3) + 40, 860, 1190, 0.6]]);
    const serving = g >= ls(3) + 40 && g < ls(4);
    people.push({ id: "cook", x: g < ls(3) ? 230 : cook.x, y: 1190, s: 0.6, mood: "smile", walk: g < ls(3) ? 0 : cook.walk, face: cook.walk > 0.05 ? 1 : 1, up: serving ? 0.4 + 0.4 * Math.abs(Math.sin((g - ls(3)) / 4)) : 0, seed: 5 });
  }
  const riceK = clamp01((g - ls(3) - 40) / Math.max(1, le(3) - ls(3) - 40));

  // the granary
  const breath = place === "barn" && g >= ls(7) && g < ls(9);
  if (place === "barn") {
    you = { ...you, cold: true, shadow: false };
    if (g < ls(9)) {
      const tr = track(g, [[BARN_AT() + 4, 370, 930, 0.45], [BARN_AT() + 70, 560, 1180, 0.85]]);
      const look = g >= ls(8) ? smooth(clamp01((g - ls(8)) / 20)) : 0;
      you = { ...you, x: tr.x, y: tr.y, s: tr.s, walk: tr.walk, yaw: tr.walk > 0.05 ? 0 : 10 + 50 * look };
    } else {
      // you run back to the door
      const tr = track(g, [[ls(9), 560, 1180, 0.85], [ALLEY_AT(), 380, 940, 0.48]]);
      you = { ...you, x: tr.x, y: tr.y, s: tr.s, walk: 1, phase: t * 0.5, yaw: 200 };
    }
  }
  const thing = clamp01((g - mid(8, 0.35)) / 20);
  const eyes = g >= mid(8, 0.6) && (g - mid(8, 0.6)) % 50 < 46 ? 1 : 0;

  // the alley: you burst out into the glare; the head is waiting
  if (place === "alley") {
    const tr = track(g, [[ALLEY_AT(), 160, 1185, 0.85], [ALLEY_AT() + 30, 480, 1185, 0.85]]);
    you = { ...you, x: tr.x, y: tr.y, walk: tr.walk, phase: t * 0.5, yaw: tr.walk > 0.05 ? 90 : 70 };
    const pt = g >= ls(12) ? smooth(clamp01((g - ls(12)) / 16)) : 0;
    people.push({ id: "head", x: 770, y: 1170, s: 0.72, mood: g >= ls(11) ? "calm" : "smile", face: -1, talk: g >= ls(11) + 2 && g < le(11) ? 1 : 0, point: pt, seed: 1 });
  }

  // the tree: the post's shadow sweeps round (a time-lapse) while the tree's shadow stays where it is
  const sweep = place === "tree" ? smooth(clamp01((g - ls(13)) / Math.max(1, le(13) - ls(13)))) : 0;
  const postSkew = lerp(-30, -78, sweep);
  const postSq = lerp(0.3, 0.55, sweep);

  // ---------------------------------------------------------------- camera
  const shots = SHOTS();
  let cam = { x: 540, y: 1000, z: 1.2 };
  const cur = shots.find(([a, b]) => g >= (a === BARN_AT() || a === ls(2) ? a - 6 : a) && g < b);
  if (cur) {
    const [a, b, c0, c1] = cur;
    const k = smooth(clamp01((g - a) / Math.max(1, b - a)));
    cam = { x: lerp(c0.x, c1.x, k), y: lerp(c0.y, c1.y, k), z: lerp(c0.z, c1.z, k) };
  } else {
    const prev = [...shots].reverse().find(([, b]) => b <= g);
    if (prev) cam = { ...prev[3] };
  }
  cam = { ...cam, x: Math.min(Math.max(cam.x, 540 / cam.z), 1080 - 540 / cam.z), y: Math.max(cam.y, 900 / cam.z) };
  const bg = BG[place];
  const yi = idle(t, 0.7, you.walk < 0.05);
  const sorted = [...people].sort((a, b) => a.y - b.y);

  return (
    <AbsoluteFill style={{ background: "#0a0706" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <defs>
          <filter id="pv-grade" colorInterpolationFilters="sRGB">
            <feColorMatrix type="saturate" values="0.62" />
            <feColorMatrix type="matrix" values="0.92 0 0 0 0.02  0 0.88 0 0 0.02  0 0 0.8 0 0.03  0 0 0 1 0" />
            <feComponentTransfer><feFuncR type="gamma" amplitude="0.92" exponent="1.12" /><feFuncG type="gamma" amplitude="0.92" exponent="1.12" /><feFuncB type="gamma" amplitude="0.92" exponent="1.12" /></feComponentTransfer>
          </filter>
          <filter id="p2-cold" colorInterpolationFilters="sRGB">
            <feColorMatrix type="saturate" values="0.3" />
            <feColorMatrix type="matrix" values="0.42 0 0 0 0.02  0 0.48 0 0 0.03  0 0 0.62 0 0.06  0 0 0 1 0" />
          </filter>
          <filter id="p2-desat" colorInterpolationFilters="sRGB"><feColorMatrix type="saturate" values="0.72" /></filter>
          <filter id="p2-blur"><feGaussianBlur stdDeviation="14" /></filter>
          <linearGradient id="p2-fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0.93" stopColor={bg.edge} stopOpacity="0" /><stop offset="1" stopColor={bg.edge} stopOpacity="1" /></linearGradient>
          <radialGradient id="p2-vig" cx="0.5" cy="0.5" r="0.75"><stop offset="0.5" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#0a0604" stopOpacity="0.75" /></radialGradient>
          <radialGradient id="p2-beam" cx="0.5" cy="0" r="1"><stop offset="0" stopColor="#cfe0f4" stopOpacity="0.35" /><stop offset="1" stopColor="#cfe0f4" stopOpacity="0" /></radialGradient>
          <filter id="p2-grain"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="4" /><feColorMatrix type="saturate" values="0" /></filter>
        </defs>
        <g transform={`translate(540,900) scale(${cam.z}) translate(${-cam.x},${-cam.y})`}>
          <image href={staticFile(bg.src)} x={0} y={0} width={1080} height={1250} filter={bg.desat ? "url(#p2-desat)" : undefined} />
          <rect y={0} width={1080} height={1250} fill="url(#p2-fade)" />
          {(place === "lane" || place === "alley") && <Ground kind={place} edge={bg.edge} />}
          {place === "tree" && <Ground kind="lane" edge={bg.edge} />}
          {place === "barn" && <rect x={-200} y={1236} width={1480} height={1400} fill="#11151d" />}
          <g filter="url(#pv-grade)">
            {/* the hook's patch of shade under an eave (lane) */}
            {place === "lane" && g < ls(2) && <polygon points="740,1110 1100,1110 1100,1250 690,1250" fill={SHADOW} opacity={0.62} />}
            {/* the tree's cold shadow pool: it lies toward the sun, where no shadow can be, and never moves */}
            {place === "tree" && (
              <g>
                <ellipse cx={850} cy={935} rx={400} ry={78} fill="#1b2a52" opacity={0.8} />
                <ellipse cx={1000} cy={905} rx={220} ry={44} fill="#101a38" opacity={0.85} />
                <Shade x={420} y={1300} k={1} skew={postSkew} sq={postSq}><Mooring shadow /></Shade>
                <g transform="translate(420,1300)"><Mooring /></g>
              </g>
            )}
            {/* behind the table, then the table, then everyone in front of it */}
            {behind.map((p, i) => <Villager key={"b" + p.id + i} {...p} t={t} />)}
            {place === "lane" && g >= ls(2) && <Table />}
            {place === "lane" && g >= ls(3) && (
              <g>
                <ellipse cx={930} cy={1060} rx={48} ry={12} fill="#fbf6ea" stroke={INK} strokeWidth={4} />
                <path d={`M${930 - 34} 1058 Q930 ${1058 - 10 - 60 * riceK} ${930 + 34} 1058 Z`} fill="#fbf8ee" stroke={INK} strokeWidth={3} />
              </g>
            )}
            {/* the door's beam in the granary */}
            {place === "barn" && <polygon points="300,610 440,610 760,1250 120,1250" fill="url(#p2-beam)" />}
            {sorted.filter((p) => p.y <= you.y).map((p, i) => <Villager key={p.id + i} {...p} t={t} />)}
            {you.shadow && place !== "tree" && <Shade x={you.x} y={you.y} k={you.s} skew={-55} sq={0.34}><Traveller yaw={you.yaw} silhouette walk={you.walk} phase={you.phase} /></Shade>}
            {place !== "tree" && !(place === "lane" && g >= ls(5) && g < BARN_AT() && false) && (
              <g filter={you.cold ? "url(#p2-cold)" : undefined}>
                <g transform={`translate(${you.x},${you.y + yi.dy}) rotate(${yi.rot}) scale(${you.s},${you.s * yi.sy})`}><Traveller yaw={you.yaw} mood={you.mood} walk={you.walk} phase={you.phase} t={t} /></g>
              </g>
            )}
            {sorted.filter((p) => p.y > you.y).map((p, i) => <Villager key={"f" + p.id + i} {...p} t={t} />)}
            {/* your breath in the cold */}
            {breath && [0, 1, 2].map((i) => {
              const ph = ((g + i * 20) % 60) / 60;
              return <ellipse key={i} cx={you.x - 30 - ph * 60} cy={you.y - 395 * you.s - ph * 50} rx={14 + ph * 26} ry={9 + ph * 14} fill="#dfe8f2" opacity={0.45 * (1 - ph)} />;
            })}
            {/* the thing in the corner: a darker patch that shifts, and two pale points */}
            {place === "barn" && g >= mid(8, 0.35) && (
              <g>
                <ellipse cx={880 + Math.sin(g * 0.05) * 14} cy={770} rx={100} ry={150} fill="#020306" opacity={0.85 * thing} filter="url(#p2-blur)" />
                <circle cx={862 + Math.sin(g * 0.05) * 14} cy={712} r={4.5} fill="#d6dee8" opacity={eyes * thing} />
                <circle cx={890 + Math.sin(g * 0.05) * 14} cy={712} r={4.5} fill="#d6dee8" opacity={eyes * thing} />
              </g>
            )}
          </g>
        </g>
        {insert && <TableInsert k={(g - mid(4, 0.35)) / Math.max(1, mid(4, 0.85) - mid(4, 0.35))} t={t} />}
        <rect width={1080} height={1920} fill="#fffaf0" opacity={flash} />
        {place === "tree" && <rect width={1080} height={1920} fill="#ff9a3c" opacity={0.12 * sweep} />}
        <rect width={1080} height={1920} filter="url(#p2-grain)" opacity={0.14} />
        <rect width={1080} height={1920} fill="url(#p2-vig)" />
        <rect width={1080} height={1920} fill="#050403" opacity={dark} />
      </svg>
      <Card a="หมู่บ้านที่ไม่มีใครมีเงา" b="ตอนที่ 2 · ห้ามยืนในที่ร่ม" at={C.titleAt} dur={46} g={g} />
      {manifest.shots.map((shot, i) => (
        <Sequence key={i} from={manifest.starts[i] + shot.leadFrames} durationInFrames={shot.audioFrames}>
          <Audio src={staticFile(shot.audio)} />
          <Subtitle text={SUBTITLE_FIX(shot.text)} from={manifest.starts[i] + shot.leadFrames} g={g} />
        </Sequence>
      ))}
      {g >= manifest.outroStart && (
        <div style={{ position: "absolute", inset: 0, background: "#0a0706", fontFamily, color: "#f4ead2", opacity: clamp01((g - manifest.outroStart) / 12) }}>
          <div style={{ position: "absolute", top: 560, left: 80, right: 160, textAlign: "center" }}>
            <div style={{ fontSize: 62, lineHeight: 1.45 }}>ถ้าเป็นคุณ<br />จะกล้าเข้าไปใกล้ต้นไม้นั้นมั้ย?</div>
            <div style={{ fontSize: 40, marginTop: 28, color: "#c9b79a" }}>คอมเมนต์บอกหน่อย</div>
          </div>
          <div style={{ position: "absolute", top: 1040, left: 80, right: 160, textAlign: "center", opacity: clamp01((g - manifest.outroStart - 60) / 12) }}>
            <div style={{ fontSize: 40, color: "#c9b79a" }}>ตอนต่อไป</div>
            <div style={{ fontSize: 66, marginTop: 14 }}>ต้นไม้ที่มีเงาเยอะเกินไป</div>
          </div>
        </div>
      )}
      <Audio src={staticFile("shadow2v/bed.wav")} volume={0.6} />
    </AbsoluteFill>
  );
};


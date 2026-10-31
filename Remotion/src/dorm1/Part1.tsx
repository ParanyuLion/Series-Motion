import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import manifest from "./manifest.json";
import { fontFamily } from "../island/fonts";
import { LOOKS, SKIN } from "../shadow1/Figure";
import { Traveller, TravellerMood } from "../shadow1/Traveller";
import { INK } from "../shadow1/VillageVert";
import { Card, Subtitle, Villager, dipOf, idle, track } from "../shadow1/Part1";
import { clamp01, lerp, smooth } from "../onestar3/util";

// "กฎเหล็กหอพัก ตี 3" Part 1, "03:00 กฎข้อแรก". Three places, each a cartoonised photo backdrop with code-drawn cast and props:
//   ext  (lines 0-1): the dormitory at 03:00, a siren beacon on the roof (the hook)
//   room (lines 2-8): the dorm room in the dark, a red siren sweep; the PA rule card; ต้น switches on his lamp and dies; your dead phone
//   corr (lines 9-13): the dark corridor; the cleaner with her trolley hands you a card, readable only in the red sweep
// Hospital clues planted for the finale: the siren and the monitor share one rhythm, a heart-monitor line in the corner, a lanyard like a wristband, a tiled floor.
// Each place change dips to black. All timing comes from manifest.json (the narration audio).

const C = manifest.cues as Record<string, number>;
const ls = (i: number) => C[`lineStart${i}`];
const le = (i: number) => C[`lineEnd${i}`];
const mid = (i: number, k: number) => Math.round(ls(i) + k * (le(i) - ls(i)));

LOOKS.cleaner = { hair: "bun", hairColor: "#b9b4ac", body: "#6f8f93", bodyKind: "long", detail: "apron", pants: "#3f4a55", sleeve: "long", skin: "#dcae88" };

type Place = "ext" | "room" | "corr";
const ROOM_AT = () => ls(2) - 6;
const CORR_AT = () => ls(9) - 6;
const placeAt = (g: number): Place => (g < ROOM_AT() ? "ext" : g < CORR_AT() ? "room" : "corr");
const EDGES = () => [-999, ROOM_AT(), CORR_AT(), 99999];
const BG: Record<Place, { src: string; edge: string }> = {
  ext: { src: "shadow1/bg_dext.png", edge: "#313f41" },
  room: { src: "shadow1/bg_home.png", edge: "#b88c78" },
  corr: { src: "shadow1/bg_dcorr.png", edge: "#80a7c7" },
};

const SUBTITLE_FIX = (t: string) => t.replace(/เพื่อนร่วมห้อง/g, "เพื่อน⁠ร่วม⁠ห้อง").replace(/ไซเรน/g, "ไซ⁠เรน").replace(/ป้าแม่บ้าน/g, "ป้า⁠แม่บ้าน").replace(/หอพัก/g, "หอ⁠พัก").replace(/ทางเดิน/g, "ทาง⁠เดิน");

type Cam = { x: number; y: number; z: number };
type Shot = [number, number, Cam, Cam];
const SHOTS = (): Shot[] => [
  [0, ls(1), { x: 760, y: 760, z: 1.15 }, { x: 740, y: 700, z: 1.45 }],
  [ls(1), ls(2), { x: 700, y: 520, z: 1.9 }, { x: 700, y: 480, z: 2.3 }],
  // the room
  [ls(2), ls(3), { x: 540, y: 1010, z: 1.1 }, { x: 540, y: 1000, z: 1.2 }],
  [ls(3), ls(4), { x: 540, y: 1000, z: 1.2 }, { x: 560, y: 1000, z: 1.1 }],
  [ls(4), ls(5), { x: 800, y: 1000, z: 1.9 }, { x: 810, y: 1000, z: 2.1 }],
  [ls(5), ls(6), { x: 700, y: 1010, z: 1.7 }, { x: 640, y: 1010, z: 2.0 }],
  [ls(6), mid(6, 0.55), { x: 700, y: 1000, z: 1.5 }, { x: 740, y: 1000, z: 1.7 }],
  [mid(6, 0.55), ls(7), { x: 720, y: 1020, z: 1.5 }, { x: 700, y: 1040, z: 1.7 }],
  [ls(7), ls(8), { x: 700, y: 1050, z: 2.6 }, { x: 700, y: 1052, z: 2.9 }],
  [ls(8), ls(9), { x: 300, y: 1020, z: 1.7 }, { x: 300, y: 1020, z: 1.9 }],
  // the corridor
  [ls(9), ls(10), { x: 540, y: 1000, z: 1.1 }, { x: 540, y: 960, z: 1.2 }],
  [ls(10), ls(11), { x: 480, y: 900, z: 1.6 }, { x: 460, y: 880, z: 1.9 }],
  [ls(11), ls(12), { x: 540, y: 960, z: 1.5 }, { x: 540, y: 960, z: 1.6 }],
  [ls(12), ls(13), { x: 540, y: 960, z: 1.6 }, { x: 540, y: 960, z: 1.6 }],
  [ls(13), le(13) + 40, { x: 470, y: 900, z: 2.0 }, { x: 470, y: 860, z: 2.7 }],
];

const rnd = (i: number, k: number) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };
/** the siren and the heart monitor share one rhythm (a planted clue): a beat every 42 frames */
const PERIOD = 42;
const pulseOf = (g: number) => { const ph = (g % PERIOD) / PERIOD; return Math.pow(Math.max(0, Math.sin(ph * Math.PI)), 3); };

/** the red siren light sweeping through a dark place */
const RedSweep: React.FC<{ g: number; k: number }> = ({ g, k }) => {
  if (k <= 0) return null;
  const p = pulseOf(g);
  const bx = ((g * 14) % 2000) - 500;
  return (
    <g>
      <rect width={1080} height={1920} fill="#c81414" opacity={k * (0.08 + 0.3 * p)} />
      <g opacity={k * (0.15 + 0.5 * p)}>
        <polygon points={`${bx},0 ${bx + 360},0 ${bx + 160},1920 ${bx - 200},1920`} fill="url(#d1-beam)" />
      </g>
    </g>
  );
};

/** a small heart-monitor line in the corner; flat when `flat` */
const Ecg: React.FC<{ g: number; flat: boolean }> = ({ g, flat }) => {
  const pts: string[] = [];
  for (let x = 0; x <= 220; x += 4) {
    const ph = (((x + g * 3.2) % 110) + 110) % 110;
    let y = 0;
    if (!flat) {
      if (ph > 20 && ph < 26) y = -(ph - 20) * 3.5;
      else if (ph >= 26 && ph < 32) y = -21 + (ph - 26) * 7.5;
      else if (ph >= 32 && ph < 38) y = 24 - (ph - 32) * 4;
      else if (ph >= 60 && ph < 74) y = -Math.sin(((ph - 60) / 14) * Math.PI) * 7;
    }
    pts.push(`${x},${y.toFixed(1)}`);
  }
  return (
    <g transform="translate(70,150)" opacity={0.85}>
      <rect x={-10} y={-34} width={240} height={68} rx={10} fill="#04100a" opacity={0.55} stroke="#2f7a4a" strokeWidth={2} />
      <polyline points={pts.join(" ")} fill="none" stroke={flat ? "#d84a3a" : "#5fe08c"} strokeWidth={3} strokeLinejoin="round" />
    </g>
  );
};

/** the rule card on the wall / over the PA (full screen) */
const RuleCard: React.FC<{ g: number; from: number; dur: number }> = ({ g, from, dur }) => {
  const o = clamp01(Math.min((g - from) / 5, (from + dur - g) / 8));
  if (o <= 0) return null;
  const p = pulseOf(g);
  return (
    <div style={{ position: "absolute", inset: 0, background: "#0a0606", opacity: o, fontFamily, color: "#f1e6d4" }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 45%, rgba(200,20,20,${0.18 + 0.3 * p}), transparent 70%)` }} />
      <div style={{ position: "absolute", left: 90, right: 170, top: 330, bottom: 700, border: "6px solid #b01818", borderRadius: 24, background: "rgba(20,10,10,0.9)", boxShadow: "0 0 60px rgba(200,20,20,0.5)", textAlign: "center", padding: "50px 20px" }}>
        <div style={{ fontSize: 44, color: "#c9a8a0", letterSpacing: 3 }}>03:00</div>
        <div style={{ fontSize: 56, marginTop: 24, color: "#e6d3c0" }}>กฎเหล็กข้อ 1</div>
        <div style={{ fontSize: 120, marginTop: 40, lineHeight: 1.1, color: "#ff3b30" }}>ห้ามเปิดไฟ</div>
        <div style={{ fontSize: 50, marginTop: 56, color: "#e6d3c0" }}>ผู้ฝ่าฝืนตายทันที</div>
      </div>
    </div>
  );
};

/** the card the cleaner hands over: readable only while the siren's red light is on it */
const PaperInsert: React.FC<{ g: number }> = ({ g }) => {
  const p = pulseOf(g);
  return (
    <div style={{ position: "absolute", inset: 0, background: "#080505", fontFamily }}>
      <div style={{ position: "absolute", left: 130, right: 210, top: 440, transform: "rotate(-3deg)", background: "#e9dfc9", border: "4px solid #6a5a44", borderRadius: 6, padding: "70px 40px", textAlign: "center", color: "#2a1a14" }}>
        <div style={{ fontSize: 56, lineHeight: 1.6 }}>ชั่วโมงหน้า</div>
        <div style={{ fontSize: 64, lineHeight: 1.6, marginTop: 20 }}>กฎจะตรงข้ามกับ<br />ตอนนี้</div>
        <div style={{ position: "absolute", inset: 0, background: "#050303", opacity: 0.94 - 0.85 * p }} />
        <div style={{ position: "absolute", inset: 0, background: "#e01818", mixBlendMode: "multiply", opacity: 0.5 * p }} />
      </div>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 40%, rgba(220,20,20,${0.25 * p}), transparent 70%)` }} />
    </div>
  );
};

/** your phone, dead: a black screen with an empty red battery */
const PhoneInsert: React.FC<{ g: number }> = ({ g }) => (
  <div style={{ position: "absolute", inset: 0, background: "#0b0807" }}>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920">
      <g transform="translate(540,880) rotate(-8)">
        <rect x={-200} y={-380} width={400} height={760} rx={50} fill="#1c1a1a" stroke={INK} strokeWidth={10} />
        <rect x={-176} y={-350} width={352} height={700} rx={30} fill="#050505" />
        <g transform="translate(0,-20)" opacity={0.4 + 0.6 * (Math.floor(g / 14) % 2)}>
          <rect x={-60} y={-30} width={110} height={60} rx={8} fill="none" stroke="#e03a2c" strokeWidth={8} />
          <rect x={50} y={-12} width={12} height={24} fill="#e03a2c" />
          <rect x={-52} y={-22} width={14} height={44} fill="#e03a2c" />
        </g>
        <circle cx={0} cy={-365} r={7} fill="#2a2828" />
      </g>
      <ellipse cx={540} cy={1380} rx={420} ry={50} fill="#000" opacity={0.5} />
    </svg>
  </div>
);

/** a lanyard with an ID card (a student card that, in the finale, is a hospital wristband) */
const Lanyard: React.FC<{ yaw: number }> = ({ yaw }) => {
  const c = Math.cos((yaw * Math.PI) / 180);
  if (c < -0.1) return null;
  const sx = Math.sin((yaw * Math.PI) / 180) * 26;
  return (
    <g transform={`translate(${sx},-300)`} opacity={Math.min(1, c + 0.3)}>
      <path d="M-16 -38 L0 -2 L16 -38" fill="none" stroke="#2f6a9a" strokeWidth={5} />
      <rect x={-13} y={-4} width={26} height={34} rx={3} fill="#f1ede4" stroke={INK} strokeWidth={3} />
      <rect x={-8} y={3} width={16} height={12} fill="#9ab4cc" />
    </g>
  );
};

/** a made-up dorm bed: a frame, a mattress, a blanket, a pillow */
const Bed: React.FC<{ x: number; flip?: boolean }> = ({ x, flip }) => (
  <g transform={`translate(${x},1215) scale(${flip ? -1 : 1},1)`} strokeLinejoin="round">
    <rect x={-250} y={-150} width={500} height={30} fill="#5a4630" stroke={INK} strokeWidth={6} />
    <rect x={-240} y={-120} width={14} height={120} fill="#4a3826" stroke={INK} strokeWidth={5} />
    <rect x={226} y={-120} width={14} height={120} fill="#4a3826" stroke={INK} strokeWidth={5} />
    <path d="M-236 -150 Q-236 -178 -200 -178 L210 -178 Q236 -178 236 -150 Z" fill="#c9c2b4" stroke={INK} strokeWidth={6} />
    <path d="M-60 -178 Q-40 -200 30 -196 Q120 -192 236 -170 L236 -150 L-60 -150 Z" fill="#6f86a8" stroke={INK} strokeWidth={6} />
    <ellipse cx={-170} cy={-198} rx={64} ry={26} fill="#eae6dc" stroke={INK} strokeWidth={5} />
  </g>
);

const Lamp: React.FC<{ lit: number }> = ({ lit }) => (
  <g strokeLinejoin="round">
    <rect x={500} y={1100} width={120} height={115} fill="#6a5034" stroke={INK} strokeWidth={6} />
    <rect x={548} y={1030} width={16} height={72} fill="#3a3028" stroke={INK} strokeWidth={4} />
    <path d="M518 1034 L594 1034 L578 978 L534 978 Z" fill={lit > 0.1 ? "#ffe9a8" : "#cfc2a0"} stroke={INK} strokeWidth={5} />
    <rect x={590} y={1066} width={22} height={22} rx={4} fill="#d8d0c0" stroke={INK} strokeWidth={3} />
  </g>
);

const Trolley: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} strokeLinejoin="round">
    <rect x={-110} y={-190} width={220} height={20} fill="#7f8a92" stroke={INK} strokeWidth={6} />
    <rect x={-100} y={-170} width={200} height={72} fill="#9aa4ac" stroke={INK} strokeWidth={6} />
    <path d="M-92 -98 L-92 -170 M92 -98 L92 -170" stroke={INK} strokeWidth={5} />
    <path d="M-80 -176 Q-30 -216 20 -190 Q60 -200 96 -176 Z" fill="#c9d4d8" stroke={INK} strokeWidth={5} />
    <rect x={-100} y={-98} width={200} height={14} fill="#6a747c" stroke={INK} strokeWidth={5} />
    <rect x={-90} y={-84} width={180} height={50} fill="#46505a" stroke={INK} strokeWidth={5} />
    <rect x={-70} y={-78} width={60} height={20} fill="#d84a3a" stroke={INK} strokeWidth={3} />
    {[-80, 80].map((cx) => <circle key={cx} cx={cx} cy={-18} r={18} fill="#1c1a18" stroke={INK} strokeWidth={5} />)}
    <rect x={92} y={-260} width={12} height={170} fill="#7f8a92" stroke={INK} strokeWidth={5} />
  </g>
);

const Mop: React.FC<{ x: number; y: number; s: number; sway: number }> = ({ x, y, s, sway }) => (
  <g transform={`translate(${x},${y}) scale(${s}) rotate(${sway})`} strokeLinejoin="round" strokeLinecap="round">
    <line x1={0} y1={0} x2={22} y2={-330} stroke={INK} strokeWidth={14} />
    <line x1={0} y1={0} x2={22} y2={-330} stroke="#8a6a44" strokeWidth={8} />
    <path d="M-44 0 Q-30 -26 0 -26 Q30 -26 44 0 Q20 14 0 12 Q-20 14 -44 0 Z" fill="#cfc8b8" stroke={INK} strokeWidth={5} />
  </g>
);

export const Part1: React.FC<{ g?: number }> = ({ g: gOverride }) => {
  const frameNow = useCurrentFrame();
  const g = gOverride ?? frameNow;
  const t = g;
  const place = placeAt(g);
  const edges = EDGES();
  const dark = 1 - Math.max(...edges.slice(0, -1).map((e, i) => dipOf(g, e, edges[i + 1])));

  // ---------------------------------------------------------------- story clocks
  const lampPress = ls(6) + 6;                       // ต้น presses the switch
  const dieAt = mid(6, 0.62);                        // he slumps (the narration says "ทรุดลงเป็นศพ")
  const scream = clamp01((g - lampPress) / 6) * (g < dieAt ? 1 : 0);
  const slump = smooth(clamp01((g - dieAt) / 14));
  const lampLit = g >= lampPress && g < ls(7) + 20 ? 1 : 0;
  const ecgFlat = g >= dieAt && g < ls(9) + 20;
  const cardAt = mid(3, 0.46);
  const showCard = g >= cardAt && g < cardAt + 96;
  const showPhone = g >= ls(8) && g < ls(9);
  const showPaper = g >= ls(12) && g < ls(13);

  // ---------------------------------------------------------------- the cast
  let you = { x: 300, y: 1170, s: 0.8, yaw: 0, mood: "worry" as TravellerMood, walk: 0, sit: false, phase: t * 0.25, show: false };
  let ton = { x: 800, y: 1170, s: 0.8, mood: "smile" as TravellerMood, show: false, rot: 0, point: 0, shake: 0 };
  let cleaner: { x: number; y: number; s: number; walk: number; show: boolean; o: number } = { x: 0, y: 0, s: 0.3, walk: 0, show: false, o: 0 };

  if (place === "room") {
    const jolt = g >= ls(2) + 4 && g < ls(2) + 16 ? Math.sin(((g - ls(2) - 4) / 12) * Math.PI) * 20 : 0;
    you = { ...you, show: true, sit: true, x: 290, y: 1176 - jolt, yaw: 20, mood: g >= ls(6) ? "scared" : g >= ls(2) ? "worry" : "calm" };
    ton = {
      ...ton, show: true, x: 810, y: 1176, mood: g >= lampPress ? (g < dieAt ? "agony" : "agony") : g >= ls(4) ? "smile" : "calm",
      rot: slump * -82, point: g >= ls(5) + 10 && g < dieAt ? smooth(clamp01((g - ls(5) - 10) / 20)) : 0,
      shake: g >= ls(4) && g < ls(5) ? Math.sin(g * 1.3) * 4 : g >= lampPress && g < dieAt ? Math.sin(g * 2.1) * 8 * scream : 0,
    };
    if (slump > 0) { ton = { ...ton, x: 1020, y: 1100 }; }
  }

  if (place === "corr") {
    const w = track(g, [[ls(9) - 2, 560, 1235, 0.78], [ls(9) + 90, 520, 1200, 0.78], [ls(10) + 40, 500, 1170, 0.78]]);
    you = { ...you, show: true, x: g < ls(13) ? w.x : 520, y: g < ls(13) ? w.y : 1170, s: 0.78, walk: g < ls(13) ? w.walk : 0, phase: t * 0.2, yaw: 0, sit: false, mood: g >= ls(12) ? "scared" : "worry" };
    const near = smooth(clamp01((g - ls(10) - 30) / 70)) ;
    const nearer = smooth(clamp01((g - ls(11) - 10) / 50));
    const appear = clamp01((g - (ls(10) + 6)) / 40);
    cleaner = { x: lerp(430, 640, Math.max(near * 0.5, nearer)), y: lerp(720, 1160, Math.max(near * 0.5, nearer)), s: lerp(0.24, 0.78, Math.max(near * 0.5, nearer)), walk: near > 0.02 && near < 0.98 || (nearer > 0.02 && nearer < 0.98) ? 1 : 0, show: g >= ls(10) + 6, o: appear };
  }

  // ---------------------------------------------------------------- camera
  const shots = SHOTS();
  let cam: Cam = { x: 540, y: 1000, z: 1.2 };
  const startOf = (a: number) => (a === ls(2) || a === ls(9) ? a - 6 : a);
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
  const bg = BG[place];
  const yi = idle(t, 0.7, you.walk < 0.05);
  const night = place === "ext" ? 0.25 : place === "room" ? 0.86 : 0.62;
  const redK = place === "ext" ? 0.7 : place === "room" ? (g >= ls(2) ? 1 : 0) : 1;

  return (
    <AbsoluteFill style={{ background: "#050404" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <defs>
          <filter id="d1-grade" colorInterpolationFilters="sRGB">
            <feColorMatrix type="saturate" values="0.55" />
            <feComponentTransfer><feFuncR type="linear" slope={1 - night * 0.7} intercept={night * 0.03} /><feFuncG type="linear" slope={1 - night * 0.72} intercept={night * 0.04} /><feFuncB type="linear" slope={1 - night * 0.55} intercept={night * 0.09} /></feComponentTransfer>
          </filter>
          <linearGradient id="d1-beam" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#ff2a1a" stopOpacity="0" /><stop offset="0.5" stopColor="#ff2a1a" stopOpacity="0.9" /><stop offset="1" stopColor="#ff2a1a" stopOpacity="0" /></linearGradient>
          <radialGradient id="d1-lamp"><stop offset="0" stopColor="#ffe9a8" stopOpacity="0.95" /><stop offset="0.4" stopColor="#ffc860" stopOpacity="0.4" /><stop offset="1" stopColor="#ffb040" stopOpacity="0" /></radialGradient>
          <radialGradient id="d1-vig" cx="0.5" cy="0.5" r="0.75"><stop offset="0.45" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.8" /></radialGradient>
          <radialGradient id="d1-red"><stop offset="0" stopColor="#ff3020" stopOpacity="0.9" /><stop offset="0.3" stopColor="#ff2a1a" stopOpacity="0.4" /><stop offset="1" stopColor="#ff2a1a" stopOpacity="0" /></radialGradient>
          <filter id="d1-grain"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" /><feColorMatrix type="saturate" values="0" /></filter>
        </defs>
        <g transform={`translate(540,900) scale(${cam.z}) translate(${-cam.x},${-cam.y})`}>
          <image href={staticFile(bg.src)} x={0} y={0} width={1080} height={1250} />
          <rect x={-200} y={1236} width={1480} height={1500} fill={bg.edge} />
          {place === "room" && (
            <g>
              <rect x={-200} y={0} width={1480} height={925} fill="#efe2cc" opacity={0.3} />
              <rect x={-200} y={925} width={1480} height={1800} fill="#b97f8a" opacity={0.5} />
              <rect x={-200} y={905} width={1480} height={26} fill="#7a4e56" opacity={0.7} />
            </g>
          )}
          <rect x={-200} y={0} width={1480} height={2700} fill="#0a0f24" opacity={night * 0.85} />

          {/* the roof beacon: a red lamp with a glow and a turning beam */}
          {place === "ext" && (
            <g>
              <circle cx={700} cy={430} r={16} fill="#ff4030" />
              <circle cx={700} cy={430} r={90 + 50 * pulseOf(g)} fill="url(#d1-red)" opacity={0.9} />
              <g transform="translate(700,430)" opacity={0.5 * (0.4 + 0.6 * pulseOf(g))}>
                <polygon points={`0,0 ${Math.cos(t * 0.11) * 700},${-70 - Math.sin(t * 0.11) * 40} ${Math.cos(t * 0.11 + 0.4) * 700},${-70 - Math.sin(t * 0.11 + 0.4) * 40}`} fill="#ff3020" opacity={0.6} />
              </g>
            </g>
          )}

          {place === "room" && (
            <g filter="url(#d1-grade)">
              <Bed x={290} />
              <Bed x={810} flip />
              <Lamp lit={lampLit} />
            </g>
          )}

          {place === "corr" && cleaner.show && (
            <g opacity={cleaner.o}>
              <Trolley x={cleaner.x - 200 * cleaner.s} y={cleaner.y} s={cleaner.s * 1.1} />
              <Mop x={cleaner.x + 130 * cleaner.s} y={cleaner.y} s={cleaner.s} sway={Math.sin(t * 0.07) * 4} />
              <g filter="url(#d1-grade)"><Villager id="cleaner" x={cleaner.x} y={cleaner.y} s={cleaner.s} mood="calm" face={-1} walk={cleaner.walk} seed={3} t={t} /></g>
            </g>
          )}

          {you.show && (
            <g filter="url(#d1-grade)">
              <g transform={`translate(${you.x},${you.y + yi.dy}) rotate(${yi.rot}) scale(${you.s},${you.s * yi.sy})`}>
                <Traveller yaw={you.yaw} mood={you.mood} walk={you.walk} phase={you.phase} sit={you.sit} t={t} />
                <Lanyard yaw={you.yaw} />
              </g>
            </g>
          )}
          {ton.show && (
            <g filter="url(#d1-grade)">
              <g transform={`translate(${ton.x + ton.shake},${ton.y}) rotate(${ton.rot}) scale(${ton.s})`}>
                <Traveller yaw={ton.rot < -10 ? 0 : -25} mood={ton.mood} sit={ton.rot > -10} point={ton.point} pointYaw={-70} pointArm={-1} t={t + 30} colors={{ jacket: "#8f98a4", under: "#e9e4d6", pants: "#6a6f7a", hair: "#4a3626" }} />
              </g>
            </g>
          )}
          {/* the lamp's warm light for the one second it is on */}
          {place === "room" && lampLit > 0 && <circle cx={560} cy={1010} r={420} fill="url(#d1-lamp)" opacity={0.9} />}
        </g>
        <RedSweep g={g} k={redK} />
        <rect width={1080} height={1920} fill="url(#d1-vig)" />
        <rect width={1080} height={1920} filter="url(#d1-grain)" opacity={0.16} />
        {place !== "ext" && !showCard && !showPaper && !showPhone && <Ecg g={g} flat={ecgFlat} />}
        <rect width={1080} height={1920} fill="#fff3d0" opacity={g >= lampPress && g < lampPress + 4 ? 0.5 * (1 - (g - lampPress) / 4) : 0} />
        <rect width={1080} height={1920} fill="#030202" opacity={dark} />
      </svg>
      <RuleCard g={g} from={cardAt} dur={96} />
      {showPhone && <PhoneInsert g={g} />}
      {showPaper && <PaperInsert g={g} />}
      <Card a="กฎเหล็กหอพัก ตี 3" b="ตอนที่ 1 · 03:00 กฎข้อแรก" at={C.titleAt} dur={46} g={g} />
      {manifest.shots.map((shot, i) => (
        <Sequence key={i} from={manifest.starts[i] + shot.leadFrames} durationInFrames={shot.audioFrames}>
          <Audio src={staticFile(shot.audio)} />
          <Subtitle text={SUBTITLE_FIX(shot.text)} from={manifest.starts[i] + shot.leadFrames} g={g} />
        </Sequence>
      ))}
      {g >= manifest.outroStart && (
        <div style={{ position: "absolute", inset: 0, background: "#080505", fontFamily, color: "#f1e6d4", opacity: clamp01((g - manifest.outroStart) / 12) }}>
          <div style={{ position: "absolute", top: 560, left: 80, right: 160, textAlign: "center" }}>
            <div style={{ fontSize: 64, lineHeight: 1.5 }}>กฎข้อที่สอง<br />จะเป็นอะไร?</div>
            <div style={{ fontSize: 42, marginTop: 28, color: "#c9a8a0" }}>ทายในคอมเมนต์</div>
          </div>
          <div style={{ position: "absolute", top: 1100, left: 80, right: 160, textAlign: "center", opacity: clamp01((g - manifest.outroStart - 70) / 12) }}>
            <div style={{ fontSize: 40, color: "#c9a8a0" }}>ตอนต่อไป</div>
            <div style={{ fontSize: 62, marginTop: 14, color: "#ff5a4a" }}>04:00 กฎที่ขัดกัน</div>
          </div>
        </div>
      )}
      <Audio src={staticFile("dorm1v/bed.wav")} volume={0.6} />
    </AbsoluteFill>
  );
};

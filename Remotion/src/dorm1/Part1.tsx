import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import manifest from "./manifest.json";
import env from "./env.json";
import { fontFamily } from "../island/fonts";
import { Figure, LOOKS, Mood } from "../shadow1/Figure";
import { Traveller, TravellerMood } from "../shadow1/Traveller";
import { INK } from "../shadow1/VillageVert";
import { Card, Villager, dipOf, idle, track } from "../shadow1/Part1";
import { clamp01, lerp, smooth } from "../onestar3/util";

// "กฎเหล็กหอพัก ตี 3" Part 1, "03:00 กฎข้อแรก". Three places, each a photo backdrop with code-drawn cast and props:
//   ext  (line 0): the dormitory at 03:00, a siren beacon on the roof (the hook, kept short)
//   room (lines 1-8): a dorm room with two beds, in the dark; the loudspeaker announces the rule (a speaker picture, then the rule card); ต้น switches on his lamp and dies; your dead phone
//   corr (lines 9-13): the dark corridor; the cleaner with her trolley hands you a card, readable only in the red light
// The siren sounds only while the rule is announced. The red light breathes slowly. All timing comes from manifest.json (the narration audio).

const C = manifest.cues as Record<string, number>;
const ls = (i: number) => C[`lineStart${i}`];
const le = (i: number) => C[`lineEnd${i}`];
const mid = (i: number, k: number) => Math.round(ls(i) + k * (le(i) - ls(i)));

LOOKS.cleaner = { hair: "bun", hairColor: "#b9b4ac", body: "#6f8f93", bodyKind: "long", detail: "apron", pants: "#3f4a55", sleeve: "long", skin: "#dcae88" };
// ต้น: a different person from "you": messy hair, an orange short-sleeved tee, blue trousers, no glasses
LOOKS.ton = { hair: "messy", hairColor: "#2a1c14", body: "#d9683a", bodyKind: "bean", detail: "none", pants: "#4b6a8a", sleeve: "short" };

type Place = "ext" | "room" | "corr";
const ROOM_AT = () => ls(1) - 6;
const CORR_AT = () => ls(9) - 6;
const placeAt = (g: number): Place => (g < ROOM_AT() ? "ext" : g < CORR_AT() ? "room" : "corr");
const EDGES = () => [-999, ROOM_AT(), CORR_AT(), 99999];
const BG: Record<Place, { src: string; edge: string }> = {
  ext: { src: "shadow1/bg_dext.png", edge: "#4a4c40" },
  room: { src: "shadow1/bg_droom.png", edge: "#3b5165" },
  corr: { src: "shadow1/bg_dcorr.png", edge: "#a2c0da" },
};

const SUBTITLE_FIX = (t: string) => t.replace(/เพื่อนร่วมห้อง/g, "เพื่อน⁠ร่วม⁠ห้อง").replace(/ไซเรน/g, "ไซ⁠เรน").replace(/ป้าแม่บ้าน/g, "ป้า⁠แม่บ้าน").replace(/หอพัก/g, "หอ⁠พัก").replace(/ทางเดิน/g, "ทาง⁠เดิน");

/** subtitles a little higher than the other series (user, 2026-10-31) */
const Sub: React.FC<{ text: string; from: number; g: number }> = ({ text, from, g }) => (
  <div style={{ position: "absolute", left: 60, right: 160, bottom: 420, textAlign: "center", opacity: clamp01((g - from) / 6), fontFamily, fontSize: 52, lineHeight: 1.6, color: "#fff", textShadow: "0 0 12px rgba(0,0,0,0.95), 0 3px 6px rgba(0,0,0,0.95)" }}>
    <span style={{ background: "rgba(8,6,4,0.55)", borderRadius: 18, padding: "4px 16px", WebkitBoxDecorationBreak: "clone" } as React.CSSProperties}>{text}</span>
  </div>
);

type Cam = { x: number; y: number; z: number };
type Shot = [number, number, Cam, Cam];
const SHOTS = (): Shot[] => [
  [0, ls(1), { x: 760, y: 760, z: 1.15 }, { x: 740, y: 680, z: 1.6 }],
  [ls(1), ls(2), { x: 540, y: 960, z: 1.05 }, { x: 520, y: 960, z: 1.18 }],
  // the room: you on the near bed (left), ต้น on the far bed (right)
  [ls(2), ls(3), { x: 540, y: 960, z: 1.05 }, { x: 520, y: 980, z: 1.2 }],
  [ls(3), ls(4), { x: 400, y: 960, z: 1.3 }, { x: 420, y: 960, z: 1.2 }],
  [ls(4), ls(5), { x: 830, y: 700, z: 3.0 }, { x: 840, y: 700, z: 3.3 }],
  [ls(5), ls(6), { x: 860, y: 700, z: 2.7 }, { x: 880, y: 700, z: 3.0 }],
  [ls(6), mid(6, 0.55), { x: 860, y: 700, z: 2.7 }, { x: 850, y: 700, z: 3.0 }],
  [mid(6, 0.55), ls(7), { x: 830, y: 710, z: 3.0 }, { x: 800, y: 715, z: 3.4 }],
  [ls(7), ls(8), { x: 790, y: 712, z: 4.4 }, { x: 790, y: 712, z: 4.8 }],
  [ls(8), ls(9), { x: 330, y: 1000, z: 1.7 }, { x: 330, y: 1000, z: 1.9 }],
  // the corridor
  [ls(9), ls(10), { x: 540, y: 1000, z: 1.1 }, { x: 540, y: 960, z: 1.2 }],
  [ls(10), ls(11), { x: 480, y: 900, z: 1.6 }, { x: 460, y: 880, z: 1.9 }],
  [ls(11), ls(12), { x: 540, y: 960, z: 1.5 }, { x: 540, y: 960, z: 1.6 }],
  [ls(12), ls(13), { x: 540, y: 960, z: 1.6 }, { x: 540, y: 960, z: 1.6 }],
  [ls(13), le(13) + 40, { x: 470, y: 900, z: 2.0 }, { x: 470, y: 860, z: 2.7 }],
];

const rnd = (i: number, k: number) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };
/** the red light breathes slowly (one breath every 4 s), not a flash */
const BREATH = 120;
const breathOf = (g: number) => { const ph = (g % BREATH) / BREATH; return Math.pow(Math.sin(ph * Math.PI), 2); };

/** the red light in a dark place: a slow glow and a slow, soft band drifting across */
const RedSweep: React.FC<{ g: number; k: number }> = ({ g, k }) => {
  if (k <= 0) return null;
  const p = breathOf(g);
  const bx = ((g * 4.5) % 2300) - 600;
  return (
    <g>
      <rect width={1080} height={1920} fill="#c81414" opacity={k * (0.05 + 0.13 * p)} />
      <g opacity={k * (0.1 + 0.3 * p)}>
        <polygon points={`${bx},0 ${bx + 460},0 ${bx + 260},1920 ${bx - 200},1920`} fill="url(#d1-beam)" />
      </g>
    </g>
  );
};

/** loudness of the narration line the loudspeaker is "speaking" (0..1), from scripts/dorm1/envelope.py */
const ampOf = (line: number, g: number) => ((env as Record<string, number[]>)[String(line)] ?? [])[Math.max(0, g - ls(line))] ?? 0;

/** the loudspeaker with a siren light on top, overlaid on the picture while it speaks: the horn pulses and the waves, the level meter and the red glow follow the voice */
const SpeakerOverlay: React.FC<{ g: number; from: number; to: number; amp: number }> = ({ g, from, to, amp }) => {
  const o = clamp01(Math.min((g - from) / 8, (to - g) / 8));
  if (o <= 0) return null;
  const q = (g - from) / 9;
  const horn = 1 + 0.07 * amp;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o, pointerEvents: "none" }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 22%, rgba(210,30,20,${0.16 + 0.3 * amp}), transparent 62%)` }} />
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <defs>
          <radialGradient id="sp-red"><stop offset="0" stopColor="#ff3a28" stopOpacity="0.85" /><stop offset="1" stopColor="#ff2a1a" stopOpacity="0" /></radialGradient>
          <linearGradient id="sp-horn" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ebe6da" /><stop offset="0.55" stopColor="#a29e92" /><stop offset="1" stopColor="#5a5850" /></linearGradient>
          <linearGradient id="sp-box" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#9a968c" /><stop offset="1" stopColor="#3e3c38" /></linearGradient>
          <linearGradient id="sp-panel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1a0a0a" stopOpacity="0.78" /><stop offset="1" stopColor="#0a0505" stopOpacity="0.5" /></linearGradient>
        </defs>
        <rect x={150} y={150} width={720} height={460} rx={34} fill="url(#sp-panel)" stroke="#b01818" strokeWidth={5} opacity={0.95} />
        <circle cx={330} cy={380} r={230 + 50 * amp} fill="url(#sp-red)" opacity={0.5 + 0.4 * amp} />
        <g transform={`translate(285,300) scale(${0.62 * horn})`} strokeLinejoin="round">
          <rect x={-90} y={150} width={140} height={190} rx={14} fill="url(#sp-box)" stroke={INK} strokeWidth={9} />
          <path d="M40 170 L300 20 L300 400 L40 320 Z" fill="url(#sp-horn)" stroke={INK} strokeWidth={9} />
          <ellipse cx={300} cy={210} rx={56} ry={190} fill="#26241f" stroke={INK} strokeWidth={9} />
          <ellipse cx={296} cy={210} rx={34} ry={140} fill="#0e0d0b" />
          <rect x={-40} y={110} width={40} height={44} fill="#6a685f" stroke={INK} strokeWidth={7} />
          <path d="M-70 110 Q-20 0 30 110 Z" fill="#d8302a" stroke={INK} strokeWidth={8} />
          <ellipse cx={-20} cy={70} rx={20} ry={34} fill="#ffb0a0" opacity={0.5 + 0.5 * amp} />
        </g>
        {[0, 1, 2, 3].map((i) => {
          const ph = (((g - from) / 20 + i * 0.25) % 1);
          const r = 40 + ph * 230;
          return <path key={i} d={`M${470 + r * 0.45} ${380 - r * 0.55} Q${470 + r * 1.1} 380 ${470 + r * 0.45} ${380 + r * 0.55}`} fill="none" stroke="#ffd0c0" strokeWidth={(14 - ph * 10) * (0.5 + 0.7 * amp)} strokeLinecap="round" opacity={(0.9 * (1 - ph)) * (0.25 + 0.75 * amp)} />;
        })}
        {Array.from({ length: 7 }, (_, i) => {
          const h = 20 + 150 * Math.max(0.05, amp * (0.55 + 0.45 * Math.sin(q * 1.7 + i * 1.3) ** 2));
          return <rect key={i} x={690 + i * 20} y={380 - h / 2} width={11} height={h} rx={5} fill="#ff4a3a" opacity={0.85} />;
        })}
      </svg>
    </div>
  );
};

/** the rule card on the wall / over the PA (full screen) */
const RuleCard: React.FC<{ g: number; from: number; dur: number }> = ({ g, from, dur }) => {
  const o = clamp01(Math.min((g - from) / 5, (from + dur - g) / 8));
  if (o <= 0) return null;
  const p = breathOf(g);
  return (
    <div style={{ position: "absolute", inset: 0, background: "#0a0606", opacity: o, fontFamily, color: "#f1e6d4" }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 45%, rgba(200,20,20,${0.16 + 0.2 * p}), transparent 70%)` }} />
      <div style={{ position: "absolute", left: 90, right: 170, top: 330, bottom: 700, border: "6px solid #b01818", borderRadius: 24, background: "linear-gradient(180deg, rgba(34,14,14,0.95), rgba(12,6,6,0.95))", boxShadow: "0 0 60px rgba(200,20,20,0.5)", textAlign: "center", padding: "50px 20px" }}>
        <div style={{ fontSize: 44, color: "#c9a8a0", letterSpacing: 3 }}>03:00</div>
        <div style={{ fontSize: 56, marginTop: 24, color: "#e6d3c0" }}>กฎเหล็กข้อ 1</div>
        <div style={{ fontSize: 120, marginTop: 40, lineHeight: 1.1, color: "#ff3b30" }}>ห้ามเปิดไฟ</div>
        <div style={{ fontSize: 50, marginTop: 56, color: "#e6d3c0" }}>ผู้ฝ่าฝืนตายทันที</div>
      </div>
    </div>
  );
};

/** the card the cleaner hands over: readable only while the red light is on it */
const PaperInsert: React.FC<{ g: number }> = ({ g }) => {
  const p = 0.4 + 0.6 * breathOf(g);
  return (
    <div style={{ position: "absolute", inset: 0, background: "#080505", fontFamily }}>
      <div style={{ position: "absolute", left: 130, right: 210, top: 440, transform: "rotate(-3deg)", background: "linear-gradient(160deg, #efe5cf, #d6c9ac)", border: "4px solid #6a5a44", borderRadius: 6, padding: "70px 40px", textAlign: "center", color: "#2a1a14", boxShadow: "0 20px 40px rgba(0,0,0,0.6)" }}>
        <div style={{ fontSize: 56, lineHeight: 1.6 }}>ชั่วโมงหน้า</div>
        <div style={{ fontSize: 64, lineHeight: 1.6, marginTop: 20 }}>กฎจะตรงข้ามกับ<br />ตอนนี้</div>
        <div style={{ position: "absolute", inset: 0, background: "#050303", opacity: 0.9 - 0.8 * p }} />
        <div style={{ position: "absolute", inset: 0, background: "#e01818", mixBlendMode: "multiply", opacity: 0.45 * p }} />
      </div>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 40%, rgba(220,20,20,${0.22 * p}), transparent 70%)` }} />
    </div>
  );
};

/** your phone, dead: a black screen with an empty red battery */
const PhoneInsert: React.FC<{ g: number }> = ({ g }) => (
  <div style={{ position: "absolute", inset: 0, background: "#0b0807" }}>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920">
      <defs>
        <linearGradient id="ph-body" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#3a3838" /><stop offset="1" stopColor="#100e0e" /></linearGradient>
        <linearGradient id="ph-screen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#0e0e10" /><stop offset="1" stopColor="#020202" /></linearGradient>
      </defs>
      <g transform="translate(540,880) rotate(-8)">
        <rect x={-200} y={-380} width={400} height={760} rx={50} fill="url(#ph-body)" stroke={INK} strokeWidth={10} />
        <rect x={-176} y={-350} width={352} height={700} rx={30} fill="url(#ph-screen)" />
        <path d="M-160 -330 L-60 -330 L-170 -120 L-170 -300 Z" fill="#fff" opacity={0.05} />
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
      <rect x={-13} y={-4} width={26} height={34} rx={3} fill="url(#d1-card)" stroke={INK} strokeWidth={3} />
      <rect x={-8} y={3} width={16} height={12} fill="#9ab4cc" />
    </g>
  );
};

const Lamp: React.FC<{ lit: number }> = ({ lit }) => (
  <g strokeLinejoin="round">
    <rect x={-9} y={0} width={18} height={70} fill="url(#d1-metal)" stroke={INK} strokeWidth={5} />
    <ellipse cx={0} cy={72} rx={34} ry={9} fill="url(#d1-metal)" stroke={INK} strokeWidth={5} />
    <path d="M-40 4 L40 4 L24 -64 L-24 -64 Z" fill={lit > 0.1 ? "url(#d1-shade-on)" : "url(#d1-shade)"} stroke={INK} strokeWidth={5} />
  </g>
);

const Trolley: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} strokeLinejoin="round">
    <rect x={-110} y={-190} width={220} height={20} fill="url(#d1-metal)" stroke={INK} strokeWidth={6} />
    <rect x={-100} y={-170} width={200} height={72} fill="url(#d1-metal)" stroke={INK} strokeWidth={6} />
    <path d="M-92 -98 L-92 -170 M92 -98 L92 -170" stroke={INK} strokeWidth={5} />
    <path d="M-80 -176 Q-30 -216 20 -190 Q60 -200 96 -176 Z" fill="url(#d1-cloth)" stroke={INK} strokeWidth={5} />
    <rect x={-100} y={-98} width={200} height={14} fill="url(#d1-metal)" stroke={INK} strokeWidth={5} />
    <rect x={-90} y={-84} width={180} height={50} fill="url(#d1-dark)" stroke={INK} strokeWidth={5} />
    <rect x={-70} y={-78} width={60} height={20} fill="#d84a3a" stroke={INK} strokeWidth={3} />
    {[-80, 80].map((cx) => <circle key={cx} cx={cx} cy={-18} r={18} fill="url(#d1-dark)" stroke={INK} strokeWidth={5} />)}
    <rect x={92} y={-260} width={12} height={170} fill="url(#d1-metal)" stroke={INK} strokeWidth={5} />
  </g>
);

const Mop: React.FC<{ x: number; y: number; s: number; sway: number }> = ({ x, y, s, sway }) => (
  <g transform={`translate(${x},${y}) scale(${s}) rotate(${sway})`} strokeLinejoin="round" strokeLinecap="round">
    <line x1={0} y1={0} x2={22} y2={-330} stroke={INK} strokeWidth={14} />
    <line x1={0} y1={0} x2={22} y2={-330} stroke="url(#d1-wood)" strokeWidth={8} />
    <path d="M-44 0 Q-30 -26 0 -26 Q30 -26 44 0 Q20 14 0 12 Q-20 14 -44 0 Z" fill="url(#d1-cloth)" stroke={INK} strokeWidth={5} />
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
  const speakerAt = ls(3) + 4;
  const cardAt = mid(3, 0.46);
  const showSpeaker = g >= speakerAt && g < cardAt;
  const showCard = g >= cardAt && g < cardAt + 96;
  const showPhone = g >= ls(8) && g < ls(9);
  const showPaper = g >= ls(12) && g < ls(13);

  // ---------------------------------------------------------------- the cast
  let you = { x: 330, y: 1120, s: 0.9, yaw: 20, mood: "worry" as TravellerMood, walk: 0, sit: false, phase: t * 0.25, show: false };
  let ton = { x: 830, y: 770, s: 0.42, mood: "smile" as Mood, show: false, rot: 0, point: 0, shake: 0, sit: true };
  let talk = 0;
  let cleaner: { x: number; y: number; s: number; walk: number; show: boolean; o: number } = { x: 0, y: 0, s: 0.3, walk: 0, show: false, o: 0 };

  if (place === "room") {
    const jolt = g >= ls(2) + 4 && g < ls(2) + 16 ? Math.sin(((g - ls(2) - 4) / 12) * Math.PI) * 20 : 0;
    you = { ...you, show: true, sit: true, x: 330, y: 1120 - jolt, yaw: 20, mood: g >= ls(6) ? "scared" : g >= ls(2) ? "worry" : "calm" };
    if (g < ls(2) + 4) you = { ...you, sit: false, x: 520, y: 960, yaw: 90, mood: "calm" };
    ton = {
      ...ton, show: true, mood: g >= lampPress ? "agony" : g >= ls(4) ? "smile" : "calm",
      rot: slump * -82, point: g >= ls(5) + 10 && g < dieAt ? smooth(clamp01((g - ls(5) - 10) / 20)) : 0,
      shake: g >= ls(4) && g < ls(5) ? Math.sin(g * 1.3) * 3 : g >= lampPress && g < dieAt ? Math.sin(g * 2.1) * 6 * scream : 0,
      sit: slump < 0.05,
    };
    talk = g >= ls(4) && g < le(4) ? 1 : 0;
    if (slump > 0) ton = { ...ton, x: 905, y: 718 };
  }

  if (place === "corr") {
    const w = track(g, [[ls(9) - 2, 560, 1235, 0.78], [ls(9) + 70, 520, 1200, 0.78], [ls(10) + 30, 500, 1170, 0.78]]);
    you = { ...you, show: true, x: g < ls(13) ? w.x : 520, y: g < ls(13) ? w.y : 1170, s: 0.78, walk: g < ls(13) ? w.walk : 0, phase: t * 0.2, yaw: 0, sit: false, mood: g >= ls(12) ? "scared" : "worry" };
    const near = smooth(clamp01((g - ls(10) - 20) / 60));
    const nearer = smooth(clamp01((g - ls(11) - 6) / 40));
    const m = Math.max(near * 0.5, nearer);
    const appear = clamp01((g - (ls(10) + 4)) / 30);
    cleaner = { x: lerp(430, 640, m), y: lerp(720, 1160, m), s: lerp(0.24, 0.78, m), walk: (near > 0.02 && near < 0.98) || (nearer > 0.02 && nearer < 0.98) ? 1 : 0, show: g >= ls(10) + 4, o: appear };
  }

  // ---------------------------------------------------------------- camera
  const shots = SHOTS();
  let cam: Cam = { x: 540, y: 1000, z: 1.2 };
  const startOf = (a: number) => (a === ls(1) || a === ls(9) ? a - 6 : a);
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
  cam = { ...cam, x: cam.x + 3.2 * Math.sin(t * 0.021) + 1.6 * Math.sin(t * 0.057), y: cam.y + 2.4 * Math.sin(t * 0.017 + 1) };
  const bg = BG[place];
  const yi = idle(t, 0.7, you.walk < 0.05);
  const night = place === "ext" ? 0.22 : place === "room" ? 0.8 : 0.58;
  const redK = place === "ext" ? 0.7 : 1;
  const beacon = 0.4 + 0.6 * breathOf(g);

  return (
    <AbsoluteFill style={{ background: "#050404" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <defs>
          <filter id="d1-grade" colorInterpolationFilters="sRGB">
            <feColorMatrix type="saturate" values="0.6" />
            <feComponentTransfer><feFuncR type="linear" slope={1 - night * 0.7} intercept={night * 0.03} /><feFuncG type="linear" slope={1 - night * 0.72} intercept={night * 0.04} /><feFuncB type="linear" slope={1 - night * 0.55} intercept={night * 0.09} /></feComponentTransfer>
          </filter>
          <linearGradient id="d1-beam" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#ff2a1a" stopOpacity="0" /><stop offset="0.5" stopColor="#ff2a1a" stopOpacity="0.9" /><stop offset="1" stopColor="#ff2a1a" stopOpacity="0" /></linearGradient>
          <radialGradient id="d1-lamp"><stop offset="0" stopColor="#ffe9a8" stopOpacity="0.95" /><stop offset="0.4" stopColor="#ffc860" stopOpacity="0.4" /><stop offset="1" stopColor="#ffb040" stopOpacity="0" /></radialGradient>
          <radialGradient id="d1-vig" cx="0.5" cy="0.5" r="0.75"><stop offset="0.45" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.8" /></radialGradient>
          <radialGradient id="d1-red"><stop offset="0" stopColor="#ff3020" stopOpacity="0.9" /><stop offset="0.3" stopColor="#ff2a1a" stopOpacity="0.4" /><stop offset="1" stopColor="#ff2a1a" stopOpacity="0" /></radialGradient>
          <linearGradient id="d1-metal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#c6cdd2" /><stop offset="0.5" stopColor="#929ba2" /><stop offset="1" stopColor="#5e676e" /></linearGradient>
          <linearGradient id="d1-dark" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#5a636c" /><stop offset="1" stopColor="#262b30" /></linearGradient>
          <linearGradient id="d1-cloth" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e2eaee" /><stop offset="1" stopColor="#a9b6bc" /></linearGradient>
          <linearGradient id="d1-wood" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#b08a5c" /><stop offset="1" stopColor="#6a4c2c" /></linearGradient>
          <linearGradient id="d1-shade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e6dcc0" /><stop offset="1" stopColor="#b2a584" /></linearGradient>
          <linearGradient id="d1-shade-on" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff6cc" /><stop offset="1" stopColor="#ffd870" /></linearGradient>
          <linearGradient id="d1-deadshade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#020308" stopOpacity="0.88" /><stop offset="0.5" stopColor="#060a16" stopOpacity="0.62" /><stop offset="1" stopColor="#1c2433" stopOpacity="0.3" /></linearGradient>
          <filter id="d1-soft"><feGaussianBlur stdDeviation="9" /></filter>
          <linearGradient id="d1-card" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#c9c4b8" /></linearGradient>
          <filter id="d1-grain"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" /><feColorMatrix type="saturate" values="0" /></filter>
        </defs>
        <g transform={`translate(540,900) scale(${cam.z}) translate(${-cam.x},${-cam.y})`}>
          <image href={staticFile(bg.src)} x={0} y={0} width={1080} height={1250} />
          <rect x={-200} y={1236} width={1480} height={1500} fill={bg.edge} />
          <rect x={-200} y={0} width={1480} height={2700} fill="#0a0f24" opacity={night * 0.85} />

          {/* the roof beacon: a red lamp with a soft glow */}
          {place === "ext" && (
            <g>
              <circle cx={700} cy={430} r={14} fill="#ff4030" opacity={0.6 + 0.4 * beacon} />
              <circle cx={700} cy={430} r={80 + 50 * beacon} fill="url(#d1-red)" opacity={0.85} />
            </g>
          )}

          {place === "room" && (
            <g filter="url(#d1-grade)">
              <g transform="translate(940,700) scale(0.55)"><Lamp lit={lampLit} /></g>
            </g>
          )}

          {place === "corr" && cleaner.show && (
            <g opacity={cleaner.o}>
              <ellipse cx={cleaner.x - 80 * cleaner.s} cy={cleaner.y + 6} rx={170 * cleaner.s} ry={13 * cleaner.s} fill="#000" opacity={0.4} filter="url(#d1-soft)" />
              <Trolley x={cleaner.x - 200 * cleaner.s} y={cleaner.y} s={cleaner.s * 1.1} />
              <Mop x={cleaner.x + 130 * cleaner.s} y={cleaner.y} s={cleaner.s} sway={Math.sin(t * 0.07) * 4} />
              <g filter="url(#d1-grade)"><Villager id="cleaner" x={cleaner.x} y={cleaner.y} s={cleaner.s} mood="calm" face={-1} walk={cleaner.walk} seed={3} t={t} /></g>
            </g>
          )}

          {you.show && g >= ls(2) + 4 && <ellipse cx={you.x} cy={you.y + 6} rx={60 * you.s} ry={11 * you.s} fill="#000" opacity={0.4} filter="url(#d1-soft)" />}
          {ton.show && <ellipse cx={ton.x - (ton.rot < -10 ? 80 : 0)} cy={ton.y + 6} rx={(ton.rot < -10 ? 180 : 55) * ton.s} ry={11 * ton.s} fill="#000" opacity={0.4} filter="url(#d1-soft)" />}
          {you.show && (
            <g filter="url(#d1-grade)">
              <g transform={`translate(${you.x},${you.y + yi.dy}) rotate(${yi.rot}) scale(${you.s},${you.s * yi.sy})`}>
                <Traveller yaw={you.yaw} mood={you.mood} walk={you.walk} phase={you.phase} sit={you.sit} t={t} />
              </g>
            </g>
          )}
          {ton.show && (
            <g filter="url(#d1-grade)">
              <g transform={`translate(${ton.x + ton.shake},${ton.y}) rotate(${ton.rot}) scale(${ton.s})`}>
                <Figure look={LOOKS.ton} mood={ton.mood} sit={ton.sit} point={ton.point} facing={-1} talk={talk} t={t + 30} />
                {slump > 0.4 && (
                  <g opacity={clamp01((slump - 0.4) / 0.4)}>
                    <ellipse cx={0} cy={-422} rx={92} ry={96} fill="url(#d1-deadshade)" />
                    <ellipse cx={-34} cy={-406} rx={34} ry={28} fill="#010206" opacity={0.5} />
                    <ellipse cx={34} cy={-406} rx={34} ry={28} fill="#010206" opacity={0.5} />
                  </g>
                )}
              </g>
            </g>
          )}
          {/* the lamp's warm light for the one second it is on */}
          {place === "room" && lampLit > 0 && <circle cx={940} cy={680} r={300} fill="url(#d1-lamp)" opacity={0.9} />}
        </g>
        <RedSweep g={g} k={redK} />
        {place !== "ext" && Array.from({ length: 26 }, (_, i) => {
          const x = (rnd(i, 1) * 1200 + t * (0.25 + rnd(i, 2) * 0.5)) % 1200 - 60;
          const y = (rnd(i, 3) * 2000 - t * (0.2 + rnd(i, 4) * 0.4) + 2000) % 2000;
          return <circle key={"d" + i} cx={x} cy={y} r={1.5 + rnd(i, 5) * 2.8} fill="#ffe8e0" opacity={0.1 + 0.18 * rnd(i, 6)} />;
        })}
        <rect width={1080} height={1920} fill="url(#d1-vig)" />
        <rect width={1080} height={1920} filter="url(#d1-grain)" opacity={0.14} />
        <rect width={1080} height={1920} fill="#fff3d0" opacity={g >= lampPress && g < lampPress + 4 ? 0.5 * (1 - (g - lampPress) / 4) : 0} />
        <rect width={1080} height={1920} fill="#030202" opacity={dark} />
      </svg>
      <SpeakerOverlay g={g} from={ls(1)} to={le(1) + 6} amp={ampOf(1, g)} />
      <SpeakerOverlay g={g} from={speakerAt} to={cardAt} amp={ampOf(3, g)} />
      <RuleCard g={g} from={cardAt} dur={96} />
      {showPhone && <PhoneInsert g={g} />}
      {showPaper && <PaperInsert g={g} />}
      <Card a="กฎเหล็กหอพัก ตี 3" b="ตอนที่ 1 · 03:00 กฎข้อแรก" at={C.titleAt} dur={46} g={g} />
      {manifest.shots.map((shot, i) => (
        <Sequence key={i} from={manifest.starts[i] + shot.leadFrames} durationInFrames={shot.audioFrames}>
          <Audio src={staticFile(shot.audio)} />
          <Sub text={SUBTITLE_FIX(shot.text)} from={manifest.starts[i] + shot.leadFrames} g={g} />
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

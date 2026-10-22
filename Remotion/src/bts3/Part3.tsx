import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import manifest from "./manifest.json";
import { fontFamily } from "../island/fonts";
import { PASSENGER_IDS, PASSENGERS, PassengerId } from "../bts/cast";
import { Passenger } from "../bts/Passenger";
import { FLOOR_Y, TrainInterior } from "../bts/TrainInterior";
import { MapMarker, TrainMap } from "../bts/TrainMap";
import { Countdown } from "../bts/Countdown";
import { StationBoard } from "../bts/StationBoard";
import { ANCHOR, cameraAt } from "./camera";

const { cues, shots, starts, total, outroStart } = manifest;
const c = cues as Record<string, number>;
const ls = (i: number) => c[`lineStart${i}`];
const le = (i: number) => c[`lineEnd${i}`];
const W = 1080;
const H = 1920;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ramp = (g: number, a: number, b: number) => clamp01((g - a) / Math.max(1, b - a));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);
const PHASE_SPEED = 0.22;
const TAG_FRAMES = 34;
const BITE_FLASH = 12;
const FALL_FRAMES = 35;
const FALL_DEG = 88;

// ---------------- the world: car 4 is the last car; its walkway to car 3 is at the LEFT end, so the interior is mirrored ----------------
const OFF = 1500; // shifts the interior so that the walkway sits at x 600 to 840
const REAR_X = 2100; // the closed rear end of the train
const CORRIDOR_X = 600; // left of this: the vestibule toward car 3

/** puts children at a visual world x inside the mirrored interior without mirroring them (text stays readable) */
const Slide: React.FC<{ xv: number; children: React.ReactNode }> = ({ xv, children }) => <g transform={`translate(${1100 - (xv - OFF)},0) scale(-1,1)`}>{children}</g>;

const scrollArr: number[] = [];
{
  let s = 0;
  for (let g = 0; g <= total; g++) {
    scrollArr.push(s);
    s += 16 + 6 * ramp(g, c.board0 - 20, c.board0 + 20);
  }
}
const lightsAt = (g: number) => {
  if (g >= c.cabGlassAt && g < c.cabGlassEnd) return 0.7 + 0.1 * Math.sin(g * 0.5);
  if (g >= c.biteAt) return 0.88;
  return 1;
};

// ---------------- the cast ----------------
type Pp = { id: PassengerId; x: number; y: number; facing: 1 | -1; pose: "stand" | "sit" | "hold" | "shamble" | "fall"; walk: number; infection: number; fear: number; headTilt: number; label: boolean; rot: number; mark: number };

// one name tag at a time
const TAGS: { id: PassengerId; t: number }[] = [
  { id: "nun", t: c.nunPoints },
  { id: "mike", t: c.mikeNo },
  { id: "nueng", t: c.argueAt + 10 },
  { id: "aunt", t: c.countAt - 35 }, // when the camera is on the right and she is walking to the boy
];

// where everybody ends up (left to right): the boy nearest the zombies, "you" at the back; they start 150 px nearer the walkway
const FINAL_X = { nueng: 1360, nun: 1520, mike: 1660, aunt: 1800, you: 1930 };
const RETREAT = 150;
const retreatX = (g: number, final: number) => final - RETREAT * (1 - smooth(ramp(g, c.enterAt, c.enterAt + 110)));
const retreating = (g: number) => g >= c.enterAt && g < c.enterAt + 110;
const FRONT_LANE = 95; // after the bite the boy and ป้าสมจิตร meet in the lane nearest the camera, so they pass in front of the others
const MEET_X = { nueng: 1590, aunt: 1670 };

// the zombies: 0.5 px per frame (the man leads), 0.25 after the bite; they never reach the survivors
const MAN_AT_BITE = 650 + 0.5 * (c.biteAt - c.enterAt);
const manX = (g: number) => (g < c.biteAt ? 650 + 0.5 * (g - c.enterAt) : MAN_AT_BITE + 0.25 * (g - c.biteAt));

const staging = (g: number): Pp[] => {
  const out: Pp[] = [];
  const add = (p: Omit<Pp, "label" | "walk" | "infection" | "fear" | "headTilt" | "facing" | "pose" | "rot" | "mark"> & Partial<Pp>) => {
    const tag = TAGS.find((t) => t.id === p.id);
    out.push({ facing: -1, pose: "stand", walk: 0, infection: 0, fear: 0, headTilt: 0, rot: 0, mark: 0, ...p, label: !!tag && g >= tag.t && g < tag.t + TAG_FRAMES } as Pp);
  };
  const wob = (k: number, f = 0.5) => Math.sin(g * f + k);
  const argue = ramp(g, c.argueAt, c.argueAt + 15) * (1 - ramp(g, c.shoveAt, c.shoveAt + 10));
  const retr = retreating(g) ? 0.5 : 0;
  const scared = ramp(g, c.enterAt, c.enterAt + 40);

  // the boy: scared and standing between the sides; he is the nearest to the zombies and is knocked down toward them
  const fallA = FALL_DEG * smooth(ramp(g, c.fallAt, c.fallAt + FALL_FRAMES));
  const riseA = FALL_DEG * (1 - smooth(ramp(g, c.biteAt + 25, c.biteAt + 60)));
  const ang = g < c.biteAt + 25 ? fallA : riseA;
  const meet = smooth(ramp(g, c.biteAt + 65, c.countAt + 40));
  const walkingToAunt = meet > 0 && meet < 1;
  add({ id: "nueng", x: lerp(retreatX(g, FINAL_X.nueng), MEET_X.nueng, meet), y: lerp(FLOOR_Y + 20, FLOOR_Y + 20 + FRONT_LANE, smooth(ramp(g, c.biteAt + 65, c.biteAt + 95))), facing: meet > 0 ? 1 : -1, walk: walkingToAunt ? 0.6 : retr, fear: Math.max(0.5 * scared, 0.9 * argue, 0.5 * meet), rot: -ang, mark: clamp01((g - c.biteAt - 12) / 12), headTilt: g < c.fallAt ? wob(1, 0.9) * 3 : 0 });

  // พี่นุ่น: points toward the front, argues, is shoved and staggers into the boy
  const shove = ramp(g, c.shoveAt, c.fallAt - 4);
  const nunPoint = ramp(g, c.nunPoints, c.nunPoints + 12) * (1 - ramp(g, c.argueAt, c.argueAt + 10));
  add({ id: "nun", x: retreatX(g, FINAL_X.nun) - 50 * smooth(shove), y: FLOOR_Y + 55, facing: g >= c.mikeNo && g < c.fallAt + 20 ? 1 : -1, walk: retr, fear: Math.max(0.45 * nunPoint, argue * (0.5 + 0.4 * wob(0)), 0.9 * shove * (1 - ramp(g, c.fallAt + 20, c.fallAt + 50)), 0.4 * scared), headTilt: argue * wob(1) * 10 - 10 * shove });

  // ไมค์: says no, argues, shoves
  const push = ramp(g, c.shoveAt - 6, c.shoveAt + 4) * (1 - ramp(g, c.shoveAt + 14, c.shoveAt + 30));
  add({ id: "mike", x: retreatX(g, FINAL_X.mike) - 30 * push, y: FLOOR_Y + 30, walk: retr, fear: Math.max(0.15 * ramp(g, c.mikeNo, c.mikeNo + 10), argue * (0.5 + 0.4 * wob(2)), 0.7 * push, 0.3 * scared), headTilt: ramp(g, c.mikeNo, c.mikeNo + 6) * (1 - ramp(g, c.argueAt, c.argueAt + 6)) * wob(0, 0.8) * 12 + argue * wob(3) * 9 });

  // ป้าสมจิตร: frightened; after the bite she goes to the boy
  const toBoy = smooth(ramp(g, c.biteAt + 65, c.countAt + 40));
  add({ id: "aunt", x: lerp(retreatX(g, FINAL_X.aunt), MEET_X.aunt, toBoy), y: lerp(FLOOR_Y + 20, FLOOR_Y + 20 + FRONT_LANE, smooth(ramp(g, c.biteAt + 65, c.biteAt + 95))), facing: toBoy > 0 ? -1 : -1, walk: toBoy > 0 && toBoy < 1 ? 0.6 : retr, fear: Math.max(0.5 * scared, 0.6 * argue), headTilt: argue * wob(4) * 6 });

  // "you": at the back, watching; the worry grows
  add({ id: "you", x: retreatX(g, FINAL_X.you), y: FLOOR_Y + 40, walk: retr, fear: Math.max(0.3 * scared, 0.4 * argue, 0.6 * ramp(g, c.biteAt, c.countAt)) });

  // the zombies: out of the walkway one after the other
  if (g >= c.enterAt - 60) {
    const mx = manX(g);
    add({ id: "man1", x: mx, y: FLOOR_Y + 40, facing: 1, pose: "shamble", walk: 1, infection: 1, headTilt: 12 });
    add({ id: "woman1", x: mx - 110, y: FLOOR_Y + 55, facing: 1, pose: "shamble", walk: 1, infection: 1, headTilt: 12 });
    add({ id: "uncle", x: mx - 220, y: FLOOR_Y + 45, facing: 1, pose: "shamble", walk: 1, infection: 1, headTilt: 12 });
  }
  return out.sort((a, b) => a.y - b.y);
};

const PART3_MARKERS: MapMarker[] = [
  { id: "cab", car: 1, pos: 0.06, kind: "driver", appearAt: 0.0 },
  { id: "nueng", car: 4, pos: 0.4, kind: "ok", appearAt: 0.15 },
  { id: "nun", car: 4, pos: 0.52, kind: "ok", appearAt: 0.25 },
  { id: "mike", car: 4, pos: 0.64, kind: "ok", appearAt: 0.35 },
  { id: "aunt", car: 4, pos: 0.76, kind: "ok", appearAt: 0.45 },
  { id: "you", car: 4, pos: 0.88, kind: "you", appearAt: 0.55 },
  { id: "man1", car: 3, pos: 0.8, kind: "infected", appearAt: 0.7 },
  { id: "woman1", car: 3, pos: 0.6, kind: "infected", appearAt: 0.8 },
  { id: "uncle", car: 3, pos: 0.4, kind: "infected", appearAt: 0.9 },
];

// ---------------- pieces drawn in the world ----------------
/** a platform full of waving people, drawn inside a window (the train does not stop) */
const Platform: React.FC<{ g: number }> = ({ g }) => (
  <g>
    <rect x={-1400} y={1000} width={2800} height={40} fill="#b9b3a2" />
    <rect x={-1400} y={1000} width={2800} height={6} fill="#f2c200" />
    {Array.from({ length: 8 }, (_, i) => {
      const x = -1200 + i * 330 + ((i * 53) % 90);
      const wave = Math.sin(g * 0.6 + i * 1.7) * 28;
      const cols = ["#d9534f", "#4a78b5", "#6b8f71", "#e6b13a", "#8f5ea8"];
      return (
        <g key={i} transform={`translate(${x},0)`}>
          <rect x={-18} y={920} width={36} height={80} rx={14} fill={cols[i % 5]} />
          <circle cx={0} cy={896} r={20} fill="#e0b08a" />
          <g transform={`rotate(${-130 + wave} 16 930)`}><rect x={10} y={924} width={10} height={58} rx={5} fill="#e0b08a" /></g>
          <rect x={-14} y={996} width={10} height={4} fill="#222" />
        </g>
      );
    })}
  </g>
);

const RearEnd: React.FC = () => (
  <g>
    <rect x={REAR_X} y={500} width={1500} height={1400} fill="#cfcbbd" />
    <rect x={REAR_X} y={FLOOR_Y} width={1500} height={700} fill="#5f6367" />
    <rect x={REAR_X + 80} y={800} width={240} height={420} rx={14} fill="#2a2f33" stroke="#8c918f" strokeWidth={10} />
    <rect x={REAR_X + 100} y={830} width={200} height={170} fill="#8fb0c4" opacity={0.7} />
    <rect x={REAR_X} y={500} width={14} height={800} fill="#8c918f" />
  </g>
);

const Corridor: React.FC = () => (
  <g>
    <rect x={-600} y={500} width={CORRIDOR_X + 600} height={1400} fill="#23262a" />
    <rect x={-600} y={FLOOR_Y} width={CORRIDOR_X + 600} height={700} fill="#3a3d41" />
    {Array.from({ length: 5 }, (_, i) => <rect key={i} x={CORRIDOR_X - 80 - i * 130} y={780} width={14} height={FLOOR_Y - 780} fill="#14161a" opacity={0.7} />)}
    <rect x={-600} y={FLOOR_Y} width={CORRIDOR_X + 600} height={8} fill="#6b6f74" opacity={0.6} />
  </g>
);

// ---------------- screen-space pieces ----------------
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

/** the bite as a silhouette: a zombie's head and hand closing on a boy's wrist */
const BiteSilhouette: React.FC<{ g: number }> = ({ g }) => {
  const a = Math.min(1, ramp(g, c.biteAt - 3, c.biteAt) * (1 - ramp(g, c.biteAt + 4, c.biteAt + BITE_FLASH)));
  if (a <= 0) return null;
  return (
    <AbsoluteFill style={{ opacity: a }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 42%, #f4f1e6 0%, #bdb7a4 38%, #0b0c0e 80%)" }} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <g fill="#070707">
          {/* the boy: head with hair at the left, his arm on the floor, a limp hand */}
          <ellipse cx={150} cy={930} rx={78} ry={84} />
          <path d="M72 920 A84 84 0 0 1 228 920 Q150 880 72 920 Z" />
          <rect x={200} y={880} width={330} height={46} rx={23} />
          <ellipse cx={545} cy={903} rx={34} ry={24} />
          {/* the zombie: head and the grip of its hand */}
          <ellipse cx={720} cy={850} rx={130} ry={142} />
          <path d="M560 1100 Q590 920 720 960 Q900 980 940 1100 Z" />
          <path d="M440 960 L520 880 L560 910 L500 1000 Z" />
          {[0, 1, 2, 3].map((i) => <rect key={i} x={420 + i * 26} y={862 - i * 4} width={14} height={54} rx={7} transform={`rotate(-20 ${427 + i * 26} 900)`} />)}
        </g>
        <path d="M590 822 L672 846 L590 878 Z" fill="#d8d2bf" />
        <rect x={566} y={832} width={44} height={20} rx={10} fill="#070707" transform="rotate(-6 566 842)" />
      </svg>
    </AbsoluteFill>
  );
};

/** face-on close-up of "you": the eyes dart between the boy and ไมค์ while you decide */
const FaceYou: React.FC<{ g: number }> = ({ g }) => {
  const k = PASSENGERS.you;
  const zoom = 1.02 + 0.1 * ramp(g, c.faceAt, le(7));
  const sway = Math.sin(g * 0.11) * 1.2;
  const blink = Math.max(0, 1 - Math.abs(((g % 75) - 30) / 3));
  const look = Math.sin(g * 0.13) * 14;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
      <defs>
        <linearGradient id="fy-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4a5560" />
          <stop offset="1" stopColor="#12161a" />
        </linearGradient>
        <linearGradient id="fy-shade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0b0e12" stopOpacity={0} />
          <stop offset="0.35" stopColor="#0b0e12" stopOpacity={0.85} />
          <stop offset="1" stopColor="#0b0e12" stopOpacity={0.95} />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill="url(#fy-bg)" />
      <g transform={`translate(540,800) scale(${zoom * 3.0}) rotate(${sway})`}>
        <path d="M-210 330 Q-190 200 -90 176 L90 176 Q190 200 210 330 Z" fill="#f4f4f0" />
        <path d="M-120 330 L-90 176 M120 330 L90 176" stroke="#2d3a52" strokeWidth={22} fill="none" />
        <path d="M-30 176 L0 200 L30 176 L0 290 Z" fill="#2f8f4e" />
        <rect x={-34} y={96} width={68} height={92} rx={26} fill={k.skin} />
        <ellipse cx={-96} cy={4} rx={13} ry={22} fill={k.skin} />
        <ellipse cx={96} cy={4} rx={13} ry={22} fill={k.skin} />
        <ellipse cx={0} cy={0} rx={92} ry={108} fill={k.skin} />
        <path d="M-94 -14 Q-100 -118 0 -120 Q100 -118 94 -14 Q74 -86 0 -88 Q-74 -86 -94 -14 Z" fill={k.hair} />
        <path d="M-62 -40 Q-44 -52 -26 -42 M26 -42 Q44 -52 62 -40" stroke="#1b1b1b" strokeWidth={6} fill="none" strokeLinecap="round" transform="translate(0,-14)" />
        {[-44, 44].map((ex, i) => (
          <g key={i} transform={`translate(${ex},-14)`}>
            <ellipse rx={25} ry={25 * (1 - blink * 0.9)} fill="#ffffff" stroke="#8a8a8a" strokeWidth={2} />
            <circle cx={look} cy={2} r={9} fill="#1b1b1b" />
            <circle cx={look + 3} cy={-2} r={3} fill="#fff" />
          </g>
        ))}
        <path d="M0 -4 Q-8 24 -6 34 Q0 38 8 34" stroke="#b98a68" strokeWidth={4} fill="none" strokeLinecap="round" />
        <path d="M-26 66 Q0 56 26 66" stroke="#8a3a30" strokeWidth={6} fill="none" strokeLinecap="round" />
        <path d="M70 -40 q6 12 0 22" stroke="#9ad0ff" strokeWidth={5} fill="none" strokeLinecap="round" />
      </g>
      <rect y={1300} width={W} height={620} fill="url(#fy-shade)" />
    </svg>
  );
};

/** the survivors count card: "ผู้รอดชีวิต 5 → 4" */
const SurvivorCount: React.FC<{ g: number }> = ({ g }) => {
  const t = ramp(g, c.countAt, c.countAt + 26);
  const n = t < 0.5 ? 5 : 4;
  const pulse = 1 + 0.18 * Math.max(0, Math.sin(Math.PI * clamp01((t - 0.4) / 0.4)));
  return (
    <svg width={520} height={200} viewBox="0 0 520 200">
      <rect x={4} y={4} width={512} height={192} rx={34} fill="#0f1215" opacity={0.9} stroke="#4a5158" strokeWidth={4} />
      <text x={260} y={56} textAnchor="middle" fontFamily={fontFamily} fontSize={36} fill="#d9dde0">ผู้รอดชีวิต</text>
      <g transform={`translate(80,118) scale(${pulse})`}>
        <text x={0} y={36} textAnchor="middle" fontFamily={fontFamily} fontSize={96} fill={n === 4 ? "#ff9a8a" : "#f1f1f1"}>{n}</text>
      </g>
      {[0, 1, 2, 3, 4].map((i) => {
        const gone = i === 4 && t > 0.5;
        return (
          <g key={i} transform={`translate(${190 + i * 62},130)`}>
            <circle cy={-26} r={13} fill={gone ? "#7a2a26" : "#d9dde0"} />
            <rect x={-15} y={-8} width={30} height={46} rx={14} fill={gone ? "#7a2a26" : "#d9dde0"} />
          </g>
        );
      })}
    </svg>
  );
};

/** The view down the three cars to the cab at the front: the driver slumped over the controls. */
const CabGlass: React.FC<{ g: number }> = ({ g }) => {
  const dolly = 1 + 0.3 * ramp(g, c.cabGlassAt, c.cabGlassEnd);
  const VP = { x: 540, y: 770 };
  const N = 7;
  const s = (k: number) => 1 / (1 + 0.3 * k);
  const L = (k: number) => VP.x - 600 * s(k);
  const R = (k: number) => VP.x + 600 * s(k);
  const CE = (k: number) => VP.y - 640 * s(k);
  const FL = (k: number) => VP.y + 540 * s(k);
  const flick = 0.75 + 0.25 * Math.sin(g * 0.6) * Math.sin(g * 0.17);
  const quad = (pts: number[][], fill: string, op = 1) => <polygon points={pts.map((p) => p.join(",")).join(" ")} fill={fill} opacity={op} />;
  const end = N - 1;
  const cx = (L(end) + R(end)) / 2;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
      <rect width={W} height={H} fill="#0b0e12" />
      <g transform={`translate(${VP.x},${VP.y}) scale(${dolly}) translate(${-VP.x},${-VP.y})`}>
        {Array.from({ length: N - 1 }, (_, k) => (
          <g key={k}>
            {quad([[L(k), CE(k)], [R(k), CE(k)], [R(k + 1), CE(k + 1)], [L(k + 1), CE(k + 1)]], "#d8d4c6", 0.55 * flick)}
            {quad([[L(k), FL(k)], [R(k), FL(k)], [R(k + 1), FL(k + 1)], [L(k + 1), FL(k + 1)]], k % 2 ? "#6a6e72" : "#74787c")}
            {quad([[L(k), CE(k)], [L(k + 1), CE(k + 1)], [L(k + 1), FL(k + 1)], [L(k), FL(k)]], "#bdb9aa", flick)}
            {quad([[R(k), CE(k)], [R(k + 1), CE(k + 1)], [R(k + 1), FL(k + 1)], [R(k), FL(k)]], "#b6b2a3", flick)}
            {/* windows and the yellow benches along both walls */}
            {quad([[L(k), VP.y - 330 * s(k)], [L(k + 1), VP.y - 330 * s(k + 1)], [L(k + 1), VP.y - 80 * s(k + 1)], [L(k), VP.y - 80 * s(k)]], "#9fcbe8", 0.8 * flick)}
            {quad([[R(k), VP.y - 330 * s(k)], [R(k + 1), VP.y - 330 * s(k + 1)], [R(k + 1), VP.y - 80 * s(k + 1)], [R(k), VP.y - 80 * s(k)]], "#9fcbe8", 0.8 * flick)}
            {quad([[L(k), VP.y + 170 * s(k)], [L(k + 1), VP.y + 170 * s(k + 1)], [L(k + 1), VP.y + 380 * s(k + 1)], [L(k), VP.y + 380 * s(k)]], "#f2b705", flick)}
            {quad([[R(k), VP.y + 170 * s(k)], [R(k + 1), VP.y + 170 * s(k + 1)], [R(k + 1), VP.y + 380 * s(k + 1)], [R(k), VP.y + 380 * s(k)]], "#e0a400", flick)}
          </g>
        ))}
        {/* poles and the dark frames where one car ends and the next begins */}
        {Array.from({ length: N }, (_, k) => (
          <g key={k}>
            <rect x={VP.x - 190 * s(k) - 5 * s(k)} y={CE(k)} width={10 * s(k)} height={FL(k) - CE(k)} fill="#e6e8ea" opacity={0.9} />
            <rect x={VP.x + 190 * s(k) - 5 * s(k)} y={CE(k)} width={10 * s(k)} height={FL(k) - CE(k)} fill="#e6e8ea" opacity={0.9} />
            {(k === 2 || k === 4) && <rect x={L(k)} y={CE(k)} width={R(k) - L(k)} height={FL(k) - CE(k)} fill="none" stroke="#14161a" strokeWidth={26 * s(k)} />}
          </g>
        ))}
        {/* the cab at the far end: a lit window, the console and the driver slumped over it */}
        <rect x={L(end)} y={CE(end)} width={R(end) - L(end)} height={FL(end) - CE(end)} fill="#1a2027" />
        <ellipse cx={cx} cy={FL(end) - 120} rx={150} ry={170} fill="#ff6a3a" opacity={0.12 + 0.1 * flick} />
        <g transform={`rotate(40 ${cx} ${FL(end) - 130})`}>
          <Passenger id="driver" x={cx} y={FL(end) - 20} scale={0.95} facing={1} phase={0} walk={0} frame={g} infection={0.6} pose="stand" headTilt={30} />
        </g>
        <rect x={cx - 120} y={FL(end) - 130} width={240} height={120} rx={8} fill="#0d1116" stroke="#59626b" strokeWidth={4} />
        {[0, 1, 2, 3].map((i) => <rect key={i} x={cx - 90 + i * 46} y={FL(end) - 112} width={28} height={10} fill={i === 1 ? "#d9534f" : "#2f8f4e"} opacity={0.9} />)}
      </g>
      <text x={540} y={300} textAnchor="middle" fontFamily={fontFamily} fontSize={40} fill="#f1f1f1" opacity={0.85}>ห้องคนขับ</text>
      <path d="M470 330 L540 380 L610 330" stroke="#f1f1f1" strokeWidth={6} fill="none" opacity={0.5 + 0.4 * Math.sin(g * 0.3)} strokeLinecap="round" />
    </svg>
  );
};

const World: React.FC = () => {
  const g = useCurrentFrame();
  const cam = cameraAt(g);
  const scroll = scrollArr[Math.min(g, total)];
  const people = staging(g);
  const boardKeys = [c.board0, c.board1, c.board2];
  const names = ["นานา", "อโศก", "พร้อมพงษ์"];
  const fade = ramp(g, 0, 10);

  const windowChildren = (
    <g>
      {g < c.hookCut + 20 && <Slide xv={900 + ((40 * g) % 330)}><Platform g={g} /></Slide>}
      {boardKeys.map((b, i) => (g >= b - 10 && g < b + 120 ? <Slide key={i} xv={1000 + 8 * (g - b)}><StationBoard x={0} y={765} name={names[i]} /></Slide> : null))}
    </g>
  );

  const mapOn = g >= c.mapIn && g < c.mapOut;
  const mapProgress = clamp01((g - c.mapIn) / 100);
  const cdOn = g >= c.countdownStart;
  const seconds = Math.max(0, 60 - (g - c.countdownStart) / 30);
  const countOn = g >= c.countAt && g < c.cabGlassAt + 10;
  const faceOn = g >= c.faceAt && g < le(7) + 4;
  const glassOn = g >= c.cabGlassAt && g < c.cabGlassEnd;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000", opacity: fade }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
        <g transform={`translate(${ANCHOR.x},${ANCHOR.y}) rotate(${cam.rot}) scale(${cam.zoom}) translate(${-cam.fx},${-cam.fy})`}>
          <g transform={`translate(${OFF},0)`}>
            <TrainInterior frame={g} scroll={scroll} doors={0} lights={lightsAt(g)} station="เพลินจิต" carNumber={4} mirror windowChildren={windowChildren} />
          </g>
          <Corridor />
          <RearEnd />
          {people.map((p) => (
            <g key={p.id} transform={p.rot ? `rotate(${p.rot} ${p.x} ${p.y})` : undefined}>
              <Passenger id={p.id} x={p.x} y={p.y} scale={1.7} facing={p.facing} phase={g * PHASE_SPEED + PASSENGER_IDS.indexOf(p.id) * 0.9} walk={p.walk} frame={g} infection={p.infection} pose={p.pose} headTilt={p.headTilt} label={p.label} fear={p.fear} mark={p.mark} />
            </g>
          ))}
        </g>
      </svg>

      <BiteSilhouette g={g} />
      {faceOn && (
        <AbsoluteFill style={{ opacity: ramp(g, c.faceAt, c.faceAt + 7) * clamp01((le(7) + 4 - g) / 8) }}>
          <FaceYou g={g} />
        </AbsoluteFill>
      )}
      {glassOn && (
        <AbsoluteFill style={{ opacity: ramp(g, c.cabGlassAt, c.cabGlassAt + 8) * clamp01((c.cabGlassEnd - g) / 10) }}>
          <CabGlass g={g} />
        </AbsoluteFill>
      )}

      {mapOn && (
        <div style={{ position: "absolute", left: 90, top: 130, transform: "scale(0.9)", transformOrigin: "top left", opacity: clamp01((c.mapOut - g) / 14) }}>
          <TrainMap progress={mapProgress} markers={PART3_MARKERS} />
        </div>
      )}
      {cdOn && (
        <div style={{ position: "absolute", left: 90, top: 130, opacity: clamp01((g - c.countdownStart) / 8) }}>
          <Countdown seconds={seconds} label="น้องเต้ย" pulse={Math.max(0, Math.sin(g * 0.45))} />
        </div>
      )}
      {countOn && (
        <div style={{ position: "absolute", left: 380, top: 150, opacity: ramp(g, c.countAt, c.countAt + 8) * clamp01((c.cabGlassAt + 10 - g) / 10) }}>
          <SurvivorCount g={g} />
        </div>
      )}

      {/* hook: the part's title card, on a dark plate, after the first line */}
      <Card g={g} from={Math.max(le(0), c.hookCut - 80)} to={c.hookCut} style={{ top: 300, left: 110, right: 200, fontSize: 56, lineHeight: 1.55, background: "rgba(11,13,16,0.66)", borderRadius: 32, padding: "26px 20px" }}>
        รถไม่จอด...<br />แล้วทุกคนเริ่มเถียงกัน
      </Card>

      {/* lighting and grade: vignette, cool-top warm-bottom split tone, film grain */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 42%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.5) 100%)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(120,150,170,0.16) 0%, rgba(0,0,0,0) 45%, rgba(190,150,110,0.14) 100%)", mixBlendMode: "soft-light" }} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: 0.08, mixBlendMode: "overlay", pointerEvents: "none" }}>
        <filter id="bts3-grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={g % 7} /><feColorMatrix type="saturate" values="0" /></filter>
        <rect width={W} height={H} filter="url(#bts3-grain)" />
      </svg>

      {g >= outroStart - 14 && <Outro g={g} />}
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
        <div style={{ fontSize: 58, opacity: clamp01((t - 26) / 14), lineHeight: 1.5, marginTop: 12 }}>ฝ่าไปหัวขบวน...</div>
        <div style={{ fontSize: 56, opacity: clamp01((t - 76) / 14), marginTop: 70, color: "#ffd86b" }}>ติดตามตอนที่ 4</div>
      </div>
    </AbsoluteFill>
  );
};

export const Part3: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <World />
    {shots.map((shot, i) => (
      <Sequence key={i} from={starts[i] + shot.leadFrames} durationInFrames={shot.audioFrames}>
        <Audio src={staticFile(shot.audio)} />
        <Subtitle text={shot.text} />
      </Sequence>
    ))}
    <Audio src={staticFile("bts3/bed.wav")} volume={0.5} />
  </AbsoluteFill>
);

export const PART3_TOTAL = total;

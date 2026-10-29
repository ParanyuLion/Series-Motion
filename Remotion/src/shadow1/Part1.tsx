import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import manifest from "./manifest.json";
import { fontFamily } from "../island/fonts";
import { Figure, LOOKS, Mood } from "./Figure";
import { Traveller, TravellerMood } from "./Traveller";
import { Bucket, Crates, INK, Mooring, Net, PIER_TOP, Rope, SHADOW, Shade } from "./VillageVert";
import { Cam, Key, WorldCam, camAt, clamp01, lerp, smooth } from "../onestar3/util";

// "หมู่บ้านที่ไม่มีใครมีเงา" Part 1, "เงาของคุณ". One world (the plank pier and the stilt village, 1080x1920 world coordinates) seen through a moving camera.
// All timing comes from manifest.json (the narration audio); cues are frames. Only "you" and objects cast shadows; villagers never do.

const C = manifest.cues as Record<string, number>;
const ls = (i: number) => C[`lineStart${i}`];
const le = (i: number) => C[`lineEnd${i}`];

const SUBTITLE_FIX = (t: string) => t.replace(/ใกล้เที่ยง/g, "ใกล้⁠เที่ยง").replace(/เงาสวยจังเลย/g, "เงา⁠สวย⁠จังเลย").replace(/พร้อมกัน/g, "พร้อม⁠กัน").replace(/ผู้ใหญ่บ้าน/g, "ผู้ใหญ่⁠บ้าน");

const Subtitle: React.FC<{ text: string; from: number; g: number }> = ({ text, from, g }) => (
  <div style={{ position: "absolute", left: 60, right: 160, bottom: 340, textAlign: "center", opacity: clamp01((g - from) / 6), fontFamily, fontSize: 52, lineHeight: 1.6, color: "#fff", textShadow: "0 0 12px rgba(0,0,0,0.95), 0 3px 6px rgba(0,0,0,0.95)" }}>{text}</div>
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

type Who = { id: string; x: number; y: number; s: number; mood: Mood; face?: 1 | -1; walk?: number; up?: number; nod?: number };

/** a villager: never casts a shadow */
const Villager: React.FC<Who & { t: number }> = ({ id, x, y, s, mood, face = 1, walk = 0, up = 0, nod = 0, t }) => (
  <g transform={`translate(${x},${y}) scale(${s}) translate(0,${nod * 14})`}>
    <Figure look={LOOKS[id]} mood={mood} facing={face} walk={walk} armsUp={up} t={t} />
  </g>
);

/** the wooden clapper on the mooring post: two blocks, struck once */
const Clapper: React.FC<{ hit: number }> = ({ hit }) => (
  <g transform={`translate(0,-150) rotate(${-34 * (1 - hit)})`}>
    <rect x={-74} y={-12} width={70} height={24} fill="#8a6a44" stroke={INK} strokeWidth={5} />
    <rect x={4} y={-12} width={64} height={24} fill="#7a5a3a" stroke={INK} strokeWidth={5} />
  </g>
);

const Boat: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x},${y})`} strokeLinejoin="round">
    <path d="M-120 0 Q-60 26 130 4 L170 -22 Q0 -4 -140 -18 Z" fill="#4a3a2a" stroke={INK} strokeWidth={6} />
    <rect x={-40} y={-44} width={80} height={26} fill="#6a5034" stroke={INK} strokeWidth={5} />
    <line x1={150} y1={-14} x2={250} y2={-70} stroke={INK} strokeWidth={8} />
    <ellipse cx={0} cy={10} rx={150} ry={7} fill="#e9dcc0" opacity={0.25} />
  </g>
);

const dipOf = (g: number, a: number, b: number) => clamp01(Math.min((g - a) / 7, (b - g) / 7));

export const Part1: React.FC<{ g?: number }> = ({ g: gOverride }) => {
  const frameNow = useCurrentFrame();
  const g = gOverride ?? frameNow;
  const t = g;

  // ---------------------------------------------------------------- camera (world coordinates)
  const keys: Key[] = [
    { at: 0, x: 760, y: 1310, z: 2.4 },
    { at: ls(1) + 20, x: 800, y: 1330, z: 2.0 },
    { at: ls(2) - 8, x: 540, y: 1040, z: 1.05 },
    { at: le(2), x: 560, y: 1000, z: 1.2 },
    { at: ls(3) - 8, x: 700, y: 1150, z: 1.15 },
    { at: ls(3) + 60, x: 520, y: 1330, z: 1.3 },
    { at: ls(4) - 6, x: 420, y: 1250, z: 1.3 },
    { at: ls(4), x: 200, y: 1190, z: 2.6 }, // the child's bare feet
    { at: le(4), x: 210, y: 1180, z: 2.7 },
    { at: ls(5) - 4, x: 460, y: 1060, z: 1.25 },
    { at: ls(6) - 4, x: 480, y: 1030, z: 1.35 },
    { at: ls(6) + 30, x: 390, y: 880, z: 2.5 }, // the head's face
    { at: ls(7), x: 390, y: 885, z: 2.5 },
    { at: ls(7) + 40, x: 780, y: 1250, z: 2.1 }, // his eyes drop to your feet
    { at: le(7), x: 790, y: 1260, z: 2.1 },
    { at: ls(8), x: 650, y: 1150, z: 1.2 }, // set C: the walk
    { at: le(8), x: 520, y: 1160, z: 1.25 },
    { at: ls(9), x: 480, y: 1250, z: 1.35 },
    { at: le(9), x: 520, y: 1300, z: 1.3 },
    { at: ls(10), x: 560, y: 1500, z: 2.8 }, // sweat on the planks
    { at: le(10), x: 560, y: 1500, z: 2.8 },
    { at: ls(11), x: 940, y: 1760, z: 1.9 }, // set D: the clapper on the post
    { at: le(11), x: 930, y: 1740, z: 1.7 },
    { at: ls(12), x: 460, y: 1060, z: 1.15 },
    { at: le(12), x: 480, y: 1070, z: 1.2 },
    { at: ls(13), x: 520, y: 1170, z: 1.5 },
    { at: le(13), x: 500, y: 1180, z: 1.6 },
    { at: ls(14), x: 560, y: 1230, z: 1.15 }, // set E: afternoon
    { at: le(14), x: 600, y: 1330, z: 1.05 },
    { at: ls(15), x: 600, y: 1260, z: 1.0 },
    { at: le(15) + 30, x: 590, y: 1230, z: 1.1 },
  ];
  const cam: Cam = camAt(g, keys);

  const setA = g < ls(3) - 8;
  const setB = g >= ls(3) - 8 && g < ls(8) - 6;
  const setC = g >= ls(8) - 6 && g < ls(11) - 6;
  const setD = g >= ls(11) - 6 && g < ls(14) - 6;
  const setE = g >= ls(14) - 6;
  // dips to black only between different sets
  const black = 1 - Math.max(dipOf(g, -999, ls(3) - 6), dipOf(g, ls(3) - 6, ls(8) - 6), dipOf(g, ls(8) - 6, ls(11) - 6), dipOf(g, ls(11) - 6, ls(14) - 6), dipOf(g, ls(14) - 6, 99999));

  // ---------------------------------------------------------------- the cast, by set
  let you = { x: 800, y: 1300, yaw: -25, s: 0.95, mood: "worry" as TravellerMood, walk: 0, shadowK: 1, skew: -55, sq: 0.34 };
  const people: Who[] = [];

  if (setA) you = { ...you, x: 790, y: 1310, s: 1.0 };
  if (setB) {
    const waving = g >= ls(5) && g < le(5);
    const wave = waving ? Math.max(0, Math.sin((g - ls(5)) / 5)) * 0.9 : 0;
    const pose = (id: string, x: number, y: number, s: number, m: Mood): Who => ({ id, x, y, s, mood: m, up: wave });
    if (g >= ls(4) - 8 && g < ls(5) - 4) {
      people.push({ id: "child", x: 190, y: 1190, s: 0.9, mood: "smile", walk: 1 });
    } else if (g >= ls(5) - 4) {
      people.push(pose("oldman", 480, 1090, 0.5, "smile"), pose("cook", 250, 1100, 0.52, "smile"), pose("head", 370, 1180, 0.68, "smile"), pose("mother", 585, 1190, 0.66, "smile"), pose("child", 140, 1200, 0.9, "smile"));
    }
    if (g >= ls(7)) {
      // the head looks down at your feet, then back up with the same smile
      const idx = people.findIndex((p) => p.id === "head");
      if (idx >= 0) people[idx] = { ...people[idx], mood: g > ls(7) + 20 ? "smile" : "calm", nod: clamp01((g - ls(7) + 6) / 14) };
    }
  }
  const clothX = lerp(300, 600, smooth(clamp01((g - ls(9)) / Math.max(1, le(9) - ls(9) - 20))));
  if (setC) {
    you = { ...you, yaw: 270, x: lerp(820, 470, smooth(clamp01((g - ls(8)) / (le(9) - ls(8))))), y: 1320, s: 0.9, walk: 1 };
    people.push(
      { id: "head", x: you.x - 160, y: 1290, s: 0.72, mood: "smile", face: -1, walk: 1 },
      { id: "mother", x: g >= ls(9) ? clothX : 300, y: 1230, s: 0.66, mood: "calm", walk: g >= ls(9) && g < le(9) ? 1 : 0 },
      { id: "cook", x: 140, y: 1130, s: 0.52, mood: "calm" },
      { id: "oldman", x: 700, y: 1110, s: 0.5, mood: "calm" },
    );
  }
  if (setD) {
    const down = g >= ls(12) && g < ls(12) + 40 ? clamp01((g - ls(12)) / 10) : g >= ls(12) + 40 && g < ls(13) ? clamp01(1 - (g - ls(12) - 40) / 12) : 0;
    const m: Mood = g >= ls(12) + 46 ? "smile" : "calm";
    const toHat = g >= ls(13) ? smooth(clamp01((g - ls(13)) / 40)) : 0;
    you = { ...you, x: lerp(800, 450, toHat), y: lerp(1300, 1190, toHat), yaw: 270, shadowK: lerp(1, 0.12, toHat), sq: lerp(0.34, 0.2, toHat) };
    people.push(
      { id: "head", x: 380, y: 1180, s: 0.68, mood: m, nod: down },
      { id: "mother", x: 585, y: 1190, s: 0.66, mood: m, nod: down },
      { id: "oldman", x: 480, y: 1090, s: 0.5, mood: m, nod: down },
      { id: "cook", x: 250, y: 1100, s: 0.52, mood: m, nod: down },
      { id: "child", x: 140, y: 1200, s: 0.9, mood: m, nod: down },
    );
  }
  if (setE) {
    const stretch = smooth(clamp01((g - ls(14)) / (le(14) - ls(14) + 40)));
    you = { ...you, x: 780, y: 1300, yaw: -20, shadowK: lerp(1, 2.1, stretch), skew: lerp(-55, -72, stretch), sq: lerp(0.34, 0.42, stretch) };
    const m: Mood = g >= ls(15) ? "stare" : "smile";
    people.push(
      { id: "oldman", x: 480, y: 1090, s: 0.5, mood: m },
      { id: "cook", x: 250, y: 1100, s: 0.52, mood: m },
      { id: "head", x: 370, y: 1180, s: 0.68, mood: m },
      { id: "mother", x: 585, y: 1190, s: 0.66, mood: m },
      { id: "child", x: 140, y: 1200, s: 0.9, mood: m },
    );
  }

  const boatX = lerp(460, 1260, smooth(clamp01((g - ls(2) + 40) / (le(2) - ls(2) + 80))));
  const clapHit = g >= C.clapAt && g < C.clapAt + 5 ? 1 : 0;
  const flash = g >= C.clapAt && g < C.clapAt + 6 ? 0.5 * (1 - (g - C.clapAt) / 6) : 0;
  const sweatT = clamp01((g - ls(10) - 10) / 26);

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
        <WorldCam cam={cam}>
          <image href={staticFile("shadow1/bg_asia.png")} x={0} y={0} width={1080} height={1250} />
          <rect y={0} width={1080} height={1250} fill="url(#p1-fade)" />
          {setA && <Boat x={boatX} y={920} />}
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
            {/* the stilt house's shadow lies across the walkway in set C: nobody steps into it */}
            {setC && <polygon points="260,1360 620,1360 700,1560 150,1560" fill={SHADOW} opacity={0.6} />}
            {setC && g >= ls(9) && g < le(9) && <rect x={clothX + 30} y={1150} width={46} height={60} fill="#e9dcc0" stroke={INK} strokeWidth={4} />}
            {[...people].sort((a, b) => a.y - b.y).map((p, i) => <Villager key={p.id + i} {...p} t={t} />)}
            <Shade x={you.x} y={you.y} k={you.s * you.shadowK} skew={you.skew} sq={you.sq}><Traveller yaw={you.yaw} silhouette walk={you.walk} phase={t * 0.25} /></Shade>
            <g transform={`translate(${you.x},${you.y}) scale(${you.s})`}><Traveller yaw={you.yaw} mood={you.mood} walk={you.walk} phase={t * 0.25} t={t} /></g>
            {g >= ls(10) && g <= le(10) && (
              <g transform="translate(560,1500)">
                {sweatT >= 0.8 && <ellipse cx={0} cy={0} rx={30 + sweatT * 40} ry={8 + sweatT * 10} fill="#2a1d10" opacity={0.6} />}
                {sweatT < 0.8 && <path d={`M0 ${-120 + sweatT * 140} q-10 18 0 26 q10 -8 0 -26 Z`} fill="#9cd0f2" stroke={INK} strokeWidth={2.5} />}
              </g>
            )}
          </g>
        </WorldCam>
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
    </AbsoluteFill>
  );
};

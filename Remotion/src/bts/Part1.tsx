import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import manifest from "./manifest.json";
import { fontFamily } from "../island/fonts";
import { PASSENGER_IDS, PassengerId } from "./cast";
import { Passenger } from "./Passenger";
import { FLOOR_Y, TrainInterior } from "./TrainInterior";
import { PART1_MARKERS, TrainMap } from "./TrainMap";
import { Countdown } from "./Countdown";
import { StationBoard } from "./StationBoard";
import { ZombieFace } from "./ZombieFace";
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
const PHASE_SPEED = 0.22;
const ZOMBIE_FACE_FRAMES = 55;
const BITE_FLASH = 12;
const TAG_FRAMES = 28;

// ---------------- the train: the city slides past once the doors have closed ----------------
const scrollArr: number[] = [];
{
  let s = 0;
  for (let g = 0; g <= total; g++) {
    scrollArr.push(s);
    s += g < c.doorsClose + 20 ? 0 : Math.min(14, (g - c.doorsClose - 20) * 0.2);
  }
}
const doorsAt = (g: number) => (g < c.doorsClose - 5 ? 1 : 1 - ramp(g, c.doorsClose - 5, c.doorsClose + 15));
const lightsAt = (g: number) => {
  if (g >= c.announceStart && g < le(8)) return 0.55 + 0.1 * Math.sin(g * 0.4);
  if (g >= le(8)) return 0.78;
  return 1;
};

// ---------------- the passengers: position, pose, infection, all derived from cues ----------------
type Pp = { id: PassengerId; x: number; y: number; facing: 1 | -1; pose: "stand" | "sit" | "hold" | "shamble" | "fall"; walk: number; infection: number; fear: number; headTilt: number; label: boolean };

// name tags appear one at a time: the introductions start with line 1, the schoolboy's when "you" reach him
const TAGS: { id: PassengerId; t: number }[] = [
  { id: "you", t: ls(1) },
  { id: "nun", t: ls(1) + TAG_FRAMES },
  { id: "mike", t: ls(1) + 2 * TAG_FRAMES },
  { id: "aunt", t: ls(1) + 3 * TAG_FRAMES },
  { id: "uncle", t: ls(1) + 4 * TAG_FRAMES },
  { id: "nueng", t: c.retreatStart + 100 },
];

const FLEE_END = 2100;
// zombies are slow (0.25 to 0.5 px per frame) and stay well short of "you" until the retreat
const SLOW_UNTIL = c.retreatStart - 24;
const manX = (g: number) => 330 + 0.25 * Math.max(0, Math.min(g, c.womanRises) - (c.manTurns + 147)) + 0.4 * Math.max(0, Math.min(g, SLOW_UNTIL) - c.womanRises) + 0.45 * Math.max(0, g - SLOW_UNTIL);
const womanX = (g: number) => 470 + 0.4 * Math.max(0, Math.min(g, SLOW_UNTIL) - c.womanRises) + 0.5 * Math.max(0, g - SLOW_UNTIL);

const staging = (g: number): Pp[] => {
  const retreat = ramp(g, c.retreatStart, c.retreatStart + 95);
  const panic = ramp(g, ls(5), ls(5) + 40);
  const out: Pp[] = [];
  const add = (p: Omit<Pp, "label" | "walk" | "infection" | "fear" | "headTilt" | "facing" | "pose"> & Partial<Pp>) => {
    const tag = TAGS.find((t) => t.id === p.id);
    out.push({ facing: 1, pose: "stand", walk: 0, infection: 0, fear: 0, headTilt: 0, ...p, label: !!tag && g >= tag.t && g < tag.t + TAG_FRAMES } as Pp);
  };

  // "you": hold the pole, then back away to the end of the car
  add({ id: "you", x: lerp(800, 1500, retreat), y: FLOOR_Y + 40, facing: g >= le(6) ? -1 : 1, pose: retreat > 0 && retreat < 1 ? "stand" : g < c.retreatStart ? "hold" : "stand", walk: retreat > 0 && retreat < 1 ? 1 : 0, fear: panic * 0.5 });
  // the schoolboy sits alone at the far end, trembling, then you pull him behind you
  const nuengBehind = ramp(g, ls(7), ls(7) + 40);
  add({ id: "nueng", x: lerp(1630, 1580, nuengBehind), y: FLOOR_Y + 20, facing: -1, pose: g < ls(7) ? "sit" : "stand", fear: Math.max(panic * 0.6, ramp(g, c.retreatStart, c.retreatStart + 60)) });
  // the others flee through the open walkway toward car 4
  const flee = (id: PassengerId, x0: number, y: number, t0: number, pose: Pp["pose"], stopX = FLEE_END) => {
    const t = ramp(g, t0, t0 + 150);
    add({ id, x: lerp(x0, stopX, t), y, facing: t > 0 ? 1 : -1, pose: t > 0 && t < 1 ? "stand" : pose, walk: t > 0 && t < 1 ? 1 : 0, fear: panic });
  };
  flee("nun", 1180, FLOOR_Y + 55, ls(5) + 30, "hold", 1700);
  flee("mike", 1010, FLOOR_Y + 30, ls(5) + 12, "stand");
  flee("aunt", 1100, FLOOR_Y + 20, ls(5) + 22, "sit");
  flee("uncle", 900, FLOOR_Y + 45, ls(5) + 6, "stand");

  // the man by the doors turns, then bites the woman and starts shambling toward the others
  const manInf = ramp(g, c.manTurns, c.manTurns + 147);
  const manShamble = g >= c.manTurns + 147;
  const shake = !manShamble ? Math.sin(g * 2.7) * 3 * ramp(g, c.manTurns, c.manTurns + 60) : 0;
  add({ id: "man1", x: manX(g) + shake, y: FLOOR_Y + 40, pose: manShamble ? "shamble" : "stand", walk: manShamble ? 1 : 0, infection: manInf, headTilt: manInf * 12 });
  // the bitten woman: fear, sits, the clock runs, she rises as a zombie
  const womanInf = ramp(g, c.countdownStart, c.womanRises);
  const risen = g >= c.womanRises;
  add({ id: "woman1", x: risen ? womanX(g) : 470, y: FLOOR_Y + 55, facing: risen ? 1 : -1, pose: risen ? "shamble" : g < c.biteAt + 12 ? "stand" : "sit", walk: risen ? 1 : 0, infection: risen ? 1 : womanInf, fear: g >= c.biteAt && !risen ? 0.8 : 0, headTilt: g >= c.biteAt && !risen ? -8 + womanInf * 14 : 0 });
  return out.sort((a, b) => a.y - b.y);
};

// ---------------- effects drawn in world coordinates ----------------
const ReachingHand: React.FC<{ g: number }> = ({ g }) => {
  if (g < c.doorsClose - 23 || g > c.doorsClose + 14) return null;
  const reach = Math.max(ramp(g, c.doorsClose - 23, c.doorsClose - 4) * (1 - ramp(g, c.doorsClose - 2, c.doorsClose + 12)), 0);
  const x = lerp(60, 330, reach);
  return (
    <g fill="#141414" opacity={0.92}>
      <rect x={-200} y={1048} width={x + 200} height={40} rx={20} />
      <ellipse cx={x + 6} cy={1068} rx={30} ry={24} />
      {[-18, -6, 6, 18].map((fy, i) => <rect key={i} x={x + 14} y={1066 + fy - 5} width={34} height={10} rx={5} />)}
    </g>
  );
};

const ZombieHand: React.FC<{ g: number }> = ({ g }) => {
  const a = c.doorsClose + 40;
  if (g < a || g > a + 34) return null;
  const t = ramp(g, a, a + 6) * (1 - ramp(g, a + 24, a + 34));
  return (
    <g transform={`translate(420,1040) scale(${1 + 0.05 * (g - a) / 10})`} opacity={t}>
      <ellipse cx={0} cy={30} rx={70} ry={20} fill="#a9b996" opacity={0.35} />
      <ellipse cx={0} cy={0} rx={46} ry={56} fill="#a9b996" stroke="#5a6a50" strokeWidth={4} />
      {[-34, -17, 0, 17, 34].map((fx, i) => <rect key={i} x={fx - 7} y={-110 + Math.abs(fx) * 0.7} width={14} height={64} rx={7} fill="#a9b996" stroke="#5a6a50" strokeWidth={3} />)}
      <path d="M-30 50 q10 20 30 22 q20 -2 30 -22" stroke="#7d8c6e" strokeWidth={6} fill="none" />
    </g>
  );
};

const BiteMark: React.FC<{ g: number }> = ({ g }) => {
  if (g < c.biteAt + 8 || g >= c.womanRises) return null;
  const a = clamp01((g - c.biteAt - 8) / 20);
  return <ellipse cx={463} cy={1112} rx={9} ry={7} fill="#a83a34" opacity={a * 0.9} />;
};

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

const Speaker: React.FC<{ g: number }> = ({ g }) => {
  const pulse = 0.5 + 0.5 * Math.sin(g * 0.5);
  return (
    <svg width={220} height={220} viewBox="0 0 220 220">
      <rect x={4} y={4} width={212} height={212} rx={40} fill="#0b0d10" opacity={0.78} />
      <path d="M50 90 h30 l40 -34 v108 l-40 -34 h-30 Z" fill="#f1f1f1" />
      {[0, 1, 2].map((i) => <path key={i} d={`M${136 + i * 20} ${80 - i * 8} q${18 + i * 6} ${30 + i * 8} 0 ${60 + i * 16}`} stroke="#ffd86b" strokeWidth={9} strokeLinecap="round" fill="none" opacity={0.35 + 0.65 * Math.max(0, Math.sin(g * 0.5 - i))} />)}
      <text x={110} y={198} textAnchor="middle" fontFamily={fontFamily} fontSize={28} fill="#ffd86b" opacity={0.6 + 0.4 * pulse}>ตามสาย</text>
    </svg>
  );
};

/** The cab door at the front of the train: the driver (healthy; he is bitten in Part 2) stands in the doorway as the door slides open. */
const CabInsert: React.FC<{ g: number }> = ({ g }) => {
  const open = ramp(g, c.cabOpens, c.cabOpens + 34);
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
      <defs>
        <linearGradient id="cab-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a2129" />
          <stop offset="1" stopColor="#0b0e12" />
        </linearGradient>
        <radialGradient id="cab-glow" cx="0.5" cy="0.4" r="0.6">
          <stop offset="0" stopColor="#ff6a3a" stopOpacity={0.5} />
          <stop offset="1" stopColor="#ff6a3a" stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill="url(#cab-bg)" />
      <rect x={230} y={330} width={620} height={1130} rx={18} fill="#222a31" stroke="#7b848b" strokeWidth={10} />
      <rect x={250} y={350} width={580} height={1090} fill="#10161b" />
      <rect x={250} y={350} width={580} height={1090} fill="url(#cab-glow)" />
      {[0, 1, 2, 3].map((i) => <rect key={i} x={300 + i * 120} y={430} width={70} height={46} rx={8} fill={i === 1 ? "#d9534f" : "#2f8f4e"} opacity={0.8} />)}
      <Passenger id="driver" x={540} y={1440} scale={2.2} facing={1} phase={0} walk={0} frame={g} infection={0} pose="stand" headTilt={0} />
      <g transform={`translate(${-open * 300},0)`}>
        <rect x={250} y={350} width={300} height={1090} fill="#59626b" stroke="#2a2f33" strokeWidth={8} />
        <rect x={300} y={420} width={200} height={300} fill="#a8c0d0" opacity={0.5} />
      </g>
      <g transform={`translate(${open * 300},0)`}>
        <rect x={550} y={350} width={300} height={1090} fill="#59626b" stroke="#2a2f33" strokeWidth={8} />
        <rect x={600} y={420} width={200} height={300} fill="#a8c0d0" opacity={0.5} />
      </g>
      <rect x={380} y={250} width={320} height={64} rx={14} fill="#0b0d10" opacity={0.85} />
      <text x={540} y={296} textAnchor="middle" fontFamily={fontFamily} fontSize={40} fill="#f1f1f1">ห้องคนขับ</text>
    </svg>
  );
};

const BiteSilhouette: React.FC<{ g: number }> = ({ g }) => {
  const a = Math.min(1, ramp(g, c.biteAt - 3, c.biteAt) * (1 - ramp(g, c.biteAt + 4, c.biteAt + BITE_FLASH)));
  if (a <= 0) return null;
  return (
    <AbsoluteFill style={{ opacity: a }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 42%, #f4f1e6 0%, #bdb7a4 38%, #0b0c0e 80%)" }} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <g fill="#070707">
          <ellipse cx={470} cy={760} rx={92} ry={100} />
          <path d="M300 1100 Q310 880 470 860 Q640 880 650 1100 Z" />
          <ellipse cx={620} cy={800} rx={82} ry={90} transform="rotate(24 620 800)" />
          <path d="M470 1100 Q500 900 640 890 Q770 910 790 1100 Z" />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

const World: React.FC = () => {
  const g = useCurrentFrame();
  const cam = cameraAt(g);
  const scroll = scrollArr[Math.min(g, total)];
  const people = staging(g);
  const inHook = g < c.hookCut;
  const boardX = 1500 - (g - c.stationPass) * 28;
  const showBoard = g >= c.stationPass && g < c.stationPass + 80;
  const hookFlash = Math.max(0, 1 - Math.abs(g - (c.doorsClose + 42)) / 3) * 0.6;
  const fade = ramp(g, 0, 10);

  const mapOn = g >= c.mapIn && g < c.mapOut;
  const mapProgress = clamp01((g - c.mapIn) / 110);
  const mapOpacity = clamp01((c.mapOut - g) / 14);
  const cdOn = g >= c.countdownStart && g < c.womanRises + 24;
  const seconds = 60 * (1 - ramp(g, c.countdownStart, c.womanRises));
  const faceOn = g >= c.womanRises && g < c.womanRises + ZOMBIE_FACE_FRAMES + 5;
  const cabOn = g >= c.cabOpens - 24 && g < outroStart;

  return (
    <AbsoluteFill style={{ backgroundColor: "#000", opacity: fade }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
        <g transform={`translate(${ANCHOR.x},${ANCHOR.y}) rotate(${cam.rot}) scale(${cam.zoom}) translate(${-cam.fx},${-cam.fy})`}>
          <TrainInterior frame={g} scroll={scroll} doors={doorsAt(g)} lights={lightsAt(g)} station={g < c.stationPass ? "สยาม" : "ชิดลม"} carNumber={3} windowChildren={showBoard ? <StationBoard x={boardX} name="ชิดลม" /> : null} />
          {people.map((p) => (
            <Passenger key={p.id} id={p.id} x={p.x} y={p.y} scale={1.7} facing={p.facing} phase={g * PHASE_SPEED + (PASSENGER_IDS.indexOf(p.id)) * 0.9} walk={p.walk} frame={g} infection={p.infection} pose={p.pose} headTilt={p.headTilt} label={p.label} fear={p.fear} />
          ))}
          <BiteMark g={g} />
          {inHook && <ReachingHand g={g} />}
          {inHook && <ZombieHand g={g} />}
        </g>
      </svg>

      <BiteSilhouette g={g} />
      {faceOn && (
        <AbsoluteFill style={{ opacity: ramp(g, c.womanRises, c.womanRises + 5) * clamp01((c.womanRises + ZOMBIE_FACE_FRAMES + 5 - g) / 5) }}>
          <ZombieFace frame={g} t={clamp01((g - c.womanRises) / ZOMBIE_FACE_FRAMES)} />
        </AbsoluteFill>
      )}
      {cabOn && (
        <AbsoluteFill style={{ opacity: ramp(g, c.cabOpens - 24, c.cabOpens - 12) }}>
          <CabInsert g={g} />
        </AbsoluteFill>
      )}

      {cdOn && (
        <div style={{ position: "absolute", left: 90, top: 130, opacity: clamp01((g - c.countdownStart) / 8) * clamp01((c.womanRises + 24 - g) / 10) }}>
          <Countdown seconds={seconds} label="ถูกกัด" pulse={Math.max(0, Math.sin(g * 0.45))} />
        </div>
      )}
      {mapOn && (
        <div style={{ position: "absolute", left: 90, top: 130, transform: "scale(0.9)", transformOrigin: "top left", opacity: mapOpacity }}>
          <TrainMap progress={mapProgress} markers={PART1_MARKERS} />
        </div>
      )}
      {g >= c.announceStart && g < le(8) && (
        <div style={{ position: "absolute", left: 770, top: 150, opacity: ramp(g, c.announceStart, c.announceStart + 8) * clamp01((le(8) - g) / 10) }}>
          <Speaker g={g} />
        </div>
      )}

      {/* hook: flash and the series title */}
      <AbsoluteFill style={{ backgroundColor: "#eef4f2", opacity: hookFlash, mixBlendMode: "screen" }} />
      <Card g={g} from={Math.max(le(0), c.hookCut - 80)} to={c.hookCut} style={{ top: 300, left: 110, right: 200, fontSize: 56, lineHeight: 1.55, background: "rgba(11,13,16,0.66)", borderRadius: 32, padding: "26px 20px" }}>
        จะเกิดอะไรขึ้น<br />ถ้าคุณอยู่บน BTS<br />ที่มีซอมบี้
      </Card>

      {/* lighting and grade: vignette, cool-top warm-bottom split tone, film grain */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 42%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.5) 100%)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(120,150,170,0.16) 0%, rgba(0,0,0,0) 45%, rgba(190,150,110,0.14) 100%)", mixBlendMode: "soft-light" }} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: 0.08, mixBlendMode: "overlay", pointerEvents: "none" }}>
        <filter id="bts-grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={g % 7} /><feColorMatrix type="saturate" values="0" /></filter>
        <rect width={W} height={H} filter="url(#bts-grain)" />
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
        <div style={{ fontSize: 46, opacity: clamp01(t / 14), lineHeight: 1.6, color: "#aeb4b6" }}>ตอนต่อไป: คนขับกลับเข้าห้องไปแล้ว...</div>
        <div style={{ fontSize: 58, opacity: clamp01((t - 26) / 14), lineHeight: 1.5, marginTop: 12 }}>แต่เขาไม่ได้บอกอะไรเลย</div>
        <div style={{ fontSize: 56, opacity: clamp01((t - 76) / 14), marginTop: 70, color: "#ffd86b" }}>ติดตามตอนที่ 2</div>
      </div>
    </AbsoluteFill>
  );
};

export const Part1: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <World />
    {shots.map((shot, i) => (
      <Sequence key={i} from={starts[i] + shot.leadFrames} durationInFrames={shot.audioFrames}>
        <Audio src={staticFile(shot.audio)} />
        <Subtitle text={shot.text} />
      </Sequence>
    ))}
    <Audio src={staticFile("bts1/bed.wav")} volume={0.5} />
  </AbsoluteFill>
);

export const PART1_TOTAL = total;

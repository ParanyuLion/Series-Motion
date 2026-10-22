import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import manifest from "./manifest.json";
import { fontFamily } from "../island/fonts";
import { PASSENGER_IDS, PASSENGERS, PassengerId } from "../bts/cast";
import { Passenger } from "../bts/Passenger";
import { FLOOR_Y, TrainInterior } from "../bts/TrainInterior";
import { Countdown } from "../bts/Countdown";
import { StationBoard } from "../bts/StationBoard";
import { ZombieFace } from "../bts/ZombieFace";
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
const TAG_FRAMES = 34;
const CAB_INSERT_FRAMES = 36;

// ---------------- the train keeps moving the whole part; it speeds up a little as the station flashes past ----------------
const scrollArr: number[] = [];
{
  let s = 0;
  for (let g = 0; g <= total; g++) {
    scrollArr.push(s);
    s += 14 + 8 * ramp(g, c.stationPass - 20, c.stationPass + 20);
  }
}
const lightsAt = (g: number) => {
  if (g >= c.silenceAt && g < le(8)) return 0.55 + 0.12 * Math.sin(g * 0.4); // the lights flicker while the speaker stays silent
  if (g >= c.uncleRises) return 0.8;
  return 1;
};

// ---------------- the cast: position, pose, infection, all derived from cues ----------------
type Pp = { id: PassengerId; x: number; y: number; facing: 1 | -1; pose: "stand" | "sit" | "hold" | "shamble" | "fall"; walk: number; infection: number; fear: number; headTilt: number; label: boolean };

// one name tag at a time
const TAGS: { id: PassengerId; t: number }[] = [
  { id: "driver", t: c.driverEnters + 40 },
  { id: "uncle", t: c.unclePale + 20 },
];

// where everybody is at the start: the survivors huddle at the rear of the car, the two Part 1 zombies shamble toward the noise
const SURVIVOR_X = { uncle: 1230, nun: 1330, you: 1430, nueng: 1530, mike: 1620, aunt: 1700 };
const DRIVER_START = 100; // just outside the left edge of the first shot
const DRIVER_STOP = 520;
const MAN0 = 760;
const WOMAN0 = 880;
const BITE_TURN = c.biteAt + 10;

// zombies are slow: 0.5 px per frame toward the driver, then 0.25 px per frame toward the group, never touching it
const manX = (g: number) => MAN0 - 0.5 * Math.max(0, Math.min(g, BITE_TURN) - c.hookCut) + 0.25 * Math.max(0, g - BITE_TURN);
const womanX = (g: number) => WOMAN0 - 0.45 * Math.max(0, Math.min(g, BITE_TURN) - c.hookCut) + 0.25 * Math.max(0, g - BITE_TURN);
const driverX = (g: number) => {
  if (g < c.biteAt + 25) return lerp(DRIVER_START, DRIVER_STOP, ramp(g, c.driverEnters, c.zombiesApproach)) - 15 * ramp(g, c.zombiesApproach + 40, c.biteAt);
  return lerp(DRIVER_STOP - 15, -250, ramp(g, c.biteAt + 25, c.cabCloses + CAB_INSERT_FRAMES));
};

const staging = (g: number): Pp[] => {
  const out: Pp[] = [];
  const add = (p: Omit<Pp, "label" | "walk" | "infection" | "fear" | "headTilt" | "facing" | "pose"> & Partial<Pp>) => {
    const tag = TAGS.find((t) => t.id === p.id);
    out.push({ facing: 1, pose: "stand", walk: 0, infection: 0, fear: 0, headTilt: 0, ...p, label: !!tag && g >= tag.t && g < tag.t + TAG_FRAMES } as Pp);
  };
  const shake = (amp: number) => Math.sin(g * 0.9) * amp;
  const doubt = ramp(g, c.youShout, c.youShout + 20) * (1 - ramp(g, c.youShout + 100, c.youShout + 125)); // others shake their heads at "you"
  const flee = ramp(g, c.uncleRises, c.uncleRises + 150);

  // the driver: walks in, hands up, is bitten, hurries back to the cab
  const dx = driverX(g);
  const walking = (g >= c.driverEnters && g < c.zombiesApproach) || g >= c.biteAt + 25;
  const back = g >= c.biteAt + 25;
  add({ id: "driver", x: dx, y: FLOOR_Y + 40, facing: back ? -1 : 1, pose: "stand", walk: walking ? 1 : 0, fear: back ? 0.15 : 0.45, infection: ramp(g, c.biteAt, c.cabCloses) * 0.3 });

  // the two zombies from Part 1: toward the driver, then back toward the group
  const turned = g >= BITE_TURN;
  add({ id: "man1", x: manX(g), y: FLOOR_Y + 40, facing: turned ? 1 : -1, pose: "shamble", walk: 1, infection: 1, headTilt: 12 });
  add({ id: "woman1", x: womanX(g), y: FLOOR_Y + 55, facing: turned ? 1 : -1, pose: "shamble", walk: 1, infection: 1, headTilt: 12 });

  // the survivors
  const youX = lerp(SURVIVOR_X.you, 1760, ramp(g, c.uncleRises + 30, c.uncleRises + 150));
  const youFear = Math.max(0.25, 0.7 * ramp(g, c.youSee, c.youSee + 30), ramp(g, c.uncleRises - 60, c.uncleRises));
  const youMoving = g >= c.uncleRises + 30 && g < c.uncleRises + 150;
  add({ id: "you", x: youX, y: FLOOR_Y + 40, facing: g < c.uncleRises + 30 ? -1 : 1, pose: "stand", walk: youMoving ? 1 : 0, fear: youFear });
  add({ id: "nueng", x: lerp(SURVIVOR_X.nueng, 1930, ramp(g, c.uncleRises + 25, c.uncleRises + 175)), y: FLOOR_Y + 20, facing: 1, pose: g < c.uncleRises + 25 ? "sit" : "stand", walk: g >= c.uncleRises + 25 && g < c.uncleRises + 175 ? 1 : 0, fear: 0.7 + 0.3 * flee, headTilt: g < c.uncleRises ? shake(3) : 0 });
  add({ id: "nun", x: lerp(SURVIVOR_X.nun, 1850, ramp(g, c.uncleRises + 10, c.uncleRises + 140)), y: FLOOR_Y + 55, facing: 1, pose: "stand", walk: g >= c.uncleRises + 10 && g < c.uncleRises + 140 ? 1 : 0, fear: 0.3 + 0.6 * flee, headTilt: doubt * Math.sin(g * 0.5) * 9 });
  add({ id: "mike", x: lerp(SURVIVOR_X.mike, 2100, ramp(g, c.uncleRises, c.uncleRises + 140)), y: FLOOR_Y + 30, facing: 1, pose: "stand", walk: g >= c.uncleRises && g < c.uncleRises + 140 ? 1 : 0, fear: 0.2 + 0.7 * flee, headTilt: doubt * Math.sin(g * 0.5 + 1) * 9 });
  add({ id: "aunt", x: lerp(SURVIVOR_X.aunt, 2100, ramp(g, c.uncleRises + 15, c.uncleRises + 155)), y: FLOOR_Y + 20, facing: 1, pose: g < c.uncleRises + 15 ? "sit" : "stand", walk: g >= c.uncleRises + 15 && g < c.uncleRises + 155 ? 1 : 0, fear: 0.3 + 0.6 * flee, headTilt: doubt * Math.sin(g * 0.5 + 2) * 9 });

  // ลุงประเสริฐ: pale and sweating on the bench while the driver's clock runs, then the third zombie
  const risen = g >= c.uncleRises;
  const uncleInf = risen ? 1 : ramp(g, c.unclePale, c.uncleRises);
  add({ id: "uncle", x: risen ? SURVIVOR_X.uncle + 0.4 * (g - c.uncleRises) : SURVIVOR_X.uncle, y: FLOOR_Y + 45, facing: risen ? 1 : -1, pose: risen ? "shamble" : "sit", walk: risen ? 1 : 0, infection: uncleInf, fear: risen ? 0 : 0.5 * ramp(g, c.unclePale, c.unclePale + 40), headTilt: risen ? 12 : uncleInf * 8 });
  return out.sort((a, b) => a.y - b.y);
};

// ---------------- the bite: a silhouette cut and a sound only ----------------
const BiteSilhouette: React.FC<{ g: number }> = ({ g }) => {
  const a = Math.min(1, ramp(g, c.biteAt - 3, c.biteAt) * (1 - ramp(g, c.biteAt + 4, c.biteAt + BITE_FLASH)));
  if (a <= 0) return null;
  return (
    <AbsoluteFill style={{ opacity: a }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 42%, #f4f1e6 0%, #bdb7a4 38%, #0b0c0e 80%)" }} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <g fill="#070707">
          <ellipse cx={470} cy={760} rx={92} ry={100} />
          <path d="M376 740 A94 94 0 0 1 564 740 Z" />
          <path d="M540 724 L640 746 L636 764 L540 750 Z" />
          <path d="M300 1100 Q310 880 470 860 Q640 880 650 1100 Z" />
          <ellipse cx={620} cy={800} rx={82} ry={90} transform="rotate(24 620 800)" />
          <path d="M470 1100 Q500 900 640 890 Q770 910 790 1100 Z" />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/** a small red mark on the driver's sleeve after the bite (no blood) */
const SleeveMark: React.FC<{ x: number; g: number }> = ({ x, g }) => {
  if (g < c.biteAt + 8 || g >= c.cabCloses + CAB_INSERT_FRAMES) return null;
  const a = clamp01((g - c.biteAt - 8) / 20);
  const back = g >= c.biteAt + 25;
  return <ellipse cx={x + (back ? 6 : -6)} cy={FLOOR_Y + 40 - 245} rx={9} ry={7} fill="#a83a34" opacity={a * 0.9} />;
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

/** The cab door at the front of the train. `open` 0..1; the driver stands inside. Used for the hook and the closing insert. */
const CabDoor: React.FC<{ g: number; open: number; infection?: number; mark?: boolean; push: number }> = ({ g, open, infection = 0, mark = false, push }) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
    <defs>
      <linearGradient id="cab2-bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#1a2129" />
        <stop offset="1" stopColor="#0b0e12" />
      </linearGradient>
      <radialGradient id="cab2-glow" cx="0.5" cy="0.4" r="0.6">
        <stop offset="0" stopColor="#ff6a3a" stopOpacity={0.5} />
        <stop offset="1" stopColor="#ff6a3a" stopOpacity={0} />
      </radialGradient>
    </defs>
    <rect width={W} height={H} fill="url(#cab2-bg)" />
    <g transform={`translate(540,900) scale(${1 + 0.12 * push}) translate(-540,-900)`}>
      <rect x={230} y={330} width={620} height={1130} rx={18} fill="#222a31" stroke="#7b848b" strokeWidth={10} />
      <rect x={250} y={350} width={580} height={1090} fill="#10161b" />
      <rect x={250} y={350} width={580} height={1090} fill="url(#cab2-glow)" opacity={0.6 + 0.4 * Math.sin(g * 0.3)} />
      {[0, 1, 2, 3].map((i) => <rect key={i} x={300 + i * 120} y={430} width={70} height={46} rx={8} fill={i === 1 ? "#d9534f" : "#2f8f4e"} opacity={0.8} />)}
      <Passenger id="driver" x={540} y={1440} scale={2.2} facing={1} phase={0} walk={0} frame={g} infection={infection} pose="stand" headTilt={0} fear={mark ? 0.2 : 0} />
      {mark && <ellipse cx={534} cy={1440 - 317} rx={12} ry={9} fill="#a83a34" opacity={0.9} />}
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
    </g>
  </svg>
);

/** Front-facing close-up of "you": white shirt, green tie, wide eyes looking toward the driver, then shouting. */
const YouFace: React.FC<{ g: number }> = ({ g }) => {
  const k = PASSENGERS.you;
  const shout = ramp(g, c.youShout, c.youShout + 8);
  const t = ramp(g, c.youSee + 25, c.youShout + 60);
  const zoom = 1.02 + 0.1 * t;
  const sway = Math.sin(g * 0.11) * 1.4 + Math.sin(g * 0.7) * 0.5 * shout;
  const mouth = shout > 0 ? 14 + 16 * Math.abs(Math.sin(g * 0.45)) : 5;
  const look = lerp(-14, 0, shout);
  const blink = Math.max(0, 1 - Math.abs(((g % 70) - 30) / 3));
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
      <defs>
        <linearGradient id="yf-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4a5560" />
          <stop offset="1" stopColor="#12161a" />
        </linearGradient>
        <linearGradient id="yf-shade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0b0e12" stopOpacity={0} />
          <stop offset="0.35" stopColor="#0b0e12" stopOpacity={0.85} />
          <stop offset="1" stopColor="#0b0e12" stopOpacity={0.95} />
        </linearGradient>
        <radialGradient id="yf-glow" cx="0.5" cy="0.4" r="0.7">
          <stop offset="0" stopColor="#ffd9a0" stopOpacity={0.3} />
          <stop offset="1" stopColor="#ffd9a0" stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill="url(#yf-bg)" />
      <rect width={W} height={H} fill="url(#yf-glow)" />
      <g transform={`translate(540,800) scale(${zoom * 3.0}) rotate(${sway})`}>
        <path d="M-210 330 Q-190 200 -90 176 L90 176 Q190 200 210 330 Z" fill="#f4f4f0" />
        <path d="M-120 330 L-90 176 M120 330 L90 176" stroke="#2d3a52" strokeWidth={22} fill="none" />
        <path d="M-30 176 L0 200 L30 176 L0 290 Z" fill="#2f8f4e" />
        <rect x={-34} y={96} width={68} height={92} rx={26} fill={k.skin} />
        <ellipse cx={-96} cy={4} rx={13} ry={22} fill={k.skin} />
        <ellipse cx={96} cy={4} rx={13} ry={22} fill={k.skin} />
        <ellipse cx={0} cy={0} rx={92} ry={108} fill={k.skin} />
        <path d="M-94 -14 Q-100 -118 0 -120 Q100 -118 94 -14 Q74 -86 0 -88 Q-74 -86 -94 -14 Z" fill={k.hair} />
        <path d="M-62 -44 Q-44 -58 -26 -46 M26 -46 Q44 -58 62 -44" stroke="#1b1b1b" strokeWidth={6} fill="none" strokeLinecap="round" transform="translate(0,-12)" />
        {[-44, 44].map((ex, i) => (
          <g key={i} transform={`translate(${ex},-14)`}>
            <ellipse rx={25} ry={26 * (1 - blink * 0.9)} fill="#ffffff" stroke="#8a8a8a" strokeWidth={2} />
            <circle cx={look} cy={2} r={10} fill="#1b1b1b" />
            <circle cx={look + 3} cy={-2} r={3} fill="#fff" />
          </g>
        ))}
        <path d="M0 -4 Q-8 24 -6 34 Q0 38 8 34" stroke="#b98a68" strokeWidth={4} fill="none" strokeLinecap="round" />
        <ellipse cx={0} cy={66} rx={20 + mouth * 0.5} ry={mouth} fill="#5a2020" />
        <path d="M70 -40 q6 12 0 22" stroke="#9ad0ff" strokeWidth={5} fill="none" strokeLinecap="round" />
      </g>
      <rect y={1300} width={W} height={620} fill="url(#yf-shade)" />
    </svg>
  );
};

const World: React.FC = () => {
  const g = useCurrentFrame();
  const cam = cameraAt(g);
  const scroll = scrollArr[Math.min(g, total)];
  const people = staging(g);
  const boardX = 1850 - (g - c.stationPass) * 30;
  const showBoard = g >= c.stationPass - 5 && g < c.stationPass + 90;
  const fade = ramp(g, 0, 10);

  const hookOn = g < c.hookCut + 8;
  const cabInsertOn = g >= c.cabCloses && g < c.cabCloses + CAB_INSERT_FRAMES;
  const youFaceOn = g >= c.youSee + 25 && g < c.youShout + 60;
  const faceOn = g >= c.uncleRises && g < c.uncleRises + ZOMBIE_FACE_FRAMES + 5;
  const cdOn = g >= c.countdownStart && g < c.uncleRises + 24;
  const seconds = 60 * (1 - ramp(g, c.countdownStart, c.uncleRises));
  const dx = driverX(g);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000", opacity: fade }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
        <g transform={`translate(${ANCHOR.x},${ANCHOR.y}) rotate(${cam.rot}) scale(${cam.zoom}) translate(${-cam.fx},${-cam.fy})`}>
          <TrainInterior frame={g} scroll={scroll} doors={0} lights={lightsAt(g)} station={g < c.stationPass ? "ชิดลม" : "เพลินจิต"} carNumber={3} windowChildren={showBoard ? <StationBoard x={boardX} name="เพลินจิต" /> : null} />
          {people.map((p) => (
            <Passenger key={p.id} id={p.id} x={p.x} y={p.y} scale={1.7} facing={p.facing} phase={g * PHASE_SPEED + PASSENGER_IDS.indexOf(p.id) * 0.9} walk={p.walk} frame={g} infection={p.infection} pose={p.pose} headTilt={p.headTilt} label={p.label} fear={p.fear} />
          ))}
          <SleeveMark x={dx} g={g} />
        </g>
      </svg>

      <BiteSilhouette g={g} />
      {youFaceOn && (
        <AbsoluteFill style={{ opacity: ramp(g, c.youSee + 25, c.youSee + 32) * clamp01((c.youShout + 60 - g) / 8) }}>
          <YouFace g={g} />
        </AbsoluteFill>
      )}
      {faceOn && (
        <AbsoluteFill style={{ opacity: ramp(g, c.uncleRises, c.uncleRises + 5) * clamp01((c.uncleRises + ZOMBIE_FACE_FRAMES + 5 - g) / 5) }}>
          <ZombieFace id="uncle" frame={g} t={clamp01((g - c.uncleRises) / ZOMBIE_FACE_FRAMES)} />
        </AbsoluteFill>
      )}
      {hookOn && (
        <AbsoluteFill style={{ opacity: clamp01((c.hookCut + 8 - g) / 10) }}>
          <CabDoor g={g} open={ramp(g, 30, 72)} push={ramp(g, 0, c.hookCut)} />
        </AbsoluteFill>
      )}
      {cabInsertOn && (
        <AbsoluteFill style={{ opacity: ramp(g, c.cabCloses, c.cabCloses + 6) * clamp01((c.cabCloses + CAB_INSERT_FRAMES - g) / 6) }}>
          <CabDoor g={g} open={1 - ramp(g, c.cabCloses + 4, c.cabCloses + 28)} infection={0.3} mark push={ramp(g, c.cabCloses, c.cabCloses + CAB_INSERT_FRAMES)} />
        </AbsoluteFill>
      )}

      {cdOn && (
        <div style={{ position: "absolute", left: 90, top: 130, opacity: clamp01((g - c.countdownStart) / 8) * clamp01((c.uncleRises + 24 - g) / 10) }}>
          <Countdown seconds={seconds} label="คนขับ" pulse={Math.max(0, Math.sin(g * 0.45))} />
        </div>
      )}

      {/* hook: the series title card, on a dark plate, after the first line */}
      <Card g={g} from={Math.max(le(0), c.hookCut - 80)} to={c.hookCut} style={{ top: 300, left: 110, right: 200, fontSize: 56, lineHeight: 1.55, background: "rgba(11,13,16,0.66)", borderRadius: 32, padding: "26px 20px" }}>
        คนขับเดินออกมาดู...<br />แล้วถูกกัด
      </Card>

      {/* lighting and grade: vignette, cool-top warm-bottom split tone, film grain */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 42%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.5) 100%)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(120,150,170,0.16) 0%, rgba(0,0,0,0) 45%, rgba(190,150,110,0.14) 100%)", mixBlendMode: "soft-light" }} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: 0.08, mixBlendMode: "overlay", pointerEvents: "none" }}>
        <filter id="bts2-grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={g % 7} /><feColorMatrix type="saturate" values="0" /></filter>
        <rect width={W} height={H} filter="url(#bts2-grain)" />
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
        <div style={{ fontSize: 46, opacity: clamp01(t / 14), lineHeight: 1.6, color: "#aeb4b6" }}>ตอนต่อไป: รถไม่จอด...</div>
        <div style={{ fontSize: 58, opacity: clamp01((t - 26) / 14), lineHeight: 1.5, marginTop: 12 }}>และคนในตู้เริ่มแตกกัน</div>
        <div style={{ fontSize: 56, opacity: clamp01((t - 76) / 14), marginTop: 70, color: "#ffd86b" }}>ติดตามตอนที่ 3</div>
      </div>
    </AbsoluteFill>
  );
};

export const Part2: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <World />
    {shots.map((shot, i) => (
      <Sequence key={i} from={starts[i] + shot.leadFrames} durationInFrames={shot.audioFrames}>
        <Audio src={staticFile(shot.audio)} />
        <Subtitle text={shot.text} />
      </Sequence>
    ))}
    <Audio src={staticFile("bts2/bed.wav")} volume={0.5} />
  </AbsoluteFill>
);

export const PART2_TOTAL = total;

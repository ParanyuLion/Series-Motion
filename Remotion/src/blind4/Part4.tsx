import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import manifest from "./manifest.json";
import { fontFamily } from "../island/fonts";
import { PassengerId } from "../bts/cast";
import { Passenger } from "../bts/Passenger";
import { ANCHOR, Cam, makeCamera } from "../bts4/camera";
import { GROUND_Y, Village } from "../blind1/Village";
import { FaceHead, FaceWake, FaceYou } from "../blind1/Faces";
import { Flesh, MaskHead } from "../blind1/SnakePreview";
import { CrowdLayer, Forest } from "../blind3/Forest";
import { ChangeCard, EdgeShapes, MemoryFaces, MirrorCard, RoadCard, Room } from "./Pieces";

const { cues, shots, starts, total, outroStart } = manifest;
const c = cues as Record<string, number>;
const le = (i: number) => c[`lineEnd${i}`];
const W = 1080;
const H = 1920;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ramp = (g: number, a: number, b: number) => clamp01((g - a) / Math.max(1, b - a));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);
const FADE = 10;

// ---------------- the cast on stage ----------------
type Pp = { key: string; id: PassengerId; x: number; y: number; facing: 1 | -1; sit?: boolean; walk?: number; fear?: number; headTilt?: number; stick?: boolean; op?: number; flip?: number; still?: boolean };

const Cast: React.FC<{ g: number; list: Pp[] }> = ({ g, list }) => (
  <>
    {[...list].sort((a, b) => a.y - b.y).map((p, i) => {
      // while "you" must not blink the idle clock is held away from the blink window
      const frame = p.still ? 40 + ((g * 0.2) % 60) : g;
      return (
        <g key={p.key} opacity={p.op ?? 1} transform={p.flip ? `translate(${p.x},0) scale(${Math.cos(Math.PI * p.flip)},1) translate(${-p.x},0)` : undefined}>
          <Passenger id={p.id} x={p.x} y={p.y} scale={1.7} facing={p.facing} phase={g * 0.2 + i} walk={p.walk ?? 0} frame={frame} infection={0} pose={p.sit ? "sit" : "stand"} headTilt={p.headTilt ?? 0} label={false} fear={p.fear ?? 0} item={p.stick ? "stick" : null} swing={p.stick ? Math.asin(Math.max(-1, Math.min(1, (-85 - (-12 + 3 * Math.sin(g * 0.3))) / 60))) : undefined} swingAmp={p.stick ? 60 : undefined} />
        </g>
      );
    })}
  </>
);

// ====================================================================================================================
// stages (each box fades in and out over FADE frames, like the earlier parts)
// ====================================================================================================================
const EDGE = [0, c.homeAt - 160 + FADE]; // forest edge; the road card takes over at roadAt
const ROAD = [c.roadAt, c.homeAt + FADE];
const HOME = [c.homeAt, c.changeAt + FADE];
const EDGE2 = [c.villageEdgeAt, c.newAt + FADE];
const VIL = [c.newAt, c.lastAt + FADE];
const LAST = [c.lastAt, total];

// ---- the forest edge (hook, the head, his two sentences) ----
const youXE = (g: number) => (g < c.speakAt + 40 ? lerp(520, 1760, smooth(ramp(g, 0, c.edgeAt + 120))) : lerp(1760, 2700, smooth(ramp(g, c.speakAt + 40, c.roadAt + 6))));
const stageE = (g: number): Pp[] => [
  { key: "head", id: "bvHead", x: 2200, y: GROUND_Y + 20, facing: -1, stick: true, op: ramp(g, c.hookCut - 40, c.edgeAt + 6) },
  { key: "you", id: "bvYou", x: youXE(g), y: GROUND_Y + 120, facing: 1, walk: g < c.edgeAt + 120 || g > c.speakAt + 40 ? 0.55 : 0, fear: 0.2, still: true },
];
const camE = makeCamera("edge", [
  [0, 650, 1130, 1.3],
  [c.hookCut - 70, 1100, 1130, 1.3],
  [c.edgeAt, 1750, 1140, 1.25],
  [c.edgeAt + 90, 1900, 1150, 1.2],
  [c.smileAt - 30, 1950, 1150, 1.3],
  [c.roadAt - 20, 2150, 1150, 1.4],
  [EDGE[1], 2500, 1150, 1.4],
]);

// ---- the room ----
const NAME_TURN = c.nameAt + 75;
const stageHome = (g: number): Pp[] => {
  const tp = clamp01((g - NAME_TURN) / 12);
  const turning = tp > 0 && tp < 1;
  const toMirror = g < NAME_TURN + 12 ? 0 : 1;
  const jerk = g > c.bellAt + 30 ? 9 * ramp(g, c.bellAt + 40, c.bellAt + 52) + 2 * Math.sin(g * 0.4) * ramp(g, c.bellAt + 60, c.bellAt + 90) : 0;
  return [{ key: "you", id: "bvYou", x: 560, y: GROUND_Y + 40, facing: toMirror ? 1 : -1, flip: turning ? tp : 0, fear: 0.15, headTilt: jerk, still: g >= c.pupilAt - 40 }];
};
const camHome = makeCamera("home", [
  [HOME[0], 520, 1120, 1.15],
  [c.memoryAt, 540, 1120, 1.3],
  [c.mirrorAt - 20, 470, 1110, 1.5],
  [c.mirrorAt + 60, 400, 1050, 2.0],
  [c.patternAt, 420, 1060, 1.8],
  [c.nameAt - 10, 500, 1110, 1.4],
  [c.bellAt, 650, 1100, 1.35],
  [c.bellAt + 100, 700, 1090, 1.5],
  [HOME[1], 700, 1090, 1.55],
]);
const skyAt = (g: number) => {
  const dusk = ramp(g, c.bellAt - 40, c.bellAt + 20);
  const night = ramp(g, c.bellAt + 120, c.changeAt);
  if (night > 0) return night > 0.5 ? "#1a2238" : "#5a4430";
  if (dusk > 0) return dusk > 0.5 ? "#b2703a" : "#7f8c86";
  return "#8a9a96";
};

// ---- the village edge: two dim shapes among trunks ----
const camEdge2 = makeCamera("edge2", [
  [EDGE2[0], 3000, 1060, 1.15],
  [c.confessAt, 3000, 1000, 1.3],
  [EDGE2[1], 3000, 990, 1.4],
]);

// ---- the village and the new sleeper ----
const MAT_X = 2420;
const headXV = (g: number) => lerp(1750, 2260, smooth(ramp(g, c.newAt + 90, c.welcomeAt + 110)));
const stageV = (g: number): Pp[] => [
  { key: "man", id: "bvMan", x: MAT_X, y: GROUND_Y + 60, facing: -1, sit: true, op: ramp(g, c.newAt + 40, c.newAt + 70) },
  { key: "head", id: "bvHead", x: headXV(g), y: GROUND_Y + 30, facing: 1, stick: true, walk: g < c.welcomeAt + 110 ? 0.5 : 0, op: ramp(g, c.newAt + 70, c.newAt + 110) },
];
const camV = makeCamera("vil", [
  [VIL[0], 2050, 1150, 1.2],
  [c.welcomeAt, 2250, 1150, 1.45],
  [VIL[1], 2350, 1150, 1.55],
]);

// ---- the last picture ----
const camLast = makeCamera("last", [
  [LAST[0], 2000, 960, 1.0],
  [outroStart, 2000, 930, 1.18],
]);

// ---------------- screen-space pieces ----------------
const Stage: React.FC<{ cam: Cam; children: React.ReactNode }> = ({ cam, children }) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
    <g transform={`translate(${ANCHOR.x},${ANCHOR.y}) rotate(${cam.rot}) scale(${cam.zoom}) translate(${-cam.fx},${-cam.fy})`}>{children}</g>
  </svg>
);

const SceneBox: React.FC<{ g: number; from: number; to: number; first?: boolean; children: React.ReactNode }> = ({ g, from, to, first, children }) => {
  if (g < from || g > to) return null;
  const o = (first ? 1 : ramp(g, from, from + FADE)) * clamp01((to - g) / FADE);
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};

const Over: React.FC<{ g: number; from: number; to: number; children: React.ReactNode }> = ({ g, from, to, children }) => {
  if (g < from || g > to) return null;
  return <AbsoluteFill style={{ opacity: ramp(g, from, from + 8) * clamp01((to - g) / 8) }}>{children}</AbsoluteFill>;
};

const Subtitle: React.FC<{ text: string }> = ({ text }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: 60, right: 160, bottom: 340, textAlign: "center", opacity: clamp01(f / 6), fontFamily, fontSize: 52, lineHeight: 1.6, color: "#fff", textShadow: "0 0 12px rgba(0,0,0,0.95), 0 3px 6px rgba(0,0,0,0.95)" }}>
      {text}
    </div>
  );
};

const TitleCard: React.FC<{ g: number }> = ({ g }) => {
  const from = c.titleAt;
  const to = c.hookCut + 14;
  if (g < from || g > to) return null;
  const o = ramp(g, from, from + 10) * clamp01((to - g) / 10);
  return (
    <div style={{ position: "absolute", left: 140, right: 190, top: 330, textAlign: "center", fontFamily, color: "#fff", opacity: o, background: "rgba(11,13,10,0.7)", borderRadius: 32, padding: "26px 16px", textShadow: "0 2px 12px rgba(0,0,0,0.95)" }}>
      <div style={{ fontSize: 34, color: "#cdbb7a", letterSpacing: 2 }}>หมู่บ้านที่ทุกคนตาบอด · ตอนที่ 4 (ตอนจบ)</div>
      <div style={{ fontSize: 66, lineHeight: 1.45, marginTop: 10 }}>ทางกลับบ้าน</div>
    </div>
  );
};

const Outro: React.FC<{ g: number }> = ({ g }) => {
  const t = g - outroStart;
  const bg = clamp01((g - (outroStart - 14)) / 14);
  return (
    <AbsoluteFill style={{ opacity: bg }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, #232a1c 0%, #080a06 70%)" }} />
      <div style={{ position: "absolute", left: 80, right: 160, top: 560, textAlign: "center", fontFamily, color: "#f1f1f1" }}>
        <div style={{ fontSize: 58, opacity: clamp01(t / 14), lineHeight: 1.6 }}>จบแล้ว...</div>
        <div style={{ fontSize: 52, opacity: clamp01((t - 30) / 14), lineHeight: 1.6, marginTop: 10, color: "#aeb4a0" }}>แต่ยังมีคนใหม่มาเรื่อยๆ</div>
        <div style={{ fontSize: 54, opacity: clamp01((t - 80) / 14), marginTop: 70, color: "#e0c46a" }}>ขอบคุณที่ดูจนจบ</div>
      </div>
    </AbsoluteFill>
  );
};

const World: React.FC = () => {
  const g = useCurrentFrame();
  const fade = 0.35 + 0.65 * ramp(g, 0, 10);
  const camEd = camE(g);
  const camLs = camLast(g);
  const lastIn = ramp(g, c.lastAt - 5, c.lastAt + 20);
  const cloth = 1 - smooth(ramp(g, c.mirrorAt + 4, c.mirrorAt + 36));
  return (
    <AbsoluteFill style={{ backgroundColor: "#000", opacity: fade }}>
      <AbsoluteFill style={{ filter: "saturate(0.5) brightness(0.82) contrast(1.12)" }}>
        <SceneBox g={g} from={EDGE[0]} to={c.roadAt + FADE} first>
          <Stage cam={camEd}>
            <Forest cx={camEd.fx} g={g} dark={0.1} />
            <defs>
              <linearGradient id="vedge-g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#000" /><stop offset="1" stopColor="#fff" /></linearGradient>
              <mask id="vedge-m" maskUnits="userSpaceOnUse" x={2300} y={-1500} width={3000} height={3400}><rect x={2300} y={-1500} width={500} height={3400} fill="url(#vedge-g)" /><rect x={2800} y={-1500} width={2500} height={3400} fill="#fff" /></mask>
            </defs>
            <g mask="url(#vedge-m)" opacity={0.85}><g transform="translate(1250,0)"><Village dusk={0.35} bell={0} showTable={false} x0={1000} x1={3000} /></g><rect x={2300} y={-1500} width={3000} height={3400} fill="#aab4a4" opacity={0.18} /></g>
            <Cast g={g} list={stageE(g)} />
          </Stage>
        </SceneBox>

        <SceneBox g={g} from={ROAD[0]} to={ROAD[1]}>
          <RoadCard g={g} from={ROAD[0]} to={c.homeAt} />
        </SceneBox>

        <SceneBox g={g} from={HOME[0]} to={HOME[1]}>
          <Stage cam={camHome(g)}>
            <Room g={g} sky={skyAt(g)} cloth={cloth} ring={g >= c.bellAt ? g - c.bellAt : -1} night={ramp(g, c.bellAt - 30, c.changeAt)} reflect={ramp(g, c.mirrorAt + 20, c.mirrorAt + 50)} />
            <Cast g={g} list={stageHome(g)} />
          </Stage>
        </SceneBox>

        <Over g={g} from={c.memoryAt} to={c.mirrorAt + 4}><MemoryFaces g={g} from={c.memoryAt} to={c.mirrorAt} /></Over>
        <Over g={g} from={c.patternAt} to={c.pupilAt + 4}><MirrorCard g={g} from={c.patternAt} to={c.pupilAt} stage={1} /></Over>
        <Over g={g} from={c.pupilAt} to={c.nameAt + 4}><MirrorCard g={g} from={c.pupilAt} to={c.nameAt} stage={2} /></Over>
        <Over g={g} from={c.changeAt} to={c.villageEdgeAt + 4}><ChangeCard g={g} from={c.changeAt} to={c.villageEdgeAt} /></Over>

        <SceneBox g={g} from={EDGE2[0]} to={EDGE2[1]}>
          <Stage cam={camEdge2(g)}>
            <Forest cx={3000} g={g} dark={0.88} />
            <g filter="url(#e2-soft)" opacity={0.95}>
              <defs><filter id="e2-soft"><feGaussianBlur stdDeviation="1.4" /></filter></defs>
              <EdgeShapes g={g} headX={2880} youX={3260} speakFrom={c.confessAt} youFrom={c.confessAt + 70} />
            </g>
            <rect x={-400} y={-1500} width={6400} height={3400} fill="#05080c" opacity={0.42} />
          </Stage>
        </SceneBox>

        <SceneBox g={g} from={VIL[0]} to={VIL[1]}>
          <Stage cam={camV(g)}>
            <Village dusk={0.25} bell={0} showTable={false} />
            <rect x={MAT_X - 130} y={GROUND_Y + 40} width={260} height={46} fill="#8a7a52" stroke="#4a3f26" strokeWidth={4} />
            <Cast g={g} list={stageV(g)} />
          </Stage>
        </SceneBox>

        <SceneBox g={g} from={LAST[0]} to={LAST[1]}>
          <Stage cam={camLs}>
            <Forest cx={2000} g={g} dark={0.93} />
            <CrowdLayer g={g} from={c.lastAt + 6} from2={c.lastAt + 20} n={22} lean={0.25} x0={1300} x1={2800} target={2000} first={{ x: 1250, y: 330 }} />
            <g opacity={lastIn}>
              <Flesh d="M1650 700 C1850 640 2100 640 2380 700" w={40} />
              <g opacity={0.5}><Flesh d="M2050 660 C2000 610 1960 560 2000 510" w={60} /></g>
              <MaskHead kind={3} x={2000} y={430} tilt={-4} s={1.5} />
            </g>
          </Stage>
        </SceneBox>

        <Over g={g} from={c.smileAt} to={le(4) + 8}><FaceHead g={g} smile={ramp(g, c.smileAt + 8, c.smileAt + 34)} zoom={1 + 0.05 * ramp(g, c.smileAt, le(4))} /></Over>
        <Over g={g} from={c.nameAt + 14} to={c.nameAt + 74}><FaceYou g={g} still={1} noBlink slit={1} zoom={1.02 + 0.06 * ramp(g, c.nameAt + 14, c.nameAt + 72)} /></Over>
        <Over g={g} from={c.newAt + 2} to={c.newAt + 96}><FaceWake g={g} open={ramp(g, c.newAt + 14, c.newAt + 60)} /></Over>
        <Over g={g} from={c.welcomeAt + 4} to={le(18) + 6}><FaceHead g={g} smile={ramp(g, c.welcomeAt + 8, c.welcomeAt + 34)} zoom={1 + 0.05 * ramp(g, c.welcomeAt, le(18))} /></Over>
      </AbsoluteFill>

      <TitleCard g={g} />

      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 42%, rgba(0,0,0,0) 48%, rgba(0,0,0,0.55) 100%)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(140,170,120,0.14) 0%, rgba(0,0,0,0) 45%, rgba(190,160,100,0.12) 100%)", mixBlendMode: "soft-light" }} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: 0.09, mixBlendMode: "overlay", pointerEvents: "none" }}>
        <filter id="bl4-grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={g % 7} /><feColorMatrix type="saturate" values="0" /></filter>
        <rect width={W} height={H} filter="url(#bl4-grain)" />
      </svg>

      {g >= outroStart - 14 && <Outro g={g} />}
    </AbsoluteFill>
  );
};

export const Part4: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <World />
    {shots.map((shot, i) => (
      <Sequence key={i} from={starts[i] + shot.leadFrames} durationInFrames={shot.audioFrames}>
        <Audio src={staticFile(shot.audio)} />
        <Subtitle text={shot.text.replace("มองเห็น", "มอง⁠เห็น")} />
      </Sequence>
    ))}
    <Audio src={staticFile("blind4/bed.wav")} volume={0.5} />
  </AbsoluteFill>
);

export const PART4_TOTAL = total;

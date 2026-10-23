import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import manifest from "./manifest.json";
import { fontFamily } from "../island/fonts";
import { PassengerId } from "../bts/cast";
import { Passenger } from "../bts/Passenger";
import { ANCHOR, Cam, makeCamera } from "../bts4/camera";
import { GROUND_Y, HutInterior, Village } from "./Village";
import { EyeOpen, FaceHead, FaceYou, PatternCard } from "./Faces";

const { cues, shots, starts, total, outroStart } = manifest;
const c = cues as Record<string, number>;
const le = (i: number) => c[`lineEnd${i}`];
const W = 1080;
const H = 1920;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ramp = (g: number, a: number, b: number) => clamp01((g - a) / Math.max(1, b - a));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);
const PHASE_SPEED = 0.22;
const TAG_FRAMES = 34;
const FADE = 10;

// ---------------- the cast on stage ----------------
type Pp = { key: string; id: PassengerId; x: number; y: number; facing: 1 | -1; walk: number; fear: number; headTilt: number; label: boolean; rot: number; stick: boolean; armA?: number; dim: number };
const TAGS: { id: PassengerId; t: number }[] = [{ id: "bvHead", t: c.askAt + 4 }];

const P = (g: number, o: Partial<Pp> & { key: string; id: PassengerId; x: number; y: number }): Pp => {
  const tag = TAGS.find((t) => t.id === o.id);
  return { facing: 1, walk: 0, fear: 0, headTilt: 0, rot: 0, stick: false, dim: 1, ...o, label: !!tag && g >= tag.t && g < tag.t + TAG_FRAMES } as Pp;
};
const keyHash = (k: string) => Array.from(k).reduce((s, ch) => s + ch.charCodeAt(0), 0) % 7;

/** the stick taps: the front arm swings a few degrees around a downward-forward angle (swing is solved from the wanted angle) */
const armSwing = (a: number, amp = 60) => Math.asin(Math.max(-1, Math.min(1, (-85 - a) / amp)));
const tapA = (g: number) => -30 + 9 * Math.sin(g * 0.33);

const Cast: React.FC<{ g: number; list: Pp[] }> = ({ g, list }) => (
  <>
    {[...list].sort((a, b) => a.y - b.y).map((p) => (
      <g key={p.key} transform={p.rot ? `rotate(${p.rot} ${p.x} ${p.y})` : undefined} style={p.dim < 1 ? { filter: `brightness(${p.dim})` } : undefined}>
        <Passenger id={p.id} x={p.x} y={p.y} scale={1.7} facing={p.facing} phase={g * PHASE_SPEED + keyHash(p.key) * 0.9} walk={p.walk} frame={g} infection={0} pose="stand" headTilt={p.headTilt} label={p.label} fear={p.fear} item={p.stick ? "stick" : null} swing={p.stick ? armSwing(p.armA ?? tapA(g)) : undefined} swingAmp={60} />
      </g>
    ))}
  </>
);

// ====================================================================================================================
// Scene 1: the eye (the waking)
// ====================================================================================================================
const EYE_END = c.eyeOpenAt + 50;

// ====================================================================================================================
// Scene 2: the hut: "you" get up; the head comes in tapping
// ====================================================================================================================
const HUT_FROM = c.eyeOpenAt + 25;
const HUT_END = c.walkAt - 4 + FADE;
const YOU_X = 860;

const stageHut = (g: number): Pp[] => {
  const up = smooth(ramp(g, c.eyeOpenAt + 45, c.eyeOpenAt + 110));
  const out: Pp[] = [];
  out.push(P(g, { key: "you", id: "bvYou", x: YOU_X, y: GROUND_Y + 60, facing: 1, rot: up < 1 ? -88 * (1 - up) : 0, fear: 0.1 + 0.15 * ramp(g, c.stickAt, c.headEnters), headTilt: up < 1 ? 0 : -4 }));
  // the head: a dark shape in the bright doorway, then in the room
  const come = ramp(g, c.stickAt + 30, c.headEnters + 50);
  const hx = lerp(1420, 1090, smooth(come));
  const dim = lerp(0.18, 1, smooth(clamp01((1300 - hx) / 140)));
  if (g >= c.stickAt + 20) out.push(P(g, { key: "head", id: "bvHead", x: hx, y: GROUND_Y + 70, facing: -1, walk: come > 0 && come < 1 ? 0.55 : 0, stick: true, dim }));
  return out;
};

const camHut = makeCamera("hut", [
  [HUT_FROM, 700, 1120, 1.3],
  [c.stickAt, 900, 1110, 1.1],
  [c.headEnters, 1080, 1110, 1.05],
  [c.askAt, 1020, 1110, 1.3],
  [c.answerAt - 20, 1000, 1110, 1.4],
  [HUT_END, 1000, 1110, 1.25],
]);

// ====================================================================================================================
// Scene 3: the village walk, the bell
// ====================================================================================================================
const VIL_FROM = c.walkAt - 4;
const HEAD_STOP = 3420;
const headX = (g: number) => Math.min(HEAD_STOP, Math.max(600, 600 + 3.75 * (g - c.walkAt)));
const bellSwing = (g: number) => (g < c.bellAt ? 0 : 16 * Math.sin((g - c.bellAt) * 0.5) * Math.exp(-(g - c.bellAt) / 70));
const duskAt = (g: number) => 0.9 * smooth(ramp(g, c.bellAt - 70, c.bellAt + 110));

type V = { id: PassengerId; x0: number; lane: number; vx: number; final: number; fl: number };
const VILLAGERS: V[] = [
  { id: "bvCook", x0: 760, lane: 5, vx: 0, final: 3560, fl: 0 },
  { id: "bvMan", x0: 1251, lane: 175, vx: -1.0, final: 3650, fl: 60 },
  { id: "bvChild", x0: 1180, lane: 12, vx: 0.8, final: 3740, fl: 120 },
  { id: "bvWoman", x0: 2750, lane: 185, vx: -0.9, final: 3830, fl: 180 },
  { id: "bvElder", x0: 2000, lane: 10, vx: 0, final: 3920, fl: 0 },
  { id: "bvMan", x0: 3500, lane: 0, vx: -1.1, final: 4010, fl: 60 },
  { id: "bvWoman", x0: 2650, lane: 12, vx: 0.7, final: 4100, fl: 120 },
  { id: "bvCook", x0: 3050, lane: 5, vx: 0, final: 4190, fl: 180 },
  { id: "bvChild", x0: 3330, lane: 170, vx: -0.8, final: 4280, fl: 0 },
  { id: "bvElder", x0: 3400, lane: 15, vx: 0, final: 4370, fl: 60 },
  { id: "bvMan", x0: 3550, lane: 180, vx: 0, final: 4460, fl: 120 },
];

const stageVillage = (g: number): Pp[] => {
  const out: Pp[] = [];
  const t = g - c.walkAt;
  const gather = smooth(ramp(g, c.bellAt - 80, c.bellAt + 20));
  const turned = g >= c.turnAt;
  // the head leads, tapping; "you" follow a little behind
  const hx = headX(g);
  const walking = hx < HEAD_STOP - 1;
  out.push(P(g, { key: "head", id: "bvHead", x: hx, y: GROUND_Y + 70, facing: 1, walk: walking ? 0.8 : 0, stick: true }));
  const youRows = ramp(g, c.turnAt - 70, c.turnAt - 5);
  const yx = lerp(hx - 170, 3330, smooth(youRows));
  out.push(P(g, { key: "you", id: "bvYou", x: yx, y: GROUND_Y + lerp(112, 165, youRows), facing: 1, walk: walking || (youRows > 0 && youRows < 1) ? 0.8 : 0, fear: Math.max(0.1, 0.25 * ramp(g, c.fearAt, c.fearAt + 40)), headTilt: 4 * ramp(g, c.fearAt, c.fearAt + 40) }));
  VILLAGERS.forEach((v, i) => {
    const wander = v.x0 + v.vx * t;
    const x = lerp(wander, v.final, gather);
    const moving = Math.abs(v.vx) > 0 && gather < 0.98;
    const dir: 1 | -1 = turned ? 1 : gather >= 0.98 ? -1 : gather > 0.02 ? (v.final >= wander ? 1 : -1) : v.vx < 0 ? -1 : v.vx > 0 ? 1 : i % 2 ? -1 : 1;
    out.push(P(g, { key: `v${i}`, id: v.id, x, y: GROUND_Y + lerp(v.lane, v.fl, gather), facing: dir, walk: moving ? 0.7 : gather > 0 && gather < 0.98 ? 0.7 : 0, headTilt: 0 }));
  });
  return out;
};

const camKeys = (): [number, number, number, number][] => {
  const hx = headX;
  return [
    [VIL_FROM, hx(c.walkAt) + 200, 1150, 1.1],
    [c.eyesAt - 30, hx(c.eyesAt - 30) + 150, 1150, 1.2],
    [c.eyesAt, 1180, 1170, 1.7],
    [c.eyesAt + 80, hx(c.eyesAt + 80) + 200, 1150, 1.2],
    [c.shirtAt, hx(c.shirtAt) + 250, 1110, 1.0],
    [c.patternAt, hx(c.patternAt) + 250, 1110, 1.0],
    [c.fearAt, hx(c.fearAt) - 40, 1140, 1.5],
    [c.noMirrorAt, hx(c.noMirrorAt) + 150, 1150, 1.15],
    [c.noMirrorAt + 120, 3300, 1150, 1.1],
    [c.bellAt - 20, 4100, 1100, 1.0],
    [c.bellAt + 40, 4000, 1100, 1.0],
    [c.turnAt - 10, 3850, 1100, 0.95],
    [c.turnAt + 60, 3850, 1100, 0.95],
    [c.questionAt, 4200, 1090, 1.0],
    [c.questionAt + 60, 4650, 1070, 1.35],
    [outroStart, 4700, 1070, 1.35],
  ];
};
const camVil = makeCamera("village", camKeys());

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

const SaidCard: React.FC<{ g: number; from: number; to: number; who?: string; top?: number; children: React.ReactNode }> = ({ g, from, to, who, top = 330, children }) => (
  <Card g={g} from={from} to={to} style={{ top, left: 150, right: 190, fontSize: 56, lineHeight: 1.45, background: "rgba(11,13,10,0.68)", borderRadius: 30, padding: "20px 18px" }}>
    {who && <div style={{ fontSize: 30, color: "#cdbb7a", marginBottom: 4 }}>{who}</div>}
    {children}
  </Card>
);

const Outro: React.FC<{ g: number }> = ({ g }) => {
  const t = g - outroStart;
  const bg = clamp01((g - (outroStart - 14)) / 14);
  return (
    <AbsoluteFill style={{ opacity: bg }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, #232a1c 0%, #080a06 70%)" }} />
      <div style={{ position: "absolute", left: 80, right: 160, top: 560, textAlign: "center", fontFamily, color: "#f1f1f1" }}>
        <div style={{ fontSize: 46, opacity: clamp01(t / 14), lineHeight: 1.6, color: "#aeb4a0" }}>ตอนต่อไป:</div>
        <div style={{ fontSize: 58, opacity: clamp01((t - 26) / 14), lineHeight: 1.5, marginTop: 12 }}>คนที่มองเห็น...</div>
        <div style={{ fontSize: 56, opacity: clamp01((t - 76) / 14), marginTop: 70, color: "#e0c46a" }}>ติดตามตอนที่ 2</div>
      </div>
    </AbsoluteFill>
  );
};

const World: React.FC = () => {
  const g = useCurrentFrame();
  const fade = 0.35 + 0.65 * ramp(g, 0, 10);
  const eyeOpen = smooth(ramp(g, c.eyeOpenAt - 10, c.eyeOpenAt + 25));
  const youFaceOn = g >= c.answerAt && g < le(5) + 14;
  const headFaceOn = g >= c.smileAt && g < c.smileAt + 58;
  const patternOn = g >= c.patternAt && g < le(9) + 6;
  const dusk = duskAt(g);
  const lastPattern = g >= c.questionAt + 55 && g < outroStart - 6;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000", opacity: fade }}>
      <AbsoluteFill style={{ filter: "saturate(0.5) brightness(0.82) contrast(1.12)" }}>
      <SceneBox g={g} from={0} to={EYE_END} first><EyeOpen g={g} open={eyeOpen} /></SceneBox>
      <SceneBox g={g} from={HUT_FROM} to={HUT_END}>
        <Stage cam={camHut(g)}>
          <HutInterior />
          <Cast g={g} list={stageHut(g)} />
        </Stage>
      </SceneBox>
      <SceneBox g={g} from={VIL_FROM} to={total}>
        <Stage cam={camVil(g)}>
          <Village dusk={dusk} bell={bellSwing(g)} />
          <Cast g={g} list={stageVillage(g)} />
        </Stage>
      </SceneBox>

      </AbsoluteFill>

      {youFaceOn && (
        <AbsoluteFill style={{ opacity: ramp(g, c.answerAt, c.answerAt + 8) * clamp01((le(5) + 14 - g) / 8) }}>
          <FaceYou g={g} still={ramp(g, c.answerAt + 10, c.answerAt + 30)} zoom={1 + 0.06 * ramp(g, c.answerAt, le(5) + 10)} />
        </AbsoluteFill>
      )}
      {headFaceOn && (
        <AbsoluteFill style={{ opacity: ramp(g, c.smileAt, c.smileAt + 8) * clamp01((c.smileAt + 58 - g) / 8) }}>
          <FaceHead g={g} smile={ramp(g, c.smileAt + 6, c.smileAt + 26)} zoom={1 + 0.05 * ramp(g, c.smileAt, c.smileAt + 56)} />
        </AbsoluteFill>
      )}
      {patternOn && (
        <AbsoluteFill style={{ opacity: ramp(g, c.patternAt, c.patternAt + 8) * clamp01((le(9) + 6 - g) / 8) }}>
          <PatternCard t={ramp(g, c.patternAt, le(9))} />
        </AbsoluteFill>
      )}
      {lastPattern && (
        <AbsoluteFill style={{ opacity: ramp(g, c.questionAt + 55, c.questionAt + 68) * clamp01((outroStart - 6 - g) / 8) }}>
          <PatternCard t={ramp(g, c.questionAt + 55, outroStart)} watching />
        </AbsoluteFill>
      )}

      <SaidCard g={g} from={c.headEnters + 95} to={c.askAt - 6} who="หัวหน้า">มีคนมาที่นี่อีกแล้วหรอ</SaidCard>
      <SaidCard g={g} from={c.askAt + 50} to={c.answerAt - 6} who="หัวหน้า">คุณตาบอดใช่ไหม?</SaidCard>
      <SaidCard g={g} from={le(5) - 26} to={le(5) + 10} who="คุณ" top={190}>ใช่</SaidCard>
      <SaidCard g={g} from={c.noMirrorAt + 90} to={c.noMirrorAt + 150} who="ชาวบ้าน">คนใหม่...</SaidCard>
      <SaidCard g={g} from={le(13) - 45} to={le(13) + 5} who="ทุกคน">ยินดีต้อนรับ</SaidCard>

      <Card g={g} from={Math.max(le(0), c.hookCut - 80)} to={c.hookCut} style={{ top: 190, left: 120, right: 170, fontSize: 54, lineHeight: 1.5, background: "rgba(11,13,10,0.66)", borderRadius: 32, padding: "22px 16px" }}>
        ตื่นขึ้นมา...<br />ในหมู่บ้านที่ไม่มีใครมองเห็น
      </Card>

      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 42%, rgba(0,0,0,0) 48%, rgba(0,0,0,0.55) 100%)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(140,170,120,0.14) 0%, rgba(0,0,0,0) 45%, rgba(190,160,100,0.12) 100%)", mixBlendMode: "soft-light" }} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: 0.09, mixBlendMode: "overlay", pointerEvents: "none" }}>
        <filter id="bl1-grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={g % 7} /><feColorMatrix type="saturate" values="0" /></filter>
        <rect width={W} height={H} filter="url(#bl1-grain)" />
      </svg>

      {g >= outroStart - 14 && <Outro g={g} />}
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
    <Audio src={staticFile("blind1/bed.wav")} volume={0.5} />
  </AbsoluteFill>
);

export const PART1_TOTAL = total;

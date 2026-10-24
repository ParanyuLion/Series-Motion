import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import manifest from "./manifest.json";
import { fontFamily } from "../island/fonts";
import { PassengerId } from "../bts/cast";
import { Passenger } from "../bts/Passenger";
import { ANCHOR, Cam, makeCamera } from "../bts4/camera";
import { GROUND_Y, Village } from "../blind1/Village";
import { FaceHead, FaceYou } from "../blind1/Faces";
import { SEAT, SupperTable } from "./Supper";
import { Puppet } from "./Puppet";
import { HandGuide, Stare } from "./Faces2";

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
const T = 3400; // the middle of the supper table in the village

// ---------------- the cast on stage ----------------
type Pp = { key: string; id: PassengerId; x: number; y: number; facing: 1 | -1; sit: boolean; walk: number; fear: number; headTilt: number; eat: number };
const EAT_SPEED = 0.13;

/** `eat` > 0 swings the front arm, the same phase for everyone (so every spoon moves in unison) */
const Cast: React.FC<{ g: number; list: Pp[] }> = ({ g, list }) => (
  <>
    {[...list].sort((a, b) => a.y - b.y).map((p) => (
      <Passenger key={p.key} id={p.id} x={p.x} y={p.y} scale={1.7} facing={p.facing} phase={g * 0.22} walk={p.walk} frame={g} infection={0} pose={p.sit ? "sit" : "stand"} headTilt={p.headTilt} label={false} fear={p.fear} swing={p.eat > 0 ? g * EAT_SPEED * 6.28 : undefined} swingAmp={p.eat} />
    ))}
  </>
);

const bellSwing = (g: number) => (g < c.bellAt ? 0 : 16 * Math.sin((g - c.bellAt) * 0.5) * Math.exp(-(g - c.bellAt) / 70));
const dusk = (g: number) => 0.42 + 0.48 * smooth(ramp(g, c.bellAt - 70, c.bellAt + 110));

const TURN_AT = c.bellAt + 22;
const SIT_AT = c.tableAt + 55;

const stage = (g: number): { head: Pp[]; rest: Pp[] } => {
  const eating = g < c.wonderAt + 20;
  const eat = eating ? 24 : 0;
  const turned = g >= TURN_AT;
  const nodT = g - c.nodAt;
  const nod = nodT >= 0 && nodT < 60 ? 7 * Math.sin(nodT * 0.3) * (1 - nodT / 60) : 0;
  const left = (key: string, id: PassengerId, lane: number): Pp => ({ key, id, x: T - SEAT.side, y: GROUND_Y + SEAT.lanes[lane], facing: 1, sit: true, walk: 0, fear: 0, headTilt: nod, eat });
  const right = (key: string, id: PassengerId, lane: number): Pp => ({ key, id, x: T + SEAT.side, y: GROUND_Y + SEAT.lanes[lane], facing: turned ? 1 : -1, sit: true, walk: 0, fear: 0, headTilt: nod, eat });
  const headEat = g < c.wonderAt - 15 ? 24 : 0;
  const head: Pp = { key: "head", id: "bvHead", x: T, y: GROUND_Y - 150, facing: turned ? 1 : -1, sit: true, walk: 0, fear: 0, headTilt: g >= c.sighAt - 10 && g < c.sighAt + 60 ? -3 : 0, eat: headEat };
  // "you" arrive from the right, sit, and take the first spoonful only when the woman has guided the hand
  const arrive = smooth(ramp(g, c.tableAt, SIT_AT));
  const youSeated = g >= SIT_AT;
  const gripFear = 0.12 + 0.2 * ramp(g, c.gripAt, c.gripAt + 40);
  const you: Pp = {
    key: "you", id: "bvYou",
    x: youSeated ? T + SEAT.side : lerp(T + 430, T + SEAT.side, arrive),
    y: youSeated ? GROUND_Y + SEAT.lanes[2] : GROUND_Y + lerp(150, SEAT.lanes[2], arrive),
    facing: -1, sit: youSeated, walk: !youSeated && arrive > 0 && arrive < 1 ? 0.7 : 0, fear: gripFear,
    headTilt: g >= c.gripAt ? 4 : 0,
    eat: g > c.handAt + 70 && eating ? 14 : 0,
  };
  return {
    head: [head],
    rest: [left("l0", "bvCook", 0), left("l1", "bvElder", 1), left("l2", "bvMan", 2), right("r0", "bvChild", 0), right("r1", "bvWoman", 1), you],
  };
};

const cam = makeCamera("supper", [
  [0, T + 70, 1150, 1.55],
  [c.lineStart1, T + 260, 1140, 1.85],
  [c.hookCut, T + 300, 1130, 1.9],
  [c.tableAt + 70, T + 30, 1160, 1.55],
  [c.handAt - 10, T + 150, 1170, 1.75],
  [c.wonderAt, T - 10, 1110, 1.6],
  [c.tellAt - 10, T, 1230, 1.0],
  [c.sighAt, T, 1230, 1.0],
  [c.nodAt + 10, T - 20, 1150, 1.55],
  [c.gripAt, T + 170, 1160, 1.8],
  [c.bellAt - 10, T + 40, 1130, 1.45],
  [c.bellAt + 50, T + 120, 1110, 1.35],
  [c.questionAt, T + 240, 1130, 1.6],
  [c.questionAt + 60, T + 290, 1150, 2.0],
  [outroStart, T + 290, 1150, 2.0],
]);

// ---------------- screen-space pieces ----------------
const Stage: React.FC<{ cam: Cam; children: React.ReactNode }> = ({ cam, children }) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
    <g transform={`translate(${ANCHOR.x},${ANCHOR.y}) rotate(${cam.rot}) scale(${cam.zoom}) translate(${-cam.fx},${-cam.fy})`}>{children}</g>
  </svg>
);

const Subtitle: React.FC<{ text: string }> = ({ text }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: 60, right: 160, bottom: 340, textAlign: "center", opacity: clamp01(f / 6), fontFamily, fontSize: 52, lineHeight: 1.6, color: "#fff", textShadow: "0 0 12px rgba(0,0,0,0.95), 0 3px 6px rgba(0,0,0,0.95)" }}>
      {text}
    </div>
  );
};

const Over: React.FC<{ g: number; from: number; to: number; children: React.ReactNode }> = ({ g, from, to, children }) => {
  if (g < from || g > to) return null;
  return <AbsoluteFill style={{ opacity: ramp(g, from, from + 8) * clamp01((to - g) / 8) }}>{children}</AbsoluteFill>;
};

const TitleCard: React.FC<{ g: number }> = ({ g }) => {
  const from = c.titleAt;
  const to = c.hookCut + 14;
  if (g < from || g > to) return null;
  const o = ramp(g, from, from + 10) * clamp01((to - g) / 10);
  return (
    <div style={{ position: "absolute", left: 110, right: 170, top: 330, textAlign: "center", fontFamily, color: "#fff", opacity: o, background: "rgba(11,13,10,0.7)", borderRadius: 32, padding: "26px 16px", textShadow: "0 2px 12px rgba(0,0,0,0.95)" }}>
      <div style={{ fontSize: 34, color: "#cdbb7a", letterSpacing: 2 }}>หมู่บ้านที่ทุกคนตาบอด · ตอนที่ 2</div>
      <div style={{ fontSize: 60, lineHeight: 1.45, marginTop: 10 }}>คนที่มองเห็น...<br />เคยมาที่นี่ก่อนคุณ</div>
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
        <div style={{ fontSize: 46, opacity: clamp01(t / 14), lineHeight: 1.6, color: "#aeb4a0" }}>ตอนต่อไป:</div>
        <div style={{ fontSize: 58, opacity: clamp01((t - 26) / 14), lineHeight: 1.5, marginTop: 12 }}>คืนแรก...</div>
        <div style={{ fontSize: 56, opacity: clamp01((t - 76) / 14), marginTop: 70, color: "#e0c46a" }}>ติดตามตอนที่ 3</div>
      </div>
    </AbsoluteFill>
  );
};

const World: React.FC = () => {
  const g = useCurrentFrame();
  const fade = 0.35 + 0.65 * ramp(g, 0, 10);
  const { head, rest } = stage(g);
  const tellEnd = c.sighAt;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000", opacity: fade }}>
      <AbsoluteFill style={{ filter: "saturate(0.5) brightness(0.82) contrast(1.12)" }}>
        <Stage cam={cam(g)}>
          <Village dusk={dusk(g)} bell={bellSwing(g)} showTable={false} />
          <Cast g={g} list={head} />
          <SupperTable cx={T} g={g} />
          <Cast g={g} list={rest} />
        </Stage>

        <Over g={g} from={c.handAt} to={le(3) + 10}><HandGuide g={g} from={c.handAt} to={le(3) + 10} /></Over>
        {g >= c.tellAt - 6 && g <= tellEnd + 6 && (
          <AbsoluteFill style={{ opacity: ramp(g, c.tellAt - 6, c.tellAt + 10) * clamp01((tellEnd + 6 - g) / 8) }}>
            <AbsoluteFill style={{ background: "rgba(8,6,3,0.82)" }} />
            <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
              <Puppet t={g - c.tellAt} tripT={c.tripAt - c.tellAt} runT={c.runAt - c.tellAt + 30} endT={tellEnd - c.tellAt - 8} />
            </svg>
          </AbsoluteFill>
        )}
        <Over g={g} from={c.sighAt} to={le(8) + 10}>
          <FaceHead g={g} smile={0.15} zoom={1 + 0.05 * ramp(g, c.sighAt, le(8))} />
        </Over>
        <Over g={g} from={c.gripAt} to={c.stareAt + 4}>
          <FaceYou g={g} still={ramp(g, c.gripAt + 6, c.gripAt + 24)} zoom={1 + 0.06 * ramp(g, c.gripAt, c.stareAt)} />
        </Over>
        <Over g={g} from={c.stareAt} to={c.stareAt + 40}><Stare g={g} from={c.stareAt} to={c.stareAt + 40} /></Over>
        <Over g={g} from={c.smileAt} to={le(13) + 8}>
          <FaceHead g={g} smile={ramp(g, c.smileAt + 6, c.smileAt + 26)} zoom={1 + 0.05 * ramp(g, c.smileAt, le(13))} />
        </Over>
        <Over g={g} from={c.questionAt + 55} to={outroStart - 6}>
          <FaceYou g={g} still={1} zoom={1.05 + 0.2 * ramp(g, c.questionAt + 55, outroStart)} />
        </Over>
      </AbsoluteFill>

      <TitleCard g={g} />

      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 42%, rgba(0,0,0,0) 48%, rgba(0,0,0,0.55) 100%)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(140,170,120,0.14) 0%, rgba(0,0,0,0) 45%, rgba(190,160,100,0.12) 100%)", mixBlendMode: "soft-light" }} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: 0.09, mixBlendMode: "overlay", pointerEvents: "none" }}>
        <filter id="bl2-grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={g % 7} /><feColorMatrix type="saturate" values="0" /></filter>
        <rect width={W} height={H} filter="url(#bl2-grain)" />
      </svg>

      {g >= outroStart - 14 && <Outro g={g} />}
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
    <Audio src={staticFile("blind2/bed.wav")} volume={0.5} />
  </AbsoluteFill>
);

export const PART2_TOTAL = total;

import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import manifest from "./manifest.json";
import { fontFamily } from "../island/fonts";
import { PassengerId } from "../bts/cast";
import { Passenger } from "../bts/Passenger";
import { ANCHOR, Cam, makeCamera } from "../bts4/camera";
import { GROUND_Y, HutInterior, Village } from "../blind1/Village";
import { FaceHead, FaceYou, PatternCard } from "../blind1/Faces";
import { Chair, Rustle, Spoon, Stool } from "./Props";
import { CrowdLayer, Forest, Shoe } from "./Forest";
import { LeavesFlash, LowerFace, PostCard, RoofCard } from "./Cards";

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
type Pp = { key: string; id: PassengerId; x: number; y: number; facing: 1 | -1; sit?: boolean; walk?: number; fear?: number; headTilt?: number; eat?: number; stick?: number; op?: number; flip?: number; still?: boolean };

const armSwing = (a: number, amp = 60) => Math.asin(Math.max(-1, Math.min(1, (-85 - a) / amp)));

const Cast: React.FC<{ g: number; list: Pp[] }> = ({ g, list }) => (
  <>
    {[...list].sort((a, b) => a.y - b.y).map((p, i) => {
      const hasStick = p.stick !== undefined;
      const eating = (p.eat ?? 0) > 0;
      // while "you" must not blink the idle clock is held away from the blink window
      const frame = p.still ? 40 + ((g * 0.2) % 60) : g;
      return (
        <g key={p.key} opacity={p.op ?? 1} transform={p.flip ? `translate(${p.x},0) scale(${Math.cos(Math.PI * p.flip)},1) translate(${-p.x},0)` : undefined}>
          <Passenger id={p.id} x={p.x} y={p.y} scale={1.7} facing={p.facing} phase={g * 0.2 + i} walk={p.walk ?? 0} frame={frame} infection={0} pose={p.sit ? "sit" : "stand"} headTilt={p.headTilt ?? 0} label={false} fear={p.fear ?? 0} item={hasStick ? "stick" : null} swing={hasStick ? armSwing(p.stick!) : eating ? g * 0.13 * 6.28 : undefined} swingAmp={hasStick ? 60 : p.eat} />
        </g>
      );
    })}
  </>
);

// ====================================================================================================================
// timing of the stages (each box fades in and out over FADE frames, like the earlier parts)
// ====================================================================================================================
const V1 = [0, c.nightAt + FADE];
const H1 = [c.nightAt, c.chairAt + FADE];
const V2 = [c.chairAt, c.shirtAt + FADE];
const CARDS = [c.shirtAt, c.bellAt];
const V3 = [c.bellAt - FADE, c.dawnAt + FADE];
const V4 = [c.dawnAt, c.quietAt + FADE];
const F = [c.quietAt, total];

const bellSwing = (g: number) => (g < c.bellAt ? 0 : 16 * Math.sin((g - c.bellAt) * 0.5) * Math.exp(-(g - c.bellAt) / 70));

// ---- V1: the hook, the village by day ----
const stageV1 = (g: number): Pp[] => [
  { key: "you", id: "bvYou", x: 2500, y: GROUND_Y + 110, facing: 1, fear: 0.1 },
  { key: "cook", id: "bvCook", x: lerp(2150, 2230, ramp(g, 0, 300)), y: GROUND_Y + 20, facing: 1, walk: 0.5 },
  { key: "man", id: "bvMan", x: lerp(2900, 2700, ramp(g, 0, 330)), y: GROUND_Y + 180, facing: -1, walk: 0.6 },
  { key: "child", id: "bvChild", x: lerp(2000, 2300, ramp(g, 0, 330)), y: GROUND_Y + 170, facing: 1, walk: 0.6 },
  { key: "woman", id: "bvWoman", x: 2820, y: GROUND_Y + 30, facing: -1 },
];
const camV1 = makeCamera("v1", [
  [0, 2380, 1150, 1.35],
  [c.lineStart1, 2480, 1120, 1.85],
  [c.hookCut, 2500, 1120, 1.95],
  [V1[1], 2500, 1120, 1.95],
]);

// ---- H1: the hut at night, the cook feeds "you" ----
const stageH1 = (g: number): Pp[] => [
  { key: "you", id: "bvYou", x: 690, y: GROUND_Y + 90, facing: 1, sit: true, fear: 0.1 },
  { key: "cook", id: "bvCook", x: 1010, y: GROUND_Y + 90, facing: -1, sit: true },
];
const camH1 = makeCamera("h1", [
  [H1[0], 820, 1140, 1.4],
  [c.chairAt - 40, 850, 1130, 1.9],
  [H1[1], 850, 1130, 1.9],
]);

// ---- V2: the chair test, in the morning ----
const CHAIR_X = 2640;
const NUDGE = c.nudgeAt + 70; // the stick swings on "เขี่ยมันออก" and the foot would land about 35 frames later
const youXV2 = (g: number) => (g < NUDGE + 35 ? lerp(2040, 2560, ramp(g, c.chairAt + 10, NUDGE + 35)) : lerp(2560, 3060, ramp(g, NUDGE + 35, c.shirtAt)));
const stickAngle = (g: number) => {
  const swing = ramp(g, NUDGE - 8, NUDGE + 2) * (1 - ramp(g, NUDGE + 8, NUDGE + 26));
  return lerp(-12 + 3 * Math.sin(g * 0.3), -88, swing);
};
const stageV2 = (g: number): Pp[] => {
  const walking = g < c.shirtAt - 20;
  return [
    { key: "head", id: "bvHead", x: 2480, y: GROUND_Y + 20, facing: 1, stick: stickAngle(g) },
    { key: "you", id: "bvYou", x: youXV2(g), y: GROUND_Y + 110, facing: 1, walk: walking ? 0.6 : 0, fear: 0.12 },
    { key: "man", id: "bvMan", x: lerp(2900, 3500, ramp(g, c.chairAt, c.shirtAt)), y: GROUND_Y + 190, facing: 1, walk: 0.6 },
    { key: "child", id: "bvChild", x: lerp(3500, 3050, ramp(g, c.chairAt + 20, c.shirtAt)), y: GROUND_Y + 175, facing: -1, walk: 0.6 },
    { key: "cook", id: "bvCook", x: 2250, y: GROUND_Y + 10, facing: 1 },
  ];
};
const camV2 = makeCamera("v2", [
  [V2[0], 2420, 1170, 1.5],
  [NUDGE - 40, 2580, 1160, 1.75],
  [NUDGE + 40, 2700, 1150, 1.6],
  [c.smileAt, 2900, 1150, 1.45],
  [V2[1], 2950, 1150, 1.45],
]);

// ---- V3: the bell at dusk ----
const TURN_AT = c.bellAt + 75;
const TURN_LEN = 12;
const stageV3 = (g: number): Pp[] => {
  const tp = clamp01((g - TURN_AT) / TURN_LEN);
  const turning = tp > 0 && tp < 1;
  const done = tp >= 1;
  const row = (key: string, id: PassengerId, x: number, y: number): Pp => ({ key, id, x, y: GROUND_Y + y, facing: done ? 1 : -1, flip: turning ? tp : 0 });
  return [
    row("head", "bvHead", 4370, 60),
    row("cook", "bvCook", 4290, 150),
    row("man", "bvMan", 4130, 30),
    row("child", "bvChild", 4210, 140),
    row("woman", "bvWoman", 4450, 195),
    row("elder", "bvElder", 4040, 90),
    { key: "you", id: "bvYou", x: 3940, y: GROUND_Y + 175, facing: 1, fear: 0.2, headTilt: 5 * ramp(g, TURN_AT, TURN_AT + 20) },
  ];
};
const camV3 = makeCamera("v3", [
  [V3[0], 4300, 1110, 1.1],
  [c.bellAt + 8, 4400, 1090, 1.05],
  [c.bellAt + 120, 4380, 1100, 1.0],
  [V3[1], 4560, 1090, 1.12],
]);

// ---- V4: grey dawn, "you" slip out toward the trees ----
const youXV4 = (g: number) => lerp(3700, 4850, ramp(g, c.dawnAt + 8, c.quietAt + 10));
const stageV4 = (g: number): Pp[] => [{ key: "you", id: "bvYou", x: youXV4(g), y: GROUND_Y + 120, facing: 1, walk: 0.5, fear: 0.2, still: true }];
const camV4 = makeCamera("v4", [
  [V4[0], 3850, 1140, 1.25],
  [c.quietAt, 4750, 1130, 1.25],
  [V4[1], 4900, 1130, 1.3],
]);

// ---- F: the forest ----
const FX = (g: number) => (g < c.blindAt ? 400 + 2.6 * (g - c.quietAt) : 400 + 2.6 * (c.blindAt - c.quietAt) + 1.3 * (g - c.blindAt));
const SHOE_X = 880;
const ROAD_X = 3600;
const stageF = (g: number): Pp[] => {
  const blind = g >= c.blindAt;
  return [{ key: "you", id: "bvYou", x: FX(g), y: GROUND_Y + 60, facing: 1, walk: blind ? 0.3 : 0.55, fear: lerp(0.15, 0.45, ramp(g, c.faceAt, c.blindAt)), headTilt: blind ? -2 : 0, still: g >= c.blindAt - 20 }];
};
const camF = makeCamera("forest", [
  [F[0], 700, 1130, 1.25],
  [c.shoeAt - 20, SHOE_X - 120, 1180, 1.5],
  [c.shoeAt + 60, SHOE_X + 80, 1170, 1.5],
  [c.faceAt - 10, 1400, 1100, 1.15],
  [c.faceAt + 50, 1650, 700, 1.0],
  [c.crowdAt, 1950, 760, 0.95],
  [c.blindAt, 2300, 800, 0.95],
  [c.lowerAt, 2450, 820, 0.95],
  [c.leanAt + 60, 2650, 780, 0.95],
  [c.roadAt, 3000, 1000, 1.05],
  [outroStart, 3200, 1120, 1.5],
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
      <div style={{ fontSize: 34, color: "#cdbb7a", letterSpacing: 2 }}>หมู่บ้านที่ทุกคนตาบอด · ตอนที่ 3</div>
      <div style={{ fontSize: 66, lineHeight: 1.45, marginTop: 10 }}>อย่ากะพริบตา</div>
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
        <div style={{ fontSize: 58, opacity: clamp01((t - 26) / 14), lineHeight: 1.5, marginTop: 12 }}>ทางกลับบ้าน...</div>
        <div style={{ fontSize: 56, opacity: clamp01((t - 76) / 14), marginTop: 70, color: "#e0c46a" }}>ติดตามตอนที่ 4</div>
      </div>
    </AbsoluteFill>
  );
};

const World: React.FC = () => {
  const g = useCurrentFrame();
  const fade = 0.35 + 0.65 * ramp(g, 0, 10);
  const youX = FX(g);
  const dark = lerp(0.1, 0.85, ramp(g, c.faceAt, c.crowdAt + 60));
  const lean = smooth(ramp(g, c.leanAt + 20, c.leanAt + 110));
  const duskV3 = 0.45 + 0.4 * smooth(ramp(g, c.bellAt - 40, c.bellAt + 90));
  const cardsOn = g >= CARDS[0] - 4 && g <= CARDS[1] + 4;
  const cardLines: [number, number][] = [[c.shirtAt, c.roofAt], [c.roofAt, c.postAt], [c.postAt, c.carriedAt], [c.carriedAt, c.bellAt]];
  return (
    <AbsoluteFill style={{ backgroundColor: "#000", opacity: fade }}>
      <AbsoluteFill style={{ filter: "saturate(0.5) brightness(0.82) contrast(1.12)" }}>
        {cardsOn && <AbsoluteFill style={{ background: "#000", opacity: ramp(g, CARDS[0] - 4, CARDS[0] + 6) * clamp01((CARDS[1] + 4 - g) / 8) }} />}

        <SceneBox g={g} from={V1[0]} to={V1[1]} first>
          <Stage cam={camV1(g)}>
            <Village dusk={0.1} bell={0} />
            <Cast g={g} list={stageV1(g)} />
          </Stage>
        </SceneBox>

        <SceneBox g={g} from={H1[0]} to={H1[1]}>
          <Stage cam={camH1(g)}>
            <HutInterior />
            <Stool x={1010} y={GROUND_Y + 90} />
            <Cast g={g} list={stageH1(g)} />
            <g>
              <path d="M800 1318 Q800 1368 850 1372 Q900 1368 900 1318 Z" fill="#8e7f64" stroke="#5b503b" strokeWidth={3} />
              <ellipse cx={850} cy={1318} rx={50} ry={11} fill="#d8d2bd" />
              <Spoon g={g} reach={smooth(ramp(g, c.nightAt + 30, c.nightAt + 90))} from={[870, 1300]} tip={[796, 1135]} />
            </g>
            <rect x={-700} y={-1200} width={3200} height={2500} fill="#070d1c" opacity={0.62} />
            <ellipse cx={850} cy={1150} rx={520} ry={420} fill="#ffb865" opacity={0.2} />
          </Stage>
        </SceneBox>

        <SceneBox g={g} from={V2[0]} to={V2[1]}>
          <Stage cam={camV2(g)}>
            <Village dusk={0} bell={0} showTable={false} />
            <Chair x={CHAIR_X} y={GROUND_Y + 110} slide={smooth(ramp(g, NUDGE, NUDGE + 16))} />
            <Cast g={g} list={stageV2(g)} />
          </Stage>
        </SceneBox>

        <Over g={g} from={cardLines[0][0]} to={cardLines[0][1] + 4}><PatternCard t={ramp(g, cardLines[0][0], cardLines[0][1])} /></Over>
        <Over g={g} from={cardLines[1][0]} to={cardLines[1][1] + 4}><RoofCard g={g} from={cardLines[1][0]} to={cardLines[1][1]} /></Over>
        <Over g={g} from={cardLines[2][0]} to={cardLines[2][1] + 4}><PostCard g={g} from={cardLines[2][0]} to={cardLines[2][1]} /></Over>
        <Over g={g} from={cardLines[3][0]} to={cardLines[3][1] + 4}><LeavesFlash g={g} from={cardLines[3][0]} to={cardLines[3][1]} /></Over>

        <SceneBox g={g} from={V3[0]} to={V3[1]}>
          <Stage cam={camV3(g)}>
            <Village dusk={duskV3} bell={bellSwing(g)} />
            <Rustle g={g} from={c.bellAt + 110} x0={4780} x1={5240} y={1300} />
            <Cast g={g} list={stageV3(g)} />
          </Stage>
        </SceneBox>

        <SceneBox g={g} from={V4[0]} to={V4[1]}>
          <Stage cam={camV4(g)}>
            <Village dusk={0.2} bell={0} />
            <rect x={-400} y={-1500} width={6000} height={3300} fill="#243449" opacity={0.3} />
            <Cast g={g} list={stageV4(g)} />
          </Stage>
        </SceneBox>

        <SceneBox g={g} from={F[0]} to={F[1]}>
          <Stage cam={camF(g)}>
            <Forest cx={camF(g).fx} dark={dark} />
            {g >= c.roadAt - 150 && (
              <g opacity={ramp(g, c.roadAt - 150, c.roadAt + 20)}>
                <defs>
                  <radialGradient id="rd-glow" cx="0.5" cy="0.62" r="0.5"><stop offset="0" stopColor="#f6efd0" stopOpacity={0.75} /><stop offset="1" stopColor="#f6efd0" stopOpacity={0} /></radialGradient>
                </defs>
                <ellipse cx={ROAD_X + 250} cy={1100} rx={620} ry={760} fill="url(#rd-glow)" />
                <path d={`M${ROAD_X - 40} ${GROUND_Y + 12} L${ROAD_X + 900} ${GROUND_Y + 12} L${ROAD_X + 1100} ${GROUND_Y + 190} L${ROAD_X - 240} ${GROUND_Y + 190} Z`} fill="#d9d2b4" opacity={0.6} />
              </g>
            )}
            <CrowdLayer g={g} from={c.faceAt + 8} from2={c.crowdAt} n={18} lean={lean} x0={1550} x1={3050} target={youX} first={{ x: FX(c.faceAt) + 330, y: 330 }} />
            <Cast g={g} list={stageF(g)} />
            <Shoe x={SHOE_X} y={GROUND_Y + 95} />
          </Stage>
        </SceneBox>

        <Over g={g} from={c.nightAt + 70} to={le(2) + 8}><FaceYou g={g} still={ramp(g, c.nightAt + 78, c.nightAt + 96)} zoom={1 + 0.05 * ramp(g, c.nightAt + 70, le(2))} /></Over>
        <Over g={g} from={c.smileAt} to={le(5) + 8}><FaceHead g={g} smile={ramp(g, c.smileAt + 8, c.smileAt + 34)} zoom={1 + 0.05 * ramp(g, c.smileAt, le(5))} /></Over>
        <Over g={g} from={c.blindAt} to={c.blindAt + 84}><FaceYou g={g} still={1} noBlink zoom={1 + 0.06 * ramp(g, c.blindAt, c.blindAt + 80)} /></Over>
        <Over g={g} from={c.lowerAt} to={c.leanAt + 6}><LowerFace g={g} from={c.lowerAt} to={c.leanAt} /></Over>
        <Over g={g} from={c.leanAt} to={c.leanAt + 62}><FaceYou g={g} still={1} noBlink zoom={1.05 + 0.1 * ramp(g, c.leanAt, c.leanAt + 60)} /></Over>
      </AbsoluteFill>

      <TitleCard g={g} />

      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 42%, rgba(0,0,0,0) 48%, rgba(0,0,0,0.55) 100%)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(140,170,120,0.14) 0%, rgba(0,0,0,0) 45%, rgba(190,160,100,0.12) 100%)", mixBlendMode: "soft-light" }} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: 0.09, mixBlendMode: "overlay", pointerEvents: "none" }}>
        <filter id="bl3-grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={g % 7} /><feColorMatrix type="saturate" values="0" /></filter>
        <rect width={W} height={H} filter="url(#bl3-grain)" />
      </svg>

      {g >= outroStart - 14 && <Outro g={g} />}
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
    <Audio src={staticFile("blind3/bed.wav")} volume={0.5} />
  </AbsoluteFill>
);

export const PART3_TOTAL = total;

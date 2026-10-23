import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import manifest from "./manifest.json";
import { fontFamily } from "../island/fonts";
import { PASSENGERS, PassengerId } from "../bts/cast";
import { Passenger } from "../bts/Passenger";
import { FLOOR_Y, TrainInterior } from "../bts/TrainInterior";
import { ZombieFace } from "../bts/ZombieFace";
import { Impact } from "../bts/Fx";
import { ANCHOR, Cam, makeCamera } from "../bts4/camera";

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
const RUN_SPEED = 0.36;
const TAG_FRAMES = 34;
const FADE = 10;
const ZOMBIE_FACE_FRAMES = 55;
const HIP = 197; // hip height of a 108-leg figure at scale 1.7

// ---------------- the cast on stage ----------------
type Item = "umbrella" | "extinguisher" | "bag" | null;
type Pp = { key: string; id: PassengerId; x: number; y: number; facing: 1 | -1; pose: "stand" | "sit" | "hold" | "shamble" | "fall"; walk: number; infection: number; fear: number; headTilt: number; label: boolean; rot: number; piv: number; item: Item; swing?: number; swingAmp?: number; run: boolean };

const TAGS: { id: PassengerId; t: number }[] = [
  { id: "nun", t: c.swingAt - 14 },
  { id: "mike", t: c.dragAt + 10 },
];

const P = (g: number, o: Partial<Pp> & { key: string; id: PassengerId; x: number; y: number }): Pp => {
  const tag = TAGS.find((t) => t.id === o.id);
  const living = (o.infection ?? 0) < 0.5;
  return { facing: -1, pose: "stand", walk: 0, infection: 0, fear: 0, headTilt: 0, rot: 0, piv: 0, item: null, run: false, ...o, label: !!tag && living && g >= tag.t && g < tag.t + TAG_FRAMES } as Pp;
};
const keyHash = (k: string) => Array.from(k).reduce((s, ch) => s + ch.charCodeAt(0), 0) % 7;

const Cast: React.FC<{ g: number; list: Pp[]; dim?: number }> = ({ g, list, dim = 1 }) => (
  <g style={dim < 1 ? { filter: `brightness(${dim})` } : undefined}>
    {[...list].sort((a, b) => a.y - b.y).map((p) => (
      <g key={p.key} transform={p.rot ? `rotate(${p.rot} ${p.x} ${p.y - p.piv})` : undefined}>
        <Passenger id={p.id} x={p.x} y={p.y} scale={1.7} facing={p.facing} phase={g * (p.run ? RUN_SPEED : PHASE_SPEED) + keyHash(p.key) * 0.9} walk={p.walk} frame={g} infection={p.infection} pose={p.pose} headTilt={p.headTilt} label={p.label} fear={p.fear} item={p.item} swing={p.swing} swingAmp={p.swingAmp} />
      </g>
    ))}
  </g>
);
const zb = (g: number, key: string, id: PassengerId, x: number, y: number, facing: 1 | -1, extra: Partial<Pp> = {}) => P(g, { key, id, x, y, facing, pose: "shamble", walk: 1, infection: 1, headTilt: 12, ...extra });

// the train's speed: fast, then braking from brakeAt, standing at stopAt
const SPEED0 = 26;
const speedAt = (g: number) => SPEED0 * (1 - smooth(ramp(g, c.brakeAt, c.stopAt)));
const scrollArr: number[] = [];
{
  let s = 0;
  for (let g = 0; g <= total; g++) { scrollArr.push(s); s += speedAt(g); }
}
const scrollAt = (g: number) => scrollArr[Math.min(g, total)];

// ====================================================================================================================
// Scene A: the front of car 1: the cab door, seen face-on; it slides up
// ====================================================================================================================
const CAB_X = -640;
const A_END = c.doorOpenAt + 46;

const stageA = (g: number): Pp[] => {
  const calm = ramp(g, c.doorOpenAt, c.doorOpenAt + 30);
  const brace = 0.5 * (1 - calm) + 0.3;
  return [
    P(g, { key: "mike", id: "mike", x: CAB_X + 190, y: FLOOR_Y + 30, facing: -1, item: "umbrella", swing: 0.08, swingAmp: 10, fear: brace }),
    P(g, { key: "nun", id: "nun", x: CAB_X + 360, y: FLOOR_Y + 90, facing: -1, item: "extinguisher", swing: 0.08, swingAmp: 4, fear: brace }),
    P(g, { key: "you", id: "you", x: CAB_X + 530, y: FLOOR_Y + 145, facing: -1, item: "bag", swing: -1.5, swingAmp: 60, fear: brace }),
  ];
};

const DoorFace: React.FC<{ g: number }> = ({ g }) => {
  const lamp = 0.5 + 0.5 * Math.sin(g * 0.35);
  const open = smooth(ramp(g, c.doorOpenAt, c.doorOpenAt + 26));
  const thump = g < c.doorOpenAt ? (Math.sin(g * 0.8) > 0.93 ? 3 : 0) : 0;
  return (
    <g>
      <rect x={CAB_X - 130} y={700} width={260} height={FLOOR_Y - 700} fill="#1a1d21" />
      {/* the dark, warm opening behind the door */}
      <rect x={CAB_X - 106} y={730} width={212} height={FLOOR_Y - 730} fill="#2a1a10" />
      <rect x={CAB_X - 106} y={730} width={212} height={FLOOR_Y - 730} fill="#ff6a3a" opacity={0.22 + 0.1 * lamp * open} />
      <g transform={`translate(${thump},${-(FLOOR_Y - 730) * open})`}>
        <rect x={CAB_X - 106} y={730} width={212} height={FLOOR_Y - 730} fill="#454c54" stroke="#8c918f" strokeWidth={8} />
        <rect x={CAB_X - 62} y={800} width={124} height={170} rx={10} fill="#10161b" stroke="#6b737b" strokeWidth={6} />
        <ellipse cx={CAB_X} cy={900} rx={46} ry={62} fill="#ff6a3a" opacity={0.18 + 0.12 * lamp} />
        {/* a slumped silhouette in the window */}
        <g fill="#05070a" transform={`translate(${CAB_X + 6 * Math.sin(g * 0.07)},0) rotate(${14 + 4 * Math.sin(g * 0.05)} ${CAB_X} 960)`}>
          <circle cx={CAB_X + 6} cy={895} r={22} />
          <path d={`M${CAB_X - 46} 972 Q${CAB_X - 40} 920 ${CAB_X + 6} 918 Q${CAB_X + 50} 920 ${CAB_X + 48} 972 Z`} />
        </g>
        <rect x={CAB_X + 58} y={1080} width={16} height={70} rx={6} fill="#d9dde0" />
      </g>
      <rect x={CAB_X - 94} y={650} width={188} height={46} rx={8} fill="#0d3d2a" />
      <text x={CAB_X} y={684} textAnchor="middle" fontFamily={fontFamily} fontSize={30} fill="#ffffff">ห้องคนขับ</text>
      <circle cx={CAB_X} cy={620} r={14} fill="#ff3b30" opacity={0.3 + 0.7 * lamp} />
    </g>
  );
};

const camA = makeCamera("door", [
  [0, CAB_X + 110, 1100, 1.5],
  [c.doorOpenAt - 20, CAB_X + 130, 1090, 1.6],
  [A_END, CAB_X + 230, 1060, 1.3],
]);

const SceneA: React.FC<{ g: number }> = ({ g }) => (
  <Stage cam={camA(g)}>
    <TrainInterior frame={g} scroll={scrollAt(g)} doors={0} lights={0.82 + 0.1 * Math.sin(g * 0.9)} station="ราชดำริ" carNumber={1} />
    <DoorFace g={g} />
    <Cast g={g} list={stageA(g)} />
  </Stage>
);

// ====================================================================================================================
// Scene B: the cab, seen from the side (the door in its right wall), car 1 to the right
// ====================================================================================================================
const B_FROM = c.doorOpenAt + 30;
const B_END = c.platformIn + FADE;
const CAB_L = 350;
const CAB_R = 1100;
const CEIL = 620;
const DRIVER_X = 700;
const FEET_END = 1380;

const driverState = (g: number): Pp => {
  const bend = 1 - smooth(ramp(g, c.turnAt, c.turnAt + 28));
  const turned = g >= c.turnAt + 28;
  const walkX = 0.4 * Math.max(0, Math.min(g, c.hitAt + 4) - (c.turnAt + 28));
  const fall = smooth(ramp(g, c.hitAt + 4, c.hitAt + 28));
  const rise = smooth(ramp(g, c.pushAt + 40, c.pushAt + 80));
  const drag = smooth(ramp(g, c.dragAt + 25, c.pushAt + 35));
  const x0 = DRIVER_X + walkX;
  let x = lerp(x0, FEET_END, drag);
  if (g > c.pushAt + 80) x = FEET_END - 0.35 * (g - (c.pushAt + 80));
  const lying = g > c.hitAt + 4 && rise < 1;
  const rot = lying ? -88 * fall * (1 - rise) : -55 * bend;
  const standing = !lying;
  return P(g, {
    key: "driver", id: "driver", x, y: FLOOR_Y + 60,
    facing: g < c.turnAt + 24 ? -1 : g > c.pushAt + 60 ? -1 : 1,
    pose: turned && standing ? "shamble" : "stand", walk: turned && standing ? 1 : 0, infection: 1,
    headTilt: g < c.turnAt ? 26 : 12, rot, piv: lying ? 0 : bend > 0 ? HIP : 0, fear: 0,
  });
};

const stageB = (g: number): Pp[] => {
  const out: Pp[] = [];
  const drv = driverState(g);
  out.push(drv);
  const hitDone = g >= c.hitAt + 6;
  // พี่นุ่น: comes to the doorway and swings the empty extinguisher
  const swinging = g >= c.swingAt && g < c.hitAt + 6;
  const nunWalk = ramp(g, c.turnAt + 10, c.turnAt + 60);
  const nunX = g < c.lockAt - 30 ? lerp(1250, 1070, smooth(nunWalk)) : lerp(1070, 880, smooth(ramp(g, c.lockAt - 30, c.lockAt + 20)));
  out.push(P(g, { key: "nun", id: "nun", x: nunX, y: FLOOR_Y + 90, facing: -1, walk: nunWalk > 0 && nunWalk < 1 ? 1 : 0, item: "extinguisher", swing: swinging ? (g - c.swingAt) * 0.5 : 0.08, swingAmp: swinging ? 65 : 4, fear: 0.4 }));

  // ไมค์ and "you": come in, drag the driver out through the door, run back
  const approach = smooth(ramp(g, c.hitAt + 6, c.dragAt + 25));
  const dragging = g >= c.dragAt + 25 && g < c.pushAt + 40;
  const back = smooth(ramp(g, c.pushAt + 40, c.lockAt - 14));
  const feetX = drv.x;
  const mikeX = g < c.dragAt + 25 ? lerp(1180, 818, approach) : dragging ? feetX + 90 : lerp(FEET_END + 90, 1050, back);
  out.push(P(g, { key: "mike", id: "mike", x: mikeX, y: FLOOR_Y + 30, facing: g < c.dragAt + 25 ? -1 : dragging ? 1 : -1, walk: g < c.dragAt + 25 ? (approach > 0 && approach < 1 ? 1 : 0) : dragging ? 0.8 : back < 1 ? 1 : 0, run: !dragging && back > 0 && back < 1, item: "umbrella", swing: 0.08, swingAmp: 10, fear: 0.5 }));
  const brake = ramp(g, c.brakeAt, c.brakeAt + 28);
  const youBack = smooth(ramp(g, c.pushAt + 40, c.lockAt + 10));
  const youX = g < c.dragAt + 25 ? lerp(1260, 866, approach) : dragging ? feetX + 150 : lerp(FEET_END + 150, 790, youBack);
  out.push(P(g, { key: "you", id: "you", x: youX, y: FLOOR_Y + 130, facing: g < c.dragAt + 25 ? -1 : dragging ? 1 : -1, walk: g < c.dragAt + 25 ? (approach > 0 && approach < 1 ? 1 : 0) : dragging ? 0.8 : youBack < 1 ? 1 : 0, run: !dragging && youBack > 0 && youBack < 1, item: g >= c.brakeAt - 5 ? null : "bag", swing: g >= c.brakeAt - 5 ? lerp(0.08, -1.2, brake) : -1.5, swingAmp: 60, fear: 0.6 }));

  // the horde walks along car 1 toward the cab
  if (g >= c.pushAt - 20) {
    const ids: PassengerId[] = ["man1", "nueng", "woman1", "uncle", "man1", "woman1", "uncle", "nueng"];
    const lanes = [40, 95, 20, 120, 70, 140, 50, 105];
    ids.forEach((id, i) => {
      const x = 1650 + 100 * i - 0.45 * Math.max(0, g - (c.pushAt - 20));
      out.push(zb(g, `h${i}`, id, x, FLOOR_Y + lanes[i], -1, id === "nueng" ? { mark: 1 } as Partial<Pp> : {}));
    });
  }
  void hitDone;
  return out;
};

const CityStrip: React.FC<{ scroll: number; x: number; w: number }> = ({ scroll, x, w }) => (
  <g>
    <clipPath id="b5-win"><rect x={x} y={760} width={w} height={280} /></clipPath>
    <rect x={x} y={760} width={w} height={280} fill="url(#b5-sky)" />
    <g clipPath="url(#b5-win)">
      {Array.from({ length: 12 }, (_, i) => {
        const bw = 90 + ((i * 53) % 70);
        const px = ((i * 170 - scroll * 0.6) % 2040 + 2040) % 2040 - 200 + x;
        const bh = 120 + ((i * 97) % 150);
        return <rect key={i} x={px} y={1040 - bh} width={bw} height={bh} fill={i % 2 ? "#6d7f90" : "#8394a3"} />;
      })}
      {Array.from({ length: 5 }, (_, i) => <rect key={i} x={(((i * 300 - scroll * 1.6) % 1500) + 1500) % 1500 - 200 + x} y={1010} width={160} height={6} fill="#e8eef2" opacity={0.5} />)}
    </g>
    <rect x={x} y={760} width={w} height={280} fill="none" stroke="#8c918f" strokeWidth={10} />
  </g>
);

const CabRoom: React.FC<{ g: number }> = ({ g }) => {
  const lamp = 0.5 + 0.5 * Math.sin(g * 0.35);
  const throttleA = g < c.hitAt ? 28 : lerp(28, -8, ramp(g, c.pushAt - 10, c.pushAt + 10));
  const brakeP = ramp(g, c.brakeAt, c.brakeAt + 28);
  const brakeA = lerp(-18, 38, smooth(brakeP));
  const door = smooth(ramp(g, c.lockAt - 16, c.lockAt)) ;
  return (
    <g>
      <defs>
        <linearGradient id="b5-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#9fcbe8" /><stop offset="1" stopColor="#e4f0f6" /></linearGradient>
      </defs>
      {/* outside the cab's rear end, the ceiling and the floor */}
      <rect x={-900} y={-1200} width={CAB_L + 900} height={4400} fill="#14171a" />
      <rect x={CAB_L} y={-1200} width={CAB_R - CAB_L} height={CEIL + 1200} fill="#2c3238" />
      <rect x={CAB_L} y={CEIL} width={CAB_R - CAB_L} height={FLOOR_Y - CEIL} fill="#b9b6aa" />
      <rect x={CAB_L} y={CEIL} width={CAB_R - CAB_L} height={34} fill="#9d9a8f" />
      <rect x={CAB_L + 60} y={CEIL + 8} width={260} height={16} rx={8} fill="#fff" opacity={0.85} />
      <rect x={CAB_L} y={FLOOR_Y} width={CAB_R - CAB_L} height={1900} fill="#4c5156" />
      <rect x={CAB_L} y={FLOOR_Y} width={CAB_R - CAB_L} height={8} fill="#6b6f74" />
      <CityStrip scroll={scrollAt(g)} x={CAB_L + 160} w={470} />
      {/* the console: the throttle and the brake */}
      <path d={`M${CAB_L + 60} ${FLOOR_Y} L${CAB_L + 60} 1120 L${CAB_L + 110} 1070 L${CAB_L + 400} 1070 L${CAB_L + 400} ${FLOOR_Y} Z`} fill="#2a3036" stroke="#59626b" strokeWidth={5} />
      {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={CAB_L + 130 + i * 52} y={1092} width={30} height={10} fill={i === 1 ? "#d9534f" : "#2f8f4e"} opacity={0.6 + 0.4 * lamp * (i === 1 ? 1 : 0.4)} />)}
      <g transform={`translate(${CAB_L + 190},1070) rotate(${throttleA})`}>
        <rect x={-6} y={-130} width={12} height={130} rx={6} fill="#c9ced2" />
        <circle cy={-136} r={16} fill="#d9322b" />
      </g>
      <g transform={`translate(${CAB_L + 320},1070) rotate(${brakeA})`}>
        <rect x={-6} y={-150} width={12} height={150} rx={6} fill="#c9ced2" />
        <circle cy={-156} r={18} fill="#e6b13a" />
      </g>
      <circle cx={CAB_L + 100} cy={CEIL + 70} r={12} fill="#ff3b30" opacity={0.3 + 0.7 * lamp} />
      {/* the cab door in the right wall: a steel plate that rolls up into the ceiling box */}
      <rect x={CAB_R - 12} y={CEIL - 20 - (FLOOR_Y - CEIL) * (1 - door)} width={24} height={FLOOR_Y - CEIL + 20} fill="#4a525a" stroke="#8c918f" strokeWidth={4} />
      <rect x={CAB_R - 20} y={-1200} width={40} height={CEIL + 1200 - 20} fill="#2c3238" />
      {door > 0.9 && <circle cx={CAB_R} cy={CEIL + 70} r={9} fill="#ff3b30" />}
    </g>
  );
};

const camB = makeCamera("cab", [
  [B_FROM, 900, 1040, 1.1],
  [c.turnAt - 10, 720, 1040, 1.6],
  [c.faceEnd + 5, 880, 1040, 1.3],
  [c.swingAt, 900, 1040, 1.35],
  [c.hitAt + 20, 880, 1060, 1.3],
  [c.dragAt + 10, 880, 1050, 1.15],
  [c.pushAt, 1100, 1050, 1.1],
  [c.hordeAt, 1250, 1050, 0.95],
  [c.lockAt - 20, 1200, 1040, 1.25],
  [c.lockAt + 25, 960, 1040, 1.2],
  [c.brakeAt, 780, 1040, 1.3],
  [B_END, 780, 1040, 1.1],
]);

const SceneB: React.FC<{ g: number }> = ({ g }) => {
  const people = stageB(g);
  const impact = g >= c.hitAt && g < c.hitAt + 14;
  return (
    <Stage cam={camB(g)}>
      <g transform="translate(2000,0)">
        <TrainInterior frame={g} scroll={scrollAt(g)} doors={0} lights={0.9} station="ราชดำริ" carNumber={1} />
      </g>
      <CabRoom g={g} />
      <Cast g={g} list={people} />
      {impact && <Impact x={DRIVER_X + 60} y={FLOOR_Y + 60 - 260} t={(g - c.hitAt) / 14} />}
    </Stage>
  );
};

// ====================================================================================================================
// Scene D: the platform
// ====================================================================================================================
const D_FROM = c.platformIn;
const TRAIN_W = 3200;
const trainFront = (g: number) => lerp(2700, 200, 1 - Math.pow(1 - ramp(g, c.platformIn, c.stopAt), 3));
const SIDE_DOOR = 230; // offset of the cab's side door behind the train's nose

const stageD = (g: number): Pp[] => {
  const xf = trainFront(g);
  const doorX = xf + SIDE_DOOR;
  const out: Pp[] = [];
  const stepOut = smooth(ramp(g, c.outAt, c.outAt + 40));
  const lookLeft = ramp(g, c.shadowsAt, c.shadowsAt + 25);
  const relief = ramp(g, c.outAt + 30, c.outAt + 60) * (1 - lookLeft);
  const pos = (inside: number, outside: number, lane: number) => ({ x: lerp(doorX + inside, doorX + outside, stepOut), y: lerp(FLOOR_Y + 20, FLOOR_Y + lane, stepOut) });
  const mp = pos(30, 70, 110);
  out.push(P(g, { key: "mike", id: "mike", ...mp, facing: lookLeft > 0.5 ? -1 : 1, walk: stepOut > 0 && stepOut < 1 ? 0.8 : 0, item: "umbrella", swing: 0.08, swingAmp: 10, fear: 0.6 * lookLeft, headTilt: -14 * relief }));
  const np = pos(-40, 140, 150);
  out.push(P(g, { key: "nun", id: "nun", ...np, facing: lookLeft > 0.5 ? -1 : 1, walk: stepOut > 0 && stepOut < 1 ? 0.8 : 0, item: "extinguisher", swing: 0.08, swingAmp: 4, fear: 0.6 * lookLeft, headTilt: -14 * relief }));
  const yp = pos(-110, -20, 190);
  out.push(P(g, { key: "you", id: "you", ...yp, facing: lookLeft > 0.5 ? -1 : 1, walk: stepOut > 0 && stepOut < 1 ? 0.8 : 0, item: "bag", swing: -1.5, swingAmp: 60, fear: 0.7 * lookLeft, headTilt: -16 * relief }));
  return out;
};

const Platform: React.FC<{ g: number }> = ({ g }) => {
  const xf = trainFront(g);
  const doorX = xf + SIDE_DOOR;
  const doorOpen = smooth(ramp(g, c.sideDoorAt, c.sideDoorAt + 30));
  const pound = g >= c.stopAt;
  return (
    <g>
      <defs>
        <linearGradient id="b5-psky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#a9d0ea" /><stop offset="1" stopColor="#f0e6cf" /></linearGradient>
      </defs>
      <rect x={-3000} y={-1500} width={7000} height={2800} fill="url(#b5-psky)" />
      {/* a far skyline */}
      {Array.from({ length: 16 }, (_, i) => {
        const bh = 260 + ((i * 131) % 300);
        return <rect key={i} x={-2000 + i * 330} y={1000 - bh} width={230 + ((i * 41) % 90)} height={bh} fill={i % 2 ? "#a7b4c0" : "#b8c3cd"} />;
      })}
      {/* the station roof, columns and the sign */}
      <rect x={-3000} y={330} width={7000} height={120} fill="#7d838a" />
      {Array.from({ length: 12 }, (_, i) => <rect key={i} x={-1800 + i * 560} y={450} width={36} height={FLOOR_Y - 450} fill="#9aa1a8" />)}
      <g transform="translate(120,0)">
        <rect x={-6} y={450} width={12} height={90} fill="#59626b" />
        <rect x={-210} y={520} width={420} height={96} rx={14} fill="#0d3d2a" stroke="#cfd8de" strokeWidth={5} />
        <text x={0} y={586} textAnchor="middle" fontFamily={fontFamily} fontSize={46} fill="#ffffff">สถานีสุดท้าย</text>
      </g>
      {/* the platform */}
      <rect x={-3000} y={FLOOR_Y} width={7000} height={1900} fill="#b4b0a4" />
      <rect x={-3000} y={FLOOR_Y + 8} width={7000} height={16} fill="#f2c200" />
      <rect x={-3000} y={FLOOR_Y + 40} width={7000} height={250} fill="#a29e92" opacity={0.6} />
      {/* the train: its nose at xf, the body behind it to the right */}
      <g>
        <rect x={xf} y={690} width={TRAIN_W} height={610} rx={30} fill="#e9ecee" stroke="#9aa1a8" strokeWidth={6} />
        <rect x={xf} y={1130} width={TRAIN_W} height={44} fill="#2f8f4e" />
        <rect x={xf} y={1174} width={TRAIN_W} height={20} fill="#1f6a38" />
        {Array.from({ length: 10 }, (_, i) => {
          const wx = xf + 500 + i * 280;
          return (
            <g key={i}>
              <rect x={wx} y={780} width={200} height={230} rx={12} fill="#26323c" stroke="#9aa1a8" strokeWidth={5} />
              {pound && i % 3 === 1 && (
                <g fill="#0b1014" transform={`translate(${wx + 100 + 8 * Math.sin(g * 0.9 + i)},0)`}>
                  <circle cx={0} cy={890} r={34} />
                  <path d="M-60 1010 Q-56 930 0 926 Q56 930 60 1010 Z" />
                  <rect x={-70} y={900 + 6 * Math.sin(g * 1.1 + i)} width={24} height={60} rx={10} transform="rotate(-20 -58 930)" />
                </g>
              )}
            </g>
          );
        })}
        {/* the cab's side door: a dark opening that slides back */}
        <rect x={xf + SIDE_DOOR - 70} y={780} width={140} height={520} fill="#1b2026" />
        <rect x={xf + SIDE_DOOR - 70} y={780} width={140} height={520} fill="#ff6a3a" opacity={0.14 * doorOpen} />
        <g transform={`translate(${-doorOpen * 130},0)`}>
          <rect x={xf + SIDE_DOOR - 70} y={780} width={140} height={520} fill="#cfd8de" stroke="#8c918f" strokeWidth={6} opacity={1 - 0.2 * doorOpen} />
          <rect x={xf + SIDE_DOOR - 40} y={820} width={80} height={140} rx={8} fill="#26323c" />
        </g>
        <path d={`M${xf} 700 Q${xf - 60} 900 ${xf} 1300 Z`} fill="#d6dadd" />
      </g>
    </g>
  );
};

const camD = makeCamera("platform", [
  [D_FROM, 900, 1040, 0.95],
  [c.stopAt, 520, 1050, 1.0],
  [c.sideDoorAt + 10, 480, 1050, 1.25],
  [c.outAt + 20, 520, 1050, 1.3],
  [c.shadowsAt, 360, 1050, 1.15],
  [c.shadowsAt + 90, 200, 1050, 0.95],
  [outroStart, 330, 1050, 1.0],
]);

const SceneD: React.FC<{ g: number }> = ({ g }) => {
  const people = stageD(g);
  const walk = Math.max(0, g - c.shadowsAt) * 0.4;
  const shades = g >= c.shadowsAt - 30 ? [
    zb(g, "s0", "man1", -260 + walk, FLOOR_Y + 70, 1),
    zb(g, "s1", "woman1", -400 + walk, FLOOR_Y + 120, 1),
    zb(g, "s2", "uncle", -550 + walk, FLOOR_Y + 85, 1),
  ] : [];
  const fog = ramp(g, c.shadowsAt - 30, c.shadowsAt + 30);
  return (
    <Stage cam={camD(g)}>
      <Platform g={g} />
      <g opacity={0.9 * fog}><Cast g={g} list={shades} dim={0.28} /></g>
      <g opacity={ramp(g, c.sideDoorAt + 8, c.sideDoorAt + 30)}><Cast g={g} list={people} /></g>
    </Stage>
  );
};

// ====================================================================================================================
// Overlays
// ====================================================================================================================
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

/** the extinguisher hits the driver: a flash with two silhouettes and a star */
const HitSilhouette: React.FC<{ g: number }> = ({ g }) => {
  const a = Math.min(1, ramp(g, c.hitAt - 3, c.hitAt) * (1 - ramp(g, c.hitAt + 6, c.hitAt + 20)));
  if (a <= 0) return null;
  return (
    <AbsoluteFill style={{ opacity: a }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 44%, #f4f1e6 0%, #bdb7a4 38%, #0b0c0e 82%)" }} />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
        <g fill="#070707">
          {/* พี่นุ่น at the right: bun, body, arms raised over her head with the extinguisher */}
          <circle cx={760} cy={800} r={64} />
          <circle cx={780} cy={730} r={28} />
          <path d="M680 1250 Q670 900 750 860 L850 860 Q900 900 880 1250 Z" />
          <path d="M720 900 L560 700 L590 670 L760 840 Z" />
          <rect x={470} y={560} width={120} height={230} rx={40} transform="rotate(-35 530 675)" />
          {/* the driver at the left: cap, head, shoulders, leaning away */}
          <circle cx={300} cy={860} r={70} />
          <path d="M232 836 Q300 770 372 836 L420 850 L370 862 Z" />
          <path d="M200 1250 Q190 940 270 920 L360 920 Q420 950 400 1250 Z" />
          <path d="M360 960 L470 920 L480 950 L380 1000 Z" />
        </g>
        <polygon points="520,610 560,650 610,600 600,670 660,690 600,720 620,780 560,740 520,790 520,730 460,720 510,680" fill="#d8d2bf" />
      </svg>
    </AbsoluteFill>
  );
};

/** close-up of the brake: both hands on the lever, the gauge falling, sparks */
const BrakeClose: React.FC<{ g: number }> = ({ g }) => {
  const t = ramp(g, c.brakeAt, c.slowAt + 40);
  const pull = smooth(ramp(g, c.brakeAt, c.brakeAt + 28));
  const speed = 1 - smooth(ramp(g, c.brakeAt + 10, c.stopAt));
  const needle = lerp(-120, 100, 1 - speed);
  const shake = Math.sin(g * 1.9) * 5 * (1 - speed * 0.2);
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
      <defs>
        <linearGradient id="br-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2a323a" /><stop offset="1" stopColor="#0d1115" /></linearGradient>
      </defs>
      <rect width={W} height={H} fill="url(#br-bg)" />
      {/* the gauge */}
      <g transform={`translate(540,420) translate(${shake * 0.4},0)`}>
        <circle r={230} fill="#0b0f13" stroke="#59626b" strokeWidth={10} />
        {Array.from({ length: 11 }, (_, i) => {
          const a = (-120 + i * 22) * (Math.PI / 180);
          return <line key={i} x1={Math.sin(a) * 170} y1={-Math.cos(a) * 170} x2={Math.sin(a) * 205} y2={-Math.cos(a) * 205} stroke={i > 8 ? "#d9534f" : "#cfd8de"} strokeWidth={8} strokeLinecap="round" />;
        })}
        <g transform={`rotate(${lerp(100, -120, speed)})`}><path d="M-9 20 L0 -190 L9 20 Z" fill="#ffd86b" /></g>
        <circle r={20} fill="#59626b" />
        <text y={110} textAnchor="middle" fontFamily={fontFamily} fontSize={36} fill="#d9dde0">ความเร็ว</text>
      </g>
      {/* the lever and two hands */}
      <g transform={`translate(${540 + shake},1160)`}>
        <rect x={-130} y={140} width={260} height={150} rx={20} fill="#252c33" stroke="#59626b" strokeWidth={6} />
        <g transform={`rotate(${lerp(-14, 22, pull)} 0 140)`}>
          <rect x={-18} y={-330} width={36} height={470} rx={18} fill="#c9ced2" />
          <circle cy={-340} r={44} fill="#e6b13a" stroke="#8a6a1c" strokeWidth={6} />
          <g transform={`translate(0,${-120 + 30 * pull})`}>
            <rect x={-98} y={-34} width={196} height={72} rx={34} fill="#e9c3a3" />
            <rect x={-132} y={-18} width={80} height={46} rx={20} fill="#f4f4f2" />
            <rect x={-60} y={-70} width={120} height={50} rx={22} fill="#e9c3a3" />
            {[-44, -14, 16, 44].map((fx) => <line key={fx} x1={fx} y1={-14} x2={fx} y2={26} stroke="#c9a285" strokeWidth={4} />)}
          </g>
        </g>
      </g>
      {/* sparks and screech marks from below */}
      {Array.from({ length: 22 }, (_, i) => {
        const age = ((g * 3 + i * 17) % 40) / 40;
        const sx = 120 + ((i * 97) % 840);
        const dx = (i % 2 ? 1 : -1) * 90 * age;
        return <line key={i} x1={sx} y1={1850 - 300 * age} x2={sx + dx} y2={1850 - 300 * age + 26} stroke="#ffb347" strokeWidth={5} strokeLinecap="round" opacity={(1 - age) * clamp01(t * 3) * (1 - 0.6 * (1 - speed))} />;
      })}
      <rect y={1300} width={W} height={620} fill="url(#br-bg)" opacity={0.0} />
    </svg>
  );
};

const FaceYou: React.FC<{ g: number }> = ({ g }) => {
  const k = PASSENGERS.you;
  const zoom = 1.02 + 0.1 * ramp(g, c.faceYouAt, le(9));
  const sway = Math.sin(g * 0.11) * 1.2;
  const blink = Math.max(0, 1 - Math.abs(((g % 75) - 30) / 3));
  const look = Math.sin(g * 0.09) * 18; // glances left (the shadows) and right (the train)
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
      <defs>
        <linearGradient id="fy5-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#b9d6e8" /><stop offset="1" stopColor="#5a6a74" /></linearGradient>
        <linearGradient id="fy5-shade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0b0e12" stopOpacity={0} /><stop offset="0.35" stopColor="#0b0e12" stopOpacity={0.85} /><stop offset="1" stopColor="#0b0e12" stopOpacity={0.95} /></linearGradient>
      </defs>
      <rect width={W} height={H} fill="url(#fy5-bg)" />
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
      <rect y={1300} width={W} height={620} fill="url(#fy5-shade)" />
    </svg>
  );
};

const Outro: React.FC<{ g: number }> = ({ g }) => {
  const t = g - outroStart;
  const bg = clamp01((g - (outroStart - 14)) / 14);
  return (
    <AbsoluteFill style={{ opacity: bg }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, #1d242a 0%, #07090b 70%)" }} />
      <div style={{ position: "absolute", left: 80, right: 160, top: 540, textAlign: "center", fontFamily, color: "#f1f1f1" }}>
        <div style={{ fontSize: 66, opacity: clamp01(t / 14), lineHeight: 1.5 }}>ตอนจบ...</div>
        <div style={{ fontSize: 46, opacity: clamp01((t - 26) / 14), lineHeight: 1.6, marginTop: 24, color: "#aeb4b6" }}>ขอบคุณที่ติดตามจนถึงสถานีสุดท้าย</div>
        <div style={{ fontSize: 56, opacity: clamp01((t - 76) / 14), marginTop: 70, color: "#ffd86b" }}>ติดตามภาคต่อ</div>
      </div>
    </AbsoluteFill>
  );
};

const World: React.FC = () => {
  const g = useCurrentFrame();
  const fade = 0.35 + 0.65 * ramp(g, 0, 10);
  const faceOn = g >= c.turnAt + 4 && g < c.turnAt + 4 + ZOMBIE_FACE_FRAMES + 5;
  const brakeOn = g >= c.brakeAt - 4 && g < c.slowAt + 52;
  const youOn = g >= c.faceYouAt && g < outroStart;
  const red = g < c.hitAt ? 0.1 + 0.12 * Math.max(0, Math.sin(g * 0.3)) * ramp(g, 0, 30) : 0;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000", opacity: fade }}>
      <SceneBox g={g} from={0} to={A_END} first><SceneA g={g} /></SceneBox>
      <SceneBox g={g} from={B_FROM} to={B_END}><SceneB g={g} /></SceneBox>
      <SceneBox g={g} from={D_FROM} to={total}><SceneD g={g} /></SceneBox>

      {red > 0 && <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 40%, rgba(150,20,20,${red}) 100%)` }} />}

      {faceOn && (
        <AbsoluteFill style={{ opacity: ramp(g, c.turnAt + 4, c.turnAt + 9) * clamp01((c.turnAt + 4 + ZOMBIE_FACE_FRAMES + 5 - g) / 5) }}>
          <ZombieFace id="driver" frame={g} t={clamp01((g - c.turnAt - 4) / ZOMBIE_FACE_FRAMES)} />
        </AbsoluteFill>
      )}
      <HitSilhouette g={g} />
      {brakeOn && (
        <AbsoluteFill style={{ opacity: ramp(g, c.brakeAt - 4, c.brakeAt + 4) * clamp01((c.slowAt + 52 - g) / 10) }}>
          <BrakeClose g={g} />
        </AbsoluteFill>
      )}
      {youOn && (
        <AbsoluteFill style={{ opacity: ramp(g, c.faceYouAt, c.faceYouAt + 8) * clamp01((outroStart - 4 - g) / 8) }}>
          <FaceYou g={g} />
        </AbsoluteFill>
      )}

      <Card g={g} from={Math.max(le(0), c.hookCut - 80)} to={c.hookCut} style={{ top: 170, left: 150, right: 160, fontSize: 56, lineHeight: 1.5, background: "rgba(11,13,16,0.66)", borderRadius: 32, padding: "22px 16px" }}>
        เปิดห้องคนขับ...<br />ตอนจบ
      </Card>

      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 42%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.5) 100%)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(120,150,170,0.16) 0%, rgba(0,0,0,0) 45%, rgba(190,150,110,0.14) 100%)", mixBlendMode: "soft-light" }} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: 0.08, mixBlendMode: "overlay", pointerEvents: "none" }}>
        <filter id="bts5-grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={g % 7} /><feColorMatrix type="saturate" values="0" /></filter>
        <rect width={W} height={H} filter="url(#bts5-grain)" />
      </svg>

      {g >= outroStart - 14 && <Outro g={g} />}
    </AbsoluteFill>
  );
};

export const Part5: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <World />
    {shots.map((shot, i) => (
      <Sequence key={i} from={starts[i] + shot.leadFrames} durationInFrames={shot.audioFrames}>
        <Audio src={staticFile(shot.audio)} />
        <Subtitle text={shot.text} />
      </Sequence>
    ))}
    <Audio src={staticFile("bts5/bed.wav")} volume={0.5} />
  </AbsoluteFill>
);

export const PART5_TOTAL = total;
void ls;

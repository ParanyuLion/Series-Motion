import React from "react";
import { fontFamily } from "../island/fonts";
import { ANCHOR, makeCamera } from "../bts4/camera";
import { Actor, Beam, Car, Hud, NightBackdrop, PAL } from "./Look";
import { BuildingWall, WetGround } from "./Scenery";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ramp = (g: number, a: number, b: number) => clamp01((g - a) / Math.max(1, b - a));
const smooth = (t: number) => t * t * (3 - 2 * t);
const FADE = 10;
const fade = (g: number, from: number, to: number) => clamp01(Math.min((g - from) / FADE, (to - g) / FADE));

const ROAD_Y = 1420;

/** the street rolling past behind the car: facades in a row, a lit shop sign that passes three times (counter dots 1, 2, 3) */
const Street: React.FC<{ g: number; from: number; circleAt: number; arriveAt: number }> = ({ g, from, circleAt, arriveAt }) => {
  const v = 14; // px per frame while the car moves
  const s = (g - from) * v;
  const P = 1100;
  const facades = [0, 1, 2, 3].map((k) => {
    const x = ((k * 330 - s * 0.55) % P + P) % P - 330;
    return <BuildingWall key={k} x={x} y={560} w={300} h={ROAD_Y - 560} seed={k + 3} />;
  });
  const L = Math.max(3, arriveAt - circleAt);
  const signs = [0, 1, 2].map((i) => {
    const t0 = circleAt + (i * L) / 3;
    const x = 1300 - (g - t0) * 26;
    if (x < -380 || x > 1400) return null;
    return (
      <g key={i} transform={`translate(${x},880)`}>
        <rect x={-10} y={-10} width={300} height={100} rx={18} fill={PAL.accent} opacity={0.18} filter="url(#os-soft)" />
        <rect width={280} height={80} rx={10} fill="#0a1020" stroke="#2a3a5c" strokeWidth={4} />
        <text x={140} y={56} fontSize={44} fill={PAL.accent} textAnchor="middle" fontFamily={fontFamily}>ร้านป้าแดง</text>
        <g transform="translate(140,112)">
          {[0, 1, 2].map((d) => <circle key={d} cx={(d - 1) * 34} cy={0} r={9} fill={d <= i ? PAL.accent : "#1d2a44"} />)}
        </g>
      </g>
    );
  });
  return <g>{facades}{signs}</g>;
};

/** the rear-view mirror as an inset: two pale eyes that move to follow "you" */
const MirrorEyes: React.FC<{ g: number; op: number; look: number }> = ({ g, op, look }) => {
  const blink = g % 140 > 132 ? 0.15 : 1;
  const px = -10 * look; // pupils slide toward the back seat as the driver looks at "you"
  return (
    <g opacity={op} transform="translate(610,300)">
      <rect x={-20} y={-20} width={380} height={160} rx={30} fill="#05080f" stroke={PAL.rim} strokeWidth={4} opacity={0.95} />
      <rect x={0} y={0} width={340} height={120} rx={20} fill="#0b1426" />
      {[110, 230].map((cx) => (
        <g key={cx}>
          <ellipse cx={cx} cy={60} rx={34} ry={20 * blink} fill="#cfd6d9" />
          <circle cx={cx + px} cy={60} r={11 * blink} fill="#04060b" />
          <ellipse cx={cx} cy={60} rx={34} ry={20 * blink} fill="none" stroke="#6f8196" strokeWidth={2} />
        </g>
      ))}
      <path d="M40 38 Q110 22 150 36 M190 36 Q230 22 300 38" fill="none" stroke="#04060b" strokeWidth={6} opacity={0.8} />
    </g>
  );
};

/** the cutaway of the car at night in the rain: the driver in front, "you" in the back, the street rolling past */
export const RideScene: React.FC<{ g: number; from: number; to: number; pickupAt: number; smellAt: number; circleAt: number; arriveAt: number }> = ({ g, from, to, pickupAt, smellAt, circleAt, arriveAt }) => {
  const cam = makeCamera("ride", [
    [from, 540, 1180, 1.0],
    [smellAt, 600, 1190, 1.08],
    [circleAt, 560, 1180, 1.12],
    [arriveAt - 20, 540, 1190, 1.02],
    [to, 540, 1190, 1.02],
  ])(g);
  const bob = Math.sin(g * 0.5) * 1.5;
  const shake = Math.sin(g * 0.9) * 0.8;
  const eyesOp = ramp(g, pickupAt + 12, pickupAt + 30) * (1 - ramp(g, circleAt + 140, circleAt + 152));
  const look = ramp(g, circleAt, circleAt + 30);
  return (
    <g opacity={fade(g, from, to)}>
      <g transform={`translate(${ANCHOR.x},${ANCHOR.y}) rotate(${cam.rot}) scale(${cam.zoom}) translate(${-cam.fx},${-cam.fy})`}>
        <NightBackdrop g={g} x0={-400} x1={1500} />
        <Street g={g} from={from} circleAt={circleAt} arriveAt={arriveAt} />
        <WetGround x0={-400} x1={1500} y={ROAD_Y} bottom={1920} g={g} />
        {/* the car, 1.15x, its centre at x 540 */}
        <g transform={`translate(0,${bob})`}>
          <Beam x={690 + 300 * 1.15} y={ROAD_Y - 150 * 1.15} angle={-2} length={700} spread={120} op={0.8} g={g} />
          <Car x={690} y={ROAD_Y - 34 * 1.15} scale={1.15} />
          {/* inside, lit from the dash: back seat and front seat, the two people */}
          <g transform={`translate(${690},${ROAD_Y - 34 * 1.15}) scale(1.15)`}>
            <clipPath id="os-win"><path d="M-300 -218 Q-232 -312 -100 -314 L60 -312 Q140 -302 178 -218 Z" /></clipPath>
            <g clipPath="url(#os-win)">
              <rect x={-320} y={-330} width={520} height={130} fill="#1a2a48" opacity={0.9} />
              <rect x={-120} y={-300} width={8} height={90} fill="#0c1426" />
            </g>
          </g>
          <g transform={`translate(${690},${ROAD_Y - 34 * 1.15}) scale(1.15)`}>
            <path d="M-318 -222 L186 -222 L186 -78 L-318 -78 Z" fill="#0f1a31" />
            <rect x={-318} y={-86} width={504} height={8} fill="#1d2a44" />
            <rect x={-250} y={-190} width={70} height={118} rx={20} fill="#17233d" />
            <rect x={-20} y={-190} width={70} height={118} rx={20} fill="#17233d" />
            <ellipse cx={-215} cy={-92} rx={60} ry={9} fill="#1d3a5c" opacity={0.5} />
          </g>
          <g transform={`translate(${shake},0)`}>
            <Actor id="osYou" x={690 - 200 * 1.15} y={ROAD_Y - 120} scale={1.05} facing={1} pose="sit" g={g} fear={ramp(g, circleAt, circleAt + 60) * 0.3} />
            <Actor id="osDriver" x={690 + 60 * 1.15} y={ROAD_Y - 120} scale={1.05} facing={1} pose="sit" g={g} />
          </g>
          {/* glass over the people: rain streaks and a wiper sweep */}
          <g transform={`translate(${690},${ROAD_Y - 34 * 1.15}) scale(1.15)`}>
            <path d="M-300 -218 Q-232 -312 -100 -314 L60 -312 Q140 -302 178 -218 Z" fill="#9fb4d6" opacity={0.06} />
            {Array.from({ length: 10 }, (_, i) => <line key={i} x1={-280 + i * 46} y1={-300 + ((i * 37 + g * 4) % 80)} x2={-286 + i * 46} y2={-250 + ((i * 37 + g * 4) % 80)} stroke={PAL.beam} strokeWidth={2} opacity={0.16} />)}
          </g>
        </g>
      </g>
      <MirrorEyes g={g} op={eyesOp} look={look} />
      {/* damp seat shine hint, as a caption-free detail near the back seat */}
      <Hud lines={["คืนฝนตก · 23:00", "เส้นทาง: ที่ทำงาน → บ้านคุณ"]} accent={false} />
    </g>
  );
};

/** you step out at your building in the rain and the car waits: the driver's two eyes, one line of speech lives in the narration */
export const DoorStep: React.FC<{ g: number; from: number; to: number }> = ({ g, from, to }) => {
  const t = ramp(g, from + 10, to - 20);
  const youX = 640 - t * 300;
  return (
    <g opacity={fade(g, from, to)}>
      <NightBackdrop g={g} x0={-400} x1={1500} />
      <BuildingWall x={-40} y={420} w={420} h={ROAD_Y - 420} seed={7} />
      <rect x={110} y={ROAD_Y - 260} width={170} height={260} rx={8} fill="#060a14" stroke="#2a3a5c" strokeWidth={6} />
      <rect x={120} y={ROAD_Y - 250} width={150} height={240} fill={PAL.accent} opacity={0.1} />
      <WetGround x0={-400} x1={1500} y={ROAD_Y} bottom={1920} g={g} />
      <Beam x={720} y={ROAD_Y - 170} angle={180} length={720} spread={120} op={0.55} g={g} />
      <Car x={1060} y={ROAD_Y - 34 * 1.15} scale={1.15} flip lights={0.8} />
      <Actor id="osYou" x={youX} y={ROAD_Y + 20} scale={1.9} facing={-1} walk={t > 0 && t < 1 ? 1 : 0} g={g} fear={0.15} />
    </g>
  );
};

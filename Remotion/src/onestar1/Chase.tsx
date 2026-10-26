import React from "react";
import { ANCHOR, makeCamera } from "../bts4/camera";
import { Actor, Beam, Car, Hud, NightBackdrop, PAL } from "./Look";
import { BuildingWall, Sky, WetGround } from "./Scenery";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ramp = (g: number, a: number, b: number) => clamp01((g - a) / Math.max(1, b - a));
const smooth = (t: number) => t * t * (3 - 2 * t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const FADE = 10;
const fade = (g: number, from: number, to: number) => clamp01(Math.min((g - from) / FADE, (to - g) / FADE));
const ROAD_Y = 1420;

/** the room: a bed, a window onto the rain, the back door; headlights slide across the wall, "you" go to the window, grab the bag, leave */
const Bag: React.FC<{ x: number; y: number; dir: 1 | -1 }> = ({ x, y, dir }) => (
  <g>
    <path d={`M${x + dir * 4} ${y - 110} L${x - dir * 24} ${y - 8}`} stroke={PAL.rim} strokeWidth={4} opacity={0.7} fill="none" />
    <rect x={x - dir * 24 - 28} y={y - 8} width={56} height={70} rx={12} fill="#1c2a48" stroke={PAL.rim} strokeWidth={3} />
  </g>
);

export const HomeScene: React.FC<{ g: number; from: number; to: number; buzzAt: number; lightsAt: number; runAt: number; laughAt: number; againAt: number; dim?: number }> = ({ g, from, to, buzzAt, lightsAt, runAt, laughAt, againAt, dim = 0 }) => {
  const toWin = smooth(ramp(g, lightsAt + 30, lightsAt + 110));
  const leave = smooth(ramp(g, runAt + 8, runAt + 60));
  const x = g < runAt ? lerp(430, 640, toWin) : lerp(640, 150, leave);
  const facing: 1 | -1 = g < runAt + 4 ? 1 : -1;
  const bagOn = g > runAt + 8 && x < 330;
  const phoneShow = ramp(g, buzzAt + 6, buzzAt + 14) * (1 - ramp(g, lightsAt - 12, lightsAt - 2));
  const buzzing = g > buzzAt + 8 && g < buzzAt + 70 ? Math.sin(g * 2.1) * 4 : 0;
  const laughing = g > laughAt + 6 && g < againAt - 6 ? 7 * Math.sin(g * 0.8) : 0;
  const hud = ramp(g, lightsAt - 2, lightsAt + 8);
  const sweep = ramp(g, lightsAt, lightsAt + 110);
  return (
    <g opacity={fade(g, from, to)}>
      <rect x={-200} y={0} width={1500} height={1500} fill="#0e1a34" />
      <rect x={-200} y={0} width={1500} height={1500} fill="url(#os-wall)" />
      <rect x={-200} y={1380} width={1500} height={540} fill="#05080f" />
      <line x1={-200} y1={1380} x2={1300} y2={1380} stroke={PAL.rim} strokeWidth={2} opacity={0.25} />
      {/* window onto the rain, with the city bokeh */}
      <g>
        <rect x={720} y={620} width={230} height={420} fill="#0d1a38" stroke="#1d2a44" strokeWidth={10} />
        <circle cx={800} cy={760} r={40} fill={PAL.accent} opacity={0.45} filter="url(#os-blur)" />
        <circle cx={890} cy={900} r={50} fill="#6fa8ff" opacity={0.4} filter="url(#os-blur)" />
        {Array.from({ length: 9 }, (_, i) => <line key={i} x1={735 + i * 24} y1={630 + ((i * 53 + g * 6) % 380)} x2={731 + i * 24} y2={680 + ((i * 53 + g * 6) % 380)} stroke={PAL.beam} strokeWidth={2} opacity={0.3} />)}
        <path d="M835 620 V1040 M720 830 H950" stroke="#1d2a44" strokeWidth={7} />
      </g>
      {/* bed and a desk lamp */}
      <rect x={-160} y={1220} width={460} height={160} fill="#18284a" /><rect x={-160} y={1180} width={90} height={200} fill="#0b1324" />
      <rect x={-70} y={1190} width={370} height={40} fill="#1b2a48" />
      <rect x={470} y={1250} width={140} height={130} fill="#16233f" stroke={PAL.rim} strokeWidth={2} opacity={0.9} /><rect x={520} y={1215} width={40} height={40} fill="#0b1324" />
      {/* the back door */}
      <rect x={60} y={900} width={170} height={480} fill="#060a14" stroke="#2a3a5c" strokeWidth={6} />
      <rect x={70} y={910} width={150} height={460} fill={PAL.accent} opacity={ramp(g, runAt + 40, runAt + 60) * 0.35} />
      {/* headlights sliding across the wall, cut by the window bars */}
      <g opacity={sweep * (1 - ramp(g, lightsAt + 90, lightsAt + 130)) * 0.7}>
        <polygon points={`${900 - sweep * 900},520 ${1020 - sweep * 900},520 ${760 - sweep * 900},1380 ${600 - sweep * 900},1380`} fill={PAL.beam} opacity={0.22} filter="url(#os-soft)" />
        <polygon points={`${1040 - sweep * 900},520 ${1090 - sweep * 900},520 ${870 - sweep * 900},1380 ${810 - sweep * 900},1380`} fill={PAL.beam} opacity={0.16} filter="url(#os-soft)" />
      </g>
      {!bagOn && g < runAt + 70 && <rect x={200} y={1152} width={56} height={70} rx={12} fill="#1c2a48" stroke={PAL.rim} strokeWidth={3} />}
      <Actor id="osYou" x={x} y={1400} scale={1.9} facing={facing} walk={g >= lightsAt + 30 && g < lightsAt + 110 ? 0.6 : g >= runAt + 8 && g < runAt + 60 ? 1 : 0} g={g} fear={0.2 + 0.6 * ramp(g, lightsAt, runAt)} headTilt={laughing} op={1 - ramp(g, runAt + 52, runAt + 64)} />
      {bagOn && g < runAt + 64 && <Bag x={x} y={1190} dir={facing} />}
      {phoneShow > 0 && (
        <g opacity={phoneShow} transform={`translate(${x + 66 + buzzing},1168) rotate(-12)`}>
          <circle cx={0} cy={0} r={90} fill="#6fa8ff" opacity={0.16} filter="url(#os-blur)" />
          <rect x={-22} y={-40} width={44} height={80} rx={9} fill="#0a1020" stroke={PAL.rim} strokeWidth={3} />
          <rect x={-17} y={-34} width={34} height={68} rx={6} fill="#6fa8ff" opacity={0.5 + 0.2 * Math.sin(g * 0.4)} />
        </g>
      )}
      <rect x={-200} y={0} width={1500} height={1500} fill="#02040a" opacity={dim} />
      <g opacity={hud}><Hud lines={[g >= runAt ? "ถึงใน 1 นาที" : "ถึงใน 5 นาที", "คนขับกำลังมารับคุณ"]} /></g>
    </g>
  );
};

const DEAD_X = 2700;

/** the street seen side-on: "you" run right, the car follows slowly and never gets farther or closer, until the dead end */
export const AlleyChase: React.FC<{ g: number; from: number; to: number; followAt: number; deadEndAt: number; unlockAt: number }> = ({ g, from, to, followAt, deadEndAt, unlockAt }) => {
  const runEnd = deadEndAt - 30;
  const t = smooth(ramp(g, from + 8, runEnd));
  const runnerX = lerp(280, 2540, t);
  const running = g > from + 8 && g < runEnd;
  const S = 1.15;
  const gap = g < deadEndAt ? 400 : lerp(400, 350, smooth(ramp(g, deadEndAt, unlockAt)));
  const frontX = runnerX - gap;
  const carX = frontX - 300 * S;
  const lock = ramp(g, unlockAt, unlockAt + 10);
  const camKeys: Array<[number, number, number, number]> = [
    [from, 150, 1160, 1.0],
    [runEnd, 2390, 1170, 0.95],
    [deadEndAt, 2330, 1160, 0.84],
    [unlockAt, 2200, 1140, 0.74],
    [to, 2200, 1140, 0.74],
  ];
  // the camera key list must be in frame order; followAt may fall before from + 8 only by a few frames
  const cam = makeCamera("chase", camKeys.sort((a, b) => a[0] - b[0]))(g);
  const doorX = carX + (-150) * S;
  const beams = (
    <g>
      <Beam x={frontX - 8} y={ROAD_Y - 34 * S - 150 * S} angle={-2} length={1000} spread={150} g={g} />
      <Beam x={frontX - 8} y={ROAD_Y - 34 * S - 120 * S} angle={3} length={900} spread={130} g={g} />
    </g>
  );
  const lamps = [0, 1, 2, 3, 4].map((i) => (
    <g key={i} transform={`translate(${500 + i * 620},0)`}>
      <rect x={-6} y={760} width={12} height={ROAD_Y - 760} fill="#0a1020" />
      <rect x={-6} y={754} width={90} height={10} fill="#0a1020" />
      <ellipse cx={80} cy={772} rx={70} ry={20} fill={PAL.accent} opacity={0.5} filter="url(#os-soft)" />
    </g>
  ));
  return (
    <g opacity={fade(g, from, to)}>
      <g transform={`translate(${ANCHOR.x},${ANCHOR.y}) rotate(${cam.rot}) scale(${cam.zoom}) translate(${-cam.fx},${-cam.fy})`}>
        <NightBackdrop g={g} x0={-500} x1={3800} y1={3000} />
        <Sky x0={-500} x1={3800} horizon={900} top={-100} g={g} />
        {Array.from({ length: 11 }, (_, k) => <BuildingWall key={k} x={k * 340 - 60} y={560 - (k % 3) * 90} w={300} h={ROAD_Y - 560 + (k % 3) * 90} seed={k + 11} sign={k === 3 ? "ร้านป้าแดง" : undefined} />)}
        {/* the dead end: a blank wall, a bin, bags */}
        <rect x={DEAD_X} y={300} width={900} height={ROAD_Y - 300} fill="#0b1322" />
        <rect x={DEAD_X} y={300} width={900} height={ROAD_Y - 300} fill="url(#os-wall)" />
        {Array.from({ length: 12 }, (_, i) => <line key={i} x1={DEAD_X} y1={340 + i * 90} x2={DEAD_X + 900} y2={340 + i * 90} stroke="#16213a" strokeWidth={2} opacity={0.7} />)}
        <rect x={DEAD_X - 190} y={ROAD_Y - 190} width={170} height={190} fill="#0e1a2c" stroke="#1d2a44" strokeWidth={4} />
        <rect x={DEAD_X - 200} y={ROAD_Y - 210} width={190} height={26} fill="#16213a" />
        <ellipse cx={DEAD_X - 250} cy={ROAD_Y - 40} rx={44} ry={40} fill="#05080f" />
        <WetGround x0={-500} x1={3800} y={ROAD_Y} bottom={3000} g={g} />
        {lamps.map((l) => l)}
        {beams}
        <Car x={carX} y={ROAD_Y - 34 * S} scale={S} />
        {/* the rear door: a handle, and the lock icon that pops up */}
        <g transform={`translate(${doorX},${ROAD_Y - 34 * S - 140 * S})`}>
          <rect x={-60 * S} y={-60 * S} width={4} height={150 * S} fill={PAL.rim} opacity={0.35} />
          <rect x={-8} y={-20} width={44} height={10} rx={5} fill={PAL.rim} opacity={0.7} />
          <g opacity={lock} transform={`translate(0,${-140 - 24 * (1 - lock)}) scale(${1.6 + 0.4 * lock})`}>
            <circle r={52} fill={PAL.accent} opacity={0.2} filter="url(#os-soft)" />
            <rect x={-26} y={-6} width={52} height={40} rx={8} fill={PAL.accent} />
            <path d="M-14 -6 V-18 A14 14 0 0 1 12 -22" fill="none" stroke={PAL.accent} strokeWidth={8} strokeLinecap="round" />
            <circle cx={0} cy={14} r={6} fill="#0a1020" />
          </g>
        </g>
        <Bag x={runnerX} y={ROAD_Y + 20 - 210} dir={g >= deadEndAt ? -1 : 1} />
        <Actor id="osYou" x={runnerX} y={ROAD_Y + 20} scale={1.9} facing={g >= deadEndAt ? -1 : 1} walk={running ? 1 : 0} g={g} fear={0.4 + 0.5 * ramp(g, runEnd - 40, deadEndAt)} op={ramp(g, from, from + 14)} />
      </g>
      <Hud lines={[g < deadEndAt ? "ถึงใน 1 นาที" : g < unlockAt ? "ถึงใน 0 นาที" : "ถึงแล้ว", "คนขับกำลังมารับคุณ"]} />
    </g>
  );
};

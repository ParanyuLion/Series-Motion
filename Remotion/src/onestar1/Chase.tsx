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

/** the wall of the room: wallpaper stripes, skirting, a hanging lamp, a clock at 00:17, frames, a shelf with books and a plant, an air conditioner */
const RoomBack: React.FC<{ g: number }> = ({ g }) => (
  <g>
    {Array.from({ length: 16 }, (_, i) => <line key={i} x1={-180 + i * 92} y1={0} x2={-180 + i * 92} y2={1380} stroke="#16264a" strokeWidth={3} opacity={0.35} />)}
    <rect x={-200} y={1340} width={1500} height={40} fill="#101a30" />
    <line x1={-200} y1={1340} x2={1300} y2={1340} stroke={PAL.rim} strokeWidth={2} opacity={0.2} />
    {/* hanging lamp, off, with a faint glow of the street on its shade */}
    <line x1={540} y1={0} x2={540} y2={330} stroke="#0a1020" strokeWidth={4} />
    <path d="M470 400 L510 330 L570 330 L610 400 Z" fill="#101a30" stroke={PAL.rim} strokeWidth={2} opacity={0.9} />
    <ellipse cx={540} cy={402} rx={70} ry={10} fill={PAL.beam} opacity={0.12} filter="url(#os-soft)" />
    {/* the air conditioner with a green standby light */}
    <rect x={250} y={130} width={380} height={110} rx={16} fill="#121d36" stroke={PAL.rim} strokeWidth={2} opacity={0.95} />
    {Array.from({ length: 6 }, (_, i) => <line key={i} x1={280} y1={190 + i * 8} x2={600} y2={190 + i * 8} stroke="#0a1020" strokeWidth={3} />)}
    <circle cx={580} cy={160} r={5} fill="#46d37a" opacity={0.7 + 0.3 * Math.sin(g * 0.1)} />
    {/* clock at 00:17 */}
    <g transform="translate(110,520)">
      <circle r={62} fill="#0e1830" stroke={PAL.rim} strokeWidth={4} />
      {Array.from({ length: 12 }, (_, i) => <line key={i} x1={0} y1={-52} x2={0} y2={-44} stroke={PAL.rim} strokeWidth={3} opacity={0.7} transform={`rotate(${i * 30})`} />)}
      <line x1={0} y1={0} x2={0} y2={-30} stroke="#e8eefc" strokeWidth={6} strokeLinecap="round" transform="rotate(8)" />
      <line x1={0} y1={0} x2={0} y2={-46} stroke="#e8eefc" strokeWidth={4} strokeLinecap="round" transform="rotate(102)" />
      <circle r={5} fill={PAL.accent} />
    </g>
    {/* two frames */}
    <rect x={250} y={450} width={150} height={190} fill="#0b1224" stroke="#2a3a5c" strokeWidth={6} />
    <path d="M262 600 L310 540 L340 575 L365 545 L390 600 Z" fill="#16264a" />
    <circle cx={350} cy={490} r={16} fill={PAL.accent} opacity={0.35} />
    <rect x={430} y={500} width={110} height={140} fill="#0b1224" stroke="#2a3a5c" strokeWidth={6} />
    <rect x={446} y={520} width={78} height={100} fill="#14223f" />
    {/* the shelf: books leaning, a plant */}
    <rect x={120} y={780} width={420} height={14} fill="#16264a" />
    {[0, 1, 2, 3, 4, 5, 6].map((i) => <rect key={i} x={140 + i * 26} y={780 - 60 - (i % 3) * 8} width={20} height={60 + (i % 3) * 8} fill={["#1d2a44", "#24365a", "#16213a"][i % 3]} stroke="#0a1020" strokeWidth={1} />)}
    <path d="M440 780 L430 725 L500 725 L490 780 Z" fill="#1a2744" />
    <path d="M465 725 Q440 660 420 640 M465 725 Q470 650 480 620 M465 725 Q500 670 520 650" fill="none" stroke="#1d4a3a" strokeWidth={8} strokeLinecap="round" />
  </g>
);

/** the furniture: a bed with a blanket and pillow, a bedside table with a mug, a desk with a laptop glowing, a rug, shoes by the door, a coat on a hook, curtains */
const RoomFront: React.FC<{ g: number }> = ({ g }) => (
  <g>
    <ellipse cx={560} cy={1440} rx={460} ry={46} fill="#101a34" stroke="#1d2a44" strokeWidth={3} />
    <ellipse cx={560} cy={1440} rx={320} ry={28} fill="none" stroke="#1d2a44" strokeWidth={3} />
    {/* bed */}
    <rect x={-160} y={1220} width={460} height={160} fill="#18284a" />
    <rect x={-160} y={1160} width={90} height={220} fill="#0b1324" />
    <rect x={-70} y={1190} width={370} height={46} rx={12} fill="#22365e" />
    <path d="M-70 1236 Q60 1262 300 1236 L300 1300 L-70 1300 Z" fill="#1b2e52" />
    <ellipse cx={-10} cy={1180} rx={64} ry={26} fill="#2a3f68" />
    <line x1={20} y1={1236} x2={250} y2={1236} stroke={PAL.rim} strokeWidth={2} opacity={0.2} />
    <rect x={-150} y={1380} width={16} height={30} fill="#0b1324" /><rect x={270} y={1380} width={16} height={30} fill="#0b1324" />
    {/* bedside table with a mug */}
    <rect x={320} y={1260} width={120} height={120} fill="#16233f" stroke={PAL.rim} strokeWidth={2} opacity={0.95} />
    <rect x={330} y={1300} width={100} height={6} fill="#0a1020" />
    <rect x={364} y={1226} width={34} height={34} rx={6} fill="#24365a" stroke={PAL.rim} strokeWidth={2} />
    <path d="M398 1236 Q416 1244 398 1254" fill="none" stroke={PAL.rim} strokeWidth={3} />
    {/* the desk and the laptop, its screen the only warm-cold light in the room */}
    <rect x={470} y={1270} width={280} height={18} fill="#1d2a44" stroke={PAL.rim} strokeWidth={2} opacity={0.9} />
    <rect x={490} y={1288} width={14} height={92} fill="#16213a" /><rect x={716} y={1288} width={14} height={92} fill="#16213a" />
    <path d="M530 1270 L548 1160 L690 1160 L700 1270 Z" fill="#0a1020" stroke={PAL.rim} strokeWidth={2} opacity={0.95} />
    <path d="M540 1262 L555 1170 L684 1170 L692 1262 Z" fill="#6fa8ff" opacity={0.16 + 0.05 * Math.sin(g * 0.1)} />
    <ellipse cx={610} cy={1210} rx={150} ry={80} fill="#6fa8ff" opacity={0.1} filter="url(#os-blur)" />
    {/* the back door: shoes and a coat */}
    <path d="M70 1380 Q80 1352 120 1352 L150 1352 Q164 1380 154 1380 Z" fill="#0b1224" stroke={PAL.rim} strokeWidth={2} opacity={0.8} />
    <path d="M170 1380 Q180 1356 214 1356 L240 1356 Q252 1380 244 1380 Z" fill="#0b1224" stroke={PAL.rim} strokeWidth={2} opacity={0.8} />
    <circle cx={250} cy={930} r={7} fill={PAL.rim} opacity={0.5} />
    <path d="M232 944 L268 944 L286 1100 L214 1100 Z" fill="#14223f" stroke={PAL.rim} strokeWidth={2} opacity={0.9} />
    {/* curtains at the window */}
    <path d="M690 600 L750 600 L742 1060 L690 1060 Z" fill="#101a30" stroke="#1d2a44" strokeWidth={3} />
    <path d="M960 600 L1020 600 L1020 1060 L950 1060 Z" fill="#101a30" stroke="#1d2a44" strokeWidth={3} />
    {[0, 1, 2].map((i) => <line key={i} x1={706 + i * 14} y1={606} x2={704 + i * 12} y2={1054} stroke="#0a1020" strokeWidth={3} opacity={0.8} />)}
    <rect x={680} y={590} width={350} height={12} fill="#1d2a44" />
    {/* wooden floor lines */}
    {Array.from({ length: 12 }, (_, i) => <line key={i} x1={-200 + i * 130} y1={1380} x2={-260 + i * 140} y2={1700} stroke="#0b1324" strokeWidth={3} opacity={0.8} />)}
  </g>
);

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
      <RoomBack g={g} />
      {/* window onto the rain, with the city bokeh */}
      <g>
        <rect x={720} y={620} width={230} height={420} fill="#0d1a38" stroke="#1d2a44" strokeWidth={10} />
        <circle cx={800} cy={760} r={40} fill={PAL.accent} opacity={0.45} filter="url(#os-blur)" />
        <circle cx={890} cy={900} r={50} fill="#6fa8ff" opacity={0.4} filter="url(#os-blur)" />
        {Array.from({ length: 9 }, (_, i) => <line key={i} x1={735 + i * 24} y1={630 + ((i * 53 + g * 6) % 380)} x2={731 + i * 24} y2={680 + ((i * 53 + g * 6) % 380)} stroke={PAL.beam} strokeWidth={2} opacity={0.3} />)}
        <path d="M835 620 V1040 M720 830 H950" stroke="#1d2a44" strokeWidth={7} />
      </g>
      <RoomFront g={g} />
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

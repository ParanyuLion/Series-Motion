import React from "react";
import { fontFamily } from "../island/fonts";
import { PAL } from "../onestar1/Look";
import { rnd } from "./util";

// The sets of the finale. Each is ONE fully drawn world in its own coordinates; the camera (WorldCam) moves through it and every
// close-up is that same world seen through `dof` (a depth-of-field blur), so the picture never drops to an empty backdrop.
// Needs <Defs3 /> inside the same <svg>.

export const WARM = "#ffc27a";
export const COLD = "#6fa8ff";

export const Defs3: React.FC = () => (
  <defs>
    <filter id="os3-d1" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="4" /></filter>
    <filter id="os3-d2" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="10" /></filter>
    <filter id="os3-d3" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="20" /></filter>
    <linearGradient id="os3-wallH" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0a1226" /><stop offset="1" stopColor="#16243f" /></linearGradient>
    <linearGradient id="os3-floorH" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1a1812" /><stop offset="1" stopColor="#07080c" /></linearGradient>
    <radialGradient id="os3-lampGlow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor={WARM} stopOpacity="0.9" /><stop offset="0.35" stopColor={WARM} stopOpacity="0.35" /><stop offset="1" stopColor={WARM} stopOpacity="0" /></radialGradient>
    <radialGradient id="os3-coldGlow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#bcd4ff" stopOpacity="0.8" /><stop offset="0.4" stopColor={COLD} stopOpacity="0.28" /><stop offset="1" stopColor={COLD} stopOpacity="0" /></radialGradient>
    <linearGradient id="os3-plat" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#101a2e" /><stop offset="1" stopColor="#040609" /></linearGradient>
    <linearGradient id="os3-seat" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#233a66" /><stop offset="1" stopColor="#0d1830" /></linearGradient>
    <linearGradient id="os3-wood" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#3a2a1e" /><stop offset="1" stopColor="#201510" /></linearGradient>
  </defs>
);

/** wraps a world in a blur level 0..3 (0 sharp) */
export const Dof: React.FC<{ level: number; children: React.ReactNode }> = ({ level, children }) =>
  level <= 0 ? <g>{children}</g> : <g filter={`url(#os3-d${Math.min(3, Math.round(level))})`}>{children}</g>;

const Streaks: React.FC<{ g: number; x: number; y: number; w: number; h: number; n?: number; seed?: number }> = ({ g, x, y, w, h, n = 16, seed = 0 }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const sx = x + rnd(i + seed) * w;
      const sp = 0.6 + rnd(i + seed + 30) * 1.6;
      const sy = y + ((rnd(i + seed + 60) * h * 2 + g * sp) % (h * 1.2)) - h * 0.1;
      const len = 40 + rnd(i + seed + 90) * 90;
      return <path key={i} d={`M${sx} ${sy} q${(rnd(i + seed + 120) - 0.5) * 10} ${len * 0.5} 0 ${len}`} stroke="#9ec0ff" strokeWidth={2 + rnd(i + seed + 150) * 2} fill="none" opacity={0.28} strokeLinecap="round" />;
    })}
  </g>
);

const Bokeh: React.FC<{ x: number; y: number; w: number; h: number; n: number; seed?: number; warm?: number }> = ({ x, y, w, h, n, seed = 0, warm = 0.5 }) => (
  <g filter="url(#os3-d3)">
    {Array.from({ length: n }, (_, i) => (
      <circle key={i} cx={x + rnd(i + seed) * w} cy={y + rnd(i + seed + 40) * h} r={22 + rnd(i + seed + 80) * 46} fill={rnd(i + seed + 120) < warm ? WARM : COLD} opacity={0.35 + rnd(i + seed + 7) * 0.35} />
    ))}
  </g>
);

/* ------------------------------------------------------------------ the carriage ------------------------------------------------------------------ */

/** the last train, empty: the far wall of the carriage with four rain-streaked windows, blue bench seats, handrails and straps, flickering light bars, a wet floor */
export const Carriage: React.FC<{ g: number; ghost?: number }> = ({ g, ghost = 0 }) => {
  const flick = g % 97 > 92 ? 0.55 : 1;
  const windows = [150, 560, 970, 1380];
  return (
    <g>
      <rect x={-200} y={-200} width={2600} height={2400} fill="#070b16" />
      {/* the far wall panel */}
      <rect x={-200} y={160} width={2600} height={1000} fill="#0f1a32" />
      <rect x={-200} y={160} width={2600} height={1000} fill="url(#os3-wallH)" opacity={0.7} />
      {Array.from({ length: 30 }, (_, i) => <line key={i} x1={-200 + i * 96} y1={160} x2={-200 + i * 96} y2={1160} stroke="#18284a" strokeWidth={3} opacity={0.5} />)}
      {/* ceiling and light bars */}
      <rect x={-200} y={-200} width={2600} height={360} fill="#0a1020" />
      <rect x={-200} y={150} width={2600} height={22} fill="#1a2a4a" />
      {[120, 700, 1280, 1860].map((x) => (
        <g key={x} opacity={flick}>
          <rect x={x} y={90} width={420} height={40} rx={14} fill="#dfeaff" opacity={0.92} />
          <rect x={x - 40} y={110} width={500} height={420} fill="#9fc0ff" opacity={0.08} filter="url(#os3-d2)" />
        </g>
      ))}
      {/* windows with the night outside */}
      {windows.map((x, k) => (
        <g key={x}>
          <rect x={x - 14} y={300} width={392} height={612} rx={26} fill="#05080f" stroke="#22345c" strokeWidth={8} />
          <rect x={x} y={314} width={364} height={584} rx={16} fill="#060b18" />
          <Bokeh x={x} y={470} w={360} h={360} n={7} seed={k * 11} warm={0.55} />
          <rect x={x} y={314} width={364} height={584} rx={16} fill="url(#os3-wallH)" opacity={0.35} />
          <Streaks g={g} x={x} y={314} w={364} h={584} n={14} seed={k * 17} />
          <line x1={x + 182} y1={314} x2={x + 182} y2={898} stroke="#22345c" strokeWidth={6} />
          <path d={`M${x + 14} 330 L${x + 120} 330 L${x + 40} 560 Z`} fill="#cfe0ff" opacity={0.05} />
        </g>
      ))}
      {/* a faint pale face in the glass of the third window: the thing that waited */}
      <g opacity={0.1 + 0.05 * Math.sin(g * 0.03) + 0.3 * ghost} transform="translate(1152,520)">
        <ellipse cx={0} cy={0} rx={58} ry={74} fill="#dfe5f2" filter="url(#os3-d1)" />
        <ellipse cx={-20} cy={-8} rx={9} ry={6} fill="#05080f" /><ellipse cx={20} cy={-8} rx={9} ry={6} fill="#05080f" />
      </g>
      {/* handrail and straps */}
      <rect x={-200} y={222} width={2600} height={14} fill="#aebbd6" opacity={0.55} />
      <rect x={-200} y={222} width={2600} height={4} fill="#fff" opacity={0.35} />
      {Array.from({ length: 11 }, (_, i) => {
        const sx = 20 + i * 215;
        const sw = Math.sin(g * 0.03 + i) * 5;
        return (
          <g key={i} transform={`translate(${sx + sw},236)`}>
            <line x1={0} y1={0} x2={0} y2={70} stroke="#22345c" strokeWidth={6} />
            <ellipse cx={0} cy={118} rx={34} ry={48} fill="none" stroke="#aebbd6" strokeWidth={9} opacity={0.75} />
          </g>
        );
      })}
      {/* transverse seats seen from the side (the rider sits in profile): a low sill under the windows, then a row of seat profiles facing right */}
      <rect x={-200} y={920} width={2600} height={30} fill="#0c1428" />
      <rect x={-200} y={946} width={2600} height={5} fill={PAL.rim} opacity={0.3} />
      {Array.from({ length: 9 }, (_, i) => {
        const x0 = 1010 - 1920 + i * 480;
        return (
          <g key={i}>
            <rect x={x0 - 150} y={1200} width={170} height={110} fill="#0a1226" />
            <rect x={x0 - 98} y={930} width={44} height={270} rx={18} fill="url(#os3-seat)" stroke="#2c4678" strokeWidth={3} />
            <rect x={x0 - 98} y={930} width={44} height={270} rx={18} fill="#14264a" opacity={0.5} />
            <rect x={x0 - 98} y={930} width={6} height={270} fill={PAL.rim} opacity={0.35} />
            <rect x={x0 - 98} y={1158} width={250} height={52} rx={20} fill="url(#os3-seat)" stroke="#2c4678" strokeWidth={3} />
            <rect x={x0 - 98} y={1158} width={250} height={6} fill={PAL.rim} opacity={0.35} />
            <rect x={x0 - 60} y={1212} width={30} height={100} fill="#0c1428" /><rect x={x0 + 100} y={1212} width={30} height={100} fill="#0c1428" />
          </g>
        );
      })}
      {/* floor, wet reflections of the light bars */}
      <rect x={-200} y={1180} width={2600} height={900} fill="#080c16" />
      <rect x={-200} y={1180} width={2600} height={14} fill="#16213a" />
      {[120, 700, 1280, 1860].map((x) => <rect key={x} x={x} y={1240} width={420} height={420} fill="#9fc0ff" opacity={0.06 * flick} filter="url(#os3-d2)" />)}
      {Array.from({ length: 9 }, (_, i) => <ellipse key={i} cx={100 + i * 270} cy={1330 + (i % 3) * 130} rx={90 + (i % 2) * 50} ry={16} fill="#0c1a38" opacity={0.8} />)}
      {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M${60 + i * 400} 1300 q30 6 60 0 m30 40 q30 6 60 0`} stroke="#22345c" strokeWidth={4} fill="none" opacity={0.5} />)}
      {/* a crumpled flyer on the floor, a drip from the roof */}
      <path d="M980 1420 l40 -14 l24 22 l-34 20 z" fill="#aab6cc" opacity={0.4} />
      <circle cx={1500} cy={560 + ((g * 6) % 700)} r={5} fill="#9ec0ff" opacity={0.5} />
    </g>
  );
};

/* ------------------------------------------------------------------ the last station ------------------------------------------------------------------ */

/** the last station at night: an old canopy with flickering lights, the train's lit side at the left, a closed kiosk, a vending machine, the bench, the flower stall, wet platform */
export const Station: React.FC<{ g: number }> = ({ g }) => {
  const f = (i: number) => (g + i * 13) % 83 > 79 ? 0.4 : 1;
  return (
    <g>
      <rect x={-300} y={-300} width={3200} height={2600} fill="#050811" />
      {/* far sky and skyline above the canopy */}
      <rect x={-300} y={-300} width={3200} height={700} fill="#0a1226" />
      <ellipse cx={1500} cy={150} rx={900} ry={260} fill="#16306a" opacity={0.35} filter="url(#os3-d3)" />
      {Array.from({ length: 22 }, (_, i) => {
        const bw = 90 + rnd(i + 5) * 120;
        const bh = 140 + rnd(i + 9) * 260;
        return <rect key={i} x={-300 + i * 150} y={420 - bh} width={bw} height={bh + 6} fill="#080e1e" />;
      })}
      {Array.from({ length: 46 }, (_, i) => <rect key={i} x={-280 + rnd(i + 3) * 3100} y={200 + rnd(i + 8) * 220} width={9} height={12} fill={rnd(i) > 0.5 ? PAL.accent : "#9fc3ff"} opacity={0.45} />)}
      {/* the canopy: a steel beam with trusses and lights */}
      <rect x={-300} y={380} width={3200} height={64} fill="#0d1628" />
      <rect x={-300} y={440} width={3200} height={10} fill={PAL.rim} opacity={0.25} />
      {Array.from({ length: 30 }, (_, i) => <path key={i} d={`M${-300 + i * 110} 380 L${-245 + i * 110} 444 L${-190 + i * 110} 380`} stroke="#1a2a4a" strokeWidth={5} fill="none" />)}
      {[200, 760, 1320, 1880, 2440].map((x, i) => (
        <g key={x} opacity={f(i)}>
          <rect x={x} y={452} width={260} height={26} rx={10} fill="#e9f1ff" />
          <polygon points={`${x - 30},478 ${x + 290},478 ${x + 420},1330 ${x - 160},1330`} fill="#9fc0ff" opacity={0.07} filter="url(#os3-d1)" />
        </g>
      ))}
      {/* back wall of the station: a shuttered kiosk, a notice board, a vending machine */}
      <rect x={-300} y={460} width={3200} height={860} fill="#0d172c" />
      <rect x={-300} y={460} width={3200} height={860} fill="url(#os3-wallH)" opacity={0.55} />
      {Array.from({ length: 40 }, (_, i) => <line key={i} x1={-300 + i * 90} y1={460} x2={-300 + i * 90} y2={1320} stroke="#16264a" strokeWidth={3} opacity={0.5} />)}
      <rect x={1010} y={640} width={420} height={560} rx={10} fill="#0a1020" stroke="#22345c" strokeWidth={6} />
      {Array.from({ length: 12 }, (_, i) => <line key={i} x1={1020} y1={660 + i * 46} x2={1420} y2={660 + i * 46} stroke="#16264a" strokeWidth={5} />)}
      <rect x={1010} y={600} width={420} height={44} fill="#16213a" />
      <text x={1220} y={634} fontSize={32} fill={PAL.accent} textAnchor="middle" fontFamily={fontFamily} opacity={0.8}>ปิดบริการ</text>
      <rect x={1520} y={620} width={290} height={580} rx={14} fill="#0b1a36" stroke="#2a4678" strokeWidth={5} />
      <rect x={1545} y={650} width={240} height={380} rx={8} fill="#7fb0ff" opacity={0.28} />
      {Array.from({ length: 4 }, (_, r) => Array.from({ length: 3 }, (_, c) => <rect key={`${r}${c}`} x={1560 + c * 76} y={668 + r * 90} width={56} height={70} rx={8} fill={["#c9a0b0", "#7a9a6a", "#e2b995"][(r + c) % 3]} opacity={0.5} />))}
      <rect x={1545} y={650} width={240} height={380} rx={8} fill="#bcd4ff" opacity={0.1} filter="url(#os3-d1)" />
      <ellipse cx={1665} cy={1230} rx={260} ry={40} fill="#6fa8ff" opacity={0.2} filter="url(#os3-d2)" />
      <rect x={1940} y={560} width={360} height={260} fill="#0a1020" stroke="#22345c" strokeWidth={5} />
      <text x={2120} y={640} fontSize={40} fill={PAL.rim} textAnchor="middle" fontFamily={fontFamily} opacity={0.75}>สถานีสุดท้าย</text>
      <text x={2120} y={700} fontSize={26} fill={PAL.rim} textAnchor="middle" fontFamily={fontFamily} opacity={0.5}>ขบวนสุดท้ายออกแล้ว</text>
      {/* the train at the left: its lit side with doors and windows */}
      <rect x={-340} y={560} width={900} height={760} rx={30} fill="#16233f" />
      <rect x={-340} y={560} width={900} height={14} fill={PAL.rim} opacity={0.5} />
      {[-300, 40].map((x) => <rect key={x} x={x} y={620} width={250} height={420} rx={22} fill="#e0c382" opacity={0.55} />)}
      <rect x={330} y={620} width={150} height={640} rx={14} fill="#f0d18a" opacity={0.7} />
      <line x1={405} y1={620} x2={405} y2={1260} stroke="#16233f" strokeWidth={8} />
      <rect x={-340} y={1280} width={900} height={60} fill="#080c16" />
      {/* the stall: awning, cart, buckets of flowers, a hanging lamp */}
      <g transform="translate(0,0)">
        <polygon points="1880,740 2420,740 2470,860 1830,860" fill="#2a2132" />
        {Array.from({ length: 6 }, (_, i) => <polygon key={i} points={`${1880 + i * 90},740 ${1925 + i * 90},740 ${1900 + i * 90 - 10},860 ${1850 + i * 90},860`} fill={i % 2 ? "#3c2a44" : "#201826"} />)}
        <line x1={2155} y1={860} x2={2155} y2={940} stroke="#16213a" strokeWidth={4} />
        <circle cx={2155} cy={970} r={150} fill="url(#os3-lampGlow)" />
        <circle cx={2155} cy={960} r={22} fill="#ffe3b0" />
        <rect x={1900} y={1130} width={510} height={170} rx={14} fill="url(#os3-wood)" />
        {[1930, 2050, 2170, 2290].map((x, k) => (
          <g key={x}>
            <path d={`M${x} 1060 L${x + 20} 1180 L${x + 90} 1180 L${x + 110} 1060 Z`} fill="#1e2a40" stroke={PAL.rim} strokeWidth={2} opacity={0.95} />
            {Array.from({ length: 6 }, (_, i) => <g key={i}><line x1={x + 55} y1={1060} x2={x + 20 + i * 14} y2={960 - (i % 3) * 30} stroke="#3a5a3a" strokeWidth={4} /><circle cx={x + 20 + i * 14} cy={950 - (i % 3) * 30} r={20} fill={["#c9a0b0", "#e6d9de", "#a86a8a"][(i + k) % 3]} opacity={0.88} /></g>)}
          </g>
        ))}
        <ellipse cx={2155} cy={1320} rx={330} ry={26} fill={WARM} opacity={0.18} filter="url(#os3-d2)" />
      </g>
      {/* the bench */}
      <g transform="translate(1250,70)">
        <rect x={0} y={1130} width={430} height={26} rx={8} fill="#2c2a2e" />
        <rect x={0} y={1010} width={430} height={26} rx={8} fill="#2c2a2e" />
        <rect x={10} y={1010} width={16} height={330} fill="#1a1c28" /><rect x={404} y={1010} width={16} height={330} fill="#1a1c28" />
        <rect x={0} y={1130} width={430} height={5} fill={PAL.rim} opacity={0.4} />
      </g>
      {/* the platform: wet, with the yellow safety line, puddles and light reflections */}
      <rect x={-300} y={1320} width={3200} height={900} fill="url(#os3-plat)" />
      <rect x={-300} y={1320} width={3200} height={22} fill="#1a2640" />
      <rect x={-300} y={1480} width={3200} height={16} fill={PAL.accent} opacity={0.78} />
      <rect x={-300} y={1560} width={3200} height={14} fill="#16213a" />
      {Array.from({ length: 9 }, (_, i) => <ellipse key={i} cx={-100 + i * 330} cy={1400 + (i % 3) * 90} rx={120 + (i % 2) * 70} ry={18} fill="#0b1a3a" opacity={0.9} />)}
      {[330, 880, 1440, 2000, 2560].map((x, i) => <rect key={x} x={x} y={1350} width={200} height={300} fill="#bcd4ff" opacity={0.05 * f(i)} filter="url(#os3-d2)" />)}
      <ellipse cx={2155} cy={1400} rx={300} ry={30} fill={WARM} opacity={0.2} filter="url(#os3-d2)" />
      {/* posts and the rails below the platform edge */}
      {[640, 1470, 1760].map((x) => <g key={x}><rect x={x} y={440} width={34} height={900} fill="#0c1426" stroke="#1a2a4a" strokeWidth={3} /><rect x={x} y={440} width={5} height={900} fill={PAL.rim} opacity={0.4} /></g>)}
      <rect x={-300} y={1700} width={3200} height={26} fill="#101a2e" /><rect x={-300} y={1830} width={3200} height={26} fill="#101a2e" />
      <Streaks g={g} x={-300} y={460} w={3200} h={900} n={60} seed={5} />
    </g>
  );
};

/* ------------------------------------------------------------------ the house ------------------------------------------------------------------ */

/** the aunt's small house: peeling wallpaper with damp, a curtained window with blue light, shelves with jars and an old photo, buckets of dead flowers,
 *  a table with a steaming cup and a lamp, a locked door; `lamp` flickers the warm light, `steam` rises from the cup */
export const House: React.FC<{ g: number; lampOn?: number; door?: number }> = ({ g, lampOn = 1, door = 0 }) => {
  const flick = (0.9 + 0.1 * Math.sin(g * 0.31) * Math.sin(g * 0.113)) * lampOn;
  return (
    <g>
      <rect x={-300} y={-300} width={3000} height={2600} fill="#06080f" />
      {/* the wall with wallpaper stripes, damp stains and a ceiling edge */}
      <rect x={-300} y={0} width={3000} height={1260} fill="#101a30" />
      {Array.from({ length: 52 }, (_, i) => <rect key={i} x={-300 + i * 58} y={0} width={26} height={1260} fill="#16264a" opacity={0.35} />)}
      <rect x={-300} y={0} width={3000} height={1260} fill="url(#os3-wallH)" opacity={0.6} />
      {[[100, 120, 300, 200], [1500, 60, 380, 260], [2200, 300, 260, 340], [880, 380, 200, 120]].map(([x, y, w, h], i) => <ellipse key={i} cx={x} cy={y} rx={w} ry={h} fill="#05070e" opacity={0.42} filter="url(#os3-d3)" />)}
      <path d="M1620 180 q30 90 -10 160 q40 20 50 60" stroke="#070a14" strokeWidth={6} fill="none" opacity={0.7} />
      <rect x={-300} y={-300} width={3000} height={380} fill="#080c18" />
      <rect x={-300} y={70} width={3000} height={16} fill="#1a2a4a" />
      <rect x={-300} y={1220} width={3000} height={44} fill="#0a1020" />
      <rect x={-300} y={1258} width={3000} height={5} fill={PAL.rim} opacity={0.3} />
      {/* the window: curtains, rain-streaked glass, a cold light patch */}
      <g>
        <rect x={380} y={240} width={400} height={620} fill="#04070f" stroke="#2a3d68" strokeWidth={10} />
        <Bokeh x={390} y={430} w={380} h={400} n={7} seed={77} warm={0.5} />
        <Streaks g={g} x={390} y={250} w={380} h={600} n={18} seed={19} />
        <line x1={580} y1={240} x2={580} y2={860} stroke="#2a3d68" strokeWidth={8} /><line x1={380} y1={520} x2={780} y2={520} stroke="#2a3d68" strokeWidth={8} />
        <rect x={340} y={860} width={480} height={26} fill="#16213a" />
        <path d="M300 200 Q330 540 290 900 L420 900 Q460 520 400 200 Z" fill="#1d1a2e" /><path d="M860 200 Q830 540 870 900 L740 900 Q700 520 760 200 Z" fill="#1d1a2e" />
        {[330, 360, 390, 780, 810, 840].map((x) => <line key={x} x1={x} y1={210} x2={x + (x < 500 ? -6 : 6)} y2={880} stroke="#0b0a16" strokeWidth={5} opacity={0.7} />)}
        <rect x={240} y={186} width={640} height={16} rx={8} fill="#3a2f2a" />
        <polygon points="400,890 760,890 1020,1260 140,1260" fill="#9fc0ff" opacity={0.08} filter="url(#os3-d2)" />
      </g>
      {/* shelf with jars, a clock and the old photograph; hanging dried flowers */}
      <g>
        <rect x={930} y={470} width={640} height={22} fill="url(#os3-wood)" /><rect x={930} y={760} width={640} height={22} fill="url(#os3-wood)" />
        {[0, 1, 2, 3, 4].map((i) => <g key={i}><rect x={960 + i * 98} y={380 + (i % 2) * 26} width={74} height={90 - (i % 2) * 26} rx={10} fill="#1d2e4a" stroke="#34507c" strokeWidth={2} /><rect x={966 + i * 98} y={392 + (i % 2) * 26} width={62} height={30} fill={["#a86a8a", "#7a9a6a", "#e6d9de", "#c9a0b0", "#5a7aa8"][i]} opacity={0.5} /></g>)}
        <circle cx={1380} cy={640} r={78} fill="#14223c" stroke="#3c5a8c" strokeWidth={8} /><line x1={1380} y1={640} x2={1380} y2={585} stroke="#cfd8ea" strokeWidth={5} /><line x1={1380} y1={640} x2={1418} y2={660} stroke="#cfd8ea" strokeWidth={5} />
        <g transform="translate(1080,560)"><rect x={0} y={0} width={160} height={200} fill="#2a2018" stroke="#5a4634" strokeWidth={8} /><rect x={14} y={14} width={132} height={172} fill="#7b7468" opacity={0.65} /><circle cx={56} cy={80} r={22} fill="#3a342e" /><circle cx={104} cy={86} r={20} fill="#3a342e" /><path d="M24 186 Q56 130 80 150 Q104 120 136 186 Z" fill="#3a342e" /></g>
        {Array.from({ length: 3 }, (_, i) => <g key={i} transform={`translate(${1400 + i * 52},86)`}><line x1={0} y1={0} x2={0} y2={50} stroke="#3a2f22" strokeWidth={3} /><path d={`M0 50 q-14 20 -6 70 q6 -10 12 0 q10 -50 -6 -70`} fill="#5a4636" /><circle cx={-2} cy={116} r={11} fill="#6a4a5a" opacity={0.7} /></g>)}
      </g>
      {/* buckets of dead flowers at both sides */}
      {[[40, 1120], [200, 1180], [2040, 1140], [2200, 1190]].map(([x, y], k) => (
        <g key={k}>
          <path d={`M${x} ${y} L${x + 20} ${y + 160} L${x + 130} ${y + 160} L${x + 150} ${y} Z`} fill="#1e2a40" stroke={PAL.rim} strokeWidth={2} opacity={0.95} />
          {Array.from({ length: 7 }, (_, i) => <g key={i}><path d={`M${x + 75} ${y} Q${x + 20 + i * 18} ${y - 110} ${x + 6 + i * 22} ${y - 150 + (i % 2) * 20}`} stroke="#3a3a28" strokeWidth={5} fill="none" /><ellipse cx={x + 6 + i * 22} cy={y - 150 + (i % 2) * 20} rx={18} ry={22} fill={["#5a4636", "#6a4a5a", "#4a3e30"][(i + k) % 3]} transform={`rotate(${(i - 3) * 16} ${x + 6 + i * 22} ${y - 150})`} /></g>)}
        </g>
      ))}
      {/* the door with its lock and a chain; `door` opens it a crack onto the cold lane */}
      <g transform="translate(2230,1260) scale(0.5) translate(-2230,-1260)">
      <rect x={1900} y={150} width={330} height={1110} fill="#bcd4ff" opacity={0.9 * door} />
      <polygon points="1900,1260 2230,1260 1500,1500 1300,1500" fill="#bcd4ff" opacity={0.18 * door} />
      <g transform={`translate(2230,0) scale(${1 - 0.8 * door},1) translate(-2230,0) translate(1900,0)`}>
        <rect x={0} y={150} width={330} height={1110} fill="#1b1520" stroke="#35283a" strokeWidth={8} />
        <rect x={34} y={200} width={262} height={380} fill="#140f18" stroke="#35283a" strokeWidth={5} /><rect x={34} y={640} width={262} height={540} fill="#140f18" stroke="#35283a" strokeWidth={5} />
        <circle cx={48} cy={900} r={34} fill="#3a2f24" stroke="#9a8460" strokeWidth={4} /><rect x={34} y={960} width={44} height={110} rx={10} fill="#9a8460" opacity={0.85} />
        <circle cx={56} cy={1006} r={8} fill="#0b0810" />
        <path d="M60 640 q20 40 50 20 q30 -20 60 10" stroke="#9a8460" strokeWidth={5} fill="none" />
        <rect x={0} y={150} width={330} height={1110} fill="#0a0e1c" opacity={0.25} />
      </g>
      </g>
      {/* the floor: planks, damp prints, the lamp's reflection */}
      <rect x={-300} y={1263} width={3000} height={900} fill="url(#os3-floorH)" />
      {Array.from({ length: 11 }, (_, i) => <line key={i} x1={-300} y1={1290 + i * i * 4 + i * 40} x2={2700} y2={1290 + i * i * 4 + i * 40} stroke="#07080c" strokeWidth={4} opacity={0.8} />)}
      {Array.from({ length: 22 }, (_, i) => <line key={i} x1={-300 + i * 140} y1={1263} x2={-700 + i * 260} y2={2000} stroke="#07080c" strokeWidth={3} opacity={0.55} />)}
      {[[760, 1420], [900, 1500], [1040, 1430], [1180, 1520]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx={42} ry={14} fill="#05070e" opacity={0.6} />)}
      {/* a rug */}
      <ellipse cx={1160} cy={1560} rx={520} ry={92} fill="#2a1e2a" opacity={0.9} /><ellipse cx={1160} cy={1560} rx={430} ry={70} fill="none" stroke="#5a3a4a" strokeWidth={6} opacity={0.6} />
      {/* the table: the cup, the pot, the lamp */}
      <g>
        <rect x={880} y={1160} width={600} height={34} rx={6} fill="url(#os3-wood)" />
        <rect x={880} y={1160} width={600} height={5} fill={WARM} opacity={0.5 * flick} />
        <rect x={900} y={1190} width={40} height={300} fill="#2a1e16" /><rect x={1420} y={1190} width={40} height={300} fill="#2a1e16" />
        <rect x={890} y={1194} width={580} height={40} fill="#1c130e" />
        <g transform="translate(1060,1160)">
          <path d="M-46 0 L-38 -76 L38 -76 L46 0 Z" fill="#cfd6e4" stroke="#8a95ae" strokeWidth={3} /><ellipse cx={0} cy={-76} rx={38} ry={9} fill="#5a3a22" />
          <path d="M44 -58 q38 4 30 32 q-6 14 -34 14" fill="none" stroke="#cfd6e4" strokeWidth={8} />
          {[0, 1, 2].map((i) => {
            const t = ((g * 0.012 + i / 3) % 1);
            return <path key={i} d={`M${-12 + i * 12} ${-86 - t * 150} q${14 * Math.sin(t * 9 + i)} -24 0 -52`} stroke="#dfe7f4" strokeWidth={10} fill="none" opacity={0.4 * (1 - t)} filter="url(#os3-d1)" strokeLinecap="round" />;
          })}
        </g>
        <g transform="translate(1400,1160)">
          <rect x={-8} y={-300} width={16} height={300} fill="#2a2018" /><ellipse cx={0} cy={-4} rx={48} ry={10} fill="#2a2018" />
          <path d="M-70 -300 L70 -300 L46 -388 L-46 -388 Z" fill="#6a5238" /><path d="M-60 -300 L60 -300 L40 -380 L-40 -380 Z" fill={WARM} opacity={0.75 * flick} />
        </g>
        <circle cx={1400} cy={920} r={540} fill="url(#os3-lampGlow)" opacity={0.7 * flick} />
        <ellipse cx={1160} cy={1200} rx={420} ry={50} fill={WARM} opacity={0.28 * flick} filter="url(#os3-d2)" />
      </g>
      {/* dust in the lamp light */}
      {Array.from({ length: 26 }, (_, i) => <circle key={i} cx={1000 + rnd(i) * 800 + Math.sin(g * 0.02 + i) * 18} cy={500 + rnd(i + 9) * 700 + Math.cos(g * 0.015 + i * 2) * 14} r={1.8 + rnd(i + 3) * 2.4} fill="#ffe7bf" opacity={0.5 * flick} />)}
    </g>
  );
};

/* ------------------------------------------------------------------ the lane ------------------------------------------------------------------ */

/** the lane behind the station: two wet walls with windows and pipes, a lamp with warm bokeh, a doorway with warm light, puddles; a headlight glow far at the end when `glow` > 0 */
export const Lane: React.FC<{ g: number; glow?: number }> = ({ g, glow = 0 }) => (
  <g>
    <rect x={-300} y={-300} width={2800} height={2600} fill="#050811" />
    <rect x={-300} y={0} width={2800} height={900} fill="#0a1226" />
    <ellipse cx={1000} cy={600} rx={900} ry={300} fill="#16306a" opacity={0.3} filter="url(#os3-d3)" />
    {/* the far end of the lane: a dark block with a few windows */}
    <rect x={720} y={420} width={560} height={920} fill="#080e1e" />
    {Array.from({ length: 12 }, (_, i) => <rect key={i} x={750 + (i % 4) * 130} y={470 + Math.floor(i / 4) * 150} width={64} height={86} fill={rnd(i + 300) > 0.65 ? "#c9a55a" : "#05080f"} opacity={rnd(i + 300) > 0.65 ? 0.5 : 1} />)}
    {/* left wall */}
    <rect x={-300} y={100} width={1020} height={1400} fill="#0c1426" />
    <polygon points="720,100 720,1340 600,1500 600,60" fill="#09101e" />
    {Array.from({ length: 5 }, (_, r) => Array.from({ length: 3 }, (_, c) => <g key={`${r}${c}`}><rect x={-120 + c * 250} y={220 + r * 230} width={110} height={150} fill={rnd(r * 5 + c + 90) > 0.6 ? "#c9a55a" : "#060a14"} opacity={rnd(r * 5 + c + 90) > 0.6 ? 0.55 : 1} /><rect x={-120 + c * 250} y={220 + r * 230} width={110} height={150} fill="none" stroke="#1d2a44" strokeWidth={5} /></g>))}
    <rect x={610} y={100} width={22} height={1360} fill="#16213a" />
    {/* right wall */}
    <rect x={1280} y={100} width={1200} height={1400} fill="#0c1426" />
    <polygon points="1280,100 1280,1340 1400,1500 1400,60" fill="#09101e" />
    {Array.from({ length: 5 }, (_, r) => Array.from({ length: 3 }, (_, c) => <g key={`${r}${c}`}><rect x={1470 + c * 230} y={200 + r * 230} width={110} height={150} fill={rnd(r * 5 + c + 190) > 0.7 ? "#c9a55a" : "#060a14"} opacity={rnd(r * 5 + c + 190) > 0.7 ? 0.5 : 1} /><rect x={1470 + c * 230} y={200 + r * 230} width={110} height={150} fill="none" stroke="#1d2a44" strokeWidth={5} /></g>))}
    {/* the aunt's doorway on the left wall with warm light spilling onto the lane */}
    <g transform="translate(390,0)">
      <rect x={0} y={780} width={220} height={560} fill="#1b1520" stroke="#35283a" strokeWidth={8} />
      <rect x={0} y={780} width={220} height={560} fill={WARM} opacity={0.35} />
      <polygon points="0,1340 220,1340 520,1620 -260,1620" fill={WARM} opacity={0.12} filter="url(#os3-d2)" />
    </g>
    {/* a pipe, cables, a lamp post with bokeh */}
    <path d="M620 220 Q990 330 1290 200" stroke="#050810" strokeWidth={4} fill="none" /><path d="M620 270 Q990 400 1290 250" stroke="#050810" strokeWidth={3} fill="none" />
    <g transform="translate(1130,0)">
      <rect x={-8} y={400} width={16} height={940} fill="#0c1426" /><circle cx={0} cy={400} r={20} fill="#ffe3b0" />
      <circle cx={0} cy={400} r={190} fill="url(#os3-lampGlow)" />
      <polygon points="-30,420 30,420 190,1340 -190,1340" fill={WARM} opacity={0.08} filter="url(#os3-d2)" />
    </g>
    {/* the ground, puddles with reflections */}
    <rect x={-300} y={1340} width={2800} height={800} fill="url(#os3-plat)" />
    <rect x={-300} y={1340} width={2800} height={16} fill="#16213a" />
    {Array.from({ length: 8 }, (_, i) => <g key={i}><ellipse cx={100 + i * 280} cy={1470 + (i % 3) * 110} rx={110 + (i % 2) * 60} ry={17} fill="#0b1a3a" /><ellipse cx={100 + i * 280} cy={1470 + (i % 3) * 110} rx={70} ry={8} fill={i % 2 ? WARM : COLD} opacity={0.22} filter="url(#os3-d1)" /></g>)}
    {/* the far end: headlights as a glow on the wet ground and the wall */}
    <ellipse cx={1000} cy={1380} rx={420} ry={60} fill="#cfe0ff" opacity={0.5 * glow} filter="url(#os3-d3)" />
    <rect x={930} y={1318} width={140} height={60} rx={20} fill="#05070c" opacity={glow} />
    <circle cx={950} cy={1352} r={16} fill="#fff" opacity={0.95 * glow} filter="url(#os3-d1)" /><circle cx={1050} cy={1352} r={16} fill="#fff" opacity={0.95 * glow} filter="url(#os3-d1)" />
    <Streaks g={g} x={-300} y={100} w={2800} h={1300} n={60} seed={41} />
  </g>
);

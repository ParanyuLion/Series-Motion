import React from "react";
import { fontFamily } from "../island/fonts";
import { Actor, Beam, Car, NightBackdrop, PAL } from "../onestar1/Look";
import { BuildingWall, Sky, WetGround } from "../onestar1/Scenery";
import { AngleProps, Hand, Layer, Rain, lerp, ramp, rnd, smooth } from "./util";

// Part 2 angles, outdoors and in the shop: the fence, the view through it, the shop, the shelf, the counter, the back door.

/** side view of the dead-end alley: the car with its rear door open, "you" rising behind the fence and over it */
export const ClimbFence: React.FC<AngleProps> = (p) => {
  const { g, from, to } = p;
  const t = smooth(ramp(g, from + 8, to - 6));
  const feet = lerp(1560, 1240, t);
  const x = lerp(880, 960, t);
  return (
    <Layer {...p} bg="#05080f">
      <NightBackdrop g={g} x0={0} x1={1080} />
      <BuildingWall x={-60} y={380} w={330} h={1100} seed={31} />
      <WetGround x0={0} x1={1080} y={1440} bottom={1920} g={g} />
      <Beam x={560} y={1290} angle={-2} length={620} g={g} op={0.35} />
      <Car x={560} y={1450} scale={0.62} lights={0.8} />
      <polygon points="330,1250 420,1180 420,1300 330,1340" fill="#cfe0ff" opacity={0.18} />
      <Actor id="osYou" x={x} y={feet} scale={1.5} g={g} fear={0.8} facing={1} walk={t < 0.95 ? 0.4 : 0} />
      <g>
        <rect x={700} y={1060} width={420} height={480} fill="#0a1220" />
        {Array.from({ length: 9 }, (_, i) => <line key={i} x1={720 + i * 46} y1={1060} x2={720 + i * 46} y2={1540} stroke="#16213a" strokeWidth={4} />)}
        <rect x={700} y={1050} width={420} height={14} fill="#16213a" />
        <line x1={700} y1={1050} x2={1120} y2={1050} stroke={PAL.rim} strokeWidth={3} opacity={0.5} />
      </g>
      <Rain g={g} from={from} />
    </Layer>
  );
};

/** looking back through the bars of the fence: slow headlights sliding across the alley behind them */
export const ThroughFence: React.FC<AngleProps> = (p) => {
  const { g, from, to } = p;
  const t = smooth(ramp(g, from, to));
  const lx = lerp(-300, 520, t);
  return (
    <Layer {...p} bg="#04070e">
      <NightBackdrop g={g} x0={0} x1={1080} />
      <BuildingWall x={-80} y={300} w={360} h={1200} seed={32} />
      <BuildingWall x={800} y={420} w={320} h={1100} seed={33} />
      <WetGround x0={0} x1={1080} y={1380} bottom={1920} g={g} />
      <Beam x={lx} y={1250} angle={-3} length={1500} spread={190} g={g} op={0.5 + 0.4 * t} />
      <Beam x={lx} y={1290} angle={3} length={1400} spread={190} g={g} op={0.4 + 0.4 * t} />
      <g opacity={0.95}>
        <rect x={lx - 80} y={1190} width={240} height={150} rx={40} fill="#070b14" />
        <circle cx={lx + 130} cy={1262} r={30} fill={PAL.beam} filter="url(#os-soft)" />
        <circle cx={lx + 130} cy={1262} r={11} fill="#fff" />
      </g>
      {Array.from({ length: 13 }, (_, i) => (
        <g key={i}>
          <rect x={i * 90 - 8} y={-100} width={40} height={2200} fill="#05070c" />
          <line x1={i * 90 - 8} y1={-100} x2={i * 90 - 8} y2={2100} stroke={PAL.rim} strokeWidth={2} opacity={0.35} />
        </g>
      ))}
      <rect x={-100} y={1000} width={1300} height={26} fill="#05070c" />
      <rect x={-100} y={1000} width={1300} height={26} fill="none" stroke={PAL.rim} strokeWidth={2} opacity={0.3} />
      <Rain g={g} from={from} op={0.22} seed={7} />
    </Layer>
  );
};

/** the shop at night: the brightest place of the story, cold light spilling on the wet ground; "you" run in through the door */
export const StoreWide: React.FC<AngleProps> = (p) => {
  const { g, from, to } = p;
  const t = ramp(g, from, to - 16);
  const x = lerp(-120, 640, smooth(t));
  const inside = t > 0.78 ? 1 - ramp(t, 0.78, 0.96) : 1;
  return (
    <Layer {...p} bg="#05080f">
      <NightBackdrop g={g} x0={0} x1={1080} />
      <Sky x0={0} x1={1080} horizon={900} top={-100} g={g} />
      <BuildingWall x={-40} y={380} w={200} h={1100} seed={41} />
      <BuildingWall x={940} y={300} w={200} h={1180} seed={42} />
      <rect x={160} y={760} width={780} height={700} fill="#0c1426" />
      <rect x={190} y={900} width={720} height={520} fill="#a9d6d0" opacity={0.78} />
      <rect x={190} y={900} width={720} height={520} fill="#0a1a30" opacity={0.22} />
      {[960, 1080, 1200, 1320].map((y, i) => <g key={i}><rect x={230} y={y} width={300} height={10} fill="#1c3a44" />{Array.from({ length: 5 }, (_, k) => <rect key={k} x={240 + k * 58} y={y - 56} width={40} height={56} fill={rnd(i * 9 + k) > 0.5 ? "#6a8f94" : "#c9d8d4"} />)}</g>)}
      <rect x={620} y={930} width={250} height={490} fill="#0a1a30" opacity={0.5} />
      <g transform="translate(250,810)"><rect x={-10} y={-8} width={600} height={76} rx={14} fill="#a9d6d0" opacity={0.2} filter="url(#os-soft)" /><rect width={580} height={60} rx={8} fill="#08121f" stroke="#1d3a44" strokeWidth={3} /><text x={290} y={43} fontSize={36} fill="#cfeee8" textAnchor="middle" fontFamily={fontFamily}>เปิด 24 ชั่วโมง</text></g>
      <polygon points="190,1420 910,1420 1080,1920 20,1920" fill="#a9d6d0" opacity={0.16} filter="url(#os-blur)" />
      <WetGround x0={0} x1={1080} y={1440} bottom={1920} g={g} />
      <Actor id="osYou" x={x} y={1440} scale={1.55} g={g} fear={0.9} walk={1} op={inside} />
      <rect x={160} y={760} width={30} height={700} fill="#0c1426" />
      <rect x={910} y={760} width={30} height={700} fill="#0c1426" />
      <Rain g={g} from={from} n={30} />
    </Layer>
  );
};

/** the shelf by the counter: rows of white power banks, a hand takes one down; the shelf light is cold and flat */
export const RackGrab: React.FC<AngleProps> = (p) => {
  const { g, from, to } = p;
  const t = smooth(ramp(g, from + 10, to - 20));
  const hx = lerp(1000, 540, Math.min(1, t * 1.5));
  const hy = lerp(1500, 1080 - 180 * Math.max(0, t - 0.5) * 2, Math.min(1, t * 1.5));
  const taken = t > 0.62;
  const box = (x: number, y: number, k: number) => (
    <g key={k}>
      <rect x={x} y={y} width={150} height={290} rx={22} fill="#c5d4d8" />
      <rect x={x + 18} y={y + 28} width={54} height={36} rx={6} fill="#0b1522" />
      <text x={x + 45} y={y + 56} fontSize={20} fill="#7fe0c8" textAnchor="middle" fontFamily={fontFamily}>100%</text>
      <rect x={x + 18} y={y + 200} width={114} height={8} fill="#8aa0a8" />
    </g>
  );
  return (
    <Layer {...p} bg="#07101a">
      <rect x={0} y={0} width={1080} height={1920} fill="#0a1a26" />
      <ellipse cx={540} cy={760} rx={620} ry={500} fill="#a9d6d0" opacity={0.12} filter="url(#os-blur)" />
      {[0, 1].map((r) => (
        <g key={r}>
          {Array.from({ length: 6 }, (_, i) => (r === 1 && i === 3 && taken ? null : box(60 + i * 160, 480 + r * 420, r * 10 + i)))}
          <rect x={0} y={770 + r * 420} width={1080} height={20} fill="#1a2c3a" />
        </g>
      ))}
      <rect x={0} y={1340} width={1080} height={580} fill="#050a12" />
      <g transform={`translate(${hx - 540},${hy - 1080})`}>
        {taken && <g transform="translate(540,1160)"><rect x={-75} y={0} width={150} height={290} rx={22} fill="#c5d4d8" /><rect x={-57} y={28} width={54} height={36} rx={6} fill="#0b1522" /></g>}
        <Hand x={540} y={1080} rot={0} grip={ramp(t, 0.4, 0.62)} />
      </g>
    </Layer>
  );
};

/** the counter: a small screen with the app's countdown among the lottery tickets, and the register's chime as rings */
export const CounterScreen: React.FC<AngleProps & { minutes: number; chime?: boolean }> = (p) => {
  const { g, from, minutes, chime = false } = p;
  const ph = ((g - from) % 40) / 40;
  return (
    <Layer {...p} bg="#07101a">
      <rect x={0} y={0} width={1080} height={1920} fill="#0a1a26" />
      <ellipse cx={540} cy={820} rx={560} ry={460} fill="#a9d6d0" opacity={0.1} filter="url(#os-blur)" />
      <rect x={0} y={1150} width={1080} height={770} fill="#0c1a28" />
      <rect x={0} y={1140} width={1080} height={16} fill="#2a4a58" />
      <g transform="translate(220,560)">
        <rect x={0} y={400} width={640} height={180} rx={24} fill="#0b121c" stroke="#2a4a58" strokeWidth={4} />
        <rect x={60} y={-80} width={520} height={520} rx={36} fill="#080e18" stroke={PAL.rim} strokeWidth={4} />
        <rect x={90} y={-50} width={460} height={290} rx={20} fill="#050a12" />
        <text x={320} y={110} fontSize={52} fill={PAL.rim} textAnchor="middle" fontFamily={fontFamily} opacity={0.8}>แอปเรียกรถ</text>
        <text x={320} y={200} fontSize={74} fill={PAL.accent} textAnchor="middle" fontFamily={fontFamily}>ถึงใน {minutes} นาที</text>
        <rect x={120} y={290} width={400} height={60} rx={10} fill="#16213a" />
        <text x={320} y={334} fontSize={32} fill="#e8eefc" textAnchor="middle" fontFamily={fontFamily}>{chime ? "ติ๊ง" : "ยอดรวม 129"}</text>
        {chime && [0, 1, 2].map((k) => {
          const r = ((ph + k / 3) % 1);
          return <circle key={k} cx={320} cy={110} r={120 + r * 380} fill="none" stroke={PAL.accent} strokeWidth={5} opacity={0.5 * (1 - r)} />;
        })}
      </g>
      {Array.from({ length: 7 }, (_, i) => <rect key={i} x={60 + i * 150} y={1190 + (i % 2) * 20} width={110} height={70} rx={8} fill={rnd(i) > 0.5 ? "#16303c" : "#1c2438"} />)}
    </Layer>
  );
};

/** the way out through the stockroom: boxes along the wall, an open door with rain and blue light at the end */
export const BackDoor: React.FC<AngleProps> = (p) => {
  const { g, from, to } = p;
  const t = ramp(g, from, to - 10);
  const x = lerp(60, 760, smooth(t));
  return (
    <Layer {...p} bg="#05080f">
      <rect x={0} y={300} width={1080} height={1150} fill="#0a1522" />
      <rect x={0} y={1440} width={1080} height={480} fill="#060c16" />
      {Array.from({ length: 8 }, (_, i) => <rect key={i} x={20 + i * 70} y={1100 - (i % 3) * 120} width={64} height={340 + (i % 3) * 120} fill={i % 2 ? "#15303a" : "#1a2432"} stroke="#0a1220" strokeWidth={3} />)}
      <rect x={830} y={560} width={250} height={880} fill="#0f1c34" />
      <rect x={860} y={600} width={190} height={840} fill="#6fa8ff" opacity={0.2} />
      <polygon points="860,1440 1050,1440 1080,1920 760,1920" fill="#6fa8ff" opacity={0.14} filter="url(#os-blur)" />
      <g transform="translate(900,500)"><rect width={130} height={52} rx={8} fill="#0b2a22" stroke="#2fa080" strokeWidth={3} /><text x={65} y={38} fontSize={30} fill="#7fe0c8" textAnchor="middle" fontFamily={fontFamily}>ทางออก</text></g>
      <Actor id="osYou" x={x} y={1440} scale={1.5} g={g} fear={0.9} walk={1} />
      <Rain g={g} from={from} n={14} op={0.16} />
    </Layer>
  );
};

/** the platform: pillars, the yellow line, a hanging board with the app's countdown, the rails below; the flower seller stands further along */
export const Platform: React.FC<AngleProps & { minutes: number; seller?: boolean; youX?: number }> = (p) => {
  const { g, from, to, minutes, seller = false, youX = 320 } = p;
  const t = ramp(g, from, to);
  return (
    <Layer {...p} bg="#05080f">
      <rect x={0} y={0} width={1080} height={420} fill="#070d1a" />
      {[120, 480, 840].map((x) => <rect key={x} x={x} y={0} width={60} height={1450} fill="#0c1426" stroke="#16213a" strokeWidth={3} />)}
      <rect x={0} y={1080} width={1080} height={20} fill="#16213a" />
      <g transform="translate(250,400)">
        <line x1={120} y1={-400} x2={120} y2={0} stroke="#16213a" strokeWidth={6} /><line x1={560} y1={-400} x2={560} y2={0} stroke="#16213a" strokeWidth={6} />
        <rect x={0} y={0} width={680} height={170} rx={20} fill="#05080f" stroke={PAL.rim} strokeWidth={4} />
        <text x={340} y={72} fontSize={42} fill={PAL.rim} textAnchor="middle" fontFamily={fontFamily} opacity={0.7}>ขบวนถัดไป · - - : - -</text>
        <text x={340} y={140} fontSize={60} fill={PAL.accent} textAnchor="middle" fontFamily={fontFamily}>ถึงใน {minutes} นาที</text>
      </g>
      <rect x={0} y={1440} width={1080} height={480} fill="#050a14" />
      <rect x={0} y={1420} width={1080} height={44} fill="#16213a" />
      <rect x={0} y={1448} width={1080} height={14} fill={PAL.accent} opacity={0.75} />
      <ellipse cx={540} cy={1560} rx={620} ry={60} fill="#0a1a38" />
      <rect x={0} y={1640} width={1080} height={24} fill="#16213a" />
      <rect x={0} y={1740} width={1080} height={24} fill="#16213a" />
      <g opacity={0.5}>{Array.from({ length: 8 }, (_, i) => <circle key={i} cx={80 + i * 140} cy={640 + (i % 3) * 30} r={46 + (i % 2) * 20} fill={i % 2 ? PAL.accent : "#6fa8ff"} opacity={0.28} filter="url(#os-blur)" />)}</g>
      <Actor id="osYou" x={lerp(youX - 60, youX, smooth(t))} y={1420} scale={1.5} g={g} fear={0.8} walk={t < 0.8 ? 1 : 0} />
      {seller && (
        <g>
          <Actor id="osFlower" x={760} y={1420} scale={1.45} g={g} facing={-1} />
          <g transform="translate(690,1300)" filter="url(#os-rim)">
            <rect x={-40} y={0} width={90} height={60} rx={10} fill="#3a2a22" />
            {Array.from({ length: 7 }, (_, i) => <circle key={i} cx={-30 + i * 14} cy={-8 - (i % 3) * 12} r={13} fill={i % 2 ? "#a86a8a" : "#c9a0b0"} />)}
          </g>
        </g>
      )}
    </Layer>
  );
};

/** the board in close-up: dark panel, a dot grid, the countdown big */
export const BoardClose: React.FC<AngleProps & { minutes: number }> = (p) => {
  const { g, from, minutes } = p;
  const flick = 0.85 + 0.15 * Math.sin((g - from) * 0.7);
  return (
    <Layer {...p} bg="#03050a">
      <rect x={60} y={560} width={960} height={620} rx={40} fill="#05080f" stroke={PAL.rim} strokeWidth={6} />
      {Array.from({ length: 14 }, (_, i) => <line key={i} x1={100} y1={600 + i * 40} x2={980} y2={600 + i * 40} stroke="#0c1426" strokeWidth={2} />)}
      <text x={540} y={720} fontSize={56} fill={PAL.rim} textAnchor="middle" fontFamily={fontFamily} opacity={0.65}>ขบวนถัดไป</text>
      <text x={540} y={830} fontSize={70} fill={PAL.rim} textAnchor="middle" fontFamily={fontFamily} opacity={0.4}>- - : - -</text>
      <text x={540} y={1050} fontSize={140} fill={PAL.accent} textAnchor="middle" fontFamily={fontFamily} opacity={flick}>ถึงใน {minutes} นาที</text>
      <rect x={60} y={560} width={960} height={620} rx={40} fill={PAL.accent} opacity={0.05 * flick} filter="url(#os-blur)" />
    </Layer>
  );
};

/** the track bed seen from the platform edge looking down: sleepers, two rails, the lanyard falling into it */
export const LanyardFall: React.FC<AngleProps> = (p) => {
  const { g, from, to } = p;
  const t = ramp(g, from + 6, to - 16);
  const fall = t * t;
  const y = lerp(260, 1480, fall);
  const bounce = t > 0.97 ? 0 : 1;
  const sw = Math.sin((g - from) * 0.25) * 26 * (1 - fall * 0.6) * bounce;
  return (
    <Layer {...p} bg="#03050a">
      <rect x={0} y={0} width={1080} height={820} fill="#0a1226" />
      <rect x={0} y={800} width={1080} height={26} fill="#16213a" />
      <rect x={0} y={780} width={1080} height={14} fill={PAL.accent} opacity={0.8} />
      <polygon points="0,830 1080,830 1080,1920 0,1920" fill="#05080f" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => <rect key={i} x={-40} y={900 + i * 130} width={1160} height={34} fill="#10182a" />)}
      <rect x={250} y={830} width={46} height={1090} fill="#1c2a44" /><rect x={250} y={830} width={8} height={1090} fill={PAL.rim} opacity={0.5} />
      <rect x={780} y={830} width={46} height={1090} fill="#1c2a44" /><rect x={780} y={830} width={8} height={1090} fill={PAL.rim} opacity={0.5} />
      <g transform={`translate(${540 + sw},${y})`} filter="url(#os-rim)">
        <path d="M-12 -600 L-12 -20 M12 -600 L12 -20" stroke="#4a6a9a" strokeWidth={10} />
        <rect x={-110} y={0} width={220} height={310} rx={20} fill="#e8eefc" />
        <rect x={-80} y={30} width={160} height={130} rx={10} fill="#8fa6c4" />
        <rect x={-80} y={190} width={160} height={16} fill="#6a7f9c" /><rect x={-80} y={226} width={110} height={12} fill="#6a7f9c" />
      </g>
      <Rain g={g} from={from} n={20} op={0.18} />
    </Layer>
  );
};

/** close on an arm: an old hand grips it, a basket of flowers at the bottom of the picture */
export const FlowerGrab: React.FC<AngleProps> = (p) => {
  const { g, from, to } = p;
  const t = smooth(ramp(g, from + 4, from + 24));
  return (
    <Layer {...p} bg="#05080f">
      <ellipse cx={540} cy={820} rx={520} ry={520} fill="#6fa8ff" opacity={0.12} filter="url(#os-blur)" />
      <g filter="url(#os-rim)">
        <path d="M380 0 L330 1320 L720 1320 L700 0 Z" fill="#8fa6c4" />
        <path d="M380 0 L700 0 L690 120 L388 120 Z" fill="#7a92b0" />
        <rect x={330} y={1200} width={400} height={200} fill="#e2b995" />
      </g>
      <g transform={`translate(${lerp(1100, 540, t)},760)`} filter="url(#os-rim)">
        <path d="M-60 420 L-40 300 Q-200 240 -190 140 Q-185 100 -140 110 L-100 160 L-90 40 Q-90 0 -50 0 Q-20 0 -20 40 L-20 140 L10 20 Q10 -20 50 -10 Q80 0 70 40 L50 150 L90 50 Q110 20 140 40 Q160 60 140 100 L110 220 Q200 280 180 420 Z" fill="#b98a66" transform="translate(-540,0) translate(540,0)" />
        <path d="M-30 430 L-30 640 L190 640 L190 430 Z" fill="#5a3a4a" />
      </g>
      <g transform="translate(0,1500)" filter="url(#os-rim)">
        <rect x={60} y={120} width={960} height={300} rx={30} fill="#3a2a22" />
        {Array.from({ length: 16 }, (_, i) => <circle key={i} cx={100 + i * 56} cy={80 - (i % 4) * 26} r={36} fill={i % 3 === 0 ? "#a86a8a" : i % 3 === 1 ? "#c9a0b0" : "#7a9a6a"} />)}
      </g>
      <Rain g={g} from={from} n={18} op={0.16} />
    </Layer>
  );
};

/** looking down the track into the tunnel: rails meeting at a point, two lights growing out of the dark */
export const TunnelPOV: React.FC<AngleProps> = (p) => {
  const { g, from, to } = p;
  const t = smooth(ramp(g, from + 6, to - 4));
  const s = lerp(10, 70, t);
  return (
    <Layer {...p} bg="#02030a">
      <ellipse cx={540} cy={700} rx={lerp(260, 520, t)} ry={lerp(220, 440, t)} fill="#0a1226" />
      <ellipse cx={540} cy={700} rx={lerp(260, 520, t)} ry={lerp(220, 440, t)} fill="none" stroke={PAL.rim} strokeWidth={4} opacity={0.4} />
      <polygon points="-100,1920 1180,1920 600,760 480,760" fill="#06101f" />
      {[-1, 1].map((k) => <polygon key={k} points={`${540 + k * 560},1920 ${540 + k * 470},1920 ${540 + k * 28},760 ${540 + k * 20},760`} fill="#1c2a44" />)}
      {Array.from({ length: 12 }, (_, i) => {
        const q = ((i / 12 + (g - from) * 0.004) % 1);
        const w = 40 + q * 900;
        return <rect key={i} x={540 - w / 2} y={760 + q * q * 1160} width={w} height={6 + q * 26} fill="#14203a" opacity={0.9} />;
      })}
      <circle cx={540 - s * 1.6} cy={700} r={s} fill={PAL.beam} filter="url(#os-soft)" />
      <circle cx={540 + s * 1.6} cy={700} r={s} fill={PAL.beam} filter="url(#os-soft)" />
      <circle cx={540 - s * 1.6} cy={700} r={s * 0.35} fill="#fff" />
      <circle cx={540 + s * 1.6} cy={700} r={s * 0.35} fill="#fff" />
      <polygon points={`${540 - s * 1.6},700 -100,1920 1180,1920 ${540 + s * 1.6},700`} fill={PAL.beam} opacity={0.12 + 0.16 * t} filter="url(#os-blur)" />
      {Array.from({ length: 26 }, (_, i) => <circle key={i} cx={540 + (rnd(i) - 0.5) * 900 * t} cy={700 + (rnd(i + 9) - 0.2) * 900 * t} r={2 + rnd(i + 3) * 4} fill={PAL.beam} opacity={0.4} />)}
    </Layer>
  );
};

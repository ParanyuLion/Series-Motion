import React from "react";
import { SnakeTile } from "../bts/SnakeTile";

// The village, drawn in world coordinates (ground line y = 1300, like the train series): a hazy green-gold sky, layers of forest, wooden huts
// with straw roofs, a well with a lid (no still water: nothing reflects), a long table, and a bell post. Everything is deterministic.
export const GROUND_Y = 1300;
const rnd = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

const Hut: React.FC<{ x: number; w: number; h: number; seed: number; banner?: boolean }> = ({ x, w, h, seed, banner }) => (
  <g>
    <rect x={x} y={GROUND_Y - h} width={w} height={h} fill="#7a5a3a" />
    {Array.from({ length: Math.floor(w / 30) }, (_, i) => <rect key={i} x={x + i * 30} y={GROUND_Y - h} width={3} height={h} fill="#5a4129" opacity={0.7} />)}
    <rect x={x} y={GROUND_Y - 12} width={w} height={12} fill="#4a3724" />
    {/* straw roof */}
    <polygon points={`${x - 50},${GROUND_Y - h + 14} ${x + w / 2},${GROUND_Y - h - 150} ${x + w + 50},${GROUND_Y - h + 14}`} fill="#a3894f" />
    {Array.from({ length: 12 }, (_, i) => {
      const t = (i + 1) / 13;
      return <line key={i} x1={x - 50 + t * (w / 2 + 50)} y1={GROUND_Y - h + 14 - t * 164} x2={x - 50 + t * (w / 2 + 50) + (w + 100) * (1 - t) * 0.0 + 0} y2={GROUND_Y - h + 14} stroke="#7f6a38" strokeWidth={2} opacity={0.5} />;
    })}
    <polygon points={`${x - 50},${GROUND_Y - h + 14} ${x + w + 50},${GROUND_Y - h + 14} ${x + w + 50},${GROUND_Y - h + 30} ${x - 50},${GROUND_Y - h + 30}`} fill="#8a7240" />
    {/* the doorway, dark inside */}
    <rect x={x + w * 0.38} y={GROUND_Y - h * 0.72} width={w * 0.24} height={h * 0.72} fill="#1c1510" />
    <rect x={x + w * 0.1} y={GROUND_Y - h * 0.7} width={w * 0.16} height={h * 0.3} fill="#1c1510" />
    {/* hanging herbs under the eave */}
    {Array.from({ length: 4 }, (_, i) => {
      const hx = x + 20 + ((rnd(seed + i) * (w - 40)) | 0);
      return (
        <g key={i}>
          <line x1={hx} y1={GROUND_Y - h + 30} x2={hx} y2={GROUND_Y - h + 56} stroke="#4a3724" strokeWidth={2} />
          <ellipse cx={hx} cy={GROUND_Y - h + 78} rx={9} ry={22} fill={i % 2 ? "#5d7a45" : "#8a7a3a"} />
        </g>
      );
    })}
    {banner && (
      <g transform={`translate(${x + w * 0.78},${GROUND_Y - h * 0.62})`}>
        <rect x={-30} y={-40} width={60} height={96} fill="#b49340" stroke="#7a643a" strokeWidth={3} />
        <SnakeTile size={44} />
      </g>
    )}
  </g>
);

const Well: React.FC<{ x: number }> = ({ x }) => (
  <g>
    <rect x={x - 70} y={GROUND_Y - 80} width={140} height={80} rx={14} fill="#8d8a80" />
    {Array.from({ length: 6 }, (_, i) => <line key={i} x1={x - 70 + i * 28} y1={GROUND_Y - 80} x2={x - 70 + i * 28} y2={GROUND_Y} stroke="#6e6b62" strokeWidth={3} />)}
    <rect x={x - 80} y={GROUND_Y - 92} width={160} height={20} rx={8} fill="#a09c90" />
    {/* a wooden lid covers the water */}
    <rect x={x - 64} y={GROUND_Y - 104} width={128} height={14} rx={5} fill="#6a4d2e" />
    <rect x={x - 90} y={GROUND_Y - 230} width={14} height={150} fill="#5a4129" />
    <rect x={x + 76} y={GROUND_Y - 230} width={14} height={150} fill="#5a4129" />
    <rect x={x - 100} y={GROUND_Y - 244} width={200} height={16} rx={5} fill="#5a4129" />
    <line x1={x} y1={GROUND_Y - 228} x2={x} y2={GROUND_Y - 160} stroke="#8a7a5a" strokeWidth={3} />
    <rect x={x - 14} y={GROUND_Y - 160} width={28} height={26} rx={4} fill="#7a5a3a" />
  </g>
);

const Table: React.FC<{ x: number; w: number }> = ({ x, w }) => (
  <g>
    <rect x={x} y={GROUND_Y - 130} width={w} height={14} rx={4} fill="#7a5a3a" />
    {[0, 1, 2, 3].map((i) => <rect key={i} x={x + 16 + i * ((w - 50) / 3)} y={GROUND_Y - 116} width={12} height={116} fill="#5a4129" />)}
    <rect x={x + 10} y={GROUND_Y - 70} width={w - 20} height={10} rx={3} fill="#6a4d2e" />
    {/* cups with the pattern, and one bowl under a cloth */}
    {Array.from({ length: 5 }, (_, i) => (
      <g key={i} transform={`translate(${x + 80 + i * ((w - 200) / 4)},${GROUND_Y - 130})`}>
        <path d="M-14 -38 L14 -38 L11 0 L-11 0 Z" fill="#b49340" stroke="#7a643a" strokeWidth={2} />
        <g transform="translate(0,-19)"><SnakeTile size={20} /></g>
      </g>
    ))}
    <g transform={`translate(${x + w - 60},${GROUND_Y - 130})`}>
      <path d="M-30 0 Q-30 -46 0 -48 Q30 -46 30 0 Z" fill="#cfc7ae" stroke="#a59d86" strokeWidth={2} />
    </g>
  </g>
);

const BellPost: React.FC<{ x: number; angle: number }> = ({ x, angle }) => (
  <g>
    <rect x={x - 8} y={GROUND_Y - 520} width={16} height={520} fill="#5a4129" />
    <rect x={x - 90} y={GROUND_Y - 540} width={180} height={18} rx={5} fill="#5a4129" />
    <g transform={`translate(${x},${GROUND_Y - 524}) rotate(${angle})`}>
      <line x1={0} y1={0} x2={0} y2={40} stroke="#4a3724" strokeWidth={4} />
      <path d="M-34 130 Q-34 56 0 46 Q34 56 34 130 Z" fill="#a8803a" stroke="#6e5224" strokeWidth={4} />
      <rect x={-38} y={126} width={76} height={10} rx={4} fill="#8a6a2e" />
      <circle cx={0} cy={144} r={8} fill="#4a3724" />
    </g>
  </g>
);

const TreeBand: React.FC<{ x0: number; x1: number; y: number; h: number; fill: string; seed: number; step?: number }> = ({ x0, x1, y, h, fill, seed, step = 120 }) => (
  <g fill={fill}>
    {Array.from({ length: Math.ceil((x1 - x0) / step) }, (_, i) => {
      const tx = x0 + i * step + rnd(seed + i) * 50;
      const th = h * (0.7 + rnd(seed + i * 3) * 0.6);
      return (
        <g key={i}>
          <rect x={tx - 8} y={y - th * 0.55} width={16} height={th * 0.55} />
          <ellipse cx={tx} cy={y - th * 0.7} rx={46 + rnd(seed + i * 5) * 30} ry={th * 0.42} />
        </g>
      );
    })}
  </g>
);

/** the whole village; `dusk` 0..1 warms then darkens the light; `bell` is the bell's swing in degrees */
export const Village: React.FC<{ dusk?: number; bell?: number; x0?: number; x1?: number; showTable?: boolean }> = ({ dusk = 0, bell = 0, x0 = -400, x1 = 5400, showTable = true }) => (
  <g>
    <defs>
      <linearGradient id="vl-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#7d867a" />
        <stop offset="1" stopColor="#b4b39a" />
      </linearGradient>
      <linearGradient id="vl-ground" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#6d634a" />
        <stop offset="1" stopColor="#3f382a" />
      </linearGradient>
      <linearGradient id="vl-fog" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#aab0a0" stopOpacity={0} />
        <stop offset="1" stopColor="#aab0a0" stopOpacity={0.6} />
      </linearGradient>
    </defs>
    <rect x={x0} y={-1500} width={x1 - x0} height={2800} fill="url(#vl-sky)" />
    <TreeBand x0={x0} x1={x1} y={1000} h={520} fill="#5b6a55" seed={3} step={140} />
    <rect x={x0} y={620} width={x1 - x0} height={400} fill="url(#vl-fog)" />
    <TreeBand x0={x0} x1={x1} y={1130} h={560} fill="#3f523a" seed={11} step={110} />
    <rect x={x0} y={GROUND_Y - 30} width={x1 - x0} height={1900} fill="url(#vl-ground)" />
    <rect x={x0} y={GROUND_Y - 30} width={x1 - x0} height={36} fill="#6f8a52" opacity={0.7} />
    {Array.from({ length: 40 }, (_, i) => <ellipse key={i} cx={x0 + rnd(i) * (x1 - x0)} cy={GROUND_Y + 40 + rnd(i + 99) * 360} rx={20 + rnd(i + 7) * 40} ry={5 + rnd(i + 3) * 8} fill="#4a3d29" opacity={0.28} />)}
    <Hut x={500} w={400} h={250} seed={1} banner />
    <Hut x={1150} w={460} h={290} seed={5} />
    <Well x={1900} />
    <Hut x={2200} w={420} h={260} seed={9} banner />
    {showTable && <Table x={2950} w={620} />}
    <Hut x={3850} w={420} h={270} seed={13} />
    <BellPost x={4500} angle={bell} />
    <TreeBand x0={4700} x1={x1} y={1360} h={900} fill="#1f2f20" seed={21} step={90} />
    <TreeBand x0={x0} x1={400} y={1360} h={900} fill="#1f2f20" seed={31} step={90} />
    <rect x={x0} y={GROUND_Y - 140} width={x1 - x0} height={260} fill="url(#vl-fog)" opacity={0.7} />
    {/* dusk: a warm cast, then the dark of evening */}
    <rect x={x0} y={-1500} width={x1 - x0} height={5200} fill="#ff9a4a" opacity={0.2 * dusk} />
    <rect x={x0} y={-1500} width={x1 - x0} height={5200} fill="#10182a" opacity={0.42 * dusk} />
  </g>
);

/** the inside of a hut, for the waking: planks, a woven mat, a doorway full of light, herbs on the wall */
export const HutInterior: React.FC = () => (
  <g>
    <defs>
      <linearGradient id="hi-door" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#c9ccb4" />
        <stop offset="1" stopColor="#8f9680" />
      </linearGradient>
      <linearGradient id="hi-shaft" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#d8dcc4" stopOpacity={0.32} />
        <stop offset="1" stopColor="#d8dcc4" stopOpacity={0} />
      </linearGradient>
    </defs>
    <rect x={-700} y={-1200} width={3200} height={2500} fill="#6a4d2e" />
    {Array.from({ length: 107 }, (_, i) => <rect key={i} x={-700 + i * 30} y={-1200} width={3} height={2500} fill="#4a3620" opacity={0.7} />)}
    <rect x={-700} y={GROUND_Y} width={3200} height={900} fill="#4a3a28" />
    <rect x={-700} y={GROUND_Y} width={3200} height={10} fill="#2f2417" />
    {/* the doorway */}
    <rect x={1190} y={640} width={330} height={GROUND_Y - 640} fill="url(#hi-door)" />
    <TreeBand x0={1190} x1={1520} y={GROUND_Y - 120} h={420} fill="#5b7a52" seed={41} step={70} />
    <rect x={1170} y={620} width={20} height={GROUND_Y - 620} fill="#3a2a18" />
    <rect x={1520} y={620} width={20} height={GROUND_Y - 620} fill="#3a2a18" />
    <rect x={1170} y={620} width={370} height={22} fill="#3a2a18" />
    <polygon points="1190,700 1520,700 760,1500 260,1500" fill="url(#hi-shaft)" />
    {/* a woven mat */}
    <rect x={380} y={GROUND_Y + 20} width={520} height={120} rx={10} fill="#b89a58" />
    {Array.from({ length: 14 }, (_, i) => <line key={i} x1={380 + i * 40} y1={GROUND_Y + 22} x2={380 + i * 40} y2={GROUND_Y + 138} stroke="#8a6f3a" strokeWidth={3} />)}
    {/* a clay pot, herbs, a cloth with the pattern on the wall */}
    <ellipse cx={1600} cy={GROUND_Y - 36} rx={44} ry={56} fill="#9a5a3a" />
    <rect x={1570} y={GROUND_Y - 100} width={60} height={20} rx={8} fill="#8a4a2e" />
    {[0, 1, 2].map((i) => (
      <g key={i}>
        <line x1={120 + i * 120} y1={560} x2={120 + i * 120} y2={640} stroke="#3a2a18" strokeWidth={2} />
        <ellipse cx={120 + i * 120} cy={680} rx={10} ry={30} fill={i % 2 ? "#5d7a45" : "#8a7a3a"} />
      </g>
    ))}
    <g transform="translate(640,760)">
      <rect x={-60} y={-80} width={120} height={160} fill="#b49340" stroke="#7a643a" strokeWidth={4} />
      <SnakeTile size={88} />
    </g>
  </g>
);

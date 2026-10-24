import React from "react";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ramp = (g: number, a: number, b: number) => clamp01((g - a) / Math.max(1, b - a));
const smooth = (t: number) => t * t * (3 - 2 * t);

/** a plain low wooden chair standing on the ground at (x, y); `slide` 0..1 pushes it 90 px to the right and tips it a little */
export const Chair: React.FC<{ x: number; y: number; slide: number }> = ({ x, y, slide }) => (
  <g transform={`translate(${x + 90 * slide},${y - 80 * slide}) rotate(${-16 * Math.sin(Math.PI * slide)})`}>
    <ellipse cx={0} cy={6} rx={72} ry={10} fill="#000" opacity={0.28} />
    {[-50, 50].map((lx) => <rect key={lx} x={lx - 6} y={-112} width={12} height={112} fill="#4a3420" />)}
    <rect x={-62} y={-126} width={124} height={18} rx={5} fill="#7a5a3a" stroke="#4d3822" strokeWidth={3} />
    <rect x={-56} y={-230} width={10} height={106} fill="#5a4129" />
    <rect x={-56} y={-236} width={112} height={14} rx={5} fill="#6a4d2e" stroke="#4d3822" strokeWidth={3} />
    <rect x={46} y={-230} width={10} height={106} fill="#5a4129" />
  </g>
);

/**
 * Dark trunks along the forest line that sway a little; from `from` the middle one leans a few degrees and a darker patch
 * opens behind it. Only trunks and darkness: never what moves.
 */
export const Rustle: React.FC<{ g: number; from: number; x0: number; x1: number; y: number }> = ({ g, from, x0, x1, y }) => {
  const n = 6;
  const lean = smooth(ramp(g, from, from + 40));
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const x = x0 + (i * (x1 - x0)) / (n - 1);
        const mid = i === 2 || i === 3;
        const rot = Math.sin(g * 0.03 + i) * 0.5 + (mid ? (i === 2 ? -1 : 1) * 4.5 * lean : 0);
        return <rect key={i} x={x - 18} y={y - 900} width={36} height={940} fill="#1b2a1c" transform={`rotate(${rot} ${x} ${y})`} opacity={0.95} />;
      })}
      <defs>
        <radialGradient id="ru-dark" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#030504" stopOpacity={0.85} /><stop offset="1" stopColor="#030504" stopOpacity={0} /></radialGradient>
      </defs>
      <ellipse cx={(x0 + x1) / 2} cy={y - 420} rx={0.4 * (x1 - x0)} ry={460} fill="url(#ru-dark)" opacity={lean} />
    </g>
  );
};

/** a low plain stool for someone sitting at (x, y) (the ground point under the sitter) */
export const Stool: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g>
    <ellipse cx={x} cy={y + 4} rx={70} ry={9} fill="#000" opacity={0.25} />
    <rect x={x - 52} y={y - 96} width={104} height={14} rx={5} fill="#7a5a3a" stroke="#4d3822" strokeWidth={3} />
    <rect x={x - 42} y={y - 82} width={11} height={82} fill="#4a3420" />
    <rect x={x + 31} y={y - 82} width={11} height={82} fill="#4a3420" />
  </g>
);

/** a spoon held out toward a mouth; `reach` 0..1 moves it from the bowl toward the tip position, then it waits (a tiny steady tremor) */
export const Spoon: React.FC<{ g: number; reach: number; from: [number, number]; tip: [number, number] }> = ({ g, reach, from, tip }) => {
  const x = from[0] + (tip[0] - from[0]) * reach;
  const y = from[1] + (tip[1] - from[1]) * reach + Math.sin(g * 0.7) * 0.8 * reach;
  return (
    <g>
      <path d={`M${x + 150} ${y + 28} L${x + 8} ${y + 2}`} stroke="#8a6a44" strokeWidth={9} strokeLinecap="round" />
      <ellipse cx={x} cy={y} rx={22} ry={13} fill="#d8d2bd" stroke="#8d8570" strokeWidth={3} transform={`rotate(10 ${x} ${y})`} />
    </g>
  );
};

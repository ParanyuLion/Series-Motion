import React from "react";
import { MaskHead, Flesh } from "../blind1/SnakePreview";

const GROUND = 1300;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ramp = (g: number, a: number, b: number) => clamp01((g - a) / Math.max(1, b - a));
const rnd = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

/**
 * The forest in grey dawn light: three layers of trunks that slide at different speeds with the camera (`cx`), ground fog, a pale sky
 * through the canopy. Nothing alive is drawn: no birds, no insects. `x0..x1` is the world width that is covered.
 */
export const Forest: React.FC<{ cx: number; x0?: number; x1?: number; dark?: number }> = ({ cx, x0 = -600, x1 = 6600, dark = 0 }) => {
  const layer = (f: number, seed: number, step: number, w: number, fill: string, top: number, opacity = 1) => {
    const shift = cx * (1 - f);
    return (
      <g transform={`translate(${shift},0)`} opacity={opacity}>
        {Array.from({ length: Math.ceil((x1 - x0) / step) }, (_, i) => {
          const x = x0 + i * step + rnd(i + seed) * step * 0.8;
          const ww = w * (0.6 + rnd(i + seed + 9) * 0.9);
          return <rect key={i} x={x} y={top} width={ww} height={GROUND - top + 60} fill={fill} />;
        })}
      </g>
    );
  };
  return (
    <g>
      <defs>
        <linearGradient id="fo-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1d231f" /><stop offset="0.6" stopColor="#434c40" /><stop offset="1" stopColor="#6c715c" /></linearGradient>
        <linearGradient id="fo-ground" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4d4a38" /><stop offset="1" stopColor="#1f1d15" /></linearGradient>
        <linearGradient id="fo-fog" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c4c8b4" stopOpacity={0} /><stop offset="1" stopColor="#c4c8b4" stopOpacity={0.55} /></linearGradient>
      </defs>
      <rect x={x0 - 1200} y={-1600} width={x1 - x0 + 2400} height={3000} fill="url(#fo-sky)" />
      {layer(0.5, 3, 150, 34, "#4a5748", 120, 0.9)}
      <rect x={x0 - 1200} y={760} width={x1 - x0 + 2400} height={560} fill="url(#fo-fog)" />
      {layer(0.8, 11, 190, 52, "#2a382a", -200)}
      <rect x={x0 - 1200} y={GROUND - 30} width={x1 - x0 + 2400} height={1900} fill="url(#fo-ground)" />
      <rect x={x0 - 1200} y={1040} width={x1 - x0 + 2400} height={300} fill="url(#fo-fog)" opacity={0.8} />
      {layer(1, 23, 330, 92, "#1b2a1c", -400)}
      <rect x={x0 - 1200} y={-1600} width={x1 - x0 + 2400} height={3300} fill="#05080a" opacity={0.2 + 0.55 * dark} />
    </g>
  );
};

/** one canvas shoe lying on its side, pale against the dark ground; nothing else with it */
export const Shoe: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x},${y}) rotate(-8)`}>
    <ellipse cx={4} cy={14} rx={74} ry={9} fill="#000" opacity={0.35} />
    <path d="M-66 8 Q-66 -34 -18 -38 Q20 -42 36 -16 Q70 -12 74 8 Q74 18 60 18 L-56 18 Q-66 18 -66 8 Z" fill="#c9c0a6" stroke="#8f8670" strokeWidth={3} />
    <path d="M-20 -34 Q0 -22 30 -18" stroke="#8f8670" strokeWidth={3} fill="none" />
    <rect x={-66} y={14} width={140} height={8} rx={3} fill="#5d5844" />
  </g>
);

type Crowd = { x: number; y: number; s: number; tilt: number };
const crowd = (n: number, x0: number, x1: number): Crowd[] =>
  Array.from({ length: n }, (_, i) => ({ x: x0 + rnd(i + 5) * (x1 - x0), y: 60 + rnd(i + 31) * 520, s: 0.3 + rnd(i + 17) * 0.22, tilt: (rnd(i + 3) - 0.5) * 20 }));

/**
 * Pale masks hanging in the dark of the canopy, appearing one at a time from `from` (one every ~9 frames), each on a short dark coil that comes down
 * from above the picture. `lean` (0..1) tilts every mask toward the walker at `target` x. The masks are dim and small: never a full lit view.
 */
export const CrowdLayer: React.FC<{ g: number; from: number; from2: number; n: number; lean: number; x0: number; x1: number; target: number; first: { x: number; y: number } }> = ({ g, from, from2, n, lean, x0, x1, target, first }) => (
  <g>
    <defs><filter id="cw-soft"><feGaussianBlur stdDeviation="1.6" /></filter></defs>
    {crowd(n, x0, x1).map((c0, i) => {
      let c = c0;
      const t0 = i === 0 ? from : from2 + (i - 1) * 9;
      const o = ramp(g, t0, t0 + 14);
      if (i === 0) { c = { ...c, x: first.x, y: first.y, s: 0.5 }; }
      if (o <= 0) return null;
      const toward = Math.sign(target - c.x) * 26 * lean;
      return (
        <g key={i} opacity={(0.2 + 0.25 * o) * (1 - 0.3 * (i % 3) / 2)} transform={`translate(${c.x + Math.sign(target - c.x) * 14 * lean},${c.y})`}>
          <g transform={`scale(${c.s * 2})`}><Flesh d={`M${(rnd(i) - 0.5) * 80} -900 C${(rnd(i + 1) - 0.5) * 300} -600 ${(rnd(i + 2) - 0.5) * 200} -350 0 -110`} w={42} /></g>
          <g filter="url(#cw-soft)"><MaskHead kind={3} x={0} y={0} tilt={c.tilt * 0.5 + toward} s={c.s} /></g>
        </g>
      );
    })}
  </g>
);

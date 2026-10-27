import React from "react";
import { PAL } from "../onestar1/Look";

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const ramp = (g: number, a: number, b: number) => clamp01((g - a) / Math.max(1, b - a));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smooth = (t: number) => t * t * (3 - 2 * t);
export const FADE = 10;
export const fade = (g: number, from: number, to: number) => clamp01(Math.min((g - from) / FADE, (to - g) / FADE));
export const rnd = (i: number) => {
  const v = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return v - Math.floor(v);
};

/** every camera angle takes the global frame and its window; `solid` angles never fade out (the next one fades in over them) */
export type AngleProps = { g: number; from: number; to: number; solid?: boolean };

/** the common frame of an angle: fade, dark backing */
export const Layer: React.FC<AngleProps & { bg?: string; children: React.ReactNode }> = ({ g, from, to, solid, bg = "#04060d", children }) => (
  <g opacity={fade(g, from, solid ? 1e9 : to)}>
    <rect x={-100} y={-100} width={1300} height={2200} fill={bg} />
    {children}
  </g>
);

export const Rain: React.FC<{ g: number; from: number; n?: number; op?: number; seed?: number }> = ({ g, from, n = 40, op = 0.26, seed = 0 }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const x = rnd(i + 80 + seed) * 1080;
      const y = ((rnd(i + 120 + seed) * 2000 + (g - from) * (40 + rnd(i + 160 + seed) * 30)) % 1500) - 100;
      return <line key={i} x1={x} y1={y} x2={x - 10} y2={y + 56} stroke={PAL.beam} strokeWidth={2} opacity={op} />;
    })}
  </g>
);

/** a hand from the side (used for the shelf grab and the cable): skin colour as a prop, fingers as rounded bars */
export const Hand: React.FC<{ x: number; y: number; rot?: number; skin?: string; s?: number; grip?: number }> = ({ x, y, rot = 0, skin = "#c99e80", s = 1, grip = 0 }) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`} filter="url(#os-rim)">
    <path d="M-70 420 L-62 60 Q-62 -20 0 -24 Q64 -20 64 60 L72 420 Z" fill={skin} />
    {[-48, -16, 16, 48].map((fx, i) => <rect key={i} x={fx - 15} y={-70 + Math.abs(i - 1.5) * 12 + grip * 40} width={30} height={90} rx={15} fill={skin} />)}
    <rect x={-92} y={0} width={36} height={80} rx={18} fill={skin} transform={`rotate(${-24 + grip * 20} -74 40)`} />
  </g>
);

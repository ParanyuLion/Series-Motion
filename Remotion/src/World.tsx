import React from "react";

export const W = 1080;
export const H = 1920;
export const GROUND_Y = 1450;

export type Palette = {
  top: string; mid: string; bot: string;
  far: string; midHill: string; trees: string; ground: string; grass: string;
};

export const DUSK: Palette = { top: "#4a3a78", mid: "#d9695f", bot: "#f6b26b", far: "#8a5a8c", midHill: "#5c3d6e", trees: "#2f2447", ground: "#344a3c", grass: "#557a4f" };
export const NIGHT: Palette = { top: "#070c26", mid: "#14215a", bot: "#2b4580", far: "#1b2a5a", midHill: "#14204a", trees: "#0b1432", ground: "#0e1e2c", grass: "#1d3a3a" };

const rnd = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

const mod = (a: number, b: number) => ((a % b) + b) % b;

const hillPath = (base: number, amp: number, period: number) => {
  let d = `M0 ${H}`;
  for (let x = 0; x <= W + period + 40; x += 20) {
    const y = base - amp * (0.6 * Math.sin((2 * Math.PI * x) / period) + 0.4 * Math.sin((4 * Math.PI * x) / period + 1));
    d += ` L${x} ${y.toFixed(1)}`;
  }
  return d + ` L${W + period + 40} ${H} Z`;
};

const Hills: React.FC<{ scroll: number; factor: number; base: number; amp: number; period: number; color: string }> = ({ scroll, factor, base, amp, period, color }) => (
  <g transform={`translate(${-mod(scroll * factor, period)},0)`}>
    <path d={hillPath(base, amp, period)} fill={color} />
  </g>
);

const Pine: React.FC<{ x: number; y: number; h: number; color: string }> = ({ x, y, h, color }) => (
  <g>
    <rect x={x - 5} y={y - h * 0.15} width={10} height={h * 0.15} fill={color} />
    {[0, 1, 2].map((i) => (
      <path key={i} d={`M${x} ${y - h * (0.95 - i * 0.2)} L${x + h * (0.18 + i * 0.07)} ${y - h * (0.15 + (2 - i) * 0.22)} L${x - h * (0.18 + i * 0.07)} ${y - h * (0.15 + (2 - i) * 0.22)} Z`} fill={color} />
    ))}
  </g>
);

const TreeRow: React.FC<{ scroll: number; factor: number; baseY: number; color: string; seed: number; scaleH?: number }> = ({ scroll, factor, baseY, color, seed, scaleH = 1 }) => {
  const period = 2200;
  const trees = Array.from({ length: 7 }, (_, i) => ({ x: i * 330 + rnd(i + seed) * 120, h: (260 + rnd(i * 3 + seed) * 200) * scaleH }));
  const off = mod(scroll * factor, period);
  return (
    <g transform={`translate(${-off},0)`}>
      {[0, 1, 2].map((k) => trees.map((t, i) => <Pine key={`${k}-${i}`} x={t.x + k * period} y={baseY} h={t.h} color={color} />))}
    </g>
  );
};

export const Grass: React.FC<{ scroll: number; factor: number; y: number; color: string; count?: number; size?: number }> = ({ scroll, factor, y, color, count = 24, size = 1 }) => {
  const period = 1200;
  const off = mod(scroll * factor, period);
  const blades = Array.from({ length: count }, (_, i) => ({ x: (i / count) * period + rnd(i) * 30, h: (50 + rnd(i + 9) * 70) * size, lean: (rnd(i + 4) - 0.5) * 24 }));
  return (
    <g transform={`translate(${-off},0)`}>
      {[0, 1, 2].map((k) => blades.map((b, i) => (
        <path key={`${k}-${i}`} d={`M${b.x + k * period - 9 * size} ${y} Q${b.x + k * period + b.lean * 0.5} ${y - b.h * 0.6} ${b.x + k * period + b.lean} ${y - b.h} Q${b.x + k * period + 4} ${y - b.h * 0.5} ${b.x + k * period + 9 * size} ${y} Z`} fill={color} />
      )))}
    </g>
  );
};

export const Stars: React.FC<{ opacity: number; frame: number }> = ({ opacity, frame }) => (
  <g opacity={opacity}>
    {Array.from({ length: 70 }, (_, i) => {
      const tw = 0.55 + 0.45 * Math.sin(frame * 0.06 + i * 2.3);
      return <circle key={i} cx={rnd(i) * W} cy={rnd(i + 50) * 950} r={1.2 + rnd(i + 99) * 2.2} fill="#fff" opacity={tw * (0.5 + rnd(i + 7) * 0.5)} />;
    })}
  </g>
);

export const Glow: React.FC<{ x: number; y: number; r: number; color: string; opacity?: number; id: string }> = ({ x, y, r, color, opacity = 1, id }) => (
  <g opacity={opacity}>
    <defs>
      <radialGradient id={id}>
        <stop offset="0%" stopColor={color} stopOpacity={0.95} />
        <stop offset="35%" stopColor={color} stopOpacity={0.35} />
        <stop offset="100%" stopColor={color} stopOpacity={0} />
      </radialGradient>
    </defs>
    <circle cx={x} cy={y} r={r} fill={`url(#${id})`} />
  </g>
);

export const AmbientFireflies: React.FC<{ frame: number; scroll: number; count?: number; opacity?: number }> = ({ frame, scroll, count = 16, opacity = 1 }) => (
  <g opacity={opacity}>
    {Array.from({ length: count }, (_, i) => {
      const bx = mod(rnd(i + 20) * 1500 - scroll * 0.8, 1500) - 200;
      const x = bx + Math.sin(frame * 0.03 + i) * 40;
      const y = 1180 + rnd(i + 33) * 380 + Math.sin(frame * 0.045 + i * 1.7) * 30;
      const pulse = 0.4 + 0.6 * Math.max(0, Math.sin(frame * 0.07 + i * 3));
      return <Glow key={i} id={`af${i}`} x={x} y={y} r={26} color="#fff3a0" opacity={pulse} />;
    })}
  </g>
);

export const Backdrop: React.FC<{ pal: Palette; scroll: number; frame: number; stars?: number; children?: React.ReactNode }> = ({ pal, scroll, frame, stars = 0, children }) => (
  <g>
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={pal.top} />
        <stop offset="55%" stopColor={pal.mid} />
        <stop offset="100%" stopColor={pal.bot} />
      </linearGradient>
    </defs>
    <rect width={W} height={GROUND_Y + 40} fill="url(#sky)" />
    <Stars opacity={stars} frame={frame} />
    {children}
    <Hills scroll={scroll} factor={0.08} base={1130} amp={90} period={2000} color={pal.far} />
    <Hills scroll={scroll} factor={0.22} base={1250} amp={100} period={1700} color={pal.midHill} />
    <TreeRow scroll={scroll} factor={0.45} baseY={1400} color={pal.trees} seed={1} />
    <rect y={GROUND_Y - 10} width={W} height={H - GROUND_Y + 10} fill={pal.ground} />
    <rect y={GROUND_Y - 10} width={W} height={8} fill={pal.grass} opacity={0.6} />
    <Grass scroll={scroll} factor={1} y={GROUND_Y} color={pal.grass} />
  </g>
);

export const ForegroundGrass: React.FC<{ scroll: number; color: string }> = ({ scroll, color }) => (
  <Grass scroll={scroll} factor={1.5} y={H + 20} color={color} count={14} size={3.2} />
);

export const House: React.FC<{ x: number; frame: number }> = ({ x, frame }) => {
  const flick = 0.92 + 0.08 * Math.sin(frame * 0.3);
  return (
    <g transform={`translate(${x},${GROUND_Y})`}>
      <defs>
        <linearGradient id="doorlight" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffd98a" stopOpacity={0.7} />
          <stop offset="100%" stopColor="#ffd98a" stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d="M300 -20 L360 -20 L720 90 L120 90 Z" fill="url(#doorlight)" opacity={0.6 * flick} transform="translate(-60,0)" />
      <rect x={0} y={-300} width={420} height={300} fill="#6b4a3a" />
      {Array.from({ length: 8 }, (_, i) => <rect key={i} x={0} y={-300 + i * 37.5} width={420} height={3} fill="#4f362a" opacity={0.6} />)}
      <path d="M-30 -295 L210 -470 L450 -295 Z" fill="#3a2a3a" />
      <rect x={300} y={-440} width={44} height={110} fill="#4a3744" />
      <rect x={60} y={-210} width={110} height={100} rx={6} fill="#ffd98a" opacity={flick} />
      <rect x={60} y={-210} width={110} height={100} rx={6} fill="none" stroke="#3a2a2a" strokeWidth={8} />
      <path d="M115 -210 V-110 M60 -160 H170" stroke="#3a2a2a" strokeWidth={6} />
      <rect x={270} y={-180} width={90} height={180} rx={6} fill="#ffcf75" opacity={flick} />
      <rect x={270} y={-180} width={90} height={180} rx={6} fill="none" stroke="#3a2a2a" strokeWidth={8} />
      <Glow id="winglow" x={115} y={-160} r={200} color="#ffcf75" opacity={0.55 * flick} />
    </g>
  );
};

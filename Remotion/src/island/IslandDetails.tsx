import React from "react";

// Extra scenery so the beach is never empty: sea stacks, sand detail (ripples, pebbles, shells, seaweed, driftwood,
// boulders, tide pools), a low vegetation edge, and a screen-space foreground frame for depth.
// Everything is deterministic (no Math.random) so frames are identical between renders.

const HORIZON_Y = 1000;
const SHORE_Y = 1330;
const PERIOD = 2800;

const mod = (a: number, b: number) => ((a % b) + b) % b;
const rnd = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};
/** x on screen of an item that lives `base` px along the beach, wrapped so something is always in view */
const wrapX = (base: number, scroll: number, factor = 1) => mod(base - scroll * factor, PERIOD) - 900;

export const SeaStacks: React.FC<{ scroll: number }> = ({ scroll }) => (
  <g>
    {Array.from({ length: 5 }, (_, i) => {
      const x = mod(i * 760 + 200 - scroll * 0.1, 3600) - 900;
      const w = 50 + rnd(i) * 70;
      const h = 110 + rnd(i + 5) * 120;
      const y = HORIZON_Y + 28;
      return (
        <g key={i} opacity={0.8}>
          <path d={`M${x - w} ${y} L${x - w * 0.55} ${y - h * 0.7} L${x - w * 0.2} ${y - h} L${x + w * 0.25} ${y - h * 0.82} L${x + w * 0.7} ${y - h * 0.35} L${x + w} ${y} Z`} fill="#2a3035" />
          <path d={`M${x - w * 0.2} ${y - h} L${x + w * 0.25} ${y - h * 0.82} L${x + w * 0.05} ${y - h * 0.5} Z`} fill="#4a545a" opacity={0.7} />
          <ellipse cx={x} cy={y + 6} rx={w * 1.5} ry={7} fill="#cfd5d8" opacity={0.25} />
        </g>
      );
    })}
  </g>
);

const Boulder: React.FC<{ x: number; y: number; s: number; seed: number }> = ({ x, y, s, seed }) => {
  const pts = Array.from({ length: 7 }, (_, i) => {
    const a = (i / 7) * Math.PI * 2;
    const r = 1 + (rnd(seed + i) - 0.5) * 0.35;
    return [Math.cos(a) * 58 * r * s, -Math.abs(Math.sin(a)) * 44 * r * s + (Math.sin(a) > 0 ? 0 : 0)] as const;
  });
  const d = `M${pts.map(([px, py]) => `${px.toFixed(1)} ${py.toFixed(1)}`).join(" L")} Z`;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={-30 * s} cy={4} rx={80 * s} ry={9 * s} fill="#000" opacity={0.3} />
      <path d={d} fill="#3a4044" />
      <path d={`M${-40 * s} ${-22 * s} Q${-10 * s} ${-50 * s} ${24 * s} ${-36 * s} Q${0} ${-34 * s} ${-40 * s} ${-22 * s} Z`} fill="#6d777d" opacity={0.7} />
      <path d={`M${20 * s} ${-14 * s} L${44 * s} ${-2 * s} L${10 * s} ${0} Z`} fill="#22282b" opacity={0.7} />
    </g>
  );
};

export const SandDetail: React.FC<{ scroll: number; frame: number }> = ({ scroll, frame }) => (
  <g>
    {/* wet sand just above the waterline, with a sheen */}
    <rect x={-900} y={SHORE_Y} width={3000} height={70} fill="#23282a" opacity={0.28} />
    <rect x={-900} y={SHORE_Y + 8} width={3000} height={16} fill="#9aa3a7" opacity={0.1} />
    {/* sand ripples */}
    {Array.from({ length: 16 }, (_, i) => {
      const y = SHORE_Y + 70 + i * 54 + (i % 2) * 14;
      const off = (scroll + i * 137) % 120;
      return (
        <path
          key={i}
          d={`M-900 ${y} ${Array.from({ length: 30 }, (_, j) => `L${j * 100 - 900 - off} ${y + Math.sin(j * 1.3 + i) * 5}`).join(" ")}`}
          stroke="#2a2e2d"
          strokeWidth={3}
          fill="none"
          opacity={0.12}
        />
      );
    })}
    {/* tide pools reflecting the sky */}
    {Array.from({ length: 6 }, (_, i) => (
      <g key={i} transform={`translate(${wrapX(300 + i * 520, scroll)},${SHORE_Y + 120 + rnd(i + 2) * 300})`}>
        <ellipse rx={60 + rnd(i) * 40} ry={11 + rnd(i + 3) * 6} fill="#7d868c" opacity={0.5} />
        <ellipse rx={60 + rnd(i) * 40} ry={11 + rnd(i + 3) * 6} fill="none" stroke="#c9d0d3" strokeWidth={2} opacity={0.35} />
        <ellipse cx={-14} cy={-2} rx={24} ry={3} fill="#e9eef0" opacity={0.18 + 0.1 * Math.sin(frame * 0.05 + i)} />
      </g>
    ))}
    {/* pebbles */}
    {Array.from({ length: 110 }, (_, i) => {
      const x = wrapX(rnd(i) * PERIOD, scroll);
      const y = SHORE_Y + 60 + rnd(i + 5) * 880;
      const r = 3 + rnd(i + 9) * 8 * (0.6 + (y - SHORE_Y) / 900);
      return (
        <g key={i}>
          <ellipse cx={x} cy={y} rx={r} ry={r * 0.6} fill={rnd(i + 2) > 0.5 ? "#4a4d4b" : "#7b7f7c"} />
          <ellipse cx={x - r * 0.25} cy={y - r * 0.2} rx={r * 0.4} ry={r * 0.2} fill="#c4c9c8" opacity={0.4} />
        </g>
      );
    })}
    {/* shells */}
    {Array.from({ length: 16 }, (_, i) => {
      const x = wrapX(rnd(i + 40) * PERIOD, scroll);
      const y = SHORE_Y + 90 + rnd(i + 41) * 700;
      return <path key={i} d={`M${x} ${y} q7 -16 16 0 q-8 5 -16 0 Z`} fill="#c9c3b2" stroke="#8c8574" strokeWidth={1} opacity={0.75} />;
    })}
    {/* seaweed thrown up on the sand */}
    {Array.from({ length: 9 }, (_, i) => {
      const x = wrapX(100 + i * 330 + rnd(i) * 120, scroll);
      const y = SHORE_Y + 28 + rnd(i + 6) * 60;
      return (
        <g key={i} stroke="#2e3b2f" strokeWidth={5} strokeLinecap="round" fill="none" opacity={0.85}>
          <path d={`M${x} ${y} q-18 -22 -4 -44`} />
          <path d={`M${x + 8} ${y} q10 -26 -2 -52`} />
          <path d={`M${x + 16} ${y} q22 -14 14 -38`} />
        </g>
      );
    })}
    {/* driftwood */}
    {Array.from({ length: 6 }, (_, i) => {
      const x = wrapX(200 + i * 470 + rnd(i + 11) * 160, scroll);
      const y = SHORE_Y + 160 + rnd(i + 12) * 520;
      const len = 120 + rnd(i + 13) * 140;
      const rot = -10 + rnd(i + 14) * 30;
      return (
        <g key={i} transform={`translate(${x},${y}) rotate(${rot})`}>
          <ellipse cx={-20} cy={10} rx={len * 0.6} ry={8} fill="#000" opacity={0.28} />
          <rect x={-len / 2} y={-9} width={len} height={18} rx={9} fill="#4a4036" />
          <rect x={-len / 2 + 8} y={-7} width={len - 20} height={5} rx={2.5} fill="#7a6a58" opacity={0.6} />
          <ellipse cx={len / 2 - 2} cy={0} rx={6} ry={9} fill="#6a5a48" />
          <path d={`M${-len * 0.2} -9 l10 -22 l6 22`} fill="#4a4036" />
        </g>
      );
    })}
    {/* boulders */}
    {Array.from({ length: 5 }, (_, i) => (
      <Boulder key={i} x={wrapX(150 + i * 640 + rnd(i + 20) * 200, scroll)} y={SHORE_Y + 220 + rnd(i + 21) * 420} s={0.7 + rnd(i + 22) * 0.8} seed={i * 11} />
    ))}
  </g>
);

/** Low vegetation along the back of the beach: bushes, beach grass and reeds, denser toward the right. */
export const VegetationEdge: React.FC<{ scroll: number; frame: number }> = ({ scroll, frame }) => (
  <g>
    {Array.from({ length: 46 }, (_, i) => {
      const base = rnd(i) * PERIOD;
      const x = wrapX(base, scroll, 0.9);
      const right = clamp((x + 100) / 1200);
      if (rnd(i + 90) > 0.35 + right * 0.65) return null;
      const y = SHORE_Y + 70 + rnd(i + 3) * 40;
      const s = 0.7 + rnd(i + 4) * 1.0;
      return (
        <g key={i} transform={`translate(${x},${y}) scale(${s})`}>
          <ellipse cx={-4} cy={4} rx={80} ry={9} fill="#000" opacity={0.28} />
          <ellipse cx={0} cy={-18} rx={62} ry={30} fill="#1a2125" />
          <ellipse cx={-26} cy={-30} rx={38} ry={26} fill="#20282c" />
          <ellipse cx={24} cy={-34} rx={40} ry={26} fill="#222b2f" />
          <ellipse cx={4} cy={-48} rx={26} ry={16} fill="#2a343a" />
          <path d="M-30 -52 q10 -10 22 -4 M10 -60 q12 -8 24 -2" stroke="#4a5a60" strokeWidth={3} fill="none" opacity={0.5} />
        </g>
      );
    })}
    {/* beach grass tufts swaying in the wind */}
    {Array.from({ length: 70 }, (_, i) => {
      const x = wrapX(rnd(i + 200) * PERIOD, scroll, 0.95);
      const y = SHORE_Y + 90 + rnd(i + 201) * 70;
      const h = 40 + rnd(i + 202) * 50;
      const sway = Math.sin(frame * 0.05 + i) * 6;
      return (
        <g key={i} stroke="#33433a" strokeWidth={3} strokeLinecap="round" fill="none">
          <path d={`M${x - 6} ${y} Q${x - 6 + sway} ${y - h * 0.6} ${x - 12 + sway * 1.6} ${y - h}`} />
          <path d={`M${x} ${y} Q${x + sway} ${y - h * 0.7} ${x + 4 + sway * 1.6} ${y - h * 1.1}`} />
          <path d={`M${x + 6} ${y} Q${x + 6 + sway} ${y - h * 0.5} ${x + 16 + sway * 1.6} ${y - h * 0.9}`} />
        </g>
      );
    })}
  </g>
);

const clamp = (v: number) => Math.min(1, Math.max(0, v));

/** Dark foreground framing in SCREEN space with a little parallax, so every camera angle has depth. */
export const ForegroundFrame: React.FC<{ frame: number; camX: number; camY: number; opacity?: number }> = ({ frame, camX, camY, opacity = 1 }) => {
  const px = -(camX - 540) * 0.22;
  const py = -(camY - 1200) * 0.12;
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, opacity, pointerEvents: "none" }}>
      <g transform={`translate(${px},${py})`} fill="#0b1013">
        {/* palm fronds hanging in from the top right */}
        {Array.from({ length: 6 }, (_, i) => {
          const sway = Math.sin(frame * 0.03 + i) * 4;
          const a = (150 + i * 14) * (Math.PI / 180);
          const len = 420 + i * 40;
          const ex = 1160 + Math.cos(a) * len + sway;
          const ey = -40 + Math.sin(a) * len * 0.8 + 60;
          return <path key={i} d={`M1180 -60 Q${1180 + Math.cos(a) * len * 0.4} ${-60 + Math.sin(a) * len * 0.9 - 30} ${ex} ${ey} Q${1180 + Math.cos(a) * len * 0.5} ${-60 + Math.sin(a) * len * 0.5 + 40} 1180 -20 Z`} />;
        })}
        {/* rock outcrop bottom left and grass blades along the bottom (below the subtitle band) */}
        <path d="M-80 1920 L-80 1740 Q40 1690 140 1730 Q230 1760 300 1830 L340 1920 Z" />
        {Array.from({ length: 34 }, (_, i) => {
          const x = i * 34 - 20;
          const h = 90 + rnd(i + 300) * 120;
          const sway = Math.sin(frame * 0.04 + i * 0.7) * 8;
          return <path key={i} d={`M${x} 1940 Q${x + 4 + sway * 0.5} ${1940 - h * 0.6} ${x + 18 + sway} ${1940 - h} Q${x + 14} ${1940 - h * 0.5} ${x + 26} 1940 Z`} />;
        })}
      </g>
    </svg>
  );
};

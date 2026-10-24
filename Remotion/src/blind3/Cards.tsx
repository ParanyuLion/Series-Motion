import React from "react";
import { PASSENGERS } from "../bts/cast";
import { MaskHead } from "../blind1/SnakePreview";

const W = 1080;
const H = 1920;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ramp = (g: number, a: number, b: number) => clamp01((g - a) / Math.max(1, b - a));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);
const rnd = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

/** the wooden post beside the bed: scratches in groups of five (four strokes and a slash) come one group after another, far too many */
export const PostCard: React.FC<{ g: number; from: number; to: number }> = ({ g, from, to }) => {
  const groups = 30;
  const shown = Math.floor(ramp(g, from + 10, to - 20) * groups);
  const zoom = 1 + 0.06 * ramp(g, from, to);
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
      <defs>
        <radialGradient id="pc3-light" cx="0.28" cy="0.4" r="0.8"><stop offset="0" stopColor="#c9a46a" /><stop offset="0.6" stopColor="#5c4126" /><stop offset="1" stopColor="#120c06" /></radialGradient>
      </defs>
      <rect width={W} height={H} fill="#120c06" />
      <g transform={`translate(540,820) scale(${zoom}) translate(-540,-820)`}>
        <rect x={190} y={-60} width={700} height={1700} fill="url(#pc3-light)" />
        {Array.from({ length: 22 }, (_, i) => <path key={i} d={`M${200 + i * 31} -60 q${(rnd(i) - 0.5) * 24} 600 ${(rnd(i + 4) - 0.5) * 20} 1700`} stroke="#2a1c0e" strokeWidth={2 + rnd(i + 2) * 3} fill="none" opacity={0.6} />)}
        {Array.from({ length: groups }, (_, i) => {
          if (i >= shown) return null;
          const col = i % 5;
          const row = Math.floor(i / 5);
          const x = 270 + col * 120 + rnd(i) * 10;
          const y = 160 + row * 210 + rnd(i + 8) * 10;
          return (
            <g key={i} stroke="#0d0803" strokeWidth={7} strokeLinecap="round" opacity={0.9}>
              {[0, 1, 2, 3].map((k) => <line key={k} x1={x + k * 18} y1={y + rnd(i + k) * 6} x2={x + k * 18 + (rnd(i + k + 2) - 0.5) * 4} y2={y + 130 + rnd(i + k + 5) * 8} />)}
              <line x1={x - 14} y1={y + 100} x2={x + 74} y2={y + 28} />
            </g>
          );
        })}
      </g>
      <rect y={0} width={W} height={H} fill="#000" opacity={0.18} />
    </svg>
  );
};

/** the thatch seen from underneath: straw lines, two beams, and between them a pale folded shirt with no pattern at all */
export const RoofCard: React.FC<{ g: number; from: number; to: number }> = ({ g, from, to }) => {
  const zoom = 1 + 0.08 * ramp(g, from, to);
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
      <defs>
        <radialGradient id="rc-light" cx="0.5" cy="0.45" r="0.6"><stop offset="0" stopColor="#8d7a52" /><stop offset="1" stopColor="#0d0a06" /></radialGradient>
      </defs>
      <rect width={W} height={H} fill="#0d0a06" />
      <g transform={`translate(540,800) scale(${zoom}) translate(-540,-800)`}>
        <rect width={W} height={H} fill="url(#rc-light)" />
        {Array.from({ length: 70 }, (_, i) => <line key={i} x1={rnd(i) * W} y1={0} x2={rnd(i) * W + (rnd(i + 3) - 0.5) * 360} y2={1500} stroke="#4a3a20" strokeWidth={2 + rnd(i + 6) * 4} opacity={0.5} />)}
        <rect x={-40} y={420} width={1160} height={70} fill="#2a1c0e" transform="rotate(-4 540 455)" />
        <rect x={-40} y={1010} width={1160} height={70} fill="#2a1c0e" transform="rotate(3 540 1045)" />
        {/* the folded shirt: plain, pale, without any print */}
        <g transform="translate(540,780) rotate(-5)">
          <path d="M-80 -170 Q0 -120 80 -170 L220 -120 L290 20 L190 60 L160 -10 L160 190 L-160 190 L-160 -10 L-190 60 L-290 20 L-220 -120 Z" fill="#b9b19b" stroke="#6f6857" strokeWidth={5} strokeLinejoin="round" />
          <path d="M-80 -170 Q0 -90 80 -170" stroke="#7d7662" strokeWidth={6} fill="none" />
          <path d="M-160 -10 L-190 60 M160 -10 L190 60" stroke="#8e8772" strokeWidth={4} />
          <path d="M-150 120 Q0 150 150 120" stroke="#8e8772" strokeWidth={4} fill="none" opacity={0.7} />
          <path d="M0 -118 L0 120" stroke="#8e8772" strokeWidth={3} opacity={0.5} />
        </g>
        {Array.from({ length: 16 }, (_, i) => <circle key={i} cx={(rnd(i + 20) * W + g * (0.2 + rnd(i) * 0.3)) % W} cy={200 + rnd(i + 40) * 1000 - ((g * 0.3 + i * 30) % 120)} r={2 + rnd(i) * 2} fill="#e0d2a8" opacity={0.35} />)}
      </g>
    </svg>
  );
};

/** the memory of being carried: warm light and dark leaves sliding across the picture, out of focus, rocking; nothing else */
export const LeavesFlash: React.FC<{ g: number; from: number; to: number }> = ({ g, from, to }) => {
  const t = g - from;
  const rock = Math.sin(t * 0.08) * 3;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
      <defs>
        <linearGradient id="lf-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e6d9a0" /><stop offset="1" stopColor="#7d8a52" /></linearGradient>
        <filter id="lf-blur"><feGaussianBlur stdDeviation="7" /></filter>
      </defs>
      <rect width={W} height={H} fill="url(#lf-bg)" />
      <g transform={`rotate(${rock} 540 900)`} filter="url(#lf-blur)">
        {Array.from({ length: 36 }, (_, i) => {
          const sp = 0.6 + rnd(i) * 1.6;
          const x = ((rnd(i + 2) * (W + 400) - t * sp * 3) % (W + 400) + (W + 400)) % (W + 400) - 200;
          const y = rnd(i + 9) * H + Math.sin(t * 0.05 + i) * 30;
          return <ellipse key={i} cx={x} cy={y} rx={50 + rnd(i + 5) * 90} ry={18 + rnd(i + 1) * 30} fill={i % 3 ? "#1c2a16" : "#35471f"} opacity={0.75} transform={`rotate(${rnd(i + 7) * 180} ${x} ${y})`} />;
        })}
      </g>
      <rect width={W} height={H} fill="#fff6d0" opacity={0.18 * (0.5 + 0.5 * Math.sin(t * 0.1))} />
      <rect width={W} height={H} fill="#000" opacity={0.3 * (1 - ramp(g, from, from + 8)) + 0.3 * ramp(g, to - 10, to)} />
    </svg>
  );
};

/**
 * One pale mask comes down slowly out of the top of the dark until it fills the lower part of the frame; nothing of its body is shown.
 * In each hollow black eye there is a tiny reflection of "you" (the one reflection in the series).
 */
export const LowerFace: React.FC<{ g: number; from: number; to: number }> = ({ g, from, to }) => {
  const k = PASSENGERS.bvYou;
  const p = smooth(ramp(g, from, to - 24));
  const s = lerp(1.6, 4.4, p);
  const y = lerp(-300, 1020, p);
  const refl = ramp(g, from + (to - from) * 0.55, to - 6);
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
      <defs>
        <radialGradient id="lw-bg" cx="0.5" cy="0.5" r="0.8"><stop offset="0" stopColor="#262b22" /><stop offset="1" stopColor="#050605" /></radialGradient>
      </defs>
      <rect width={W} height={H} fill="url(#lw-bg)" />
      <g transform={`translate(540,${y}) scale(${s})`}>
        <MaskHead kind={3} x={0} y={0} tilt={Math.sin(g * 0.03) * 1.2} s={1} />
        {[-34, 36].map((ex) => (
          <g key={ex} transform={`translate(${ex + 4},-14)`} opacity={refl}>
            <circle r={9} fill={k.skin} />
            <path d="M-9 -2 Q0 -14 9 -2 Q0 -8 -9 -2 Z" fill={k.hair} />
            {[-3.4, 3.4].map((px) => <g key={px}><ellipse cx={px} cy={0} rx={2.1} ry={2.3} fill="#fff" /><circle cx={px} cy={0.1} r={1} fill="#101010" /></g>)}
          </g>
        ))}
      </g>
    </svg>
  );
};

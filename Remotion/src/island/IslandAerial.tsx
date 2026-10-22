import React from "react";
import { FLOOD, ISLAND } from "./MapCard";
import { PALETTE_A } from "./IslandWorld";

const mod = (a: number, b: number) => ((a % b) + b) % b;
const rnd = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

// The island seen from above and far out at sea (same outline as the map card), with the low flood-prone
// ground, the camp fire and seven tiny figures near where they woke. `t` is 0..1 across the shot.
export const IslandAerial: React.FC<{ frame: number; t: number }> = ({ frame, t }) => {
  const scale = 1.05 + 0.3 * t; // slow dolly in
  const rot = -5 + 5 * t;
  const cx = 465;
  const cy = 365; // centre of the island outline
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ display: "block" }}>
      <defs>
        <linearGradient id="aer-sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2f373d" />
          <stop offset="1" stopColor="#4a565e" />
        </linearGradient>
        <filter id="aer-blur"><feGaussianBlur stdDeviation="14" /></filter>
        <filter id="aer-soft"><feGaussianBlur stdDeviation="4" /></filter>
        <radialGradient id="aer-fire">
          <stop offset="0" stopColor="#ffb54a" stopOpacity={0.9} />
          <stop offset="1" stopColor="#ff9a3c" stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect width={1080} height={1920} fill="url(#aer-sea)" />
      {/* swell lines */}
      {Array.from({ length: 22 }, (_, i) => {
        const y = 80 + i * 86;
        return (
          <path key={i} d={`M-40 ${y} ${Array.from({ length: 14 }, (_, j) => `L${j * 90} ${y + Math.sin(frame * 0.03 + j * 0.8 + i) * 7}`).join(" ")}`} stroke="#8c949a" strokeWidth={2} fill="none" opacity={0.16} />
        );
      })}
      <g transform={`translate(540,930) rotate(${rot}) scale(${scale}) translate(${-cx},${-cy})`}>
        {/* shallow water and foam around the island */}
        <path d={ISLAND} fill="none" stroke="#5f7380" strokeWidth={90} opacity={0.35} filter="url(#aer-blur)" />
        <path d={ISLAND} fill="none" stroke="#c9d0d3" strokeWidth={16} opacity={0.35 + 0.1 * Math.sin(frame * 0.05)} filter="url(#aer-soft)" />
        {/* sand, then the forest, then the hill */}
        <path d={ISLAND} fill={PALETTE_A.sand} />
        <g transform={`translate(${cx},${cy}) scale(0.86) translate(${-cx},${-cy})`}>
          <path d={ISLAND} fill="#2d3a33" />
        </g>
        {Array.from({ length: 70 }, (_, i) => {
          const a = rnd(i) * Math.PI * 2;
          const r = Math.sqrt(rnd(i + 3)) * 0.8;
          return <circle key={i} cx={cx + Math.cos(a) * 300 * r + 40} cy={cy + Math.sin(a) * 170 * r - 20} r={7 + rnd(i + 7) * 9} fill="#1f2a25" opacity={0.7} />;
        })}
        <g transform={`translate(${cx + 120},${cy - 130}) scale(0.42) translate(${-cx},${-cy})`}>
          <path d={ISLAND} fill="#232a2e" />
        </g>
        {/* the low ground that the sea reaches at night */}
        <path d={FLOOD} fill="#4d6a82" opacity={0.28} />
        <path d={FLOOD} fill="none" stroke="#8fb3cc" strokeWidth={4} strokeDasharray="12 10" opacity={0.55} />
        {/* the camp fire and the seven */}
        <circle cx={395} cy={475} r={60} fill="url(#aer-fire)" opacity={0.75 + 0.2 * Math.sin(frame * 0.7)} />
        <circle cx={395} cy={475} r={5} fill="#ffe3a0" />
        {Array.from({ length: 7 }, (_, i) => (
          <circle key={i} cx={205 + (i % 4) * 14} cy={535 + Math.floor(i / 4) * 14} r={4.2} fill={["#c58b5c", "#f1d3c2", "#b97f5a", "#e6b896", "#e0b08c", "#e3b796", "#e9c3a3"][i]} stroke="#0b0d10" strokeWidth={1} />
        ))}
      </g>
      {/* drifting cloud shadows and fog */}
      {Array.from({ length: 5 }, (_, i) => (
        <ellipse key={i} cx={mod(rnd(i) * 1800 + frame * (0.6 + rnd(i + 2)), 1800) - 360} cy={300 + i * 330} rx={360} ry={120} fill="#0d1114" opacity={0.22} filter="url(#aer-blur)" />
      ))}
      <rect width={1080} height={1920} fill="#cfd5d8" opacity={0.08 + 0.04 * Math.sin(frame * 0.03)} />
    </svg>
  );
};

import React from "react";
import { AbsoluteFill, staticFile } from "remotion";
import { Figure, LOOKS, Mood } from "./Figure";
import { Traveller } from "./Traveller";

// Vertical (1080x1920) test: a painted-over photo of a stilt village (Wikimedia Commons, CC0, run through OpenCV) behind code-drawn characters on a pier.
// Light from the upper right: shadows run to the lower left, the same skew + squash for everything.

const INK = "#0f0b09";
const SHADOW = "#141a36";
const SKEW = -55;
const SQUASH = 0.34;
const PIER_TOP = 1240;

const Shade: React.FC<{ x: number; y: number; k?: number; children: React.ReactNode }> = ({ x, y, k = 1, children }) => (
  <g transform={`translate(${x},${y}) skewX(${SKEW}) scale(${k},${-SQUASH * k})`} opacity={0.78}>{children}</g>
);

export const VillageVert: React.FC = () => {
  const people: { id: string; x: number; y: number; s: number; mood: Mood }[] = [
    { id: "oldman", x: 880, y: 1372, s: 0.5, mood: "calm" },
    { id: "cook", x: 640, y: 1380, s: 0.52, mood: "smile" },
    { id: "head", x: 770, y: 1470, s: 0.68, mood: "smile" },
    { id: "mother", x: 960, y: 1480, s: 0.66, mood: "smile" },
    { id: "child", x: 560, y: 1490, s: 0.9, mood: "calm" },
  ];
  return (
    <AbsoluteFill style={{ background: "#1a120c" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <defs>
          <linearGradient id="pv-pier" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6a5438" /><stop offset="1" stopColor="#3a2a1a" /></linearGradient>
          <radialGradient id="pv-vig" cx="0.5" cy="0.5" r="0.75"><stop offset="0.5" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#0a0604" stopOpacity="0.75" /></radialGradient>
          <linearGradient id="pv-fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0.93" stopColor="#2a2118" stopOpacity="0" /><stop offset="1" stopColor="#2a2118" stopOpacity="1" /></linearGradient>
          <filter id="pv-grade" colorInterpolationFilters="sRGB">
            <feColorMatrix type="saturate" values="0.62" />
            <feColorMatrix type="matrix" values="0.92 0 0 0 0.02  0 0.88 0 0 0.02  0 0 0.8 0 0.03  0 0 0 1 0" />
            <feComponentTransfer><feFuncR type="gamma" amplitude="0.92" exponent="1.12" /><feFuncG type="gamma" amplitude="0.92" exponent="1.12" /><feFuncB type="gamma" amplitude="0.92" exponent="1.12" /></feComponentTransfer>
          </filter>
          <linearGradient id="pv-haze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c9b79a" stopOpacity="0.0" /><stop offset="1" stopColor="#c9b79a" stopOpacity="0.08" /></linearGradient>
          <linearGradient id="pv-skytint" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7d8aa0" stopOpacity="0.28" /><stop offset="0.6" stopColor="#d8c3a0" stopOpacity="0" /></linearGradient>
          <filter id="pv-grain"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="4" /><feColorMatrix type="saturate" values="0" /></filter>
        </defs>
        <image href={staticFile("shadow1/bg_asia.png")} x={0} y={0} width={1080} height={1250} />
        <rect y={0} width={1080} height={1250} fill="url(#pv-fade)" />
        <g filter="url(#pv-grade)">
        {/* the pier: planks running toward the water, with a lip and posts */}
        <polygon points={`0,${PIER_TOP} 1080,${PIER_TOP} 1080,1920 0,1920`} fill="url(#pv-pier)" />
        <rect y={PIER_TOP - 10} width={1080} height={14} fill="#2a2016" stroke={INK} strokeWidth={5} />
        {Array.from({ length: 13 }, (_, i) => {
          const y0 = PIER_TOP + 4 + i * i * 3.1 + i * 12;
          const y1 = PIER_TOP + 4 + (i + 1) * (i + 1) * 3.1 + (i + 1) * 12;
          const tone = ["#6a5438", "#5e4a32", "#6f5a3e", "#58432c"][i % 4];
          const joints = [(i * 173) % 400 + 80, (i * 291) % 380 + 560, (i * 97) % 300 + 330].sort((x, y) => x - y);
          return (
            <g key={i}>
              <rect x={0} y={y0} width={1080} height={y1 - y0} fill={tone} />
              <line x1={0} y1={y1} x2={1080} y2={y1} stroke={INK} strokeWidth={3 + i * 0.35} opacity={0.7} />
              {joints.map((x, j) => <line key={j} x1={x} y1={y0} x2={x + (x - 540) * 0.03 * (i + 1)} y2={y1} stroke={INK} strokeWidth={2.4} opacity={0.45} />)}
              <line x1={20 + (i * 53) % 200} y1={y0 + (y1 - y0) * 0.45} x2={260 + (i * 53) % 200} y2={y0 + (y1 - y0) * 0.5} stroke="#2a1d10" strokeWidth={2} opacity={0.35} />
            </g>
          );
        })}
        <g stroke={INK} strokeWidth={6}>
          <rect x={60} y={PIER_TOP - 150} width={26} height={150} fill="#5a4630" />
          <rect x={430} y={PIER_TOP - 150} width={26} height={150} fill="#5a4630" />
        </g>
        <Shade x={73} y={PIER_TOP + 8}><rect x={-13} y={-150} width={26} height={150} fill={SHADOW} /></Shade>
        <Shade x={443} y={PIER_TOP + 8}><rect x={-13} y={-150} width={26} height={150} fill={SHADOW} /></Shade>
        {/* villagers: no shadow */}
        {[...people].sort((a, b) => a.y - b.y).map((p) => (
          <g key={p.id} transform={`translate(${p.x},${p.y}) scale(${p.s})`}><Figure look={LOOKS[p.id]} mood={p.mood} t={0} /></g>
        ))}
        {/* the traveller, in front, with a long shadow */}
        <Shade x={300} y={1810} k={1.25}><Traveller yaw={25} silhouette /></Shade>
        <g transform="translate(300,1810) scale(1.25)"><Traveller yaw={25} mood="worry" t={0} /></g>
        </g>
        {/* one overlay over everything: a pale dusty haze lifting from the water, a cold tint in the sky */}
        <rect y={1000} width={1080} height={920} fill="url(#pv-haze)" />
        <rect width={1080} height={1250} fill="url(#pv-skytint)" />
        <rect width={1080} height={1920} filter="url(#pv-grain)" opacity={0.14} />
        <rect width={1080} height={1920} fill="url(#pv-vig)" />
      </svg>
    </AbsoluteFill>
  );
};

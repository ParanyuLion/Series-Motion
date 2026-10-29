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
          <linearGradient id="pv-fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0.8" stopColor="#2a2118" stopOpacity="0" /><stop offset="1" stopColor="#2a2118" stopOpacity="1" /></linearGradient>
          <filter id="pv-grain"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="4" /><feColorMatrix type="saturate" values="0" /></filter>
        </defs>
        <image href={staticFile("shadow1/bg_asia.png")} x={0} y={0} width={1080} height={1250} />
        <rect y={0} width={1080} height={1250} fill="url(#pv-fade)" />
        {/* the pier: planks running toward the water, with a lip and posts */}
        <polygon points={`0,${PIER_TOP} 1080,${PIER_TOP} 1080,1920 0,1920`} fill="url(#pv-pier)" />
        <rect y={PIER_TOP - 10} width={1080} height={14} fill="#2a2016" stroke={INK} strokeWidth={5} />
        {Array.from({ length: 14 }, (_, i) => {
          const y = PIER_TOP + 6 + i * i * 3.2 + i * 14;
          return <line key={i} x1={0} y1={y} x2={1080} y2={y} stroke={INK} strokeWidth={2 + i * 0.35} opacity={0.55} />;
        })}
        {Array.from({ length: 9 }, (_, i) => <line key={"v" + i} x1={140 + i * 100} y1={PIER_TOP + 10} x2={-300 + i * 210} y2={1920} stroke={INK} strokeWidth={2.5} opacity={0.25} />)}
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
        <rect width={1080} height={1920} filter="url(#pv-grain)" opacity={0.14} />
        <rect width={1080} height={1920} fill="url(#pv-vig)" />
      </svg>
    </AbsoluteFill>
  );
};

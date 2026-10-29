import React from "react";
import { AbsoluteFill, staticFile } from "remotion";
import { Figure, LOOKS, Mood } from "./Figure";
import { Traveller } from "./Traveller";

// Vertical (1080x1920) test: a painted-over photo of a stilt village (Wikimedia Commons, CC0, run through OpenCV) behind code-drawn characters on a pier.
// Light from the upper right: shadows run to the lower left, the same skew + squash for everything.

export const INK = "#0f0b09";
export const SHADOW = "#141a36";
export const SKEW = -55;
export const SQUASH = 0.34;
export const PIER_TOP = 960;

export const Shade: React.FC<{ x: number; y: number; k?: number; skew?: number; sq?: number; children: React.ReactNode }> = ({ x, y, k = 1, skew = SKEW, sq = SQUASH, children }) => (
  <g transform={`translate(${x},${y}) skewX(${skew}) scale(${k},${-sq * k})`} opacity={0.78}>{children}</g>
);


export const Bucket: React.FC<{ shadow?: boolean }> = ({ shadow = false }) => shadow ? (
  <g fill={SHADOW}><polygon points="-34,-62 34,-62 28,0 -28,0" /><path d="M-34 -62 Q0 -120 34 -62" fill="none" stroke={SHADOW} strokeWidth={6} /></g>
) : (
  <g strokeLinejoin="round">
    <path d="M-34 -62 Q0 -118 34 -62" fill="none" stroke={INK} strokeWidth={5} />
    <polygon points="-34,-62 34,-62 28,0 -28,0" fill="#7a5a3a" stroke={INK} strokeWidth={6} />
    <ellipse cx={0} cy={-62} rx={34} ry={8} fill="#2a1d10" stroke={INK} strokeWidth={5} />
    {[-14, 0, 14].map((x, i) => <line key={i} x1={x} y1={-56} x2={x * 0.82} y2={-4} stroke={INK} strokeWidth={2.5} opacity={0.4} />)}
    <rect x={-31} y={-40} width={62} height={7} fill="#3a2c1c" stroke={INK} strokeWidth={3} />
  </g>
);
export const Crates: React.FC<{ shadow?: boolean }> = ({ shadow = false }) => shadow ? (
  <g fill={SHADOW}><rect x={-70} y={-70} width={140} height={70} /><rect x={-40} y={-130} width={96} height={60} /></g>
) : (
  <g strokeLinejoin="round" stroke={INK} strokeWidth={6}>
    <rect x={-70} y={-70} width={140} height={70} fill="#7d6040" />
    <rect x={-40} y={-130} width={96} height={60} fill="#6a5034" />
    {[-35, 0, 35].map((x, i) => <line key={i} x1={x} y1={-68} x2={x} y2={-2} strokeWidth={3} opacity={0.5} />)}
    <line x1={-70} y1={-35} x2={70} y2={-35} strokeWidth={3} opacity={0.5} />
    <path d="M-40 -130 L56 -70 M56 -130 L-40 -70" strokeWidth={3} opacity={0.35} />
  </g>
);
export const Rope: React.FC<{ shadow?: boolean }> = ({ shadow = false }) => shadow ? (
  <ellipse cx={0} cy={-8} rx={64} ry={26} fill={SHADOW} />
) : (
  <g fill="none" stroke={INK} strokeWidth={5}>
    {[0, 1, 2, 3].map((i) => <ellipse key={i} cx={0} cy={-6 - i * 5} rx={62 - i * 11} ry={26 - i * 4.5} fill={i === 3 ? "#8a7048" : "none"} stroke={INK} />)}
    {[0, 1, 2, 3].map((i) => <ellipse key={"c" + i} cx={0} cy={-6 - i * 5} rx={62 - i * 11} ry={26 - i * 4.5} stroke="#b59a68" strokeWidth={2} opacity={0.7} />)}
    <path d="M60 -8 Q110 -4 150 6" stroke={INK} strokeWidth={9} /><path d="M60 -8 Q110 -4 150 6" stroke="#9a8058" strokeWidth={5} />
  </g>
);
export const Net: React.FC = () => (
  <g strokeLinejoin="round">
    <path d="M-90 0 Q-100 -40 -60 -56 Q-10 -80 50 -56 Q100 -38 90 0 Z" fill="#6f6a4a" stroke={INK} strokeWidth={6} opacity={0.95} />
    {[-60, -30, 0, 30, 60].map((x, i) => <path key={i} d={`M${x} -6 Q${x + 8} -40 ${x + 14} -66`} fill="none" stroke={INK} strokeWidth={2.4} opacity={0.5} />)}
    {[-20, -40].map((y, i) => <path key={i} d={`M-86 ${y} Q0 ${y - 22} 86 ${y}`} fill="none" stroke={INK} strokeWidth={2.4} opacity={0.5} />)}
    <circle cx={-50} cy={-12} r={9} fill="#b9a67a" stroke={INK} strokeWidth={3} /><circle cx={30} cy={-18} r={8} fill="#b9a67a" stroke={INK} strokeWidth={3} />
  </g>
);
export const Mooring: React.FC<{ shadow?: boolean }> = ({ shadow = false }) => shadow ? (
  <g fill={SHADOW}><rect x={-22} y={-230} width={44} height={230} /></g>
) : (
  <g strokeLinejoin="round">
    <rect x={-22} y={-230} width={44} height={230} fill="#5a4630" stroke={INK} strokeWidth={7} />
    <ellipse cx={0} cy={-230} rx={22} ry={8} fill="#7a6040" stroke={INK} strokeWidth={5} />
    {[-190, -110].map((y, i) => <path key={i} d={`M-22 ${y} Q0 ${y + 12} 22 ${y}`} fill="none" stroke={INK} strokeWidth={3} opacity={0.5} />)}
    <path d="M-20 -200 Q-80 -170 -60 -150 Q-20 -130 24 -170" fill="none" stroke={INK} strokeWidth={10} /><path d="M-20 -200 Q-80 -170 -60 -150 Q-20 -130 24 -170" fill="none" stroke="#9a8058" strokeWidth={5} />
    <path d="M-60 -150 Q-120 -80 -150 -10" fill="none" stroke={INK} strokeWidth={10} /><path d="M-60 -150 Q-120 -80 -150 -10" fill="none" stroke="#9a8058" strokeWidth={5} />
  </g>
);

export const VillageVert: React.FC = () => {
  const people: { id: string; x: number; y: number; s: number; mood: Mood }[] = [
    { id: "oldman", x: 480, y: 1090, s: 0.5, mood: "calm" },
    { id: "cook", x: 250, y: 1100, s: 0.52, mood: "smile" },
    { id: "head", x: 370, y: 1180, s: 0.68, mood: "smile" },
    { id: "mother", x: 585, y: 1190, s: 0.66, mood: "smile" },
    { id: "child", x: 140, y: 1200, s: 0.9, mood: "calm" },
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
        {Array.from({ length: 19 }, (_, i) => {
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
        {/* things lying about on the pier, each with its hard shadow */}
        {[[430, 1470, 150, 22], [250, 1700, 120, 18], [860, 1850, 170, 24]].map(([x, y, rx, ry], i) => (
          <g key={"pd" + i}><ellipse cx={x} cy={y} rx={rx} ry={ry} fill="#8c8f95" opacity={0.55} /><ellipse cx={x - rx * 0.25} cy={y - ry * 0.25} rx={rx * 0.5} ry={ry * 0.35} fill="#c9c6bb" opacity={0.45} /></g>
        ))}
        {[[120, 1380], [600, 1560], [700, 1420], [380, 1830], [980, 1520]].map(([x, y], i) => <circle key={"kn" + i} cx={x} cy={y} r={7 + (i % 2) * 3} fill="#3a2a1a" stroke={INK} strokeWidth={2} opacity={0.6} />)}
        <Shade x={940} y={1860} k={1.1}><Mooring shadow /></Shade>
        <g transform="translate(940,1860) scale(1.1)"><Mooring /></g>
        <Shade x={160} y={1790} k={1}><Crates shadow /></Shade>
        <g transform="translate(160,1790)"><Crates /></g>
        <Shade x={290} y={1560} k={0.8}><Bucket shadow /></Shade>
        <g transform="translate(290,1560) scale(0.8)"><Bucket /></g>
        <Shade x={640} y={1700} k={1}><Rope shadow /></Shade>
        <g transform="translate(640,1700)"><Rope /></g>
        <g transform="translate(470,1330) scale(0.9)"><Net /></g>
        {/* villagers: no shadow */}
        {[...people].sort((a, b) => a.y - b.y).map((p) => (
          <g key={p.id} transform={`translate(${p.x},${p.y}) scale(${p.s})`}><Figure look={LOOKS[p.id]} mood={p.mood} t={0} /></g>
        ))}
        {/* the traveller, in front, with a long shadow */}
        <Shade x={800} y={1300} k={0.95}><Traveller yaw={-25} silhouette /></Shade>
        <g transform="translate(800,1300) scale(0.95)"><Traveller yaw={-25} mood="worry" t={0} /></g>
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

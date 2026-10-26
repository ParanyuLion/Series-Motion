import React from "react";
import { AbsoluteFill } from "remotion";
import { PassengerId } from "../bts/cast";
import { Passenger } from "../bts/Passenger";
import { fontFamily } from "../island/fonts";

// The look of series 4 "1 ดาว": a near-black blue night, one strong light with a soft beam and dust, blurred bokeh and rain,
// the people of the earlier series pushed dark and blue with a pale rim outline on the lit side, one accent colour (the app's yellow).
export const PAL = { bg0: "#05070f", bg1: "#101a30", rim: "#9fb4d6", beam: "#cfe0ff", accent: "#f2c230" };

const rnd = (i: number) => {
  const v = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return v - Math.floor(v);
};

/** SVG defs used by everything here: put once inside each <svg>. */
export const LookDefs: React.FC = () => (
  <defs>
    <filter id="os-rim" x="-20%" y="-20%" width="140%" height="140%">
      <feColorMatrix type="matrix" values="0.34 0 0 0 0.01  0 0.42 0 0 0.02  0 0 0.66 0 0.05  0 0 0 1 0" result="dark" />
      <feOffset in="SourceAlpha" dx="-5" dy="0" result="off" />
      <feComposite in="SourceAlpha" in2="off" operator="out" result="edge" />
      <feFlood floodColor={PAL.rim} floodOpacity="0.8" />
      <feComposite in2="edge" operator="in" result="rim" />
      <feMerge><feMergeNode in="dark" /><feMergeNode in="rim" /></feMerge>
    </filter>
    <filter id="os-blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14" /></filter>
    <filter id="os-soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="6" /></filter>
    <linearGradient id="os-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={PAL.bg0} /><stop offset="1" stopColor={PAL.bg1} /></linearGradient>
    <linearGradient id="os-beam" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={PAL.beam} stopOpacity="0.55" /><stop offset="1" stopColor={PAL.beam} stopOpacity="0" /></linearGradient>
  </defs>
);

/** gradient sky, far blurred street lights, falling rain */
export const NightBackdrop: React.FC<{ g: number; tint?: string; x0?: number; x1?: number; y0?: number; y1?: number }> = ({ g, tint = PAL.accent, x0 = -400, x1 = 1500, y0 = -200, y1 = 2200 }) => {
  const w = x1 - x0;
  const bokeh = Array.from({ length: 16 }, (_, i) => {
    const x = x0 + rnd(i) * w;
    const y = 700 + rnd(i + 40) * 560;
    const r = 26 + rnd(i + 80) * 46;
    const col = rnd(i + 120) > 0.55 ? tint : "#6fa8ff";
    return <circle key={i} cx={x} cy={y} r={r} fill={col} opacity={0.34 + rnd(i + 7) * 0.26} />;
  });
  const rain = Array.from({ length: 70 }, (_, i) => {
    const x = x0 + rnd(i + 200) * w;
    const sp = 38 + rnd(i + 240) * 30;
    const y = y0 + ((rnd(i + 280) * 2000 + g * sp) % (y1 - y0));
    return <line key={i} x1={x} y1={y} x2={x - 10} y2={y + 52} stroke={PAL.beam} strokeWidth={2} opacity={0.18 + rnd(i + 5) * 0.14} />;
  });
  return (
    <g>
      <rect x={x0} y={y0} width={w} height={y1 - y0} fill="url(#os-bg)" />
      <g filter="url(#os-blur)">{bokeh}</g>
      {rain}
    </g>
  );
};

/** a soft cone of light starting at (x, y), pointing along `angle` degrees (0 = right), with drifting dust */
export const Beam: React.FC<{ x: number; y: number; angle: number; length: number; spread?: number; op?: number; g?: number }> = ({ x, y, angle, length, spread = 150, op = 1, g = 0 }) => {
  const dust = Array.from({ length: 22 }, (_, i) => {
    const t = rnd(i + 11);
    const across = (rnd(i + 31) - 0.5) * 2 * (spread * t * 0.5);
    const along = t * length;
    return <circle key={i} cx={along + Math.sin(g * 0.04 + i) * 6} cy={across + Math.cos(g * 0.03 + i * 2) * 6} r={1.6 + rnd(i + 51) * 2} fill={PAL.beam} opacity={0.55 * (1 - t) * op} />;
  });
  return (
    <g transform={`translate(${x},${y}) rotate(${angle})`} opacity={op}>
      <g filter="url(#os-soft)"><polygon points={`0,-16 ${length},${-spread} ${length},${spread} 0,16`} fill="url(#os-beam)" /></g>
      {dust}
    </g>
  );
};

/** a person of the earlier series in the night grade (dark, blue, rim-lit) */
export const Actor: React.FC<{ id: PassengerId; x: number; y: number; scale?: number; facing?: 1 | -1; pose?: "stand" | "sit"; walk?: number; g: number; fear?: number; op?: number }> = ({ id, x, y, scale = 1.7, facing = 1, pose = "stand", walk = 0, g, fear = 0, op = 1 }) => (
  <g filter="url(#os-rim)" opacity={op}>
    <Passenger id={id} x={x} y={y} scale={scale} facing={facing} phase={g * 0.2} walk={walk} frame={g} infection={0} pose={pose} label={false} fear={fear} />
  </g>
);

/** the HUD in the top-left corner: small flat lines, the first one big (the app countdown) */
export const Hud: React.FC<{ lines: string[]; accent?: boolean }> = ({ lines, accent = true }) => (
  <g fontFamily={fontFamily} transform="translate(64,120)">
    <g transform="translate(0,-30)" fill={accent ? PAL.accent : PAL.rim}>
      <rect x={0} y={10} width={44} height={16} rx={6} />
      <rect x={8} y={2} width={26} height={12} rx={5} />
      <circle cx={10} cy={28} r={5} fill={PAL.bg0} /><circle cx={34} cy={28} r={5} fill={PAL.bg0} />
    </g>
    {lines.map((t, i) => (
      <text key={i} x={62} y={i * 44} fontSize={i === 0 ? 44 : 28} fill={i === 0 && accent ? PAL.accent : PAL.rim} opacity={i === 0 ? 1 : 0.8} fontWeight={500}>{t}</text>
    ))}
  </g>
);

/** vignette and grain over everything */
export const Grade: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ background: PAL.bg0 }}>
    <AbsoluteFill style={{ filter: "contrast(1.08) saturate(0.95)" }}>{children}</AbsoluteFill>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.6) 100%)", pointerEvents: "none" }} />
    <svg width="100%" height="100%" viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, mixBlendMode: "overlay", opacity: 0.12, pointerEvents: "none" }}>
      <filter id="os-grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" /><feColorMatrix type="saturate" values="0" /></filter>
      <rect width="1080" height="1920" filter="url(#os-grain)" />
    </svg>
  </AbsoluteFill>
);

/** the standard Thai subtitle block (Prompt 500, 52 px, safe area) */
export const Subtitle: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ position: "absolute", left: 60, right: 160, bottom: 340, color: "#fff", fontFamily, fontSize: 52, lineHeight: 1.3, textAlign: "center", textShadow: "0 2px 8px rgba(0,0,0,0.9)" }}>{text}</div>
);

import React from "react";
import { PASSENGERS } from "../bts/cast";
import { SnakeTile } from "../bts/SnakeTile";

const W = 1080;
const H = 1920;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** the waking: an extreme close-up of one closed eye; the pupil moves under the lid; at `open` 1 the eye is wide open */
export const EyeOpen: React.FC<{ g: number; open: number }> = ({ g, open }) => {
  const h = 6 + 230 * open;
  const px = Math.sin(g * 0.09) * 50 * (1 - open) + Math.sin(g * 0.05) * 14 * open;
  const py = Math.sin(g * 0.07) * 14;
  const lid = `M200 900 Q540 ${900 - h * 1.35} 880 900 Q540 ${900 + h * 0.9} 200 900 Z`;
  const k = PASSENGERS.bvYou;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
      <defs>
        <radialGradient id="eo-bg" cx="0.5" cy="0.45" r="0.8"><stop offset="0" stopColor="#e9c7a8" /><stop offset="1" stopColor="#6a4a38" /></radialGradient>
        <radialGradient id="eo-iris" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#7a5230" /><stop offset="0.7" stopColor="#4a3020" /><stop offset="1" stopColor="#2a1a10" /></radialGradient>
        <clipPath id="eo-clip"><path d={lid} /></clipPath>
      </defs>
      <rect width={W} height={H} fill="url(#eo-bg)" />
      {/* brow and lid creases */}
      <path d="M150 700 Q540 560 940 700" stroke="#3a2418" strokeWidth={34} fill="none" strokeLinecap="round" opacity={0.85} />
      <path d={`M190 ${880 - h * 0.4} Q540 ${780 - h * 1.5} 890 ${880 - h * 0.4}`} stroke="#a67a58" strokeWidth={8} fill="none" opacity={0.6} />
      <ellipse cx={540} cy={1000} rx={360} ry={150} fill={k.skin} opacity={0.2} />
      {/* the pupil's bulge under the closed lid */}
      <ellipse cx={540 + px} cy={900 + py} rx={115} ry={95} fill="#6a4a38" opacity={0.35 * (1 - open)} />
      <g clipPath="url(#eo-clip)">
        <rect x={180} y={600} width={720} height={600} fill="#f1ece4" />
        <circle cx={540 + px * 0.5} cy={900 + py} r={150} fill="url(#eo-iris)" />
        <circle cx={540 + px * 0.5} cy={900 + py} r={56 - 6 * open} fill="#050403" />
        <circle cx={500 + px * 0.5} cy={858 + py} r={26} fill="#fff" opacity={0.9} />
        <circle cx={580 + px * 0.5} cy={942 + py} r={11} fill="#fff" opacity={0.6} />
        <path d={`M200 900 Q540 ${900 - h * 1.35} 880 900`} stroke="#00000040" strokeWidth={28} fill="none" />
      </g>
      <path d={lid} fill="none" stroke="#2a1a12" strokeWidth={10} />
      {Array.from({ length: 14 }, (_, i) => {
        const t = (i + 1) / 15;
        const x = 200 + t * 680;
        const y = 900 - (h * 1.35) * 4 * t * (1 - t) * 0.5 * 2 * 0.5 * 2;
        return <line key={i} x1={x} y1={y} x2={x + (t - 0.5) * 60} y2={y - 34} stroke="#1a0f0a" strokeWidth={5} strokeLinecap="round" />;
      })}
    </svg>
  );
};

const Wrinkles: React.FC = () => (
  <g fill="none" stroke="#9a6e4c" strokeWidth={5} strokeLinecap="round" opacity={0.7}>
    <path d="M-60 -76 Q0 -92 60 -76" />
    <path d="M-52 -58 Q0 -70 52 -58" />
    <path d="M-76 6 Q-84 30 -72 48" />
    <path d="M76 6 Q84 30 72 48" />
    <path d="M-34 70 Q-46 84 -38 98" />
    <path d="M34 70 Q46 84 38 98" />
  </g>
);

/** the head, face on: white hair, clouded white eyes (no pupils), a gentle smile that grows with `smile` 0..1 */
export const FaceHead: React.FC<{ g: number; smile: number; zoom?: number }> = ({ g, smile, zoom = 1 }) => {
  const k = PASSENGERS.bvHead;
  const sway = Math.sin(g * 0.05) * 1.4;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
      <defs>
        <linearGradient id="fh-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8d9a6e" /><stop offset="1" stopColor="#2f3a28" /></linearGradient>
        <linearGradient id="fh-shade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0b0e0a" stopOpacity={0} /><stop offset="0.35" stopColor="#0b0e0a" stopOpacity={0.8} /><stop offset="1" stopColor="#0b0e0a" stopOpacity={0.95} /></linearGradient>
      </defs>
      <rect width={W} height={H} fill="url(#fh-bg)" />
      <g transform={`translate(540,800) scale(${3.0 * zoom}) rotate(${sway})`}>
        <path d="M-210 330 Q-190 200 -90 176 L90 176 Q190 200 210 330 Z" fill="#b49340" />
        <g transform="translate(0,262)"><SnakeTile size={96} /></g>
        <rect x={-34} y={96} width={68} height={92} rx={26} fill={k.skin} />
        <ellipse cx={-96} cy={4} rx={13} ry={22} fill={k.skin} />
        <ellipse cx={96} cy={4} rx={13} ry={22} fill={k.skin} />
        <ellipse cx={0} cy={0} rx={92} ry={108} fill={k.skin} />
        <path d="M-94 -14 Q-104 -118 0 -122 Q104 -118 94 -14 Q76 -88 0 -90 Q-76 -88 -94 -14 Z" fill={k.hair} />
        <path d="M-94 -14 Q-100 26 -88 40 M94 -14 Q100 26 88 40" stroke={k.hair} strokeWidth={14} fill="none" strokeLinecap="round" />
        <Wrinkles />
        {[-44, 44].map((ex, i) => (
          <g key={i} transform={`translate(${ex},-14)`}>
            <ellipse rx={28} ry={24} fill="#e9ebe6" stroke="#b7bdb8" strokeWidth={3} />
            <ellipse cx={-6} cy={-6} rx={14} ry={9} fill="#f7f8f4" opacity={0.9} />
            <ellipse rx={20} ry={17} fill="none" stroke="#c9d3d6" strokeWidth={4} opacity={0.6} />
          </g>
        ))}
        <path d="M-40 -48 Q-44 -60 -22 -56 M40 -48 Q44 -60 22 -56" stroke={k.hair} strokeWidth={6} fill="none" strokeLinecap="round" />
        <path d="M0 -4 Q-8 24 -6 34 Q0 38 8 34" stroke="#a97a58" strokeWidth={4} fill="none" strokeLinecap="round" />
        <path d={`M${-30 - 8 * smile} ${60 - 4 * smile} Q0 ${60 + 22 * smile} ${30 + 8 * smile} ${60 - 4 * smile}`} stroke="#6a3a2a" strokeWidth={6} fill="none" strokeLinecap="round" />
      </g>
      <rect y={1300} width={W} height={620} fill="url(#fh-shade)" />
    </svg>
  );
};

/** "you", face on: the pupils are the only ones in the village; `still` keeps the eyes dead straight while you answer */
export const FaceYou: React.FC<{ g: number; still: number; zoom?: number }> = ({ g, still, zoom = 1 }) => {
  const k = PASSENGERS.bvYou;
  const sway = Math.sin(g * 0.11) * 1.0;
  const blink = Math.max(0, 1 - Math.abs(((g % 90) - 40) / 3));
  const look = Math.sin(g * 0.12) * 12 * (1 - still);
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
      <defs>
        <linearGradient id="fy1-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#9aa684" /><stop offset="1" stopColor="#2b3225" /></linearGradient>
        <linearGradient id="fy1-shade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0b0e0a" stopOpacity={0} /><stop offset="0.35" stopColor="#0b0e0a" stopOpacity={0.8} /><stop offset="1" stopColor="#0b0e0a" stopOpacity={0.95} /></linearGradient>
      </defs>
      <rect width={W} height={H} fill="url(#fy1-bg)" />
      <g transform={`translate(540,800) scale(${3.0 * zoom}) rotate(${sway})`}>
        <path d="M-210 330 Q-190 200 -90 176 L90 176 Q190 200 210 330 Z" fill="#7d8a8f" />
        <rect x={-34} y={96} width={68} height={92} rx={26} fill={k.skin} />
        <ellipse cx={-96} cy={4} rx={13} ry={22} fill={k.skin} />
        <ellipse cx={96} cy={4} rx={13} ry={22} fill={k.skin} />
        <ellipse cx={0} cy={0} rx={92} ry={108} fill={k.skin} />
        <path d="M-94 -14 Q-100 -118 0 -120 Q100 -118 94 -14 Q74 -86 0 -88 Q-74 -86 -94 -14 Z" fill={k.hair} />
        <path d="M-62 -40 Q-44 -52 -26 -42 M26 -42 Q44 -52 62 -40" stroke="#1b1b1b" strokeWidth={6} fill="none" strokeLinecap="round" transform="translate(0,-14)" />
        {[-44, 44].map((ex, i) => (
          <g key={i} transform={`translate(${ex},-14)`}>
            <ellipse rx={25} ry={25 * (1 - blink * 0.9)} fill="#ffffff" stroke="#8a8a8a" strokeWidth={2} />
            <circle cx={look} cy={1} r={10} fill="#1b1b1b" />
            <circle cx={look + 3} cy={-3} r={3.2} fill="#fff" />
          </g>
        ))}
        <path d="M0 -4 Q-8 24 -6 34 Q0 38 8 34" stroke="#b98a68" strokeWidth={4} fill="none" strokeLinecap="round" />
        <path d="M-24 66 Q0 62 24 66" stroke="#8a3a30" strokeWidth={6} fill="none" strokeLinecap="round" />
        <path d="M72 -42 q6 12 0 22" stroke="#cfe6f2" strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.9 * clamp01(still)} />
      </g>
      <rect y={1300} width={W} height={620} fill="url(#fy1-shade)" />
    </svg>
  );
};

/** the pattern, large, on the cloth of a shirt; `watching` opens the face's eyes */
export const PatternCard: React.FC<{ t: number; watching?: boolean }> = ({ t, watching = false }) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
    <defs>
      <radialGradient id="pc-vig" cx="0.5" cy="0.45" r="0.75"><stop offset="0.5" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#000" stopOpacity={0.65} /></radialGradient>
    </defs>
    <rect width={W} height={H} fill="#b49340" />
    {Array.from({ length: 48 }, (_, i) => <line key={`h${i}`} x1={0} y1={i * 42} x2={W} y2={i * 42} stroke="#9a7c30" strokeWidth={2} opacity={0.55} />)}
    {Array.from({ length: 28 }, (_, i) => <line key={`v${i}`} x1={i * 42} y1={0} x2={i * 42} y2={H} stroke="#a9893a" strokeWidth={2} opacity={0.45} />)}
    <g transform={`translate(540,820) scale(${1 + 0.08 * t})`}>
      <SnakeTile size={780} watching={watching} />
    </g>
    <rect width={W} height={H} fill="url(#pc-vig)" />
  </svg>
);

import React from "react";
import { PASSENGERS } from "../bts/cast";
import { SnakeTile } from "../bts/SnakeTile";

const W = 1080;
const H = 1920;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** the waking: a close-up of the eyes of a face, both eyes in frame; the pupils move under the closed lids; at `open` 1 both eyes are open */
export const EyeOpen: React.FC<{ g: number; open: number }> = ({ g, open }) => {
  const h = 4 + 96 * open;
  const px = Math.sin(g * 0.09) * 20 * (1 - open) + Math.sin(g * 0.05) * 6 * open;
  const py = Math.sin(g * 0.07) * 6;
  const k = PASSENGERS.bvYou;
  const Eye: React.FC<{ cx: number; id: string; flip: number }> = ({ cx, id, flip }) => {
    const lid = `M${cx - 150} 900 Q${cx} ${900 - h * 1.35} ${cx + 150} 900 Q${cx} ${900 + h * 0.9} ${cx - 150} 900 Z`;
    return (
      <g>
        <clipPath id={id}><path d={lid} /></clipPath>
        <path d={`M${cx - 165} ${860 - h * 0.35} Q${cx} ${790 - h * 1.5} ${cx + 165} ${860 - h * 0.35}`} stroke="#8a6048" strokeWidth={6} fill="none" opacity={0.55} />
        <ellipse cx={cx + px} cy={900 + py} rx={62} ry={50} fill="#5a3c2c" opacity={0.3 * (1 - open)} />
        <g clipPath={`url(#${id})`}>
          <rect x={cx - 170} y={700} width={340} height={400} fill="#e9e4dc" />
          <circle cx={cx + px * 0.6} cy={900 + py} r={80} fill="url(#eo-iris)" />
          <circle cx={cx + px * 0.6} cy={900 + py} r={30 - 3 * open} fill="#050403" />
          <circle cx={cx + px * 0.6 - 18 * flip} cy={878 + py} r={14} fill="#fff" opacity={0.85} />
          <path d={`M${cx - 150} 900 Q${cx} ${900 - h * 1.35} ${cx + 150} 900`} stroke="#00000040" strokeWidth={18} fill="none" />
        </g>
        <path d={lid} fill="none" stroke="#2a1a12" strokeWidth={7} />
        {Array.from({ length: 11 }, (_, i) => {
          const t = (i + 1) / 12;
          const x = cx - 150 + t * 300;
          const y = 900 - h * 1.35 * 2 * t * (1 - t);
          return <line key={i} x1={x} y1={y} x2={x + (t - 0.5) * 36 * flip} y2={y - 24} stroke="#1a0f0a" strokeWidth={4} strokeLinecap="round" />;
        })}
      </g>
    );
  };
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
      <defs>
        <radialGradient id="eo-bg" cx="0.5" cy="0.45" r="0.8"><stop offset="0" stopColor="#d9b49a" /><stop offset="1" stopColor="#4a342a" /></radialGradient>
        <radialGradient id="eo-iris" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#7a5230" /><stop offset="0.7" stopColor="#4a3020" /><stop offset="1" stopColor="#2a1a10" /></radialGradient>
      </defs>
      <rect width={W} height={H} fill="url(#eo-bg)" />
      {/* brows, the bridge of the nose, the hair at the top of the forehead */}
      <path d="M90 720 Q250 640 430 700" stroke="#3a2418" strokeWidth={28} fill="none" strokeLinecap="round" opacity={0.85} />
      <path d="M650 700 Q830 640 990 720" stroke="#3a2418" strokeWidth={28} fill="none" strokeLinecap="round" opacity={0.85} />
      <path d="M520 800 Q500 960 470 1080 M560 800 Q580 960 610 1080" stroke="#a67a58" strokeWidth={10} fill="none" opacity={0.45} />
      <ellipse cx={540} cy={1110} rx={90} ry={34} fill="#8a6048" opacity={0.25} />
      <path d="M-20 420 Q540 300 1100 420 L1100 520 Q540 430 -20 520 Z" fill={k.hair} />
      <Eye cx={300} id="eo-clip-l" flip={1} />
      <Eye cx={780} id="eo-clip-r" flip={1} />
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
      <radialGradient id="pc-vig" cx="0.5" cy="0.45" r="0.75"><stop offset="0.35" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#000" stopOpacity={0.8} /></radialGradient>
    </defs>
    <rect width={W} height={H} fill="#7d6a32" />
    {Array.from({ length: 48 }, (_, i) => <line key={`h${i}`} x1={0} y1={i * 42} x2={W} y2={i * 42} stroke="#6a5a2a" strokeWidth={2} opacity={0.55} />)}
    {Array.from({ length: 28 }, (_, i) => <line key={`v${i}`} x1={i * 42} y1={0} x2={i * 42} y2={H} stroke="#756330" strokeWidth={2} opacity={0.45} />)}
    <g transform={`translate(540,820) scale(${1 + 0.08 * t})`}>
      <SnakeTile size={780} watching={watching} />
    </g>
    <rect width={W} height={H} fill="url(#pc-vig)" />
  </svg>
);

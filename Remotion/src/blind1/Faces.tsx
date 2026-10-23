import React from "react";
import { PASSENGERS } from "../bts/cast";
import { SnakeTile } from "../bts/SnakeTile";

const W = 1080;
const H = 1920;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** the waking, in the same face-on framing as the other face shots: the eyes are closed lids, then both open (`open` 0..1) */
export const FaceWake: React.FC<{ g: number; open: number }> = ({ g, open }) => {
  const k = PASSENGERS.bvYou;
  const breathe = Math.sin(g * 0.06) * 3;
  const tilt = -6 * (1 - open);
  const look = Math.sin(g * 0.05) * 5 * open;
  const ry = 25 * open;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
      <defs>
        <linearGradient id="fw-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7d7a66" /><stop offset="1" stopColor="#25281f" /></linearGradient>
        <linearGradient id="fw-shade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0b0e0a" stopOpacity={0} /><stop offset="0.35" stopColor="#0b0e0a" stopOpacity={0.8} /><stop offset="1" stopColor="#0b0e0a" stopOpacity={0.95} /></linearGradient>
        {[-44, 44].map((ex) => <clipPath key={ex} id={`fw-eye${ex}`}><ellipse cx={ex} cy={-14} rx={25} ry={Math.max(0.01, ry)} /></clipPath>)}
      </defs>
      <rect width={W} height={H} fill="url(#fw-bg)" />
      <g transform={`translate(540,${800 + breathe}) scale(3.0) rotate(${tilt})`}>
        <path d="M-210 330 Q-190 200 -90 176 L90 176 Q190 200 210 330 Z" fill="#7d8a8f" />
        <rect x={-34} y={96} width={68} height={92} rx={26} fill={k.skin} />
        <ellipse cx={-96} cy={4} rx={13} ry={22} fill={k.skin} />
        <ellipse cx={96} cy={4} rx={13} ry={22} fill={k.skin} />
        <ellipse cx={0} cy={0} rx={92} ry={108} fill={k.skin} />
        <path d="M-94 -14 Q-100 -118 0 -120 Q100 -118 94 -14 Q74 -86 0 -88 Q-74 -86 -94 -14 Z" fill={k.hair} />
        <path d="M-62 -40 Q-44 -52 -26 -42 M26 -42 Q44 -52 62 -40" stroke="#1b1b1b" strokeWidth={6} fill="none" strokeLinecap="round" transform={`translate(0,${-14 - 4 * open})`} />
        {[-44, 44].map((ex) => (
          <g key={ex}>
            {open < 0.04 ? (
              <path d={`M${ex - 25} -14 Q${ex} -6 ${ex + 25} -14`} stroke="#2a1a12" strokeWidth={5} fill="none" strokeLinecap="round" />
            ) : (
              <g>
                <g clipPath={`url(#fw-eye${ex})`}>
                  <ellipse cx={ex} cy={-14} rx={25} ry={25} fill="#ffffff" />
                  <circle cx={ex + look} cy={-13} r={10} fill="#1b1b1b" />
                  <circle cx={ex + look + 3} cy={-17} r={3.2} fill="#fff" />
                </g>
                <ellipse cx={ex} cy={-14} rx={25} ry={ry} fill="none" stroke="#8a8a8a" strokeWidth={2} />
                <path d={`M${ex - 25} -14 Q${ex} ${-14 - ry * 1.5} ${ex + 25} -14`} stroke="#2a1a12" strokeWidth={4} fill="none" strokeLinecap="round" />
              </g>
            )}
          </g>
        ))}
        <path d="M0 -4 Q-8 24 -6 34 Q0 38 8 34" stroke="#b98a68" strokeWidth={4} fill="none" strokeLinecap="round" />
        <path d="M-24 66 Q0 62 24 66" stroke="#8a3a30" strokeWidth={6} fill="none" strokeLinecap="round" />
      </g>
      <rect y={1300} width={W} height={620} fill="url(#fw-shade)" />
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
      <SnakeTile size={780} watching={watching} pose="coil" />
    </g>
    <rect width={W} height={H} fill="url(#pc-vig)" />
  </svg>
);

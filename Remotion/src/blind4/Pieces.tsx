import React from "react";
import { PASSENGERS } from "../bts/cast";
import { MaskHead, Flesh } from "../blind1/SnakePreview";
import { SnakeTile } from "../bts/SnakeTile";

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

type R = { g: number; from: number; to: number };

/** a dark road at night: two headlights grow out of the dark and a car stops; no person is drawn */
export const RoadCard: React.FC<R> = ({ g, from, to }) => {
  const p = smooth(ramp(g, from + 10, from + 120));
  const stop = ramp(g, from + 120, to);
  const lx = lerp(14, 150, p);
  const ly = lerp(860, 1180, p);
  const lr = lerp(5, 60, p);
  const glow = lerp(40, 380, p);
  const zoom = 1 + 0.04 * ramp(g, from, to);
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
      <defs>
        <linearGradient id="rd4-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#121a22" /><stop offset="0.5" stopColor="#2a3a40" /><stop offset="1" stopColor="#0a0e0c" /></linearGradient>
        <radialGradient id="rd4-glow"><stop offset="0" stopColor="#fff4cc" stopOpacity={0.85} /><stop offset="1" stopColor="#fff4cc" stopOpacity={0} /></radialGradient>
      </defs>
      <rect width={W} height={H} fill="url(#rd4-sky)" />
      <g transform={`translate(540,900) scale(${zoom}) translate(-540,-900)`}>
        {/* tree line on both sides */}
        {Array.from({ length: 16 }, (_, i) => {
          const left = i % 2 === 0;
          const x = left ? 20 + rnd(i) * 260 : 800 + rnd(i) * 260;
          const h = 360 + rnd(i + 3) * 380;
          return <path key={i} d={`M${x} 1000 L${x + (left ? 30 : -30)} ${1000 - h} L${x + (left ? 90 : -90)} 1000 Z`} fill="#070b09" opacity={0.9} />;
        })}
        <path d="M500 860 L580 860 L1180 1700 L-100 1700 Z" fill="#3b4144" />
        <path d="M530 860 L550 860 L610 1700 L470 1700 Z" fill="#8a8a76" opacity={0.35} />
        {/* the headlights' light on the road */}
        <path d={`M${540 - lx} ${ly} L${540 + lx} ${ly} L${540 + lx * 3.2} 1700 L${540 - lx * 3.2} 1700 Z`} fill="#fff1c0" opacity={0.18 * p} />
        {[-1, 1].map((s) => <circle key={s} cx={540 + s * lx} cy={ly} r={glow} fill="url(#rd4-glow)" opacity={0.5 - 0.2 * stop} />)}
        {/* the car: a dark body behind the lights once it is near */}
        <g opacity={ramp(p, 0.15, 0.5)}>
          {[-1, 1].map((s) => <ellipse key={s} cx={540 + s * lx * 1.45} cy={ly + 66} rx={lx * 0.42} ry={lx * 0.3} fill="#07090a" />)}
          <path d={`M${540 - lx * 1.9} ${ly + 60} L${540 - lx * 1.5} ${ly - 150} Q540 ${ly - 230} ${540 + lx * 1.5} ${ly - 150} L${540 + lx * 1.9} ${ly + 60} Z`} fill="#4a5860" stroke="#a9b6bb" strokeWidth={4} />
          <path d={`M${540 - lx * 1.15} ${ly - 20} L${540 - lx * 0.95} ${ly - 130} Q540 ${ly - 185} ${540 + lx * 0.95} ${ly - 130} L${540 + lx * 1.15} ${ly - 20} Z`} fill="#8fa3ad" opacity={0.85} />
          <rect x={540 - lx * 1.9} y={ly + 40} width={lx * 3.8} height={34} fill="#1a2024" />
          <rect x={540 - lx * 0.45} y={ly + 4} width={lx * 0.9} height={26} fill="#222b30" stroke="#a9b6bb" strokeWidth={2} />
        </g>
        {[-1, 1].map((s) => <circle key={s} cx={540 + s * lx} cy={ly} r={lr} fill="#fffbe6" />)}
      </g>
    </svg>
  );
};

/** the plain room: bed, window, a nail on the wall where a bell would hang, and a mirror hidden under a cloth */
export const Room: React.FC<{ g: number; sky: string; cloth: number; ring: number; night?: number; reflect?: number }> = ({ g, sky, cloth, ring, night = 0, reflect = 0 }) => {
  const pull = 1 - cloth;
  return (
    <g>
      <rect x={-500} y={-1300} width={2200} height={2600} fill="#4b4c43" />
      <rect x={-500} y={1300} width={2200} height={700} fill="#2d281f" />
      {Array.from({ length: 12 }, (_, i) => <line key={i} x1={-400 + i * 150} y1={1300} x2={-420 + i * 160} y2={1900} stroke="#1c1812" strokeWidth={3} opacity={0.6} />)}
      {/* bed */}
      <rect x={-340} y={1180} width={640} height={120} fill="#6c6a58" />
      <rect x={-340} y={1130} width={140} height={170} fill="#3a2d1f" />
      <rect x={-200} y={1150} width={500} height={60} fill="#7d7a66" />
      {/* window */}
      <rect x={780} y={820} width={190} height={290} fill={sky} stroke="#241b11" strokeWidth={10} />
      <path d="M875 820 V1110 M780 965 H970" stroke="#241b11" strokeWidth={6} />
      {/* the nail where no bell hangs, and the rings of the sound */}
      <circle cx={160} cy={760} r={5} fill="#17120c" />
      {ring >= 0 && [0, 1, 2].map((k) => {
        const t = clamp01((ring - k * 18) / 90);
        return t > 0 && t < 1 ? <circle key={k} cx={160} cy={760} r={20 + t * 220} fill="none" stroke="#e8e0c4" strokeWidth={4} opacity={0.35 * (1 - t)} /> : null;
      })}
      {/* mirror under its cloth */}
      <g>
        <rect x={290} y={760} width={170} height={400} rx={14} fill="#1c1912" />
        <rect x={298} y={768} width={154} height={384} rx={8} fill="#9aa39a" />
        <rect x={298} y={768} width={154} height={384} rx={8} fill="#0b0f10" opacity={0.35} />
        <g opacity={reflect} transform="translate(375,0)">
          <ellipse cx={0} cy={880} rx={34} ry={42} fill="#cbb8a0" />
          <path d="M-34 868 Q0 790 34 868 Q0 846 -34 868 Z" fill="#251a12" />
          <path d="M-70 1152 Q-64 950 -30 930 L30 930 Q64 950 70 1152 Z" fill="#cbb8a0" />
          <g transform="translate(-18,1018)"><SnakeTile size={82} /></g>
          <g transform="translate(26,1085)"><SnakeTile size={64} /></g>
        </g>
        <rect x={282 + 0} y={768 + 360 * pull} width={186} height={400 - 360 * pull} fill="#5d6552" opacity={1} />
        <path d={`M282 ${768 + 360 * pull} H468`} stroke="#3a4130" strokeWidth={6} />
        {Array.from({ length: 5 }, (_, i) => <line key={i} x1={300 + i * 36} y1={768 + 360 * pull} x2={296 + i * 36} y2={1168} stroke="#4a5240" strokeWidth={3} opacity={0.6} />)}
      </g>
      <rect x={-500} y={-1300} width={2200} height={2600} fill="#050a18" opacity={0.6 * night} />
    </g>
  );
};

/** leaves sliding over warm light, then dim pale faces looking down out of the dark; no body is shown */
export const MemoryFaces: React.FC<R> = ({ g, from, to }) => {
  const t = g - from;
  const split = from + (to - from) * 0.4;
  const dark = smooth(ramp(g, split - 12, split + 24));
  const faces = [
    { x: 250, y: 330, s: 1.7, tilt: -8, d: 0 },
    { x: 700, y: 260, s: 2.0, tilt: 6, d: 14 },
    { x: 520, y: 640, s: 2.6, tilt: -3, d: 26 },
    { x: 160, y: 780, s: 1.5, tilt: 10, d: 38 },
    { x: 880, y: 760, s: 1.6, tilt: -9, d: 48 },
  ];
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
      <defs>
        <linearGradient id="mf-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#d9cc92" /><stop offset="1" stopColor="#6f7c48" /></linearGradient>
        <radialGradient id="mf-dark" cx="0.5" cy="0.35" r="0.9"><stop offset="0" stopColor="#262b22" /><stop offset="1" stopColor="#040504" /></radialGradient>
        <filter id="mf-blur"><feGaussianBlur stdDeviation="6" /></filter>
        <filter id="mf-soft"><feGaussianBlur stdDeviation="2.4" /></filter>
      </defs>
      <rect width={W} height={H} fill="url(#mf-bg)" />
      <g filter="url(#mf-blur)" transform={`rotate(${Math.sin(t * 0.08) * 3} 540 900)`}>
        {Array.from({ length: 30 }, (_, i) => {
          const sp = 0.6 + rnd(i) * 1.6;
          const x = ((rnd(i + 2) * (W + 400) - t * sp * 3) % (W + 400) + (W + 400)) % (W + 400) - 200;
          const y = rnd(i + 9) * H + Math.sin(t * 0.05 + i) * 30;
          return <ellipse key={i} cx={x} cy={y} rx={50 + rnd(i + 5) * 90} ry={18 + rnd(i + 1) * 30} fill={i % 3 ? "#1c2a16" : "#35471f"} opacity={0.75} transform={`rotate(${rnd(i + 7) * 180} ${x} ${y})`} />;
        })}
      </g>
      <rect width={W} height={H} fill="url(#mf-dark)" opacity={dark} />
      {faces.map((f, i) => {
        const o = ramp(g, split + f.d, split + f.d + 30) * 0.8 * clamp01((to - g) / 14);
        return (
          <g key={i} opacity={o} filter="url(#mf-soft)" transform={`translate(${f.x},${f.y + Math.sin(t * 0.04 + i) * 6}) scale(${f.s})`}>
            <MaskHead kind={3} x={0} y={0} tilt={f.tilt + Math.sin(t * 0.03 + i) * 2} s={1} />
          </g>
        );
      })}
      <rect width={W} height={H} fill="#000" opacity={0.35 * (1 - ramp(g, from, from + 8)) + 0.3 * ramp(g, to - 10, to)} />
    </svg>
  );
};

/** stage 1: the pattern on the shirt, with your own face inside it; stage 2: your eye, the pupil narrowing to a slit */
export const MirrorCard: React.FC<R & { stage: 1 | 2 }> = ({ g, from, to, stage }) => {
  const k = PASSENGERS.bvYou;
  const zoom = 1 + 0.07 * ramp(g, from, to);
  if (stage === 1) {
    const reveal = smooth(ramp(g, from, from + 45));
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
        <rect width={W} height={H} fill="#b99c80" />
        <g transform={`translate(540,820) scale(${zoom}) translate(-540,-820)`}>
          {Array.from({ length: 9 }, (_, r) => Array.from({ length: 6 }, (_, q) => (
            <g key={`${r}-${q}`} transform={`translate(${q * 200 + (r % 2) * 100 - 40},${r * 230 - 60})`} opacity={0.7}><SnakeTile size={130} /></g>
          )))}
          <rect width={W} height={H} fill="#b99c80" opacity={0.45} />
          <g transform="translate(540,880)"><SnakeTile size={780} /></g>
          <g opacity={reveal} transform="translate(597,539) scale(0.62)">
            <ellipse cx={0} cy={0} rx={115} ry={135} fill={k.skin} />
            <path d="M-118 -10 Q-126 -150 0 -152 Q126 -150 118 -10 Q92 -108 0 -112 Q-92 -108 -118 -10 Z" fill={k.hair} />
            {[-46, 46].map((ex) => (
              <g key={ex}>
                <ellipse cx={ex} cy={-8} rx={27} ry={21} fill="#fff" />
                <circle cx={ex} cy={-6} r={10} fill="#10140c" />
              </g>
            ))}
            <path d="M-38 70 Q0 94 38 70" stroke="#8a3a30" strokeWidth={6} fill="none" strokeLinecap="round" />
          </g>
        </g>
      </svg>
    );
  }
  const p = smooth(ramp(g, from + 20, to - 10));
  const prx = lerp(52, 6, p);
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
      <defs>
        <radialGradient id="eye4-bg" cx="0.5" cy="0.45" r="0.8"><stop offset="0" stopColor="#8d7a60" /><stop offset="1" stopColor="#1a130c" /></radialGradient>
        <clipPath id="eye4-clip"><path d="M-380 0 Q0 -280 380 0 Q0 250 -380 0 Z" /></clipPath>
      </defs>
      <rect width={W} height={H} fill="url(#eye4-bg)" />
      <g transform={`translate(540,820) scale(${zoom * 1.25})`}>
        <path d="M-440 -10 Q0 -420 440 -10 Q0 -330 -440 -10 Z" fill={k.skin} opacity={0.0} />
        <path d="M-380 0 Q0 -280 380 0 Q0 250 -380 0 Z" fill="#e4dcc8" />
        <g clipPath="url(#eye4-clip)">
          <circle cx={0} cy={0} r={150} fill="#5a3b20" />
          <circle cx={0} cy={0} r={150} fill="none" stroke="#2a1a0c" strokeWidth={10} />
          {Array.from({ length: 28 }, (_, i) => <line key={i} x1={Math.cos(i * 0.224) * 40} y1={Math.sin(i * 0.224) * 40} x2={Math.cos(i * 0.224) * 140} y2={Math.sin(i * 0.224) * 140} stroke="#8a5e34" strokeWidth={3} opacity={0.6} />)}
          <ellipse cx={0} cy={0} rx={prx} ry={115} fill="#050403" />
          <circle cx={-48} cy={-62} r={16} fill="#fff" opacity={0.8} />
        </g>
        <path d="M-380 0 Q0 -280 380 0" stroke="#1a110a" strokeWidth={22} fill="none" strokeLinecap="round" />
        <path d="M-380 0 Q0 250 380 0" stroke="#3a2a1c" strokeWidth={8} fill="none" />
      </g>
    </svg>
  );
};

/** night in the room, the window open: the shirt left on the floor collapses and a trail of dots goes out of the window; nothing else */
export const ChangeCard: React.FC<R> = ({ g, from, to }) => {
  const collapse = smooth(ramp(g, from + 40, from + 120));
  const trail = ramp(g, from + 110, to - 10);
  const N = 22;
  const shirtY = 1400;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
      <defs>
        <linearGradient id="ch4-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0a0f1e" /><stop offset="1" stopColor="#10130d" /></linearGradient>
        <linearGradient id="ch4-shaft" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#9fb0c8" stopOpacity={0.4} /><stop offset="1" stopColor="#9fb0c8" stopOpacity={0.02} /></linearGradient>
      </defs>
      <rect width={W} height={H} fill="url(#ch4-bg)" />
      <rect x={620} y={380} width={300} height={560} fill="#26334d" stroke="#1a140c" strokeWidth={14} />
      <path d="M770 380 V940 M620 660 H920" stroke="#1a140c" strokeWidth={8} />
      <path d="M620 940 L920 940 L760 1560 L-60 1560 Z" fill="url(#ch4-shaft)" />
      <rect y={1480} width={W} height={440} fill="#0d0b08" />
      {/* the shirt: held upright in the beginning, then flat on the floor */}
      <g transform={`translate(330,${shirtY + 80 * collapse}) scale(${lerp(1, 1.5, collapse)},${lerp(1, 0.2, collapse)})`}>
        <path d="M-80 -330 Q0 -280 80 -330 L220 -270 L280 -130 L190 -90 L160 -150 L160 80 L-160 80 L-160 -150 L-190 -90 L-280 -130 L-220 -270 Z" fill="#7d8a8f" stroke="#454d50" strokeWidth={5} />
      </g>
      {/* the dots */}
      {Array.from({ length: N }, (_, i) => {
        const f = i / (N - 1);
        const o = clamp01(trail * N * 1.2 - i) ;
        const x = lerp(380, 740, f) + Math.sin(f * 7 + g * 0.05) * 14;
        const y = lerp(1440, 760, Math.pow(f, 0.8)) + Math.cos(f * 5) * 10;
        return <circle key={i} cx={x} cy={y} r={lerp(14, 6, f)} fill="#d4dcc6" opacity={0.85 * o} />;
      })}
      <rect width={W} height={H} fill="#000" opacity={0.25 * (1 - ramp(g, from, from + 8))} />
    </svg>
  );
};

/** two long dim shapes with pale masks among the trunks: "you" and the head; the speaker's mask tilts */
export const EdgeShapes: React.FC<{ g: number; headX: number; youX: number; speakFrom: number; youFrom: number }> = ({ g, headX, youX, speakFrom, youFrom }) => {
  const GY = 1330;
  const shape = (x: number, dir: number, tilt: number, kind: 2 | 3, key: string, rise: number) => (
    <g key={key} opacity={0.9}>
      <g opacity={0.55}>
        <Flesh d={`M${x + dir * 120} ${GY + 120} C${x + dir * 40} ${GY - 60} ${x - dir * 60} ${GY - 260} ${x} ${GY - 560 * rise}`} w={64} />
        <Flesh d={`M${x + dir * 260} ${GY + 120} C${x + dir * 200} ${GY - 20} ${x + dir * 140} ${GY - 20} ${x + dir * 60} ${GY + 60}`} w={44} />
      </g>
      <MaskHead kind={kind} x={x} y={GY - 560 * rise - 20} tilt={tilt} s={1.15} />
    </g>
  );
  const hSpeak = ramp(g, speakFrom, speakFrom + 20) * Math.sin(g * 0.15) * 3;
  const yTilt = 6 * ramp(g, youFrom, youFrom + 30) + Math.sin(g * 0.02) * 1.5;
  return (
    <g>
      {shape(headX, -1, 4 + hSpeak - 6 * (1 - ramp(g, speakFrom - 40, speakFrom)), 2, "h", 1 - 0.1 * (1 - ramp(g, speakFrom - 40, speakFrom)))}
      {shape(youX, 1, -yTilt, 3, "y", 1)}
    </g>
  );
};

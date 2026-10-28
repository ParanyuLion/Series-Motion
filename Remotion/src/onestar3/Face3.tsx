import React from "react";
import { PAL } from "../onestar1/Look";
import { lerp } from "./util";

// A shaded front close-up for the finale: soft key light from one side, cool fill from the other, a pale rim on the lit edge,
// eye sockets, a nose shadow, cheek and brow modelling. The head is centred at (0,0): ellipse 250 x 310. Use inside a translated <g>.

type Kind = "you" | "aunt";
const SKIN: Record<Kind, { lit: string; mid: string; dark: string; lip: string }> = {
  you: { lit: "#e8c3a0", mid: "#b98563", dark: "#4a3646", lip: "#8a4f45" },
  aunt: { lit: "#d9dde2", mid: "#9aa3b2", dark: "#3b4560", lip: "#7d6a78" },
};

export const Face3: React.FC<{
  id: string;
  kind: Kind;
  g: number;
  /** +1: the key light comes from the right of the picture, -1 from the left */
  side?: 1 | -1;
  look?: [number, number];
  fear?: number;
  /** 0 open, 1 closed */
  closed?: number;
  key1?: string;
  fill?: string;
  /** a second small light on the face from below (a phone), 0..1 */
  below?: number;
}> = ({ id, kind, g, side = 1, look = [0, 0], fear = 0.3, closed = 0, key1 = "#ffd9a0", fill = "#5f8dff", below = 0 }) => {
  const s = SKIN[kind];
  const blinkPhase = g % 150;
  const blink = blinkPhase > 144 ? 0.1 : 1;
  const eyeOpen = (1 - closed) * blink;
  const ey = 34 * (1 + 0.3 * fear) * eyeOpen + 3;
  const brow = 22 * fear;
  const L = side;
  const aunt = kind === "aunt";
  const gid = (n: string) => `${id}-${n}`;
  const eyeCx = [-96, 96];
  return (
    <g>
      <defs>
        <radialGradient id={gid("skin")} cx={0.5 + 0.22 * L} cy={0.42} r={0.78}>
          <stop offset="0" stopColor={s.lit} />
          <stop offset="0.55" stopColor={s.mid} />
          <stop offset="1" stopColor={s.dark} />
        </radialGradient>
        <linearGradient id={gid("shade")} x1={L > 0 ? 1 : 0} y1="0" x2={L > 0 ? 0 : 1} y2="0">
          <stop offset="0" stopColor="#0b1224" stopOpacity="0" />
          <stop offset="0.55" stopColor="#0b1224" stopOpacity="0.15" />
          <stop offset="1" stopColor="#060a18" stopOpacity="0.72" />
        </linearGradient>
        <radialGradient id={gid("key")} cx={0.5 + 0.3 * L} cy={0.35} r={0.6}>
          <stop offset="0" stopColor={key1} stopOpacity="0.45" />
          <stop offset="1" stopColor={key1} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={gid("fillg")} x1={L > 0 ? 0 : 1} y1="0" x2={L > 0 ? 1 : 0} y2="0">
          <stop offset="0" stopColor={fill} stopOpacity="0.3" />
          <stop offset="0.5" stopColor={fill} stopOpacity="0" />
        </linearGradient>
        <clipPath id={gid("head")}><ellipse cx={0} cy={0} rx={250} ry={310} /></clipPath>
        <filter id={gid("b")} x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="14" /></filter>
        <filter id={gid("b2")} x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="6" /></filter>
        <linearGradient id={gid("body")} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={aunt ? "#2a2f45" : "#46587a"} /><stop offset="1" stopColor="#0a0e1c" /></linearGradient>
      </defs>

      {/* shoulders, collar, neck */}
      <path d="M-420 760 Q-400 330 -150 270 L150 270 Q400 330 420 760 Z" fill={`url(#${gid("body")})`} />
      <path d="M-420 760 Q-400 330 -150 270" fill="none" stroke={PAL.rim} strokeWidth={4} opacity={L < 0 ? 0.6 : 0.15} />
      <path d="M420 760 Q400 330 150 270" fill="none" stroke={PAL.rim} strokeWidth={4} opacity={L > 0 ? 0.6 : 0.15} />
      {aunt ? (
        <g>
          <path d="M-170 270 Q0 400 170 270 L230 430 Q0 560 -230 430 Z" fill="#161a2c" />
          {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${-190 + i * 46} ${300 + (i % 3) * 14} q18 90 ${(i % 2 ? 1 : -1) * 22} 150`} stroke="#222844" strokeWidth={5} fill="none" opacity={0.7} />)}
        </g>
      ) : (
        <g>
          <path d="M-150 270 L0 440 L150 270 L210 300 L0 520 L-210 300 Z" fill="#2c3a58" />
          <path d="M-60 270 L0 360 L60 270 Z" fill="#c7a083" />
        </g>
      )}
      <path d="M-72 170 L-80 310 Q0 360 80 310 L72 170 Z" fill={s.mid} />
      <path d="M-72 170 L-80 310 Q0 360 80 310 L72 170 Z" fill={`url(#${gid("shade")})`} opacity={0.6} />
      <ellipse cx={0} cy={250} rx={90} ry={60} fill="#0b1224" opacity={0.5} filter={`url(#${gid("b2")})`} />

      {/* hair behind the head */}
      {aunt ? (
        <g>
          <ellipse cx={0} cy={-228} rx={248} ry={150} fill="#6b7183" />
          <ellipse cx={0} cy={-330} rx={92} ry={78} fill="#7a8093" />
          {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M${-210 + i * 38} -210 q${(i % 3 - 1) * 24} -60 ${(i % 2 ? 24 : -18)} -140`} stroke="#9aa0b4" strokeWidth={4} fill="none" opacity={0.55} />)}
        </g>
      ) : (
        <ellipse cx={0} cy={-190} rx={262} ry={168} fill="#0e0b10" />
      )}

      {/* ears */}
      {[-1, 1].map((e) => (
        <g key={e}>
          <ellipse cx={e * 252} cy={20} rx={36} ry={66} fill={s.mid} />
          <ellipse cx={e * 252} cy={20} rx={36} ry={66} fill={`url(#${gid("shade")})`} opacity={e === -L ? 0.9 : 0.2} />
        </g>
      ))}

      {/* the head */}
      <ellipse cx={0} cy={0} rx={250} ry={310} fill={`url(#${gid("skin")})`} />
      <g clipPath={`url(#${gid("head")})`}>
        <rect x={-260} y={-320} width={520} height={640} fill={`url(#${gid("shade")})`} />
        <rect x={-260} y={-320} width={520} height={640} fill={`url(#${gid("fillg")})`} />
        <ellipse cx={0} cy={0} rx={250} ry={310} fill={`url(#${gid("key")})`} />
        {/* forehead, hairline */}
        {aunt ? (
          <g>
          <path d="M-262 30 Q-272 -300 0 -336 Q272 -300 262 30 Q252 -100 196 -160 Q100 -214 0 -196 Q-100 -214 -196 -160 Q-252 -100 -262 30 Z" fill="#7a8093" />
          <path d="M0 -330 Q-20 -250 -30 -196" stroke="#4a5068" strokeWidth={5} fill="none" opacity={0.6} />
          {Array.from({ length: 10 }, (_, i) => <path key={i} d={`M${-200 + i * 44} -190 Q${-210 + i * 44} -270 ${-150 + i * 40} -320`} stroke="#a5abbd" strokeWidth={3} fill="none" opacity={0.45} />)}
        </g>
        ) : (
          <g>
          <path d="M-262 30 Q-272 -300 0 -336 Q272 -300 262 30 Q252 -100 196 -160 Q100 -214 0 -196 Q-100 -214 -196 -160 Q-252 -100 -262 30 Z" fill="#0e0b10" />
          <path d="M-120 -250 Q0 -300 140 -240" stroke="#2c3350" strokeWidth={10} fill="none" opacity={0.6} />
          </g>
        )}
        {/* eye sockets and under-eye */}
        {eyeCx.map((cx, i) => (
          <g key={i}>
            <ellipse cx={cx} cy={-54} rx={74} ry={44} fill="#0b1224" opacity={aunt ? 0.5 : 0.28} filter={`url(#${gid("b2")})`} />
            <ellipse cx={cx} cy={-4} rx={62} ry={18} fill={aunt ? "#2a3150" : "#6a4a4a"} opacity={aunt ? 0.55 : 0.3} filter={`url(#${gid("b2")})`} />
          </g>
        ))}
        {/* nose */}
        <path d={`M${-12 * L} -40 Q${-30 * L} 90 ${-8 * L} 120`} stroke="#0b1224" strokeWidth={26} fill="none" opacity={0.28} filter={`url(#${gid("b2")})`} strokeLinecap="round" />
        <path d={`M${14 * L} -30 Q${6 * L} 90 ${28 * L} 120`} stroke={s.lit} strokeWidth={10} fill="none" opacity={0.4} filter={`url(#${gid("b2")})`} strokeLinecap="round" />
        <ellipse cx={-26} cy={128} rx={16} ry={10} fill="#1a1020" opacity={0.6} /><ellipse cx={26} cy={128} rx={16} ry={10} fill="#1a1020" opacity={0.6} />
        {/* cheeks */}
        <ellipse cx={-130} cy={90} rx={70} ry={50} fill={aunt ? "#7e87a0" : "#c9806a"} opacity={0.22} filter={`url(#${gid("b")})`} />
        <ellipse cx={130} cy={90} rx={70} ry={50} fill={aunt ? "#7e87a0" : "#c9806a"} opacity={0.22} filter={`url(#${gid("b")})`} />
        {/* jaw shadow and chin */}
        <ellipse cx={0} cy={330} rx={230} ry={90} fill="#060a18" opacity={0.55} filter={`url(#${gid("b")})`} />
        {aunt && (
          <g stroke="#2a3150" strokeWidth={3} fill="none" opacity={0.5}>
            <path d="M-150 -170 q150 -26 300 0" /><path d="M-130 -140 q130 -20 260 0" /><path d="M-100 -112 q100 -14 200 0" />
            <path d="M-78 150 q-30 80 -6 150" /><path d="M78 150 q30 80 6 150" />
            <path d="M-170 -20 q-26 20 -30 50" /><path d="M170 -20 q26 20 30 50" />
          </g>
        )}
        {below > 0 && <ellipse cx={0} cy={140} rx={300} ry={260} fill="#9cc0ff" opacity={0.34 * below} filter={`url(#${gid("b")})`} />}
      </g>

      {/* eyes */}
      {eyeCx.map((cx, i) => (
        <g key={i}>
          <ellipse cx={cx} cy={-30} rx={54} ry={ey} fill={aunt ? "#d9dce4" : "#e9e6e4"} />
          <ellipse cx={cx} cy={-30} rx={54} ry={ey} fill={`url(#${gid("shade")})`} opacity={0.35} />
          {eyeOpen > 0.3 && (
            <g>
              <circle cx={cx + look[0] * 20} cy={-30 + look[1] * 12} r={Math.min(25, ey)} fill={aunt ? "#4a5068" : "#2a1c14"} />
              <circle cx={cx + look[0] * 20} cy={-30 + look[1] * 12} r={Math.min(11, ey * 0.45)} fill="#05060a" />
              <circle cx={cx + look[0] * 20 + 8} cy={-30 + look[1] * 12 - 8} r={6} fill="#fff" opacity={0.85} />
            </g>
          )}
          <path d={`M${cx - 58} -30 Q${cx} ${-30 - ey * 1.3} ${cx + 58} -30`} fill="none" stroke="#0b0d18" strokeWidth={7} strokeLinecap="round" />
          <path d={`M${cx - 58} -30 Q${cx} ${-30 + ey * (eyeOpen < 0.3 ? 0.3 : 0.9)} ${cx + 58} -30`} fill="none" stroke="#0b0d18" strokeWidth={eyeOpen < 0.3 ? 8 : 3} strokeLinecap="round" opacity={0.7} />
          <path d={i === 0 ? `M${cx - 62} ${-96 - brow} Q${cx} ${-124 - brow} ${cx + 60} ${-92 - brow * 0.4}` : `M${cx - 60} ${-92 - brow * 0.4} Q${cx} ${-124 - brow} ${cx + 62} ${-96 - brow}`} fill="none" stroke={aunt ? "#7b8194" : "#17120e"} strokeWidth={aunt ? 12 : 16} strokeLinecap="round" />
        </g>
      ))}

      {/* mouth */}
      <path d={`M-70 190 Q0 ${190 + 14 - 22 * fear} 70 190`} fill="none" stroke={s.lip} strokeWidth={13} strokeLinecap="round" />
      <path d={`M-62 200 Q0 ${214 - 6 * fear} 62 200`} fill="none" stroke="#0b1224" strokeWidth={8} opacity={0.3} strokeLinecap="round" />

      {/* pale rim on the lit edge of the head */}
      <path d={L > 0 ? "M120 -285 Q250 -190 250 0 Q246 150 170 260" : "M-120 -285 Q-250 -190 -250 0 Q-246 150 -170 260"} fill="none" stroke={PAL.rim} strokeWidth={5} opacity={0.65} filter={`url(#${gid("b2")})`} />
    </g>
  );
};

export const faceLerp = lerp;

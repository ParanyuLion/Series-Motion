import React from "react";
import { mix } from "../island/Person";
import { PASSENGERS, PassengerId } from "./cast";

const ZOMBIE_SKIN = "#a9b996";

/**
 * Front-facing close-up of a person who has just turned: pale green-grey face, dark sockets, slack open mouth, a slow
 * sway and one blink. No blood. Used as a short cut-in (about 2 s). `t` runs 0..1 over the shot.
 */
export const ZombieFace: React.FC<{ id?: PassengerId; frame: number; t: number }> = ({ id = "woman1", frame, t }) => {
  const c = PASSENGERS[id];
  const bald = (c.accessories as string[]).includes("bald");
  const zoom = 1.02 + 0.12 * t;
  const sway = Math.sin(frame * 0.09) * 1.8;
  const jaw = 10 + Math.sin(frame * 0.12) * 3 + t * 8;
  const blink = Math.max(0, 1 - Math.abs(((frame % 50) - 20) / 3));
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ display: "block" }}>
      <defs>
        <linearGradient id="zf-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a4640" />
          <stop offset="1" stopColor="#0f1412" />
        </linearGradient>
        <radialGradient id="zf-glow" cx="0.5" cy="0.4" r="0.7">
          <stop offset="0" stopColor="#dfe6c8" stopOpacity={0.35} />
          <stop offset="1" stopColor="#dfe6c8" stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect width={1080} height={1920} fill="url(#zf-bg)" />
      <rect width={1080} height={1920} fill="url(#zf-glow)" />
      <g transform={`translate(540,800) scale(${zoom * 3.0}) rotate(${sway})`}>
        <path d="M-210 330 Q-190 200 -90 176 L90 176 Q190 200 210 330 Z" fill={mix(c.top, "#3a342b", 0.35)} />
        <rect x={-34} y={96} width={68} height={92} rx={26} fill={mix(ZOMBIE_SKIN, "#000000", 0.18)} />
        <ellipse cx={-96} cy={4} rx={13} ry={22} fill={mix(ZOMBIE_SKIN, "#000000", 0.1)} />
        <ellipse cx={96} cy={4} rx={13} ry={22} fill={mix(ZOMBIE_SKIN, "#000000", 0.1)} />
        {(c.accessories as string[]).includes("bun") && <circle cx={0} cy={-132} r={34} fill={c.hair} />}
        <ellipse cx={0} cy={0} rx={92} ry={108} fill={ZOMBIE_SKIN} />
        {bald ? <path d="M-94 -14 Q-96 -40 -84 -58 L-84 -8 Z M94 -14 Q96 -40 84 -58 L84 -8 Z" fill={c.hair} /> : <path d="M-94 -14 Q-100 -118 0 -120 Q100 -118 94 -14 Q74 -86 0 -88 Q-74 -86 -94 -14 Z" fill={c.hair} />}
        {(c.accessories as string[]).includes("cap") && c.accent && (
          <g>
            <path d="M-100 -30 Q-100 -150 0 -154 Q100 -150 100 -30 Q50 -60 0 -62 Q-50 -60 -100 -30 Z" fill={mix(c.accent, "#000000", 0.0)} />
            <path d="M-110 -34 Q0 -70 110 -34 L120 -18 Q0 -50 -120 -18 Z" fill={mix(c.accent, "#000000", 0.3)} />
            <rect x={-26} y={-120} width={52} height={22} rx={6} fill="#c9a24a" />
          </g>
        )}
        <path d="M-56 -40 q10 12 4 30 M40 -50 q-8 14 -2 30 M0 -72 q4 14 -2 24 M60 -4 q-10 10 -6 24" stroke="#4a6a4a" strokeWidth={4} fill="none" opacity={0.7} />
        {[-44, 44].map((ex, i) => (
          <g key={i} transform={`translate(${ex},-14)`}>
            <ellipse rx={24} ry={20 * (1 - blink * 0.9)} fill="#141815" />
            <circle cx={i ? -3 : 3} cy={2} r={7} fill="#dfe6c8" opacity={1 - blink} />
          </g>
        ))}
        <path d="M0 -4 Q-10 30 -8 38 Q0 44 8 38" stroke="#7d8c6e" strokeWidth={4} fill="none" strokeLinecap="round" />
        <ellipse cx={0} cy={66 + jaw / 2} rx={26} ry={jaw} fill="#241313" />
      </g>
    </svg>
  );
};

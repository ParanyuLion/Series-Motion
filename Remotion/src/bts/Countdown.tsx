import React from "react";
import { fontFamily } from "../island/fonts";
import { mix } from "../island/Person";

/** A 60-to-0 bite countdown: a ring that empties and a large `0:SS` number that turns from yellow to red below 10 s. */
export const Countdown: React.FC<{ seconds: number; label?: string; pulse?: number }> = ({ seconds, label, pulse = 0 }) => {
  const s = Math.max(0, Math.min(60, Math.round(seconds)));
  const frac = s / 60;
  const urgent = Math.max(0, 1 - s / 10);
  const color = mix("#ffd86b", "#ff4a3a", urgent);
  const R = 92;
  const C = 2 * Math.PI * R;
  const scale = 1 + pulse * 0.06;
  return (
    <svg width={260} height={label ? 330 : 260} viewBox={`0 0 260 ${label ? 330 : 260}`} style={{ overflow: "visible" }}>
      <g transform={`translate(130,130) scale(${scale})`}>
        <circle r={R + 14} fill="#0b0d10" opacity={0.7} />
        <circle r={R} fill="none" stroke="#3a3f44" strokeWidth={14} />
        <circle r={R} fill="none" stroke={color} strokeWidth={14} strokeLinecap="round" strokeDasharray={`${C * frac} ${C}`} transform="rotate(-90)" />
        <text y={20} textAnchor="middle" fontFamily={fontFamily} fontSize={72} fill={color}>{`0:${String(s).padStart(2, "0")}`}</text>
      </g>
      {label && <text x={130} y={300} textAnchor="middle" fontFamily={fontFamily} fontSize={40} fill="#ffffff" stroke="#000" strokeWidth={5} paintOrder="stroke">{label}</text>}
    </svg>
  );
};

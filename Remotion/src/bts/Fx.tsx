import React from "react";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** a white extinguisher cloud blown forward from (x, y); t runs 0..1 (it grows, then thins out) */
export const Cloud: React.FC<{ x: number; y: number; t: number; facing: 1 | -1 }> = ({ x, y, t, facing }) => {
  const grow = clamp01(t * 1.6);
  const fade = 1 - clamp01((t - 0.55) / 0.45);
  return (
    <g transform={`translate(${x},${y}) scale(${facing},1)`} opacity={0.9 * fade}>
      {Array.from({ length: 9 }, (_, i) => {
        const d = (i + 1) / 9;
        const r = 30 + 90 * d * grow;
        const cx = 40 + 420 * d * grow;
        const cy = Math.sin(i * 2.3 + t * 5) * 26 * d - 8 * d;
        return <circle key={i} cx={cx} cy={cy} r={r} fill={i % 2 ? "#f4f6f7" : "#e1e6e8"} opacity={0.82 - 0.4 * d} />;
      })}
    </g>
  );
};

/** a cartoon impact star at (x, y); t 0..1 */
export const Impact: React.FC<{ x: number; y: number; t: number }> = ({ x, y, t }) => {
  const a = clamp01(t * 3) * (1 - clamp01((t - 0.5) / 0.5));
  if (a <= 0) return null;
  const r = 30 + 46 * clamp01(t * 2);
  const pts = Array.from({ length: 16 }, (_, i) => {
    const ang = (i / 16) * Math.PI * 2;
    const rr = i % 2 ? r * 0.5 : r;
    return `${x + Math.cos(ang) * rr},${y + Math.sin(ang) * rr}`;
  }).join(" ");
  return <polygon points={pts} fill="#ffe27a" stroke="#fff8d0" strokeWidth={4} opacity={a} />;
};

/** the door at the end of a car: a dark frame with two glass panes; open 0 closed .. 1 apart */
export const SlidingDoor: React.FC<{ x: number; open: number }> = ({ x, open }) => {
  const o = clamp01(open);
  const w = 120;
  return (
    <g>
      <rect x={x - w - 14} y={700} width={w * 2 + 28} height={620} fill="#23262a" />
      <g transform={`translate(${-o * w * 0.9},0)`}>
        <rect x={x - w} y={716} width={w} height={604} fill="#cfd8de" opacity={0.6} stroke="#8c918f" strokeWidth={8} />
      </g>
      <g transform={`translate(${o * w * 0.9},0)`}>
        <rect x={x} y={716} width={w} height={604} fill="#cfd8de" opacity={0.6} stroke="#8c918f" strokeWidth={8} />
      </g>
      <rect x={x - 4} y={716} width={8} height={604} fill="#8c918f" opacity={1 - o} />
    </g>
  );
};

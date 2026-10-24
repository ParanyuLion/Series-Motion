import React from "react";
import { SnakeTile } from "../bts/SnakeTile";
import { GROUND_Y } from "../blind1/Village";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** where the seats are: two rows of three facing each other across the table, and the head at the far end */
export const SEAT = { xs: [175, 235, 295], lanes: [10, 65, 120], headY: -70 };
export const TABLE_FAR = GROUND_Y - 165;
export const TABLE_NEAR = GROUND_Y + 110;

/**
 * The long supper table seen end-on (a table running into the picture): a trapezoid top, wide at the near end.
 * Every bowl and cup is placed on an even grid, the same for every seat: nothing is ever spilled.
 * Drawn BEHIND the side rows so their arms reach over it; the head's chair is drawn before it.
 */
export const SupperTable: React.FC<{ cx: number; g: number; lantern?: number }> = ({ cx, g, lantern = 1 }) => {
  const yf = TABLE_FAR;
  const yn = TABLE_NEAR;
  const wf = 120;
  const wn = 165;
  const flick = 1 + 0.05 * Math.sin(g * 0.37) + 0.03 * Math.sin(g * 0.91);
  const half = (t: number) => lerp(wf, wn, t);
  const rows = 6;
  return (
    <g>
      <defs>
        <radialGradient id="sp-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffb85a" stopOpacity={0.55} />
          <stop offset="1" stopColor="#ffb85a" stopOpacity={0} />
        </radialGradient>
      </defs>
      {/* lantern on a post beside the far end */}
      <g>
        <rect x={cx + 250} y={yf - 250} width={10} height={300} fill="#3a2d1d" />
        <ellipse cx={cx + 255} cy={yf - 220} rx={300 * flick} ry={260 * flick} fill="url(#sp-glow)" opacity={lantern} />
        <rect x={cx + 233} y={yf - 285} width={44} height={56} rx={10} fill="#d9a24a" stroke="#4a3818" strokeWidth={4} />
        <rect x={cx + 243} y={yf - 275} width={24} height={36} rx={6} fill="#ffe9a8" opacity={0.9 * flick} />
      </g>
      {/* a plank bench under each row of seats, slanted with the table */}
      {[-1, 1].map((side) => {
        const y0 = GROUND_Y + SEAT.lanes[0] - 100;
        const y1 = GROUND_Y + SEAT.lanes[2] - 100;
        const a0 = cx + side * (SEAT.xs[0] - 62);
        const b0 = cx + side * (SEAT.xs[0] + 62);
        const a1 = cx + side * (SEAT.xs[2] - 62);
        const b1 = cx + side * (SEAT.xs[2] + 62);
        return (
          <g key={side}>
            <path d={`M${a0} ${y0} L${b0} ${y0} L${b1} ${y1} L${a1} ${y1} Z`} fill="#6a4d2e" stroke="#4d3822" strokeWidth={3} />
            <path d={`M${a1} ${y1} L${b1} ${y1} L${b1} ${y1 + 16} L${a1} ${y1 + 16} Z`} fill="#3f2d1b" />
            <rect x={Math.min(a1, b1) + 6} y={y1 + 16} width={12} height={88} fill="#3f2d1b" />
            <rect x={Math.max(a1, b1) - 18} y={y1 + 16} width={12} height={88} fill="#3f2d1b" />
          </g>
        );
      })}
      {/* legs at the near corners, then the top, then the edge */}
      <rect x={cx - wn + 10} y={yn} width={14} height={110} fill="#4a3420" />
      <rect x={cx + wn - 24} y={yn} width={14} height={110} fill="#4a3420" />
      <path d={`M${cx - wf} ${yf} L${cx + wf} ${yf} L${cx + wn} ${yn} L${cx - wn} ${yn} Z`} fill="#7a5a3a" stroke="#4d3822" strokeWidth={3} />
      <path d={`M${cx - wn} ${yn} L${cx + wn} ${yn} L${cx + wn} ${yn + 16} L${cx - wn} ${yn + 16} Z`} fill="#4d3822" />
      {/* a runner of cloth down the middle with the pattern at its near end */}
      <path d={`M${cx - 38} ${yf + 4} L${cx + 38} ${yf + 4} L${cx + 52} ${yn - 4} L${cx - 52} ${yn - 4} Z`} fill="#8a7430" opacity={0.85} />
      {Array.from({ length: rows }, (_, i) => {
        const t = (i + 0.5) / rows;
        const y = lerp(yf, yn, t);
        const k = lerp(0.8, 1.15, t);
        return (
          <g key={i}>
            {[-1, 1].map((side) => (
              <g key={side} transform={`translate(${cx + side * half(t) * 0.72},${y}) scale(${k})`}>
                <ellipse cx={0} cy={4} rx={32} ry={8} fill="#000" opacity={0.25} />
                <path d="M-26 -2 Q-26 -26 0 -26 Q26 -26 26 -2 Z" fill="#8e7f64" stroke="#5b503b" strokeWidth={2.5} />
                <ellipse cx={0} cy={-26} rx={23} ry={6} fill="#d8d2bd" />
                <path d="M-18 -26 Q0 -44 18 -26 Z" fill="#ebe7d5" />
              </g>
            ))}
            {i % 2 === 0 && (
              <g transform={`translate(${cx},${y}) scale(${k})`}>
                <path d="M-11 -34 L11 -34 L8 0 L-8 0 Z" fill="#b49340" stroke="#7a643a" strokeWidth={2} />
                <g transform="translate(0,-17)"><SnakeTile size={16} /></g>
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
};

/** the head's stool at the far end of the table; drawn before him */
export const HeadSeat: React.FC<{ cx: number }> = ({ cx }) => {
  const y = GROUND_Y - 150 - 96;
  return (
    <g>
      <path d={`M${cx - 70} ${y} L${cx + 70} ${y} L${cx + 76} ${y + 30} L${cx - 76} ${y + 30} Z`} fill="#6a4d2e" stroke="#4d3822" strokeWidth={3} />
      <rect x={cx - 62} y={y + 30} width={12} height={96} fill="#3f2d1b" />
      <rect x={cx + 50} y={y + 30} width={12} height={96} fill="#3f2d1b" />
    </g>
  );
};

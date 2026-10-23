import React from "react";

/**
 * The village's pattern, a flat print: a dark snake rearing in an S, its head a pale mask with two hollow black eyes and a wide smile that is only
 * a thin seam (no mouth). Drawn in a 100 x 120 box centred on (0,0); `size` scales it to that width. With `watching` the eyes get a pinpoint of
 * light, the head tilts and the seam smiles a little wider (used once, as a scare).
 */
export const SnakeTile: React.FC<{ size: number; ink?: string; watching?: boolean }> = ({ size, ink = "#2a2418", watching = false }) => (
  <g transform={`scale(${size / 100})`}>
    <path d="M-8 56 C-36 44 -32 18 -4 10 C24 2 26 -22 2 -30" fill="none" stroke={ink} strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M-8 56 C-36 44 -32 18 -4 10 C24 2 26 -22 2 -30" fill="none" stroke="#6a6040" strokeWidth={2.4} strokeLinecap="round" strokeDasharray="0.5 6" />
    <g transform={`translate(3,-46) rotate(${watching ? 8 : 0})`}>
      <ellipse cx={0} cy={0} rx={16} ry={20} fill="#d9cfbb" stroke={ink} strokeWidth={2.4} />
      <ellipse cx={-6} cy={-3} rx={3.8} ry={5.8} fill="#050403" />
      <ellipse cx={8} cy={-3} rx={3.8} ry={5.8} fill="#050403" />
      {watching && (
        <g fill="#f4f0e2">
          <circle cx={-5} cy={-5.5} r={1.2} />
          <circle cx={9} cy={-5.5} r={1.2} />
        </g>
      )}
      <path d={watching ? "M-15 6 Q1 20 17 5" : "M-14 7 Q1 17 16 6"} stroke={ink} strokeWidth={1.3} fill="none" strokeLinecap="round" />
      {watching && <path d="M-15 6 l-2.4 -2.2 M17 5 l2.4 -2.2" stroke={ink} strokeWidth={1.3} strokeLinecap="round" />}
    </g>
  </g>
);

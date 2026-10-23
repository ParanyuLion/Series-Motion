import React from "react";

/**
 * The village's pattern: a snake in a gentle S whose head is a calm, blank human face. Drawn in a 100 x 100 box centred on (0,0);
 * `size` scales it. With `watching` the face's eyes are open and look straight out (used once, as a scare).
 */
export const SnakeTile: React.FC<{ size: number; ink?: string; watching?: boolean }> = ({ size, ink = "#4a3a1c", watching = false }) => (
  <g transform={`scale(${size / 100})`}>
    <path d="M-6 44 C-34 30 -30 8 -2 4 C26 0 30 -18 4 -26" fill="none" stroke={ink} strokeWidth={13} strokeLinecap="round" />
    <path d="M-6 44 C-34 30 -30 8 -2 4 C26 0 30 -18 4 -26" fill="none" stroke="#7a643a" strokeWidth={3} strokeLinecap="round" strokeDasharray="1 9" />
    <circle cx={4} cy={-36} r={17} fill="#d9b38c" stroke={ink} strokeWidth={3} />
    {watching ? (
      <g>
        <ellipse cx={-2} cy={-38} rx={4.2} ry={4.6} fill="#fff" stroke={ink} strokeWidth={1.2} />
        <ellipse cx={10} cy={-38} rx={4.2} ry={4.6} fill="#fff" stroke={ink} strokeWidth={1.2} />
        <circle cx={-2} cy={-37.5} r={2.2} fill={ink} />
        <circle cx={10} cy={-37.5} r={2.2} fill={ink} />
      </g>
    ) : (
      <g fill="none" stroke={ink} strokeWidth={1.8} strokeLinecap="round">
        <path d="M-6 -38 q4 3 8 0" />
        <path d="M6 -38 q4 3 8 0" />
      </g>
    )}
    <path d="M-2 -29 q6 2.5 12 0" fill="none" stroke={ink} strokeWidth={1.8} strokeLinecap="round" />
  </g>
);

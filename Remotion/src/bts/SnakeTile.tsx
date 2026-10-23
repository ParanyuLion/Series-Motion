import React from "react";

/**
 * The village's pattern, the design the user chose (snake_design4, pose 4 with face 3): a dark snake rearing in an S with dot scales, an outline and a side
 * highlight; the head is a pale mask with a soft shaded skin, small ears, two hollow black eyes and a wide smile that is only a thin seam (no mouth).
 * Drawn about a 100 wide by 120 high box centred on (0,0); `size` is that width. With `watching` the eyes get a pinpoint of light, the head tilts and the
 * seam smiles a little wider (used once, as a scare).
 */
const BODY = "M-40 350 C-170 310 -150 190 -20 150 C110 110 110 10 -10 -40 C-70 -66 -60 -130 4 -200";

export const SnakeTile: React.FC<{ size: number; watching?: boolean }> = ({ size, watching = false }) => (
  <g transform={`scale(${size / 620}) translate(35,19)`}>
    <defs>
      <radialGradient id="st-skin" cx="0.5" cy="0.4" r="0.7">
        <stop offset="0" stopColor="#e4dac6" />
        <stop offset="1" stopColor="#9c8f7a" />
      </radialGradient>
    </defs>
    <path d={BODY} fill="none" stroke="#121009" strokeWidth={84} strokeLinecap="round" strokeLinejoin="round" />
    <path d={BODY} fill="none" stroke="#2f2c20" strokeWidth={72} strokeLinecap="round" strokeLinejoin="round" />
    <path d={BODY} fill="none" stroke="#5a5539" strokeWidth={12} strokeLinecap="round" strokeDasharray="0 20" />
    <path d={BODY} fill="none" stroke="#7b7456" strokeWidth={4} strokeLinecap="round" opacity={0.45} transform="translate(24,-4)" />
    {[0, 1, 2].map((i) => <path key={i} d={`M${-26 + i * 2} ${-214 + i * 14} q40 12 78 -2`} stroke="#8c7a5c" strokeWidth={4} fill="none" opacity={0.7} />)}
    <g transform={`translate(10,-290) rotate(${watching ? 8 : 0})`}>
      <ellipse cx={-84} cy={4} rx={9} ry={22} fill="#b8a48c" />
      <ellipse cx={84} cy={4} rx={9} ry={22} fill="#b8a48c" />
      <ellipse cx={0} cy={0} rx={82} ry={104} fill="url(#st-skin)" />
      {[-34, 36].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy={-24} rx={21} ry={31} fill="#050403" />
          <circle cx={x + 5} cy={-34} r={watching ? 5 : 3} fill="#e8e4d6" />
        </g>
      ))}
      <path d="M-2 -4 Q-8 20 -2 30" stroke="#b6a68c" strokeWidth={3} fill="none" opacity={0.6} />
      <path d={watching ? "M-84 34 Q4 122 90 32" : "M-80 36 Q4 112 86 34"} stroke="#3a2a1c" strokeWidth={watching ? 3.5 : 2.5} fill="none" opacity={0.9} strokeLinecap="round" />
      {watching && <path d="M-84 34 l-10 -10 M90 32 l10 -10" stroke="#3a2a1c" strokeWidth={3.5} strokeLinecap="round" />}
    </g>
  </g>
);

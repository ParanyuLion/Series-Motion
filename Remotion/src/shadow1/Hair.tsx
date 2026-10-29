import React from "react";
import { mix } from "./Figure";

// Clean hairstyles with a clear silhouette that stands off the round head: a quiff, a bob with a fringe, a spiky crop. One outline, flat colour with a very
// light gradient, one simple highlight shape, a soft shadow on the forehead. No strand lines. Head centre (0, hy), ellipse 80 x 88.

type P = { kind: "quiff" | "bob" | "spiky"; hy: number; color: string; ink: string; sw: number; flat: boolean };

const Grad: React.FC<{ id: string; c: string }> = ({ id, c }) => (
  <linearGradient id={id} x1="0.1" y1="0" x2="0.7" y2="1">
    <stop offset="0" stopColor={mix(c, "#ffffff", 0.14)} />
    <stop offset="1" stopColor={mix(c, "#000000", 0.14)} />
  </linearGradient>
);

/** drawn before the head ellipse: only the bob has hair behind the head */
export const HairBack: React.FC<P> = ({ kind, hy, color, ink, sw, flat }) => {
  if (kind !== "bob") return null;
  const id = `hb-${color.slice(1)}`;
  return (
    <g>
      <defs><Grad id={id} c={color} /></defs>
      <path d={`M-102 ${hy + 112} Q-122 ${hy - 30} -94 ${hy - 74} Q-60 ${hy - 122} 0 ${hy - 122} Q60 ${hy - 122} 94 ${hy - 74} Q122 ${hy - 30} 102 ${hy + 112} Q50 ${hy + 130} 0 ${hy + 118} Q-50 ${hy + 130} -102 ${hy + 112} Z`} fill={flat ? ink : `url(#${id})`} stroke={ink} strokeWidth={sw} />
    </g>
  );
};

/** drawn after the head ellipse and before the face */
export const HairFront: React.FC<P> = ({ kind, hy, color, ink, sw, flat }) => {
  const id = `hf-${color.slice(1)}`;
  const f = flat ? ink : `url(#${id})`;
  const hi = mix(color, "#ffffff", 0.32);
  const shadow = !flat && <ellipse cx={4} cy={kind === "bob" ? hy - 58 : hy - 40} rx={64} ry={11} fill="#2a140f" opacity={0.22} />;
  if (kind === "quiff") {
    return (
      <g strokeLinejoin="round">
        <defs><Grad id={id} c={color} /></defs>
        <path d={`M-88 ${hy - 2} Q-104 ${hy - 92} -34 ${hy - 120} Q-6 ${hy - 150} 40 ${hy - 132} Q104 ${hy - 120} 98 ${hy - 56} Q104 ${hy - 28} 90 ${hy - 4} Q86 ${hy - 28} 66 ${hy - 36} Q46 ${hy - 70} 4 ${hy - 76} Q-44 ${hy - 78} -66 ${hy - 52} Q-82 ${hy - 36} -88 ${hy - 2} Z`} fill={f} stroke={ink} strokeWidth={sw} />
        {!flat && <path d={`M-30 ${hy - 114} Q4 ${hy - 144} 52 ${hy - 124} Q8 ${hy - 122} -30 ${hy - 114} Z`} fill={hi} opacity={0.5} />}
      </g>
    );
  }
  if (kind === "bob") {
    return (
      <g strokeLinejoin="round">
        <defs><Grad id={id} c={color} /></defs>
        {shadow}
        {/* the fringe, with a small centre parting */}
        <path d={`M-90 ${hy - 10} Q-96 ${hy - 100} 0 ${hy - 108} Q96 ${hy - 100} 90 ${hy - 10} Q78 ${hy - 62} 40 ${hy - 66} Q14 ${hy - 66} 2 ${hy - 52} Q-10 ${hy - 66} -40 ${hy - 66} Q-78 ${hy - 62} -90 ${hy - 10} Z`} fill={f} stroke={ink} strokeWidth={sw} />
        {/* the side locks falling past the ears */}
        {[-1, 1].map((s) => <path key={s} d={`M${s * 90} ${hy - 12} Q${s * 108} ${hy + 40} ${s * 96} ${hy + 104} Q${s * 70} ${hy + 70} ${s * 72} ${hy - 6} Z`} fill={f} stroke={ink} strokeWidth={sw - 1} />)}
        {!flat && <path d={`M-54 ${hy - 92} Q-6 ${hy - 110} 46 ${hy - 94} Q0 ${hy - 94} -54 ${hy - 92} Z`} fill={hi} opacity={0.5} />}
      </g>
    );
  }
  // spiky
  return (
    <g strokeLinejoin="round">
      <defs><Grad id={id} c={color} /></defs>
      {shadow}
      <path d={`M-86 ${hy - 4} L-106 ${hy - 66} L-64 ${hy - 62} L-74 ${hy - 124} L-28 ${hy - 86} L-12 ${hy - 144} L24 ${hy - 90} L54 ${hy - 134} L62 ${hy - 82} L102 ${hy - 108} L86 ${hy - 58} L108 ${hy - 40} L90 ${hy - 6} Q78 ${hy - 40} 50 ${hy - 52} Q10 ${hy - 60} -30 ${hy - 48} Q-66 ${hy - 44} -86 ${hy - 4} Z`} fill={f} stroke={ink} strokeWidth={sw} />
      {!flat && <path d={`M-62 ${hy - 100} L-40 ${hy - 90} L-48 ${hy - 70} Z M-2 ${hy - 122} L12 ${hy - 96} L-6 ${hy - 90} Z`} fill={hi} opacity={0.45} />}
    </g>
  );
};

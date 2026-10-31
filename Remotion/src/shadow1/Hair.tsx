import React from "react";
import { mix } from "./Figure";

// Hair built the way a cartoonist does it: a few big clumps (pointed leaf shapes) stacked back to front, each with one clean outline, so the
// silhouette has flow and the clump seams are the only "texture". Head centre (0, hy), ellipse 80 x 88 (top at hy - 88, eyes at hy + 6, brows at hy - 20).

type P = { kind: "wave" | "long" | "hime" | "fringe" | "swoop" | "tousle" | "bangs" | "bowlcut"; hy: number; color: string; ink: string; sw: number; flat: boolean };

/** a pointed clump from base b to tip t: w is its width, bend sweeps the middle to one side */
const leaf = (b: [number, number], t: [number, number], w: number, bend: number) => {
  const mx = (b[0] + t[0]) / 2;
  const my = (b[1] + t[1]) / 2;
  const dx = t[0] - b[0];
  const dy = t[1] - b[1];
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const a = w / 2 + bend;
  const c = w / 2 - bend;
  return `M${b[0]} ${b[1]} Q${mx + nx * a} ${my + ny * a} ${t[0]} ${t[1]} Q${mx - nx * c} ${my - ny * c} ${b[0]} ${b[1]} Z`;
};

type L = { b: [number, number]; t: [number, number]; w: number; bend: number };

const Clumps: React.FC<{ list: L[]; color: string; ink: string; sw: number; flat: boolean; hi?: boolean; plain?: boolean }> = ({ list, color, ink, sw, flat, hi = true, plain = false }) => (
  <g strokeLinejoin="round" strokeLinecap="round">
    {list.map((c, i) => {
      const k = list.length > 1 ? i / (list.length - 1) : 1;
      const fill = flat ? ink : plain ? color : mix(mix(color, "#000000", 0.16), mix(color, "#ffffff", 0.1), k);
      return <path key={i} d={leaf(c.b, c.t, c.w, c.bend)} fill={fill} stroke={ink} strokeWidth={sw} />;
    })}
    {!flat && hi && (() => {
      const c = list[list.length - 1];
      const mx = (c.b[0] + c.t[0]) / 2;
      const my = (c.b[1] + c.t[1]) / 2;
      return <path d={`M${c.b[0] * 0.3 + mx * 0.7} ${c.b[1] * 0.3 + my * 0.7} Q${mx} ${my - 12} ${c.t[0] * 0.8 + mx * 0.2} ${c.t[1] * 0.8 + my * 0.2}`} fill="none" stroke={mix(color, "#ffffff", 0.4)} strokeWidth={7} opacity={0.55} />;
    })()}
  </g>
);

/** the skull cap: hair that follows the top of the head, under the clumps */
const Cap: React.FC<{ hy: number; color: string; ink: string; sw: number; flat: boolean; hair: number }> = ({ hy, color, ink, sw, flat, hair }) => (
  <path d={`M-82 ${hy - 20} Q-90 ${hy - 96 - hair} 0 ${hy - 100 - hair} Q90 ${hy - 96 - hair} 82 ${hy - 20} Q64 ${hy - 56} 0 ${hy - 60} Q-64 ${hy - 56} -82 ${hy - 20} Z`} fill={flat ? ink : mix(color, "#000000", 0.14)} stroke={ink} strokeWidth={sw} strokeLinejoin="round" />
);

/** drawn before the head ellipse */
export const HairBack: React.FC<P> = ({ kind, hy, color, ink, sw, flat }) => {
  if (kind === "swoop") {
    // the back of the hair to the jaw, ends flicked outward
    const f = flat ? ink : mix(color, "#000000", 0.18);
    return (
      <g strokeLinejoin="round">
        <path d={`M-96 ${hy + 86} Q-120 ${hy - 20} -88 ${hy - 70} Q-50 ${hy - 116} 0 ${hy - 116} Q50 ${hy - 116} 88 ${hy - 70} Q120 ${hy - 20} 98 ${hy + 90} Q112 ${hy + 104} 128 ${hy + 100} Q104 ${hy + 128} 70 ${hy + 112} Q40 ${hy + 100} 0 ${hy + 104} Q-40 ${hy + 100} -70 ${hy + 112} Q-104 ${hy + 128} -128 ${hy + 100} Q-110 ${hy + 104} -96 ${hy + 86} Z`} fill={f} stroke={ink} strokeWidth={sw} />
      </g>
    );
  }
  if (kind === "long" || kind === "hime" || kind === "fringe") {
    // long hair behind the head and shoulders: drawn before the body, so the body covers it and the head never floats
    const f = flat ? ink : mix(color, "#000000", 0.18);
    return (
      <path d={`M-90 ${hy - 20} Q-112 ${hy - 110} 0 ${hy - 114} Q112 ${hy - 110} 90 ${hy - 20} Q104 ${hy + 100} 90 ${hy + 232} Q40 ${hy + 248} 0 ${hy + 240} Q-40 ${hy + 248} -90 ${hy + 232} Q-104 ${hy + 100} -90 ${hy - 20} Z`} fill={f} stroke={ink} strokeWidth={sw} strokeLinejoin="round" />
    );
  }
  return null;
};

/** drawn after the head ellipse and before the face */
export const HairFront: React.FC<P> = ({ kind, hy, color, ink, sw, flat }) => {
  if (kind === "fringe") {
    // long straight hair with a centre part: two curtains sweep from the parting to the temples (the forehead shows between them), long thin strands hang in front of the shoulders
    const f = flat ? ink : color;
    const hi = mix(color, "#ffffff", 0.35);
    return (
      <g strokeLinejoin="round" strokeLinecap="round">
        {[-1, 1].map((k) => (
          <g key={k}>
            <path d={`M${k * 86} ${hy - 6} Q${k * 104} ${hy + 90} ${k * 96} ${hy + 218} Q${k * 88} ${hy + 228} ${k * 80} ${hy + 216} Q${k * 76} ${hy + 100} ${k * 66} ${hy + 6} Z`} fill={f} stroke={ink} strokeWidth={sw - 2} />
            <path d={`M${k * 66} ${hy + 30} Q${k * 78} ${hy + 110} ${k * 70} ${hy + 190} Q${k * 62} ${hy + 196} ${k * 58} ${hy + 186} Q${k * 62} ${hy + 100} ${k * 56} ${hy + 40} Z`} fill={f} stroke={ink} strokeWidth={sw - 3} />
            <path d={`M0 ${hy - 108} Q${k * 104} ${hy - 104} ${k * 88} ${hy + 10} Q${k * 78} ${hy - 4} ${k * 62} ${hy - 10} Q${k * 24} ${hy - 34} 0 ${hy - 96} Z`} fill={f} stroke={ink} strokeWidth={sw} />
          </g>
        ))}
        {!flat && <path d={`M-48 ${hy - 90} Q-6 ${hy - 106} 48 ${hy - 90}`} fill="none" stroke={hi} strokeWidth={8} opacity={0.45} />}
        {!flat && [-1, 1].map((k) => <path key={"h" + k} d={`M${k * 90} ${hy + 40} Q${k * 96} ${hy + 110} ${k * 90} ${hy + 190}`} fill="none" stroke={hi} strokeWidth={4} opacity={0.35} />)}
      </g>
    );
  }
  if (kind === "hime") {
    // hime cut: blunt straight bangs across the forehead and two straight cheek-length side locks that frame the face
    const f = flat ? ink : color;
    const hi = mix(color, "#ffffff", 0.35);
    return (
      <g strokeLinejoin="round" strokeLinecap="round">
        <path d={`M-88 ${hy + 6} Q-104 ${hy - 104} 0 ${hy - 108} Q104 ${hy - 104} 88 ${hy + 6} L76 ${hy - 22} Q72 ${hy - 40} 56 ${hy - 42} Q0 ${hy - 34} -56 ${hy - 42} Q-72 ${hy - 40} -76 ${hy - 22} Z`} fill={f} stroke={ink} strokeWidth={sw} />
        {[-1, 1].map((k) => (
          <path key={k} d={`M${k * 90} ${hy - 40} Q${k * 100} ${hy + 40} ${k * 84} ${hy + 150} L${k * 58} ${hy + 156} Q${k * 64} ${hy + 60} ${k * 70} ${hy - 10} Q${k * 74} ${hy - 30} ${k * 90} ${hy - 40} Z`} fill={f} stroke={ink} strokeWidth={sw} />
        ))}
        {!flat && <path d={`M-40 ${hy - 90} Q-6 ${hy - 104} 40 ${hy - 90}`} fill="none" stroke={hi} strokeWidth={8} opacity={0.5} />}
        {!flat && [-1, 1].map((k) => <path key={"h" + k} d={`M${k * 84} ${hy + 10} Q${k * 90} ${hy + 60} ${k * 78} ${hy + 120}`} fill="none" stroke={hi} strokeWidth={5} opacity={0.4} />)}
      </g>
    );
  }
  if (kind === "wave") {
    // undercut with a swept-up top: the sides are short, three big clumps roll up and forward
    const top: L[] = [
      { b: [-70, hy - 30], t: [-46, hy - 126], w: 50, bend: -10 },
      { b: [-58, hy - 52], t: [18, hy - 144], w: 58, bend: -12 },
      { b: [-30, hy - 62], t: [70, hy - 130], w: 60, bend: -14 },
      { b: [10, hy - 66], t: [98, hy - 90], w: 46, bend: -8 },
    ];
    return (
      <g>
        <Cap hy={hy} color={color} ink={ink} sw={sw} flat={flat} hair={4} />
        <Clumps list={top} color={color} ink={ink} sw={sw} flat={flat} />
      </g>
    );
  }
  if (kind === "swoop") {
    // a deep side part: one long swoop across the forehead and tucked behind the right ear, a second lock on the left
    const left: L[] = [{ b: [-30, hy - 96], t: [-96, hy + 36], w: 58, bend: 10 }, { b: [-36, hy - 92], t: [-84, hy - 6], w: 40, bend: 8 }];
    const swoop: L[] = [
      { b: [-22, hy - 104], t: [96, hy - 40], w: 70, bend: -16 },
      { b: [-34, hy - 98], t: [92, hy + 6], w: 78, bend: -22 },
    ];
    return (
      <g>
        <Clumps list={left} color={color} ink={ink} sw={sw} flat={flat} hi={false} />
        <Clumps list={swoop} color={color} ink={ink} sw={sw} flat={flat} />
      </g>
    );
  }
  if (kind === "bowlcut") {
    // one merged hair shape: every piece is first stroked in ink (double width) and then all pieces are filled on top, so the outline only exists on the
    // OUTER edge of the whole mass and the pieces that overlap melt together without seams. Bangs: five locks, the long diagonal one on top.
    const fill = flat ? ink : color;
    const fr: L[] = [
      { b: [-20, hy - 98], t: [-74, hy - 30], w: 34, bend: 6 },
      { b: [40, hy - 94], t: [70, hy - 26], w: 32, bend: -6 },
      { b: [0, hy - 100], t: [-10, hy - 20], w: 26, bend: 2 },
      { b: [44, hy - 100], t: [-52, hy - 16], w: 62, bend: 12 },
      { b: [14, hy - 100], t: [28, hy - 22], w: 36, bend: -4 },
    ];
    const shapes: string[] = [
      `M-86 ${hy + 28} Q-98 ${hy - 40} -70 ${hy - 80} Q-38 ${hy - 106} 0 ${hy - 104} Q38 ${hy - 106} 70 ${hy - 80} Q98 ${hy - 40} 86 ${hy + 28} Q74 ${hy + 10} 68 ${hy - 16} Q58 ${hy - 56} 28 ${hy - 78} L-28 ${hy - 78} Q-58 ${hy - 56} -68 ${hy - 16} Q-74 ${hy + 10} -86 ${hy + 28} Z`,
      `M-84 ${hy + 2} Q-90 ${hy - 92} 0 ${hy - 92} Q90 ${hy - 92} 84 ${hy + 2} Q50 ${hy - 40} 0 ${hy - 42} Q-50 ${hy - 40} -84 ${hy + 2} Z`,
      ...fr.map((c) => leaf(c.b, c.t, c.w, c.bend)),
    ];
    return (
      <g strokeLinecap="round" strokeLinejoin="round">
        {shapes.map((d, i) => <path key={"o" + i} d={d} fill={ink} stroke={ink} strokeWidth={sw * 2} />)}
        {shapes.map((d, i) => <path key={"f" + i} d={d} fill={fill} />)}
        {!flat && fr.map((c, i) => {
          const px = c.t[0] + (c.b[0] - c.t[0]) * 0.5;
          const py = c.t[1] + (c.b[1] - c.t[1]) * 0.5;
          const nx = -(c.b[1] - c.t[1]) / 100;
          const ny = (c.b[0] - c.t[0]) / 100;
          return <path key={"s" + i} d={`M${c.t[0] + nx * 4} ${c.t[1] + ny * 4 - 2} Q${(c.t[0] + px) / 2 + nx * 9} ${(c.t[1] + py) / 2 + ny * 9} ${px + nx * 3} ${py + ny * 3}`} fill="none" stroke={mix(color, "#ffffff", 0.12)} strokeWidth={2.5} opacity={0.4} />;
        })}
      </g>
    );
  }
  if (kind === "bangs") {
    // a rounded top that stands a little off the skull, heavy side-swept bangs ending in points, short pointed side hair past the ears
    const bang: L[] = [
      { b: [-8, hy - 96], t: [-66, hy - 28], w: 44, bend: 8 },
      { b: [4, hy - 100], t: [14, hy - 34], w: 46, bend: -4 },
      { b: [14, hy - 96], t: [66, hy - 40], w: 44, bend: -10 },
    ];
    const side: L[] = [
      { b: [-74, hy - 50], t: [-92, hy + 16], w: 28, bend: 6 },
      { b: [74, hy - 50], t: [92, hy + 16], w: 28, bend: -6 },
    ];
    return (
      <g strokeLinecap="round" strokeLinejoin="round">
        <Clumps list={side} color={color} ink={ink} sw={sw} flat={flat} hi={false} />
        <Cap hy={hy} color={color} ink={ink} sw={sw} flat={flat} hair={14} />
        <Clumps list={bang} color={color} ink={ink} sw={sw} flat={flat} />
      </g>
    );
  }
  // topknot: a smooth cap, a round bun on top with a tie, two loose locks in front of the ears
  const knot = flat ? ink : mix(color, "#ffffff", 0.06);
  const locks: L[] = [
    { b: [-72, hy - 44], t: [-90, hy + 34], w: 26, bend: 6 },
    { b: [72, hy - 44], t: [90, hy + 34], w: 26, bend: -6 },
  ];
  return (
    <g strokeLinecap="round" strokeLinejoin="round">
      <circle cx={4} cy={hy - 128} r={38} fill={knot} stroke={ink} strokeWidth={sw} />
      {!flat && <path d={`M-18 ${hy - 140} Q-4 ${hy - 160} 22 ${hy - 152}`} fill="none" stroke={mix(color, "#ffffff", 0.4)} strokeWidth={7} opacity={0.55} />}
      <Cap hy={hy} color={color} ink={ink} sw={sw} flat={flat} hair={6} />
      <rect x={-18} y={hy - 106} width={44} height={14} rx={6} fill={flat ? ink : "#c8372d"} stroke={ink} strokeWidth={4} />
      <Clumps list={locks} color={color} ink={ink} sw={sw} flat={flat} hi={false} />
    </g>
  );
};

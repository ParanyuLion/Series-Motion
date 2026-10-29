import React from "react";
import { mix } from "./Figure";

// Hair with volume: a back mass behind the head, a top mass that stands off the skull, a front lock that falls over the forehead with its own
// soft shadow on the skin, a sheen band, strand lines that follow the form, and a light-to-dark gradient. Head centre (0, hy), ellipse 80 x 88.

type P = { kind: "sidepart" | "ponytail" | "beanie"; hy: number; color: string; ink: string; sw: number; flat: boolean; beanie?: string };

const grad = (id: string, c: string) => (
  <linearGradient id={id} x1="0.1" y1="0" x2="0.7" y2="1">
    <stop offset="0" stopColor={mix(c, "#ffffff", 0.22)} />
    <stop offset="0.45" stopColor={c} />
    <stop offset="1" stopColor={mix(c, "#000000", 0.28)} />
  </linearGradient>
);

/** drawn before the head ellipse */
export const HairBack: React.FC<P> = ({ kind, hy, color, ink, sw, flat }) => {
  const id = `hb-${color.slice(1)}`;
  const f = flat ? ink : `url(#${id})`;
  if (kind === "ponytail") {
    return (
      <g>
        <defs>{grad(id, color)}</defs>
        {/* the tail: a tapered, slightly curved lock with a tie at the root */}
        <path d={`M88 ${hy - 26} Q150 ${hy - 40} 150 ${hy + 30} Q148 ${hy + 100} 108 ${hy + 160} Q124 ${hy + 90} 112 ${hy + 40} Q104 ${hy + 6} 88 ${hy - 4} Z`} fill={f} stroke={ink} strokeWidth={sw - 1} />
        {!flat && [0, 1, 2].map((i) => <path key={i} d={`M${102 + i * 9} ${hy - 6} Q${136 + i * 5} ${hy + 30} ${124 + i * 4} ${hy + 110 - i * 8}`} fill="none" stroke={mix(color, "#000000", 0.4)} strokeWidth={3} opacity={0.6} />)}
        {!flat && <path d={`M104 ${hy - 14} Q138 ${hy + 10} 132 ${hy + 60}`} fill="none" stroke={mix(color, "#ffffff", 0.35)} strokeWidth={5} opacity={0.5} strokeLinecap="round" />}
        {/* the back of the hair behind the head */}
        <path d={`M-90 ${hy + 6} Q-104 ${hy - 104} 0 ${hy - 106} Q104 ${hy - 104} 90 ${hy + 6} Q84 ${hy + 28} 64 ${hy + 30} L-64 ${hy + 30} Q-84 ${hy + 28} -90 ${hy + 6} Z`} fill={f} stroke={ink} strokeWidth={sw - 1} />
      </g>
    );
  }
  if (kind === "sidepart") {
    return (
      <g>
        <defs>{grad(id, color)}</defs>
        <path d={`M-90 ${hy + 14} Q-108 ${hy - 100} 0 ${hy - 108} Q108 ${hy - 100} 90 ${hy + 14} Q86 ${hy + 34} 66 ${hy + 34} L-66 ${hy + 34} Q-86 ${hy + 34} -90 ${hy + 14} Z`} fill={f} stroke={ink} strokeWidth={sw - 1} />
      </g>
    );
  }
  return null;
};

/** drawn after the head ellipse and before the face */
export const HairFront: React.FC<P> = ({ kind, hy, color, ink, sw, flat, beanie = "#e0782f" }) => {
  const id = `hf-${color.slice(1)}`;
  const bid = `bn-${beanie.slice(1)}`;
  const f = flat ? ink : `url(#${id})`;
  const shade = !flat && <ellipse cx={4} cy={hy - 38} rx={66} ry={16} fill="#2a140f" opacity={0.28} />;
  if (kind === "sidepart") {
    return (
      <g>
        <defs>{grad(id, color)}</defs>
        {shade}
        {/* the top mass, standing off the skull */}
        <path d={`M-88 ${hy - 4} Q-100 ${hy - 100} 4 ${hy - 114} Q106 ${hy - 108} 92 ${hy - 4} Q86 ${hy - 36} 60 ${hy - 50} Q16 ${hy - 40} -34 ${hy - 56} Q-70 ${hy - 48} -88 ${hy - 4} Z`} fill={f} stroke={ink} strokeWidth={sw - 1} />
        {/* the front lock sweeping across the forehead from the parting */}
        <path d={`M-34 ${hy - 104} Q-40 ${hy - 62} -72 ${hy - 36} Q-20 ${hy - 40} 34 ${hy - 36} Q70 ${hy - 40} 84 ${hy - 14} Q80 ${hy - 56} 52 ${hy - 70} Q10 ${hy - 82} -34 ${hy - 104} Z`} fill={f} stroke={ink} strokeWidth={sw - 2} />
        {!flat && (
          <g fill="none" strokeLinecap="round">
            <path d={`M-40 ${hy - 98} Q8 ${hy - 112} 62 ${hy - 92}`} stroke={mix(color, "#ffffff", 0.4)} strokeWidth={7} opacity={0.5} />
            {[0, 1, 2, 3].map((i) => <path key={i} d={`M${-30 + i * 6} ${hy - 100} Q${-30 + i * 14} ${hy - 70 + i * 4} ${-60 + i * 24} ${hy - 40}`} stroke={mix(color, "#000000", 0.45)} strokeWidth={3} opacity={0.55} />)}
          </g>
        )}
      </g>
    );
  }
  if (kind === "ponytail") {
    return (
      <g>
        <defs>{grad(id, color)}</defs>
        {shade}
        {/* swept back: a high smooth forehead, volume over the crown, a side lock in front of the ear */}
        <path d={`M-88 ${hy - 2} Q-102 ${hy - 104} 2 ${hy - 116} Q106 ${hy - 108} 92 ${hy - 4} Q84 ${hy - 44} 52 ${hy - 62} Q2 ${hy - 70} -50 ${hy - 56} Q-78 ${hy - 40} -88 ${hy - 2} Z`} fill={f} stroke={ink} strokeWidth={sw - 1} />
        <path d={`M-84 ${hy - 6} Q-92 ${hy + 24} -70 ${hy + 46} Q-76 ${hy + 14} -62 ${hy - 14} Z`} fill={f} stroke={ink} strokeWidth={sw - 3} />
        {!flat && (
          <g fill="none" strokeLinecap="round">
            <path d={`M-60 ${hy - 90} Q0 ${hy - 118} 70 ${hy - 86}`} stroke={mix(color, "#ffffff", 0.4)} strokeWidth={7} opacity={0.5} />
            {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M${-50 + i * 24} ${hy - 62} Q${-30 + i * 24} ${hy - 96} ${10 + i * 20} ${hy - 108}`} stroke={mix(color, "#000000", 0.45)} strokeWidth={3} opacity={0.5} />)}
          </g>
        )}
        <rect x={84} y={hy - 30} width={24} height={30} rx={8} fill={flat ? ink : "#c8372d"} stroke={ink} strokeWidth={4} transform={`rotate(-16 96 ${hy - 14})`} />
      </g>
    );
  }
  // beanie: a thick knit dome with ribs, a rolled band that shades the forehead, a round pom-pom, and smooth side locks below the band
  return (
    <g>
      <defs>
        {grad(id, color)}
        <linearGradient id={bid} x1="0.1" y1="0" x2="0.8" y2="1"><stop offset="0" stopColor={mix(beanie, "#ffffff", 0.28)} /><stop offset="0.5" stopColor={beanie} /><stop offset="1" stopColor={mix(beanie, "#000000", 0.3)} /></linearGradient>
        <radialGradient id={bid + "p"} cx="0.35" cy="0.3" r="0.8"><stop offset="0" stopColor={mix(beanie, "#ffffff", 0.45)} /><stop offset="1" stopColor={mix(beanie, "#000000", 0.2)} /></radialGradient>
      </defs>
      {!flat && <ellipse cx={0} cy={hy - 20} rx={76} ry={14} fill="#2a140f" opacity={0.32} />}
      {[-1, 1].map((s) => <path key={s} d={`M${s * 82} ${hy - 30} Q${s * 104} ${hy + 6} ${s * 86} ${hy + 50} Q${s * 74} ${hy + 20} ${s * 66} ${hy - 22} Z`} fill={f} stroke={ink} strokeWidth={sw - 2} />)}
      <path d={`M-92 ${hy - 34} Q-104 ${hy - 138} 0 ${hy - 140} Q104 ${hy - 138} 92 ${hy - 34} Q0 ${hy - 54} -92 ${hy - 34} Z`} fill={flat ? ink : `url(#${bid})`} stroke={ink} strokeWidth={sw} />
      {!flat && [-56, -28, 0, 28, 56].map((x) => <path key={x} d={`M${x * 0.96} ${hy - 50} Q${x * 0.7} ${hy - 96} ${x * 0.2} ${hy - 138}`} fill="none" stroke={mix(beanie, "#000000", 0.4)} strokeWidth={3} opacity={0.5} />)}
      {!flat && <path d={`M-62 ${hy - 104} Q-30 ${hy - 130} 20 ${hy - 128}`} fill="none" stroke={mix(beanie, "#ffffff", 0.5)} strokeWidth={7} opacity={0.5} strokeLinecap="round" />}
      <path d={`M-96 ${hy - 44} Q0 ${hy - 70} 96 ${hy - 44} L98 ${hy - 14} Q0 ${hy - 38} -98 ${hy - 14} Z`} fill={flat ? ink : mix(beanie, "#000000", 0.14)} stroke={ink} strokeWidth={sw - 1} />
      {!flat && <path d={`M-90 ${hy - 40} Q0 ${hy - 62} 90 ${hy - 40}`} fill="none" stroke={mix(beanie, "#ffffff", 0.35)} strokeWidth={5} opacity={0.5} />}
      <circle cx={0} cy={hy - 152} r={26} fill={flat ? ink : `url(#${bid}p)`} stroke={ink} strokeWidth={sw - 2} />
      {!flat && [0, 1, 2, 3, 4, 5].map((i) => <path key={i} d={`M${Math.cos(i * 1.05) * 6} ${hy - 152 + Math.sin(i * 1.05) * 6} l${Math.cos(i * 1.05) * 20} ${Math.sin(i * 1.05) * 20}`} stroke={mix(beanie, "#000000", 0.3)} strokeWidth={3} opacity={0.5} />)}
    </g>
  );
};

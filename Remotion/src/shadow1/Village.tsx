import React from "react";
import { AbsoluteFill } from "remotion";
import { Figure, LOOKS, Mood, mix } from "./Figure";
import { Traveller } from "./Traveller";

// The village at noon, the look test for series 5: bleached white sun, a heat-hazed far field, hard cold-blue shadows under everything that is not a villager.
// Light comes from the upper right, so every shadow runs to the lower left: the same skew + squash everywhere (see `Shade`).

const INK = "#0f0b09";
const SHADOW = "#1b2447";
const W = 1920;
const H = 1080;
const HORIZON = 560;
const SUN: [number, number] = [1430, 170];
const SKEW = -55;
const SQUASH = 0.34;

/** a flat copy of any drawing, laid on the ground and thrown away from the sun */
const Shade: React.FC<{ x: number; y: number; k?: number; children: React.ReactNode; o?: number }> = ({ x, y, k = 1, children, o = 0.8 }) => (
  <g transform={`translate(${x},${y}) skewX(${SKEW}) scale(${k},${-SQUASH * k})`} opacity={o}>{children}</g>
);

const House: React.FC<{ w: number; h: number; roof?: string; wall?: string; shadow?: boolean; door?: boolean; win?: number }> = ({ w, h, roof = "#b8673f", wall = "#eadcbd", shadow = false, door = true, win = 1 }) => {
  const rh = w * 0.34;
  const id = `hw${w}${h}${roof.slice(1)}`;
  if (shadow) {
    return (
      <g fill={SHADOW}>
        <rect x={0} y={-h} width={w} height={h} />
        <polygon points={`${-18},${-h} ${w / 2},${-h - rh} ${w + 18},${-h}`} />
      </g>
    );
  }
  const rows = 6;
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <defs>
        <linearGradient id={id + "w"} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={mix(wall, "#6a4a30", 0.32)} />
          <stop offset="0.55" stopColor={wall} />
          <stop offset="1" stopColor={mix(wall, "#ffffff", 0.35)} />
        </linearGradient>
        <linearGradient id={id + "r"} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={mix(roof, "#2a1408", 0.38)} />
          <stop offset="1" stopColor={mix(roof, "#ffd9a8", 0.25)} />
        </linearGradient>
        <clipPath id={id + "c"}><polygon points={`${-18},${-h} ${w / 2},${-h - rh} ${w + 18},${-h}`} /></clipPath>
      </defs>
      <rect x={0} y={-h} width={w} height={h} fill={`url(#${id}w)`} stroke={INK} strokeWidth={7} />
      {/* plaster stains and boards */}
      {Array.from({ length: 4 }, (_, i) => <path key={i} d={`M${12 + i * 3} ${-h + 28 + i * h * 0.2} L${w - 14} ${-h + 24 + i * h * 0.2}`} stroke="#8a6a46" strokeWidth={2.5} opacity={0.22} />)}
      <path d={`M${w * 0.62} ${-h + 6} q14 28 -6 46 q18 14 6 40`} fill="none" stroke="#8a6a46" strokeWidth={3} opacity={0.18} />
      {/* the roof */}
      <polygon points={`${-18},${-h} ${w / 2},${-h - rh} ${w + 18},${-h}`} fill={`url(#${id}r)`} stroke={INK} strokeWidth={7} />
      <g clipPath={`url(#${id}c)`}>
        {Array.from({ length: rows }, (_, i) => {
          const y = -h - ((i + 1) * rh) / (rows + 1);
          return <path key={i} d={`M${-30} ${y} L${w + 30} ${y}`} stroke={INK} strokeWidth={2.6} opacity={0.4} />;
        })}
        <path d={`M${w / 2} ${-h - rh} L${w / 2 + 6} ${-h}`} stroke={INK} strokeWidth={3} opacity={0.3} />
      </g>
      <path d={`M${-18} ${-h} L${w + 18} ${-h}`} stroke={INK} strokeWidth={9} />
      <rect x={0} y={-h + 4} width={w} height={14} fill="#1d1208" opacity={0.28} />
      {door && (
        <g>
          <rect x={w * 0.14} y={-h * 0.62} width={w * 0.24} height={h * 0.62} fill="#5a4030" stroke={INK} strokeWidth={5} />
          <circle cx={w * 0.14 + w * 0.2} cy={-h * 0.3} r={3.2} fill="#d8b878" />
          <rect x={w * 0.14 - 6} y={-5} width={w * 0.24 + 12} height={5} fill="#a8997c" stroke={INK} strokeWidth={3} />
        </g>
      )}
      {win > 0 && (
        <g>
          <rect x={w * 0.56} y={-h * 0.68} width={w * 0.26} height={h * 0.32} fill="#2c2a30" stroke={INK} strokeWidth={5} />
          <line x1={w * 0.69} y1={-h * 0.68} x2={w * 0.69} y2={-h * 0.36} stroke={INK} strokeWidth={4} />
          <rect x={w * 0.48} y={-h * 0.69} width={w * 0.08} height={h * 0.34} fill="#7a5a3c" stroke={INK} strokeWidth={4} />
          <rect x={w * 0.82} y={-h * 0.69} width={w * 0.08} height={h * 0.34} fill="#7a5a3c" stroke={INK} strokeWidth={4} />
          <rect x={w * 0.52} y={-h * 0.36} width={w * 0.34} height={7} fill="#a8997c" stroke={INK} strokeWidth={3} />
        </g>
      )}
    </g>
  );
};

const Tree: React.FC<{ shadow?: boolean }> = ({ shadow = false }) => {
  const blobs: [number, number, number][] = [[-110, -330, 80], [-40, -400, 96], [50, -420, 100], [130, -360, 86], [-150, -270, 64], [160, -270, 62], [0, -310, 90], [-70, -250, 60], [80, -250, 60]];
  if (shadow) {
    return (
      <g fill={SHADOW}>
        <rect x={-18} y={-300} width={36} height={300} />
        {blobs.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} />)}
      </g>
    );
  }
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <path d="M-22 0 Q-14 -140 -26 -300 L26 -300 Q14 -140 28 0 Z" fill="#6a4a30" stroke={INK} strokeWidth={7} />
      <path d="M-8 0 Q-2 -140 -10 -290" fill="none" stroke="#a07850" strokeWidth={6} opacity={0.5} />
      <path d="M-4 -230 Q-70 -270 -110 -320" fill="none" stroke={INK} strokeWidth={16} />
      <path d="M-4 -230 Q-70 -270 -110 -320" fill="none" stroke="#6a4a30" strokeWidth={9} />
      <path d="M6 -250 Q60 -290 100 -340" fill="none" stroke={INK} strokeWidth={16} />
      <path d="M6 -250 Q60 -290 100 -340" fill="none" stroke="#6a4a30" strokeWidth={9} />
      {blobs.map(([x, y, r], i) => <circle key={"o" + i} cx={x} cy={y} r={r + 4} fill={INK} />)}
      {blobs.map(([x, y, r], i) => <circle key={"f" + i} cx={x} cy={y} r={r} fill={mix("#6f8a4a", "#2c3e22", ((x + 150) / 300) * 0.55 + (y > -300 ? 0.15 : 0))} />)}
      {blobs.slice(0, 6).map(([x, y, r], i) => <path key={"h" + i} d={`M${x + r * 0.15} ${y - r * 0.65} Q${x + r * 0.7} ${y - r * 0.55} ${x + r * 0.78} ${y - r * 0.1}`} fill="none" stroke="#d4e08c" strokeWidth={7} opacity={0.55} />)}
      {[[-60, -300], [20, -360], [100, -310], [-120, -250], [60, -240]].map(([x, y], i) => <path key={"l" + i} d={`M${x} ${y} q12 -10 24 0`} stroke="#25361c" strokeWidth={4} fill="none" opacity={0.5} />)}
    </g>
  );
};

const Well: React.FC<{ shadow?: boolean }> = ({ shadow = false }) => {
  if (shadow) {
    return (
      <g fill={SHADOW}>
        <rect x={-62} y={-60} width={124} height={60} />
        <rect x={-62} y={-170} width={10} height={110} />
        <rect x={52} y={-170} width={10} height={110} />
        <polygon points="-84,-170 0,-230 84,-170" />
      </g>
    );
  }
  return (
    <g strokeLinejoin="round">
      <rect x={-62} y={-60} width={124} height={60} fill="#b9aa8a" stroke={INK} strokeWidth={6} />
      {[-40, -10, 22, 46].map((x, i) => <path key={i} d={`M${x} -60 L${x} 0`} stroke={INK} strokeWidth={3} opacity={0.4} />)}
      <path d="M-62 -30 L62 -30" stroke={INK} strokeWidth={3} opacity={0.4} />
      <ellipse cx={0} cy={-60} rx={62} ry={12} fill="#2a2018" stroke={INK} strokeWidth={5} />
      <rect x={-62} y={-170} width={10} height={112} fill="#6a4a30" stroke={INK} strokeWidth={5} />
      <rect x={52} y={-170} width={10} height={112} fill="#6a4a30" stroke={INK} strokeWidth={5} />
      <line x1={0} y1={-168} x2={0} y2={-110} stroke={INK} strokeWidth={3} />
      <rect x={-12} y={-112} width={24} height={20} rx={3} fill="#8a6a44" stroke={INK} strokeWidth={4} />
      <polygon points="-84,-170 0,-230 84,-170" fill="#b8673f" stroke={INK} strokeWidth={6} />
      <path d="M-70 -178 L0 -222 L70 -178" fill="none" stroke={INK} strokeWidth={3} opacity={0.4} />
    </g>
  );
};

const Goat: React.FC<{ shadow?: boolean }> = ({ shadow = false }) => {
  const body = shadow ? SHADOW : "#efe6d2";
  const line = shadow ? SHADOW : INK;
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      <g stroke={line} strokeWidth={shadow ? 0 : 6}>
        {[-34, -18, 26, 40].map((x, i) => <g key={i}><line x1={x} y1={-56} x2={x} y2={-4} stroke={line} strokeWidth={shadow ? 12 : 16} /><line x1={x} y1={-56} x2={x} y2={-6} stroke={shadow ? SHADOW : "#d8ccb4"} strokeWidth={9} /></g>)}
        <ellipse cx={0} cy={-76} rx={58} ry={34} fill={body} />
        <path d="M46 -92 Q70 -120 84 -108 Q96 -100 90 -86 Q82 -66 52 -64 Z" fill={body} />
        <path d="M80 -112 q-6 -26 -20 -28" fill="none" stroke={shadow ? SHADOW : "#6a5a44"} strokeWidth={6} />
        <path d="M88 -108 q4 -26 18 -26" fill="none" stroke={shadow ? SHADOW : "#6a5a44"} strokeWidth={6} />
        <path d="M-58 -88 q-18 -2 -16 14" fill="none" strokeWidth={7} />
        <path d="M84 -80 q4 16 -6 20" fill="none" stroke={shadow ? SHADOW : "#d8ccb4"} strokeWidth={6} />
      </g>
      {!shadow && <circle cx={76} cy={-98} r={3.2} fill={INK} />}
      {!shadow && <path d="M-30 -92 q30 -14 60 0" fill="none" stroke="#bfb298" strokeWidth={5} opacity={0.6} />}
    </g>
  );
};

const Tuft: React.FC<{ x: number; y: number; s?: number; c?: string }> = ({ x, y, s = 1, c = "#5a4326" }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} fill="none" stroke={c} strokeWidth={5} strokeLinecap="round">
    {[-26, -14, -4, 8, 20, 30].map((dx, i) => <path key={i} d={`M${dx} 0 Q${dx + (i % 2 ? 8 : -10)} ${-26 - i * 4} ${dx + (i - 2.5) * 6} ${-48 - ((i * 7) % 18)}`} />)}
  </g>
);

const Rock: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} strokeLinejoin="round">
    <path d="M-56 0 Q-60 -34 -28 -50 Q10 -66 44 -40 Q66 -18 58 0 Z" fill="#8a7658" stroke={INK} strokeWidth={6} />
    <path d="M-20 -46 Q10 -58 38 -38" fill="none" stroke="#d6c39a" strokeWidth={6} opacity={0.6} />
    <path d="M-44 -6 Q-10 4 52 -4" fill="none" stroke="#3a2c1c" strokeWidth={5} opacity={0.4} />
  </g>
);

export const Village: React.FC = () => {
  const ground = (y: number) => y;
  const people: { id: string; x: number; y: number; s: number; mood: Mood }[] = [
    { id: "oldman", x: 1480, y: 764, s: 0.62, mood: "calm" },
    { id: "head", x: 1060, y: 820, s: 0.8, mood: "smile" },
    { id: "mother", x: 1235, y: 806, s: 0.74, mood: "smile" },
    { id: "cook", x: 900, y: 784, s: 0.66, mood: "smile" },
    { id: "child", x: 1370, y: 880, s: 0.92, mood: "calm" },
  ];
  return (
    <AbsoluteFill>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <defs>
          <linearGradient id="v-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#e9a860" />
            <stop offset="0.5" stopColor="#f7d391" />
            <stop offset="1" stopColor="#fff0c8" />
          </linearGradient>
          <linearGradient id="v-ground" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#e0c088" />
            <stop offset="0.35" stopColor="#c8a064" />
            <stop offset="1" stopColor="#8f6a3c" />
          </linearGradient>
          <radialGradient id="v-sunglow" cx={SUN[0]} cy={SUN[1]} r={900} gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#fffbe6" stopOpacity="0.95" />
            <stop offset="0.18" stopColor="#fff2c0" stopOpacity="0.55" />
            <stop offset="0.6" stopColor="#ffe2a0" stopOpacity="0.14" />
            <stop offset="1" stopColor="#ffe2a0" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="v-vig" cx="0.5" cy="0.55" r="0.78"><stop offset="0.55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#1a0c04" stopOpacity="0.6" /></radialGradient>
          <linearGradient id="v-haze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff2cc" stopOpacity="0" /><stop offset="1" stopColor="#fff2cc" stopOpacity="0.75" /></linearGradient>
          <filter id="v-shimmer" x="-2%" y="-5%" width="104%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.004 0.05" numOctaves="2" seed="5" result="n" /><feDisplacementMap in="SourceGraphic" in2="n" scale="9" xChannelSelector="R" yChannelSelector="G" /></filter>
          <filter id="v-grain"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="4" /><feColorMatrix type="saturate" values="0" /></filter>
          <filter id="v-rough" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="7" result="n" /><feDisplacementMap in="SourceGraphic" in2="n" scale="3" xChannelSelector="R" yChannelSelector="G" /></filter>
          <filter id="v-soft"><feGaussianBlur stdDeviation="6" /></filter>
        </defs>

        <rect width={W} height={H} fill="url(#v-sky)" />
        {/* wisps of high cloud, bleached out by the sun */}
        {[[200, 120, 420], [640, 250, 520], [1000, 90, 380], [160, 330, 300]].map(([x, y, w], i) => <ellipse key={i} cx={x} cy={y} rx={w} ry={16} fill="#fff6dc" opacity={0.35} />)}
        {/* sun rays */}
        <g opacity={0.2}>
          {Array.from({ length: 9 }, (_, i) => {
            const a = (Math.PI * (0.62 + i * 0.12)) ;
            const L = 1500;
            const d = 0.035;
            return <polygon key={i} points={`${SUN[0]},${SUN[1]} ${SUN[0] + Math.cos(a - d) * L},${SUN[1] + Math.sin(a - d) * L} ${SUN[0] + Math.cos(a + d) * L},${SUN[1] + Math.sin(a + d) * L}`} fill="#fffbe0" />;
          })}
        </g>
        <circle cx={SUN[0]} cy={SUN[1]} r={260} fill="#fff3c4" opacity={0.28} />
        <circle cx={SUN[0]} cy={SUN[1]} r={130} fill="#fffbea" opacity={0.7} />
        <circle cx={SUN[0]} cy={SUN[1]} r={84} fill="#ffffff" />

        {/* far hills and the heat-hazed field */}
        <g filter="url(#v-shimmer)">
          <path d={`M0 ${HORIZON - 70} Q220 ${HORIZON - 190} 470 ${HORIZON - 110} Q700 ${HORIZON - 40} 900 ${HORIZON - 120} Q1120 ${HORIZON - 210} 1360 ${HORIZON - 90} Q1620 ${HORIZON - 190} 1920 ${HORIZON - 80} L1920 ${HORIZON + 10} L0 ${HORIZON + 10} Z`} fill="#c99a6c" />
          <path d={`M0 ${HORIZON - 30} Q300 ${HORIZON - 110} 620 ${HORIZON - 50} Q900 ${HORIZON - 10} 1180 ${HORIZON - 70} Q1500 ${HORIZON - 120} 1920 ${HORIZON - 30} L1920 ${HORIZON + 10} L0 ${HORIZON + 10} Z`} fill="#b08454" />
          <rect y={HORIZON - 4} width={W} height={30} fill="#e8cf9c" />
        </g>
        <rect y={HORIZON - 110} width={W} height={150} fill="url(#v-haze)" />

        {/* distant houses */}
        <g>
          {[[120, 0.55], [420, 0.5], [1460, 0.5], [1750, 0.58]].map(([x, s], i) => (
            <g key={i}>
              <g transform={`translate(${x},${HORIZON + 40}) scale(${s})`}><Shade x={0} y={0} k={1}><House w={220} h={150} shadow /></Shade></g>
              <g transform={`translate(${x},${HORIZON + 40}) scale(${s})`}><House w={220} h={150} roof={i % 2 ? "#b8673f" : "#a8582f"} win={1} /></g>
            </g>
          ))}
        </g>

        <rect y={HORIZON + 26} width={W} height={H - HORIZON - 26} fill="url(#v-ground)" />
        {/* the road: a paler band of beaten dust with two wheel ruts, narrowing toward the horizon */}
        <polygon points={`820,${HORIZON + 26} 1060,${HORIZON + 26} 1500,${H} 380,${H}`} fill="#e6cd96" opacity={0.7} />
        <path d={`M900 ${HORIZON + 30} Q760 800 590 ${H}`} fill="none" stroke="#a8844c" strokeWidth={10} opacity={0.5} />
        <path d={`M980 ${HORIZON + 30} Q1130 800 1340 ${H}`} fill="none" stroke="#a8844c" strokeWidth={10} opacity={0.5} />
        {/* cracks and pebbles in the dust */}
        <g stroke="#7a5a32" strokeWidth={3} fill="none" opacity={0.35}>
          <path d="M120 720 l60 18 l30 -12 l50 24" /><path d="M1580 760 l-50 16 l-34 -10 l-40 20" /><path d="M300 960 l70 -14 l44 18" /><path d="M1520 980 l60 -20 l50 14" /><path d="M700 1020 l60 -10 l30 12" />
        </g>
        {Array.from({ length: 46 }, (_, i) => {
          const x = (i * 211 + 37) % W;
          const y = HORIZON + 60 + ((i * 97) % (H - HORIZON - 80));
          return <ellipse key={i} cx={x} cy={y} rx={3 + (i % 4)} ry={2 + (i % 3)} fill={i % 3 ? "#8a6a40" : "#f0dcaa"} opacity={0.55} />;
        })}

        <g opacity={0.12}>{[640, 700, 780].map((y, i) => <path key={i} d={`M0 ${y} Q480 ${y - 14} 960 ${y} T1920 ${y}`} stroke="#fff" strokeWidth={10} fill="none" />)}</g>
        {/* the well, house and tree, each with its hard shadow */}
        <Shade x={1620} y={770}><House w={290} h={210} shadow /></Shade>
        <Shade x={330} y={742} k={0.95}><Tree shadow /></Shade>
        <Shade x={600} y={700} k={0.6}><Well shadow /></Shade>
        <g transform="translate(1620,770)"><House w={290} h={210} roof="#b8673f" /></g>
        <g transform="translate(330,742) scale(0.95)"><Tree /></g>
        <g transform="translate(600,700) scale(0.6)"><Well /></g>

        {/* the goat has a shadow */}
        <Shade x={760} y={930} k={1.1}><Goat shadow /></Shade>
        <g transform="translate(760,930) scale(1.1)"><Goat /></g>

        {/* villagers: no shadow at all */}
        {[...people].sort((a, b) => a.y - b.y).map((p) => (
          <g key={p.id} transform={`translate(${p.x},${p.y}) scale(${p.s})`} filter={undefined}><Figure look={LOOKS[p.id]} mood={p.mood} t={0} /></g>
        ))}

        {/* the traveller, in front, with a long shadow */}
        <Shade x={620} y={1010} k={1.05}><Traveller yaw={32} silhouette /></Shade>
        <g transform="translate(620,1010) scale(1.05)"><Traveller yaw={32} mood="worry" t={0} /></g>

        {/* foreground dry grass and rocks, dark against the glare */}
        <Tuft x={70} y={1060} s={1.5} c="#4a3620" /><Tuft x={150} y={1070} s={1.1} c="#5a4326" /><Tuft x={1840} y={1064} s={1.6} c="#4a3620" /><Tuft x={1760} y={1074} s={1.1} c="#5a4326" /><Tuft x={920} y={1074} s={0.9} c="#5a4326" />
        <Rock x={1700} y={1040} s={1.1} /><Rock x={250} y={1048} s={0.7} />

        {/* bloom, vignette, grain */}
        <rect width={W} height={H} filter="url(#v-grain)" opacity={0.16} />
        <rect width={W} height={H} fill="url(#v-vig)" />
      </svg>
    </AbsoluteFill>
  );
};

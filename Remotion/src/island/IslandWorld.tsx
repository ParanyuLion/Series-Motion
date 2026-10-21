import React from "react";
import { interpolateColors } from "remotion";
import { Glow } from "../World";
import { mix } from "./Person";

export const W = 1080;
export const H = 1920;
export const HORIZON_Y = 1000;
export const SHORE_Y = 1330;
/** y of the ground line characters stand on (their feet), roughly the middle of the beach */
export const BEACH_Y = 1560;

// Tone A: steel grey, heavy dull sea, overcast sky, thin fog (approved mockup).
export const PALETTE_A = { sky1: "#59626b", sky2: "#8c949a", sea: "#3c444c", sand: "#6b6e6a", hills: "#2e343a", fog: "#cfd5d8" };
const SICK = { sky1: "#4a5434", sky2: "#a2a35c", sea: "#2f3a30" };

const mod = (a: number, b: number) => ((a % b) + b) % b;
const rnd = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

const Palm: React.FC<{ x: number; base: number; h: number; lean: number; stain: boolean; seed: number; frame: number }> = ({ x, base, h, lean, stain, seed, frame }) => {
  const topX = x + lean;
  const topY = base - h;
  const sway = Math.sin(frame * 0.02 + seed) * 3;
  const trunk = `M${x - 14} ${base} Q${x + lean * 0.2 - 10} ${base - h * 0.55} ${topX - 8} ${topY} L${topX + 8} ${topY} Q${x + lean * 0.2 + 10} ${base - h * 0.55} ${x + 14} ${base} Z`;
  const stainTop = base - 470;
  return (
    <g>
      <defs>
        <clipPath id={`trunk${seed}`}><path d={trunk} /></clipPath>
      </defs>
      <path d={trunk} fill="#262b30" />
      {stain && (
        <g clipPath={`url(#trunk${seed})`}>
          <rect x={x - 60} y={stainTop - 6} width={140} height={base - stainTop + 6} fill="#3d454c" opacity={0.95} />
          <path d={`M${x - 60} ${stainTop} q15 -9 30 0 t30 0 t30 0 t30 0 t30 0`} stroke="#1a1e22" strokeWidth={4} fill="none" />
        </g>
      )}
      {Array.from({ length: 7 }, (_, i) => {
        const a = (-160 + i * 52) * (Math.PI / 180) + Math.sin(frame * 0.03 + i + seed) * 0.03;
        const len = 150 + (i % 2) * 40;
        const ex = topX + sway + Math.cos(a) * len;
        const ey = topY + Math.sin(a) * len * 0.6 + 40;
        return <path key={i} d={`M${topX} ${topY} Q${topX + Math.cos(a) * len * 0.5} ${topY + Math.sin(a) * len * 0.9 - 30} ${ex} ${ey}`} stroke="#20262a" strokeWidth={16} strokeLinecap="round" fill="none" />;
      })}
    </g>
  );
};

type Props = {
  frame: number;
  /** horizontal scroll in px (camera following someone walking along the shore) */
  scroll: number;
  /** 0 = grey, 1 = sick yellow-green storm sky */
  stormAmount: number;
  showWaterline?: boolean;
  showCamp?: boolean;
  /** camp position on the beach (x only; moves with scroll) */
  campX?: number;
  /** x of the first palm at scroll 0; later palms repeat every 1500 px */
  treeX0?: number;
  /** extra px of sand below the frame (when the whole world is shifted up) */
  bottomExtend?: number;
};

export const IslandWorld: React.FC<Props> = ({ frame, scroll, stormAmount, showWaterline = false, showCamp = false, campX = 330, treeX0 = 760, bottomExtend = 0 }) => {
  const s = Math.min(1, Math.max(0, stormAmount));
  const sky1 = interpolateColors(s, [0, 1], [PALETTE_A.sky1, SICK.sky1]);
  const sky2 = interpolateColors(s, [0, 1], [PALETTE_A.sky2, SICK.sky2]);
  const sea = interpolateColors(s, [0, 1], [PALETTE_A.sea, SICK.sea]);
  const fog = mix(PALETTE_A.fog, "#d9d89a", s * 0.5);
  const treeSpacing = 1500;
  const treeOff = mod(scroll * 0.85, treeSpacing);
  const trees = [0, 1, 2].map((k) => ({ x: treeX0 + k * treeSpacing - treeOff, seed: k }));
  const sandOff = mod(scroll, 240);
  const fire = 0.85 + 0.15 * Math.sin(frame * 0.7) + 0.08 * Math.sin(frame * 1.9);
  const cx = campX - scroll;

  return (
    <g>
      <defs>
        <linearGradient id="isl-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={sky1} />
          <stop offset="1" stopColor={sky2} />
        </linearGradient>
        <linearGradient id="isl-sand" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={mix(PALETTE_A.sand, "#2c2f2d", 0.25)} />
          <stop offset="0.25" stopColor={PALETTE_A.sand} />
          <stop offset="1" stopColor={mix(PALETTE_A.sand, "#1c1e1d", 0.55)} />
        </linearGradient>
        <linearGradient id="isl-fog" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={fog} stopOpacity={0} />
          <stop offset="0.5" stopColor={fog} stopOpacity={0.5} />
          <stop offset="1" stopColor={fog} stopOpacity={0} />
        </linearGradient>
      </defs>

      <rect width={W} height={SHORE_Y + 20} fill="url(#isl-sky)" />
      {/* slow, heavy clouds */}
      {Array.from({ length: 6 }, (_, i) => {
        const x = mod(rnd(i) * 1700 + frame * (0.12 + rnd(i + 3) * 0.1), 1700) - 300;
        return <ellipse key={i} cx={x} cy={160 + i * 110} rx={320 + rnd(i + 8) * 200} ry={46 + rnd(i + 2) * 30} fill={mix(sky1, "#14181b", 0.35)} opacity={0.35} />;
      })}
      <circle cx={760} cy={430} r={110} fill="#c9ced1" opacity={0.18 * (1 - s)} />

      {/* island hills, right side */}
      <path d={`M${480 - scroll * 0.12} ${HORIZON_Y + 30} Q${680 - scroll * 0.12} 760 ${900 - scroll * 0.12} 840 Q${1100 - scroll * 0.12} 780 ${1400 - scroll * 0.12} ${HORIZON_Y + 30} Z`} fill={PALETTE_A.hills} opacity={0.85} />

      {/* sea */}
      <rect y={HORIZON_Y} width={W} height={SHORE_Y - HORIZON_Y + 10} fill={sea} />
      {Array.from({ length: 9 }, (_, i) => {
        const y = HORIZON_Y + 24 + i * 34;
        const amp = 3 + i * 0.5;
        return <path key={i} d={`M0 ${y} ${Array.from({ length: 12 }, (_, j) => `L${j * 100} ${y + Math.sin(frame * 0.03 + j * 0.9 + i) * amp}`).join(" ")}`} stroke={mix(sea, "#8c949a", 0.14)} strokeWidth={2} fill="none" opacity={0.6} />;
      })}
      <rect y={HORIZON_Y - 70} width={W} height={260} fill="url(#isl-fog)" />

      {/* beach */}
      <rect y={SHORE_Y} width={W} height={H - SHORE_Y + bottomExtend} fill="url(#isl-sand)" />
      <path d={`M0 ${SHORE_Y} ${Array.from({ length: 12 }, (_, j) => `L${j * 100} ${SHORE_Y + 10 + Math.sin(frame * 0.04 + j) * 6}`).join(" ")}`} stroke="#aeb4b6" strokeWidth={5} fill="none" opacity={0.5} />
      {Array.from({ length: 28 }, (_, i) => (
        <circle key={i} cx={mod(rnd(i) * 1200 - sandOff * 1, 1200) - 60} cy={SHORE_Y + 90 + rnd(i + 5) * 420} r={2 + rnd(i + 9) * 3} fill="#3f4240" opacity={0.35} />
      ))}

      {/* palms at the edge of the beach (waterline stain high on the trunks) */}
      {trees.map((t) => (
        <Palm key={t.seed} x={t.x} base={SHORE_Y + 130} h={760} lean={t.seed % 2 ? -60 : 70} stain={showWaterline} seed={t.seed} frame={frame} />
      ))}

      {showCamp && (
        <g transform={`translate(${cx},${BEACH_Y + 70})`}>
          <Glow id="camp-glow" x={0} y={-20} r={260 * fire} color="#ff9a3c" opacity={0.55} />
          <rect x={-38} y={-8} width={76} height={14} rx={7} fill="#2a1f18" transform="rotate(-12)" />
          <rect x={-38} y={-8} width={76} height={14} rx={7} fill="#35271d" transform="rotate(12)" />
          <path d={`M0 -70 Q-26 -30 -14 -4 Q0 -14 14 -4 Q28 -30 0 -70 Z`} fill="#ffb54a" opacity={0.9 * fire} />
          <path d={`M0 -46 Q-12 -22 -6 -6 Q0 -12 6 -6 Q14 -22 0 -46 Z`} fill="#fff0b0" opacity={0.9} />
        </g>
      )}
    </g>
  );
};

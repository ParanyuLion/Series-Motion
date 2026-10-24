import React from "react";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ramp = (g: number, a: number, b: number) => clamp01((g - a) / Math.max(1, b - a));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);

// cloth in screen space
const CX = 110;
const CY = 250;
const CW = 790;
const CH = 960;
const GY = 1070; // the ground line of the play, in screen y

type SilProps = { x: number; y: number; s: number; facing: 1 | -1; step: number; tilt?: number; tiltHead?: number; arms?: number };

/** a flat black figure: round head, long body, two swinging legs; `tiltHead` tips the head (degrees) */
const Sil: React.FC<SilProps> = ({ x, y, s, facing, step, tiltHead = 0, arms = 0 }) => {
  const a = Math.sin(step) * 26;
  return (
    <g transform={`translate(${x},${y}) scale(${facing * s},${s})`} fill="#0b0805" stroke="#0b0805" strokeLinecap="round" strokeLinejoin="round">
      <g transform={`rotate(${a} 0 -70)`}><path d="M0 -70 L0 0" strokeWidth={14} fill="none" /></g>
      <g transform={`rotate(${-a} 0 -70)`}><path d="M0 -70 L0 0" strokeWidth={14} fill="none" /></g>
      <path d="M-14 -72 Q-16 -150 0 -158 Q16 -150 14 -72 Z" strokeWidth={4} />
      <g transform={`rotate(${arms - a * 0.8} 0 -146)`}><path d="M0 -146 L4 -88" strokeWidth={10} fill="none" /></g>
      <g transform={`rotate(${tiltHead} 0 -158)`}><circle cx={2} cy={-182} r={22} /></g>
    </g>
  );
};

const Tree: React.FC<{ x: number; h: number; branches?: boolean }> = ({ x, h, branches }) => (
  <g fill="#0b0805" stroke="#0b0805" strokeLinecap="round">
    <path d={`M${x - 14} ${GY + 8} L${x - 8} ${GY - h} L${x + 8} ${GY - h} L${x + 14} ${GY + 8} Z`} />
    {branches && (
      <g fill="none" strokeWidth={9}>
        <path d={`M${x} ${GY - h * 0.62} Q${x - 70} ${GY - h * 0.72} ${x - 130} ${GY - h * 0.7}`} />
        <path d={`M${x} ${GY - h * 0.78} Q${x + 60} ${GY - h * 0.88} ${x + 120} ${GY - h * 0.84}`} />
        <path d={`M${x} ${GY - h * 0.92} Q${x - 40} ${GY - h * 1.0} ${x - 90} ${GY - h * 1.02}`} />
      </g>
    )}
  </g>
);

/**
 * The shadow play on a cloth lit from behind. `t` = frames since the telling began; `tripT` = when the three
 * blind villagers join the man; `runT` = when he looks up and runs; `endT` = when the cloth goes dark.
 * Silhouettes only: no faces, no gore, and the thing in the branches is a plain dark mass.
 */
export const Puppet: React.FC<{ t: number; tripT: number; runT: number; endT: number }> = ({ t, tripT, runT, endT }) => {
  const appear = ramp(t, 0, 14) * clamp01((endT + 12 - t) / 12);
  const flick = 1 + 0.03 * Math.sin(t * 0.41);
  const join = ramp(t, tripT, tripT + 24);
  const stopAt = runT - 30;
  const walkT = ramp(t, 0, stopAt);
  // the man walks right with long clear steps, then stops under the big tree
  const manWalk = t < stopAt;
  const manX = t < runT + 30 ? lerp(190, 600, smooth(walkT)) : lerp(600, -80, ramp(t, runT + 30, runT + 70));
  const running = t >= runT + 30;
  const look = smooth(ramp(t, runT - 10, runT + 8)) * (running ? 0 : 1);
  const blobIn = smooth(ramp(t, runT - 4, runT + 14)) * (1 - ramp(t, runT + 50, runT + 70) * 0.0);
  // the three blind villagers follow with short even steps
  const vBase = [350, 285, 220];
  const vx = (i: number) => (t < stopAt ? lerp(vBase[i] - 90, vBase[i] + 150, smooth(walkT)) : vBase[i] + 150);
  const turned = t >= runT + 52;
  const vWalk = t < stopAt + 4;
  const dim = clamp01((endT + 12 - t) / 12);
  const manY = GY + (running ? 26 : 8);
  return (
    <g opacity={appear}>
      <defs>
        <radialGradient id="pp-light" cx="0.5" cy="0.62" r="0.7">
          <stop offset="0" stopColor="#f3d68e" />
          <stop offset="0.55" stopColor="#c99a4e" />
          <stop offset="1" stopColor="#5b3d1a" />
        </radialGradient>
        <clipPath id="pp-clip"><rect x={CX} y={CY} width={CW} height={CH} /></clipPath>
      </defs>
      {/* frame */}
      <rect x={CX - 26} y={CY - 26} width={CW + 52} height={CH + 52} rx={10} fill="#2a1f14" />
      <rect x={CX} y={CY} width={CW} height={CH} fill="url(#pp-light)" opacity={flick} />
      {Array.from({ length: 24 }, (_, i) => <line key={i} x1={CX} y1={CY + i * 40} x2={CX + CW} y2={CY + i * 40} stroke="#7a5826" strokeWidth={1.5} opacity={0.35} />)}
      <g clipPath="url(#pp-clip)" opacity={dim}>
        <g transform={`translate(${CX},0)`}>
          {/* ground and the hut of the village */}
          <rect x={0} y={GY + 6} width={CW} height={160} fill="#0b0805" opacity={0.92} />
          <path d={`M30 ${GY + 6} L30 ${GY - 120} L110 ${GY - 190} L190 ${GY - 120} L190 ${GY + 6} Z`} fill="#0b0805" opacity={0.9} />
          {/* the forest on the right; the big tree has the branches */}
          <Tree x={470} h={430} />
          <Tree x={520} h={330} />
          <Tree x={700} h={480} />
          <Tree x={760} h={360} />
          <Tree x={620} h={560} branches />
          {/* the dark mass in the branches */}
          <g opacity={blobIn} transform={`translate(560,${GY - 560 * 0.72 - 22})`}>
            <path d="M-34 4 Q-40 -34 -4 -40 Q38 -44 44 -6 Q36 26 -4 26 Q-28 26 -34 4 Z" fill="#0b0805" />
            <path d="M-26 -34 Q-60 -62 -38 -90" stroke="#0b0805" strokeWidth={10} fill="none" strokeLinecap="round" />
          </g>
          {/* the rope between the man and the three */}
          {join > 0 && !running && t < runT && (
            <path d={`M${manX - 4} ${GY - 120} Q${(manX + vx(0)) / 2} ${GY - 80} ${vx(0) + 4} ${GY - 120} Q${(vx(0) + vx(1)) / 2} ${GY - 80} ${vx(1) + 4} ${GY - 120} Q${(vx(1) + vx(2)) / 2} ${GY - 80} ${vx(2) + 4} ${GY - 120}`} stroke="#0b0805" strokeWidth={4} fill="none" opacity={join} />
          )}
          {[0, 1, 2].map((i) => (
            <g key={i} opacity={join}>
              <Sil x={vx(i)} y={GY + 6} s={0.92} facing={turned ? -1 : 1} step={vWalk ? t * 0.2 + i : 0} tiltHead={turned ? -6 : 0} arms={0} />
            </g>
          ))}
          <Sil x={manX} y={manY} s={running ? 1.2 : 1.1} facing={running ? -1 : 1} step={manWalk ? t * 0.3 : running ? t * 0.62 : 0} tiltHead={-38 * look} arms={running ? 50 : 0} />
        </g>
      </g>
      {/* the cloth goes dark at the end */}
      <rect x={CX} y={CY} width={CW} height={CH} fill="#0b0805" opacity={1 - dim} />
    </g>
  );
};

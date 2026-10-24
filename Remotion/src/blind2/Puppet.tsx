import React from "react";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ramp = (g: number, a: number, b: number) => clamp01((g - a) / Math.max(1, b - a));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);

const W = 1080;
const H = 1920;
const K = 1.37; // the play is drawn in a 790-wide space and scaled to fill the screen
const TY = -170; // moves the ground line of the play to about screen y 1296 (figures stay above 1414)
const GY = 1070; // ground line, in the play's own space

type SilProps = { x: number; y: number; s: number; facing: 1 | -1; step: number; tiltHead?: number; arms?: number };

/** a flat black figure: round head with a small nose, long body, two swinging legs; `tiltHead` tips the head (degrees) */
const Sil: React.FC<SilProps> = ({ x, y, s, facing, step, tiltHead = 0, arms = 0 }) => {
  const a = Math.sin(step) * 26;
  return (
    <g transform={`translate(${x},${y}) scale(${facing * s},${s})`} fill="#070503" stroke="#070503" strokeLinecap="round" strokeLinejoin="round">
      <g transform={`rotate(${a} 0 -70)`}><path d="M0 -70 L0 0" strokeWidth={14} fill="none" /></g>
      <g transform={`rotate(${-a} 0 -70)`}><path d="M0 -70 L0 0" strokeWidth={14} fill="none" /></g>
      <path d="M-14 -72 Q-16 -150 0 -158 Q16 -150 14 -72 Z" strokeWidth={4} />
      <g transform={`rotate(${arms - a * 0.8} 0 -146)`}><path d="M0 -146 L4 -88" strokeWidth={10} fill="none" /></g>
      <g transform={`rotate(${tiltHead} 0 -158)`}><circle cx={2} cy={-182} r={22} /><path d="M20 -188 L38 -178 L20 -172 Z" /></g>
    </g>
  );
};

/** a tall trunk that runs off the top of the picture; `sway` moves its branches a little */
const Tree: React.FC<{ x: number; h: number; branches?: boolean; sway?: number }> = ({ x, h, branches, sway = 0 }) => (
  <g fill="#070503" stroke="#070503" strokeLinecap="round">
    <path d={`M${x - 15} ${GY + 8} L${x - 9} ${GY - h} L${x + 9} ${GY - h} L${x + 15} ${GY + 8} Z`} />
    {branches && (
      <g fill="none" strokeWidth={10}>
        {[0.38, 0.5, 0.62, 0.74].map((f, i) => (
          <path key={i} d={`M${x} ${GY - h * f} Q${x + (i % 2 ? 70 : -70) + sway * 6} ${GY - h * f - 50} ${x + (i % 2 ? 150 : -150) + sway * 12} ${GY - h * f - 40 + sway * 4}`} />
        ))}
      </g>
    )}
  </g>
);

/**
 * The shadow play on a cloth lit from behind, full screen. `t` = frames since the telling began; `tripT` = when the
 * three blind villagers join the man; `runT` = when he looks up and then runs; `endT` = when the cloth goes dark.
 * Silhouettes only. What he sees is never drawn: it is above the top of the picture, in the dark the light does not
 * reach; the dark creeps down the cloth and the light shrinks while he looks.
 */
export const Puppet: React.FC<{ t: number; tripT: number; runT: number; endT: number }> = ({ t, tripT, runT, endT }) => {
  const appear = ramp(t, 0, 14) * clamp01((endT + 12 - t) / 12);
  const join = ramp(t, tripT, tripT + 24);
  const stopAt = runT - 30;
  const walkT = ramp(t, 0, stopAt);
  const manWalk = t < stopAt;
  const manX = t < runT + 30 ? lerp(190, 500, smooth(walkT)) : lerp(500, -80, ramp(t, runT + 30, runT + 70));
  const running = t >= runT + 30;
  const look = smooth(ramp(t, runT - 14, runT + 10)) * (running ? 0 : 1);
  // the dark creeps down from the top while he looks, and lifts a little after he is gone
  const creep = smooth(ramp(t, runT - 20, runT + 30)) * (1 - 0.45 * smooth(ramp(t, runT + 70, runT + 120)));
  // the light of the cloth dims and shivers as he looks up
  const flick = (1 + 0.04 * Math.sin(t * 0.41) + 0.03 * Math.sin(t * 1.3)) * (1 - 0.3 * creep) * (1 - 0.1 * Math.max(0, Math.sin(t * 2.1)) * creep);
  const sway = Math.sin(t * 0.045) * (0.6 + 1.6 * creep);
  const fin = [380, 315, 250];
  const vx = (i: number) => (t < stopAt ? lerp(fin[i] - 240, fin[i], smooth(walkT)) : fin[i]);
  const turned = t >= runT + 52;
  const vWalk = t < stopAt + 4;
  const dim = clamp01((endT + 12 - t) / 12);
  const manY = GY + (running ? 26 : 8);
  return (
    <g opacity={appear}>
      <defs>
        <radialGradient id="pp-light" cx="0.5" cy="0.66" r="0.62">
          <stop offset="0" stopColor="#e9c985" />
          <stop offset="0.5" stopColor="#a4793a" />
          <stop offset="1" stopColor="#2a1a0a" />
        </radialGradient>
        <linearGradient id="pp-top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#030201" stopOpacity={1} />
          <stop offset="0.6" stopColor="#030201" stopOpacity={0.55} />
          <stop offset="1" stopColor="#030201" stopOpacity={0} />
        </linearGradient>
        <linearGradient id="pp-mist" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d9b36a" stopOpacity={0} />
          <stop offset="1" stopColor="#d9b36a" stopOpacity={0.35} />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill="#1a1006" />
      <rect width={W} height={H} fill="url(#pp-light)" opacity={flick} />
      {Array.from({ length: 48 }, (_, i) => <line key={i} x1={0} y1={i * 40} x2={W} y2={i * 40} stroke="#4a3416" strokeWidth={1.5} opacity={0.35} />)}
      <g opacity={dim}>
        <g transform={`translate(0,${TY}) scale(${K})`}>
          {/* the ground, a low mist, the hut of the village */}
          <rect x={-20} y={GY + 6} width={830} height={700} fill="#070503" opacity={0.95} />
          <rect x={-20} y={GY - 90} width={830} height={96} fill="url(#pp-mist)" />
          <path d={`M30 ${GY + 6} L30 ${GY - 120} L110 ${GY - 190} L190 ${GY - 120} L190 ${GY + 6} Z`} fill="#070503" opacity={0.92} />
          {/* the forest: trunks that never end at the top */}
          <Tree x={560} h={800} sway={sway} />
          <Tree x={700} h={1100} sway={sway} />
          <Tree x={760} h={760} sway={sway} />
          <Tree x={840} h={1200} sway={sway} />
          <Tree x={650} h={1500} branches sway={sway} />
          {/* the rope between the man and the three */}
          {join > 0 && !running && t < runT && (
            <path d={`M${manX - 4} ${GY - 120} Q${(manX + vx(0)) / 2} ${GY - 80} ${vx(0) + 4} ${GY - 120} Q${(vx(0) + vx(1)) / 2} ${GY - 80} ${vx(1) + 4} ${GY - 120} Q${(vx(1) + vx(2)) / 2} ${GY - 80} ${vx(2) + 4} ${GY - 120}`} stroke="#070503" strokeWidth={4} fill="none" opacity={join} />
          )}
          {[0, 1, 2].map((i) => (
            <g key={i} opacity={join}>
              <Sil x={vx(i)} y={GY + 6} s={0.92} facing={turned ? -1 : 1} step={vWalk ? t * 0.2 + i : 0} tiltHead={turned ? -6 : 0} arms={0} />
            </g>
          ))}
          <Sil x={manX} y={manY} s={running ? 1.2 : 1.1} facing={running ? -1 : 1} step={manWalk ? t * 0.3 : running ? t * 0.62 : 0} tiltHead={-62 * look} arms={running ? 50 : 40 * look} />
          {/* a single leaf comes down out of the dark above him */}
          {look > 0.3 && !running && (
            <g transform={`translate(${manX + 30 + Math.sin(t * 0.12) * 14},${GY - 520 + ramp(t, runT - 2, runT + 30) * 330}) rotate(${Math.sin(t * 0.1) * 40})`} opacity={0.9}>
              <path d="M0 -12 Q10 0 0 14 Q-10 0 0 -12 Z" fill="#070503" />
            </g>
          )}
        </g>
        {/* the dark above: always there, and it creeps down the cloth when he looks up */}
        <rect x={0} y={0} width={W} height={760 + 520 * creep} fill="url(#pp-top)" opacity={0.7 + 0.3 * creep} />
      </g>
      {/* the edges of the cloth fall into black; the cloth goes dark at the end */}
      <rect width={W} height={H} fill="#030201" opacity={1 - dim} />
    </g>
  );
};

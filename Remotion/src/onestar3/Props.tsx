import React from "react";
import { fontFamily } from "../island/fonts";
import { PAL } from "../onestar1/Look";
import { ramp, smooth } from "./util";

// World-space props for the house and the other sets. They draw in the set's own coordinates and sit under or over the actors.

/** a soft contact shadow so a figure stands ON the floor */
export const Shadow: React.FC<{ x: number; y?: number; w?: number }> = ({ x, y = 1352, w = 150 }) => (
  <ellipse cx={x} cy={y} rx={w} ry={18} fill="#02030a" opacity={0.6} filter="url(#os3-d1)" />
);

/** a plain wooden chair for a seated figure; `dir` is the way the sitter faces (1 right, -1 left): the back is behind them */
export const Chair: React.FC<{ x: number; dir: 1 | -1 }> = ({ x, dir }) => (
  <g>
    <rect x={x - dir * 82} y={990} width={18} height={250} fill="#2a1e16" stroke="#0a0705" strokeWidth={2} />
    <rect x={x - dir * 92} y={980} width={38} height={24} rx={8} fill="#3a2a1e" />
    <rect x={x - 80} y={1214} width={160} height={24} rx={8} fill="#3a2a1e" stroke="#0a0705" strokeWidth={2} />
    <rect x={x - 80} y={1214} width={160} height={5} fill="#ffc27a" opacity={0.25} />
    <rect x={x - 70} y={1236} width={18} height={116} fill="#2a1e16" /><rect x={x + 52} y={1236} width={18} height={116} fill="#2a1e16" />
  </g>
);

/** a pale hand holding a key, reaching from her shoulder (sx, sy) to the lock; `dir` -1 means the lock is to the right of her: the key turns, then the hand returns */
export const KeyHand: React.FC<{ x: number; y: number; turn: number; g: number; click: number; dir: 1 | -1; sx: number; sy: number }> = ({ x, y, turn, g, click, dir, sx, sy }) => {
  const rot = -70 * smooth(turn);
  const ring = ramp(g, click, click + 24);
  return (
    <g>
      <line x1={sx} y1={sy} x2={x - dir * 40} y2={y} stroke="#8d96a8" strokeWidth={50} strokeLinecap="round" />
      <line x1={sx} y1={sy - 18} x2={x - dir * 40} y2={y - 18} stroke={PAL.rim} strokeWidth={3} opacity={0.4} />
      <g transform={`translate(${x},${y}) scale(${dir},1) translate(${-x},${-y})`}>
        <ellipse cx={x + 40} cy={y} rx={46} ry={40} fill="#aeb6c6" />
        {[-20, -6, 8, 22].map((o, i) => <rect key={i} x={x - 30} y={y + o - 7} width={64} height={14} rx={7} fill="#a0a9ba" />)}
        <g transform={`translate(${x - 30},${y - 4}) rotate(${rot})`}>
          <rect x={-120} y={-5} width={126} height={10} rx={5} fill="#c9b27a" />
          <rect x={-120} y={-5} width={126} height={3} fill="#fff" opacity={0.35} />
          <rect x={-120} y={-5} width={12} height={24} fill="#c9b27a" /><rect x={-98} y={-5} width={10} height={16} fill="#c9b27a" />
          <circle cx={12} cy={0} r={20} fill="none" stroke="#c9b27a" strokeWidth={7} />
        </g>
      </g>
      {ring > 0 && ring < 1 && <ellipse cx={x + dir * 182} cy={y} rx={20 + ring * 90} ry={20 + ring * 90} fill="none" stroke="#cfe0ff" strokeWidth={4} opacity={0.7 * (1 - ring)} />}
    </g>
  );
};

/** her phone on her lap: first the rating screen (a row of stars), after the star moves it shows the number 3 */
export const LapPhone: React.FC<{ g: number; x: number; y: number; threeAt: number; moveAt: number }> = ({ g, x, y, threeAt, moveAt }) => {
  const on = ramp(g, threeAt - 20, threeAt + 8);
  const after = g >= moveAt;
  return (
    <g opacity={on} transform={`translate(${x},${y}) rotate(-12) scale(0.75)`}>
      <ellipse cx={0} cy={20} rx={170} ry={120} fill={after ? "#f2c230" : "#6fa8ff"} opacity={0.28} filter="url(#os3-d2)" />
      <rect x={-52} y={-84} width={104} height={168} rx={14} fill="#05070d" stroke={PAL.rim} strokeWidth={3} />
      <rect x={-45} y={-76} width={90} height={152} rx={9} fill={after ? "#2a2208" : "#0f2250"} />
      {after ? (
        <g fontFamily={fontFamily} textAnchor="middle"><text x={0} y={-6} fontSize={26} fill={PAL.accent}>ถึงใน</text><text x={0} y={36} fontSize={44} fill={PAL.accent}>3</text><text x={0} y={62} fontSize={16} fill={PAL.rim}>นาที</text></g>
      ) : (
        Array.from({ length: 5 }, (_, i) => <circle key={i} cx={-32 + i * 16} cy={0} r={5} fill={i === 0 ? "#4a5f8e" : "#223a68"} />)
      )}
    </g>
  );
};

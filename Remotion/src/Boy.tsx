import React from "react";

// Side-view boy facing right. Origin (0,0) = ground contact point under the body.
// SVG rotation: positive = clockwise, so "forward" swing of a hanging limb is NEGATIVE.
const SKIN = "#f2c19b";
const SHIRT = "#e86a4a";
const PANTS = "#3b4a7a";
const SHOE = "#2a2a2a";
const HAIR = "#2b1d17";
const HIP_Y = -116;

export type BoyProps = {
  x: number;
  y: number;
  scale?: number;
  /** walk-cycle phase in radians */
  phase: number;
  /** 0 = standing idle, 1 = full walk */
  walk: number;
  /** head tilt in degrees, negative = look up */
  headTilt?: number;
  /** 0..1 raises the front arm and waves */
  wave?: number;
  /** frame number, used for idle breathing and waving */
  frame: number;
  smile?: number;
};

const Leg: React.FC<{ thigh: number; knee: number }> = ({ thigh, knee }) => (
  <g transform={`rotate(${thigh})`}>
    <rect x={-10} y={-4} width={20} height={58} rx={10} fill={PANTS} />
    <g transform={`translate(0,52) rotate(${knee})`}>
      <rect x={-9} y={-2} width={18} height={56} rx={9} fill={PANTS} />
      <rect x={-10} y={50} width={32} height={14} rx={7} fill={SHOE} />
    </g>
  </g>
);

const Arm: React.FC<{ shoulder: number; elbow: number; sleeve?: boolean }> = ({ shoulder, elbow }) => (
  <g transform={`rotate(${shoulder})`}>
    <rect x={-8} y={-4} width={16} height={46} rx={8} fill={SHIRT} />
    <g transform={`translate(0,40) rotate(${elbow})`}>
      <rect x={-7} y={-2} width={14} height={40} rx={7} fill={SKIN} />
      <circle cx={0} cy={40} r={9} fill={SKIN} />
    </g>
  </g>
);

export const Boy: React.FC<BoyProps> = ({ x, y, scale = 1.5, phase, walk, headTilt = 0, wave = 0, frame, smile = 0 }) => {
  const p = phase;
  const w = walk;
  const thighA = -28 * w * Math.sin(p);
  const kneeA = 42 * w * Math.max(0, Math.cos(p));
  const thighB = -28 * w * Math.sin(p + Math.PI);
  const kneeB = 42 * w * Math.max(0, Math.cos(p + Math.PI));
  const bob = -6 * w * Math.abs(Math.cos(p)) + Math.sin(frame * 0.09) * 1.2 * (1 - w);
  const lean = 4 * w;
  const frontArmWalk = 22 * w * Math.sin(p);
  const backArm = -22 * w * Math.sin(p);
  const frontArm = frontArmWalk * (1 - wave) + (-125 + 14 * Math.sin(frame * 0.45)) * wave;
  const frontElbow = -14 * (1 - wave) + (-20 + 18 * Math.sin(frame * 0.45 + 1)) * wave;
  const mouthCurve = 6 + smile * 8;

  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      {/* soft ground shadow */}
      <ellipse cx={4} cy={4} rx={52} ry={9} fill="#000" opacity={0.28} />
      <g transform={`translate(0,${bob})`}>
        <g transform={`translate(0,${HIP_Y})`}>
          <g style={{ filter: "brightness(0.78)" }}>
            <g transform={`translate(0,-66) rotate(${backArm})`}>
              <Arm shoulder={0} elbow={-14} />
            </g>
            <Leg thigh={thighB} knee={kneeB} />
          </g>
          <g transform={`rotate(${lean})`}>
            <rect x={-25} y={-82} width={50} height={92} rx={22} fill={SHIRT} />
            <rect x={-25} y={-4} width={50} height={14} rx={7} fill={PANTS} />
          </g>
          <Leg thigh={thighA} knee={kneeA} />
          {/* head */}
          <g transform={`translate(${lean * 0.6},-84) rotate(${headTilt})`}>
            <rect x={-9} y={-6} width={18} height={20} rx={8} fill={SKIN} />
            <g transform="translate(2,-36)">
              <circle r={36} fill={SKIN} />
              <circle cx={-6} cy={6} r={6} fill="#e0a982" />
              <path d="M-37 -4 A37 37 0 0 1 37 -4 Q14 -26 -6 -16 Q-24 -9 -37 -4 Z" fill={HAIR} />
              <circle cx={17} cy={-2} r={3.6} fill="#1b1b1b" />
              <circle cx={18.2} cy={-3.2} r={1.1} fill="#fff" />
              <circle cx={22} cy={12} r={5} fill="#f08a7a" opacity={0.45} />
              <path d={`M8 13 Q16 ${13 + mouthCurve} 25 12`} stroke="#8a4a3a" strokeWidth={2.6} fill="none" strokeLinecap="round" />
            </g>
          </g>
          <g transform="translate(0,-66)">
            <Arm shoulder={frontArm} elbow={frontElbow} />
          </g>
        </g>
      </g>
    </g>
  );
};

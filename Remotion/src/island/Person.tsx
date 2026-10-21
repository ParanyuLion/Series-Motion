import React from "react";
import { CAST, CastId, CastMember } from "./cast";
import { fontFamily } from "./fonts";

// Side-on rigged person. Origin (0,0) is the ground point under the feet.
// SVG rotation is clockwise-positive, so a limb swinging FORWARD (toward +x) rotates NEGATIVELY.
const HIP_Y = -116;
const GRIME = "#3a342b";

export type PersonProps = {
  id: CastId;
  x: number;
  y: number;
  scale?: number;
  /** walk-cycle phase in radians */
  phase: number;
  /** 0 idle .. 1 full walk */
  walk: number;
  frame: number;
  /** 0..1: darkens the costume, tears it past 0.5 */
  dirt?: number;
  facing?: 1 | -1;
  pose?: "stand" | "point" | "sit" | "lie";
  /** head tilt in degrees, negative = look up */
  headTilt?: number;
  /** draw the Thai name tag above the head */
  label?: boolean;
  /** keep the name tag's x inside [min, max] (e.g. clear of the platform UI on the right edge) */
  labelClamp?: [number, number];
};

const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
export const mix = (a: string, b: string, t: number) => {
  const [r1, g1, b1] = hex(a);
  const [r2, g2, b2] = hex(b);
  const f = (x: number, y: number) => Math.round(x + (y - x) * t).toString(16).padStart(2, "0");
  return `#${f(r1, r2)}${f(g1, g2)}${f(b1, b2)}`;
};

type Look = { skin: string; top: string; bottom: string; shoe: string };

const Leg: React.FC<{ thigh: number; knee: number; look: Look; bare: boolean }> = ({ thigh, knee, look, bare }) => (
  <g transform={`rotate(${thigh})`}>
    <rect x={-10} y={-4} width={20} height={58} rx={10} fill={bare ? look.skin : look.bottom} />
    <g transform={`translate(0,52) rotate(${knee})`}>
      <rect x={-9} y={-2} width={18} height={56} rx={9} fill={bare ? look.skin : look.bottom} />
      <rect x={-10} y={50} width={32} height={14} rx={7} fill={look.shoe} />
    </g>
  </g>
);

const Arm: React.FC<{ shoulder: number; elbow: number; look: Look; sleeve: number }> = ({ shoulder, elbow, look, sleeve }) => (
  <g transform={`rotate(${shoulder})`}>
    <rect x={-8} y={-4} width={16} height={46} rx={8} fill={look.skin} />
    {sleeve > 0 && <rect x={-8} y={-4} width={16} height={Math.min(46, sleeve) + 4} rx={8} fill={look.top} />}
    <g transform={`translate(0,40) rotate(${elbow})`}>
      <rect x={-7} y={-2} width={14} height={40} rx={7} fill={look.skin} />
      <circle cx={0} cy={40} r={9} fill={look.skin} />
    </g>
  </g>
);

const Head: React.FC<{ c: CastMember; tilt: number }> = ({ c, tilt }) => {
  const has = (a: string) => c.accessories.includes(a as never);
  return (
    <g transform={`translate(0,-84) rotate(${tilt})`}>
      {has("longHair") && <path d="M-34 -36 Q-46 20 -30 56 L2 50 L2 -30 Z" fill={c.hair} />}
      <rect x={-9} y={-6} width={18} height={20} rx={8} fill={c.skin} />
      <g transform="translate(2,-36)">
        {has("bun") && <circle cx={-14} cy={-34} r={13} fill={c.hair} />}
        <circle r={36} fill={c.skin} />
        <circle cx={-6} cy={6} r={6} fill={mix(c.skin, "#000000", 0.12)} />
        {has("bald") ? (
          <path d="M-36 -4 Q-37 -10 -30 -16 L-30 -2 Z" fill={c.hair} />
        ) : (
          <path d="M-37 -4 A37 37 0 0 1 37 -4 Q14 -26 -6 -16 Q-24 -9 -37 -4 Z" fill={c.hair} />
        )}
        {has("cap") && (
          <g>
            <path d="M-38 -8 A38 38 0 0 1 38 -8 Z" fill={c.accent ?? "#e84a4a"} />
            <path d="M20 -14 L58 -6 L56 0 L18 -4 Z" fill={mix(c.accent ?? "#e84a4a", "#000000", 0.25)} />
          </g>
        )}
        {has("shadesOnHead") && <rect x={-10} y={-34} width={34} height={7} rx={3} fill="#222" />}
        {has("beard") && <path d="M-34 4 Q-30 44 2 46 Q34 44 36 2 Q26 22 2 20 Q-22 22 -34 4 Z" fill={c.hair} />}
        <circle cx={17} cy={-2} r={3.6} fill="#1b1b1b" />
        <circle cx={18.2} cy={-3.2} r={1.1} fill="#fff" />
        <path d={`M8 ${has("beard") ? 16 : 13} Q16 ${has("beard") ? 18 : 15} 25 ${has("beard") ? 16 : 13}`} stroke="#8a4a3a" strokeWidth={2.6} fill="none" strokeLinecap="round" />
        {has("glasses") && <g stroke="#222" strokeWidth={2.4} fill="none"><circle cx={17} cy={-2} r={9} /><path d="M8 -2 L-6 -4" /></g>}
        {has("shades") && <rect x={6} y={-9} width={26} height={11} rx={4} fill="#111" />}
      </g>
    </g>
  );
};

export const Person: React.FC<PersonProps> = ({ id, x, y, scale = 1.5, phase, walk, frame, dirt = 0, facing = 1, pose = "stand", headTilt = 0, label = false, labelClamp }) => {
  const c = CAST[id];
  const has = (a: string) => c.accessories.includes(a as never);
  const k = scale * (c.legLength / 108);
  const g = Math.min(1, Math.max(0, dirt)) * 0.65;
  const look: Look = { skin: c.skin, top: mix(c.top, GRIME, g), bottom: mix(c.bottom, GRIME, g), shoe: mix(c.shoe, GRIME, g) };
  const w = walk;
  const p = phase;

  let thighA = -28 * w * Math.sin(p);
  let kneeA = 42 * w * Math.max(0, Math.cos(p));
  let thighB = -28 * w * Math.sin(p + Math.PI);
  let kneeB = 42 * w * Math.max(0, Math.cos(p + Math.PI));
  let frontArm = 22 * w * Math.sin(p);
  let backArm = -22 * w * Math.sin(p);
  let frontElbow = -14;
  let bob = -6 * w * Math.abs(Math.cos(p)) + Math.sin(frame * 0.09) * 1.2 * (1 - w);
  let lift = 0;
  let tilt = headTilt;
  if (pose === "point") { frontArm = -85; frontElbow = -4; }
  if (pose === "sit") { thighA = -90; thighB = -90; kneeA = 0; kneeB = 0; frontArm = -20; backArm = -10; lift = 106; bob = 0; }
  if (pose === "lie") { frontArm = 18; backArm = 10; frontElbow = -6; bob = 0; }
  const lean = 4 * w;
  const bodyW = c.width;
  const shoulderY = -(c.torso - 26);
  const bodyTop = -(c.torso - 10);
  const dress = has("dress");

  const outer = `translate(${x},${y}) scale(${facing * k},${k}) ${pose === "lie" ? "rotate(-90) translate(0,-30)" : ""}`;
  const labelY = pose === "lie" ? y - 120 * k : y - 300 * k;

  return (
    <g>
      <g transform={outer}>
        <ellipse cx={4} cy={4} rx={pose === "lie" ? 90 : 52} ry={9} fill="#000" opacity={0.28} transform={pose === "lie" ? "rotate(90) translate(0,0)" : ""} />
        <g transform={`translate(0,${bob + lift})`}>
          <g transform={`translate(0,${HIP_Y})`}>
            <g style={{ filter: "brightness(0.78)" }}>
              <g transform={`translate(0,${shoulderY}) rotate(${backArm})`}>
                <Arm shoulder={0} elbow={-14} look={look} sleeve={c.sleeve} />
              </g>
              <Leg thigh={thighB} knee={kneeB} look={look} bare={dress} />
            </g>
            {has("backpack") && <rect x={-bodyW / 2 - 16} y={bodyTop + 10} width={22} height={64} rx={9} fill={c.accent ?? "#2d3a52"} />}
            <g transform={`rotate(${lean})`}>
              {dress ? (
                <path d={`M${-bodyW / 2} ${bodyTop + 6} Q${-bodyW / 2} ${bodyTop} ${-bodyW / 2 + 12} ${bodyTop} L${bodyW / 2 - 12} ${bodyTop} Q${bodyW / 2} ${bodyTop} ${bodyW / 2} ${bodyTop + 6} L${bodyW / 2 + 18} 66 Q0 76 ${-bodyW / 2 - 18} 66 Z`} fill={look.top} />
              ) : (
                <>
                  <rect x={-bodyW / 2} y={bodyTop} width={bodyW} height={c.torso} rx={22} fill={look.top} />
                  <rect x={-bodyW / 2} y={-8} width={bodyW} height={18} rx={8} fill={look.bottom} />
                </>
              )}
              {has("belly") && <ellipse cx={bodyW / 2 - 4} cy={-14} rx={22} ry={26} fill={look.top} />}
              {has("tie") && <path d={`M${bodyW / 2 - 6} ${bodyTop + 4} l8 10 -5 46 -3 5 -3 -5 -3 -46 z`} fill="#7a1f2a" />}
              {g > 0.32 && (
                <path d={dress ? `M${-bodyW / 2 - 18} 66 l8 12 6 -12 8 14 7 -14 9 12 8 -12 10 13 8 -13 10 12 8 -12` : `M${-bodyW / 2} 6 l7 11 7 -11 7 11 7 -11`} fill={dress ? look.skin : GRIME} opacity={dress ? 0.9 : 0.8} />
              )}
            </g>
            <Leg thigh={thighA} knee={kneeA} look={look} bare={dress} />
            <g transform={`translate(${lean * 0.6},0)`}>
              <Head c={c} tilt={tilt} />
            </g>
            <g transform={`translate(0,${shoulderY})`}>
              <Arm shoulder={frontArm} elbow={frontElbow} look={look} sleeve={c.sleeve} />
            </g>
          </g>
        </g>
      </g>
      {label && (
        <g transform={`translate(${labelClamp ? Math.min(labelClamp[1], Math.max(labelClamp[0], x)) : x},${labelY})`}>
          <rect x={-(c.name.length * 8 + 22)} y={-24} width={c.name.length * 16 + 44} height={42} rx={21} fill="#0b0d10" opacity={0.7} />
          <text x={0} y={7} textAnchor="middle" fontFamily={fontFamily} fontSize={26} fill="#f1f1f1">{c.name}</text>
        </g>
      )}
    </g>
  );
};

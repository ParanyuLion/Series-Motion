import React from "react";
import { fontFamily } from "../island/fonts";
import { mix } from "../island/Person";
import { PASSENGERS, PassengerData, PassengerId } from "./cast";

// Side-on rigged passenger, adapted from src/island/Person.tsx (read it for the swing maths).
// Origin (0,0) is the ground point under the feet. SVG rotation is clockwise-positive, so a limb swinging
// FORWARD (toward +x) rotates NEGATIVELY. The bite is NOT drawn here: it is an effect in the composition.
const HIP_Y = -116;
const ZOMBIE_SKIN = "#a9b996";
const PALE = "#d9cdb4";
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export type PassengerProps = {
  id: PassengerId;
  x: number;
  y: number;
  scale?: number;
  facing?: 1 | -1;
  /** walk-cycle phase in radians */
  phase: number;
  /** 0 idle .. 1 full walk (for "shamble" this is the shuffle amount) */
  walk: number;
  frame: number;
  /** 0 healthy, about 0.4 pale and sweaty, about 0.8 veined, 1 turned */
  infection?: number;
  pose?: "stand" | "sit" | "hold" | "shamble" | "fall";
  headTilt?: number;
  label?: boolean;
  /** 0..1: wide eyes, hands up */
  fear?: number;
  /** 0..1: opacity of a small red bite mark on the front fingertip (no blood) */
  mark?: number;
  /** something held in the front hand */
  item?: "umbrella" | "extinguisher" | "bag" | null;
  /** phase in radians: the front arm swings from -150 to -20 degrees (jab, spray or swing); undefined = off */
  swing?: number;
  /** size of the swing in degrees around the forward position (default 65) */
  swingAmp?: number;
};

type Look = { skin: string; top: string; bottom: string; shoe: string };

const skinAt = (skin: string, inf: number) => {
  const a = clamp01(inf / 0.5);
  const b = clamp01((inf - 0.5) / 0.5);
  return mix(mix(skin, PALE, a * 0.8), ZOMBIE_SKIN, b);
};

const Leg: React.FC<{ thigh: number; knee: number; look: Look }> = ({ thigh, knee, look }) => (
  <g transform={`rotate(${thigh})`}>
    <rect x={-10} y={-4} width={20} height={58} rx={10} fill={look.bottom} />
    <g transform={`translate(0,52) rotate(${knee})`}>
      <rect x={-9} y={-2} width={18} height={56} rx={9} fill={look.bottom} />
      <rect x={-10} y={50} width={32} height={14} rx={7} fill={look.shoe} />
    </g>
  </g>
);

const Item: React.FC<{ kind: "umbrella" | "extinguisher" | "bag" }> = ({ kind }) => {
  if (kind === "umbrella") {
    return (
      <g>
        <rect x={-4} y={-24} width={8} height={150} rx={4} fill="#23262b" />
        <path d="M-3 28 Q-19 66 -4 108 L4 108 Q19 66 3 28 Z" fill="#d9534f" />
        <path d="M-4 118 L0 142 L4 118 Z" fill="#8a8f94" />
        <path d="M-4 -24 q0 -16 -14 -16" stroke="#23262b" strokeWidth={7} fill="none" strokeLinecap="round" />
      </g>
    );
  }
  if (kind === "extinguisher") {
    // the cylinder stands upright when the arm points forward (local +x is world up), the nozzle points forward
    return (
      <g>
        <rect x={-46} y={-18} width={96} height={36} rx={14} fill="#d9322b" />
        <rect x={-6} y={-18} width={14} height={36} fill="#f1f1f1" opacity={0.85} />
        <rect x={48} y={-8} width={18} height={16} rx={4} fill="#2a2e33" />
        <path d="M64 0 Q76 6 70 34 L68 52" stroke="#2a2e33" strokeWidth={7} fill="none" strokeLinecap="round" />
      </g>
    );
  }
  return (
    <g>
      <path d="M0 0 L-6 44" stroke="#3a2a1c" strokeWidth={5} fill="none" />
      <rect x={-34} y={40} width={62} height={52} rx={14} fill="#b5651d" />
      <rect x={-34} y={52} width={62} height={8} fill="#7a410f" />
    </g>
  );
};

const Arm: React.FC<{ shoulder: number; elbow: number; look: Look; sleeve: number; mark?: number; item?: "umbrella" | "extinguisher" | "bag" | null }> = ({ shoulder, elbow, look, sleeve, mark = 0, item = null }) => (
  <g transform={`rotate(${shoulder})`}>
    <rect x={-8} y={-4} width={16} height={46} rx={8} fill={look.skin} />
    {sleeve > 0 && <rect x={-8} y={-4} width={16} height={Math.min(46, sleeve) + 4} rx={8} fill={look.top} />}
    <g transform={`translate(0,40) rotate(${elbow})`}>
      <rect x={-7} y={-2} width={14} height={40} rx={7} fill={look.skin} />
      {sleeve > 60 && <rect x={-7} y={-2} width={14} height={Math.min(34, sleeve - 46)} rx={7} fill={look.top} />}
      <circle cx={0} cy={40} r={9} fill={look.skin} />
      {mark > 0 && <circle cx={0} cy={47} r={5} fill="#a83a34" opacity={mark} />}
      {item && <g transform="translate(0,40)"><Item kind={item} /></g>}
    </g>
  </g>
);

const Head: React.FC<{ c: PassengerData; skin: string; tilt: number; inf: number; fear: number; frame: number }> = ({ c, skin, tilt, inf, fear, frame }) => {
  const has = (a: string) => c.accessories.includes(a as never);
  const turned = inf > 0.85;
  const blink = Math.max(0, 1 - Math.abs(((frame % 140) - 5) / 2.5));
  const eyeR = (3.6 + fear * 1.8) * (1 - blink * 0.8);
  return (
    <g transform={`translate(0,-84) rotate(${tilt})`}>
      <rect x={-9} y={-6} width={18} height={20} rx={8} fill={skin} />
      <g transform="translate(2,-36)">
        {has("bun") && <circle cx={-14} cy={-34} r={13} fill={c.hair} />}
        <circle r={36} fill={skin} />
        <circle cx={-6} cy={6} r={6} fill={mix(skin, "#000000", 0.12)} />
        {has("bald") ? (
          <path d="M-36 -4 Q-37 -10 -30 -16 L-30 -2 Z" fill={c.hair} />
        ) : (
          <path d="M-37 -4 A37 37 0 0 1 37 -4 Q14 -26 -6 -16 Q-24 -9 -37 -4 Z" fill={c.hair} />
        )}
        {has("cap") && (
          <g>
            <path d="M-38 -8 A38 38 0 0 1 38 -8 Z" fill={c.accent ?? "#d9534f"} />
            <path d="M20 -14 L58 -6 L56 0 L18 -4 Z" fill={mix(c.accent ?? "#d9534f", "#000000", 0.25)} />
          </g>
        )}
        {inf > 0.55 && <path d="M-4 -14 q5 7 2 14 M12 -20 q-5 8 -1 16 M24 -8 q-5 6 -2 12" stroke="#4a6a4a" strokeWidth={2.2} fill="none" opacity={clamp01((inf - 0.55) / 0.3) * 0.85} />}
        {turned ? (
          <g>
            <ellipse cx={17} cy={-2} rx={6.5} ry={7.5} fill="#1b1f1c" />
            <circle cx={18} cy={-3} r={2} fill="#dfe6c8" />
            <ellipse cx={21} cy={17} rx={6} ry={7} fill="#2a1414" />
          </g>
        ) : (
          <g>
            <circle cx={17} cy={-2} r={eyeR} fill="#1b1b1b" />
            <circle cx={18.2} cy={-3.2} r={1.1} fill="#fff" />
            <path d={`M8 13 Q17 ${15 - fear * 6} 26 13`} stroke="#8a4a3a" strokeWidth={2.6} fill="none" strokeLinecap="round" />
            {inf > 0.25 && inf < 0.75 && <path d="M26 -14 q4 7 0 12" stroke="#9ad0ff" strokeWidth={3} fill="none" strokeLinecap="round" />}
          </g>
        )}
        {has("glasses") && <g stroke="#222" strokeWidth={2.4} fill="none"><circle cx={17} cy={-2} r={9} /><path d="M8 -2 L-6 -4" /></g>}
      </g>
    </g>
  );
};

export const Passenger: React.FC<PassengerProps> = ({ id, x, y, scale = 1.3, facing = 1, phase, walk, frame, infection = 0, pose = "stand", headTilt = 0, label = false, fear = 0, mark = 0, item = null, swing, swingAmp = 65 }) => {
  const c = PASSENGERS[id];
  const has = (a: string) => c.accessories.includes(a as never);
  const k = scale * (c.height / 108);
  const skin = skinAt(c.skin, infection);
  const look: Look = { skin, top: c.top, bottom: c.bottom, shoe: c.shoe };
  const w = walk;
  const p = phase;

  let thighA = -28 * w * Math.sin(p);
  let kneeA = 42 * w * Math.max(0, Math.cos(p));
  let thighB = -28 * w * Math.sin(p + Math.PI);
  let kneeB = 42 * w * Math.max(0, Math.cos(p + Math.PI));
  let frontArm = 22 * w * Math.sin(p) - fear * 100;
  let backArm = -22 * w * Math.sin(p) - fear * 80;
  let frontElbow = -14 - fear * 30;
  let bob = -6 * w * Math.abs(Math.cos(p)) + Math.sin(frame * 0.09) * 1.2 * (1 - w);
  let lift = 0;
  let lean = 4 * w;
  let tilt = headTilt;
  if (pose === "sit") { thighA = -90; thighB = -90; kneeA = 90; kneeB = 90; frontArm = -20; backArm = -10; lift = 56; bob = 0; }
  if (pose === "hold") { frontArm = -150; frontElbow = -8; }
  if (pose === "shamble") {
    // slow zombie walk: both arms forward, head tilted, a short shuffle at about a third of walking speed
    const s = Math.sin(p * 0.35);
    thighA = -16 * w * s; thighB = 16 * w * s;
    kneeA = 14 * w * Math.max(0, Math.cos(p * 0.35)); kneeB = 14 * w * Math.max(0, -Math.cos(p * 0.35));
    frontArm = -62 + 6 * Math.sin(frame * 0.07); backArm = -56 + 6 * Math.sin(frame * 0.07 + 1); frontElbow = -8;
    bob = Math.sin(frame * 0.07) * 3; lean = 9; tilt = 15 + Math.sin(frame * 0.05) * 4;
  }
  if (swing !== undefined) { frontArm = -85 - swingAmp * Math.sin(swing); frontElbow = -10; lean = 10; }
  const bodyW = c.width;
  const torso = 92;
  const shoulderY = -(torso - 26);
  const bodyTop = -(torso - 10);
  const labelText = c.name;
  const outer = `translate(${x},${y}) scale(${facing * k},${k}) ${pose === "fall" ? "rotate(-90) translate(0,-30)" : ""}`;
  const labelY = pose === "fall" ? y - 120 * k : y - 300 * k;

  return (
    <g>
      <g transform={outer}>
        <defs>
          <filter id="pa-blur" x="-50%" y="-200%" width="200%" height="500%"><feGaussianBlur stdDeviation="5" /></filter>
        </defs>
        <g transform={pose === "fall" ? "rotate(90)" : ""}>
          <ellipse cx={-26 * facing} cy={6} rx={pose === "fall" ? 110 : 64} ry={9} fill="#000" opacity={0.25} filter="url(#pa-blur)" />
        </g>
        <g transform={`translate(0,${bob + lift})`}>
          <g transform={`translate(0,${HIP_Y})`}>
            <g style={{ filter: "brightness(0.8)" }}>
              <g transform={`translate(0,${shoulderY}) rotate(${backArm})`}>
                <Arm shoulder={0} elbow={-14} look={look} sleeve={c.sleeve} />
              </g>
              <Leg thigh={thighB} knee={kneeB} look={look} />
            </g>
            {has("backpack") && <rect x={-bodyW / 2 - 18} y={bodyTop + 8} width={24} height={70} rx={10} fill={c.pack ?? c.accent ?? "#2d3a52"} />}
            <g transform={`rotate(${lean})`}>
              <rect x={-bodyW / 2} y={bodyTop} width={bodyW} height={torso} rx={22} fill={look.top} />
              <rect x={-bodyW / 2} y={-8} width={bodyW} height={18} rx={8} fill={look.bottom} />
              {has("belly") && <ellipse cx={bodyW / 2 - 4} cy={-14} rx={22} ry={26} fill={look.top} />}
              {id === "you" && has("tie") && <path d={`M${bodyW / 2 - 6} ${bodyTop + 4} l9 10 -6 52 -3 6 -3 -6 -6 -52 z`} fill={c.accent} />}
              {has("lanyard") && (
                <g>
                  <path d={`M${bodyW / 2 - 14} ${bodyTop + 2} L${bodyW / 2 - 4} ${bodyTop + 52}`} stroke="#e84a4a" strokeWidth={3} />
                  <rect x={bodyW / 2 - 12} y={bodyTop + 50} width={14} height={18} rx={2} fill="#fff" stroke="#999" />
                </g>
              )}
            </g>
            <Leg thigh={thighA} knee={kneeA} look={look} />
            <g transform={`translate(${lean * 0.6},0)`}>
              <Head c={c} skin={skin} tilt={tilt} inf={infection} fear={fear} frame={frame} />
            </g>
            <g transform={`translate(0,${shoulderY})`}>
              <Arm shoulder={frontArm} elbow={frontElbow} look={look} sleeve={c.sleeve} mark={mark} item={item} />
            </g>
          </g>
        </g>
      </g>
      {label && labelText && (
        <g transform={`translate(${x},${labelY})`}>
          <rect x={-(labelText.length * 8 + 22)} y={-24} width={labelText.length * 16 + 44} height={42} rx={21} fill="#0b0d10" opacity={0.72} />
          <text x={0} y={7} textAnchor="middle" fontFamily={fontFamily} fontSize={26} fill="#f1f1f1">{labelText}</text>
        </g>
      )}
    </g>
  );
};

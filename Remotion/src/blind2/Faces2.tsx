import React from "react";
import { PASSENGERS, PassengerId } from "../bts/cast";
import { SnakeTile } from "../bts/SnakeTile";

const W = 1080;
const H = 1920;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ramp = (g: number, a: number, b: number) => clamp01((g - a) / Math.max(1, b - a));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);

const Shade: React.FC<{ id: string }> = ({ id }) => (
  <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stopColor="#0b0e0a" stopOpacity={0} />
    <stop offset="0.35" stopColor="#0b0e0a" stopOpacity={0.8} />
    <stop offset="1" stopColor="#0b0e0a" stopOpacity={0.95} />
  </linearGradient>
);

/** a hand: palm and four fingers, pointing right at angle 0 (the caller rotates it) */
const Hand: React.FC<{ skin: string; curl?: number }> = ({ skin, curl = 0 }) => (
  <g fill={skin} stroke="#00000022" strokeWidth={2} strokeLinecap="round">
    <ellipse cx={0} cy={0} rx={44} ry={34} />
    {[-22, -8, 6, 20].map((fy, i) => (
      <path key={i} d={`M30 ${fy} q${34 - curl * 14} ${-2 + curl * 10} ${50 - curl * 24} ${fy * 0.2 + curl * 14}`} stroke={skin} strokeWidth={15} fill="none" />
    ))}
    <path d="M-10 -26 q14 -26 38 -30" stroke={skin} strokeWidth={16} fill="none" />
  </g>
);

/**
 * "you" at the table, face on and small, with a woman's hand taking yours and placing it on the bowl:
 * her movement is exact and unhesitating, "you" never look down (the pupils stay straight ahead).
 */
export const HandGuide: React.FC<{ g: number; from: number; to: number }> = ({ g, from, to }) => {
  const k = PASSENGERS.bvYou;
  const w = PASSENGERS.bvWoman;
  const p = smooth(ramp(g, from + 14, to - 14));
  // your hand rests on the table at the left, her hand arrives from the right, takes it, then both move to the bowl
  const arrive = smooth(ramp(g, from + 6, from + 30));
  const bowl = { x: 560, y: 1130 };
  const mine = { x: lerp(240, bowl.x - 95, p), y: lerp(1230, bowl.y - 12, p) };
  const hers = { x: lerp(1040, mine.x + 150, arrive), y: lerp(1010, mine.y - 40, arrive) };
  const sway = Math.sin(g * 0.09) * 0.8;
  const blink = Math.max(0, 1 - Math.abs(((g % 84) - 30) / 3));
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
      <defs>
        <linearGradient id="hg-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7d7a62" /><stop offset="1" stopColor="#2a251b" /></linearGradient>
        <Shade id="hg-shade" />
      </defs>
      <rect width={W} height={H} fill="url(#hg-bg)" />
      {/* the head of "you", face on, looking straight ahead */}
      <g transform={`translate(540,420) scale(1.75) rotate(${sway})`}>
        <path d="M-210 330 Q-190 200 -90 176 L90 176 Q190 200 210 330 Z" fill="#7d8a8f" />
        <rect x={-34} y={96} width={68} height={92} rx={26} fill={k.skin} />
        <ellipse cx={-96} cy={4} rx={13} ry={22} fill={k.skin} />
        <ellipse cx={96} cy={4} rx={13} ry={22} fill={k.skin} />
        <ellipse cx={0} cy={0} rx={92} ry={108} fill={k.skin} />
        <path d="M-94 -14 Q-100 -118 0 -120 Q100 -118 94 -14 Q74 -86 0 -88 Q-74 -86 -94 -14 Z" fill={k.hair} />
        <path d="M-62 -40 Q-44 -52 -26 -42 M26 -42 Q44 -52 62 -40" stroke="#1b1b1b" strokeWidth={6} fill="none" strokeLinecap="round" transform="translate(0,-14)" />
        {[-44, 44].map((ex) => (
          <g key={ex} transform={`translate(${ex},-14)`}>
            <ellipse rx={25} ry={25 * (1 - blink * 0.9)} fill="#fff" stroke="#8a8a8a" strokeWidth={2} />
            <circle cx={0} cy={1} r={10} fill="#1b1b1b" />
            <circle cx={3} cy={-3} r={3.2} fill="#fff" />
          </g>
        ))}
        <path d="M0 -4 Q-8 24 -6 34 Q0 38 8 34" stroke="#b98a68" strokeWidth={4} fill="none" strokeLinecap="round" />
        <path d="M-24 66 Q0 62 24 66" stroke="#8a3a30" strokeWidth={6} fill="none" strokeLinecap="round" />
      </g>
      {/* the table, the bowl, the pattern cup */}
      <rect x={0} y={960} width={W} height={960} fill="#5b4328" />
      <rect x={0} y={960} width={W} height={14} fill="#7a5a3a" />
      <g transform={`translate(${bowl.x},${bowl.y})`}>
        <ellipse cx={0} cy={26} rx={150} ry={24} fill="#000" opacity={0.3} />
        <path d="M-130 -10 Q-130 100 0 104 Q130 100 130 -10 Z" fill="#8e7f64" stroke="#5b503b" strokeWidth={5} />
        <ellipse cx={0} cy={-10} rx={130} ry={26} fill="#d8d2bd" />
        <path d="M-90 -12 Q0 -70 90 -12 Z" fill="#ebe7d5" />
      </g>
      <g transform="translate(920,1090)">
        <path d="M-40 -110 L40 -110 L32 0 L-32 0 Z" fill="#b49340" stroke="#7a643a" strokeWidth={3} />
        <g transform="translate(0,-55)"><SnakeTile size={62} /></g>
      </g>
      {/* her arm, with the sleeve in the pattern's colour, and her hand over yours */}
      <path d={`M1200 ${hers.y - 200} L${hers.x + 60} ${hers.y - 8}`} stroke="#b49340" strokeWidth={110} strokeLinecap="round" />
      <g transform={`translate(${mine.x},${mine.y}) rotate(-8) scale(1.5)`}><Hand skin={k.skin} curl={0.3} /></g>
      <g transform={`translate(${hers.x},${hers.y}) rotate(188) scale(1.5)`}><Hand skin={w.skin} /></g>
      <rect y={1340} width={W} height={580} fill="url(#hg-shade)" />
    </svg>
  );
};

const STARE_IDS: PassengerId[] = ["bvCook", "bvMan", "bvElder", "bvWoman", "bvChild"];

/** several villagers' faces side by side, clouded eyes, turning toward the camera together and turning away again */
export const Stare: React.FC<{ g: number; from: number; to: number }> = ({ g, from, to }) => {
  const inT = smooth(ramp(g, from, from + 12));
  const outT = smooth(ramp(g, to - 12, to));
  const face = inT * (1 - outT);
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
      <defs>
        <linearGradient id="st-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6a6a52" /><stop offset="1" stopColor="#1d2018" /></linearGradient>
        <Shade id="st-shade" />
      </defs>
      <rect width={W} height={H} fill="url(#st-bg)" />
      {STARE_IDS.map((id, i) => {
        const k = PASSENGERS[id];
        const x = 100 + i * 215;
        const y = i % 2 ? 800 : 560;
        const s = 1.35;
        // away: the face is narrow and its features are shifted to one side; toward: face on
        const sx = lerp(0.62, 1, face);
        const shift = lerp(-36, 0, face);
        return (
          <g key={id} transform={`translate(${x},${y}) scale(${s})`}>
            <path d="M-80 300 Q-70 150 -30 120 L30 120 Q70 150 80 300 Z" fill="#b49340" />
            <rect x={-14} y={70} width={28} height={60} rx={10} fill={k.skin} />
            <g transform={`scale(${sx},1)`}>
              <ellipse cx={0} cy={0} rx={44} ry={56} fill={k.skin} />
              <path d="M-46 -8 Q-50 -62 0 -64 Q50 -62 46 -8 Q36 -44 0 -46 Q-36 -44 -46 -8 Z" fill={k.hair} />
            </g>
            <g transform={`translate(${shift},0)`}>
              {[-18, 18].map((ex) => (
                <g key={ex} transform={`translate(${ex * lerp(0.7, 1, face)},-6)`}>
                  <ellipse rx={12} ry={11} fill="#e9ebe6" stroke="#b7bdb8" strokeWidth={2} />
                  <ellipse cx={-3} cy={-3} rx={6} ry={4} fill="#f7f8f4" opacity={0.9} />
                </g>
              ))}
              <path d="M-9 30 Q0 33 9 30" stroke="#6a3a2a" strokeWidth={3} fill="none" strokeLinecap="round" />
            </g>
          </g>
        );
      })}
      <rect y={1300} width={W} height={620} fill="url(#st-shade)" />
    </svg>
  );
};

import React from "react";
import { fontFamily } from "../island/fonts";

export type MapMarker = { id: string; car: 1 | 2 | 3 | 4; pos: number; kind: "you" | "ok" | "infected" | "driver"; appearAt: number };

// The train as one long strip of four cars (open walkway between them). Car 1 is at the left with the cab; "you" are in car 3.
// Coordinates are inside a 900x460 card. `progress` 0..1 draws the card in, markers pop in at `appearAt` (0..1) inside it.
export const PART1_MARKERS: MapMarker[] = [
  { id: "cab", car: 1, pos: 0.06, kind: "driver", appearAt: 0.0 },
  { id: "aunt", car: 4, pos: 0.2, kind: "ok", appearAt: 0.15 },
  { id: "uncle", car: 4, pos: 0.42, kind: "ok", appearAt: 0.25 },
  { id: "mike", car: 4, pos: 0.64, kind: "ok", appearAt: 0.35 },
  { id: "nun", car: 3, pos: 0.88, kind: "ok", appearAt: 0.45 },
  { id: "nueng", car: 3, pos: 0.74, kind: "ok", appearAt: 0.55 },
  { id: "you", car: 3, pos: 0.58, kind: "you", appearAt: 0.65 },
  { id: "man1", car: 3, pos: 0.1, kind: "infected", appearAt: 0.8 },
  { id: "woman1", car: 3, pos: 0.3, kind: "infected", appearAt: 0.9 },
];

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ease = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);
const CAR_W = 176;
const GAP = 20;
const X0 = 96;
const CAR_Y = 150;
const CAR_H = 120;
const COLORS = { you: "#2f8f4e", ok: "#d9dde0", infected: "#d9534f", driver: "#d9534f" } as const;

export const TrainMap: React.FC<{ progress: number; markers: MapMarker[] }> = ({ progress, markers }) => {
  const p = clamp01(progress);
  const card = ease(p / 0.2);
  const infected = markers.filter((m) => m.kind === "infected" && p >= 0.4 + m.appearAt * 0.5);
  const youM = markers.find((m) => m.kind === "you");
  const youCar = youM ? youM.car : 3;
  const carX = (car: number, pos: number) => X0 + (car - 1) * (CAR_W + GAP) + pos * CAR_W;
  const allInfected = markers.filter((m) => m.kind === "infected");
  const zx = allInfected.length ? allInfected.reduce((s, m) => s + carX(m.car, m.pos), 0) / allInfected.length : 0;
  return (
    <svg width={900} height={460} viewBox="0 0 900 460" style={{ opacity: card, transform: `translateY(${(1 - card) * 40}px)` }}>
      <rect x={4} y={4} width={892} height={452} rx={34} fill="#0f1215" opacity={0.9} stroke="#4a5158" strokeWidth={4} />
      <text x={450} y={64} textAnchor="middle" fontFamily={fontFamily} fontSize={38} fill="#f1f1f1">แผนผังขบวน</text>
      {/* cars: car 1 at the left; the walkway between cars is open (a gap with a floor line) */}
      {[1, 2, 3, 4].map((n, i) => {
        const x = X0 + i * (CAR_W + GAP);
        const hi = n === youCar;
        const draw = clamp01((p - 0.1 - i * 0.05) / 0.2);
        return (
          <g key={n} opacity={draw}>
            <rect x={x} y={CAR_Y} width={CAR_W} height={CAR_H} rx={16} fill={hi ? "#1e3a2a" : "#20262b"} stroke={hi ? "#2f8f4e" : "#7b848b"} strokeWidth={hi ? 6 : 3} />
            <path d={`M${x + CAR_W} ${CAR_Y + CAR_H - 20} h${GAP}`} stroke="#7b848b" strokeWidth={4} />
            <text x={x + CAR_W / 2} y={CAR_Y + CAR_H + 42} textAnchor="middle" fontFamily={fontFamily} fontSize={30} fill={hi ? "#7fd9a0" : "#aeb4b6"}>{`ตู้ ${n}`}</text>
          </g>
        );
      })}
      {/* cab at the front of car 1 */}
      <path d={`M${X0} ${CAR_Y} L${X0 - 46} ${CAR_Y + CAR_H / 2} L${X0} ${CAR_Y + CAR_H} Z`} fill="#2a2f33" stroke="#d9534f" strokeWidth={4} opacity={clamp01((p - 0.1) / 0.2)} />
      <text x={X0 - 30} y={CAR_Y - 22} textAnchor="start" fontFamily={fontFamily} fontSize={28} fill="#ff9a8a" opacity={clamp01((p - 0.2) / 0.2)}>ห้องคนขับ</text>
      {/* markers */}
      {markers.map((m) => {
        const a = ease((p - (0.4 + m.appearAt * 0.5)) / 0.1);
        if (a <= 0) return null;
        const x = X0 + (m.car - 1) * (CAR_W + GAP) + m.pos * CAR_W;
        const y = CAR_Y + CAR_H / 2 + (m.kind === "infected" ? 22 : m.id === "uncle" ? -22 : m.id === "nun" ? 22 : 0);
        const r = m.kind === "you" ? 15 : 10;
        return (
          <g key={m.id} transform={`translate(${x},${y}) scale(${0.6 + 0.4 * a})`} opacity={a}>
            {m.kind === "you" && <circle r={26} fill="none" stroke="#ffd86b" strokeWidth={5} />}
            <circle r={r} fill={COLORS[m.kind]} stroke="#0b0d10" strokeWidth={3} />
          </g>
        );
      })}
      {markers.some((m) => m.kind === "you") && p > 0.7 && (
        <text x={youM ? carX(youM.car, youM.pos) : 0} y={CAR_Y - 22} textAnchor="middle" fontFamily={fontFamily} fontSize={38} fill="#ffd86b" opacity={ease((p - 0.7) / 0.15)}>คุณ</text>
      )}
      {infected.length > 0 && (
        <text x={zx} y={CAR_Y + CAR_H + 82} textAnchor="middle" fontFamily={fontFamily} fontSize={30} fill="#ff9a8a">ซอมบี้</text>
      )}
      {/* legend */}
      <g transform="translate(70,392)" opacity={clamp01((p - 0.6) / 0.2)}>
        <circle cx={10} cy={0} r={10} fill={COLORS.you} /><text x={32} y={10} fontFamily={fontFamily} fontSize={32} fill="#d9dde0">คุณ</text>
        <circle cx={150} cy={0} r={10} fill={COLORS.ok} /><text x={172} y={10} fontFamily={fontFamily} fontSize={32} fill="#d9dde0">ผู้โดยสาร</text>
        <circle cx={360} cy={0} r={10} fill={COLORS.infected} /><text x={382} y={10} fontFamily={fontFamily} fontSize={32} fill="#d9dde0">{`ซอมบี้ ${infected.length}`}</text>
      </g>
    </svg>
  );
};

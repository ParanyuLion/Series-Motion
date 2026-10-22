import React from "react";
import { fontFamily } from "./fonts";

export type Marker = { id: string; x: number; y: number; label: string; appearAt: number; side?: "top" | "bottom" | "left" | "right" };

// Coordinates are inside a 900x700 card. The beach is on the west (left), the hills on the east (right).
// `camp` deliberately sits inside the flood contour and lower than `high`, to show the danger.
export const PART1_MARKERS: Marker[] = [
  { id: "wake", x: 215, y: 545, label: "จุดที่ตื่น", appearAt: 0, side: "bottom" },
  { id: "waterline", x: 300, y: 335, label: "รอยน้ำ", appearAt: 0.33, side: "top" },
  { id: "high", x: 650, y: 205, label: "ที่สูง", appearAt: 0.66, side: "top" },
  { id: "camp", x: 395, y: 475, label: "แคมป์ของไอริณ", appearAt: 1, side: "right" },
];

export const ISLAND = "M110 480 Q90 380 170 320 Q230 260 300 250 Q360 150 520 140 Q700 130 780 230 Q840 320 790 420 Q730 520 600 560 Q480 600 360 590 Q190 590 110 480 Z";
export const FLOOD = "M120 470 Q110 380 180 330 Q260 300 360 330 Q470 370 520 450 Q540 520 460 575 Q330 600 220 580 Q130 560 120 470 Z";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ease = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);
const LABEL_FONT = 30;
const labelWidth = (s: string) => s.length * 16 + 36;

const Pin: React.FC<{ m: Marker; t: number; color: string }> = ({ m, t, color }) => {
  const a = ease(t);
  const w = labelWidth(m.label);
  const side = m.side ?? "bottom";
  const lx = side === "right" ? 24 + w / 2 : side === "left" ? -24 - w / 2 : 0;
  const ly = side === "top" ? -46 : side === "bottom" ? 46 : 0;
  return (
    <g transform={`translate(${m.x},${m.y}) scale(${0.6 + 0.4 * a})`} opacity={a}>
      <circle r={20} fill={color} opacity={0.25} />
      <circle r={11} fill={color} stroke="#0b0d10" strokeWidth={3} />
      <g transform={`translate(${lx},${ly})`}>
        <rect x={-w / 2} y={-22} width={w} height={44} rx={22} fill="#0b0d10" opacity={0.82} />
        <text x={0} y={10} textAnchor="middle" fontFamily={fontFamily} fontSize={LABEL_FONT} fill="#f1f1f1">{m.label}</text>
      </g>
    </g>
  );
};

export const MapCard: React.FC<{ progress: number; markers: Marker[]; highlight?: string }> = ({ progress, markers, highlight }) => {
  const p = clamp01(progress);
  const card = ease(p / 0.2);
  const outline = clamp01((p - 0.1) / 0.3);
  const flood = clamp01((p - 0.4) / 0.2);
  const routes = clamp01((p - 0.75) / 0.25);
  const find = (id: string) => markers.find((m) => m.id === id);
  const wake = find("wake");
  const high = find("high");
  const camp = find("camp");
  const colorFor = (id: string) => (id === highlight ? "#ffd86b" : id === "camp" ? "#d9604f" : id === "high" ? "#7fd0a2" : "#cfd5d8");

  return (
    <svg width={900} height={700} viewBox="0 0 900 700" style={{ opacity: card, transform: `translateY(${(1 - card) * 40}px)` }}>
      <rect x={4} y={4} width={892} height={692} rx={36} fill="#0f1215" opacity={0.88} stroke="#4a5158" strokeWidth={4} />
      <path d={ISLAND} fill="#2a3036" stroke="#aeb4b6" strokeWidth={6} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - outline} />
      <path d={ISLAND} fill="#2a3036" opacity={clamp01((p - 0.3) / 0.2)} />
      <path d={FLOOD} fill="#4d6a82" opacity={0.28 * flood} />
      <path d={FLOOD} fill="none" stroke="#8fb3cc" strokeWidth={5} strokeDasharray="14 12" opacity={flood} />
      {wake && high && (
        <path d={`M${wake.x} ${wake.y} Q330 500 360 400 T${high.x} ${high.y + 12}`} fill="none" stroke="#7fd0a2" strokeWidth={6} strokeLinecap="round" pathLength={1} strokeDasharray="0.04 0.03" opacity={routes} style={{ strokeDashoffset: 0 }} />
      )}
      {wake && camp && (
        <path d={`M${wake.x} ${wake.y} Q300 560 ${camp.x} ${camp.y}`} fill="none" stroke="#d9604f" strokeWidth={6} strokeLinecap="round" pathLength={1} strokeDasharray="0.05 0.04" opacity={routes} />
      )}
      {markers.map((m) => (
        <Pin key={m.id} m={m} t={(p - (0.4 + m.appearAt * 0.35)) / 0.12} color={colorFor(m.id)} />
      ))}
    </svg>
  );
};

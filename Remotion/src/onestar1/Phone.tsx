import React from "react";
import { PAL } from "./Look";
import { fontFamily } from "../island/fonts";

// The phone screens of series 4: a dark phone frame inside x 190..890, y 300..1380 (inside the safe area), flat app UI drawn in SVG.
// Every card takes the global frame `g` and its own window [from, to]; it fades over 10 frames at both ends.
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const FADE = 10;
const fade = (g: number, from: number, to: number) => clamp01(Math.min((g - from) / FADE, (to - g) / FADE));

const PX = 190;
const PY = 300;
const PW = 700;
const PH = 1080;

const Frame: React.FC<{ children: React.ReactNode; g: number; rain?: boolean }> = ({ children, g, rain = true }) => (
  <g>
    <rect x={PX - 10} y={PY - 10} width={PW + 20} height={PH + 20} rx={74} fill="#05080f" stroke={PAL.rim} strokeWidth={3} opacity={0.9} />
    <clipPath id="os-screen"><rect x={PX + 14} y={PY + 14} width={PW - 28} height={PH - 28} rx={58} /></clipPath>
    <g clipPath="url(#os-screen)">
      <rect x={PX} y={PY} width={PW} height={PH} fill="#0a1020" />
      {children}
      {rain && Array.from({ length: 22 }, (_, i) => {
        const x = PX + ((i * 97) % PW);
        const y = PY + ((i * 211 + g * 9) % (PH + 80)) - 40;
        return <line key={i} x1={x} y1={y} x2={x - 6} y2={y + 36} stroke={PAL.beam} strokeWidth={2} opacity={0.12} />;
      })}
    </g>
  </g>
);

const T: React.FC<{ x: number; y: number; size: number; fill?: string; anchor?: "start" | "middle" | "end"; children: React.ReactNode; weight?: number; opacity?: number }> = ({ x, y, size, fill = "#e8eefc", anchor = "start", children, opacity = 1 }) => (
  <text x={x} y={y} fontSize={size} fill={fill} textAnchor={anchor} fontFamily={fontFamily} opacity={opacity}>{children}</text>
);

const CarGlyph: React.FC<{ x: number; y: number; s?: number; fill?: string }> = ({ x, y, s = 1, fill = PAL.accent }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} fill={fill}>
    <rect x={-30} y={-6} width={60} height={22} rx={8} />
    <path d="M-20 -6 L-12 -22 H12 L20 -6 Z" />
    <circle cx={-16} cy={16} r={7} fill="#0a1020" /><circle cx={16} cy={16} r={7} fill="#0a1020" />
  </g>
);

/** a flat dark map: blocks and roads */
const MapBack: React.FC<{ y: number; h: number }> = ({ y, h }) => (
  <g>
    <rect x={PX} y={y} width={PW} height={h} fill="#0d1528" />
    {Array.from({ length: 4 }, (_, i) => <rect key={`v${i}`} x={PX + 60 + i * 180} y={y} width={26} height={h} fill="#16213a" />)}
    {Array.from({ length: Math.floor(h / 160) + 1 }, (_, i) => <rect key={`h${i}`} x={PX} y={y + 40 + i * 160} width={PW} height={24} fill="#16213a" />)}
    {Array.from({ length: 5 }, (_, i) => <rect key={`b${i}`} x={PX + 110 + (i % 3) * 190} y={y + 100 + Math.floor(i / 3) * 170} width={110} height={90} rx={8} fill="#0a1224" />)}
  </g>
);

/** the booking screen: searching, then "ถึงใน 10 นาที" with a car approaching the pin */
export const BookCard: React.FC<{ g: number; from: number; to: number }> = ({ g, from, to }) => {
  const t = clamp01((g - from) / Math.max(1, to - from));
  return (
    <g opacity={fade(g, from, to)}>
      <Frame g={g}>
        <MapBack y={PY + 120} h={620} />
        <path d={`M${PX + 100} ${PY + 640} H${PX + 400} V${PY + 330} H${PX + 600}`} fill="none" stroke={PAL.accent} strokeWidth={8} strokeLinecap="round" opacity={0.85} />
        <circle cx={PX + 600} cy={PY + 330} r={16} fill="#e8eefc" />
        <CarGlyph x={PX + 100 + t * 300} y={PY + 640} />
        <rect x={PX} y={PY + 740} width={PW} height={PH - 740} fill="#0e1830" />
        <T x={PX + 40} y={PY + 820} size={40} weight={500}>{t < 0.35 ? "กำลังหาคนขับ..." : "คนขับรับงานแล้ว"}</T>
        <T x={PX + 40} y={PY + 890} size={30} fill={PAL.rim} opacity={0.8}>จากที่ทำงาน ไปบ้านคุณ</T>
        <T x={PX + PW - 40} y={PY + 990} size={64} fill={PAL.accent} anchor="end">{t < 0.35 ? "" : "คนขับกำลังมา"}</T>
        <rect x={PX + 40} y={PY + 1010} width={PW - 80} height={6} rx={3} fill="#1d2a44" />
        <rect x={PX + 40} y={PY + 1010} width={(PW - 80) * t} height={6} rx={3} fill={PAL.accent} />
      </Frame>
    </g>
  );
};

/** the rating screen: five stars with one filled, the typed text "ไม่ควรขับรถ", a send button */
export const RateCard: React.FC<{ g: number; from: number; to: number; text?: string }> = ({ g, from, to, text = "ไม่ควรขับรถ" }) => {
  const typed = Math.max(0, Math.min(Array.from(text).length, Math.floor((g - from - 18) / 3)));
  const shown = Array.from(text).slice(0, typed).join("");
  const sendPulse = g - from > 18 + Array.from(text).length * 3 + 6 ? 1 : 0;
  return (
    <g opacity={fade(g, from, to)}>
      <Frame g={g} rain={false}>
        <T x={PX + PW / 2} y={PY + 130} size={44} anchor="middle">ให้คะแนนคนขับ</T>
        <circle cx={PX + PW / 2} cy={PY + 270} r={70} fill="#16213a" />
        <circle cx={PX + PW / 2} cy={PY + 250} r={26} fill="#2a3a5c" /><rect x={PX + PW / 2 - 40} y={PY + 285} width={80} height={46} rx={22} fill="#2a3a5c" />
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={i} transform={`translate(${PX + 90 + i * 130},${PY + 470}) scale(2.2)`} d="M0 -22 L6.5 -7 L22 -6 L10 5 L14 21 L0 12 L-14 21 L-10 5 L-22 -6 L-6.5 -7 Z" fill={i === 0 ? PAL.accent : "#1d2a44"} stroke={i === 0 ? PAL.accent : "#2a3a5c"} strokeWidth={2} />
        ))}
        <T x={PX + PW / 2} y={PY + 590} size={34} fill={PAL.rim} anchor="middle" opacity={0.85}>1 ดาว</T>
        <rect x={PX + 50} y={PY + 640} width={PW - 100} height={200} rx={24} fill="#0e1830" stroke="#2a3a5c" strokeWidth={3} />
        <T x={PX + 80} y={PY + 720} size={44}>{shown}{(g % 30 < 15) && typed < Array.from(text).length ? "|" : ""}</T>
        <rect x={PX + 50} y={PY + 900} width={PW - 100} height={96} rx={48} fill={PAL.accent} opacity={0.35 + 0.65 * sendPulse} />
        <T x={PX + PW / 2} y={PY + 963} size={42} fill="#0a1020" anchor="middle">ส่ง</T>
      </Frame>
    </g>
  );
};

/** the notification on the lock screen: the driver's message and the big countdown */
export const MessageCard: React.FC<{ g: number; from: number; to: number; minutes: number; shake?: number }> = ({ g, from, to, minutes, shake = 0 }) => {
  const dx = shake > 0 ? Math.sin(g * 1.7) * 6 * shake : 0;
  return (
    <g opacity={fade(g, from, to)} transform={`translate(${dx},0)`}>
      <Frame g={g}>
        <T x={PX + PW / 2} y={PY + 250} size={150} anchor="middle" fill="#e8eefc" opacity={0.9}>00:17</T>
        <T x={PX + PW / 2} y={PY + 320} size={32} fill={PAL.rim} anchor="middle" opacity={0.7}>วันพุธ</T>
        <rect x={PX + 40} y={PY + 460} width={PW - 80} height={330} rx={36} fill="#14203c" stroke="#2a3a5c" strokeWidth={3} />
        <CarGlyph x={PX + 100} y={PY + 520} s={1.1} />
        <T x={PX + 150} y={PY + 532} size={30} fill={PAL.rim}>แอปเรียกรถ · ตอนนี้</T>
        <T x={PX + 70} y={PY + 610} size={40}>คนขับ: ขอบคุณสำหรับดาวนะครับ</T>
        <T x={PX + PW / 2} y={PY + 740} size={70} fill={PAL.accent} anchor="middle">ถึงใน {minutes} นาที</T>
      </Frame>
    </g>
  );
};

/** the map: your house pin and the car dot approaching along the road (progress 0..1) */
export const MapCard: React.FC<{ g: number; from: number; to: number; progress: number; minutes: number }> = ({ g, from, to, progress, minutes }) => (
  <g opacity={fade(g, from, to)}>
    <Frame g={g}>
      <MapBack y={PY + 60} h={760} />
      <path d={`M${PX + 100} ${PY + 740} H${PX + 400} V${PY + 330} H${PX + 600}`} fill="none" stroke={PAL.accent} strokeWidth={8} strokeLinecap="round" opacity={0.4} />
      <g transform={`translate(${PX + 600},${PY + 300})`}>
        <path d="M0 40 C-34 0 -30 -36 0 -36 C30 -36 34 0 0 40 Z" fill="#e8eefc" /><circle cx={0} cy={-14} r={10} fill="#0a1020" />
      </g>
      {(() => {
        const px = progress < 0.5 ? PX + 100 + progress * 2 * 300 : PX + 400;
        const py = progress < 0.5 ? PY + 740 : PY + 740 - (progress - 0.5) * 2 * 410;
        return <g><circle cx={px} cy={py} r={34} fill={PAL.accent} opacity={0.22} /><CarGlyph x={px} y={py} s={0.9} /></g>;
      })()}
      <rect x={PX} y={PY + 840} width={PW} height={PH - 840} fill="#0e1830" />
      <T x={PX + 40} y={PY + 920} size={40}>คนขับกำลังมารับคุณ</T>
      <T x={PX + PW - 40} y={PY + 1010} size={70} fill={PAL.accent} anchor="end">ถึงใน {minutes} นาที</T>
    </Frame>
  </g>
);

/** the countdown pill used by the HUD and by later scenes */
export const Countdown: React.FC<{ minutes: number }> = ({ minutes }) => (
  <g fontFamily={fontFamily}>
    <rect x={0} y={-44} width={330} height={64} rx={32} fill="#0e1830" stroke={PAL.accent} strokeWidth={3} />
    <text x={165} y={0} fontSize={40} fill={PAL.accent} textAnchor="middle">ถึงใน {minutes} นาที</text>
  </g>
);

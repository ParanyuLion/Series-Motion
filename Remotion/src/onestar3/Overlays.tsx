import React from "react";
import { fontFamily } from "../island/fonts";
import { PAL } from "../onestar1/Look";
import { Face3 } from "./Face3";
import { clamp01, ramp, rnd, smooth } from "./util";

// Cut-ins of the finale. They are drawn in screen space (1080 x 1920) over the SAME set, blurred by `SetView`, so a close-up never
// leaves the world it belongs to. Each takes the global frame `g` and its window [from, to].

export type OV = { g: number; from: number; to: number };

/** a thumb: tapered, rounded tip with a nail, shaded toward the shadow side. Drawn from its base (x, y) pointing along `rot` degrees (0 = up). */
const Thumb: React.FC<{ x: number; y: number; rot: number; len?: number; skin: string }> = ({ x, y, rot, len = 210, skin }) => (
  <g transform={`translate(${x},${y}) rotate(${rot})`}>
    <defs><linearGradient id={`th-${skin.slice(1)}`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={skin} /><stop offset="1" stopColor="#3a2c3c" /></linearGradient></defs>
    <path d={`M-40 40 L-30 ${-len + 30} Q-28 ${-len - 14} 0 ${-len - 14} Q28 ${-len - 14} 30 ${-len + 30} L42 40 Z`} fill={`url(#th-${skin.slice(1)})`} />
    <ellipse cx={0} cy={-len + 18} rx={20} ry={26} fill="#f1d8c8" opacity={0.35} />
    <path d={`M-34 ${-len + 70} q34 14 68 0`} stroke="#2a2030" strokeWidth={3} fill="none" opacity={0.35} />
  </g>
);

/** two hands gripping a phone from below: the palms and arms behind it (layer "back") and the thumbs on its front edge (layer "front"); the phone frame spans x 258..822, y 408..1412 */
const Grip: React.FC<{ skin: string; layer: "back" | "front"; right?: boolean }> = ({ skin, layer, right = true }) => {
  const id = `gr-${skin.slice(1)}`;
  if (layer === "back") {
    return (
      <g>
        <defs><linearGradient id={id} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={skin} /><stop offset="1" stopColor="#3a2c3c" /></linearGradient></defs>
        <path d="M120 1920 L200 1290 Q214 1160 300 1160 L360 1400 L330 1920 Z" fill={`url(#${id})`} />
        <path d="M960 1920 L880 1290 Q866 1160 780 1160 L720 1400 L750 1920 Z" fill={`url(#${id})`} transform="translate(0,0)" />
        {[0, 1, 2].map((i) => <rect key={i} x={196 - i * 4} y={1130 - i * 70} width={86} height={50} rx={25} fill={skin} opacity={0.95} transform={`rotate(${-8 + i * 3} 240 1150)`} />)}
        {[0, 1, 2].map((i) => <rect key={i} x={798 + i * 4} y={1130 - i * 70} width={86} height={50} rx={25} fill={skin} opacity={0.95} transform={`rotate(${8 - i * 3} 840 1150)`} />)}
      </g>
    );
  }
  return (
    <g>
      <Thumb x={300} y={1440} rot={30} len={120} skin={skin} />
      {right && <Thumb x={780} y={1440} rot={-30} len={120} skin={skin} />}
    </g>
  );
};

/** a phone seen from the front, big, with the screen content as children (screen is 520 x 960 at the phone's origin top-left) */
const Phone: React.FC<{ x: number; y: number; rot?: number; glow?: string; g: number; children: React.ReactNode }> = ({ x, y, rot = 0, glow = "#6fa8ff", g, children }) => (
  <g transform={`translate(${x},${y}) rotate(${rot})`}>
    <rect x={-60} y={-60} width={640} height={1080} fill={glow} opacity={0.22 + 0.04 * Math.sin(g * 0.2)} filter="url(#os3-d3)" />
    <rect x={-22} y={-22} width={564} height={1004} rx={64} fill="#05070d" stroke={PAL.rim} strokeWidth={5} opacity={0.98} />
    <clipPath id={`ph-${Math.round(x)}-${Math.round(y)}`}><rect x={0} y={0} width={520} height={960} rx={44} /></clipPath>
    <g clipPath={`url(#ph-${Math.round(x)}-${Math.round(y)})`}>
      <rect x={0} y={0} width={520} height={960} fill="#0a1226" />
      {children}
      <rect x={0} y={0} width={520} height={960} fill="#9fc0ff" opacity={0.05} />
    </g>
    <rect x={190} y={-10} width={140} height={24} rx={12} fill="#05070d" />
  </g>
);

const AppBar: React.FC<{ title: string }> = ({ title }) => (
  <g fontFamily={fontFamily}>
    <rect x={0} y={0} width={520} height={110} fill="#0f1a34" />
    <circle cx={44} cy={66} r={14} fill={PAL.accent} />
    <text x={74} y={78} fontSize={34} fill={PAL.rim}>{title}</text>
  </g>
);

/** the user's phone in a hand: the countdown screen. `shown` is the number text; before `changeAt` it reads "ถึงแล้ว" */
export const PhoneRise: React.FC<OV & { changeAt: number }> = ({ g, from, to, changeAt }) => {
  const t = smooth(ramp(g, from, from + 22));
  const shake = Math.sin(g * 1.7) * 3 * ramp(g, changeAt - 6, changeAt + 20) * (1 - ramp(g, changeAt + 40, changeAt + 70));
  const changed = g >= changeAt;
  const pop = changed ? 1 + 0.06 * Math.max(0, 1 - (g - changeAt) / 12) : 1;
  const sc = 1 + 0.12 * ramp(g, from, to);
  return (
    <g transform={`translate(540,900) scale(${sc * t + (1 - t) * 0.92}) translate(-540,-900)`}>
      <Grip skin="#c99e80" layer="back" />
            <Phone x={280 + shake} y={430} g={g} rot={-1.5}>
        <AppBar title="รถของคุณ" />
        <g fontFamily={fontFamily} textAnchor="middle">
          {Array.from({ length: 7 }, (_, i) => <line key={i} x1={0} y1={140 + i * 120} x2={520} y2={140 + i * 120} stroke="#14264a" strokeWidth={2} />)}
          <rect x={60} y={190} width={400} height={150} rx={26} fill="#101d3c" stroke="#223a68" strokeWidth={3} />
          <text x={260} y={282} fontSize={changed ? 54 : 66} fill={changed ? PAL.accent : PAL.rim} transform={`translate(260,282) scale(${pop}) translate(-260,-282)`}>{changed ? "ถึงใน 25 นาที" : "ถึงแล้ว"}</text>
          <text x={260} y={330} fontSize={26} fill={PAL.rim} opacity={0.65}>{changed ? "คนขับออกจากบ้านคุณแล้ว" : "คนขับรออยู่ที่บ้านคุณ"}</text>
          <path d="M60 520 Q200 440 260 560 T460 500" stroke="#2a4678" strokeWidth={8} fill="none" />
          <circle cx={60} cy={520} r={16} fill={PAL.accent} />
          <circle cx={460} cy={500} r={14} fill="#6fa8ff" />
          {changed && <circle cx={260 + Math.min(180, (g - changeAt) * 1.2)} cy={540} r={20} fill="#fff" opacity={0.9} />}
          <rect x={60} y={720} width={400} height={96} rx={48} fill="#16264a" stroke="#223a68" strokeWidth={3} />
          <text x={260} y={784} fontSize={34} fill={PAL.rim} opacity={0.85}>ติดต่อคนขับ</text>
        </g>
      </Phone>
      <Grip skin="#c99e80" layer="front" />
    </g>
  );
};

/** a front close-up inside the set */
export const FaceCut: React.FC<OV & { kind: "you" | "aunt"; look?: [number, number]; fear?: number; closed?: number; side?: 1 | -1; below?: number; key1?: string; y?: number; push?: number }> = ({ g, from, to, kind, look, fear, closed, side, below, key1, y = 860, push = 0.1 }) => {
  const z = 1.0 + push * ramp(g, from, to);
  return (
    <g transform={`translate(540,${y}) scale(${z})`}>
      <Face3 id={`fc-${kind}-${from}`} kind={kind} g={g} side={side} look={look} fear={fear} closed={closed} below={below} key1={key1} />
    </g>
  );
};

/** the aunt's pocket and the user's phone, in that order: her cardigan fabric with a glowing pocket (the ring first), then the user's phone */
export const PocketChime: React.FC<OV & { ringAt: number; yourAt: number }> = ({ g, from, to, ringAt, yourAt }) => {
  const a = ramp(g, ringAt, ringAt + 10);
  const b = ramp(g, yourAt, yourAt + 10);
  const pulse = (t0: number, i: number) => ramp(g, t0 + i * 10, t0 + i * 10 + 40);
  return (
    <g>
      {/* her cardigan: big soft folds, a patch pocket with a slit; the phone glows inside and light spills up the cloth */}
      <g>
        <path d="M-100 160 Q300 60 700 180 L760 1000 Q320 1100 -80 980 Z" fill="#232942" />
        <path d="M-100 160 Q300 60 700 180" stroke={PAL.rim} strokeWidth={5} fill="none" opacity={0.35} />
        {Array.from({ length: 10 }, (_, i) => <path key={i} d={`M${-60 + i * 80} 180 q${(i % 3 - 1) * 24} 300 ${(i % 2 ? 1 : -1) * 30} 800`} stroke="#171b30" strokeWidth={9} fill="none" opacity={0.7} />)}
        <ellipse cx={290} cy={520} rx={420} ry={360} fill="#9cc0ff" opacity={0.22 * a} filter="url(#os3-d3)" />
        <path d="M70 470 L510 490 L520 880 Q300 920 80 880 Z" fill="#1d2340" stroke="#3a4570" strokeWidth={6} />
        <path d="M86 490 L496 508 L504 860 Q300 898 94 860 Z" fill="none" stroke="#5a6798" strokeWidth={3} strokeDasharray="14 10" opacity={0.8} />
        <rect x={170} y={430} width={230} height={250} rx={34} fill="#05070d" transform="rotate(4 285 555)" />
        <rect x={182} y={444} width={206} height={230} rx={24} fill={a > 0.05 ? "#bcd6ff" : "#080b14"} opacity={0.35 + 0.65 * a} transform="rotate(4 285 555)" />
        <text x={285} y={590} fontSize={44} fill="#0a1226" fontFamily={fontFamily} textAnchor="middle" opacity={a} transform="rotate(4 285 555)">ติ๊ง</text>
        <path d="M70 470 L510 490" stroke="#05070d" strokeWidth={14} />
        <path d="M70 470 L510 490" stroke={PAL.rim} strokeWidth={3} opacity={0.5} />
        {[0, 1, 2].map((i) => <ellipse key={i} cx={285} cy={500} rx={110 + pulse(ringAt, i) * 380} ry={70 + pulse(ringAt, i) * 250} fill="none" stroke="#cfe0ff" strokeWidth={4} opacity={(1 - pulse(ringAt, i)) * 0.7 * a} />)}
      </g>
      {/* the user's phone, lower right, lighting a beat later */}
      <rect x={0} y={1500} width={1080} height={420} fill="#2a1e16" /><rect x={0} y={1500} width={1080} height={8} fill="#ffc27a" opacity={0.35} />
      <g transform="translate(560,1000) rotate(-8)">
        <rect x={-30} y={-30} width={420} height={640} fill="#6fa8ff" opacity={0.3 * b} filter="url(#os3-d3)" />
        <rect x={0} y={0} width={360} height={580} rx={44} fill="#05070d" stroke={PAL.rim} strokeWidth={4} />
        <rect x={14} y={14} width={332} height={552} rx={32} fill={b > 0.05 ? "#13306a" : "#06080f"} />
        <text x={180} y={300} fontSize={54} fill={PAL.accent} fontFamily={fontFamily} textAnchor="middle" opacity={b}>ติ๊ง</text>
        {[0, 1, 2].map((i) => <ellipse key={i} cx={180} cy={290} rx={60 + pulse(yourAt, i) * 300} ry={60 + pulse(yourAt, i) * 300} fill="none" stroke="#cfe0ff" strokeWidth={4} opacity={(1 - pulse(yourAt, i)) * 0.6 * b} />)}
      </g>
    </g>
  );
};

/** her phone: the map with a pin on the bench, then who sent it */
export const PinReveal: React.FC<OV> = ({ g, from, to }) => {
  const t = smooth(ramp(g, from, from + 20));
  const ring = ((g - from) * 0.02) % 1;
  const sc = 1 + 0.1 * ramp(g, from, to);
  return (
    <g transform={`translate(540,900) scale(${sc * (0.94 + 0.06 * t)}) translate(-540,-900)`}>
      <Grip skin="#c99e80" layer="back" />
            <Phone x={280} y={430} g={g} glow="#f2c230">
        <AppBar title="ส่งตำแหน่งให้คนขับ" />
        <g fontFamily={fontFamily} textAnchor="middle">
          <rect x={0} y={110} width={520} height={560} fill="#0e1d3a" />
          {Array.from({ length: 9 }, (_, i) => <line key={i} x1={0} y1={150 + i * 60} x2={520} y2={150 + i * 60 + (i % 2) * 14} stroke="#1d3563" strokeWidth={4} />)}
          {Array.from({ length: 6 }, (_, i) => <line key={i} x1={60 + i * 90} y1={110} x2={20 + i * 100} y2={670} stroke="#1d3563" strokeWidth={4} />)}
          <rect x={150} y={290} width={110} height={70} rx={10} fill="#17305a" /><rect x={300} y={400} width={140} height={80} rx={10} fill="#17305a" />
          <circle cx={260} cy={410} r={34 + ring * 90} fill="none" stroke={PAL.accent} strokeWidth={4} opacity={1 - ring} />
          <path d="M260 450 Q220 380 260 340 Q300 380 260 450 Z" fill={PAL.accent} /><circle cx={260} cy={374} r={11} fill="#05070d" />
          <rect x={30} y={700} width={460} height={110} rx={26} fill="#101d3c" stroke="#223a68" strokeWidth={3} />
          <text x={260} y={750} fontSize={32} fill={PAL.accent}>ส่งตำแหน่งแล้ว</text>
          <text x={260} y={790} fontSize={26} fill={PAL.rim} opacity={0.7}>ที่นั่งหน้าสถานี · ถึงใน 25 นาที</text>
          <rect x={30} y={840} width={460} height={80} rx={40} fill={PAL.accent} opacity={0.9} />
          <text x={260} y={894} fontSize={34} fill="#05070d">ส่งแล้ว</text>
        </g>
      </Phone>
      <Grip skin="#c99e80" layer="front" />
    </g>
  );
};

const Star: React.FC<{ x: number; y: number; r: number; on: number }> = ({ x, y, r, on }) => {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.46 : r;
    return `${x + Math.cos(a) * rr},${y + Math.sin(a) * rr}`;
  }).join(" ");
  return (
    <g>
      {on > 0.05 && <circle cx={x} cy={y} r={r * 1.5} fill={PAL.accent} opacity={0.25 * on} filter="url(#os3-d2)" />}
      <polygon points={pts} fill={on > 0.05 ? PAL.accent : "none"} fillOpacity={on} stroke={on > 0.05 ? PAL.accent : "#4a5f8e"} strokeWidth={5} strokeLinejoin="round" />
    </g>
  );
};

/** a rating screen. `press` is the frame the first star is pressed (the thumb comes from below), `typed` shows the text under the stars after it */
export const RatingPhone: React.FC<OV & { pressAt?: number; owner: string; hand?: string; quiet?: boolean }> = ({ g, from, to, pressAt = -1, owner, hand = "#c99e80", quiet = false }) => {
  const t = smooth(ramp(g, from, from + 20));
  const on = pressAt >= 0 ? smooth(ramp(g, pressAt, pressAt + 8)) : 0;
  const dist = pressAt >= 0 ? (1 - smooth(ramp(g, pressAt - 30, pressAt))) * 260 + ramp(g, pressAt + 14, pressAt + 44) * 120 : 400;
  const sc = 1 + 0.08 * ramp(g, from, to);
  return (
    <g transform={`translate(540,900) scale(${sc * (0.94 + 0.06 * t)}) translate(-540,-900)`}>
      <Grip skin={hand} layer="back" />
            <Phone x={280} y={430} g={g} glow={on > 0.5 ? "#f2c230" : "#6fa8ff"}>
        <AppBar title="ให้คะแนนการเดินทาง" />
        <g fontFamily={fontFamily} textAnchor="middle">
          <text x={260} y={220} fontSize={34} fill={PAL.rim}>{owner}</text>
          <rect x={150} y={250} width={220} height={220} rx={110} fill="#101d3c" stroke="#223a68" strokeWidth={4} />
          <rect x={200} y={300} width={120} height={80} rx={22} fill="#1a2a50" /><circle cx={225} cy={400} r={14} fill="#05070d" /><circle cx={295} cy={400} r={14} fill="#05070d" />
          <text x={260} y={540} fontSize={30} fill={PAL.rim} opacity={0.8}>คุณให้คะแนนคนขับเท่าไร</text>
          {[0, 1, 2, 3, 4].map((i) => <Star key={i} x={60 + i * 100} y={640} r={40} on={i === 0 ? on : 0} />)}
          {on > 0.4 && !quiet && <text x={260} y={760} fontSize={38} fill={PAL.accent} opacity={on}>ไม่ควรขับรถ</text>}
          <rect x={60} y={840} width={400} height={80} rx={40} fill={on > 0.5 ? PAL.accent : "#16264a"} opacity={0.95} />
          <text x={260} y={894} fontSize={32} fill={on > 0.5 ? "#05070d" : PAL.rim}>ส่ง</text>
        </g>
      </Phone>
      <Grip skin={hand} layer="front" right={false} />
      {pressAt >= 0 && (
        <Thumb x={645 + 0.57 * dist} y={1507 + 0.82 * dist} rot={-35} len={520} skin={hand} />
      )}
    </g>
  );
};

/** the user's own phone at the end, five empty stars, the first one faintly lit */
export const FiveStars: React.FC<OV> = ({ g, from, to }) => {
  const t = smooth(ramp(g, from, from + 24));
  const glow = 0.25 + 0.25 * Math.sin((g - from) * 0.08);
  return (
    <g transform={`translate(0,${(1 - t) * 40})`} opacity={t}>
      <Grip skin="#c99e80" layer="back" />
            <Phone x={280} y={430} g={g}>
        <AppBar title="ประวัติการเดินทาง" />
        <g fontFamily={fontFamily} textAnchor="middle">
          <text x={260} y={300} fontSize={34} fill={PAL.rim} opacity={0.8}>การเดินทางล่าสุดของคุณ</text>
          {[0, 1, 2, 3, 4].map((i) => <Star key={i} x={60 + i * 100} y={420} r={40} on={i === 0 ? glow : 0} />)}
          <text x={260} y={560} fontSize={28} fill={PAL.rim} opacity={0.5}>ไม่มีรายการใหม่</text>
        </g>
      </Phone>
      <Grip skin="#c99e80" layer="front" />
    </g>
  );
};

/** sparkles for dust used by nothing yet but kept for the sound-bed timing helpers */
export const dustSeed = (i: number) => rnd(i + clamp01(0));

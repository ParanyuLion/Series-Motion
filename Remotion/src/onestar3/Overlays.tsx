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
    // each hand is one connected shape: the forearm, the palm along the phone edge, and three finger tips wrapping the outer side
    return (
      <g>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={skin} /><stop offset="1" stopColor="#3a2c3c" /></linearGradient>
          <linearGradient id={id + "r"} x1="1" y1="0" x2="0" y2="0"><stop offset="0" stopColor={skin} /><stop offset="1" stopColor="#3a2c3c" /></linearGradient>
        </defs>
        <path d="M70 1920 L168 1420 Q186 1300 196 1180 Q198 1100 250 1070 L340 1090 L350 1440 L318 1920 Z" fill={`url(#${id})`} />
        {[0, 1, 2].map((i) => <rect key={i} x={196 - i * 2} y={1050 - i * 62} width={110} height={52} rx={26} fill={skin} transform={`rotate(${-6 + i * 3} 250 1076)`} />)}
        <path d="M1010 1920 L912 1420 Q894 1300 884 1180 Q882 1100 830 1070 L740 1090 L730 1440 L762 1920 Z" fill={`url(#${id}r)`} />
        {[0, 1, 2].map((i) => <rect key={i} x={774 + i * 2} y={1050 - i * 62} width={110} height={52} rx={26} fill={skin} transform={`rotate(${6 - i * 3} 830 1076)`} />)}
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

/** one hand holding the phone from below: the forearm under it (back layer), the thumb on the front edge and four finger tips wrapping the other edge (front layer). side "L" = the left hand (thumb on the left edge). */
export const OneHand: React.FC<{ skin: string; side: "L" | "R"; layer: "back" | "front" }> = ({ skin, side, layer }) => {
  const id = `oh-${skin.slice(1)}${side}`;
  const sleeve = skin === "#aeb6c6" ? "#2b2f4a" : "#46587a";
  const m = side === "L" ? 1 : -1;
  const X = (x: number) => (side === "L" ? x : 1080 - x);
  if (layer === "back") {
    return (
      <g>
        <defs>
          <linearGradient id={id} x1={side === "L" ? "0" : "1"} y1="0" x2={side === "L" ? "1" : "0"} y2="0"><stop offset="0" stopColor={skin} /><stop offset="1" stopColor="#3a2c3c" /></linearGradient>
          <linearGradient id={id + "s"} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={sleeve} /><stop offset="1" stopColor="#10162a" /></linearGradient>
        </defs>
        <path d={`M${X(340)} 1920 L${X(398)} 1560 L${X(700)} 1560 L${X(740)} 1920 Z`} fill={`url(#${id}s)`} />
        <rect x={X(390) - (side === "L" ? 0 : 320)} y={1544} width={320} height={30} rx={12} fill={sleeve} stroke={PAL.rim} strokeWidth={2} />
        <path d={`M${X(404)} 1550 Q${X(404)} 1400 ${X(470)} 1330 L${X(690)} 1350 Q${X(704)} 1420 ${X(692)} 1550 Z`} fill={`url(#${id})`} />
      </g>
    );
  }
  return (
    <g>
      <Thumb x={X(436)} y={1540} rot={m * -24} len={260} skin={skin} />
      {[0, 1, 2, 3].map((i) => <rect key={i} x={side === "L" ? 770 : 250} y={1250 - i * 62} width={70} height={50} rx={25} fill={skin} transform={`rotate(${m * -4 + i * m * 1} ${side === "L" ? 800 : 280} ${1275 - i * 62})`} />)}
    </g>
  );
};

/** the other hand: a fist with the index finger out and the forearm behind it, coming from a lower corner to tap at (tx, ty). `rot` is the lean of the finger (+ from the lower left, - from the lower right), `d` how far the tip is from the target along the finger (0 = touching). */
export const Poker: React.FC<{ tx: number; ty: number; rot: number; d: number; skin: string }> = ({ tx, ty, rot, d, skin }) => {
  const id = `pk-${skin.slice(1)}${rot > 0 ? "a" : "b"}`;
  const sleeve = skin === "#aeb6c6" ? "#2b2f4a" : "#46587a";
  return (
    <g transform={`translate(${tx},${ty}) rotate(${rot}) translate(0,${d})`}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={skin} /><stop offset="0.7" stopColor={skin} /><stop offset="1" stopColor="#4a3a4c" /></linearGradient>
        <linearGradient id={id + "s"} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={sleeve} /><stop offset="1" stopColor="#10162a" /></linearGradient>
      </defs>
      {/* sleeve and cuff */}
      <path d="M-64 330 L104 330 L150 1700 L-120 1700 Z" fill={`url(#${id}s)`} />
      <path d="M-64 330 L-120 1700" stroke={PAL.rim} strokeWidth={4} opacity={0.4} />
      <rect x={-72} y={312} width={184} height={34} rx={14} fill={sleeve} stroke={PAL.rim} strokeWidth={2} opacity={0.95} />
      {/* wrist and the back of the hand: a fist with the index finger out */}
      <path d="M-40 316 L-46 220 Q-70 150 -52 100 L-46 24 Q-46 -14 -22 -14 Q2 -14 2 24 L2 138 Q16 116 40 120 Q64 124 66 150 Q88 148 96 176 Q114 182 114 212 Q118 270 92 316 Z" fill={`url(#${id})`} />
      {/* the thumb folded across the side of the fist */}
      <path d="M-48 210 Q-92 196 -96 238 Q-96 276 -58 292 Q-40 276 -42 240 Z" fill={skin} stroke="#3a2c3c" strokeWidth={2} opacity={0.95} />
      {/* knuckle lines, nail, highlight */}
      <path d="M12 150 Q34 142 56 152 M50 178 Q76 170 96 182 M70 206 Q92 202 108 214" stroke="#2a2030" strokeWidth={3} fill="none" opacity={0.4} strokeLinecap="round" />
      <ellipse cx={-22} cy={12} rx={13} ry={18} fill="#f1d8c8" opacity={0.45} />
      <path d="M-34 40 L-34 120" stroke="#fff" strokeWidth={5} opacity={0.18} strokeLinecap="round" />
    </g>
  );
};

/** distance of the poking fingertip from its target: it comes in, touches at `at`, and withdraws */
const pokeD = (g: number, at: number) => 360 * (1 - smooth(ramp(g, at - 34, at))) + 360 * smooth(ramp(g, at + 12, at + 44));

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
      <OneHand skin="#c99e80" side="L" layer="back" />
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
      <OneHand skin="#c99e80" side="L" layer="front" />
      <Poker tx={540} ty={700} rot={-35} d={pokeD(g, changeAt - 14)} skin="#c99e80" />
    </g>
  );
};

/** a front close-up inside the set */
export const FaceCut: React.FC<OV & { kind: "you" | "aunt"; look?: [number, number]; fear?: number; closed?: number; side?: 1 | -1; below?: number; key1?: string; y?: number; push?: number }> = ({ g, from, to, kind, look, fear, closed, side, below, key1, y = 860, push = 0.1 }) => {
  const z = 1.0 + push * ramp(g, from, to);
  const sway = Math.sin((g - from) * 0.035) * 1.1;
  const bob = Math.sin((g - from) * 0.05) * 6;
  return (
    <g>
      <ellipse cx={540} cy={y - 40} rx={470} ry={560} fill={key1 ?? "#9cc0ff"} opacity={0.12} filter="url(#os3-d3)" />
    <g transform={`translate(540,${y + bob}) rotate(${sway}) scale(${z})`}>
      <Face3 id={`fc-${kind}-${from}`} kind={kind} g={g} side={side} look={look} fear={fear} closed={closed} below={below} key1={key1} />
    </g>
      {Array.from({ length: 16 }, (_, i) => {
        const sx = rnd(i + 300) * 1080;
        const sy = ((rnd(i + 330) * 2400 + (g - from) * (2 + rnd(i + 360) * 3)) % 2200) - 150;
        return <path key={i} d={`M${sx} ${sy} q6 60 0 130`} stroke="#bcd4ff" strokeWidth={3 + rnd(i + 390) * 4} fill="none" opacity={0.2} strokeLinecap="round" filter="url(#os3-d1)" />;
      })}
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
    <g transform={`translate(${Math.sin(g * 0.07) * 3},${Math.sin(g * 0.05) * 5}) translate(540,900) scale(${sc * (0.94 + 0.06 * t)}) translate(-540,-900)`}>
      <OneHand skin="#aeb6c6" side="L" layer="back" />
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
      <OneHand skin="#aeb6c6" side="L" layer="front" />
      <Poker tx={540} ty={845} rot={-35} d={pokeD(g, from + 60)} skin="#aeb6c6" />
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
    const sc = 1 + 0.08 * ramp(g, from, to);
  return (
    <g transform={`translate(540,900) scale(${sc * (0.94 + 0.06 * t)}) translate(-540,-900)`}>
      <OneHand skin={hand} side="R" layer="back" />
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
      <OneHand skin={hand} side="R" layer="front" />
      {pressAt >= 0 && <Poker tx={340} ty={1070} rot={35} d={pokeD(g, pressAt)} skin={hand} />}
    </g>
  );
};

/** the user's own phone at the end, five empty stars, the first one faintly lit */
export const FiveStars: React.FC<OV> = ({ g, from, to }) => {
  const t = smooth(ramp(g, from, from + 24));
  const glow = 0.25 + 0.25 * Math.sin((g - from) * 0.08);
  return (
    <g transform={`translate(0,${(1 - t) * 40})`} opacity={t}>
      <OneHand skin="#c99e80" side="L" layer="back" />
            <Phone x={280} y={430} g={g}>
        <AppBar title="ประวัติการเดินทาง" />
        <g fontFamily={fontFamily} textAnchor="middle">
          <text x={260} y={300} fontSize={34} fill={PAL.rim} opacity={0.8}>การเดินทางล่าสุดของคุณ</text>
          {[0, 1, 2, 3, 4].map((i) => <Star key={i} x={60 + i * 100} y={420} r={40} on={i === 0 ? glow : 0} />)}
          <text x={260} y={560} fontSize={28} fill={PAL.rim} opacity={0.5}>ไม่มีรายการใหม่</text>
        </g>
      </Phone>
      <OneHand skin="#c99e80" side="L" layer="front" />
      
    </g>
  );
};

/** sparkles for dust used by nothing yet but kept for the sound-bed timing helpers */
export const dustSeed = (i: number) => rnd(i + clamp01(0));

import React from "react";
import { fontFamily } from "../island/fonts";
import { Hud, NightBackdrop, PAL } from "./Look";

// Extra camera angles for Part 1 (user, 2026-10-27: "ให้มันมีหลายมุมกล้องหน่อย"): face-on close-ups, the mirror, a wheel at ground level,
// the view out of the window, a top-down view and a shoes-level shot. Each takes the global frame `g` and its window [from, to] and fades over 10 frames.
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ramp = (g: number, a: number, b: number) => clamp01((g - a) / Math.max(1, b - a));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);
const FADE = 10;
const fade = (g: number, from: number, to: number) => clamp01(Math.min((g - from) / FADE, (to - g) / FADE));
const rnd = (i: number) => {
  const v = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return v - Math.floor(v);
};

/** face-on close-up of "you": eyes follow `look`, `fear` widens them and lifts the brows, `smile` is a laugh, `sweep` (0..1) drags a headlight across the face, `phone` lights it from below */
export const YouFace: React.FC<{ g: number; from: number; to: number; look?: [number, number]; fear?: number; smile?: number; sweep?: number; phone?: number; shake?: number }> = ({ g, from, to, look = [0, 0], fear = 0.3, smile = 0, sweep = -1, phone = 0, shake = 0 }) => {
  const z = lerp(1.0, 1.1, ramp(g, from, to));
  const dx = shake * Math.sin(g * 0.9) * 5;
  const blink = g % 120 > 114 ? 0.12 : 1;
  const ey = 38 * (1 + 0.35 * fear) * blink;
  const brow = 24 * fear;
  return (
    <g opacity={fade(g, from, to)}>
      <rect x={-100} y={-100} width={1300} height={2200} fill="#050810" />
      <g opacity={0.8}><NightBackdrop g={g} x0={0} x1={1080} /></g>
      <g transform={`translate(${540 + dx},780) scale(${z}) translate(-540,-780)`}>
        <g filter="url(#os-rim)">
          <rect x={450} y={960} width={180} height={160} fill="#e2b995" />
          <path d="M150 1700 Q170 1130 400 1070 L680 1070 Q910 1130 930 1700 Z" fill="#8fa6c4" />
          <path d="M400 1070 Q540 1150 680 1070" fill="none" stroke="#6a7f9c" strokeWidth={10} />
          <ellipse cx={285} cy={790} rx={34} ry={62} fill="#d6ab86" />
          <ellipse cx={795} cy={790} rx={34} ry={62} fill="#d6ab86" />
          <ellipse cx={540} cy={770} rx={255} ry={312} fill="#e2b995" />
          <path d="M283 720 Q290 440 540 430 Q790 440 797 720 Q770 568 540 556 Q310 568 283 720 Z" fill="#1c1712" />
          {[450, 630].map((cx, i) => (
            <g key={cx}>
              <ellipse cx={cx} cy={724} rx={60} ry={ey} fill="#e8e8ea" />
              <circle cx={cx + look[0] * 24} cy={724 + look[1] * 14} r={22} fill="#1a1410" />
              <circle cx={cx + look[0] * 24 + 7} cy={724 + look[1] * 14 - 7} r={6} fill="#fff" opacity={0.8} />
              <path d={i === 0 ? `M385 ${664 - brow} Q450 ${636 - brow} 512 ${664 - brow * 0.4}` : `M568 ${664 - brow * 0.4} Q630 ${636 - brow} 695 ${664 - brow}`} fill="none" stroke="#1c1712" strokeWidth={16} strokeLinecap="round" />
            </g>
          ))}
          <path d="M540 740 Q516 850 552 872" fill="none" stroke="#b98d6c" strokeWidth={9} strokeLinecap="round" />
          <path d={`M440 ${958 - 14 * smile} Q540 ${958 + 86 * smile - 24 * fear} 640 ${958 - 14 * smile}`} fill="none" stroke="#7a4a3a" strokeWidth={11} strokeLinecap="round" />
          {fear > 0.6 && smile < 0.3 && <ellipse cx={540} cy={968} rx={42} ry={14 * fear} fill="#2a1410" opacity={0.7} />}
        </g>
        {sweep >= 0 && sweep <= 1 && (
          <g>
            <clipPath id="os-headclip"><ellipse cx={540} cy={770} rx={255} ry={312} /></clipPath>
            <g clipPath="url(#os-headclip)">
              <polygon points={`${lerp(-500, 1100, sweep) - 120},420 ${lerp(-500, 1100, sweep) + 120},420 ${lerp(-500, 1100, sweep) + 60},1120 ${lerp(-500, 1100, sweep) - 180},1120`} fill={PAL.beam} opacity={0.55} filter="url(#os-soft)" />
            </g>
          </g>
        )}
        {phone > 0 && <ellipse cx={540} cy={1000} rx={330} ry={240} fill="#6fa8ff" opacity={0.28 * phone} filter="url(#os-blur)" />}
      </g>
    </g>
  );
};

/** the rear-view mirror filling the screen: two big pale eyes in a dark frame that slide toward the back seat and blink */
export const MirrorClose: React.FC<{ g: number; from: number; to: number }> = ({ g, from, to }) => {
  const z = lerp(1.0, 1.16, ramp(g, from, to));
  const t = ramp(g, from + 20, from + 70);
  const blink = (g - from) % 96 > 90 ? 0.12 : 1;
  const px = lerp(-8, -26, t);
  return (
    <g opacity={fade(g, from, to)}>
      <rect x={-100} y={-100} width={1300} height={2200} fill="#03050a" />
      <g transform={`translate(540,760) scale(${z}) translate(-540,-760)`}>
        <rect x={30} y={500} width={1020} height={520} rx={90} fill="#05080f" stroke={PAL.rim} strokeWidth={6} />
        <rect x={64} y={534} width={952} height={452} rx={60} fill="#0a1426" />
        {Array.from({ length: 5 }, (_, i) => <rect key={i} x={((i * 311 + g * (3 + i)) % 1100) - 40} y={560 + i * 70} width={120} height={14} rx={7} fill={i % 2 ? PAL.accent : "#6fa8ff"} opacity={0.12} filter="url(#os-soft)" />)}
        {[330, 750].map((cx) => (
          <g key={cx}>
            <ellipse cx={cx} cy={770} rx={118} ry={66 * blink} fill="#cfd6d9" />
            <circle cx={cx + px} cy={770} r={38 * blink} fill="#04060b" />
            <circle cx={cx + px + 10} cy={770 - 10} r={9 * blink} fill="#fff" opacity={0.7} />
            <ellipse cx={cx} cy={770} rx={118} ry={66 * blink} fill="none" stroke="#6f8196" strokeWidth={4} />
          </g>
        ))}
        <path d="M200 690 Q330 640 456 690 M624 690 Q750 640 880 690" fill="none" stroke="#04060b" strokeWidth={22} strokeLinecap="round" opacity={0.85} />
      </g>
    </g>
  );
};

/** ground level: a big wheel spinning, splashing through a puddle, the street's lights streaking past; low camera */
export const WheelLow: React.FC<{ g: number; from: number; to: number }> = ({ g, from, to }) => {
  const rot = (g - from) * 26;
  return (
    <g opacity={fade(g, from, to)}>
      <rect x={-100} y={-100} width={1300} height={2200} fill="#04060d" />
      {Array.from({ length: 7 }, (_, i) => {
        const x = ((i * 260 - (g - from) * 38) % 1500 + 1500) % 1500 - 200;
        return <g key={i}><rect x={x} y={760 + (i % 3) * 40} width={150} height={10} rx={5} fill={i % 2 ? PAL.accent : "#6fa8ff"} opacity={0.3} filter="url(#os-soft)" /></g>;
      })}
      <rect x={-100} y={1250} width={1300} height={900} fill="#07101f" />
      <line x1={-100} y1={1250} x2={1200} y2={1250} stroke={PAL.rim} strokeWidth={3} opacity={0.35} />
      <ellipse cx={540} cy={1345} rx={560} ry={70} fill="#0a1a38" />
      <ellipse cx={540} cy={1345} rx={360} ry={34} fill={PAL.accent} opacity={0.18} filter="url(#os-soft)" />
      <path d="M170 980 Q540 620 910 980 L910 1100 L170 1100 Z" fill="#0c1424" stroke={PAL.rim} strokeWidth={5} opacity={0.95} />
      <circle cx={540} cy={1010} r={250} fill="#04060b" />
      <circle cx={540} cy={1010} r={250} fill="none" stroke={PAL.rim} strokeWidth={4} opacity={0.55} />
      <g transform={`rotate(${rot} 540 1010)`}>
        {Array.from({ length: 5 }, (_, i) => <rect key={i} x={528} y={800} width={24} height={210} rx={10} fill="#16213a" transform={`rotate(${i * 72} 540 1010)`} />)}
      </g>
      <circle cx={540} cy={1010} r={78} fill="#111a2c" stroke={PAL.rim} strokeWidth={3} opacity={0.9} />
      {Array.from({ length: 26 }, (_, i) => {
        const a = rnd(i + (Math.floor((g - from) / 3)) * 7) * Math.PI;
        const r = 40 + rnd(i + 5) * 190;
        return <circle key={i} cx={540 + Math.cos(a + 3.3) * r * 1.6} cy={1260 - Math.sin(a) * r * 0.9} r={3 + rnd(i + 9) * 4} fill={PAL.beam} opacity={0.5} />;
      })}
      {Array.from({ length: 40 }, (_, i) => {
        const x = rnd(i + 80) * 1080;
        const y = ((rnd(i + 120) * 2000 + (g - from) * (40 + rnd(i + 160) * 30)) % 1500) - 100;
        return <line key={i} x1={x} y1={y} x2={x - 10} y2={y + 56} stroke={PAL.beam} strokeWidth={2} opacity={0.3} />;
      })}
    </g>
  );
};

/** looking out of the window from inside the room: rain on the glass, a car's lights turning in and stopping at the gate */
export const WindowPOV: React.FC<{ g: number; from: number; to: number }> = ({ g, from, to }) => {
  const t = smooth(ramp(g, from + 10, to - 20));
  const lx = lerp(120, 620, t);
  const sz = lerp(14, 70, t);
  const drops = Array.from({ length: 16 }, (_, i) => {
    const x = 120 + rnd(i + 30) * 840;
    const y = 360 + ((rnd(i + 60) * 1000 + (g - from) * (1.5 + rnd(i + 90) * 3)) % 900);
    return <g key={i}><circle cx={x} cy={y} r={6 + rnd(i) * 6} fill={PAL.beam} opacity={0.22} /><line x1={x} y1={y - 80} x2={x} y2={y} stroke={PAL.beam} strokeWidth={3} opacity={0.1} /></g>;
  });
  return (
    <g opacity={fade(g, from, to)}>
      <NightBackdrop g={g} x0={0} x1={1080} />
      <rect x={0} y={1040} width={1080} height={400} fill="#06101f" />
      <rect x={90} y={1030} width={900} height={10} fill={PAL.rim} opacity={0.18} />
      {/* the car turning in: two lights growing, a dark body behind them, the beams sweeping the street */}
      <g opacity={0.95}>
        <rect x={lx - sz * 2.4} y={1040 - sz * 1.1} width={sz * 4.8 + 120} height={sz * 1.6} rx={sz * 0.3} fill="#070b14" opacity={t} />
        {[0, 1].map((k) => <circle key={k} cx={lx + k * (sz * 3.2)} cy={1040 - sz * 0.45} r={sz} fill={PAL.beam} opacity={0.95} filter="url(#os-soft)" />)}
        <polygon points={`${lx},${1040 - sz * 0.4} ${lx + 900},${1040 - 260} ${lx + 900},${1040 + 120}`} fill={PAL.beam} opacity={0.12 + 0.12 * t} filter="url(#os-blur)" />
      </g>
      {drops}
      {/* the window frame: dark bars and the sill, a lit edge as the beams cross */}
      <rect x={0} y={0} width={1080} height={300} fill="#060a14" />
      <rect x={0} y={1400} width={1080} height={520} fill="#070b14" />
      <rect x={0} y={0} width={90} height={1920} fill="#060a14" />
      <rect x={990} y={0} width={90} height={1920} fill="#060a14" />
      <rect x={528} y={300} width={24} height={1100} fill="#08101e" />
      <rect x={90} y={760} width={900} height={20} fill="#08101e" />
      <rect x={60} y={1380} width={960} height={30} fill="#111b30" stroke={PAL.rim} strokeWidth={2} opacity={0.9} />
      <rect x={0} y={0} width={1080} height={1920} fill={PAL.beam} opacity={0.05 * t} />
    </g>
  );
};

/** top-down: the street as a night map, "you" a small light running, the car behind with two cones of light at a constant distance */
export const Aerial: React.FC<{ g: number; from: number; to: number }> = ({ g, from, to }) => {
  const t = ramp(g, from, to);
  const runner = { x: lerp(160, 900, smooth(t)), y: lerp(1180, 600, smooth(t)) };
  const dir = Math.atan2(600 - 1180, 900 - 160);
  const car = { x: runner.x - Math.cos(dir) * 360, y: runner.y - Math.sin(dir) * 360 };
  const deg = (dir * 180) / Math.PI;
  const blocks = Array.from({ length: 20 }, (_, i) => {
    const col = i % 4;
    const row = Math.floor(i / 4);
    return <rect key={i} x={20 + col * 270 + (row % 2) * 40} y={140 + row * 300} width={210 + rnd(i) * 40} height={220 + rnd(i + 3) * 30} rx={10} fill="#0b1426" stroke="#1d2a44" strokeWidth={3} />;
  });
  return (
    <g opacity={fade(g, from, to)}>
      <rect x={-100} y={-100} width={1300} height={2200} fill="#060a14" />
      <g transform={`rotate(${lerp(-4, 4, t)} 540 960) translate(540,960) scale(${lerp(1.0, 1.12, t)}) translate(-540,-960)`}>
        {blocks}
        {Array.from({ length: 8 }, (_, i) => <rect key={i} x={30 + rnd(i + 11) * 900} y={160 + rnd(i + 12) * 1300} width={50} height={36} rx={4} fill="#16213a" />)}
        <polygon points={`${car.x},${car.y} ${car.x + Math.cos(dir - 0.28) * 760},${car.y + Math.sin(dir - 0.28) * 760} ${car.x + Math.cos(dir + 0.28) * 760},${car.y + Math.sin(dir + 0.28) * 760}`} fill={PAL.beam} opacity={0.2} filter="url(#os-soft)" />
        <g transform={`translate(${car.x},${car.y}) rotate(${deg})`}>
          <rect x={-90} y={-34} width={180} height={68} rx={22} fill="#0e1526" stroke={PAL.rim} strokeWidth={3} />
          <rect x={-30} y={-26} width={60} height={52} rx={10} fill="#060a14" />
        </g>
        <circle cx={runner.x} cy={runner.y} r={46} fill={PAL.accent} opacity={0.2} filter="url(#os-soft)" />
        <circle cx={runner.x} cy={runner.y} r={14} fill="#e8eefc" />
      </g>
      <Hud lines={["ถึงใน 1 นาที", "คนขับกำลังมารับคุณ"]} />
      <text x={540} y={1500} fontSize={1} fontFamily={fontFamily} fill="none">.</text>
    </g>
  );
};

/** shoes level: two shoes hitting wet road, splashes, the beams from behind stretching the shadows ahead */
export const FeetClose: React.FC<{ g: number; from: number; to: number }> = ({ g, from, to }) => {
  const ph = (g - from) * 0.55;
  const a = Math.sin(ph);
  const b = Math.sin(ph + Math.PI);
  const shoe = (x: number, lift: number, key: string) => (
    <g key={key} transform={`translate(${x},${1180 - Math.max(0, lift) * 70})`} filter="url(#os-rim)">
      <rect x={-34} y={-420} width={68} height={330} fill="#2b3140" />
      <path d="M-40 -96 L26 -96 L26 -50 Q150 -50 154 4 L154 36 L-40 36 Z" fill="#1a1a1a" />
      <rect x={-40} y={20} width={194} height={16} fill="#0a0c12" />
    </g>
  );
  return (
    <g opacity={fade(g, from, to)}>
      <rect x={-100} y={-100} width={1300} height={2200} fill="#05080f" />
      <rect x={-100} y={1060} width={1300} height={1000} fill="#08101f" />
      <line x1={-100} y1={1060} x2={1200} y2={1060} stroke={PAL.rim} strokeWidth={2} opacity={0.3} />
      {/* two long beams and the stretched shadows of the legs */}
      <polygon points="-200,900 1300,700 1300,1200 -200,1260" fill={PAL.beam} opacity={0.14} filter="url(#os-blur)" />
      <ellipse cx={760} cy={1230} rx={420} ry={26} fill="#02040a" opacity={0.7} />
      <ellipse cx={600} cy={1330} rx={460} ry={90} fill="#0a1a38" />
      <ellipse cx={600} cy={1330} rx={300} ry={36} fill={PAL.accent} opacity={0.2} filter="url(#os-soft)" />
      {shoe(330 + a * 70, Math.max(0, Math.cos(ph)), "a")}
      {shoe(640 + b * 70, Math.max(0, -Math.cos(ph)), "b")}
      {Array.from({ length: 30 }, (_, i) => {
        const k = Math.floor((g - from) / 6);
        const x = 300 + rnd(i + k * 3) * 520;
        const r = 4 + rnd(i + 9) * 5;
        const y = 1215 - rnd(i + 20 + k) * 150 * Math.abs(Math.cos(ph));
        return <circle key={i} cx={x} cy={y} r={r} fill={PAL.beam} opacity={0.4} />;
      })}
      {Array.from({ length: 40 }, (_, i) => {
        const x = rnd(i + 80) * 1080;
        const y = ((rnd(i + 120) * 2000 + (g - from) * (40 + rnd(i + 160) * 30)) % 1500) - 100;
        return <line key={`r${i}`} x1={x} y1={y} x2={x - 10} y2={y + 56} stroke={PAL.beam} strokeWidth={2} opacity={0.25} />;
      })}
    </g>
  );
};

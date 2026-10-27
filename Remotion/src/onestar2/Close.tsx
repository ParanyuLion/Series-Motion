import React from "react";
import { fontFamily } from "../island/fonts";
import { Actor, PAL } from "../onestar1/Look";
import { AngleProps, Hand, Layer, Rain, lerp, ramp, rnd, smooth } from "./util";

// Part 2 close-ups and the train: the phone at 8 percent, the phone switched off, the lanyard, the train door, the window, the cable, the message.

const PhoneBody: React.FC<{ x?: number; y?: number; children: React.ReactNode; tilt?: number }> = ({ x = 290, y = 400, children, tilt = 0 }) => (
  <g transform={`translate(${x},${y}) rotate(${tilt} 250 500)`}>
    <rect x={0} y={0} width={500} height={1000} rx={64} fill="#05080f" stroke={PAL.rim} strokeWidth={5} />
    <rect x={22} y={26} width={456} height={948} rx={48} fill="#0e1830" />
    {children}
  </g>
);

/** the phone on its last percent: a nearly empty battery, "8%" big and red, the app's quiet notice under it */
export const PhoneBattery: React.FC<AngleProps> = (p) => {
  const { g, from } = p;
  const pulse = 0.7 + 0.3 * Math.sin((g - from) * 0.25);
  return (
    <Layer {...p} bg="#050a18">
      <ellipse cx={540} cy={900} rx={520} ry={640} fill="#ff6b5e" opacity={0.07 * pulse} filter="url(#os-blur)" />
      <PhoneBody tilt={-3}>
        <text x={250} y={300} fontSize={230} fill="#ff7a6e" textAnchor="middle" fontFamily={fontFamily}>8%</text>
        <g transform="translate(120,380)"><rect width={260} height={110} rx={20} fill="none" stroke="#ff7a6e" strokeWidth={8} /><rect x={270} y={34} width={18} height={42} rx={6} fill="#ff7a6e" /><rect x={14} y={14} width={26} height={82} rx={8} fill="#ff7a6e" opacity={pulse} /></g>
        <text x={250} y={620} fontSize={40} fill={PAL.rim} textAnchor="middle" fontFamily={fontFamily}>แบตเตอรี่ใกล้หมด</text>
        <rect x={50} y={700} width={400} height={150} rx={28} fill="#16264a" />
        <text x={250} y={760} fontSize={30} fill={PAL.rim} textAnchor="middle" fontFamily={fontFamily}>แอปเรียกรถ</text>
        <text x={250} y={816} fontSize={40} fill={PAL.accent} textAnchor="middle" fontFamily={fontFamily}>กำลังติดตามอยู่</text>
      </PhoneBody>
    </Layer>
  );
};

/** the same phone being switched off: the slide, the screen going black, the glow dying */
export const PhoneOff: React.FC<AngleProps> = (p) => {
  const { g, from, to } = p;
  const t = ramp(g, from + 14, to - 18);
  const on = 1 - smooth(ramp(t, 0.55, 1));
  return (
    <Layer {...p} bg="#050a18">
      <ellipse cx={540} cy={900} rx={520} ry={640} fill="#6fa8ff" opacity={0.1 * on} filter="url(#os-blur)" />
      <PhoneBody tilt={2}>
        <rect x={22} y={26} width={456} height={948} rx={48} fill="#000" opacity={1 - on} />
        <g opacity={on}>
          <text x={250} y={420} fontSize={44} fill="#e8eefc" textAnchor="middle" fontFamily={fontFamily}>ปิดเครื่อง</text>
          <rect x={80} y={540} width={340} height={110} rx={55} fill="#16264a" />
          <circle cx={lerp(135, 365, smooth(Math.min(1, t * 2)))} cy={595} r={46} fill="#e8eefc" />
          <path d="M250 330 L250 370" stroke="#e8eefc" strokeWidth={0} />
        </g>
      </PhoneBody>
    </Layer>
  );
};

/** the strap and the pass in close-up: name, place of work and a photo of "you" */
export const LanyardClose: React.FC<AngleProps> = (p) => {
  const { g, from } = p;
  const sw = Math.sin((g - from) * 0.12) * 5;
  return (
    <Layer {...p} bg="#050a18">
      <ellipse cx={540} cy={900} rx={520} ry={600} fill="#6fa8ff" opacity={0.12} filter="url(#os-blur)" />
      <g transform={`rotate(${sw} 540 -100)`}>
        <polygon points="480,-100 540,-100 580,520 520,520" fill="#3a5a8a" />
        <g filter="url(#os-rim)">
          <rect x={290} y={520} width={500} height={760} rx={36} fill="#e8eefc" />
          <rect x={440} y={490} width={200} height={50} rx={14} fill="#9fb4d6" />
          <rect x={290} y={520} width={500} height={150} rx={36} fill="#2a4a8a" />
          <text x={540} y={620} fontSize={46} fill="#e8eefc" textAnchor="middle" fontFamily={fontFamily}>บัตรพนักงาน</text>
          <rect x={390} y={700} width={300} height={330} rx={20} fill="#8fa6c4" />
          <ellipse cx={540} cy={820} rx={80} ry={96} fill="#e2b995" />
          <path d="M458 810 Q462 720 540 716 Q618 720 622 810 Q600 750 540 748 Q480 750 458 810 Z" fill="#1c1712" />
          <path d="M440 1030 Q440 930 540 920 Q640 930 640 1030 Z" fill="#8fa6c4" />
          <text x={540} y={1100} fontSize={54} fill="#0e1830" textAnchor="middle" fontFamily={fontFamily}>คุณ</text>
          <text x={540} y={1170} fontSize={36} fill="#3a4a6a" textAnchor="middle" fontFamily={fontFamily}>ฝ่ายขาย · ชั้น 12</text>
          <rect x={360} y={1200} width={360} height={36} fill="#0e1830" opacity={0.8} />
        </g>
      </g>
    </Layer>
  );
};

/** inside the carriage: the door sliding shut, the platform and the rain behind its glass, "you" just inside */
export const TrainDoor: React.FC<AngleProps> = (p) => {
  const { g, from, to } = p;
  const t = smooth(ramp(g, from + 10, to - 14));
  const half = lerp(0, 262, t);
  return (
    <Layer {...p} bg="#04070e">
      <rect x={130} y={280} width={820} height={1150} fill="#07101f" />
      {Array.from({ length: 9 }, (_, i) => <circle key={i} cx={200 + i * 90} cy={760 + (i % 3) * 50} r={40 + (i % 2) * 24} fill={i % 2 ? PAL.accent : "#6fa8ff"} opacity={0.25} filter="url(#os-blur)" />)}
      <rect x={130} y={1180} width={820} height={250} fill="#0a1426" />
      <rect x={130} y={1170} width={820} height={14} fill={PAL.accent} opacity={0.6} />
      <rect x={130} y={280} width={262 - half + 130 - 130} height={1150} fill="none" />
      <rect x={130} y={280} width={half} height={1150} fill="#16213a" stroke={PAL.rim} strokeWidth={4} opacity={0.95} />
      <rect x={950 - half} y={280} width={half} height={1150} fill="#16213a" stroke={PAL.rim} strokeWidth={4} opacity={0.95} />
      <rect x={0} y={0} width={130} height={1920} fill="#0b1224" /><rect x={950} y={0} width={130} height={1920} fill="#0b1224" />
      <rect x={0} y={0} width={1080} height={280} fill="#0b1224" /><rect x={0} y={1430} width={1080} height={490} fill="#0a101e" />
      <rect x={510} y={0} width={36} height={1920} fill="#1c2a44" /><rect x={510} y={0} width={6} height={1920} fill={PAL.rim} opacity={0.5} />
      <Actor id="osYou" x={310} y={1400} scale={1.5} g={g} fear={0.7} facing={1} />
      <rect x={400} y={200} width={280} height={44} rx={22} fill={PAL.accent} opacity={0.3 + 0.7 * (Math.floor((g - from) / 8) % 2)} />
      <Rain g={g} from={from} n={14} op={0.14} />
    </Layer>
  );
};

/** out of the window as the train pulls away: the platform slides by, a tall dark shape stands still with one raised arm waving slowly */
export const TrainWindow: React.FC<AngleProps> = (p) => {
  const { g, from, to } = p;
  const t = ramp(g, from, to);
  const sx = -t * 260;
  const wave = Math.sin((g - from) * 0.1) * 16;
  return (
    <Layer {...p} bg="#04070e">
      <clipPath id="os-trwin"><rect x={90} y={300} width={900} height={1100} rx={60} /></clipPath>
      <g clipPath="url(#os-trwin)">
        <rect x={0} y={300} width={1080} height={1100} fill="#07101f" />
        {Array.from({ length: 10 }, (_, i) => <circle key={i} cx={90 + i * 110 + sx * 0.3} cy={520 + (i % 3) * 60} r={40 + (i % 2) * 20} fill={i % 2 ? PAL.accent : "#6fa8ff"} opacity={0.2} filter="url(#os-blur)" />)}
        {[200, 760, 1320].map((x) => <rect key={x} x={x + sx * 1.4} y={300} width={56} height={900} fill="#0c1426" />)}
        <rect x={0} y={1180} width={1080} height={26} fill="#16213a" /><rect x={0} y={1166} width={1080} height={12} fill={PAL.accent} opacity={0.7} />
        <rect x={0} y={1206} width={1080} height={200} fill="#050a14" />
        <g transform={`translate(${590 + sx * 0.7},1170)`} filter="url(#os-rim)">
          <path d="M-46 0 L-40 -300 Q-30 -420 0 -420 Q30 -420 40 -300 L46 0 Z" fill="#161c28" />
          <circle cx={0} cy={-470} r={44} fill="#10161f" />
          <path d="M-46 -470 Q0 -540 46 -470 L60 -462 L-60 -462 Z" fill="#0a0f18" />
          <g transform={`translate(34,-380) rotate(${-150 + wave})`}><rect x={-14} y={0} width={28} height={190} rx={14} fill="#161c28" /><circle cx={0} cy={200} r={20} fill="#10161f" /></g>
        </g>
        <polygon points="140,1190 520,1080 520,1280" fill={PAL.beam} opacity={0.08} filter="url(#os-blur)" />
        <circle cx={150 + sx * 0.5} cy={1190} r={20} fill={PAL.beam} filter="url(#os-soft)" opacity={0.8} />
      </g>
      <rect x={90} y={300} width={900} height={1100} rx={60} fill="none" stroke={PAL.rim} strokeWidth={6} opacity={0.7} />
      {Array.from({ length: 22 }, (_, i) => {
        const x = 110 + rnd(i + 600) * 860;
        const y = 330 + ((rnd(i + 630) * 1000 + (g - from) * (2 + rnd(i + 660) * 4)) % 1040);
        return <g key={i}><circle cx={x} cy={y} r={5 + rnd(i) * 7} fill={PAL.beam} opacity={0.22} /><line x1={x} y1={y - 90} x2={x} y2={y} stroke={PAL.beam} strokeWidth={3} opacity={0.1} /></g>;
      })}
    </Layer>
  );
};

/** the cable goes into the power bank: a drawn plug slides into the port, then the small display and the indicator light up */
export const CablePlug: React.FC<AngleProps> = (p) => {
  const { g, from, to } = p;
  const t = smooth(ramp(g, from + 8, to - 24));
  const lit = smooth(ramp(g, from + 8 + (to - from) * 0.5, to - 8));
  const px = lerp(940, 852, t);
  return (
    <Layer {...p} bg="#04070e">
      <ellipse cx={540} cy={900} rx={560} ry={420} fill="#6fa8ff" opacity={0.08 + 0.1 * lit} filter="url(#os-blur)" />
      <rect x={0} y={1180} width={1080} height={740} fill="#0a101e" />
      <g transform="translate(130,640)" filter="url(#os-rim)">
        <rect x={0} y={0} width={720} height={420} rx={44} fill="#aebccb" />
        <rect x={0} y={0} width={720} height={150} rx={44} fill="#c6d3df" />
        <rect x={690} y={120} width={40} height={90} rx={10} fill="#10161f" />
        <rect x={690} y={250} width={40} height={50} rx={10} fill="#10161f" />
        <rect x={50} y={60} width={150} height={90} rx={12} fill="#0b1522" />
        <text x={125} y={125} fontSize={46} fill="#7fe0c8" textAnchor="middle" fontFamily={fontFamily} opacity={lit}>87%</text>
        {[0, 1, 2, 3].map((i) => <circle key={i} cx={260 + i * 46} cy={105} r={11} fill={PAL.accent} opacity={lit * (i < 3 ? 1 : 0.4)} />)}
      </g>
      <circle cx={820} cy={745} r={90} fill={PAL.accent} opacity={0.35 * lit} filter="url(#os-soft)" />
      <g transform={`translate(${px},895)`} filter="url(#os-rim)">
        <rect x={0} y={-24} width={110} height={48} rx={8} fill="#8a96a6" />
        <rect x={110} y={-44} width={110} height={88} rx={14} fill="#10161f" />
        <path d="M220 0 Q460 40 700 0 L900 140" fill="none" stroke="#10161f" strokeWidth={22} strokeLinecap="round" />
      </g>
      <Hand x={px + 360} y={1010} rot={-80} s={0.9} />
    </Layer>
  );
};

/** the dark phone on the seat waking up: the glow grows, the last message and the countdown at zero */
export const PhoneMsg: React.FC<AngleProps> = (p) => {
  const { g, from, to } = p;
  const t = smooth(ramp(g, from + 20, from + 40));
  const o = ramp(g, from + 36, from + 52);
  return (
    <Layer {...p} bg="#03050a">
      <ellipse cx={540} cy={880} rx={560} ry={720} fill="#6fa8ff" opacity={0.22 * t} filter="url(#os-blur)" />
      <PhoneBody y={360}>
        <rect x={22} y={26} width={456} height={948} rx={48} fill="#000" opacity={1 - t} />
        <g opacity={t}>
          <text x={250} y={230} fontSize={120} fill="#e8eefc" textAnchor="middle" fontFamily={fontFamily} opacity={0.9}>00:42</text>
          <rect x={36} y={330} width={428} height={380} rx={34} fill="#14203c" stroke="#2a3a5c" strokeWidth={3} opacity={o} />
          <text x={70} y={392} fontSize={28} fill={PAL.rim} fontFamily={fontFamily} opacity={o}>แอปเรียกรถ · ตอนนี้</text>
          <text x={70} y={462} fontSize={36} fill="#e8eefc" fontFamily={fontFamily} opacity={o}>คนขับ: ผมไปรอที่บ้าน</text>
          <text x={70} y={512} fontSize={36} fill="#e8eefc" fontFamily={fontFamily} opacity={o}>คุณแล้วนะครับ</text>
          <text x={250} y={640} fontSize={60} fill={PAL.accent} textAnchor="middle" fontFamily={fontFamily} opacity={o}>ถึงแล้ว</text>
        </g>
      </PhoneBody>
    </Layer>
  );
};

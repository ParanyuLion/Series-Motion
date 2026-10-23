import React from "react";

// A design sheet for the snake with a human head (the village's pattern and the real snakes in the forest). Three unsettling faces for the user to choose from.
const Body: React.FC = () => (
  <g>
    <path d="M-70 330 C-190 220 -150 110 -30 70 C60 40 80 -30 10 -80" fill="none" stroke="#2c2a1f" strokeWidth={88} strokeLinecap="round" />
    <path d="M-70 330 C-190 220 -150 110 -30 70 C60 40 80 -30 10 -80" fill="none" stroke="#5a5539" strokeWidth={14} strokeLinecap="round" strokeDasharray="0 20" />
    <path d="M-70 330 C-190 220 -150 110 -30 70 C60 40 80 -30 10 -80" fill="none" stroke="#3a3726" strokeWidth={14} strokeLinecap="round" strokeDasharray="0 20" strokeDashoffset={10} transform="translate(-22,0)" />
    <path d="M-70 330 C-190 220 -150 110 -30 70 C60 40 80 -30 10 -80" fill="none" stroke="#7b7456" strokeWidth={5} strokeLinecap="round" opacity={0.5} transform="translate(30,-6)" />
    {/* neck rings where the snake turns into a person */}
    {[0, 1, 2].map((i) => <path key={i} d={`M${-34 + i * 2} ${-70 - i * 16} q40 12 78 -2`} stroke="#8c7a5c" strokeWidth={4} fill="none" opacity={0.7} />)}
  </g>
);

const Head: React.FC<{ tilt?: number; children: React.ReactNode; skin?: string }> = ({ tilt = 0, children, skin = "#cbb8a0" }) => (
  <g transform={`translate(12,-190) rotate(${tilt})`}>
    <defs>
      <radialGradient id="sp-skin" cx="0.5" cy="0.4" r="0.7"><stop offset="0" stopColor={skin} /><stop offset="1" stopColor="#8f7e68" /></radialGradient>
    </defs>
    <ellipse cx={0} cy={0} rx={82} ry={104} fill="url(#sp-skin)" />
    <ellipse cx={-84} cy={4} rx={9} ry={22} fill="#b8a48c" />
    <ellipse cx={84} cy={4} rx={9} ry={22} fill="#b8a48c" />
    {children}
  </g>
);

/** 1: a smile far too wide, eyes that never blink, split pupils */
const V1: React.FC = () => (
  <g>
    <Body />
    <Head>
      {[-34, 36].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy={-22} rx={25} ry={30} fill="#efeadb" stroke="#6b5b48" strokeWidth={2} />
          <ellipse cx={x} cy={-22} rx={5} ry={26} fill="#0a0806" />
          <path d={`M${x - 25} -22 Q${x} -60 ${x + 25} -22`} stroke="#6b5b48" strokeWidth={2} fill="none" opacity={0.6} />
        </g>
      ))}
      <path d="M-6 -6 Q-12 22 -6 34 Q2 38 10 34" stroke="#8c7a64" strokeWidth={3} fill="none" opacity={0.8} />
      <path d="M-78 40 Q0 112 88 38" stroke="#3a2418" strokeWidth={5} fill="#2a1612" />
      {Array.from({ length: 15 }, (_, i) => {
        const t = (i + 0.5) / 15;
        const x = -74 + t * 158;
        const y = 40 + Math.sin(Math.PI * t) * 54 - 6;
        return <rect key={i} x={x - 4} y={y - 4} width={8} height={11} fill="#f1ecdc" opacity={0.95} />;
      })}
      <path d="M2 86 L-6 128 M2 86 L12 126" stroke="#7a2f2a" strokeWidth={4} strokeLinecap="round" />
    </Head>
  </g>
);

/** 2: a smooth mask of a face: black hollow eyes with a pinpoint of light, no mouth, only a seam */
const V2: React.FC = () => (
  <g>
    <Body />
    <Head skin="#d4c8b4">
      {[-34, 36].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy={-20} rx={22} ry={34} fill="#050403" />
          <circle cx={x + 5} cy={-30} r={3} fill="#e8e4d6" />
        </g>
      ))}
      <path d="M-4 8 Q-8 28 -4 40" stroke="#a9987f" strokeWidth={3} fill="none" opacity={0.7} />
      <path d="M-40 68 Q4 74 50 66" stroke="#6a5a48" strokeWidth={3} fill="none" opacity={0.8} />
      <path d="M-40 68 Q4 74 50 66" stroke="#2a1d14" strokeWidth={1.5} fill="none" strokeDasharray="6 5" />
    </Head>
  </g>
);

/** 3: the sleeping face: one eye closed and smiling, the other open and watching you, the head tilted */
const V3: React.FC = () => (
  <g>
    <Body />
    <Head tilt={9}>
      <path d="M-58 -24 Q-34 -4 -10 -24" stroke="#2a1a12" strokeWidth={5} fill="none" strokeLinecap="round" />
      <g>
        <ellipse cx={38} cy={-22} rx={27} ry={30} fill="#f1ecdd" stroke="#6b5b48" strokeWidth={2} />
        <ellipse cx={42} cy={-20} rx={7} ry={27} fill="#0a0806" />
        <circle cx={44} cy={-30} r={3} fill="#fff" />
      </g>
      <path d="M-6 -6 Q-12 22 -6 34 Q2 38 10 34" stroke="#8c7a64" strokeWidth={3} fill="none" opacity={0.8} />
      <path d="M-44 66 Q10 92 62 62" stroke="#5a2f26" strokeWidth={4} fill="none" strokeLinecap="round" />
      <path d="M-70 -70 Q-30 -98 20 -92" stroke="#8c7a64" strokeWidth={3} fill="none" opacity={0.5} />
    </Head>
  </g>
);

export const SnakePreview: React.FC = () => (
  <svg width={1500} height={900} viewBox="0 0 1500 900" style={{ display: "block", background: "#14170f" }}>
    <defs>
      <radialGradient id="sp-bg" cx="0.5" cy="0.4" r="0.8"><stop offset="0" stopColor="#3b3f33" /><stop offset="1" stopColor="#0c0e09" /></radialGradient>
    </defs>
    <rect width={1500} height={900} fill="url(#sp-bg)" />
    {[V1, V2, V3].map((V, i) => (
      <g key={i} transform={`translate(${250 + i * 500},520)`}>
        <V />
        <text x={0} y={380} textAnchor="middle" fontFamily="sans-serif" fontSize={34} fill="#d8d4c0">{["1  ยิ้มกว้างเกินไป", "2  หน้ากากไร้ปาก", "3  ตาข้างเดียวที่มองคุณ"][i]}</text>
      </g>
    ))}
  </svg>
);

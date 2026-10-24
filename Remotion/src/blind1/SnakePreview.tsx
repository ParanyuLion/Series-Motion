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

export const Head: React.FC<{ tilt?: number; children: React.ReactNode; skin?: string; x?: number; y?: number; s?: number }> = ({ tilt = 0, children, skin = "#cbb8a0", x = 12, y = -190, s = 1 }) => (
  <g transform={`translate(${x},${y}) rotate(${tilt}) scale(${s})`}>
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

/** A: a kind, ordinary middle-aged face with a warm smile: only the pupils are wrong */
const A: React.FC = () => (
  <g>
    <Body />
    <Head skin="#d9b996">
      <path d="M-82 -24 Q-90 -110 0 -112 Q90 -110 82 -24 Q60 -80 0 -82 Q-60 -80 -82 -24 Z" fill="#6b6b66" />
      <path d="M-60 -52 Q-36 -64 -14 -54 M14 -54 Q36 -64 60 -52" stroke="#4a4a46" strokeWidth={6} fill="none" strokeLinecap="round" />
      {[-34, 34].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy={-26} rx={19} ry={13} fill="#f4efe2" stroke="#6b5b48" strokeWidth={2} />
          <ellipse cx={x} cy={-26} rx={4} ry={13} fill="#0a0806" />
          <path d={`M${x - 22} -22 q22 14 44 0`} stroke="#9a7a60" strokeWidth={3} fill="none" opacity={0.6} />
        </g>
      ))}
      <path d="M-4 -10 Q-12 20 -4 32 Q4 36 12 32" stroke="#a9805e" strokeWidth={3} fill="none" />
      <path d="M-42 58 Q4 88 54 56" stroke="#7a3a2c" strokeWidth={5} fill="none" strokeLinecap="round" />
      <path d="M-62 30 Q-54 50 -44 56 M70 30 Q62 50 54 56" stroke="#b89a78" strokeWidth={3} fill="none" opacity={0.7} />
    </Head>
  </g>
);

/** B: the face is upside down on the neck: the mouth is above the eyes */
const B: React.FC = () => (
  <g>
    <Body />
    <Head>
      <g transform="rotate(180)">
        {[-30, 34].map((x) => (
          <g key={x}>
            <ellipse cx={x} cy={-18} rx={21} ry={24} fill="#efeadb" stroke="#6b5b48" strokeWidth={2} />
            <circle cx={x} cy={-18} r={10} fill="#0a0806" />
          </g>
        ))}
        <path d="M-4 -2 Q-10 22 -4 32 Q4 36 10 32" stroke="#8c7a64" strokeWidth={3} fill="none" />
        <path d="M-46 62 Q4 90 54 60" stroke="#5a2f26" strokeWidth={5} fill="none" strokeLinecap="round" />
      </g>
    </Head>
  </g>
);

/** C: eyes on the sides of the head like a snake's, a human nose and a small human mouth in the middle */
const C: React.FC = () => (
  <g>
    <Body />
    <Head skin="#c9b8a0">
      {[-70, 74].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy={-10} rx={19} ry={26} fill="#efeadb" stroke="#6b5b48" strokeWidth={2} />
          <ellipse cx={x} cy={-10} rx={4} ry={22} fill="#0a0806" />
        </g>
      ))}
      <path d="M0 -50 Q-10 0 -6 20 Q0 26 8 20" stroke="#8c7a64" strokeWidth={4} fill="none" />
      <ellipse cx={-4} cy={22} rx={12} ry={7} fill="#a9987f" opacity={0.6} />
      <path d="M-26 62 Q2 74 30 62" stroke="#4a2a22" strokeWidth={5} fill="none" strokeLinecap="round" />
    </Head>
  </g>
);

/** D: a porcelain doll or ventriloquist dummy: glossy white skin, painted cheeks and smile, a hinge at the jaw, glass eyes */
const D: React.FC = () => (
  <g>
    <Body />
    <Head skin="#f1ede4">
      <ellipse cx={-44} cy={20} rx={20} ry={13} fill="#d98a7a" opacity={0.7} />
      <ellipse cx={50} cy={20} rx={20} ry={13} fill="#d98a7a" opacity={0.7} />
      {[-34, 36].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy={-22} rx={22} ry={26} fill="#fbfaf5" stroke="#3a2c24" strokeWidth={3} />
          <circle cx={x} cy={-22} r={16} fill="#2d4a58" />
          <ellipse cx={x} cy={-22} rx={4} ry={16} fill="#050403" />
          <circle cx={x - 6} cy={-30} r={4} fill="#fff" />
          {Array.from({ length: 5 }, (_, i) => <line key={i} x1={x - 22 + i * 11} y1={-46} x2={x - 26 + i * 12} y2={-58} stroke="#2a1a12" strokeWidth={3} strokeLinecap="round" />)}
        </g>
      ))}
      <path d="M-4 -4 Q-8 16 -2 24" stroke="#cdc6b6" strokeWidth={3} fill="none" />
      <path d="M-48 52 Q4 82 58 50" stroke="#b02a2a" strokeWidth={9} fill="none" strokeLinecap="round" />
      <path d="M-78 30 Q-72 70 -50 84 M78 30 Q72 70 52 84" stroke="#9a948a" strokeWidth={3} fill="none" />
      <circle cx={-78} cy={30} r={4} fill="#9a948a" />
      <circle cx={80} cy={30} r={4} fill="#9a948a" />
    </Head>
  </g>
);

/** E: three eyes in a vertical line, a calm closed mouth */
const E: React.FC = () => (
  <g>
    <Body />
    <Head skin="#d0c0a8">
      {[-62, -20, 22].map((y, i) => (
        <g key={y}>
          <ellipse cx={i === 1 ? 2 : 0} cy={y} rx={i === 1 ? 26 : 19} ry={i === 1 ? 16 : 11} fill="#efeadb" stroke="#6b5b48" strokeWidth={2} />
          <ellipse cx={i === 1 ? 2 : 0} cy={y} rx={4} ry={i === 1 ? 16 : 11} fill="#0a0806" />
        </g>
      ))}
      <path d="M-30 66 Q2 72 36 64" stroke="#5a2f26" strokeWidth={4} fill="none" strokeLinecap="round" />
    </Head>
  </g>
);

/** F: calm eyes, and a long vertical mouth like a held note, black inside */
const F: React.FC = () => (
  <g>
    <Body />
    <Head skin="#cfc2ae">
      {[-34, 36].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy={-48} rx={21} ry={17} fill="#efeadb" stroke="#6b5b48" strokeWidth={2} />
          <circle cx={x} cy={-48} r={9} fill="#0a0806" />
        </g>
      ))}
      <path d="M-2 -28 Q-8 -6 -2 4" stroke="#8c7a64" strokeWidth={3} fill="none" />
      <ellipse cx={0} cy={44} rx={20} ry={50} fill="#080504" />
      <ellipse cx={0} cy={44} rx={20} ry={50} fill="none" stroke="#7a5a48" strokeWidth={4} />
    </Head>
  </g>
);

export const SnakePreview2: React.FC = () => (
  <svg width={1500} height={1500} viewBox="0 0 1500 1500" style={{ display: "block" }}>
    <defs>
      <radialGradient id="sp-bg2" cx="0.5" cy="0.4" r="0.8"><stop offset="0" stopColor="#3b3f33" /><stop offset="1" stopColor="#0c0e09" /></radialGradient>
    </defs>
    <rect width={1500} height={1500} fill="url(#sp-bg2)" />
    {[A, B, C, D, E, F].map((V, i) => (
      <g key={i} transform={`translate(${250 + (i % 3) * 500},${(i < 3 ? 310 : 1060)}) scale(0.85)`}>
        <V />
        <text x={0} y={360} textAnchor="middle" fontFamily="sans-serif" fontSize={36} fill="#d8d4c0">{["A  หน้าใจดีธรรมดา", "B  หน้ากลับหัว", "C  ตาอยู่ข้างหัว", "D  ตุ๊กตากระเบื้อง/หุ่นเชิด", "E  สามตาเรียงแนวตั้ง", "F  ปากยาวแนวตั้ง"][i]}</text>
      </g>
    ))}
  </svg>
);

// ---------------- sheet 3: the smiling mask with no mouth, and body designs ----------------
export const MaskHead: React.FC<{ kind: 1 | 2 | 3; x?: number; y?: number; tilt?: number; s?: number }> = ({ kind, x, y, tilt, s }) => (
  <Head skin="#d9cfbb" x={x} y={y} tilt={tilt} s={s}>
    {kind !== 2 && [-34, 36].map((x) => (
      <g key={x}>
        <ellipse cx={x} cy={-24} rx={21} ry={31} fill="#050403" />
        <circle cx={x + 5} cy={-34} r={3} fill="#e8e4d6" />
      </g>
    ))}
    {kind === 2 && [-34, 36].map((x) => <path key={x} d={`M${x - 24} -18 Q${x} -52 ${x + 24} -18`} stroke="#0a0806" strokeWidth={9} fill="none" strokeLinecap="round" />)}
    {/* the cheeks lift: a smile with no mouth */}
    {kind !== 3 && (
      <g>
        <ellipse cx={-46} cy={26} rx={24} ry={14} fill="#eadfca" opacity={0.85} />
        <ellipse cx={52} cy={26} rx={24} ry={14} fill="#eadfca" opacity={0.85} />
        <path d="M-10 6 Q-60 18 -66 52" stroke="#a9987f" strokeWidth={3} fill="none" opacity={0.75} />
        <path d="M14 6 Q66 18 74 52" stroke="#a9987f" strokeWidth={3} fill="none" opacity={0.75} />
      </g>
    )}
    <path d="M-2 -4 Q-8 20 -2 30" stroke="#b6a68c" strokeWidth={3} fill="none" opacity={kind === 2 ? 0 : 0.6} />
    {kind === 3 && <path d="M-80 36 Q4 112 86 34" stroke="#3a2a1c" strokeWidth={2.5} fill="none" opacity={0.85} />}
  </Head>
);

const PATH_S = "M-70 330 C-190 220 -150 110 -30 70 C60 40 80 -30 10 -80";
const PATH_COIL = "M70 340 C-70 310 -70 230 40 210 C150 190 140 110 20 96 C-90 84 -80 -10 10 -80";

const bodyDefs = (
  <defs>
    <pattern id="bd-diamond" width={34} height={34} patternUnits="userSpaceOnUse">
      <rect width={34} height={34} fill="#2c2a1f" />
      <polygon points="17,2 32,17 17,32 2,17" fill="#4a452d" stroke="#171510" strokeWidth={2} />
      <polygon points="17,10 24,17 17,24 10,17" fill="#6b6240" />
    </pattern>
    <pattern id="bd-pale" width={26} height={26} patternUnits="userSpaceOnUse">
      <rect width={26} height={26} fill="#c9c0aa" />
      <path d="M0 13 Q13 4 26 13" stroke="#a49a82" strokeWidth={2} fill="none" />
      <path d="M0 26 Q13 17 26 26" stroke="#a49a82" strokeWidth={2} fill="none" />
    </pattern>
    <pattern id="bd-faces" width={30} height={30} patternUnits="userSpaceOnUse">
      <rect width={30} height={30} fill="#2f2c20" />
      <circle cx={15} cy={15} r={10} fill="#cfc4ac" />
      <path d="M9 13 q3 -3 5 0 M16 13 q3 -3 5 0" stroke="#0a0806" strokeWidth={1.6} fill="none" />
    </pattern>
    <pattern id="bd-shirt" width={44} height={44} patternUnits="userSpaceOnUse">
      <rect width={44} height={44} fill="#8a7436" />
      <path d="M22 38 C10 32 12 22 22 20 C32 18 32 10 24 8" stroke="#3a2e14" strokeWidth={5} fill="none" strokeLinecap="round" />
      <circle cx={24} cy={6} r={4.5} fill="#d9b38c" stroke="#3a2e14" strokeWidth={1} />
    </pattern>
  </defs>
);

const Trunk: React.FC = () => (
  <g>
    <rect x={-40} y={-60} width={110} height={420} fill="#2a2418" />
    {Array.from({ length: 7 }, (_, i) => <line key={i} x1={-30 + i * 16} y1={-60} x2={-26 + i * 16} y2={360} stroke="#1a160e" strokeWidth={3} />)}
  </g>
);

const BodyKind: React.FC<{ kind: number }> = ({ kind }) => {
  const d = kind === 6 ? PATH_COIL : PATH_S;
  const fill = ["", "url(#bd-diamond)", "url(#bd-pale)", "#3a3626", "url(#bd-faces)", "url(#bd-shirt)", "#2c2a1f"][kind];
  const w = kind === 1 ? 54 : kind === 2 ? 118 : kind === 5 ? 86 : 86;
  return (
    <g>
      {kind === 6 && <Trunk />}
      <path d={d} fill="none" stroke="#121009" strokeWidth={w + 12} strokeLinecap="round" />
      <path d={d} fill="none" stroke={fill} strokeWidth={w} strokeLinecap="round" />
      {kind === 3 && <path d={d} fill="none" stroke="#14120c" strokeWidth={w} strokeLinecap="butt" strokeDasharray="3 15" />}
      {kind === 2 && <path d={d} fill="none" stroke="#e4dcc6" strokeWidth={30} strokeLinecap="round" opacity={0.55} transform="translate(26,-4)" />}
      {kind === 6 && <path d={d} fill="none" stroke="#4a452d" strokeWidth={w - 52} strokeLinecap="round" strokeDasharray="1 18" />}
      <g transform={`translate(${kind === 6 ? 0 : 0},${kind === 2 ? -10 : 0}) scale(${kind === 2 ? 1.1 : 1})`}>
        <MaskHead kind={1} />
      </g>
    </g>
  );
};

export const SnakePreview3: React.FC = () => (
  <svg width={1500} height={2250} viewBox="0 0 1500 2250" style={{ display: "block" }}>
    {bodyDefs}
    <defs>
      <radialGradient id="sp-bg3" cx="0.5" cy="0.4" r="0.8"><stop offset="0" stopColor="#3b3f33" /><stop offset="1" stopColor="#0c0e09" /></radialGradient>
    </defs>
    <rect width={1500} height={2250} fill="url(#sp-bg3)" />
    {[1, 2, 3].map((k, i) => (
      <g key={k} transform={`translate(${250 + i * 500},560) scale(1.45)`}>
        <MaskHead kind={k as 1 | 2 | 3} />
        <text x={0} y={190} textAnchor="middle" fontFamily="sans-serif" fontSize={26} fill="#d8d4c0">{["หน้า 1 แก้มยกเป็นยิ้ม ตาโหล", "หน้า 2 ตาหยีเป็นยิ้ม", "หน้า 3 รอยแยกยิ้มกว้างปิดสนิท"][i]}</text>
      </g>
    ))}
    {[1, 2, 3, 4, 5, 6].map((k, i) => (
      <g key={k} transform={`translate(${250 + (i % 3) * 500},${(i < 3 ? 1280 : 1930)}) scale(0.78)`}>
        <BodyKind kind={k} />
        <text x={0} y={390} textAnchor="middle" fontFamily="sans-serif" fontSize={36} fill="#d8d4c0">{["ลำตัว 1 เรียวยาว ลายข้าวหลามตัด", "ลำตัว 2 อ้วนซีด มีรอยย่น", "ลำตัว 3 เป็นปล้องเหมือนหนอน", "ลำตัว 4 เกล็ดเป็นหน้าคนจิ๋ว", "ลำตัว 5 ลายเสื้อของหมู่บ้าน", "ลำตัว 6 พันต้นไม้ห้อยหัวลงมา"][i]}</text>
      </g>
    ))}
  </svg>
);

// ---------------- sheet 4: the mask with the seam smile (face 3) in other poses ----------------
export const Flesh: React.FC<{ d: string; w: number; cap?: "round" | "butt" }> = ({ d, w, cap = "round" }) => (
  <g>
    <path d={d} fill="none" stroke="#121009" strokeWidth={w + 12} strokeLinecap={cap} strokeLinejoin="round" />
    <path d={d} fill="none" stroke="#2f2c20" strokeWidth={w} strokeLinecap={cap} strokeLinejoin="round" />
    <path d={d} fill="none" stroke="#5a5539" strokeWidth={Math.max(6, w * 0.17)} strokeLinecap="round" strokeDasharray="0 20" />
    <path d={d} fill="none" stroke="#7b7456" strokeWidth={4} strokeLinecap="round" opacity={0.45} transform={`translate(${w * 0.34},-4)`} />
  </g>
);

export const Branch: React.FC<{ y: number }> = ({ y }) => (
  <g>
    <rect x={-330} y={y - 18} width={660} height={36} rx={16} fill="#2a2418" />
    {Array.from({ length: 12 }, (_, i) => <line key={i} x1={-320 + i * 54} y1={y - 14} x2={-300 + i * 54} y2={y + 12} stroke="#1a160e" strokeWidth={3} />)}
  </g>
);

export const Pose: React.FC<{ n: number }> = ({ n }) => {
  switch (n) {
    case 1: // a coiled heap with the neck raised
      return (
        <g>
          <Flesh d="M-150 330 C-170 270 150 270 150 310 C150 360 -110 360 -110 310 C-110 280 100 276 100 300 C100 326 -50 326 -50 296 C-50 220 -10 120 4 -80" w={74} />
          <MaskHead kind={3} x={6} y={-190} />
        </g>
      );
    case 2: // hanging from a branch, head down: the face is upside down
      return (
        <g>
          <Branch y={-330} />
          <Flesh d="M-80 -330 C-160 -250 -140 -150 -40 -110 C60 -70 70 20 10 90 C-30 140 -10 210 12 250" w={66} />
          <MaskHead kind={3} x={12} y={330} tilt={186} />
        </g>
      );
    case 3: // slithering low along the ground, head lifted a little
      return (
        <g transform="translate(-110,0)">
          <Flesh d="M-340 300 C-270 230 -190 350 -110 290 C-30 230 50 350 130 290 C200 240 250 230 280 150" w={66} />
          <MaskHead kind={3} x={290} y={50} tilt={14} />
        </g>
      );
    case 4: // rearing up tall
      return (
        <g>
          <Flesh d="M-40 350 C-170 310 -150 190 -20 150 C110 110 110 10 -10 -40 C-70 -66 -60 -130 4 -200" w={72} />
          <MaskHead kind={3} x={10} y={-290} />
        </g>
      );
    case 5: // around a trunk
      return (
        <g>
          <rect x={-46} y={-130} width={120} height={500} fill="#2a2418" />
          {Array.from({ length: 7 }, (_, i) => <line key={i} x1={-36 + i * 17} y1={-130} x2={-32 + i * 17} y2={370} stroke="#1a160e" strokeWidth={3} />)}
          <Flesh d="M-70 350 C100 310 100 250 -70 210 C100 170 100 120 -70 80 C100 40 100 -10 -70 -50 C-20 -80 0 -110 12 -150" w={50} />
          <MaskHead kind={3} x={14} y={-230} s={0.85} />
        </g>
      );
    default: // coming toward you: foreshortened, a large head at the bottom, the body winding away behind
      return (
        <g>
          <Flesh d="M20 -230 C-80 -200 -60 -140 10 -110" w={24} />
          <Flesh d="M10 -110 C100 -60 80 20 -10 60" w={36} />
          <Flesh d="M-10 60 C-110 100 -90 170 0 200" w={54} />
          <Flesh d="M0 200 C60 230 40 270 10 290" w={78} />
          <MaskHead kind={3} x={4} y={300} s={1.5} />
        </g>
      );
  }
};

export const SnakePreview4: React.FC = () => (
  <svg width={1500} height={1700} viewBox="0 0 1500 1700" style={{ display: "block" }}>
    <defs>
      <radialGradient id="sp-bg4" cx="0.5" cy="0.4" r="0.8"><stop offset="0" stopColor="#3b3f33" /><stop offset="1" stopColor="#0c0e09" /></radialGradient>
    </defs>
    <rect width={1500} height={1700} fill="url(#sp-bg4)" />
    {[1, 2, 3, 4, 5, 6].map((n, i) => (
      <g key={n} transform={`translate(${250 + (i % 3) * 500},${i < 3 ? 440 : 1260}) scale(0.78)`}>
        <Pose n={n} />
        <text x={0} y={n === 2 ? 500 : 440} textAnchor="middle" fontFamily="sans-serif" fontSize={38} fill="#d8d4c0">{["ท่า 1 ขดเป็นกองคอตั้ง", "ท่า 2 ห้อยหัวจากกิ่งไม้", "ท่า 3 เลื้อยต่ำชูหัวนิดเดียว", "ท่า 4 ชูตัวสูง", "ท่า 5 พันต้นไม้", "ท่า 6 คืบเข้าหากล้อง"][i]}</text>
      </g>
    ))}
  </svg>
);

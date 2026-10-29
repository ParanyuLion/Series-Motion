import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { fontFamily } from "../island/fonts";
import { Figure, LOOKS, Mood } from "./Figure";

// Character sheet and mood sheet for the style test of series 5. `npx remotion still ShadowStyle out/x.png --props='{"which":"sheet"}'`

const SUN = { skew: -28, squash: 0.3 };

/** the cast shadow of a figure: the same figure as a dark flat shape, skewed and squashed along the ground away from the sun */
const Cast: React.FC<{ x: number; y: number; id: string }> = ({ x, y, id }) => (
  <g transform={`translate(${x},${y}) skewX(${SUN.skew}) scale(1,${-SUN.squash})`} opacity={0.82}>
    <Figure look={LOOKS[id]} silhouette />
  </g>
);

const Ground: React.FC<{ w: number; h: number; horizon: number }> = ({ w, h, horizon }) => (
  <g>
    <defs>
      <linearGradient id="ss-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff6d8" /><stop offset="1" stopColor="#f9dc9c" /></linearGradient>
      <linearGradient id="ss-ground" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#efd9a6" /><stop offset="1" stopColor="#d9bd84" /></linearGradient>
      <filter id="ss-grain"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="4" /><feColorMatrix type="saturate" values="0" /></filter>
    </defs>
    <rect width={w} height={horizon} fill="url(#ss-sky)" />
    <circle cx={w * 0.78} cy={120} r={90} fill="#fffbe9" opacity={0.9} />
    <circle cx={w * 0.78} cy={120} r={190} fill="#fff6c8" opacity={0.35} />
    {/* far houses, flat and bleached, each with its own hard shadow */}
    {[120, 520, 980, 1420, 1740].map((x, i) => (
      <g key={x}>
        <rect x={x} y={horizon - 150 - (i % 2) * 40} width={190} height={150 + (i % 2) * 40} fill="#e9dcc0" stroke="#2b211c" strokeWidth={5} />
        <polygon points={`${x - 14},${horizon - 150 - (i % 2) * 40} ${x + 95},${horizon - 220 - (i % 2) * 40} ${x + 204},${horizon - 150 - (i % 2) * 40}`} fill="#b8734a" stroke="#2b211c" strokeWidth={5} />
        <rect x={x + 70} y={horizon - 90} width={50} height={90} fill="#5a4636" stroke="#2b211c" strokeWidth={4} />
        <polygon points={`${x + 190},${horizon} ${x + 190 + 150},${horizon} ${x + 190 + 150},${horizon + 14} ${x + 190},${horizon + 14}`} fill="#1c2748" opacity={0.7} />
      </g>
    ))}
    <rect y={horizon} width={w} height={h - horizon} fill="url(#ss-ground)" />
    <rect y={horizon} width={w} height={6} fill="#2b211c" opacity={0.5} />
    <rect width={w} height={h} filter="url(#ss-grain)" opacity={0.08} />
  </g>
);

const Label: React.FC<{ x: number; y: number; th: string; en: string }> = ({ x, y, th, en }) => (
  <g fontFamily={fontFamily} textAnchor="middle">
    <text x={x} y={y} fontSize={34} fill="#2b211c">{th}</text>
    <text x={x} y={y + 30} fontSize={20} fill="#6a5a4a">{en}</text>
  </g>
);

export const Sheet: React.FC<{ which?: string }> = ({ which = "sheet" }) => {
  const t = useCurrentFrame();
  const W = 1920;
  const H = 1080;
  const ground = 860;
  const sheet = which === "sheet";
  const cast: { id: string; x: number; th: string; en: string; mood: Mood }[] = [
    { id: "you", x: 220, th: "คุณ", en: "the traveller (has a shadow)", mood: "worry" },
    { id: "head", x: 520, th: "ผู้ใหญ่", en: "the head", mood: "smile" },
    { id: "mother", x: 820, th: "แม่", en: "mother", mood: "smile" },
    { id: "child", x: 1030, th: "เด็ก", en: "child", mood: "calm" },
    { id: "cook", x: 1330, th: "แม่ครัว", en: "the cook", mood: "smile" },
    { id: "oldman", x: 1650, th: "ตาแก่ที่บ่อน้ำ", en: "the old man", mood: "calm" },
  ];
  return (
    <AbsoluteFill>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <Ground w={W} h={H} horizon={600} />
        {sheet ? (
          <g>
            {/* an object with a shadow, to show the rule: a post and a bucket */}
            <g transform="translate(1890,860)"><rect x={-12} y={-300} width={24} height={300} fill="#8a6a42" stroke="#2b211c" strokeWidth={5} /></g>
            <polygon points="1878,860 1902,860 1700,900 1660,900" fill="#1c2748" opacity={0.8} />
            <Cast x={cast[0].x} y={ground} id="you" />
            {cast.map((c) => (
              <g key={c.id}>
                <g transform={`translate(${c.x},${ground})`}><Figure look={LOOKS[c.id]} mood={c.mood} t={t} /></g>
                <Label x={c.x} y={60} th={c.th} en={c.en} />
              </g>
            ))}
          </g>
        ) : (
          <g>
            {(["calm", "smile", "worry", "stare"] as Mood[]).map((m, i) => (
              <g key={m}>
                <g transform={`translate(${260 + i * 460},${ground}) scale(1.5)`}><Figure look={LOOKS[i === 1 ? "head" : "you"]} mood={m} t={t} /></g>
                <Label x={260 + i * 460} y={1030} th={m} en="" />
              </g>
            ))}
          </g>
        )}
      </svg>
    </AbsoluteFill>
  );
};

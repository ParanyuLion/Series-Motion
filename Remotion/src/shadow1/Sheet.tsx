import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { fontFamily } from "../island/fonts";
import { Figure, LOOKS, Mood } from "./Figure";
import { Village } from "./Village";
import { Traveller, TravellerMood } from "./Traveller";

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
      <linearGradient id="ss-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f3dba0" /><stop offset="1" stopColor="#dcae6c" /></linearGradient>
      <linearGradient id="ss-ground" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c9a56a" /><stop offset="1" stopColor="#9a7a48" /></linearGradient>
      <radialGradient id="ss-vig" cx="0.5" cy="0.55" r="0.75"><stop offset="0.5" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#1a0f08" stopOpacity="0.55" /></radialGradient>
      <filter id="ss-grain"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="4" /><feColorMatrix type="saturate" values="0" /></filter>
    </defs>
    <rect width={w} height={horizon} fill="url(#ss-sky)" />
    <circle cx={w * 0.78} cy={120} r={90} fill="#fffbe9" opacity={0.9} />
    <circle cx={w * 0.78} cy={120} r={190} fill="#fff6c8" opacity={0.35} />
    {/* far houses, flat and bleached, each with its own hard shadow */}
    {[120, 520, 980, 1420, 1740].map((x, i) => (
      <g key={x}>
        <rect x={x} y={horizon - 150 - (i % 2) * 40} width={190} height={150 + (i % 2) * 40} fill="#e9dcc0" stroke="#0f0b09" strokeWidth={7} />
        <polygon points={`${x - 14},${horizon - 150 - (i % 2) * 40} ${x + 95},${horizon - 220 - (i % 2) * 40} ${x + 204},${horizon - 150 - (i % 2) * 40}`} fill="#b8734a" stroke="#0f0b09" strokeWidth={7} />
        <rect x={x + 70} y={horizon - 90} width={50} height={90} fill="#5a4636" stroke="#2b211c" strokeWidth={4} />
        <polygon points={`${x + 190},${horizon} ${x + 190 + 150},${horizon} ${x + 190 + 150},${horizon + 14} ${x + 190},${horizon + 14}`} fill="#1c2748" opacity={0.7} />
      </g>
    ))}
    <rect y={horizon} width={w} height={h - horizon} fill="url(#ss-ground)" />
    <rect y={horizon} width={w} height={6} fill="#2b211c" opacity={0.5} />
    <rect width={w} height={h} filter="url(#ss-grain)" opacity={0.2} />
    <rect width={w} height={h} fill="url(#ss-vig)" />
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
  const options = which === "you";
  const face = which === "face";
  const poses = which === "poses";
  const turn = which.startsWith("turn8");
  const village = which === "village";
  if (which === "village2") return <Village />;
  if (which === "scared")
    return (
      <AbsoluteFill style={{ background: "#2a2622" }}>
        <svg width={1920} height={1080} viewBox="0 0 1920 1080">
          {([["calm", 0, "ปกติ"], ["scared", 0, "ตกใจกลัว"], ["scared", 35, "ตกใจกลัว (หันเฉียง)"]] as [TravellerMood, number, string][]).map(([m, yaw, l], i) => (
            <g key={i}>
              <g transform={`translate(${330 + i * 630},1900) scale(3.2)`}><Traveller yaw={yaw} mood={m} t={0} /></g>
              <text x={330 + i * 630} y={70} textAnchor="middle" fontFamily={fontFamily} fontSize={42} fill="#f1e6cf">{l}</text>
            </g>
          ))}
        </svg>
      </AbsoluteFill>
    );
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
        {village ? (
          <g>
            {/* a house and a tree with hard shadows on the dust, then the villagers (no shadow) and the traveller (with one) */}
            <polygon points="1500,860 1500,884 1900,930 1900,880" fill="#1c2748" opacity={0.78} />
            <polygon points="150,860 330,860 140,905 -40,905" fill="#1c2748" opacity={0.78} />
            <rect x={132} y={560} width={26} height={300} fill="#6a4c34" stroke="#0f0b09" strokeWidth={7} />
            <ellipse cx={145} cy={500} rx={120} ry={100} fill="#6f8a4c" stroke="#0f0b09" strokeWidth={7} />
            <g transform="translate(1560,0)"><rect x={0} y={640} width={300} height={220} fill="#e9dcc0" stroke="#0f0b09" strokeWidth={7} /><polygon points="-20,640 150,540 320,640" fill="#b8734a" stroke="#0f0b09" strokeWidth={7} /><rect x={120} y={720} width={60} height={140} fill="#5a4636" stroke="#2b211c" strokeWidth={4} /></g>
            <g transform="translate(560,860) skewX(-28) scale(1,-0.3)" opacity={0.82}><Traveller yaw={20} silhouette /></g>
            <g transform="translate(560,860)"><Traveller yaw={20} mood="worry" t={0} /></g>
            {[{ id: "head", x: 900, mood: "smile" }, { id: "mother", x: 1100, mood: "smile" }, { id: "child", x: 1250, mood: "calm" }, { id: "oldman", x: 1420, mood: "calm" }].map((c) => (
              <g key={c.id} transform={`translate(${c.x},860) scale(0.9)`}><Figure look={LOOKS[c.id]} mood={c.mood as Mood} t={0} /></g>
            ))}
          </g>
        ) : turn ? (
          <g>
            {Array.from({ length: 8 }, (_, i) => i * 45).map((yaw, i) => {
              const x = 130 + i * 237;
              const extra = which === "turn8w" ? { walk: 1, phase: 1.35 } : which === "turn8s" ? { sit: true } : which === "turn8p" ? { point: 1 } : {};
              const mood: TravellerMood = which === "turn8m" ? "worry" : "calm";
              return (
                <g key={yaw}>
                  {which === "turn8s" && <g stroke="#0f0b09" strokeWidth={7} strokeLinejoin="round"><line x1={x - 52} y1={ground - 70} x2={x - 58} y2={ground} /><line x1={x + 52} y1={ground - 70} x2={x + 58} y2={ground} /><rect x={x - 68} y={ground - 84} width={136} height={16} rx={4} fill="#8a6a42" /></g>}
                  <g transform={`translate(${x},${ground})`}><Traveller yaw={yaw} mood={mood} t={0} {...extra} /></g>
                  <Label x={x} y={70} th={`${yaw}°`} en="" />
                </g>
              );
            })}
          </g>
        ) : poses ? (
          <g>
            {([
              { id: "you", x: 230, l: "เดิน", p: { walk: 1, t: 6, turn: 1 } },
              { id: "you", x: 620, l: "นั่ง", p: { sit: true } },
              { id: "you", x: 1010, l: "ชี้", p: { point: 1 } },
              { id: "head", x: 1400, l: "ผู้ใหญ่ชี้", p: { point: 1 } },
              { id: "mother", x: 1740, l: "ยกมือ", p: { armsUp: 1 } },
            ] as { id: string; x: number; l: string; p: Record<string, unknown> }[]).map((c, i) => (
              <g key={i}>
                {!!c.p.sit && <g stroke="#0f0b09" strokeWidth={7} strokeLinejoin="round"><line x1={c.x - 52} y1={ground - 70} x2={c.x - 58} y2={ground} /><line x1={c.x + 52} y1={ground - 70} x2={c.x + 58} y2={ground} /><rect x={c.x - 68} y={ground - 84} width={136} height={16} rx={4} fill="#8a6a42" /></g>}
                <g transform={`translate(${c.x},${ground})`}><Figure look={LOOKS[c.id]} mood="calm" t={0} {...(c.p as object)} /></g>
                <Label x={c.x} y={70} th={c.l} en="" />
              </g>
            ))}
          </g>
        ) : face ? (
          <g transform={`translate(960,1620) scale(2.5)`}><Figure look={LOOKS.you} mood="calm" t={t} /></g>
        ) : options ? (
          <g>
            {([["youA", "A: ผมตั้งม้วนขึ้น ข้างสั้น · เสื้อเขียวน้ำทะเล"], ["youB", "B: ผมปัดยาวสะบัดปลาย · เสื้อม่วง"], ["youC", "C: ผมมวยสูง สีสนิม · เสื้อเขียวป่า"]] as [string, string][]).map(([id, label], i) => (
              <g key={id}>
                <Cast x={360 + i * 600} y={ground} id={id} />
                <g transform={`translate(${360 + i * 600},${ground}) scale(1.15)`}><Figure look={LOOKS[id]} mood={i === 1 ? "worry" : "calm"} t={t} /></g>
                <Label x={360 + i * 600} y={70} th={label} en="" />
              </g>
            ))}
          </g>
        ) : sheet ? (
          <g>
            {/* an object with a shadow, to show the rule: a post and a bucket */}
            <g transform="translate(1890,860)"><rect x={-12} y={-300} width={24} height={300} fill="#8a6a42" stroke="#0f0b09" strokeWidth={7} /></g>
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
            {([{ id: "you", mood: "calm", l: "you calm" }, { id: "you", mood: "worry", l: "you worry" }, { id: "head", mood: "smile", creep: 0, l: "head: kind (start)" }, { id: "head", mood: "smile", creep: 0.5, l: "head: turning" }, { id: "head", mood: "smile", creep: 1, l: "head: the truth" }] as { id: string; mood: Mood; creep?: number; l: string }[]).map((c, i) => (
              <g key={i}>
                <g transform={`translate(${210 + i * 375},${ground}) scale(1.15)`}><Figure look={LOOKS[c.id]} mood={c.mood} creep={c.creep} t={t} /></g>
                <Label x={210 + i * 375} y={1010} th={c.l} en="" />
              </g>
            ))}
          </g>
        )}
      </svg>
    </AbsoluteFill>
  );
};

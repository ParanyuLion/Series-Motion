import React from "react";
import { HairBack, HairFront } from "./Hair";

// Characters of "หมู่บ้านที่ไม่มีใครมีเงา": a round pale head, a thick brown outline, dot eyes with expressive brows, a bean-shaped body in one colour
// and thin bent limbs. A figure is drawn around its feet at (0,0), about 560 tall. `silhouette` draws the same figure as one dark flat shape
// so it can be squashed and skewed into a cast shadow (only the traveller "you" has one; the villagers cast none).

export const INK = "#0f0b09";
export const SKIN = "#e7b890";

export type Look = {
  hair: "messy" | "bowl" | "bun" | "bald" | "scarf" | "none" | "sidepart" | "ponytail" | "curly" | "beanie" | "quiff" | "bob" | "spiky" | "wave" | "swoop" | "tousle" | "bangs" | "bowlcut";
  beanieColor?: string;
  hairColor: string;
  hat?: "straw";
  body: string;
  bodyKind: "bean" | "long" | "round" | "thin";
  detail?: "charm" | "strap" | "apron" | "patch" | "none";
  glasses?: boolean;
  scale?: number;
  mustache?: boolean;
  skin?: string;
  creepSkin?: string;
};

const hx=(h: string)=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
export const mix=(a: string,b: string,t: number)=>{ const A=hx(a),B=hx(b); return "#"+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,"0")).join(""); };

/** hair as a cloud of overlapping tufts: an outline pass (each tuft a little larger, in ink) under a fill pass, so the outer edge is one scalloped line */
const Fluff: React.FC<{ c: [number, number, number][]; color: string; ink: string; w: number; light?: string }> = ({ c, color, ink, w, light }) => (
  <g>
    {c.map(([x, y, r], i) => <circle key={"o" + i} cx={x} cy={y} r={r + w / 2} fill={ink} />)}
    {c.map(([x, y, r], i) => <circle key={"f" + i} cx={x} cy={y} r={r} fill={color} />)}
    {light && c.slice(0, 5).map(([x, y, r], i) => <path key={"l" + i} d={`M${x - r * 0.55} ${y - r * 0.2} Q${x - r * 0.2} ${y - r * 0.7} ${x + r * 0.35} ${y - r * 0.6}`} fill="none" stroke={light} strokeWidth={5} strokeLinecap="round" opacity={0.55} />)}
  </g>
);

export type Mood = "calm" | "smile" | "worry" | "stare" | "creepy";

export const LOOKS: Record<string, Look> = {
  you: { hair: "bowlcut", hairColor: "#1d1816", body: "#2f9e9a", bodyKind: "bean", detail: "none", glasses: true },
  youA: { hair: "bowlcut", hairColor: "#1d1816", body: "#2f9e9a", bodyKind: "bean", detail: "none", glasses: true },
  youB: { hair: "swoop", hairColor: "#1c1410", body: "#8e5ab5", bodyKind: "bean", detail: "strap" },
  youC: { hair: "tousle", hairColor: "#b5502a", body: "#3b7a57", bodyKind: "bean", detail: "strap" },
  head: { hair: "none", hairColor: "#d8d4cc", hat: "straw", skin: "#e4b78f", creepSkin: "#bfae96", scale: 1.08, body: "#eee6d4", bodyKind: "long", detail: "charm", mustache: true },
  mother: { hair: "bun", hairColor: "#2b211c", body: "#b8573f", bodyKind: "long", detail: "charm" },
  child: { hair: "bowl", hairColor: "#2b211c", body: "#e8b84a", bodyKind: "bean", detail: "charm", scale: 0.62 },
  cook: { hair: "scarf", hairColor: "#6d8f5a", body: "#cfc7a8", bodyKind: "round", detail: "apron" },
  oldman: { hair: "bald", hairColor: "#d8d4cc", body: "#8f8a80", bodyKind: "thin", detail: "patch", glasses: true, mustache: true },
};

export const Figure: React.FC<{ look: Look; mood?: Mood; silhouette?: boolean; walk?: number; armsUp?: number; facing?: 1 | -1; t?: number; creep?: number }> = ({ look, mood = "calm", silhouette = false, walk = 0, armsUp = 0, facing = 1, t = 0, creep }) => {
  const S = silhouette ? "#0a1022" : null;
  const fill = (c: string) => S ?? c;
  const stroke = S ?? INK;
  const sc = look.scale ?? 1;
  const bw = look.bodyKind === "round" ? 112 : look.bodyKind === "thin" ? 60 : look.bodyKind === "long" ? 76 : 72;
  const bh = look.bodyKind === "long" ? 290 : look.bodyKind === "thin" ? 250 : look.bodyKind === "round" ? 210 : 220;
  const legLen = look.bodyKind === "long" ? 80 : 130;
  const hipY = -legLen;
  const topY = hipY - bh;
  const headY = topY - 72;
  const sw = 8;
  const skin = creep !== undefined && look.creepSkin ? mix(look.skin ?? SKIN, look.creepSkin, creep) : look.skin ?? SKIN;
  const bodyId = `bg-${look.body.slice(1)}`;
  const headId = `hd-${skin.slice(1)}`;
  const lw = Math.sin(t * 0.25) * 18 * walk;
  const aw = Math.sin(t * 0.25 + Math.PI) * 24 * walk;
  const lift = armsUp * 70;
  const blink = (t % 160) > 154 ? 0.1 : 1;
  const eyeY = headY + 6;
  const brow = mood === "worry" ? -12 : mood === "stare" ? 4 : 0;
  const hatW = 150;
  const faceFor = (mood: Mood, op: number) => {
    const brow = mood === "worry" ? -12 : mood === "stare" ? 4 : 0;
    return (
      <g opacity={op}>
          {[-1, 1].map((s) => (
            <g key={s}>
              {mood === "creepy" ? <g><ellipse cx={s * 32} cy={eyeY} rx={17} ry={15} fill="#fbf6ea" stroke={INK} strokeWidth={4} /><circle cx={s * 32} cy={eyeY} r={3.5} fill={INK} /><path d={`M${s * 32 - 22} ${eyeY + 20} Q${s * 32} ${eyeY + 34} ${s * 32 + 22} ${eyeY + 20}`} fill="none" stroke="#3a2a30" strokeWidth={7} opacity={0.7} /></g> : mood === "smile" ? <path d={`M${s * 31 - 15} ${eyeY} Q${s * 31} ${eyeY - 15} ${s * 31 + 15} ${eyeY}`} fill="none" stroke={INK} strokeWidth={6} /> : <g><ellipse cx={s * 31} cy={eyeY} rx={10.5} ry={12 * blink} fill={INK} /><circle cx={s * 31 + 3} cy={eyeY - 4 * blink} r={3.2} fill="#fff" opacity={blink > 0.5 ? 0.85 : 0} /></g>}
              <path d={`M${s * 30 - 16} ${eyeY - 32 + brow * (s === -1 ? 1 : 1) } Q${s * 30} ${eyeY - 40 + brow * 0.4} ${s * 30 + 16} ${eyeY - 32 - brow}`} fill="none" stroke={INK} strokeWidth={6} transform={s === -1 ? "" : `scale(1,1)`} />
            </g>
          ))}
          {mood === "worry" && <ellipse cx={0} cy={eyeY - 2} rx={66} ry={18} fill="#2a2030" opacity={0.28} filter="blur(2px)" />}
          {look.glasses && <g><circle cx={-34} cy={eyeY} r={27} fill="#cfd8de" fillOpacity={0.35} stroke={INK} strokeWidth={6} /><circle cx={34} cy={eyeY} r={27} fill="#cfd8de" fillOpacity={0.35} stroke={INK} strokeWidth={6} /><line x1={-8} y1={eyeY - 2} x2={8} y2={eyeY - 2} stroke={INK} strokeWidth={5} /></g>}
          <path d={`M-3 ${eyeY + 12} Q-10 ${eyeY + 28} 2 ${eyeY + 30}`} fill="none" stroke={INK} strokeWidth={4} opacity={0.7} />
          {look.mustache && <path d={`M-30 ${eyeY + 40} Q-14 ${eyeY + 30} 0 ${eyeY + 38} Q14 ${eyeY + 30} 30 ${eyeY + 40}`} fill="none" stroke="#7a766e" strokeWidth={6} />}
          {mood === "smile" && <path d={`M-30 ${eyeY + 52} Q0 ${eyeY + 82} 30 ${eyeY + 52}`} fill="#7a3a30" stroke={INK} strokeWidth={5} />}
          {mood === "calm" && <path d={`M-18 ${eyeY + 56} Q0 ${eyeY + 58} 18 ${eyeY + 56}`} fill="none" stroke={INK} strokeWidth={5} />}
          {mood === "worry" && <path d={`M-18 ${eyeY + 62} Q0 ${eyeY + 50} 18 ${eyeY + 62}`} fill="none" stroke={INK} strokeWidth={5} />}
          {mood === "creepy" && (
            <g><path d={`M-56 ${eyeY + 50} Q0 ${eyeY + 92} 56 ${eyeY + 50} Q0 ${eyeY + 62} -56 ${eyeY + 50} Z`} fill="#f7efe0" stroke={INK} strokeWidth={5} />{[-36, -18, 0, 18, 36].map((x) => <line key={x} x1={x} y1={eyeY + 58 + Math.abs(x) * 0.02} x2={x} y2={eyeY + 76 - Math.abs(x) * 0.25} stroke={INK} strokeWidth={2.5} />)}</g>
          )}
          {mood === "stare" && <ellipse cx={0} cy={eyeY + 58} rx={10} ry={6} fill="#7a3a30" stroke={INK} strokeWidth={4} />}
          {mood === "worry" && <path d={`M70 ${headY - 30} q6 18 -2 26`} fill="none" stroke="#7fb4e6" strokeWidth={7} />}
      </g>
    );
  };
  return (
    <g transform={`scale(${facing * sc},${sc})`} strokeLinecap="round" strokeLinejoin="round" filter={silhouette ? undefined : "url(#ss-rough)"}>
      <defs><filter id="ss-rough" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="7" result="n" /><feDisplacementMap in="SourceGraphic" in2="n" scale="3" xChannelSelector="R" yChannelSelector="G" /></filter>
        <linearGradient id={bodyId} x1="0.15" y1="0" x2="0.85" y2="1"><stop offset="0" stopColor={mix(look.body, "#ffffff", 0.16)} /><stop offset="1" stopColor={mix(look.body, "#000000", 0.14)} /></linearGradient>
        <radialGradient id={headId} cx="0.38" cy="0.3" r="0.85"><stop offset="0" stopColor={mix(skin, "#ffffff", 0.14)} /><stop offset="0.6" stopColor={skin} /><stop offset="1" stopColor={mix(skin, "#3a1f18", 0.2)} /></radialGradient>
      </defs>
      {/* legs and shoes */}
      {[-1, 1].map((s, i) => {
        const dx = s * 26;
        const sh = i === 0 ? lw : -lw;
        return (
          <g key={s}>
            <path d={`M${dx} ${hipY} L${dx + sh * 0.4} ${hipY / 2} L${dx + sh} -14`} fill="none" stroke={stroke} strokeWidth={sw + 1} />
            <ellipse cx={dx + sh + 8} cy={-8} rx={24} ry={11} fill={fill("#5a4638")} stroke={stroke} strokeWidth={sw - 2} />
          </g>
        );
      })}
      {/* arms behind the body */}
      {[-1, 1].map((s, i) => {
        const x0 = s * (bw - 6);
        const y0 = topY + 50;
        const swing = (i === 0 ? aw : -aw);
        const hx = s * (bw + 36) + swing * 0.4;
        const hy = y0 + 120 - lift * (i === 1 ? 1 : 0.4) ;
        return (
          <g key={s}>
            <path d={`M${x0} ${y0} Q${s * (bw + 44)} ${y0 + 50} ${hx} ${hy}`} fill="none" stroke={stroke} strokeWidth={sw + 1} />
            <circle cx={hx} cy={hy + 6} r={13} fill={fill(skin)} stroke={stroke} strokeWidth={sw - 2} />
          </g>
        );
      })}
      {/* the body */}
      <path d={`M${-bw} ${hipY} Q${-bw - 8} ${topY + bh * 0.3} ${-bw * 0.7} ${topY + 24} Q0 ${topY - 16} ${bw * 0.7} ${topY + 24} Q${bw + 8} ${topY + bh * 0.3} ${bw} ${hipY} Q0 ${hipY + 26} ${-bw} ${hipY} Z`} fill={silhouette ? S! : `url(#${bodyId})`} stroke={stroke} strokeWidth={sw} />
      {!silhouette && <path d={`M${bw * 0.34} ${topY + 40} Q${bw * 0.9} ${topY + bh * 0.45} ${bw * 0.9} ${hipY - 4} Q${bw * 0.5} ${hipY + 12} ${bw * 0.3} ${hipY + 8} Q${bw * 0.6} ${topY + bh * 0.5} ${bw * 0.34} ${topY + 40} Z`} fill="#1a1428" opacity={0.28} />}
      {!silhouette && Array.from({ length: 5 }, (_, i) => <path key={i} d={`M${bw * 0.55 + i * 5} ${topY + 70 + i * 36} l${-26} ${34}`} stroke="#0f0b09" strokeWidth={4} opacity={0.35} />)}
      {!silhouette && look.detail === "strap" && <path d={`M${-bw * 0.5} ${topY + 24} L${bw * 0.55} ${hipY - 30}`} stroke="#3a2d26" strokeWidth={14} opacity={0.85} />}
      {!silhouette && look.detail === "charm" && (
        <g><rect x={-bw * 0.35} y={topY + 70} width={20} height={34} rx={3} fill="#c8372d" stroke={INK} strokeWidth={3} /><line x1={-bw * 0.35 + 10} y1={topY + 72} x2={-bw * 0.35 + 10} y2={topY + 100} stroke="#f6e5b0" strokeWidth={2} /></g>
      )}
      {!silhouette && look.detail === "apron" && <path d={`M${-bw * 0.6} ${topY + 70} L${bw * 0.6} ${topY + 70} L${bw * 0.7} ${hipY - 6} L${-bw * 0.7} ${hipY - 6} Z`} fill="#f4efe0" stroke={INK} strokeWidth={4} opacity={0.95} />}
      {!silhouette && look.detail === "patch" && <rect x={bw * 0.1} y={topY + 120} width={30} height={30} fill="#b5a37a" stroke={INK} strokeWidth={3} />}
      {/* the head */}
      {look.hair === "scarf" && <ellipse cx={0} cy={headY - 6} rx={90} ry={92} fill={fill(look.hairColor)} stroke={stroke} strokeWidth={sw} />}
      {look.hair === "bun" && <circle cx={0} cy={headY - 96} r={34} fill={fill(look.hairColor)} stroke={stroke} strokeWidth={sw} />}
      {look.hair === "swoop" && <HairBack kind={look.hair} hy={headY} color={look.hairColor} ink={stroke} sw={sw} flat={silhouette} />}
      <ellipse cx={0} cy={headY} rx={80} ry={88} fill={silhouette ? S! : `url(#${headId})`} stroke={stroke} strokeWidth={sw} />
      {!silhouette && <path d={`M0 ${headY - 88} A80 88 0 0 1 0 ${headY + 88} Q104 ${headY} 0 ${headY - 88} Z`} fill={mix(skin, "#3a1f18", 0.3)} opacity={0.42} />}
      {[-1, 1].map((s) => <ellipse key={s} cx={s * 80} cy={headY + 8} rx={10} ry={16} fill={fill(skin)} stroke={stroke} strokeWidth={sw - 2} />)}
      {/* hair */}
      {look.hair === "messy" && <path d={`M-84 ${headY - 8} Q-92 ${headY - 92} -20 ${headY - 92} Q10 ${headY - 120} 50 ${headY - 88} Q92 ${headY - 70} 84 ${headY - 6} Q70 ${headY - 52} 26 ${headY - 58} Q-20 ${headY - 40} -84 ${headY - 8} Z`} fill={fill(look.hairColor)} stroke={stroke} strokeWidth={sw - 1} />}
      {look.hair === "bowl" && <path d={`M-84 ${headY + 2} Q-90 ${headY - 92} 0 ${headY - 92} Q90 ${headY - 92} 84 ${headY + 2} Q50 ${headY - 40} 0 ${headY - 42} Q-50 ${headY - 40} -84 ${headY + 2} Z`} fill={fill(look.hairColor)} stroke={stroke} strokeWidth={sw - 1} />}
      {look.hair === "bun" && <path d={`M-82 ${headY - 6} Q-84 ${headY - 88} 0 ${headY - 88} Q84 ${headY - 88} 82 ${headY - 6} Q50 ${headY - 50} 0 ${headY - 52} Q-50 ${headY - 50} -82 ${headY - 6} Z`} fill={fill(look.hairColor)} stroke={stroke} strokeWidth={sw - 1} />}
      {look.hair === "scarf" && <path d={`M-84 ${headY - 4} Q-70 ${headY - 70} 0 ${headY - 70} Q70 ${headY - 70} 84 ${headY - 4} Q40 ${headY - 40} 0 ${headY - 42} Q-40 ${headY - 40} -84 ${headY - 4} Z`} fill={fill(look.hairColor)} stroke={stroke} strokeWidth={sw - 1} />}
      {(look.hair === "wave" || look.hair === "swoop" || look.hair === "tousle" || look.hair === "bangs" || look.hair === "bowlcut") && <HairFront kind={look.hair} hy={headY} color={look.hairColor} ink={stroke} sw={sw} flat={silhouette} />}
      {look.hair === "curly" && <g>{Array.from({ length: 8 }, (_, i) => { const a = Math.PI * (1.05 + (i / 7) * 0.9); return <circle key={i} cx={Math.cos(a) * 74} cy={headY + Math.sin(a) * 78} r={30} fill={fill(look.hairColor)} stroke={stroke} strokeWidth={sw - 2} />; })}</g>}
      {/* face */}
      {!silhouette && (creep === undefined ? faceFor(mood, 1) : <g>{faceFor("smile", 1 - creep)}{faceFor("creepy", creep)}</g>)}
      {/* the straw hat (a portable shade) */}
      {look.hat === "straw" && (
        <g>
          <ellipse cx={0} cy={headY - 52} rx={hatW} ry={30} fill={fill("#d9b865")} stroke={stroke} strokeWidth={sw} />
          <path d={`M-70 ${headY - 56} Q-70 ${headY - 120} 0 ${headY - 120} Q70 ${headY - 120} 70 ${headY - 56} Q0 ${headY - 40} -70 ${headY - 56} Z`} fill={fill("#e6c97a")} stroke={stroke} strokeWidth={sw} />
          {!silhouette && <path d={`M-66 ${headY - 70} Q0 ${headY - 52} 66 ${headY - 70}`} fill="none" stroke="#a8332a" strokeWidth={9} />}
          {!silhouette && Array.from({ length: 6 }, (_, i) => <path key={i} d={`M${-120 + i * 48} ${headY - 56} q8 14 0 28`} fill="none" stroke="#a88a3e" strokeWidth={3} opacity={0.7} />)}
        </g>
      )}
    </g>
  );
};

import React from "react";
import { HairBack, HairFront } from "./Hair";

// Characters of "หมู่บ้านที่ไม่มีใครมีเงา": a round pale head, a thick brown outline, dot eyes with expressive brows, a bean-shaped body in one colour
// and thin bent limbs. A figure is drawn around its feet at (0,0), about 560 tall. `silhouette` draws the same figure as one dark flat shape
// so it can be squashed and skewed into a cast shadow (only the traveller "you" has one; the villagers cast none).

export const INK = "#0f0b09";
export const SKIN = "#e7b890";

export type Look = {
  hair: "messy" | "bowl" | "bun" | "bald" | "scarf" | "none" | "sidepart" | "ponytail" | "curly" | "beanie" | "quiff" | "bob" | "spiky" | "wave" | "swoop" | "tousle" | "bangs" | "bowlcut" | "long" | "hime" | "fringe";
  beanieColor?: string;
  hairColor: string;
  hat?: "straw";
  body: string;
  bodyKind: "bean" | "long" | "round" | "thin" | "lean";
  detail?: "charm" | "strap" | "apron" | "patch" | "none";
  glasses?: boolean;
  scale?: number;
  mustache?: boolean;
  skin?: string;
  creepSkin?: string;
  pants?: string;
  pattern?: "sport" | "zigzag" | "stripes" | "trim" | "breton" | "jacket";
  sleeve?: "long" | "short";
  badge?: boolean;
  /** eyelashes, blush and coloured lips */
  lady?: boolean;
  /** a knee-length skirt in this colour; the legs are bare skin */
  skirt?: string;
  /** overrides of the body height and the leg length of the body kind */
  bodyH?: number;
  legH?: number;
  bodyW?: number;
  /** skirt hem below the hip (default 64) */
  skirtLen?: number;
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

export type Mood = "calm" | "smile" | "worry" | "stare" | "creepy" | "agony";

export const LOOKS: Record<string, Look> = {
  you: { hair: "bowlcut", hairColor: "#1d1816", body: "#24252b", bodyKind: "lean", detail: "none", glasses: true, pants: "#2c3a56", pattern: "jacket", sleeve: "long" },
  youA: { hair: "bowlcut", hairColor: "#1d1816", body: "#24252b", bodyKind: "lean", detail: "none", glasses: true, pants: "#2c3a56", pattern: "jacket", sleeve: "long" },
  youB: { hair: "swoop", hairColor: "#1c1410", body: "#8e5ab5", bodyKind: "bean", detail: "strap" },
  youC: { hair: "tousle", hairColor: "#b5502a", body: "#3b7a57", bodyKind: "bean", detail: "strap" },
  head: { sleeve: "long", hair: "none", hairColor: "#d8d4cc", hat: "straw", pants: "#c9bd9f", pattern: "trim", skin: "#e4b78f", creepSkin: "#bfae96", scale: 1.08, body: "#eee6d4", bodyKind: "long", badge: true, mustache: true },
  mother: { pattern: "zigzag", hair: "bun", hairColor: "#2b211c", body: "#b8573f", bodyKind: "long", badge: true },
  child: { pants: "#8a6a45", pattern: "stripes", hair: "bowl", hairColor: "#2b211c", body: "#e8b84a", bodyKind: "bean", badge: true, scale: 0.62 },
  cook: { badge: true, hair: "scarf", hairColor: "#6d8f5a", body: "#cfc7a8", bodyKind: "round", detail: "apron" },
  oldman: { badge: true, sleeve: "long", pants: "#4b463f", hair: "bald", hairColor: "#d8d4cc", body: "#8f8a80", bodyKind: "thin", detail: "patch", glasses: true, mustache: true },
};

/** where the straw hat ends up when it is held out (figure units, on the figure's right): over the head of someone standing next to it */
export const HAT_HOLD_END: [number, number] = [232, -560];
const smoothstep = (x: number) => { const k = Math.max(0, Math.min(1, x)); return k * k * (3 - 2 * k); };

export const Figure: React.FC<{ look: Look; mood?: Mood; silhouette?: boolean; walk?: number; armsUp?: number; point?: number; sit?: boolean; talk?: number; hatHold?: number; turn?: number; facing?: 1 | -1; t?: number; creep?: number }> = ({ look, mood = "calm", silhouette = false, walk = 0, armsUp = 0, point = 0, sit = false, talk = 0, hatHold = 0, turn = 0, facing = 1, t = 0, creep }) => {
  const S = silhouette ? "#0a1022" : null;
  const fill = (c: string) => S ?? c;
  const stroke = S ?? INK;
  const sc = look.scale ?? 1;
  const bw = look.bodyW ?? (look.bodyKind === "round" ? 112 : look.bodyKind === "thin" ? 60 : look.bodyKind === "lean" ? 54 : look.bodyKind === "long" ? 76 : 72);
  const bh = look.bodyH ?? (look.bodyKind === "long" ? 290 : look.bodyKind === "thin" ? 250 : look.bodyKind === "lean" ? 236 : look.bodyKind === "round" ? 210 : 220);
  const legLen = look.legH ?? (look.bodyKind === "long" ? 80 : 130);
  const hipY = -legLen;
  const topY = hipY - bh;
  const headY = topY - 72;
  const sw = 8;
  const skin = creep !== undefined && look.creepSkin ? mix(look.skin ?? SKIN, look.creepSkin, creep) : look.skin ?? SKIN;
  const bodyId = `bg-${look.body.slice(1)}`;
  const headId = `hd-${skin.slice(1)}`;
  const pantsId = `pn-${(look.pants ?? "#000000").slice(1)}`;
  const bodyD = `M${-bw} ${hipY} Q${-bw - 8} ${topY + bh * 0.3} ${-bw * 0.7} ${topY + 24} Q0 ${topY - 16} ${bw * 0.7} ${topY + 24} Q${bw + 8} ${topY + bh * 0.3} ${bw} ${hipY} Q0 ${hipY + 26} ${-bw} ${hipY} Z`;
  const sitD = sit ? -100 - hipY : 0;
  const ay = sit ? -20 - sitD : -20;
  const lw = Math.sin(t * 0.25) * 30 * walk;
  const aw = Math.sin(t * 0.25 + Math.PI) * 34 * walk;
  const lift = armsUp * 70;
  const blink = (t % 160) > 154 ? 0.1 : 1;
  const eyeY = headY + 6;
  const brow = mood === "worry" ? -12 : mood === "stare" ? 4 : 0;
  const hatW = 150;
  const hh = smoothstep(hatHold);
  const hatC: [number, number] = [HAT_HOLD_END[0] * hh, (headY - 52) + (HAT_HOLD_END[1] - (headY - 52)) * hh];
  const hatHand: [number, number] = [hatC[0] + 90 + (-220) * hh, hatC[1] + 4 * hh];
  const ta = talk > 0 ? talk * (0.5 + 0.5 * Math.sin(t * 0.9)) : 0; // mouth open amount while speaking
  const faceFor = (mood: Mood, op: number) => {
    const brow = mood === "worry" ? -12 : mood === "stare" ? 4 : mood === "agony" ? -22 : 0;
    return (
      <g opacity={op}>
          {[-1, 1].map((s) => (
            <g key={s}>
              {mood === "agony" ? <g><ellipse cx={s * 32} cy={eyeY} rx={19} ry={21} fill="#fbf6ea" stroke={INK} strokeWidth={4} /><circle cx={s * 32} cy={eyeY + 1} r={3.2} fill={INK} /></g> : mood === "creepy" ? <g><ellipse cx={s * 32} cy={eyeY} rx={17} ry={15} fill="#fbf6ea" stroke={INK} strokeWidth={4} /><circle cx={s * 32} cy={eyeY} r={3.5} fill={INK} /><path d={`M${s * 32 - 22} ${eyeY + 20} Q${s * 32} ${eyeY + 34} ${s * 32 + 22} ${eyeY + 20}`} fill="none" stroke="#3a2a30" strokeWidth={7} opacity={0.7} /></g> : mood === "smile" ? <path d={`M${s * 31 - 15} ${eyeY} Q${s * 31} ${eyeY - 15} ${s * 31 + 15} ${eyeY}`} fill="none" stroke={INK} strokeWidth={6} /> : <g><ellipse cx={s * 31} cy={eyeY} rx={10.5} ry={12 * blink} fill={INK} /><circle cx={s * 31 + 3} cy={eyeY - 4 * blink} r={3.2} fill="#fff" opacity={blink > 0.5 ? 0.85 : 0} /></g>}
              <path d={`M${s * 30 - 16} ${eyeY - 32 + brow * (s === -1 ? 1 : 1) } Q${s * 30} ${eyeY - 40 + brow * 0.4} ${s * 30 + 16} ${eyeY - 32 - brow}`} fill="none" stroke={INK} strokeWidth={6} transform={s === -1 ? "" : `scale(1,1)`} />
            </g>
          ))}
          {mood === "worry" && <ellipse cx={0} cy={eyeY - 2} rx={66} ry={18} fill="#2a2030" opacity={0.28} filter="blur(2px)" />}
          {look.glasses && <g><circle cx={-34} cy={eyeY} r={27} fill="#cfd8de" fillOpacity={0.35} stroke={INK} strokeWidth={6} /><circle cx={34} cy={eyeY} r={27} fill="#cfd8de" fillOpacity={0.35} stroke={INK} strokeWidth={6} /><line x1={-8} y1={eyeY - 2} x2={8} y2={eyeY - 2} stroke={INK} strokeWidth={5} /></g>}
          {look.lady && !silhouette && mood !== "agony" && mood !== "creepy" && [-1, 1].map((s) => (
            <g key={"l" + s} fill="none" stroke={INK} strokeLinecap="round">
              <path d={`M${s * 31 - 15} ${eyeY - 6 * blink} Q${s * 31} ${eyeY - 19 * blink} ${s * 31 + 15} ${eyeY - 6 * blink}`} strokeWidth={5} opacity={mood === "smile" ? 0 : 1} />
              {[0, 1, 2].map((k) => <path key={k} d={`M${s * (31 + 12 + k * 3)} ${eyeY - 8 + k * 4} l${s * (9 - k)} ${-9 + k * 2}`} strokeWidth={3.6} />)}
              <ellipse cx={s * 52} cy={eyeY + 26} rx={14} ry={8} fill="#e8808a" stroke="none" opacity={0.32} />
            </g>
          ))}
          <path d={`M-3 ${eyeY + 12} Q-10 ${eyeY + 28} 2 ${eyeY + 30}`} fill="none" stroke={INK} strokeWidth={4} opacity={0.7} />
          {look.mustache && <path d={`M-30 ${eyeY + 40} Q-14 ${eyeY + 30} 0 ${eyeY + 38} Q14 ${eyeY + 30} 30 ${eyeY + 40}`} fill="none" stroke="#7a766e" strokeWidth={6} />}
          {mood === "smile" && <path d={`M-30 ${eyeY + 52} Q0 ${eyeY + 82 + 28 * ta} 30 ${eyeY + 52}`} fill="#7a3a30" stroke={INK} strokeWidth={5} />}
          {mood === "calm" && (ta > 0.04 ? <ellipse cx={0} cy={eyeY + 58} rx={15} ry={3 + 12 * ta} fill="#7a3a30" stroke={INK} strokeWidth={4} /> : <path d={`M-18 ${eyeY + 56} Q0 ${eyeY + 58} 18 ${eyeY + 56}`} fill="none" stroke={look.lady ? "#b03a4a" : INK} strokeWidth={look.lady ? 6 : 5} />)}
          {mood === "worry" && <path d={`M-18 ${eyeY + 62} Q0 ${eyeY + 50} 18 ${eyeY + 62}`} fill="none" stroke={INK} strokeWidth={5} />}
          {mood === "creepy" && (
            <g><path d={`M-56 ${eyeY + 50} Q0 ${eyeY + 92} 56 ${eyeY + 50} Q0 ${eyeY + 62} -56 ${eyeY + 50} Z`} fill="#f7efe0" stroke={INK} strokeWidth={5} />{[-36, -18, 0, 18, 36].map((x) => <line key={x} x1={x} y1={eyeY + 58 + Math.abs(x) * 0.02} x2={x} y2={eyeY + 76 - Math.abs(x) * 0.25} stroke={INK} strokeWidth={2.5} />)}</g>
          )}
          {mood === "agony" && <g><ellipse cx={0} cy={eyeY + 68} rx={27} ry={25} fill="#241210" stroke={INK} strokeWidth={5} /><ellipse cx={0} cy={eyeY + 80} rx={15} ry={9} fill="#b8705f" /></g>}
          {mood === "stare" && <ellipse cx={0} cy={eyeY + 58} rx={10} ry={6} fill="#7a3a30" stroke={INK} strokeWidth={4} />}
          {mood === "worry" && <path d={`M68 ${headY - 8} Q56 ${headY + 12} 68 ${headY + 20} Q80 ${headY + 12} 68 ${headY - 8} Z`} fill="#9cd0f2" stroke={INK} strokeWidth={3.5} />}
      </g>
    );
  };
  return (
    <g transform={`scale(${facing * sc},${sc}) translate(0,${sitD})`} strokeLinecap="round" strokeLinejoin="round" filter={silhouette ? undefined : "url(#ss-rough)"}>
      <defs><filter id="ss-rough" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="7" result="n" /><feDisplacementMap in="SourceGraphic" in2="n" scale="3" xChannelSelector="R" yChannelSelector="G" /></filter>
        <linearGradient id={bodyId} x1="0.15" y1="0" x2="0.85" y2="1"><stop offset="0" stopColor={mix(look.body, "#ffffff", 0.16)} /><stop offset="1" stopColor={mix(look.body, "#000000", 0.14)} /></linearGradient>
        <linearGradient id={pantsId} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={mix(look.pants ?? "#000000", "#ffffff", 0.1)} /><stop offset="1" stopColor={mix(look.pants ?? "#000000", "#000000", 0.25)} /></linearGradient>
        <radialGradient id={headId} cx="0.38" cy="0.3" r="0.85"><stop offset="0" stopColor={mix(skin, "#ffffff", 0.14)} /><stop offset="0.6" stopColor={skin} /><stop offset="1" stopColor={mix(skin, "#3a1f18", 0.2)} /></radialGradient>
      </defs>
      {(look.hair === "long" || look.hair === "hime" || look.hair === "fringe") && <HairBack kind="long" hy={headY} color={look.hairColor} ink={stroke} sw={sw} flat={silhouette} />}
      {/* legs (trousers when the look has them) and shoes */}
      {[-1, 1].map((s, i) => {
        const dx = s * 26;
        const sh = i === 0 ? lw : -lw;
        const kx = sit ? dx + s * 10 : dx + sh * 0.4;
        const ky = sit ? (hipY + ay) / 2 : hipY / 2;
        const ax = sit ? dx : dx + sh;
        return (
          <g key={s}>
            {look.pants ? (
              <g>
                <path d={`M${dx - 20} ${hipY} L${kx - 18} ${ky} L${ax - 15} ${ay} L${ax + 15} ${ay} L${kx + 18} ${ky} L${dx + 20} ${hipY} Z`} fill={silhouette ? S! : `url(#${pantsId})`} stroke={stroke} strokeWidth={sw - 1} />
                {!silhouette && <path d={`M${dx} ${hipY + 20} L${kx} ${ky + 6} L${ax} ${ay - 6}`} fill="none" stroke="#0f0b09" strokeWidth={3} opacity={0.18} />}
                {!silhouette && <path d={`M${ax - 16} ${ay - 10} L${ax + 16} ${ay - 10}`} stroke="#0f0b09" strokeWidth={4} opacity={0.35} />}
              </g>
            ) : look.skirt ? (
              <g fill="none"><path d={`M${dx} ${hipY} L${kx} ${ky} L${ax} ${ay + 6}`} stroke={stroke} strokeWidth={21} /><path d={`M${dx} ${hipY} L${kx} ${ky} L${ax} ${ay + 6}`} stroke={silhouette ? S! : mix(skin, "#ffffff", 0.05)} strokeWidth={12} /></g>
            ) : (
              <path d={`M${dx} ${hipY} L${kx} ${ky} L${ax} ${ay + 6}`} fill="none" stroke={stroke} strokeWidth={sw + 1} />
            )}
            <ellipse cx={ax + 8} cy={ay + 12} rx={26} ry={12} fill={fill("#5a4638")} stroke={stroke} strokeWidth={sw - 2} />
          </g>
        );
      })}
      {/* arms hang close at the sides, tucked behind the body so the shoulder is the body outline */}
      {[-1, 1].map((s, i) => {
        const x0 = s * (bw * 0.5);
        const y0 = topY + 40;
        const swing = (i === 0 ? aw : -aw);
        const pt = i === 1 ? point : 0;
        const holding = i === 1 && hatHold > 0 && look.hat === "straw";
        const hx = holding ? hatHand[0] : s * (bw + 14) + swing * 0.4 + pt * 110;
        const hy = holding ? hatHand[1] : y0 + 124 - lift * (i === 1 ? 1 : 0.4) - pt * 100;
        const cx1 = holding ? bw + 60 * (1 - hh) + 70 * hh : s * (bw + 22) + pt * 60;
        const cy1 = holding ? y0 + 56 * (1 - hh) - 120 * hh : y0 + 56 - pt * 30;
        return (
          <g key={s}>
            <path d={`M${x0} ${y0} Q${cx1} ${cy1} ${hx} ${hy}`} fill="none" stroke={stroke} strokeWidth={sw + 1} />
            {(() => {
              const P0: [number, number] = [x0, y0];
              const P1: [number, number] = [cx1, cy1];
              const P2: [number, number] = [hx, hy];
              const tt = look.sleeve === "long" ? 0.8 : 0.5;
              const c: [number, number] = [P0[0] + tt * (P1[0] - P0[0]), P0[1] + tt * (P1[1] - P0[1])];
              const E: [number, number] = [(1 - tt) * (1 - tt) * P0[0] + 2 * tt * (1 - tt) * P1[0] + tt * tt * P2[0], (1 - tt) * (1 - tt) * P0[1] + 2 * tt * (1 - tt) * P1[1] + tt * tt * P2[1]];
              const d = `M${P0[0]} ${P0[1]} Q${c[0]} ${c[1]} ${E[0]} ${E[1]}`;
              const dx = 2 * (1 - tt) * (P1[0] - P0[0]) + 2 * tt * (P2[0] - P1[0]);
              const dy = 2 * (1 - tt) * (P1[1] - P0[1]) + 2 * tt * (P2[1] - P1[1]);
              const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
              const W = 34;
              return (
                <g>
                  <path d={d} fill="none" stroke={stroke} strokeWidth={W + sw * 1.4} strokeLinecap="butt" />
                  <path d={d} fill="none" stroke={silhouette ? S! : look.body} strokeWidth={W} strokeLinecap="butt" />
                  {!silhouette && look.pattern === "breton" && <path d={d} fill="none" stroke="#f1e6cf" strokeWidth={W - 1} strokeDasharray="9 22" strokeLinecap="butt" opacity={0.92} />}
                  {!silhouette && <path d={d} fill="none" stroke="#000" strokeWidth={W} opacity={0.12} strokeDasharray="0 400" />}
                  <g transform={`translate(${E[0]},${E[1]}) rotate(${ang})`}>
                    <rect x={-4} y={-W / 2 - 3} width={8} height={W + 6} rx={3} fill={silhouette ? S! : mix(look.body, "#000000", 0.25)} stroke={stroke} strokeWidth={sw - 3} />
                  </g>
                </g>
              );
            })()}
            <circle cx={hx} cy={hy + 6} r={13} fill={fill(skin)} stroke={stroke} strokeWidth={sw - 2} />
          </g>
        );
      })}
      {/* the body */}
      <path d={bodyD} fill={silhouette ? S! : `url(#${bodyId})`} stroke={stroke} strokeWidth={sw} />
      {!silhouette && <path d={`M${bw * 0.34} ${topY + 40} Q${bw * 0.9} ${topY + bh * 0.45} ${bw * 0.9} ${hipY - 4} Q${bw * 0.5} ${hipY + 12} ${bw * 0.3} ${hipY + 8} Q${bw * 0.6} ${topY + bh * 0.5} ${bw * 0.34} ${topY + 40} Z`} fill="#1a1428" opacity={0.28} />}
      {!silhouette && look.pattern && (
        <g>
          <clipPath id={`bc-${bodyId}-${look.pattern}`}><path d={bodyD} /></clipPath>
          <g clipPath={`url(#bc-${bodyId}-${look.pattern})`}>
            {look.pattern === "sport" && (
              <g>
                <rect x={-bw - 10} y={topY + 70} width={bw * 2 + 20} height={7} fill="#c8512d" />
                <rect x={-bw - 10} y={topY + 82} width={bw * 2 + 20} height={34} fill="#f1e6cf" />
                <rect x={-bw - 10} y={topY + 121} width={bw * 2 + 20} height={7} fill="#c8512d" />
                {[-48, -24, 0, 24, 48].map((x) => <path key={x} d={`M${x - 8} ${topY + 112} L${x} ${topY + 86} L${x + 8} ${topY + 112} Z`} fill="#2c3a56" opacity={0.85} />)}
                <circle cx={-bw * 0.4} cy={topY + 168} r={16} fill="none" stroke="#f1e6cf" strokeWidth={5} />
                <circle cx={-bw * 0.4} cy={topY + 168} r={6} fill="#c8512d" />
              </g>
            )}
            {look.pattern === "breton" && Array.from({ length: 9 }, (_, k) => <rect key={k} x={-bw - 10} y={topY + 28 + k * 25} width={bw * 2 + 20} height={11} fill="#f1e6cf" opacity={0.92} />)}
            {look.pattern === "jacket" && (
              <g>
                <path d={`M-26 ${topY + 10} L0 ${topY + 84} L26 ${topY + 10} Z`} fill="#f4f1ea" />
                <path d={`M-30 ${topY + 8} L-4 ${topY + 70} L-34 ${topY + 66} Z`} fill={mix(look.body, "#ffffff", 0.14)} stroke="#0f0b09" strokeWidth={3} />
                <path d={`M30 ${topY + 8} L4 ${topY + 70} L34 ${topY + 66} Z`} fill={mix(look.body, "#ffffff", 0.14)} stroke="#0f0b09" strokeWidth={3} />
                <line x1={0} y1={topY + 78} x2={0} y2={hipY + 10} stroke="#0f0b09" strokeWidth={4} />
                <line x1={4} y1={topY + 84} x2={4} y2={hipY + 10} stroke="#9ca0aa" strokeWidth={2} strokeDasharray="3 4" />
                <rect x={-bw - 10} y={hipY - 24} width={bw * 2 + 20} height={30} fill={mix(look.body, "#ffffff", 0.1)} stroke="#0f0b09" strokeWidth={3} />
                <path d={`M-52 ${hipY - 70} L-30 ${hipY - 30}`} stroke="#0f0b09" strokeWidth={3} opacity={0.6} />
                <path d={`M52 ${hipY - 70} L30 ${hipY - 30}`} stroke="#0f0b09" strokeWidth={3} opacity={0.6} />
              </g>
            )}
            {look.pattern === "zigzag" && (
              <g>
                <rect x={-bw - 10} y={hipY - 52} width={bw * 2 + 20} height={44} fill="#f1e6cf" opacity={0.92} />
                <path d={`M${-bw - 10} ${hipY - 30} ${Array.from({ length: 9 }, (_, k) => `L${-bw - 10 + (k + 0.5) * 20} ${hipY - (k % 2 ? 46 : 14)}`).join(" ")}`} fill="none" stroke="#2b211c" strokeWidth={5} />
              </g>
            )}
            {look.pattern === "stripes" && [0, 1, 2].map((k) => <rect key={k} x={-bw - 10} y={topY + 70 + k * 44} width={bw * 2 + 20} height={14} fill="#c8512d" opacity={0.85} />)}
            {look.pattern === "trim" && (
              <g>
                <rect x={-bw - 10} y={hipY - 34} width={bw * 2 + 20} height={26} fill="#a8332a" />
                {Array.from({ length: 8 }, (_, k) => <path key={k} d={`M${-bw - 4 + k * 20} ${hipY - 34} l10 13 l10 -13`} fill="#0f0b09" />)}
                <path d={`M-20 ${topY + 36} L0 ${topY + 86} L20 ${topY + 36}`} fill="none" stroke="#a8332a" strokeWidth={9} />
              </g>
            )}
          </g>
        </g>
      )}
      {!silhouette && Array.from({ length: 5 }, (_, i) => <path key={i} d={`M${bw * 0.55 + i * 5} ${topY + 70 + i * 36} l${-26} ${34}`} stroke="#0f0b09" strokeWidth={4} opacity={0.35} />)}
      {look.lady && !silhouette && (
        <g fill="none" strokeLinecap="round">
          {[-1, 1].map((k) => <path key={"b" + k} d={`M${k * bw * 0.52 - 14} ${topY + 96} Q${k * bw * 0.52} ${topY + 116} ${k * bw * 0.52 + 14} ${topY + 96}`} stroke="#000" strokeWidth={4} opacity={0.3} />)}
          {[-1, 1].map((k) => <path key={"c" + k} d={`M${k * bw * 0.52 - 9} ${topY + 84} Q${k * bw * 0.52 - 2} ${topY + 80} ${k * bw * 0.52 + 6} ${topY + 84}`} stroke="#fff" strokeWidth={4} opacity={0.5} />)}
        </g>
      )}
      {look.skirt && (
        <g>
          <path d={`M${-bw * 0.8} ${hipY - 34} Q${-bw * 1.5} ${hipY + 20} ${-bw * 1.55} ${hipY + (look.skirtLen ?? 64)} Q0 ${hipY + (look.skirtLen ?? 64) + 20} ${bw * 1.55} ${hipY + (look.skirtLen ?? 64)} Q${bw * 1.5} ${hipY + 20} ${bw * 0.8} ${hipY - 34} Q0 ${hipY - 20} ${-bw * 0.8} ${hipY - 34} Z`} fill={silhouette ? S! : look.skirt} stroke={stroke} strokeWidth={sw - 1} />
          {!silhouette && [-0.9, -0.45, 0, 0.45, 0.9].map((k) => <path key={k} d={`M${k * bw * 0.7} ${hipY - 22} Q${k * bw * 1.2} ${hipY + 30} ${k * bw * 1.45} ${hipY + (look.skirtLen ?? 64) + 6}`} fill="none" stroke="#000" strokeWidth={3} opacity={0.2} />)}
          {!silhouette && <path d={`M${-bw * 0.8} ${hipY - 34} Q0 ${hipY - 20} ${bw * 0.8} ${hipY - 34}`} fill="none" stroke={mix(look.skirt, "#ffffff", 0.3)} strokeWidth={5} opacity={0.6} />}
        </g>
      )}
      {!silhouette && look.detail === "strap" && <path d={`M${-bw * 0.5} ${topY + 24} L${bw * 0.55} ${hipY - 30}`} stroke="#3a2d26" strokeWidth={14} opacity={0.85} />}
      {!silhouette && look.detail === "apron" && <path d={`M${-bw * 0.6} ${topY + 70} L${bw * 0.6} ${topY + 70} L${bw * 0.7} ${hipY - 6} L${-bw * 0.7} ${hipY - 6} Z`} fill="#f4efe0" stroke={INK} strokeWidth={4} opacity={0.95} />}
      {!silhouette && look.detail === "patch" && <rect x={bw * 0.1} y={topY + 120} width={30} height={30} fill="#b5a37a" stroke={INK} strokeWidth={3} />}
      {!silhouette && look.badge && (
        <g transform={`translate(${-bw * 0.38},${topY + 92})`}>
          <circle r={17} fill="#f4ead2" stroke={INK} strokeWidth={4} />
          <circle r={10} fill="none" stroke="#c8372d" strokeWidth={4} />
          <circle r={3.5} fill={INK} />
        </g>
      )}
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
      {look.hair === "fringe" && <HairFront kind="fringe" hy={headY} color={look.hairColor} ink={stroke} sw={sw} flat={silhouette} />}
      {look.hair === "hime" && <HairFront kind="hime" hy={headY} color={look.hairColor} ink={stroke} sw={sw} flat={silhouette} />}
      {look.hair === "long" && <HairFront kind="swoop" hy={headY} color={look.hairColor} ink={stroke} sw={sw} flat={silhouette} />}
      {(look.hair === "wave" || look.hair === "swoop" || look.hair === "tousle" || look.hair === "bangs" || look.hair === "bowlcut") && <HairFront kind={look.hair} hy={headY} color={look.hairColor} ink={stroke} sw={sw} flat={silhouette} />}
      {look.hair === "curly" && <g>{Array.from({ length: 8 }, (_, i) => { const a = Math.PI * (1.05 + (i / 7) * 0.9); return <circle key={i} cx={Math.cos(a) * 74} cy={headY + Math.sin(a) * 78} r={30} fill={fill(look.hairColor)} stroke={stroke} strokeWidth={sw - 2} />; })}</g>}
      {/* face */}
      {!silhouette && <g transform={`translate(${14 * turn},0)`}>{creep === undefined ? faceFor(mood, 1) : <g>{faceFor("smile", 1 - creep)}{faceFor("creepy", creep)}</g>}</g>}
      {/* the straw hat (a portable shade) */}
      {look.hat === "straw" && (
        <g transform={`translate(${hatC[0]},${hatC[1] - (headY - 52)}) rotate(${-8 * hh},0,${headY - 52})`}>
          <ellipse cx={0} cy={headY - 52} rx={hatW} ry={30} fill={fill("#d9b865")} stroke={stroke} strokeWidth={sw} />
          <path d={`M-70 ${headY - 56} Q-70 ${headY - 120} 0 ${headY - 120} Q70 ${headY - 120} 70 ${headY - 56} Q0 ${headY - 40} -70 ${headY - 56} Z`} fill={fill("#e6c97a")} stroke={stroke} strokeWidth={sw} />
          {!silhouette && <path d={`M-66 ${headY - 70} Q0 ${headY - 52} 66 ${headY - 70}`} fill="none" stroke="#a8332a" strokeWidth={9} />}
          {!silhouette && Array.from({ length: 6 }, (_, i) => <path key={i} d={`M${-120 + i * 48} ${headY - 56} q8 14 0 28`} fill="none" stroke="#a88a3e" strokeWidth={3} opacity={0.7} />)}
        </g>
      )}
      {look.hat === "straw" && hatHold > 0 && <circle cx={hatHand[0]} cy={hatHand[1] + 6} r={13} fill={fill(skin)} stroke={stroke} strokeWidth={sw - 2} />}
    </g>
  );
};

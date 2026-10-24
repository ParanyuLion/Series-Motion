import React from "react";
import { MaskHead, Flesh, Pose } from "../blind1/SnakePreview";

const GROUND = 1300;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ramp = (g: number, a: number, b: number) => clamp01((g - a) / Math.max(1, b - a));
const rnd = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

/** a tapered trunk with bark furrows, a few knots and a flared base */
const Trunk: React.FC<{ x: number; w: number; top: number; fill: string; bark: string; seed: number; roots?: boolean; lean?: number }> = ({ x, w, top, fill, bark, seed, roots, lean = 0 }) => {
  const base = GROUND + 50;
  const furrows = Math.max(3, Math.round(w / 14));
  return (
    <g transform={lean ? `rotate(${lean} ${x} ${base})` : undefined}>
      <path d={`M${x - w / 2} ${base} L${x - w * 0.4} ${top} L${x + w * 0.4} ${top} L${x + w / 2} ${base} Z`} fill={fill} />
      {Array.from({ length: furrows }, (_, k) => {
        const fx = x - w * 0.34 + (k / (furrows - 1)) * w * 0.68;
        const wob = (rnd(seed + k) - 0.5) * w * 0.12;
        return <path key={k} d={`M${fx} ${base - 20} Q${fx + wob} ${(base + top) / 2} ${fx + wob * 0.4} ${top + 40}`} stroke={bark} strokeWidth={Math.max(2, w * 0.035)} fill="none" opacity={0.8} />;
      })}
      {[0, 1, 2].map((k) => <ellipse key={k} cx={x + (rnd(seed + 40 + k) - 0.5) * w * 0.5} cy={base - 150 - rnd(seed + 50 + k) * (base - top) * 0.7} rx={w * 0.09} ry={w * 0.16} fill={bark} opacity={0.7} />)}
      {roots && (
        <g fill={fill}>
          <path d={`M${x - w / 2} ${base - 60} Q${x - w * 0.8} ${base - 10} ${x - w * 1.25} ${base + 24} L${x - w * 0.3} ${base + 24} Z`} />
          <path d={`M${x + w / 2} ${base - 60} Q${x + w * 0.8} ${base - 10} ${x + w * 1.25} ${base + 24} L${x + w * 0.3} ${base + 24} Z`} />
        </g>
      )}
    </g>
  );
};

/** a thick limb reaching across the picture from a trunk, with a couple of twigs */
const Limb: React.FC<{ x: number; y: number; len: number; dir: 1 | -1; w: number; fill: string; seed: number }> = ({ x, y, len, dir, w, fill, seed }) => {
  const dy = (rnd(seed) - 0.5) * 90;
  return (
    <g>
      <path d={`M${x} ${y} Q${x + dir * len * 0.5} ${y - 30 + dy} ${x + dir * len} ${y + dy * 1.4}`} stroke={fill} strokeWidth={w} fill="none" strokeLinecap="round" />
      {[0.4, 0.65, 0.85].map((f, k) => (
        <path key={k} d={`M${x + dir * len * f} ${y + dy * f * 0.9} q${dir * 40} ${-50 - rnd(seed + k) * 40} ${dir * (70 + rnd(seed + k + 3) * 40)} ${-60 - rnd(seed + k + 6) * 50}`} stroke={fill} strokeWidth={w * 0.3} fill="none" strokeLinecap="round" />
      ))}
    </g>
  );
};

/** hanging moss and vines from a limb */
const Vines: React.FC<{ x: number; y: number; n: number; seed: number; g: number }> = ({ x, y, n, seed, g }) => (
  <g stroke="#0d140e" fill="none" strokeLinecap="round" opacity={0.85}>
    {Array.from({ length: n }, (_, k) => {
      const len = 90 + rnd(seed + k) * 220;
      const vx = x + (rnd(seed + k + 9) - 0.5) * 360;
      const sw = Math.sin(g * 0.02 + k + seed) * 5;
      return <path key={k} d={`M${vx} ${y} q${sw} ${len * 0.5} ${sw * 1.8} ${len}`} strokeWidth={3 + rnd(seed + k + 4) * 4} />;
    })}
  </g>
);

/**
 * The forest in grey dawn light, in layers that slide at different speeds with the camera (`cx`): far thin trunks in fog, mid trunks with bark,
 * near black trunks with roots and limbs, hanging vines, a dark canopy that closes the top, light shafts, drifting dust, a faint trail and
 * leaf litter. Nothing alive is drawn: no birds, no insects. `dark` (0..1) closes the light as the crowd comes.
 */
export const Forest: React.FC<{ cx: number; g?: number; x0?: number; x1?: number; dark?: number }> = ({ cx, g = 0, x0 = -600, x1 = 6600, dark = 0 }) => {
  const span = x1 - x0 + 2400;
  const layerShift = (f: number) => cx * (1 - f);
  const far = Array.from({ length: Math.ceil((x1 - x0) / 120) }, (_, i) => ({ x: x0 + i * 120 + rnd(i + 3) * 90, w: 22 + rnd(i + 5) * 22, s: i }));
  const mid = Array.from({ length: Math.ceil((x1 - x0) / 210) }, (_, i) => ({ x: x0 + i * 210 + rnd(i + 11) * 150, w: 46 + rnd(i + 13) * 38, s: i + 100 }));
  const near = Array.from({ length: Math.ceil((x1 - x0) / 520) }, (_, i) => ({ x: x0 + i * 520 + rnd(i + 23) * 300, w: 96 + rnd(i + 29) * 70, s: i + 200 }));
  const shaft = (x: number, w: number, o: number) => <polygon key={x} points={`${x},-200 ${x + w},-200 ${x + w - 520},${GROUND} ${x - 520},${GROUND}`} fill="#efe6c2" opacity={o} />;
  return (
    <g>
      <defs>
        <linearGradient id="fo-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#10150f" /><stop offset="0.35" stopColor="#2a332b" /><stop offset="0.7" stopColor="#4a5446" /><stop offset="1" stopColor="#6c715c" /></linearGradient>
        <linearGradient id="fo-ground" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3b3a2c" /><stop offset="1" stopColor="#14130d" /></linearGradient>
        <linearGradient id="fo-fog" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#b5bba4" stopOpacity={0} /><stop offset="1" stopColor="#b5bba4" stopOpacity={0.5} /></linearGradient>
        <radialGradient id="fo-trail" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#6b6650" stopOpacity={0.55} /><stop offset="1" stopColor="#6b6650" stopOpacity={0} /></radialGradient>
        <filter id="fo-blur1"><feGaussianBlur stdDeviation="2.5" /></filter>
        <filter id="fo-blur2"><feGaussianBlur stdDeviation="1.2" /></filter>
      </defs>
      <rect x={x0 - 1200} y={-1600} width={span} height={3000} fill="url(#fo-sky)" />
      {/* light shafts from the pale sky in the top left */}
      <g style={{ mixBlendMode: "screen" }} transform={`translate(${layerShift(0.4)},0)`}>
        {[200, 900, 1700, 2600, 3400, 4300, 5200].map((x, i) => shaft(x, 90 + rnd(i) * 80, 0.05 + 0.03 * Math.sin(g * 0.012 + i)))}
      </g>
      {/* far trunks, in fog */}
      <g transform={`translate(${layerShift(0.5)},0)`} filter="url(#fo-blur1)" opacity={0.85}>
        {far.map((t) => <Trunk key={t.s} x={t.x} w={t.w} top={-300} fill="#3c4743" bark="#2b3431" seed={t.s} />)}
      </g>
      <rect x={x0 - 1200} y={620} width={span} height={700} fill="url(#fo-fog)" />
      {/* mid trunks with bark, thin limbs and hanging moss */}
      <g transform={`translate(${layerShift(0.78)},0)`} filter="url(#fo-blur2)">
        {mid.map((t) => <Trunk key={t.s} x={t.x} w={t.w} top={-500} fill="#212d23" bark="#121a14" seed={t.s} lean={(rnd(t.s) - 0.5) * 2} />)}
        {mid.filter((_, i) => i % 3 === 0).map((t) => <Limb key={t.s} x={t.x} y={260 + rnd(t.s) * 380} len={260 + rnd(t.s + 3) * 220} dir={rnd(t.s + 5) > 0.5 ? 1 : -1} w={22} fill="#18221a" seed={t.s} />)}
        {mid.filter((_, i) => i % 4 === 1).map((t) => <Vines key={t.s} x={t.x} y={300 + rnd(t.s) * 260} n={5} seed={t.s} g={g} />)}
      </g>
      <rect x={x0 - 1200} y={GROUND - 30} width={span} height={1900} fill="url(#fo-ground)" />
      {/* the faint trail, leaf litter, roots, mushrooms: all low and dark */}
      <ellipse cx={(x0 + x1) / 2} cy={GROUND + 85} rx={(x1 - x0) / 2} ry={70} fill="url(#fo-trail)" />
      {Array.from({ length: 140 }, (_, i) => {
        const lx = x0 + rnd(i + 70) * (x1 - x0);
        const ly = GROUND + 10 + rnd(i + 71) * 420;
        return <ellipse key={i} cx={lx} cy={ly} rx={10 + rnd(i + 72) * 26} ry={3 + rnd(i + 73) * 6} fill={i % 3 ? "#2d2616" : "#3b341d"} opacity={0.65} transform={`rotate(${(rnd(i + 74) - 0.5) * 40} ${lx} ${ly})`} />;
      })}
      {Array.from({ length: 22 }, (_, i) => {
        const rx0 = x0 + rnd(i + 90) * (x1 - x0);
        const ry0 = GROUND + 20 + rnd(i + 91) * 300;
        return <path key={i} d={`M${rx0} ${ry0} q${40 + rnd(i) * 60} ${-14 - rnd(i + 1) * 20} ${90 + rnd(i + 2) * 120} ${6 + rnd(i + 3) * 10}`} stroke="#120f09" strokeWidth={8 + rnd(i + 4) * 8} fill="none" strokeLinecap="round" opacity={0.8} />;
      })}
      {Array.from({ length: 9 }, (_, i) => {
        const mx = x0 + rnd(i + 120) * (x1 - x0);
        const my = GROUND + 40 + rnd(i + 121) * 260;
        return (
          <g key={i} transform={`translate(${mx},${my})`} opacity={0.6}>
            <rect x={-2} y={-18} width={4} height={18} fill="#8f8b76" />
            <ellipse cx={0} cy={-18} rx={10} ry={6} fill="#a9a48b" />
          </g>
        );
      })}
      <rect x={x0 - 1200} y={1010} width={span} height={340} fill="url(#fo-fog)" opacity={0.75} />
      {/* near black trunks with roots, big limbs, long vines */}
      <g transform={`translate(${layerShift(1)},0)`}>
        {near.map((t) => <Trunk key={t.s} x={t.x} w={t.w} top={-800} fill="#0c120d" bark="#060906" seed={t.s} roots />)}
        {near.map((t, i) => <Limb key={`l${t.s}`} x={t.x} y={120 + rnd(t.s) * 320} len={380 + rnd(t.s + 7) * 260} dir={i % 2 ? 1 : -1} w={38} fill="#0a100b" seed={t.s + 1} />)}
        {near.map((t) => <Vines key={`v${t.s}`} x={t.x + 160} y={160 + rnd(t.s) * 200} n={6} seed={t.s + 2} g={g} />)}
      </g>
      {/* a closed canopy at the very top: dark leaf masses with a few pale gaps */}
      <g transform={`translate(${layerShift(1.15)},0)`}>
        {Array.from({ length: Math.ceil((x1 - x0) / 130) }, (_, i) => (
          <ellipse key={i} cx={x0 + i * 130 + rnd(i + 130) * 90} cy={-60 + rnd(i + 131) * 150} rx={110 + rnd(i + 132) * 90} ry={90 + rnd(i + 133) * 80} fill="#070b08" opacity={0.96} />
        ))}
      </g>
      {/* drifting dust in the pale light: slow, never a bug */}
      {Array.from({ length: 46 }, (_, i) => {
        const px = x0 + ((rnd(i + 150) * (x1 - x0) + g * (0.3 + rnd(i + 151) * 0.5)) % (x1 - x0));
        const py = 200 + rnd(i + 152) * 1000 + Math.sin(g * 0.03 + i) * 14;
        return <circle key={i} cx={px} cy={py} r={1.4 + rnd(i + 153) * 2.2} fill="#e9e2bf" opacity={0.18 + 0.12 * Math.sin(g * 0.05 + i)} />;
      })}
      <rect x={x0 - 1200} y={-1600} width={span} height={3300} fill="#05080a" opacity={0.2 + 0.55 * dark} />
    </g>
  );
};

/** one canvas shoe lying on its side, pale against the dark ground; nothing else with it */
export const Shoe: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x},${y}) rotate(-8)`}>
    <ellipse cx={4} cy={14} rx={74} ry={9} fill="#000" opacity={0.35} />
    <path d="M-66 8 Q-66 -34 -18 -38 Q20 -42 36 -16 Q70 -12 74 8 Q74 18 60 18 L-56 18 Q-66 18 -66 8 Z" fill="#c9c0a6" stroke="#8f8670" strokeWidth={3} />
    <path d="M-20 -34 Q0 -22 30 -18" stroke="#8f8670" strokeWidth={3} fill="none" />
    <rect x={-66} y={14} width={140} height={8} rx={3} fill="#5d5844" />
    <path d="M-50 4 L-40 -6 M-30 4 L-20 -6 M-10 4 L0 -6" stroke="#a69d84" strokeWidth={2} opacity={0.7} />
  </g>
);

type Kind = "hang" | "drop" | "wrap" | "lie";
type Item = { x: number; y: number; depth: 0 | 1 | 2; kind: Kind; tilt: number; mirror: 1 | -1 };
const DEPTH = [
  { s: 0.34, o: 0.26, f: "url(#cw-soft-0)" },
  { s: 0.5, o: 0.4, f: "url(#cw-soft-1)" },
  { s: 0.74, o: 0.55, f: "url(#cw-soft-2)" },
];

const makeCrowd = (n: number, x0: number, x1: number): Item[] =>
  Array.from({ length: n }, (_, i) => {
    const r = rnd(i + 5);
    const kind: Kind = r < 0.38 ? "hang" : r < 0.66 ? "drop" : r < 0.82 ? "wrap" : "lie";
    const depth = (i % 3) as 0 | 1 | 2;
    const y = kind === "hang" ? 300 + rnd(i + 31) * 380 : kind === "drop" ? 280 + rnd(i + 31) * 300 : kind === "wrap" ? 640 + rnd(i + 31) * 260 : 380 + rnd(i + 31) * 260;
    return { x: x0 + rnd(i + 17) * (x1 - x0), y, depth, kind, tilt: (rnd(i + 3) - 0.5) * 18, mirror: rnd(i + 8) > 0.5 ? 1 : -1 };
  });

const Body: React.FC<{ it: Item; i: number; sway: number; toward: number }> = ({ it, i, sway, toward }) => {
  const k = it.mirror;
  switch (it.kind) {
    case "hang": // hangs head down from a limb above: the face is upside down and slowly turns toward "you"
      return (
        <g transform={`rotate(${sway} 0 -520)`}>
          <Flesh d={`M${-30 * k} -1100 C${-150 * k} -840 ${-130 * k} -640 ${-40 * k} -520 C${60 * k} -400 ${70 * k} -250 ${6 * k} -110`} w={46} />
          <MaskHead kind={3} x={0} y={0} tilt={180 + it.tilt * 0.6 - toward * 0.5} s={1} />
        </g>
      );
    case "drop": // comes down on a long neck, the face upright, tilting toward "you"
      return (
        <g transform={`rotate(${sway * 0.6} 0 -600)`}>
          <Flesh d={`M${40 * k} -1100 C${-110 * k} -820 ${130 * k} -620 ${-30 * k} -380 C${-110 * k} -250 ${10 * k} -190 0 -110`} w={46} />
          <MaskHead kind={3} x={0} y={0} tilt={it.tilt * 0.5 + toward} s={1} />
        </g>
      );
    case "wrap": // wound round a trunk, the face peeking out sideways
      return (
        <g transform={`scale(${k * 1.2},1.2) translate(0,260)`}>
          <Pose n={5} />
        </g>
      );
    default: // draped along a limb, the head lifted
      return (
        <g transform={`rotate(${sway * 0.4})`}>
          <Flesh d={`M${-360 * k} 90 C${-250 * k} 20 ${-190 * k} 160 ${-100 * k} 60 C${-50 * k} 6 ${-10 * k} -20 0 -90`} w={42} />
          <rect x={-420} y={86} width={460} height={30} rx={14} fill="#0a100b" opacity={0.9} transform={`scale(${k},1)`} />
          <MaskHead kind={3} x={0} y={-30} tilt={it.tilt * 0.4 + toward} s={0.85} />
        </g>
      );
  }
};

/**
 * Pale masks in the dark of the canopy, many kinds and three depths: some hang head down from limbs, some come down on a long neck, some wind round trunks,
 * some lie along a limb. The first (`first`) appears alone at `from`; the rest come one by one from `from2`. Far ones are small and soft, near ones larger;
 * every one is dim, and the ones near the walker (`target` x) are a little brighter. `lean` (0..1) turns every head toward the walker and shifts the bodies.
 * Never a full lit view.
 */
export const CrowdLayer: React.FC<{ g: number; from: number; from2: number; n: number; lean: number; x0: number; x1: number; target: number; first: { x: number; y: number } }> = ({ g, from, from2, n, lean, x0, x1, target, first }) => {
  const items = makeCrowd(n, x0, x1);
  const order = items.map((it, i) => ({ it, i })).sort((a, b) => a.it.depth - b.it.depth);
  return (
    <g>
      <defs>
        {[2.4, 1.3, 0.5].map((b, k) => <filter key={k} id={`cw-soft-${k}`}><feGaussianBlur stdDeviation={b} /></filter>)}
      </defs>
      {order.map(({ it: it0, i }) => {
        let it = it0;
        const t0 = i === 0 ? from : from2 + (i - 1) * 7;
        const o = ramp(g, t0, t0 + 16);
        if (o <= 0) return null;
        if (i === 0) it = { ...it, x: first.x, y: first.y, depth: 2, kind: "drop" };
        const d = DEPTH[it.depth];
        const dir = Math.sign(target - it.x) || 1;
        const near = 1 - clamp01(Math.abs(target - it.x) / 1000);
        const sway = Math.sin(g * 0.021 + i * 1.7) * 2.2;
        const toward = dir * 26 * lean;
        return (
          <g key={i} opacity={o * d.o * (0.65 + 0.7 * near)} filter={d.f} transform={`translate(${it.x + dir * 16 * lean},${it.y}) scale(${d.s})`}>
            <Body it={it} i={i} sway={sway} toward={toward} />
          </g>
        );
      })}
    </g>
  );
};

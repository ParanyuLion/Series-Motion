import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import manifest from "./manifest.json";
import env from "./env.json";
import { fontFamily } from "../island/fonts";
import { Traveller, TravellerMood } from "../shadow1/Traveller";
import { Card, dipOf, idle, track } from "../shadow1/Part1";
import { Mop, RedSweep, SpeakerOverlay, Sub, breathOf } from "../dorm1/Part1";
import { PersonView, scAt } from "../dorm2/Part2";
import { clamp01, lerp, smooth } from "../onestar3/util";
import "../dorm1/Part1";
import "../dorm2/looks";

// "กฎเหล็กหอพัก ตี 3" Part 4, "06:00 กฎของคนที่รอด". Two places: the corridor and, for the man who locked himself in, the room photo.
//   lines 0-1 hook; line 2 the loudspeaker announces rule 4 (speaker overlay, then the rule card); line 3 you and the senior step apart, a soft red blink on you when you stand alone
//   line 4    the first-year girl sits crying at the far end; line 5 the senior says leave her; line 6 the 60 s countdown starts; line 7 (the room) the man who hid alone falls
//   line 8    the puzzle (countdown + "how do you stand?"); line 9 the cleaner at the far end, always watching; line 10 you go back to the girl and call the senior to the other side
//   line 11   three of you far apart but in sight; line 12 zero; line 13 the last page of the senior's notebook
// All timing comes from manifest.json (the narration audio).

const C = manifest.cues as Record<string, number>;
const ls = (i: number) => C[`lineStart${i}`];
const le = (i: number) => C[`lineEnd${i}`];
const mid = (i: number, k: number) => Math.round(ls(i) + k * (le(i) - ls(i)));

type Place = "corr" | "room";
const ROOM_FROM = () => ls(7) - 6;
const ROOM_TO = () => le(7) + 10;
const placeAt = (g: number): Place => (g >= ROOM_FROM() && g < ROOM_TO() ? "room" : "corr");
const EDGES = () => [-999, ROOM_FROM(), ROOM_TO(), 99999];
const BG: Record<Place, { src: string; edge: string }> = {
  corr: { src: "shadow1/bg_dcorr.png", edge: "#a2c0da" },
  room: { src: "shadow1/bg_droom.png", edge: "#3b5165" },
};

const SUBTITLE_FIX = (t: string) =>
  t.replace(/ไซเรน/g, "ไซ⁠เรน").replace(/ป้าแม่บ้าน/g, "ป้า⁠แม่บ้าน").replace(/หอพัก/g, "หอ⁠พัก").replace(/รุ่นพี่/g, "รุ่น⁠พี่").replace(/ลำโพง/g, "ลำ⁠โพง").replace(/ชั่วโมง/g, "ชั่ว⁠โมง").replace(/ทางเดิน/g, "ทาง⁠เดิน").replace(/น้องปีหนึ่ง/g, "น้อง⁠ปีหนึ่ง");

type Cam = { x: number; y: number; z: number };
type Shot = [number, number, Cam, Cam];
const SHOTS = (): Shot[] => [
  [0, ls(2), { x: 560, y: 1000, z: 1.0 }, { x: 560, y: 980, z: 1.15 }],
  [ls(2), ls(3), { x: 560, y: 1000, z: 1.1 }, { x: 580, y: 1000, z: 1.15 }],
  [ls(3), ls(4), { x: 540, y: 1060, z: 1.0 }, { x: 540, y: 1060, z: 1.05 }],
  [ls(4), ls(5), { x: 430, y: 930, z: 1.6 }, { x: 435, y: 920, z: 1.75 }],
  [ls(5), ls(6), { x: 540, y: 1060, z: 1.0 }, { x: 540, y: 1060, z: 1.08 }],
  [ls(6), ROOM_FROM(), { x: 540, y: 1060, z: 1.2 }, { x: 560, y: 1050, z: 1.3 }],
  [ROOM_FROM(), ROOM_TO(), { x: 650, y: 1010, z: 1.3 }, { x: 650, y: 1010, z: 1.3 }],
  [ls(8), ls(9), { x: 540, y: 1060, z: 1.0 }, { x: 540, y: 1060, z: 1.06 }],
  [ls(9), ls(10), { x: 530, y: 960, z: 1.8 }, { x: 530, y: 950, z: 2.0 }],
  [ls(10), ls(11), { x: 540, y: 1070, z: 1.15 }, { x: 540, y: 1060, z: 1.05 }],
  [ls(11), ls(12), { x: 540, y: 1060, z: 1.0 }, { x: 540, y: 1060, z: 1.0 }],
  [ls(12), ls(13), { x: 560, y: 1040, z: 1.2 }, { x: 600, y: 1040, z: 1.35 }],
  [ls(13), le(13) + 40, { x: 540, y: 1060, z: 1.1 }, { x: 540, y: 1060, z: 1.1 }],
];

/** loudness of the narration line the loudspeaker "speaks" (0..1), from scripts/dorm4/envelope.py */
const ampOf = (line: number, g: number) => ((env as Record<string, number[]>)[String(line)] ?? [])[Math.max(0, g - ls(line))] ?? 0;

const RuleCard: React.FC<{ g: number; from: number; dur: number }> = ({ g, from, dur }) => {
  const o = clamp01(Math.min((g - from) / 5, (from + dur - g) / 8));
  if (o <= 0) return null;
  const p = breathOf(g);
  return (
    <div style={{ position: "absolute", inset: 0, background: "#0a0606", opacity: o, fontFamily, color: "#f1e6d4" }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 45%, rgba(200,20,20,${0.16 + 0.2 * p}), transparent 70%)` }} />
      <div style={{ position: "absolute", left: 90, right: 170, top: 300, bottom: 640, border: "6px solid #b01818", borderRadius: 24, background: "linear-gradient(180deg, rgba(34,14,14,0.95), rgba(12,6,6,0.95))", boxShadow: "0 0 60px rgba(200,20,20,0.5)", textAlign: "center", padding: "44px 20px" }}>
        <div style={{ fontSize: 44, color: "#c9a8a0", letterSpacing: 3 }}>06:00</div>
        <div style={{ fontSize: 56, marginTop: 20, color: "#e6d3c0" }}>กฎเหล็กข้อ 4</div>
        <div style={{ fontSize: 100, marginTop: 36, lineHeight: 1.15, color: "#ff3b30" }}>ห้ามอยู่ใกล้ใคร</div>
        <div style={{ fontSize: 100, marginTop: 6, lineHeight: 1.15, color: "#ff3b30" }}>ห้ามอยู่คนเดียว</div>
        <div style={{ fontSize: 50, marginTop: 48, color: "#e6d3c0" }}>ผู้ฝ่าฝืนตายทันที</div>
      </div>
    </div>
  );
};

/** the 60 s red countdown on the wall, with the viewer's question under it */
const Countdown: React.FC<{ g: number; from: number; zero: number; question: boolean }> = ({ g, from, zero, question }) => {
  const o = clamp01((g - from) / 8);
  if (o <= 0) return null;
  const sec = Math.max(0, Math.ceil(60 * (1 - clamp01((g - from) / (zero - from)))));
  const done = g >= zero;
  const p = breathOf(g);
  return (
    <div style={{ position: "absolute", left: 250, right: 330, top: 180, height: 200, opacity: o * (done ? clamp01(1 - (g - zero) / 40) : 1), background: "linear-gradient(180deg,#1b0707,#0a0303)", border: "5px solid #8a1414", borderRadius: 26, boxShadow: `0 0 ${30 + 40 * p}px rgba(220,30,20,0.6)`, textAlign: "center", fontFamily: "monospace", color: "#ff3b2e", fontSize: 150, lineHeight: "200px", textShadow: "0 0 26px #ff2a1a", letterSpacing: 8 }}>
      {String(sec).padStart(2, "0")}
      {question && <div style={{ position: "absolute", left: -120, right: -120, top: 220, fontFamily, fontSize: 56, lineHeight: 1.3, letterSpacing: 0, color: "#f1e6d4", textShadow: "0 3px 12px #000", whiteSpace: "nowrap" }}>ต้องยืนยังไง?</div>}
    </div>
  );
};

/** the last page of the senior's notebook, in the same handwriting as every card on the board */
const NotebookEnd: React.FC<{ g: number; from: number }> = ({ g, from }) => {
  const o = clamp01((g - from) / 10);
  if (o <= 0) return null;
  const hand: React.CSSProperties = { fontFamily, fontStyle: "italic", color: "#2a1a14", textAlign: "center" };
  const k2 = clamp01((g - from - 36) / 14);
  const paper: React.CSSProperties = { background: "linear-gradient(160deg,#efe5cf,#d6c9ac)", border: "4px solid #6a5a44", borderRadius: 6, boxShadow: "0 20px 40px rgba(0,0,0,0.6)" };
  return (
    <div style={{ position: "absolute", inset: 0, background: "#080505", opacity: o }}>
      <div style={{ position: "absolute", left: 110, right: 190, top: 250, transform: "rotate(-2deg)", padding: "40px 30px", ...paper }}>
        <div style={{ ...hand, fontSize: 34, color: "#6a5a44", marginBottom: 14 }}>สมุดของรุ่นพี่ · หน้าสุดท้าย</div>
        <div style={{ ...hand, fontSize: 58, lineHeight: 1.5 }}>คืนที่ 4</div>
        <div style={{ ...hand, fontSize: 50, lineHeight: 1.5 }}>ห้ามอยู่ใกล้ใคร ห้ามอยู่คนเดียว</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 80, top: 650, textAlign: "center", fontFamily, fontSize: 90, color: "#ff5a4a", opacity: k2 }}>=</div>
      <div style={{ position: "absolute", left: 110, right: 190, top: 800, transform: "rotate(3deg)", padding: "36px 30px", opacity: k2, ...paper }}>
        <div style={{ ...hand, fontSize: 34, color: "#6a5a44", marginBottom: 12 }}>การ์ดบนบอร์ดทุกใบ</div>
        <div style={{ ...hand, fontSize: 50, lineHeight: 1.5, whiteSpace: "nowrap" }}>ห้ามอยู่ใกล้ใคร ห้ามอยู่คนเดียว</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 80, top: 1090, textAlign: "center", fontFamily, fontSize: 48, color: "#c9a8a0", opacity: clamp01((g - from - 70) / 14) }}>ลายมือเดียวกัน</div>
    </div>
  );
};

/** a drip stand at the far end of the corridor (a planted hospital clue) */
const DripStand: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} strokeLinejoin="round" strokeLinecap="round">
    <line x1={0} y1={0} x2={0} y2={-330} stroke={INKC} strokeWidth={13} />
    <line x1={0} y1={0} x2={0} y2={-330} stroke="url(#d1-metal)" strokeWidth={7} />
    <path d="M-50 -330 L50 -330" stroke={INKC} strokeWidth={11} />
    <path d="M-50 -330 L50 -330" stroke="url(#d1-metal)" strokeWidth={5} />
    <path d="M-34 -330 L-34 -300 M34 -330 L34 -300" stroke={INKC} strokeWidth={4} />
    <path d="M-52 -296 Q-34 -262 -16 -296 L-16 -234 Q-34 -216 -52 -234 Z" fill="url(#d3-bag)" stroke={INKC} strokeWidth={5} />
    {[-40, 40].map((cx) => <circle key={cx} cx={cx} cy={-4} r={9} fill="url(#d1-dark)" stroke={INKC} strokeWidth={4} />)}
    <path d="M-40 -4 L40 -4" stroke={INKC} strokeWidth={6} />
  </g>
);
const INKC = "#1a1210";

export const Part4: React.FC<{ g?: number }> = ({ g: gOverride }) => {
  const frameNow = useCurrentFrame();
  const g = gOverride ?? frameNow;
  const t = g;
  const place = placeAt(g);
  const edges = EDGES();
  const dark = 1 - Math.max(...edges.slice(0, -1).map((e, i) => dipOf(g, e, edges[i + 1])));

  // ---------------------------------------------------------------- story clocks
  const speakerAt = ls(2) + 4;
  const cardAt = mid(2, 0.62);
  const cardDur = le(2) - cardAt + 30;
  const cdFrom = ls(6);
  const zeroAt = ls(12) + 14;
  const fallAt = mid(7, 0.55);
  const redK = g < zeroAt ? 1 : Math.max(0.15, 1 - (g - zeroAt) / 36);
  const night = place === "room" ? 0.8 : g >= zeroAt ? 0.7 : 0.58;
  const fall = smooth(clamp01((g - fallAt) / 12));
  // a soft red blink (the rhythm of the siren, 1.4 s) on you while you stand apart from everyone
  const blinkOn = g >= mid(3, 0.45) && g < ls(11) ? clamp01(Math.min((g - mid(3, 0.45)) / 10, (ls(11) - g) / 10)) : 0;
  const blink = blinkOn * (0.5 + 0.5 * Math.sin((g * 2 * Math.PI) / 42 - 1.2)) * 0.8;
  const glow = g >= ls(9) && g < ls(10) ? 0.5 + 0.3 * Math.sin(g * 0.15) : 0;
  const youMood: TravellerMood = g >= zeroAt ? "calm" : g >= ls(8) ? "scared" : "worry";

  // ---------------------------------------------------------------- camera
  const shots = SHOTS();
  let cam: Cam = { x: 560, y: 1000, z: 1.1 };
  const cur = shots.find(([a, b]) => g >= a && g < b);
  if (cur) {
    const [a, b, c0, c1] = cur;
    const k = smooth(clamp01((g - a) / Math.max(1, b - a)));
    cam = { x: lerp(c0.x, c1.x, k), y: lerp(c0.y, c1.y, k), z: lerp(c0.z, c1.z, k) };
  } else {
    const prev = [...shots].reverse().find(([, b]) => b <= g);
    if (prev) cam = { ...prev[3] };
  }
  cam = { ...cam, x: Math.min(Math.max(cam.x, 540 / cam.z), 1080 - 540 / cam.z), y: Math.max(cam.y, 900 / cam.z) };
  cam = { ...cam, x: cam.x + 3.2 * Math.sin(t * 0.021) + 1.6 * Math.sin(t * 0.057), y: cam.y + 2.4 * Math.sin(t * 0.017 + 1) };
  const bg = BG[place];

  // ---------------------------------------------------------------- the cast
  const youW = track(g, [[0, 560, 1215, 0], [ls(3), 560, 1215, 0], [mid(3, 0.5), 720, 1215, 0], [ls(10), 720, 1215, 0], [mid(10, 0.5), 560, 1010, 0], [le(10) + 20, 260, 1170, 0]]);
  const srW = track(g, [[0, 410, 1212, 0], [ls(3), 410, 1212, 0], [mid(3, 0.5), 130, 1212, 0], [ls(10) + 10, 130, 1212, 0], [le(10) + 10, 960, 1110, 0]]);
  const girlO = clamp01((g - (ls(4) - 14)) / 16);
  const cl = { x: 520, y: 800 };
  const clO = clamp01((g - (ls(2) - 10)) / 30);

  type Item = { y: number; el: React.ReactNode };
  const items: Item[] = [];
  const shadow = (x: number, y: number, s: number, o = 0.4) => <ellipse cx={x} cy={y + 6} rx={58 * s} ry={11 * s} fill="#000" opacity={o} filter="url(#d4-soft)" />;
  items.push({
    y: youW.y,
    el: (
      <g key="you">
        {blink > 0 && <ellipse cx={youW.x} cy={youW.y - 150 * scAt(youW.y)} rx={230 * scAt(youW.y) + 40} ry={330 * scAt(youW.y) + 40} fill="url(#d4-alone)" opacity={blink} />}
        {shadow(youW.x, youW.y, scAt(youW.y))}
        <g filter="url(#d4-grade)">
          <g transform={`translate(${youW.x},${youW.y + idle(t, 1, youW.walk < 0.05).dy}) scale(${scAt(youW.y)})`}>
            <Traveller yaw={0} mood={youMood} walk={youW.walk} phase={t * 0.2} t={t} />
          </g>
        </g>
      </g>
    ),
  });
  items.push({
    y: srW.y,
    el: (
      <g key="senior">
        {shadow(srW.x, srW.y, scAt(srW.y))}
        <g filter="url(#d4-grade)">
          <PersonView look="senior" x={srW.x} y={srW.y} mood={g >= ls(8) && g < zeroAt ? "worry" : "calm"} face={srW.dir as 1 | -1} walk={srW.walk} talk={g >= ls(5) && g < le(5) ? 1 : 0} seed={2} book={g < ls(13) + 20} t={t} />
        </g>
      </g>
    ),
  });
  if (girlO > 0) {
    const gx = 450, gy = 930;
    items.push({
      y: gy,
      el: (
        <g key="girl" opacity={girlO}>
          {shadow(gx, gy, scAt(gy))}
          <g filter="url(#d4-grade)"><PersonView look="fresh4" x={gx} y={gy} mood={g >= zeroAt ? "calm" : g >= ls(6) ? "agony" : "worry"} face={-1} sit seed={6} t={t} /></g>
        </g>
      ),
    });
  }
  if (clO > 0) {
    const sc = scAt(cl.y);
    items.push({
      y: cl.y,
      el: (
        <g key="cleaner" opacity={clO}>
          {glow > 0 && <ellipse cx={cl.x} cy={cl.y - 130 * sc} rx={150} ry={200} fill="url(#d3-glow)" opacity={glow} />}
          {shadow(cl.x, cl.y, sc)}
          <g filter="url(#d4-grade)"><PersonView look="cleaner" x={cl.x} y={cl.y} mood="calm" face={1} seed={3} t={t} /></g>
        </g>
      ),
    });
    items.push({ y: cl.y + 1, el: <g key="mop" opacity={clO}><Mop x={cl.x - 100 * sc} y={cl.y} s={sc} sway={Math.sin(t * 0.07) * 4} /></g> });
  }
  items.sort((a, b) => a.y - b.y);

  return (
    <AbsoluteFill style={{ background: "#050404" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <defs>
          <filter id="d4-grade" colorInterpolationFilters="sRGB">
            <feColorMatrix type="saturate" values="0.6" />
            <feComponentTransfer><feFuncR type="linear" slope={1 - night * 0.7} intercept={night * 0.03} /><feFuncG type="linear" slope={1 - night * 0.72} intercept={night * 0.04} /><feFuncB type="linear" slope={1 - night * 0.55} intercept={night * 0.09} /></feComponentTransfer>
          </filter>
          <linearGradient id="d1-beam" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#ff2a1a" stopOpacity="0" /><stop offset="0.5" stopColor="#ff2a1a" stopOpacity="0.9" /><stop offset="1" stopColor="#ff2a1a" stopOpacity="0" /></linearGradient>
          <radialGradient id="d4-vig" cx="0.5" cy="0.5" r="0.75"><stop offset="0.45" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.8" /></radialGradient>
          <radialGradient id="d4-alone"><stop offset="0" stopColor="#ff2a1a" stopOpacity="0.55" /><stop offset="1" stopColor="#ff2a1a" stopOpacity="0" /></radialGradient>
          <linearGradient id="d1-metal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#c6cdd2" /><stop offset="0.5" stopColor="#929ba2" /><stop offset="1" stopColor="#5e676e" /></linearGradient>
          <linearGradient id="d1-dark" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#5a636c" /><stop offset="1" stopColor="#262b30" /></linearGradient>
          <linearGradient id="d1-cloth" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e2eaee" /><stop offset="1" stopColor="#a9b6bc" /></linearGradient>
          <linearGradient id="d1-wood" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#b08a5c" /><stop offset="1" stopColor="#6a4c2c" /></linearGradient>
          <linearGradient id="d2-book" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#a8683a" /><stop offset="1" stopColor="#5a341c" /></linearGradient>
          <linearGradient id="d3-bag" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f2f6f8" stopOpacity="0.95" /><stop offset="1" stopColor="#b9d0dc" stopOpacity="0.9" /></linearGradient>
          <radialGradient id="d3-glow"><stop offset="0" stopColor="#ffe9c8" stopOpacity="0.55" /><stop offset="1" stopColor="#ffd9a0" stopOpacity="0" /></radialGradient>
          <linearGradient id="d2-deadshade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#020308" stopOpacity="0.88" /><stop offset="0.5" stopColor="#060a16" stopOpacity="0.62" /><stop offset="1" stopColor="#1c2433" stopOpacity="0.3" /></linearGradient>
          <filter id="d4-soft"><feGaussianBlur stdDeviation="9" /></filter>
          <filter id="d4-grain"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" /><feColorMatrix type="saturate" values="0" /></filter>
        </defs>
        <g transform={`translate(540,900) scale(${cam.z}) translate(${-cam.x},${-cam.y})`}>
          <image href={staticFile(bg.src)} x={0} y={0} width={1080} height={1250} />
          <rect x={-200} y={1236} width={1480} height={1500} fill={bg.edge} />
          <rect x={-200} y={0} width={1480} height={2700} fill="#0a0f24" opacity={night * 0.85} />
          {place === "corr" && (
            <g>
              <g filter="url(#d4-grade)"><DripStand x={470} y={800} s={0.34} /></g>
              {items.map((it) => it.el)}
            </g>
          )}
          {place === "room" && (
            <g>
              <ellipse cx={860 - (fall > 0 ? 80 : 0)} cy={1156} rx={fall > 0 ? 160 : 56} ry={11} fill="#000" opacity={0.4} filter="url(#d4-soft)" />
              <g filter="url(#d4-grade)">
                <PersonView look="man4" x={860} y={1150} s={0.82} mood={g >= fallAt ? "agony" : "worry"} face={-1} rot={fall * -84} dead={fall} seed={7} t={t} />
              </g>
            </g>
          )}
        </g>
        <RedSweep g={g} k={redK} />
        {Array.from({ length: 24 }, (_, i) => {
          const rnd = (a: number, b: number) => { const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return x - Math.floor(x); };
          const x = (rnd(i, 1) * 1200 + t * (0.25 + rnd(i, 2) * 0.5)) % 1200 - 60;
          const y = (rnd(i, 3) * 2000 - t * (0.2 + rnd(i, 4) * 0.4) + 2000) % 2000;
          return <circle key={"d" + i} cx={x} cy={y} r={1.5 + rnd(i, 5) * 2.8} fill="#ffe8e0" opacity={0.1 + 0.18 * rnd(i, 6)} />;
        })}
        <rect width={1080} height={1920} fill="url(#d4-vig)" />
        <rect width={1080} height={1920} filter="url(#d4-grain)" opacity={0.14} />
        <rect width={1080} height={1920} fill="#030202" opacity={dark} />
      </svg>
      <SpeakerOverlay g={g} from={ls(1)} to={le(1) + 6} amp={ampOf(1, g)} />
      <SpeakerOverlay g={g} from={speakerAt} to={cardAt} amp={ampOf(2, g)} />
      <RuleCard g={g} from={cardAt} dur={cardDur} />
      <Countdown g={g} from={cdFrom} zero={zeroAt} question={g >= ls(8) && g < ls(9) + 20} />
      {g >= ls(13) + 8 && <NotebookEnd g={g} from={ls(13) + 8} />}
      <Card a="กฎเหล็กหอพัก ตี 3" b="ตอนที่ 4 · 06:00 กฎของคนที่รอด" at={C.titleAt} dur={46} g={g} />
      {manifest.shots.map((shot, i) => (
        <Sequence key={i} from={manifest.starts[i] + shot.leadFrames} durationInFrames={shot.audioFrames}>
          <Audio src={staticFile(shot.audio)} />
          <Sub text={SUBTITLE_FIX(shot.text)} from={manifest.starts[i] + shot.leadFrames} g={g} />
        </Sequence>
      ))}
      {g >= manifest.outroStart && (
        <div style={{ position: "absolute", inset: 0, background: "#080505", fontFamily, color: "#f1e6d4", opacity: clamp01((g - manifest.outroStart) / 12) }}>
          <div style={{ position: "absolute", top: 560, left: 80, right: 160, textAlign: "center" }}>
            <div style={{ fontSize: 64, lineHeight: 1.5 }}>ชั่วโมงหน้า<br />กฎจะเป็นอะไร?</div>
            <div style={{ fontSize: 42, marginTop: 28, color: "#c9a8a0" }}>ทายในคอมเมนต์</div>
          </div>
          <div style={{ position: "absolute", top: 1100, left: 80, right: 160, textAlign: "center", opacity: clamp01((g - manifest.outroStart - 70) / 12) }}>
            <div style={{ fontSize: 40, color: "#c9a8a0" }}>ตอนต่อไป</div>
            <div style={{ fontSize: 62, marginTop: 14, color: "#ff5a4a" }}>รุ่งสาง กฎข้อสุดท้าย</div>
          </div>
        </div>
      )}
      <Audio src={staticFile("dorm4v/bed.wav")} volume={0.6} />
    </AbsoluteFill>
  );
};

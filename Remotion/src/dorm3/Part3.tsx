import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import manifest from "./manifest.json";
import env from "./env.json";
import { fontFamily } from "../island/fonts";
import { Traveller, TravellerMood } from "../shadow1/Traveller";
import { Card, dipOf, idle } from "../shadow1/Part1";
import { Mop, RedSweep, SpeakerOverlay, Sub, Trolley, breathOf } from "../dorm1/Part1";
import { PersonView, scAt } from "../dorm2/Part2";
import { clamp01, lerp, smooth } from "../onestar3/util";
import "../dorm1/Part1";
import "../dorm2/looks";

// "กฎเหล็กหอพัก ตี 3" Part 3, "05:00 ห้ามไว้ใจกฎ". Two places: the corridor (you, the silent cleaner, the senior) and, for the two friends who answer and die, the room photo.
//   lines 0-1  hook; line 2 the loudspeaker announces rule 3 (the speaker overlay, then the rule card); line 3 the cleaner stands silent beside you (the planted clue)
//   line 4     the loudspeaker asks everyone "do you feel guilty"; lines 5-6 (the room) the two friends answer "yes" and "no" and both fall
//   lines 7-9  the loudspeaker turns to you; a panel poses the puzzle; line 10 the cleaner; line 11 you keep your mouth shut; line 12 the loudspeaker cuts out
//   line 13    the senior hands over a card that was never on the board
// All timing comes from manifest.json (the narration audio).

const C = manifest.cues as Record<string, number>;
const ls = (i: number) => C[`lineStart${i}`];
const le = (i: number) => C[`lineEnd${i}`];
const mid = (i: number, k: number) => Math.round(ls(i) + k * (le(i) - ls(i)));

type Place = "corr" | "room";
const ROOM_FROM = () => ls(5) - 6;
const ROOM_TO = () => le(6) + 10;
const placeAt = (g: number): Place => (g >= ROOM_FROM() && g < ROOM_TO() ? "room" : "corr");
const EDGES = () => [-999, ROOM_FROM(), ROOM_TO(), 99999];
const BG: Record<Place, { src: string; edge: string }> = {
  corr: { src: "shadow1/bg_dcorr.png", edge: "#a2c0da" },
  room: { src: "shadow1/bg_droom.png", edge: "#3b5165" },
};

const SUBTITLE_FIX = (t: string) =>
  t.replace(/ไซเรน/g, "ไซ⁠เรน").replace(/ป้าแม่บ้าน/g, "ป้า⁠แม่บ้าน").replace(/หอพัก/g, "หอ⁠พัก").replace(/รุ่นพี่/g, "รุ่น⁠พี่").replace(/ความจริง/g, "ความ⁠จริง").replace(/ลำโพง/g, "ลำ⁠โพง").replace(/ชั่วโมง/g, "ชั่ว⁠โมง");

type Cam = { x: number; y: number; z: number };
type Shot = [number, number, Cam, Cam];
const SHOTS = (): Shot[] => [
  [0, ls(2), { x: 560, y: 1000, z: 1.0 }, { x: 560, y: 980, z: 1.15 }],
  [ls(2), ls(3), { x: 560, y: 1000, z: 1.1 }, { x: 580, y: 1000, z: 1.15 }],
  [ls(3), ls(4), { x: 650, y: 1020, z: 1.4 }, { x: 680, y: 1030, z: 1.6 }],
  [ls(4), ROOM_FROM(), { x: 600, y: 1010, z: 1.25 }, { x: 600, y: 1010, z: 1.3 }],
  [ROOM_FROM(), ROOM_TO(), { x: 600, y: 1010, z: 1.3 }, { x: 600, y: 1010, z: 1.3 }],
  [ls(7), ls(8), { x: 560, y: 1010, z: 1.7 }, { x: 560, y: 1000, z: 2.0 }],
  [ls(8), ls(9), { x: 560, y: 1010, z: 1.5 }, { x: 570, y: 1010, z: 1.5 }],
  [ls(9), ls(10), { x: 600, y: 1010, z: 1.3 }, { x: 610, y: 1010, z: 1.3 }],
  [ls(10), ls(11), { x: 690, y: 1020, z: 1.8 }, { x: 700, y: 1030, z: 2.2 }],
  [ls(11), ls(12), { x: 560, y: 1000, z: 2.0 }, { x: 560, y: 1000, z: 2.1 }],
  [ls(12), ls(13), { x: 600, y: 1010, z: 1.4 }, { x: 560, y: 1010, z: 1.5 }],
  [ls(13), le(13) + 40, { x: 520, y: 1010, z: 1.6 }, { x: 520, y: 1010, z: 1.6 }],
];

/** loudness of the narration line the loudspeaker "speaks" (0..1), from scripts/dorm3/envelope.py */
const ampOf = (line: number, g: number) => ((env as Record<string, number[]>)[String(line)] ?? [])[Math.max(0, g - ls(line))] ?? 0;

const RuleCard: React.FC<{ g: number; from: number; dur: number }> = ({ g, from, dur }) => {
  const o = clamp01(Math.min((g - from) / 5, (from + dur - g) / 8));
  if (o <= 0) return null;
  const p = breathOf(g);
  return (
    <div style={{ position: "absolute", inset: 0, background: "#0a0606", opacity: o, fontFamily, color: "#f1e6d4" }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 45%, rgba(200,20,20,${0.16 + 0.2 * p}), transparent 70%)` }} />
      <div style={{ position: "absolute", left: 90, right: 170, top: 300, bottom: 640, border: "6px solid #b01818", borderRadius: 24, background: "linear-gradient(180deg, rgba(34,14,14,0.95), rgba(12,6,6,0.95))", boxShadow: "0 0 60px rgba(200,20,20,0.5)", textAlign: "center", padding: "44px 20px" }}>
        <div style={{ fontSize: 44, color: "#c9a8a0", letterSpacing: 3 }}>05:00</div>
        <div style={{ fontSize: 56, marginTop: 20, color: "#e6d3c0" }}>กฎเหล็กข้อ 3</div>
        <div style={{ fontSize: 100, marginTop: 36, lineHeight: 1.15, color: "#ff3b30" }}>ห้ามพูดความจริง</div>
        <div style={{ fontSize: 100, marginTop: 6, lineHeight: 1.15, color: "#ff3b30" }}>ห้ามพูดโกหก</div>
        <div style={{ fontSize: 50, marginTop: 48, color: "#e6d3c0" }}>ผู้ฝ่าฝืนตายทันที</div>
      </div>
    </div>
  );
};

/** the puzzle panel at the top of the picture while the loudspeaker waits for your answer (lines 8 to 10) */
const PuzzlePanel: React.FC<{ g: number; from: number; to: number }> = ({ g, from, to }) => {
  const o = clamp01(Math.min((g - from) / 8, (to - g) / 8));
  if (o <= 0) return null;
  const p = breathOf(g);
  const row: React.CSSProperties = { whiteSpace: "nowrap", textAlign: "center", fontSize: 46, lineHeight: 1.55 };
  return (
    <div style={{ position: "absolute", left: 110, right: 190, top: 170, opacity: o, fontFamily, color: "#f1e6d4", background: "linear-gradient(180deg,rgba(28,8,8,0.88),rgba(10,4,4,0.82))", border: "5px solid #8a1414", borderRadius: 26, padding: "20px 30px", boxShadow: `0 0 ${24 + 30 * p}px rgba(220,30,20,0.55)` }}>
      <div style={row}>ตอบ "ใช่" = ความจริง = <span style={{ color: "#ff7a6a" }}>ตาย</span></div>
      <div style={row}>ตอบ "ไม่" = โกหก = <span style={{ color: "#ff7a6a" }}>ตาย</span></div>
      <div style={{ ...row, fontSize: 60, color: "#ffd9a0", marginTop: 6 }}>แล้วต้องตอบว่าอะไร?</div>
    </div>
  );
};

/** the card the senior hands over: a card that was never on the board, in the handwriting of the cleaner's card and the notebook */
const CardInsert: React.FC<{ g: number; from: number }> = ({ g, from }) => {
  const o = clamp01((g - from) / 10);
  if (o <= 0) return null;
  const p = 0.5 + 0.5 * breathOf(g);
  const hand: React.CSSProperties = { fontFamily, fontStyle: "italic", color: "#2a1a14", textAlign: "center" };
  return (
    <div style={{ position: "absolute", inset: 0, background: "#080505", opacity: o }}>
      <div style={{ position: "absolute", left: 120, right: 200, top: 520, transform: "rotate(-3deg)", background: "linear-gradient(160deg,#efe5cf,#d6c9ac)", border: "4px solid #6a5a44", borderRadius: 6, padding: "70px 36px", boxShadow: "0 20px 40px rgba(0,0,0,0.6)" }}>
        <div style={{ ...hand, fontSize: 36, color: "#8a7a5e", marginBottom: 20 }}>การ์ดที่ไม่เคยอยู่บนบอร์ด</div>
        <div style={{ ...hand, fontSize: 76, lineHeight: 1.5 }}>ห้ามไว้ใจกฎ</div>
        <div style={{ ...hand, fontSize: 64, lineHeight: 1.5, marginTop: 14 }}>ห้ามไว้ใจคนที่เขียนกฎ</div>
        <div style={{ position: "absolute", inset: 0, background: "#e01818", mixBlendMode: "multiply", opacity: 0.3 * p }} />
      </div>
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

export const Part3: React.FC<{ g?: number }> = ({ g: gOverride }) => {
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
  const fallAt = mid(6, 0.4);
  const redK = g < mid(12, 0.6) ? 1 : Math.max(0.15, 1 - (g - mid(12, 0.6)) / 36);
  const night = place === "room" ? 0.8 : 0.58;
  const youMood: TravellerMood = g >= ls(11) ? "calm" : g >= ls(7) ? "scared" : g >= ls(3) ? "worry" : "worry";

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
  const cl = { x: 700, y: 1150 };
  const clO = clamp01((g - (ls(3) - 20)) / 24);
  const fall = smooth(clamp01((g - fallAt) / 12));
  const glow = g >= ls(10) && g < ls(11) ? 0.5 + 0.3 * Math.sin(g * 0.15) : 0;

  type Item = { y: number; el: React.ReactNode };
  const items: Item[] = [];
  const shadow = (x: number, y: number, s: number, o = 0.4) => <ellipse cx={x} cy={y + 6} rx={58 * s} ry={11 * s} fill="#000" opacity={o} filter="url(#d3-soft)" />;
  items.push({
    y: 1215,
    el: (
      <g key="you">
        {shadow(560, 1215, scAt(1215))}
        <g filter="url(#d3-grade)">
          <g transform={`translate(560,${1215 + idle(t, 1, true).dy}) scale(${scAt(1215)})`}>
            <Traveller yaw={0} mood={youMood} walk={0} phase={t * 0.2} t={t} />
          </g>
        </g>
      </g>
    ),
  });
  items.push({
    y: 1212,
    el: (
      <g key="senior">
        {shadow(410, 1212, scAt(1212))}
        <g filter="url(#d3-grade)">
          <PersonView look="senior" x={410} y={1212} mood={g >= ls(7) ? "worry" : "calm"} face={1} seed={2} book={g < ls(13) + 20} t={t} />
        </g>
      </g>
    ),
  });
  if (clO > 0) {
    const sc = scAt(cl.y);
    items.push({ y: cl.y - 1, el: <g key="trolley" opacity={clO}><Trolley x={cl.x - 200 * sc} y={cl.y} s={sc * 1.1} /></g> });
    items.push({
      y: cl.y,
      el: (
        <g key="cleaner" opacity={clO}>
          {glow > 0 && <ellipse cx={cl.x} cy={cl.y - 130 * sc} rx={150} ry={200} fill="url(#d3-glow)" opacity={glow} />}
          {shadow(cl.x, cl.y, sc)}
          <g filter="url(#d3-grade)"><PersonView look="cleaner" x={cl.x} y={cl.y} mood="calm" face={-1} seed={3} t={t} /></g>
        </g>
      ),
    });
    items.push({ y: cl.y + 1, el: <g key="mop" opacity={clO}><Mop x={cl.x + 130 * sc} y={cl.y} s={sc} sway={Math.sin(t * 0.07) * 4} /></g> });
  }
  items.sort((a, b) => a.y - b.y);

  return (
    <AbsoluteFill style={{ background: "#050404" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <defs>
          <filter id="d3-grade" colorInterpolationFilters="sRGB">
            <feColorMatrix type="saturate" values="0.6" />
            <feComponentTransfer><feFuncR type="linear" slope={1 - night * 0.7} intercept={night * 0.03} /><feFuncG type="linear" slope={1 - night * 0.72} intercept={night * 0.04} /><feFuncB type="linear" slope={1 - night * 0.55} intercept={night * 0.09} /></feComponentTransfer>
          </filter>
          <linearGradient id="d1-beam" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#ff2a1a" stopOpacity="0" /><stop offset="0.5" stopColor="#ff2a1a" stopOpacity="0.9" /><stop offset="1" stopColor="#ff2a1a" stopOpacity="0" /></linearGradient>
          <radialGradient id="d3-vig" cx="0.5" cy="0.5" r="0.75"><stop offset="0.45" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.8" /></radialGradient>
          <linearGradient id="d1-metal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#c6cdd2" /><stop offset="0.5" stopColor="#929ba2" /><stop offset="1" stopColor="#5e676e" /></linearGradient>
          <linearGradient id="d1-dark" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#5a636c" /><stop offset="1" stopColor="#262b30" /></linearGradient>
          <linearGradient id="d1-cloth" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e2eaee" /><stop offset="1" stopColor="#a9b6bc" /></linearGradient>
          <linearGradient id="d1-wood" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#b08a5c" /><stop offset="1" stopColor="#6a4c2c" /></linearGradient>
          <linearGradient id="d2-book" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#a8683a" /><stop offset="1" stopColor="#5a341c" /></linearGradient>
          <linearGradient id="d3-bag" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f2f6f8" stopOpacity="0.95" /><stop offset="1" stopColor="#b9d0dc" stopOpacity="0.9" /></linearGradient>
          <radialGradient id="d3-glow"><stop offset="0" stopColor="#ffe9c8" stopOpacity="0.55" /><stop offset="1" stopColor="#ffd9a0" stopOpacity="0" /></radialGradient>
          <linearGradient id="d2-deadshade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#020308" stopOpacity="0.88" /><stop offset="0.5" stopColor="#060a16" stopOpacity="0.62" /><stop offset="1" stopColor="#1c2433" stopOpacity="0.3" /></linearGradient>
          <filter id="d3-soft"><feGaussianBlur stdDeviation="9" /></filter>
          <filter id="d3-grain"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" /><feColorMatrix type="saturate" values="0" /></filter>
        </defs>
        <g transform={`translate(540,900) scale(${cam.z}) translate(${-cam.x},${-cam.y})`}>
          <image href={staticFile(bg.src)} x={0} y={0} width={1080} height={1250} />
          <rect x={-200} y={1236} width={1480} height={1500} fill={bg.edge} />
          <rect x={-200} y={0} width={1480} height={2700} fill="#0a0f24" opacity={night * 0.85} />
          {place === "corr" && (
            <g>
              <g filter="url(#d3-grade)"><DripStand x={470} y={800} s={0.34} /></g>
              {items.map((it) => it.el)}
            </g>
          )}
          {place === "room" && (
            <g>
              {[
                { look: "friendA", x: 640, y: 1150, talk: g >= mid(5, 0.35) && g < mid(5, 0.62) ? 1 : 0 },
                { look: "friendB", x: 880, y: 1175, talk: g >= mid(5, 0.62) && g < le(5) ? 1 : 0 },
              ].map((f, i) => (
                <g key={f.look}>
                  <ellipse cx={f.x - (fall > 0 ? 80 : 0)} cy={f.y + 6} rx={fall > 0 ? 160 : 56} ry={11} fill="#000" opacity={0.4} filter="url(#d3-soft)" />
                  <g filter="url(#d3-grade)">
                    <PersonView look={f.look} x={f.x} y={f.y} s={0.82} mood={g >= fallAt ? "agony" : "worry"} face={i === 0 ? 1 : -1} rot={fall * -84} dead={fall} talk={f.talk} seed={4 + i} t={t} />
                  </g>
                </g>
              ))}
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
        <rect width={1080} height={1920} fill="url(#d3-vig)" />
        <rect width={1080} height={1920} filter="url(#d3-grain)" opacity={0.14} />
        <rect width={1080} height={1920} fill="#030202" opacity={dark} />
      </svg>
      <SpeakerOverlay g={g} from={ls(1)} to={le(1) + 6} amp={ampOf(1, g)} />
      <SpeakerOverlay g={g} from={speakerAt} to={cardAt} amp={ampOf(2, g)} />
      <SpeakerOverlay g={g} from={ls(4)} to={le(4) + 6} amp={ampOf(4, g)} />
      <RuleCard g={g} from={cardAt} dur={cardDur} />
      <PuzzlePanel g={g} from={ls(8) + 6} to={ls(11) - 6} />
      {g >= ls(13) + 8 && <CardInsert g={g} from={ls(13) + 8} />}
      <Card a="กฎเหล็กหอพัก ตี 3" b="ตอนที่ 3 · 05:00 ห้ามไว้ใจกฎ" at={C.titleAt} dur={46} g={g} />
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
            <div style={{ fontSize: 62, marginTop: 14, color: "#ff5a4a" }}>06:00 กฎของคนที่รอด</div>
          </div>
        </div>
      )}
      <Audio src={staticFile("dorm3v/bed.wav")} volume={0.6} />
    </AbsoluteFill>
  );
};

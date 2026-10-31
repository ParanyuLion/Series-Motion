import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import manifest from "./manifest.json";
import env from "./env.json";
import { fontFamily } from "../island/fonts";
import { Figure, LOOKS, Mood } from "../shadow1/Figure";
import { Traveller, TravellerMood } from "../shadow1/Traveller";
import { INK } from "../shadow1/VillageVert";
import { Card, dipOf, idle, track } from "../shadow1/Part1";
import { Mop, RedSweep, SpeakerOverlay, Sub, Trolley, breathOf } from "../dorm1/Part1";
import { clamp01, lerp, smooth } from "../onestar3/util";
import "../dorm1/Part1";
import "./looks";

// "กฎเหล็กหอพัก ตี 3" Part 2, "04:00 กฎที่ขัดกัน". Almost all in the corridor (a photo backdrop with an open door on the right = room 304), plus one cut inside the room:
//   lines 0-1  the hook, you stand in the corridor; line 2-3 the loudspeaker announces rule 2, then the rule card
//   line 4     the cleaner mops at door 304 and puts a wet-floor sign across the threshold (the planted clue)
//   line 5     the senior (a woman with a notebook); line 6 a girl runs into the room and dies (the room cut); line 7 a man runs away down the corridor and dies
//   lines 8-12 a 60 s countdown; the question; the sign; you and the senior stand on the threshold; zero, the red light goes out
//   line 13    the notebook insert: the same handwriting as the cleaner's card
// All timing comes from manifest.json (the narration audio).

const C = manifest.cues as Record<string, number>;
const ls = (i: number) => C[`lineStart${i}`];
const le = (i: number) => C[`lineEnd${i}`];
const mid = (i: number, k: number) => Math.round(ls(i) + k * (le(i) - ls(i)));

type Place = "corr" | "room";
const ROOM_FROM = () => mid(6, 0.5);
const ROOM_TO = () => le(6) + 10;
const placeAt = (g: number): Place => (g >= ROOM_FROM() && g < ROOM_TO() ? "room" : "corr");
const EDGES = () => [-999, ROOM_FROM(), ROOM_TO(), 99999];
const BG: Record<Place, { src: string; edge: string }> = {
  corr: { src: "shadow1/bg_dcorr.png", edge: "#a2c0da" },
  room: { src: "shadow1/bg_droom.png", edge: "#3b5165" },
};

const SUBTITLE_FIX = (t: string) =>
  t.replace(/ไซเรน/g, "ไซ⁠เรน").replace(/ป้าแม่บ้าน/g, "ป้า⁠แม่บ้าน").replace(/หอพัก/g, "หอ⁠พัก").replace(/ทางเดิน/g, "ทาง⁠เดิน").replace(/ธรณีประตู/g, "ธรณี⁠ประตู").replace(/รุ่นพี่ปีสี่/g, "รุ่น⁠พี่⁠ปี⁠สี่").replace(/ถอยหลัง/g, "ถอย⁠หลัง");

type Cam = { x: number; y: number; z: number };
type Shot = [number, number, Cam, Cam];
const SHOTS = (): Shot[] => [
  [0, ls(2), { x: 560, y: 1000, z: 1.0 }, { x: 560, y: 980, z: 1.15 }],
  [ls(2), ls(4), { x: 560, y: 1000, z: 1.1 }, { x: 580, y: 1000, z: 1.15 }],
  [ls(4), ls(5), { x: 700, y: 950, z: 1.35 }, { x: 760, y: 1000, z: 1.6 }],
  [ls(5), ls(6), { x: 450, y: 1020, z: 1.3 }, { x: 480, y: 1010, z: 1.3 }],
  [ls(6), ROOM_FROM(), { x: 640, y: 1020, z: 1.3 }, { x: 760, y: 1010, z: 1.5 }],
  [ROOM_FROM(), ROOM_TO(), { x: 640, y: 1000, z: 1.35 }, { x: 620, y: 1010, z: 1.35 }],
  [ls(7), ls(8), { x: 520, y: 900, z: 1.1 }, { x: 520, y: 850, z: 1.25 }],
  [ls(8), ls(9), { x: 560, y: 1010, z: 1.15 }, { x: 580, y: 1010, z: 1.15 }],
  [ls(9), ls(10), { x: 600, y: 1000, z: 1.2 }, { x: 640, y: 1020, z: 1.4 }],
  [ls(10), ls(11), { x: 740, y: 1030, z: 1.9 }, { x: 800, y: 1030, z: 2.4 }],
  [ls(11), ls(12), { x: 830, y: 1020, z: 2.2 }, { x: 830, y: 1020, z: 2.2 }],
  [ls(12), ls(13), { x: 830, y: 1020, z: 2.0 }, { x: 700, y: 1000, z: 1.5 }],
  [ls(13), le(13) + 40, { x: 600, y: 1010, z: 1.3 }, { x: 600, y: 1010, z: 1.3 }],
];

/** loudness of the narration line the loudspeaker "speaks" (0..1), from scripts/dorm2/envelope.py */
const ampOf = (line: number, g: number) => ((env as Record<string, number[]>)[String(line)] ?? [])[Math.max(0, g - ls(line))] ?? 0;

/** figure scale by the y of its feet on the corridor floor (far end 720 -> 0.24, near 1235 -> 0.78) */
const scAt = (y: number) => Math.max(0.2, 0.24 + ((y - 720) * 0.54) / 515);
/** the threshold of room 304 on the backdrop */
const DOOR = { x: 770, y: 1052 };

const RuleCard: React.FC<{ g: number; from: number; dur: number }> = ({ g, from, dur }) => {
  const o = clamp01(Math.min((g - from) / 5, (from + dur - g) / 8));
  if (o <= 0) return null;
  const p = breathOf(g);
  return (
    <div style={{ position: "absolute", inset: 0, background: "#0a0606", opacity: o, fontFamily, color: "#f1e6d4" }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 45%, rgba(200,20,20,${0.16 + 0.2 * p}), transparent 70%)` }} />
      <div style={{ position: "absolute", left: 90, right: 170, top: 300, bottom: 640, border: "6px solid #b01818", borderRadius: 24, background: "linear-gradient(180deg, rgba(34,14,14,0.95), rgba(12,6,6,0.95))", boxShadow: "0 0 60px rgba(200,20,20,0.5)", textAlign: "center", padding: "44px 20px" }}>
        <div style={{ fontSize: 44, color: "#c9a8a0", letterSpacing: 3 }}>04:00</div>
        <div style={{ fontSize: 56, marginTop: 20, color: "#e6d3c0" }}>กฎเหล็กข้อ 2</div>
        <div style={{ fontSize: 104, marginTop: 36, lineHeight: 1.15, color: "#ff3b30" }}>ห้ามอยู่ในห้อง</div>
        <div style={{ fontSize: 104, marginTop: 6, lineHeight: 1.15, color: "#ff3b30" }}>ห้ามอยู่นอกห้อง</div>
        <div style={{ fontSize: 50, marginTop: 48, color: "#e6d3c0" }}>ผู้ฝ่าฝืนตายทันที</div>
      </div>
    </div>
  );
};

/** the red countdown panel on the wall, over the top of the picture (never over the characters at mid-height) */
const Countdown: React.FC<{ g: number; from: number; zero: number; question: boolean }> = ({ g, from, zero, question }) => {
  const o = clamp01((g - from) / 8);
  if (o <= 0) return null;
  const sec = Math.max(0, Math.ceil(60 * (1 - clamp01((g - from) / (zero - from)))));
  const done = g >= zero;
  const p = breathOf(g);
  return (
    <div style={{ position: "absolute", left: 250, right: 330, top: 180, height: 200, opacity: o * (done ? clamp01(1 - (g - zero) / 40) : 1), background: "linear-gradient(180deg,#1b0707,#0a0303)", border: "5px solid #8a1414", borderRadius: 26, boxShadow: `0 0 ${30 + 40 * p}px rgba(220,30,20,0.6)`, textAlign: "center", fontFamily: "monospace", color: "#ff3b2e", fontSize: 150, lineHeight: "200px", textShadow: "0 0 26px #ff2a1a", letterSpacing: 8 }}>
      {String(sec).padStart(2, "0")}
      {question && <div style={{ position: "absolute", left: 0, right: 0, top: 220, fontFamily, fontSize: 60, lineHeight: 1.3, letterSpacing: 0, color: "#f1e6d4", textShadow: "0 3px 12px #000" }}>ที่ไหน?</div>}
    </div>
  );
};

/** the notebook of the senior: pages of rule cards in the same handwriting as the cleaner's card of Part 1 */
const NotebookInsert: React.FC<{ g: number; from: number }> = ({ g, from }) => {
  const o = clamp01((g - from) / 10);
  if (o <= 0) return null;
  const hand: React.CSSProperties = { fontFamily, fontStyle: "italic", color: "#2a1a14" };
  const k2 = clamp01((g - from - 40) / 14);
  return (
    <div style={{ position: "absolute", inset: 0, background: "#080505", opacity: o }}>
      <div style={{ position: "absolute", left: 90, right: 170, top: 250, transform: "rotate(-2deg)", background: "linear-gradient(160deg,#efe5cf,#d6c9ac)", border: "4px solid #6a5a44", borderRadius: 6, padding: "40px 36px", boxShadow: "0 20px 40px rgba(0,0,0,0.6)" }}>
        <div style={{ ...hand, fontSize: 34, color: "#6a5a44", textAlign: "center", marginBottom: 14 }}>สมุดของรุ่นพี่</div>
        {["คืนที่ 1 ห้ามพูดเสียงดัง", "คืนที่ 2 ห้ามเปิดไฟ", "คืนที่ 3 ห้ามอยู่ในห้อง ห้ามอยู่นอกห้อง"].map((t, i) => (
          <div key={i} style={{ ...hand, fontSize: 44, lineHeight: 1.7, borderBottom: "2px solid #a8977a" }}>{t}</div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 160, right: 240, top: 1000, transform: "rotate(3deg)", opacity: k2, background: "linear-gradient(160deg,#efe5cf,#d6c9ac)", border: "4px solid #6a5a44", borderRadius: 6, padding: "30px 30px", textAlign: "center", boxShadow: "0 20px 40px rgba(0,0,0,0.6)" }}>
        <div style={{ ...hand, fontSize: 34, color: "#6a5a44" }}>กระดาษของป้าแม่บ้าน</div>
        <div style={{ ...hand, fontSize: 52, lineHeight: 1.5 }}>ชั่วโมงหน้า กฎจะตรงข้ามกับตอนนี้</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 80, top: 880, textAlign: "center", opacity: k2, fontFamily, fontSize: 52, color: "#ff5a4a", textShadow: "0 0 18px #000" }}>ลายมือเดียวกัน</div>
    </div>
  );
};

/** a yellow "wet floor" A-frame sign (origin at its feet) */
const WetSign: React.FC<{ x: number; y: number; s: number; glow: number }> = ({ x, y, s, glow }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} strokeLinejoin="round">
    {glow > 0 && <ellipse cx={0} cy={-110} rx={150} ry={170} fill="url(#d2-signglow)" opacity={glow} />}
    <path d="M-62 0 L-46 -190 L46 -190 L62 0 Z" fill="url(#d2-sign)" stroke={INK} strokeWidth={7} />
    <path d="M-52 -14 L-40 -176 L40 -176 L52 -14 Z" fill="none" stroke="#c08a10" strokeWidth={4} opacity={0.7} />
    <path d="M0 -168 L26 -120 L-26 -120 Z" fill="#1c1a16" />
    <text x={0} y={-52} textAnchor="middle" fontFamily={fontFamily} fontSize={38} fontWeight={700} fill="#1c1a16">พื้นเปียก</text>
    <rect x={-66} y={-6} width={132} height={8} rx={3} fill="#8a6a10" opacity={0.6} />
  </g>
);

/** the notebook the senior hugs (drawn over her chest, in figure units) */
const Notebook: React.FC = () => (
  <g transform="translate(-6,-250) rotate(-6)" strokeLinejoin="round">
    <rect x={-58} y={-72} width={116} height={146} rx={8} fill="url(#d2-book)" stroke={INK} strokeWidth={6} />
    <rect x={-58} y={-72} width={20} height={146} rx={6} fill="#3a2418" stroke={INK} strokeWidth={5} />
    <rect x={-22} y={-50} width={62} height={34} rx={4} fill="#e9dcbc" stroke={INK} strokeWidth={3} />
  </g>
);

type Person = { look: string; x: number; y: number; s?: number; mood: Mood; walk?: number; face?: 1 | -1; rot?: number; dead?: number; talk?: number; seed?: number; o?: number; book?: boolean };

const PersonView: React.FC<Person & { t: number }> = ({ look, x, y, s, mood, walk = 0, face = 1, rot = 0, dead = 0, talk = 0, seed = 0, o = 1, book = false, t }) => {
  const sc = s ?? scAt(y);
  const i = idle(t, seed, walk < 0.05 && rot === 0);
  return (
    <g opacity={o} transform={`translate(${x},${y + i.dy}) rotate(${i.rot + rot}) scale(${sc},${sc * i.sy})`}>
      <Figure look={LOOKS[look]} mood={mood} facing={face} walk={walk} talk={talk} t={t + seed * 40} />
      {book && <g transform={`scale(${face},1)`}><Notebook /></g>}
      {dead > 0.4 && (
        <g opacity={clamp01((dead - 0.4) / 0.4)}>
          <ellipse cx={0} cy={-422} rx={92} ry={96} fill="url(#d2-deadshade)" />
          <ellipse cx={-34} cy={-406} rx={34} ry={28} fill="#010206" opacity={0.5} />
          <ellipse cx={34} cy={-406} rx={34} ry={28} fill="#010206" opacity={0.5} />
        </g>
      )}
    </g>
  );
};

export const Part2: React.FC<{ g?: number }> = ({ g: gOverride }) => {
  const frameNow = useCurrentFrame();
  const g = gOverride ?? frameNow;
  const t = g;
  const place = placeAt(g);
  const edges = EDGES();
  const dark = 1 - Math.max(...edges.slice(0, -1).map((e, i) => dipOf(g, e, edges[i + 1])));

  // ---------------------------------------------------------------- story clocks
  const speakerAt = ls(2) + 4;
  const cardAt = mid(3, 0.5);
  const cardDur = le(3) - cardAt + 36;
  const showSpeaker = g >= speakerAt && g < cardAt;
  const cdFrom = ls(8);
  const zeroAt = ls(12) + 14;
  const redK = g < zeroAt ? 1 : Math.max(0.12, 1 - (g - zeroAt) / 30);
  const signAt = mid(4, 0.62);
  const girlRun = [ls(6) + 4, ROOM_FROM() - 4];
  const girlFall = mid(6, 0.86);
  const manFall = mid(7, 0.72);

  // ---------------------------------------------------------------- the cast (all on the corridor floor; y is the feet)
  const people: (Person & { key: string })[] = [];
  const you = (() => {
    const w = track(g, [[0, 560, 1215, 0], [ls(10) + 10, 560, 1215, 0], [ls(11) + 36, 840, 1058, 0]]);
    return { x: w.x, y: w.y, walk: w.walk };
  })();
  if (place === "corr") {
    people.push({ key: "you", look: "you", x: you.x, y: you.y, mood: "worry", walk: you.walk, seed: 1 });
    // the cleaner: far end -> the door of 304, mops there, puts the sign across the threshold
    if (g >= ls(4) - 20 && g < ls(6) + 10) {
      const k = smooth(clamp01((g - ls(4) + 20) / (mid(4, 0.55) - ls(4) + 20)));
      const d = smooth(clamp01((g - mid(4, 0.85)) / (ls(6) - mid(4, 0.85))));
      const cy = lerp(740, 1062, k) + (1 - 0) * 0 - d * (1062 - 760);
      const cx = lerp(430, 690, k) - d * 250;
      const moving = (k > 0.02 && k < 0.98) || (d > 0.02 && d < 0.98);
      people.push({ key: "cleaner", look: "cleaner", x: cx, y: cy, mood: "calm", walk: moving ? 1 : 0, face: d > 0.02 ? 1 : -1, seed: 3, o: clamp01((g - ls(4) + 20) / 24) * clamp01(1 - (d - 0.7) / 0.3) });
    }
    // the senior comes in from the left hugging her notebook
    if (g >= ls(5) - 4) {
      const w = track(g, [[ls(5) - 4, 120, 1232, 0], [mid(5, 0.55), 410, 1212, 0], [ls(11) + 6, 410, 1212, 0], [ls(11) + 40, 915, 1060, 0]]);
      people.push({ key: "senior", look: "senior", x: w.x, y: w.y, mood: g >= ls(8) ? "worry" : "calm", walk: w.walk, face: w.dir as 1 | -1, talk: g >= ls(5) && g < le(5) ? 1 : 0, seed: 2, book: g < ls(13) + 20 });
    }
    // the girl runs to the door and goes in
    if (g >= girlRun[0] - 8 && g < ROOM_FROM() + 4) {
      const k = smooth(clamp01((g - girlRun[0]) / (girlRun[1] - girlRun[0])));
      people.push({ key: "girl", look: "girl3", x: lerp(300, 820, k), y: lerp(1205, 1054, k), mood: "worry", walk: k > 0 && k < 1 ? 1 : 0, seed: 4, o: clamp01(1 - (g - girlRun[1]) / 6) });
    }
    // the man runs away down the corridor and falls
    if (g >= ls(7) - 6) {
      const run = smooth(clamp01((g - ls(7)) / (manFall - ls(7))));
      const fallK = smooth(clamp01((g - manFall) / 12));
      people.push({ key: "man", look: "man3", x: lerp(340, 505, run), y: lerp(1200, 756, run), mood: g >= manFall ? "agony" : "worry", walk: run > 0 && run < 1 ? 1 : 0, face: 1, rot: fallK * -84, dead: fallK, seed: 5 });
    }
  }
  const girlRoom = (() => {
    const fallK = smooth(clamp01((g - girlFall) / 12));
    const walkIn = smooth(clamp01((g - ROOM_FROM()) / 12));
    return { x: lerp(960, 800, walkIn), y: 1150, fallK };
  })();

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
  const night = place === "room" ? 0.8 : g >= zeroAt ? 0.72 : 0.58;
  const signGlow = g >= ls(10) && g < ls(12) ? 0.5 + 0.3 * Math.sin(g * 0.15) : 0;
  const speakerOn = (g >= ls(1) && g < le(1) + 6) || showSpeaker;
  void speakerOn;

  type Item = { y: number; el: React.ReactNode };
  const items: Item[] = [];
  people.forEach((p) => {
    const sc = p.s ?? scAt(p.y);
    items.push({
      y: p.y,
      el: (
        <g key={p.key}>
          <ellipse cx={p.x - (p.rot ? 80 * sc : 0)} cy={p.y + 6} rx={(p.rot ? 180 : 58) * sc} ry={11 * sc} fill="#000" opacity={0.4 * (p.o ?? 1)} filter="url(#d2-soft)" />
          <g filter="url(#d2-grade)">
            {p.key === "you" ? (
              <g transform={`translate(${p.x},${p.y + idle(t, 1, (p.walk ?? 0) < 0.05).dy}) scale(${sc})`}>
                <Traveller yaw={0} mood={g >= ls(8) ? "scared" : ("worry" as TravellerMood)} walk={p.walk ?? 0} phase={t * 0.2} t={t} />
              </g>
            ) : (
              <PersonView {...p} t={t} />
            )}
          </g>
        </g>
      ),
    });
  });
  if (place === "corr") {
    {
      const cl = people.find((p) => p.key === "cleaner");
      if (cl) {
        const sc = scAt(cl.y);
        items.push({ y: cl.y - 1, el: <g key="trolley" opacity={cl.o}><Trolley x={cl.x - 200 * sc} y={cl.y} s={sc * 1.1} /></g> });
        items.push({ y: cl.y + 1, el: <g key="mop" opacity={cl.o}><Mop x={cl.x + 130 * sc} y={cl.y} s={sc} sway={Math.sin(t * 0.07) * 4 + (g > mid(4, 0.55) ? Math.sin(t * 0.2) * 6 : 0)} /></g> });
      }
    }
    if (g >= signAt) {
      const drop = smooth(clamp01((g - signAt) / 8));
      items.push({ y: DOOR.y + 2, el: <g key="sign" opacity={drop}><WetSign x={DOOR.x} y={DOOR.y - 14 * (1 - drop)} s={scAt(DOOR.y) * 1.05} glow={signGlow} /></g> });
    }
  }
  items.sort((a, b) => a.y - b.y);

  return (
    <AbsoluteFill style={{ background: "#050404" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <defs>
          <filter id="d2-grade" colorInterpolationFilters="sRGB">
            <feColorMatrix type="saturate" values="0.6" />
            <feComponentTransfer><feFuncR type="linear" slope={1 - night * 0.7} intercept={night * 0.03} /><feFuncG type="linear" slope={1 - night * 0.72} intercept={night * 0.04} /><feFuncB type="linear" slope={1 - night * 0.55} intercept={night * 0.09} /></feComponentTransfer>
          </filter>
          <linearGradient id="d1-beam" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#ff2a1a" stopOpacity="0" /><stop offset="0.5" stopColor="#ff2a1a" stopOpacity="0.9" /><stop offset="1" stopColor="#ff2a1a" stopOpacity="0" /></linearGradient>
          <radialGradient id="d2-vig" cx="0.5" cy="0.5" r="0.75"><stop offset="0.45" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.8" /></radialGradient>
          <linearGradient id="d1-metal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#c6cdd2" /><stop offset="0.5" stopColor="#929ba2" /><stop offset="1" stopColor="#5e676e" /></linearGradient>
          <linearGradient id="d1-dark" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#5a636c" /><stop offset="1" stopColor="#262b30" /></linearGradient>
          <linearGradient id="d1-cloth" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e2eaee" /><stop offset="1" stopColor="#a9b6bc" /></linearGradient>
          <linearGradient id="d1-wood" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#b08a5c" /><stop offset="1" stopColor="#6a4c2c" /></linearGradient>
          <linearGradient id="d2-sign" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffe45a" /><stop offset="1" stopColor="#d9a812" /></linearGradient>
          <radialGradient id="d2-signglow"><stop offset="0" stopColor="#ffe66a" stopOpacity="0.8" /><stop offset="1" stopColor="#ffd040" stopOpacity="0" /></radialGradient>
          <linearGradient id="d2-book" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#a8683a" /><stop offset="1" stopColor="#5a341c" /></linearGradient>
          <linearGradient id="d2-deadshade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#020308" stopOpacity="0.88" /><stop offset="0.5" stopColor="#060a16" stopOpacity="0.62" /><stop offset="1" stopColor="#1c2433" stopOpacity="0.3" /></linearGradient>
          <filter id="d2-soft"><feGaussianBlur stdDeviation="9" /></filter>
          <filter id="d2-grain"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" /><feColorMatrix type="saturate" values="0" /></filter>
        </defs>
        <g transform={`translate(540,900) scale(${cam.z}) translate(${-cam.x},${-cam.y})`}>
          <image href={staticFile(bg.src)} x={0} y={0} width={1080} height={1250} />
          <rect x={-200} y={1236} width={1480} height={1500} fill={bg.edge} />
          <rect x={-200} y={0} width={1480} height={2700} fill="#0a0f24" opacity={night * 0.85} />
          {place === "corr" && items.map((it) => it.el)}
          {place === "room" && (
            <g>
              <ellipse cx={girlRoom.x - (girlRoom.fallK > 0 ? 70 : 0)} cy={girlRoom.y + 6} rx={girlRoom.fallK > 0 ? 150 : 54} ry={11} fill="#000" opacity={0.4} filter="url(#d2-soft)" />
              <g filter="url(#d2-grade)">
                <PersonView look="girl3" x={girlRoom.x} y={girlRoom.y} s={0.8} mood={g >= girlFall ? "agony" : "worry"} rot={girlRoom.fallK * -84} dead={girlRoom.fallK} seed={4} t={t} />
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
        <rect width={1080} height={1920} fill="url(#d2-vig)" />
        <rect width={1080} height={1920} filter="url(#d2-grain)" opacity={0.14} />
        <rect width={1080} height={1920} fill="#030202" opacity={dark} />
      </svg>
      <SpeakerOverlay g={g} from={ls(1)} to={le(1) + 6} amp={ampOf(1, g)} />
      <SpeakerOverlay g={g} from={speakerAt} to={cardAt} amp={g < le(2) + 6 ? ampOf(2, g) : ampOf(3, g)} />
      <RuleCard g={g} from={cardAt} dur={cardDur} />
      <Countdown g={g} from={cdFrom} zero={zeroAt} question={g >= ls(9) && g < ls(10) + 20} />
      {g >= ls(13) + 8 && <NotebookInsert g={g} from={ls(13) + 8} />}
      <Card a="กฎเหล็กหอพัก ตี 3" b="ตอนที่ 2 · 04:00 กฎที่ขัดกัน" at={C.titleAt} dur={46} g={g} />
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
            <div style={{ fontSize: 62, marginTop: 14, color: "#ff5a4a" }}>05:00 ห้ามไว้ใจกฎ</div>
          </div>
        </div>
      )}
      <Audio src={staticFile("dorm2v/bed.wav")} volume={0.6} />
    </AbsoluteFill>
  );
};

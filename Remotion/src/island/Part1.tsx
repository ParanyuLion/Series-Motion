import React from "react";
import { AbsoluteFill, Audio, Easing, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import manifest from "./manifest.json";
import { CastId } from "./cast";
import { fontFamily } from "./fonts";
import { BEACH_Y, H, IslandWorld, W } from "./IslandWorld";
import { MapCard, PART1_MARKERS } from "./MapCard";
import { Person } from "./Person";

const { cues, shots, starts, total } = manifest;
const ls = (i: number) => (cues as Record<string, number>)[`lineStart${i}`];
const le = (i: number) => (cues as Record<string, number>)[`lineEnd${i}`];

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const LIFT = 260; // whole scene moves up so the figures stay above the subtitle band
const WALK_SPEED = 9; // px per frame at full walk, matches the 0.2 rad/frame stride
const PHASE_SPEED = 0.2;
const HERO_SCREEN_X = 330;

// ---------------- staging, all derived from manifest cues ----------------
type Spot = { x: number; y: number; scale: number };
const SPOTS: Record<CastId, Spot> = {
  nathee: { x: 330, y: BEACH_Y + 100, scale: 1.05 },
  irin: { x: 780, y: BEACH_Y + 100, scale: 1.05 },
  wichai: { x: 1060, y: BEACH_Y + 100, scale: 1.05 },
  ploy: { x: 430, y: BEACH_Y + 20, scale: 0.95 },
  kong: { x: 870, y: BEACH_Y + 20, scale: 0.95 },
  jay: { x: 520, y: BEACH_Y - 60, scale: 0.85 },
  ton: { x: 930, y: BEACH_Y - 60, scale: 0.85 },
};
const TAG_FRAMES = 26; // a name tag shows for this long; the wake-ups are this far apart, so tags never overlap
const WAKE_ORDER: CastId[] = ["nathee", "jay", "ploy", "kong", "ton", "irin", "wichai"];
const wakeAt = (id: CastId) => (id === "nathee" ? ls(1) + 8 : ls(2) - 20 + (WAKE_ORDER.indexOf(id) - 1) * TAG_FRAMES);

const { walkOutStart, walkOutEnd, walkBackStart, walkBackEnd } = cues;
const SCROLL_MAX = (walkOutEnd - walkOutStart) * WALK_SPEED;

/** world scroll in px: 0 -> SCROLL_MAX while the hero walks to the palms, then back to 0 */
const scrollAt = (g: number) => {
  if (g < walkOutStart) return 0;
  if (g < walkOutEnd) return (g - walkOutStart) * WALK_SPEED;
  if (g < walkBackStart) return SCROLL_MAX;
  if (g < walkBackEnd) return SCROLL_MAX - (g - walkBackStart) * WALK_SPEED;
  return 0;
};
const heroWalking = (g: number) => (g >= walkOutStart && g < walkOutEnd) || (g >= walkBackStart && g < walkBackEnd);
const heroFacing = (g: number): 1 | -1 => (g >= walkBackStart && g < walkBackEnd ? -1 : 1);

type PoseName = "stand" | "sit" | "lie";
const poseOf = (id: CastId, g: number): PoseName => {
  const t = wakeAt(id);
  if (g < t) return "lie";
  if (g < t + 22) return "sit";
  return "stand";
};

const storm = (g: number) => interpolate(g, [cues.skyChange, manifest.outroStart], [0, 1], { ...CLAMP, easing: Easing.in(Easing.quad) });

// ---------------- pieces ----------------
const Rain: React.FC<{ frame: number; opacity: number }> = ({ frame, opacity }) => (
  <g opacity={opacity} stroke="#cfd5d8" strokeWidth={2} strokeLinecap="round">
    {Array.from({ length: 70 }, (_, i) => {
      const sx = (i * 197) % 1200;
      const y = ((i * 311 + frame * 38) % 2100) - 100;
      return <line key={i} x1={sx - 40 + (frame * 3) % 40} y1={y} x2={sx - 60 + (frame * 3) % 40} y2={y + 70} opacity={0.18 + ((i * 7) % 5) * 0.05} />;
    })}
  </g>
);

/** Silhouette arm that reaches up from below the frame and slips away (the opening flash-forward). */
const SlippingHand: React.FC<{ g: number }> = ({ g }) => {
  const rise = interpolate(g, [20, 55], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) });
  const slip = interpolate(g, [62, 98], [0, 1], { ...CLAMP, easing: Easing.in(Easing.cubic) });
  const y = 1700 - rise * 420 + slip * 520;
  const x = 760 + Math.sin(g * 0.5) * (1 - slip) * 4;
  return (
    <g transform={`translate(${x},${y}) rotate(${-12 + slip * 20})`} fill="#07090b">
      <rect x={-22} y={0} width={44} height={620} rx={22} />
      <ellipse cx={0} cy={-6} rx={34} ry={40} />
      {[-26, -13, 0, 13, 26].map((fx, i) => (
        <rect key={i} x={fx - 6} y={-84 + Math.abs(fx) * 0.6 + slip * 14 * (i % 2)} width={12} height={70} rx={6} />
      ))}
    </g>
  );
};

const Subtitle: React.FC<{ text: string }> = ({ text }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: 60, right: 160, bottom: 340, textAlign: "center", opacity: clamp01(f / 6), fontFamily, fontSize: 52, lineHeight: 1.6, color: "#fff", textShadow: "0 0 12px rgba(0,0,0,0.95), 0 3px 6px rgba(0,0,0,0.95)" }}>
      {text}
    </div>
  );
};

const Card: React.FC<{ g: number; from: number; to: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ g, from, to, children, style }) => {
  const o = clamp01((g - from) / 10) * clamp01((to - g) / 8);
  return <div style={{ position: "absolute", left: 80, right: 80, textAlign: "center", fontFamily, color: "#fff", opacity: o, textShadow: "0 2px 10px rgba(0,0,0,0.9)", ...style }}>{children}</div>;
};

const World: React.FC = () => {
  const g = useCurrentFrame();
  const scroll = scrollAt(g);
  const inHook = g < cues.hookCut;
  const stormAmt = inHook ? 1 : storm(g);
  // quick dip to black over the cut from the hook's storm to the grey dawn
  const cutDip = interpolate(g, [cues.hookCut - 8, cues.hookCut, cues.hookCut + 16], [0, 1, 0], CLAMP);
  const showCamp = g >= ls(7) - 20;

  // camera: slow push-in, then a closer look at the villain's smile
  const smileZoom = interpolate(g, [ls(6) + 40, ls(7) + 40, le(8) - 30, le(8)], [1, 1.18, 1.18, 1], CLAMP);
  const baseZoom = 1 + 0.03 * clamp01((g - cues.hookCut) / (manifest.storyEnd - cues.hookCut));
  const zoom = smileZoom * baseZoom;
  const camX = interpolate(zoom, [1, 1.3], [540, 780], CLAMP);
  const shake = inHook ? Math.sin(g * 1.7) * 6 * clamp01((g - 20) / 30) : 0;

  const hookFlash = Math.max(0, 1 - Math.abs(g - cues.flash0) / 3) * 0.9 + Math.max(0, 1 - Math.abs(g - cues.flash1) / 3) * 0.7;

  const ids = Object.keys(SPOTS) as CastId[];
  const phase = g * PHASE_SPEED;
  const mapProgress = clamp01((g - cues.mapIn) / 170);
  const mapOpacity = clamp01((cues.mapOut - g) / 14);
  const highlight = g < ls(5) ? "waterline" : "camp";
  const heroTilt = g >= walkOutEnd && g < le(5) ? -22 : g >= cues.skyChange ? -24 : 0;
  const heroWalk = heroWalking(g) ? 1 : 0;

  const people = (inHook ? [] : ids)
    .map((id) => {
      const s = SPOTS[id];
      const hero = id === "nathee";
      const worldX = s.x;
      const x = hero ? (g >= walkOutStart && g < walkBackEnd ? HERO_SCREEN_X : s.x - scroll) : worldX - scroll;
      const pose = hero && g >= walkOutStart ? "stand" : poseOf(id, g);
      const grimeTarget = id === "irin" ? 0.15 : 0.1;
      let facing: 1 | -1 = hero ? heroFacing(g) : -1;
      if (!hero && id !== "irin" && g >= ls(7)) facing = s.x < SPOTS.irin.x ? 1 : -1;
      const tagStart = wakeAt(id) + 22;
      const label = g >= tagStart && g < tagStart + TAG_FRAMES;
      return { id, s, x, hero, pose, grime: grimeTarget, facing, label };
    })
    .sort((a, b) => a.s.y - b.s.y);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
        <g transform={`translate(${shake},${-LIFT}) translate(${camX},1560) scale(${zoom}) translate(${-camX},-1560)`}>
          <IslandWorld frame={g} scroll={scroll} stormAmount={stormAmt} showWaterline showCamp={showCamp} campX={560} treeX0={1555} bottomExtend={LIFT + 40} />
          {people.map((p) => (
            <Person
              key={p.id}
              id={p.id}
              x={p.x}
              y={p.s.y}
              scale={p.s.scale}
              phase={phase + (p.hero ? 0 : 0)}
              walk={p.hero ? heroWalk : 0}
              frame={g}
              dirt={p.grime}
              facing={p.facing}
              pose={p.pose}
              headTilt={p.hero ? heroTilt : p.id === "irin" ? -4 : 0}
              smile={p.id === "irin" ? clamp01((g - (ls(6) + 70)) / 18) : 0}
              label={p.label}
              labelClamp={[130, 880]}
            />
          ))}
          {inHook && <SlippingHand g={g} />}
          {(inHook || stormAmt > 0.3) && <Rain frame={g} opacity={inHook ? 1 : (stormAmt - 0.3) / 0.7} />}
        </g>
      </svg>

      <AbsoluteFill style={{ backgroundColor: "#000", opacity: cutDip }} />
      <AbsoluteFill style={{ backgroundColor: "#dfe6ea", opacity: hookFlash, mixBlendMode: "screen" }} />

      {g >= cues.mapIn - 4 && g < cues.mapOut && (
        <div style={{ position: "absolute", left: 90, top: 150, transform: "scale(0.8)", transformOrigin: "top left", opacity: mapOpacity }}>
          <MapCard progress={mapProgress} markers={PART1_MARKERS} highlight={highlight} />
        </div>
      )}

      {/* opening hook title cards */}
      <Card g={g} from={100} to={cues.hookCut} style={{ top: 520, right: 160, fontSize: 52, lineHeight: 1.55 }}>
        ตื่นมาบนเกาะร้าง<br />พร้อมคนแปลกหน้า 6 คน...<br />มีแค่ผมที่รู้ว่า<br />เราไม่ควรอยู่ที่นี่
      </Card>
      <Card g={g} from={cues.hookCut + 6} to={cues.hookCut + 55} style={{ top: 640, fontSize: 56 }}>
        เมื่อวาน
      </Card>

      {/* outro */}
      {g >= manifest.outroStart - 14 && <Outro g={g} />}

      {/* fade in from black at the very start */}
      <AbsoluteFill style={{ backgroundColor: "#000", opacity: clamp01(1 - g / 14) }} />
    </AbsoluteFill>
  );
};

const Outro: React.FC<{ g: number }> = ({ g }) => {
  const t = g - manifest.outroStart;
  const bg = clamp01((g - (manifest.outroStart - 14)) / 14);
  return (
    <AbsoluteFill style={{ opacity: bg }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, #1a2022 0%, #07090b 70%)" }} />
      <div style={{ position: "absolute", left: 80, right: 160, top: 640, textAlign: "center", fontFamily, color: "#f1f1f1" }}>
        <div style={{ fontSize: 46, opacity: clamp01(t / 14), lineHeight: 1.6, color: "#aeb4b6" }}>ตอนต่อไป: คืนแรก...</div>
        <div style={{ fontSize: 60, opacity: clamp01((t - 24) / 14), lineHeight: 1.5, marginTop: 12 }}>มีคนไม่ได้ตื่นขึ้นมาอีก</div>
        <div style={{ fontSize: 56, opacity: clamp01((t - 70) / 14), marginTop: 70, color: "#ffd86b" }}>ติดตามตอนที่ 2</div>
      </div>
    </AbsoluteFill>
  );
};

export const Part1: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <World />
    {shots.map((shot, i) => (
      <Sequence key={i} from={starts[i] + shot.leadFrames} durationInFrames={shot.audioFrames}>
        <Audio src={staticFile(shot.audio)} />
        <Subtitle text={shot.text} />
      </Sequence>
    ))}
    <Audio src={staticFile("island1/bed.wav")} volume={0.5} />
  </AbsoluteFill>
);

export const PART1_TOTAL = total;

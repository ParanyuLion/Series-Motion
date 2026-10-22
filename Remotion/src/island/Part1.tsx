import React from "react";
import { AbsoluteFill, Audio, Easing, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import manifest from "./manifest.json";
import { CastId } from "./cast";
import { fontFamily } from "./fonts";
import { BEACH_Y, H, IslandWorld, W } from "./IslandWorld";
import { MapCard, PART1_MARKERS } from "./MapCard";
import { Person } from "./Person";
import { IslandAerial } from "./IslandAerial";
import { FaceFront } from "./FaceFront";
import { ForegroundFrame } from "./IslandDetails";
import { ANCHOR, cameraAt } from "./camera";
import { Glow } from "../World";

const { cues, shots, starts, total } = manifest;
const ls = (i: number) => (cues as Record<string, number>)[`lineStart${i}`];
const le = (i: number) => (cues as Record<string, number>)[`lineEnd${i}`];

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
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

// Irin's smile (on the words "แค่ยิ้มมุมปาก"): the camera cuts to a front-facing close-up of her face for its duration
const SMILE_FROM = le(6) - 44;
const SMILE_TO = ls(7) - 10;

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

  // virtual camera (see camera.ts): subjects sit above the subtitle band; extra shake only inside the hook
  const cam = cameraAt(g);
  const shake = inHook ? Math.sin(g * 1.7) * 6 * clamp01((g - 20) / 30) : 0;
  const inAerial = g >= cues.aerialStart && g < cues.aerialEnd;
  const aerialOpacity = clamp01((g - cues.aerialStart) / 8) * clamp01((cues.aerialEnd - g) / 8);

  const hookFlash = Math.max(0, 1 - Math.abs(g - cues.flash0) / 3) * 0.9 + Math.max(0, 1 - Math.abs(g - cues.flash1) / 3) * 0.7;

  const ids = Object.keys(SPOTS) as CastId[];
  const phase = g * PHASE_SPEED;
  const mapProgress = clamp01((g - cues.mapIn) / 120);
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
        <g transform={`translate(${ANCHOR.x + shake},${ANCHOR.y}) rotate(${cam.rot}) scale(${cam.zoom}) translate(${-cam.fx},${-cam.fy})`}>
          <IslandWorld frame={g} scroll={scroll} stormAmount={stormAmt} showWaterline showCamp={showCamp} campX={560} treeX0={1555} bottomExtend={520} />
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
              smile={p.id === "irin" ? clamp01((g - SMILE_FROM) / 18) : 0}
              label={p.label}
              labelClamp={[130, 880]}
            />
          ))}
          {showCamp && (
            <g style={{ mixBlendMode: "overlay" }}>
              <Glow id="fire-warm" x={560 - scroll} y={BEACH_Y + 30} r={420 * (0.92 + 0.08 * Math.sin(g * 0.7))} color="#ff9a3c" opacity={0.85 * (1 - stormAmt * 0.4)} />
            </g>
          )}
          {inHook && <SlippingHand g={g} />}
          {(inHook || stormAmt > 0.3) && <Rain frame={g} opacity={inHook ? 1 : (stormAmt - 0.3) / 0.7} />}
        </g>
      </svg>

      {!inHook && <ForegroundFrame frame={g} camX={cam.fx} camY={cam.fy} opacity={0.92 * (1 - aerialOpacity)} />}

      {inAerial && (
        <AbsoluteFill style={{ opacity: aerialOpacity, backgroundColor: "#000" }}>
          <IslandAerial frame={g} t={(g - cues.aerialStart) / (cues.aerialEnd - cues.aerialStart)} />
        </AbsoluteFill>
      )}

      {g >= SMILE_FROM - 5 && g < SMILE_TO + 5 && (
        <AbsoluteFill style={{ opacity: clamp01((g - (SMILE_FROM - 5)) / 5) * clamp01((SMILE_TO + 5 - g) / 5) }}>
          <FaceFront id="irin" frame={g} t={clamp01((g - SMILE_FROM) / (SMILE_TO - SMILE_FROM))} dirt={0.2} />
        </AbsoluteFill>
      )}

      {/* lighting and grade: vignette, cool-to-warm split tone, film grain */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 42%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.55) 100%)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(120,150,170,0.22) 0%, rgba(0,0,0,0) 45%, rgba(190,150,110,0.16) 100%)", mixBlendMode: "soft-light" }} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: 0.09, mixBlendMode: "overlay", pointerEvents: "none" }}>
        <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={g % 7} /><feColorMatrix type="saturate" values="0" /></filter>
        <rect width={W} height={H} filter="url(#grain)" />
      </svg>

      <AbsoluteFill style={{ backgroundColor: "#000", opacity: cutDip }} />
      <AbsoluteFill style={{ backgroundColor: "#dfe6ea", opacity: hookFlash, mixBlendMode: "screen" }} />

      {g >= cues.mapIn && g < cues.mapOut && (
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

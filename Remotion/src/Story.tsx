import React from "react";
import { AbsoluteFill, Audio, Easing, Sequence, interpolate, interpolateColors, staticFile, useCurrentFrame } from "remotion";
import { loadFont } from "@remotion/google-fonts/Prompt";
import manifest from "./manifest.json";
import { Boy } from "./Boy";
import { AmbientFireflies, Backdrop, DUSK, ForegroundGrass, Glow, GROUND_Y, H, House, NIGHT, Palette, W } from "./World";

const { fontFamily } = loadFont("normal", { weights: ["500"], subsets: ["thai", "latin"] });

const { cues, starts, total, w: walkW } = manifest;
const SPEED = 9; // ground px per frame at full walk (matches the 0.2 rad/frame stride)
const BOY_X = 380;
const HOUSE_X = 400; // final resting x of the house
const CAM = { cx: 600, cy: 1150 };

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => Easing.inOut(Easing.cubic)(clamp01(t));
const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Distance the world has scrolled, integrated from the walk intensity (so scrolling and legs always agree)
const dist: number[] = [];
{
  let d = 0;
  for (let g = 0; g <= total; g++) { dist.push(d); d += walkW[g] ?? 0; }
}
const distEnd = dist[dist.length - 1];

const mixPal = (a: Palette, b: Palette, t: number): Palette => {
  const o = {} as Palette;
  (Object.keys(a) as (keyof Palette)[]).forEach((k) => (o[k] = interpolateColors(t, [0, 1], [a[k], b[k]])));
  return o;
};

// ---------- continuous camera / character / firefly state, all functions of the global frame g ----------
const zoomAt = (g: number) =>
  interpolate(g, [0, starts[1], cues.stop + 34, cues.stop + 164, cues.go + 20, starts[3], total], [1.06, 1.0, 1.0, 1.22, 1.22, 1.02, 1.1], { ...CLAMP, easing: Easing.inOut(Easing.cubic) });

const tiltAt = (g: number) => interpolate(g, [0, cues.stop + 60, cues.stop + 90, cues.go + 20, cues.go + 50], [0, 0, -16, -16, -8], CLAMP);
const smileAt = (g: number) => interpolate(g, [0, cues.stop + 80, cues.stop + 110, starts[3] + 60, starts[3] + 100], [0.2, 0.2, 0.8, 0.8, 1], CLAMP);

const hoverPos = (g: number) => {
  const t = Easing.out(Easing.cubic)(clamp01((g - cues.fireflyIn) / (cues.fireflyHover - cues.fireflyIn)));
  return { x: lerp(1250, 700, t) + Math.sin(g * 0.06) * 14 * t, y: lerp(700, 1120, t) + Math.sin(g * 0.09) * 18 * t };
};
const leadPos = (g: number) => ({ x: 800 + Math.sin(g * 0.05) * 40, y: 1130 + Math.sin(g * 0.08) * 40 + Math.sin(g * 0.02) * 20 });
const orbitPos = (g: number) => {
  const s = starts[3];
  const o = (g - s) * 0.05;
  return {
    x: interpolate(g, [s, s + 110], [820, 560], CLAMP) + Math.cos(o) * 70,
    y: interpolate(g, [s, s + 110, total], [1130, 880, 560], CLAMP) + Math.sin(o * 1.3) * 40,
  };
};
const fireflyAt = (g: number) => {
  const h = hoverPos(g);
  const l = leadPos(g);
  const o = orbitPos(g);
  const wl = smooth((g - cues.go) / 40);
  const wo = smooth((g - (starts[3] + 20)) / 40);
  const a = { x: lerp(h.x, l.x, wl), y: lerp(h.y, l.y, wl) };
  return { x: lerp(a.x, o.x, wo), y: lerp(a.y, o.y, wo), wl, wo };
};
const fireflyIntensity = (g: number) => clamp01((g - cues.fireflyIn + 10) / 40) * interpolate(g, [total - 70, total - 10], [1, 0], CLAMP);

const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>{children}</svg>
);

const Firefly: React.FC<{ x: number; y: number; frame: number; intensity: number }> = ({ x, y, frame, intensity }) => {
  const pulse = 0.85 + 0.15 * Math.sin(frame * 0.35);
  const flap = Math.abs(Math.sin(frame * 1.6)) * 5;
  return (
    <g opacity={intensity}>
      <Glow id="ff-main" x={x} y={y} r={150 * pulse} color="#fff1a0" />
      <ellipse cx={x - 6} cy={y - 10} rx={9} ry={4 + flap * 0.4} fill="#cfe9ff" opacity={0.7} transform={`rotate(-25 ${x - 6} ${y - 10})`} />
      <ellipse cx={x + 6} cy={y - 10} rx={9} ry={4 + flap * 0.4} fill="#cfe9ff" opacity={0.7} transform={`rotate(25 ${x + 6} ${y - 10})`} />
      <ellipse cx={x} cy={y} rx={6} ry={9} fill="#fff8c8" />
    </g>
  );
};

const Subtitle: React.FC<{ text: string }> = ({ text }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: 70, right: 70, bottom: 190, textAlign: "center", opacity: clamp01(f / 6), fontFamily, fontSize: 58, lineHeight: 1.6, color: "#fff", textShadow: "0 0 10px rgba(0,0,0,0.9), 0 3px 6px rgba(0,0,0,0.9)" }}>
      {text}
    </div>
  );
};

const World: React.FC = () => {
  const g = useCurrentFrame();
  const scroll = dist[Math.min(g, total)] * SPEED;
  const night = smooth((g - cues.nightFrom) / (cues.nightTo - cues.nightFrom));
  const pal = mixPal(DUSK, NIGHT, night);
  const stars = clamp01((g - 150) / 100);
  const sunY = interpolate(g, [0, cues.nightTo + 40], [1090, 1500], CLAMP);
  const sunOpacity = 1 - clamp01((g - 100) / 110);

  const ff = fireflyAt(g);
  const ffI = fireflyIntensity(g);
  const walk = walkW[Math.min(g, total)];
  const phase = g * manifest.phaseSpeed;

  const houseX = HOUSE_X + (distEnd - dist[Math.min(g, total)]) * SPEED;
  const wave = interpolate(g, [cues.waveIn, cues.waveIn + 16, cues.waveOut - 8, cues.waveOut + 8], [0, 1, 1, 0], CLAMP);
  const tilt = g < starts[3] ? tiltAt(g) : lerp(tiltAt(g), 0, wave);

  const fade = clamp01(g / 15) * clamp01((total - g) / 20);
  const grassFront = interpolateColors(night, [0, 1], ["#1f2c2a", "#08121a"]);

  return (
    <div style={{ opacity: fade, width: W, height: H }}>
      <Svg>
        <g transform={`translate(${CAM.cx},${CAM.cy}) scale(${zoomAt(g)}) translate(${-CAM.cx},${-CAM.cy})`}>
          <Backdrop pal={pal} scroll={scroll} frame={g} stars={stars}>
            <g opacity={sunOpacity}>
              <Glow id="sunglow" x={760} y={sunY} r={620} color="#ffd9a0" opacity={0.85} />
              <circle cx={760} cy={sunY} r={150} fill="#fff0c4" />
              {Array.from({ length: 7 }, (_, i) => (
                <path key={i} d={`M760 ${sunY} L${760 - 900 + i * 300 - 60} -200 L${760 - 900 + i * 300 + 60} -200 Z`} fill="#ffe4b0" opacity={0.14 + 0.05 * Math.sin(g * 0.05 + i)} transform={`rotate(${Math.sin(g * 0.01) * 3} 760 ${sunY})`} />
              ))}
            </g>
            <g opacity={stars}>
              <circle cx={820} cy={330} r={70} fill="#f4f1de" />
              <Glow id="moonglow" x={820} y={330} r={260} color="#bcd0ff" opacity={0.4} />
            </g>
          </Backdrop>
          <AmbientFireflies frame={g} scroll={scroll} count={14} opacity={stars} />
          <House x={houseX} frame={g} />
          <Glow id="fflight" x={BOY_X + 130} y={GROUND_Y - 210} r={400} color="#fff1a0" opacity={0.27 * ffI} />
          {Array.from({ length: 9 }, (_, k) => {
            const p = leadPos(g - (k + 1) * 3);
            return <circle key={k} cx={p.x - (k + 1) * 14} cy={p.y + (k + 1) * 3} r={5 - k * 0.4} fill="#fff1a0" opacity={(0.5 - k * 0.05) * ff.wl * (1 - ff.wo) * ffI} />;
          })}
          <Boy x={BOY_X} y={GROUND_Y + 20} phase={phase} walk={walk} headTilt={tilt} wave={wave} frame={g} smile={smileAt(g)} />
          <Firefly x={ff.x} y={ff.y} frame={g} intensity={ffI} />
          <ForegroundGrass scroll={scroll} color={grassFront} />
        </g>
      </Svg>
    </div>
  );
};

export const Story: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <World />
    {manifest.shots.map((shot, i) => (
      <Sequence key={i} from={starts[i] + shot.leadFrames} durationInFrames={shot.audioFrames}>
        <Audio src={staticFile(shot.audio)} />
        <Subtitle text={shot.text} />
      </Sequence>
    ))}
    <Audio src={staticFile("audio/bed.wav")} volume={0.6} />
  </AbsoluteFill>
);

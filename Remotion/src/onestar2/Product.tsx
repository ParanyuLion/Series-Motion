import React from "react";
import { AbsoluteFill, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { FADE, clamp01 } from "./util";

/** the real/AI product insert: full frame 1080x1920, muted, in the night grade (darker, blue shift), 10-frame fades; the frame span [from, to] is filled by retiming the clip */
export const ProductClip: React.FC<{ from: number; to: number; src: string; skip?: number; usable: number; crop?: number }> = ({ from, to, src, skip = 0, usable, crop = 1920 }) => {
  const n = to - from;
  const rate = Math.min(1.5, Math.max(0.6, usable / n));
  return (
    <Sequence from={from} durationInFrames={n + 2}>
      <Inner n={n} src={src} skip={skip} rate={rate} crop={crop} />
    </Sequence>
  );
};

const Inner: React.FC<{ n: number; src: string; skip: number; rate: number; crop: number }> = ({ n, src, skip, rate, crop }) => {
  const f = useCurrentFrame();
  const o = clamp01(Math.min(f / FADE, (n - f) / FADE));
  return (
    <AbsoluteFill style={{ opacity: o, backgroundColor: "#03050a" }}>
      <OffthreadVideo src={staticFile(src)} muted startFrom={skip} playbackRate={rate} style={{ width: 1080, height: 1920, objectFit: "cover", transform: `scale(${1920 / crop})`, transformOrigin: "50% 0", filter: "brightness(0.58) saturate(0.78) contrast(1.06) hue-rotate(8deg)" }} />
      <AbsoluteFill style={{ background: "rgba(24,52,110,0.5)", mixBlendMode: "multiply" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 100%)" }} />
    </AbsoluteFill>
  );
};

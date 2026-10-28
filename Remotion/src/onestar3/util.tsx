import React from "react";
import { clamp01, lerp, smooth } from "../onestar2/util";

export { clamp01, lerp, smooth, ramp, rnd, Rain } from "../onestar2/util";

/** the camera inside a set: the world point (x, y) sits at the middle of the frame, z is the zoom, rot in degrees */
export type Cam = { x: number; y: number; z: number; rot?: number };
export type Key = { at: number } & Cam;

/** smooth path through keyframes (frame `at`, the camera there); before the first and after the last it holds still */
export const camAt = (g: number, keys: Key[]): Cam => {
  if (g <= keys[0].at) return keys[0];
  for (let i = 1; i < keys.length; i++) {
    if (g <= keys[i].at) {
      const a = keys[i - 1];
      const b = keys[i];
      const t = smooth(clamp01((g - a.at) / Math.max(1, b.at - a.at)));
      return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), z: lerp(a.z, b.z, t), rot: lerp(a.rot ?? 0, b.rot ?? 0, t) };
    }
  }
  return keys[keys.length - 1];
};

/** puts the world (drawn in its own coordinates) under the camera */
export const WorldCam: React.FC<{ cam: Cam; children: React.ReactNode }> = ({ cam, children }) => (
  <g transform={`translate(540,900) rotate(${cam.rot ?? 0}) scale(${cam.z}) translate(${-cam.x},${-cam.y})`}>{children}</g>
);

/** 0 to 1: a layer that fades in over `d` frames from `a` and out over `d` frames before `b`; no stacking with a neighbour that starts at `b` when both use the same `d` and the set behind stays the same */
export const win = (g: number, a: number, b: number, d = 10) => clamp01(Math.min((g - a) / d, (b - g) / d));

/** dip transition between two different sets: each set is opaque in the middle and falls to black over `d` frames at its ends, so no two busy pictures overlap */
export const dip = (g: number, from: number, to: number, d = 8) => clamp01(Math.min((g - from) / d, (to - g) / d));

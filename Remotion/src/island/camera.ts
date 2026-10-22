import { Easing } from "remotion";
import manifest from "./manifest.json";

// One continuous virtual camera over the beach scene. A shot is (frame, focus x, focus y, zoom) in world
// coordinates; the focus point is placed at the screen anchor (540, 820), so subjects sit above the subtitle band.
// All frames come from manifest cues, so the camera follows the narration if the audio changes.
export const ANCHOR = { x: 540, y: 820 };

const c = manifest.cues as Record<string, number>;
const ls = (i: number) => c[`lineStart${i}`];
const le = (i: number) => c[`lineEnd${i}`];

type Key = [frame: number, fx: number, fy: number, zoom: number];

const KEYS: Key[] = [
  // hook: slow push into the storm
  [0, 700, 1330, 1.0],
  [c.hookCut - 1, 700, 1250, 1.2],
  // waking: start on the hero's face, then pull back to reveal all seven
  [c.hookCut, 110, 1630, 2.4],
  [ls(1) + 30, 110, 1620, 2.3],
  [ls(2) + 10, 540, 1180, 1.05],
  [c.aerialStart - 30, 620, 1180, 1.12],
  // (aerial cut hides the beach here) then pick the hero up near the palm
  [c.aerialEnd, 520, 1260, 1.28],
  // palm: tilt up the trunk to the waterline stain, then down to the hero
  [ls(4), 560, 1250, 1.32],
  [ls(4) + 50, 620, 980, 1.75],
  [ls(4) + 95, 620, 980, 1.75],
  [ls(5), 430, 1380, 1.45],
  [le(5), 430, 1400, 1.5],
  // walking back toward the group
  [c.walkBackStart, 480, 1300, 1.2],
  [c.walkBackEnd, 540, 1190, 1.05],
  // the argument: push to Irin's close-up for her line, then swing to the hero
  [ls(7) - 70, 700, 1300, 1.4],
  [ls(7) - 20, 780, 1420, 1.9],
  [ls(7) + 60, 780, 1420, 1.9],
  [ls(7) + 110, 420, 1400, 1.5],
  [le(7), 540, 1220, 1.1],
  // the hero's face while he realises what it will cost
  [ls(8) - 6, 330, 1410, 1.7],
  [le(8), 330, 1410, 1.95],
  // the sky turns: pull out and tilt up
  [ls(9), 330, 1410, 1.95],
  [ls(9) + 35, 540, 900, 1.05],
  [manifest.outroStart, 540, 880, 1.0],
];

const ease = Easing.inOut(Easing.cubic);

export const cameraAt = (g: number) => {
  let a = KEYS[0];
  let b = KEYS[KEYS.length - 1];
  if (g <= KEYS[0][0]) b = a;
  else if (g >= KEYS[KEYS.length - 1][0]) a = b;
  else {
    for (let i = 0; i < KEYS.length - 1; i++) {
      if (g >= KEYS[i][0] && g <= KEYS[i + 1][0]) { a = KEYS[i]; b = KEYS[i + 1]; break; }
    }
  }
  const t = b[0] === a[0] ? 0 : ease((g - a[0]) / (b[0] - a[0]));
  const lerp = (x: number, y: number) => x + (y - x) * t;
  const zoom = lerp(a[3], b[3]);
  // handheld drift, smaller when zoomed in a lot so it never reads as shake
  const k = 1 / zoom;
  return {
    fx: lerp(a[1], b[1]) + (Math.sin(g * 0.021) * 5 + Math.sin(g * 0.047 + 1) * 3) * k,
    fy: lerp(a[2], b[2]) + (Math.sin(g * 0.017 + 2) * 4 + Math.sin(g * 0.053) * 2) * k,
    zoom,
    rot: Math.sin(g * 0.013) * 0.25,
  };
};

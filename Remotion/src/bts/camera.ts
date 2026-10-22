import { Easing } from "remotion";
import manifest from "./manifest.json";

// One continuous virtual camera over the car. A key is (frame, focus x, focus y, zoom) in world coordinates; the focus point
// is placed at the screen anchor (540, 820) so subjects sit above the subtitle band. All frames come from manifest cues, so
// the camera follows the narration if the audio changes. Same shape and behaviour as src/island/camera.ts.
export const ANCHOR = { x: 540, y: 820 };

const c = manifest.cues as Record<string, number>;
const ls = (i: number) => c[`lineStart${i}`];
const le = (i: number) => c[`lineEnd${i}`];

type Key = [frame: number, fx: number, fy: number, zoom: number];

const KEYS: Key[] = [
  // hook: close on the doors as they shut, the hand on the glass, then pull out as the title appears
  [0, 340, 1060, 1.5],
  [c.doorsClose, 340, 1050, 1.65],
  [c.doorsClose + 50, 380, 1010, 1.9],
  [c.hookCut - 20, 640, 1060, 1.05],
  // an ordinary car: medium shot of "you" and the passengers, a slow push
  [ls(1), 680, 1060, 1.05],
  [ls(2) - 10, 740, 1060, 1.25],
  // the man by the doors: swing to him, close on the shaking, the bite
  [c.manTurns - 10, 430, 1040, 1.35],
  [c.manTurns + 90, 340, 1010, 2.0],
  [c.biteAt - 20, 410, 1030, 1.7],
  [c.biteAt + 40, 470, 1050, 1.4],
  // the clock: on the woman while the countdown runs
  [c.countdownStart + 90, 480, 1040, 1.35],
  [c.womanRises - 14, 470, 1010, 1.75],
  // panic: pull out and follow the crowd, the station board flashes past
  [c.womanRises + 60, 640, 1050, 1.1],
  [c.stationPass, 760, 1050, 1.0],
  // the retreat: follow "you" toward the walkway
  [c.retreatStart, 760, 1050, 1.05],
  [c.retreatStart + 90, 1230, 1050, 1.15],
  [c.mapIn + 60, 1450, 1050, 1.3],
  [c.mapOut, 1450, 1040, 1.4],
  // the announcement: wide, lights failing
  [c.announceStart + 10, 1000, 1050, 0.95],
  [le(8), 900, 1050, 0.95],
  // the cab door
  [c.cabOpens, 700, 1050, 1.1],
  [manifest.outroStart, 700, 1050, 1.2],
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

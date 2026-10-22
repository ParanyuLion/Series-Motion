import { Easing } from "remotion";
import manifest from "./manifest.json";

// One continuous virtual camera over car 4 for Part 3. A key is (frame, focus x, focus y, zoom) in world coordinates; the focus
// point sits at the screen anchor (540, 820) so subjects stay above the subtitle band. Every frame comes from manifest cues.
export const ANCHOR = { x: 540, y: 820 };

const c = manifest.cues as Record<string, number>;

type Key = [frame: number, fx: number, fy: number, zoom: number];

const KEYS: Key[] = [
  // the hook: a close-up of a window while a platform full of waving people whooshes past
  [0, 900, 910, 1.8],
  [c.hookCut - 40, 1000, 960, 1.4],
  [c.hookCut, 1300, 1040, 0.95],
  // the stations: look at the windows while the boards slide past
  [c.board0, 1040, 960, 1.3],
  [c.board2 + 50, 1060, 1000, 1.25],
  // the zombies come out of the walkway: wide
  [c.enterAt, 1150, 1040, 0.95],
  [c.enterAt + 90, 1250, 1040, 1.0],
  // the argument: พี่นุ่น and ไมค์, then the shove
  [c.nunPoints, 1500, 1050, 1.35],
  [c.argueAt, 1480, 1050, 1.5],
  [c.shoveAt, 1450, 1040, 1.7],
  // the fall and the bite
  [c.fallAt - 8, 1300, 1030, 1.35],
  [c.biteAt - 12, 1130, 1010, 1.4],
  [c.biteAt + 40, 1250, 1030, 1.2],
  // the others react; "you" decide
  [c.countAt, 1480, 1050, 1.1],
  [c.faceAt, 1500, 1050, 1.5],
  // the view down the train, then the question
  [c.cabGlassAt, 1450, 1050, 1.0],
  [c.questionAt, 1400, 1050, 0.95],
  [manifest.outroStart, 1250, 1050, 0.85],
];

KEYS.forEach((k, i) => {
  if (i > 0 && !(k[0] >= KEYS[i - 1][0])) throw new Error(`camera key ${i} (frame ${k[0]}) comes before key ${i - 1} (frame ${KEYS[i - 1][0]}): re-order the keys or the cues`);
});

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

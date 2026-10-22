import { Easing } from "remotion";
import manifest from "./manifest.json";

// One continuous virtual camera over car 3 for Part 2. A key is (frame, focus x, focus y, zoom) in world coordinates; the focus
// point sits at the screen anchor (540, 820) so subjects stay above the subtitle band. Every frame comes from manifest cues, so
// the camera follows the narration if the audio changes. Same shape and behaviour as src/bts/camera.ts.
export const ANCHOR = { x: 540, y: 820 };

const c = manifest.cues as Record<string, number>;

type Key = [frame: number, fx: number, fy: number, zoom: number];

const KEYS: Key[] = [
  // the hook is a cab-door shot laid over the car; underneath the camera waits on the wide shot
  [0, 700, 1050, 1.0],
  [c.hookCut, 700, 1050, 1.0],
  // the driver walks in from the left: follow him, then close on him and the nearest zombie
  [c.driverEnters + 60, 760, 1050, 1.0],
  [c.zombiesApproach + 20, 620, 1040, 1.35],
  // the bite
  [c.biteAt - 25, 590, 1040, 1.7],
  [c.biteAt + 30, 560, 1040, 1.5],
  [c.biteAt + 90, 400, 1050, 1.2],
  // back to the survivors: "you" see the wound
  [c.cabCloses, 900, 1050, 0.95],
  [c.youSee - 5, 1430, 1060, 1.2],
  [c.youSee + 60, 1430, 1050, 1.8],
  [c.youShout + 20, 1380, 1050, 1.0],
  // the uncle: slow push while the clock runs out
  [c.unclePale, 1300, 1060, 1.3],
  [c.uncleRises - 15, 1235, 1040, 1.9],
  [c.uncleRises + 30, 1450, 1050, 1.1],
  [c.uncleRises + 80, 1440, 1050, 1.0],
  // the train does not stop, then the question
  [c.stationPass, 1400, 1050, 1.0],
  [c.questionAt, 1250, 1050, 0.9],
  [manifest.outroStart, 1100, 1050, 0.85],
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

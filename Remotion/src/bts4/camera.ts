import { Easing } from "remotion";

// Virtual cameras for BTS Part 4. Every scene (a car, or one end of a car) has its own list of keys: (frame, focus x, focus y, zoom)
// in that scene's world coordinates; the focus point sits at the screen anchor (540, 820) so subjects stay above the subtitle band.
// A key list must be in frame order (checked when the module loads).
export const ANCHOR = { x: 540, y: 820 };

export type Key = [frame: number, fx: number, fy: number, zoom: number];
export type Cam = { fx: number; fy: number; zoom: number; rot: number };

const ease = Easing.inOut(Easing.cubic);

export const makeCamera = (name: string, keys: Key[]) => {
  keys.forEach((k, i) => {
    if (i > 0 && !(k[0] >= keys[i - 1][0])) throw new Error(`camera ${name}: key ${i} (frame ${k[0]}) comes before key ${i - 1} (frame ${keys[i - 1][0]})`);
  });
  return (g: number): Cam => {
    let a = keys[0];
    let b = keys[keys.length - 1];
    if (g <= keys[0][0]) b = a;
    else if (g >= keys[keys.length - 1][0]) a = b;
    else {
      for (let i = 0; i < keys.length - 1; i++) {
        if (g >= keys[i][0] && g <= keys[i + 1][0]) { a = keys[i]; b = keys[i + 1]; break; }
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
};

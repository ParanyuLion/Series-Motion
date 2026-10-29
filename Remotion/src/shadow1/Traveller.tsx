import React from "react";
import { INK, SKIN, mix } from "./Figure";

// The traveller ("you"), drawn once as a small 3D-ish model so it can face any direction.
// yaw 0 = facing the viewer, 90 = facing the viewer's right, 180 = facing away, 270 = facing left (any value in between works, so it can also turn in an animation).
// Everything is projected from body-frame points (lat = to the character's side, y up, z = forward): screen x = lat*cos(yaw) + z*sin(yaw), depth = z*cos(yaw) - lat*sin(yaw).
// The head is a sphere: features (eyes, glasses, brows, nose, mouth) sit at a longitude and are foreshortened and hidden by that longitude, the hair is a shell with a
// face window cut out of it, so the bowl cut with its fringe is right from every side. Feet are at (0,0), about 440 tall to the top of the hair.

export type TravellerMood = "calm" | "smile" | "worry" | "stare";

export const TRAVELLER_COLORS = { hair: "#1d1816", jacket: "#24252b", under: "#f4f1ea", pants: "#2c3a56", shoes: "#5a4638" };

const RAD = Math.PI / 180;
const norm = (a: number) => {
  let r = ((a + 180) % 360 + 360) % 360 - 180;
  if (r === -180) r = 180;
  return r;
};

type Pt = [number, number];

export const Traveller: React.FC<{
  yaw?: number;
  mood?: TravellerMood;
  silhouette?: boolean;
  walk?: number; // stride amount 0..1
  phase?: number; // walk cycle in radians
  point?: number; // 0..1 how far the pointing arm is out
  pointArm?: 1 | -1; // which arm points (+1 = the character's left arm, which is on the viewer's right at yaw 0)
  pointYaw?: number; // direction of the point, relative to where the body faces (degrees)
  armsUp?: number; // 0..1 both hands up
  sit?: boolean;
  lookYaw?: number; // the head turns this much more than the body (degrees)
  t?: number; // frame, for the blink
}> = ({ yaw = 0, mood = "calm", silhouette = false, walk = 0, phase = 0, point = 0, pointArm = 1, pointYaw = 0, armsUp = 0, sit = false, lookYaw = 0, t = 0 }) => {
  const S = silhouette ? "#0a1022" : null;
  const ink = S ?? INK;
  const col = (c: string) => S ?? c;
  const C = TRAVELLER_COLORS;
  const sw = 8;
  const th = yaw * RAD;
  const c = Math.cos(th);
  const s = Math.sin(th);

  // body frame
  const A = 54; // torso half width
  const D = 34; // torso half depth
  const bh = 236;
  const hipY = -130;
  const topY = hipY - bh;
  const headY = topY - 72;
  const sitD = sit ? -100 - hipY : 0; // the whole figure drops onto the seat
  const ay = sit ? -20 - sitD : -20; // ankle height in the body frame
  const prj = (lat: number, y: number, z: number): Pt => [lat * c + z * s, y];
  const dep = (lat: number, z: number) => z * c - lat * s;
  const W = Math.sqrt(A * A * c * c + D * D * s * s); // torso half width on screen
  const surf = (psi: number, y: number): { p: Pt; d: number } => {
    // a point on the torso's surface at longitude psi (0 = front centre)
    const lat = A * Math.sin(psi * RAD);
    const z = D * Math.cos(psi * RAD);
    return { p: prj(lat, y, z), d: dep(lat, z) };
  };

  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const id = (silhouette ? "tvs" : "tv") + uid;
  const bodyD = `M${-W} ${hipY} Q${-W - 8} ${topY + bh * 0.3} ${-W * 0.7} ${topY + 24} Q0 ${topY - 16} ${W * 0.7} ${topY + 24} Q${W + 8} ${topY + bh * 0.3} ${W} ${hipY} Q0 ${hipY + 26} ${-W} ${hipY} Z`;

  const legZ = (side: number) => side * 30 * walk * Math.sin(phase);
  const armZ = (side: number) => -side * 34 * walk * Math.sin(phase);

  // ---- legs
  const legs = ([-1, 1] as const)
    .map((side) => {
      const lat = side * 22;
      const z = legZ(side);
      const lift = walk > 0 ? Math.max(0, Math.cos(phase + (side === 1 ? 0 : Math.PI)) * 16 * walk) : 0;
      const hip: Pt = prj(lat, hipY + 6, 0);
      let knee: Pt;
      let ank: Pt;
      let footZ: number;
      if (sit) {
        knee = prj(lat, hipY + 6, 64);
        ank = prj(lat, ay - 2, 64);
        footZ = 64;
      } else {
        knee = prj(lat, hipY / 2 - lift * 0.5, z * 0.5 + (z > 0 ? 6 : 0));
        ank = prj(lat, ay - lift, z);
        footZ = z;
      }
      const shoeX = lat * c + (footZ + 10) * s;
      const shoeRx = Math.sqrt((15 * c) ** 2 + (27 * s) ** 2);
      const d = `M${hip[0]} ${hip[1]} L${knee[0]} ${knee[1]} L${ank[0]} ${ank[1]}`;
      return {
        depth: dep(lat, footZ * 0.3),
        node: (
          <g key={"leg" + side}>
            <path d={d} fill="none" stroke={ink} strokeWidth={36 + sw} strokeLinejoin="round" strokeLinecap="round" />
            <path d={d} fill="none" stroke={col(C.pants)} strokeWidth={36} strokeLinejoin="round" strokeLinecap="round" />
            {!silhouette && <path d={d} fill="none" stroke="#000" strokeWidth={6} opacity={0.14} transform="translate(8 0)" strokeLinejoin="round" strokeLinecap="round" />}
            <ellipse cx={shoeX} cy={ank[1] + 12} rx={Math.max(15, shoeRx)} ry={12} fill={col(C.shoes)} stroke={ink} strokeWidth={sw - 2} />
          </g>
        ),
      };
    })
    .sort((a, b) => a.depth - b.depth)
    .map((l) => l.node);

  // ---- arms
  const arm = (side: -1 | 1) => {
    const y0 = topY + 46;
    const P0 = prj(side * 36, y0, 0);
    const up = armsUp;
    let hand = { lat: side * (66 + up * 34), y: y0 + 124 - up * 150, z: armZ(side) };
    let el = { lat: side * 76, y: y0 + 56 - up * 40, z: armZ(side) * 0.4 };
    const pk = side === pointArm ? point : 0;
    if (pk > 0) {
      const py = pointYaw * RAD;
      const ph = { lat: side * 30 + 150 * Math.sin(py), y: y0 + 6, z: 150 * Math.cos(py) };
      const pe = { lat: side * 52 + 70 * Math.sin(py), y: y0 + 40, z: 70 * Math.cos(py) };
      hand = { lat: hand.lat + (ph.lat - hand.lat) * pk, y: hand.y + (ph.y - hand.y) * pk, z: hand.z + (ph.z - hand.z) * pk };
      el = { lat: el.lat + (pe.lat - el.lat) * pk, y: el.y + (pe.y - el.y) * pk, z: el.z + (pe.z - el.z) * pk };
    }
    const P1 = prj(el.lat, el.y, el.z);
    const P2 = prj(hand.lat, hand.y, hand.z);
    const tt = 0.8;
    const cc: Pt = [P0[0] + tt * (P1[0] - P0[0]), P0[1] + tt * (P1[1] - P0[1])];
    const E: Pt = [(1 - tt) * (1 - tt) * P0[0] + 2 * tt * (1 - tt) * P1[0] + tt * tt * P2[0], (1 - tt) * (1 - tt) * P0[1] + 2 * tt * (1 - tt) * P1[1] + tt * tt * P2[1]];
    const d = `M${P0[0]} ${P0[1]} Q${cc[0]} ${cc[1]} ${E[0]} ${E[1]}`;
    const dx = 2 * (1 - tt) * (P1[0] - P0[0]) + 2 * tt * (P2[0] - P1[0]);
    const dy = 2 * (1 - tt) * (P1[1] - P0[1]) + 2 * tt * (P2[1] - P1[1]);
    const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
    const AW = 34;
    const shoulderDepth = dep(side * 36, 0);
    const handDepth = dep(hand.lat, hand.z);
    const front = shoulderDepth > 10 || (pk > 0.3 && handDepth > 40);
    const node = (
      <g key={"arm" + side}>
        <path d={d} fill="none" stroke={ink} strokeWidth={AW + sw * 1.4} strokeLinecap="butt" />
        <path d={d} fill="none" stroke={col(C.jacket)} strokeWidth={AW} strokeLinecap="butt" />
        {front && <circle cx={P0[0]} cy={P0[1]} r={AW / 2 - 2 + sw * 0.6} fill={ink} />}
        {front && <circle cx={P0[0]} cy={P0[1]} r={AW / 2 - 2} fill={col(C.jacket)} />}
        <g transform={`translate(${E[0]},${E[1]}) rotate(${ang})`}>
          <rect x={-4} y={-AW / 2 - 3} width={8} height={AW + 6} rx={3} fill={col(mix(C.jacket, "#000000", 0.25))} stroke={ink} strokeWidth={sw - 3} />
        </g>
        <circle cx={P2[0]} cy={P2[1] + 6} r={13} fill={col(SKIN)} stroke={ink} strokeWidth={sw - 2} />
      </g>
    );
    return { front, node, depth: shoulderDepth };
  };
  const arms = ([-1, 1] as const).map(arm);
  const armsBack = arms.filter((a) => !a.front).map((a) => a.node);
  const armsFront = arms.filter((a) => a.front).map((a) => a.node);

  // ---- torso
  const faceFront = c > 0.05;
  const faceBack = c < -0.05;
  const vTop = [surf(-34, topY + 8), surf(34, topY + 8), surf(0, topY + 84)];
  const flapL = [surf(-34, topY + 8), surf(-4, topY + 70), surf(-39, topY + 66)];
  const flapR = [surf(34, topY + 8), surf(4, topY + 70), surf(39, topY + 66)];
  const zipTop = surf(0, topY + 78).p[0];
  const backSeam = surf(180, topY + 30).p[0];
  const polyStr = (pts: { p: Pt }[]) => pts.map((q) => `${q.p[0]},${q.p[1]}`).join(" ");
  const torso = (
    <g>
      <defs>
        <linearGradient id={id + "-body"} x1="0.15" y1="0" x2="0.85" y2="1">
          <stop offset="0" stopColor={mix(C.jacket, "#ffffff", 0.16)} />
          <stop offset="1" stopColor={mix(C.jacket, "#000000", 0.14)} />
        </linearGradient>
        <clipPath id={id + "-clip"}><path d={bodyD} /></clipPath>
      </defs>
      <path d={bodyD} fill={silhouette ? S! : `url(#${id}-body)`} stroke={ink} strokeWidth={sw} />
      {!silhouette && (
        <g>
          <path d={`M${W * 0.34} ${topY + 40} Q${W * 0.9} ${topY + bh * 0.45} ${W * 0.9} ${hipY - 4} Q${W * 0.5} ${hipY + 12} ${W * 0.3} ${hipY + 8} Q${W * 0.6} ${topY + bh * 0.5} ${W * 0.34} ${topY + 40} Z`} fill="#1a1428" opacity={0.28} />
          <g clipPath={`url(#${id}-clip)`}>
            {faceFront && (
              <g>
                <polygon points={polyStr(vTop)} fill={C.under} />
                <polygon points={polyStr(flapL)} fill={mix(C.jacket, "#ffffff", 0.14)} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
                <polygon points={polyStr(flapR)} fill={mix(C.jacket, "#ffffff", 0.14)} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
                <line x1={zipTop} y1={topY + 78} x2={zipTop} y2={hipY + 10} stroke={INK} strokeWidth={4} />
                <line x1={zipTop + 4} y1={topY + 84} x2={zipTop + 4} y2={hipY + 10} stroke="#9ca0aa" strokeWidth={2} strokeDasharray="3 4" />
                {[-1, 1].map((q) => {
                  const a1 = surf(q * 62, hipY - 70).p;
                  const a2 = surf(q * 40, hipY - 30).p;
                  return <path key={q} d={`M${a1[0]} ${a1[1]} L${a2[0]} ${a2[1]}`} stroke={INK} strokeWidth={3} opacity={0.6} />;
                })}
              </g>
            )}
            {faceBack && (
              <g>
                <line x1={backSeam} y1={topY + 30} x2={backSeam} y2={hipY + 10} stroke={INK} strokeWidth={3} opacity={0.7} />
                <path d={`M${-W} ${topY + 52} Q0 ${topY + 70} ${W} ${topY + 52}`} fill="none" stroke={INK} strokeWidth={3} opacity={0.5} />
              </g>
            )}
            <rect x={-W - 10} y={hipY - 24} width={W * 2 + 20} height={30} fill={mix(C.jacket, "#ffffff", 0.1)} stroke={INK} strokeWidth={3} />
          </g>
          {Array.from({ length: 5 }, (_, i) => <path key={i} d={`M${W * 0.55 + i * 5} ${topY + 70 + i * 36} l${-26} ${34}`} stroke={INK} strokeWidth={4} opacity={0.35} />)}
        </g>
      )}
    </g>
  );

  // ---- head
  const hyaw = yaw + lookYaw;
  const hp = (phi: number, y: number, R = 80): Pt => {
    const a = Math.max(-90, Math.min(90, norm(hyaw) + phi)) * RAD;
    return [R * Math.sin(a), y];
  };
  const hd = (phi: number) => Math.cos(norm(phi + hyaw) * RAD);
  const blink = t % 160 > 154 ? 0.1 : 1;
  const eyeY = headY + 6;
  const skin = SKIN;
  const hairC = C.hair;
  const headGradId = id + "-head";
  const fringe: [number, number][] = [[-76, -14], [-68, -42], [-58, -20], [-46, -46], [-34, -26], [-18, -48], [-4, -16], [8, -46], [22, -24], [38, -46], [52, -26], [64, -44], [76, -16]];
  const WL = 80;
  const fringePts = fringe.map(([phi, dy]) => ({ q: hp(phi, headY + dy, 82), d: hd(phi) }));
  const winLeft = hp(-WL, headY + 30, 82);
  const winRight = hp(WL, headY + 30, 82);
  const winVisible = fringe.some(([phi]) => hd(phi) > 0.02) || hd(0) > 0.02;
  const winPoly = [winLeft, ...fringePts.map((f) => f.q), winRight, hp(WL, headY + 130, 82), hp(-WL, headY + 130, 82)].map((q) => `${q[0]},${q[1]}`).join(" ");
  // the hair/skin edge: the fringe plus the two sides down to the nape, broken where it turns out of sight
  const edgePts: { q: Pt; d: number }[] = [{ q: winLeft, d: hd(-WL) }, ...fringePts, { q: winRight, d: hd(WL) }];
  let edgeD = "";
  let pen = false;
  edgePts.forEach((e) => {
    if (e.d > 0.02) {
      edgeD += `${pen ? "L" : "M"}${e.q[0]} ${e.q[1]} `;
      pen = true;
    } else pen = false;
  });
  // the hair shell: an ellipse cut at the nape; the cut is low at the back and high at the front, so it slopes in profile
  const MC = headY - 6;
  const xe = (y: number) => 86 * Math.sqrt(Math.max(0.02, 1 - ((y - MC) / 96) ** 2));
  const botY = (aDeg: number) => headY + 28 + 34 * (1 - Math.cos((aDeg - yaw) * RAD)) / 2;
  const yL = botY(-90);
  const yR = botY(90);
  const botPts = Array.from({ length: 13 }, (_, i) => {
    const ad = 90 - i * 15;
    const y = botY(ad);
    return `L${xe(y) * Math.sin(ad * RAD)} ${y}`;
  }).join(" ");
  const uL = Math.atan2((yL - MC) / 96, -xe(yL) / 86);
  const uR = Math.atan2((yR - MC) / 96, xe(yR) / 86) + Math.PI * 2;
  const topPts = Array.from({ length: 33 }, (_, i) => {
    const u = uL + ((uR - uL) * i) / 32;
    return `L${86 * Math.cos(u)} ${MC + 96 * Math.sin(u)}`;
  }).join(" ");
  const hairMass = `M${-xe(yL)} ${yL} ${topPts} ${botPts} Z`;
  const seams = [150, 172, 194, 216, 20, -20].map((lon) => {
    const dd = hd(lon);
    if (dd <= 0.08) return null;
    const a = hp(lon, headY - 94, 30);
    const b = hp(lon, headY + 28, 84);
    const mid = hp(lon, headY - 40, 82);
    return <path key={lon} d={`M${a[0]} ${a[1]} Q${mid[0]} ${mid[1]} ${b[0]} ${b[1]}`} fill="none" stroke={mix(hairC, "#ffffff", 0.14)} strokeWidth={2.5} opacity={0.4} />;
  });

  const sample = (n: number, f: (u: number) => Pt): string => Array.from({ length: n + 1 }, (_, i) => f((i / n) * 2 - 1)).map((q) => `${q[0]},${q[1]}`).join(" ");
  const sampleD = (n: number, f: (u: number) => Pt): string => Array.from({ length: n + 1 }, (_, i) => f((i / n) * 2 - 1)).map((q, i) => `${i ? "L" : "M"}${q[0]} ${q[1]}`).join(" ");
  const ellipsePoly = (phiC: number, yC: number, rPhi: number, rY: number, n = 20) =>
    Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2;
      const q = hp(phiC + rPhi * Math.cos(a), yC + rY * Math.sin(a));
      return `${q[0]},${q[1]}`;
    }).join(" ");

  const eyeOpen = mood !== "smile";
  const eyeBig = mood === "stare" ? 1.18 : 1;
  const browTilt = mood === "worry" ? -9 : 0;
  const browRaise = mood === "stare" ? -9 : mood === "worry" ? -3 : 0;
  const features = [-1, 1].map((side) => {
    const phiC = side * 25;
    const dC = hd(phiC);
    const eyeVisible = dC > 0.18;
    const browVisible = dC > 0.1;
    return (
      <g key={"f" + side}>
        {browVisible && (
          <polyline
            points={sample(8, (u) => hp(phiC + 12 * u, eyeY - 34 - 7 * (1 - u * u) + browRaise + browTilt * (-side * u)))}
            fill="none"
            stroke={ink}
            strokeWidth={6}
            strokeLinejoin="round"
          />
        )}
        {eyeVisible && eyeOpen && <polygon points={ellipsePoly(phiC, eyeY, 8.5 * eyeBig, 12 * blink * eyeBig)} fill={ink} />}
        {eyeVisible && eyeOpen && blink > 0.5 && <circle cx={hp(phiC + 3, eyeY - 4)[0]} cy={eyeY - 4} r={3.2 * Math.max(0.5, dC)} fill="#fff" opacity={0.85} />}
        {eyeVisible && !eyeOpen && <polyline points={sample(8, (u) => hp(phiC + 11 * u, eyeY - 14 * (1 - u * u)))} fill="none" stroke={ink} strokeWidth={6} strokeLinecap="round" />}
      </g>
    );
  });
  const noseTop = hp(0, eyeY + 10, 82);
  const noseTip = hp(-4, eyeY + 28, 96);
  const noseBase = hp(-1, eyeY + 31, 84);
  const noseVisible = hd(0) > -0.2;
  const mouthVisible = hd(0) > 0.04;
  let mouth: React.ReactNode = null;
  if (mouthVisible) {
    if (mood === "smile") {
      mouth = <polygon points={`${hp(-22, eyeY + 52)[0]},${eyeY + 52} ${sample(10, (u) => hp(22 * u, eyeY + 52 + 15 * (1 - u * u) * 1.9 - 0))} ${hp(22, eyeY + 52)[0]},${eyeY + 52}`} fill="#7a3a30" stroke={ink} strokeWidth={5} strokeLinejoin="round" />;
    } else if (mood === "worry") {
      mouth = <polyline points={sample(10, (u) => hp(14 * u, eyeY + 62 - 12 * (1 - u * u)))} fill="none" stroke={ink} strokeWidth={5} strokeLinecap="round" />;
    } else if (mood === "stare") {
      mouth = <polygon points={ellipsePoly(0, eyeY + 58, 8, 7)} fill="#7a3a30" stroke={ink} strokeWidth={4} />;
    } else {
      mouth = <polyline points={sample(10, (u) => hp(14 * u, eyeY + 56 + 1.5 * (1 - u * u)))} fill="none" stroke={ink} strokeWidth={5} strokeLinecap="round" />;
    }
  }
  const glasses = [-1, 1].map((side) => {
    const phiC = side * 25;
    if (hd(phiC) < -0.05) return null;
    return (
      <g key={"g" + side}>
        <polygon points={ellipsePoly(phiC, eyeY, 21, 27, 28)} fill="#cfd8de" fillOpacity={0.35} stroke={ink} strokeWidth={6} strokeLinejoin="round" />
      </g>
    );
  });
  const bridge = hd(0) > 0.1 ? <line x1={hp(-4, eyeY - 2)[0]} y1={eyeY - 2} x2={hp(4, eyeY - 2)[0]} y2={eyeY - 2} stroke={ink} strokeWidth={5} /> : null;
  const temples = [-1, 1].map((side) => {
    const a = hp(side * 46, eyeY - 4);
    const b = hp(side * 88, eyeY - 2);
    if (hd(side * 46) < 0.02) return null;
    return <line key={"t" + side} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={ink} strokeWidth={4.5} strokeLinecap="round" />;
  });
  const sweatLon = 64;
  const sweat = mood === "worry" && hd(sweatLon) > 0.15 ? (() => {
    const p = hp(sweatLon, headY - 6);
    const k = Math.max(0.5, hd(sweatLon));
    return <path d={`M${p[0]} ${p[1]} Q${p[0] - 12 * k} ${p[1] + 20} ${p[0]} ${p[1] + 28} Q${p[0] + 12 * k} ${p[1] + 20} ${p[0]} ${p[1]} Z`} fill="#9cd0f2" stroke={INK} strokeWidth={3.5} />;
  })() : null;

  const head = (
    <g>
      <defs>
        <radialGradient id={headGradId} gradientUnits="userSpaceOnUse" cx={-30} cy={headY - 30} r={150}>
          <stop offset="0" stopColor={mix(skin, "#ffffff", 0.14)} />
          <stop offset="0.55" stopColor={skin} />
          <stop offset="1" stopColor={mix(skin, "#3a1f18", 0.2)} />
        </radialGradient>
        <clipPath id={id + "-hc"}><ellipse cx={0} cy={headY} rx={80} ry={88} /></clipPath>
        <clipPath id={id + "-win"}><polygon points={winPoly} /></clipPath>
      </defs>
      <ellipse cx={0} cy={headY} rx={80} ry={88} fill={silhouette ? S! : `url(#${headGradId})`} stroke={ink} strokeWidth={sw} />
      <path d={hairMass} fill={col(hairC)} stroke={ink} strokeWidth={sw} strokeLinejoin="round" />
      {!silhouette && <path d={`M-60 ${headY - 70} Q-20 ${headY - 96} 30 ${headY - 92}`} fill="none" stroke={mix(hairC, "#ffffff", 0.14)} strokeWidth={5} opacity={0.5} strokeLinecap="round" />}
      {!silhouette && seams}
      {!silhouette && winVisible && (
        <g clipPath={`url(#${id}-hc)`}>
          <g clipPath={`url(#${id}-win)`}>
            <polygon points={winPoly} fill={`url(#${headGradId})`} />
            <path d={`M0 ${headY - 88} A80 88 0 0 1 0 ${headY + 88} Q104 ${headY} 0 ${headY - 88} Z`} fill={mix(skin, "#3a1f18", 0.3)} opacity={0.42} />
            {features}
            {noseVisible && <path d={`M${noseTop[0]} ${noseTop[1]} L${noseTip[0]} ${noseTip[1]} L${noseBase[0]} ${noseBase[1]}`} fill="none" stroke={ink} strokeWidth={4} opacity={0.7} strokeLinejoin="round" />}
            {mouth}
          </g>
        </g>
      )}
      {!silhouette && winVisible && <path d={edgeD} fill="none" stroke={ink} strokeWidth={sw - 1} strokeLinejoin="round" strokeLinecap="round" />}
      {!silhouette && winVisible && (
        <g>
          {glasses}
          {bridge}
          {temples}
        </g>
      )}
      {!silhouette && sweat}
    </g>
  );

  return (
    <g transform={`translate(0,${sitD})`} strokeLinecap="round" strokeLinejoin="round" filter={silhouette ? undefined : "url(#ss-rough)"}>
      <defs>
        <filter id="ss-rough" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="7" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="3" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
      {armsBack}
      {legs}
      {torso}
      {armsFront}
      {head}
    </g>
  );
};

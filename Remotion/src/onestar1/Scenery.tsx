import React from "react";
import { PAL } from "./Look";
import { fontFamily } from "../island/fonts";

// Scenery for series 4: far skyline and clouds, building walls with detail, a wet road. Needs <LookDefs /> in the same <svg>.
const rnd = (i: number) => {
  const v = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return v - Math.floor(v);
};

/** far skyline, soft clouds and a hazy moon glow, for the top of the picture */
export const Sky: React.FC<{ x0: number; x1: number; horizon: number; top?: number; g?: number }> = ({ x0, x1, horizon, top = -200, g = 0 }) => {
  const w = x1 - x0;
  const clouds = Array.from({ length: 7 }, (_, i) => {
    const cx = x0 + ((rnd(i + 300) * w + g * (0.4 + rnd(i + 310) * 0.4)) % w);
    const cy = top + 200 + rnd(i + 320) * (horizon - top - 500);
    return <ellipse key={i} cx={cx} cy={cy} rx={220 + rnd(i + 330) * 260} ry={36 + rnd(i + 340) * 40} fill="#1a2c52" opacity={0.28 + rnd(i + 350) * 0.2} />;
  });
  const towers = Array.from({ length: 12 }, (_, i) => {
    const bx = x0 + (i / 12) * w + rnd(i + 400) * 30;
    const bw = 70 + rnd(i + 410) * 90;
    const bh = 160 + rnd(i + 420) * 330;
    const lit = Array.from({ length: 9 }, (_, k) =>
      rnd(i * 20 + k + 430) > 0.55 ? <rect key={k} x={bx + 10 + (k % 3) * (bw / 3.4)} y={horizon - bh + 16 + Math.floor(k / 3) * 34} width={9} height={12} fill={rnd(i + k) > 0.5 ? PAL.accent : "#9fc3ff"} opacity={0.55} /> : null,
    );
    return (
      <g key={i}>
        <rect x={bx} y={horizon - bh} width={bw} height={bh + 4} fill="#0a1226" />
        {lit}
      </g>
    );
  });
  return (
    <g>
      <circle cx={x0 + w * 0.78} cy={top + 360} r={150} fill="#7f9dd6" opacity={0.16} filter="url(#os-blur)" />
      <circle cx={x0 + w * 0.78} cy={top + 360} r={48} fill="#cfe0ff" opacity={0.22} filter="url(#os-soft)" />
      <g filter="url(#os-blur)">{clouds}</g>
      {towers}
    </g>
  );
};

/** a building wall at the side of the picture: panels, lit and dark windows, sills, a drainpipe, a sign, cables */
export const BuildingWall: React.FC<{ x: number; y: number; w: number; h: number; seed?: number; sign?: string }> = ({ x, y, w, h, seed = 0, sign }) => {
  const cols = Math.max(2, Math.floor(w / 110));
  const rows = Math.floor((h - 140) / 170);
  const wins: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const k = r * 10 + c + seed * 100;
      const wx = x + 26 + c * ((w - 52) / cols);
      const wy = y + 70 + r * 170;
      const lit = rnd(k + 1) > 0.62;
      wins.push(
        <g key={k}>
          <rect x={wx} y={wy} width={64} height={92} fill={lit ? "#c9a55a" : "#060a14"} opacity={lit ? 0.5 : 1} />
          <rect x={wx} y={wy} width={64} height={92} fill="none" stroke="#1d2a44" strokeWidth={4} />
          <line x1={wx + 32} y1={wy} x2={wx + 32} y2={wy + 92} stroke="#1d2a44" strokeWidth={3} />
          <rect x={wx - 6} y={wy + 92} width={76} height={8} fill="#16213a" />
          {rnd(k + 2) > 0.7 && <rect x={wx + 6} y={wy + 100} width={52} height={34} fill="#101a2e" stroke="#1d2a44" strokeWidth={2} />}
        </g>,
      );
    }
  }
  const panels = Array.from({ length: Math.floor(h / 60) }, (_, i) => <line key={i} x1={x} y1={y + i * 60} x2={x + w} y2={y + i * 60} stroke="#16213a" strokeWidth={2} opacity={0.7} />);
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="#0c1426" />
      <rect x={x} y={y} width={w} height={h} fill="url(#os-wall)" />
      {panels}
      {wins}
      <rect x={x + w - 44} y={y + 40} width={14} height={h - 40} fill="#16213a" />
      <rect x={x + 6} y={y + h - 60} width={w - 12} height={60} fill="#0a1020" />
      {sign && (
        <g transform={`translate(${x + 20},${y + h - 640})`}>
          <rect x={-8} y={-8} width={w - 24} height={76} rx={14} fill={PAL.accent} opacity={0.14} filter="url(#os-soft)" />
          <rect width={w - 40} height={60} rx={8} fill="#0a1020" stroke="#1d2a44" strokeWidth={3} />
          <text x={(w - 40) / 2} y={43} fontSize={36} fill={PAL.accent} textAnchor="middle" fontFamily={fontFamily} opacity={0.9}>{sign}</text>
        </g>
      )}
      <path d={`M${x} ${y + 30} Q${x + w / 2} ${y + 80} ${x + w} ${y + 24}`} fill="none" stroke="#050810" strokeWidth={3} />
      <path d={`M${x} ${y + 60} Q${x + w / 2} ${y + 120} ${x + w} ${y + 56}`} fill="none" stroke="#050810" strokeWidth={2} />
    </g>
  );
};

/** wet road and kerb: dark asphalt, a kerb line, puddles that mirror the lights, cracks, a manhole, bags at the wall */
export const WetGround: React.FC<{ x0: number; x1: number; y: number; bottom: number; g?: number }> = ({ x0, x1, y, bottom, g = 0 }) => {
  const w = x1 - x0;
  const puddles = Array.from({ length: 6 }, (_, i) => {
    const px = x0 + 120 + rnd(i + 500) * (w - 240);
    const py = y + 70 + rnd(i + 510) * (bottom - y - 150);
    const rx = 90 + rnd(i + 520) * 150;
    const warm = rnd(i + 530) > 0.5;
    const ripple = (g * 0.05 + rnd(i + 540)) % 1;
    return (
      <g key={i}>
        <ellipse cx={px} cy={py} rx={rx} ry={rx * 0.13} fill="#0a1630" />
        <ellipse cx={px} cy={py} rx={rx * 0.7} ry={rx * 0.07} fill={warm ? PAL.accent : "#6fa8ff"} opacity={0.22} filter="url(#os-soft)" />
        <ellipse cx={px} cy={py} rx={rx * ripple} ry={rx * ripple * 0.13} fill="none" stroke={PAL.beam} strokeWidth={2} opacity={0.35 * (1 - ripple)} />
      </g>
    );
  });
  const cracks = Array.from({ length: 5 }, (_, i) => {
    const cx = x0 + rnd(i + 600) * w;
    const cy = y + 40 + rnd(i + 610) * (bottom - y - 80);
    return <path key={i} d={`M${cx} ${cy} l30 8 l22 -6 l40 14`} fill="none" stroke="#02040a" strokeWidth={3} opacity={0.8} />;
  });
  const streaks = Array.from({ length: 8 }, (_, i) => {
    const sx = x0 + rnd(i + 700) * w;
    return <rect key={i} x={sx} y={y + 6} width={14 + rnd(i + 710) * 24} height={bottom - y - 10} fill={rnd(i + 720) > 0.5 ? PAL.accent : "#6fa8ff"} opacity={0.07} filter="url(#os-blur)" />;
  });
  const mx = x0 + w * 0.34;
  return (
    <g>
      <rect x={x0} y={y} width={w} height={bottom - y} fill="url(#os-ground)" />
      <rect x={x0} y={y} width={w} height={18} fill="#16213a" />
      <line x1={x0} y1={y} x2={x1} y2={y} stroke={PAL.rim} strokeWidth={2} opacity={0.3} />
      {streaks}
      {cracks}
      <ellipse cx={mx} cy={y + 150} rx={64} ry={13} fill="#04070e" stroke="#16213a" strokeWidth={3} />
      <path d={`M${mx - 40} ${y + 150} h80 M${mx - 30} ${y + 143} h60 M${mx - 30} ${y + 157} h60`} stroke="#16213a" strokeWidth={2} />
      {puddles}
      <ellipse cx={x0 + 150} cy={y - 8} rx={50} ry={36} fill="#05080f" />
      <ellipse cx={x0 + 210} cy={y - 2} rx={36} ry={26} fill="#070b14" />
    </g>
  );
};

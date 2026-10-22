import React from "react";
import { fontFamily } from "../island/fonts";

// One BTS car seen from the inside, a long elevation of the far wall: ceiling lights, route-map strip, a band of windows
// with the city sliding past (parallax), a bench with YELLOW seats, poles and straps, sliding doors, and an open walkway
// to the next car on the right. Everything is deterministic. The world is drawn from x = -900 to 2000 so the camera can pan.
export const FLOOR_Y = 1300;
const CEIL_Y = 600;
const WIN_TOP = 760;
const WIN_BOT = 1030;
const DOOR_X = 120;
const DOOR_W = 440;
const WALKWAY_X = 1760;
const SEAT = "#f2b705";
const SEAT_BACK = "#e0a400";
const WALL = "#d9d5c7";
const LEFT = -900;
const RIGHT = 2000;
const PERIOD = 3600;

const mod = (a: number, b: number) => ((a % b) + b) % b;
const rnd = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

const City: React.FC<{ scroll: number }> = ({ scroll }) => {
  const layers = [
    { f: 0.22, n: 18, color: "#a9bccb", minH: 120, maxH: 230, w: [120, 220], win: false },
    { f: 0.5, n: 16, color: "#8396a8", minH: 150, maxH: 270, w: [110, 200], win: true },
    { f: 1.0, n: 12, color: "#5d7287", minH: 90, maxH: 260, w: [150, 260], win: true },
  ];
  return (
    <g>
      <rect x={LEFT} y={WIN_TOP} width={RIGHT - LEFT} height={WIN_BOT - WIN_TOP} fill="url(#bts-sky)" />
      <circle cx={mod(1400 - scroll * 0.05, 2600) - 300} cy={WIN_TOP + 70} r={60} fill="#fff6d8" opacity={0.7} />
      {layers.map((L, li) =>
        Array.from({ length: L.n }, (_, i) => {
          const w = L.w[0] + rnd(i + li * 31) * (L.w[1] - L.w[0]);
          const h = L.minH + rnd(i + li * 31 + 7) * (L.maxH - L.minH);
          const x = mod((i / L.n) * PERIOD - scroll * L.f + 900, PERIOD) - 900;
          return (
            <g key={`${li}-${i}`}>
              <rect x={x} y={WIN_BOT - h} width={w} height={h + 4} fill={L.color} />
              {L.win &&
                Array.from({ length: Math.floor(h / 46) }, (_, r) =>
                  Array.from({ length: Math.floor(w / 40) }, (_, c) => (
                    <rect key={`${r}-${c}`} x={x + 12 + c * 40} y={WIN_BOT - h + 14 + r * 46} width={16} height={22} fill="#e9f2f7" opacity={0.35} />
                  ))
                )}
            </g>
          );
        })
      )}
    </g>
  );
};

export type TrainInteriorProps = {
  frame: number;
  /** how far the city has slid past, in px */
  scroll: number;
  /** 0 doors closed .. 1 open */
  doors?: number;
  /** 1 normal light; lower dims and flickers the car */
  lights?: number;
  /** station name on the sign above the doors */
  station?: string;
  /** the car is drawn once; this only shifts the walkway label */
  carNumber?: 1 | 2 | 3 | 4;
  /** drawn behind the window pillars, e.g. station boards sliding past */
  windowChildren?: React.ReactNode;
};

export const TrainInterior: React.FC<TrainInteriorProps> = ({ frame, scroll, doors = 0, lights = 1, station = "สยาม", carNumber = 3, windowChildren }) => {
  const flick = lights < 1 ? lights * (0.82 + 0.18 * Math.sin(frame * 1.3)) : 1;
  const pillars = Array.from({ length: 9 }, (_, k) => LEFT + 120 + k * 360);
  const poles = [-300, 700, 1260, 1620];
  const paneW = DOOR_W / 2;
  const open = Math.min(1, Math.max(0, doors));
  return (
    <g>
      <defs>
        <linearGradient id="bts-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9fcbe8" />
          <stop offset="1" stopColor="#e4f0f6" />
        </linearGradient>
        <linearGradient id="bts-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8c9094" />
          <stop offset="1" stopColor="#5f6367" />
        </linearGradient>
        <linearGradient id="bts-shaft" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fffbe8" stopOpacity={0.5} />
          <stop offset="1" stopColor="#fffbe8" stopOpacity={0} />
        </linearGradient>
        <clipPath id="bts-winclip"><rect x={LEFT} y={WIN_TOP} width={RIGHT - LEFT} height={WIN_BOT - WIN_TOP} /></clipPath>
      </defs>

      {/* wall, ceiling, route-map strip */}
      <rect x={LEFT} y={CEIL_Y - 1600} width={RIGHT - LEFT} height={FLOOR_Y - CEIL_Y + 1600} fill={WALL} />
      <rect x={LEFT} y={CEIL_Y - 1600} width={RIGHT - LEFT} height={1600} fill="#eceae1" />
      <rect x={LEFT} y={CEIL_Y} width={RIGHT - LEFT} height={30} fill="#c9c6b8" />
      {Array.from({ length: 6 }, (_, i) => (
        <rect key={i} x={LEFT + 140 + i * 520} y={CEIL_Y + 6} width={300} height={16} rx={8} fill="#ffffff" opacity={flick} />
      ))}
      <rect x={LEFT} y={CEIL_Y + 30} width={RIGHT - LEFT} height={WIN_TOP - CEIL_Y - 30} fill="#cfcabb" />
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${620 + i * 520},${CEIL_Y + 52})`}>
          <rect x={-180} y={-18} width={360} height={36} rx={6} fill="#f5f3ea" />
          <path d="M-160 0 H160" stroke="#2f8f4e" strokeWidth={7} />
          {Array.from({ length: 8 }, (_, d) => <circle key={d} cx={-150 + d * 43} cy={0} r={6} fill="#fff" stroke="#2f8f4e" strokeWidth={3} />)}
        </g>
      ))}

      {/* windows: the city slides past behind the pillars */}
      <g clipPath="url(#bts-winclip)">
        <City scroll={scroll} />
        {windowChildren}
        {[0, 1, 2, 3].map((i) => (
          <polygon key={i} points={`${-600 + i * 700},${WIN_TOP} ${-380 + i * 700},${WIN_TOP} ${-140 + i * 700},${WIN_BOT} ${-460 + i * 700},${WIN_BOT}`} fill="#ffffff" opacity={0.1} />
        ))}
      </g>
      {pillars.map((px) => (
        <rect key={px} x={px} y={WIN_TOP - 6} width={60} height={WIN_BOT - WIN_TOP + 12} fill={WALL} />
      ))}
      <rect x={LEFT} y={WIN_TOP - 8} width={RIGHT - LEFT} height={10} fill="#b7b3a5" />
      <rect x={LEFT} y={WIN_BOT} width={RIGHT - LEFT} height={10} fill="#b7b3a5" />

      {/* bench with yellow seats, armrest poles, shadow under it */}
      <rect x={LEFT} y={WIN_BOT + 10} width={RIGHT - LEFT} height={FLOOR_Y - WIN_BOT - 10} fill="#c9c5b7" />
      <rect x={LEFT} y={1020} width={RIGHT - LEFT} height={170} rx={20} fill={SEAT_BACK} />
      <rect x={LEFT} y={1190} width={RIGHT - LEFT} height={66} rx={18} fill={SEAT} />
      <rect x={LEFT} y={1256} width={RIGHT - LEFT} height={44} fill="#8c8a80" opacity={0.55} />
      {Array.from({ length: 11 }, (_, i) => (
        <rect key={i} x={LEFT + 60 + i * 270} y={1040} width={4} height={160} fill="#7a6200" opacity={0.35} />
      ))}

      {/* sliding doors */}
      <g>
        <rect x={DOOR_X - 16} y={WIN_TOP - 40} width={DOOR_W + 32} height={FLOOR_Y - WIN_TOP + 40} fill="none" stroke="#bdb9aa" strokeWidth={16} />
        <rect x={DOOR_X} y={WIN_TOP - 20} width={DOOR_W} height={FLOOR_Y - WIN_TOP + 20} fill="#2a2f33" opacity={open > 0 ? 0.55 : 0.0} />
        {open > 0.02 && <PlatformView />}
        <g transform={`translate(${-open * paneW},0)`}>
          <rect x={DOOR_X} y={WIN_TOP - 20} width={paneW} height={FLOOR_Y - WIN_TOP + 20} fill="#cfd8de" opacity={0.55} />
          <rect x={DOOR_X} y={WIN_TOP - 20} width={paneW} height={FLOOR_Y - WIN_TOP + 20} fill="none" stroke="#8c918f" strokeWidth={8} />
          <rect x={DOOR_X} y={1120} width={paneW} height={12} fill="#2f8f4e" />
        </g>
        <g transform={`translate(${open * paneW},0)`}>
          <rect x={DOOR_X + paneW} y={WIN_TOP - 20} width={paneW} height={FLOOR_Y - WIN_TOP + 20} fill="#cfd8de" opacity={0.55} />
          <rect x={DOOR_X + paneW} y={WIN_TOP - 20} width={paneW} height={FLOOR_Y - WIN_TOP + 20} fill="none" stroke="#8c918f" strokeWidth={8} />
          <rect x={DOOR_X + paneW} y={1120} width={paneW} height={12} fill="#2f8f4e" />
        </g>
        <rect x={DOOR_X + DOOR_W / 2 - 150} y={CEIL_Y + 46} width={300} height={60} rx={8} fill="#0d3d2a" />
        <text x={DOOR_X + DOOR_W / 2} y={CEIL_Y + 90} textAnchor="middle" fontFamily={fontFamily} fontSize={38} fill="#ffffff">{station}</text>
      </g>

      {/* open walkway to the next car */}
      <g>
        <rect x={WALKWAY_X} y={WIN_TOP - 40} width={RIGHT - WALKWAY_X} height={FLOOR_Y - WIN_TOP + 40} fill="#4a4d52" />
        {Array.from({ length: 6 }, (_, i) => <rect key={i} x={WALKWAY_X + 20 + i * 46} y={WIN_TOP - 30} width={22} height={FLOOR_Y - WIN_TOP + 30} fill="#2c2f33" opacity={0.7} />)}
        <rect x={WALKWAY_X} y={WIN_TOP - 40} width={14} height={FLOOR_Y - WIN_TOP + 40} fill="#8c918f" />
        <text x={WALKWAY_X + 120} y={WIN_TOP - 56} textAnchor="middle" fontFamily={fontFamily} fontSize={30} fill="#5a5648">{carNumber === 4 ? "" : `→ ตู้ ${carNumber + 1}`}</text>
      </g>

      {/* floor */}
      <rect x={LEFT} y={FLOOR_Y} width={RIGHT - LEFT} height={1000} fill="url(#bts-floor)" />
      <rect x={LEFT} y={FLOOR_Y} width={RIGHT - LEFT} height={10} fill="#e6e3d6" opacity={0.7} />
      {Array.from({ length: 8 }, (_, i) => (
        <polygon key={i} points={`${mod(i * 520 - scroll * 0.9, 3000) - 900},${FLOOR_Y + 10} ${mod(i * 520 - scroll * 0.9, 3000) - 640},${FLOOR_Y + 10} ${mod(i * 520 - scroll * 0.9, 3000) - 760},${FLOOR_Y + 380} ${mod(i * 520 - scroll * 0.9, 3000) - 1020},${FLOOR_Y + 380}`} fill="#ffffff" opacity={0.1} />
      ))}

      {/* poles, rail and straps */}
      <rect x={LEFT} y={700} width={RIGHT - LEFT} height={8} fill="#cfd3d6" />
      {Array.from({ length: 18 }, (_, i) => {
        const sx = LEFT + 40 + i * 160;
        const sway = Math.sin(frame * 0.05 + i) * 3;
        return (
          <g key={i}>
            <line x1={sx} y1={704} x2={sx + sway} y2={772} stroke="#bdb9aa" strokeWidth={5} />
            <circle cx={sx + sway} cy={792} r={20} fill="none" stroke="#e8e6dd" strokeWidth={7} />
          </g>
        );
      })}
      {poles.map((px) => (
        <g key={px}>
          <rect x={px - 6} y={CEIL_Y + 30} width={12} height={FLOOR_Y - CEIL_Y - 30} fill="#cfd3d6" />
          <rect x={px - 2} y={CEIL_Y + 30} width={3} height={FLOOR_Y - CEIL_Y - 30} fill="#ffffff" opacity={0.8} />
        </g>
      ))}

      {/* morning light: a soft veil from the windows and a dimming layer when the lights fail */}
      <rect x={LEFT} y={CEIL_Y} width={RIGHT - LEFT} height={FLOOR_Y - CEIL_Y} fill="url(#bts-shaft)" opacity={0.25} />
      {flick < 1 && <rect x={LEFT} y={CEIL_Y - 1600} width={RIGHT - LEFT} height={2900} fill="#10141a" opacity={(1 - flick) * 0.75} />}
    </g>
  );
};

/** What is behind the open doors at Siam: platform floor, a pillar, the safety line and a far wall. */
const PlatformView: React.FC = () => (
  <g>
    <rect x={DOOR_X} y={WIN_TOP - 20} width={DOOR_W} height={FLOOR_Y - WIN_TOP + 20} fill="#e9eef0" />
    <rect x={DOOR_X + 40} y={WIN_TOP - 20} width={46} height={FLOOR_Y - WIN_TOP + 20} fill="#9aa3a8" />
    <rect x={DOOR_X} y={FLOOR_Y - 90} width={DOOR_W} height={90} fill="#b5bcc0" />
    <rect x={DOOR_X} y={FLOOR_Y - 34} width={DOOR_W} height={10} fill="#f2b705" />
  </g>
);

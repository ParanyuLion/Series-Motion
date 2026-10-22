import React from "react";
import { fontFamily } from "../island/fonts";

/** A station board sliding past the window (the train does not stop). Drawn in world coordinates inside the window band. */
export const StationBoard: React.FC<{ x: number; name: string; y?: number }> = ({ x, name, y = 800 }) => (
  <g transform={`translate(${x},${y})`}>
    <rect x={-8} y={96} width={16} height={260} fill="#6b7075" />
    <rect x={-230} y={0} width={460} height={110} rx={10} fill="#0d3d2a" stroke="#e9f2ec" strokeWidth={6} />
    <text x={0} y={62} textAnchor="middle" fontFamily={fontFamily} fontSize={58} fill="#ffffff">{name}</text>
    <rect x={-230} y={78} width={460} height={8} fill="#2f8f4e" />
  </g>
);

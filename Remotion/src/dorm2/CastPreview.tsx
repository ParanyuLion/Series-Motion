import React from "react";
import { AbsoluteFill } from "remotion";
import { Figure, LOOKS } from "../shadow1/Figure";
import { Traveller } from "../shadow1/Traveller";
import "../dorm1/Part1";
import "./looks";

// a look sheet of the dorm cast, for design review only
export const DormCastPreview: React.FC = () => {
  const cast: { look: string; x: number; label: string }[] = [
    { look: "ton", x: 380, label: "ton" },
    { look: "senior", x: 650, label: "senior" },
    { look: "cleaner", x: 930, label: "cleaner" },
  ];
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#cfd6da,#8d979c)" }}>
      <div style={{ position: "absolute", left: 300, top: 560, transform: "scale(0.55)", transformOrigin: "0 0" }} />
      {cast.map((c) => (
        <div key={c.look} style={{ position: "absolute", left: c.x, top: 1100, width: 0, height: 0 }}>
          <svg width={1} height={1} style={{ overflow: "visible" }}>
            <g transform="scale(0.55)"><Figure look={LOOKS[c.look]} mood="calm" /></g>
          </svg>
        </div>
      ))}
      <div style={{ position: "absolute", left: 140, top: 1100, width: 0, height: 0 }}>
        <svg width={1} height={1} style={{ overflow: "visible" }}><g transform="scale(0.5) translate(0,0)"><Traveller mood="calm" /></g></svg>
      </div>
    </AbsoluteFill>
  );
};

import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FLOOR_Y, TrainInterior } from "./TrainInterior";
import { Passenger } from "./Passenger";

// Review composition: frame 0 doors closed, frame 1 doors open, frame 2 the car with the lights failing and the city scrolled.
// A camera is applied here the same way Part1 will: anchor (540,820), focus (fx,fy), zoom.
export const BtsSetPreview: React.FC = () => {
  const f = useCurrentFrame();
  const cfg = [
    { doors: 0, scroll: 0, lights: 1 },
    { doors: 1, scroll: 0, lights: 1 },
    { doors: 0, scroll: 900, lights: 0.5 },
  ][Math.min(2, f)];
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <g transform="translate(540,820) scale(1.45) translate(-560,-1010)">
          <TrainInterior frame={f} scroll={cfg.scroll} doors={cfg.doors} lights={cfg.lights} />
          <Passenger id="you" x={760} y={FLOOR_Y + 40} scale={1.7} phase={0} walk={0} frame={f} pose="hold" />
          <Passenger id="nun" x={430} y={FLOOR_Y + 60} scale={1.7} facing={-1} phase={0} walk={0} frame={f} />
          <Passenger id="mike" x={1010} y={FLOOR_Y + 30} scale={1.7} phase={0} walk={0} frame={f} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

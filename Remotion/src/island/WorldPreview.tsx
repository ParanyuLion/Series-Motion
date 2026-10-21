import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Person } from "./Person";
import { BEACH_Y, H, IslandWorld, W } from "./IslandWorld";

// Review composition: the island with a hero standing for scale, waterline and camp visible.
export const WorldPreview: React.FC<{ storm?: number }> = ({ storm = 0 }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <IslandWorld frame={f} scroll={0} stormAmount={storm} showWaterline showCamp />
        <Person id="nathee" x={560} y={BEACH_Y} scale={1.5} phase={0} walk={0} frame={f} />
      </svg>
    </AbsoluteFill>
  );
};

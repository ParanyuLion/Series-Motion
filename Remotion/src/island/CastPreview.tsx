import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { CAST_IDS } from "./cast";
import { Person } from "./Person";

// Review composition: the seven in a row, then walking pairs at dirt 0 and 1.
export const CastPreview: React.FC<{ dirt?: number; walk?: number; pose?: "stand" | "point" | "sit" | "lie" }> = ({ dirt = 0, walk = 0, pose = "stand" }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#59626b,#8c949a)" }}>
      <svg width={1080} height={600} viewBox="0 0 1080 600">
        {CAST_IDS.map((id, i) => (
          <Person key={id} id={id} x={90 + i * 150} y={540} scale={1.05} phase={f * 0.2} walk={walk} frame={f} dirt={dirt} pose={pose} label />
        ))}
      </svg>
    </AbsoluteFill>
  );
};

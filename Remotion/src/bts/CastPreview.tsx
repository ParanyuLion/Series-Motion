import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { PASSENGER_IDS } from "./cast";
import { Passenger } from "./Passenger";

// Review composition: every passenger in three states on three rows: healthy, infection 0.6, turned and shambling.
export const BtsCastPreview: React.FC<{ walk?: number }> = ({ walk = 0 }) => {
  const f = useCurrentFrame();
  const rows: { inf: number; pose: "stand" | "shamble"; y: number }[] = [
    { inf: 0, pose: "stand", y: 250 },
    { inf: 0.6, pose: "stand", y: 480 },
    { inf: 1, pose: "shamble", y: 710 },
  ];
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#e7e3d6,#bdb9ab)" }}>
      <svg width={1080} height={760} viewBox="0 0 1080 760">
        {rows.map((r) =>
          PASSENGER_IDS.map((id, i) => (
            <Passenger key={`${r.y}-${id}`} id={id} x={70 + i * 117} y={r.y} scale={0.58} phase={f * 0.2} walk={r.pose === "shamble" ? 1 : walk} frame={f} infection={r.inf} pose={r.pose} label={r.y === 250} />
          ))
        )}
      </svg>
    </AbsoluteFill>
  );
};

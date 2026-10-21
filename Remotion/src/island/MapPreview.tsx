import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { MapCard, PART1_MARKERS } from "./MapCard";

// Review composition: frames 0, 1, 2 show the card at progress 0.3, 0.7 and 1.
export const MapPreview: React.FC = () => {
  const f = useCurrentFrame();
  const progress = [0.3, 0.7, 1][Math.min(2, f)];
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#59626b,#8c949a)", alignItems: "center", justifyContent: "center" }}>
      <MapCard progress={progress} markers={PART1_MARKERS} />
    </AbsoluteFill>
  );
};

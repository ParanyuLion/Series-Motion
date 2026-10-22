import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Countdown } from "./Countdown";
import { PART1_MARKERS, TrainMap } from "./TrainMap";
import { StationBoard } from "./StationBoard";
import { TrainInterior } from "./TrainInterior";

// Review composition. Frames: 0 map at 40%, 1 map complete, 2 countdown 60, 3 countdown 20, 4 countdown 5, 5 station board.
export const BtsGraphicsPreview: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#59626b,#8c949a)", alignItems: "center", justifyContent: "center" }}>
      {f < 2 && <TrainMap progress={f === 0 ? 0.4 : 1} markers={PART1_MARKERS} />}
      {f >= 2 && f < 5 && <Countdown seconds={[60, 20, 5][f - 2]} label="เหลือเวลา" />}
      {f === 5 && (
        <svg width={1080} height={700} viewBox="400 560 1080 700">
          <TrainInterior frame={0} scroll={300} windowChildren={<StationBoard x={900} name="ชิดลม" />} />
        </svg>
      )}
    </AbsoluteFill>
  );
};

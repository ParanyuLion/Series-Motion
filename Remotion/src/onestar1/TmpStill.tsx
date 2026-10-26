import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import manifest from "./manifest.json";
import { Grade, LookDefs } from "./Look";
import { DoorStep, RideScene } from "./Ride";

const c = manifest.cues as Record<string, number>;
// temporary: renders the scene under test at the frame given by --frame
export const TmpStill: React.FC<{ which: string }> = ({ which }) => {
  const g = useCurrentFrame();
  return (
    <Grade>
      <AbsoluteFill>
        <svg width="100%" height="100%" viewBox="0 0 1080 1920">
          <LookDefs />
          {which === "ride" && <RideScene g={g} from={c.pickupAt - 20} to={c.arriveAt + 10} pickupAt={c.pickupAt} smellAt={c.smellAt} circleAt={c.circleAt} arriveAt={c.arriveAt} />}
          {which === "door" && <DoorStep g={g} from={c.arriveAt} to={c.rateAt} />}
        </svg>
      </AbsoluteFill>
    </Grade>
  );
};

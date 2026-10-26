import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import manifest from "./manifest.json";
import { Grade, LookDefs } from "./Look";
import { DoorStep, RideScene } from "./Ride";
import { AlleyChase, HomeScene } from "./Chase";

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
          {which === "home" && <HomeScene g={g} from={c.buzzAt} to={c.runAt + 70} buzzAt={c.buzzAt} lightsAt={c.lightsAt} runAt={c.runAt} />}
          {which === "chase" && <AlleyChase g={g} from={c.runAt + 60} to={3000} followAt={c.followAt} deadEndAt={c.deadEndAt} unlockAt={c.unlockAt} />}
          {which === "door" && <DoorStep g={g} from={c.arriveAt} to={c.rateAt} />}
        </svg>
      </AbsoluteFill>
    </Grade>
  );
};

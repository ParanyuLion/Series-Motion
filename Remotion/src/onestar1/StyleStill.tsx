import React from "react";
import { AbsoluteFill } from "remotion";
import { Actor, Beam, Car, Grade, Hud, LookDefs, NightBackdrop, Subtitle } from "./Look";
import { BuildingWall, Sky, WetGround } from "./Scenery";

// One style-test frame: a rainy alley, "you" running, a car's headlights behind, the app HUD in the corner.
export const StyleStill: React.FC = () => {
  const g = 30;
  // lit windows high in the walls, to give the alley depth
  return (
    <Grade>
      <AbsoluteFill>
        <svg width="100%" height="100%" viewBox="0 0 1080 1920">
          <LookDefs />
          <NightBackdrop g={g} x0={0} x1={1080} />
          <Sky x0={0} x1={1080} horizon={900} top={-100} g={g} />
          <rect x={0} y={900} width={1080} height={520} fill="#0a1226" opacity={0.8} />
          <BuildingWall x={0} y={300} w={300} h={1130} seed={1} sign="ร้านป้าแดง" />
          <BuildingWall x={780} y={180} w={300} h={1250} seed={2} />
          <WetGround x0={0} x1={1080} y={1400} bottom={1920} g={g} />
          {/* the car behind: it fills the left of the alley, two beams toward the runner */}
          <Beam x={290} y={1262} angle={-3} length={820} g={g} />
          <Beam x={290} y={1292} angle={2} length={760} g={g} />
          <Car x={240} y={1420} scale={0.95} />
          <Actor id="osYou" x={640} y={1440} scale={2} facing={1} walk={1} g={g} fear={0.5} />
          <Hud lines={["ถึงใน 1 นาที", "คนขับกำลังมารับคุณ"]} />
        </svg>
      </AbsoluteFill>
      <Subtitle text="ตัวเลขเหลือ 1 นาที คุณคว้ากระเป๋า วิ่งออกประตูหลัง" />
    </Grade>
  );
};

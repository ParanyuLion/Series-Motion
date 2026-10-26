import React from "react";
import { AbsoluteFill } from "remotion";
import { Actor, Beam, Car, Grade, Hud, LookDefs, NightBackdrop, PAL, Subtitle } from "./Look";

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
          {/* alley walls */}
          <rect x={0} y={560} width={300} height={900} fill="#0b1322" />
          <rect x={780} y={480} width={300} height={980} fill="#0b1322" />
          <rect x={0} y={1380} width={1080} height={540} fill="#080c15" />
          <line x1={0} y1={1450} x2={1080} y2={1450} stroke={PAL.rim} strokeWidth={2} opacity={0.2} />
          {/* a wet road shine */}
          <ellipse cx={420} cy={1560} rx={380} ry={50} fill={PAL.beam} opacity={0.08} />
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

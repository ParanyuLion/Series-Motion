import React from "react";
import { AbsoluteFill } from "remotion";
import { Actor, Beam, Grade, Hud, LookDefs, NightBackdrop, PAL, Subtitle } from "./Look";

// One style-test frame: a rainy alley, "you" running, a car's headlights behind, the app HUD in the corner.
export const StyleStill: React.FC = () => {
  const g = 30;
  return (
    <Grade>
      <AbsoluteFill>
        <svg width="100%" height="100%" viewBox="0 0 1080 1920">
          <LookDefs />
          <NightBackdrop g={g} x0={0} x1={1080} />
          {/* alley walls */}
          <rect x={0} y={560} width={300} height={900} fill="#070b14" />
          <rect x={780} y={480} width={300} height={980} fill="#070b14" />
          <rect x={0} y={1380} width={1080} height={540} fill="#080c15" />
          <line x1={0} y1={1450} x2={1080} y2={1450} stroke={PAL.rim} strokeWidth={2} opacity={0.2} />
          {/* a wet road shine */}
          <ellipse cx={420} cy={1560} rx={380} ry={50} fill={PAL.beam} opacity={0.08} />
          {/* the car behind: two beams toward the runner */}
          <g opacity={0.9}>
            <rect x={-120} y={1010} width={190} height={150} rx={30} fill="#0a0f1a" />
            <Beam x={60} y={1050} angle={-4} length={760} g={g} />
            <Beam x={60} y={1120} angle={4} length={700} g={g} />
          </g>
          <Actor id="osYou" x={640} y={1440} scale={2} facing={1} walk={1} g={g} fear={0.5} />
          <Hud lines={["ถึงใน 1 นาที", "คนขับกำลังมารับคุณ"]} />
        </svg>
      </AbsoluteFill>
      <Subtitle text="ตัวเลขเหลือ 1 นาที คุณคว้ากระเป๋า วิ่งออกประตูหลัง" />
    </Grade>
  );
};
